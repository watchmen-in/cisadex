/**
 * Comprehensive Federal Entity Type Definitions
 * Complete schema for federal cybersecurity and critical infrastructure entities
 */

// Core entity types
export type EntityType = 
  | 'headquarters'
  | 'regional_office'
  | 'field_office'
  | 'resident_office'
  | 'task_force'
  | 'fusion_center'
  | 'laboratory'
  | 'facility'
  | 'emergency_operations_center'
  | 'coordination_center';

// Critical Infrastructure Sectors (CISA 16 Sectors)
export type CriticalInfrastructureSector = 
  | 'chemical'
  | 'commercial_facilities'
  | 'communications'
  | 'critical_manufacturing'
  | 'dams'
  | 'defense_industrial_base'
  | 'emergency_services'
  | 'energy'
  | 'financial_services'
  | 'food_agriculture'
  | 'government_facilities'
  | 'healthcare_public_health'
  | 'information_technology'
  | 'nuclear'
  | 'transportation_systems'
  | 'water_wastewater';

// Operational Functions
export type OperationalFunction = 
  | 'law_enforcement'
  | 'intelligence'
  | 'incident_response'
  | 'regulation'
  | 'research'
  | 'emergency_management'
  | 'information_sharing'
  | 'outreach'
  | 'inspection'
  | 'ot_ics_security'
  | 'cyber_forensics'
  | 'threat_hunting'
  | 'vulnerability_assessment';

// Operational Capabilities
export type OperationalCapability = 
  | 'cyber_forensics'
  | 'malware_analysis'
  | 'threat_hunting'
  | 'vulnerability_assessment'
  | 'incident_coordination'
  | 'critical_infrastructure_protection'
  | 'industrial_control_systems'
  | 'network_security'
  | 'digital_forensics'
  | 'threat_intelligence'
  | 'security_awareness'
  | 'risk_assessment'
  | 'penetration_testing'
  | 'security_auditing'
  | 'compliance_monitoring';

// Federal Agencies and Departments
export type FederalAgency = 
  | 'DHS'
  | 'CISA'
  | 'FBI'
  | 'SECRET_SERVICE'
  | 'TSA'
  | 'USCG'
  | 'FEMA'
  | 'ICE'
  | 'CBP'
  | 'DOE'
  | 'EPA'
  | 'DOT'
  | 'FAA'
  | 'FRA'
  | 'MARAD'
  | 'PHMSA'
  | 'TREASURY'
  | 'IRS'
  | 'FINCEN'
  | 'HHS'
  | 'ASPR'
  | 'FDA'
  | 'USDA'
  | 'FSIS'
  | 'APHIS'
  | 'DOJ'
  | 'ATF'
  | 'DEA'
  | 'USMS'
  | 'NRC'
  | 'FEDERAL_RESERVE'
  | 'NTSB';

// Icon System Types
export type IconSet = 'sector' | 'function' | 'agency' | 'generic';

export interface IconConfig {
  primary: string;
  iconSet: IconSet;
  fallbacks: string[];
  color: string;
  priority: number;
}

// Geographic and Contact Information
export interface LocationData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
}

export interface ContactInformation {
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  emergencyPhone?: string;
  publicAffairs?: string;
  secureFax?: string;
  watch24x7?: string;
}

// Operational Details
export interface JurisdictionData {
  coverage: string;
  states: string[];
  counties?: string[];
  specialties: OperationalFunction[];
  territories?: string[];
  tribalLands?: boolean;
}

export interface OperationalStatus {
  operational: boolean;
  hours: '24/7' | 'Business Hours' | 'On-Call' | 'Emergency Only';
  lastVerified: string;
  publicAccess: boolean;
  securityClearanceRequired?: boolean;
  emergencyResponse?: boolean;
}

// Relationship and Coordination
export interface EntityRelationship {
  relatedEntityId: string;
  relationshipType: 'parent' | 'child' | 'partner' | 'coordination' | 'task_force' | 'fusion_center';
  description?: string;
  active: boolean;
}

// Main Federal Entity Interface
export interface FederalEntity {
  // Core Identity
  id: string;
  name: string;
  parentAgency: FederalAgency;
  type: EntityType;
  
  // Location and Contact
  location: LocationData;
  contact: ContactInformation;
  
  // Operational Classification
  jurisdiction: JurisdictionData;
  sectors: CriticalInfrastructureSector[];
  functions: OperationalFunction[];
  capabilities: OperationalCapability[];
  
  // Visual System
  icon: IconConfig;
  
