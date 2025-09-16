/**
 * Supabase Configuration và Database Schema
 * Tập trung vào việc setup database thực tế
 */

import { createClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  "https://byidgbgvnrfhujprzzge.supabase.co";
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          phone?: string;
          role: "student" | "instructor" | "admin";
          email_verified: boolean;
          email_verified_at?: string;
          last_login_at?: string;
          login_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          phone?: string;
          role?: "student" | "instructor" | "admin";
          email_verified?: boolean;
          email_verified_at?: string;
          last_login_at?: string;
          login_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          phone?: string;
          role?: "student" | "instructor" | "admin";
          email_verified?: boolean;
          email_verified_at?: string;
          last_login_at?: string;
          login_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          image_url?: string;
          instructor_id: string;
          category: string;
          level: "Cơ bản" | "Trung cấp" | "Nâng cao";
          duration: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          image_url?: string;
          instructor_id: string;
          category: string;
          level: "Cơ bản" | "Trung cấp" | "Nâng cao";
          duration: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          image_url?: string;
          instructor_id?: string;
          category?: string;
          level?: "Cơ bản" | "Trung cấp" | "Nâng cao";
          duration?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt?: string;
          image_url?: string;
          author_id: string;
          category: string;
          tags: string[];
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt?: string;
          image_url?: string;
          author_id: string;
          category: string;
          tags?: string[];
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          excerpt?: string;
          image_url?: string;
          author_id?: string;
          category?: string;
          tags?: string[];
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_courses: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress: number;
          completed: boolean;
          started_at: string;
          completed_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          progress?: number;
          completed?: boolean;
          started_at?: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          progress?: number;
          completed?: boolean;
          started_at?: string;
          completed_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          amount: number;
          status: "pending" | "completed" | "failed";
          payment_method: string;
          stripe_payment_intent_id?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          amount: number;
          status?: "pending" | "completed" | "failed";
          payment_method: string;
          stripe_payment_intent_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          amount?: number;
          status?: "pending" | "completed" | "failed";
          payment_method?: string;
          stripe_payment_intent_id?: string;
          created_at?: string;
        };
      };
      account_nam_long_center: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name?: string;
          role: "sinh_vien" | "doanh_nghiep" | "quan_ly" | "admin";
          plan: "free" | "student_299" | "business";
          provider?: string;
          is_paid: boolean;
          status: "pending" | "active" | "rejected";
          requested_role?: "sinh_vien" | "doanh_nghiep" | "quan_ly" | "admin";
          approved_by?: string;
          approved_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string;
          role?: "sinh_vien" | "doanh_nghiep" | "quan_ly" | "admin";
          plan?: "free" | "student_299" | "business";
          provider?: string;
          is_paid?: boolean;
          status?: "pending" | "active" | "rejected";
          requested_role?: "sinh_vien" | "doanh_nghiep" | "quan_ly" | "admin";
          approved_by?: string;
          approved_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string;
          role?: "sinh_vien" | "doanh_nghiep" | "quan_ly" | "admin";
          plan?: "free" | "student_299" | "business";
          provider?: string;
          is_paid?: boolean;
          status?: "pending" | "active" | "rejected";
          requested_role?: "sinh_vien" | "doanh_nghiep" | "quan_ly" | "admin";
          approved_by?: string;
          approved_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      managers: {
        Row: {
          id: string;
          email?: string;
          user_id?: string;
          full_name?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string;
          user_id?: string;
          full_name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          user_id?: string;
          full_name?: string;
          created_at?: string;
        };
      };
      manager_approvals: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name?: string;
          requested_role: "quan_ly";
          status: "pending" | "approved" | "rejected";
          reviewed_by?: string;
          reviewed_at?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string;
          requested_role: "quan_ly";
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string;
          reviewed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string;
          requested_role?: "quan_ly";
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string;
          reviewed_at?: string;
          created_at?: string;
        };
      };
      manager_notifications: {
        Row: {
          id: string;
          approval_id: string;
          type: "approved" | "rejected";
          payload?: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          approval_id: string;
          type: "approved" | "rejected";
          payload?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          approval_id?: string;
          type?: "approved" | "rejected";
          payload?: any;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Type-safe Supabase client
export type SupabaseClient = typeof supabase;

// Export types for use in components
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type UserCourse = Database["public"]["Tables"]["user_courses"]["Row"];
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
export type AccountNamLongCenter =
  Database["public"]["Tables"]["account_nam_long_center"]["Row"];
export type Manager = Database["public"]["Tables"]["managers"]["Row"];
export type ManagerApproval =
  Database["public"]["Tables"]["manager_approvals"]["Row"];
export type ManagerNotification =
  Database["public"]["Tables"]["manager_notifications"]["Row"];
