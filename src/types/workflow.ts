/**
 * Workflow Marketplace Types
 * Types for n8n workflow marketplace system
 */

// ============================================
// WORKFLOW TYPES
// ============================================

export interface Workflow {
  id: string;
  workflow_name: string;
  workflow_slug: string;
  workflow_description: string;
  workflow_category: string;
  workflow_thumbnail?: string;
  workflow_preview_images?: string[];
  workflow_file_url: string;
  workflow_file_size: number;
  documentation_files: DocumentFile[];

  creator_id: string;
  creator_name: string;
  creator_email: string;
  creator_type: 'admin' | 'partner' | 'instructor';

  workflow_price: number;
  original_price?: number;
  discount_percent: number;
  is_free: boolean;

  workflow_status: 'draft' | 'pending' | 'published' | 'rejected';
  is_featured: boolean;
  is_active: boolean;

  download_count: number;
  purchase_count: number;
  view_count: number;
  avg_rating: number;
  review_count: number;

  tags: string[];
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  node_count: number;
  estimated_setup_time?: string;
  requirements?: string[];
  use_cases?: string[];

  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];

  rejection_reason?: string;
  admin_notes?: string;
  approved_by?: string;
  approved_at?: string;

  created_at: string;
  updated_at: string;
}

export interface DocumentFile {
  name: string;
  url: string;
  type: 'pdf' | 'docx' | 'txt' | 'md';
  size: number;
}

export interface CreateWorkflowDTO {
  workflow_name: string;
  workflow_slug: string;
  workflow_description: string;
  workflow_category: string;
  workflow_thumbnail?: string;
  workflow_file_url: string;
  documentation_files?: DocumentFile[];
  workflow_price: number;
  is_free: boolean;
  tags: string[];
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_setup_time?: string;
  requirements?: string[];
  use_cases?: string[];
}

export interface UpdateWorkflowDTO extends Partial<CreateWorkflowDTO> {
  workflow_status?: 'draft' | 'pending' | 'published' | 'rejected';
  is_featured?: boolean;
  is_active?: boolean;
}

// ============================================
// ORDER TYPES
// ============================================

export interface WorkflowOrder {
  id: string;
  order_code: string;

  buyer_user_id?: string;
  buyer_email: string;
  buyer_name: string;
  buyer_phone?: string;
  buyer_notes?: string;

  workflow_id: string;
  workflow_name: string;
  workflow_price: number;
  total_amount: number; // Same as workflow_price for now
  workflow?: Workflow; // Optional joined workflow data

  payment_method: 'qr_vnpay' | 'bank_transfer' | 'card';
  payment_qr_image?: string;
  payment_phone: string;
  payment_bank_info: string;
  payment_content?: string;

  payment_status: 'pending' | 'verifying' | 'confirmed' | 'rejected' | 'cancelled';
  payment_proof_image?: string;
  payment_proof_uploaded_at?: string;

  verified_by_admin_id?: string;
  verified_by_admin_name?: string;
  verified_at?: string;
  admin_notes?: string;
  rejection_reason?: string;

  order_status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'expired';

  files_sent: boolean;
  files_sent_at?: string;
  download_links?: DownloadLinks;
  download_links_expire_at?: string;

  expires_at: string;
  cancelled_at?: string;
  cancel_reason?: string;

  ip_address?: string;
  user_agent?: string;

  created_at: string;
  updated_at: string;
}

export interface DownloadLinks {
  workflow: string;
  docs: string[];
}

export interface CreateOrderDTO {
  buyer_email: string;
  buyer_name: string;
  buyer_phone?: string;
  buyer_notes?: string;
  workflow_id: string;
  payment_method?: 'qr_vnpay' | 'bank_transfer' | 'card';
}

export interface UpdateOrderPaymentProofDTO {
  order_id: string;
  payment_proof_image: string;
}

export interface VerifyOrderDTO {
  order_id: string;
  verified: boolean;
  admin_notes?: string;
  rejection_reason?: string;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface WorkflowReview {
  id: string;
  workflow_id: string;

  reviewer_user_id: string;
  reviewer_name: string;
  reviewer_email: string;
  reviewer_avatar?: string;

  rating: 1 | 2 | 3 | 4 | 5;
  review_title?: string;
  review_text: string;

  is_verified_purchase: boolean;
  helpful_count: number;
  not_helpful_count: number;

  review_status: 'published' | 'pending' | 'rejected';
  is_featured: boolean;

  moderated_by?: string;
  moderated_at?: string;
  moderation_notes?: string;

  created_at: string;
  updated_at: string;
}

export interface CreateReviewDTO {
  workflow_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review_title?: string;
  review_text: string;
}

export interface UpdateReviewDTO {
  rating?: 1 | 2 | 3 | 4 | 5;
  review_title?: string;
  review_text?: string;
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface WorkflowFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  isFree?: boolean;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  rating?: number;
  tags?: string[];
}

export interface WorkflowSearchParams {
  search?: string;
  filters?: WorkflowFilters;
  sortBy?: 'newest' | 'popular' | 'price-low' | 'price-high' | 'rating';
  page?: number;
  limit?: number;
}

// ============================================
// STATS TYPES
// ============================================

export interface WorkflowStats {
  total_workflows: number;
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  top_workflows: Array<{
    workflow_name: string;
    purchase_count: number;
    revenue: number;
  }>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;

  // Optional camelCase aliases for backward compatibility
  totalWorkflows?: number;
  totalRevenue?: number;
  totalSales?: number;
  publishedWorkflows?: number;
  pendingWorkflows?: number;
  totalDownloads?: number;
  monthlyRevenue?: number;
  monthlyGrowth?: number;
  topWorkflows?: Array<{
    workflow_name: string;
    purchase_count: number;
    revenue: number;
  }>;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface WorkflowModalState {
  isOpen: boolean;
  workflow: Workflow | null;
}

export interface CheckoutState {
  workflow: Workflow | null;
  order: WorkflowOrder | null;
  step: 'info' | 'payment' | 'confirmation';
}

// ============================================
// CATEGORY CONFIG
// ============================================

export const WORKFLOW_CATEGORIES = [
  'E-commerce',
  'Marketing',
  'Data Processing',
  'Automation',
  'Integration',
  'Analytics',
  'Communication',
  'CRM',
  'Social Media',
  'Development',
  'Other'
] as const;

export type WorkflowCategory = typeof WORKFLOW_CATEGORIES[number];

// ============================================
// PAYMENT CONFIG
// ============================================

export const PAYMENT_INFO = {
  qr_code_image: '/20250918_102412239_iOS.jpg',
  phone: '0703189963',
  bank_name: 'VNPay',
  account_name: 'Trần Minh Long',
} as const;
