import { validator, ValidationResult } from "../../validation/validator";
import {
  UserSchema,
  CourseSchema,
  LoginSchema,
} from "../../validation/schemas";

describe("ValidationService", () => {
  describe("User validation", () => {
    it("should validate valid user data", () => {
      const validUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        fullName: "Nguyễn Văn A",
        role: "sinh_vien",
        plan: "free",
        status: "active",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const result = validator.validate(UserSchema, validUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validUser);
    });

    it("should reject invalid email", () => {
      const invalidUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "invalid-email",
        fullName: "Nguyễn Văn A",
        role: "sinh_vien",
        plan: "free",
        status: "active",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const result = validator.validate(UserSchema, invalidUser);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("email");
      expect(result.errors![0].message).toBe("Email không hợp lệ");
    });

    it("should reject invalid role", () => {
      const invalidUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        fullName: "Nguyễn Văn A",
        role: "invalid_role",
        plan: "free",
        status: "active",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const result = validator.validate(UserSchema, invalidUser);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("role");
      expect(result.errors![0].message).toBe("Vai trò không hợp lệ");
    });
  });

  describe("Course validation", () => {
    it("should validate valid course data", () => {
      const validCourse = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        slug: "test-course",
        title: "Test Course",
        description: "A comprehensive test course",
        level: "Beginner",
        domain: "Test Domain",
        year: 2024,
        tags: ["test", "course"],
        ratingAvg: 4.5,
        ratingCount: 10,
        thumbnail: "https://example.com/image.jpg",
        price: 100000,
        isHot: false,
        isPublished: true,
        instructorId: "123e4567-e89b-12d3-a456-426614174000",
        duration: 120,
        lessons: 10,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const result = validator.validate(CourseSchema, validCourse);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validCourse);
    });

    it("should reject course with invalid level", () => {
      const invalidCourse = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        slug: "test-course",
        title: "Test Course",
        description: "A comprehensive test course",
        level: "InvalidLevel",
        domain: "Test Domain",
        year: 2024,
        tags: ["test"],
        instructorId: "123e4567-e89b-12d3-a456-426614174000",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const result = validator.validate(CourseSchema, invalidCourse);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("level");
      expect(result.errors![0].message).toBe("Cấp độ không hợp lệ");
    });

    it("should reject course with empty tags", () => {
      const invalidCourse = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        slug: "test-course",
        title: "Test Course",
        description: "A comprehensive test course",
        level: "Beginner",
        domain: "Test Domain",
        year: 2024,
        tags: [],
        instructorId: "123e4567-e89b-12d3-a456-426614174000",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const result = validator.validate(CourseSchema, invalidCourse);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("tags");
      expect(result.errors![0].message).toBe("Phải có ít nhất 1 tag");
    });
  });

  describe("Login validation", () => {
    it("should validate valid login data", () => {
      const validLogin = {
        email: "test@example.com",
        password: "password123",
      };

      const result = validator.validate(LoginSchema, validLogin);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validLogin);
    });

    it("should reject empty password", () => {
      const invalidLogin = {
        email: "test@example.com",
        password: "",
      };

      const result = validator.validate(LoginSchema, invalidLogin);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("password");
      expect(result.errors![0].message).toBe("Mật khẩu không được để trống");
    });
  });

  describe("Data sanitization", () => {
    it("should sanitize string data", () => {
      const data = {
        name: "  John Doe  ",
        email: "  test@example.com  ",
      };

      const sanitized = validator.sanitize(data);

      expect(sanitized).toEqual({
        name: "John Doe",
        email: "test@example.com",
      });
    });

    it("should sanitize nested objects", () => {
      const data = {
        user: {
          name: "  John Doe  ",
          profile: {
            bio: "  Software Developer  ",
          },
        },
      };

      const sanitized = validator.sanitize(data);

      expect(sanitized).toEqual({
        user: {
          name: "John Doe",
          profile: {
            bio: "Software Developer",
          },
        },
      });
    });
  });

  describe("File validation", () => {
    it("should validate valid file", () => {
      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      const result = validator.validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["application/pdf"],
        allowedExtensions: ["pdf"],
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(file);
    });

    it("should reject file that is too large", () => {
      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      const result = validator.validateFile(file, {
        maxSize: 1024, // 1KB
        allowedTypes: ["application/pdf"],
        allowedExtensions: ["pdf"],
      });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("file");
      expect(result.errors![0].message).toContain("File quá lớn");
    });

    it("should reject file with invalid type", () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      const result = validator.validateFile(file, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ["application/pdf"],
        allowedExtensions: ["pdf"],
      });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("file");
      expect(result.errors![0].message).toContain(
        "Loại file không được hỗ trợ"
      );
    });
  });

  describe("Password strength validation", () => {
    it("should validate strong password", () => {
      const strongPassword = "Password123!";

      const result = validator.validatePasswordStrength(strongPassword);

      expect(result.success).toBe(true);
      expect(result.data).toBe(strongPassword);
    });

    it("should reject weak password", () => {
      const weakPassword = "123";

      const result = validator.validatePasswordStrength(weakPassword);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject password without uppercase", () => {
      const password = "password123!";

      const result = validator.validatePasswordStrength(password);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("password");
      expect(result.errors![0].message).toBe(
        "Mật khẩu phải chứa ít nhất 1 chữ hoa"
      );
    });
  });

  describe("Vietnamese phone validation", () => {
    it("should validate valid Vietnamese phone numbers", () => {
      const validPhones = [
        "0123456789",
        "0987654321",
        "+84123456789",
        "84123456789",
      ];

      validPhones.forEach((phone) => {
        const result = validator.validateVietnamesePhone(phone);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid phone numbers", () => {
      const invalidPhones = [
        "123456789",
        "01234567890",
        "012345678",
        "invalid",
      ];

      invalidPhones.forEach((phone) => {
        const result = validator.validateVietnamesePhone(phone);
        expect(result.success).toBe(false);
      });
    });
  });
});
