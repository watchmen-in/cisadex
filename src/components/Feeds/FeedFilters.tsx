import React, { useState } from 'react';
import { FeedTopic } from '../../services/topicDetectionService';

interface FilterOptions {
  topics: FeedTopic[];
  sources: string[];
  severities: string[];
}

interface FilterState {
  topics: string[];
  sources: string[];
  severities: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery: string;
}

interface FeedFiltersProps {
  filters: FilterState;
  options: FilterOptions;
  onChange: (filters: Partial<FilterState>) => void;
  clustersCount: number;
  totalItems: number;
}

const FeedFilters: React.FC<FeedFiltersProps> = ({
  filters,
  options,
  onChange,
  clustersCount,
  totalItems
}) => {
  const [expandedSections, setExpandedSections] = useState({
    topics: true,
    sources: false,
    severities: true,
    dateRange: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle multi-select changes
  const handleMultiSelectChange = (
    field: 'topics' | 'sources' | 'severities',
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[field];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onChange({ [field]: newValues });
  };

  // Handle date range changes
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : null;
    onChange({
      dateRange: {
        ...filters.dateRange,
        [field]: date
      }
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onChange({
      topics: [],
      sources: [],
      severities: [],
      dateRange: { start: null, end: null },
      searchQuery: ''
    });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return filters.topics.length + 
           filters.sources.length + 
           filters.severities.length + 
           (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
           (filters.searchQuery ? 1 : 0);
  };

  // Get severity styling
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-bg1 border border-b1 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-t1">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-brand hover:text-brand/80 transition-colors"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Results summary */}
      <div className="p-3 bg-bg2 rounded-lg text-sm">
        <div className="text-t1 font-medium">{clustersCount} topic groups</div>
        <div className="text-t2">{totalItems} total items</div>
      </div>

      {/* Topics Filter */}
      <div className="border-b border-b1 pb-4">
        <button
          onClick={() => toggleSection('topics')}
          className="flex items-center justify-between w-full text-left mb-3 hover:text-brand transition-colors"
        >
          <span className="font-medium text-t1">Topics</span>
          <span className={`transition-transform ${expandedSections.topics ? 'rotate-90' : ''}`}>
            ▶
          </span>
        </button>
        
        {expandedSections.topics && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {options.topics.map(topic => (
              <label
                key={topic.id}
                className="flex items-start gap-3 p-2 hover:bg-bg2 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.topics.includes(topic.id)}
                  onChange={(e) => handleMultiSelectChange('topics', topic.id, e.target.checked)}
                  className="mt-1 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{topic.icon}</span>
                    <span className="text-sm font-medium text-t1">{topic.name}</span>
                    <span className={`px-1 py-0.5 text-xs rounded ${getSeverityStyle(topic.severity)}`}>
                      {topic.severity}
                    </span>
                  </div>
                  <p className="text-xs text-t2 line-clamp-2">{topic.description}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Severity Filter */}
      <div className="border-b border-b1 pb-4">
        <button
          onClick={() => toggleSection('severities')}
          className="flex items-center justify-between w-full text-left mb-3 hover:text-brand transition-colors"
        >
          <span className="font-medium text-t1">Severity</span>
          <span className={`transition-transform ${expandedSections.severities ? 'rotate-90' : ''}`}>
            ▶
          </span>
        </button>
        
        {expandedSections.severities && (
          <div className="space-y-2">
            {options.severities.map(severity => (
              <label
                key={severity}
                className="flex items-center gap-3 p-2 hover:bg-bg2 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.severities.includes(severity)}
                  onChange={(e) => handleMultiSelectChange('severities', severity, e.target.checked)}
                  className="rounded"
                />
                <span className={`px-2 py-1 text-xs font-medium rounded border flex-1 ${getSeverityStyle(severity)}`}>
                  {severity}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sources Filter */}
      <div className="border-b border-b1 pb-4">
        <button
          onClick={() => toggleSection('sources')}
          className="flex items-center justify-between w-full text-left mb-3 hover:text-brand transition-colors"
        >
          <span className="font-medium text-t1">Sources</span>
          <span className="text-xs text-t2">({options.sources.length})</span>
          <span className={`transition-transform ${expandedSections.sources ? 'rotate-90' : ''}`}>
            ▶
          </span>
        </button>
        
        {expandedSections.sources && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {options.sources.map(source => {
              const getSourceIcon = (sourceName: string) => {
                const s = sourceName.toLowerCase();
                if (s.includes('cisa')) return '🛡️';
                if (s.includes('fbi')) return '🕵️';
                if (s.includes('nist')) return '📊';
                if (s.includes('cert')) return '⚠️';
                if (s.includes('microsoft')) return '🪟';
                if (s.includes('google')) return '🔍';
                if (s.includes('aws')) return '☁️';
                return '📡';
              };

              return (
                <label
                  key={source}
                  className="flex items-center gap-2 p-1 hover:bg-bg2 rounded cursor-pointer transition-colors text-sm"
                >
                  <input
                    type="checkbox"
                    checked={filters.sources.includes(source)}
                    onChange={(e) => handleMultiSelectChange('sources', source, e.target.checked)}
                    className="rounded"
                  />
                  <span>{getSourceIcon(source)}</span>
                  <span className="text-t1 truncate">{source}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Range Filter */}
      <div>
        <button
          onClick={() => toggleSection('dateRange')}
          className="flex items-center justify-between w-full text-left mb-3 hover:text-brand transition-colors"
        >
          <span className="font-medium text-t1">Date Range</span>
          <span className={`transition-transform ${expandedSections.dateRange ? 'rotate-90' : ''}`}>
            ▶
          </span>
        </button>
        
        {expandedSections.dateRange && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-t2 mb-1">From</label>
              <input
                type="date"
                value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-sm text-t1 focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-t2 mb-1">To</label>
              <input
                type="date"
                value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-sm text-t1 focus:border-brand focus:outline-none"
              />
            </div>
            {(filters.dateRange.start || filters.dateRange.end) && (
              <button
                onClick={() => onChange({ dateRange: { start: null, end: null } })}
                className="text-xs text-brand hover:text-brand/80 transition-colors"
              >
                Clear date range
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick filter presets */}
      <div className="pt-4 border-t border-b1">
        <h4 className="text-sm font-medium text-t1 mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <button
            onClick={() => onChange({ severities: ['CRITICAL'] })}
            className="w-full text-left px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 rounded transition-colors"
          >
            🚨 Critical threats only
          </button>
          <button
            onClick={() => onChange({ 
              dateRange: { 
                start: new Date(Date.now() - 24 * 60 * 60 * 1000), 
                end: new Date() 
              } 
            })}
            className="w-full text-left px-2 py-1 text-xs text-t2 hover:bg-bg2 rounded transition-colors"
          >
            ⏰ Last 24 hours
          </button>
          <button
            onClick={() => onChange({ 
              sources: options.sources.filter(s => 
                s.toLowerCase().includes('cisa') || 
                s.toLowerCase().includes('fbi') || 
                s.toLowerCase().includes('nist')
              )
            })}
            className="w-full text-left px-2 py-1 text-xs text-t2 hover:bg-bg2 rounded transition-colors"
          >
            🏛️ Government sources
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedFilters;