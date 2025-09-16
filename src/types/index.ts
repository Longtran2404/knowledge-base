/**
 * Unified types for the entire application
 * Consolidates all type definitions
 */

// Re-export existing types
export * from "./course";
export * from "./post";
export * from "./product";
export * from "./resource";
export * from "./spotlight";

// Common shared types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: UserRole;
  plan: UserPlan;
  isActive: boolean;
  lastLoginAt?: string;
}

export type UserRole =
  | "student"
  | "instructor"
  | "admin"
  | "manager";

export type UserPlan =
  | "free"
  | "student_299"
  | "business"
  | "premium"
  | "pro";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormState<T = any> {
  data: T;
  errors: Record<string, string[]>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Component Props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps extends BaseComponentProps {
  title?: string;
  description?: string;
}

// Filter and Search types
export interface FilterOptions {
  category?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchParams extends FilterOptions {
  query?: string;
  page?: number;
  limit?: number;
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  url?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Theme types
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
}

// Cart types (for e-commerce features)
export interface CartItem {
  id: string;
  type: "course" | "product";
  refId: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  discount?: number;
  finalTotal: number;
}

// Payment types
export interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "wallet";
  name: string;
  details: string;
  isDefault: boolean;
}

export interface Payment extends BaseEntity {
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  description: string;
  metadata?: Record<string, any>;
}

export type PaymentStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "cancelled"
  | "refunded";

// Activity/Analytics types
export interface UserActivity extends BaseEntity {
  userId: string;
  action: string;
  resource: {
    type: string;
    id: string;
    title?: string;
  };
  metadata?: Record<string, any>;
}

export interface Analytics {
  views: number;
  downloads: number;
  shares: number;
  likes: number;
  comments: number;
  rating: {
    average: number;
    count: number;
  };
}

// Settings types
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "friends";
    showEmail: boolean;
    showPhone: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    theme: ThemeMode;
  };
}

// System status types
export interface SystemStatus {
  api: "operational" | "degraded" | "down";
  database: "operational" | "degraded" | "down";
  storage: "operational" | "degraded" | "down";
  lastUpdated: string;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event types for analytics
export interface AppEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}