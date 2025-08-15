import React, { useState } from 'react';
import { 
  SECTORS, 
  FUNCTIONS, 
  AGENCIES, 
  STATES, 
  THREAT_TYPES, 
  SEVERITY_LEVELS, 
  TIME_RANGES,
  INCIDENT_STATUS,
  Filters 
} from '../../constants/taxonomy';

interface AdvancedFilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  showThreatFilters?: boolean;
  showTimeRange?: boolean;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  icon: string;
  options: string[] | { id: string; label: string; hours?: number | null }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  multiSelect?: boolean;
  searchable?: boolean;
}

function FilterSection({ 
  title, 
  icon, 
  options, 
  selectedValues, 
  onChange, 
  multiSelect = true, 
  searchable = false 
}: FilterSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredOptions = searchable && searchTerm
    ? options.filter((option) => {
        const label = typeof option === 'string' ? option : option.label;
        return label.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : options;

  const handleOptionToggle = (value: string) => {
    if (multiSelect) {
      if (selectedValues.includes(value)) {
        onChange(selectedValues.filter(v => v !== value));
      } else {
        onChange([...selectedValues, value]);
      }
    } else {
      onChange([value]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="border border-b1 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-bg2 hover:bg-bg1 transition-colors flex items-center justify-between text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium">{title}</span>
          {selectedValues.length > 0 && (
            <span className="px-2 py-1 bg-brand text-black text-xs rounded-full">
              {selectedValues.length}
            </span>
          )}
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-bg1">
          {searchable && filteredOptions.length > 10 && (
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-3 bg-bg2 border border-b1 rounded text-t1 placeholder-t2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          )}
          
          {selectedValues.length > 0 && (
            <button
              onClick={clearAll}
              className="mb-3 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Clear All
            </button>
          )}
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => {
              const value = typeof option === 'string' ? option : option.id;
              const label = typeof option === 'string' ? option : option.label;
              const isSelected = selectedValues.includes(value);
              
              return (
                <label
                  key={value}
                  className={`flex items-center gap-2 p-2 rounded hover:bg-bg2 transition-colors cursor-pointer ${
                    isSelected ? 'bg-brand/10 border border-brand/30' : ''
                  }`}
                >
                  <input
                    type={multiSelect ? "checkbox" : "radio"}
                    checked={isSelected}
                    onChange={() => handleOptionToggle(value)}
                    className="rounded"
                  />
                  <span className="text-sm flex-1">{label}</span>
                  {isSelected && <span className="text-brand text-sm">✓</span>}
                </label>
              );
            })}
          </div>
          
          {filteredOptions.length === 0 && searchTerm && (
            <div className="text-center text-t2 text-sm py-4">
              No matching {title.toLowerCase()} found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdvancedFilterPanel({ 
  filters, 
  onChange, 
  showThreatFilters = false, 
  showTimeRange = false,
  className = "" 
}: AdvancedFilterPanelProps) {
  const updateFilter = (key: keyof Filters, values: string[]) => {
    onChange({
      ...filters,
      [key]: values.length > 0 ? values : undefined
    });
  };

  const updateTimeRange = (timeRange: string) => {
    onChange({
      ...filters,
      timeRange: timeRange !== 'all' ? timeRange : undefined
    });
  };

  const clearAllFilters = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>🔍</span>
          Advanced Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Infrastructure Filters */}
      <div className="space-y-3">
        <FilterSection
          title="Agencies"
          icon="🏛️"
          options={AGENCIES}
          selectedValues={filters.agencies || []}
          onChange={(values) => updateFilter('agencies', values)}
          searchable={true}
        />

        <FilterSection
          title="Critical Infrastructure Sectors"
          icon="⚡"
          options={SECTORS}
          selectedValues={filters.sectors || []}
          onChange={(values) => updateFilter('sectors', values)}
          searchable={true}
        />

        <FilterSection
          title="Operational Functions"
          icon="🎯"
          options={FUNCTIONS}
          selectedValues={filters.functions || []}
          onChange={(values) => updateFilter('functions', values)}
          searchable={true}
        />

        <FilterSection
          title="States & Territories"
          icon="📍"
          options={STATES}
          selectedValues={filters.states || []}
          onChange={(values) => updateFilter('states', values)}
          searchable={true}
        />
      </div>

      {/* Threat Intelligence Filters */}
      {showThreatFilters && (
        <div className="space-y-3 pt-4 border-t border-b1">
          <h4 className="font-medium text-t1 flex items-center gap-2">
            <span>🚨</span>
            Threat Intelligence
          </h4>

          <FilterSection
            title="Threat Types"
            icon="💀"
            options={THREAT_TYPES}
            selectedValues={filters.threatTypes || []}
            onChange={(values) => updateFilter('threatTypes', values)}
            searchable={true}
          />

          <FilterSection
            title="Severity Levels"
            icon="⚠️"
            options={SEVERITY_LEVELS}
            selectedValues={filters.severityLevels || []}
            onChange={(values) => updateFilter('severityLevels', values)}
          />

          <FilterSection
            title="Incident Status"
            icon="📊"
            options={INCIDENT_STATUS}
            selectedValues={filters.incidentStatus || []}
            onChange={(values) => updateFilter('incidentStatus', values)}
          />
        </div>
      )}

      {/* Time Range Filter */}
      {showTimeRange && (
        <div className="pt-4 border-t border-b1">
          <FilterSection
            title="Time Range"
            icon="⏰"
            options={TIME_RANGES}
            selectedValues={filters.timeRange ? [filters.timeRange] : []}
            onChange={(values) => updateTimeRange(values[0] || 'all')}
            multiSelect={false}
          />
        </div>
      )}

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-b1">
          <h4 className="font-medium text-t1 mb-3 flex items-center gap-2">
            <span>📋</span>
            Active Filters Summary
          </h4>
          <div className="space-y-2 text-sm">
            {Object.entries(filters).map(([key, values]) => {
              if (!values || (Array.isArray(values) && values.length === 0)) return null;
              
              const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const displayValues = Array.isArray(values) ? values.join(', ') : values;
              
              return (
                <div key={key} className="flex items-center justify-between p-2 bg-bg2 rounded">
                  <span className="font-medium">{displayKey}:</span>
                  <span className="text-t2 truncate ml-2">{displayValues}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}