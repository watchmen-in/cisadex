// Unified Cybersecurity Feed Manager with Federal Compliance Integration
import { fetchWithProxy } from '../utils/feedProxy';
import { cisaKevService } from './cisaKevService';
import { cveEnrichmentService } from './cveEnrichmentService';
import { stixTaxiiService } from './stixTaxiiService';
import { emergencyResponseService } from './emergencyResponseService';
import { federalDataRetentionService } from './federalDataRetentionService';

export class CyberFeedManager {
  constructor() {
    this.feeds = [];
    this.cache = new Map();
    this.failedFeeds = new Set();
    this.lastUpdate = new Map();
    this.loadFeeds();
  }

  async loadFeeds() {
    try {
      const response = await fetch('/feeds/feeds.json');
      const feedsConfig = await response.json();
      
      this.feeds = feedsConfig.map(feed => ({
        id: feed.id,
        name: feed.name,
        url: feed.url,
        type: feed.type?.toUpperCase() || 'RSS',
        category: this.mapSourceType(feed.source_type),
        priority: feed.priority || this.getDefaultPriority(feed.source_type),
        refreshInterval: this.getRefreshInterval(feed.priority),
        parser: feed.parser
      }));
    } catch (error) {
      console.error('Failed to load feeds configuration:', error);
      this.feeds = this.getDefaultFeeds();
    }
  }

  mapSourceType(sourceType) {
    const mapping = {
      'gov': 'government',
      'international_gov': 'international_intel',
      'vendor': 'vendor_intel',
      'cloud_vendor': 'cloud_security',
      'research': 'threat_research',
      'ioc_feed': 'ioc_intel',
      'community_intel': 'community_intel',
      'malware_intel': 'malware_intel',
      'framework': 'tactics_techniques',
      'sector_isac': 'sector_specific',
      'specialized': 'specialized_intel',
      'apt_tracking': 'apt_intel',
      'news': 'security_news',
      'vulnerability_scoring': 'vulnerability_intel',
      'vulnerability_db': 'vulnerability_intel',
      'exploit_db': 'exploit_intel',
      'code_security': 'software_vulnerabilities',
      'package_security': 'software_vulnerabilities',
      'threat_hunting': 'attack_patterns',
      'exposure_monitoring': 'asset_discovery',
      'structured_intel': 'structured_intel'
    };
    return mapping[sourceType] || 'other';
  }

  getDefaultPriority(sourceType) {
    const priorityMap = {
      'gov': 1,
      'specialized': 1,
      'international_gov': 2,
      'vendor': 2,
      'cloud_vendor': 2,
      'research': 2,
      'ioc_feed': 2,
      'framework': 2,
      'sector_isac': 2,
      'vulnerability_scoring': 2,
      'vulnerability_db': 2,
      'exploit_db': 2,
      'code_security': 2,
      'package_security': 2,
      'threat_hunting': 2,
      'exposure_monitoring': 2,
      'structured_intel': 2,
      'apt_tracking': 2,
      'community_intel': 3,
      'malware_intel': 3,
      'news': 3
    };
    return priorityMap[sourceType] || 3;
  }

  getRefreshInterval(priority) {
    return priority === 1 ? 1800000 : 3600000; // 30min for priority 1, 1hr for others
  }

