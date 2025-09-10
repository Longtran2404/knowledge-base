import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  AuthResult,
  registerUser,
  loginUser,
  verifyEmail,
  validateSession,
  logoutUser,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  getUserById,
  updateUserProfile,
} from "../lib/email-auth";

interface EmailAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  sessionToken: string | null;
  refreshToken: string | null;

  // Auth methods
  register: (
    email: string,
    password: string,
    fullName: string,
    role?: "student" | "instructor" | "admin"
  ) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  verifyEmailToken: (token: string) => Promise<AuthResult>;
  resendVerification: (email: string) => Promise<AuthResult>;
  requestPasswordResetEmail: (email: string) => Promise<AuthResult>;
  resetUserPassword: (
    token: string,
    newPassword: string
  ) => Promise<AuthResult>;

  // User methods
  updateProfile: (updates: Partial<User>) => Promise<AuthResult>;
  refreshUser: () => Promise<void>;
}

const EmailAuthContext = createContext<EmailAuthContextType | undefined>(
  undefined
);

export const useEmailAuth = () => {
  const context = useContext(EmailAuthContext);
  if (context === undefined) {
    throw new Error("useEmailAuth must be used within an EmailAuthProvider");
  }
  return context;
};

export const EmailAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const isAuthenticated = !!user && !!sessionToken;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedSessionToken = localStorage.getItem("nlc_session_token");
        const storedRefreshToken = localStorage.getItem("nlc_refresh_token");
        const storedUserId = localStorage.getItem("nlc_user_id");

        if (storedSessionToken && storedUserId) {
          // Validate session
          const sessionResult = await validateSession(storedSessionToken);

          if (sessionResult.isValid && sessionResult.user) {
            setUser(sessionResult.user);
            setSessionToken(storedSessionToken);
            setRefreshToken(storedRefreshToken);
            localStorage.setItem("nlc_username", sessionResult.user.full_name);
          } else {
            // Session invalid, clear storage
            clearAuthData();
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Clear auth data
  const clearAuthData = () => {
    setUser(null);
    setSessionToken(null);
    setRefreshToken(null);
    localStorage.removeItem("nlc_session_token");
    localStorage.removeItem("nlc_refresh_token");
    localStorage.removeItem("nlc_user_id");
    localStorage.removeItem("nlc_username");
  };

  // Register user
  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: "student" | "instructor" | "admin" = "student"
  ): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await registerUser(email, password, fullName, role);

      if (result.success) {
        // Store user info for verification
        localStorage.setItem("nlc_pending_email", email);
        localStorage.setItem("nlc_pending_name", fullName);
      }

      return result;
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi đăng ký",
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await loginUser(email, password);

      if (result.success && result.user && result.sessionToken) {
        setUser(result.user);
        setSessionToken(result.sessionToken);
        setRefreshToken(result.refreshToken || null);

        // Store in localStorage
        localStorage.setItem("nlc_session_token", result.sessionToken);
        if (result.refreshToken) {
          localStorage.setItem("nlc_refresh_token", result.refreshToken);
        }
        localStorage.setItem("nlc_user_id", result.user.id);
        localStorage.setItem("nlc_username", result.user.full_name);

        // Clear pending verification data
        localStorage.removeItem("nlc_pending_email");
        localStorage.removeItem("nlc_pending_name");
      }

      return result;
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi đăng nhập",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      if (sessionToken) {
        await logoutUser(sessionToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      setLoading(false);
    }
  };

  // Verify email token
  const verifyEmailToken = async (token: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await verifyEmail(token);

      if (result.success && result.user && result.sessionToken) {
        setUser(result.user);
        setSessionToken(result.sessionToken);
        setRefreshToken(result.refreshToken || null);

        // Store in localStorage
        localStorage.setItem("nlc_session_token", result.sessionToken);
        if (result.refreshToken) {
          localStorage.setItem("nlc_refresh_token", result.refreshToken);
        }
        localStorage.setItem("nlc_user_id", result.user.id);
        localStorage.setItem("nlc_username", result.user.full_name);

        // Clear pending verification data
        localStorage.removeItem("nlc_pending_email");
        localStorage.removeItem("nlc_pending_name");
      }

      return result;
    } catch (error: any) {
      console.error("Email verification error:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi xác thực email",
      };
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerification = async (email: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await resendVerificationEmail(email);
      return result;
    } catch (error: any) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi gửi lại email xác thực",
      };
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const requestPasswordResetEmail = async (
    email: string
  ): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      return result;
    } catch (error: any) {
      console.error("Password reset request error:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi yêu cầu đặt lại mật khẩu",
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetUserPassword = async (
    token: string,
    newPassword: string
  ): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await resetPassword(token, newPassword);
      return result;
    } catch (error: any) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi đặt lại mật khẩu",
      };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>): Promise<AuthResult> => {
    if (!user) {
      return {
        success: false,
        error: "Người dùng chưa đăng nhập",
      };
    }

    setLoading(true);
    try {
      const result = await updateUserProfile(user.id, updates);

      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem("nlc_username", result.user.full_name);
      }

      return result;
    } catch (error: any) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi cập nhật thông tin",
      };
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const userData = await getUserById(user.id);
      if (userData) {
        setUser(userData);
        localStorage.setItem("nlc_username", userData.full_name);
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  }, [user]);

  // Auto-refresh user data periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshUser();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUser]);

  const value: EmailAuthContextType = {
    user,
    loading,
    isAuthenticated,
    sessionToken,
    refreshToken,
    register,
    login,
    logout,
    verifyEmailToken,
    resendVerification,
    requestPasswordResetEmail,
    resetUserPassword,
    updateProfile,
    refreshUser,
  };

  return (
    <EmailAuthContext.Provider value={value}>
      {children}
    </EmailAuthContext.Provider>
  );
};
