import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { SubscriptionService, SubscriptionData, PaymentHistoryData, AutoPaymentData } from '../lib/subscription/subscription-service';

export interface SubscriptionHook {
  subscription: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  checkSubscription: () => Promise<boolean>;
  createSubscription: (subscriptionData: Omit<SubscriptionData, 'id' | 'user_id'>) => Promise<boolean>;
  updateSubscription: (updates: Partial<SubscriptionData>) => Promise<boolean>;
  cancelSubscription: (reason?: string) => Promise<boolean>;
}

export interface UsePaymentHistoryReturn {
  paymentHistory: PaymentHistoryData[];
  loading: boolean;
  error: string | null;
  refreshPaymentHistory: () => Promise<void>;
  createPayment: (paymentData: Omit<PaymentHistoryData, 'id' | 'user_id'>) => Promise<boolean>;
  updatePaymentStatus: (paymentId: string, status: PaymentHistoryData['status'], transactionData?: any) => Promise<boolean>;
}

export interface UseAutoPaymentReturn {
  defaultPaymentMethod: AutoPaymentData | null;
  loading: boolean;
  error: string | null;
  refreshPaymentMethod: () => Promise<void>;
  savePaymentMethod: (paymentData: Omit<AutoPaymentData, 'id' | 'user_id'>) => Promise<boolean>;
  removePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
}

/**
 * Custom hook for managing subscription state and operations
 */
export const useSubscription = (): SubscriptionHook => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh subscription status
   */
  const refreshSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: subError } = await SubscriptionService.getUserSubscription(user.id);

      if (subError) {
        setError('Không thể tải thông tin subscription');
        console.error('Subscription fetch error:', subError);
      } else {
        setSubscription(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh subscription");
    } finally {
      setLoading(false);
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
      const { data } = await SubscriptionService.getUserSubscription(user.id);
      return data?.status === 'active' || false;
    } catch (err) {
      console.error("Error checking subscription:", err);
      return false;
    }
  }, [user?.id]);

  /**
   * Create new subscription
   */
  const createSubscription = useCallback(async (subscriptionData: Omit<SubscriptionData, 'id' | 'user_id'>): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      const { data, error: createError } = await SubscriptionService.createSubscription({
        ...subscriptionData,
        user_id: user.id
      });

      if (createError) {
        setError('Không thể tạo subscription');
        console.error('Create subscription error:', createError);
        return false;
      }

      if (data) {
        setSubscription(data);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
      return false;
    }
  }, [user?.id]);

  /**
   * Update subscription
   */
  const updateSubscription = useCallback(async (updates: Partial<SubscriptionData>): Promise<boolean> => {
    if (!subscription?.id) {
      setError('No active subscription');
      return false;
    }

    try {
      setError(null);
      const { data, error: updateError } = await SubscriptionService.updateSubscription(subscription.id, updates);

      if (updateError) {
        setError('Không thể cập nhật subscription');
        console.error('Update subscription error:', updateError);
        return false;
      }

      if (data) {
        setSubscription(data);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
      return false;
    }
  }, [subscription?.id]);

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(async (reason?: string): Promise<boolean> => {
    if (!subscription?.id) {
      setError('No active subscription');
      return false;
    }

    try {
      setError(null);
      const { success, error: cancelError } = await SubscriptionService.cancelSubscription(subscription.id, reason);

      if (!success) {
        setError('Không thể hủy subscription');
        console.error('Cancel subscription error:', cancelError);
        return false;
      }

      // Refresh subscription to get updated status
      await refreshSubscription();
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
      return false;
    }
  }, [subscription?.id, refreshSubscription]);

  // Load subscription when user changes
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return {
    subscription,
    loading,
    error,
    refreshSubscription,
    checkSubscription,
    createSubscription,
    updateSubscription,
    cancelSubscription,
  };
};

/**
 * Hook for checking if user has specific plan access
 */
export const usePlanAccess = (requiredPlan?: string) => {
  const { subscription } = useSubscription();

  const hasAccess = useCallback(() => {
    if (!subscription) return false;
    if (!requiredPlan) return true;

    const userPlan = subscription.plan_type;

    // Define plan hierarchy
    const planHierarchy = {
      free: 0,
      premium: 1,
      partner: 2,
    };

    const userPlanLevel =
      planHierarchy[userPlan as keyof typeof planHierarchy] || 0;
    const requiredPlanLevel =
      planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0;

    return userPlanLevel >= requiredPlanLevel && subscription.status === 'active';
  }, [subscription, requiredPlan]);

  return {
    hasAccess: hasAccess(),
    canAccess: hasAccess,
    plan: subscription?.plan_type || "free",
    isActive: subscription?.status === 'active' || false,
  };
};

