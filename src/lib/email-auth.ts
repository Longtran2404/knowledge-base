/* eslint-disable no-unreachable */
import { supabase } from "./supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "./email-service";

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ hoa");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ thường");
  }
  if (!/\d/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 số");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting for login attempts
const loginAttempts: { [email: string]: { count: number; lastAttempt: number } } = {};

export const checkRateLimit = (email: string): { allowed: boolean; waitTime?: number } => {
  const now = Date.now();
  const attempt = loginAttempts[email];
  
  if (!attempt) {
    loginAttempts[email] = { count: 1, lastAttempt: now };
    return { allowed: true };
  }
  
  // Reset attempts after 15 minutes
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    loginAttempts[email] = { count: 1, lastAttempt: now };
    return { allowed: true };
  }
  
  // Block after 5 attempts
  if (attempt.count >= 5) {
    const waitTime = Math.ceil((15 * 60 * 1000 - (now - attempt.lastAttempt)) / 1000 / 60);
    return { allowed: false, waitTime };
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  return { allowed: true };
};

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  password_hash?: string; // For internal use
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

// Generate verification token
const generateVerificationToken = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// User registration with email verification
export const registerUser = async (
  email: string,
  password: string,
  fullName: string,
  role: "student" | "instructor" | "admin" = "student"
): Promise<AuthResult> => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      return {
        success: false,
        error: "Định dạng email không hợp lệ",
      };
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: passwordValidation.errors.join(", "),
      };
    }

    // Validate full name
    if (!fullName || fullName.trim().length < 2) {
      return {
        success: false,
        error: "Họ tên phải có ít nhất 2 ký tự",
      };
    }

    // Check if user already exists in localStorage
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = existingUsers.find((u: any) => u.email === email);

    if (existingUser) {
      return {
        success: false,
        error: "Email đã được sử dụng",
      };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user data
    const userData: User = {
      id: Date.now().toString(),
      email,
      full_name: fullName,
      password_hash: passwordHash,
      role: role,
      email_verified: false,
      login_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save user to localStorage
    existingUsers.push(userData);
    localStorage.setItem("users", JSON.stringify(existingUsers));

    // Create email verification token
    const verificationToken = generateVerificationToken();
    const tokenData = {
      token: verificationToken,
      email: email,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    // Save token to localStorage
    const existingTokens = JSON.parse(
      localStorage.getItem("verification_tokens") || "[]"
    );
    existingTokens.push(tokenData);
    localStorage.setItem("verification_tokens", JSON.stringify(existingTokens));

    // Send verification email using real email service
    await sendVerificationEmailReal(email, fullName, verificationToken);

    return {
      success: true,
      user: userData,
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
    // Get tokens from localStorage
    const tokens = JSON.parse(
      localStorage.getItem("verification_tokens") || "[]"
    );
    const tokenData = tokens.find((t: any) => t.token === token);

    if (!tokenData) {
      return {
        success: false,
        error: "Token xác thực không hợp lệ",
      };
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return {
        success: false,
        error: "Token xác thực đã hết hạn",
      };
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.email === tokenData.email);

    if (userIndex === -1) {
      return {
        success: false,
        error: "Không tìm thấy tài khoản",
      };
    }

    // Update user verification status
    users[userIndex].email_verified = true;
    users[userIndex].status = "active";
    users[userIndex].email_verified_at = new Date().toISOString();
    localStorage.setItem("users", JSON.stringify(users));

    // Remove used token
    const updatedTokens = tokens.filter((t: any) => t.token !== token);
    localStorage.setItem("verification_tokens", JSON.stringify(updatedTokens));

    // Create session
    const sessionResult = {
      sessionToken: "demo-token-" + Date.now(),
      refreshToken: "demo-refresh-" + Date.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return {
      success: true,
      user: users[userIndex],
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
    // Check rate limiting
    const rateCheck = checkRateLimit(email);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau ${rateCheck.waitTime} phút`,
      };
    }

    // Validate email format
    if (!validateEmail(email)) {
      return {
        success: false,
        error: "Định dạng email không hợp lệ",
      };
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: any) => u.email === email);

    if (!user) {
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

    // Check if account is active
    if (user.status !== "active") {
      return {
        success: false,
        error: "Tài khoản chưa được kích hoạt",
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

    // Update login count and last login
    const userIndex = users.findIndex((u: any) => u.email === email);
    users[userIndex].login_count = (users[userIndex].login_count || 0) + 1;
    users[userIndex].last_login_at = new Date().toISOString();
    localStorage.setItem("users", JSON.stringify(users));

    // Create session
    const sessionResult = {
      sessionToken: "demo-token-" + Date.now(),
      refreshToken: "demo-refresh-" + Date.now(),
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    // Save session to localStorage
    const sessions = JSON.parse(localStorage.getItem("user_sessions") || "[]");
    sessions.push(sessionResult);
    localStorage.setItem("user_sessions", JSON.stringify(sessions));

    return {
      success: true,
      user: users[userIndex],
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
    // Get sessions from localStorage
    const sessions = JSON.parse(localStorage.getItem("user_sessions") || "[]");
    const session = sessions.find((s: any) => s.sessionToken === sessionToken);

    if (!session) {
      return {
        isValid: false,
        message: "Phiên đăng nhập không tồn tại",
      };
    }

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      // Remove expired session
      const updatedSessions = sessions.filter((s: any) => s.sessionToken !== sessionToken);
      localStorage.setItem("user_sessions", JSON.stringify(updatedSessions));
      
      return {
        isValid: false,
        message: "Phiên đăng nhập đã hết hạn",
      };
    }

    // Get user data
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: any) => u.id === session.userId);

    if (!user) {
      return {
        isValid: false,
        message: "Không tìm thấy tài khoản",
      };
    }

    return {
      isValid: true,
      user: user,
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
    // Remove session from localStorage
    const sessions = JSON.parse(localStorage.getItem("user_sessions") || "[]");
    const updatedSessions = sessions.filter((s: any) => s.sessionToken !== sessionToken);
    localStorage.setItem("user_sessions", JSON.stringify(updatedSessions));

    return true;
  } catch (error: any) {
    console.error("Logout error:", error);
    return false;
  }
};

// Send verification email (using real email service)
export const sendVerificationEmailReal = async (
  email: string,
  fullName: string,
  token: string
): Promise<void> => {
  try {
    // Send real email using EmailJS
    const result = await sendVerificationEmail(email, fullName, token);

    if (!result.success) {
      throw new Error(result.error || "Failed to send verification email");
    }

    // Log email to localStorage for tracking
    const emailLogs = JSON.parse(localStorage.getItem("email_logs") || "[]");
    emailLogs.push({
      id: Date.now().toString(),
      to_email: email,
      subject: "Xác thực tài khoản Knowledge Base",
      template_name: "verification",
      status: "sent",
      created_at: new Date().toISOString(),
      verification_url: `${
        process.env.REACT_APP_URL || "http://localhost:3000"
      }/verify-email?token=${token}`,
    });
    localStorage.setItem("email_logs", JSON.stringify(emailLogs));

    console.log("Verification email sent successfully:", result.message);
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
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: any) => u.email === email);

    if (!user) {
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
    const verificationToken = generateVerificationToken();
    const tokenData = {
      token: verificationToken,
      email: email,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    // Save token to localStorage
    const existingTokens = JSON.parse(
      localStorage.getItem("verification_tokens") || "[]"
    );
    existingTokens.push(tokenData);
    localStorage.setItem("verification_tokens", JSON.stringify(existingTokens));

    // Send verification email using real email service
    await sendVerificationEmailReal(email, user.full_name, verificationToken);

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
    // Validate email format
    if (!validateEmail(email)) {
      return {
        success: false,
        message: "Định dạng email không hợp lệ",
      };
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      // Don't reveal if user exists for security
      return {
        success: true,
        message: "Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được email đặt lại mật khẩu",
      };
    }

    // Create password reset token
    const resetToken = generateVerificationToken();
    const tokenData = {
      token: resetToken,
      email: email,
      type: "password_reset",
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    };

    // Save token to localStorage
    const existingTokens = JSON.parse(
      localStorage.getItem("password_reset_tokens") || "[]"
    );
    existingTokens.push(tokenData);
    localStorage.setItem("password_reset_tokens", JSON.stringify(existingTokens));

    // Send password reset email
    try {
      const resetUrl = `${process.env.REACT_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(email, user.full_name, resetToken);
      
      // Log email to localStorage for tracking
      const emailLogs = JSON.parse(localStorage.getItem("email_logs") || "[]");
      emailLogs.push({
        id: Date.now().toString(),
        to_email: email,
        subject: "Đặt lại mật khẩu Knowledge Base",
        template_name: "password_reset",
        status: "sent",
        created_at: new Date().toISOString(),
        reset_url: resetUrl,
      });
      localStorage.setItem("email_logs", JSON.stringify(emailLogs));
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Still return success for security reasons
    }

    return {
      success: true,
      message: "Email đặt lại mật khẩu đã được gửi",
    };
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi gửi email đặt lại mật khẩu",
    };
  }
};

// Password reset email is now handled by email-service.ts

// Reset password
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<AuthResult> => {
  try {
    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: passwordValidation.errors.join(", "),
      };
    }

    // Get password reset tokens from localStorage
    const tokens = JSON.parse(
      localStorage.getItem("password_reset_tokens") || "[]"
    );
    const tokenData = tokens.find((t: any) => t.token === token && t.type === "password_reset");

    if (!tokenData) {
      return {
        success: false,
        error: "Token đặt lại mật khẩu không hợp lệ",
      };
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      // Remove expired token
      const updatedTokens = tokens.filter((t: any) => t.token !== token);
      localStorage.setItem("password_reset_tokens", JSON.stringify(updatedTokens));
      
      return {
        success: false,
        error: "Token đặt lại mật khẩu đã hết hạn",
      };
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.email === tokenData.email);

    if (userIndex === -1) {
      return {
        success: false,
        error: "Không tìm thấy tài khoản",
      };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    users[userIndex].password_hash = passwordHash;
    users[userIndex].updated_at = new Date().toISOString();
    localStorage.setItem("users", JSON.stringify(users));

    // Remove used token
    const updatedTokens = tokens.filter((t: any) => t.token !== token);
    localStorage.setItem("password_reset_tokens", JSON.stringify(updatedTokens));

    // Reset rate limiting for this email
    delete loginAttempts[tokenData.email];

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
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: any) => u.id === userId);
    
    if (!user) {
      return null;
    }

    // Remove password hash from returned user
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
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
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return {
        success: false,
        error: "Không tìm thấy tài khoản",
      };
    }

    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem("users", JSON.stringify(users));

    // Remove password hash from returned user
    const { password_hash, ...userWithoutPassword } = users[userIndex];

    return {
      success: true,
      user: userWithoutPassword,
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
