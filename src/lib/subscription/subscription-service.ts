/**
 * Subscription Management Service
 * Quản lý subscription và auto-recurring payments cho Nam Long Center
 */

import { supabase } from "../supabase-config";

// Type helper for NLC tables
const nlc = (supabase as any);

export interface SubscriptionData {
  id?: string;
  user_id: string;
  plan_type: "free" | "premium" | "partner";
  status: "active" | "expired" | "cancelled" | "suspended" | "pending_payment";
  amount: number;
  currency: string;
  billing_cycle: "monthly" | "yearly" | "one_time";
  started_at?: string;
  current_period_start: string;
  current_period_end: string;
  next_billing_date?: string;
  auto_renewal: boolean;
  grace_period_days: number;
  plan_features?: any;
  metadata?: any;
}

export interface PaymentHistoryData {
  id?: string;
  subscription_id?: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: "vnpay" | "momo" | "bank_transfer" | "qr_code" | "card";
  payment_type:
    | "subscription"
    | "one_time"
    | "renewal"
    | "upgrade"
    | "downgrade";
  transaction_id?: string;
  vnpay_transaction_no?: string;
  gateway_response?: any;
  status: "pending" | "completed" | "failed" | "cancelled" | "refunded";
  payment_date?: string;
  due_date?: string;
  description?: string;
  failure_reason?: string;
  metadata?: any;
}

export interface AutoPaymentData {
  id?: string;
  user_id: string;
  subscription_id?: string;
  payment_method_token: string;
  card_last_4?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_active: boolean;
  is_default: boolean;
  gateway_customer_id?: string;
  gateway_payment_method_id?: string;
  metadata?: any;
}

