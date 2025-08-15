import { threatIntelCache, infrastructureCache, feedCache, ProgressiveDataLoader } from './cache';
import { performance } from './performance';

/**
 * Dashboard-specific performance optimization utilities
 */

// Threat Intelligence Data Loader
export class ThreatIntelligenceLoader {
  private static instance: ThreatIntelligenceLoader;
  private threatDataLoader: ProgressiveDataLoader<any> | null = null;
  private loadingPromise: Promise<any[]> | null = null;

  static getInstance(): ThreatIntelligenceLoader {
    if (!ThreatIntelligenceLoader.instance) {
      ThreatIntelligenceLoader.instance = new ThreatIntelligenceLoader();
    }
    return ThreatIntelligenceLoader.instance;
  }

  async loadThreatData(options: {
    batchSize?: number;
    onProgress?: (loaded: number, total: number) => void;
    forceRefresh?: boolean;
  } = {}): Promise<any[]> {
    const cacheKey = 'threat-intel-data';
    const { forceRefresh = false, onProgress, batchSize = 100 } = options;

    // Check cache first
    if (!forceRefresh && threatIntelCache.has(cacheKey)) {
      const cachedData = threatIntelCache.get(cacheKey);
      if (cachedData) {
        onProgress?.(cachedData.length, cachedData.length);
        return cachedData;
      }
    }

    // Prevent multiple simultaneous loads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.performThreatDataLoad(batchSize, onProgress);
    
    try {
      const data = await this.loadingPromise;
      threatIntelCache.set(cacheKey, data, 10 * 60 * 1000); // Cache for 10 minutes
      return data;
    } finally {
      this.loadingPromise = null;
    }
  }

