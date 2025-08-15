import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  threatIntelLoader, 
  infrastructureLoader, 
  feedDataManager, 
  dashboardMonitor 
} from '../utils/dashboardPerformance';

// Hook for optimized threat intelligence data loading
export function useThreatIntelligence(options: {
  autoLoad?: boolean;
  batchSize?: number;
  refreshInterval?: number;
} = {}) {
  const { autoLoad = true, batchSize = 100, refreshInterval = 300000 } = options; // 5 min default
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const componentName = 'ThreatIntelligence';

  const loadData = useCallback(async (forceRefresh = false) => {
    const timerId = dashboardMonitor.startTimer(componentName, 'loadData');
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await threatIntelLoader.loadThreatData({
        batchSize,
        forceRefresh,
        onProgress: (loaded, total) => {
          setProgress({ loaded, total });
        }
      });
      
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load threat intelligence'));
    } finally {
      setLoading(false);
      dashboardMonitor.endTimer(timerId);
    }
  }, [batchSize]);

  const startAutoRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    refreshTimerRef.current = setInterval(() => {
      loadData(true);
    }, refreshInterval);
  }, [loadData, refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadData();
      startAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [autoLoad, loadData, startAutoRefresh, stopAutoRefresh]);

  return {
    data,
    loading,
    progress,
    error,
    lastUpdated,
    refresh: () => loadData(true),
    startAutoRefresh,
    stopAutoRefresh
  };
}

// Hook for optimized infrastructure data with virtual scrolling support
export function useInfrastructureData(options: {
  filters?: any;
  virtualizedView?: boolean;
  viewportSize?: number;
  autoLoad?: boolean;
} = {}) {
  const { filters = {}, virtualizedView = false, viewportSize = 50, autoLoad = true } = options;
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [error, setError] = useState<Error | null>(null);
  
  const componentName = 'Infrastructure';
  const filterString = JSON.stringify(filters);

  const loadData = useCallback(async () => {
    const timerId = dashboardMonitor.startTimer(componentName, 'loadData');
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await infrastructureLoader.loadInfrastructureData({
        filters,
        virtualizedView,
        viewportSize,
        onProgress: (loaded, total) => {
          setProgress({ loaded, total });
        }
      });
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load infrastructure data'));
    } finally {
      setLoading(false);
      dashboardMonitor.endTimer(timerId);
    }
  }, [filters, virtualizedView, viewportSize]);

  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData, filterString]);

  return {
    data,
    loading,
    progress,
    error,
    refresh: loadData
  };
}

// Hook for optimized feed data with preloading
export function useFeedData(category: string, options: {
  useCache?: boolean;
  preload?: boolean;
} = {}) {
  const { useCache = true, preload = true } = options;
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const componentName = 'FeedData';

  const loadData = useCallback(async () => {
    const timerId = dashboardMonitor.startTimer(componentName, 'loadFeedData');
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await feedDataManager.getFeedData(category, useCache);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load feed data'));
    } finally {
      setLoading(false);
      dashboardMonitor.endTimer(timerId);
    }
  }, [category, useCache]);

  useEffect(() => {
    loadData();
    
    if (preload) {
      feedDataManager.preloadFeedData();
    }
  }, [loadData, preload]);

  return {
    data,
    loading,
    error,
    refresh: loadData
  };
}

// Hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startTimer = useCallback((operation: string) => {
    return dashboardMonitor.startTimer(componentName, operation);
  }, [componentName]);

  const endTimer = useCallback((timerId: string) => {
    return dashboardMonitor.endTimer(timerId);
  }, []);

  const getAverageTime = useCallback((operation: string) => {
    return dashboardMonitor.getAverageTime(componentName, operation);
  }, [componentName]);

  const getMetrics = useCallback(() => {
    return dashboardMonitor.getMetrics(componentName);
  }, [componentName]);

  return {
    startTimer,
    endTimer,
    getAverageTime,
    getMetrics
  };
}

// Hook for virtualized list performance
export function useVirtualizedList<T>(
  items: T[],
  options: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
  }
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex + 1),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight
  };
}

// Hook for debounced search with performance optimization
export function useDebouncedSearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  debounceMs = 300
) {
  const [filteredItems, setFilteredItems] = useState<T[]>(items);
  const [searching, setSearching] = useState(false);
  
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const componentName = 'DebouncedSearch';

  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!searchTerm.trim()) {
      setFilteredItems(items);
      setSearching(false);
      return;
    }

    setSearching(true);
    
    searchTimerRef.current = setTimeout(() => {
      const timerId = dashboardMonitor.startTimer(componentName, 'search');
      
      try {
        const searchTermLower = searchTerm.toLowerCase();
        const filtered = items.filter(item => 
          searchFields.some(field => {
            const value = item[field];
            return value && String(value).toLowerCase().includes(searchTermLower);
          })
        );
        
        setFilteredItems(filtered);
      } finally {
        setSearching(false);
        dashboardMonitor.endTimer(timerId);
      }
    }, debounceMs);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [items, searchTerm, searchFields, debounceMs]);

  return {
    filteredItems,
    searching
  };
}

// Hook for intersection observer (for lazy loading)
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const targetRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return targetRef;
}

// Hook for memory usage optimization
export function useMemoryOptimization() {
  const [memoryUsage, setMemoryUsage] = useState<any>(null);

  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      setMemoryUsage({
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        timestamp: Date.now()
      });
    }
  }, []);

  const forceGarbageCollection = useCallback(() => {
    // Force garbage collection if available (Chrome dev tools)
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Clear caches if memory usage is high
    if (memoryUsage && memoryUsage.usedJSHeapSize > memoryUsage.jsHeapSizeLimit * 0.8) {
      threatIntelLoader.clearCache();
      dashboardMonitor.clearMetrics();
    }
  }, [memoryUsage]);

  useEffect(() => {
    checkMemoryUsage();
    const interval = setInterval(checkMemoryUsage, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkMemoryUsage]);

  return {
    memoryUsage,
    checkMemoryUsage,
    forceGarbageCollection
  };
}