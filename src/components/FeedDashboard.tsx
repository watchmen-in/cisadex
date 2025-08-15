import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { feedManager } from '../services/feedManager';
import { topicDetectionService, FeedCluster, ClusteredFeedItem } from '../services/topicDetectionService';
import { feedCacheService } from '../services/feedCacheService';
import FeedGroup from './Feeds/FeedGroup';
import FeedFilters from './Feeds/FeedFilters';
import FeedSearch from './Feeds/FeedSearch';
import VirtualizedFeedList, { useVirtualizedPerformance } from './Feeds/VirtualizedFeedList';

interface FeedDashboardState {
  clusters: FeedCluster[];
  allItems: ClusteredFeedItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshing: boolean;
}

interface FilterOptions {
  topics: string[];
  sources: string[];
  severities: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery: string;
}

const FeedDashboard: React.FC = () => {
  const [state, setState] = useState<FeedDashboardState>({
    clusters: [],
    allItems: [],
    loading: true,
    error: null,
    lastUpdated: null,
    refreshing: false
  });

  const [filters, setFilters] = useState<FilterOptions>({
    topics: [],
    sources: [],
    severities: [],
    dateRange: { start: null, end: null },
    searchQuery: ''
  });

  const [viewMode, setViewMode] = useState<'grouped' | 'timeline' | 'grid'>('grouped');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes

  // Performance optimization for large datasets
  const allFeedItems = useMemo(() => 
    filteredClusters.flatMap(cluster => cluster.items), 
    [filteredClusters]
  );
  
  const { shouldVirtualize, recommendedHeight } = useVirtualizedPerformance(allFeedItems.length);

  /**
   * Fetch and process all feeds with caching
   */
  const fetchAllFeeds = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setState(prev => ({ ...prev, refreshing: true }));
    } else {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      // Check cache first (unless refreshing)
      if (!isRefresh) {
        const cached = feedCacheService.getCachedClusteredFeeds(filters);
        if (cached) {
          setState(prev => ({
            ...prev,
            clusters: cached.clusters,
            allItems: cached.allItems,
            loading: false,
            refreshing: false,
            error: null,
            lastUpdated: new Date(cached.timestamp)
          }));
          return;
        }
      }

      // Use enhanced feed manager with clustering
      const result = await feedManager.fetchAllFeedsWithClustering();

      // Cache the results
      feedCacheService.cacheClusteredFeeds(filters, result.clusters, result.allItems);

      setState(prev => ({
        ...prev,
        clusters: result.clusters,
        allItems: result.allItems,
        loading: false,
        refreshing: false,
        error: null,
        lastUpdated: new Date()
      }));

    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: 'Failed to load cybersecurity feeds. Please check your connection and try again.'
      }));
    }
  }, [filters]);

  /**
   * Filter clusters based on current filter options
   */
  const filteredClusters = useMemo(() => {
    if (!state.clusters.length) return [];

    return state.clusters.map(cluster => {
      let filteredItems = cluster.items;

      // Apply topic filter
      if (filters.topics.length > 0) {
        if (!filters.topics.includes(cluster.topicId)) {
          return null; // Filter out entire cluster
        }
      }

      // Apply source filter
      if (filters.sources.length > 0) {
        filteredItems = filteredItems.filter(item =>
          filters.sources.includes(item.source)
        );
      }

      // Apply severity filter
      if (filters.severities.length > 0) {
        filteredItems = filteredItems.filter(item =>
          item.severity && filters.severities.includes(item.severity)
        );
      }

      // Apply date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        filteredItems = filteredItems.filter(item => {
          const itemDate = new Date(item.date);
          if (filters.dateRange.start && itemDate < filters.dateRange.start) return false;
          if (filters.dateRange.end && itemDate > filters.dateRange.end) return false;
          return true;
        });
      }

      // Apply search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query)
        );
      }

      // Return modified cluster or null if no items
      return filteredItems.length > 0 ? {
        ...cluster,
        items: filteredItems,
        totalItems: filteredItems.length
      } : null;
    }).filter(Boolean) as FeedCluster[];
  }, [state.clusters, filters]);

  /**
   * Get available filter options from current data
   */
  const filterOptions = useMemo(() => {
    const topics = topicDetectionService.getAllTopics();
    const sources = [...new Set(state.allItems.map(item => item.source))].sort();
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

    return { topics, sources, severities };
  }, [state.allItems]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Manual refresh
   */
  const handleRefresh = useCallback(() => {
    fetchAllFeeds(true);
  }, [fetchAllFeeds]);

  /**
   * Auto-refresh setup
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        fetchAllFeeds(true);
      }, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, fetchAllFeeds]);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchAllFeeds();
  }, [fetchAllFeeds]);

  /**
   * Calculate dashboard statistics
   */
  const stats = useMemo(() => {
    const totalItems = state.allItems.length;
    const criticalItems = state.allItems.filter(item => item.severity === 'CRITICAL').length;
    const highItems = state.allItems.filter(item => item.severity === 'HIGH').length;
    const uniqueSources = new Set(state.allItems.map(item => item.source)).size;
    const last24h = state.allItems.filter(item => 
      new Date().getTime() - new Date(item.date).getTime() <= 24 * 60 * 60 * 1000
    ).length;

    return {
      totalItems,
      criticalItems,
      highItems,
      uniqueSources,
      last24h
    };
  }, [state.allItems]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-bg0 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-bg2 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-bg2 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-bg2 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-bg0 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-bg1 border border-err/20 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-err mb-2">Failed to Load Feeds</h2>
          <p className="text-t2 mb-4">{state.error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg0">
      {/* Header */}
      <div className="bg-bg1 border-b border-b1 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-t1">Cybersecurity Intelligence Dashboard</h1>
              <p className="text-sm text-t2">
                Real-time threat intelligence from {stats.uniqueSources} sources
                {state.lastUpdated && (
                  <span className="ml-2">
                    • Last updated: {state.lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-bg2 rounded-lg p-1">
                {[
                  { mode: 'grouped', icon: '📊', label: 'Grouped' },
                  { mode: 'timeline', icon: '⏰', label: 'Timeline' },
                  { mode: 'grid', icon: '⊞', label: 'Grid' }
                ].map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === mode
                        ? 'bg-brand text-white'
                        : 'text-t2 hover:text-t1 hover:bg-bg1'
                    }`}
                    title={label}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Auto-refresh Toggle */}
              <label className="flex items-center gap-2 text-sm text-t2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh
              </label>

              {/* Manual Refresh */}
              <button
                onClick={handleRefresh}
                disabled={state.refreshing}
                className="px-3 py-2 bg-brand/10 text-brand hover:bg-brand/20 border border-brand/30 rounded-lg transition-colors disabled:opacity-50"
              >
                {state.refreshing ? '🔄' : '↻'} Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-bg1 border border-b1 rounded-lg p-4">
            <div className="text-2xl font-bold text-brand">{stats.totalItems}</div>
            <div className="text-sm text-t2">Total Items</div>
          </div>
          <div className="bg-bg1 border border-err/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-err">{stats.criticalItems}</div>
            <div className="text-sm text-t2">Critical Threats</div>
          </div>
          <div className="bg-bg1 border border-warn/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-warn">{stats.highItems}</div>
            <div className="text-sm text-t2">High Priority</div>
          </div>
          <div className="bg-bg1 border border-b1 rounded-lg p-4">
            <div className="text-2xl font-bold text-ok">{stats.uniqueSources}</div>
            <div className="text-sm text-t2">Sources</div>
          </div>
          <div className="bg-bg1 border border-b1 rounded-lg p-4">
            <div className="text-2xl font-bold text-accent">{stats.last24h}</div>
            <div className="text-sm text-t2">Last 24h</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <FeedSearch
                value={filters.searchQuery}
                onChange={(searchQuery) => handleFilterChange({ searchQuery })}
                placeholder="Search threats, CVEs, sources..."
              />
              
              <FeedFilters
                filters={filters}
                options={filterOptions}
                onChange={handleFilterChange}
                clustersCount={filteredClusters.length}
                totalItems={filteredClusters.reduce((sum, c) => sum + c.totalItems, 0)}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {filteredClusters.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-t1 mb-2">No threats found</h3>
                <p className="text-t2">
                  {filters.searchQuery || filters.topics.length || filters.sources.length
                    ? 'Try adjusting your filters or search terms.'
                    : 'No cybersecurity feeds are currently available.'}
                </p>
                {(filters.searchQuery || filters.topics.length || filters.sources.length) && (
                  <button
                    onClick={() => setFilters({
                      topics: [],
                      sources: [],
                      severities: [],
                      dateRange: { start: null, end: null },
                      searchQuery: ''
                    })}
                    className="mt-4 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/80 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : shouldVirtualize ? (
              <div className="bg-bg1 rounded-lg border border-b1 overflow-hidden">
                <div className="p-4 border-b border-b1">
                  <h3 className="text-lg font-semibold text-t1">
                    All Threat Intelligence ({allFeedItems.length} items)
                  </h3>
                  <p className="text-sm text-t2 mt-1">
                    Large dataset detected - using optimized view for better performance
                  </p>
                </div>
                <VirtualizedFeedList
                  items={allFeedItems}
                  clusters={filteredClusters}
                  viewMode={viewMode}
                  height={recommendedHeight}
                  onItemClick={(item) => {
                    window.open(item.link, '_blank', 'noopener,noreferrer');
                  }}
                  className="border-0"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {filteredClusters.map((cluster) => (
                  <FeedGroup
                    key={cluster.topicId}
                    cluster={cluster}
                    viewMode={viewMode}
                    onTopicClick={(topicId) => {
                      if (!filters.topics.includes(topicId)) {
                        handleFilterChange({ topics: [...filters.topics, topicId] });
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedDashboard;