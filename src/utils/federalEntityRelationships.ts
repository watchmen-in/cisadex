/**
 * Federal Entity Relationship Mapping System
 * Handles coordination relationships, hierarchies, and information sharing agreements
 */

import { 
  FederalEntity, 
  EntityRelationship,
  FederalAgency,
  OperationalFunction 
} from '../types/federalEntity';
import { federalEntitiesDatabase } from '../data/federalEntities';

// Relationship types and their descriptions
export const RELATIONSHIP_TYPES = {
  parent: {
    label: 'Parent Agency',
    description: 'Direct organizational hierarchy',
    bidirectional: false,
    strength: 1.0
  },
  child: {
    label: 'Subordinate Office',
    description: 'Reports to parent organization',
    bidirectional: false,
    strength: 1.0
  },
  partner: {
    label: 'Partnership',
    description: 'Collaborative partnership agreement',
    bidirectional: true,
    strength: 0.8
  },
  coordination: {
    label: 'Coordination Agreement',
    description: 'Information sharing and coordination',
    bidirectional: true,
    strength: 0.6
  },
  task_force: {
    label: 'Task Force Participation',
    description: 'Joint task force membership',
    bidirectional: true,
    strength: 0.9
  },
  fusion_center: {
    label: 'Fusion Center Network',
    description: 'Intelligence sharing network',
    bidirectional: true,
    strength: 0.7
  }
};

// Pre-defined relationship mappings based on federal structure
export const FEDERAL_RELATIONSHIPS: EntityRelationship[] = [
  // DHS - CISA Relationships
  {
    relatedEntityId: 'cisa-region-1',
    relationshipType: 'coordination',
    description: 'Regional coordination with FBI Boston',
    active: true
  },
  {
    relatedEntityId: 'cisa-region-2',
    relationshipType: 'coordination',
    description: 'Regional coordination with FBI New York',
    active: true
  },
  
  // FBI Field Office Coordination
  {
    relatedEntityId: 'fbi-nyfo',
    relationshipType: 'task_force',
    description: 'Joint Terrorism Task Force coordination',
    active: true
  },
  {
    relatedEntityId: 'fbi-wfo',
    relationshipType: 'coordination',
    description: 'National security coordination',
    active: true
  },
  
  // DOE Lab Coordination
  {
    relatedEntityId: 'doe-ornl',
    relationshipType: 'partner',
    description: 'Cybersecurity research collaboration',
    active: true
  },
  {
    relatedEntityId: 'doe-lanl',
    relationshipType: 'partner',
    description: 'Advanced cyber threat research',
    active: true
  },
  
  // Fusion Center Networks
  {
    relatedEntityId: 'fusion-nctc',
    relationshipType: 'fusion_center',
    description: 'National intelligence sharing network',
    active: true
  }
];

/**
 * Relationship analysis and mapping utilities
 */
export class FederalEntityRelationshipMapper {
  private entities: FederalEntity[];
  private relationshipGraph: Map<string, Set<string>>;
  private coordinationMatrix: Map<string, Map<string, number>>;

  constructor() {
    this.entities = federalEntitiesDatabase;
    this.relationshipGraph = new Map();
    this.coordinationMatrix = new Map();
    this.buildRelationshipGraph();
  }

  /**
   * Build the relationship graph from entity data
   */
  private buildRelationshipGraph(): void {
    this.entities.forEach(entity => {
      if (!this.relationshipGraph.has(entity.id)) {
        this.relationshipGraph.set(entity.id, new Set());
      }

      // Add relationships from entity data
      entity.relationships?.forEach(rel => {
        this.addRelationship(entity.id, rel.relatedEntityId, rel.relationshipType, rel.active);
      });

      // Infer relationships based on agency structure
      this.inferAgencyRelationships(entity);
      
      // Infer geographic coordination
      this.inferGeographicCoordination(entity);
      
      // Infer functional coordination
      this.inferFunctionalCoordination(entity);
    });
  }

