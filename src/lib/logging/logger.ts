/**
 * Comprehensive Logging and Monitoring System
 * Provides structured logging, performance monitoring, and analytics
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  metadata?: Record<string, any>;
  stack?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface LogContext {
  component: string;
  operation: string;
  file?: string;
  line?: number;
  function?: string;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

export interface UserAction {
  id: string;
  userId: string;
  action: string;
  component: string;
  timestamp: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private userActions: UserAction[] = [];
  private sessionId: string;
  private currentUserId?: string;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandling();
    this.setupPerformanceMonitoring();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set current user ID for logging context
   */
  public setUserId(userId: string | undefined): void {
    this.currentUserId = userId;
  }

  /**
   * Set log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log debug message
   */
  public debug(
    message: string,
    context: LogContext,
    metadata?: Record<string, any>
  ): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  /**
   * Log info message
   */
  public info(
    message: string,
    context: LogContext,
    metadata?: Record<string, any>
  ): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  /**
   * Log warning message
   */
  public warn(
    message: string,
    context: LogContext,
    metadata?: Record<string, any>
  ): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  /**
   * Log error message
   */
  public error(
    message: string,
    context: LogContext,
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    this.log(
      LogLevel.ERROR,
      message,
      context,
      {
        ...metadata,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      },
      error?.stack
    );
  }

  /**
   * Log fatal error message
   */
  public fatal(
    message: string,
    context: LogContext,
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    this.log(
      LogLevel.FATAL,
      message,
      context,
      {
        ...metadata,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      },
      error?.stack
    );
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context: LogContext,
    metadata?: Record<string, any>,
    stack?: string
  ): void {
    if (level < this.logLevel) {
      return;
    }

    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      metadata,
      stack,
      userId: this.currentUserId,
      sessionId: this.sessionId,
    };

    this.logs.push(logEntry);

    // Console output based on level
    this.outputToConsole(logEntry);

    // Send to external logging service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToExternalService(logEntry);
    }

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  /**
   * Start performance measurement
   */
  public startPerformanceMeasurement(
    name: string,
    metadata?: Record<string, any>
  ): string {
    const id = this.generateId();
    const metric: PerformanceMetric = {
      id,
      name,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      metadata,
    };

    this.performanceMetrics.push(metric);
    return id;
  }

  /**
   * End performance measurement
   */
  public endPerformanceMeasurement(id: string): PerformanceMetric | null {
    const metric = this.performanceMetrics.find((m) => m.id === id);
    if (!metric) {
      this.warn(
        "Performance measurement not found",
        {
          component: "Logger",
          operation: "endPerformanceMeasurement",
        },
        { id }
      );
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log slow operations
    if (metric.duration > 1000) {
      // 1 second
      this.warn(
        "Slow operation detected",
        {
          component: "Logger",
          operation: "performanceMeasurement",
        },
        {
          name: metric.name,
          duration: metric.duration,
          metadata: metric.metadata,
        }
      );
    }

    return metric;
  }

  /**
   * Log user action
   */
  public logUserAction(
    action: string,
    component: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.currentUserId) {
      this.warn("Cannot log user action without user ID", {
        component: "Logger",
        operation: "logUserAction",
      });
      return;
    }

    const userAction: UserAction = {
      id: this.generateId(),
      userId: this.currentUserId,
      action,
      component,
      timestamp: new Date().toISOString(),
      metadata,
      sessionId: this.sessionId,
    };

    this.userActions.push(userAction);

    // Keep only last 500 user actions in memory
    if (this.userActions.length > 500) {
      this.userActions = this.userActions.slice(-500);
    }
  }

  /**
   * Get logs with filtering
   */
  public getLogs(filters?: {
    level?: LogLevel;
    component?: string;
    operation?: string;
    userId?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level !== undefined) {
        filteredLogs = filteredLogs.filter(
          (log) => log.level === filters.level
        );
      }
      if (filters.component) {
        filteredLogs = filteredLogs.filter(
          (log) => log.context.component === filters.component
        );
      }
      if (filters.operation) {
        filteredLogs = filteredLogs.filter(
          (log) => log.context.operation === filters.operation
        );
      }
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(
          (log) => log.userId === filters.userId
        );
      }
      if (filters.startTime) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp >= filters.startTime!
        );
      }
      if (filters.endTime) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp <= filters.endTime!
        );
      }
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(-filters.limit);
      }
    }

    return filteredLogs;
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(filters?: {
    name?: string;
    minDuration?: number;
    maxDuration?: number;
    limit?: number;
  }): PerformanceMetric[] {
    let filteredMetrics = [...this.performanceMetrics];

    if (filters) {
      if (filters.name) {
        filteredMetrics = filteredMetrics.filter(
          (metric) => metric.name === filters.name
        );
      }
      if (filters.minDuration !== undefined) {
        filteredMetrics = filteredMetrics.filter(
          (metric) => metric.duration >= filters.minDuration!
        );
      }
      if (filters.maxDuration !== undefined) {
        filteredMetrics = filteredMetrics.filter(
          (metric) => metric.duration <= filters.maxDuration!
        );
      }
      if (filters.limit) {
        filteredMetrics = filteredMetrics.slice(-filters.limit);
      }
    }

    return filteredMetrics;
  }

  /**
   * Get user actions
   */
  public getUserActions(filters?: {
    userId?: string;
    action?: string;
    component?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
  }): UserAction[] {
    let filteredActions = [...this.userActions];

    if (filters) {
      if (filters.userId) {
        filteredActions = filteredActions.filter(
          (action) => action.userId === filters.userId
        );
      }
      if (filters.action) {
        filteredActions = filteredActions.filter(
          (action) => action.action === filters.action
        );
      }
      if (filters.component) {
        filteredActions = filteredActions.filter(
          (action) => action.component === filters.component
        );
      }
      if (filters.startTime) {
        filteredActions = filteredActions.filter(
          (action) => action.timestamp >= filters.startTime!
        );
      }
      if (filters.endTime) {
        filteredActions = filteredActions.filter(
          (action) => action.timestamp <= filters.endTime!
        );
      }
      if (filters.limit) {
        filteredActions = filteredActions.slice(-filters.limit);
      }
    }

    return filteredActions;
  }

  /**
   * Get analytics summary
   */
  public getAnalyticsSummary(): {
    totalLogs: number;
    logsByLevel: Record<string, number>;
    logsByComponent: Record<string, number>;
    totalPerformanceMetrics: number;
    averagePerformance: Record<string, number>;
    totalUserActions: number;
    actionsByType: Record<string, number>;
    errorRate: number;
  } {
    const summary = {
      totalLogs: this.logs.length,
      logsByLevel: {} as Record<string, number>,
      logsByComponent: {} as Record<string, number>,
      totalPerformanceMetrics: this.performanceMetrics.length,
      averagePerformance: {} as Record<string, number>,
      totalUserActions: this.userActions.length,
      actionsByType: {} as Record<string, number>,
      errorRate: 0,
    };

    // Analyze logs
    this.logs.forEach((log) => {
      const levelName = LogLevel[log.level];
      summary.logsByLevel[levelName] =
        (summary.logsByLevel[levelName] || 0) + 1;
      summary.logsByComponent[log.context.component] =
        (summary.logsByComponent[log.context.component] || 0) + 1;
    });

    // Calculate error rate
    const errorLogs = this.logs.filter(
      (log) => log.level >= LogLevel.ERROR
    ).length;
    summary.errorRate =
      this.logs.length > 0 ? (errorLogs / this.logs.length) * 100 : 0;

    // Analyze performance metrics
    const metricsByName: Record<string, number[]> = {};
    this.performanceMetrics.forEach((metric) => {
      if (!metricsByName[metric.name]) {
        metricsByName[metric.name] = [];
      }
      metricsByName[metric.name].push(metric.duration);
    });

    Object.keys(metricsByName).forEach((name) => {
      const durations = metricsByName[name];
      summary.averagePerformance[name] =
        durations.reduce((sum, d) => sum + d, 0) / durations.length;
    });

    // Analyze user actions
    this.userActions.forEach((action) => {
      summary.actionsByType[action.action] =
        (summary.actionsByType[action.action] || 0) + 1;
    });

    return summary;
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
    this.performanceMetrics = [];
    this.userActions = [];
  }

  /**
   * Export logs as JSON
   */
  public exportLogs(): string {
    return JSON.stringify(
      {
        logs: this.logs,
        performanceMetrics: this.performanceMetrics,
        userActions: this.userActions,
        sessionId: this.sessionId,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.error(
        "Unhandled promise rejection",
        {
          component: "Global",
          operation: "unhandledRejection",
        },
        event.reason
      );
    });

    // Handle global errors
    window.addEventListener("error", (event) => {
      this.error(
        "Global error",
        {
          component: "Global",
          operation: "globalError",
        },
        event.error,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    });
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor page load performance
    window.addEventListener("load", () => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.info(
          "Page load performance",
          {
            component: "Performance",
            operation: "pageLoad",
          },
          {
            domContentLoaded:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
          }
        );
      }
    });

    // Monitor memory usage
    if ("memory" in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.debug(
          "Memory usage",
          {
            component: "Performance",
            operation: "memoryUsage",
          },
          {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          }
        );
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Output to console with appropriate styling
   */
  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const levelName = LogLevel[logEntry.level];
    const context = `${logEntry.context.component}:${logEntry.context.operation}`;

    const message = `[${timestamp}] ${levelName} ${context}: ${logEntry.message}`;

    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(message, logEntry.metadata);
        break;
      case LogLevel.INFO:
        console.info(message, logEntry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(message, logEntry.metadata);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, logEntry.metadata, logEntry.stack);
        break;
    }
  }

  /**
   * Send to external logging service
   */
  private sendToExternalService(logEntry: LogEntry): void {
    // In a real application, you would send to services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging endpoint

    // For now, we'll just store in localStorage for demo
    try {
      const existingLogs = JSON.parse(localStorage.getItem("app_logs") || "[]");
      existingLogs.push(logEntry);

      // Keep only last 100 logs in localStorage
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }

      localStorage.setItem("app_logs", JSON.stringify(existingLogs));
    } catch (error) {
      console.error("Failed to store log in localStorage:", error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export utility functions
export const createLogContext = (
  component: string,
  operation: string,
  file?: string,
  line?: number,
  functionName?: string
): LogContext => ({
  component,
  operation,
  file,
  line,
  function: functionName,
});

// Performance measurement decorator
export const measurePerformance = (
  name: string,
  metadata?: Record<string, any>
) => {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const measurementId = logger.startPerformanceMeasurement(name, metadata);
      try {
        const result = await method.apply(this, args);
        return result;
      } finally {
        logger.endPerformanceMeasurement(measurementId);
      }
    };
  };
};

// React hook for logging
export const useLogger = (component: string) => {
  const logContext = (operation: string) =>
    createLogContext(component, operation);

  return {
    debug: (
      message: string,
      operation: string,
      metadata?: Record<string, any>
    ) => logger.debug(message, logContext(operation), metadata),
    info: (
      message: string,
      operation: string,
      metadata?: Record<string, any>
    ) => logger.info(message, logContext(operation), metadata),
    warn: (
      message: string,
      operation: string,
      metadata?: Record<string, any>
    ) => logger.warn(message, logContext(operation), metadata),
    error: (
      message: string,
      operation: string,
      error?: Error,
      metadata?: Record<string, any>
    ) => logger.error(message, logContext(operation), error, metadata),
    logUserAction: (action: string, metadata?: Record<string, any>) =>
      logger.logUserAction(action, component, metadata),
  };
};
