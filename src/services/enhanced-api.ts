import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { config } from "./config";
import { TokenManager } from "./token-manager";
import {
  errorHandler,
  createErrorContext,
  isNetworkError,
  isTimeoutError,
} from "../lib/error-handler";

/**
 * Enhanced API service with comprehensive error handling, retry logic, and monitoring
 */
class EnhancedApiService {
  private api: AxiosInstance;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
    this.api = axios.create({
      baseURL: config.get("apiUrl"),
      timeout: 30000, // 30 seconds timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors with enhanced error handling
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token and request ID
    this.api.interceptors.request.use(
      (config) => {
        const token = TokenManager.getSessionToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers["X-Request-ID"] = this.generateRequestId();

        // Add timestamp for monitoring
        (config as any).metadata = {
          startTime: Date.now(),
          requestId: config.headers["X-Request-ID"],
        };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and retries
    this.api.interceptors.response.use(
      (response) => {
        // Log successful requests in development
        if (process.env.NODE_ENV === "development") {
          const duration =
            Date.now() - (response.config as any).metadata?.startTime;
          console.log(
            `API Success: ${response.config.method?.toUpperCase()} ${
              response.config.url
            } (${duration}ms)`
          );
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const context = createErrorContext(
          `${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
          "EnhancedApiService"
        );

        // Handle different types of errors
        if (isNetworkError(error)) {
          error.code = "NETWORK_ERROR";
        } else if (isTimeoutError(error)) {
          error.code = "TIMEOUT";
        }

        // Handle 401 errors (unauthorized) with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              originalRequest.headers.Authorization = `Bearer ${TokenManager.getSessionToken()}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            TokenManager.clearTokens();
            window.location.href = "/auth";
            return Promise.reject(refreshError);
          }
        }

        // Wrap error with context
        const wrappedError = errorHandler.wrapError(error, context);
        return Promise.reject(wrappedError);
      }
    );
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await axios.post(
        `${config.get("apiUrl")}/auth/refresh`,
        {
          refreshToken,
        }
      );

      if (response.data.success) {
        const { sessionToken, refreshToken: newRefreshToken } = response.data;
        TokenManager.setSessionTokens(
          sessionToken,
          newRefreshToken,
          24 * 60 * 60
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  /**
   * Execute request with retry logic and error handling
   */
  private async executeRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    operation: string,
    component?: string
  ): Promise<T> {
    const context = createErrorContext(operation, component);

    return errorHandler.executeWithRetry(
      async () => {
        const response = await requestFn();
        return response.data;
      },
      context,
      "api"
    );
  }

  /**
   * Generic GET request with enhanced error handling
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
    component?: string
  ): Promise<T> {
    return this.executeRequest(
      () => this.api.get<T>(url, config),
      `GET ${url}`,
      component
    );
  }

  /**
   * Generic POST request with enhanced error handling
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    component?: string
  ): Promise<T> {
    return this.executeRequest(
      () => this.api.post<T>(url, data, config),
      `POST ${url}`,
      component
    );
  }

  /**
   * Generic PUT request with enhanced error handling
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    component?: string
  ): Promise<T> {
    return this.executeRequest(
      () => this.api.put<T>(url, data, config),
      `PUT ${url}`,
      component
    );
  }

  /**
   * Generic DELETE request with enhanced error handling
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
    component?: string
  ): Promise<T> {
    return this.executeRequest(
      () => this.api.delete<T>(url, config),
      `DELETE ${url}`,
      component
    );
  }

  /**
   * Upload file with progress tracking and retry logic
   */
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    component?: string
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    return this.executeRequest(
      () =>
        this.api.post<T>(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        }),
      `UPLOAD ${url}`,
      component
    );
  }

  /**
   * Batch requests with concurrency control
   */
  async batch<T = any>(
    requests: Array<() => Promise<T>>,
    maxConcurrency: number = 5,
    component?: string
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];

      const promise = request()
        .then((result) => {
          results[i] = result;
        })
        .catch((error) => {
          const context = createErrorContext(`BATCH_REQUEST_${i}`, component);
          const wrappedError = errorHandler.wrapError(error, context);
          throw wrappedError;
        });

      executing.push(promise);

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex((p) => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Request deduplication - prevent duplicate requests
   */
  async deduplicatedRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.get<{ status: string; timestamp: string }>(
        "/health"
      );
      return response;
    } catch (error) {
      return {
        status: "error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get API metrics
   */
  getMetrics(): {
    pendingRequests: number;
    errorStats: any;
  } {
    return {
      pendingRequests: this.requestQueue.size,
      errorStats: errorHandler.getErrorStats(),
    };
  }

  /**
   * Clear request queue
   */
  clearQueue(): void {
    this.requestQueue.clear();
  }
}

// Export singleton instance
export const enhancedApi = new EnhancedApiService();

// Export types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
