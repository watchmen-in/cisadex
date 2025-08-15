/**
 * Lightweight Feed Service - Streamlined replacement for complex feedManager
 * Focuses on performance and simplicity over complex federal compliance features
 */

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  date: Date;
  source: string;
  category: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cve?: string;
  tags: string[];
}

export interface FeedConfig {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'json';
  category: string;
  priority: number;
  refreshInterval: number;
  parser?: string;
}

class SimpleFeedService {
  private cache = new Map<string, { data: FeedItem[]; timestamp: number; ttl: number }>();
  private feeds: FeedConfig[] = [];
  private isLoading = false;
  private rateLimits = new Map<string, number>();

  constructor() {
    this.loadFeedConfigs();
  }

  /**
   * Load feed configurations
   */
  async loadFeedConfigs(): Promise<void> {
    try {
      const response = await fetch('/feeds/feeds.json');
      const configs = await response.json();
      
      this.feeds = configs.map((config: any) => ({
        id: config.id,
        name: config.name,
        url: config.url,
        type: config.type.toLowerCase(),
        category: config.category || 'general',
        priority: config.priority || 3,
        refreshInterval: config.refresh_interval || 3600000,
        parser: config.parser
      }));
    } catch (error) {
      console.error('Failed to load feed configs:', error);
      this.feeds = this.getDefaultFeeds();
    }
  }

  /**
   * Fetch all feeds with intelligent batching
   */
  async fetchAllFeeds(forceRefresh = false): Promise<FeedItem[]> {
    if (this.isLoading && !forceRefresh) {
      return this.getCachedResults();
    }

    this.isLoading = true;

    try {
      // Prioritize government and high-priority feeds
      const priorityFeeds = this.feeds.filter(f => f.priority === 1);
      const regularFeeds = this.feeds.filter(f => f.priority > 1);

      // Fetch priority feeds first
      const priorityResults = await this.fetchFeedBatch(priorityFeeds, forceRefresh);
      
      // Fetch regular feeds in background
      const regularResults = await this.fetchFeedBatch(regularFeeds, forceRefresh);

      const allItems = [...priorityResults, ...regularResults];
      
      // Simple deduplication
      const uniqueItems = this.deduplicateItems(allItems);
      
      // Sort by date (newest first)
      uniqueItems.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Cache combined results
      this.setCachedResults(uniqueItems);

      return uniqueItems;

    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      return this.getCachedResults();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch a batch of feeds in parallel with rate limiting
   */
  private async fetchFeedBatch(feeds: FeedConfig[], forceRefresh: boolean): Promise<FeedItem[]> {
    const promises = feeds.map(feed => this.fetchSingleFeed(feed, forceRefresh));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<FeedItem[]> => result.status === 'fulfilled')
      .flatMap(result => result.value);
  }

  /**
   * Fetch a single feed with caching and rate limiting
   */
  private async fetchSingleFeed(feed: FeedConfig, forceRefresh: boolean): Promise<FeedItem[]> {
    const cacheKey = `feed:${feed.id}`;
    
    // Check cache first
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
    }

    // Rate limiting
    await this.enforceRateLimit(feed.url);

    try {
      // Use proxy for CORS issues
      const proxyUrl = `/api/proxy-rss?url=${encodeURIComponent(feed.url)}`;
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': feed.type === 'json' ? 'application/json' : 'application/rss+xml'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const content = await response.text();
      const items = this.parseContent(content, feed);
      
      // Cache results
      this.cache.set(cacheKey, {
        data: items,
        timestamp: Date.now(),
        ttl: feed.refreshInterval
      });

      return items;

    } catch (error) {
      console.error(`Failed to fetch ${feed.name}:`, error);
      
      // Return cached data if available
      const cached = this.cache.get(cacheKey);
      return cached?.data || [];
    }
  }

  /**
   * Parse feed content based on type
   */
  private parseContent(content: string, feed: FeedConfig): FeedItem[] {
    try {
      switch (feed.type) {
        case 'rss':
          return this.parseRSS(content, feed);
        case 'json':
          return this.parseJSON(JSON.parse(content), feed);
        default:
          console.warn(`Unknown feed type: ${feed.type}`);
          return [];
      }
    } catch (error) {
      console.error(`Parse error for ${feed.name}:`, error);
      return [];
    }
  }

  /**
   * Simple RSS parser using DOMParser
   */
  private parseRSS(xmlString: string, feed: FeedConfig): FeedItem[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('XML parse error');
    }

    const items = doc.querySelectorAll('item');
    
