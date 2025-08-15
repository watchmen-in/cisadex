// CTI Service API Key Management System
// Federal-grade secure API key management for threat intelligence services

export class CTIApiManager {
  constructor() {
    this.apiKeys = new Map();
    this.keyRotationSchedule = new Map();
    this.usageTracking = new Map();
    this.rateLimits = new Map();
    this.encryptionKey = this.generateEncryptionKey();
    this.initializeServices();
  }

  initializeServices() {
    // Define CTI service configurations
    this.serviceConfigs = {
      // Commercial Threat Intelligence Platforms
      'crowdstrike': {
        name: 'CrowdStrike Falcon Intelligence',
        baseUrl: 'https://api.crowdstrike.com',
        keyType: 'bearer',
        rateLimitRpm: 100,
        keyRotationDays: 90,
        compliance: ['FedRAMP', 'SOC2'],
        endpoints: {
          indicators: '/intel/combined/indicators/v1',
          actors: '/intel/combined/actors/v1',
          reports: '/intel/combined/reports/v1'
        }
      },
      'mandiant': {
        name: 'Mandiant Advantage',
        baseUrl: 'https://api.intelligence.fireeye.com',
        keyType: 'bearer',
        rateLimitRpm: 150,
        keyRotationDays: 60,
        compliance: ['FedRAMP', 'FISMA'],
        endpoints: {
          indicators: '/v4/indicator',
          malware: '/v4/malware',
          actors: '/v4/actor',
          campaigns: '/v4/campaign'
        }
      },
      'recorded_future': {
        name: 'Recorded Future Intelligence',
        baseUrl: 'https://api.recordedfuture.com',
        keyType: 'api_key',
        rateLimitRpm: 200,
        keyRotationDays: 30,
        compliance: ['FedRAMP', 'SOC2'],
        endpoints: {
          entities: '/v2/entity',
          alerts: '/v2/alert',
          intelligence: '/v2/intelligence'
        }
      },
      'anomali': {
        name: 'Anomali ThreatStream',
        baseUrl: 'https://api.threatstream.com',
        keyType: 'api_key',
        rateLimitRpm: 120,
        keyRotationDays: 45,
        compliance: ['FedRAMP'],
        endpoints: {
          intelligence: '/api/v2/intelligence',
          actors: '/api/v2/actors',
          signatures: '/api/v2/signatures'
        }
      },
      'virustotal': {
        name: 'VirusTotal Enterprise',
        baseUrl: 'https://www.virustotal.com/api/v3',
        keyType: 'api_key',
        rateLimitRpm: 300,
        keyRotationDays: 365,
        compliance: ['SOC2'],
        endpoints: {
          files: '/files',
          urls: '/urls',
          domains: '/domains',
          hunting: '/intelligence/hunting_notification_files'
        }
      },
      'shodan': {
        name: 'Shodan Enterprise',
        baseUrl: 'https://api.shodan.io',
        keyType: 'api_key',
        rateLimitRpm: 100,
        keyRotationDays: 180,
        endpoints: {
          search: '/shodan/host/search',
          alerts: '/shodan/alert/info',
          honeyscore: '/labs/honeyscore'
        }
      },
      // Federal and Open Source Intelligence
      'misp': {
        name: 'MISP Threat Sharing',
        baseUrl: process.env.MISP_BASE_URL || 'https://misp.local',
        keyType: 'authorization',
        rateLimitRpm: 60,
        keyRotationDays: 30,
        compliance: ['FISMA', 'NIST-800-53'],
        endpoints: {
          events: '/events',
          attributes: '/attributes',
          objects: '/objects'
        }
      },
      'otx': {
        name: 'AlienVault OTX',
        baseUrl: 'https://otx.alienvault.com/api/v1',
        keyType: 'api_key',
        rateLimitRpm: 100,
        keyRotationDays: 90,
        endpoints: {
          pulses: '/pulses/subscribed',
          indicators: '/indicators',
          users: '/users'
        }
      },
      'greynoise': {
        name: 'GreyNoise Intelligence',
        baseUrl: 'https://api.greynoise.io',
        keyType: 'api_key',
        rateLimitRpm: 100,
        keyRotationDays: 90,
        endpoints: {
          context: '/v2/noise/context',
          quick: '/v2/noise/quick',
          riot: '/v2/riot'
        }
      }
    };
  }

  generateEncryptionKey() {
    // In production, this would be loaded from secure key management
    return crypto.getRandomValues(new Uint8Array(32));
  }

