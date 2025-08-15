// Comprehensive Cybersecurity Feed Manager
import { fetchWithProxy } from '../utils/feedProxy';

export class CyberFeedManager {
  constructor() {
    this.feeds = this.getAllFeeds();
    this.cache = new Map();
    this.failedFeeds = new Set();
    this.lastUpdate = new Map();
  }

  getAllFeeds() {
    return [
      // Government/CERT Feeds (High Priority)
      {
        name: "CISA KEV",
        url: "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
        type: "JSON",
        category: "government",
        priority: 1,
        refreshInterval: 3600000, // 1 hour
        parser: "kev"
      },
      {
        name: "CISA Cybersecurity Advisories",
        url: "https://www.cisa.gov/cybersecurity-advisories/rss.xml",
        type: "RSS",
        category: "government",
        priority: 1
      },
      {
        name: "CISA ICS Advisories",
        url: "https://www.cisa.gov/ics/advisories/ics-rss.xml",
        type: "RSS",
        category: "government",
        priority: 1
      },
      {
        name: "US-CERT Alerts",
        url: "https://us-cert.cisa.gov/ncas/alerts.xml",
        type: "RSS",
        category: "government",
        priority: 1
      },
      
      // Vendor Security Advisories
      {
        name: "Microsoft MSRC",
        url: "https://msrc.microsoft.com/update-guide/rss",
        type: "RSS",
        category: "vendor",
        priority: 2
      },
      {
        name: "Cisco PSIRT",
        url: "https://tools.cisco.com/security/center/psirtrss20/CiscoSecurityAdvisory.xml",
        type: "RSS",
        category: "vendor",
        priority: 2
      },
      
      // Threat Intelligence & Research
      {
        name: "Cisco Talos Blog",
        url: "https://blog.talosintelligence.com/feeds/posts/default",
        type: "RSS",
        category: "threat_intel",
        priority: 2
      },
      {
        name: "Unit 42 Research",
        url: "https://unit42.paloaltonetworks.com/feed/",
        type: "RSS",
        category: "threat_intel",
        priority: 2
      },
      {
        name: "CrowdStrike Blog",
        url: "https://www.crowdstrike.com/blog/feed/",
        type: "RSS",
        category: "threat_intel",
        priority: 2
      },
      {
        name: "Mandiant Blog",
        url: "https://www.mandiant.com/resources/blog/rss.xml",
        type: "RSS",
        category: "threat_intel",
        priority: 2
      },
      
      // Cybersecurity News
      {
        name: "Krebs on Security",
        url: "https://krebsonsecurity.com/feed/",
        type: "RSS",
        category: "news",
        priority: 3
      },
      {
        name: "The Hacker News",
        url: "https://feeds.feedburner.com/TheHackersNews",
        type: "RSS",
        category: "news",
        priority: 3
      },
      {
        name: "SecurityWeek",
        url: "https://feeds.feedburner.com/Securityweek",
        type: "RSS",
        category: "news",
        priority: 3
      },
      {
        name: "Dark Reading",
        url: "https://www.darkreading.com/rss.xml",
        type: "RSS",
        category: "news",
        priority: 3
      },
      {
        name: "BleepingComputer",
        url: "https://www.bleepingcomputer.com/feed/",
        type: "RSS",
        category: "news",
        priority: 3
      },
      {
        name: "Ars Technica Security",
        url: "https://feeds.arstechnica.com/arstechnica/security",
        type: "RSS",
        category: "news",
        priority: 3
      },
      {
        name: "Threatpost",
        url: "https://threatpost.com/feed/",
        type: "RSS",
        category: "news",
        priority: 3
      }
    ];
  }

