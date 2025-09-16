/**
 * Supabase API Service
 * Thống nhất tất cả API calls với Supabase
 */

import { supabase } from '../supabase-config';
import type { Database } from '../supabase-config';

type Tables = Database['public']['Tables'];

// User API
export const userApi = {
  // Get current user profile
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get user profile from users table
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<Tables['users']['Update']>) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Upload avatar
  async uploadAvatar(file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    // Update user profile with new avatar URL
    await this.updateUserProfile(userId, { avatar_url: urlData.publicUrl });

    return urlData.publicUrl;
  }
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
      .from('courses')
      .select('*, instructor:users!instructor_id(full_name, avatar_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.level) {
      query = query.eq('level', filters.level);
    }
    if (filters?.instructor_id) {
      query = query.eq('instructor_id', filters.instructor_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get course by ID
  async getCourse(courseId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructor:users!instructor_id(full_name, avatar_url)')
      .eq('id', courseId)
      .eq('is_published', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user's enrolled courses
  async getUserCourses(userId: string) {
    const { data, error } = await supabase
      .from('user_courses')
      .select(`
        *,
        course:courses (
          *,
          instructor:users!instructor_id(full_name, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Enroll in course
  async enrollInCourse(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from('user_courses')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress: 0,
        completed: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update course progress
  async updateCourseProgress(userId: string, courseId: string, progress: number) {
    const updates: any = { progress };
    
    if (progress === 100) {
      updates.completed = true;
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('user_courses')
      .update(updates)
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Check if user is enrolled
  async isEnrolled(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from('user_courses')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    
    return !error && data;
  }
};

// Blog API
export const blogApi = {
  // Get all published blog posts
  async getPosts(filters?: {
    category?: string;
    author_id?: string;
  }) {
    let query = supabase
      .from('blog_posts')
      .select('*, author:users!author_id(full_name, avatar_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.author_id) {
      query = query.eq('author_id', filters.author_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get blog post by ID
  async getPost(postId: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:users!author_id(full_name, avatar_url)')
      .eq('id', postId)
      .eq('is_published', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get related posts
  async getRelatedPosts(postId: string, limit: number = 3) {
    const { data: currentPost } = await supabase
      .from('blog_posts')
      .select('category, tags')
      .eq('id', postId)
      .single();

    if (!currentPost) return [];

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:users!author_id(full_name, avatar_url)')
      .eq('is_published', true)
      .neq('id', postId)
      .or(`category.eq.${currentPost.category},tags.ov.{${currentPost.tags.join(',')}}`)
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
};

// Purchase API
export const purchaseApi = {
  // Create purchase record
  async createPurchase(userId: string, courseId: string, amount: number, paymentMethod: string) {
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        course_id: courseId,
        amount,
        status: 'pending',
        payment_method: paymentMethod
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update purchase status
  async updatePurchaseStatus(purchaseId: string, status: 'completed' | 'failed', stripePaymentIntentId?: string) {
    const updates: any = { status };
    if (stripePaymentIntentId) {
      updates.stripe_payment_intent_id = stripePaymentIntentId;
    }

    const { data, error } = await supabase
      .from('purchases')
      .update(updates)
      .eq('id', purchaseId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user purchases
  async getUserPurchases(userId: string) {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        course:courses (
          *,
          instructor:users!instructor_id(full_name, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Auth API (using Supabase Auth)
export const authApi = {
  // Sign up
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
  }
};

// Export all APIs
export const api = {
  auth: authApi,
  user: userApi,
  course: courseApi,
  blog: blogApi,
  purchase: purchaseApi
};
