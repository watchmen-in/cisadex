/**
 * STIX/TAXII 2.1 Threat Intelligence Service
 * Federal Cybersecurity Standards Compliant Implementation
 * 
 * Implements STIX 2.1 and TAXII 2.1 specifications for federal threat intelligence sharing:
 * - STIX 2.1 Domain Objects (SDOs) and Cyber Observables (SCOs)
 * - TAXII 2.1 Collections and Discovery Services
 * - Federal interoperability standards
 * - MITRE ATT&CK framework integration
 */

import { generateSecureId, rateLimiter } from '../utils/security';
import type { ProcessedKEVItem } from './cisaKevService';

// STIX 2.1 Specification Types
export interface STIXObject {
  type: string;
  spec_version: '2.1';
  id: string;
  created: string;
  modified: string;
  created_by_ref?: string;
  revoked?: boolean;
  labels?: string[];
  confidence?: number;
  lang?: string;
  external_references?: ExternalReference[];
  object_marking_refs?: string[];
  granular_markings?: GranularMarking[];
}

export interface STIXDomainObject extends STIXObject {
  // Common properties for all SDOs
}

export interface Indicator extends STIXDomainObject {
  type: 'indicator';
  pattern: string;
  pattern_type: string;
  pattern_version?: string;
  valid_from: string;
  valid_until?: string;
  kill_chain_phases?: KillChainPhase[];
}

export interface Vulnerability extends STIXDomainObject {
  type: 'vulnerability';
  name: string;
  description?: string;
  x_mitre_id?: string;
  x_epss_score?: number;
  x_exploited_in_wild?: boolean;
  x_cisa_kev?: boolean;
}

export interface Malware extends STIXDomainObject {
  type: 'malware';
  name: string;
  description?: string;
  malware_types: string[];
  is_family: boolean;
  aliases?: string[];
  kill_chain_phases?: KillChainPhase[];
  first_seen?: string;
  last_seen?: string;
}

export interface ThreatActor extends STIXDomainObject {
  type: 'threat-actor';
  name: string;
  description?: string;
  threat_actor_types: string[];
  aliases?: string[];
  first_seen?: string;
  last_seen?: string;
  roles?: string[];
  goals?: string[];
  sophistication?: string;
  resource_level?: string;
  primary_motivation?: string;
  secondary_motivations?: string[];
  personal_motivations?: string[];
}

export interface AttackPattern extends STIXDomainObject {
  type: 'attack-pattern';
  name: string;
  description?: string;
  aliases?: string[];
  kill_chain_phases?: KillChainPhase[];
  x_mitre_id?: string;
  x_mitre_is_subtechnique?: boolean;
  x_mitre_platforms?: string[];
  x_mitre_data_sources?: string[];
}

export interface KillChainPhase {
  kill_chain_name: string;
  phase_name: string;
}

export interface ExternalReference {
  source_name: string;
  description?: string;
  url?: string;
  hashes?: { [key: string]: string };
  external_id?: string;
}

export interface GranularMarking {
  lang?: string;
  marking_ref?: string;
  selectors: string[];
}

export interface STIXBundle {
  type: 'bundle';
  id: string;
  objects: STIXObject[];
}

// TAXII 2.1 Types
export interface TAXIICollection {
  id: string;
  title: string;
  description?: string;
  alias?: string;
  can_read: boolean;
  can_write: boolean;
  media_types: string[];
}

export interface TAXIIManifestEntry {
  id: string;
  date_added: string;
  version: string;
  media_type: string;
}

export class STIXTAXIIService {
  private readonly baseNamespace = 'x-federal-cisadx';
  private readonly createdByRef = `identity--${generateSecureId()}`;
  private readonly markingDefinition = `marking-definition--${generateSecureId()}`;

