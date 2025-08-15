/**
 * Performance Testing Utilities
 * Measures the improvements in the new feeds implementation
 */

export interface PerformanceTestResult {
  componentName: string;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  itemCount: number;
  bundleAnalysis: {
    linesOfCode: number;
    dependencies: string[];
    estimatedSize: string;
  };
}

export class PerformanceTestRunner {
  private static instance: PerformanceTestRunner;
  private results: Map<string, PerformanceTestResult> = new Map();

  static getInstance(): PerformanceTestRunner {
    if (!this.instance) {
      this.instance = new PerformanceTestRunner();
    }
    return this.instance;
  }

  /**
   * Start measuring component performance
   */
  startMeasurement(componentName: string): number {
    const startTime = performance.now();
    performance.mark(`${componentName}-start`);
    return startTime;
  }

  /**
   * End measurement and record results
   */
  endMeasurement(
    componentName: string, 
    startTime: number, 
    itemCount: number = 0,
    additionalData?: Partial<PerformanceTestResult>
  ): PerformanceTestResult {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    performance.mark(`${componentName}-end`);
    performance.measure(`${componentName}-total`, `${componentName}-start`, `${componentName}-end`);

    // Get memory usage if available
    const memoryInfo = (performance as any).memory;
    const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;

    // Measure render time
    const renderStart = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStart;
      
      const result: PerformanceTestResult = {
        componentName,
        loadTime,
        renderTime,
        memoryUsage,
        itemCount,
        bundleAnalysis: {
          linesOfCode: 0,
          dependencies: [],
          estimatedSize: 'N/A'
        },
        ...additionalData
      };

      this.results.set(componentName, result);
    });

    return this.results.get(componentName) || {
      componentName,
      loadTime,
      renderTime: 0,
      memoryUsage,
      itemCount,
      bundleAnalysis: {
        linesOfCode: 0,
        dependencies: [],
        estimatedSize: 'N/A'
      }
    };
  }

  /**
   * Get all test results
   */
  getAllResults(): PerformanceTestResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Compare two implementations
   */
  compareImplementations(oldComponent: string, newComponent: string): {
    loadTimeImprovement: number;
    renderTimeImprovement: number;
    memoryImprovement: number;
    summary: string;
  } {
    const oldResult = this.results.get(oldComponent);
    const newResult = this.results.get(newComponent);

    if (!oldResult || !newResult) {
      return {
        loadTimeImprovement: 0,
        renderTimeImprovement: 0,
        memoryImprovement: 0,
        summary: 'Cannot compare - missing results'
      };
    }

    const loadTimeImprovement = ((oldResult.loadTime - newResult.loadTime) / oldResult.loadTime) * 100;
    const renderTimeImprovement = ((oldResult.renderTime - newResult.renderTime) / oldResult.renderTime) * 100;
    const memoryImprovement = ((oldResult.memoryUsage - newResult.memoryUsage) / oldResult.memoryUsage) * 100;

    const summary = `
New implementation shows:
- ${loadTimeImprovement.toFixed(1)}% faster load time
- ${renderTimeImprovement.toFixed(1)}% faster render time  
- ${memoryImprovement.toFixed(1)}% less memory usage
    `.trim();

    return {
      loadTimeImprovement,
      renderTimeImprovement,
      memoryImprovement,
      summary
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const results = this.getAllResults();
    
    if (results.length === 0) {
      return 'No performance data available';
    }

    let report = '# Performance Test Report\n\n';
    
    results.forEach(result => {
      report += `## ${result.componentName}\n`;
      report += `- Load Time: ${result.loadTime.toFixed(2)}ms\n`;
      report += `- Render Time: ${result.renderTime.toFixed(2)}ms\n`;
      report += `- Memory Usage: ${result.memoryUsage.toFixed(2)}MB\n`;
      report += `- Items Processed: ${result.itemCount}\n`;
      report += `- Estimated Bundle Size: ${result.bundleAnalysis.estimatedSize}\n\n`;
    });

    return report;
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
}

/**
 * Helper hook for measuring component performance
 */
export function usePerfMeasurement(componentName: string) {
  const testRunner = PerformanceTestRunner.getInstance();
  const startTime = testRunner.startMeasurement(componentName);

  return {
    endMeasurement: (itemCount?: number, additionalData?: any) => 
      testRunner.endMeasurement(componentName, startTime, itemCount, additionalData),
    
    getResult: () => testRunner.getAllResults().find(r => r.componentName === componentName)
  };
}

/**
 * Bundle size analysis utilities
 */
export const bundleAnalysis = {
  /**
   * Estimate component complexity
   */
  estimateComplexity(dependencies: string[], linesOfCode: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
    const depCount = dependencies.length;
    
    if (linesOfCode > 1000 || depCount > 10) return 'VERY_HIGH';
    if (linesOfCode > 500 || depCount > 5) return 'HIGH';
    if (linesOfCode > 200 || depCount > 3) return 'MEDIUM';
    return 'LOW';
  },

  /**
   * Analyze implementation differences
   */
  compareImplementations: {
    old: {
      files: [
        'feedManager.js (1225 lines)',
        'topicDetectionService.ts (468 lines)', 
        'feedCacheService.ts (418 lines)',
        'FeedDashboard.tsx (462 lines)',
        'Various feed components (500+ lines)'
      ],
      totalLines: 3000,
      dependencies: [
        'fast-xml-parser',
        'complex caching libraries',
        'topic detection algorithms',
        'federal compliance services'
      ],
      estimatedSize: '~500KB+'
    },
    new: {
      files: [
        'SimpleFeedService.ts (350 lines)',
        'useFeeds.ts (200 lines)',
        'SimpleFeedList.tsx (250 lines)'
      ],
      totalLines: 800,
      dependencies: [
        'native browser APIs',
        'simple caching',
        'lightweight parsing'
      ],
      estimatedSize: '~100KB'
    }
  }
};

export default PerformanceTestRunner;