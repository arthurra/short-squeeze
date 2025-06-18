import { useEffect, useRef, useCallback } from 'react';
import {
  startPerformanceMeasure,
  endPerformanceMeasure,
  trackComponentRender,
  trackUserInteraction,
  PERFORMANCE_MARKS,
} from '@/lib/utils/performance';

/**
 * Hook for tracking component performance
 */
export function usePerformanceTracking(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const isInitialRender = useRef(true);

  // Track component render performance
  useEffect(() => {
    if (isInitialRender.current) {
      renderStartTime.current = performance.now();
      startPerformanceMeasure(`${componentName}-render`);
      isInitialRender.current = false;
    } else {
      const renderTime = performance.now() - renderStartTime.current;
      trackComponentRender(componentName, renderTime);
      endPerformanceMeasure(`${componentName}-render`);
    }
  }, [componentName]);

  // Track user interactions
  const trackInteraction = useCallback((action: string, duration: number) => {
    trackUserInteraction(action, duration);
  }, []);

  // Track API calls
  const trackApiCall = useCallback((url: string, duration: number, status: number) => {
    startPerformanceMeasure(`${PERFORMANCE_MARKS.API_CALL}-${url}`);
    endPerformanceMeasure(`${PERFORMANCE_MARKS.API_CALL}-${url}`);
  }, []);

  return {
    trackInteraction,
    trackApiCall,
  };
}

/**
 * Hook for tracking page load performance
 */
export function usePagePerformance(pageName: string) {
  useEffect(() => {
    const startTime = performance.now();
    startPerformanceMeasure(`${pageName}-load`);

    return () => {
      const loadTime = performance.now() - startTime;
      endPerformanceMeasure(`${pageName}-load`);

      // Track page load completion
      if (loadTime > 3000) {
        console.warn(`Slow page load detected for ${pageName}: ${loadTime.toFixed(2)}ms`);
      }
    };
  }, [pageName]);
}

/**
 * Hook for tracking chart rendering performance
 */
export function useChartPerformance() {
  const trackChartRender = useCallback(
    (chartType: string, dataPoints: number, renderTime: number) => {
      startPerformanceMeasure(`${PERFORMANCE_MARKS.CHART_RENDER}-${chartType}`);
      endPerformanceMeasure(`${PERFORMANCE_MARKS.CHART_RENDER}-${chartType}`, {
        chartType,
        dataPoints: dataPoints.toString(),
      });
    },
    [],
  );

  return { trackChartRender };
}

/**
 * Hook for tracking filter performance
 */
export function useFilterPerformance() {
  const trackFilterApply = useCallback((filterType: string, duration: number) => {
    startPerformanceMeasure(`${PERFORMANCE_MARKS.FILTER_APPLY}-${filterType}`);
    endPerformanceMeasure(`${PERFORMANCE_MARKS.FILTER_APPLY}-${filterType}`, {
      filterType,
    });
  }, []);

  return { trackFilterApply };
}
