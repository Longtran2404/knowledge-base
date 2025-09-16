/**
 * Comprehensive Internationalization (i18n) System
 * Provides multi-language support with dynamic loading and fallbacks
 */

import React from "react";

export interface Translation {
  [key: string]: string | Translation;
}

export interface I18nConfig {
  defaultLanguage: string;
  fallbackLanguage: string;
  supportedLanguages: string[];
  loadPath: string;
  cacheTranslations: boolean;
  enablePluralization: boolean;
  enableInterpolation: boolean;
}

export interface PluralRule {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export interface I18nContext {
  language: string;
  translations: Translation;
  isLoading: boolean;
  error: string | null;
}

export class I18nManager {
  private static instance: I18nManager;
  private config: I18nConfig;
  private translations: Map<string, Translation> = new Map();
  private currentLanguage: string;
  private listeners: Set<(context: I18nContext) => void> = new Set();
  private isLoading: boolean = false;
  private error: string | null = null;

  private constructor() {
    this.config = {
      defaultLanguage: "vi",
      fallbackLanguage: "en",
      supportedLanguages: ["vi", "en", "zh", "ja", "ko"],
      loadPath: "/locales",
      cacheTranslations: true,
      enablePluralization: true,
      enableInterpolation: true,
    };

    this.currentLanguage = this.detectLanguage();
    this.loadLanguage(this.currentLanguage);
  }

  public static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  /**
   * Detect user's preferred language
   */
  private detectLanguage(): string {
    // Check localStorage first
    const stored = localStorage.getItem("i18n_language");
    if (stored && this.config.supportedLanguages.includes(stored)) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language.split("-")[0];
    if (this.config.supportedLanguages.includes(browserLang)) {
      return browserLang;
    }

    // Check browser languages
    for (const lang of navigator.languages) {
      const langCode = lang.split("-")[0];
      if (this.config.supportedLanguages.includes(langCode)) {
        return langCode;
      }
    }

    return this.config.defaultLanguage;
  }

