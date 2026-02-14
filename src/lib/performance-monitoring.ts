/**
 * Performance Monitoring with Web Vitals
 * Track and report Core Web Vitals metrics
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

// Performance thresholds (Google's recommended values)
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
};

export type MetricName = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';

export interface PerformanceData extends Metric {
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
}

/**
 * Get rating for a metric
 */
function getMetricRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Format metric value for display
 */
export function formatMetricValue(name: MetricName, value: number): string {
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

/**
 * Send metric to analytics endpoint
 */
function sendToAnalytics(metric: PerformanceData) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance]', {
      name: metric.name,
      value: formatMetricValue(metric.name as MetricName, metric.value),
      rating: metric.rating,
      id: metric.id,
    });
  }

  // TODO: Send to your analytics service
  // Examples:
  // - Google Analytics 4
  // - Vercel Analytics
  // - Custom endpoint

  // Example: Google Analytics 4
  /*
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
    });
  }
  */

  // Example: Custom API endpoint
  /*
  fetch('/api/analytics/vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
  }).catch(err => console.error('Failed to send metrics:', err));
  */
}

/**
 * Handle metric and prepare data
 */
function handleMetric(metric: Metric) {
  const data: PerformanceData = {
    ...metric,
    rating: getMetricRating(metric.name as MetricName, metric.value),
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  sendToAnalytics(data);

  // Store in localStorage for debugging
  if (process.env.NODE_ENV === 'development') {
    const raw = localStorage.getItem('webVitals');
    const stored = (raw && raw.trim() ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : []) as PerformanceData[];
    stored.push(data);
    localStorage.setItem('webVitals', JSON.stringify(stored.slice(-10))); // Keep last 10
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initPerformanceMonitoring() {
  try {
    getCLS(handleMetric);
    getFID(handleMetric);
    getFCP(handleMetric);
    getLCP(handleMetric);
    getTTFB(handleMetric);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance] Web Vitals monitoring initialized');
    }
  } catch (error) {
    console.error('[Performance] Failed to initialize Web Vitals:', error);
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  metrics: PerformanceData[];
  summary: {
    good: number;
    needsImprovement: number;
    poor: number;
  };
} {
  const raw = localStorage.getItem('webVitals');
  const stored = (raw && raw.trim() ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : []) as PerformanceData[];

  const summary = stored.reduce(
    (acc, metric) => {
      acc[metric.rating === 'needs-improvement' ? 'needsImprovement' : metric.rating]++;
      return acc;
    },
    { good: 0, needsImprovement: 0, poor: 0 }
  );

  return { metrics: stored, summary };
}

/**
 * Clear stored metrics
 */
export function clearPerformanceData() {
  localStorage.removeItem('webVitals');
}

/**
 * Performance budget checker
 */
export interface PerformanceBudget {
  LCP: number;
  FID: number;
  CLS: number;
  FCP: number;
  TTFB: number;
}

const DEFAULT_BUDGET: PerformanceBudget = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  FCP: 1800,
  TTFB: 800,
};

/**
 * Check if performance meets budget
 */
export function checkPerformanceBudget(
  metrics: PerformanceData[],
  budget: PerformanceBudget = DEFAULT_BUDGET
): {
  passed: boolean;
  violations: Array<{ metric: string; value: number; budget: number }>;
} {
  const violations: Array<{ metric: string; value: number; budget: number }> = [];

  metrics.forEach(metric => {
    const budgetValue = budget[metric.name as MetricName];
    if (metric.value > budgetValue) {
      violations.push({
        metric: metric.name,
        value: metric.value,
        budget: budgetValue,
      });
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * React component performance tracker
 */
export function trackComponentRender(componentName: string) {
  const start = performance.now();

  return () => {
    const duration = performance.now() - start;
    if (duration > 16) { // More than one frame (60fps)
      console.warn(`[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * API call performance tracker
 */
export async function trackAPICall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await apiCall();
    const duration = performance.now() - start;

    // Log slow API calls
    if (duration > 1000) {
      console.warn(`[Performance] Slow API call: ${name} took ${duration.toFixed(0)}ms`);
    }

    // Send to analytics
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] API: ${name} - ${duration.toFixed(0)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] Failed API call: ${name} after ${duration.toFixed(0)}ms`, error);
    throw error;
  }
}

/**
 * Memory monitoring (for development)
 */
export function monitorMemory() {
  if (process.env.NODE_ENV !== 'development') return;

  const memory = (performance as any).memory;
  if (!memory) return;

  const MB = 1048576;
  console.log('[Performance] Memory:', {
    used: `${(memory.usedJSHeapSize / MB).toFixed(2)} MB`,
    total: `${(memory.totalJSHeapSize / MB).toFixed(2)} MB`,
    limit: `${(memory.jsHeapSizeLimit / MB).toFixed(2)} MB`,
  });
}

/**
 * Resource timing tracker
 */
export function getResourceTimings() {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const summary = resources.reduce((acc, resource) => {
    const type = resource.initiatorType;
    if (!acc[type]) {
      acc[type] = { count: 0, totalSize: 0, totalDuration: 0 };
    }

    acc[type].count++;
    acc[type].totalSize += resource.transferSize || 0;
    acc[type].totalDuration += resource.duration;

    return acc;
  }, {} as Record<string, { count: number; totalSize: number; totalDuration: number }>);

  return summary;
}

const performanceMonitoring = {
  init: initPerformanceMonitoring,
  getSummary: getPerformanceSummary,
  clear: clearPerformanceData,
  checkBudget: checkPerformanceBudget,
  trackComponent: trackComponentRender,
  trackAPI: trackAPICall,
  monitorMemory,
  getResourceTimings,
};

export default performanceMonitoring;
