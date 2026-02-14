/**
 * Unified Authentication Context
 * Consolidates all authentication logic into a single, robust system
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { supabase } from "../lib/supabase-config";
import { api } from "../lib/api/supabase-api";
import { nlcApi } from "../lib/api/nlc-database-api";
import { activityService } from "../lib/activity-service";
import { authPersistence } from "../lib/auth-persistence";
import { logger } from "../lib/logger/logger";
import { ErrorHandler, AppError } from "../lib/errors/app-error";
import StorageService from "../lib/storage-service";
import type { User, Session } from "@supabase/supabase-js";
import type { NLCAccount } from "../types/database";

// Unified auth types - now uses NLCAccount
export interface UserProfile {
  id: string; // Supabase auth user ID
  user_id: string; // NLC user ID for database operations
  email: string;
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
}

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoadingProfile: boolean;
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent multiple initializations
  const [initialized, setInitialized] = useState(false);

  // Refs để tránh stale closures
  const userRef = useRef<User | null>(null);
  const sessionRef = useRef<Session | null>(null);

  // Update refs khi state thay đổi
  useEffect(() => {
    userRef.current = user;
    // Reset profile loading state when user changes
    if (!user) {
      setProfileLoaded(false);
      setUserProfile(null);
    }
  }, [user]);

  // Helper functions for type validation
  const validateAccountRole = (role: string): UserProfile["account_role"] => {
    const validRoles: UserProfile["account_role"][] = [
      "sinh_vien",
      "giang_vien",
      "quan_ly",
      "admin",
    ];
    return validRoles.includes(role as UserProfile["account_role"])
      ? (role as UserProfile["account_role"])
      : "sinh_vien";
  };

  const validateMembershipPlan = (
    plan: string
  ): UserProfile["membership_plan"] => {
    const validPlans: UserProfile["membership_plan"][] = [
      "free",
      "basic",
      "premium",
      "vip",
      "business",
    ];
    return validPlans.includes(plan as UserProfile["membership_plan"])
      ? (plan as UserProfile["membership_plan"])
      : "free";
  };

  const convertNLCAccountToUserProfile = (
    nlcAccount: NLCAccount,
    userId: string
  ): UserProfile => {
    return {
      id: userId,
      user_id: nlcAccount.user_id,
      email: nlcAccount.email,
      full_name: nlcAccount.full_name,
      display_name: nlcAccount.display_name,
      avatar_url: nlcAccount.avatar_url,
      phone: nlcAccount.phone,
      bio: nlcAccount.bio,
      account_role: nlcAccount.account_role,
      membership_plan: nlcAccount.membership_plan,
      account_status: nlcAccount.account_status,
      is_paid: nlcAccount.is_paid,
      is_verified: nlcAccount.is_verified,
      auth_provider: nlcAccount.auth_provider,
      last_login_at: nlcAccount.last_login_at,
      login_count: nlcAccount.login_count,
      password_changed_at: nlcAccount.password_changed_at,
      membership_expires_at: nlcAccount.membership_expires_at,
      membership_type: nlcAccount.membership_type,
      approved_by: nlcAccount.approved_by,
      approved_at: nlcAccount.approved_at,
      rejected_reason: nlcAccount.rejected_reason,
      created_at: nlcAccount.created_at,
      updated_at: nlcAccount.updated_at,
    };
  };

  const loadUserProfile = useCallback(
    async (userId: string, userEmail?: string, userFullName?: string) => {
      if (!userId) return;

      setIsLoadingProfile(true);
      try {
        // Single query with timeout - try both user_id and email in one OR query
        const accountQuery = userEmail
          ? supabase
              .from("nlc_accounts")
              .select("*")
              .or(`user_id.eq.${userId},email.eq.${userEmail}`)
              .limit(1)
              .single()
          : supabase
              .from("nlc_accounts")
              .select("*")
              .eq("user_id", userId)
              .single();

        const { data: account, error } = await Promise.race([
          accountQuery,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile load timeout')), 3000)
          )
        ]) as any;

        if (error || !account) {
          // Immediate fallback - no more retries

          const fallbackProfile: UserProfile = {
            id: userId,
            user_id: userId,
            email: userEmail || "",
            full_name: userFullName || userEmail?.split("@")[0] || "User",
            account_role: "sinh_vien",
            membership_plan: "free",
            account_status: "active",
            is_paid: false,
            is_verified: false,
            auth_provider: "email",
            login_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          logger.info("Using fallback profile", { userId });
          setUserProfile(fallbackProfile);
          setProfileLoaded(true);

          // Create account in background (non-blocking)
          (supabase as any).from('nlc_accounts').insert([{
            user_id: userId,
            email: userEmail || "",
            full_name: userFullName || userEmail?.split("@")[0] || "User",
            account_role: "sinh_vien",
            membership_plan: "free",
            account_status: "active",
            is_paid: false,
            is_verified: false,
            auth_provider: "email",
            login_count: 0,
          }]).catch(() => {});
        } else {
          const profile = convertNLCAccountToUserProfile(
            account as NLCAccount,
            userId
          );

          logger.info("Profile loaded from nlc_accounts", { userId });
          setUserProfile(profile);
          setProfileLoaded(true);

          // Update last login in background (non-blocking)
          nlcApi.accounts.updateLoginInfo(userId).catch(() => {});
        }
      } catch (error: any) {
        const appError = ErrorHandler.handleSupabaseError(error, { userId });
        logger.warn("Could not load user profile from database", {
          userId,
          error: appError.message,
        });

        // Use fallback profile
        const fallbackProfile: UserProfile = {
          id: userId,
          user_id: userId, // Use same as Supabase auth ID
          email: userEmail || "",
          full_name: userFullName || userEmail?.split("@")[0] || "User",
          account_role: "sinh_vien",
          membership_plan: "free",
          account_status: "active",
          is_paid: false,
          is_verified: false,
          auth_provider: "email",
          login_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        logger.info("Using fallback profile due to error", {
          userId,
          error: appError.code,
        });
        setUserProfile(fallbackProfile);
        setProfileLoaded(true);
      } finally {
        setIsLoadingProfile(false);
      }
    },
    []
  );

  // Initialize auth state on app mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (initialized) return;
      
      try {
        logger.info("Initializing auth state...");
        setIsLoading(true);
        
        // Check current session với timeout 1.5s - tránh treo khi Supabase chậm/placeholder
        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Session timeout')), 1500)
          )
        ]) as any;
        
        if (error) {
          logger.error("Error getting session", error);
          setIsLoading(false);
          setInitialized(true);
          return;
        }

        if (session?.user) {
          logger.info("Found existing session", { userId: session.user.id });
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Load profile
          await loadUserProfile(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        } else {
          logger.info("No existing session found");
        }
      } catch (error: any) {
        logger.error("Auth initialization failed", error);
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [initialized, loadUserProfile]);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.info("Auth state changed", { event, userId: session?.user?.id });

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          // Load profile in background (non-blocking)
          loadUserProfile(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
          setProfileLoaded(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await api.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      setError(null);
      localStorage.removeItem("nlc_username");
    } catch (error: any) {
      const appError = ErrorHandler.handle(error);
      logger.error("Error signing out", appError);
      setError(appError.userMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: string = "sinh_vien",
      plan: string = "free"
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              account_role: role,
              membership_plan: plan,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);

          // Create fallback profile for new user
          const accountRole = validateAccountRole(role);
          const membershipPlan = validateMembershipPlan(plan);

          const fallbackProfile: UserProfile = {
            id: data.user.id,
            user_id: data.user.id,
            email: email,
            full_name: fullName,
            account_role: accountRole,
            membership_plan: membershipPlan,
            account_status: "active",
            is_paid: false,
            is_verified: false,
            auth_provider: "email",
            login_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setUserProfile(fallbackProfile);
          setProfileLoaded(true);

          // 🆕 Tạo storage folders cho user mới (non-blocking)
          StorageService.createUserStorage(data.user.id).catch((err) => {
            logger.warn("Failed to create user storage", err);
          });
        }

        return { success: true };
      } catch (error: any) {
        const appError = ErrorHandler.handleSupabaseError(error, {
          operation: "signUp",
          email,
        });
        logger.error("Sign up failed", appError, { email });
        setError(appError.userMessage);
        return { success: false, error: appError.userMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          await loadUserProfile(data.user.id);
        }

        logger.info("User signed in successfully", { userId: data.user.id });
        return { success: true };
      } catch (error: any) {
        const appError = ErrorHandler.handleSupabaseError(error, {
          operation: "signIn",
          email,
        });
        logger.error("Sign in failed", appError, { email });
        setError(appError.userMessage);
        return { success: false, error: appError.userMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [loadUserProfile]
  );

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await api.auth.resetPassword(email);
      logger.info("Password reset email sent", { email });
      return { success: true };
    } catch (error: any) {
      const appError = ErrorHandler.handle(error);
      logger.error("Password reset failed", appError, { email });
      setError(appError.userMessage);
      return { success: false, error: appError.userMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassword = useCallback(
    async (newPassword: string) => {
      try {
        setIsLoading(true);
        setError(null);

        await api.auth.updatePassword(newPassword);

        // Log password change activity
        if (user?.id && userProfile) {
          await nlcApi.activityLog.logActivity(
            userProfile.user_id,
            userProfile.email,
            userProfile.account_role,
            "password_change",
            "User changed password",
            {
              resourceType: "user",
              resourceId: userProfile.user_id,
              metadata: {
                timestamp: new Date().toISOString(),
              },
            }
          );
        }

        logger.info("Password updated successfully", { userId: user.id });
        return { success: true };
      } catch (error: any) {
        const appError = ErrorHandler.handle(error);
        logger.error("Password update failed", appError, { userId: user?.id });
        setError(appError.userMessage);
        return { success: false, error: appError.userMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, userProfile]
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      try {
        if (!user || !userProfile) {
          throw new Error("User not authenticated");
        }

        setIsLoading(true);
        setError(null);

        // Update in nlc_accounts table
        const updateResponse = await nlcApi.accounts.updateAccount(
          userProfile.user_id,
          updates
        );

        if (updateResponse.success && updateResponse.data) {
          // Convert back to UserProfile format
          const updatedProfile: UserProfile = {
            id: user.id,
            ...updateResponse.data,
          };
          setUserProfile(updatedProfile);

          // Log profile update activity
          const updatedFields = Object.keys(updates);
          await nlcApi.activityLog.logActivity(
            userProfile.user_id,
            userProfile.email,
            userProfile.account_role,
            "profile_update",
            `Profile updated: ${updatedFields.join(", ")}`,
            {
              resourceType: "user",
              resourceId: userProfile.user_id,
              newValues: updates,
              metadata: { updated_fields: updatedFields },
            }
          );

          logger.info("Profile updated successfully", {
            userId: user.id,
            updatedFields: Object.keys(updates),
          });
          return { success: true };
        } else {
          throw new AppError(
            "DATABASE_ERROR",
            updateResponse.error || "Failed to update profile"
          );
        }
      } catch (error: any) {
        const appError = ErrorHandler.handle(error);
        logger.error("Profile update failed", appError, {
          userId: user?.id,
          updatedFields: Object.keys(updates),
        });
        setError(appError.userMessage);
        return { success: false, error: appError.userMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user, userProfile]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      try {
        if (!user) {
          throw new Error("User not authenticated");
        }

        setIsLoading(true);
        setError(null);

        const avatarUrl = await api.user.uploadAvatar(file, user.id);

        logger.info("Avatar uploaded successfully", { userId: user.id });
        return { success: true, url: avatarUrl };
      } catch (error: any) {
        const appError = ErrorHandler.handle(error);
        logger.error("Avatar upload failed", appError, { userId: user?.id });
        setError(appError.userMessage);
        return { success: false, error: appError.userMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        const appError = ErrorHandler.handleSupabaseError(error);
        logger.error("Session refresh error", appError);
        // If refresh fails, sign out user
        await signOut();
        return false;
      }

      if (data?.session?.user) {
        setUser(data.session.user);
        setIsAuthenticated(true);
        logger.info("Session refreshed successfully", {
          userId: data.session.user.id,
        });
        return true;
      }

      return false;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      logger.error("Session refresh error", appError);
      await signOut();
      return false;
    }
  }, [signOut]);

  // Auto-refresh session periodically
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (isAuthenticated && user) {
      // Refresh session every 50 minutes (tokens expire in 60 minutes)
      refreshInterval = setInterval(async () => {
        logger.debug("Auto-refreshing session...", { userId: user.id });
        await refreshSession();
      }, 50 * 60 * 1000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAuthenticated, user, refreshSession]);

  // Memoize context value để tránh unnecessary re-renders
  const value: AuthContextType = useMemo(
    () => ({
      // State
      user,
      userProfile,
      isAuthenticated,
      isLoading,
      isLoadingProfile,
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
    }),
    [
      user,
      userProfile,
      isAuthenticated,
      isLoading,
      isLoadingProfile,
      error,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      uploadAvatar,
      refreshSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Main unified hook với better error handling
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within a UnifiedAuthProvider. " +
        "Make sure to wrap your component tree with <UnifiedAuthProvider>."
    );
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
