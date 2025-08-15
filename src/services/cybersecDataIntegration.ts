import { feedManager } from './feedManager';

interface CyberSecurityDataSource {
  name: string;
  type: 'government' | 'vendor' | 'research' | 'community';
  url: string;
  apiKey?: string;
  format: 'RSS' | 'JSON' | 'XML' | 'CSV';
  updateFrequency: number; // in milliseconds
  priority: 1 | 2 | 3 | 4; // 1 is highest priority
  parser: string;
  healthCheck: () => Promise<boolean>;
}

interface ThreatIntelligenceData {
  id: string;
  type: 'malware' | 'phishing' | 'vulnerability' | 'breach' | 'attack_pattern';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  confidence: number; // 0-100
  indicators: {
    ips?: string[];
    domains?: string[];
    hashes?: string[];
    cves?: string[];
    ttps?: string[]; // Tactics, Techniques, and Procedures
  };
  affected_systems: string[];
  geographic_scope: string[];
  mitigation_steps: string[];
  references: string[];
}

interface VulnerabilityData {
  cve_id: string;
  cvss_score: number;
  severity: string;
  description: string;
  affected_products: string[];
  published_date: Date;
  last_modified: Date;
  exploit_available: boolean;
  exploit_maturity: 'UNPROVEN' | 'PROOF_OF_CONCEPT' | 'FUNCTIONAL' | 'HIGH';
  patch_available: boolean;
  vendor_advisories: string[];
  references: string[];
}

interface IncidentData {
  incident_id: string;
  type: string;
  severity: string;
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
  affected_sectors: string[];
  geographic_impact: string[];
  first_seen: Date;
  last_updated: Date;
  attribution: string;
  impact_assessment: string;
  response_actions: string[];
}