    return Array.from(items).slice(0, 20).map((item, index) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '';
      const description = this.cleanHTML(item.querySelector('description')?.textContent || '');
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
      const guid = item.querySelector('guid')?.textContent?.trim() || `${feed.id}-${index}`;

      // Extract CVE and tags
      const content = `${title} ${description}`.toLowerCase();
      const cveMatch = content.match(/cve-\d{4}-\d+/i);
      const tags = this.extractTags(content);
      const severity = this.extractSeverity(content);

      return {
        id: guid,
        title: this.cleanText(title),
        description: description.substring(0, 300),
        link,
        date: pubDate ? new Date(pubDate) : new Date(),
        source: feed.name,
        category: feed.category,
        severity,
        cve: cveMatch?.[0]?.toUpperCase(),
        tags
      };
    });
  }

  /**
   * Simple JSON parser with specialized handling
   */
  private parseJSON(data: any, feed: FeedConfig): FeedItem[] {
    try {
      if (feed.parser === 'kev') {
        return this.parseKEVData(data, feed);
      }

      // Generic JSON parsing
      const items = Array.isArray(data) ? data : data.data || data.items || data.vulnerabilities || [];
      
      return items.slice(0, 20).map((item: any, index: number) => ({
        id: item.id || item.cveID || `${feed.id}-${index}`,
        title: item.title || item.name || item.vulnerabilityName || 'Untitled',
        description: this.cleanText(item.description || item.shortDescription || item.summary || ''),
        link: item.link || item.url || `https://nvd.nist.gov/vuln/detail/${item.cveID || ''}`,
        date: new Date(item.date || item.dateAdded || item.published || Date.now()),
        source: feed.name,
        category: feed.category,
        severity: item.severity || this.extractSeverity(item.title || ''),
        cve: item.cveID || item.cve,
        tags: this.extractTags(`${item.title || ''} ${item.description || ''}`)
      }));

    } catch (error) {
      console.error(`JSON parse error for ${feed.name}:`, error);
      return [];
    }
  }

  /**
   * Specialized KEV data parser
   */
  private parseKEVData(data: any, feed: FeedConfig): FeedItem[] {
    const vulnerabilities = data.vulnerabilities || [];
    
    return vulnerabilities.slice(0, 20).map((vuln: any) => ({
      id: `kev-${vuln.cveID}`,
      title: `${vuln.vendorProject} ${vuln.product} - ${vuln.vulnerabilityName}`,
      description: vuln.shortDescription || 'Known exploited vulnerability',
      link: `https://nvd.nist.gov/vuln/detail/${vuln.cveID}`,
      date: new Date(vuln.dateAdded),
      source: feed.name,
      category: feed.category,
      severity: 'HIGH' as const,
      cve: vuln.cveID,
      tags: ['exploited', 'kev']
    }));
  }

  /**
   * Simple text cleaning
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/&[a-z]+;/gi, ' ') // Remove entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Clean HTML content
   */
  private cleanHTML(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent?.trim() || '';
  }

  /**
   * Extract severity from content
   */
  private extractSeverity(content: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | undefined {
    const text = content.toLowerCase();
    if (text.includes('critical')) return 'CRITICAL';
    if (text.includes('high')) return 'HIGH';
    if (text.includes('medium')) return 'MEDIUM';
    if (text.includes('low')) return 'LOW';
    return undefined;
  }

  /**
   * Extract relevant tags from content
   */
  private extractTags(content: string): string[] {
    const tags: string[] = [];
    const text = content.toLowerCase();

    const tagPatterns = [
      { pattern: /ransomware/i, tag: 'ransomware' },
      { pattern: /phishing/i, tag: 'phishing' },
      { pattern: /malware/i, tag: 'malware' },
      { pattern: /apt[\s-]?\d*/i, tag: 'apt' },
      { pattern: /zero[\s-]?day/i, tag: 'zero-day' },
      { pattern: /rce|remote[\s-]?code/i, tag: 'rce' },
      { pattern: /scada|ics|industrial/i, tag: 'industrial' },
      { pattern: /cloud|aws|azure|gcp/i, tag: 'cloud' }
    ];

    for (const { pattern, tag } of tagPatterns) {
      if (pattern.test(text)) {
        tags.push(tag);
      }
    }

    return tags;
  }

  /**
   * Simple deduplication based on title similarity
   */
  private deduplicateItems(items: FeedItem[]): FeedItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = `${item.title.toLowerCase().substring(0, 50)}-${item.source}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Rate limiting implementation
   */
  private async enforceRateLimit(url: string): Promise<void> {
    const domain = new URL(url).hostname;
    const now = Date.now();
    const lastRequest = this.rateLimits.get(domain) || 0;
    
    if (now - lastRequest < 1000) { // 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.rateLimits.set(domain, now);
  }

  /**
   * Cache management
   */
  private getCachedResults(): FeedItem[] {
    const cached = this.cache.get('all-feeds');
    return cached?.data || [];
  }

  private setCachedResults(items: FeedItem[]): void {
    this.cache.set('all-feeds', {
      data: items,
      timestamp: Date.now(),
      ttl: 900000 // 15 minutes
    });
  }

  /**
   * Search feeds
   */
  searchFeeds(items: FeedItem[], query: string): FeedItem[] {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.source.toLowerCase().includes(lowerQuery) ||
      item.cve?.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Filter feeds by category
   */
  filterByCategory(items: FeedItem[], categories: string[]): FeedItem[] {
    if (!categories.length) return items;
    return items.filter(item => categories.includes(item.category));
  }

  /**
   * Filter by severity
   */
  filterBySeverity(items: FeedItem[], severities: string[]): FeedItem[] {
    if (!severities.length) return items;
    return items.filter(item => item.severity && severities.includes(item.severity));
  }

  /**
   * Get available categories
   */
  getAvailableCategories(items: FeedItem[]): string[] {
    return [...new Set(items.map(item => item.category))].sort();
  }

  /**
   * Get available sources
   */
  getAvailableSources(items: FeedItem[]): string[] {
    return [...new Set(items.map(item => item.source))].sort();
  }

  /**
   * Get stats
   */
  getStats(items: FeedItem[]) {
    const now = new Date();
    const last24h = items.filter(item => 
      (now.getTime() - item.date.getTime()) <= 24 * 60 * 60 * 1000
    ).length;

    const severityCounts = items.reduce((acc, item) => {
      if (item.severity) {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total: items.length,
      last24h,
      sources: this.getAvailableSources(items).length,
      withCVE: items.filter(item => item.cve).length,
      severityCounts
    };
  }

  /**
   * Default feeds fallback
   */
  private getDefaultFeeds(): FeedConfig[] {
    return [
      {
        id: 'cisa-current',
        name: 'CISA Current Activity',
        url: 'https://www.cisa.gov/uscert/ncas/current-activity.xml',
        type: 'rss',
        category: 'government',
        priority: 1,
        refreshInterval: 1800000
      }
    ];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const simpleFeedService = new SimpleFeedService();
export default simpleFeedService;