  /**
   * Load translation for a language
   */
  public async loadLanguage(language: string): Promise<void> {
    if (this.config.cacheTranslations && this.translations.has(language)) {
      this.currentLanguage = language;
      this.notifyListeners();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.notifyListeners();

    try {
      const translation = await this.fetchTranslation(language);
      this.translations.set(language, translation);
      this.currentLanguage = language;
      localStorage.setItem("i18n_language", language);
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : "Failed to load translations";

      // Try fallback language
      if (language !== this.config.fallbackLanguage) {
        try {
          const fallbackTranslation = await this.fetchTranslation(
            this.config.fallbackLanguage
          );
          this.translations.set(
            this.config.fallbackLanguage,
            fallbackTranslation
          );
          this.currentLanguage = this.config.fallbackLanguage;
        } catch (fallbackError) {
          console.error("Failed to load fallback translations:", fallbackError);
        }
      }
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * Fetch translation from server or local files
   */
  private async fetchTranslation(language: string): Promise<Translation> {
    try {
      // Try to load from server first
      const response = await fetch(`${this.config.loadPath}/${language}.json`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(
        `Failed to load translation from server for ${language}:`,
        error
      );
    }

    // Fallback to local translations
    return this.getLocalTranslation(language);
  }

  /**
   * Get local translation (embedded in bundle)
   */
  private getLocalTranslation(language: string): Translation {
    const localTranslations: Record<string, Translation> = {
      vi: {
        common: {
          loading: "Đang tải...",
          error: "Có lỗi xảy ra",
          success: "Thành công",
          cancel: "Hủy",
          confirm: "Xác nhận",
          save: "Lưu",
          delete: "Xóa",
          edit: "Chỉnh sửa",
          add: "Thêm",
          search: "Tìm kiếm",
          filter: "Lọc",
          sort: "Sắp xếp",
          refresh: "Làm mới",
          back: "Quay lại",
          next: "Tiếp theo",
          previous: "Trước đó",
          close: "Đóng",
          open: "Mở",
          yes: "Có",
          no: "Không",
        },
        auth: {
          login: "Đăng nhập",
          logout: "Đăng xuất",
          register: "Đăng ký",
          email: "Email",
          password: "Mật khẩu",
          confirmPassword: "Xác nhận mật khẩu",
          forgotPassword: "Quên mật khẩu?",
          rememberMe: "Ghi nhớ đăng nhập",
          loginSuccess: "Đăng nhập thành công",
          loginError: "Đăng nhập thất bại",
          registerSuccess: "Đăng ký thành công",
          registerError: "Đăng ký thất bại",
        },
        navigation: {
          home: "Trang chủ",
          courses: "Khóa học",
          products: "Sản phẩm",
          resources: "Tài nguyên",
          blog: "Blog",
          about: "Giới thiệu",
          contact: "Liên hệ",
          profile: "Hồ sơ",
          settings: "Cài đặt",
          help: "Trợ giúp",
        },
        course: {
          title: "Khóa học",
          description: "Mô tả",
          level: "Cấp độ",
          duration: "Thời lượng",
          lessons: "Số bài học",
          instructor: "Giảng viên",
          price: "Giá",
          rating: "Đánh giá",
          enroll: "Đăng ký",
          enrolled: "Đã đăng ký",
          completed: "Hoàn thành",
          inProgress: "Đang học",
        },
        validation: {
          required: "Trường này là bắt buộc",
          email: "Email không hợp lệ",
          password: "Mật khẩu phải có ít nhất 8 ký tự",
          confirmPassword: "Mật khẩu xác nhận không khớp",
          minLength: "Tối thiểu {min} ký tự",
          maxLength: "Tối đa {max} ký tự",
          min: "Giá trị tối thiểu là {min}",
          max: "Giá trị tối đa là {max}",
        },
        error: {
          networkError: "Lỗi kết nối mạng",
          serverError: "Lỗi máy chủ",
          notFound: "Không tìm thấy",
          unauthorized: "Không có quyền truy cập",
          forbidden: "Bị cấm truy cập",
          validationError: "Lỗi xác thực dữ liệu",
          unknownError: "Lỗi không xác định",
        },
      },
      en: {
        common: {
          loading: "Loading...",
          error: "An error occurred",
          success: "Success",
          cancel: "Cancel",
          confirm: "Confirm",
          save: "Save",
          delete: "Delete",
          edit: "Edit",
          add: "Add",
          search: "Search",
          filter: "Filter",
          sort: "Sort",
          refresh: "Refresh",
          back: "Back",
          next: "Next",
          previous: "Previous",
          close: "Close",
          open: "Open",
          yes: "Yes",
          no: "No",
        },
        auth: {
          login: "Login",
          logout: "Logout",
          register: "Register",
          email: "Email",
          password: "Password",
          confirmPassword: "Confirm Password",
          forgotPassword: "Forgot Password?",
          rememberMe: "Remember Me",
          loginSuccess: "Login successful",
          loginError: "Login failed",
          registerSuccess: "Registration successful",
          registerError: "Registration failed",
        },
        navigation: {
          home: "Home",
          courses: "Courses",
          products: "Products",
          resources: "Resources",
          blog: "Blog",
          about: "About",
          contact: "Contact",
          profile: "Profile",
          settings: "Settings",
          help: "Help",
        },
        course: {
          title: "Course",
          description: "Description",
          level: "Level",
          duration: "Duration",
          lessons: "Lessons",
          instructor: "Instructor",
          price: "Price",
          rating: "Rating",
          enroll: "Enroll",
          enrolled: "Enrolled",
          completed: "Completed",
          inProgress: "In Progress",
        },
        validation: {
          required: "This field is required",
          email: "Invalid email address",
          password: "Password must be at least 8 characters",
          confirmPassword: "Passwords do not match",
          minLength: "Minimum {min} characters",
          maxLength: "Maximum {max} characters",
          min: "Minimum value is {min}",
          max: "Maximum value is {max}",
        },
        error: {
          networkError: "Network connection error",
          serverError: "Server error",
          notFound: "Not found",
          unauthorized: "Unauthorized access",
          forbidden: "Access forbidden",
          validationError: "Data validation error",
          unknownError: "Unknown error",
        },
      },
    };

    return (
      localTranslations[language] ||
      localTranslations[this.config.fallbackLanguage]
    );
  }

  /**
   * Translate a key
   */
  public t(key: string, params?: Record<string, any>): string {
    const translation = this.getTranslation(key);

    if (translation === key) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    if (params && this.config.enableInterpolation) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  /**
   * Get translation for a key
   */
  private getTranslation(key: string): string {
    const currentTranslations = this.translations.get(this.currentLanguage);
    if (!currentTranslations) {
      return key;
    }

    const keys = key.split(".");
    let translation: any = currentTranslations;

    for (const k of keys) {
      if (translation && typeof translation === "object" && k in translation) {
        translation = translation[k];
      } else {
        // Try fallback language
        const fallbackTranslations = this.translations.get(
          this.config.fallbackLanguage
        );
        if (fallbackTranslations) {
          let fallbackTranslation: any = fallbackTranslations;
          for (const k of keys) {
            if (
              fallbackTranslation &&
              typeof fallbackTranslation === "object" &&
              k in fallbackTranslation
            ) {
              fallbackTranslation = fallbackTranslation[k];
            } else {
              return key;
            }
          }
          return fallbackTranslation;
        }
        return key;
      }
    }

    return typeof translation === "string" ? translation : key;
  }

  /**
   * Interpolate parameters in translation
   */
  private interpolate(
    translation: string,
    params: Record<string, any>
  ): string {
    return translation.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  /**
   * Pluralize translation
   */
  public tp(key: string, count: number, params?: Record<string, any>): string {
    if (!this.config.enablePluralization) {
      return this.t(key, { ...params, count });
    }

    const pluralKey = this.getPluralKey(key, count);
    return this.t(pluralKey, { ...params, count });
  }

  /**
   * Get plural key based on count
   */
  private getPluralKey(key: string, count: number): string {
    // Simple pluralization rules for Vietnamese and English
    if (this.currentLanguage === "vi") {
      return count === 1 ? `${key}.one` : `${key}.other`;
    } else {
      if (count === 0) return `${key}.zero`;
      if (count === 1) return `${key}.one`;
      if (count === 2) return `${key}.two`;
      return `${key}.other`;
    }
  }

  /**
   * Get current language
   */
  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): string[] {
    return [...this.config.supportedLanguages];
  }

  /**
   * Check if language is supported
   */
  public isLanguageSupported(language: string): boolean {
    return this.config.supportedLanguages.includes(language);
  }

  /**
   * Subscribe to i18n context changes
   */
  public subscribe(listener: (context: I18nContext) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current i18n context
   */
  public getContext(): I18nContext {
    return {
      language: this.currentLanguage,
      translations: this.translations.get(this.currentLanguage) || {},
      isLoading: this.isLoading,
      error: this.error,
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<I18nConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): I18nConfig {
    return { ...this.config };
  }

  /**
   * Clear cached translations
   */
  public clearCache(): void {
    this.translations.clear();
  }

  /**
   * Notify listeners of context changes
   */
  private notifyListeners(): void {
    const context = this.getContext();
    this.listeners.forEach((listener) => listener(context));
  }
}

// Export singleton instance
export const i18n = I18nManager.getInstance();

// Export utility functions
export const t = (key: string, params?: Record<string, any>) =>
  i18n.t(key, params);
export const tp = (key: string, count: number, params?: Record<string, any>) =>
  i18n.tp(key, count, params);
export const useI18n = () => {
  const [context, setContext] = React.useState(() => i18n.getContext());

  React.useEffect(() => {
    const unsubscribe = i18n.subscribe(setContext);
    return unsubscribe;
  }, []);

  return {
    ...context,
    t: i18n.t.bind(i18n),
    tp: i18n.tp.bind(i18n),
    changeLanguage: i18n.loadLanguage.bind(i18n),
  };
};
