import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  role: z.string(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Course schemas
export const CourseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  field: z.string().min(1),
  level: z.string(),
  duration: z.string().min(1),
  price: z.number().min(0),
  rating: z.number().min(0).max(5),
  studentsCount: z.number().min(0),
  isNew: z.boolean().optional(),
  isHot: z.boolean().optional(),
  instructor: z.string().optional(),
  completionRate: z.number().min(0).max(100).optional(),
  certificate: z.boolean().optional(),
  image: z.string().url().optional(),
});

// Product schemas
export const ProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string(),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  rating: z.number().min(0).max(5),
  reviewsCount: z.number().min(0),
  isNew: z.boolean().optional(),
  isHot: z.boolean().optional(),
  inStock: z.boolean().default(true),
  image: z.string().url().optional(),
});

// Contact form schema
export const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9+\-\s()]+$/).optional(),
  subject: z.string().min(5),
  message: z.string().min(10),
  company: z.string().optional(),
  interestedIn: z.array(z.string()).optional(),
});

// Newsletter schema
export const NewsletterSchema = z.object({
  email: z.string().email(),
  preferences: z.array(z.string()).optional(),
});

// Search schema
export const SearchSchema = z.object({
  query: z.string().min(1),
  type: z.string().default('all'),
  filters: z.object({
    category: z.string().optional(),
    level: z.string().optional(),
    priceRange: z.object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    }).optional(),
    rating: z.number().min(0).max(5).optional(),
  }).optional(),
});

// Review schema
export const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10),
  itemId: z.string().min(1),
  itemType: z.string(),
});

// Cart item schema
export const CartItemSchema = z.object({
  id: z.string().min(1),
  type: z.string(),
  title: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().min(1),
  image: z.string().url().optional(),
});

// API response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const PaginatedResponseSchema = z.object({
  items: z.array(z.any()),
  pagination: z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
    total: z.number().min(0),
    totalPages: z.number().min(0),
  }),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ContactData = z.infer<typeof ContactSchema>;
export type NewsletterData = z.infer<typeof NewsletterSchema>;
export type SearchData = z.infer<typeof SearchSchema>;
export type ReviewData = z.infer<typeof ReviewSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;

// Validation helpers
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

export const getValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
};
