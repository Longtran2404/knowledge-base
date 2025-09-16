/**
 * Performance Monitoring System
 * Tracks and analyzes application performance metrics
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  type: "navigation" | "resource" | "measure" | "custom";
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

export interface WebVitalsMetric {
  name: "CLS" | "FID" | "FCP" | "LCP" | "TTFB";
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}

export interface PerformanceReport {
  timestamp: string;
  url: string;
  userAgent: string;
  connection: any;
  metrics: PerformanceMetric[];
  webVitals: WebVitalsMetric[];
  summary: {
    totalLoadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    timeToFirstByte: number;
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitalsMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance monitoring
   */
  public initialize(): void {
    if (this.isInitialized) return;

    this.setupNavigationTiming();
    this.setupResourceTiming();
    this.setupWebVitals();
    this.setupLongTaskObserver();
    this.setupMemoryObserver();
    this.setupNetworkObserver();

    this.isInitialized = true;
  }

  /**
   * Start custom performance measurement
   */
  public startMeasurement(
    name: string,
    metadata?: Record<string, any>
  ): string {
    const id = `custom_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const metric: PerformanceMetric = {
      id,
      name,
      type: "custom",
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      metadata,
    };

    this.metrics.push(metric);
    return id;
  }

  /**
   * End custom performance measurement
   */
  public endMeasurement(id: string): PerformanceMetric | null {
    const metric = this.metrics.find((m) => m.id === id);
    if (!metric) return null;

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    return metric;
  }

  /**
   * Measure function execution time
   */
  public measureFunction<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): T | Promise<T> {
    const measurementId = this.startMeasurement(name, metadata);

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result.finally(() => {
          this.endMeasurement(measurementId);
        });
      } else {
        this.endMeasurement(measurementId);
        return result;
      }
    } catch (error) {
      this.endMeasurement(measurementId);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  public getMetrics(filters?: {
    type?: string;
    name?: string;
    minDuration?: number;
    maxDuration?: number;
    startTime?: number;
    endTime?: number;
  }): PerformanceMetric[] {
    let filteredMetrics = [...this.metrics];

    if (filters) {
      if (filters.type) {
        filteredMetrics = filteredMetrics.filter(
          (m) => m.type === filters.type
        );
      }
      if (filters.name) {
        filteredMetrics = filteredMetrics.filter(
          (m) => m.name === filters.name
        );
      }
      if (filters.minDuration !== undefined) {
        filteredMetrics = filteredMetrics.filter(
          (m) => m.duration >= filters.minDuration!
        );
      }
      if (filters.maxDuration !== undefined) {
        filteredMetrics = filteredMetrics.filter(
          (m) => m.duration <= filters.maxDuration!
        );
      }
      if (filters.startTime !== undefined) {
        filteredMetrics = filteredMetrics.filter(
          (m) => m.startTime >= filters.startTime!
        );
      }
      if (filters.endTime !== undefined) {
        filteredMetrics = filteredMetrics.filter(
          (m) => m.endTime <= filters.endTime!
        );
      }
    }

    return filteredMetrics;
  }

  /**
   * Get Web Vitals metrics
   */
  public getWebVitals(): WebVitalsMetric[] {
    return [...this.webVitals];
  }

  /**
   * Generate performance report
   */
  public generateReport(): PerformanceReport {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType("paint");

    const fcp = paintEntries.find(
      (entry) => entry.name === "first-contentful-paint"
    );
    const lcp = this.getLargestContentfulPaint();
    const fid = this.getFirstInputDelay();
    const cls = this.getCumulativeLayoutShift();
    const ttfb = navigation
      ? navigation.responseStart - navigation.requestStart
      : 0;

    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection,
      metrics: this.metrics,
      webVitals: this.webVitals,
      summary: {
        totalLoadTime: navigation
          ? navigation.loadEventEnd - navigation.fetchStart
          : 0,
        domContentLoaded: navigation
          ? navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart
          : 0,
        firstContentfulPaint: fcp ? fcp.startTime : 0,
        largestContentfulPaint: lcp,
        firstInputDelay: fid,
        cumulativeLayoutShift: cls,
        timeToFirstByte: ttfb,
      },
    };
  }

  /**
   * Setup navigation timing monitoring
   */
  private setupNavigationTiming(): void {
    window.addEventListener("load", () => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (!navigation) return;

      const navigationMetric: PerformanceMetric = {
        id: `navigation_${Date.now()}`,
        name: "Page Navigation",
        type: "navigation",
        startTime: navigation.fetchStart,
        endTime: navigation.loadEventEnd,
        duration: navigation.loadEventEnd - navigation.fetchStart,
        metadata: {
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          redirectTime: navigation.redirectEnd - navigation.redirectStart,
          dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpTime: navigation.connectEnd - navigation.connectStart,
          requestTime: navigation.responseEnd - navigation.requestStart,
          responseTime: navigation.responseEnd - navigation.responseStart,
          domProcessing:
            navigation.domComplete - navigation.domContentLoadedEventStart,
        },
      };

      this.metrics.push(navigationMetric);
    });
  }

  /**
   * Setup resource timing monitoring
   */
  private setupResourceTiming(): void {
    if (!("PerformanceObserver" in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === "resource") {
          const resourceMetric: PerformanceMetric = {
            id: `resource_${entry.name}_${Date.now()}`,
            name: `Resource: ${entry.name}`,
            type: "resource",
            startTime: entry.startTime,
            endTime: entry.startTime + entry.duration,
            duration: entry.duration,
            metadata: {
              initiatorType: (entry as PerformanceResourceTiming).initiatorType,
              transferSize: (entry as PerformanceResourceTiming).transferSize,
              encodedBodySize: (entry as PerformanceResourceTiming)
                .encodedBodySize,
              decodedBodySize: (entry as PerformanceResourceTiming)
                .decodedBodySize,
            },
          };

          this.metrics.push(resourceMetric);
        }
      });
    });

    observer.observe({ entryTypes: ["resource"] });
    this.observers.push(observer);
  }

  /**
   * Setup Web Vitals monitoring
   */
  private setupWebVitals(): void {
    // First Contentful Paint (FCP)
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === "first-contentful-paint") {
            this.webVitals.push({
              name: "FCP",
              value: entry.startTime,
              delta: entry.startTime,
              id: `fcp_${Date.now()}`,
              navigationType: "navigation",
            });
          }
        });
      });

      observer.observe({ entryTypes: ["paint"] });
      this.observers.push(observer);
    }

    // Largest Contentful Paint (LCP)
    this.setupLCPObserver();

    // First Input Delay (FID)
    this.setupFIDObserver();

    // Cumulative Layout Shift (CLS)
    this.setupCLSObserver();
  }

  /**
   * Setup LCP observer
   */
  private setupLCPObserver(): void {
    if (!("PerformanceObserver" in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.webVitals.push({
        name: "LCP",
        value: lastEntry.startTime,
        delta: lastEntry.startTime,
        id: `lcp_${Date.now()}`,
        navigationType: "navigation",
      });
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });
    this.observers.push(observer);
  }

  /**
   * Setup FID observer
   */
  private setupFIDObserver(): void {
    if (!("PerformanceObserver" in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.webVitals.push({
          name: "FID",
          value: (entry as any).processingStart - entry.startTime,
          delta: (entry as any).processingStart - entry.startTime,
          id: `fid_${Date.now()}`,
          navigationType: "navigation",
        });
      });
    });

    observer.observe({ entryTypes: ["first-input"] });
    this.observers.push(observer);
  }

  /**
   * Setup CLS observer
   */
  private setupCLSObserver(): void {
    if (!("PerformanceObserver" in window)) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });

      this.webVitals.push({
        name: "CLS",
        value: clsValue,
        delta: clsValue,
        id: `cls_${Date.now()}`,
        navigationType: "navigation",
      });
    });

    observer.observe({ entryTypes: ["layout-shift"] });
    this.observers.push(observer);
  }

  /**
   * Setup long task observer
   */
  private setupLongTaskObserver(): void {
    if (!("PerformanceObserver" in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const longTaskMetric: PerformanceMetric = {
          id: `long_task_${Date.now()}`,
          name: "Long Task",
          type: "measure",
          startTime: entry.startTime,
          endTime: entry.startTime + entry.duration,
          duration: entry.duration,
          metadata: {
            name: entry.name,
            entryType: entry.entryType,
          },
        };

        this.metrics.push(longTaskMetric);
      });
    });

    observer.observe({ entryTypes: ["longtask"] });
    this.observers.push(observer);
  }

  /**
   * Setup memory observer
   */
  private setupMemoryObserver(): void {
    if (!("memory" in performance)) return;

    setInterval(() => {
      const memory = (performance as any).memory;
      const memoryMetric: PerformanceMetric = {
        id: `memory_${Date.now()}`,
        name: "Memory Usage",
        type: "measure",
        startTime: performance.now(),
        endTime: performance.now(),
        duration: 0,
        metadata: {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        },
      };

      this.metrics.push(memoryMetric);
    }, 30000); // Every 30 seconds
  }

  /**
   * Setup network observer
   */
  private setupNetworkObserver(): void {
    if (!("connection" in navigator)) return;

    const connection = (navigator as any).connection;
    const networkMetric: PerformanceMetric = {
      id: `network_${Date.now()}`,
      name: "Network Information",
      type: "measure",
      startTime: performance.now(),
      endTime: performance.now(),
      duration: 0,
      metadata: {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      },
    };

    this.metrics.push(networkMetric);
  }

  /**
   * Get Largest Contentful Paint value
   */
  private getLargestContentfulPaint(): number {
    const entries = performance.getEntriesByType("largest-contentful-paint");
    return entries.length > 0 ? entries[entries.length - 1].startTime : 0;
  }

  /**
   * Get First Input Delay value
   */
  private getFirstInputDelay(): number {
    const entries = performance.getEntriesByType("first-input");
    return entries.length > 0
      ? (entries[0] as any).processingStart - entries[0].startTime
      : 0;
  }

  /**
   * Get Cumulative Layout Shift value
   */
  private getCumulativeLayoutShift(): number {
    const entries = performance.getEntriesByType("layout-shift");
    let clsValue = 0;

    entries.forEach((entry) => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    });

    return clsValue;
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.webVitals = [];
  }

  /**
   * Disconnect all observers
   */
  public disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

  /**
   * Get performance summary
   */
  public getSummary(): {
    totalMetrics: number;
    averageLoadTime: number;
    slowestResource: PerformanceMetric | null;
    webVitalsScore: {
      fcp: "good" | "needs-improvement" | "poor";
      lcp: "good" | "needs-improvement" | "poor";
      fid: "good" | "needs-improvement" | "poor";
      cls: "good" | "needs-improvement" | "poor";
    };
  } {
    const resourceMetrics = this.metrics.filter((m) => m.type === "resource");
    const navigationMetrics = this.metrics.filter(
      (m) => m.type === "navigation"
    );

    const averageLoadTime =
      navigationMetrics.length > 0
        ? navigationMetrics.reduce((sum, m) => sum + m.duration, 0) /
          navigationMetrics.length
        : 0;

    const slowestResource =
      resourceMetrics.length > 0
        ? resourceMetrics.reduce((slowest, current) =>
            current.duration > slowest.duration ? current : slowest
          )
        : null;

    // Web Vitals scoring
    const fcp = this.webVitals.find((v) => v.name === "FCP");
    const lcp = this.webVitals.find((v) => v.name === "LCP");
    const fid = this.webVitals.find((v) => v.name === "FID");
    const cls = this.webVitals.find((v) => v.name === "CLS");

    const score = (
      value: number,
      thresholds: { good: number; poor: number }
    ) => {
      if (value <= thresholds.good) return "good";
      if (value <= thresholds.poor) return "needs-improvement";
      return "poor";
    };

    return {
      totalMetrics: this.metrics.length,
      averageLoadTime,
      slowestResource,
      webVitalsScore: {
        fcp: fcp ? score(fcp.value, { good: 1800, poor: 3000 }) : "good",
        lcp: lcp ? score(lcp.value, { good: 2500, poor: 4000 }) : "good",
        fid: fid ? score(fid.value, { good: 100, poor: 300 }) : "good",
        cls: cls ? score(cls.value, { good: 0.1, poor: 0.25 }) : "good",
      },
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export utility functions
export const measurePerformance = <T>(
  name: string,
  fn: () => T | Promise<T>,
  metadata?: Record<string, any>
): T | Promise<T> => {
  return performanceMonitor.measureFunction(name, fn, metadata);
};

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    startMeasurement: (name: string, metadata?: Record<string, any>) =>
      performanceMonitor.startMeasurement(name, metadata),
    endMeasurement: (id: string) => performanceMonitor.endMeasurement(id),
    getMetrics: (filters?: any) => performanceMonitor.getMetrics(filters),
    getWebVitals: () => performanceMonitor.getWebVitals(),
    generateReport: () => performanceMonitor.generateReport(),
    getSummary: () => performanceMonitor.getSummary(),
  };
};
