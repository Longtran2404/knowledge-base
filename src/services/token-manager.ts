import CryptoJS from "crypto-js";

export interface TokenData {
  token: string;
  expiresAt: string;
  userId?: string;
  type: "session" | "refresh" | "verification";
}

export class TokenManager {
  private static readonly SESSION_TOKEN_KEY = "nlc_session_token";
  private static readonly REFRESH_TOKEN_KEY = "nlc_refresh_token";
  private static readonly USER_DATA_KEY = "nlc_user_data";
  private static readonly TOKEN_EXPIRY_KEY = "nlc_token_expiry";

  /**
   * Generate a cryptographically secure random token
   */
  static generateToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const combined =
      timestamp + random + Math.random().toString(36).substring(2);
    return CryptoJS.SHA256(combined).toString();
  }

  /**
   * Create a new token with expiry
   */
  static createToken(
    type: "session" | "refresh" | "verification",
    expiresInHours: number = 24
  ): TokenData {
    const token = this.generateToken();
    const expiresAt = new Date(
      Date.now() + expiresInHours * 60 * 60 * 1000
    ).toISOString();

    return {
      token,
      expiresAt,
      type,
    };
  }

  /**
   * Store session tokens securely
   */
  static setSessionTokens(
    sessionToken: string,
    refreshToken: string,
    expiresIn: number
  ) {
    const expires = new Date(Date.now() + expiresIn * 1000);

    // Store in localStorage for persistence
    localStorage.setItem(this.SESSION_TOKEN_KEY, sessionToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expires.toISOString());

    // Also store in sessionStorage for additional security
    sessionStorage.setItem(this.SESSION_TOKEN_KEY, sessionToken);
  }

  /**
   * Get session token
   */
  static getSessionToken(): string | null {
    return (
      localStorage.getItem(this.SESSION_TOKEN_KEY) ||
      sessionStorage.getItem(this.SESSION_TOKEN_KEY)
    );
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;

    return new Date() > new Date(expiry);
  }

  /**
   * Clear all tokens
   */
  static clearTokens() {
    localStorage.removeItem(this.SESSION_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);

    sessionStorage.removeItem(this.SESSION_TOKEN_KEY);
  }

  /**
   * Store user data
   */
  static setUserData(user: any) {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
  }

  /**
   * Get user data
   */
  static getUserData(): any | null {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    if (!userData || userData.trim() === '') return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  /**
   * Validate token format
   */
  static validateTokenFormat(token: string): boolean {
    // Basic validation - token should be 64 characters (SHA256 hex)
    return /^[a-f0-9]{64}$/i.test(token);
  }

  /**
   * Get token info for debugging
   */
  static getTokenInfo() {
    return {
      hasSessionToken: !!this.getSessionToken(),
      hasRefreshToken: !!this.getRefreshToken(),
      isExpired: this.isTokenExpired(),
      userData: this.getUserData(),
    };
  }
}