  /**
   * Add a relationship between two entities
   */
  private addRelationship(
    entityId1: string, 
    entityId2: string, 
    type: keyof typeof RELATIONSHIP_TYPES,
    active: boolean = true
  ): void {
    if (!active) return;

    const relationshipType = RELATIONSHIP_TYPES[type];
    
    // Add to relationship graph
    if (!this.relationshipGraph.has(entityId1)) {
      this.relationshipGraph.set(entityId1, new Set());
    }
    if (!this.relationshipGraph.has(entityId2)) {
      this.relationshipGraph.set(entityId2, new Set());
    }

    this.relationshipGraph.get(entityId1)!.add(entityId2);
    
    // Add bidirectional if applicable
    if (relationshipType.bidirectional) {
      this.relationshipGraph.get(entityId2)!.add(entityId1);
    }

    // Update coordination matrix with relationship strength
    this.updateCoordinationStrength(entityId1, entityId2, relationshipType.strength);
  }

  /**
   * Infer relationships based on agency structure
   */
  private inferAgencyRelationships(entity: FederalEntity): void {
    // Find other entities from same agency
    const sameAgencyEntities = this.entities.filter(other => 
      other.id !== entity.id && 
      other.parentAgency === entity.parentAgency
    );

    sameAgencyEntities.forEach(other => {
      // Regional offices coordinate with each other
      if (entity.type === 'regional_office' && other.type === 'regional_office') {
        this.addRelationship(entity.id, other.id, 'coordination');
      }
      
      // Field offices coordinate with regional offices
      if (entity.type === 'field_office' && other.type === 'regional_office') {
        // Check if in same geographic area
        if (this.isInSameRegion(entity, other)) {
          this.addRelationship(entity.id, other.id, 'coordination');
        }
      }
    });
  }

  /**
   * Infer geographic coordination relationships
   */
  private inferGeographicCoordination(entity: FederalEntity): void {
    // Find entities in same state with complementary functions
    const sameStateEntities = this.entities.filter(other =>
      other.id !== entity.id &&
      (other.location.state === entity.location.state ||
       other.jurisdiction.states.includes(entity.location.state) ||
       entity.jurisdiction.states.includes(other.location.state))
    );

    sameStateEntities.forEach(other => {
      // Law enforcement agencies coordinate
      if (this.hasComplementaryFunctions(entity, other)) {
        this.addRelationship(entity.id, other.id, 'coordination');
      }
      
      // Emergency services coordinate
      if (this.hasEmergencyCoordination(entity, other)) {
        this.addRelationship(entity.id, other.id, 'coordination');
      }
    });
  }

  /**
   * Infer functional coordination relationships
   */
  private inferFunctionalCoordination(entity: FederalEntity): void {
    // Find entities with overlapping sectors or functions
    const functionalMatches = this.entities.filter(other =>
      other.id !== entity.id &&
      (this.hasOverlappingSectors(entity, other) ||
       this.hasOverlappingFunctions(entity, other))
    );

    functionalMatches.forEach(other => {
      // Cyber-related entities coordinate
      if (this.hasCyberCoordination(entity, other)) {
        this.addRelationship(entity.id, other.id, 'coordination');
      }
      
      // Critical infrastructure protection coordination
      if (this.hasCriticalInfrastructureCoordination(entity, other)) {
        this.addRelationship(entity.id, other.id, 'coordination');
      }
    });
  }

  /**
   * Update coordination strength matrix
   */
  private updateCoordinationStrength(entityId1: string, entityId2: string, strength: number): void {
    if (!this.coordinationMatrix.has(entityId1)) {
      this.coordinationMatrix.set(entityId1, new Map());
    }
    if (!this.coordinationMatrix.has(entityId2)) {
      this.coordinationMatrix.set(entityId2, new Map());
    }

    const currentStrength1 = this.coordinationMatrix.get(entityId1)!.get(entityId2) || 0;
    const currentStrength2 = this.coordinationMatrix.get(entityId2)!.get(entityId1) || 0;
    
    this.coordinationMatrix.get(entityId1)!.set(entityId2, Math.max(currentStrength1, strength));
    this.coordinationMatrix.get(entityId2)!.set(entityId1, Math.max(currentStrength2, strength));
  }

  /**
   * Helper methods for relationship inference
   */
  private isInSameRegion(entity1: FederalEntity, entity2: FederalEntity): boolean {
    return entity1.jurisdiction.states.some(state => 
      entity2.jurisdiction.states.includes(state)
    );
  }

