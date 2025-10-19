/**
 * CMS API Service
 * Handles payment methods, site content, and admin operations
 */

import { supabase } from '../supabase-config';
import type {
  PaymentMethod,
  CreatePaymentMethodDTO,
  UpdatePaymentMethodDTO,
  SiteContent,
  CreateSiteContentDTO,
  UpdateSiteContentDTO,
  AdminAuditLog,
  PageContent,
} from '../../types/cms';

// Type-safe wrapper to bypass Supabase type generation issues
const db = supabase as any;

// =============================================
// Payment Methods API
// =============================================

export const paymentMethodsApi = {
  /**
   * Get all active payment methods
   */
  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await db
      .from('nlc_payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as PaymentMethod[];
  },

  /**
   * Get all payment methods (admin only)
   */
  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await db
      .from('nlc_payment_methods')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as PaymentMethod[];
  },

  /**
   * Get payment method by ID
   */
  async getPaymentMethodById(id: string): Promise<PaymentMethod> {
    const { data, error } = await db
      .from('nlc_payment_methods')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as PaymentMethod;
  },

  /**
   * Create new payment method
   */
  async createPaymentMethod(dto: CreatePaymentMethodDTO): Promise<PaymentMethod> {
    const { data, error } = await db
      .from('nlc_payment_methods')
      .insert({
        ...dto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as PaymentMethod;
  },

  /**
   * Update payment method
   */
  async updatePaymentMethod(dto: UpdatePaymentMethodDTO): Promise<PaymentMethod> {
    const { id, ...updates } = dto;
    const { data, error } = await db
      .from('nlc_payment_methods')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PaymentMethod;
  },

  /**
   * Delete payment method
   */
  async deletePaymentMethod(id: string): Promise<void> {
    const { error } = await db
      .from('nlc_payment_methods')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Toggle payment method active status
   */
  async togglePaymentMethod(id: string, is_active: boolean): Promise<PaymentMethod> {
    const { data, error } = await db
      .from('nlc_payment_methods')
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PaymentMethod;
  },
};

// =============================================
// Site Content API (CMS)
// =============================================

export const siteContentApi = {
  /**
   * Get all active site content
   */
  async getAllSiteContent(): Promise<SiteContent[]> {
    const { data, error } = await db
      .from('nlc_site_content')
      .select('*')
      .eq('is_active', true)
      .order('page_key, section_key, display_order');

    if (error) throw error;
    return data as SiteContent[];
  },

  /**
   * Get content by page key
   */
  async getContentByPage(page_key: string): Promise<SiteContent[]> {
    const { data, error } = await db
      .from('nlc_site_content')
      .select('*')
      .eq('page_key', page_key)
      .eq('is_active', true)
      .order('section_key, display_order');

    if (error) throw error;
    return data as SiteContent[];
  },

  /**
   * Get content by page and section
   */
  async getContentByPageAndSection(
    page_key: string,
    section_key: string
  ): Promise<SiteContent[]> {
    const { data, error } = await db
      .from('nlc_site_content')
      .select('*')
      .eq('page_key', page_key)
      .eq('section_key', section_key)
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data as SiteContent[];
  },

  /**
   * Get structured page content (grouped by sections)
   */
  async getPageContent(page_key: string): Promise<PageContent> {
    const contents = await this.getContentByPage(page_key);

    const pageContent: PageContent = {
      page_key,
      sections: {},
    };

    contents.forEach((content) => {
      if (!pageContent.sections[content.section_key]) {
        pageContent.sections[content.section_key] = {};
      }
      pageContent.sections[content.section_key][content.content_key] = {
        value: content.content_value,
        type: content.content_type,
        metadata: content.metadata,
      };
    });

    return pageContent;
  },

  /**
   * Get single content item
   */
  async getContentItem(
    page_key: string,
    section_key: string,
    content_key: string
  ): Promise<SiteContent | null> {
    const { data, error } = await db
      .from('nlc_site_content')
      .select('*')
      .eq('page_key', page_key)
      .eq('section_key', section_key)
      .eq('content_key', content_key)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as SiteContent | null;
  },

  /**
   * Create site content
   */
  async createSiteContent(dto: CreateSiteContentDTO): Promise<SiteContent> {
    const { data: { user } } = await db.auth.getUser();

    const { data, error } = await db
      .from('nlc_site_content')
      .insert({
        ...dto,
        created_by: user?.id,
        updated_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as SiteContent;
  },

  /**
   * Update site content
   */
  async updateSiteContent(dto: UpdateSiteContentDTO): Promise<SiteContent> {
    const { data: { user } } = await db.auth.getUser();
    const { id, ...updates } = dto;

    const { data, error } = await db
      .from('nlc_site_content')
      .update({
        ...updates,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SiteContent;
  },

  /**
   * Delete site content
   */
  async deleteSiteContent(id: string): Promise<void> {
    const { error } = await db
      .from('nlc_site_content')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Bulk update content items
   */
  async bulkUpdateContent(items: UpdateSiteContentDTO[]): Promise<SiteContent[]> {
    const { data: { user } } = await db.auth.getUser();

    const updates = items.map(async (item) => {
      const { id, ...updates } = item;
      return db
        .from('nlc_site_content')
        .update({
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
    });

    const results = await Promise.all(updates);
    const data = results.map(r => r.data).filter(Boolean);

    return data as SiteContent[];
  },
};

// =============================================
// Admin Audit Log API
// =============================================

export const adminAuditApi = {
  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters?: {
    admin_user_id?: string;
    resource_type?: string;
    resource_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AdminAuditLog[]; total: number }> {
    let query = db
      .from('nlc_admin_audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.admin_user_id) {
      query = query.eq('admin_user_id', filters.admin_user_id);
    }

    if (filters?.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }

    if (filters?.resource_id) {
      query = query.eq('resource_id', filters.resource_id);
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      logs: data as AdminAuditLog[],
      total: count || 0,
    };
  },

  /**
   * Get recent admin activity
   */
  async getRecentActivity(limit: number = 20): Promise<AdminAuditLog[]> {
    const { data, error } = await db
      .from('nlc_admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as AdminAuditLog[];
  },
};

// Export all APIs
export const cmsApi = {
  paymentMethods: paymentMethodsApi,
  siteContent: siteContentApi,
  auditLog: adminAuditApi,
};
