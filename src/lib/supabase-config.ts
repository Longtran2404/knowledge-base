/**
 * Supabase Configuration và Database Schema
 * Tập trung vào việc setup database thực tế với best practices mới nhất
 */

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Environment variables với validation
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `
    ❌ SUPABASE CONFIGURATION ERROR ❌

    Missing required environment variables:
    ${!supabaseUrl ? '- REACT_APP_SUPABASE_URL' : ''}
    ${!supabaseAnonKey ? '- REACT_APP_SUPABASE_ANON_KEY' : ''}

    📝 To fix this:
    1. Create a .env file in the project root
    2. Add your Supabase credentials:
       REACT_APP_SUPABASE_URL=https://your-project.supabase.co
       REACT_APP_SUPABASE_ANON_KEY=your-anon-key
    3. Restart the development server

    📚 See SUPABASE_CONNECTION_FIX.md for detailed instructions

    ⚠️  Running in OFFLINE MODE - Supabase features disabled
  `;

  console.warn(errorMessage);

  // In production, throw error. In development, show helpful message
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Supabase configuration is required');
  }
}

// Check if Supabase URL is reachable (only in development)
if (process.env.NODE_ENV === 'development' && supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
  const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];
  if (projectRef) {
    console.log(`🔍 Checking Supabase connection to project: ${projectRef}...`);

    // Test connection in background (non-blocking)
    fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
      .then(res => {
        if (res.ok) {
          console.log('✅ Supabase connection successful!');
        } else {
          console.warn(`⚠️  Supabase responded with status: ${res.status}`);
        }
      })
      .catch(err => {
        console.error('❌ Cannot connect to Supabase:', err.message);
        console.error(`
⚠️  SUPABASE CONNECTION FAILED

Possible reasons:
1. Project is still being provisioned (wait 5-10 minutes if just created)
2. Project URL is incorrect - check https://supabase.com/dashboard
3. Project has been paused - resume it from dashboard
4. Network/firewall blocking connection
5. DNS has not propagated yet (for new projects)

Current URL: ${supabaseUrl}

💡 Verify your project exists at: https://supabase.com/dashboard/projects
        `);
      });
  }
}

// Create Supabase client với configuration tối ưu cho persistence
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce", // Enhanced security với PKCE flow
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      // Tăng thời gian refresh token để session tồn tại lâu hơn
      storageKey: 'sb-nlc-auth-token',
      debug: process.env.NODE_ENV === 'development', // Enable debug in dev
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        "X-Client-Info": "namlongcenter@1.0.0",
        "X-Client-Version": "1.0.0",
      },
    },
  }
);