  private async performThreatDataLoad(
    batchSize: number,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<any[]> {
    const fetchThreatData = async () => {
      // Simulate fetching threat intelligence data
      // In real implementation, this would fetch from multiple threat intel APIs
      return await this.mockFetchThreatData();
    };

    if (!this.threatDataLoader) {
      this.threatDataLoader = new ProgressiveDataLoader(fetchThreatData, {
        batchSize,
        delayBetweenBatches: 20,
        onProgress
      });
    }

    return await this.threatDataLoader.loadInBatches();
  }

  private async mockFetchThreatData(): Promise<any[]> {
    // Mock data - in real implementation, fetch from APIs
    const threatTypes = ['Malware', 'Phishing', 'Ransomware', 'APT', 'DDoS', 'Data Breach'];
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const sources = ['CISA', 'FBI', 'DHS', 'Private Intel', 'Open Source'];
    
    return Array.from({ length: 500 }, (_, i) => ({
      id: `threat-${i}`,
      type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      title: `Threat Intelligence Alert ${i + 1}`,
      description: `Detailed threat intelligence information for incident ${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      affected_systems: Math.floor(Math.random() * 100),
      indicators: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => 
        `IOC-${i}-${j}`
      ),
      mitre_tactics: ['Initial Access', 'Execution', 'Persistence'].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  }

  clearCache(): void {
    threatIntelCache.clear();
    this.threatDataLoader = null;
    this.loadingPromise = null;
  }
}

// Infrastructure Data Loader with Virtualization Support
export class InfrastructureDataLoader {
  private static instance: InfrastructureDataLoader;
  private dataLoader: ProgressiveDataLoader<any> | null = null;

  static getInstance(): InfrastructureDataLoader {
    if (!InfrastructureDataLoader.instance) {
      InfrastructureDataLoader.instance = new InfrastructureDataLoader();
    }
    return InfrastructureDataLoader.instance;
  }

  async loadInfrastructureData(options: {
    filters?: any;
    virtualizedView?: boolean;
    viewportSize?: number;
    onProgress?: (loaded: number, total: number) => void;
  } = {}): Promise<any[]> {
    const { filters = {}, virtualizedView = false, viewportSize = 50, onProgress } = options;
    const cacheKey = `infrastructure-${JSON.stringify(filters)}-${virtualizedView}`;

    // Check cache
    if (infrastructureCache.has(cacheKey)) {
      const cachedData = infrastructureCache.get(cacheKey);
      if (cachedData) {
        onProgress?.(cachedData.length, cachedData.length);
        return cachedData;
      }
    }

    const fetchInfrastructureData = async () => {
      // Simulate loading federal infrastructure data
      return await this.mockFetchInfrastructureData(filters);
    };

    this.dataLoader = new ProgressiveDataLoader(fetchInfrastructureData, {
      batchSize: virtualizedView ? viewportSize : 200,
      delayBetweenBatches: virtualizedView ? 5 : 15,
      onProgress
    });

    const data = await this.dataLoader.loadInBatches();
    infrastructureCache.set(cacheKey, data, 15 * 60 * 1000); // Cache for 15 minutes
    
    return data;
  }

  private async mockFetchInfrastructureData(filters: any): Promise<any[]> {
    const agencies = ['CISA', 'FBI', 'DHS', 'NSA', 'DOD'];
    const sectors = ['Energy', 'Financial', 'Healthcare', 'Transportation', 'Water'];
    const states = ['DC', 'VA', 'MD', 'CA', 'TX', 'NY', 'FL'];
    
    let data = Array.from({ length: 2000 }, (_, i) => ({
      id: `infra-${i}`,
      name: `Federal Facility ${i + 1}`,
      agency: agencies[Math.floor(Math.random() * agencies.length)],
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      state: states[Math.floor(Math.random() * states.length)],
      coordinates: [
        -77.0369 + (Math.random() - 0.5) * 10, // Longitude around DC
        38.9072 + (Math.random() - 0.5) * 10   // Latitude around DC
      ],
      operational: Math.random() > 0.1,
      security_level: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
      last_updated: new Date()
    }));

    // Apply filters
    if (filters.agencies?.length) {
      data = data.filter(item => filters.agencies.includes(item.agency));
    }
    if (filters.sectors?.length) {
      data = data.filter(item => filters.sectors.includes(item.sector));
    }
    if (filters.states?.length) {
      data = data.filter(item => filters.states.includes(item.state));
    }

    return data;
  }
}

// Feed Data Manager with Preloading
export class FeedDataManager {
  private static instance: FeedDataManager;
  private preloadingEnabled = true;
  private preloadTimer: NodeJS.Timeout | null = null;

  static getInstance(): FeedDataManager {
    if (!FeedDataManager.instance) {
      FeedDataManager.instance = new FeedDataManager();
    }
    return FeedDataManager.instance;
  }

  async preloadFeedData(): Promise<void> {
    if (!this.preloadingEnabled) return;

    const categories = ['government', 'threat_intel', 'vendor', 'news'];
    const preloadPromises = categories.map(async (category) => {
      const cacheKey = `feeds-${category}`;
      
      if (!feedCache.has(cacheKey)) {
        try {
          const data = await this.fetchFeedsByCategory(category);
          feedCache.set(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes
        } catch (error) {
          console.warn(`Failed to preload feeds for category ${category}:`, error);
        }
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  async getFeedData(category: string, useCache = true): Promise<any[]> {
    const cacheKey = `feeds-${category}`;
    
    if (useCache && feedCache.has(cacheKey)) {
      return feedCache.get(cacheKey) || [];
    }

    const data = await this.fetchFeedsByCategory(category);
    feedCache.set(cacheKey, data, 5 * 60 * 1000);
    
    return data;
  }

  private async fetchFeedsByCategory(category: string): Promise<any[]> {
    // Mock feed data - in real implementation, fetch from RSS/API endpoints
    const feedCount = Math.floor(Math.random() * 50) + 20;
    
    return Array.from({ length: feedCount }, (_, i) => ({
      id: `${category}-feed-${i}`,
      title: `${category.toUpperCase()} Feed Item ${i + 1}`,
      description: `Important cybersecurity information from ${category} sources`,
      category,
      source: `${category.toUpperCase()} Source`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
      read: Math.random() > 0.7
    }));
  }

  startPeriodicPreloading(intervalMs = 5 * 60 * 1000): void {
    this.stopPeriodicPreloading();
    
    this.preloadTimer = setInterval(() => {
      this.preloadFeedData();
    }, intervalMs);
    
    // Initial preload
    this.preloadFeedData();
  }

  stopPeriodicPreloading(): void {
    if (this.preloadTimer) {
      clearInterval(this.preloadTimer);
      this.preloadTimer = null;
    }
  }

  setPreloadingEnabled(enabled: boolean): void {
    this.preloadingEnabled = enabled;
    if (!enabled) {
      this.stopPeriodicPreloading();
    }
  }
}

// Performance monitoring for dashboard components
export class DashboardPerformanceMonitor {
  private static instance: DashboardPerformanceMonitor;
  private metrics: Map<string, any[]> = new Map();

  static getInstance(): DashboardPerformanceMonitor {
    if (!DashboardPerformanceMonitor.instance) {
      DashboardPerformanceMonitor.instance = new DashboardPerformanceMonitor();
    }
    return DashboardPerformanceMonitor.instance;
  }

  startTimer(componentName: string, operation: string): string {
    const timerId = `${componentName}-${operation}-${Date.now()}`;
    const startTime = performance.now();
    
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }
    
    this.metrics.get(componentName)!.push({
      operation,
      timerId,
      startTime,
      endTime: null,
      duration: null
    });
    
    return timerId;
  }

  endTimer(timerId: string): number | null {
    for (const [componentName, componentMetrics] of this.metrics.entries()) {
      const metric = componentMetrics.find(m => m.timerId === timerId);
      if (metric) {
        metric.endTime = performance.now();
        metric.duration = metric.endTime - metric.startTime;
        
        // Log slow operations in development
        if (import.meta.env.DEV && metric.duration > 100) {
          console.warn(`Slow operation detected: ${componentName} ${metric.operation} took ${metric.duration.toFixed(2)}ms`);
        }
        
        return metric.duration;
      }
    }
    return null;
  }

  getMetrics(componentName?: string): any {
    if (componentName) {
      return this.metrics.get(componentName) || [];
    }
    
    const allMetrics: any = {};
    for (const [name, metrics] of this.metrics.entries()) {
      allMetrics[name] = metrics;
    }
    return allMetrics;
  }

  getAverageTime(componentName: string, operation: string): number {
    const componentMetrics = this.metrics.get(componentName) || [];
    const operationMetrics = componentMetrics.filter(m => 
      m.operation === operation && m.duration !== null
    );
    
    if (operationMetrics.length === 0) return 0;
    
    const total = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / operationMetrics.length;
  }

  clearMetrics(componentName?: string): void {
    if (componentName) {
      this.metrics.delete(componentName);
    } else {
      this.metrics.clear();
    }
  }
}

// Export singleton instances
export const threatIntelLoader = ThreatIntelligenceLoader.getInstance();
export const infrastructureLoader = InfrastructureDataLoader.getInstance();
export const feedDataManager = FeedDataManager.getInstance();
export const dashboardMonitor = DashboardPerformanceMonitor.getInstance();

// Initialize background preloading
if (typeof window !== 'undefined') {
  // Start preloading feeds after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      feedDataManager.startPeriodicPreloading();
    }, 2000); // Delay to avoid blocking initial page load
  });
}