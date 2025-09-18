/**
 * Activity Logging Service
 * Tracks user activities across the application
 */

import { supabase } from "./supabase-config";
import type { UserActivityInsert } from "./supabase-config";

export class ActivityService {
  private static instance: ActivityService;

  static getInstance(): ActivityService {
    if (!ActivityService.instance) {
      ActivityService.instance = new ActivityService();
    }
    return ActivityService.instance;
  }

  private getClientInfo() {
    return {
      ip_address: null, // Will be set by server
      user_agent: navigator.userAgent || null,
    };
  }

  async logActivity(
    activity: Omit<
      UserActivityInsert,
      "created_at" | "ip_address" | "user_agent"
    >
  ) {
    try {
      const clientInfo = this.getClientInfo();

      const { error } = await supabase.from("user_activities").insert({
        ...activity,
        ...clientInfo,
        created_at: new Date().toISOString(),
      } as any);

      if (error) {
        console.error("Failed to log activity:", error);
      }
    } catch (error) {
      console.error("Activity logging error:", error);
    }
  }

  async logLogin(userId: string, metadata?: any) {
    await this.logActivity({
      user_id: userId,
      action_type: "login",
      description: "User logged in",
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  }

  async logLogout(userId: string, metadata?: any) {
    await this.logActivity({
      user_id: userId,
      action_type: "logout",
      description: "User logged out",
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  }

  async logRegister(userId: string, email: string, metadata?: any) {
    await this.logActivity({
      user_id: userId,
      action_type: "register",
      description: `New user registered: ${email}`,
      metadata: {
        email,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  }

  async logCoursePurchase(
    userId: string,
    courseId: string,
    courseName: string,
    amount: number
  ) {
    await this.logActivity({
      user_id: userId,
      action_type: "course_purchase",
      description: `Purchased course: ${courseName}`,
      resource_type: "course",
      resource_id: courseId,
      metadata: {
        course_name: courseName,
        amount,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logCourseStart(userId: string, courseId: string, courseName: string) {
    await this.logActivity({
      user_id: userId,
      action_type: "course_start",
      description: `Started course: ${courseName}`,
      resource_type: "course",
      resource_id: courseId,
      metadata: {
        course_name: courseName,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logCourseComplete(
    userId: string,
    courseId: string,
    courseName: string
  ) {
    await this.logActivity({
      user_id: userId,
      action_type: "course_complete",
      description: `Completed course: ${courseName}`,
      resource_type: "course",
      resource_id: courseId,
      metadata: {
        course_name: courseName,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logFileUpload(
    userId: string,
    fileId: string,
    fileName: string,
    fileSize: number
  ) {
    await this.logActivity({
      user_id: userId,
      action_type: "file_upload",
      description: `Uploaded file: ${fileName}`,
      resource_type: "file",
      resource_id: fileId,
      metadata: {
        file_name: fileName,
        file_size: fileSize,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logFileDownload(userId: string, fileId: string, fileName: string) {
    await this.logActivity({
      user_id: userId,
      action_type: "file_download",
      description: `Downloaded file: ${fileName}`,
      resource_type: "file",
      resource_id: fileId,
      metadata: {
        file_name: fileName,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logProfileUpdate(userId: string, updatedFields: string[]) {
    await this.logActivity({
      user_id: userId,
      action_type: "profile_update",
      description: `Updated profile fields: ${updatedFields.join(", ")}`,
      resource_type: "user",
      resource_id: userId,
      metadata: {
        updated_fields: updatedFields,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logPasswordChange(userId: string) {
    await this.logActivity({
      user_id: userId,
      action_type: "password_change",
      description: "Password changed",
      resource_type: "user",
      resource_id: userId,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logPayment(
    userId: string,
    paymentId: string,
    amount: number,
    method: string
  ) {
    await this.logActivity({
      user_id: userId,
      action_type: "payment",
      description: `Payment processed: ${amount} VND via ${method}`,
      resource_type: "payment",
      resource_id: paymentId,
      metadata: {
        amount,
        method,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logCustomActivity(
    userId: string,
    description: string,
    metadata?: any,
    resourceType?: string,
    resourceId?: string
  ) {
    await this.logActivity({
      user_id: userId,
      action_type: "other",
      description,
      resource_type: resourceType as any,
      resource_id: resourceId,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  }

  // Get user activities
  async getUserActivities(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      actionType?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    try {
      let query = supabase
        .from("user_activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (options?.actionType) {
        query = query.eq("action_type", options.actionType);
      }

      if (options?.startDate) {
        query = query.gte("created_at", options.startDate);
      }

      if (options?.endDate) {
        query = query.lte("created_at", options.endDate);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Failed to fetch user activities:", error);
      return [];
    }
  }

  // Get activity statistics
  async getActivityStats(userId: string, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("user_activities")
        .select("action_type, created_at")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString());

      if (error) {
        throw error;
      }

      // Process stats
      const stats = {
        total: data?.length || 0,
        byType: {} as Record<string, number>,
        byDay: {} as Record<string, number>,
      };

      data?.forEach((activity) => {
        // Count by type
        const type = (activity as any).action_type;
        stats.byType[type] = (stats.byType[type] || 0) + 1;

        // Count by day
        const day = (activity as any).created_at.split("T")[0];
        stats.byDay[day] = (stats.byDay[day] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("Failed to fetch activity stats:", error);
      return {
        total: 0,
        byType: {},
        byDay: {},
      };
    }
  }
}

// Export singleton instance
export const activityService = ActivityService.getInstance();
