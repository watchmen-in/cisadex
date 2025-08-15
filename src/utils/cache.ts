/**
 * Simple in-memory cache with TTL support
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTtl = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        expired: Date.now() - entry.timestamp > entry.ttl,
      })),
    };
  }
}

// Global cache instance
export const cache = new Cache();

// Specialized caches for different data types
export const threatIntelCache = new Cache();
export const infrastructureCache = new Cache();
export const feedCache = new Cache();

// Clean up expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
    threatIntelCache.cleanup();
    infrastructureCache.cleanup();
    feedCache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Progressive data loader for large datasets
 */
export interface ProgressiveLoadOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
  onProgress?: (loaded: number, total: number) => void;
  onBatch?: (batch: any[], batchIndex: number) => void;
}

export class ProgressiveDataLoader<T> {
  private data: T[] = [];
  private loadedCount = 0;
  private loading = false;

  constructor(
    private fetchFunction: () => Promise<T[]>,
    private options: ProgressiveLoadOptions = {}
  ) {}

  async loadInBatches(): Promise<T[]> {
    if (this.loading) {
      return this.data;
    }

    this.loading = true;
    const { batchSize = 50, delayBetweenBatches = 10, onProgress, onBatch } = this.options;

    try {
      const allData = await this.fetchFunction();
      const totalItems = allData.length;
      
      this.data = [];
      this.loadedCount = 0;

      for (let i = 0; i < totalItems; i += batchSize) {
        const batch = allData.slice(i, i + batchSize);
        this.data.push(...batch);
        this.loadedCount += batch.length;

        if (onBatch) {
          onBatch(batch, Math.floor(i / batchSize));
        }

        if (onProgress) {
          onProgress(this.loadedCount, totalItems);
        }

        // Small delay to prevent UI blocking
        if (i + batchSize < totalItems && delayBetweenBatches > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }

      return this.data;
    } finally {
      this.loading = false;
    }
  }

  getCurrentData(): T[] {
    return this.data;
  }

  getLoadedCount(): number {
    return this.loadedCount;
  }

  isLoading(): boolean {
    return this.loading;
  }
}

/**
 * Lazy loading hook for components
 */
export function createLazyLoader<T>(
  loadFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  let promise: Promise<T> | null = null;
  let data: T | null = null;
  let error: Error | null = null;

  const load = () => {
    if (!promise) {
      promise = loadFunction()
        .then(result => {
          data = result;
          return result;
        })
        .catch(err => {
          error = err;
          throw err;
        });
    }
    return promise;
  };

  return {
    load,
    getData: () => data,
    getError: () => error,
    isLoaded: () => data !== null,
    hasError: () => error !== null,
    reset: () => {
      promise = null;
      data = null;
      error = null;
    }
  };
}

/**
 * Enhanced fetch with caching and retry logic
 */
interface FetchOptions extends RequestInit {
  cache?: boolean;
  cacheTtl?: number;
  retries?: number;
  retryDelay?: number;
}

export async function fetchWithCache<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    cache: useCache = true,
    cacheTtl = 5 * 60 * 1000, // 5 minutes
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const cacheKey = `fetch:${url}:${JSON.stringify(fetchOptions)}`;

  // Try cache first
  if (useCache && cache.has(cacheKey)) {
    const cachedData = cache.get<T>(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }
  }

  // Fetch with retry logic
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      if (useCache) {
        cache.set(cacheKey, data, cacheTtl);
      }
      
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}