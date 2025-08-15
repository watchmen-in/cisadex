import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import MapView from '../components/MapView';
import { loadOffices } from '../utils/dataLoader';
import { federalEntitiesDatabase } from '../data/federalEntities';
import { determineEntityIcon } from '../utils/federalEntityIcons';

export default function Map() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [showFederalEntities, setShowFederalEntities] = useState(true);
  const [federalFilter, setFederalFilter] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  // Process URL parameters for filtering
  useEffect(() => {
    const urlFilters = {};
    const agencyParam = searchParams.get('agency');
    const sectorParam = searchParams.get('sector');
    const functionParam = searchParams.get('function');
    const filterParam = searchParams.get('f');
    
    if (filterParam) {
      try {
        const parsedFilters = JSON.parse(decodeURIComponent(filterParam));
        Object.assign(urlFilters, parsedFilters);
      } catch (error) {
        console.warn('Failed to parse filter parameter:', error);
      }
    }
    
    if (agencyParam) urlFilters.agency = [agencyParam];
    if (sectorParam) urlFilters.sector = [sectorParam];
    if (functionParam) urlFilters.function = [functionParam];
    
    setActiveFilters(urlFilters);
    
    // Set selected agency from filters
    if (urlFilters.agency && urlFilters.agency.length > 0) {
      setSelectedAgency(urlFilters.agency[0]);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    loadOffices().then((data) => {
      setOffices(data);
      setLoading(false);
    });
  }, []);

  // Combine legacy offices with federal entities
  const agencies = ['all', ...new Set([
    ...offices.map(o => o.agency),
    ...federalEntitiesDatabase.map(e => e.parentAgency)
  ])];
  
  const filteredOffices = selectedAgency === 'all' 
    ? offices 
    : offices.filter(o => o.agency === selectedAgency);
    
  // Create comprehensive federal entity filter
  const currentFederalFilter = useMemo(() => {
    if (Object.keys(activeFilters).length === 0 && selectedAgency === 'all') {
      return null;
    }
    
    const filter = {};
    
    // Agency filter
    if (activeFilters.agency) {
      filter.agency = activeFilters.agency;
    } else if (selectedAgency !== 'all') {
      filter.agency = [selectedAgency];
    }
    
    // Sector filter
    if (activeFilters.sector) {
      filter.sectors = activeFilters.sector;
    }
    
    // Function filter
    if (activeFilters.function) {
      filter.functions = activeFilters.function;
    }
    
    return Object.keys(filter).length > 0 ? filter : null;
  }, [activeFilters, selectedAgency]);
    
  // Handle entity selection
  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity);
    console.log('Selected federal entity:', entity);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
    setSelectedAgency('all');
    setSearchParams({});
  };
  
  // Remove specific filter
  const removeFilter = (filterType, filterValue) => {
    const newFilters = { ...activeFilters };
    if (newFilters[filterType]) {
      newFilters[filterType] = newFilters[filterType].filter(v => v !== filterValue);
      if (newFilters[filterType].length === 0) {
        delete newFilters[filterType];
      }
    }
    setActiveFilters(newFilters);
    
    // Update URL
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        newSearchParams.set(key, values[0]); // For simplicity, just use first value
      }
    });
    setSearchParams(newSearchParams);
  };

  return (
    <div className="min-h-screen bg-bg0 text-t1">
      <Header />
      
      {/* Page Header */}
      <div className="bg-bg1 border-b border-b1">
        <div className="mx-auto max-w-[1600px] px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-t1 mb-2">
                Federal Cybersecurity Infrastructure Map
              </h1>
              <p className="text-t2 max-w-2xl mb-3">
                Interactive mapping of federal cybersecurity offices, field locations, and regional 
                coordination centers across CISA, FBI, DHS, and US-CERT facilities nationwide.
              </p>
              
              {/* Active Filters Display */}
              {Object.keys(activeFilters).length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-sm font-medium text-t2">Active Filters:</span>
                  {Object.entries(activeFilters).map(([filterType, filterValues]) => 
                    Array.isArray(filterValues) ? filterValues.map(value => (
                      <div key={`${filterType}-${value}`} className="inline-flex items-center gap-1 px-2 py-1 bg-brand/20 text-brand rounded-full text-xs">
                        <span>{filterType}: {value.replace(/_/g, ' ')}</span>
                        <button 
                          onClick={() => removeFilter(filterType, value)}
                          className="hover:bg-brand/30 rounded-full p-0.5"
                          aria-label={`Remove ${filterType} filter`}
                        >
                          ×
                        </button>
                      </div>
                    )) : null
                  )}
                  <button 
                    onClick={clearFilters}
                    className="text-xs text-t2 hover:text-t1 underline ml-2"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
            
            {/* Enhanced Filtering Controls */}
            <div className="flex items-center gap-4">
              {/* Agency Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-t2">Agency:</label>
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="bg-bg2 border border-b1 rounded-lg px-3 py-2 text-sm text-t1 focus:ring-2 focus:ring-brand focus:border-brand"
                >
                  {agencies.map(agency => (
                    <option key={agency} value={agency}>
                      {agency === 'all' ? 'All Agencies' : agency}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Federal Entities Toggle */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-t2">
                  <input
                    type="checkbox"
                    checked={showFederalEntities}
                    onChange={(e) => setShowFederalEntities(e.target.checked)}
                    className="mr-2 rounded"
                  />
                  Show Federal Infrastructure
                </label>
              </div>
            </div>
          </div>
          
          {/* Enhanced Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00d0ff]"></div>
              <span className="text-t2">
                {filteredOffices.length} legacy office{filteredOffices.length !== 1 ? 's' : ''}
              </span>
            </div>
            {showFederalEntities && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <span className="text-t2">
                  {federalEntitiesDatabase.filter(entity => 
                    selectedAgency === 'all' || entity.parentAgency === selectedAgency
                  ).length} federal entities
                </span>
              </div>
            )}
            <div className="text-t2">
              Coverage: {agencies.length - 1} federal agencies
            </div>
            <div className="text-t2">
              Total Infrastructure: {federalEntitiesDatabase.length + offices.length} entities
            </div>
            <div className="text-t2">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Map Container */}
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="bg-bg1 border border-b1 rounded-xl overflow-hidden shadow-e1 relative">
          <MapView 
            data={filteredOffices} 
            loading={loading}
            showFederalEntities={showFederalEntities}
            federalEntityFilter={currentFederalFilter}
            onEntitySelect={handleEntitySelect}
          />
          
          {/* Enhanced Map Legend */}
          <div className="absolute bottom-4 left-4 bg-bg2/95 backdrop-blur-md border border-b1 rounded-xl p-4 text-xs shadow-lg">
            <div className="font-semibold text-t1 mb-3">Map Legend</div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#00d0ff] border border-white"></div>
                <span className="text-t2">Legacy Offices</span>
              </div>
              {showFederalEntities && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border border-white"></div>
                    <span className="text-t2">Federal Infrastructure</span>
                  </div>
                  <div className="text-t2 text-xs mt-2 pt-2 border-t border-b1">
                    <div>🏛️ Government • 🏭 Critical Infrastructure</div>
                    <div>🕵️ Law Enforcement • 🔬 Research</div>
                  </div>
                </>
              )}
              <div className="text-t2 text-xs mt-2 pt-2 border-t border-b1">
                <div>• Hover for quick details</div>
                <div>• Click for full information</div>
              </div>
            </div>
          </div>
          
          {/* Selected Entity Quick Info */}
          {selectedEntity && (
            <div className="absolute top-4 right-4 bg-bg2/95 backdrop-blur-md border border-b1 rounded-xl p-4 max-w-sm shadow-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedEntity.icon?.emoji || '🏛️'}</span>
                  <div>
                    <h4 className="font-semibold text-t1 text-sm">{selectedEntity.name}</h4>
                    <p className="text-xs text-t2">{selectedEntity.parentAgency}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEntity(null)}
                  className="text-t2 hover:text-t1 ml-2"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs text-t2">
                <div className="mb-1">📍 {selectedEntity.location.city}, {selectedEntity.location.state}</div>
                <div className="mb-1">🎯 {selectedEntity.jurisdiction.coverage}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedEntity.capabilities.slice(0, 3).map(cap => (
                    <span key={cap} className="px-2 py-1 bg-brand/20 text-brand rounded-full text-xs">
                      {cap.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {selectedEntity.capabilities.length > 3 && (
                    <span className="text-xs text-t2">+{selectedEntity.capabilities.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Directory */}
      <div className="mx-auto max-w-[1600px] px-4 pb-8">
        <div className="bg-bg1 border border-b1 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-t1">Infrastructure Directory</h2>
            <div className="text-sm text-t2">
              Showing {filteredOffices.length + (showFederalEntities ? federalEntitiesDatabase.filter(e => selectedAgency === 'all' || e.parentAgency === selectedAgency).length : 0)} entities
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Legacy Offices */}
            {filteredOffices.map((office) => (
              <div key={`office-${office.id}`} className="bg-bg2 border border-b1 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00d0ff]"></div>
                    <h3 className="font-medium text-t1">{office.office_name}</h3>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {office.agency}
                  </span>
                </div>
                <p className="text-sm text-t2 mb-2">
                  {office.city}, {office.state}
                </p>
                <div className="text-xs text-t2">
                  <div>Type: {office.role_type}</div>
                  {office.contact_public?.phone && (
                    <div>Phone: {office.contact_public.phone}</div>
                  )}
                  {office.contact_public?.website && (
                    <a 
                      href={office.contact_public.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand hover:underline"
                    >
                      Website →
                    </a>
                  )}
                </div>
              </div>
            ))}
            
            {/* Federal Entities */}
            {showFederalEntities && federalEntitiesDatabase
              .filter(entity => selectedAgency === 'all' || entity.parentAgency === selectedAgency)
              .slice(0, 12) // Limit display for performance
              .map((entity) => {
                const iconConfig = entity.icon || { emoji: '🏛️' };
                return (
                  <div key={`entity-${entity.id}`} 
                       className="bg-gradient-to-br from-bg2 to-bg2/80 border border-b1 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                       onClick={() => setSelectedEntity(entity)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{iconConfig.emoji}</span>
                        <h3 className="font-medium text-t1 text-sm leading-tight">{entity.name}</h3>
                      </div>
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full whitespace-nowrap">
                        {entity.parentAgency}
                      </span>
                    </div>
                    <p className="text-sm text-t2 mb-2">
                      {entity.location.city}, {entity.location.state}
                    </p>
                    <div className="text-xs text-t2 space-y-1">
                      <div>Coverage: {entity.jurisdiction.coverage}</div>
                      <div className="flex flex-wrap gap-1">
                        {entity.capabilities.slice(0, 2).map(cap => (
                          <span key={cap} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            {cap.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {entity.capabilities.length > 2 && (
                          <span className="text-xs text-t2">+{entity.capabilities.length - 2}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <span className={`w-2 h-2 rounded-full ${
                          entity.status.operational ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span>{entity.status.operational ? 'Operational' : 'Offline'} • {entity.status.hours}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            }
            
            {/* Show more federal entities indicator */}
            {showFederalEntities && federalEntitiesDatabase.filter(entity => 
              selectedAgency === 'all' || entity.parentAgency === selectedAgency
            ).length > 12 && (
              <div className="bg-bg2 border border-b1 rounded-lg p-4 flex items-center justify-center text-center">
                <div className="text-sm text-t2">
                  <div className="font-medium mb-1">
                    +{federalEntitiesDatabase.filter(entity => 
                      selectedAgency === 'all' || entity.parentAgency === selectedAgency
                    ).length - 12} More Entities
                  </div>
                  <div className="text-xs">Use map view to see all entities</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
