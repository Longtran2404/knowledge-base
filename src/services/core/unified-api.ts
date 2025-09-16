/**
 * Unified API Service
 * Combines features from api.ts and enhanced-api.ts
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { config } from "../config";
import { TokenManager } from "../token-manager";

// Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: ApiError;
}

export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Unified API service with comprehensive error handling, retry logic, and token management
 */
class UnifiedApiService {
  private api: AxiosInstance;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private defaultRetryConfig: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error) => {
      return (
        error.code === "NETWORK_ERROR" ||
        error.code === "TIMEOUT" ||
        (error.response?.status >= 500 && error.response?.status < 600)
      );
    }
  };

  constructor() {
    this.api = axios.create({
      baseURL: config.get("apiUrl"),
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token and deduplication
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = TokenManager.getSessionToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for monitoring
        (config as any).metadata = { startTime: Date.now() };

        return config;
      },
      (error) => {
        return Promise.reject(this.createApiError(error));
      }
    );

    // Response interceptor - handle common errors and token refresh
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log request duration for monitoring
        const duration = Date.now() - ((response.config as any).metadata?.startTime || 0);
        console.debug(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const newToken = TokenManager.getSessionToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            TokenManager.clearTokens();
            window.location.href = "/auth";
            return Promise.reject(this.createApiError(refreshError));
          }
        }

        return Promise.reject(this.createApiError(error));
      }
    );
  }

  /**
   * Create standardized API error
   */
  private createApiError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        code: error.response?.data?.code || error.code,
        status: error.response?.status,
        details: error.response?.data
      };
    }

    return {
      message: error.message || "An unexpected error occurred",
      code: "UNKNOWN_ERROR"
    };
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await this.api.post("/auth/refresh", {
      refresh_token: refreshToken
    });

    TokenManager.setSessionTokens(
      response.data.access_token,
      response.data.refresh_token,
      response.data.expires_in || 3600
    );
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retryConfig: RetryConfig = this.defaultRetryConfig
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
      try {
        const response = await requestFn();
        return response.data;
      } catch (error) {
        lastError = error;

        if (
          attempt < retryConfig.retries &&
          retryConfig.retryCondition?.(error)
        ) {
          await this.wait(retryConfig.retryDelay * Math.pow(2, attempt));
          continue;
        }

        break;
      }
    }

    throw lastError;
  }

  /**
   * Deduplicate identical requests
   */
  private async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  /**
   * Wait utility
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const key = `GET:${url}:${JSON.stringify(config)}`;
    return this.deduplicateRequest(key, () =>
      this.executeWithRetry(() => this.api.get<T>(url, config))
    );
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.api.post<T>(url, data, config));
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.api.put<T>(url, data, config));
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.api.patch<T>(url, data, config));
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.api.delete<T>(url, config));
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    return this.executeWithRetry(() =>
      this.api.post<T>(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(progress);
          }
        },
      })
    );
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.requestQueue.clear();
  }
}

// Export singleton instance
export const unifiedApi = new UnifiedApiService();
export default unifiedApi;