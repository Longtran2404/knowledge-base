import { z } from "zod";

/**
 * Comprehensive validation schemas using Zod
 * Provides type-safe validation for all data models
 */

// Common validation patterns
const emailSchema = z.string().email("Email không hợp lệ");
const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
  );
const phoneSchema = z
  .string()
  .regex(/^(\+84|84|0)[1-9][0-9]{8}$/, "Số điện thoại không hợp lệ");
const vietnameseNameSchema = z
  .string()
  .min(2, "Tên phải có ít nhất 2 ký tự")
  .max(50, "Tên không được quá 50 ký tự")
  .regex(
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ\s]+$/,
    "Tên chỉ được chứa chữ cái và khoảng trắng"
  );

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid("ID không hợp lệ"),
  email: emailSchema,
  fullName: vietnameseNameSchema,
  role: z.enum(["sinh_vien", "giang_vien", "admin", "manager"], {
    errorMap: () => ({ message: "Vai trò không hợp lệ" }),
  }),
  plan: z.enum(["free", "premium", "partner"], {
    errorMap: () => ({ message: "Gói dịch vụ không hợp lệ" }),
  }),
  status: z.enum(["active", "inactive", "suspended"], {
    errorMap: () => ({ message: "Trạng thái không hợp lệ" }),
  }),
  phone: phoneSchema.optional(),
  avatar: z.string().url("URL avatar không hợp lệ").optional(),
  createdAt: z.string().datetime("Ngày tạo không hợp lệ"),
  updatedAt: z.string().datetime("Ngày cập nhật không hợp lệ"),
  lastLoginAt: z
    .string()
    .datetime("Ngày đăng nhập cuối không hợp lệ")
    .optional(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const UpdateUserSchema = CreateUserSchema.partial();

export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export const RegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: vietnameseNameSchema,
  role: z.enum(["sinh_vien", "giang_vien"]).default("sinh_vien"),
  plan: z.enum(["free", "premium", "partner"]).default("free"),
  phone: phoneSchema.optional(),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu không được để trống"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });

// Course schemas
export const CourseSchema = z.object({
  id: z.string().uuid("ID khóa học không hợp lệ"),
  slug: z.string().min(1, "Slug không được để trống"),
  title: z
    .string()
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(200, "Tiêu đề không được quá 200 ký tự"),
  description: z
    .string()
    .min(10, "Mô tả phải có ít nhất 10 ký tự")
    .max(2000, "Mô tả không được quá 2000 ký tự"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"], {
    errorMap: () => ({ message: "Cấp độ không hợp lệ" }),
  }),
  domain: z.string().min(1, "Lĩnh vực không được để trống"),
  year: z
    .number()
    .int()
    .min(2020, "Năm không hợp lệ")
    .max(new Date().getFullYear() + 1),
  tags: z
    .array(z.string().min(1, "Tag không được để trống"))
    .min(1, "Phải có ít nhất 1 tag"),
  ratingAvg: z.number().min(0).max(5).optional(),
  ratingCount: z.number().int().min(0).optional(),
  thumbnail: z.string().url("URL hình ảnh không hợp lệ").optional(),
  price: z.number().int().min(0, "Giá không được âm").optional(),
  isHot: z.boolean().optional(),
  isPublished: z.boolean().default(false),
  instructorId: z.string().uuid("ID giảng viên không hợp lệ"),
  duration: z.number().int().min(1, "Thời lượng phải lớn hơn 0").optional(), // in minutes
  lessons: z.number().int().min(0, "Số bài học không được âm").optional(),
  createdAt: z.string().datetime("Ngày tạo không hợp lệ"),
  updatedAt: z.string().datetime("Ngày cập nhật không hợp lệ"),
});

export const CreateCourseSchema = CourseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCourseSchema = CreateCourseSchema.partial();