// Database Types
export interface Database {
  public: {
    Tables: {
      nlc_accounts: {
        Row: {
          id: string;
          email: string;
          user_id: string;
          full_name: string;
          display_name?: string;
          avatar_url?: string;
          phone?: string;
          bio?: string;
          account_role: "sinh_vien" | "giang_vien" | "quan_ly" | "admin";
          membership_plan: "free" | "basic" | "premium" | "vip" | "business";
          account_status: "active" | "inactive" | "suspended" | "pending_approval";
          is_paid: boolean;
          is_verified: boolean;
          auth_provider: "email" | "google" | "facebook";
          last_login_at?: string;
          login_count: number;
          password_changed_at?: string;
          membership_expires_at?: string;
          membership_type?: "free" | "basic" | "premium" | "vip";
          approved_by?: string;
          approved_at?: string;
          rejected_reason?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          user_id: string;
          full_name: string;
          display_name?: string;
          avatar_url?: string;
          phone?: string;
          bio?: string;
          account_role?: "sinh_vien" | "giang_vien" | "quan_ly" | "admin";
          membership_plan?: "free" | "basic" | "premium" | "vip" | "business";
          account_status?: "active" | "inactive" | "suspended" | "pending_approval";
          is_paid?: boolean;
          is_verified?: boolean;
          auth_provider?: "email" | "google" | "facebook";
          last_login_at?: string;
          login_count?: number;
          password_changed_at?: string;
          membership_expires_at?: string;
          membership_type?: "free" | "basic" | "premium" | "vip";
          approved_by?: string;
          approved_at?: string;
          rejected_reason?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          user_id?: string;
          full_name?: string;
          display_name?: string;
          avatar_url?: string;
          phone?: string;
          bio?: string;
          account_role?: "sinh_vien" | "giang_vien" | "quan_ly" | "admin";
          membership_plan?: "free" | "basic" | "premium" | "vip" | "business";
          account_status?: "active" | "inactive" | "suspended" | "pending_approval";
          is_paid?: boolean;
          is_verified?: boolean;
          auth_provider?: "email" | "google" | "facebook";
          last_login_at?: string;
          login_count?: number;
          password_changed_at?: string;
          membership_expires_at?: string;
          membership_type?: "free" | "basic" | "premium" | "vip";
          approved_by?: string;
          approved_at?: string;
          rejected_reason?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
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
      products: {
        Row: {
          id: string;
          name: string;
          description?: string;
          price: number;
          image_url?: string;
          category?: string;
          stock_quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price: number;
          image_url?: string;
          category?: string;
          stock_quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          image_url?: string;
          category?: string;
          stock_quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      nlc_cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          product_type: string;
          product_name: string;
          product_price: number;
          quantity: number;
          product_image?: string;
          product_metadata?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          product_type?: string;
          product_name: string;
          product_price?: number;
          quantity?: number;
          product_image?: string;
          product_metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          product_type?: string;
          product_name?: string;
          product_price?: number;
          quantity?: number;
          product_image?: string;
          product_metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      nlc_user_files: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          original_filename: string;
          file_path: string;
          file_type: string;
          mime_type: string;
          file_size: number;
          description?: string;
          tags?: string[];
          is_public: boolean;
          download_count: number;
          upload_progress: number;
          status: string;
          thumbnail_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          original_filename: string;
          file_path: string;
          file_type?: string;
          mime_type: string;
          file_size?: number;
          description?: string;
          tags?: string[];
          is_public?: boolean;
          download_count?: number;
          upload_progress?: number;
          status?: string;
          thumbnail_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          original_filename?: string;
          file_path?: string;
          file_type?: string;
          mime_type?: string;
          file_size?: number;
          description?: string;
          tags?: string[];
          is_public?: boolean;
          download_count?: number;
          upload_progress?: number;
          status?: string;
          thumbnail_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_activities: {
        Row: {
          id: string;
          user_id: string;
          action_type:
            | "login"
            | "logout"
            | "register"
            | "course_purchase"
            | "course_start"
            | "course_complete"
            | "file_upload"
            | "file_download"
            | "profile_update"
            | "password_change"
            | "payment"
            | "other";
          description: string;
          resource_type?:
            | "course"
            | "file"
            | "blog_post"
            | "product"
            | "payment"
            | "user";
          resource_id?: string;
          metadata?: any;
          ip_address?: string;
          user_agent?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_type:
            | "login"
            | "logout"
            | "register"
            | "course_purchase"
            | "course_start"
            | "course_complete"
            | "file_upload"
            | "file_download"
            | "profile_update"
            | "password_change"
            | "payment"
            | "other";
          description: string;
          resource_type?:
            | "course"
            | "file"
            | "blog_post"
            | "product"
            | "payment"
            | "user";
          resource_id?: string;
          metadata?: any;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_type?:
            | "login"
            | "logout"
            | "register"
            | "course_purchase"
            | "course_start"
            | "course_complete"
            | "file_upload"
            | "file_download"
            | "profile_update"
            | "password_change"
            | "payment"
            | "other";
          description?: string;
          resource_type?:
            | "course"
            | "file"
            | "blog_post"
            | "product"
            | "payment"
            | "user";
          resource_id?: string;
          metadata?: any;
          ip_address?: string;
          user_agent?: string;
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
export type SupabaseClientType = typeof supabase;

// Export types for use in components
export type NLCAccount = Database["public"]["Tables"]["nlc_accounts"]["Row"];
export type NLCAccountInsert = Database["public"]["Tables"]["nlc_accounts"]["Insert"];
export type NLCAccountUpdate = Database["public"]["Tables"]["nlc_accounts"]["Update"];
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
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type NLCCartItem = Database["public"]["Tables"]["nlc_cart_items"]["Row"];
export type NLCCartItemInsert = Database["public"]["Tables"]["nlc_cart_items"]["Insert"];
export type NLCCartItemUpdate = Database["public"]["Tables"]["nlc_cart_items"]["Update"];
export type NLCUserFile = Database["public"]["Tables"]["nlc_user_files"]["Row"];
export type NLCUserFileInsert = Database["public"]["Tables"]["nlc_user_files"]["Insert"];
export type NLCUserFileUpdate = Database["public"]["Tables"]["nlc_user_files"]["Update"];
export type UserActivity =
  Database["public"]["Tables"]["user_activities"]["Row"];
export type UserActivityInsert =
  Database["public"]["Tables"]["user_activities"]["Insert"];
export type UserActivityUpdate =
  Database["public"]["Tables"]["user_activities"]["Update"];