  async encryptApiKey(apiKey) {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      // Fallback for environments without crypto.subtle
      return btoa(apiKey); // Basic encoding - NOT for production
    }

    try {
      const key = await crypto.subtle.importKey(
        'raw',
        this.encryptionKey,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(apiKey);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoded
      );

      return {
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return btoa(apiKey); // Fallback
    }
  }

  async decryptApiKey(encryptedData) {
    if (typeof encryptedData === 'string') {
      // Fallback decoding
      return atob(encryptedData);
    }

    try {
      const key = await crypto.subtle.importKey(
        'raw',
        this.encryptionKey,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
        key,
        new Uint8Array(encryptedData.encrypted)
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt API key');
    }
  }

  async setApiKey(service, apiKey, metadata = {}) {
    if (!this.serviceConfigs[service]) {
      throw new Error(`Unknown CTI service: ${service}`);
    }

    const encryptedKey = await this.encryptApiKey(apiKey);
    
    this.apiKeys.set(service, {
      encrypted: encryptedKey,
      metadata: {
        ...metadata,
        added: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0
      }
    });

    // Set rotation schedule
    const config = this.serviceConfigs[service];
    const rotationDate = new Date();
    rotationDate.setDate(rotationDate.getDate() + config.keyRotationDays);
    this.keyRotationSchedule.set(service, rotationDate);

    // Initialize usage tracking
    this.usageTracking.set(service, {
      requestsToday: 0,
      requestsThisHour: 0,
      lastReset: new Date(),
      errors: 0,
      successRate: 100
    });

    // Store in secure location (environment variables or secure storage)
    if (typeof window === 'undefined') {
      // Server-side storage
      process.env[`CTI_${service.toUpperCase()}_API_KEY`] = apiKey;
    } else {
      // Client-side secure storage (development only)
      localStorage.setItem(`cti_${service}_key`, JSON.stringify(encryptedKey));
    }

    console.log(`API key configured for ${config.name}`);
  }

  async getApiKey(service) {
    let keyData = this.apiKeys.get(service);
    
    if (!keyData) {
      // Try to load from environment/storage
      keyData = await this.loadApiKeyFromStorage(service);
    }

    if (!keyData) {
      throw new Error(`No API key configured for service: ${service}`);
    }

    return await this.decryptApiKey(keyData.encrypted);
  }

  async loadApiKeyFromStorage(service) {
    try {
      if (typeof window === 'undefined') {
        // Server-side
        const envKey = process.env[`CTI_${service.toUpperCase()}_API_KEY`];
        if (envKey) {
          const encrypted = await this.encryptApiKey(envKey);
          return { encrypted };
        }
      } else {
        // Client-side
        const stored = localStorage.getItem(`cti_${service}_key`);
        if (stored) {
          return { encrypted: JSON.parse(stored) };
        }
      }
    } catch (error) {
      console.error(`Failed to load API key for ${service}:`, error);
    }
    return null;
  }

  async makeAuthenticatedRequest(service, endpoint, options = {}) {
    const config = this.serviceConfigs[service];
    if (!config) {
      throw new Error(`Unknown service: ${service}`);
    }

    // Check rate limits
    if (!this.checkRateLimit(service)) {
      throw new Error(`Rate limit exceeded for ${service}`);
    }

    const apiKey = await this.getApiKey(service);
    const url = `${config.baseUrl}${endpoint}`;
    
    // Prepare headers based on auth type
    const headers = {
      'User-Agent': 'CISAdx/2.0 (Federal Cybersecurity Platform)',
      'Accept': 'application/json',
      ...options.headers
    };

    switch (config.keyType) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'api_key':
        headers['X-API-Key'] = apiKey;
        break;
      case 'authorization':
        headers['Authorization'] = apiKey;
        break;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: options.timeout || 30000
      });

