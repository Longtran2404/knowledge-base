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
import { activityService } from "../lib/activity-service";
import type { User, Session } from "@supabase/supabase-js";

// Unified auth types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  bio?: string;
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

  // Refs để tránh stale closures
  const userRef = useRef<User | null>(null);
  const sessionRef = useRef<Session | null>(null);

  // Update refs khi state thay đổi
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const loadUserProfile = useCallback(
    async (userId: string) => {
      if (isLoadingProfile || profileLoaded) return; // Prevent multiple calls
      
      setIsLoadingProfile(true);
      console.log(`Loading user profile for ${userId}`);

      try {
        const profile = await api.user.getUserProfile(userId);
        console.log("User profile loaded successfully:", profile);
        setUserProfile(profile);
        setProfileLoaded(true);

        // Update last login time
        if (profile) {
          await api.user.updateUserProfile(userId, {
            last_login_at: new Date().toISOString(),
            login_count: ((profile as any).login_count || 0) + 1,
          });
        }
      } catch (error: any) {
        console.warn("Could not load user profile:", error);

        // Use fallback profile immediately for faster loading
        const fallbackProfile = {
          id: userId,
          email: user?.email || "",
          full_name:
            user?.user_metadata?.full_name ||
            user?.email?.split("@")[0] ||
            "User",
          avatar_url: null,
          role: "student" as const,
          plan: "free" as const,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        console.log("Using fallback profile:", fallbackProfile);
        setUserProfile(fallbackProfile);
        setProfileLoaded(true);
      } finally {
        setIsLoadingProfile(false);
      }
    },
    [user?.email, user?.user_metadata?.full_name, isLoadingProfile, profileLoaded]
  );

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
      console.log("🔔 Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ User signed in:", session.user.email);
        setUser(session.user);
        setIsAuthenticated(true);
        setError(null);

        // Load user profile with proper error handling
        try {
          await loadUserProfile(session.user.id);
          console.log("✅ User profile loaded successfully");
        } catch (error) {
          console.error("❌ Failed to load user profile:", error);
          setError("Không thể tải thông tin tài khoản. Vui lòng thử lại.");
        }

        // Log login activity
        try {
          await activityService.logLogin(session.user.id, {
            event_type: event,
            login_method: "email",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.warn("Failed to log login activity:", error);
        }

        // Store username for legacy compatibility
        const name =
          session.user.user_metadata?.full_name || session.user.email || "";
        if (name) localStorage.setItem("nlc_username", name);
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 User signed out");
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setProfileLoaded(false);
        // Log logout activity if user was authenticated
        if (user?.id) {
          try {
            await activityService.logLogout(user.id);
          } catch (error) {
            console.warn("Failed to log logout activity:", error);
          }
        }

        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setError(null);
        localStorage.removeItem("nlc_username");
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 Token refreshed for:", session.user.email);
        setUser(session.user);
        setIsAuthenticated(true);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [user?.id, loadUserProfile]);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: string = "student",
      plan: string = "free"
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await api.auth.signUp(
          email,
          password,
          fullName
        );

        if (error) {
          setError(error.message);
          return { success: false, error: error.message };
        }

        // Log registration activity
        if (data?.user?.id) {
          await activityService.logRegister(data.user.id, email, {
            role,
            plan,
            registration_method: "email",
          });
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
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
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
  }, []);

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
      console.error("Error signing out:", error);
      setError(error.message || "Có lỗi xảy ra khi đăng xuất");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
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
  }, []);

  const updatePassword = useCallback(
    async (newPassword: string) => {
      try {
        setIsLoading(true);
        setError(null);

        await api.auth.updatePassword(newPassword);

        // Log password change activity
        if (user?.id) {
          await activityService.logPasswordChange(user.id);
        }

        return { success: true };
      } catch (error: any) {
        const errorMessage =
          error.message || "Có lỗi xảy ra khi cập nhật mật khẩu";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      try {
        if (!user) {
          throw new Error("User not authenticated");
        }

        setIsLoading(true);
        setError(null);

        const updatedProfile = await api.user.updateUserProfile(
          user.id,
          updates
        );
        setUserProfile(updatedProfile);

        // Log profile update activity
        const updatedFields = Object.keys(updates);
        await activityService.logProfileUpdate(user.id, updatedFields);

        return { success: true };
      } catch (error: any) {
        const errorMessage =
          error.message || "Có lỗi xảy ra khi cập nhật thông tin";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
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

        return { success: true, url: avatarUrl };
      } catch (error: any) {
        const errorMessage = error.message || "Có lỗi xảy ra khi upload avatar";
        setError(errorMessage);
        return { success: false, error: errorMessage };
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
        console.error("Session refresh error:", error);
        // If refresh fails, sign out user
        await signOut();
        return false;
      }

      if (data?.session?.user) {
        setUser(data.session.user);
        setIsAuthenticated(true);
        console.log("Session refreshed successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Session refresh error:", error);
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
        console.log("Auto-refreshing session...");
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
