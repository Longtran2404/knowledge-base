/**
 * Shared validation utilities
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ hoa");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ thường");
  }

  if (!/\d/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 số");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Vietnamese phone number validation
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// File size validation
export const isValidFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

// File type validation
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
  return allowedTypes.includes(fileExtension);
};

// Required field validation
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// String length validation
export const isValidLength = (
  value: string,
  min?: number,
  max?: number
): boolean => {
  const length = value.trim().length;
  if (min !== undefined && length < min) return false;
  if (max !== undefined && length > max) return false;
  return true;
};

// Number range validation
export const isInRange = (
  value: number,
  min?: number,
  max?: number
): boolean => {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

// Vietnamese name validation
export const isValidVietnameseName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔưăâêô\s]+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
};

// Form validation utility
export interface ValidationRule {
  validator: (value: any) => boolean | { isValid: boolean; errors?: string[] };
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export const validateForm = (
  data: Record<string, any>,
  schema: ValidationSchema
): {
  isValid: boolean;
  errors: Record<string, string[]>;
} => {
  const errors: Record<string, string[]> = {};

  Object.keys(schema).forEach(field => {
    const rules = schema[field];
    const value = data[field];
    const fieldErrors: string[] = [];

    rules.forEach(rule => {
      const result = rule.validator(value);

      if (typeof result === "boolean") {
        if (!result && rule.message) {
          fieldErrors.push(rule.message);
        }
      } else {
        if (!result.isValid && result.errors) {
          fieldErrors.push(...result.errors);
        }
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};