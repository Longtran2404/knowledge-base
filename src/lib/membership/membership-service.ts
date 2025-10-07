/**
 * Membership Service - Đơn giản hóa
 * Quản lý membership: Free → Member → Premium
 */

import { supabase } from "../supabase-config";
import { PRICING_PLANS, getPlanByCode, type PricingPlan } from "../../config/pricing";

// Type helper for NLC tables
const nlc = (supabase as any);

export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  company_name?: string;
  membership_type: "free" | "member" | "premium";
  membership_status: "active" | "expired" | "suspended" | "cancelled";
  membership_started_at?: string;
  membership_expires_at?: string;
  auto_renewal: boolean;
  payment_method_saved: boolean;
  created_at: string;
  updated_at: string;
}

// Use the centralized pricing plan interface
export type MembershipPlan = PricingPlan;

export interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id?: string;
  status: "pending" | "completed" | "failed" | "cancelled" | "refunded";
  from_plan?: string;
  to_plan: string;
  upgrade_type: "new" | "upgrade" | "renewal";
  payment_date?: string;
  description?: string;
  created_at: string;
}

export class MembershipService {
  /**
   * Lấy thông tin user profile
   */
  static async getUserProfile(
    authUserId: string
  ): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_accounts')
        .select('*')
        .eq('user_id', authUserId)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Tạo hoặc cập nhật user profile
   */
  static async upsertUserProfile(
    profileData: Partial<UserProfile>
  ): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_accounts')
        .upsert({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Lấy tất cả membership plans
   */
  static async getMembershipPlans(): Promise<{
    data: MembershipPlan[] | null;
    error: any;
  }> {
    try {
      console.log("Getting membership plans");

      // Use centralized pricing plans
      console.log("Returning centralized pricing plans:", PRICING_PLANS);
      return { data: PRICING_PLANS, error: null };

      // TODO: Enable after database setup
      // const { data, error } = await nlc
      //   .from('nlc_membership_plans')
      //   .select('*')
      //   .eq('is_active', true)
      //   .order('price', { ascending: true });
      // return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Lấy plan theo code
   */
  static async getPlanByCode(
    planCode: string
  ): Promise<{ data: MembershipPlan | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_membership_plans')
        .select('*')
        .eq('plan_code', planCode)
        .eq('is_active', true)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Nâng cấp membership
   */
  static async upgradeMembership(
    userId: string,
    newPlanCode: string,
    durationMonths: number = 1
  ): Promise<{ success: boolean; error?: any }> {
    try {
      console.log(`Upgrading membership for user ${userId} to plan ${newPlanCode} for ${durationMonths} months`);

      // Validate plan exists
      const selectedPlan = getPlanByCode(newPlanCode);

      if (!selectedPlan) {
        return { success: false, error: "Invalid plan selected" };
      }

      // Simulate the upgrade process
      const upgradeData = {
        user_id: userId,
        from_plan: "free", // current plan
        to_plan: newPlanCode,
        plan_name: selectedPlan.name,
        price: selectedPlan.price,
        duration_months: durationMonths,
        upgrade_date: new Date().toISOString(),
        expires_at: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      console.log("Simulated membership upgrade:", upgradeData);

      // In a real app, this would update the database
      // For now, we'll simulate success
      return { success: true };

      // TODO: Enable after unified schema is deployed
      // const { data, error } = await nlc.rpc('update_user_membership', {
      //   p_user_id: userId,
      //   p_new_plan: newPlanCode,
      //   p_duration_months: durationMonths
      // });

      // if (error) {
      //   return { success: false, error };
      // }

      // return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Tạo payment transaction
   */
  static async createPaymentTransaction(
    transactionData: Omit<PaymentTransaction, "id" | "created_at">
  ): Promise<{ data: PaymentTransaction | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_payment_transactions')
        .insert([transactionData])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Cập nhật trạng thái payment
   */
  static async updatePaymentStatus(
    transactionId: string,
    status: PaymentTransaction["status"],
    additionalData?: Partial<PaymentTransaction>
  ): Promise<{ success: boolean; error?: any }> {
    try {
      const updateData = {
        status,
        ...additionalData,
        updated_at: new Date().toISOString()
      };

      const { error } = await nlc
        .from('nlc_payment_transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Lấy payment history của user
   */
  static async getUserPaymentHistory(
    userId: string,
    limit: number = 10
  ): Promise<{ data: PaymentTransaction[] | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Kiểm tra quyền truy cập dựa trên membership
   */
  static hasAccess(
    userMembership: string,
    requiredMembership: string
  ): boolean {
    const membershipLevels = {
      free: 0,
      member: 1,
      premium: 2,
    };

    const userLevel =
      membershipLevels[userMembership as keyof typeof membershipLevels] || 0;
    const requiredLevel =
      membershipLevels[requiredMembership as keyof typeof membershipLevels] ||
      0;

    return userLevel >= requiredLevel;
  }

  /**
   * Lưu payment method cho auto-renewal
   */
  static async savePaymentMethod(
    userId: string,
    paymentMethodData: {
      payment_token: string;
      card_last_4?: string;
      card_brand?: string;
      card_exp_month?: number;
      card_exp_year?: number;
      gateway?: string;
    }
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Đặt tất cả payment methods khác thành không default
      await nlc
        .from('nlc_auto_payments')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Thêm payment method mới
      const { error } = await nlc
        .from('nlc_auto_payments')
        .insert([{
          user_id: userId,
          payment_method_token: paymentMethodData.payment_token,
          card_last_4: paymentMethodData.card_last_4,
          card_brand: paymentMethodData.card_brand,
          card_exp_month: paymentMethodData.card_exp_month,
          card_exp_year: paymentMethodData.card_exp_year,
          is_active: true,
          is_default: true
        }]);

      if (error) {
        return { success: false, error };
      }

      // Cập nhật user có payment method saved
      await nlc
        .from('nlc_accounts')
        .update({ payment_method_saved: true })
        .eq('user_id', userId);

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Lấy default payment method
   */
  static async getDefaultPaymentMethod(
    userId: string
  ): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_auto_payments')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Tự động gia hạn membership (cho background job)
   */
  static async processAutoRenewal(
    userId: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Lấy thông tin user và payment method
      const { data: user } = await this.getUserProfile(userId);
      const { data: paymentMethod } = await this.getDefaultPaymentMethod(
        userId
      );

      if (!user || !paymentMethod || !user.auto_renewal) {
        return {
          success: false,
          error: "Auto renewal not enabled or no payment method",
        };
      }

      // Tạo payment transaction cho renewal
      const { data: transaction } = await this.createPaymentTransaction({
        user_id: userId,
        amount: user.membership_type === "member" ? 199000 : 299000,
        currency: "VND",
        payment_method: "vnpay",
        status: "pending",
        from_plan: user.membership_type,
        to_plan: user.membership_type,
        upgrade_type: "renewal",
        description: `Auto renewal - ${user.membership_type}`,
      });

      if (!transaction) {
        return { success: false, error: "Failed to create transaction" };
      }

      // Xử lý payment với VNPay (mock)
      // Trong thực tế sẽ gọi VNPay API với saved token
      const paymentSuccess = Math.random() > 0.1; // 90% success rate

      if (paymentSuccess) {
        // Update transaction thành công
        await this.updatePaymentStatus(transaction.id, "completed", {
          payment_date: new Date().toISOString(),
          transaction_id: `AUTO_${Date.now()}`,
        });

        // Gia hạn membership
        await this.upgradeMembership(userId, user.membership_type, 1);

        return { success: true };
      } else {
        // Update transaction thất bại
        await this.updatePaymentStatus(transaction.id, "failed");

        return { success: false, error: "Payment failed" };
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Kiểm tra membership hết hạn
   */
  static async checkExpiredMemberships(): Promise<{
    expiredCount: number;
    error?: any;
  }> {
    try {
      // TODO: Enable after unified schema is deployed
      console.log("Supabase call disabled temporarily");
      return { expiredCount: 0, error: null };

      // const { data, error } = await nlc.rpc('check_membership_expiry');

      // if (error) {
      //   return { expiredCount: 0, error };
      // }

      // return { expiredCount: data || 0 };
    } catch (error) {
      return { expiredCount: 0, error };
    }
  }
}

export default MembershipService;
