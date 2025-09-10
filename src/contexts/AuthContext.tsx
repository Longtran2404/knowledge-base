import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase,
  getCurrentUser,
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  upsertAccount,
  ensureActiveAccount,
  type AccountRole,
} from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: AccountRole,
    plan?: "free" | "student_299" | "business"
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          try {
            await upsertAccount({
              userId: currentUser.id,
              email: currentUser.email || "",
              fullName: currentUser.user_metadata?.full_name,
              provider: currentUser.app_metadata?.provider,
            });
            await ensureActiveAccount(
              currentUser.id,
              currentUser.email || null
            );
          } catch (e: any) {
            console.warn("Eligibility/activation failed:", e?.message);
            await signOut();
            localStorage.setItem(
              "nlc_auth_error",
              e?.message || "Tài khoản chưa được kích hoạt."
            );
          }
          const name =
            currentUser.user_metadata?.full_name || currentUser.email || "";
          if (name) localStorage.setItem("nlc_username", name);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        try {
          await upsertAccount({
            userId: session.user.id,
            email: session.user.email || "",
            fullName: session.user.user_metadata?.full_name,
            provider: session.user.app_metadata?.provider,
          });
          await ensureActiveAccount(
            session.user.id,
            session.user.email || null
          );
        } catch (e: any) {
          console.warn("Eligibility/activation failed:", e?.message);
          await signOut();
          localStorage.setItem(
            "nlc_auth_error",
            e?.message || "Tài khoản chưa được kích hoạt."
          );
        }
        const name =
          session.user.user_metadata?.full_name || session.user.email || "";
        if (name) localStorage.setItem("nlc_username", name);
      } else {
        setUser(null);
        localStorage.removeItem("nlc_username");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: AccountRole,
    plan?: "free" | "student_299" | "business"
  ) => {
    setLoading(true);
    try {
      await signUp(email, password, fullName, role, plan);
      localStorage.setItem("nlc_username", fullName);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
