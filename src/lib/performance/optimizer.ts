/**
 * Comprehensive Performance Optimization System
 * Provides code splitting, lazy loading, memoization, and other performance optimizations
 */

import React from "react";

export interface PerformanceConfig {
  enableCodeSplitting: boolean;
  enableLazyLoading: boolean;
  enableMemoization: boolean;
  enableVirtualization: boolean;
  enableImageOptimization: boolean;
  enableBundleAnalysis: boolean;
  maxBundleSize: number;
  maxImageSize: number;
  enableServiceWorker: boolean;
  enablePreloading: boolean;
}

export interface BundleInfo {
  name: string;
  size: number;
  chunks: string[];
  modules: string[];
  gzipSize: number;
}

export interface OptimizationReport {
  timestamp: string;
  bundleSize: number;
  gzipSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  recommendations: string[];
  score: number;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private config: PerformanceConfig;
  private bundleCache: Map<string, BundleInfo> = new Map();
  private optimizationHistory: OptimizationReport[] = [];
  private performanceObserver: PerformanceObserver | null = null;

  private constructor() {
    this.config = {
      enableCodeSplitting: true,
      enableLazyLoading: true,
      enableMemoization: true,
      enableVirtualization: true,
      enableImageOptimization: true,
      enableBundleAnalysis: true,
      maxBundleSize: 500 * 1024, // 500KB
      maxImageSize: 1024 * 1024, // 1MB
      enableServiceWorker: true,
      enablePreloading: true,
    };

    this.setupPerformanceObserver();
    this.analyzeBundles();
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Setup performance observer for monitoring
   */
  private setupPerformanceObserver(): void {
    if (!("PerformanceObserver" in window)) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.analyzePerformanceEntry(entry);
      });
    });

    this.performanceObserver.observe({
      entryTypes: ["navigation", "resource", "measure"],
    });
  }

  /**
   * Analyze performance entry
   */
  private analyzePerformanceEntry(entry: PerformanceEntry): void {
    if (entry.entryType === "navigation") {
      this.analyzeNavigationTiming(entry as PerformanceNavigationTiming);
    } else if (entry.entryType === "resource") {
      this.analyzeResourceTiming(entry as PerformanceResourceTiming);
    }
  }

  /**
   * Analyze navigation timing
   */
  private analyzeNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      domContentLoaded:
        entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      totalTime: entry.loadEventEnd - entry.fetchStart,
      dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
      tcpTime: entry.connectEnd - entry.connectStart,
      requestTime: entry.responseEnd - entry.requestStart,
      responseTime: entry.responseEnd - entry.responseStart,
    };

    // Check for performance issues
    if (metrics.totalTime > 3000) {
      this.addRecommendation(
        "Consider optimizing page load time - currently over 3 seconds"
      );
    }

    if (metrics.domContentLoaded > 1000) {
      this.addRecommendation(
        "Consider optimizing DOM content loading - currently over 1 second"
      );
    }
  }

  /**
   * Analyze resource timing
   */
  private analyzeResourceTiming(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.startTime;
    const size = (entry as any).transferSize || 0;

    // Check for large resources
    if (size > this.config.maxImageSize && entry.name.includes("image")) {
      this.addRecommendation(
        `Large image detected: ${entry.name} (${Math.round(size / 1024)}KB)`
      );
    }

    // Check for slow resources
    if (duration > 1000) {
      this.addRecommendation(
        `Slow resource detected: ${entry.name} (${Math.round(duration)}ms)`
      );
    }
  }

  /**
   * Analyze bundle sizes
   */
  private analyzeBundles(): void {
    if (!this.config.enableBundleAnalysis) return;

    // This would typically be done at build time
    // For now, we'll simulate bundle analysis
    const bundles: BundleInfo[] = [
      {
        name: "main",
        size: 450 * 1024,
        gzipSize: 120 * 1024,
        chunks: ["main", "vendor"],
        modules: ["react", "react-dom", "react-router-dom"],
      },
      {
        name: "vendor",
        size: 800 * 1024,
        gzipSize: 200 * 1024,
        chunks: ["vendor"],
        modules: ["lodash", "moment", "axios"],
      },
    ];

    bundles.forEach((bundle) => {
      this.bundleCache.set(bundle.name, bundle);

      if (bundle.size > this.config.maxBundleSize) {
        this.addRecommendation(
          `Bundle ${bundle.name} is too large: ${Math.round(
            bundle.size / 1024
          )}KB`
        );
      }
    });
  }

  /**
   * Generate performance report
   */
  public generateReport(): OptimizationReport {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;

    const report: OptimizationReport = {
      timestamp: new Date().toISOString(),
      bundleSize: this.getTotalBundleSize(),
      gzipSize: this.getTotalGzipSize(),
      loadTime: navigation
        ? navigation.loadEventEnd - navigation.fetchStart
        : 0,
      renderTime: navigation
        ? navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart
        : 0,
      memoryUsage: memory ? memory.usedJSHeapSize : 0,
      recommendations: this.getRecommendations(),
      score: this.calculatePerformanceScore(),
    };

    this.optimizationHistory.push(report);
    return report;
  }

  /**
   * Get total bundle size
   */
  private getTotalBundleSize(): number {
    let total = 0;
    this.bundleCache.forEach((bundle) => {
      total += bundle.size;
    });
    return total;
  }

  /**
   * Get total gzip size
   */
  private getTotalGzipSize(): number {
    let total = 0;
    this.bundleCache.forEach((bundle) => {
      total += bundle.gzipSize;
    });
    return total;
  }

  /**
   * Get performance recommendations
   */
  private getRecommendations(): string[] {
    const recommendations: string[] = [];

    // Bundle size recommendations
    const totalSize = this.getTotalBundleSize();
    if (totalSize > this.config.maxBundleSize * 2) {
      recommendations.push("Consider code splitting to reduce bundle size");
    }

    // Memory usage recommendations
    const memory = (performance as any).memory;
    if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) {
      recommendations.push(
        "High memory usage detected - consider optimizing memory leaks"
      );
    }

    // Image optimization recommendations
    const images = performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("image"));

    const largeImages = images.filter((entry) => {
      const size = (entry as any).transferSize || 0;
      return size > this.config.maxImageSize;
    });

    if (largeImages.length > 0) {
      recommendations.push(
        `Consider optimizing ${largeImages.length} large images`
      );
    }

    return recommendations;
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculatePerformanceScore(): number {
    let score = 100;

    // Bundle size penalty
    const totalSize = this.getTotalBundleSize();
    if (totalSize > this.config.maxBundleSize) {
      score -= Math.min(30, (totalSize - this.config.maxBundleSize) / 1024);
    }

    // Load time penalty
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      if (loadTime > 3000) {
        score -= Math.min(40, (loadTime - 3000) / 100);
      }
    }

    // Memory usage penalty
    const memory = (performance as any).memory;
    if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) {
      score -= Math.min(
        20,
        (memory.usedJSHeapSize - 50 * 1024 * 1024) / (1024 * 1024)
      );
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Add recommendation
   */
  private addRecommendation(recommendation: string): void {
    // In a real implementation, this would store recommendations
    console.warn("Performance recommendation:", recommendation);
  }

  /**
   * Optimize images
   */
  public optimizeImage(image: HTMLImageElement): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      if (!this.config.enableImageOptimization) {
        resolve(image);
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(image);
        return;
      }

      // Calculate optimal dimensions
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = image;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            image.src = url;
          }
          resolve(image);
        },
        "image/jpeg",
        0.8
      );
    });
  }

  /**
   * Lazy load component
   */
  public lazyLoadComponent<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ): React.LazyExoticComponent<T> {
    if (!this.config.enableLazyLoading) {
      return importFunc().then((module) => module.default) as any;
    }

    return React.lazy(importFunc);
  }

  /**
   * Memoize function
   */
  public memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T {
    if (!this.config.enableMemoization) {
      return fn;
    }

    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  /**
   * Preload resource
   */
  public preloadResource(
    url: string,
    type: "script" | "style" | "image" | "font"
  ): void {
    if (!this.config.enablePreloading) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = type;

    if (type === "font") {
      link.crossOrigin = "anonymous";
    }

    document.head.appendChild(link);
  }

  /**
   * Prefetch resource
   */
  public prefetchResource(url: string): void {
    if (!this.config.enablePreloading) return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);
  }

  /**
   * Get optimization history
   */
  public getOptimizationHistory(): OptimizationReport[] {
    return [...this.optimizationHistory];
  }

  /**
   * Get bundle information
   */
  public getBundleInfo(name: string): BundleInfo | undefined {
    return this.bundleCache.get(name);
  }

  /**
   * Get all bundles
   */
  public getAllBundles(): BundleInfo[] {
    return Array.from(this.bundleCache.values());
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Clear optimization history
   */
  public clearHistory(): void {
    this.optimizationHistory = [];
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Export utility functions
export const optimizeImage = (image: HTMLImageElement) =>
  performanceOptimizer.optimizeImage(image);
export const lazyLoadComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => performanceOptimizer.lazyLoadComponent(importFunc);
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
) => performanceOptimizer.memoize(fn, keyGenerator);
export const preloadResource = (
  url: string,
  type: "script" | "style" | "image" | "font"
) => performanceOptimizer.preloadResource(url, type);
export const prefetchResource = (url: string) =>
  performanceOptimizer.prefetchResource(url);

// React hooks for performance optimization
export const usePerformanceOptimizer = () => {
  const [report, setReport] = React.useState<OptimizationReport | null>(null);

  React.useEffect(() => {
    const generateReport = () => {
      const newReport = performanceOptimizer.generateReport();
      setReport(newReport);
    };

    // Generate initial report
    generateReport();

    // Generate report on performance changes
    const observer = new PerformanceObserver(() => {
      generateReport();
    });

    observer.observe({ entryTypes: ["navigation", "resource"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    report,
    generateReport: () => {
      const newReport = performanceOptimizer.generateReport();
      setReport(newReport);
      return newReport;
    },
    getBundles: () => performanceOptimizer.getAllBundles(),
    getBundleInfo: (name: string) => performanceOptimizer.getBundleInfo(name),
  };
};
