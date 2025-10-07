/**
 * Nam Long Center Real-time Synchronization
 * Setup real-time subscriptions for live data updates
 */

import { supabase } from "../supabase-config";
import type {
  NLCNotification,
  NLCEnrollment,
  NLCUserApproval,
  NLCActivityLog,
} from "../../types/database";

// Real-time event types
export interface RealtimeEvent<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: T;
  old?: T;
  table: string;
  timestamp: string;
}

// Notification event handler
export type NotificationHandler = (event: RealtimeEvent<NLCNotification>) => void;
export type EnrollmentHandler = (event: RealtimeEvent<NLCEnrollment>) => void;
export type ApprovalHandler = (event: RealtimeEvent<NLCUserApproval>) => void;
export type ActivityHandler = (event: RealtimeEvent<NLCActivityLog>) => void;

class NLCRealtimeManager {
  private subscriptions: Map<string, any> = new Map();
  private isConnected: boolean = false;

  // Connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Subscribe to notifications for a specific user
  subscribeToUserNotifications(
    userId: string,
    onNotification: NotificationHandler
  ): () => void {
    const subscriptionKey = `notifications_${userId}`;

    if (this.subscriptions.has(subscriptionKey)) {
      console.warn(`Already subscribed to notifications for user ${userId}`);
      return this.subscriptions.get(subscriptionKey).unsubscribe;
    }

    console.log(`🔔 Subscribing to notifications for user: ${userId}`);

    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nlc_notifications',
          filter: `recipient_user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('📨 Notification event received:', payload);

          const event: RealtimeEvent<NLCNotification> = {
            eventType: payload.eventType as any,
            new: payload.new as NLCNotification,
            old: payload.old as NLCNotification,
            table: 'nlc_notifications',
            timestamp: new Date().toISOString(),
          };

          onNotification(event);
        }
      )
      .subscribe((status) => {
        console.log(`Notification subscription status: ${status}`);
        this.isConnected = status === 'SUBSCRIBED';
      });

    this.subscriptions.set(subscriptionKey, subscription);

    // Return unsubscribe function
    return () => {
      console.log(`🔕 Unsubscribing from notifications for user: ${userId}`);
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };
  }

  // Subscribe to enrollment updates for a user
  subscribeToUserEnrollments(
    userId: string,
    onEnrollment: EnrollmentHandler
  ): () => void {
    const subscriptionKey = `enrollments_${userId}`;

    if (this.subscriptions.has(subscriptionKey)) {
      console.warn(`Already subscribed to enrollments for user ${userId}`);
      return this.subscriptions.get(subscriptionKey).unsubscribe;
    }

    console.log(`📚 Subscribing to enrollments for user: ${userId}`);

    const subscription = supabase
      .channel(`enrollments:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nlc_enrollments',
          filter: `student_user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('📖 Enrollment event received:', payload);

          const event: RealtimeEvent<NLCEnrollment> = {
            eventType: payload.eventType as any,
            new: payload.new as NLCEnrollment,
            old: payload.old as NLCEnrollment,
            table: 'nlc_enrollments',
            timestamp: new Date().toISOString(),
          };

          onEnrollment(event);
        }
      )
      .subscribe((status) => {
        console.log(`Enrollment subscription status: ${status}`);
        this.isConnected = status === 'SUBSCRIBED';
      });

    this.subscriptions.set(subscriptionKey, subscription);

    return () => {
      console.log(`📚❌ Unsubscribing from enrollments for user: ${userId}`);
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };
  }

  // Subscribe to approval updates (for admins)
  subscribeToApprovals(onApproval: ApprovalHandler): () => void {
    const subscriptionKey = 'approvals_admin';

    if (this.subscriptions.has(subscriptionKey)) {
      console.warn('Already subscribed to approvals');
      return this.subscriptions.get(subscriptionKey).unsubscribe;
    }

    console.log('👥 Subscribing to user approvals');

    const subscription = supabase
      .channel('approvals:admin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nlc_user_approvals',
        },
        (payload) => {
          console.log('👤 Approval event received:', payload);

          const event: RealtimeEvent<NLCUserApproval> = {
            eventType: payload.eventType as any,
            new: payload.new as NLCUserApproval,
            old: payload.old as NLCUserApproval,
            table: 'nlc_user_approvals',
            timestamp: new Date().toISOString(),
          };

          onApproval(event);
        }
      )
      .subscribe((status) => {
        console.log(`Approval subscription status: ${status}`);
        this.isConnected = status === 'SUBSCRIBED';
      });

    this.subscriptions.set(subscriptionKey, subscription);

    return () => {
      console.log('👥❌ Unsubscribing from approvals');
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };
  }

  // Subscribe to activity logs (for admins)
  subscribeToActivityLogs(onActivity: ActivityHandler): () => void {
    const subscriptionKey = 'activity_admin';

    if (this.subscriptions.has(subscriptionKey)) {
      console.warn('Already subscribed to activity logs');
      return this.subscriptions.get(subscriptionKey).unsubscribe;
    }

    console.log('📊 Subscribing to activity logs');

    const subscription = supabase
      .channel('activity:admin')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only new activities
          schema: 'public',
          table: 'nlc_activity_log',
        },
        (payload) => {
          console.log('📈 Activity event received:', payload);

          const event: RealtimeEvent<NLCActivityLog> = {
            eventType: 'INSERT',
            new: payload.new as NLCActivityLog,
            table: 'nlc_activity_log',
            timestamp: new Date().toISOString(),
          };

          onActivity(event);
        }
      )
      .subscribe((status) => {
        console.log(`Activity subscription status: ${status}`);
        this.isConnected = status === 'SUBSCRIBED';
      });

    this.subscriptions.set(subscriptionKey, subscription);

    return () => {
      console.log('📊❌ Unsubscribing from activity logs');
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };
  }

  // Subscribe to course updates (for course management)
  subscribeToCourseUpdates(onCourseUpdate: (event: RealtimeEvent) => void): () => void {
    const subscriptionKey = 'courses_updates';

    if (this.subscriptions.has(subscriptionKey)) {
      console.warn('Already subscribed to course updates');
      return this.subscriptions.get(subscriptionKey).unsubscribe;
    }

    console.log('📚 Subscribing to course updates');

    const subscription = supabase
      .channel('courses:updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nlc_courses',
        },
        (payload) => {
          console.log('📚 Course event received:', payload);

          const event: RealtimeEvent = {
            eventType: payload.eventType as any,
            new: payload.new,
            old: payload.old,
            table: 'nlc_courses',
            timestamp: new Date().toISOString(),
          };

          onCourseUpdate(event);
        }
      )
      .subscribe((status) => {
        console.log(`Course subscription status: ${status}`);
        this.isConnected = status === 'SUBSCRIBED';
      });

    this.subscriptions.set(subscriptionKey, subscription);

    return () => {
      console.log('📚❌ Unsubscribing from course updates');
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };
  }

  // Unsubscribe from all subscriptions
  unsubscribeAll(): void {
    console.log('🔌 Unsubscribing from all real-time subscriptions');

    this.subscriptions.forEach((subscription, key) => {
      console.log(`Unsubscribing from: ${key}`);
      subscription.unsubscribe();
    });

    this.subscriptions.clear();
    this.isConnected = false;
  }

  // Get active subscriptions count
  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  // Get subscription details
  getSubscriptionDetails(): { key: string; status: string }[] {
    const details: { key: string; status: string }[] = [];

    this.subscriptions.forEach((subscription, key) => {
      details.push({
        key,
        status: subscription.state || 'unknown'
      });
    });

    return details;
  }
}

// Create singleton instance
export const nlcRealtime = new NLCRealtimeManager();

// Utility functions for common use cases
export const subscribeToUserData = (
  userId: string,
  handlers: {
    onNotification?: NotificationHandler;
    onEnrollment?: EnrollmentHandler;
  }
) => {
  const unsubscribers: (() => void)[] = [];

  if (handlers.onNotification) {
    unsubscribers.push(
      nlcRealtime.subscribeToUserNotifications(userId, handlers.onNotification)
    );
  }

  if (handlers.onEnrollment) {
    unsubscribers.push(
      nlcRealtime.subscribeToUserEnrollments(userId, handlers.onEnrollment)
    );
  }

  // Return function to unsubscribe from all
  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
};

export const subscribeToAdminData = (handlers: {
  onApproval?: ApprovalHandler;
  onActivity?: ActivityHandler;
  onCourseUpdate?: (event: RealtimeEvent) => void;
}) => {
  const unsubscribers: (() => void)[] = [];

  if (handlers.onApproval) {
    unsubscribers.push(
      nlcRealtime.subscribeToApprovals(handlers.onApproval)
    );
  }

  if (handlers.onActivity) {
    unsubscribers.push(
      nlcRealtime.subscribeToActivityLogs(handlers.onActivity)
    );
  }

  if (handlers.onCourseUpdate) {
    unsubscribers.push(
      nlcRealtime.subscribeToCourseUpdates(handlers.onCourseUpdate)
    );
  }

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
};

// React Hook for real-time subscriptions
export { nlcRealtime as default };