export class SubscriptionService {
  /**
   * Tạo subscription mới
   */
  static async createSubscription(
    subscriptionData: Omit<SubscriptionData, "id">
  ): Promise<{ data: SubscriptionData | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) {
        console.error('Create subscription error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Create subscription exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Lấy subscription của user
   */
  static async getUserSubscription(
    userId: string
  ): Promise<{ data: SubscriptionData | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Get user subscription error:', error);
        return { data: null, error };
      }

      return { data: data || null, error: null };
    } catch (error) {
      console.error("Get user subscription exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Cập nhật subscription
   */
  static async updateSubscription(
    subscriptionId: string,
    updates: Partial<SubscriptionData>
  ): Promise<{ data: SubscriptionData | null; error: any }> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await nlc
        .from('nlc_subscriptions')
        .update(updateData)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) {
        console.error('Update subscription error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Update subscription exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Hủy subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    reason?: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await nlc
        .from('nlc_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          auto_renewal: false,
          metadata: { cancellation_reason: reason },
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) {
        console.error('Cancel subscription error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Cancel subscription exception:", error);
      return { success: false, error };
    }
  }

  /**
   * Tạo payment history record
   */
  static async createPaymentHistory(
    paymentData: Omit<PaymentHistoryData, "id">
  ): Promise<{ data: PaymentHistoryData | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_payment_transactions')
        .insert([paymentData])
        .select()
        .single();

      if (error) {
        console.error('Create payment history error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Create payment history exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Cập nhật payment status
   */
  static async updatePaymentStatus(
    paymentId: string,
    status: PaymentHistoryData["status"],
    transactionData?: any
  ): Promise<{ success: boolean; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed' && !transactionData?.payment_date) {
        updateData.payment_date = new Date().toISOString();
      }

      if (transactionData) {
        updateData.vnpay_transaction_no = transactionData.vnpay_transaction_no;
        updateData.gateway_response = transactionData.gateway_response;
      }

      const { error } = await nlc
        .from('nlc_payment_transactions')
        .update(updateData)
        .eq('id', paymentId);

      if (error) {
        console.error('Update payment status error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Update payment status exception:", error);
      return { success: false, error };
    }
  }

  /**
   * Lấy payment history của user
   */
  static async getUserPaymentHistory(
    userId: string,
    limit = 10
  ): Promise<{ data: PaymentHistoryData[] | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get payment history error:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Get payment history exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Lưu thông tin auto payment (thẻ)
   */
  static async saveAutoPaymentMethod(
    autoPaymentData: Omit<AutoPaymentData, "id">
  ): Promise<{ data: AutoPaymentData | null; error: any }> {
    try {
      // Nếu đây là default payment method, cập nhật các method khác thành không default
      if (autoPaymentData.is_default) {
        await nlc
          .from('nlc_auto_payments')
          .update({ is_default: false })
          .eq('user_id', autoPaymentData.user_id);
      }

      const { data, error } = await nlc
        .from('nlc_auto_payments')
        .insert([autoPaymentData])
        .select()
        .single();

      if (error) {
        console.error('Save auto payment method error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Save auto payment method exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Lấy default auto payment method của user
   */
  static async getUserDefaultPaymentMethod(
    userId: string
  ): Promise<{ data: AutoPaymentData | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_auto_payments')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Get default payment method error:', error);
        return { data: null, error };
      }

      return { data: data || null, error: null };
    } catch (error) {
      console.error("Get default payment method exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Xóa auto payment method
   */
  static async removeAutoPaymentMethod(
    paymentMethodId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await nlc
        .from('nlc_auto_payments')
        .update({ is_active: false })
        .eq('id', paymentMethodId);

      if (error) {
        console.error('Remove auto payment method error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Remove auto payment method exception:", error);
      return { success: false, error };
    }
  }

  /**
   * Lấy các subscription sắp đến hạn renewal (cho background job)
   */
  static async getSubscriptionsForRenewal(
    daysAhead = 3
  ): Promise<{ data: SubscriptionData[] | null; error: any }> {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);

      const { data, error } = await nlc
        .from('nlc_subscriptions')
        .select('*')
        .eq('status', 'active')
        .eq('auto_renewal', true)
        .lte('next_billing_date', targetDate.toISOString())
        .not('billing_cycle', 'eq', 'one_time');

      if (error) {
        console.error('Get subscriptions for renewal error:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Get subscriptions for renewal exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Tạo subscription renewal record
   */
  static async createSubscriptionRenewal(
    subscriptionId: string,
    paymentHistoryId?: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Lấy thông tin subscription hiện tại
      const { data: subscription, error: subError } = await nlc
        .from('nlc_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (subError || !subscription) {
        return { success: false, error: subError || 'Subscription not found' };
      }

      // Tính toán period mới
      const currentPeriodEnd = new Date(subscription.current_period_end);
      const newPeriodEnd = new Date(currentPeriodEnd);

      if (subscription.billing_cycle === 'monthly') {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      } else if (subscription.billing_cycle === 'yearly') {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      }

      // Tạo renewal record
      const renewalData = {
        subscription_id: subscriptionId,
        payment_history_id: paymentHistoryId,
        renewal_date: new Date().toISOString(),
        previous_period_end: subscription.current_period_end,
        new_period_end: newPeriodEnd.toISOString(),
        status: 'scheduled' as const
      };

      const { error: renewalError } = await nlc
        .from('nlc_subscription_renewals')
        .insert([renewalData]);

      if (renewalError) {
        console.error('Create subscription renewal error:', renewalError);
        return { success: false, error: renewalError };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Create subscription renewal exception:", error);
      return { success: false, error };
    }
  }

  /**
   * Renew subscription
   */
  static async renewSubscription(
    subscriptionId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Lấy thông tin subscription
      const { data: subscription, error: subError } = await nlc
        .from('nlc_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (subError || !subscription) {
        return { success: false, error: subError || 'Subscription not found' };
      }

      // Tính toán next billing date mới
      const currentPeriodEnd = new Date(subscription.current_period_end);
      const newPeriodStart = new Date(currentPeriodEnd);
      const newPeriodEnd = new Date(currentPeriodEnd);

      if (subscription.billing_cycle === 'monthly') {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      } else if (subscription.billing_cycle === 'yearly') {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      }

      // Cập nhật subscription
      const { error: updateError } = await nlc
        .from('nlc_subscriptions')
        .update({
          current_period_start: newPeriodStart.toISOString(),
          current_period_end: newPeriodEnd.toISOString(),
          next_billing_date: newPeriodEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (updateError) {
        console.error('Renew subscription error:', updateError);
        return { success: false, error: updateError };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Renew subscription exception:", error);
      return { success: false, error };
    }
  }

  /**
   * Get plan templates
   */
  static async getPlanTemplates(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await nlc
        .from('nlc_membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('amount', { ascending: true });

      if (error) {
        console.error('Get plan templates error:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Get plan templates exception:", error);
      return { data: null, error };
    }
  }
}

export default SubscriptionService;
