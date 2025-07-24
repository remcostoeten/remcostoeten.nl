import { useEffect, useRef, useState } from 'react';

type TPerformanceMetrics = {
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
};

export function usePerformance() {
  const [metrics, setMetrics] = useState<TPerformanceMetrics | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    function updateMetrics() {
      const performanceMetrics: TPerformanceMetrics = {
        loadTime: performance.now(),
        domContentLoaded: 0,
      };

      // Get memory usage if available (Chrome only)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        performanceMetrics.memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
        };
      }

      // Get navigation timing
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        performanceMetrics.domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart;
      }

      // Get paint timing
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        performanceMetrics.firstContentfulPaint = fcpEntry.startTime;
      }

      setMetrics(performanceMetrics);
    }

    // Initial metrics
    updateMetrics();

    // Update metrics every 5 seconds (less frequent than before)
    intervalRef.current = window.setInterval(updateMetrics, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  function logMemoryWarning() {
    if (metrics?.memoryUsage && metrics.memoryUsage.percentage > 80) {
      console.warn('High memory usage detected:', metrics.memoryUsage);
    }
  }

  // Check for memory warnings when metrics update
  useEffect(() => {
    logMemoryWarning();
  }, [metrics]);

  return {
    metrics,
    logMemoryWarning,
  };
}

// Hook to detect memory leaks by tracking component mount/unmount
export function useMemoryLeakDetection(componentName: string) {
  useEffect(() => {
    const mountTime = Date.now();
    console.debug(`Component ${componentName} mounted at ${mountTime}`);

    return () => {
      const unmountTime = Date.now();
      const lifespan = unmountTime - mountTime;
      console.debug(`Component ${componentName} unmounted after ${lifespan}ms`);

      // Log warning for very short-lived components (potential rapid re-renders)
      if (lifespan < 100) {
        console.warn(`Potential rapid re-render detected for ${componentName}`);
      }
    };
  }, [componentName]);
}
