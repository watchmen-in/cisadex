/**
 * Advanced Federal Entity Search Interface
 * Comprehensive search with filters, autocomplete, and results display
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  SearchCapabilities, 
  EntitySearchResponse, 
  FederalEntity,
  CriticalInfrastructureSector,
  OperationalFunction,
  FederalAgency,
  EntityType
} from '../types/federalEntity';
import { searchFederalEntities, getEntitySuggestions, getSearchStatistics } from '../utils/federalEntitySearch';
import { getIconInfo, determineEntityIcon } from '../utils/federalEntityIcons';

interface FederalEntitySearchProps {
  onResultsChange?: (results: EntitySearchResponse) => void;
  onEntitySelect?: (entity: FederalEntity) => void;
  initialCriteria?: SearchCapabilities;
  showAdvancedFilters?: boolean;
  className?: string;
}

export default function FederalEntitySearch({
  onResultsChange,
  onEntitySelect,
  initialCriteria,
  showAdvancedFilters = true,
  className = ''
}: FederalEntitySearchProps) {
  const [searchCriteria, setSearchCriteria] = useState<SearchCapabilities>(initialCriteria || {});
  const [textSearch, setTextSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<EntitySearchResponse | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Search statistics for filter options
  const searchStats = useMemo(() => getSearchStatistics(), []);

  // Perform search when criteria changes
  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      
      const criteria: SearchCapabilities = {
        ...searchCriteria,
        textSearch: textSearch.trim() || undefined
      };

      try {
        const searchResults = searchFederalEntities(criteria);
        setResults(searchResults);
        
        if (onResultsChange) {
          onResultsChange(searchResults);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchCriteria, textSearch, onResultsChange]);

  // Handle text search input
  const handleTextSearchChange = (value: string) => {
    setTextSearch(value);
    
    if (value.length >= 2) {
      const newSuggestions = getEntitySuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setTextSearch(suggestion);
    setShowSuggestions(false);
  };

  // Update filter criteria
  const updateFilter = (category: keyof SearchCapabilities, key: string, values: any) => {
    setSearchCriteria(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: values
      }
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchCriteria({});
    setTextSearch('');
  };

  // Filter categories and options
  const filterCategories = {
    sectors: {
      title: 'Critical Infrastructure Sectors',
      options: Object.keys(searchStats.bySector) as CriticalInfrastructureSector[],
      counts: searchStats.bySector
    },
    functions: {
      title: 'Operational Functions',
      options: Object.keys(searchStats.byFunction) as OperationalFunction[],
      counts: searchStats.byFunction
    },
    agencies: {
      title: 'Federal Agencies',
      options: Object.keys(searchStats.byAgency) as FederalAgency[],
      counts: searchStats.byAgency
    },
    states: {
      title: 'States & Territories',
      options: Object.keys(searchStats.byState).sort(),
      counts: searchStats.byState
    }
  };

  return (
    <div className={`federal-entity-search ${className}`}>
      {/* Search Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Text Search */}
          <div className="flex-1 relative">
            <div className="relative">
              <input
                type="text"
                value={textSearch}
                onChange={(e) => handleTextSearchChange(e.target.value)}
                placeholder="Search entities by name, location, agency, or capability..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg font-medium transition-colors ${
                showFilters 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Filters
              </span>
            </button>
            
            <button
              onClick={clearFilters}
              className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {results && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Found <span className="font-semibold text-gray-900">{results.totalCount}</span> entities
              {results.searchTime && (
                <span> in {results.searchTime.toFixed(0)}ms</span>
              )}
            </div>
            
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Searching...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {Object.entries(filterCategories).map(([key, category]) => (
              <div key={key}>
                <h3 className="font-semibold text-gray-900 mb-3">{category.title}</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {category.options.map((option) => {
                    const isSelected = searchCriteria.operational?.[`by${key.charAt(0).toUpperCase() + key.slice(1, -1)}` as keyof typeof searchCriteria.operational]?.includes(option as any) ||
                                     searchCriteria.organizational?.[`by${key.charAt(0).toUpperCase() + key.slice(1, -1)}` as keyof typeof searchCriteria.organizational]?.includes(option as any) ||
                                     searchCriteria.geographic?.[`by${key.charAt(0).toUpperCase() + key.slice(1, -1)}` as keyof typeof searchCriteria.geographic]?.includes(option);
                    
                    return (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected || false}
                          onChange={(e) => {
                            const currentValues = searchCriteria.operational?.[`by${key.charAt(0).toUpperCase() + key.slice(1, -1)}` as keyof typeof searchCriteria.operational] as any[] ||
                                                searchCriteria.organizational?.[`by${key.charAt(0).toUpperCase() + key.slice(1, -1)}` as keyof typeof searchCriteria.organizational] as any[] ||
                                                searchCriteria.geographic?.[`by${key.charAt(0).toUpperCase() + key.slice(1, -1)}` as keyof typeof searchCriteria.geographic] as any[] || [];
                            
                            let newValues;
                            if (e.target.checked) {
                              newValues = [...currentValues, option];
                            } else {
                              newValues = currentValues.filter((v: any) => v !== option);
                            }
                            
                            const filterCategory = key === 'states' ? 'geographic' : 
                                                 key === 'agencies' || key.includes('Type') ? 'organizational' : 'operational';
                            const filterKey = `by${key.charAt(0).toUpperCase() + key.slice(1, -1)}`;
                            
                            updateFilter(filterCategory, filterKey, newValues);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex-1">
                          {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {category.counts[option]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Additional Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Operational Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operational Status
                </label>
                <select
                  value={searchCriteria.organizational?.byOperationalStatus?.toString() || 'all'}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? undefined : e.target.value === 'true';
                    updateFilter('organizational', 'byOperationalStatus', value);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="true">Operational</option>
                  <option value="false">Non-Operational</option>
                </select>
              </div>

              {/* Public Access */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Access
                </label>
                <select
                  value={searchCriteria.organizational?.byPublicAccess?.toString() || 'all'}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? undefined : e.target.value === 'true';
                    updateFilter('organizational', 'byPublicAccess', value);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="true">Public Access</option>
                  <option value="false">Restricted Access</option>
                </select>
              </div>

              {/* Operating Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operating Hours
                </label>
                <select
                  value={searchCriteria.operational?.byHours?.[0] || 'all'}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? undefined : [e.target.value];
                    updateFilter('operational', 'byHours', value);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Hours</option>
                  <option value="24/7">24/7</option>
                  <option value="Business Hours">Business Hours</option>
                  <option value="On-Call">On-Call</option>
                  <option value="Emergency Only">Emergency Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {results.entities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m-6-8h6m-6 4h6" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No entities found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              results.entities.map((entity, index) => (
                <EntityResultCard 
                  key={entity.id} 
                  entity={entity} 
                  onSelect={onEntitySelect}
                  index={index}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual entity result card component
interface EntityResultCardProps {
  entity: FederalEntity;
  onSelect?: (entity: FederalEntity) => void;
  index: number;
}

function EntityResultCard({ entity, onSelect, index }: EntityResultCardProps) {
  const iconConfig = determineEntityIcon(entity);
  const iconInfo = getIconInfo(iconConfig);

  return (
    <div 
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onSelect?.(entity)}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start space-x-4">
        {/* Entity Icon */}
        <div 
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm"
          style={{ backgroundColor: iconInfo.color }}
        >
          {iconInfo.emoji}
        </div>

        {/* Entity Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {entity.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {entity.parentAgency} • {entity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            
            <div className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              entity.status.operational 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {entity.status.operational ? '✅ Operational' : '❌ Offline'}
            </div>
          </div>

          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {entity.location.city}, {entity.location.state}
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <p className="line-clamp-2">{entity.jurisdiction.coverage}</p>
          </div>

          {/* Sectors and Functions */}
          <div className="mt-3 flex flex-wrap gap-1">
            {entity.sectors.slice(0, 3).map((sector) => (
              <span key={sector} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {sector.replace(/_/g, ' ')}
              </span>
            ))}
            {entity.sectors.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{entity.sectors.length - 3} more
              </span>
            )}
          </div>

          {/* Contact Information */}
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            {entity.contact.phone && (
              <div className="flex items-center">
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {entity.contact.phone}
              </div>
            )}
            
            <div className="flex items-center">
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {entity.status.hours}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}