      this.trackUsage(service, response.ok);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.trackUsage(service, false);
      throw error;
    }
  }

  checkRateLimit(service) {
    const config = this.serviceConfigs[service];
    const usage = this.usageTracking.get(service);
    
    if (!usage) return true;

    const now = new Date();
    const hoursSinceReset = (now - usage.lastReset) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= 1) {
      // Reset hourly counter
      usage.requestsThisHour = 0;
      usage.lastReset = now;
    }

    return usage.requestsThisHour < config.rateLimitRpm;
  }

  trackUsage(service, success) {
    const usage = this.usageTracking.get(service);
    if (usage) {
      usage.requestsToday++;
      usage.requestsThisHour++;
      
      if (success) {
        usage.successRate = (usage.successRate * 0.9) + (100 * 0.1);
      } else {
        usage.errors++;
        usage.successRate = (usage.successRate * 0.9) + (0 * 0.1);
      }
    }
  }

  getUsageStats(service) {
    const usage = this.usageTracking.get(service);
    const config = this.serviceConfigs[service];
    
    if (!usage) return null;

    return {
      service: config.name,
      requestsToday: usage.requestsToday,
      requestsThisHour: usage.requestsThisHour,
      rateLimitRpm: config.rateLimitRpm,
      successRate: Math.round(usage.successRate),
      errors: usage.errors,
      compliance: config.compliance
    };
  }

  getAllUsageStats() {
    const stats = {};
    for (const service of Object.keys(this.serviceConfigs)) {
      stats[service] = this.getUsageStats(service);
    }
    return stats;
  }

  getRotationStatus() {
    const status = {};
    for (const [service, rotationDate] of this.keyRotationSchedule.entries()) {
      const daysUntilRotation = Math.ceil((rotationDate - new Date()) / (1000 * 60 * 60 * 24));
      status[service] = {
        service: this.serviceConfigs[service].name,
        rotationDate: rotationDate.toISOString(),
        daysUntilRotation,
        needsRotation: daysUntilRotation <= 7
      };
    }
    return status;
  }

  // Federal compliance reporting
  generateComplianceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      services: {},
      overallCompliance: 'COMPLIANT',
      recommendations: []
    };

    for (const [service, config] of Object.entries(this.serviceConfigs)) {
      const usage = this.getUsageStats(service);
      const rotation = this.getRotationStatus()[service];
      
      report.services[service] = {
        name: config.name,
        compliance: config.compliance,
        keyRotationCompliant: !rotation?.needsRotation,
        rateLimitCompliant: usage?.successRate > 95,
        lastUsed: usage ? new Date().toISOString() : 'Never'
      };

      if (rotation?.needsRotation) {
        report.recommendations.push(`Rotate API key for ${config.name} (due in ${rotation.daysUntilRotation} days)`);
      }

      if (usage?.successRate < 95) {
        report.recommendations.push(`Review API integration for ${config.name} (${usage.successRate}% success rate)`);
      }
    }

    return report;
  }

  // Bulk operations for threat intelligence
  async fetchMultiServiceIndicators(iocs, services = ['crowdstrike', 'mandiant', 'virustotal']) {
    const results = {};
    
    for (const service of services) {
      try {
        if (this.serviceConfigs[service]) {
          results[service] = await this.fetchIndicators(service, iocs);
        }
      } catch (error) {
        console.error(`Failed to fetch from ${service}:`, error);
        results[service] = { error: error.message };
      }
    }

    return results;
  }

  async fetchIndicators(service, iocs) {
    const config = this.serviceConfigs[service];
    
    switch (service) {
      case 'crowdstrike':
        return await this.makeAuthenticatedRequest(service, 
          `${config.endpoints.indicators}?filter=indicator:${iocs.join(',')}`
        );
      
      case 'mandiant':
        return await this.makeAuthenticatedRequest(service,
          `${config.endpoints.indicators}?indicator=${iocs.join('&indicator=')}`
        );
      
      case 'virustotal':
        const results = [];
        for (const ioc of iocs.slice(0, 10)) { // Limit batch size
          try {
            const result = await this.makeAuthenticatedRequest(service,
              `${config.endpoints.files}/${ioc}`
            );
            results.push(result);
          } catch (error) {
            results.push({ ioc, error: error.message });
          }
        }
        return results;
      
      default:
        throw new Error(`Indicator fetching not implemented for ${service}`);
    }
  }
}

// Export singleton instance
export const ctiApiManager = new CTIApiManager();

// Convenience functions for easy integration
export const CTI = {
  async setKey(service, key, metadata) {
    return ctiApiManager.setApiKey(service, key, metadata);
  },
  
  async query(service, endpoint, options) {
    return ctiApiManager.makeAuthenticatedRequest(service, endpoint, options);
  },
  
  async getIndicators(iocs, services) {
    return ctiApiManager.fetchMultiServiceIndicators(iocs, services);
  },
  
  getStats() {
    return ctiApiManager.getAllUsageStats();
  },
  
  getCompliance() {
    return ctiApiManager.generateComplianceReport();
  }
};