  async fetchFeed(feed) {
    try {
      // Check cache first
      const cached = this.cache.get(feed.name);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < (feed.refreshInterval || 900000)) {
        return cached.data;
      }

      // Use proxy for fetching feeds
      let data;
      try {
        data = await fetchWithProxy(feed.url, feed.type);
      } catch (proxyError) {
        // Fallback to direct fetch for JSON feeds
        if (feed.type === 'JSON') {
          const response = await fetch(feed.url);
          data = await response.json();
        } else {
          throw proxyError;
        }
      }
      
      // Parse based on feed type
      const parsed = await this.parseFeedData(data, feed);
      
      // Cache successful result
      this.cache.set(feed.name, {
        data: parsed,
        timestamp: now,
        source: feed
      });
      
      this.failedFeeds.delete(feed.name);
      this.lastUpdate.set(feed.name, now);
      
      return parsed;
      
    } catch (error) {
      console.error(`Failed to fetch ${feed.name}:`, error);
      this.failedFeeds.add(feed.name);
      
      // Return cached data if available
      const cached = this.cache.get(feed.name);
      return cached?.data || [];
    }
  }

  async parseFeedData(data, feed) {
    switch (feed.type) {
      case 'RSS':
        return this.parseRSS(data, feed);
      case 'JSON':
        if (feed.parser === 'kev') {
          return this.parseKEV(data, feed);
        }
        return this.parseJSON(data, feed);
      default:
        return [];
    }
  }

  parseRSS(xmlString, feed) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const items = doc.querySelectorAll('item');
      
      return Array.from(items).slice(0, 20).map(item => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const guid = item.querySelector('guid')?.textContent || link;
        
        // Extract CVE if present
        const cveMatch = (title + ' ' + description).match(/CVE-\d{4}-\d+/i);
        
        return {
          id: guid || `${feed.name}-${Date.now()}-${Math.random()}`,
          title: this.cleanText(title),
          description: this.cleanText(description).substring(0, 300),
          link,
          date: pubDate ? new Date(pubDate) : new Date(),
          source: feed.name,
          category: feed.category,
          cve: cveMatch ? cveMatch[0] : null,
          severity: this.extractSeverity(title + ' ' + description)
        };
      });
    } catch (error) {
      console.error(`Error parsing RSS for ${feed.name}:`, error);
      return [];
    }
  }

  parseKEV(data, feed) {
    try {
      const vulnerabilities = data.vulnerabilities || [];
      
      return vulnerabilities.slice(0, 20).map(vuln => ({
        id: `kev-${vuln.cveID}`,
        title: `${vuln.vendorProject} ${vuln.product} - ${vuln.vulnerabilityName}`,
        description: vuln.shortDescription,
        link: `https://nvd.nist.gov/vuln/detail/${vuln.cveID}`,
        date: new Date(vuln.dateAdded),
        source: feed.name,
        category: feed.category,
        cve: vuln.cveID,
        severity: 'HIGH',
        exploited: true,
        dueDate: vuln.dueDate
      }));
    } catch (error) {
      console.error(`Error parsing KEV data:`, error);
      return [];
    }
  }

  parseJSON(data, feed) {
    // Generic JSON parser - customize based on feed structure
    try {
      if (Array.isArray(data)) {
        return data.slice(0, 20).map(item => ({
          id: item.id || `${feed.name}-${Date.now()}-${Math.random()}`,
          title: item.title || item.name || 'Untitled',
          description: item.description || item.summary || '',
          link: item.url || item.link || '#',
          date: item.date ? new Date(item.date) : new Date(),
          source: feed.name,
          category: feed.category
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error parsing JSON for ${feed.name}:`, error);
      return [];
    }
  }

  cleanText(text) {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractSeverity(text) {
    const upperText = text.toUpperCase();
    if (upperText.includes('CRITICAL')) return 'CRITICAL';
    if (upperText.includes('HIGH')) return 'HIGH';
    if (upperText.includes('MEDIUM')) return 'MEDIUM';
    if (upperText.includes('LOW')) return 'LOW';
    return null;
  }

  async fetchAllByCategory(category) {
    const categoryFeeds = this.feeds.filter(f => f.category === category);
    const results = await Promise.allSettled(
      categoryFeeds.map(feed => this.fetchFeed(feed))
    );
    
    return results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => b.date - a.date);
  }

  async fetchPriorityFeeds() {
    const priorityFeeds = this.feeds
      .filter(f => f.priority === 1)
      .slice(0, 5);
    
    const results = await Promise.allSettled(
      priorityFeeds.map(feed => this.fetchFeed(feed))
    );
    
    return results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => b.date - a.date);
  }

  getHealthStatus() {
    const total = this.feeds.length;
    const failed = this.failedFeeds.size;
    const successful = total - failed;
    
    return {
      total,
      successful,
      failed,
      failedFeeds: Array.from(this.failedFeeds),
      lastUpdates: Object.fromEntries(this.lastUpdate)
    };
  }
}

// Export singleton instance
export const feedManager = new CyberFeedManager();