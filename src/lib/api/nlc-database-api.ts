import { supabase } from "../supabase-config";

// Type helper for NLC tables - bypass TypeScript checking until types are generated
const nlc = (supabase as any);

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
  account_status: "active" | "inactive" | "suspended" | "pending_approval";
  email_verified?: boolean;
  company?: string;
  job_title?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  id_card?: string;
  city?: string;
  ward?: string;
  subscription_plan?: string;
  subscription_expires_at?: string;
  subscription_status?: string;
  created_at: string;
  updated_at: string;
  membership_plan?: "free" | "basic" | "premium" | "vip" | "business";
  is_paid?: boolean;
  is_verified?: boolean;
  auth_provider?: "email" | "google" | "facebook";
  last_login_at?: string;
  login_count?: number;
  password_changed_at?: string;
  membership_expires_at?: string;
  membership_type?: "free" | "basic" | "premium" | "vip";
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
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
  metadata?: any;
  created_at: string;
  read_at?: string;
}

export const nlcApi = {
  accounts: {
    async getAccount(userId: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_accounts")
          .select("*")
          .eq("user_id", userId)
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async getAccountByEmail(email: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_accounts")
          .select("*")
          .eq("email", email)
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async createAccount(accountData: Partial<NLCAccount>) {
      try {
        const { data, error } = await nlc
          .from('nlc_accounts')
          .insert([accountData])
          .select()
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async updateAccount(userId: string, updates: Partial<NLCAccount>) {
      try {
        const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
        if ('membership_plan' in payload && payload.membership_plan !== undefined) {
          payload.subscription_plan = payload.membership_plan;
          delete payload.membership_plan;
        }
        if ('membership_expires_at' in payload && payload.membership_expires_at !== undefined) {
          payload.subscription_expires_at = payload.membership_expires_at;
          delete payload.membership_expires_at;
        }
        const { data, error } = await nlc
          .from('nlc_accounts')
          .update(payload)
          .eq('user_id', userId)
          .select()
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async updateLoginInfo(userId: string) {
      try {
        // First get current login count
        const { data: account } = await nlc
          .from('nlc_accounts')
          .select('login_count')
          .eq('user_id', userId)
          .single();

        const currentLoginCount = account?.login_count ?? 0;

        const { error } = await nlc
          .from('nlc_accounts')
          .update({
            last_login_at: new Date().toISOString(),
            login_count: currentLoginCount + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        return { success: !error, error };
      } catch (error) {
        return { success: false, error };
      }
    },
  },

  courses: {
    async getCourses() {
      try {
        const { data, error } = await nlc
          .from("nlc_courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async getCourse(courseId: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_courses")
          .select("*")
          .eq("id", courseId)
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async getFeaturedCourses() {
      try {
        const { data, error } = await nlc
          .from("nlc_courses")
          .select("*")
          .eq("is_published", true)
          .eq("is_featured", true)
          .order("created_at", { ascending: false });

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async getCourseBySlug(slug: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_courses")
          .select("*")
          .eq("course_slug", slug)
          .eq("is_published", true)
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },
  },

  enrollments: {
    async getEnrollments(userId: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_enrollments")
          .select("*, nlc_courses(*)")
          .eq("student_user_id", userId)
          .order("enrolled_at", { ascending: false });

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async enrollInCourse(
      userId: string,
      courseId: string,
      enrollmentType: "free" | "paid" = "free"
    ) {
      try {
        const { data, error } = await nlc
          .from('nlc_enrollments')
          .insert([{
            student_user_id: userId,
            enrolled_course_id: courseId,
            enrollment_type: enrollmentType,
            progress_percent: 0,
            is_completed: false,
            current_lesson: 0,
            total_time_spent: 0,
            paid_amount: 0,
            review_helpful_count: 0,
            started_at: new Date().toISOString(),
            enrolled_at: new Date().toISOString()
          }])
          .select()
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async isEnrolled(userId: string, courseId: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_enrollments")
          .select("*")
          .eq("student_user_id", userId)
          .eq("enrolled_course_id", courseId)
          .single();

        return { success: !error, data: !!data, error };
      } catch (error) {
        return { success: false, data: false, error };
      }
    },

    async getEnrollment(userId: string, courseId: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_enrollments")
          .select("*, nlc_courses(*)")
          .eq("student_user_id", userId)
          .eq("enrolled_course_id", courseId)
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async getUserEnrollments(userId: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_enrollments")
          .select("*, nlc_courses(*)")
          .eq("student_user_id", userId)
          .order("enrolled_at", { ascending: false });

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async updateProgress(
      userId: string,
      courseId: string,
      progress: number,
      currentLesson?: number,
      timeSpent?: number
    ) {
      try {
        const updateData: any = {
          progress_percent: progress,
          is_completed: progress >= 100,
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (currentLesson !== undefined) {
          updateData.current_lesson = currentLesson;
        }
        if (timeSpent !== undefined) {
          updateData.total_time_spent = timeSpent;
        }
        if (progress >= 100 && !updateData.completed_at) {
          updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await nlc
          .from('nlc_enrollments')
          .update(updateData)
          .eq('student_user_id', userId)
          .eq('enrolled_course_id', courseId)
          .select()
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },
  },

  activityLog: {
    async logActivity(
      userId: string,
      userEmail: string,
      userRole: string,
      activityType: string,
      description: string,
      options: {
        resourceType?: string;
        resourceId?: string;
        oldValues?: any;
        newValues?: any;
        metadata?: any;
      } = {}
    ) {
      try {
        const { data, error } = await nlc
          .from('nlc_activity_log')
          .insert([{
            user_id: userId,
            user_email: userEmail,
            user_role: userRole,
            activity_type: activityType,
            activity_description: description,
            resource_type: options.resourceType,
            resource_id: options.resourceId,
            old_values: options.oldValues,
            new_values: options.newValues,
            metadata: options.metadata
          }])
          .select()
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async getActivityLogs(userId: string, limit: number = 50) {
      try {
        const { data, error } = await nlc
          .from('nlc_activity_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },
  },

  managers: {
    async isManager(userId: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_managers")
          .select("*")
          .eq("manager_user_id", userId)
          .eq("is_active", true)
          .single();

        return { success: !error, data: !!data, error };
      } catch (error) {
        return { success: false, data: false, error };
      }
    },

    async getManagerInfo(userId: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_managers")
          .select("*")
          .eq("manager_user_id", userId)
          .single();

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async getAllManagers() {
      try {
        const { data, error } = await nlc
          .from("nlc_managers")
          .select("*")
          .order("created_at", { ascending: false });

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async createManager(
      userId: string,
      email: string,
      fullName: string,
      level: string = "manager"
    ) {
      // TODO: Enable after database setup
      return { success: false, data: null, error: "Database not set up" };
      // try {
      //   const { data, error } = await nlc
      //     .from('nlc_managers')
      //     .insert([{
      //       manager_user_id: userId,
      //       manager_email: email,
      //       manager_full_name: fullName,
      //       manager_level: level,
      //       manager_permissions: {
      //         dashboard: true,
      //         user_management: level === 'admin' || level === 'super_admin',
      //         course_management: level === 'admin' || level === 'super_admin',
      //         system_settings: level === 'super_admin',
      //         financial: level === 'admin' || level === 'super_admin'
      //       },
      //       is_active: true,
      //       can_approve_users: level === 'admin' || level === 'super_admin',
      //       can_manage_courses: level === 'admin' || level === 'super_admin',
      //       can_access_finances: level === 'admin' || level === 'super_admin'
      //     }])
      //     .select()
      //     .single();
      //
      //   return { success: !error, data, error };
      // } catch (error) {
      //   return { success: false, data: null, error };
      // }
    },
  },

  notifications: {
    async getNotifications(userId: string) {
      try {
        const { data, error } = await nlc
          .from("nlc_notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        return { success: !error, data, error };
      } catch (error) {
        return { success: false, data: null, error };
      }
    },

    async markAsRead(notificationId: string) {
      // TODO: Enable after database setup
      return { success: false, error: "Database not set up" };
      // try {
      //   const { error } = await nlc
      //     .from('nlc_notifications')
      //     .update({ is_read: true, read_at: new Date().toISOString() })
      //     .eq('id', notificationId);
      //
      //   return { success: !error, error };
      // } catch (error) {
      //   return { success: false, error };
      // }
    },
  },
};

export default nlcApi;