export class CybersecurityDataIntegrator {
  private dataSources: CyberSecurityDataSource[] = [
    // Government Sources
    {
      name: 'CISA Known Exploited Vulnerabilities',
      type: 'government',
      url: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
      format: 'JSON',
      updateFrequency: 3600000, // 1 hour
      priority: 1,
      parser: 'cisa_kev',
      healthCheck: async () => {
        try {
          const response = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', { method: 'HEAD' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'US-CERT Alerts',
      type: 'government',
      url: 'https://us-cert.cisa.gov/ncas/alerts.xml',
      format: 'RSS',
      updateFrequency: 1800000, // 30 minutes
      priority: 1,
      parser: 'uscert_rss',
      healthCheck: async () => {
        try {
          const response = await fetch('https://us-cert.cisa.gov/ncas/alerts.xml', { method: 'HEAD' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'NIST National Vulnerability Database',
      type: 'government',
      url: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
      format: 'JSON',
      updateFrequency: 7200000, // 2 hours
      priority: 2,
      parser: 'nvd_api',
      healthCheck: async () => {
        try {
          const response = await fetch('https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=1', { method: 'HEAD' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    
    // Vendor Sources
    {
      name: 'Microsoft Security Response Center',
      type: 'vendor',
      url: 'https://msrc.microsoft.com/update-guide/rss',
      format: 'RSS',
      updateFrequency: 3600000, // 1 hour
      priority: 2,
      parser: 'msrc_rss',
      healthCheck: async () => {
        try {
          const response = await fetch('https://msrc.microsoft.com/update-guide/rss', { method: 'HEAD' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Cisco Security Advisories',
      type: 'vendor',
      url: 'https://tools.cisco.com/security/center/psirtrss20/CiscoSecurityAdvisory.xml',
      format: 'RSS',
      updateFrequency: 3600000, // 1 hour
      priority: 2,
      parser: 'cisco_rss',
      healthCheck: async () => {
        try {
          const response = await fetch('https://tools.cisco.com/security/center/psirtrss20/CiscoSecurityAdvisory.xml', { method: 'HEAD' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },

    // Research & Intelligence Sources
    {
      name: 'MITRE ATT&CK Techniques',
      type: 'research',
      url: 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json',
      format: 'JSON',
      updateFrequency: 86400000, // 24 hours
      priority: 3,
      parser: 'mitre_attack',
      healthCheck: async () => {
        try {
          const response = await fetch('https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json', { method: 'HEAD' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Abuse.ch URLhaus',
      type: 'community',
      url: 'https://urlhaus-api.abuse.ch/v1/urls/recent/',
      format: 'JSON',
      updateFrequency: 900000, // 15 minutes
      priority: 3,
      parser: 'urlhaus_api',
      healthCheck: async () => {
        try {
          const response = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/', { method: 'HEAD' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Abuse.ch ThreatFox',
      type: 'community',
      url: 'https://threatfox-api.abuse.ch/api/v1/',
      format: 'JSON',
      updateFrequency: 900000, // 15 minutes
      priority: 3,
      parser: 'threatfox_api',
      healthCheck: async () => {
        try {
          const response = await fetch('https://threatfox-api.abuse.ch/api/v1/', { method: 'POST', body: JSON.stringify({ query: 'get_iocs', days: 1 }) });
          return response.ok;
        } catch {
          return false;
        }
      }
    }
  ];

  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private healthStatus: Map<string, boolean> = new Map();

  async initializeDataSources(): Promise<void> {
    console.log('Initializing cybersecurity data sources...');
    
    // Health check all sources
    const healthChecks = this.dataSources.map(async (source) => {
      try {
        const isHealthy = await source.healthCheck();
        this.healthStatus.set(source.name, isHealthy);
        console.log(`${source.name}: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
      } catch (error) {
        this.healthStatus.set(source.name, false);
        console.error(`Health check failed for ${source.name}:`, error);
      }
    });

    await Promise.allSettled(healthChecks);
  }

  async getThreatIntelligence(filters?: {
    severity?: string[];
    type?: string[];
    since?: Date;
    limit?: number;
  }): Promise<ThreatIntelligenceData[]> {
    const cacheKey = `threat_intel_${JSON.stringify(filters)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      // Fetch from multiple sources
      const sources = this.dataSources.filter(s => 
        ['government', 'research'].includes(s.type) && 
        this.healthStatus.get(s.name) !== false
      );

      const dataPromises = sources.map(async (source) => {
        try {
          return await this.fetchFromSource(source);
        } catch (error) {
          console.error(`Failed to fetch from ${source.name}:`, error);
          return [];
        }
      });

      const allData = await Promise.allSettled(dataPromises);
      const combinedData = allData
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as PromiseFulfilledResult<any>).value)
        .filter(item => this.matchesFilters(item, filters))
        .slice(0, filters?.limit || 100);

      // Cache the results
      this.cache.set(cacheKey, {
        data: combinedData,
        timestamp: Date.now(),
        ttl: 600000 // 10 minutes
      });

      return combinedData;
    } catch (error) {
      console.error('Error fetching threat intelligence:', error);
      return [];
    }
  }

  async getVulnerabilityData(filters?: {
    cvss_min?: number;
    exploit_available?: boolean;
    since?: Date;
    limit?: number;
  }): Promise<VulnerabilityData[]> {
    const cacheKey = `vulns_${JSON.stringify(filters)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      // Fetch CISA KEV data
      const kevData = await this.fetchCISAKEV();
      
      // Fetch NVD data
      const nvdData = await this.fetchNVDData(filters);
      
      const combinedData = [...kevData, ...nvdData]
        .filter(vuln => this.matchesVulnFilters(vuln, filters))
        .slice(0, filters?.limit || 50);

      this.cache.set(cacheKey, {
        data: combinedData,
        timestamp: Date.now(),
        ttl: 1800000 // 30 minutes
      });

      return combinedData;
    } catch (error) {
      console.error('Error fetching vulnerability data:', error);
      return [];
    }
  }

  async getIncidentData(filters?: {
    severity?: string[];
    status?: string[];
    sectors?: string[];
    since?: Date;
    limit?: number;
  }): Promise<IncidentData[]> {
    const cacheKey = `incidents_${JSON.stringify(filters)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      // Simulate incident data (in real implementation, this would fetch from actual sources)
      const mockIncidents: IncidentData[] = [
        {
          incident_id: 'INC-2024-001',
          type: 'Ransomware',
          severity: 'CRITICAL',
          status: 'INVESTIGATING',
          affected_sectors: ['Healthcare', 'Financial Services'],
          geographic_impact: ['United States', 'Canada'],
          first_seen: new Date(Date.now() - 2 * 60 * 60 * 1000),
          last_updated: new Date(),
          attribution: 'Unknown',
          impact_assessment: 'High - Critical infrastructure affected',
          response_actions: ['Isolation of affected systems', 'Backup restoration initiated', 'Law enforcement notified']
        },
        {
          incident_id: 'INC-2024-002',
          type: 'Data Breach',
          severity: 'HIGH',
          status: 'CONTAINED',
          affected_sectors: ['Government', 'Education'],
          geographic_impact: ['United States'],
          first_seen: new Date(Date.now() - 24 * 60 * 60 * 1000),
          last_updated: new Date(Date.now() - 30 * 60 * 1000),
          attribution: 'State-sponsored',
          impact_assessment: 'Medium - Sensitive data potentially compromised',
          response_actions: ['Security patches applied', 'User credentials reset', 'Monitoring enhanced']
        }
      ];

      const filteredData = mockIncidents
        .filter(incident => this.matchesIncidentFilters(incident, filters))
        .slice(0, filters?.limit || 20);

      this.cache.set(cacheKey, {
        data: filteredData,
        timestamp: Date.now(),
        ttl: 300000 // 5 minutes
      });

      return filteredData;
    } catch (error) {
      console.error('Error fetching incident data:', error);
      return [];
    }
  }

  private async fetchFromSource(source: CyberSecurityDataSource): Promise<any[]> {
    try {
      const response = await fetch(source.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      let data;
      switch (source.format) {
        case 'JSON':
          data = await response.json();
          break;
        case 'RSS':
        case 'XML':
          data = await response.text();
          break;
        default:
          throw new Error(`Unsupported format: ${source.format}`);
      }

      return this.parseData(data, source.parser);
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
      throw error;
    }
  }

  private parseData(data: any, parser: string): any[] {
    switch (parser) {
      case 'cisa_kev':
        return this.parseCISAKEV(data);
      case 'uscert_rss':
        return this.parseUSCERTRSS(data);
      case 'nvd_api':
        return this.parseNVDAPI(data);
      case 'mitre_attack':
        return this.parseMITREAttack(data);
      case 'urlhaus_api':
        return this.parseURLHaus(data);
      case 'threatfox_api':
        return this.parseThreatFox(data);
      default:
        console.warn(`Unknown parser: ${parser}`);
        return [];
    }
  }

  private parseCISAKEV(data: any): VulnerabilityData[] {
    if (!data.vulnerabilities) return [];
    
    return data.vulnerabilities.map((vuln: any) => ({
      cve_id: vuln.cveID,
      cvss_score: 9.0, // CISA KEV are high priority
      severity: 'HIGH',
      description: vuln.shortDescription,
      affected_products: [`${vuln.vendorProject} ${vuln.product}`],
      published_date: new Date(vuln.dateAdded),
      last_modified: new Date(vuln.dateAdded),
      exploit_available: true,
      exploit_maturity: 'FUNCTIONAL',
      patch_available: vuln.requiredAction.includes('patch') || vuln.requiredAction.includes('update'),
      vendor_advisories: [],
      references: [vuln.notes || '']
    }));
  }

  private parseUSCERTRSS(xmlData: string): ThreatIntelligenceData[] {
    // Simple XML parsing (in production, use a proper XML parser)
    const items: ThreatIntelligenceData[] = [];
    
    // Mock data for demonstration
    items.push({
      id: 'uscert-001',
      type: 'vulnerability',
      severity: 'HIGH',
      title: 'Critical Vulnerability in Common Software',
      description: 'A critical vulnerability has been identified affecting multiple systems.',
      timestamp: new Date(),
      source: 'US-CERT',
      confidence: 95,
      indicators: {
        cves: ['CVE-2024-0001']
      },
      affected_systems: ['Windows', 'Linux'],
      geographic_scope: ['Global'],
      mitigation_steps: ['Apply security patches', 'Update software'],
      references: ['https://us-cert.cisa.gov/']
    });

    return items;
  }

  private parseNVDAPI(data: any): VulnerabilityData[] {
    if (!data.vulnerabilities) return [];
    
    return data.vulnerabilities.map((vuln: any) => {
      const cve = vuln.cve;
      const metrics = cve.metrics;
      const cvssScore = metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 
                       metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore || 0;
      
      return {
        cve_id: cve.id,
        cvss_score: cvssScore,
        severity: this.getSeverityFromCVSS(cvssScore),
        description: cve.descriptions?.find((d: any) => d.lang === 'en')?.value || '',
        affected_products: cve.configurations?.nodes?.flatMap((node: any) => 
          node.cpeMatch?.map((match: any) => match.criteria) || []
        ) || [],
        published_date: new Date(cve.published),
        last_modified: new Date(cve.lastModified),
        exploit_available: false, // Would need additional data source
        exploit_maturity: 'UNPROVEN',
        patch_available: false, // Would need additional analysis
        vendor_advisories: cve.references?.map((ref: any) => ref.url) || [],
        references: cve.references?.map((ref: any) => ref.url) || []
      };
    });
  }

  private parseMITREAttack(data: any): ThreatIntelligenceData[] {
    if (!data.objects) return [];
    
    return data.objects
      .filter((obj: any) => obj.type === 'attack-pattern')
      .map((technique: any) => ({
        id: technique.id,
        type: 'attack_pattern' as const,
        severity: 'MEDIUM',
        title: technique.name,
        description: technique.description || '',
        timestamp: new Date(technique.modified),
        source: 'MITRE ATT&CK',
        confidence: 85,
        indicators: {
          ttps: [technique.id]
        },
        affected_systems: technique.x_mitre_platforms || [],
        geographic_scope: ['Global'],
        mitigation_steps: [],
        references: technique.external_references?.map((ref: any) => ref.url) || []
      }));
  }

  private parseURLHaus(data: any): ThreatIntelligenceData[] {
    if (!data.urls) return [];
    
    return data.urls.map((url: any) => ({
      id: `urlhaus-${url.id}`,
      type: 'phishing' as const,
      severity: url.threat === 'malware_download' ? 'HIGH' : 'MEDIUM',
      title: `Malicious URL: ${url.url}`,
      description: `${url.threat} detected at ${url.url}`,
      timestamp: new Date(url.date_added),
      source: 'URLhaus',
      confidence: 90,
      indicators: {
        domains: [new URL(url.url).hostname],
        ips: [url.host]
      },
      affected_systems: [],
      geographic_scope: [url.country || 'Unknown'],
      mitigation_steps: ['Block URL', 'Update security filters'],
      references: [url.url]
    }));
  }

  private parseThreatFox(data: any): ThreatIntelligenceData[] {
    if (!data.data) return [];
    
    return data.data.map((ioc: any) => ({
      id: `threatfox-${ioc.id}`,
      type: 'malware' as const,
      severity: ioc.confidence_level > 75 ? 'HIGH' : 'MEDIUM',
      title: `IoC: ${ioc.ioc}`,
      description: `${ioc.malware} indicator detected`,
      timestamp: new Date(ioc.first_seen),
      source: 'ThreatFox',
      confidence: ioc.confidence_level,
      indicators: {
        hashes: ioc.ioc_type.includes('hash') ? [ioc.ioc] : [],
        domains: ioc.ioc_type.includes('domain') ? [ioc.ioc] : [],
        ips: ioc.ioc_type.includes('ip') ? [ioc.ioc] : []
      },
      affected_systems: [],
      geographic_scope: ['Global'],
      mitigation_steps: ['Block indicator', 'Scan for presence'],
      references: []
    }));
  }

  private async fetchCISAKEV(): Promise<VulnerabilityData[]> {
    const source = this.dataSources.find(s => s.parser === 'cisa_kev');
    if (!source) return [];
    
    try {
      return await this.fetchFromSource(source);
    } catch (error) {
      console.error('Error fetching CISA KEV:', error);
      return [];
    }
  }

  private async fetchNVDData(filters?: any): Promise<VulnerabilityData[]> {
    const source = this.dataSources.find(s => s.parser === 'nvd_api');
    if (!source) return [];
    
    try {
      const url = new URL(source.url);
      url.searchParams.set('resultsPerPage', '20');
      if (filters?.since) {
        url.searchParams.set('pubStartDate', filters.since.toISOString().split('T')[0]);
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      return this.parseNVDAPI(data);
    } catch (error) {
      console.error('Error fetching NVD data:', error);
      return [];
    }
  }

  private getSeverityFromCVSS(score: number): string {
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    return 'LOW';
  }

  private matchesFilters(item: any, filters?: any): boolean {
    if (!filters) return true;
    
    if (filters.severity && !filters.severity.includes(item.severity)) return false;
    if (filters.type && !filters.type.includes(item.type)) return false;
    if (filters.since && new Date(item.timestamp) < filters.since) return false;
    
    return true;
  }

  private matchesVulnFilters(vuln: VulnerabilityData, filters?: any): boolean {
    if (!filters) return true;
    
    if (filters.cvss_min && vuln.cvss_score < filters.cvss_min) return false;
    if (filters.exploit_available !== undefined && vuln.exploit_available !== filters.exploit_available) return false;
    if (filters.since && vuln.published_date < filters.since) return false;
    
    return true;
  }

  private matchesIncidentFilters(incident: IncidentData, filters?: any): boolean {
    if (!filters) return true;
    
    if (filters.severity && !filters.severity.includes(incident.severity)) return false;
    if (filters.status && !filters.status.includes(incident.status)) return false;
    if (filters.sectors && !incident.affected_sectors.some(sector => filters.sectors.includes(sector))) return false;
    if (filters.since && incident.first_seen < filters.since) return false;
    
    return true;
  }

  getHealthStatus(): Map<string, boolean> {
    return this.healthStatus;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const cybersecDataIntegrator = new CybersecurityDataIntegrator();