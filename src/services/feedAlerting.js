// Feed Alerting System for CISAdx
import { feedManager } from './feedManager';

export class FeedAlertingSystem {
  constructor() {
    this.alertQueue = [];
    this.notificationHistory = [];
    this.thresholds = {
      staleThreshold: 7200000, // 2 hours in milliseconds
      criticalFailureThreshold: 5, // Number of consecutive failures
      healthScoreThreshold: 70 // Minimum acceptable health score percentage
    };
    this.isRunning = false;
    this.checkInterval = null;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Feed Alerting System started');
    
    // Check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkFeedHealth();
    }, 300000);
    
    // Initial check
    this.checkFeedHealth();
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('Feed Alerting System stopped');
  }

  async checkFeedHealth() {
    try {
      const healthStatus = feedManager.getHealthStatus();
      const alerts = [];

      // Check overall system health
      const healthPercentage = (healthStatus.successful / healthStatus.total) * 100;
      if (healthPercentage < this.thresholds.healthScoreThreshold) {
        alerts.push({
          type: 'system_health',
          severity: 'high',
          title: 'System Health Below Threshold',
          message: `Overall feed health is ${Math.round(healthPercentage)}%, below the ${this.thresholds.healthScoreThreshold}% threshold`,
          timestamp: new Date(),
          data: { healthPercentage, threshold: this.thresholds.healthScoreThreshold }
        });
      }

      // Check individual feed health
      const now = Date.now();
      
      feedManager.feeds.forEach(feed => {
        const lastUpdate = healthStatus.lastUpdates[feed.name];
        const isFailed = healthStatus.failedFeeds.has(feed.name);
        
        // Check for stale feeds (priority 1 feeds only)
        if (feed.priority === 1 && lastUpdate) {
          const timeSinceUpdate = now - lastUpdate;
          if (timeSinceUpdate > this.thresholds.staleThreshold) {
            alerts.push({
              type: 'stale_feed',
              severity: 'medium',
              title: `Critical Feed Stale: ${feed.name}`,
              message: `Priority 1 feed "${feed.name}" has not updated in ${this.formatDuration(timeSinceUpdate)}`,
              timestamp: new Date(),
              data: { feedName: feed.name, timeSinceUpdate, lastUpdate: new Date(lastUpdate) }
            });
          }
        }

        // Check for failed feeds
        if (isFailed && feed.priority <= 2) {
          alerts.push({
            type: 'feed_failure',
            severity: feed.priority === 1 ? 'high' : 'medium',
            title: `Feed Failure: ${feed.name}`,
            message: `${feed.priority === 1 ? 'Critical' : 'High priority'} feed "${feed.name}" is currently failing`,
            timestamp: new Date(),
            data: { feedName: feed.name, feedUrl: feed.url, priority: feed.priority }
          });
        }
      });

      // Process new alerts
      alerts.forEach(alert => this.processAlert(alert));

      // Clean up old notifications (keep last 100)
      if (this.notificationHistory.length > 100) {
        this.notificationHistory = this.notificationHistory.slice(-100);
      }

    } catch (error) {
      console.error('Error checking feed health:', error);
      this.processAlert({
        type: 'system_error',
        severity: 'high',
        title: 'Feed Monitor Error',
        message: `Feed health monitoring system encountered an error: ${error.message}`,
        timestamp: new Date(),
        data: { error: error.message }
      });
    }
  }

  processAlert(alert) {
    // Avoid duplicate alerts for the same issue within 1 hour
    const isDuplicate = this.notificationHistory.some(existing => 
      existing.type === alert.type &&
      existing.data?.feedName === alert.data?.feedName &&
      (Date.now() - existing.timestamp.getTime()) < 3600000 // 1 hour
    );

    if (isDuplicate) {
      return;
    }

    // Add to alert queue and history
    this.alertQueue.push(alert);
    this.notificationHistory.push(alert);

    // Send notifications based on severity
    this.sendAlert(alert);
  }

  sendAlert(alert) {
    // Browser notification (if permissions granted)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`CISAdx Alert: ${alert.title}`, {
        body: alert.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `cisadx-${alert.type}-${alert.data?.feedName || 'system'}`,
        renotify: false
      });

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }

    // Console logging for development
    const logLevel = alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warn' : 'info';
    console[logLevel](`[FEED ALERT] ${alert.title}: ${alert.message}`, alert.data);

    // Custom event for UI components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('feedAlert', { detail: alert }));
    }
  }

  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }

  // Get pending alerts for UI
  getPendingAlerts(limit = 10) {
    return this.alertQueue.slice(-limit).reverse();
  }

  // Get notification history
  getNotificationHistory(limit = 50) {
    return this.notificationHistory.slice(-limit).reverse();
  }

  // Clear specific alert from queue
  clearAlert(alertIndex) {
    if (alertIndex >= 0 && alertIndex < this.alertQueue.length) {
      this.alertQueue.splice(alertIndex, 1);
    }
  }

  // Clear all alerts
  clearAllAlerts() {
    this.alertQueue = [];
  }

  // Update alert thresholds
  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('Alert thresholds updated:', this.thresholds);
  }

  // Request browser notification permission
  async requestNotificationPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Get system status
  getStatus() {
    return {
      isRunning: this.isRunning,
      pendingAlerts: this.alertQueue.length,
      totalNotifications: this.notificationHistory.length,
      thresholds: this.thresholds,
      notificationPermission: typeof window !== 'undefined' && 'Notification' in window 
        ? Notification.permission 
        : 'not-supported'
    };
  }
}

// Export singleton instance
export const feedAlerting = new FeedAlertingSystem();

// Auto-start in browser environment
if (typeof window !== 'undefined') {
  // Start alerting system when the page loads
  window.addEventListener('load', () => {
    feedAlerting.start();
  });
  
  // Stop alerting system when page unloads
  window.addEventListener('beforeunload', () => {
    feedAlerting.stop();
  });
}