// Product schemas
export const ProductSchema = z.object({
  id: z.string().uuid("ID sản phẩm không hợp lệ"),
  name: z
    .string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(200, "Tên sản phẩm không được quá 200 ký tự"),
  description: z
    .string()
    .min(10, "Mô tả phải có ít nhất 10 ký tự")
    .max(2000, "Mô tả không được quá 2000 ký tự"),
  price: z.number().int().min(0, "Giá không được âm"),
  category: z.string().min(1, "Danh mục không được để trống"),
  tags: z.array(z.string().min(1, "Tag không được để trống")).optional(),
  images: z
    .array(z.string().url("URL hình ảnh không hợp lệ"))
    .min(1, "Phải có ít nhất 1 hình ảnh"),
  stock: z.number().int().min(0, "Số lượng tồn kho không được âm").default(0),
  isActive: z.boolean().default(true),
  sellerId: z.string().uuid("ID người bán không hợp lệ"),
  createdAt: z.string().datetime("Ngày tạo không hợp lệ"),
  updatedAt: z.string().datetime("Ngày cập nhật không hợp lệ"),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProductSchema = CreateProductSchema.partial();

// Resource schemas
export const ResourceSchema = z.object({
  id: z.string().uuid("ID tài nguyên không hợp lệ"),
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(200, "Tiêu đề không được quá 200 ký tự"),
  description: z
    .string()
    .min(10, "Mô tả phải có ít nhất 10 ký tự")
    .max(2000, "Mô tả không được quá 2000 ký tự"),
  type: z.enum(["document", "video", "audio", "image", "other"], {
    errorMap: () => ({ message: "Loại tài nguyên không hợp lệ" }),
  }),
  category: z.string().min(1, "Danh mục không được để trống"),
  tags: z.array(z.string().min(1, "Tag không được để trống")).optional(),
  fileUrl: z.string().url("URL file không hợp lệ"),
  fileSize: z.number().int().min(0, "Kích thước file không được âm"),
  mimeType: z.string().min(1, "MIME type không được để trống"),
  isPublic: z.boolean().default(false),
  downloadCount: z.number().int().min(0).default(0),
  uploaderId: z.string().uuid("ID người upload không hợp lệ"),
  createdAt: z.string().datetime("Ngày tạo không hợp lệ"),
  updatedAt: z.string().datetime("Ngày cập nhật không hợp lệ"),
});

export const CreateResourceSchema = ResourceSchema.omit({
  id: true,
  downloadCount: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateResourceSchema = CreateResourceSchema.partial();

// Post/Blog schemas
export const PostSchema = z.object({
  id: z.string().uuid("ID bài viết không hợp lệ"),
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(200, "Tiêu đề không được quá 200 ký tự"),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
  excerpt: z.string().max(500, "Tóm tắt không được quá 500 ký tự").optional(),
  slug: z.string().min(1, "Slug không được để trống"),
  tags: z.array(z.string().min(1, "Tag không được để trống")).optional(),
  category: z.string().min(1, "Danh mục không được để trống"),
  featuredImage: z.string().url("URL hình ảnh không hợp lệ").optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime("Ngày xuất bản không hợp lệ").optional(),
  authorId: z.string().uuid("ID tác giả không hợp lệ"),
  viewCount: z.number().int().min(0).default(0),
  likeCount: z.number().int().min(0).default(0),
  createdAt: z.string().datetime("Ngày tạo không hợp lệ"),
  updatedAt: z.string().datetime("Ngày cập nhật không hợp lệ"),
});

export const CreatePostSchema = PostSchema.omit({
  id: true,
  viewCount: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePostSchema = CreatePostSchema.partial();

// Subscription schemas
export const SubscriptionSchema = z.object({
  id: z.string().uuid("ID đăng ký không hợp lệ"),
  userId: z.string().uuid("ID người dùng không hợp lệ"),
  plan: z.enum(["free", "premium", "partner"], {
    errorMap: () => ({ message: "Gói đăng ký không hợp lệ" }),
  }),
  status: z.enum(["active", "past_due", "canceled", "unpaid"], {
    errorMap: () => ({ message: "Trạng thái đăng ký không hợp lệ" }),
  }),
  currentPeriodStart: z.string().datetime("Ngày bắt đầu chu kỳ không hợp lệ"),
  currentPeriodEnd: z.string().datetime("Ngày kết thúc chu kỳ không hợp lệ"),
  gracePeriodDays: z.number().int().min(0).default(7),
  autoDowngrade: z.boolean().default(true),
  createdAt: z.string().datetime("Ngày tạo không hợp lệ"),
  updatedAt: z.string().datetime("Ngày cập nhật không hợp lệ"),
});

export const CreateSubscriptionSchema = SubscriptionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Payment schemas
export const PaymentSchema = z.object({
  id: z.string().uuid("ID thanh toán không hợp lệ"),
  userId: z.string().uuid("ID người dùng không hợp lệ"),
  amount: z.number().int().min(0, "Số tiền không được âm"),
  currency: z.string().length(3, "Mã tiền tệ phải có 3 ký tự").default("VND"),
  status: z.enum(["pending", "completed", "failed", "refunded"], {
    errorMap: () => ({ message: "Trạng thái thanh toán không hợp lệ" }),
  }),
  paymentMethod: z
    .string()
    .min(1, "Phương thức thanh toán không được để trống"),
  transactionId: z.string().min(1, "ID giao dịch không được để trống"),
  description: z.string().max(500, "Mô tả không được quá 500 ký tự").optional(),
  createdAt: z.string().datetime("Ngày tạo không hợp lệ"),
  updatedAt: z.string().datetime("Ngày cập nhật không hợp lệ"),
});

export const CreatePaymentSchema = PaymentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Search and filter schemas
export const SearchQuerySchema = z.object({
  q: z
    .string()
    .min(1, "Từ khóa tìm kiếm không được để trống")
    .max(100, "Từ khóa tìm kiếm không được quá 100 ký tự"),
  type: z
    .enum(["all", "courses", "products", "resources", "posts"])
    .default("all"),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  sortBy: z
    .enum(["relevance", "price", "rating", "date", "popularity"])
    .default("relevance"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// File upload schemas
export const FileUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file instanceof File, {
    message: "Phải là file",
  }),
  category: z.string().min(1, "Danh mục không được để trống"),
  description: z.string().max(500, "Mô tả không được quá 500 ký tự").optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

// Contact form schemas
export const ContactFormSchema = z.object({
  name: vietnameseNameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z
    .string()
    .min(1, "Chủ đề không được để trống")
    .max(200, "Chủ đề không được quá 200 ký tự"),
  message: z
    .string()
    .min(10, "Tin nhắn phải có ít nhất 10 ký tự")
    .max(2000, "Tin nhắn không được quá 2000 ký tự"),
  type: z
    .enum(["general", "support", "partnership", "feedback"])
    .default("general"),
});

// Export type inference helpers
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;

export type Course = z.infer<typeof CourseSchema>;
export type CreateCourse = z.infer<typeof CreateCourseSchema>;
export type UpdateCourse = z.infer<typeof UpdateCourseSchema>;

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;

export type Resource = z.infer<typeof ResourceSchema>;
export type CreateResource = z.infer<typeof CreateResourceSchema>;
export type UpdateResource = z.infer<typeof UpdateResourceSchema>;

export type Post = z.infer<typeof PostSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type CreateSubscription = z.infer<typeof CreateSubscriptionSchema>;

export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePayment = z.infer<typeof CreatePaymentSchema>;

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type ContactForm = z.infer<typeof ContactFormSchema>;
