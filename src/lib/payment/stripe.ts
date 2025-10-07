/**
 * Stripe Direct Card Payment Integration
 * Visa/Mastercard payment implementation - READY FOR REAL TESTING
 * Includes commission system for partner revenue sharing
 */

import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardElement,
} from "@stripe/stripe-js";

// Stripe Configuration
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY:
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_your_key",
  SECRET_KEY: process.env.REACT_APP_STRIPE_SECRET_KEY || "sk_test_your_key",
  WEBHOOK_SECRET:
    process.env.REACT_APP_STRIPE_WEBHOOK_SECRET || "whsec_your_webhook_secret",
  CURRENCY: "usd",
  API_VERSION: "2023-10-16",
  RETURN_URL:
    process.env.REACT_APP_STRIPE_RETURN_URL ||
    "http://localhost:3000/payment/stripe/return",
  WEBHOOK_URL:
    process.env.REACT_APP_STRIPE_WEBHOOK_URL ||
    "http://localhost:3000/api/payment/stripe/webhook",
};

export interface StripeOrderInfo {
  orderId: string;
  amount: number; // Amount in cents
  currency?: string;
  orderDescription: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  metadata?: Record<string, string>;
  paymentMethodTypes?: string[];
}

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, string>;
}

export interface StripePaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details?: {
    name?: string;
    email?: string;
  };
}

// Commission System Types
export interface CommissionRate {
  id: string;
  platformRate: number; // Phần trăm hoa hồng cho nền tảng (0-100)
  partnerRate: number; // Phần trăm hoa hồng cho đối tác (0-100)
  minAmount: number; // Số tiền tối thiểu để áp dụng
  maxAmount?: number; // Số tiền tối đa để áp dụng
  category: "course" | "document" | "subscription" | "membership";
  isActive: boolean;
}

export interface CommissionTransaction {
  id: string;
  orderId: string;
  partnerId: string;
  platformId: string;
  grossAmount: number;
  platformCommission: number;
  partnerCommission: number;
  netAmount: number; // Số tiền thực tế đối tác nhận được
  status: "pending" | "paid" | "failed" | "refunded";
  createdAt: Date;
  paidAt?: Date;
}

// Commission Service Class
export class CommissionService {
  private defaultRates: CommissionRate[] = [
    {
      id: "course_default",
      platformRate: 15,
      partnerRate: 85,
      minAmount: 0,
      category: "course",
      isActive: true,
    },
    {
      id: "document_default",
      platformRate: 20,
      partnerRate: 80,
      minAmount: 0,
      category: "document",
      isActive: true,
    },
    {
      id: "subscription_default",
      platformRate: 10,
      partnerRate: 90,
      minAmount: 0,
      category: "subscription",
      isActive: true,
    },
    {
      id: "membership_default",
      platformRate: 25,
      partnerRate: 75,
      minAmount: 0,
      category: "membership",
      isActive: true,
    },
  ];

  /**
   * Tính toán hoa hồng cho một giao dịch
   */
  calculateCommission(
    amount: number,
    partnerId: string,
    category: "course" | "document" | "subscription" | "membership"
  ): {
    grossAmount: number;
    platformCommission: number;
    partnerCommission: number;
    netAmount: number;
  } {
    const commissionRate = this.getCommissionRate(partnerId, category);

    const platformCommission = (amount * commissionRate.platformRate) / 100;
    const partnerCommission = amount - platformCommission;

    return {
      grossAmount: amount,
      platformCommission,
      partnerCommission,
      netAmount: partnerCommission,
    };
  }

  /**
   * Lấy tỷ lệ hoa hồng
   */
  private getCommissionRate(
    partnerId: string,
    category: "course" | "document" | "subscription" | "membership"
  ): CommissionRate {
    // Trong thực tế, bạn sẽ query từ database
    // Hiện tại sử dụng default rates
    return (
      this.defaultRates.find(
        (rate) => rate.category === category && rate.isActive
      ) || this.defaultRates[0]
    );
  }

  /**
   * Tạo giao dịch hoa hồng
   */
  async createCommissionTransaction(
    orderId: string,
    partnerId: string,
    amount: number,
    category: "course" | "document" | "subscription" | "membership"
  ): Promise<CommissionTransaction> {
    const commission = this.calculateCommission(amount, partnerId, category);

    const transaction: CommissionTransaction = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      partnerId,
      platformId: "namlong_platform",
      grossAmount: commission.grossAmount,
      platformCommission: commission.platformCommission,
      partnerCommission: commission.partnerCommission,
      netAmount: commission.netAmount,
      status: "pending",
      createdAt: new Date(),
    };

