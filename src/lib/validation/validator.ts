import { z, ZodSchema, ZodError } from "zod";
import { errorHandler, createErrorContext } from "../error-handler";

/**
 * Comprehensive validation utility service
 * Provides type-safe validation with detailed error handling
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * Validate data against a Zod schema
   */
  public validate<T>(
    schema: ZodSchema<T>,
    data: unknown,
    context?: string
  ): ValidationResult<T> {
    try {
      const validatedData = schema.parse(data);
      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = this.formatZodErrors(error);

        // Log validation error
        if (context) {
          const errorContext = createErrorContext(
            `VALIDATION_${context}`,
            "ValidationService"
          );
          errorHandler.wrapError(error, errorContext);
        }

        return {
          success: false,
          errors: validationErrors,
        };
      }

      // Handle unexpected errors
      const errorContext = createErrorContext(
        `VALIDATION_UNEXPECTED_${context || "UNKNOWN"}`,
        "ValidationService"
      );
      const wrappedError = errorHandler.wrapError(error, errorContext);

      return {
        success: false,
        errors: [
          {
            field: "unknown",
            message: "Lỗi validation không xác định",
            code: "VALIDATION_ERROR",
          },
        ],
      };
    }
  }

  /**
   * Validate data and throw error if invalid
   */
  public validateOrThrow<T>(
    schema: ZodSchema<T>,
    data: unknown,
    context?: string
  ): T {
    const result = this.validate(schema, data, context);

    if (!result.success) {
      const error = new Error("Validation failed");
      (error as any).validationErrors = result.errors;
      throw error;
    }

    return result.data!;
  }

  /**
   * Validate partial data (useful for updates)
   */
  public validatePartial<T>(
    schema: ZodSchema<T>,
    data: unknown,
    context?: string
  ): ValidationResult<Partial<T>> {
    try {
      const partialSchema = (schema as any).partial();
      const validatedData = partialSchema.parse(data);
      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = this.formatZodErrors(error);

        if (context) {
          const errorContext = createErrorContext(
            `PARTIAL_VALIDATION_${context}`,
            "ValidationService"
          );
          errorHandler.wrapError(error, errorContext);
        }

        return {
          success: false,
          errors: validationErrors,
        };
      }

      const errorContext = createErrorContext(
        `PARTIAL_VALIDATION_UNEXPECTED_${context || "UNKNOWN"}`,
        "ValidationService"
      );
      errorHandler.wrapError(error, errorContext);

      return {
        success: false,
        errors: [
          {
            field: "unknown",
            message: "Lỗi validation không xác định",
            code: "VALIDATION_ERROR",
          },
        ],
      };
    }
  }

  /**
   * Validate array of data
   */
  public validateArray<T>(
    schema: ZodSchema<T>,
    data: unknown[],
    context?: string
  ): ValidationResult<T[]> {
    const results: T[] = [];
    const allErrors: ValidationError[] = [];

    data.forEach((item, index) => {
      const result = this.validate(schema, item, `${context}_ITEM_${index}`);

      if (result.success) {
        results.push(result.data!);
      } else {
        allErrors.push(
          ...(result.errors || []).map((error) => ({
            ...error,
            field: `${error.field}[${index}]`,
          }))
        );
      }
    });

    if (allErrors.length > 0) {
      return {
        success: false,
        errors: allErrors,
      };
    }

    return {
      success: true,
      data: results,
    };
  }

  /**
   * Sanitize data before validation
   */
  public sanitize<T>(data: unknown): unknown {
    if (typeof data === "string") {
      return data.trim();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    if (data && typeof data === "object") {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key.trim()] = this.sanitize(value);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Validate and sanitize data
   */
  public validateAndSanitize<T>(
    schema: ZodSchema<T>,
    data: unknown,
    context?: string
  ): ValidationResult<T> {
    const sanitizedData = this.sanitize(data);
    return this.validate(schema, sanitizedData, context);
  }

  /**
   * Create a custom validation rule
   */
  public createCustomRule<T>(
    validator: (data: T) => boolean,
    message: string,
    code: string = "CUSTOM_VALIDATION"
  ) {
    return z.custom<T>((data) => {
      if (!validator(data)) {
        throw new z.ZodError([
          {
            code: "custom",
            message,
            path: [],
          },
        ]);
      }
      return data;
    });
  }

  /**
   * Format Zod errors to our custom format
   */
  private formatZodErrors(error: ZodError): ValidationError[] {
    return error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
      value: (err as any).input,
    }));
  }

  /**
   * Get validation summary
   */
  public getValidationSummary(errors: ValidationError[]): {
    totalErrors: number;
    errorsByField: Record<string, number>;
    errorsByCode: Record<string, number>;
  } {
    const summary = {
      totalErrors: errors.length,
      errorsByField: {} as Record<string, number>,
      errorsByCode: {} as Record<string, number>,
    };

    errors.forEach((error) => {
      summary.errorsByField[error.field] =
        (summary.errorsByField[error.field] || 0) + 1;
      summary.errorsByCode[error.code] =
        (summary.errorsByCode[error.code] || 0) + 1;
    });

    return summary;
  }

  /**
   * Validate file upload
   */
  public validateFile(
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      allowedExtensions?: string[];
    } = {}
  ): ValidationResult<File> {
    const errors: ValidationError[] = [];

    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      errors.push({
        field: "file",
        message: `File quá lớn. Kích thước tối đa: ${Math.round(
          options.maxSize / 1024 / 1024
        )}MB`,
        code: "FILE_TOO_LARGE",
        value: file.size,
      });
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push({
        field: "file",
        message: `Loại file không được hỗ trợ. Các loại được hỗ trợ: ${options.allowedTypes.join(
          ", "
        )}`,
        code: "INVALID_FILE_TYPE",
        value: file.type,
      });
    }

    // Check file extension
    if (options.allowedExtensions) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !options.allowedExtensions.includes(extension)) {
        errors.push({
          field: "file",
          message: `Phần mở rộng file không được hỗ trợ. Các phần mở rộng được hỗ trợ: ${options.allowedExtensions.join(
            ", "
          )}`,
          code: "INVALID_FILE_EXTENSION",
          value: extension,
        });
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: file,
    };
  }

  /**
   * Validate URL
   */
  public validateUrl(url: string): ValidationResult<string> {
    try {
      new URL(url);
      return {
        success: true,
        data: url,
      };
    } catch {
      return {
        success: false,
        errors: [
          {
            field: "url",
            message: "URL không hợp lệ",
            code: "INVALID_URL",
            value: url,
          },
        ],
      };
    }
  }

  /**
   * Validate Vietnamese phone number
   */
  public validateVietnamesePhone(phone: string): ValidationResult<string> {
    const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8}$/;

    if (!phoneRegex.test(phone)) {
      return {
        success: false,
        errors: [
          {
            field: "phone",
            message: "Số điện thoại Việt Nam không hợp lệ",
            code: "INVALID_PHONE",
            value: phone,
          },
        ],
      };
    }

    return {
      success: true,
      data: phone,
    };
  }

  /**
   * Validate password strength
   */
  public validatePasswordStrength(password: string): ValidationResult<string> {
    const errors: ValidationError[] = [];

    if (password.length < 8) {
      errors.push({
        field: "password",
        message: "Mật khẩu phải có ít nhất 8 ký tự",
        code: "PASSWORD_TOO_SHORT",
      });
    }

    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: "password",
        message: "Mật khẩu phải chứa ít nhất 1 chữ hoa",
        code: "PASSWORD_NO_UPPERCASE",
      });
    }

    if (!/[a-z]/.test(password)) {
      errors.push({
        field: "password",
        message: "Mật khẩu phải chứa ít nhất 1 chữ thường",
        code: "PASSWORD_NO_LOWERCASE",
      });
    }

    if (!/\d/.test(password)) {
      errors.push({
        field: "password",
        message: "Mật khẩu phải chứa ít nhất 1 số",
        code: "PASSWORD_NO_NUMBER",
      });
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push({
        field: "password",
        message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)",
        code: "PASSWORD_NO_SPECIAL",
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: password,
    };
  }
}

// Export singleton instance
export const validator = ValidationService.getInstance();

// Export utility functions
export const validateData = <T>(
  schema: ZodSchema<T>,
  data: unknown,
  context?: string
): ValidationResult<T> => {
  return validator.validate(schema, data, context);
};

export const validateDataOrThrow = <T>(
  schema: ZodSchema<T>,
  data: unknown,
  context?: string
): T => {
  return validator.validateOrThrow(schema, data, context);
};

export const sanitizeAndValidate = <T>(
  schema: ZodSchema<T>,
  data: unknown,
  context?: string
): ValidationResult<T> => {
  return validator.validateAndSanitize(schema, data, context);
};
