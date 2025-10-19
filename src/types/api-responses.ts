/**
 * API Response Types
 * Centralized type definitions for all API responses
 */

import type { SiteContent, PaymentMethod } from './cms';
import type { Workflow, WorkflowOrder } from './workflow';
import type { SubscriptionPlan, UserSubscription, SubscriptionPayment } from './subscription';

// ============================================
// Common Response Types
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  count?: number;
  status?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// Auth & User Responses
// ============================================

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: ApiError | null;
}

export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface UserAccount {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  account_role: 'hoc_vien' | 'giang_vien' | 'quan_ly' | 'admin';
  account_status: 'active' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
}

// ============================================
// File Management Responses
// ============================================

export interface UserFile {
  id: string;
  user_id: string;
  file_name: string;
  file_type: 'video' | 'audio' | 'pdf' | 'image' | 'document' | 'archive' | 'other';
  file_category?: string;
  file_extension?: string;
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  is_public: boolean;
  destination_page?: string;
  view_count: number;
  share_count: number;
  download_count: number;
  upload_status: 'pending' | 'processing' | 'ready' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

// ============================================
// Payment Responses
// ============================================

export interface PaymentData {
  amount: number | string;
  payment_status: 'pending' | 'verified' | 'rejected' | 'expired';
  created_at: string;
}

export interface PaymentMethodResponse extends PaymentMethod {
  is_active: boolean;
  display_order: number;
}

export interface TransactionResponse {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Workflow Responses
// ============================================

export interface WorkflowSearchResponse {
  workflows: Workflow[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface WorkflowStatsResponse {
  totalWorkflows: number;
  publishedWorkflows: number;
  totalSales: number;
  totalRevenue: number;
  monthlyRevenue: number[];
  monthlyGrowth: number;
  topWorkflows: TopWorkflow[];
}

export interface TopWorkflow {
  id: string;
  workflow_name: string;
  purchase_count: number;
  revenue: number;
}

export interface OrderResponse extends WorkflowOrder {
  workflow?: Workflow;
  buyer?: UserAccount;
}

// ============================================
// Subscription Responses
// ============================================

export interface SubscriptionResponse {
  plan: SubscriptionPlan;
  subscription: UserSubscription | null;
  payment: SubscriptionPayment | null;
}

export interface SubscriptionStatsResponse {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  subscriptionsByPlan: {
    plan_name: string;
    count: number;
  }[];
}

// ============================================
// CMS Responses
// ============================================

export interface CMSContentResponse {
  contents: SiteContent[];
  total: number;
}

export interface PageContentResponse {
  page_key: string;
  sections: {
    [sectionKey: string]: {
      [contentKey: string]: {
        value: string;
        type: string;
        metadata?: any;
      };
    };
  };
}

// ============================================
// Dashboard & Analytics Responses
// ============================================

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingPayments: number;
  verifiedPayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalFiles: number;
  totalCourses: number;
  totalWorkflows: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: 'create' | 'update' | 'delete' | 'login' | 'logout';
  resource_type: string;
  resource_id?: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action_type: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  resource_type: 'workflow' | 'course' | 'payment_method' | 'site_content' | 'user';
  resource_id?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================
// Course Responses (for future use)
// ============================================

export interface Course {
  id: string;
  course_name: string;
  course_description?: string;
  instructor_id: string;
  category: string;
  price: number;
  is_free: boolean;
  thumbnail_url?: string;
  rating?: number;
  student_count: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  progress: number;
  completed_at?: string;
  status: 'active' | 'completed' | 'dropped';
}

// ============================================
// Notification Responses
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// ============================================
// Search & Filter Types
// ============================================

export interface SearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface FilterOptions {
  categories?: string[];
  priceRange?: [number, number];
  dateRange?: [string, string];
  status?: string[];
}

// ============================================
// Export all types
// ============================================

export type {
  // Re-export from other type files
  SiteContent,
  PaymentMethod,
  Workflow,
  WorkflowOrder,
  SubscriptionPlan,
  UserSubscription,
  SubscriptionPayment,
};