    // TODO: Lưu vào database
    console.log("Commission transaction created:", transaction);

    return transaction;
  }

  /**
   * Cập nhật trạng thái hoa hồng
   */
  async updateCommissionStatus(
    orderId: string,
    status: "pending" | "paid" | "failed" | "refunded"
  ): Promise<void> {
    // TODO: Cập nhật database
    console.log(`Commission status updated for order ${orderId}: ${status}`);
  }

  /**
   * Lấy thống kê hoa hồng cho đối tác
   */
  async getPartnerCommissionStats(partnerId: string): Promise<{
    totalEarnings: number;
    totalCommission: number;
    pendingAmount: number;
    paidAmount: number;
    transactionCount: number;
  }> {
    // TODO: Query từ database
    return {
      totalEarnings: 0,
      totalCommission: 0,
      pendingAmount: 0,
      paidAmount: 0,
      transactionCount: 0,
    };
  }
}

class StripeService {
  private stripe: Stripe | null = null;
  private publishableKey: string;
  private secretKey: string;
  private webhookSecret: string;
  private commissionService: CommissionService;

  constructor() {
    this.publishableKey = STRIPE_CONFIG.PUBLISHABLE_KEY;
    this.secretKey = STRIPE_CONFIG.SECRET_KEY;
    this.webhookSecret = STRIPE_CONFIG.WEBHOOK_SECRET;
    this.commissionService = new CommissionService();
    this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    this.stripe = await loadStripe(this.publishableKey);
  }

  /**
   * Create Payment Intent for direct card payment
   */
  async createPaymentIntent(
    orderInfo: StripeOrderInfo
  ): Promise<StripePaymentIntent> {
    try {
      const response = await fetch(
        "/api/payment/stripe/create-payment-intent",
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: orderInfo.amount,
            currency: orderInfo.currency || STRIPE_CONFIG.CURRENCY,
            description: orderInfo.orderDescription,
            metadata: {
              order_id: orderInfo.orderId,
              ...orderInfo.metadata,
            },
            customer_email: orderInfo.customerEmail,
            customer_name: orderInfo.customerName,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Stripe API error: ${error.error?.message || "Unknown error"}`
        );
      }

      const paymentIntent = await response.json();
      return paymentIntent;
    } catch (error) {
      throw new Error(`Create payment intent failed: ${error}`);
    }
  }

  /**
   * Confirm payment with card
   */
  async confirmPayment(
    paymentIntentId: string,
    cardElement: StripeCardElement,
    customerEmail?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        paymentIntentId,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: customerEmail,
            },
          },
        }
      );

      if (error) {
        return {
          success: false,
          error: error.message || "Payment failed",
        };
      }

      if (paymentIntent?.status === "succeeded") {
        return { success: true };
      }

      return {
        success: false,
        error: "Payment was not successful",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment confirmation failed",
      };
    }
  }

  /**
   * Convert amount to cents (Stripe uses cents)
   */
  static convertToCents(amount: number, currency: string = "USD"): number {
    const zeroDecimalCurrencies = ["JPY", "KRW", "VND"];

    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return Math.round(amount);
    }

    return Math.round(amount * 100);
  }

  /**
   * Convert amount from cents
   */
  static convertFromCents(amount: number, currency: string = "USD"): number {
    const zeroDecimalCurrencies = ["JPY", "KRW", "VND"];

    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return amount;
    }

    return amount / 100;
  }

  /**
   * Get supported card brands
   */
  getSupportedCardBrands(): string[] {
    return [
      "visa",
      "mastercard",
      "amex",
      "discover",
      "diners",
      "jcb",
      "unionpay",
    ];
  }

  /**
   * Process payment with commission calculation
   */
  async processPaymentWithCommission(
    orderInfo: StripeOrderInfo,
    partnerInfo?: {
      partnerId: string;
      category: "course" | "document" | "subscription" | "membership";
    }
  ): Promise<{
    paymentIntent: StripePaymentIntent;
    commission?: CommissionTransaction;
  }> {
    // Create commission transaction if partner info provided
    let commission: CommissionTransaction | undefined;
    if (partnerInfo) {
      commission = await this.commissionService.createCommissionTransaction(
        orderInfo.orderId,
        partnerInfo.partnerId,
        orderInfo.amount,
        partnerInfo.category
      );
    }

    // Create payment intent
    const paymentIntent = await this.createPaymentIntent(orderInfo);

    return {
      paymentIntent,
      commission,
    };
  }

  /**
   * Get commission service instance
   */
  getCommissionService(): CommissionService {
    return this.commissionService;
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export const commissionService = new CommissionService();
export { StripeService };
export default stripeService;
