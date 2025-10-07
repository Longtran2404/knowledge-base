/**
 * Membership React Hooks - Đơn giản
 * Hooks để quản lý membership trong React components
 */

import { useState, useEffect, useCallback } from "react";
import {
  MembershipService,
  UserProfile,
  MembershipPlan,
  PaymentTransaction,
} from "../lib/membership/membership-service";
import { useAuth } from "../contexts/UnifiedAuthContext";

export interface UseMembershipReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  upgradeMembership: (planCode: string, months?: number) => Promise<boolean>;
}

export interface UsePlansReturn {
  plans: MembershipPlan[];
  loading: boolean;
  error: string | null;
  getPlanByCode: (code: string) => MembershipPlan | null;
}

export interface UsePaymentHistoryReturn {
  transactions: PaymentTransaction[];
  loading: boolean;
  error: string | null;
  refreshHistory: () => Promise<void>;
  createTransaction: (
    data: Omit<PaymentTransaction, "id" | "created_at">
  ) => Promise<boolean>;
}

/**
 * Hook chính để quản lý membership của user
 */
export function useMembership(): UseMembershipReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Enable after unified schema is deployed
      console.log("MembershipService call disabled");
      // const { data, error: profileError } = await MembershipService.getUserProfile(user.id);
      const data = null;
      const profileError = null;

      if (profileError) {
        setError("Không thể tải thông tin profile");
        console.error("Profile fetch error:", profileError);
      } else {
        setProfile(data);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối");
      console.error("Profile refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>): Promise<boolean> => {
      if (!user?.id) {
        setError("User not authenticated");
        return false;
      }

      try {
        setError(null);
        // TODO: Enable after unified schema is deployed
        console.log("MembershipService call disabled");
        // const { data: updatedProfile, error: updateError } = await MembershipService.upsertUserProfile({
        //   ...data,
        //   auth_user_id: user.id
        // });
        const updatedProfile = null;
        const updateError = null;

        if (updateError) {
          setError("Không thể cập nhật profile");
          console.error("Profile update error:", updateError);
          return false;
        }

        if (updatedProfile) {
          setProfile(updatedProfile);
        }
        return true;
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối");
        return false;
      }
    },
    [user?.id]
  );

  const upgradeMembership = useCallback(
    async (planCode: string, months: number = 1): Promise<boolean> => {
      if (!profile?.id) {
        setError("Profile not loaded");
        return false;
      }

      try {
        setError(null);
        // TODO: Enable after unified schema is deployed
        console.log("MembershipService call disabled");
        // const { success, error: upgradeError } = await MembershipService.upgradeMembership(
        //   profile.id,
        //   planCode,
        //   months
        // );
        const success = false;
        const upgradeError = null;

        if (!success) {
          setError("Không thể nâng cấp membership");
          console.error("Membership upgrade error:", upgradeError);
          return false;
        }

        // Refresh profile to get updated membership info
        await refreshProfile();
        return true;
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối");
        return false;
      }
    },
    [profile?.id, refreshProfile]
  );

  // Load profile when user changes
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    updateProfile,
    upgradeMembership,
  };
}

/**
 * Hook để lấy danh sách membership plans
 */
export function usePlans(): UsePlansReturn {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPlanByCode = useCallback(
    (code: string): MembershipPlan | null => {
      return plans.find((plan) => plan.code === code) || null;
    },
    [plans]
  );

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Enable after unified schema is deployed
        console.log("MembershipService call disabled");
        // const { data, error: plansError } = await MembershipService.getMembershipPlans();
        const data = [];
        const plansError = null;

        if (plansError) {
          setError("Không thể tải danh sách gói");
          console.error("Plans fetch error:", plansError);
        } else {
          setPlans(data || []);
        }
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối");
        console.error("Plans fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    getPlanByCode,
  };
}

/**
 * Hook để quản lý payment history
 */
export function usePaymentHistory(limit: number = 10): UsePaymentHistoryReturn {
  const { profile } = useMembership();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    if (!profile?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Enable after unified schema is deployed
      console.log("Will get payment history for profile:", profile.id);
      const data: any[] = [];
      const historyError = null;
      // const { data, error: historyError } = // TODO: Enable after unified schema is deployed
      console.log("MembershipService call disabled");
      // await MembershipService.getUserPaymentHistory(profile.id, limit);

      if (historyError) {
        setError("Không thể tải lịch sử thanh toán");
        console.error("Payment history fetch error:", historyError);
      } else {
        setTransactions(data || []);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối");
      console.error("Payment history refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  const createTransaction = useCallback(
    async (
      data: Omit<PaymentTransaction, "id" | "created_at">
    ): Promise<boolean> => {
      if (!profile?.id) {
        setError("Profile not loaded");
        return false;
      }

      try {
        setError(null);
        // TODO: Enable after unified schema is deployed
        console.log("MembershipService call disabled");
        // const { data: transaction, error: createError } = await MembershipService.createPaymentTransaction({
        //   ...data,
        //   user_id: profile.id
        // });
        const transaction = null;
        const createError = null;

        if (createError) {
          setError("Không thể tạo transaction");
          console.error("Create transaction error:", createError);
          return false;
        }

        // Refresh history to include new transaction
        await refreshHistory();
        return true;
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối");
        return false;
      }
    },
    [profile?.id, refreshHistory]
  );

  // Load history when profile changes
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  return {
    transactions,
    loading,
    error,
    refreshHistory,
    createTransaction,
  };
}

/**
 * Hook để check membership status và permissions
 */
export function useMembershipStatus() {
  const { profile, loading } = useMembership();

  const isFree = profile?.membership_type === "free";
  const isMember = profile?.membership_type === "member";
  const isPremium = profile?.membership_type === "premium";
  const isActive = profile?.membership_status === "active";
  const isExpired = profile?.membership_status === "expired";

  const hasAccess = useCallback(
    (requiredLevel: "free" | "member" | "premium") => {
      if (!profile) return false;
      return MembershipService.hasAccess(
        profile.membership_type,
        requiredLevel
      );
    },
    [profile]
  );

  const canUpgrade = useCallback(() => {
    if (!profile || !isActive) return false;

    if (isFree) return true; // Free can upgrade to member or premium
    if (isMember) return true; // Member can upgrade to premium
    return false; // Premium cannot upgrade further
  }, [profile, isActive, isFree, isMember]);

  const getUpgradeOptions = useCallback(() => {
    if (!canUpgrade()) return [];

    if (isFree) return ["member", "premium"];
    if (isMember) return ["premium"];
    return [];
  }, [canUpgrade, isFree, isMember]);

  const daysUntilExpiry = useCallback(() => {
    if (!profile?.membership_expires_at) return null;

    const expiryDate = new Date(profile.membership_expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }, [profile?.membership_expires_at]);

  return {
    profile,
    loading,
    isFree,
    isMember,
    isPremium,
    isActive,
    isExpired,
    hasAccess,
    canUpgrade,
    getUpgradeOptions,
    daysUntilExpiry: daysUntilExpiry(),
    membershipType: profile?.membership_type || "free",
    membershipStatus: profile?.membership_status || "active",
  };
}
