/**
 * Basic monitoring system for CISAdx
 * Simplified version for production deployment
 */

// Simplified monitoring class for this branch
class SimpleMonitoring {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  trackError(error: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 Error tracked:', error);
    }
  }

  getMetrics() {
    return {
      sessionId: this.sessionId,
      userId: undefined
    };
  }
}

// Global monitoring instance
export const monitoring = new SimpleMonitoring();

// Utility hooks for React components
export function useMonitoring() {
  return {
    trackEvent: () => {},
    trackError: monitoring.trackError.bind(monitoring),
    trackPerformance: () => {},
    trackFeatureUsage: () => {},
    trackUserAction: () => {},
    setUserId: () => {},
    optOut: () => {},
    optIn: () => {},
    getMetrics: monitoring.getMetrics.bind(monitoring)
  };
}

// React Error Boundary integration
export function trackReactError(error: Error, errorInfo: any) {
  monitoring.trackError({
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: monitoring.getMetrics().sessionId,
    context: {
      errorBoundary: true,
      errorInfo
    }
  });
}