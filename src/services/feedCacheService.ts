/**
 * Advanced caching service for feed data with LRU eviction,
 * compression, and intelligent cache invalidation
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  compressed?: boolean;
  size: number;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  compressionRatio: number;
}

class FeedCacheService {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private maxEntries: number;
  private currentSize = 0;
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private compressionEnabled: boolean;

  constructor(options: {
    maxSize?: number; // in bytes
    maxEntries?: number;
    compressionEnabled?: boolean;
  } = {}) {
    this.maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB default
    this.maxEntries = options.maxEntries || 1000;
    this.compressionEnabled = options.compressionEnabled ?? true;

    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.misses++;
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;
    this.hits++;

    // Decompress if needed
    let data = entry.data;
    if (entry.compressed && this.compressionEnabled) {
      data = this.decompress(data);
    }

    return data;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl: number = 3600000): boolean {
    try {
      const now = Date.now();
      let processedData = data;
      let compressed = false;
      
      // Calculate size
      const dataSize = this.calculateSize(data);
      
      // Compress if enabled and data is large
      if (this.compressionEnabled && dataSize > 1024) {
        processedData = this.compress(data);
        compressed = true;
      }

      const finalSize = this.calculateSize(processedData);
      
      // Check if we need to evict
      if (this.cache.size >= this.maxEntries || this.currentSize + finalSize > this.maxSize) {
        this.evictLRU(finalSize);
      }

      // Remove existing entry if updating
      if (this.cache.has(key)) {
        const existing = this.cache.get(key)!;
        this.currentSize -= existing.size;
      }

      const entry: CacheEntry = {
        data: processedData,
        timestamp: now,
        ttl,
        accessCount: 0,
        lastAccessed: now,
        compressed,
        size: finalSize
      };

      this.cache.set(key, entry);
      this.currentSize += finalSize;

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      return true;
    }
    return false;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    const uncompressedSize = this.calculateUncompressedSize();
    const compressionRatio = uncompressedSize > 0 ? this.currentSize / uncompressedSize : 1;

    return {
      totalEntries: this.cache.size,
      totalSize: this.currentSize,
      hitRate,
      missRate: 1 - hitRate,
      evictionCount: this.evictions,
      compressionRatio
    };
  }

  /**
   * Cache feed data with intelligent TTL
   */
  cacheFeedData(feedId: string, data: any, priority: number = 3): boolean {
    // Adjust TTL based on priority
    const baseTTL = 3600000; // 1 hour
    const ttl = priority === 1 ? baseTTL / 2 : // High priority: 30 min
               priority === 2 ? baseTTL :     // Medium priority: 1 hour
               baseTTL * 2;                   // Low priority: 2 hours

    return this.set(`feed:${feedId}`, data, ttl);
  }

  /**
   * Cache clustered feed results
   */
  cacheClusteredFeeds(filters: any, clusters: any, allItems: any): boolean {
    const key = this.generateFilterKey(filters);
    const data = { clusters, allItems, timestamp: Date.now() };
    
    // Shorter TTL for filtered results as they change more frequently
    return this.set(`clusters:${key}`, data, 900000); // 15 minutes
  }

  /**
   * Get cached clustered feeds
   */
  getCachedClusteredFeeds(filters: any): { clusters: any; allItems: any; timestamp: number } | null {
    const key = this.generateFilterKey(filters);
    return this.get(`clusters:${key}`);
  }

  /**
   * Cache search results
   */
  cacheSearchResults(query: string, filters: any, results: any): boolean {
    const key = this.generateSearchKey(query, filters);
    return this.set(`search:${key}`, results, 600000); // 10 minutes
  }

  /**
   * Get cached search results
   */
  getCachedSearchResults(query: string, filters: any): any | null {
    const key = this.generateSearchKey(query, filters);
    return this.get(`search:${key}`);
  }

  /**
   * Cache topic detection results
   */
  cacheTopicDetection(content: string, topics: string[], scores: Record<string, number>): boolean {
    const contentHash = this.hashString(content);
    const data = { topics, scores };
    return this.set(`topics:${contentHash}`, data, 86400000); // 24 hours
  }

  /**
   * Get cached topic detection
   */
  getCachedTopicDetection(content: string): { topics: string[]; scores: Record<string, number> } | null {
    const contentHash = this.hashString(content);
    return this.get(`topics:${contentHash}`);
  }

  /**
   * Preload frequently accessed data
   */
  async preloadData(feedManager: any): Promise<void> {
    try {
      // Preload priority feeds
      const priorityKey = 'preload:priority';
      if (!this.get(priorityKey)) {
        const priorityFeeds = await feedManager.fetchPriorityFeeds();
        this.set(priorityKey, priorityFeeds, 1800000); // 30 minutes
      }

      // Preload government feeds
      const govKey = 'preload:government';
      if (!this.get(govKey)) {
        const govFeeds = await feedManager.fetchAllByCategory('government');
        this.set(govKey, govFeeds, 1800000);
      }

    } catch (error) {
      console.error('Error preloading data:', error);
    }
  }

  /**
   * Evict least recently used items
   */
  private evictLRU(requiredSpace: number): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time and access count
    entries.sort(([, a], [, b]) => {
      const aScore = a.lastAccessed + (a.accessCount * 1000);
      const bScore = b.lastAccessed + (b.accessCount * 1000);
      return aScore - bScore;
    });

    let freedSpace = 0;
    let evictedCount = 0;

    for (const [key, entry] of entries) {
      if (
        this.cache.size <= this.maxEntries / 2 && 
        this.currentSize + requiredSpace <= this.maxSize
      ) {
        break;
      }

      this.cache.delete(key);
      this.currentSize -= entry.size;
      freedSpace += entry.size;
      evictedCount++;
      this.evictions++;
    }

    console.debug(`Evicted ${evictedCount} entries, freed ${freedSpace} bytes`);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      this.delete(key);
    }

    if (toDelete.length > 0) {
      console.debug(`Cleaned up ${toDelete.length} expired cache entries`);
    }
  }

  /**
   * Calculate size of data
   */
  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  /**
   * Calculate total uncompressed size
   */
  private calculateUncompressedSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      if (entry.compressed) {
        // Estimate uncompressed size (rough)
        total += entry.size * 3;
      } else {
        total += entry.size;
      }
    }
    return total;
  }

  /**
   * Simple compression using JSON string manipulation
   */
  private compress(data: any): string {
    try {
      const jsonStr = JSON.stringify(data);
      // Simple compression: remove whitespace and use shorter keys
      return jsonStr.replace(/\s+/g, '');
    } catch {
      return data;
    }
  }

  /**
   * Decompress data
   */
  private decompress(compressedData: string): any {
    try {
      return JSON.parse(compressedData);
    } catch {
      return compressedData;
    }
  }

  /**
   * Generate cache key for filters
   */
  private generateFilterKey(filters: any): string {
    const normalized = {
      topics: (filters.topics || []).sort(),
      sources: (filters.sources || []).sort(),
      severities: (filters.severities || []).sort(),
      dateRange: filters.dateRange,
      searchQuery: filters.searchQuery || ''
    };
    return this.hashString(JSON.stringify(normalized));
  }

  /**
   * Generate cache key for search
   */
  private generateSearchKey(query: string, filters: any): string {
    const key = `${query}:${this.generateFilterKey(filters)}`;
    return this.hashString(key);
  }

  /**
   * Simple hash function for strings
   */
  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }
}

// Export singleton instance
export const feedCacheService = new FeedCacheService({
  maxSize: 100 * 1024 * 1024, // 100MB
  maxEntries: 2000,
  compressionEnabled: true
});

export default feedCacheService;