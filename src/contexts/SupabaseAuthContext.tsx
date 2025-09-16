/**
 * Supabase Authentication Context
 * Thay thế mock auth bằng Supabase Auth thực tế
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase-config";
import { api } from "../lib/api/supabase-api";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (
    email: string,
    password: string,
    fullName: string
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
    updates: any
  ) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (
    file: File
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
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
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setError(null);
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
      // Don't set error here as it's not critical
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await api.auth.signUp(email, password, fullName);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

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

  const updateProfile = async (updates: any) => {
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

  const value: AuthContextType = {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useSupabaseAuth must be used within a SupabaseAuthProvider"
    );
  }
  return context;
}
