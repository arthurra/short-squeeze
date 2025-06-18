import * as Sentry from '@sentry/nextjs';

// Core Web Vitals thresholds
const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100, // First Input Delay (ms)
  CLS: 0.1, // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 800, // Time to First Byte (ms)
};

// Performance metric types
export interface PerformanceMetrics {
  LCP?: number;
  FID?: number;
  CLS?: number;
  FCP?: number;
  TTFB?: number;
  customMetrics?: Record<string, number>;
}

// Custom performance marks
export const PERFORMANCE_MARKS = {
  APP_INIT: 'app-init',
  DASHBOARD_LOAD: 'dashboard-load',
  STOCK_DETAIL_LOAD: 'stock-detail-load',
  API_CALL: 'api-call',
  CHART_RENDER: 'chart-render',
  FILTER_APPLY: 'filter-apply',
} as const;

/**
 * Track Core Web Vitals using the Web Vitals library
 */
export function trackCoreWebVitals() {
  if (typeof window === 'undefined') return;

  // Track LCP (Largest Contentful Paint)
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry) {
        const lcp = lastEntry.startTime;
        trackMetric('LCP', lcp);

        if (lcp > CORE_WEB_VITALS_THRESHOLDS.LCP) {
          Sentry.captureMessage('LCP threshold exceeded', 'warning');
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  // Track FID (First Input Delay)
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const firstInputEntry = entry as PerformanceEventTiming;
        const fid = firstInputEntry.processingStart - firstInputEntry.startTime;
        trackMetric('FID', fid);

        if (fid > CORE_WEB_VITALS_THRESHOLDS.FID) {
          Sentry.captureMessage('FID threshold exceeded', 'warning');
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  // Track CLS (Cumulative Layout Shift)
  let clsValue = 0;
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      trackMetric('CLS', clsValue);

      if (clsValue > CORE_WEB_VITALS_THRESHOLDS.CLS) {
        Sentry.captureMessage('CLS threshold exceeded', 'warning');
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }
}

/**
 * Track a custom performance metric
 */
export function trackMetric(name: string, value: number, tags?: Record<string, string>) {
  // Send to Sentry as a custom event
  Sentry.captureMessage(`Performance Metric: ${name}`, {
    level: 'info',
    tags: { ...tags, metric: name },
    extra: { value },
  });

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance Metric - ${name}:`, value, tags);
  }
}

/**
 * Start a performance measurement
 */
export function startPerformanceMeasure(name: string) {
  if (typeof window === 'undefined') return;

  performance.mark(`${name}-start`);
}

/**
 * End a performance measurement and track the duration
 */
export function endPerformanceMeasure(name: string, tags?: Record<string, string>) {
  if (typeof window === 'undefined') return;

  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);

  const measure = performance.getEntriesByName(name)[0];
  if (measure) {
    trackMetric(`${name}-duration`, measure.duration, tags);
  }
}

/**
 * Track API call performance
 */
export function trackApiCall(url: string, duration: number, status: number) {
  const tags = {
    url,
    status: status.toString(),
    method: 'GET', // Default, can be enhanced
  };

  trackMetric('api-call-duration', duration, tags);

  // Track slow API calls
  if (duration > 2000) {
    Sentry.captureMessage('Slow API call detected', {
      level: 'warning',
      tags,
      extra: { duration, url, status },
    });
  }
}

/**
 * Track component render performance
 */
export function trackComponentRender(componentName: string, duration: number) {
  const tags = { component: componentName };
  trackMetric('component-render-duration', duration, tags);

  // Track slow component renders
  if (duration > 100) {
    Sentry.captureMessage('Slow component render detected', {
      level: 'warning',
      tags,
      extra: { duration, component: componentName },
    });
  }
}

/**
 * Track user interaction performance
 */
export function trackUserInteraction(action: string, duration: number) {
  const tags = { action };
  trackMetric('user-interaction-duration', duration, tags);
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  trackCoreWebVitals();

  // Track page load performance
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      trackMetric('TTFB', navigation.responseStart - navigation.requestStart);
      trackMetric('FCP', navigation.domContentLoadedEventEnd - navigation.fetchStart);
    }
  });

  // Track route changes
  if (typeof window !== 'undefined') {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      trackMetric('route-change', Date.now());
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      trackMetric('route-replace', Date.now());
    };
  }
}
