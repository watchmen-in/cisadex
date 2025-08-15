import { useEffect, useState, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  apiLatency: Record<string, number>;
  componentLoadTimes: Record<string, number>;
  errorCount: number;
  userInteractionDelay: number;
}

interface PerformanceThresholds {
  memoryWarning: number;
  renderTimeWarning: number;
  apiLatencyWarning: number;
  errorThreshold: number;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    apiLatency: {},
    componentLoadTimes: {},
    errorCount: 0,
    userInteractionDelay: 0
  });

  const [alerts, setAlerts] = useState<string[]>([]);
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const renderStartTime = useRef<number>(Date.now());
  const apiCallTimes = useRef<Map<string, number>>(new Map());

  const thresholds: PerformanceThresholds = {
    memoryWarning: 50 * 1024 * 1024, // 50MB
    renderTimeWarning: 100, // 100ms
    apiLatencyWarning: 2000, // 2 seconds
    errorThreshold: 5 // 5 errors
  };

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Memory usage monitoring
    const updateMemoryMetrics = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize;
        
        setMetrics(prev => ({ ...prev, memoryUsage }));
        
        if (memoryUsage > thresholds.memoryWarning) {
          setAlerts(prev => [...prev, `High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`]);
        }
      }
    };

    // Performance Observer for paint and navigation timing
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'paint') {
            setMetrics(prev => ({
              ...prev,
              componentLoadTimes: {
                ...prev.componentLoadTimes,
                [entry.name]: entry.startTime
              }
            }));
          }
          
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const renderTime = navEntry.loadEventEnd - navEntry.navigationStart;
            
            setMetrics(prev => ({ ...prev, renderTime }));
            
            if (renderTime > thresholds.renderTimeWarning) {
              setAlerts(prev => [...prev, `Slow page load: ${renderTime.toFixed(2)}ms`]);
            }
          }
        });
      });

      try {
        performanceObserver.current.observe({ entryTypes: ['paint', 'navigation', 'resource'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }

    // Memory monitoring interval
    const memoryInterval = setInterval(updateMemoryMetrics, 5000);

    return () => {
      clearInterval(memoryInterval);
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, []);

  // Track API call performance
  const trackApiCall = useCallback((endpoint: string) => {
    const startTime = Date.now();
    apiCallTimes.current.set(endpoint, startTime);

    return {
      end: () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        setMetrics(prev => ({
          ...prev,
          apiLatency: {
            ...prev.apiLatency,
            [endpoint]: duration
          }
        }));

        if (duration > thresholds.apiLatencyWarning) {
          setAlerts(prev => [...prev, `Slow API call to ${endpoint}: ${duration}ms`]);
        }

        apiCallTimes.current.delete(endpoint);
      }
    };
  }, []);

  // Track component render performance
  const trackComponentRender = useCallback((componentName: string) => {
    const startTime = Date.now();
    
    return () => {
      const renderTime = Date.now() - startTime;
      
      setMetrics(prev => ({
        ...prev,
        componentLoadTimes: {
          ...prev.componentLoadTimes,
          [componentName]: renderTime
        }
      }));

      if (renderTime > thresholds.renderTimeWarning) {
        setAlerts(prev => [...prev, `Slow component render: ${componentName} took ${renderTime}ms`]);
      }
    };
  }, []);

  // Track errors
  const trackError = useCallback((error: Error, context?: string) => {
    setMetrics(prev => {
      const newErrorCount = prev.errorCount + 1;
      
      if (newErrorCount > thresholds.errorThreshold) {
        setAlerts(prevAlerts => [...prevAlerts, `High error count: ${newErrorCount} errors`]);
      }
      
      return { ...prev, errorCount: newErrorCount };
    });

    // Log error details for debugging
    console.error('Performance Monitor - Error tracked:', {
      error: error.message,
      context,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Track user interaction delays
  const trackUserInteraction = useCallback((interactionType: string) => {
    const startTime = Date.now();
    
    return () => {
      const delay = Date.now() - startTime;
      
      setMetrics(prev => ({ ...prev, userInteractionDelay: delay }));
      
      if (delay > 300) { // 300ms is generally considered the threshold for perceived responsiveness
        setAlerts(prev => [...prev, `Slow ${interactionType} interaction: ${delay}ms`]);
      }
    };
  }, []);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    const report = {
      metrics,
      alerts,
      recommendations: []
    };

    // Generate recommendations based on metrics
    const recommendations: string[] = [];

    if (metrics.memoryUsage > thresholds.memoryWarning) {
      recommendations.push('Consider implementing component lazy loading to reduce memory usage');
      recommendations.push('Check for memory leaks in event listeners and subscriptions');
    }

    if (Object.values(metrics.apiLatency).some(latency => latency > thresholds.apiLatencyWarning)) {
      recommendations.push('Implement request caching for frequently accessed data');
      recommendations.push('Consider using request debouncing for user input');
    }

    if (Object.values(metrics.componentLoadTimes).some(time => time > thresholds.renderTimeWarning)) {
      recommendations.push('Use React.memo() for expensive components');
      recommendations.push('Implement virtualization for large lists');
      recommendations.push('Consider code splitting for large components');
    }

    if (metrics.errorCount > thresholds.errorThreshold) {
      recommendations.push('Implement better error boundaries');
      recommendations.push('Add more comprehensive error handling');
    }

    return { ...report, recommendations };
  }, [metrics, alerts]);

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const suggestions = [];

    // Analyze current performance and suggest optimizations
    if (metrics.memoryUsage > 30 * 1024 * 1024) { // 30MB
      suggestions.push({
        type: 'memory',
        severity: 'medium',
        suggestion: 'Memory usage is elevated. Consider implementing component cleanup.',
        action: 'Implement useEffect cleanup functions'
      });
    }

    if (metrics.renderTime > 50) {
      suggestions.push({
        type: 'render',
        severity: 'high',
        suggestion: 'Render time is slow. Consider optimizing component rendering.',
        action: 'Use React.memo and useMemo for expensive calculations'
      });
    }

    const avgApiLatency = Object.values(metrics.apiLatency).reduce((a, b) => a + b, 0) / Object.values(metrics.apiLatency).length;
    if (avgApiLatency > 1000) {
      suggestions.push({
        type: 'api',
        severity: 'high',
        suggestion: 'API calls are slow. Consider implementing caching.',
        action: 'Implement request caching and background refresh'
      });
    }

    return suggestions;
  }, [metrics]);

  return {
    metrics,
    alerts,
    trackApiCall,
    trackComponentRender,
    trackError,
    trackUserInteraction,
    clearAlerts,
    getPerformanceReport,
    getOptimizationSuggestions
  };
}