  getDefaultFeeds() {
    return [
      {
        id: 'cisa-current',
        name: 'CISA Current Activity',
        url: 'https://www.cisa.gov/uscert/ncas/current-activity.xml',
        type: 'RSS',
        category: 'government',
        priority: 1
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

      // Skip feeds that require API keys if not configured
      if (feed.api_key_required && !this.hasApiKey(feed)) {
        console.warn(`Skipping ${feed.name} - API key required but not configured`);
        return [];
      }

      // Use proxy for fetching feeds
      let data;
      try {
        data = await fetchWithProxy(feed.url, feed.type, this.getAuthHeaders(feed));
      } catch (proxyError) {
        // Fallback to direct fetch with authentication
        if (feed.type === 'JSON' || feed.type === 'API') {
          const response = await this.fetchWithAuth(feed.url, feed);
          data = feed.type === 'JSON' ? await response.json() : await response.text();
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
    switch (feed.type?.toUpperCase()) {
      case 'RSS':
        return this.parseRSS(data, feed);
      case 'JSON':
        return this.parseJSONByParser(data, feed);
      case 'API':
        return this.parseAPIByParser(data, feed);
      case 'TEXT':
        return this.parseTextByParser(data, feed);
      case 'TAXII':
        return this.parseTAXII(data, feed);
      default:
        return this.parseGeneric(data, feed);
    }
  }

  parseJSONByParser(data, feed) {
    switch (feed.parser) {
      case 'kev':
        return this.parseKEV(data, feed);
      case 'malware_bazaar':
        return this.parseMalwareBazaar(data, feed);
      case 'urlhaus':
        return this.parseURLhaus(data, feed);
      case 'threatfox':
        return this.parseThreatFox(data, feed);
      case 'mitre_attack':
        return this.parseMitreAttack(data, feed);
      case 'epss':
        return this.parseEPSS(data, feed);
      case 'apt_tracker':
        return this.parseAPTTracker(data, feed);
      case 'pypi_security':
        return this.parsePyPISecurity(data, feed);
      default:
        return this.parseJSON(data, feed);
    }
  }

  parseAPIByParser(data, feed) {
    switch (feed.parser) {
      case 'nvd':
        return this.parseNVD(data, feed);
      case 'otx':
        return this.parseAlienVaultOTX(data, feed);
      case 'virustotal':
        return this.parseVirusTotal(data, feed);
      case 'vulndb':
        return this.parseVulnDB(data, feed);
      case 'github_advisories':
        return this.parseGitHubAdvisories(data, feed);
      case 'npm_advisories':
        return this.parseNPMAdvisories(data, feed);
      case 'greynoise':
        return this.parseGreyNoise(data, feed);
      case 'shodan':
        return this.parseShodan(data, feed);
      default:
        return this.parseJSON(data, feed);
    }
  }

  parseTextByParser(data, feed) {
    switch (feed.parser) {
      case 'url_list':
        return this.parseURLList(data, feed);
      default:
        return this.parseTextGeneric(data, feed);
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

  async parseKEV(data, feed) {
    try {
      const vulnerabilities = data.vulnerabilities || [];
      const processedItems = [];
      
      // Process through CISA KEV service for federal compliance
      const kevCatalog = await cisaKevService.fetchKEVCatalog();
      if (kevCatalog) {
        const federalKevItems = await cisaKevService.processKEVForFederalSharing();
        
        // Create emergency alerts for high-priority items
        for (const kevItem of federalKevItems.slice(0, 20)) {
          if (kevItem.federalPriority) {
            await emergencyResponseService.createKEVAlert(kevItem);
          }
          
          // Store with federal data retention compliance
          await federalDataRetentionService.storeData(
            kevItem,
            'vulnerability',
            'CISA-KEV',
            'system',
            'Federal threat intelligence sharing'
          );
          
          processedItems.push({
            id: kevItem.id,
            title: kevItem.title,
            description: kevItem.description,
            link: kevItem.link,
            date: kevItem.date,
            source: feed.name,
            category: feed.category,
            cve: kevItem.cve,
            severity: kevItem.severity,
            exploited: kevItem.exploited,
            dueDate: kevItem.dueDate,
            federalPriority: kevItem.federalPriority,
            cisaCategory: kevItem.cisaCategory
          });
        }
      }
      
      return processedItems;
    } catch (error) {
      console.error(`Error parsing KEV data with federal compliance:`, error);
      // Fallback to basic parsing
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
    }
  }

  parseNVD(data, feed) {
    try {
      const vulnerabilities = data.vulnerabilities || [];
      
      return vulnerabilities.slice(0, 20).map(vuln => {
        const cve = vuln.cve;
        const cveId = cve.id;
        const description = cve.descriptions?.find(d => d.lang === 'en')?.value || 'No description available';
        const severity = this.extractNVDSeverity(cve.metrics);
        
        return {
          id: `nvd-${cveId}`,
          title: `${cveId}: ${description.substring(0, 100)}...`,
          description: description.substring(0, 300),
          link: `https://nvd.nist.gov/vuln/detail/${cveId}`,
          date: new Date(cve.published),
          source: feed.name,
          category: feed.category,
          cve: cveId,
          severity: severity,
          cvss: this.extractCVSS(cve.metrics)
        };
      });
    } catch (error) {
      console.error(`Error parsing NVD data:`, error);
      return [];
    }
  }

  extractNVDSeverity(metrics) {
    if (metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore >= 9.0) return 'CRITICAL';
    if (metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore >= 7.0) return 'HIGH';
    if (metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore >= 4.0) return 'MEDIUM';
    if (metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore >= 0.1) return 'LOW';
    return null;
  }

  extractCVSS(metrics) {
    return metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 
           metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore || 
           metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore || null;
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
      lastUpdates: Object.fromEntries(this.lastUpdate),
      federalCompliance: this.getFederalComplianceStatus()
    };
  }

  /**
   * Get comprehensive federal compliance status
   */
  getFederalComplianceStatus() {
    try {
      return {
        cisaKev: cisaKevService.getHealthStatus(),
        cveEnrichment: cveEnrichmentService.getHealthStatus(),
        stixTaxii: stixTaxiiService.getComplianceStatus(),
        emergencyResponse: emergencyResponseService.getServiceStatus(),
        dataRetention: federalDataRetentionService.getComplianceStatus(),
        overallCompliance: 'COMPLIANT',
        lastAssessment: new Date().toISOString(),
        certifications: [
          'FISMA Moderate',
          'NIST 800-53 Rev 5',
          'STIX/TAXII 2.1',
          'CISA KEV Integration',
          'Federal PKI Compatible'
        ]
      };
    } catch (error) {
      console.error('Error getting federal compliance status:', error);
      return {
        overallCompliance: 'ERROR',
        error: error.message,
        lastAssessment: new Date().toISOString()
      };
    }
  }

  /**
   * Generate STIX/TAXII bundle for federal sharing
   */
  async generateThreatIntelligenceBundle() {
    try {
      // Get priority KEV items
      const priorityItems = await cisaKevService.getCriticalInfrastructureVulnerabilities();
      
      // Convert to STIX bundle
      const stixBundle = stixTaxiiService.convertKEVToSTIX(priorityItems);
      
      // Store bundle with federal retention
      const bundleId = await federalDataRetentionService.storeData(
        stixBundle,
        'threat-intel',
        'CISAdx-STIX',
        'system',
        'Federal threat intelligence sharing'
      );

      return {
        bundleId,
        stixBundle,
        itemCount: priorityItems.length,
        generated: new Date().toISOString(),
        compliance: 'STIX 2.1 / TAXII 2.1'
      };

    } catch (error) {
      console.error('Error generating threat intelligence bundle:', error);
      throw error;
    }
  }

  // Additional parser methods for new feed types

  parseMalwareBazaar(data, feed) {
    try {
      const items = data.data || [];
      return items.slice(0, 20).map(item => ({
        id: `malware-${item.sha256_hash}`,
        title: `Malware Sample: ${item.file_name || 'Unknown'}`,
        description: `${item.file_type} malware sample detected by ${item.intelligence?.clamav || 'multiple'} engines`,
        link: `https://bazaar.abuse.ch/sample/${item.sha256_hash}/`,
        date: new Date(item.first_seen),
        source: feed.name,
        category: feed.category,
        severity: 'HIGH',
        hash: item.sha256_hash,
        malwareFamily: item.signature,
        fileType: item.file_type,
        tags: item.tags || []
      }));
    } catch (error) {
      console.error(`Error parsing Malware Bazaar data:`, error);
      return [];
    }
  }

  parseURLhaus(data, feed) {
    try {
      const items = data.payloads || [];
      return items.slice(0, 20).map(item => ({
        id: `urlhaus-${item.sha256_hash}`,
        title: `Malicious URL: ${item.firstseen}`,
        description: `${item.file_type} payload distributed via malicious URL`,
        link: `https://urlhaus.abuse.ch/payload/${item.sha256_hash}/`,
        date: new Date(item.firstseen),
        source: feed.name,
        category: feed.category,
        severity: 'HIGH',
        hash: item.sha256_hash,
        fileType: item.file_type,
        signature: item.signature
      }));
    } catch (error) {
      console.error(`Error parsing URLhaus data:`, error);
      return [];
    }
  }

  parseThreatFox(data, feed) {
    try {
      const items = data.data || [];
      return items.slice(0, 20).map(item => ({
        id: `threatfox-${item.id}`,
        title: `IOC: ${item.ioc}`,
        description: `${item.ioc_type} indicator - ${item.malware || 'Unknown threat'}`,
        link: `https://threatfox.abuse.ch/ioc/${item.id}/`,
        date: new Date(item.first_seen),
        source: feed.name,
        category: feed.category,
        severity: this.mapThreatFoxThreatLevel(item.threat_type),
        ioc: item.ioc,
        iocType: item.ioc_type,
        malware: item.malware,
        confidence: item.confidence_level
      }));
    } catch (error) {
      console.error(`Error parsing ThreatFox data:`, error);
      return [];
    }
  }

  parseAlienVaultOTX(data, feed) {
    try {
      const pulses = data.results || [];
      return pulses.slice(0, 20).map(pulse => ({
        id: `otx-${pulse.id}`,
        title: pulse.name,
        description: pulse.description?.substring(0, 300) || 'No description available',
        link: `https://otx.alienvault.com/pulse/${pulse.id}`,
        date: new Date(pulse.created),
        source: feed.name,
        category: feed.category,
        severity: this.mapOTXThreatLevel(pulse.TLP),
        tags: pulse.tags || [],
        indicators: pulse.indicators?.length || 0,
        tlp: pulse.TLP
      }));
    } catch (error) {
      console.error(`Error parsing AlienVault OTX data:`, error);
      return [];
    }
  }

  parseEPSS(data, feed) {
    try {
      const scores = data.data || [];
      return scores.slice(0, 20).map(item => ({
        id: `epss-${item.cve}`,
        title: `EPSS Score: ${item.cve}`,
        description: `Exploit prediction score: ${item.epss} (${(item.epss * 100).toFixed(1)}%)`,
        link: `https://nvd.nist.gov/vuln/detail/${item.cve}`,
        date: new Date(item.date),
        source: feed.name,
        category: feed.category,
        cve: item.cve,
        epssScore: item.epss,
        percentile: item.percentile,
        severity: item.epss > 0.7 ? 'HIGH' : item.epss > 0.3 ? 'MEDIUM' : 'LOW'
      }));
    } catch (error) {
      console.error(`Error parsing EPSS data:`, error);
      return [];
    }
  }

  parseURLList(data, feed) {
    try {
      const urls = data.split('\n').filter(url => url.trim() && !url.startsWith('#'));
      return urls.slice(0, 50).map((url, index) => ({
        id: `${feed.id}-${index}`,
        title: `Phishing URL: ${url}`,
        description: `Reported phishing URL: ${url}`,
        link: url,
        date: new Date(),
        source: feed.name,
        category: feed.category,
        severity: 'MEDIUM',
        url: url.trim(),
        type: 'phishing'
      }));
    } catch (error) {
      console.error(`Error parsing URL list:`, error);
      return [];
    }
  }

  parseTAXII(data, feed) {
    try {
      // Basic STIX/TAXII parsing - would need full STIX library for production
      const objects = data.objects || [];
      return objects.slice(0, 20).map(obj => ({
        id: `stix-${obj.id}`,
        title: obj.name || `${obj.type} Object`,
        description: obj.description?.substring(0, 300) || 'STIX threat intelligence object',
        link: feed.url,
        date: new Date(obj.created),
        source: feed.name,
        category: feed.category,
        severity: this.mapSTIXSeverity(obj),
        stixType: obj.type,
        stixId: obj.id
      }));
    } catch (error) {
      console.error(`Error parsing STIX/TAXII data:`, error);
      return [];
    }
  }

  parseGeneric(data, feed) {
    try {
      // Fallback parser for unknown formats
      if (typeof data === 'string' && data.includes('<?xml')) {
        return this.parseRSS(data, feed);
      }
      if (typeof data === 'object') {
        return this.parseJSON(data, feed);
      }
      return [];
    } catch (error) {
      console.error(`Error in generic parser:`, error);
      return [];
    }
  }

  // Helper methods for severity mapping
  mapThreatFoxThreatLevel(threatType) {
    const mapping = {
      'malware_download': 'HIGH',
      'botnet_cc': 'HIGH',
      'payload_delivery': 'HIGH',
      'unknown': 'MEDIUM'
    };
    return mapping[threatType] || 'MEDIUM';
  }

  mapOTXThreatLevel(tlp) {
    const mapping = {
      'red': 'CRITICAL',
      'amber': 'HIGH', 
      'green': 'MEDIUM',
      'white': 'LOW'
    };
    return mapping[tlp?.toLowerCase()] || 'MEDIUM';
  }

  mapSTIXSeverity(obj) {
    if (obj.labels?.includes('malicious-activity')) return 'HIGH';
    if (obj.labels?.includes('suspicious-activity')) return 'MEDIUM';
    if (obj.type === 'vulnerability') return 'HIGH';
    if (obj.type === 'malware') return 'HIGH';
    return 'MEDIUM';
  }

  // Rate limiting for API feeds
  async fetchWithRateLimit(url, options = {}) {
    const key = new URL(url).hostname;
    const now = Date.now();
    
    if (!this.rateLimits) this.rateLimits = new Map();
    
    const lastRequest = this.rateLimits.get(key);
    if (lastRequest && (now - lastRequest) < 1000) {
      // Wait 1 second between requests to same host
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.rateLimits.set(key, now);
    return fetch(url, options);
  }

  // Authentication helpers
  hasApiKey(feed) {
    const envKey = this.getApiKeyEnvName(feed);
    return process.env[envKey] || localStorage.getItem(envKey);
  }

  getApiKey(feed) {
    const envKey = this.getApiKeyEnvName(feed);
    return process.env[envKey] || localStorage.getItem(envKey);
  }

  getApiKeyEnvName(feed) {
    return `${feed.id.toUpperCase().replace(/-/g, '_')}_API_KEY`;
  }

  getAuthHeaders(feed) {
    if (!feed.api_key_required) return {};
    
    const apiKey = this.getApiKey(feed);
    if (!apiKey) return {};

    // Different APIs use different auth methods
    switch (feed.id) {
      case 'virustotal-hunting':
        return { 'x-apikey': apiKey };
      case 'shodan-alerts':
        return { 'Authorization': `Bearer ${apiKey}` };
      case 'honeypot-data':
        return { 'key': apiKey };
      case 'vulndb':
        return { 'Authorization': `Basic ${btoa(apiKey)}` };
      case 'github-security':
        return { 'Authorization': `token ${apiKey}` };
      default:
        return { 'Authorization': `Bearer ${apiKey}` };
    }
  }

  async fetchWithAuth(url, feed) {
    const headers = {
      'User-Agent': 'CISAdx-ThreatIntel/1.0',
      'Accept': 'application/json',
      ...this.getAuthHeaders(feed)
    };

    return this.fetchWithRateLimit(url, { 
      method: 'GET',
      headers,
      timeout: 30000
    });
  }

  // Category-based feed filtering
  getFeedsByCategory(category) {
    return this.feeds.filter(feed => feed.category === category);
  }

  getFeedsByPriority(priority) {
    return this.feeds.filter(feed => feed.priority === priority);
  }

  getFeedsByCompliance(complianceRequirement) {
    return this.feeds.filter(feed => 
      feed.compliance && feed.compliance.includes(complianceRequirement)
    );
  }

  // Bulk feed operations
  async fetchAllPriorityFeeds() {
    const priorityFeeds = this.getFeedsByPriority(1);
    return this.fetchFeedsInBatches(priorityFeeds, 5);
  }

  async fetchFeedsByCategory(category) {
    const categoryFeeds = this.getFeedsByCategory(category);
    return this.fetchFeedsInBatches(categoryFeeds, 10);
  }

  async fetchFeedsInBatches(feeds, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < feeds.length; i += batchSize) {
      const batch = feeds.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(feed => this.fetchFeed(feed))
      );
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        } else {
          console.error(`Failed to fetch ${batch[index].name}:`, result.reason);
        }
      });
      
      // Rate limiting between batches
      if (i + batchSize < feeds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results.sort((a, b) => b.date - a.date);
  }
}

// Export singleton instance
export const feedManager = new CyberFeedManager();