/**
 * Application configuration service
 * Centralizes all environment variables and app settings
 */

export interface AppConfig {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;

  // Stripe
  stripePublishableKey: string;
  stripeSecretKey: string;

  // API
  apiUrl: string;
  appUrl: string;

  // Email
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;

  // App Info
  appName: string;
  appVersion: string;
  environment: string;

  // Feature Flags
  enableAnalytics: boolean;
  enableDebug: boolean;
  enablePaymentMonitoring: boolean;
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = {
      // Supabase (Next.js: NEXT_PUBLIC_*; next.config maps REACT_APP_* -> NEXT_PUBLIC_*)
      supabaseUrl:
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || "https://demo.supabase.co",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || "demo-key",

      // Stripe
      stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "",
      stripeSecretKey: process.env.REACT_APP_STRIPE_SECRET_KEY || "",

      // API
      apiUrl: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || "http://localhost:3001",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.REACT_APP_APP_URL || "http://localhost:3000",

      // Email
      emailjsServiceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || process.env.REACT_APP_EMAILJS_SERVICE_ID || "",
      emailjsTemplateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "",
      emailjsPublicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "",

      // App Info
      appName: process.env.NEXT_PUBLIC_APP_NAME || process.env.REACT_APP_APP_NAME || "Knowledge Base",
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || process.env.REACT_APP_APP_VERSION || "1.0.0",
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.REACT_APP_ENVIRONMENT || "development",

      // Feature Flags
      enableAnalytics: (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS ?? process.env.REACT_APP_ENABLE_ANALYTICS) === "true",
      enableDebug: (process.env.NEXT_PUBLIC_ENABLE_DEBUG ?? process.env.REACT_APP_ENABLE_DEBUG) === "true",
      enablePaymentMonitoring:
        (process.env.NEXT_PUBLIC_ENABLE_PAYMENT_MONITORING ?? process.env.REACT_APP_ENABLE_PAYMENT_MONITORING) !== "false",
    };

    this.validateConfig();
  }

  /**
   * Get the entire configuration object
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Get a specific configuration value
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return this.config.environment === "development";
  }

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return this.config.environment === "production";
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(
    feature: keyof Pick<
      AppConfig,
      "enableAnalytics" | "enableDebug" | "enablePaymentMonitoring"
    >
  ): boolean {
    return this.config[feature];
  }

  /**
   * Validate required configuration
   */
  private validateConfig(): void {
    const required = [
      { key: "supabaseUrl", value: this.config.supabaseUrl },
      { key: "supabaseAnonKey", value: this.config.supabaseAnonKey },
    ];

    const missing = required.filter((item) => !item.value);

    if (missing.length > 0) {
      console.error(
        "Missing required environment variables:",
        missing.map((item) => item.key)
      );
      // Không throw trên production để app không crash trên Vercel khi thiếu env.
      if (!this.isProduction()) {
        throw new Error(
          `Missing required environment variables: ${missing
            .map((item) => item.key)
            .join(", ")}`
        );
      }
    }
  }

  /**
   * Get API endpoints
   */
  getApiEndpoints() {
    return {
      auth: `${this.config.apiUrl}/api/auth`,
      subscription: `${this.config.apiUrl}/api/subscription`,
      payment: `${this.config.apiUrl}/api/payment`,
      user: `${this.config.apiUrl}/api/user`,
    };
  }

  /**
   * Get Supabase configuration
   */
  getSupabaseConfig() {
    return {
      url: this.config.supabaseUrl,
      anonKey: this.config.supabaseAnonKey,
    };
  }

  /**
   * Get Stripe configuration
   */
  getStripeConfig() {
    return {
      publishableKey: this.config.stripePublishableKey,
      secretKey: this.config.stripeSecretKey,
    };
  }

  /**
   * Get EmailJS configuration
   */
  getEmailConfig() {
    return {
      serviceId: this.config.emailjsServiceId,
      templateId: this.config.emailjsTemplateId,
      publicKey: this.config.emailjsPublicKey,
    };
  }

  /**
   * Debug configuration (only in development)
   */
  debug(): void {
    try {
      if (this.isDevelopment() && this.isFeatureEnabled("enableDebug")) {
        console.group("🔧 App Configuration");
        console.log("Environment:", this.config.environment);
        console.log("App Name:", this.config.appName);
        console.log("App Version:", this.config.appVersion);
        console.log("API URL:", this.config.apiUrl);
        console.log("App URL:", this.config.appUrl);
        console.log("Features:", {
          analytics: this.config.enableAnalytics,
          debug: this.config.enableDebug,
          paymentMonitoring: this.config.enablePaymentMonitoring,
        });
        console.groupEnd();
      }
    } catch (error) {
      console.warn("Debug configuration failed:", error);
    }
  }
}

// Export singleton instance
export const config = new ConfigService();

// AppConfig is already exported as interface above
