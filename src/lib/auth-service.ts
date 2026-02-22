/**
 * Simple Auth Service for Knowledge Base
 * Handles authentication with enhanced security
 */
import CryptoJS from "crypto-js";
import { safeParseJson } from "./safe-json";

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: "student" | "instructor" | "admin";
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface StoredUserData extends User {
  hashedPassword: string;
  salt: string;
  createdAt: string;
}

class AuthService {
  private static instance: AuthService;
  private user: User | null = null;
  private listeners: ((state: AuthState) => void)[] = [];
  private readonly SECRET_KEY = "KnowledgeBase2024!@#";

  private constructor() {
    // Load user from localStorage on initialization
    this.loadUserFromStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem("kb_user");
      const parsed = safeParseJson(stored, null as User | null);
      if (parsed) {
        this.user = parsed;
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
      this.user = null;
    }
  }

  private saveUserToStorage(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem("kb_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("kb_user");
      }
    } catch (error) {
      console.error("Error saving user to storage:", error);
    }
  }

  // Password hashing utilities
  private generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  }

  private hashPassword(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 1000
    }).toString();
  }

  private verifyPassword(password: string, hash: string, salt: string): boolean {
    return this.hashPassword(password, salt) === hash;
  }

  // Email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength validation
  private validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
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
  }

  private notifyListeners(): void {
    const state: AuthState = {
      user: this.user,
      isAuthenticated: !!this.user,
      isLoading: false,
    };
    this.listeners.forEach((listener) => listener(state));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }

  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: string = "student"
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      // Input validation
      if (!email || !password || !fullName) {
        return { user: null, error: "Vui lòng điền đầy đủ thông tin" };
      }

      if (!this.isValidEmail(email)) {
        return { user: null, error: "Email không hợp lệ" };
      }

      const passwordValidation = this.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return { user: null, error: passwordValidation.errors[0] };
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUsers = this.getStoredUsersData();
      if (existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { user: null, error: "Email đã được sử dụng" };
      }

      // Generate salt and hash password
      const salt = this.generateSalt();
      const hashedPassword = this.hashPassword(password, salt);

      // Create new user data
      const userData: StoredUserData = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        full_name: fullName.trim(),
        role: role as "student" | "instructor" | "admin",
        created_at: new Date().toISOString(),
        hashedPassword,
        salt,
        createdAt: new Date().toISOString(),
      };

      // Create public user object (without sensitive data)
      const newUser: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        created_at: userData.created_at,
      };

      // Save user
      this.user = newUser;
      this.saveUserToStorage(newUser);
      this.saveUserDataToList(userData);
      this.notifyListeners();

      return { user: newUser, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { user: null, error: "Có lỗi xảy ra khi đăng ký" };
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      // Input validation
      if (!email || !password) {
        return { user: null, error: "Vui lòng điền đầy đủ thông tin" };
      }

      if (!this.isValidEmail(email)) {
        return { user: null, error: "Email không hợp lệ" };
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user exists
      const existingUsers = this.getStoredUsersData();
      const userData = existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!userData) {
        return { user: null, error: "Email hoặc mật khẩu không đúng" };
      }

      // Verify password
      if (!this.verifyPassword(password, userData.hashedPassword, userData.salt)) {
        return { user: null, error: "Email hoặc mật khẩu không đúng" };
      }

      // Create public user object
      const user: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        created_at: userData.created_at,
      };

      this.user = user;
      this.saveUserToStorage(user);
      this.notifyListeners();

      return { user, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { user: null, error: "Có lỗi xảy ra khi đăng nhập" };
    }
  }

  async signOut(): Promise<void> {
    this.user = null;
    this.saveUserToStorage(null);
    this.notifyListeners();
  }

  private getStoredUsersData(): StoredUserData[] {
    try {
      const stored = localStorage.getItem("kb_users_data");
      const parsed = safeParseJson<StoredUserData[]>(stored, []);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error loading users data:", error);
      return [];
    }
  }

  private saveUserDataToList(userData: StoredUserData): void {
    try {
      const existingUsers = this.getStoredUsersData();
      const updatedUsers = [
        ...existingUsers.filter((u) => u.id !== userData.id),
        userData,
      ];
      localStorage.setItem("kb_users_data", JSON.stringify(updatedUsers));
    } catch (error) {
      console.error("Error saving user data to list:", error);
    }
  }

  // Legacy support for old user data
  private getStoredUsers(): User[] {
    try {
      const stored = localStorage.getItem("kb_users");
      const parsed = safeParseJson<User[]>(stored, []);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error loading users:", error);
      return [];
    }
  }

  private saveUserToUsersList(user: User): void {
    try {
      const existingUsers = this.getStoredUsers();
      const updatedUsers = [
        ...existingUsers.filter((u) => u.id !== user.id),
        user,
      ];
      localStorage.setItem("kb_users", JSON.stringify(updatedUsers));
    } catch (error) {
      console.error("Error saving user to list:", error);
    }
  }

  async updateProfile(
    updates: Partial<User>
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      if (!this.user) {
        return { user: null, error: "Chưa đăng nhập" };
      }

      const updatedUser = { ...this.user, ...updates };
      this.user = updatedUser;
      this.saveUserToStorage(updatedUser);
      this.saveUserDataToList(updatedUser as StoredUserData);
      this.notifyListeners();

      return { user: updatedUser, error: null };
    } catch (error) {
      console.error("Update profile error:", error);
      return { user: null, error: "Có lỗi xảy ra khi cập nhật thông tin" };
    }
  }
}

export const authService = AuthService.getInstance();

