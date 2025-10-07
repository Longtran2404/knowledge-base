/**
 * React Hook for Nam Long Center Real-time Features
 * Provides easy-to-use hooks for real-time subscriptions
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../contexts/UnifiedAuthContext";
import {
  nlcRealtime,
  subscribeToUserData,
  subscribeToAdminData,
  type RealtimeEvent,
  type NotificationHandler,
  type EnrollmentHandler,
  type ApprovalHandler,
  type ActivityHandler,
} from "../lib/realtime/nlc-realtime";
import type {
  NLCNotification,
  NLCEnrollment,
  NLCUserApproval,
  NLCActivityLog,
} from "../types/database";

// Hook for user notifications
export function useNotifications() {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<NLCNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleNotification: NotificationHandler = useCallback((event) => {
    console.log("📱 Notification received:", event);

    if (event.eventType === "INSERT" && event.new) {
      // Add new notification
      setNotifications((prev) => [event.new!, ...prev]);

      // Update unread count if not read
      if (!event.new.is_read) {
        setUnreadCount((prev) => prev + 1);
      }

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification(event.new.title, {
          body: event.new.message,
          icon: "/favicon.ico",
          tag: event.new.id,
        });
      }
    } else if (event.eventType === "UPDATE" && event.new && event.old) {
      // Update existing notification
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === event.new!.id ? event.new! : notif))
      );

      // Update unread count if read status changed
      if (event.old.is_read !== event.new.is_read) {
        if (event.new.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else {
          setUnreadCount((prev) => prev + 1);
        }
      }
    }
  }, []);

  // Subscribe to notifications when user is available
  useEffect(() => {
    if (!userProfile?.user_id) return;

    setIsLoading(true);

    // Subscribe to real-time updates
    unsubscribeRef.current = nlcRealtime.subscribeToUserNotifications(
      userProfile.user_id,
      handleNotification
    );

    setIsLoading(false);

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userProfile?.user_id, handleNotification]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    requestNotificationPermission,
  };
}

// Hook for user enrollments
export function useEnrollments() {
  const { userProfile } = useAuth();
  const [enrollments, setEnrollments] = useState<NLCEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleEnrollment: EnrollmentHandler = useCallback((event) => {
    console.log("📚 Enrollment update:", event);

    if (event.eventType === "INSERT" && event.new) {
      setEnrollments((prev) => [event.new!, ...prev]);
    } else if (event.eventType === "UPDATE" && event.new) {
      setEnrollments((prev) =>
        prev.map((enrollment) =>
          enrollment.id === event.new!.id ? event.new! : enrollment
        )
      );
    } else if (event.eventType === "DELETE" && event.old) {
      setEnrollments((prev) =>
        prev.filter((enrollment) => enrollment.id !== event.old!.id)
      );
    }
  }, []);

  useEffect(() => {
    if (!userProfile?.user_id) return;

    setIsLoading(true);

    unsubscribeRef.current = nlcRealtime.subscribeToUserEnrollments(
      userProfile.user_id,
      handleEnrollment
    );

    setIsLoading(false);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userProfile?.user_id, handleEnrollment]);

  return {
    enrollments,
    isLoading,
  };
}

// Hook for admin features
export function useAdminRealtime() {
  const { userProfile } = useAuth();
  const [approvals, setApprovals] = useState<NLCUserApproval[]>([]);
  const [activities, setActivities] = useState<NLCActivityLog[]>([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleApproval: ApprovalHandler = useCallback((event) => {
    console.log("👥 Approval update:", event);

    if (event.eventType === "INSERT" && event.new) {
      setApprovals((prev) => [event.new!, ...prev]);
      if (event.new.status === "pending") {
        setPendingApprovalsCount((prev) => prev + 1);
      }
    } else if (event.eventType === "UPDATE" && event.new && event.old) {
      setApprovals((prev) =>
        prev.map((approval) =>
          approval.id === event.new!.id ? event.new! : approval
        )
      );

      // Update pending count if status changed
      if (event.old.status !== event.new.status) {
        if (event.old.status === "pending") {
          setPendingApprovalsCount((prev) => Math.max(0, prev - 1));
        }
        if (event.new.status === "pending") {
          setPendingApprovalsCount((prev) => prev + 1);
        }
      }
    }
  }, []);

  const handleActivity: ActivityHandler = useCallback((event) => {
    console.log("📊 Activity logged:", event);

    if (event.eventType === "INSERT" && event.new) {
      setActivities((prev) => [event.new!, ...prev.slice(0, 49)]); // Keep last 50
    }
  }, []);

  const handleCourseUpdate = useCallback((event: RealtimeEvent) => {
    console.log("📚 Course updated:", event);
    // Could emit custom events or update local state
  }, []);

  // Subscribe to admin data when user is admin
  useEffect(() => {
    if (!userProfile?.user_id) return;

    // Check if user is admin/manager
    const isAdmin =
      userProfile.account_role === "admin" ||
      userProfile.account_role === "quan_ly";
    if (!isAdmin) return;

    setIsLoading(true);

    unsubscribeRef.current = subscribeToAdminData({
      onApproval: handleApproval,
      onActivity: handleActivity,
      onCourseUpdate: handleCourseUpdate,
    });

    setIsLoading(false);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [
    userProfile?.user_id,
    userProfile?.account_role,
    handleApproval,
    handleActivity,
    handleCourseUpdate,
  ]);

  return {
    approvals,
    activities,
    pendingApprovalsCount,
    isLoading,
  };
}

// Hook for real-time connection status
export function useRealtimeStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptionCount, setSubscriptionCount] = useState(0);

  useEffect(() => {
    const checkStatus = () => {
      setIsConnected(nlcRealtime.getConnectionStatus());
      setSubscriptionCount(nlcRealtime.getActiveSubscriptionsCount());
    };

    // Check status initially
    checkStatus();

    // Check status periodically
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    subscriptionCount,
    details: nlcRealtime.getSubscriptionDetails(),
  };
}

// Hook for comprehensive user real-time data
export function useUserRealtime() {
  const notifications = useNotifications();
  const enrollments = useEnrollments();
  const status = useRealtimeStatus();

  return {
    notifications,
    enrollments,
    status,
  };
}

// Hook for admin dashboard real-time data
export function useAdminDashboard() {
  const adminData = useAdminRealtime();
  const status = useRealtimeStatus();

  return {
    ...adminData,
    status,
  };
}

// Utility hook for manual subscriptions
export function useManualSubscription<T>(
  subscribe: (handler: (event: RealtimeEvent<T>) => void) => () => void,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleEvent = useCallback((event: RealtimeEvent<T>) => {
    if (event.eventType === "INSERT" && event.new) {
      setData((prev) => [event.new!, ...prev]);
    } else if (event.eventType === "UPDATE" && event.new) {
      setData((prev) =>
        prev.map((item) =>
          (item as any).id === (event.new as any)?.id ? event.new! : item
        )
      );
    } else if (event.eventType === "DELETE" && event.old) {
      setData((prev) =>
        prev.filter((item) => (item as any).id !== (event.old as any)?.id)
      );
    }
  }, []);

  useEffect(() => {
    unsubscribeRef.current = subscribe(handleEvent);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [subscribe, handleEvent, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}
