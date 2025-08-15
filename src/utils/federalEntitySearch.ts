/**
 * Advanced Search and Filtering System for Federal Entities
 * Comprehensive search capabilities with geographic, operational, and organizational filters
 */

import { 
  FederalEntity, 
  SearchCapabilities, 
  EntitySearchResponse, 
  MapCluster,
  CriticalInfrastructureSector,
  OperationalFunction,
  FederalAgency
} from '../types/federalEntity';
import { federalEntitiesDatabase } from '../data/federalEntities';

// Search engine class
export class FederalEntitySearchEngine {
  private entities: FederalEntity[];
  private searchIndex: Map<string, Set<string>>;

  constructor() {
    this.entities = federalEntitiesDatabase;
    this.searchIndex = new Map();
    this.buildSearchIndex();
  }

  /**
   * Build inverted index for fast text search
   */
  private buildSearchIndex(): void {
    this.entities.forEach(entity => {
      const searchableText = [
        entity.name,
        entity.parentAgency,
        entity.type,
        entity.location.city,
        entity.location.state,
        entity.location.address,
        entity.jurisdiction.coverage,
        ...entity.sectors,
        ...entity.functions,
        ...entity.capabilities,
        ...entity.jurisdiction.specialties,
        ...(entity.jurisdiction.states || []),
        ...(entity.metadata?.specialPrograms || [])
      ].join(' ').toLowerCase();

      // Tokenize and index
      const tokens = searchableText.split(/\s+/);
      tokens.forEach(token => {
        if (token.length > 2) { // Only index meaningful tokens
          if (!this.searchIndex.has(token)) {
            this.searchIndex.set(token, new Set());
          }
          this.searchIndex.get(token)!.add(entity.id);
        }
      });
    });
  }

  /**
   * Main search function
   */
  public search(criteria: SearchCapabilities): EntitySearchResponse {
    const startTime = performance.now();
    let results = [...this.entities];

    // Apply text search first if provided
    if (criteria.textSearch) {
      results = this.applyTextSearch(results, criteria.textSearch);
    }

    // Apply geographic filters
    if (criteria.geographic) {
      results = this.applyGeographicFilters(results, criteria.geographic);
    }

    // Apply operational filters
    if (criteria.operational) {
      results = this.applyOperationalFilters(results, criteria.operational);
    }

    // Apply organizational filters
    if (criteria.organizational) {
      results = this.applyOrganizationalFilters(results, criteria.organizational);
    }

    // Apply advanced search
    if (criteria.advancedSearch) {
      results = this.applyAdvancedSearch(results, criteria.advancedSearch);
    }

    const searchTime = performance.now() - startTime;

    return {
      entities: results,
      totalCount: results.length,
      searchTime,
      appliedFilters: criteria,
      clusters: this.generateClusters(results)
    };
  }

  /**
   * Apply text search using inverted index
   */
  private applyTextSearch(entities: FederalEntity[], searchText: string): FederalEntity[] {
    if (!searchText.trim()) return entities;

    const tokens = searchText.toLowerCase().split(/\s+/);
    const matchingEntityIds = new Set<string>();

    // Find entities that match any token
    tokens.forEach(token => {
      const exactMatches = this.searchIndex.get(token);
      if (exactMatches) {
        exactMatches.forEach(id => matchingEntityIds.add(id));
      }

      // Partial matches for longer tokens
      if (token.length > 3) {
        this.searchIndex.forEach((entityIds, indexToken) => {
          if (indexToken.includes(token)) {
            entityIds.forEach(id => matchingEntityIds.add(id));
          }
        });
      }
    });

    return entities.filter(entity => matchingEntityIds.has(entity.id));
  }

  /**
   * Apply geographic filters
   */
  private applyGeographicFilters(entities: FederalEntity[], filters: any): FederalEntity[] {
    let filtered = entities;

    // Filter by state
    if (filters.byState && filters.byState.length > 0) {
      filtered = filtered.filter(entity => 
        filters.byState.includes(entity.location.state) ||
        entity.jurisdiction.states.some((state: string) => filters.byState.includes(state))
      );
    }

    // Filter by region (FEMA regions, etc.)
    if (filters.byRegion && filters.byRegion.length > 0) {
      // Map states to FEMA regions
      const femaRegions: Record<string, string[]> = {
        'Region I': ['CT', 'ME', 'MA', 'NH', 'RI', 'VT'],
        'Region II': ['NJ', 'NY', 'PR', 'VI'],
        'Region III': ['DE', 'DC', 'MD', 'PA', 'VA', 'WV'],
        'Region IV': ['AL', 'FL', 'GA', 'KY', 'MS', 'NC', 'SC', 'TN'],
        'Region V': ['IL', 'IN', 'MI', 'MN', 'OH', 'WI'],
        'Region VI': ['AR', 'LA', 'NM', 'OK', 'TX'],
        'Region VII': ['IA', 'KS', 'MO', 'NE'],
        'Region VIII': ['CO', 'MT', 'ND', 'SD', 'UT', 'WY'],
        'Region IX': ['AZ', 'CA', 'HI', 'NV', 'AS', 'GU', 'MP'],
        'Region X': ['AK', 'ID', 'OR', 'WA']
      };

      filtered = filtered.filter(entity => {
        return filters.byRegion.some((region: string) => {
          const regionStates = femaRegions[region] || [];
          return regionStates.includes(entity.location.state) ||
                 entity.jurisdiction.states.some((state: string) => regionStates.includes(state));
        });
      });
    }

    // Filter by radius
    if (filters.byRadius) {
      const { center, radius } = filters.byRadius;
      filtered = filtered.filter(entity => {
        const distance = this.calculateDistance(
          center.lat, center.lng,
          entity.location.coordinates.lat, entity.location.coordinates.lng
        );
        return distance <= radius;
      });
    }

    return filtered;
  }