  // Status and Verification
  status: OperationalStatus;
  
  // Relationships
  relationships?: EntityRelationship[];
  
  // Additional Metadata
  metadata?: {
    establishedDate?: string;
    personnelCount?: number;
    budgetCategory?: string;
    specialPrograms?: string[];
    awards?: string[];
    notes?: string;
  };
}

// Search and Filter Types
export interface GeographicFilter {
  byState?: string[];
  byRegion?: string[];
  byRadius?: {
    center: { lat: number; lng: number };
    radius: number; // in miles
  };
  byJurisdiction?: boolean;
}

export interface OperationalFilter {
  bySector?: CriticalInfrastructureSector[];
  byFunction?: OperationalFunction[];
  byCapability?: OperationalCapability[];
  byStatus?: ('operational' | 'non_operational')[];
  byHours?: ('24/7' | 'Business Hours' | 'On-Call' | 'Emergency Only')[];
}

export interface OrganizationalFilter {
  byAgency?: FederalAgency[];
  byOfficeType?: EntityType[];
  byOperationalStatus?: boolean;
  byPublicAccess?: boolean;
}

export interface SearchCapabilities {
  geographic: GeographicFilter;
  operational: OperationalFilter;
  organizational: OrganizationalFilter;
  textSearch?: string;
  advancedSearch?: {
    capabilities?: string;
    specialties?: string;
    keywords?: string;
  };
}

// Map Display Types
export interface MapCluster {
  coordinates: { lat: number; lng: number };
  count: number;
  entities: string[]; // entity IDs
  primarySector?: CriticalInfrastructureSector;
  primaryFunction?: OperationalFunction;
  zoomLevel: number;
}

export interface HoverTooltip {
  name: string;
  agency: string;
  type: string;
  address: string;
  phone?: string;
  jurisdiction: string;
}

export interface DetailPopup {
  entity: FederalEntity;
  actions: {
    getDirections: boolean;
    callMain: boolean;
    visitWebsite: boolean;
    emergencyContact: boolean;
    viewRelated: boolean;
  };
}

// Data Source and Validation Types
export interface DataSource {
  name: string;
  url?: string;
  lastUpdated: string;
  reliability: 'primary' | 'secondary' | 'tertiary';
  validationMethod: 'automated' | 'manual' | 'hybrid';
}

export interface ValidationResult {
  entityId: string;
  field: string;
  status: 'valid' | 'invalid' | 'needs_verification';
  lastChecked: string;
  source: DataSource;
  notes?: string;
}

// Analytics and Reporting Types
export interface CoverageAnalysis {
  totalEntities: number;
  entitiesBySector: Record<CriticalInfrastructureSector, number>;
  entitiesByFunction: Record<OperationalFunction, number>;
  entitiesByState: Record<string, number>;
  coverageGaps: {
    sector: CriticalInfrastructureSector;
    state: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

export interface ResponseMetrics {
  averageResponseTime: number; // in minutes
  coverageRadius: number; // in miles
  entityDensity: number; // entities per square mile
  capabilityDistribution: Record<OperationalCapability, number>;
}

// Export Data Types
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'kml' | 'geojson';
  includeFields: (keyof FederalEntity)[];
  filterCriteria?: SearchCapabilities;
  includeRelationships?: boolean;
  includeMetadata?: boolean;
}

// API Response Types
export interface EntitySearchResponse {
  entities: FederalEntity[];
  totalCount: number;
  searchTime: number;
  appliedFilters: SearchCapabilities;
  clusters?: MapCluster[];
}

export interface EntityDetailResponse {
  entity: FederalEntity;
  relatedEntities: FederalEntity[];
  proximityEntities: FederalEntity[];
  coverageAnalysis: CoverageAnalysis;
}

// Real-time Status Types
export interface RealTimeStatus {
  entityId: string;
  currentStatus: 'operational' | 'limited' | 'non_operational' | 'emergency';
  incidentLevel?: 'low' | 'medium' | 'high' | 'critical';
  statusMessage?: string;
  lastUpdated: string;
  emergencyContacts?: {
    primary: string;
    secondary?: string;
    watch?: string;
  };
}

// Batch Operations
export interface BatchUpdateRequest {
  entityIds: string[];
  updates: Partial<FederalEntity>;
  validationRequired: boolean;
  source: DataSource;
}

export interface BulkImportRequest {
  entities: Partial<FederalEntity>[];
  overwriteExisting: boolean;
  validationLevel: 'strict' | 'standard' | 'minimal';
  source: DataSource;
}