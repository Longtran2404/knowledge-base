/**
 * Centralized Error Handling System
 * Provides consistent error handling across the application
 */

export type ErrorCode =
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'DATABASE_ERROR'
  | 'PAYMENT_ERROR'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'UNAUTHORIZED'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  context?: Record<string, any>;
  originalError?: Error | unknown;
  timestamp: string;
  userMessage?: string; // Message safe to show to users
}

/**
 * Custom Application Error class
 * Extends Error with additional context and metadata
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly context?: Record<string, any>;
  public readonly originalError?: Error | unknown;
  public readonly timestamp: string;
  public readonly userMessage: string;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      statusCode?: number;
      context?: Record<string, any>;
      originalError?: Error | unknown;
      userMessage?: string;
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = options?.statusCode || this.getDefaultStatusCode(code);
    this.context = options?.context;
    this.originalError = options?.originalError;
    this.timestamp = new Date().toISOString();
    this.userMessage = options?.userMessage || this.getDefaultUserMessage(code);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  private getDefaultStatusCode(code: ErrorCode): number {
    const statusCodeMap: Record<ErrorCode, number> = {
      AUTH_ERROR: 401,
      VALIDATION_ERROR: 400,
      NETWORK_ERROR: 503,
      DATABASE_ERROR: 500,
      PAYMENT_ERROR: 402,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      UNAUTHORIZED: 401,
      SERVER_ERROR: 500,
      UNKNOWN_ERROR: 500,
    };
    return statusCodeMap[code] || 500;
  }

  private getDefaultUserMessage(code: ErrorCode): string {
    const messageMap: Record<ErrorCode, string> = {
      AUTH_ERROR: 'Có lỗi xác thực. Vui lòng đăng nhập lại.',
      VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
      NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      DATABASE_ERROR: 'Có lỗi khi truy cập dữ liệu. Vui lòng thử lại sau.',
      PAYMENT_ERROR: 'Có lỗi trong quá trình thanh toán. Vui lòng thử lại.',
      NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
      FORBIDDEN: 'Bạn không có quyền truy cập tài nguyên này.',
      UNAUTHORIZED: 'Bạn cần đăng nhập để tiếp tục.',
      SERVER_ERROR: 'Có lỗi máy chủ. Vui lòng thử lại sau.',
      UNKNOWN_ERROR: 'Có lỗi không xác định. Vui lòng thử lại sau.',
    };
    return messageMap[code] || 'Có lỗi xảy ra. Vui lòng thử lại.';
  }

  /**
   * Convert error to JSON for logging or API responses
   */
  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      userMessage: this.userMessage,
    };
  }

  /**
   * Check if error is instance of AppError
   */
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}

/**
 * Error Handler Utility
 * Converts various error types into AppError
 */
export class ErrorHandler {
  /**
   * Convert unknown error to AppError
   */
  static handle(error: unknown, context?: Record<string, any>): AppError {
    // Already an AppError
    if (AppError.isAppError(error)) {
      return error;
    }

    // Standard Error
    if (error instanceof Error) {
      return new AppError('UNKNOWN_ERROR', error.message, {
        originalError: error,
        context,
      });
    }

    // String error
    if (typeof error === 'string') {
      return new AppError('UNKNOWN_ERROR', error, { context });
    }

    // Object with message
    if (error && typeof error === 'object' && 'message' in error) {
      return new AppError('UNKNOWN_ERROR', String(error.message), {
        originalError: error,
        context,
      });
    }

    // Unknown error type
    return new AppError('UNKNOWN_ERROR', 'An unexpected error occurred', {
      originalError: error,
      context,
    });
  }

  /**
   * Handle Supabase errors
   */
  static handleSupabaseError(error: any, context?: Record<string, any>): AppError {
    if (!error) {
      return new AppError('UNKNOWN_ERROR', 'Unknown Supabase error', { context });
    }

    // Auth errors
    if (error.status === 401 || error.message?.includes('auth')) {
      return new AppError('AUTH_ERROR', error.message || 'Authentication failed', {
        statusCode: 401,
        originalError: error,
        context,
      });
    }

    // Database errors
    if (error.code?.startsWith('P') || error.code?.startsWith('23')) {
      return new AppError('DATABASE_ERROR', error.message || 'Database operation failed', {
        statusCode: 500,
        originalError: error,
        context: { ...context, errorCode: error.code },
      });
    }

    // Not found
    if (error.status === 404 || error.code === 'PGRST116') {
      return new AppError('NOT_FOUND', error.message || 'Resource not found', {
        statusCode: 404,
        originalError: error,
        context,
      });
    }

    // Network errors
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return new AppError('NETWORK_ERROR', 'Network request failed', {
        originalError: error,
        context,
      });
    }

    return new AppError('DATABASE_ERROR', error.message || 'Database error', {
      originalError: error,
      context,
    });
  }

  /**
   * Handle payment errors
   */
  static handlePaymentError(error: any, context?: Record<string, any>): AppError {
    const message = error?.message || 'Payment processing failed';
    return new AppError('PAYMENT_ERROR', message, {
      originalError: error,
      context,
      userMessage: 'Có lỗi trong quá trình thanh toán. Vui lòng kiểm tra thông tin thẻ và thử lại.',
    });
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    message: string,
    context?: Record<string, any>
  ): AppError {
    return new AppError('VALIDATION_ERROR', message, {
      statusCode: 400,
      context,
      userMessage: `Dữ liệu không hợp lệ: ${message}`,
    });
  }
}

/**
 * Error Response for API
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    userMessage: string;
    timestamp: string;
    details?: Record<string, any>;
  };
}

/**
 * Convert AppError to API error response
 */
export function toErrorResponse(error: AppError): ErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      timestamp: error.timestamp,
      details: error.context,
    },
  };
}