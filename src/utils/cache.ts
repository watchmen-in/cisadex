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

// Clean up expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
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