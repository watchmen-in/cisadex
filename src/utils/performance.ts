/**
 * Performance optimization utilities for CISAdx
 */

/**
 * Lazy load images with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private loadedImages = new Set<string>();

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target as HTMLImageElement);
            }
          });
        },
        { rootMargin: '50px 0px' }
      );
    }
  }

  observe(img: HTMLImageElement): void {
    if (this.observer && img.dataset.src) {
      this.observer.observe(img);
    }
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (src && !this.loadedImages.has(src)) {
      img.src = src;
      img.removeAttribute('data-src');
      this.loadedImages.add(src);
      this.observer?.unobserve(img);
    }
  }
}

/**
 * Resource preloader for critical assets
 */
export class ResourcePreloader {
  private preloadedResources = new Set<string>();

  preloadCriticalAssets(): void {
    const criticalAssets = [
      '/assets/cisadex-splash.mp4',
      '/data/agencies.json',
      '/data/summary.json'
    ];

    criticalAssets.forEach(asset => this.preloadResource(asset));
  }

  preloadResource(url: string, type: 'video' | 'fetch' | 'image' = 'fetch'): void {
    if (this.preloadedResources.has(url)) return;

    try {
      switch (type) {
        case 'video':
          this.preloadVideo(url);
          break;
        case 'image':
          this.preloadImage(url);
          break;
        default:
          this.preloadFetch(url);
      }
      this.preloadedResources.add(url);
    } catch (error) {
      console.warn(`Failed to preload resource: ${url}`, error);
    }
  }

  private preloadVideo(url: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = url;
    document.head.appendChild(link);
  }

  private preloadImage(url: string): void {
    const img = new Image();
    img.src = url;
  }

  private preloadFetch(url: string): void {
    fetch(url, { method: 'HEAD' }).catch(() => {
      // Silently fail for preloading
    });
  }
}

/**
 * Memory-efficient cache with TTL and size limits
 */
export class PerformanceCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; hits: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttlMs = 300000) { // 5 minute default TTL
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data;
  }

  set(key: string, data: T): void {
    const now = Date.now();
    
    // Evict expired entries
    this.evictExpired();
    
    // Evict least used entries if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, { data, timestamp: now, hits: 0 });
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let minHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Debounced function executor for performance
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null;
  
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

/**
 * Throttled function executor for performance
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle = false;
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  measureAsyncOperation<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return operation()
      .then((result) => {
        this.recordMetric(name, performance.now() - startTime);
        return result;
      })
      .catch((error) => {
        this.recordMetric(name, performance.now() - startTime);
        throw error;
      });
  }

  measureSyncOperation<T>(name: string, operation: () => T): T {
    const startTime = performance.now();
    try {
      const result = operation();
      this.recordMetric(name, performance.now() - startTime);
      return result;
    } catch (error) {
      this.recordMetric(name, performance.now() - startTime);
      throw error;
    }
  }

  private recordMetric(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const measurements = this.metrics.get(name)!;
    measurements.push(duration);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  getMetrics(name: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return null;

    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return { avg, min, max, count: measurements.length };
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {};
    
    for (const [name] of this.metrics) {
      const metrics = this.getMetrics(name);
      if (metrics) {
        result[name] = metrics;
      }
    }
    
    return result;
  }

  logPerformanceReport(): void {
    console.group('📊 CISAdx Performance Report');
    const allMetrics = this.getAllMetrics();
    
    for (const [name, metrics] of Object.entries(allMetrics)) {
      console.log(`${name}:`, {
        avg: `${metrics.avg.toFixed(2)}ms`,
        min: `${metrics.min.toFixed(2)}ms`,
        max: `${metrics.max.toFixed(2)}ms`,
        samples: metrics.count
      });
    }
    
    console.groupEnd();
  }
}

/**
 * Bundle analyzer helper
 */
export function analyzeBundleSize(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Estimate bundle sizes by checking script tags
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  let totalSize = 0;

  console.group('📦 Bundle Analysis');
  
  scripts.forEach(async (script) => {
    const src = (script as HTMLScriptElement).src;
    if (src && src.includes('/assets/')) {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        const size = response.headers.get('content-length');
        if (size) {
          const sizeKB = Math.round(parseInt(size) / 1024);
          totalSize += sizeKB;
          console.log(`${src.split('/').pop()}: ${sizeKB}KB`);
        }
      } catch (error) {
        console.warn(`Could not analyze ${src}`);
      }
    }
  });

  setTimeout(() => {
    console.log(`Total estimated size: ${totalSize}KB`);
    console.groupEnd();
  }, 1000);
}

// Global instances
export const imageLoader = new LazyImageLoader();
export const resourcePreloader = new ResourcePreloader();
export const performanceMonitor = new PerformanceMonitor();

// Initialize critical optimizations
if (typeof window !== 'undefined') {
  // Preload critical assets on page load
  window.addEventListener('load', () => {
    resourcePreloader.preloadCriticalAssets();
    
    // Log performance metrics periodically in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        performanceMonitor.logPerformanceReport();
      }, 30000); // Every 30 seconds
    }
  });

  // Analyze bundle size in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(analyzeBundleSize, 2000);
  }
}