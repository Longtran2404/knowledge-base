import { supabase } from "./supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  bio?: string;
  role: "student" | "instructor" | "admin";
  email_verified: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  login_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  sessionToken?: string;
  refreshToken?: string;
  message?: string;
  error?: string;
}

export interface EmailVerificationResult {
  success: boolean;
  message: string;
  token?: string;
}

// JWT Secret (in production, use environment variable)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "your-super-secret-refresh-key-change-in-production";

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// User registration
export const registerUser = async (
  email: string,
  password: string,
  fullName: string,
  role: "student" | "instructor" | "admin" = "student"
): Promise<AuthResult> => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: "Email đã được sử dụng",
      };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email,
        full_name: fullName,
        password_hash: passwordHash,
        role,
        email_verified: false,
      })
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    // Create email verification token
    const { data: tokenData, error: tokenError } = await supabase.rpc(
      "create_email_verification_token",
      {
        p_email: email,
        p_token_type: "verification",
        p_expires_in_hours: 24,
      }
    );

    if (tokenError) {
      throw tokenError;
    }

    // Send verification email
    await sendVerificationEmail(email, fullName, tokenData);

    return {
      success: true,
      user,
      message:
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error.message || "Có lỗi xảy ra khi đăng ký",
    };
  }
};

// Email verification
export const verifyEmail = async (token: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.rpc("verify_email_token", {
      p_token: token,
      p_token_type: "verification",
    });

    if (error) {
      throw error;
    }

    const result = data[0];
    if (!result.is_valid) {
      return {
        success: false,
        error: result.message,
      };
    }

    // Update user email verification status
    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
      })
      .eq("email", result.email);

    if (updateError) {
      throw updateError;
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", result.email)
      .single();

    if (userError) {
      throw userError;
    }

    // Create session
    const sessionResult = await createUserSession(user.id);

    return {
      success: true,
      user,
      sessionToken: sessionResult.sessionToken,
      refreshToken: sessionResult.refreshToken,
      message: "Email đã được xác thực thành công!",
    };
  } catch (error: any) {
    console.error("Email verification error:", error);
    return {
      success: false,
      error: error.message || "Có lỗi xảy ra khi xác thực email",
    };
  }
};

// User login
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: "Email hoặc mật khẩu không đúng",
      };
    }

    // Check if email is verified
    if (!user.email_verified) {
      return {
        success: false,
        error: "Vui lòng xác thực email trước khi đăng nhập",
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return {
        success: false,
        error: "Email hoặc mật khẩu không đúng",
      };
    }

    // Create session
    const sessionResult = await createUserSession(user.id);

    return {
      success: true,
      user,
      sessionToken: sessionResult.sessionToken,
      refreshToken: sessionResult.refreshToken,
      message: "Đăng nhập thành công!",
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.message || "Có lỗi xảy ra khi đăng nhập",
    };
  }
};

// Create user session
export const createUserSession = async (
  userId: string
): Promise<{
  sessionToken: string;
  refreshToken: string;
  expiresAt: string;
}> => {
  const { data, error } = await supabase.rpc("create_user_session", {
    p_user_id: userId,
    p_ip_address: null, // You can get this from request
    p_user_agent: null, // You can get this from request
  });

  if (error) {
    throw error;
  }

  const result = data[0];
  return {
    sessionToken: result.session_token,
    refreshToken: result.refresh_token,
    expiresAt: result.expires_at,
  };
};

// Validate session
export const validateSession = async (
  sessionToken: string
): Promise<{
  isValid: boolean;
  user?: User;
  message?: string;
}> => {
  try {
    const { data, error } = await supabase.rpc("validate_session", {
      p_session_token: sessionToken,
    });

    if (error) {
      throw error;
    }

    const result = data[0];
    if (!result.is_valid) {
      return {
        isValid: false,
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
      };
    }

    return {
      isValid: true,
      user: result.user_data,
    };
  } catch (error: any) {
    console.error("Session validation error:", error);
    return {
      isValid: false,
      message: "Có lỗi xảy ra khi xác thực phiên đăng nhập",
    };
  }
};

