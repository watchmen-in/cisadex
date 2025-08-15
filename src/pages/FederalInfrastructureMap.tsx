/**
 * Main Federal Infrastructure Mapping Page
 * Comprehensive interface combining search, map, and analytics for federal cybersecurity entities
 */

import React, { useState, useEffect, useCallback } from 'react';
import FederalEntityMap from '../components/FederalEntityMap';
import FederalEntitySearch from '../components/FederalEntitySearch';
import { 
  FederalEntity, 
  EntitySearchResponse, 
  SearchCapabilities 
} from '../types/federalEntity';
import { getSearchStatistics } from '../utils/federalEntitySearch';
import { getRelationshipStatistics, getCoordinationNetwork, getRelatedEntities } from '../utils/federalEntityRelationships';
import { federalEntitiesDatabase } from '../data/federalEntities';

export default function FederalInfrastructureMap() {
  const [searchCriteria, setSearchCriteria] = useState<SearchCapabilities>({});
  const [searchResults, setSearchResults] = useState<EntitySearchResponse | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<FederalEntity | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('split');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial statistics
  const [stats, setStats] = useState(() => getSearchStatistics());
  const [relationshipStats, setRelationshipStats] = useState(() => getRelationshipStatistics());

  // Handle search results update
  const handleSearchResults = useCallback((results: EntitySearchResponse) => {
    setSearchResults(results);
  }, []);

  // Handle entity selection
  const handleEntitySelect = useCallback((entity: FederalEntity) => {
    setSelectedEntity(entity);
  }, []);

  // Handle search criteria changes
  const handleSearchCriteriaChange = useCallback((criteria: SearchCapabilities) => {
    setSearchCriteria(criteria);
  }, []);

  // Quick filters for common searches
  const quickFilters = [
    {
      label: 'CISA Regional Offices',
      criteria: {
        organizational: { byAgency: ['CISA'] },
        operational: { byFunction: ['incident_response'] }
      }
    },
    {
      label: 'FBI Field Offices',
      criteria: {
        organizational: { byAgency: ['FBI'] },
        operational: { byFunction: ['law_enforcement', 'cyber_forensics'] }
      }
    },
    {
      label: 'DOE Laboratories',
      criteria: {
        organizational: { 
          byAgency: ['DOE'],
          byOfficeType: ['laboratory'] 
        }
      }
    },
    {
      label: 'Emergency Operations',
      criteria: {
        operational: { byFunction: ['emergency_management', 'incident_response'] },
        organizational: { byOperationalStatus: true }
      }
    },
    {
      label: 'Cyber Capabilities',
      criteria: {
        operational: { 
          byFunction: ['cyber_forensics', 'threat_hunting', 'vulnerability_assessment'],
          byCapability: ['cyber_forensics', 'malware_analysis', 'digital_forensics']
        }
      }
    },
    {
      label: 'Critical Infrastructure',
      criteria: {
        operational: { 
          bySector: ['energy', 'transportation_systems', 'communications', 'water_wastewater']
        }
      }
    }
  ];

  // Analytics data for selected entity
  const getEntityAnalytics = (entity: FederalEntity) => {
    const relatedEntities = getRelatedEntities(entity.id);
    const coordinationNetwork = getCoordinationNetwork(entity.id);
    
    return {
      relatedCount: relatedEntities.length,
      networkSize: coordinationNetwork.length,
      sectors: entity.sectors.length,
      functions: entity.functions.length,
      capabilities: entity.capabilities.length,
      jurisdiction: entity.jurisdiction.states.length
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Federal Cybersecurity Infrastructure Map
              </h1>
              <div className="ml-4 text-sm text-gray-500">
                {federalEntitiesDatabase.length} entities mapped
              </div>
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'split' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Split
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  List
                </button>
              </div>
              
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  showAnalytics
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Quick filters:</span>
            {quickFilters.map((filter, index) => (
              <button
                key={index}
                onClick={() => setSearchCriteria(filter.criteria)}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                {filter.label}
              </button>
            ))}
            <button
              onClick={() => setSearchCriteria({})}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Panel - Always visible on left */}
          <div className={`${viewMode === 'map' ? 'lg:col-span-1' : viewMode === 'list' ? 'lg:col-span-4' : 'lg:col-span-1'}`}>
            <FederalEntitySearch
              onResultsChange={handleSearchResults}
              onEntitySelect={handleEntitySelect}
              initialCriteria={searchCriteria}
              showAdvancedFilters={true}
              className="h-full"
            />
          </div>

          {/* Map Panel */}
          {(viewMode === 'map' || viewMode === 'split') && (
            <div className={`${viewMode === 'map' ? 'lg:col-span-3' : 'lg:col-span-3'}`}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-[600px]">
                <FederalEntityMap
                  searchCriteria={searchCriteria}
                  onEntitySelect={handleEntitySelect}
                  onSearchUpdate={handleSearchResults}
                  className="w-full h-full rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="mt-6">
            <AnalyticsPanel 
              stats={stats}
              relationshipStats={relationshipStats}
              selectedEntity={selectedEntity}
              searchResults={searchResults}
            />
          </div>
        )}

        {/* Selected Entity Details */}
        {selectedEntity && (
          <div className="mt-6">
            <SelectedEntityPanel 
              entity={selectedEntity}
              analytics={getEntityAnalytics(selectedEntity)}
              onClose={() => setSelectedEntity(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Analytics Panel Component
interface AnalyticsPanelProps {
  stats: any;
  relationshipStats: any;
  selectedEntity: FederalEntity | null;
  searchResults: EntitySearchResponse | null;
}

function AnalyticsPanel({ stats, relationshipStats, selectedEntity, searchResults }: AnalyticsPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Coverage Statistics */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Coverage Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Entities:</span>
              <span className="font-medium">{stats.totalEntities}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">24/7 Operations:</span>
              <span className="font-medium">{stats.operational247}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Public Access:</span>
              <span className="font-medium">{stats.publicAccess}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg. Capabilities:</span>
              <span className="font-medium">{stats.averageCapabilities.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Agency Distribution */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Top Agencies</h3>
          <div className="space-y-2">
            {Object.entries(stats.byAgency)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([agency, count]) => (
                <div key={agency} className="flex justify-between text-sm">
                  <span className="text-gray-600">{agency}:</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Sector Distribution */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Top Sectors</h3>
          <div className="space-y-2">
            {Object.entries(stats.bySector)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([sector, count]) => (
                <div key={sector} className="flex justify-between text-sm">
                  <span className="text-gray-600">{sector.replace(/_/g, ' ')}:</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Relationship Statistics */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Coordination</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Relationships:</span>
              <span className="font-medium">{relationshipStats.totalRelationships}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg. Connections:</span>
              <span className="font-medium">{relationshipStats.averageConnections.toFixed(1)}</span>
            </div>
            {searchResults && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Search Results:</span>
                <span className="font-medium">{searchResults.entities.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Selected Entity Panel Component
interface SelectedEntityPanelProps {
  entity: FederalEntity;
  analytics: any;
  onClose: () => void;
}

function SelectedEntityPanel({ entity, analytics, onClose }: SelectedEntityPanelProps) {
  const relatedEntities = getRelatedEntities(entity.id);
  const coordinationNetwork = getCoordinationNetwork(entity.id);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{entity.name}</h2>
          <p className="text-sm text-gray-600">{entity.parentAgency} • {entity.type.replace(/_/g, ' ')}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entity Details */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location & Contact */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Location & Contact</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <div className="mt-1">{entity.location.address}</div>
                    <div>{entity.location.city}, {entity.location.state} {entity.location.zipCode}</div>
                  </div>
                  {entity.contact.phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <div className="mt-1">{entity.contact.phone}</div>
                    </div>
                  )}
                  {entity.contact.website && (
                    <div>
                      <span className="text-gray-600">Website:</span>
                      <div className="mt-1">
                        <a href={entity.contact.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          {entity.contact.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Jurisdiction */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Jurisdiction</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Coverage:</span>
                    <div className="mt-1">{entity.jurisdiction.coverage}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">States:</span>
                    <div className="mt-1">{entity.jurisdiction.states.join(', ')}</div>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Capabilities</h3>
                <div className="flex flex-wrap gap-1">
                  {entity.capabilities.map((capability) => (
                    <span key={capability} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {capability.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sectors & Functions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sectors & Functions</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 text-xs">Sectors:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entity.sectors.map((sector) => (
                        <span key={sector} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {sector.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Functions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entity.functions.map((func) => (
                        <span key={func} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {func.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Relationships & Analytics */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Coordination Network</h3>
            
            {/* Quick Stats */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{analytics.relatedCount}</div>
                  <div className="text-xs text-gray-600">Direct Relations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{analytics.networkSize}</div>
                  <div className="text-xs text-gray-600">Network Size</div>
                </div>
              </div>
            </div>

            {/* Related Entities */}
            {relatedEntities.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-2">DIRECT COORDINATION</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {relatedEntities.slice(0, 5).map((related) => (
                    <div key={related.id} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-900 font-medium">{related.name}</span>
                    </div>
                  ))}
                  {relatedEntities.length > 5 && (
                    <div className="text-xs text-gray-500">
                      +{relatedEntities.length - 5} more entities
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}