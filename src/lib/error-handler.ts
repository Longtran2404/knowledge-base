/**
 * Comprehensive Error Handling System
 * Provides centralized error management, retry logic, and user-friendly error messages
 */

export interface ErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  timestamp: string;
  retryCount?: number;
  metadata?: Record<string, any>;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly context: ErrorContext;
  public readonly isRetryable: boolean;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: string,
    context: ErrorContext,
    isRetryable: boolean = false,
    originalError?: Error
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.context = context;
    this.isRetryable = isRetryable;
    this.originalError = originalError;
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private retryConfigs: Map<string, RetryConfig> = new Map();

  private constructor() {
    this.setupDefaultRetryConfigs();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupDefaultRetryConfigs(): void {
    // API calls retry config
    this.retryConfigs.set("api", {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      retryCondition: (error) => {
        return (
          error.response?.status >= 500 ||
          error.code === "NETWORK_ERROR" ||
          error.code === "TIMEOUT"
        );
      },
    });

    // Authentication retry config
    this.retryConfigs.set("auth", {
      maxRetries: 2,
      baseDelay: 500,
      maxDelay: 5000,
      backoffMultiplier: 2,
      retryCondition: (error) => {
        return error.response?.status === 401 || error.code === "TOKEN_EXPIRED";
      },
    });

    // File upload retry config
    this.retryConfigs.set("upload", {
      maxRetries: 5,
      baseDelay: 2000,
      maxDelay: 30000,
      backoffMultiplier: 1.5,
      retryCondition: (error) => {
        return error.response?.status >= 500 || error.code === "NETWORK_ERROR";
      },
    });
  }

  public setRetryConfig(operation: string, config: RetryConfig): void {
    this.retryConfigs.set(operation, config);
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    operationType: string = "api"
  ): Promise<T> {
    const config =
      this.retryConfigs.get(operationType) || this.retryConfigs.get("api")!;
    let lastError: any;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (attempt === config.maxRetries || !config.retryCondition?.(error)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );

        // Log retry attempt
        console.warn(
          `Retry attempt ${attempt + 1}/${config.maxRetries} for ${
            context.operation
          }`,
          {
            error: error.message,
            delay,
            context,
          }
        );

        // Wait before retry
        await this.delay(delay);
      }
    }

    // All retries failed, throw the last error
    throw this.wrapError(lastError, context, operationType);
  }

  public wrapError(
    error: any,
    context: ErrorContext,
    operationType: string = "api"
  ): AppError {
    const errorCode = this.getErrorCode(error);
    const isRetryable = this.isRetryableError(error, operationType);
    const userMessage = this.getUserFriendlyMessage(error, errorCode);

    const appError = new AppError(
      userMessage,
      errorCode,
      context,
      isRetryable,
      error
    );

    this.logError(appError);
    return appError;
  }

  private getErrorCode(error: any): string {
    if (error.response?.status) {
      return `HTTP_${error.response.status}`;
    }
    if (error.code) {
      return error.code;
    }
    if (error.name) {
      return error.name;
    }
    return "UNKNOWN_ERROR";
  }

  private isRetryableError(error: any, operationType: string): boolean {
    const config = this.retryConfigs.get(operationType);
    if (!config) return false;

    return config.retryCondition?.(error) || false;
  }

  private getUserFriendlyMessage(error: any, errorCode: string): string {
    const errorMessages: Record<string, string> = {
      HTTP_400: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.",
      HTTP_401: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      HTTP_403: "Bạn không có quyền thực hiện hành động này.",
      HTTP_404: "Không tìm thấy tài nguyên yêu cầu.",
      HTTP_429: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
      HTTP_500: "Lỗi máy chủ. Vui lòng thử lại sau.",
      HTTP_502: "Lỗi kết nối. Vui lòng thử lại sau.",
      HTTP_503: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",
      NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.",
      TIMEOUT: "Yêu cầu quá thời gian chờ. Vui lòng thử lại.",
      TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      VALIDATION_ERROR: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
      UNKNOWN_ERROR: "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.",
    };

    return errorMessages[errorCode] || errorMessages["UNKNOWN_ERROR"];
  }

  private logError(error: AppError): void {
    this.errorLog.push(error);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("AppError:", {
        message: error.message,
        code: error.code,
        context: error.context,
        stack: error.stack,
        originalError: error.originalError,
      });
    }

    // In production, you might want to send to a logging service
    // this.sendToLoggingService(error);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }

  public getErrorStats(): {
    totalErrors: number;
    errorsByCode: Record<string, number>;
    errorsByComponent: Record<string, number>;
    retryableErrors: number;
  } {
    const stats = {
      totalErrors: this.errorLog.length,
      errorsByCode: {} as Record<string, number>,
      errorsByComponent: {} as Record<string, number>,
      retryableErrors: 0,
    };

    this.errorLog.forEach((error) => {
      // Count by error code
      stats.errorsByCode[error.code] =
        (stats.errorsByCode[error.code] || 0) + 1;

      // Count by component
      if (error.context.component) {
        stats.errorsByComponent[error.context.component] =
          (stats.errorsByComponent[error.context.component] || 0) + 1;
      }

      // Count retryable errors
      if (error.isRetryable) {
        stats.retryableErrors++;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions
export const createErrorContext = (
  operation: string,
  component?: string,
  userId?: string,
  metadata?: Record<string, any>
): ErrorContext => ({
  operation,
  component,
  userId,
  timestamp: new Date().toISOString(),
  metadata,
});

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

export const isTimeoutError = (error: any): boolean => {
  return error.code === "ECONNABORTED" || error.message?.includes("timeout");
};

export const isServerError = (error: any): boolean => {
  return error.response?.status >= 500;
};

export const isClientError = (error: any): boolean => {
  return error.response?.status >= 400 && error.response?.status < 500;
};