// Logout user
export const logoutUser = async (sessionToken: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc("logout_user", {
      p_session_token: sessionToken,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Logout error:", error);
    return false;
  }
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  fullName: string,
  token: string
): Promise<void> => {
  try {
    const verificationUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/verify-email?token=${token}`;

    const emailData = {
      to: email,
      subject: "Xác thực tài khoản Nam Long Center",
      template: "email-verification",
      data: {
        fullName,
        verificationUrl,
        token,
      },
    };

    // Log email
    await supabase.from("email_logs").insert({
      to_email: email,
      subject: emailData.subject,
      template_name: emailData.template,
      status: "pending",
      user_id: null, // Will be updated when user is created
    });

    // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log it
    console.log("Verification email would be sent:", emailData);

    // TODO: Implement actual email sending
    // await sendEmail(emailData);
  } catch (error: any) {
    console.error("Send verification email error:", error);
    throw error;
  }
};

// Resend verification email
export const resendVerificationEmail = async (
  email: string
): Promise<EmailVerificationResult> => {
  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, full_name, email_verified")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return {
        success: false,
        message: "Email không tồn tại trong hệ thống",
      };
    }

    if (user.email_verified) {
      return {
        success: false,
        message: "Email đã được xác thực rồi",
      };
    }

    // Create new verification token
    const { data: tokenData, error: tokenError } = await supabase.rpc(
      "create_email_verification_token",
      {
        p_email: email,
        p_token_type: "verification",
        p_expires_in_hours: 24,
      }
    );

    if (tokenError) {
      throw tokenError;
    }

    // Send verification email
    await sendVerificationEmail(email, user.full_name, tokenData);

    return {
      success: true,
      message: "Email xác thực đã được gửi lại",
    };
  } catch (error: any) {
    console.error("Resend verification email error:", error);
    return {
      success: false,
      message: error.message || "Có lỗi xảy ra khi gửi lại email xác thực",
    };
  }
};

// Password reset
export const requestPasswordReset = async (
  email: string
): Promise<EmailVerificationResult> => {
  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return {
        success: false,
        message: "Email không tồn tại trong hệ thống",
      };
    }

    // Create password reset token
    const { data: tokenData, error: tokenError } = await supabase.rpc(
      "create_email_verification_token",
      {
        p_email: email,
        p_token_type: "password_reset",
        p_expires_in_hours: 1, // 1 hour for password reset
      }
    );

    if (tokenError) {
      throw tokenError;
    }

    // Send password reset email
    await sendPasswordResetEmail(email, user.full_name, tokenData);

    return {
      success: true,
      message: "Email đặt lại mật khẩu đã được gửi",
    };
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      message: error.message || "Có lỗi xảy ra khi gửi email đặt lại mật khẩu",
    };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  token: string
): Promise<void> => {
  try {
    const resetUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/reset-password?token=${token}`;

    const emailData = {
      to: email,
      subject: "Đặt lại mật khẩu - Nam Long Center",
      template: "password-reset",
      data: {
        fullName,
        resetUrl,
        token,
      },
    };

    // Log email
    await supabase.from("email_logs").insert({
      to_email: email,
      subject: emailData.subject,
      template_name: emailData.template,
      status: "pending",
    });

    // Here you would integrate with your email service
    console.log("Password reset email would be sent:", emailData);

    // TODO: Implement actual email sending
    // await sendEmail(emailData);
  } catch (error: any) {
    console.error("Send password reset email error:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<AuthResult> => {
  try {
    // Verify token
    const { data, error } = await supabase.rpc("verify_email_token", {
      p_token: token,
      p_token_type: "password_reset",
    });

    if (error) {
      throw error;
    }

    const result = data[0];
    if (!result.is_valid) {
      return {
        success: false,
        error: result.message,
      };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("email", result.email);

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      message: "Mật khẩu đã được đặt lại thành công",
    };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: error.message || "Có lỗi xảy ra khi đặt lại mật khẩu",
    };
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return user;
  } catch (error: any) {
    console.error("Get user by ID error:", error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<AuthResult> => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      user,
      message: "Cập nhật thông tin thành công",
    };
  } catch (error: any) {
    console.error("Update user profile error:", error);
    return {
      success: false,
      error: error.message || "Có lỗi xảy ra khi cập nhật thông tin",
    };
  }
};