  /**
   * Apply operational filters
   */
  private applyOperationalFilters(entities: FederalEntity[], filters: any): FederalEntity[] {
    let filtered = entities;

    if (filters.bySector && filters.bySector.length > 0) {
      filtered = filtered.filter(entity =>
        entity.sectors.some(sector => filters.bySector.includes(sector))
      );
    }

    if (filters.byFunction && filters.byFunction.length > 0) {
      filtered = filtered.filter(entity =>
        entity.functions.some(func => filters.byFunction.includes(func))
      );
    }

    if (filters.byCapability && filters.byCapability.length > 0) {
      filtered = filtered.filter(entity =>
        entity.capabilities.some(cap => filters.byCapability.includes(cap))
      );
    }

    if (filters.byStatus && filters.byStatus.length > 0) {
      filtered = filtered.filter(entity => {
        const status = entity.status.operational ? 'operational' : 'non_operational';
        return filters.byStatus.includes(status);
      });
    }

    if (filters.byHours && filters.byHours.length > 0) {
      filtered = filtered.filter(entity =>
        filters.byHours.includes(entity.status.hours)
      );
    }

    return filtered;
  }

  /**
   * Apply organizational filters
   */
  private applyOrganizationalFilters(entities: FederalEntity[], filters: any): FederalEntity[] {
    let filtered = entities;

    if (filters.byAgency && filters.byAgency.length > 0) {
      filtered = filtered.filter(entity =>
        filters.byAgency.includes(entity.parentAgency)
      );
    }

    if (filters.byOfficeType && filters.byOfficeType.length > 0) {
      filtered = filtered.filter(entity =>
        filters.byOfficeType.includes(entity.type)
      );
    }

    if (filters.byOperationalStatus !== undefined) {
      filtered = filtered.filter(entity =>
        entity.status.operational === filters.byOperationalStatus
      );
    }

    if (filters.byPublicAccess !== undefined) {
      filtered = filtered.filter(entity =>
        entity.status.publicAccess === filters.byPublicAccess
      );
    }

    return filtered;
  }

  /**
   * Apply advanced search criteria
   */
  private applyAdvancedSearch(entities: FederalEntity[], filters: any): FederalEntity[] {
    let filtered = entities;

    if (filters.capabilities) {
      const capTokens = filters.capabilities.toLowerCase().split(/\s+/);
      filtered = filtered.filter(entity =>
        capTokens.some(token =>
          entity.capabilities.some(cap => cap.toLowerCase().includes(token))
        )
      );
    }

    if (filters.specialties) {
      const specTokens = filters.specialties.toLowerCase().split(/\s+/);
      filtered = filtered.filter(entity =>
        specTokens.some(token =>
          entity.jurisdiction.specialties.some(spec => spec.toLowerCase().includes(token))
        )
      );
    }

    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase().split(/\s+/);
      filtered = filtered.filter(entity => {
        const entityText = [
          entity.name,
          entity.jurisdiction.coverage,
          ...(entity.metadata?.specialPrograms || []),
          ...(entity.metadata?.notes ? [entity.metadata.notes] : [])
        ].join(' ').toLowerCase();

        return keywords.some(keyword => entityText.includes(keyword));
      });
    }

