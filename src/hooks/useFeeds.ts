/**
 * useFeeds Hook - Simplified state management for feed data
 * Replaces complex state management with optimized React patterns
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { simpleFeedService, FeedItem } from '../services/SimpleFeedService';

export interface FeedsState {
  items: FeedItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface FeedsFilters {
  searchQuery: string;
  categories: string[];
  severities: string[];
  sources: string[];
}

export interface FeedsStats {
  total: number;
  last24h: number;
  sources: number;
  withCVE: number;
  severityCounts: Record<string, number>;
}

export function useFeeds() {
  const [state, setState] = useState<FeedsState>({
    items: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  const [filters, setFilters] = useState<FeedsFilters>({
    searchQuery: '',
    categories: [],
    severities: [],
    sources: []
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5 * 60 * 1000); // 5 minutes

  /**
   * Fetch feeds data
   */
  const fetchFeeds = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && state.loading) return;

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));

    try {
      const items = await simpleFeedService.fetchAllFeeds(forceRefresh);
      
      setState(prev => ({
        ...prev,
        items,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }));

    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load feeds'
      }));
    }
  }, [state.loading]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(() => {
    fetchFeeds(true);
  }, [fetchFeeds]);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: Partial<FeedsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      categories: [],
      severities: [],
      sources: []
    });
  }, []);

  /**
   * Apply filters to items
   */
  const filteredItems = useMemo(() => {
    let result = state.items;

    // Apply search query
    if (filters.searchQuery.trim()) {
      result = simpleFeedService.searchFeeds(result, filters.searchQuery);
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      result = simpleFeedService.filterByCategory(result, filters.categories);
    }

    // Apply severity filter
    if (filters.severities.length > 0) {
      result = simpleFeedService.filterBySeverity(result, filters.severities);
    }

    // Apply source filter
    if (filters.sources.length > 0) {
      result = result.filter(item => filters.sources.includes(item.source));
    }

    return result;
  }, [state.items, filters]);

  /**
   * Get available filter options
   */
  const filterOptions = useMemo(() => ({
    categories: simpleFeedService.getAvailableCategories(state.items),
    sources: simpleFeedService.getAvailableSources(state.items),
    severities: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const
  }), [state.items]);

  /**
   * Calculate statistics
   */
  const stats: FeedsStats = useMemo(() => {
    return simpleFeedService.getStats(filteredItems);
  }, [filteredItems]);

  /**
   * Get items by category for quick access
   */
  const getItemsByCategory = useCallback((category: string) => {
    return state.items.filter(item => item.category === category);
  }, [state.items]);

  /**
   * Get recent items (last 24 hours)
   */
  const recentItems = useMemo(() => {
    const now = new Date();
    return state.items.filter(item => 
      (now.getTime() - item.date.getTime()) <= 24 * 60 * 60 * 1000
    );
  }, [state.items]);

  /**
   * Get critical items
   */
  const criticalItems = useMemo(() => {
    return state.items.filter(item => 
      item.severity === 'CRITICAL' || 
      item.cve || 
      item.tags.includes('exploited')
    );
  }, [state.items]);

  /**
   * Search items with debouncing
   */
  const searchItems = useCallback((query: string) => {
    updateFilters({ searchQuery: query });
  }, [updateFilters]);

  /**
   * Auto-refresh setup
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        fetchFeeds(true);
      }, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, refreshInterval, fetchFeeds]);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clean up any pending requests or timers
    };
  }, []);

  return {
    // State
    items: filteredItems,
    allItems: state.items,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Filters
    filters,
    updateFilters,
    clearFilters,
    filterOptions,

    // Actions
    refresh,
    fetchFeeds,
    searchItems,

    // Auto-refresh
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,

    // Computed data
    stats,
    recentItems,
    criticalItems,

    // Utilities
    getItemsByCategory,
    
    // Helper methods
    clearCache: () => simpleFeedService.clearCache()
  };
}

/**
 * Hook for simplified feed loading without filters
 */
export function useSimpleFeeds() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const feedItems = await simpleFeedService.fetchAllFeeds();
      setItems(feedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feeds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  return {
    items,
    loading,
    error,
    refresh: () => loadFeeds()
  };
}

export default useFeeds;