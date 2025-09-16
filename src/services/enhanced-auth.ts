import { supabase } from "../lib/supabase";
import { TokenManager } from "./token-manager";

export interface LoginResult {
  success: boolean;
  user?: any;
  sessionToken?: string;
  refreshToken?: string;
  error?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: any;
  error?: string;
  message?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  expiresAt?: string;
  isOverdue: boolean;
  gracePeriodDays: number;
}

export class EnhancedAuth {
  /**
   * Enhanced login with token management
   */
  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      // 1. Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 2. Generate custom tokens
      const sessionTokenData = TokenManager.createToken("session", 24); // 24 hours
      const refreshTokenData = TokenManager.createToken("refresh", 168); // 7 days

      // 3. Store tokens securely
      TokenManager.setSessionTokens(
        sessionTokenData.token,
        refreshTokenData.token,
        24 * 60 * 60 // 24 hours in seconds
      );
      TokenManager.setUserData(data.user);

      // 4. Check subscription status
      await this.checkSubscriptionStatus(data.user.id);

      // 5. Update last login
      await this.updateLastLogin(data.user.id);

      return {
        success: true,
        user: data.user,
        sessionToken: sessionTokenData.token,
        refreshToken: refreshTokenData.token,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enhanced registration with account creation
   */
  static async register(
    email: string,
    password: string,
    fullName: string,
    role: string = "sinh_vien",
    plan: string = "free"
  ): Promise<RegisterResult> {
    try {
      // 1. Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            plan,
          },
        },
      });

      if (error) throw error;

      // 2. Create account record if user is created
      if (data.user) {
        await this.createAccountRecord(
          data.user.id,
          email,
          fullName,
          role,
          plan
        );

        // Generate verification token
        const verificationToken = TokenManager.createToken("verification", 24);

        return {
          success: true,
          user: data.user,
          message:
            "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
        };
      }

      return {
        success: true,
        message:
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Logout with token cleanup
   */
  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      TokenManager.clearTokens();
    } catch (error) {
      console.error("Logout error:", error);
      // Clear tokens even if Supabase logout fails
      TokenManager.clearTokens();
    }
  }

  /**
   * Check subscription status and handle overdue payments
   */
  static async checkSubscriptionStatus(
    userId: string
  ): Promise<SubscriptionStatus | null> {
    try {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (!subscription) {
        return {
          isActive: false,
          plan: "free",
          isOverdue: false,
          gracePeriodDays: 0,
        };
      }

      const now = new Date();
      const periodEnd = new Date(subscription.current_period_end);
      const gracePeriodDays = subscription.grace_period_days || 7;
      const gracePeriod = new Date(
        periodEnd.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000
      );
      const isOverdue = now > gracePeriod;

      // Auto-downgrade if overdue
      if (isOverdue && subscription.auto_downgrade !== false) {
        await this.downgradeToFree(userId);
      }

      return {
        isActive: !isOverdue,
        plan: subscription.plan,
        expiresAt: subscription.current_period_end,
        isOverdue,
        gracePeriodDays,
      };
    } catch (error) {
      console.error("Subscription check error:", error);
      return null;
    }
  }

  /**
   * Downgrade user to free plan
   */
  static async downgradeToFree(userId: string): Promise<void> {
    try {
      // Update subscription status
      await supabase
        .from("subscriptions")
        .update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      // Update account plan
      await supabase
        .from("account_nam_long_center")
        .update({
          plan: "free",
          is_paid: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      // Send notification
      await this.sendDowngradeNotification(userId);

      console.log(
        `User ${userId} downgraded to free plan due to overdue payment`
      );
    } catch (error) {
      console.error("Downgrade error:", error);
    }
  }

  /**
   * Verify current session
   */
  static async verifySession(): Promise<boolean> {
    try {
      const sessionToken = TokenManager.getSessionToken();

      if (!sessionToken || TokenManager.isTokenExpired()) {
        return false;
      }

      // Verify with Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        TokenManager.clearTokens();
        return false;
      }

      // Update user data
      TokenManager.setUserData(user);

      return true;
    } catch (error) {
      console.error("Session verification error:", error);
      TokenManager.clearTokens();
      return false;
    }
  }

  /**
   * Refresh session token
   */
  static async refreshSession(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      // Refresh with Supabase
      const { data, error } = await supabase.auth.refreshSession();

      if (error || !data.session) {
        TokenManager.clearTokens();
        return false;
      }

      // Generate new tokens
      const sessionTokenData = TokenManager.createToken("session", 24);
      const newRefreshTokenData = TokenManager.createToken("refresh", 168);

      TokenManager.setSessionTokens(
        sessionTokenData.token,
        newRefreshTokenData.token,
        24 * 60 * 60
      );
      TokenManager.setUserData(data.user);

      return true;
    } catch (error) {
      console.error("Session refresh error:", error);
      TokenManager.clearTokens();
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private static async createAccountRecord(
    userId: string,
    email: string,
    fullName: string,
    role: string,
    plan: string
  ): Promise<void> {
    try {
      await supabase.from("account_nam_long_center").insert({
        user_id: userId,
        email,
        full_name: fullName,
        role,
        plan,
        status: "active",
        provider: "email",
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Account creation error:", error);
    }
  }

  private static async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from("account_nam_long_center")
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } catch (error) {
      console.error("Last login update error:", error);
    }
  }

  private static async sendDowngradeNotification(
    userId: string
  ): Promise<void> {
    // Implementation for sending downgrade notification
    console.log(`Sending downgrade notification to user: ${userId}`);
    // TODO: Implement email notification
  }
}
