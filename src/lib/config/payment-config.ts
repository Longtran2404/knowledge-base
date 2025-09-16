/**
 * Payment Configuration
 * Centralized configuration for payment gateways
 */

export interface PaymentGatewayConfig {
  enabled: boolean;
  testMode: boolean;
  credentials: {
    [key: string]: string;
  };
  endpoints: {
    [key: string]: string;
  };
  fees?: {
    percentage: number;
    fixed: number;
  };
}

export interface PaymentConfig {
  vnpay: PaymentGatewayConfig;
  momo: PaymentGatewayConfig;
  general: {
    currency: string;
    taxRate: number;
    defaultShippingFee: number;
    minOrderAmount: number;
    maxOrderAmount: number;
  };
}

// Default configuration
export const defaultPaymentConfig: PaymentConfig = {
  vnpay: {
    enabled: true,
    testMode: process.env.NODE_ENV === 'development',
    credentials: {
      tmnCode: process.env.REACT_APP_VNPAY_TMN_CODE || '',
      hashSecret: process.env.REACT_APP_VNPAY_HASH_SECRET || '',
    },
    endpoints: {
      gateway: process.env.REACT_APP_VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      api: process.env.REACT_APP_VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
      returnUrl: process.env.REACT_APP_VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay/return',
    },
    fees: {
      percentage: 0,
      fixed: 0,
    },
  },
  momo: {
    enabled: true,
    testMode: process.env.NODE_ENV === 'development',
    credentials: {
      partnerCode: process.env.REACT_APP_MOMO_PARTNER_CODE || '',
      accessKey: process.env.REACT_APP_MOMO_ACCESS_KEY || '',
      secretKey: process.env.REACT_APP_MOMO_SECRET_KEY || '',
    },
    endpoints: {
      gateway: process.env.REACT_APP_MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api',
      returnUrl: process.env.REACT_APP_MOMO_RETURN_URL || 'http://localhost:3000/payment/momo/return',
      notifyUrl: process.env.REACT_APP_MOMO_NOTIFY_URL || 'http://localhost:3000/api/payment/momo/notify',
    },
    fees: {
      percentage: 0,
      fixed: 0,
    },
  },
  general: {
    currency: 'VND',
    taxRate: 0.1, // 10% VAT
    defaultShippingFee: 30000, // 30,000 VND
    minOrderAmount: 10000, // 10,000 VND
    maxOrderAmount: 50000000, // 50,000,000 VND
  },
};

/**
 * Get payment configuration
 */
export function getPaymentConfig(): PaymentConfig {
  // In a real app, this could load from database or remote config
  return defaultPaymentConfig;
}

/**
 * Validate payment configuration
 */
export function validatePaymentConfig(config: PaymentConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate VNPay
  if (config.vnpay.enabled) {
    if (!config.vnpay.credentials.tmnCode) {
      errors.push('VNPay TMN Code is required');
    }
    if (!config.vnpay.credentials.hashSecret) {
      errors.push('VNPay Hash Secret is required');
    }
    if (!config.vnpay.endpoints.gateway) {
      errors.push('VNPay Gateway URL is required');
    }
  }

  // Validate MoMo
  if (config.momo.enabled) {
    if (!config.momo.credentials.partnerCode) {
      errors.push('MoMo Partner Code is required');
    }
    if (!config.momo.credentials.accessKey) {
      errors.push('MoMo Access Key is required');
    }
    if (!config.momo.credentials.secretKey) {
      errors.push('MoMo Secret Key is required');
    }
  }

  // Validate general settings
  if (config.general.taxRate < 0 || config.general.taxRate > 1) {
    errors.push('Tax rate must be between 0 and 1');
  }
  if (config.general.minOrderAmount < 0) {
    errors.push('Minimum order amount must be positive');
  }
  if (config.general.maxOrderAmount <= config.general.minOrderAmount) {
    errors.push('Maximum order amount must be greater than minimum');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get available payment methods based on order amount and configuration
 */
export function getAvailablePaymentMethods(orderAmount: number): PaymentMethod[] {
  const config = getPaymentConfig();
  const methods: PaymentMethod[] = [];

  // Check if order amount is within limits
  if (orderAmount < config.general.minOrderAmount) {
    return methods; // No methods available for orders below minimum
  }

  if (orderAmount > config.general.maxOrderAmount) {
    return methods; // No methods available for orders above maximum
  }

  // Add enabled payment methods
  if (config.vnpay.enabled) {
    methods.push('vnpay');
  }

  if (config.momo.enabled) {
    methods.push('momo');
  }

  return methods;
}

export type PaymentMethod = 'vnpay' | 'momo' | 'bank_transfer' | 'cash';

/**
 * Calculate payment fees for different methods
 */
export function calculatePaymentFees(
  amount: number,
  method: PaymentMethod
): { fee: number; total: number } {
  const config = getPaymentConfig();
  let fee = 0;

  switch (method) {
    case 'vnpay':
      if (config.vnpay.fees) {
        fee = (amount * config.vnpay.fees.percentage) + config.vnpay.fees.fixed;
      }
      break;
    case 'momo':
      if (config.momo.fees) {
        fee = (amount * config.momo.fees.percentage) + config.momo.fees.fixed;
      }
      break;
    default:
      fee = 0;
  }

  return {
    fee: Math.round(fee),
    total: Math.round(amount + fee),
  };
}