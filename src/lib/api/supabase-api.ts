/**
 * Supabase API Service
 * Thống nhất tất cả API calls với Supabase
 */

import { supabase } from "../supabase-config";
import type { Database } from "../supabase-config";

type Tables = Database["public"]["Tables"];

// Type helper for NLC tables - bypass TypeScript checking until types are generated
const nlc = (supabase as any);

// User API
export const userApi = {
  // Get current user profile
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await nlc.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get user profile from users table
  async getUserProfile(userId: string) {
    const { data, error } = await nlc
      .from("nlc_accounts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateUserProfile(
    userId: string,
    updates: any
  ) {
    const { data, error } = await nlc
      .from("nlc_accounts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload avatar
  async uploadAvatar(file: File, userId: string) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data: uploadData, error: uploadError } = await nlc.storage
      .from("user-avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL");
    }

    // Update user profile with new avatar URL
    await this.updateUserProfile(userId, { avatar_url: urlData.publicUrl });

    return urlData.publicUrl;
  },
};

// Course API
export const courseApi = {
  // Get all published courses
  async getCourses(filters?: {
    category?: string;
    level?: string;
    instructor_id?: string;
  }) {
    let query = supabase
      .from("nlc_courses")
      .select("*, instructor:users!instructor_id(full_name, avatar_url)")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.level) {
      query = query.eq("level", filters.level);
    }
    if (filters?.instructor_id) {
      query = query.eq("instructor_id", filters.instructor_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get course by ID
  async getCourse(courseId: string) {
    const { data, error } = await nlc
      .from("nlc_courses")
      .select("*, instructor:users!instructor_id(full_name, avatar_url)")
      .eq("id", courseId)
      .eq("is_published", true)
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's enrolled courses
  async getUserCourses(userId: string) {
    const { data, error } = await nlc
      .from("user_courses")
      .select(
        `
        *,
        course:courses (
          *,
          instructor:users!instructor_id(full_name, avatar_url)
        )
      `
      )
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Enroll in course
  async enrollInCourse(userId: string, courseId: string) {
    const { data, error } = await (supabase as any)
      .from("user_courses")
      .insert({
        user_id: userId,
        course_id: courseId,
        progress: 0,
        completed: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update course progress
  async updateCourseProgress(
    userId: string,
    courseId: string,
    progress: number
  ) {
    const updates: any = { progress };

    if (progress === 100) {
      updates.completed = true;
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await (supabase as any)
      .from("user_courses")
      .update(updates as any)
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check if user is enrolled
  async isEnrolled(userId: string, courseId: string) {
    const { data, error } = await nlc
      .from("user_courses")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    return !error && data;
  },
};

// Blog API
export const blogApi = {
  // Get all published blog posts
  async getPosts(filters?: { category?: string; author_id?: string }) {
    let query = supabase
      .from("blog_posts")
      .select("*, author:users!author_id(full_name, avatar_url)")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.author_id) {
      query = query.eq("author_id", filters.author_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get blog post by ID
  async getPost(postId: string) {
    const { data, error } = await nlc
      .from("blog_posts")
      .select("*, author:users!author_id(full_name, avatar_url)")
      .eq("id", postId)
      .eq("is_published", true)
      .single();

    if (error) throw error;
    return data;
  },

  // Get related posts
  async getRelatedPosts(postId: string, limit: number = 3) {
    const { data: currentPost } = await nlc
      .from("blog_posts")
      .select("category, tags")
      .eq("id", postId)
      .single();

    if (!currentPost) return [];

    const currentPostData = currentPost as any;
    const { data, error } = await nlc
      .from("blog_posts")
      .select("*, author:users!author_id(full_name, avatar_url)")
      .eq("is_published", true)
      .neq("id", postId)
      .or(
        `category.eq.${
          currentPostData.category
        },tags.ov.{${currentPostData.tags.join(",")}}`
      )
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

// Purchase API
export const purchaseApi = {
  // Create purchase record
  async createPurchase(
    userId: string,
    courseId: string,
    amount: number,
    paymentMethod: string
  ) {
    const { data, error } = await (supabase as any)
      .from("purchases")
      .insert({
        user_id: userId,
        course_id: courseId,
        amount,
        status: "pending",
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update purchase status
  async updatePurchaseStatus(
    purchaseId: string,
    status: "completed" | "failed",
    stripePaymentIntentId?: string
  ) {
    const updates: any = { status };
    if (stripePaymentIntentId) {
      updates.stripe_payment_intent_id = stripePaymentIntentId;
    }

    const { data, error } = await (supabase as any)
      .from("purchases")
      .update(updates as any)
      .eq("id", purchaseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user purchases
  async getUserPurchases(userId: string) {
    const { data, error } = await nlc
      .from("purchases")
      .select(
        `
        *,
        course:courses (
          *,
          instructor:users!instructor_id(full_name, avatar_url)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// Auth API (using Supabase Auth)
export const authApi = {
  // Sign up with user profile creation
  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: string = "student",
    plan: string = "free"
  ) {
    const { data, error } = await nlc.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { data, error };
    }

    // Create user profile in nlc_accounts table if auth user was created successfully
    if (data.user) {
      try {
        const accountData = {
          user_id: data.user.id,
          email: email,
          full_name: fullName,
          account_role: (role === "teacher" || role === "giang_vien") ? "giang_vien" : "sinh_vien",
          membership_plan: (plan === "premium" || plan === "vip" || plan === "business") ? plan : "free",
          account_status: "active" as "active",
          is_paid: false,
          is_verified: false,
          auth_provider: "email" as "email",
          login_count: 0,
        };

        const { error: profileError } = await nlc
          .from("nlc_accounts")
          .insert(accountData);

        if (profileError) {
          console.warn("Failed to create user profile:", profileError);
          // Don't fail the signup, just log the warning
        }
      } catch (profileError) {
        console.warn("Error creating user profile:", profileError);
      }
    }

    return { data, error };
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await nlc.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await nlc.auth.signOut();
    if (error) throw error;
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await nlc.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await nlc.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  user: userApi,
  course: courseApi,
  blog: blogApi,
  purchase: purchaseApi,
};
