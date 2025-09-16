import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { config } from "./config";
import { TokenManager } from "./token-manager";

/**
 * API service for handling HTTP requests
 * Includes automatic token management and error handling
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.get("apiUrl"),
      timeout: 10000,
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
    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = TokenManager.getSessionToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle auth errors
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Try to refresh token
          const refreshToken = TokenManager.getRefreshToken();
          if (refreshToken) {
            try {
              const response = await this.post("/auth/refresh", {
                refreshToken,
              });

              if (response.data.success) {
                const { sessionToken, refreshToken: newRefreshToken } =
                  response.data;
                TokenManager.setSessionTokens(
                  sessionToken,
                  newRefreshToken,
                  24 * 60 * 60
                );

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${sessionToken}`;
                return this.api(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect to login
              TokenManager.clearTokens();
              window.location.href = "/auth";
            }
          } else {
            // No refresh token, redirect to login
            TokenManager.clearTokens();
            window.location.href = "/auth";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  /**
   * Generic POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  /**
   * Upload file
   */
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    return this.api.post<T>(url, formData, {
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
    });
  }

  /**
   * Auth specific methods
   */
  async login(email: string, password: string) {
    return this.post("/auth/login", { email, password });
  }

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
    plan?: string;
  }) {
    return this.post("/auth/register", userData);
  }

  async logout() {
    return this.post("/auth/logout");
  }

  async refreshToken(refreshToken: string) {
    return this.post("/auth/refresh", { refreshToken });
  }

  /**
   * Subscription specific methods
   */
  async getSubscriptionStatus() {
    return this.get("/subscription/status");
  }

  async createSubscription(planData: {
    plan: string;
    paymentMethodId: string;
  }) {
    return this.post("/subscription/create", planData);
  }

  async cancelSubscription() {
    return this.post("/subscription/cancel");
  }

  async updateSubscription(planData: { plan: string }) {
    return this.put("/subscription/update", planData);
  }

  /**
   * User specific methods
   */
  async getUserProfile() {
    return this.get("/user/profile");
  }

  async updateUserProfile(profileData: any) {
    return this.put("/user/profile", profileData);
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.post("/user/change-password", passwordData);
  }

  /**
   * Payment specific methods
   */
  async createPaymentIntent(amount: number, currency: string = "vnd") {
    return this.post("/payment/create-intent", { amount, currency });
  }

  async confirmPayment(paymentIntentId: string) {
    return this.post("/payment/confirm", { paymentIntentId });
  }

  async getPaymentHistory() {
    return this.get("/payment/history");
  }
}

// Export singleton instance
export const api = new ApiService();

// Export types for use in other files
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
