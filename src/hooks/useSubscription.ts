import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/EnhancedAuthContext";
import { SubscriptionMonitor } from "../services/subscription-monitor";

export interface SubscriptionHook {
  subscriptionStatus: any | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  checkSubscription: () => Promise<boolean>;
  getStats: () => Promise<any>;
}

/**
 * Custom hook for managing subscription state and operations
 */
export const useSubscription = (): SubscriptionHook => {
  const { user, subscriptionStatus: authSubscriptionStatus } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    authSubscriptionStatus
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when auth context changes
  useEffect(() => {
    setSubscriptionStatus(authSubscriptionStatus);
  }, [authSubscriptionStatus]);

  /**
   * Refresh subscription status
   */
  const refreshSubscription = useCallback(async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isActive = await SubscriptionMonitor.checkUserSubscription(user.id);
      // The subscription status will be updated by the auth context
    } catch (err: any) {
      setError(err.message || "Failed to refresh subscription");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Check if user has active subscription
   */
  const checkSubscription = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }

    try {
      return await SubscriptionMonitor.checkUserSubscription(user.id);
    } catch (err) {
      console.error("Error checking subscription:", err);
      return false;
    }
  }, [user?.id]);

  /**
   * Get subscription statistics
   */
  const getStats = useCallback(async () => {
    try {
      return await SubscriptionMonitor.getSubscriptionStats();
    } catch (err: any) {
      setError(err.message || "Failed to get subscription stats");
      return null;
    }
  }, []);

  return {
    subscriptionStatus,
    isLoading,
    error,
    refreshSubscription,
    checkSubscription,
    getStats,
  };
};

/**
 * Hook for checking if user has specific plan access
 */
export const usePlanAccess = (requiredPlan?: string) => {
  const { subscriptionStatus } = useSubscription();

  const hasAccess = useCallback(() => {
    if (!subscriptionStatus) return false;
    if (!requiredPlan) return true;

    const userPlan = subscriptionStatus.plan;

    // Define plan hierarchy
    const planHierarchy = {
      free: 0,
      student_299: 1,
      business: 2,
    };

    const userPlanLevel =
      planHierarchy[userPlan as keyof typeof planHierarchy] || 0;
    const requiredPlanLevel =
      planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0;

    return userPlanLevel >= requiredPlanLevel && subscriptionStatus.isActive;
  }, [subscriptionStatus, requiredPlan]);

  return {
    hasAccess: hasAccess(),
    canAccess: hasAccess,
    plan: subscriptionStatus?.plan || "free",
    isActive: subscriptionStatus?.isActive || false,
  };
};

/**
 * Hook for payment monitoring
 */
export const usePaymentMonitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    // Start monitoring when hook is used
    setIsMonitoring(true);
    setLastCheck(new Date());

    // You can add additional monitoring logic here
    const interval = setInterval(() => {
      setLastCheck(new Date());
    }, 60000); // Update every minute

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, []);

  return {
    isMonitoring,
    lastCheck,
  };
};
