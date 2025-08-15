import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

interface ThreatIntelligenceItem {
  id: string;
  type: 'malware' | 'phishing' | 'vulnerability' | 'breach' | 'attack_pattern';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  indicators?: {
    ips?: string[];
    domains?: string[];
    hashes?: string[];
    cves?: string[];
    ttps?: string[];
  };
  confidence?: number;
}

interface IncidentItem {
  id: string;
  title: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
  timestamp: string;
  description?: string;
  affected_sectors?: string[];
  geographic_impact?: string[];
}

interface VulnerabilityItem {
  cve_id: string;
  cvss_score: number;
  severity: string;
  description: string;
  affected_products: string[];
  published_date: string;
  exploit_available: boolean;
  patch_available: boolean;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        // Handle authentication errors
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          // Could dispatch logout action here
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Health check endpoint
  async getHealth(): Promise<HealthStatus> {
    try {
      const response: AxiosResponse<HealthStatus> = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: 0
      };
    }
  }

  // Threat Intelligence endpoints
  async getThreatIntelligence(filters?: {
    severity?: string[];
    type?: string[];
    since?: string;
    limit?: number;
  }): Promise<ThreatIntelligenceItem[]> {
    try {
      const response: AxiosResponse<ApiResponse<{ threats: ThreatIntelligenceItem[] }>> = 
        await this.api.get('/threat-intelligence', { params: filters });
      
      if (response.data.success) {
        return response.data.data.threats;
      } else {
        throw new Error(response.data.error || 'Failed to fetch threat intelligence');
      }
    } catch (error) {
      console.error('Error fetching threat intelligence:', error);
      return [];
    }
  }

  async getThreatById(id: string): Promise<ThreatIntelligenceItem | null> {
    try {
      const response: AxiosResponse<ApiResponse<ThreatIntelligenceItem>> = 
        await this.api.get(`/threat-intelligence/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Threat not found');
      }
    } catch (error) {
      console.error('Error fetching threat by ID:', error);
      return null;
    }
  }

  // Incident Management endpoints
  async getIncidents(filters?: {
    severity?: string[];
    status?: string[];
    sectors?: string[];
    since?: string;
    limit?: number;
  }): Promise<IncidentItem[]> {
    try {
      const response: AxiosResponse<ApiResponse<{ incidents: IncidentItem[] }>> = 
        await this.api.get('/incidents', { params: filters });
      
      if (response.data.success) {
        return response.data.data.incidents;
      } else {
        throw new Error(response.data.error || 'Failed to fetch incidents');
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
  }

  async getIncidentById(id: string): Promise<IncidentItem | null> {
    try {
      const response: AxiosResponse<ApiResponse<IncidentItem>> = 
        await this.api.get(`/incidents/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Incident not found');
      }
    } catch (error) {
      console.error('Error fetching incident by ID:', error);
      return null;
    }
  }

  async createIncident(incident: Partial<IncidentItem>): Promise<IncidentItem | null> {
    try {
      const response: AxiosResponse<ApiResponse<IncidentItem>> = 
        await this.api.post('/incidents', incident);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to create incident');
      }
    } catch (error) {
      console.error('Error creating incident:', error);
      return null;
    }
  }

  async updateIncident(id: string, updates: Partial<IncidentItem>): Promise<IncidentItem | null> {
    try {
      const response: AxiosResponse<ApiResponse<IncidentItem>> = 
        await this.api.put(`/incidents/${id}`, updates);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to update incident');
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      return null;
    }
  }

  // Vulnerability Management endpoints
  async getVulnerabilities(filters?: {
    cvss_min?: number;
    exploit_available?: boolean;
    since?: string;
    limit?: number;
  }): Promise<VulnerabilityItem[]> {
    try {
      const response: AxiosResponse<ApiResponse<{ vulnerabilities: VulnerabilityItem[] }>> = 
        await this.api.get('/vulnerabilities', { params: filters });
      
      if (response.data.success) {
        return response.data.data.vulnerabilities;
      } else {
        throw new Error(response.data.error || 'Failed to fetch vulnerabilities');
      }
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
      return [];
    }
  }

  // Federal Entity endpoints
  async getFederalEntities(filters?: {
    agency?: string;
    type?: string;
    state?: string;
    capabilities?: string[];
    limit?: number;
  }): Promise<any[]> {
    try {
      const response: AxiosResponse<ApiResponse<{ entities: any[] }>> = 
        await this.api.get('/federal-entities', { params: filters });
      
      if (response.data.success) {
        return response.data.data.entities;
      } else {
        throw new Error(response.data.error || 'Failed to fetch federal entities');
      }
    } catch (error) {
      console.error('Error fetching federal entities:', error);
      return [];
    }
  }

  // Analytics endpoints
  async getThreatAnalytics(timeframe?: string): Promise<any> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = 
        await this.api.get('/analytics/threats', { params: { timeframe } });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch threat analytics');
      }
    } catch (error) {
      console.error('Error fetching threat analytics:', error);
      return null;
    }
  }

  async getIncidentAnalytics(timeframe?: string): Promise<any> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = 
        await this.api.get('/analytics/incidents', { params: { timeframe } });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch incident analytics');
      }
    } catch (error) {
      console.error('Error fetching incident analytics:', error);
      return null;
    }
  }

  // Search endpoints
  async search(query: string, filters?: {
    types?: string[];
    severity?: string[];
    limit?: number;
  }): Promise<any[]> {
    try {
      const response: AxiosResponse<ApiResponse<{ results: any[] }>> = 
        await this.api.get('/search', { 
          params: { 
            q: query, 
            ...filters 
          } 
        });
      
      if (response.data.success) {
        return response.data.data.results;
      } else {
        throw new Error(response.data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Error performing search:', error);
      return [];
    }
  }

  // Export endpoints
  async exportData(type: 'threats' | 'incidents' | 'vulnerabilities', format: 'json' | 'csv' | 'xml', filters?: any): Promise<Blob | null> {
    try {
      const response = await this.api.get(`/export/${type}`, {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      return new Blob([response.data]);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Real-time updates (WebSocket connection would be handled separately)
  async getRealtimeUpdates(): Promise<EventSource | null> {
    try {
      const eventSource = new EventSource(`${API_BASE_URL}/stream/updates`);
      return eventSource;
    } catch (error) {
      console.error('Error establishing real-time connection:', error);
      return null;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type {
  ThreatIntelligenceItem,
  IncidentItem,
  VulnerabilityItem,
  HealthStatus,
  ApiResponse
};