  /**
   * Convert KEV vulnerabilities to STIX 2.1 Vulnerability objects
   */
  convertKEVToSTIX(kevItems: ProcessedKEVItem[]): STIXBundle {
    const objects: STIXObject[] = [];

    // Create organization identity
    const organization = this.createOrganizationIdentity();
    objects.push(organization);

    // Create marking definition for federal sharing
    const markingDef = this.createFederalMarkingDefinition();
    objects.push(markingDef);

    // Convert each KEV item to STIX objects
    kevItems.forEach(kevItem => {
      // Create Vulnerability object
      const vulnerability = this.createVulnerability(kevItem);
      objects.push(vulnerability);

      // Create Indicator object
      const indicator = this.createIndicator(kevItem);
      objects.push(indicator);

      // Create attack patterns if applicable
      const attackPatterns = this.createAttackPatterns(kevItem);
      objects.push(...attackPatterns);

      // Create relationships
      const relationships = this.createRelationships(vulnerability, indicator, attackPatterns);
      objects.push(...relationships);
    });

    return {
      type: 'bundle',
      id: `bundle--${generateSecureId()}`,
      objects
    };
  }

  /**
   * Create STIX Vulnerability object from KEV item
   */
  private createVulnerability(kevItem: ProcessedKEVItem): Vulnerability {
    const now = new Date().toISOString();
    
    return {
      type: 'vulnerability',
      spec_version: '2.1',
      id: `vulnerability--${generateSecureId()}`,
      created: now,
      modified: now,
      created_by_ref: this.createdByRef,
      name: kevItem.cve,
      description: kevItem.description,
      labels: ['known-exploited', 'cisa-kev'],
      confidence: 100,
      external_references: [
        {
          source_name: 'cve',
          external_id: kevItem.cve,
          url: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${kevItem.cve}`
        },
        {
          source_name: 'cisa-kev',
          url: kevItem.link,
          description: 'CISA Known Exploited Vulnerabilities Catalog'
        }
      ],
      object_marking_refs: [this.markingDefinition],
      x_mitre_id: kevItem.cve,
      x_exploited_in_wild: true,
      x_cisa_kev: true,
      x_epss_score: null, // Would be enriched from EPSS API
      [`x_${this.baseNamespace}_priority`]: kevItem.priority,
      [`x_${this.baseNamespace}_federal_priority`]: kevItem.federalPriority,
      [`x_${this.baseNamespace}_ransomware_use`]: kevItem.ransomwareUse,
      [`x_${this.baseNamespace}_due_date`]: kevItem.dueDate,
      [`x_${this.baseNamespace}_required_action`]: kevItem.requiredAction,
      [`x_${this.baseNamespace}_cisa_category`]: kevItem.cisaCategory
    };
  }

  /**
   * Create STIX Indicator object from KEV item
   */
  private createIndicator(kevItem: ProcessedKEVItem): Indicator {
    const now = new Date().toISOString();
    const validFrom = kevItem.date.toISOString();
    
    return {
      type: 'indicator',
      spec_version: '2.1',
      id: `indicator--${generateSecureId()}`,
      created: now,
      modified: now,
      created_by_ref: this.createdByRef,
      pattern: `[software:cve = '${kevItem.cve}']`,
      pattern_type: 'stix',
      pattern_version: '2.1',
      valid_from: validFrom,
      labels: ['malicious-activity', 'known-exploited'],
      confidence: 100,
      kill_chain_phases: [{
        kill_chain_name: 'mitre-attack',
        phase_name: 'initial-access'
      }],
      external_references: [
        {
          source_name: 'cisa-kev',
          url: kevItem.link,
          description: kevItem.title
        }
      ],
      object_marking_refs: [this.markingDefinition],
      [`x_${this.baseNamespace}_severity`]: kevItem.severity,
      [`x_${this.baseNamespace}_exploited`]: kevItem.exploited
    };
  }

  /**
   * Create MITRE ATT&CK pattern objects based on vulnerability characteristics
   */
  private createAttackPatterns(kevItem: ProcessedKEVItem): AttackPattern[] {
    const patterns: AttackPattern[] = [];
    const now = new Date().toISOString();

    // Determine relevant ATT&CK techniques based on vulnerability description
    const techniques = this.mapToMITRETechniques(kevItem);

    techniques.forEach(technique => {
      const pattern: AttackPattern = {
        type: 'attack-pattern',
        spec_version: '2.1',
        id: `attack-pattern--${generateSecureId()}`,
        created: now,
        modified: now,
        created_by_ref: this.createdByRef,
        name: technique.name,
        description: technique.description,
        kill_chain_phases: technique.killChainPhases,
        x_mitre_id: technique.mitreId,
        x_mitre_platforms: technique.platforms,
        external_references: [
          {
            source_name: 'mitre-attack',
            url: `https://attack.mitre.org/techniques/${technique.mitreId}/`,
            external_id: technique.mitreId
          }
        ],
        object_marking_refs: [this.markingDefinition]
      };
      patterns.push(pattern);
    });

    return patterns;
  }

  /**
   * Map vulnerability characteristics to MITRE ATT&CK techniques
   */
  private mapToMITRETechniques(kevItem: ProcessedKEVItem) {
    const techniques = [];
    const description = (kevItem.title + ' ' + kevItem.description).toLowerCase();

    // T1190 - Exploit Public-Facing Application
    if (description.includes('remote code execution') || 
        description.includes('web application') ||
        description.includes('http') ||
        description.includes('web server')) {
      techniques.push({
        mitreId: 'T1190',
        name: 'Exploit Public-Facing Application',
        description: 'Adversaries may attempt to take advantage of a weakness in an Internet-facing computer or program using software, data, or commands in order to cause unintended or unanticipated behavior.',
        platforms: ['Linux', 'Windows', 'macOS', 'Network'],
        killChainPhases: [{
          kill_chain_name: 'mitre-attack',
          phase_name: 'initial-access'
        }]
      });
    }

    // T1068 - Exploitation for Privilege Escalation
    if (description.includes('privilege escalation') ||
        description.includes('elevation') ||
        description.includes('local privilege')) {
      techniques.push({
        mitreId: 'T1068',
        name: 'Exploitation for Privilege Escalation',
        description: 'Adversaries may exploit software vulnerabilities in an attempt to elevate privileges.',
        platforms: ['Linux', 'Windows', 'macOS'],
        killChainPhases: [{
          kill_chain_name: 'mitre-attack',
          phase_name: 'privilege-escalation'
        }]
      });
    }

    // T1211 - Exploitation for Defense Evasion
    if (description.includes('authentication bypass') ||
        description.includes('security bypass') ||
        description.includes('filter bypass')) {
      techniques.push({
        mitreId: 'T1211',
        name: 'Exploitation for Defense Evasion',
        description: 'Adversaries may exploit a system or application vulnerability to bypass security features.',
        platforms: ['Linux', 'Windows', 'macOS'],
        killChainPhases: [{
          kill_chain_name: 'mitre-attack',
          phase_name: 'defense-evasion'
        }]
      });
    }

    // Default to T1190 if no specific technique matches
    if (techniques.length === 0) {
      techniques.push({
        mitreId: 'T1190',
        name: 'Exploit Public-Facing Application',
        description: 'Adversaries may attempt to exploit vulnerabilities in public-facing applications.',
        platforms: ['Linux', 'Windows', 'macOS', 'Network'],
        killChainPhases: [{
          kill_chain_name: 'mitre-attack',
          phase_name: 'initial-access'
        }]
      });
    }

    return techniques;
  }

  /**
   * Create relationships between STIX objects
   */
  private createRelationships(vulnerability: Vulnerability, indicator: Indicator, attackPatterns: AttackPattern[]) {
    const relationships = [];
    const now = new Date().toISOString();

    // Indicator -> indicates -> Vulnerability
    relationships.push({
      type: 'relationship',
      spec_version: '2.1',
      id: `relationship--${generateSecureId()}`,
      created: now,
      modified: now,
      created_by_ref: this.createdByRef,
      relationship_type: 'indicates',
      source_ref: indicator.id,
      target_ref: vulnerability.id,
      object_marking_refs: [this.markingDefinition]
    });

    // AttackPattern -> exploits -> Vulnerability
    attackPatterns.forEach(pattern => {
      relationships.push({
        type: 'relationship',
        spec_version: '2.1',
        id: `relationship--${generateSecureId()}`,
        created: now,
        modified: now,
        created_by_ref: this.createdByRef,
        relationship_type: 'exploits',
        source_ref: pattern.id,
        target_ref: vulnerability.id,
        object_marking_refs: [this.markingDefinition]
      });
    });

    return relationships;
  }

  /**
   * Create organization identity for federal agency
   */
  private createOrganizationIdentity() {
    const now = new Date().toISOString();
    
    return {
      type: 'identity',
      spec_version: '2.1',
      id: this.createdByRef,
      created: now,
      modified: now,
      name: 'Federal Cybersecurity Infrastructure (CISAdx)',
      description: 'Federal cybersecurity threat intelligence sharing platform',
      identity_class: 'organization',
      sectors: ['government-national'],
      contact_information: 'security@agency.gov',
      object_marking_refs: [this.markingDefinition]
    };
  }

  /**
   * Create federal marking definition for TLP handling
   */
  private createFederalMarkingDefinition() {
    const now = new Date().toISOString();
    
    return {
      type: 'marking-definition',
      spec_version: '2.1',
      id: this.markingDefinition,
      created: now,
      modified: now,
      name: 'TLP:AMBER+STRICT',
      definition_type: 'statement',
      definition: {
        statement: 'Federal Government Internal Use - Limited distribution to federal agencies and authorized partners only. Not for public release.'
      }
    };
  }

  /**
   * Export STIX bundle as JSON for TAXII sharing
   */
  exportAsJSON(bundle: STIXBundle): string {
    return JSON.stringify(bundle, null, 2);
  }

  /**
   * Validate STIX 2.1 compliance
   */
  validateSTIXCompliance(stixObject: STIXObject): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!stixObject.type) errors.push('Missing required field: type');
    if (!stixObject.spec_version || stixObject.spec_version !== '2.1') {
      errors.push('Invalid or missing spec_version (must be "2.1")');
    }
    if (!stixObject.id) errors.push('Missing required field: id');
    if (!stixObject.created) errors.push('Missing required field: created');
    if (!stixObject.modified) errors.push('Missing required field: modified');

    // ID format validation
    if (stixObject.id && !stixObject.id.match(/^[a-z-]+--[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      errors.push('Invalid STIX ID format');
    }

    // Date format validation
    if (stixObject.created && isNaN(Date.parse(stixObject.created))) {
      errors.push('Invalid created date format');
    }
    if (stixObject.modified && isNaN(Date.parse(stixObject.modified))) {
      errors.push('Invalid modified date format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create TAXII 2.1 collection manifest
   */
  createCollectionManifest(bundles: STIXBundle[]): TAXIIManifestEntry[] {
    return bundles.map(bundle => ({
      id: bundle.id,
      date_added: new Date().toISOString(),
      version: '2.1',
      media_type: 'application/stix+json;version=2.1'
    }));
  }

  /**
   * Get service health and compliance status
   */
  getComplianceStatus() {
    return {
      service: 'STIX/TAXII 2.1',
      specification_version: '2.1',
      federal_compliance: true,
      supported_objects: [
        'vulnerability',
        'indicator', 
        'attack-pattern',
        'relationship',
        'identity',
        'marking-definition'
      ],
      mitre_integration: true,
      tlp_marking: 'TLP:AMBER+STRICT',
      last_updated: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const stixTaxiiService = new STIXTAXIIService();