  private hasComplementaryFunctions(entity1: FederalEntity, entity2: FederalEntity): boolean {
    const lawEnforcementFunctions: OperationalFunction[] = [
      'law_enforcement', 'intelligence', 'incident_response', 'cyber_forensics'
    ];
    
    const entity1HasLE = entity1.functions.some(f => lawEnforcementFunctions.includes(f));
    const entity2HasLE = entity2.functions.some(f => lawEnforcementFunctions.includes(f));
    
    return entity1HasLE && entity2HasLE;
  }

  private hasEmergencyCoordination(entity1: FederalEntity, entity2: FederalEntity): boolean {
    const emergencyFunctions: OperationalFunction[] = [
      'emergency_management', 'incident_response'
    ];
    
    const entity1HasEM = entity1.functions.some(f => emergencyFunctions.includes(f));
    const entity2HasEM = entity2.functions.some(f => emergencyFunctions.includes(f));
    
    return entity1HasEM && entity2HasEM;
  }

  private hasOverlappingSectors(entity1: FederalEntity, entity2: FederalEntity): boolean {
    return entity1.sectors.some(sector => entity2.sectors.includes(sector));
  }

  private hasOverlappingFunctions(entity1: FederalEntity, entity2: FederalEntity): boolean {
    return entity1.functions.some(func => entity2.functions.includes(func));
  }

  private hasCyberCoordination(entity1: FederalEntity, entity2: FederalEntity): boolean {
    const cyberFunctions: OperationalFunction[] = [
      'cyber_forensics', 'threat_hunting', 'vulnerability_assessment', 'ot_ics_security'
    ];
    
    const entity1HasCyber = entity1.functions.some(f => cyberFunctions.includes(f)) ||
                           entity1.sectors.includes('information_technology');
    const entity2HasCyber = entity2.functions.some(f => cyberFunctions.includes(f)) ||
                           entity2.sectors.includes('information_technology');
    
    return entity1HasCyber && entity2HasCyber;
  }

  private hasCriticalInfrastructureCoordination(entity1: FederalEntity, entity2: FederalEntity): boolean {
    const ciSectors = ['energy', 'transportation_systems', 'communications', 'water_wastewater'];
    
    const entity1HasCI = entity1.sectors.some(s => ciSectors.includes(s));
    const entity2HasCI = entity2.sectors.some(s => ciSectors.includes(s));
    
    return entity1HasCI && entity2HasCI;
  }

  /**
   * Public methods for relationship queries
   */

  /**
   * Get all related entities for a given entity
   */
  public getRelatedEntities(entityId: string): FederalEntity[] {
    const relatedIds = this.relationshipGraph.get(entityId) || new Set();
    return Array.from(relatedIds)
      .map(id => this.entities.find(e => e.id === id))
      .filter(Boolean) as FederalEntity[];
  }

  /**
   * Get coordination strength between two entities
   */
  public getCoordinationStrength(entityId1: string, entityId2: string): number {
    return this.coordinationMatrix.get(entityId1)?.get(entityId2) || 0;
  }

