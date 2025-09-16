/**
 * Shared constants and configuration
 */

// Badge colors for different levels
export const LEVEL_BADGE_COLORS = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800"
} as const;

// Badge colors for access levels
export const ACCESS_BADGE_COLORS = {
  free: "bg-green-100 text-green-800",
  premium: "bg-blue-100 text-blue-800",
  pro: "bg-purple-100 text-purple-800",
  default: "bg-gray-100 text-gray-800"
} as const;

// Category colors for blog posts
export const CATEGORY_COLORS = {
  "Công nghệ": "bg-blue-100 text-blue-800",
  "BIM": "bg-purple-100 text-purple-800",
  "Nghề nghiệp": "bg-green-100 text-green-800",
  "Tin tức": "bg-orange-100 text-orange-800",
  "Hướng dẫn": "bg-indigo-100 text-indigo-800",
  "Xu hướng": "bg-pink-100 text-pink-800",
  default: "bg-gray-100 text-gray-800"
} as const;

// Status colors
export const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  approved: "bg-green-100 text-green-800"
} as const;

// User roles
export const USER_ROLES = {
  student: "Sinh viên",
  instructor: "Giảng viên",
  admin: "Quản trị viên",
  manager: "Quản lý"
} as const;

// File type configurations
export const ALLOWED_FILE_TYPES = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  document: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"],
  archive: [".zip", ".rar", ".7z"],
  video: [".mp4", ".avi", ".mov", ".wmv"],
  audio: [".mp3", ".wav", ".m4a"]
} as const;

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZES = {
  avatar: 2 * 1024 * 1024, // 2MB
  document: 50 * 1024 * 1024, // 50MB
  video: 500 * 1024 * 1024, // 500MB
  default: 10 * 1024 * 1024 // 10MB
} as const;

// Default pagination
export const PAGINATION = {
  itemsPerPage: 12,
  maxPageButtons: 5
} as const;

// Animation durations (in ms)
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500
} as const;

// Breakpoints (match Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
} as const;