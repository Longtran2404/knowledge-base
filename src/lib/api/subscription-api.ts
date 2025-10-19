/**
 * Subscription API Service
 * Handles premium membership and account upgrades
 */

import { supabase } from '../supabase-config';
import type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionPayment,
  UpgradeSubscriptionDTO,
  VerifyPaymentDTO,
  SubscriptionStats,
} from '../../types/subscription';

// Type-safe wrapper
const db = supabase as any;

// =============================================
// Subscription Plans API
// =============================================

export const subscriptionPlansApi = {
  /**
   * Get all active subscription plans
   */
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await db
      .from('nlc_subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as SubscriptionPlan[];
  },

  /**
   * Get plan by name
   */
  async getPlanByName(planName: string): Promise<SubscriptionPlan> {
    const { data, error } = await db
      .from('nlc_subscription_plans')
      .select('*')
      .eq('plan_name', planName)
      .single();

    if (error) throw error;
    return data as SubscriptionPlan;
  },

  /**
   * Get plan by ID
   */
  async getPlanById(id: string): Promise<SubscriptionPlan> {
    const { data, error } = await db
      .from('nlc_subscription_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as SubscriptionPlan;
  },
};

// =============================================
// User Subscriptions API
// =============================================

export const userSubscriptionsApi = {
  /**
   * Get current user's active subscription
   */
  async getCurrentSubscription(): Promise<UserSubscription | null> {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await db
      .from('nlc_user_subscriptions')
      .select(`
        *,
        plan:plan_id (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserSubscription;
  },

  /**
   * Get subscription history for current user
   */
  async getSubscriptionHistory(): Promise<UserSubscription[]> {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await db
      .from('nlc_user_subscriptions')
      .select(`
        *,
        plan:plan_id (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserSubscription[];
  },

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(dto: UpgradeSubscriptionDTO): Promise<UserSubscription> {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get plan details
    const { data: plan } = await db
      .from('nlc_subscription_plans')
      .select('*')
      .eq('id', dto.plan_id)
      .single();

    if (!plan) throw new Error('Plan not found');

    // Call upgrade function
    const { data, error } = await db.rpc('upgrade_subscription', {
      p_user_id: user.id,
      p_new_plan_id: dto.plan_id,
      p_payment_method: dto.payment_method,
      p_amount: plan.price,
    });

    if (error) throw error;

    // If payment proof provided, update payment record
    if (dto.payment_proof_url || dto.payment_note) {
      await db
        .from('nlc_subscription_payments')
        .update({
          payment_proof_url: dto.payment_proof_url,
          payment_note: dto.payment_note,
          updated_at: new Date().toISOString(),
        })
        .eq('subscription_id', data)
        .eq('user_id', user.id);
    }

    // Get the created subscription
    const { data: subscription } = await db
      .from('nlc_user_subscriptions')
      .select(`
        *,
        plan:plan_id (*)
      `)
      .eq('id', data)
      .single();

    return subscription as UserSubscription;
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(reason?: string): Promise<void> {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await db
      .from('nlc_user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        auto_renew: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (error) throw error;
  },

  /**
   * Check if user has feature
   */
  async hasFeature(feature: string): Promise<boolean> {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return false;

    const { data, error } = await db.rpc('user_has_feature', {
      p_user_id: user.id,
      p_feature: feature,
    });

    if (error) return false;
    return data as boolean;
  },
};

// =============================================
// Subscription Payments API
// =============================================

export const subscriptionPaymentsApi = {
  /**
   * Get payment history for current user
   */
  async getPaymentHistory(): Promise<SubscriptionPayment[]> {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await db
      .from('nlc_subscription_payments')
      .select(`
        *,
        plan:plan_id (*),
        subscription:subscription_id (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SubscriptionPayment[];
  },

  /**
   * Get all pending payments (admin only)
   */
  async getPendingPayments(): Promise<SubscriptionPayment[]> {
    const { data, error } = await db
      .from('nlc_subscription_payments')
      .select(`
        *,
        plan:plan_id (*),
        subscription:subscription_id (*)
      `)
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SubscriptionPayment[];
  },

  /**
   * Verify payment (admin only)
   */
  async verifyPayment(dto: VerifyPaymentDTO): Promise<void> {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Update payment status
    const { error: paymentError } = await db
      .from('nlc_subscription_payments')
      .update({
        payment_status: dto.verified ? 'completed' : 'failed',
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        payment_note: dto.admin_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dto.payment_id);

    if (paymentError) throw paymentError;

    if (dto.verified) {
      // Get payment details
      const { data: payment } = await db
        .from('nlc_subscription_payments')
        .select('subscription_id')
        .eq('id', dto.payment_id)
        .single();

      if (payment) {
        // Activate subscription
        const { error: subError } = await db
          .from('nlc_user_subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.subscription_id);

        if (subError) throw subError;
      }
    }
  },
};

// =============================================
// Subscription Stats API (Admin)
// =============================================

export const subscriptionStatsApi = {
  /**
   * Get subscription statistics
   */
  async getStats(): Promise<SubscriptionStats> {
    // Get counts
    const { data: active } = await db
      .from('nlc_user_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    const { data: expired } = await db
      .from('nlc_user_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'expired');

    // Get revenue
    const { data: payments } = await db
      .from('nlc_subscription_payments')
      .select('amount, plan_id')
      .eq('payment_status', 'completed');

    const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

    // Revenue by plan
    const revenueByPlan: any = {};
    payments?.forEach(p => {
      if (!revenueByPlan[p.plan_id]) {
        revenueByPlan[p.plan_id] = { revenue: 0, count: 0 };
      }
      revenueByPlan[p.plan_id].revenue += parseFloat(p.amount);
      revenueByPlan[p.plan_id].count += 1;
    });

    // Get plan names
    const { data: plans } = await db
      .from('nlc_subscription_plans')
      .select('id, plan_name');

    const revenueByPlanArray = Object.entries(revenueByPlan).map(([planId, data]: any) => {
      const plan = plans?.find(p => p.id === planId);
      return {
        plan_name: plan?.plan_name || 'Unknown',
        revenue: data.revenue,
        count: data.count,
      };
    });

    // Recent upgrades
    const { data: recentPayments } = await db
      .from('nlc_subscription_payments')
      .select(`
        user_id,
        amount,
        created_at,
        plan:plan_id (plan_name)
      `)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);

    const recentUpgrades = await Promise.all(
      (recentPayments || []).map(async (p: any) => {
        const { data: account } = await db
          .from('nlc_accounts')
          .select('email')
          .eq('user_id', p.user_id)
          .single();

        return {
          user_email: account?.email || 'Unknown',
          plan_name: p.plan?.plan_name || 'Unknown',
          amount: parseFloat(p.amount),
          created_at: p.created_at,
        };
      })
    );

    return {
      total_active: active?.length || 0,
      total_expired: expired?.length || 0,
      total_revenue: totalRevenue,
      revenue_by_plan: revenueByPlanArray,
      recent_upgrades: recentUpgrades,
    };
  },
};

// Export all APIs
export const subscriptionApi = {
  plans: subscriptionPlansApi,
  subscriptions: userSubscriptionsApi,
  payments: subscriptionPaymentsApi,
  stats: subscriptionStatsApi,
};
 
