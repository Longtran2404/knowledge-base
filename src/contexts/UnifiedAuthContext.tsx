/**
 * Unified Authentication Context
 * Consolidates all authentication logic into a single, robust system
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase-config";
import { api } from "../lib/api/supabase-api";
import type { User } from "@supabase/supabase-js";

// Unified auth types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: "student" | "instructor" | "admin";
  plan?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: string,
    plan?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updates: Partial<UserProfile>
  ) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (
    file: File
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
  refreshSession: () => Promise<boolean>;
}

export type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function UnifiedAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setError(error.message);
        } else if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          await loadUserProfile(session.user.id);
        }
      } catch (error: any) {
        console.error("Error in getInitialSession:", error);
        setError(error.message || "Có lỗi xảy ra khi khởi tạo phiên đăng nhập");
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        setError(null);
        await loadUserProfile(session.user.id);

        // Store username for legacy compatibility
        const name =
          session.user.user_metadata?.full_name || session.user.email || "";
        if (name) localStorage.setItem("nlc_username", name);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setError(null);
        localStorage.removeItem("nlc_username");
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await api.user.getUserProfile(userId);
      setUserProfile(profile);
    } catch (error: any) {
      console.warn("Could not load user profile:", error.message);
      
      // Try to create user profile if it doesn't exist
      try {
        const currentUser = await supabase.auth.getUser();
        if (currentUser.data.user) {
          const newProfile = {
            id: userId,
            email: currentUser.data.user.email || '',
            full_name: currentUser.data.user.user_metadata?.full_name || currentUser.data.user.email || 'User',
            role: 'student' as const,
            plan: 'free',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data, error: insertError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single();
          
          if (!insertError && data) {
            setUserProfile(data);
          }
        }
      } catch (createError) {
        console.error("Could not create user profile:", createError);
      }
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string = "student",
    plan: string = "free"
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await api.auth.signUp(email, password, fullName);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Store username for legacy compatibility
      localStorage.setItem("nlc_username", fullName);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || "Có lỗi xảy ra khi đăng ký";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await api.auth.signIn(email, password);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || "Có lỗi xảy ra khi đăng nhập";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await api.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      setError(null);
      localStorage.removeItem("nlc_username");
    } catch (error: any) {
      console.error("Error signing out:", error);
      setError(error.message || "Có lỗi xảy ra khi đăng xuất");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await api.auth.resetPassword(email);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || "Có lỗi xảy ra khi reset mật khẩu";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await api.auth.updatePassword(newPassword);
      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.message || "Có lỗi xảy ra khi cập nhật mật khẩu";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      setIsLoading(true);
      setError(null);

      const updatedProfile = await api.user.updateUserProfile(user.id, updates);
      setUserProfile(updatedProfile);

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.message || "Có lỗi xảy ra khi cập nhật thông tin";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      setIsLoading(true);
      setError(null);

      const avatarUrl = await api.user.uploadAvatar(file, user.id);

      return { success: true, url: avatarUrl };
    } catch (error: any) {
      const errorMessage = error.message || "Có lỗi xảy ra khi upload avatar";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.refreshSession();
      return !error;
    } catch (error) {
      console.error("Session refresh error:", error);
      return false;
    }
  };

  const value: AuthContextType = {
    // State
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    error,
    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Main unified hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a UnifiedAuthProvider");
  }
  return context;
}

// Legacy compatibility hooks
export function useSupabaseAuth() {
  return useAuth();
}

export function useSimpleAuth() {
  const auth = useAuth();
  return {
    ...auth,
    user: auth.userProfile,
    loading: auth.isLoading,
  };
}