    return filtered;
  }

  /**
   * Generate map clusters for visualization
   */
  private generateClusters(entities: FederalEntity[], zoomLevel: number = 5): MapCluster[] {
    const clusters: MapCluster[] = [];
    const gridSize = this.getGridSize(zoomLevel);
    const clusteredEntities = new Set<string>();

    entities.forEach(entity => {
      if (clusteredEntities.has(entity.id)) return;

      const nearbyEntities = entities.filter(other => {
        if (clusteredEntities.has(other.id) || other.id === entity.id) return false;
        
        const distance = this.calculateDistance(
          entity.location.coordinates.lat, entity.location.coordinates.lng,
          other.location.coordinates.lat, other.location.coordinates.lng
        );
        
        return distance <= gridSize;
      });

      const clusterEntities = [entity, ...nearbyEntities];
      clusterEntities.forEach(e => clusteredEntities.add(e.id));

      // Determine primary sector/function for cluster
      const sectorCounts: Record<string, number> = {};
      const functionCounts: Record<string, number> = {};

      clusterEntities.forEach(e => {
        e.sectors.forEach(sector => {
          sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
        });
        e.functions.forEach(func => {
          functionCounts[func] = (functionCounts[func] || 0) + 1;
        });
      });

      const primarySector = Object.keys(sectorCounts).reduce((a, b) => 
        sectorCounts[a] > sectorCounts[b] ? a : b
      ) as CriticalInfrastructureSector;

      const primaryFunction = Object.keys(functionCounts).reduce((a, b) => 
        functionCounts[a] > functionCounts[b] ? a : b
      ) as OperationalFunction;

      clusters.push({
        coordinates: {
          lat: clusterEntities.reduce((sum, e) => sum + e.location.coordinates.lat, 0) / clusterEntities.length,
          lng: clusterEntities.reduce((sum, e) => sum + e.location.coordinates.lng, 0) / clusterEntities.length
        },
        count: clusterEntities.length,
        entities: clusterEntities.map(e => e.id),
        primarySector,
        primaryFunction,
        zoomLevel
      });
    });

    return clusters;
  }

  /**
   * Calculate distance between two coordinates in miles
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Get grid size for clustering based on zoom level
   */
  private getGridSize(zoomLevel: number): number {
    const baseSizes = [1000, 500, 200, 100, 50, 25, 12, 6, 3, 1.5];
    return baseSizes[Math.min(zoomLevel, baseSizes.length - 1)] || 1;
  }

  /**
   * Get entities by proximity to a location
   */
  public getEntitiesByProximity(lat: number, lng: number, radiusMiles: number = 50): FederalEntity[] {
    return this.entities.filter(entity => {
      const distance = this.calculateDistance(
        lat, lng,
        entity.location.coordinates.lat, entity.location.coordinates.lng
      );
      return distance <= radiusMiles;
    }).sort((a, b) => {
      const distA = this.calculateDistance(lat, lng, a.location.coordinates.lat, a.location.coordinates.lng);
      const distB = this.calculateDistance(lat, lng, b.location.coordinates.lat, b.location.coordinates.lng);
      return distA - distB;
    });
  }

  /**
   * Get autocomplete suggestions for search
   */
  public getSearchSuggestions(query: string, limit: number = 10): string[] {
    if (!query || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();

    // Search entity names
    this.entities.forEach(entity => {
      if (entity.name.toLowerCase().includes(queryLower)) {
        suggestions.add(entity.name);
      }
      
      // Add city and state
      if (entity.location.city.toLowerCase().includes(queryLower)) {
        suggestions.add(`${entity.location.city}, ${entity.location.state}`);
      }
      
      // Add agency names
      if (entity.parentAgency.toLowerCase().includes(queryLower)) {
        suggestions.add(entity.parentAgency);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get comprehensive statistics
   */
  public getSearchStatistics() {
    const stats = {
      totalEntities: this.entities.length,
      byAgency: {} as Record<FederalAgency, number>,
      bySector: {} as Record<CriticalInfrastructureSector, number>,
      byFunction: {} as Record<OperationalFunction, number>,
      byState: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      operational247: 0,
      publicAccess: 0,
      averageCapabilities: 0
    };

    this.entities.forEach(entity => {
      // Agency counts
      stats.byAgency[entity.parentAgency] = (stats.byAgency[entity.parentAgency] || 0) + 1;
      
      // Sector counts
      entity.sectors.forEach(sector => {
        stats.bySector[sector] = (stats.bySector[sector] || 0) + 1;
      });
      
      // Function counts
      entity.functions.forEach(func => {
        stats.byFunction[func] = (stats.byFunction[func] || 0) + 1;
      });
      
      // State counts
      stats.byState[entity.location.state] = (stats.byState[entity.location.state] || 0) + 1;
      
      // Type counts
      stats.byType[entity.type] = (stats.byType[entity.type] || 0) + 1;
      
      // Operational stats
      if (entity.status.hours === '24/7') stats.operational247++;
      if (entity.status.publicAccess) stats.publicAccess++;
      
      stats.averageCapabilities += entity.capabilities.length;
    });

    stats.averageCapabilities = stats.averageCapabilities / this.entities.length;

    return stats;
  }
}

// Global search engine instance
export const searchEngine = new FederalEntitySearchEngine();

// Convenience functions
export const searchFederalEntities = (criteria: SearchCapabilities): EntitySearchResponse => {
  return searchEngine.search(criteria);
};

export const getEntitySuggestions = (query: string): string[] => {
  return searchEngine.getSearchSuggestions(query);
};

export const getEntitiesByProximity = (lat: number, lng: number, radius?: number): FederalEntity[] => {
  return searchEngine.getEntitiesByProximity(lat, lng, radius);
};

export const getSearchStatistics = () => {
  return searchEngine.getSearchStatistics();
};