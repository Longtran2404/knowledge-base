/**
 * Workflow API Service
 * API calls for workflow marketplace
 */

import { supabase } from '../supabase-config';
import type {
  Workflow,
  WorkflowOrder,
  WorkflowReview,
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
  CreateOrderDTO,
  UpdateOrderPaymentProofDTO,
  VerifyOrderDTO,
  CreateReviewDTO,
  WorkflowSearchParams,
  WorkflowStats,
} from '../../types/workflow';

// Type-safe wrapper to bypass Supabase type generation issues
const db = supabase as any;

// ============================================
// WORKFLOW CRUD
// ============================================

export const workflowApi = {
  // Get all published workflows
  async getPublishedWorkflows(params?: WorkflowSearchParams) {
    let query = (supabase
      .from('nlc_workflows')
      .select('*') as any)
      .eq('workflow_status', 'published')
      .eq('is_active', true);

    // Search
    if (params?.search) {
      query = query.or(`workflow_name.ilike.%${params.search}%,workflow_description.ilike.%${params.search}%,tags.cs.{${params.search}}`);
    }

    // Filters
    if (params?.filters?.category) {
      query = query.eq('workflow_category', params.filters.category);
    }

    if (params?.filters?.isFree !== undefined) {
      query = query.eq('is_free', params.filters.isFree);
    }

    if (params?.filters?.difficulty) {
      query = query.eq('difficulty_level', params.filters.difficulty);
    }

    if (params?.filters?.priceRange) {
      query = query
        .gte('workflow_price', params.filters.priceRange.min)
        .lte('workflow_price', params.filters.priceRange.max);
    }

    if (params?.filters?.rating) {
      query = query.gte('avg_rating', params.filters.rating);
    }

    // Sort
    switch (params?.sortBy) {
      case 'popular':
        query = query.order('purchase_count', { ascending: false });
        break;
      case 'price-low':
        query = query.order('workflow_price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('workflow_price', { ascending: false });
        break;
      case 'rating':
        query = query.order('avg_rating', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      workflows: data as Workflow[],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  // Get workflow by ID
  async getWorkflowById(id: string) {
    const { data, error } = await db
      .from('nlc_workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // TODO: Increment view count in background (needs RPC function)
    // await db.rpc('increment_workflow_views', { workflow_id: id })

    return data as Workflow;
  },

  // Get workflow by slug
  async getWorkflowBySlug(slug: string) {
    const { data, error } = await db
      .from('nlc_workflows')
      .select('*')
      .eq('workflow_slug', slug)
      .single();

    if (error) throw error;
    return data as Workflow;
  },

  // Get featured workflows
  async getFeaturedWorkflows(limit: number = 6) {
    const { data, error } = await db
      .from('nlc_workflows')
      .select('*')
      .eq('workflow_status', 'published')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Workflow[];
  },

  // Get my workflows (creator)
  async getMyWorkflows() {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await db
      .from('nlc_workflows')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Workflow[];
  },

  // Create workflow
  async createWorkflow(dto: CreateWorkflowDTO) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: account } = await db
      .from('nlc_accounts')
      .select('full_name, email, account_role')
      .eq('user_id', user.id)
      .single();

    const creatorName = account?.full_name || user.email || 'Unknown';
    const creatorEmail = account?.email || user.email || '';
    const creatorType = account?.account_role === 'admin' ? 'admin' : 'partner';

    const { data, error } = await (supabase
      .from('nlc_workflows')
      .insert as any)([{
        ...dto,
        creator_id: user.id,
        creator_name: creatorName,
        creator_email: creatorEmail,
        creator_type: creatorType,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Workflow;
  },

  // Update workflow
  async updateWorkflow(id: string, dto: UpdateWorkflowDTO) {
    const { data, error } = await db
      .from('nlc_workflows')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Workflow;
  },

  // Delete workflow
  async deleteWorkflow(id: string) {
    const { error } = await db
      .from('nlc_workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Publish workflow (admin)
  async publishWorkflow(id: string) {
    return this.updateWorkflow(id, { workflow_status: 'published' });
  },

  // Reject workflow (admin)
  async rejectWorkflow(id: string, reason: string) {
    return this.updateWorkflow(id, {
      workflow_status: 'rejected',
      rejection_reason: reason,
    });
  },
};

// ============================================
// ORDER MANAGEMENT
// ============================================

export const orderApi = {
  // Create order
  async createOrder(dto: CreateOrderDTO) {
    // Generate order code
    const orderCode = `WF-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Get workflow details
    const { data: workflow } = await db
      .from('nlc_workflows')
      .select('workflow_name, workflow_price')
      .eq('id', dto.workflow_id)
      .single();

    if (!workflow) throw new Error('Workflow not found');

    // Get user ID if logged in
    const { data: { user } } = await db.auth.getUser();

    const { data, error } = await db
      .from('nlc_workflow_orders')
      .insert([{
        order_code: orderCode,
        buyer_user_id: user?.id,
        buyer_email: dto.buyer_email,
        buyer_name: dto.buyer_name,
        buyer_phone: dto.buyer_phone,
        buyer_notes: dto.buyer_notes,
        workflow_id: dto.workflow_id,
        workflow_name: workflow.workflow_name,
        workflow_price: workflow.workflow_price,
        payment_method: dto.payment_method || 'qr_vnpay',
        payment_phone: '0703189963',
        payment_bank_info: 'VNPay - 0703189963',
        payment_content: `${orderCode} Mua workflow ${workflow.workflow_name}`,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as WorkflowOrder;
  },

  // Get order by ID
  async getOrderById(id: string) {
    const { data, error } = await db
      .from('nlc_workflow_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as WorkflowOrder;
  },

  // Get order by code
  async getOrderByCode(code: string) {
    const { data, error } = await db
      .from('nlc_workflow_orders')
      .select('*')
      .eq('order_code', code)
      .single();

    if (error) throw error;
    return data as WorkflowOrder;
  },

  // Get my orders
  async getMyOrders() {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await db
      .from('nlc_workflow_orders')
      .select('*')
      .or(`buyer_user_id.eq.${user.id},buyer_email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WorkflowOrder[];
  },

  // Upload payment proof
  async uploadPaymentProof(dto: UpdateOrderPaymentProofDTO) {
    const { data, error } = await db
      .from('nlc_workflow_orders')
      .update({
        payment_proof_image: dto.payment_proof_image,
        payment_proof_uploaded_at: new Date().toISOString(),
        payment_status: 'verifying',
      })
      .eq('id', dto.order_id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkflowOrder;
  },

  // Admin: Get all orders
  async getAllOrders(status?: string) {
    let query = supabase
      .from('nlc_workflow_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('payment_status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as WorkflowOrder[];
  },

  // Admin: Verify order
  async verifyOrder(dto: VerifyOrderDTO) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: account } = await db
      .from('nlc_accounts')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    const updateData: any = {
      verified_by_admin_id: user.id,
      verified_by_admin_name: account?.full_name || 'Admin',
      verified_at: new Date().toISOString(),
      admin_notes: dto.admin_notes,
    };

    if (dto.verified) {
      updateData.payment_status = 'confirmed';
      updateData.order_status = 'processing';
    } else {
      updateData.payment_status = 'rejected';
      updateData.order_status = 'cancelled';
      updateData.rejection_reason = dto.rejection_reason;
    }

    const { data, error } = await db
      .from('nlc_workflow_orders')
      .update(updateData)
      .eq('id', dto.order_id)
      .select('*, workflow:nlc_workflows(*)')
      .single();

    if (error) throw error;

    // If approved, send email with files to buyer
    if (dto.verified && data) {
      // Import dynamically to avoid circular dependency
      const { sendBuyerWorkflowFiles } = await import('../email-service');

      try {
        // Generate signed URLs for download
        const workflowFileUrl = await this.getSignedUrl('workflow-files', data.workflow_file || '');
        const docUrls: string[] = [];

        if (data.documentation_files && data.documentation_files.length > 0) {
          for (const docPath of data.documentation_files) {
            const url = await this.getSignedUrl('workflow-docs', docPath);
            docUrls.push(url);
          }
        }

        await sendBuyerWorkflowFiles({
          buyer_name: data.buyer_name,
          buyer_email: data.buyer_email,
          order_code: data.order_code,
          workflow_name: data.workflow?.workflow_name || '',
          workflow_description: data.workflow?.short_description || '',
          workflow_file_url: workflowFileUrl,
          documentation_urls: docUrls.join('\n\n'),
          download_expiry: '7 ngày',
          total_amount: data.total_amount.toLocaleString('vi-VN') + 'đ',
          confirmed_at: new Date().toLocaleString('vi-VN'),
        });

        // Mark files as sent
        await this.markFilesAsSent(data.id, {
          workflow_file: workflowFileUrl,
          documentation_files: docUrls,
        });

        console.log('✅ Buyer notification sent with files');
      } catch (emailError) {
        console.error('⚠️ Failed to send buyer email:', emailError);
        // Don't throw error - order is still verified
      }
    }

    return data as WorkflowOrder;
  },

  // Helper: Generate signed URL
  async getSignedUrl(bucket: string, filePath: string): Promise<string> {
    const { data, error } = await db.storage
      .from(bucket)
      .createSignedUrl(filePath, 7 * 24 * 60 * 60); // 7 days

    if (error) throw error;
    return data.signedUrl;
  },

  // Mark files as sent
  async markFilesAsSent(orderId: string, downloadLinks: any) {
    const { data, error } = await db
      .from('nlc_workflow_orders')
      .update({
        files_sent: true,
        files_sent_at: new Date().toISOString(),
        download_links: downloadLinks,
        download_links_expire_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        order_status: 'completed',
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as WorkflowOrder;
  },
};

// ============================================
// REVIEW MANAGEMENT
// ============================================

export const reviewApi = {
  // Get reviews for workflow
  async getWorkflowReviews(workflowId: string) {
    const { data, error } = await db
      .from('nlc_workflow_reviews')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('review_status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WorkflowReview[];
  },

  // Create review
  async createReview(dto: CreateReviewDTO) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: account } = await db
      .from('nlc_accounts')
      .select('full_name, email, avatar_url')
      .eq('user_id', user.id)
      .single();

    // Check if user purchased this workflow
    const { data: order } = await db
      .from('nlc_workflow_orders')
      .select('id')
      .eq('workflow_id', dto.workflow_id)
      .eq('buyer_user_id', user.id)
      .eq('order_status', 'completed')
      .single();

    const { data, error } = await db
      .from('nlc_workflow_reviews')
      .insert([{
        ...dto,
        reviewer_user_id: user.id,
        reviewer_name: account?.full_name || user.email || 'Anonymous',
        reviewer_email: account?.email || user.email || '',
        reviewer_avatar: account?.avatar_url,
        is_verified_purchase: !!order,
      }])
      .select()
      .single();

    if (error) throw error;

    // Update workflow avg rating
    await this.updateWorkflowRating(dto.workflow_id);

    return data as WorkflowReview;
  },

  // Update workflow average rating
  async updateWorkflowRating(workflowId: string) {
    const { data: reviews } = await db
      .from('nlc_workflow_reviews')
      .select('rating')
      .eq('workflow_id', workflowId)
      .eq('review_status', 'published');

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await db
        .from('nlc_workflows')
        .update({
          avg_rating: Math.round(avgRating * 10) / 10,
          review_count: reviews.length,
        })
        .eq('id', workflowId);
    }
  },
};

// ============================================
// STATS & ANALYTICS
// ============================================

export const statsApi = {
  // Get workflow stats (admin)
  async getWorkflowStats(): Promise<WorkflowStats> {
    // Get total workflows
    const { count: totalWorkflows } = await db
      .from('nlc_workflows')
      .select('*', { count: 'exact', head: true })
      .eq('workflow_status', 'published');

    // Get total orders and revenue
    const { data: orders } = await db
      .from('nlc_workflow_orders')
      .select('workflow_price, workflow_name, order_status, created_at')
      .eq('order_status', 'completed');

    const totalRevenue = orders?.reduce((sum, order) => sum + (order.workflow_price || 0), 0) || 0;
    const totalOrders = orders?.length || 0;

    // Get pending orders
    const { count: pendingOrders } = await db
      .from('nlc_workflow_orders')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'verifying');

    // Get top workflows
    const topWorkflows = Object.values(
      orders?.reduce((acc: any, order) => {
        if (!acc[order.workflow_name]) {
          acc[order.workflow_name] = {
            workflow_name: order.workflow_name,
            purchase_count: 0,
            revenue: 0,
          };
        }
        acc[order.workflow_name].purchase_count++;
        acc[order.workflow_name].revenue += order.workflow_price;
        return acc;
      }, {}) || {}
    ).sort((a: any, b: any) => b.purchase_count - a.purchase_count).slice(0, 5);

    return {
      total_workflows: totalWorkflows || 0,
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      pending_orders: pendingOrders || 0,
      completed_orders: totalOrders,
      top_workflows: topWorkflows as any,
      revenue_by_month: [], // TODO: Implement monthly revenue
    };
  },
};