/**
 * Hook để quản lý payment history
 */
export function usePaymentHistory(limit = 10): UsePaymentHistoryReturn {
  const { user } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPaymentHistory = useCallback(async () => {
    if (!user?.id) {
      setPaymentHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: historyError } = await SubscriptionService.getUserPaymentHistory(user.id, limit);

      if (historyError) {
        setError('Không thể tải lịch sử thanh toán');
        console.error('Payment history fetch error:', historyError);
      } else {
        setPaymentHistory(data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }, [user?.id, limit]);

  const createPayment = useCallback(async (paymentData: Omit<PaymentHistoryData, 'id' | 'user_id'>): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      const { data, error: createError } = await SubscriptionService.createPaymentHistory({
        ...paymentData,
        user_id: user.id
      });

      if (createError) {
        setError('Không thể tạo payment record');
        console.error('Create payment error:', createError);
        return false;
      }

      // Refresh payment history to include new payment
      await refreshPaymentHistory();
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
      return false;
    }
  }, [user?.id, refreshPaymentHistory]);

  const updatePaymentStatus = useCallback(async (
    paymentId: string,
    status: PaymentHistoryData['status'],
    transactionData?: any
  ): Promise<boolean> => {
    try {
      setError(null);
      const { success, error: updateError } = await SubscriptionService.updatePaymentStatus(paymentId, status, transactionData);

      if (!success) {
        setError('Không thể cập nhật trạng thái thanh toán');
        console.error('Update payment status error:', updateError);
        return false;
      }

      // Refresh payment history to show updated status
      await refreshPaymentHistory();
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
      return false;
    }
  }, [refreshPaymentHistory]);

  // Load payment history when user changes
  useEffect(() => {
    refreshPaymentHistory();
  }, [refreshPaymentHistory]);

  return {
    paymentHistory,
    loading,
    error,
    refreshPaymentHistory,
    createPayment,
    updatePaymentStatus
  };
}

/**
 * Hook để quản lý auto payment methods
 */
export function useAutoPayment(): UseAutoPaymentReturn {
  const { user } = useAuth();
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<AutoPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPaymentMethod = useCallback(async () => {
    if (!user?.id) {
      setDefaultPaymentMethod(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: paymentError } = await SubscriptionService.getUserDefaultPaymentMethod(user.id);

      if (paymentError) {
        setError('Không thể tải phương thức thanh toán');
        console.error('Payment method fetch error:', paymentError);
      } else {
        setDefaultPaymentMethod(data);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const savePaymentMethod = useCallback(async (paymentData: Omit<AutoPaymentData, 'id' | 'user_id'>): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      const { data, error: saveError } = await SubscriptionService.saveAutoPaymentMethod({
        ...paymentData,
        user_id: user.id
      });

      if (saveError) {
        setError('Không thể lưu phương thức thanh toán');
        console.error('Save payment method error:', saveError);
        return false;
      }

      if (data && data.is_default) {
        setDefaultPaymentMethod(data);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
      return false;
    }
  }, [user?.id]);

  const removePaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    try {
      setError(null);
      const { success, error: removeError } = await SubscriptionService.removeAutoPaymentMethod(paymentMethodId);

      if (!success) {
        setError('Không thể xóa phương thức thanh toán');
        console.error('Remove payment method error:', removeError);
        return false;
      }

      // Refresh to update state
      await refreshPaymentMethod();
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
      return false;
    }
  }, [refreshPaymentMethod]);

  // Load payment method when user changes
  useEffect(() => {
    refreshPaymentMethod();
  }, [refreshPaymentMethod]);

  return {
    defaultPaymentMethod,
    loading,
    error,
    refreshPaymentMethod,
    savePaymentMethod,
    removePaymentMethod
  };
}

/**
 * Hook để check subscription status
 */
export function useSubscriptionStatus() {
  const { subscription, loading } = useSubscription();

  const isPremium = subscription?.plan_type === 'premium' && subscription?.status === 'active';
  const isPartner = subscription?.plan_type === 'partner' && subscription?.status === 'active';
  const isFree = !subscription || subscription?.plan_type === 'free';
  const isExpired = subscription?.status === 'expired';
  const isActive = subscription?.status === 'active';

  return {
    subscription,
    loading,
    isPremium,
    isPartner,
    isFree,
    isExpired,
    isActive,
    planType: subscription?.plan_type || 'free',
    status: subscription?.status || 'free'
  };
}

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
