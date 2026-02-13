/**
 * Shared constants and configuration
 */

/** Ảnh thay thế khi ảnh gốc lỗi hoặc không load được */
export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

// Badge colors - dùng semantic tokens đồng bộ theme (primary/success/warning/destructive/muted)
export const LEVEL_BADGE_COLORS = {
  beginner: "bg-success/10 text-success",
  intermediate: "bg-warning/10 text-warning",
  advanced: "bg-destructive/10 text-destructive",
  default: "bg-muted text-muted-foreground"
} as const;

// Badge colors for access levels
export const ACCESS_BADGE_COLORS = {
  free: "bg-success/10 text-success",
  premium: "bg-primary/10 text-primary",
  pro: "bg-violet-100 text-violet-800",
  default: "bg-muted text-muted-foreground"
} as const;

// Category colors for blog posts - đồng bộ với palette (primary, success, warning, accent)
export const CATEGORY_COLORS = {
  "Công nghệ": "bg-primary/10 text-primary",
  "BIM": "bg-violet-100 text-violet-800",
  "Nghề nghiệp": "bg-success/10 text-success",
  "Tin tức": "bg-warning/10 text-warning",
  "Hướng dẫn": "bg-info/10 text-info",
  "Xu hướng": "bg-pink-100 text-pink-800",
  default: "bg-muted text-muted-foreground"
} as const;

// Status colors
export const STATUS_COLORS = {
  active: "bg-success/10 text-success",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  rejected: "bg-destructive/10 text-destructive",
  approved: "bg-success/10 text-success"
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