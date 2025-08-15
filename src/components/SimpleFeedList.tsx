/**
 * SimpleFeedList - Streamlined replacement for FeedDashboard
 * Focuses on performance and clean UI without complex clustering
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useFeeds } from '../hooks/useFeeds';
import { FeedItem } from '../services/SimpleFeedService';

interface FeedCardProps {
  item: FeedItem;
  onClick?: (item: FeedItem) => void;
}

const FeedCard: React.FC<FeedCardProps> = ({ item, onClick }) => {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL': return 'border-l-red-500 bg-red-50/50';
      case 'HIGH': return 'border-l-orange-500 bg-orange-50/50';
      case 'MEDIUM': return 'border-l-yellow-500 bg-yellow-50/50';
      case 'LOW': return 'border-l-green-500 bg-green-50/50';
      default: return 'border-l-gray-300 bg-gray-50/50';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div 
      className={`border-l-4 ${getSeverityColor(item.severity)} bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}
      onClick={() => onClick?.(item)}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {item.title}
          </h3>
          
          {item.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500">
              {item.source}
            </span>
            
            <span className="text-gray-400">•</span>
            
            <span className="text-gray-500">
              {formatDate(item.date)}
            </span>

            {item.severity && (
              <>
                <span className="text-gray-400">•</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  item.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  item.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.severity}
                </span>
              </>
            )}

            {item.cve && (
              <>
                <span className="text-gray-400">•</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                  {item.cve}
                </span>
              </>
            )}
          </div>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map(tag => (
                <span 
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <button 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            window.open(item.link, '_blank', 'noopener,noreferrer');
          }}
        >
          View →
        </button>
      </div>
    </div>
  );
};

interface SimpleSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SimpleSearch: React.FC<SimpleSearchProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search feeds..."}
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="absolute left-3 top-2.5 text-gray-400">
        🔍
      </div>
    </div>
  );
};

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
      active
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label} {count !== undefined && `(${count})`}
  </button>
);

const SimpleFeedList: React.FC = () => {
  const {
    items,
    loading,
    error,
    lastUpdated,
    filters,
    updateFilters,
    clearFilters,
    filterOptions,
    refresh,
    stats,
    autoRefresh,
    setAutoRefresh
  } = useFeeds();

  const [displayCount, setDisplayCount] = useState(20);
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'source'>('date');

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...items];
    
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
      case 'severity':
        const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return sorted.sort((a, b) => {
          const aScore = severityOrder[a.severity as keyof typeof severityOrder] || 0;
          const bScore = severityOrder[b.severity as keyof typeof severityOrder] || 0;
          return bScore - aScore;
        });
      case 'source':
        return sorted.sort((a, b) => a.source.localeCompare(b.source));
      default:
        return sorted;
    }
  }, [items, sortBy]);

  const displayedItems = sortedItems.slice(0, displayCount);
  const hasMoreItems = sortedItems.length > displayCount;

  const handleItemClick = useCallback((item: FeedItem) => {
    // Optional: Add item click tracking or actions
    console.log('Feed item clicked:', item);
  }, []);

  const loadMore = useCallback(() => {
    setDisplayCount(prev => prev + 20);
  }, []);

  const toggleFilter = useCallback((type: keyof typeof filters, value: string) => {
    const currentValues = filters[type] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilters({ [type]: newValues });
  }, [filters, updateFilters]);

  if (loading && !items.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Failed to Load Feeds</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cybersecurity Feeds</h1>
            <p className="text-gray-600">
              {stats.total} items from {stats.sources} sources
              {lastUpdated && (
                <span className="ml-2">
                  • Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            
            <button
              onClick={refresh}
              disabled={loading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '↻' : '🔄'} Refresh
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{stats.last24h}</div>
            <div className="text-sm text-gray-600">Last 24h</div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">{stats.withCVE}</div>
            <div className="text-sm text-gray-600">With CVEs</div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">{stats.sources}</div>
            <div className="text-sm text-gray-600">Sources</div>
          </div>
        </div>

        {/* Search */}
        <SimpleSearch
          value={filters.searchQuery}
          onChange={(value) => updateFilters({ searchQuery: value })}
          placeholder="Search feeds, CVEs, sources..."
        />
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Sort and Clear */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="date">Date</option>
              <option value="severity">Severity</option>
              <option value="source">Source</option>
            </select>
          </div>
          
          {(filters.searchQuery || filters.categories.length || filters.severities.length || filters.sources.length) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Category Filters */}
        {filterOptions.categories.length > 0 && (
          <div>
            <div className="text-sm text-gray-600 mb-2">Categories:</div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.categories.map(category => (
                <FilterChip
                  key={category}
                  label={category.replace('_', ' ')}
                  active={filters.categories.includes(category)}
                  onClick={() => toggleFilter('categories', category)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Severity Filters */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Severity:</div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.severities.map(severity => (
              <FilterChip
                key={severity}
                label={severity}
                active={filters.severities.includes(severity)}
                onClick={() => toggleFilter('severities', severity)}
                count={stats.severityCounts[severity] || 0}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {displayedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No feeds found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters.
            </p>
          </div>
        ) : (
          <>
            {displayedItems.map((item, index) => (
              <FeedCard
                key={`${item.id}-${index}`}
                item={item}
                onClick={handleItemClick}
              />
            ))}

            {/* Load More */}
            {hasMoreItems && (
              <div className="text-center py-6">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Load More ({sortedItems.length - displayCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleFeedList;