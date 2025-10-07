/**
 * User-related type definitions
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "student" | "teacher" | "admin";
  subscriptionStatus: "free" | "premium" | "business";
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isEmailVerified: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  skills?: string[];
  interests?: string[];
  createdAt: string;
  updatedAt: string;
  // Membership fields
  membership_type?: "free" | "member" | "premium";
  membership_status?: "active" | "expired" | "suspended" | "cancelled";
  membership_started_at?: string;
  membership_expires_at?: string;
  auto_renewal?: boolean;
  payment_method_saved?: boolean;
  // Additional fields
  full_name?: string;
  phone?: string;
  address?: string;
  role?: string;
}

export interface UserStats {
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  certificates: number;
  achievements: string[];
  streak: number;
  lastActivity: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  plan: "free" | "premium" | "business";
  status: "active" | "cancelled" | "expired" | "pending";
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  features: string[];
  price: number;
  currency: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type:
    | "login"
    | "logout"
    | "course_start"
    | "course_complete"
    | "purchase"
    | "profile_update";
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}
