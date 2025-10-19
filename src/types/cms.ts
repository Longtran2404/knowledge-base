/**
 * CMS Types for Dynamic Content Management
 */

export interface PaymentMethod {
  id: string;
  method_type: 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay' | 'paypal';
  method_name: string;
  account_holder: string;
  account_number: string;
  bank_name?: string;
  qr_code_url?: string;
  instructions?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodDTO {
  method_type: 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay' | 'paypal';
  method_name: string;
  account_holder: string;
  account_number: string;
  bank_name?: string;
  qr_code_url?: string;
  instructions?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdatePaymentMethodDTO extends Partial<CreatePaymentMethodDTO> {
  id: string;
}

export interface SiteContent {
  id: string;
  page_key: string;
  section_key: string;
  content_key: string;
  content_value: string;
  content_type: 'text' | 'html' | 'markdown' | 'image_url' | 'json';
  metadata?: Record<string, any>;
  is_active: boolean;
  display_order: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteContentDTO {
  page_key: string;
  section_key: string;
  content_key: string;
  content_value: string;
  content_type?: 'text' | 'html' | 'markdown' | 'image_url' | 'json';
  metadata?: Record<string, any>;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateSiteContentDTO extends Partial<CreateSiteContentDTO> {
  id: string;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  resource_type: string;
  resource_id?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Grouped content structure for easier rendering
export interface PageContent {
  page_key: string;
  sections: {
    [section_key: string]: {
      [content_key: string]: {
        value: string;
        type: string;
        metadata?: Record<string, any>;
      };
    };
  };
}
