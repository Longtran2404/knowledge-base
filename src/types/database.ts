export interface NLCAccount {
  id: string;
  email: string;
  user_id: string;
  full_name: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  account_role: "sinh_vien" | "giang_vien" | "quan_ly" | "admin";
  membership_plan: "free" | "basic" | "premium" | "vip";
  account_status: "active" | "inactive" | "suspended" | "pending_approval";
  is_paid: boolean;
  is_verified: boolean;
  auth_provider: "email" | "google" | "facebook";
  last_login_at?: string;
  login_count: number;
  password_changed_at?: string;
  membership_expires_at?: string;
  membership_type?: "free" | "basic" | "premium" | "vip";
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface NLCCourse {
  id: string;
  course_slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  detailed_content?: string;
  instructor_id: string;
  instructor_name: string;
  course_category: string;
  course_level: string;
  course_language: string;
  duration_hours: number;
  lesson_count: number;
  requirements: string[];
  learning_outcomes: string[];
  target_audience: string[];
  course_price: number;
  original_price?: number;
  discount_percent: number;
  thumbnail_url?: string;
  video_preview_url?: string;
  course_image_url?: string;
  is_published: boolean;
  is_featured: boolean;
  enrollment_count: number;
  avg_rating: number;
  review_count: number;
  seo_title?: string;
  seo_description?: string;
  course_tags: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NLCEnrollment {
  id: string;
  student_user_id: string;
  enrolled_course_id: string;
  progress_percent: number;
  is_completed: boolean;
  current_lesson: number;
  total_time_spent: number;
  enrollment_type: "free" | "paid";
  paid_amount: number;
  payment_reference?: string;
  started_at?: string;
  last_accessed_at?: string;
  completed_at?: string;
  certificate_issued_at?: string;
  student_rating?: number;
  student_review?: string;
  review_helpful_count: number;
  enrolled_at: string;
  created_at: string;
  updated_at: string;
}

export interface NLCActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  activity_type: string;
  activity_description: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface NLCNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  notification_priority?: "low" | "medium" | "high" | "urgent";
  metadata?: any;
  created_at: string;
  read_at?: string;
}

export interface NLCUserApproval {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  approval_type:
    | "account_activation"
    | "role_change"
    | "course_access"
    | "admin_access";
  status: "pending" | "approved" | "rejected";
  requested_by: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}