  /**
   * Find entities within coordination network of a given entity
   */
  public getCoordinationNetwork(entityId: string, maxDepth: number = 2): FederalEntity[] {
    const visited = new Set<string>();
    const network = new Set<string>();
    const queue: { id: string; depth: number }[] = [{ id: entityId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (visited.has(id) || depth > maxDepth) continue;
      
      visited.add(id);
      if (depth > 0) network.add(id); // Don't include the starting entity
      
      const related = this.relationshipGraph.get(id) || new Set();
      related.forEach(relatedId => {
        if (!visited.has(relatedId)) {
          queue.push({ id: relatedId, depth: depth + 1 });
        }
      });
    }

    return Array.from(network)
      .map(id => this.entities.find(e => e.id === id))
      .filter(Boolean) as FederalEntity[];
  }

  /**
   * Get entities by relationship type
   */
  public getEntitiesByRelationshipType(
    entityId: string, 
    relationshipType: keyof typeof RELATIONSHIP_TYPES
  ): FederalEntity[] {
    const entity = this.entities.find(e => e.id === entityId);
    if (!entity) return [];

    const relationships = entity.relationships || [];
    const relatedIds = relationships
      .filter(rel => rel.relationshipType === relationshipType && rel.active)
      .map(rel => rel.relatedEntityId);

    return relatedIds
      .map(id => this.entities.find(e => e.id === id))
      .filter(Boolean) as FederalEntity[];
  }

  /**
   * Find potential coordination opportunities
   */
  public findCoordinationOpportunities(entityId: string): {
    entity: FederalEntity;
    reason: string;
    strength: number;
  }[] {
    const entity = this.entities.find(e => e.id === entityId);
    if (!entity) return [];

    const currentRelated = new Set(
      this.relationshipGraph.get(entityId) || []
    );
    currentRelated.add(entityId); // Don't suggest self

    const opportunities: {
      entity: FederalEntity;
      reason: string;
      strength: number;
    }[] = [];

    this.entities.forEach(other => {
      if (currentRelated.has(other.id)) return;

      let reason = '';
      let strength = 0;

      // Same state, different agencies
      if (entity.location.state === other.location.state && 
          entity.parentAgency !== other.parentAgency) {
        if (this.hasComplementaryFunctions(entity, other)) {
          reason = 'Same state with complementary law enforcement functions';
          strength = 0.7;
        } else if (this.hasOverlappingSectors(entity, other)) {
          reason = 'Same state with overlapping sectors';
          strength = 0.6;
        }
      }

      // Overlapping jurisdiction
      if (entity.jurisdiction.states.some(state => 
          other.jurisdiction.states.includes(state))) {
        if (this.hasCyberCoordination(entity, other)) {
          reason = 'Overlapping jurisdiction with cyber capabilities';
          strength = Math.max(strength, 0.8);
        } else if (this.hasCriticalInfrastructureCoordination(entity, other)) {
          reason = 'Overlapping jurisdiction with CI protection roles';
          strength = Math.max(strength, 0.7);
        }
      }

      if (strength > 0.5) {
        opportunities.push({ entity: other, reason, strength });
      }
    });

    return opportunities.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Generate relationship statistics
   */
  public getRelationshipStatistics(): {
    totalRelationships: number;
    byType: Record<string, number>;
    averageConnections: number;
    mostConnectedEntities: { entity: FederalEntity; connections: number }[];
    coordinationClusters: { entities: FederalEntity[]; strength: number }[];
  } {
    let totalRelationships = 0;
    const byType: Record<string, number> = {};
    const connectionCounts = new Map<string, number>();

    // Count relationships
    this.entities.forEach(entity => {
      const connections = this.relationshipGraph.get(entity.id)?.size || 0;
      connectionCounts.set(entity.id, connections);
      totalRelationships += connections;

      entity.relationships?.forEach(rel => {
        if (rel.active) {
          byType[rel.relationshipType] = (byType[rel.relationshipType] || 0) + 1;
        }
      });
    });

    // Most connected entities
    const mostConnected = Array.from(connectionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, connections]) => ({
        entity: this.entities.find(e => e.id === id)!,
        connections
      }))
      .filter(item => item.entity);

    return {
      totalRelationships: Math.floor(totalRelationships / 2), // Divide by 2 for bidirectional
      byType,
      averageConnections: totalRelationships / this.entities.length,
      mostConnectedEntities: mostConnected,
      coordinationClusters: [] // Could implement clustering algorithm
    };
  }
}

// Global relationship mapper instance
export const relationshipMapper = new FederalEntityRelationshipMapper();

// Convenience functions
export const getRelatedEntities = (entityId: string): FederalEntity[] => {
  return relationshipMapper.getRelatedEntities(entityId);
};

export const getCoordinationNetwork = (entityId: string, maxDepth?: number): FederalEntity[] => {
  return relationshipMapper.getCoordinationNetwork(entityId, maxDepth);
};

export const getCoordinationStrength = (entityId1: string, entityId2: string): number => {
  return relationshipMapper.getCoordinationStrength(entityId1, entityId2);
};

export const findCoordinationOpportunities = (entityId: string) => {
  return relationshipMapper.findCoordinationOpportunities(entityId);
};

export const getRelationshipStatistics = () => {
  return relationshipMapper.getRelationshipStatistics();
};