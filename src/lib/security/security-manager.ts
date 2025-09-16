/**
 * Comprehensive Security Management System
 * Provides security utilities, input sanitization, and threat detection
 */

export interface SecurityConfig {
  maxRequestSize: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
}

export interface SecurityEvent {
  id: string;
  type:
    | "XSS_ATTEMPT"
    | "SQL_INJECTION"
    | "CSRF_ATTEMPT"
    | "BRUTE_FORCE"
    | "SUSPICIOUS_ACTIVITY";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  source: string;
  timestamp: number;
  metadata: Record<string, any>;
  blocked: boolean;
}

export interface ThreatDetection {
  isThreat: boolean;
  threatType: string;
  confidence: number;
  details: string;
  recommendations: string[];
}

export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private securityEvents: SecurityEvent[] = [];
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> =
    new Map();
  private blockedIPs: Set<string> = new Set();
  private suspiciousPatterns: RegExp[] = [];

  private constructor() {
    this.config = {
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedFileTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "text/plain",
      ],
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      enableCSP: true,
      enableHSTS: true,
      enableXSSProtection: true,
      enableCSRFProtection: true,
    };

    this.setupSuspiciousPatterns();
    this.setupSecurityHeaders();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Setup suspicious patterns for threat detection
   */
  private setupSuspiciousPatterns(): void {
    this.suspiciousPatterns = [
      // XSS patterns
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
      /<style[^>]*>.*?<\/style>/gi,
      /<form[^>]*>.*?<\/form>/gi,

      // SQL injection patterns
      /('|(\\')|(;)|(--)|(\/\*)|(\*\/)|(\+)|(%27)|(%3B)|(%2D)|(%2D)|(%2F)|(%2A))/gi,
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi,
      /(or|and)\s+\d+\s*=\s*\d+/gi,
      /(or|and)\s+['"]\s*=\s*['"]/gi,

      // Path traversal patterns
      /\.\.\//gi,
      /\.\.\\/gi,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi,

      // Command injection patterns
      /[;&|`$()]/gi,
      /(cat|ls|dir|type|more|less|head|tail|grep|find|locate|which|whereis)/gi,

      // LDAP injection patterns
      /[()=*!&|]/gi,
      /(cn|uid|ou|dc|objectClass)/gi,
    ];
  }

  /**
   * Setup security headers
   */
  private setupSecurityHeaders(): void {
    if (typeof document === "undefined") return;

    // Content Security Policy
    if (this.config.enableCSP) {
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");

      const meta = document.createElement("meta");
      meta.httpEquiv = "Content-Security-Policy";
      meta.content = csp;
      document.head.appendChild(meta);
    }

    // XSS Protection
    if (this.config.enableXSSProtection) {
      const meta = document.createElement("meta");
      meta.httpEquiv = "X-XSS-Protection";
      meta.content = "1; mode=block";
      document.head.appendChild(meta);
    }

    // HSTS
    if (this.config.enableHSTS && window.location.protocol === "https:") {
      const meta = document.createElement("meta");
      meta.httpEquiv = "Strict-Transport-Security";
      meta.content = "max-age=31536000; includeSubDomains";
      document.head.appendChild(meta);
    }
  }

  /**
   * Sanitize input to prevent XSS attacks
   */
  public sanitizeInput(input: string): string {
    if (typeof input !== "string") return input;

    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .replace(/\n/g, "<br>")
      .replace(/\r/g, "");
  }

  /**
   * Sanitize HTML content
   */
  public sanitizeHTML(html: string): string {
    if (typeof html !== "string") return html;

    // Remove script tags and their content
    html = html.replace(/<script[^>]*>.*?<\/script>/gi, "");

    // Remove event handlers
    html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");

    // Remove javascript: URLs
    html = html.replace(/javascript:/gi, "");

    // Remove data: URLs that might contain scripts
    html = html.replace(/data:text\/html/gi, "data:text/plain");

    return html;
  }

  /**
   * Validate file upload
   */
  public validateFileUpload(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${
          this.config.maxFileSize / 1024 / 1024
        }MB`,
      };
    }

    // Check file type
    if (!this.config.allowedFileTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    // Check file extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = this.config.allowedFileTypes.map(
      (type) => type.split("/")[1]
    );

    if (extension && !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed`,
      };
    }

    return { valid: true };
  }

  /**
   * Detect threats in input
   */
  public detectThreats(input: string): ThreatDetection {
    const threats: string[] = [];
    let maxConfidence = 0;

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(input)) {
        const matches = input.match(pattern);
        if (matches) {
          threats.push(pattern.source);
          maxConfidence = Math.max(maxConfidence, 0.8);
        }
      }
    }

    // Check for suspicious length
    if (input.length > 10000) {
      threats.push("SUSPICIOUS_LENGTH");
      maxConfidence = Math.max(maxConfidence, 0.3);
    }

    // Check for repeated characters (potential buffer overflow)
    if (/(.)\1{50,}/.test(input)) {
      threats.push("REPEATED_CHARACTERS");
      maxConfidence = Math.max(maxConfidence, 0.6);
    }

    const isThreat = threats.length > 0;
    const threatType = threats.length > 0 ? threats[0] : "NONE";
    const confidence = maxConfidence;

    return {
      isThreat,
      threatType,
      confidence,
      details: threats.join(", "),
      recommendations: this.getThreatRecommendations(threatType),
    };
  }

  /**
   * Get threat recommendations
   */
  private getThreatRecommendations(threatType: string): string[] {
    const recommendations: Record<string, string[]> = {
      XSS_ATTEMPT: [
        "Sanitize user input before displaying",
        "Use Content Security Policy (CSP)",
        "Validate and escape output",
      ],
      SQL_INJECTION: [
        "Use parameterized queries",
        "Validate input against whitelist",
        "Implement proper access controls",
      ],
      CSRF_ATTEMPT: [
        "Implement CSRF tokens",
        "Validate referer header",
        "Use SameSite cookie attribute",
      ],
      BRUTE_FORCE: [
        "Implement rate limiting",
        "Use CAPTCHA for repeated attempts",
        "Implement account lockout",
      ],
      SUSPICIOUS_LENGTH: [
        "Implement input length limits",
        "Validate input size",
        "Monitor for unusual patterns",
      ],
      REPEATED_CHARACTERS: [
        "Implement input validation",
        "Monitor for buffer overflow attempts",
        "Use proper input sanitization",
      ],
    };

    return (
      recommendations[threatType] || [
        "Review input validation",
        "Implement additional security measures",
      ]
    );
  }

  /**
   * Track login attempts
   */
  public trackLoginAttempt(identifier: string, success: boolean): boolean {
    const now = Date.now();
    const attempts = this.loginAttempts.get(identifier) || {
      count: 0,
      lastAttempt: 0,
    };

    if (success) {
      this.loginAttempts.delete(identifier);
      return true;
    }

    attempts.count++;
    attempts.lastAttempt = now;
    this.loginAttempts.set(identifier, attempts);

    // Check if account should be locked
    if (attempts.count >= this.config.maxLoginAttempts) {
      this.blockedIPs.add(identifier);
      this.logSecurityEvent({
        type: "BRUTE_FORCE",
        severity: "HIGH",
        description: `Account locked due to ${attempts.count} failed login attempts`,
        source: identifier,
        metadata: { attemptCount: attempts.count },
        blocked: true,
      });
      return false;
    }

    return true;
  }

  /**
   * Check if identifier is blocked
   */
  public isBlocked(identifier: string): boolean {
    const attempts = this.loginAttempts.get(identifier);
    if (!attempts) return false;

    const now = Date.now();
    const timeSinceLastAttempt = now - attempts.lastAttempt;

    // Unblock if lockout duration has passed
    if (timeSinceLastAttempt > this.config.lockoutDuration) {
      this.loginAttempts.delete(identifier);
      this.blockedIPs.delete(identifier);
      return false;
    }

    return this.blockedIPs.has(identifier);
  }

  /**
   * Log security event
   */
  public logSecurityEvent(
    event: Omit<SecurityEvent, "id" | "timestamp">
  ): void {
    const securityEvent: SecurityEvent = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...event,
    };

    this.securityEvents.push(securityEvent);

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn("Security Event:", securityEvent);
    }

    // In production, send to security monitoring service
    if (process.env.NODE_ENV === "production") {
      this.sendToSecurityService(securityEvent);
    }
  }

  /**
   * Get security events
   */
  public getSecurityEvents(filters?: {
    type?: SecurityEvent["type"];
    severity?: SecurityEvent["severity"];
    startTime?: number;
    endTime?: number;
    limit?: number;
  }): SecurityEvent[] {
    let filteredEvents = [...this.securityEvents];

    if (filters) {
      if (filters.type) {
        filteredEvents = filteredEvents.filter((e) => e.type === filters.type);
      }
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(
          (e) => e.severity === filters.severity
        );
      }
      if (filters.startTime) {
        filteredEvents = filteredEvents.filter(
          (e) => e.timestamp >= filters.startTime!
        );
      }
      if (filters.endTime) {
        filteredEvents = filteredEvents.filter(
          (e) => e.timestamp <= filters.endTime!
        );
      }
      if (filters.limit) {
        filteredEvents = filteredEvents.slice(-filters.limit);
      }
    }

    return filteredEvents;
  }

  /**
   * Get security statistics
   */
  public getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    blockedIPs: number;
    recentThreats: number;
  } {
    const stats = {
      totalEvents: this.securityEvents.length,
      eventsByType: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>,
      blockedIPs: this.blockedIPs.size,
      recentThreats: 0,
    };

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    this.securityEvents.forEach((event) => {
      stats.eventsByType[event.type] =
        (stats.eventsByType[event.type] || 0) + 1;
      stats.eventsBySeverity[event.severity] =
        (stats.eventsBySeverity[event.severity] || 0) + 1;

      if (event.timestamp > oneHourAgo) {
        stats.recentThreats++;
      }
    });

    return stats;
  }

  /**
   * Generate CSRF token
   */
  public generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  /**
   * Validate CSRF token
   */
  public validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length === 64;
  }

  /**
   * Generate secure random string
   */
  public generateSecureRandom(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  /**
   * Hash password securely
   */
  public async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash), (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  }

  /**
   * Update security configuration
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Clear security events
   */
  public clearSecurityEvents(): void {
    this.securityEvents = [];
  }

  /**
   * Clear blocked IPs
   */
  public clearBlockedIPs(): void {
    this.blockedIPs.clear();
    this.loginAttempts.clear();
  }

  /**
   * Send to security service (placeholder)
   */
  private sendToSecurityService(event: SecurityEvent): void {
    // In a real application, this would send to a security monitoring service
    console.log("Security event sent to monitoring service:", event);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();

// Export utility functions
export const sanitizeInput = (input: string) =>
  securityManager.sanitizeInput(input);
export const sanitizeHTML = (html: string) =>
  securityManager.sanitizeHTML(html);
export const detectThreats = (input: string) =>
  securityManager.detectThreats(input);
export const validateFileUpload = (file: File) =>
  securityManager.validateFileUpload(file);
export const generateCSRFToken = () => securityManager.generateCSRFToken();
export const validateCSRFToken = (token: string, storedToken: string) =>
  securityManager.validateCSRFToken(token, storedToken);
