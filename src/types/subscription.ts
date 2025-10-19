/**
 * Subscription & Account Upgrade Types
 */

export interface SubscriptionPlan {
  id: string;
  plan_name: 'free' | 'premium' | 'business';
  display_name: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  limits: {
    storage_gb: number;
    max_files: number;
    max_workflows: number;
    support: 'email' | 'priority' | 'dedicated';
    team_members?: number;
  };
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  started_at: string;
  expires_at?: string;
  auto_renew: boolean;
  payment_method?: string;
  transaction_id?: string;
  amount_paid?: number;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;

  // Joined data
  plan?: SubscriptionPlan;
}

export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_proof_url?: string;
  payment_note?: string;
  verified_by?: string;
  verified_at?: string;
  refunded_at?: string;
  refund_reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;

  // Joined data
  plan?: SubscriptionPlan;
  subscription?: UserSubscription;
}

export interface UpgradeSubscriptionDTO {
  plan_id: string;
  payment_method: string;
  payment_proof_url?: string;
  payment_note?: string;
}

export interface VerifyPaymentDTO {
  payment_id: string;
  verified: boolean;
  admin_notes?: string;
}

export interface SubscriptionStats {
  total_active: number;
  total_expired: number;
  total_revenue: number;
  revenue_by_plan: {
    plan_name: string;
    revenue: number;
    count: number;
  }[];
  recent_upgrades: {
    user_email: string;
    plan_name: string;
    amount: number;
    created_at: string;
  }[];
}

// Helper types for feature checks
export type SubscriptionFeature =
  | 'unlimited_uploads'
  | 'priority_support'
  | 'no_ads'
  | 'api_access'
  | 'white_label'
  | 'team_collaboration'
  | 'custom_workflows';

export interface SubscriptionLimit {
  storage_gb: number;
  max_files: number;
  max_workflows: number;
}
