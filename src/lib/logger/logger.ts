/**
 * Centralized Logging Service
 * Replaces console.log with structured logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error | unknown;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000; // Keep last 1000 logs in memory

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === 'production',
      remoteEndpoint: process.env.REACT_APP_LOGGING_ENDPOINT,
      ...config,
    };
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  /**
   * Core logging function
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error | unknown
  ): void {
    // Check if log level is enabled
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error instanceof Error ? this.serializeError(error) : error,
    };

    // Add to in-memory logs
    this.logs.push(logEntry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Remote logging
    if (this.config.enableRemote && level === 'error') {
      this.logToRemote(logEntry);
    }
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const style = this.getConsoleStyle(entry.level);

    switch (entry.level) {
      case 'error':
        console.error(`%c${prefix}`, style, entry.message, entry.context, entry.error);
        break;
      case 'warn':
        console.warn(`%c${prefix}`, style, entry.message, entry.context);
        break;
      case 'info':
        console.info(`%c${prefix}`, style, entry.message, entry.context);
        break;
      case 'debug':
        console.debug(`%c${prefix}`, style, entry.message, entry.context);
        break;
    }
  }

  /**
   * Get console styling for log level
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      debug: 'color: #888; font-weight: normal',
      info: 'color: #2196F3; font-weight: bold',
      warn: 'color: #FF9800; font-weight: bold',
      error: 'color: #F44336; font-weight: bold',
    };
    return styles[level];
  }

  /**
   * Send log to remote endpoint
   */
  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fail silently for remote logging
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  /**
   * Serialize error object for logging
   */
  private serializeError(error: Error): Record<string, any> {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...error, // Include any custom properties
    };
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export { Logger };