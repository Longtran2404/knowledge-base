/**
 * Order Management System
 * Handles order creation, tracking, and payment processing
 */

import { supabase } from "../supabase-config";
import { vnPayService } from "../payment/vnpay";
import { stripeService } from "../payment/stripe";

// Order Types
export type OrderStatus =
  | "pending" // Chờ thanh toán
  | "processing" // Đang xử lý thanh toán
  | "paid" // Đã thanh toán
  | "confirmed" // Đã xác nhận
  | "delivering" // Đang giao hàng (for physical products)
  | "delivered" // Đã giao hàng
  | "completed" // Hoàn thành
  | "cancelled" // Đã hủy
  | "refunded" // Đã hoàn tiền
  | "failed"; // Thất bại

export type PaymentMethod = "vnpay" | "momo" | "bank_transfer" | "cash";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export interface OrderItem {
  id: string;
  type: "course" | "product" | "service";
  refId: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  discount?: number;
  metadata?: Record<string, any>;
}

export interface ShippingInfo {
  recipientName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  notes?: string;
  shippingFee: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  transactionId?: string;
  shippingInfo?: ShippingInfo;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface CreateOrderData {
  items: Omit<OrderItem, "id">[];
  shippingInfo?: Omit<ShippingInfo, "shippingFee">;
  discountCode?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface PaymentRequest {
  orderId: string;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

class OrderManager {
  /**
   * Create new order
   */
  async createOrder(
    userId: string,
    orderData: CreateOrderData
  ): Promise<Order> {
    try {
      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Calculate pricing
      const pricing = await this.calculatePricing(
        orderData.items,
        orderData.discountCode
      );

      // Calculate shipping fee if needed
      let shippingInfo: ShippingInfo | undefined;
      if (orderData.shippingInfo) {
        const shippingFee = await this.calculateShippingFee(
          orderData.items,
          orderData.shippingInfo
        );
        shippingInfo = {
          ...orderData.shippingInfo,
          shippingFee,
        };
      }

      // Create order object
      const order: Order = {
        id: "", // Will be set by database
        orderNumber,
        userId,
        items: orderData.items.map((item) => ({
          ...item,
          id: this.generateItemId(),
        })),
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shippingFee: shippingInfo?.shippingFee || 0,
        tax: pricing.tax,
        total: pricing.total + (shippingInfo?.shippingFee || 0),
        currency: "VND",
        status: "pending",
        paymentStatus: "pending",
        shippingInfo,
        notes: orderData.notes,
        metadata: orderData.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to database
      const { data, error } = await (supabase as any)
        .from("orders")
        .insert([order])
        .select()
        .single();

      if (error) throw error;

      return data as Order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string, userId?: string): Promise<Order | null> {
    try {
      let query = supabase.from("orders").select("*").eq("id", orderId);

      if (userId) {
        query = query.eq("userId", userId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") return null; // No rows found
        throw error;
      }

      return data as Order;
    } catch (error) {
      throw new Error(`Failed to get order: ${error}`);
    }
  }

  /**
   * Get user orders with pagination
   */
  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus
  ): Promise<{ orders: Order[]; total: number }> {
    try {
      let query = (supabase as any)
        .from("orders")
        .select("*", { count: "exact" })
        .eq("userId", userId)
        .order("createdAt", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error, count } = await query.range(
        (page - 1) * limit,
        page * limit - 1
      );

      if (error) throw error;

      return {
        orders: data as Order[],
        total: count || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get user orders: ${error}`);
    }
  }

  /**
   * Create payment request
   */
  async createPayment(paymentRequest: PaymentRequest): Promise<{
    paymentUrl?: string;
    qrCode?: string;
    paymentReference: string;
  }> {
    try {
      const order = await this.getOrder(paymentRequest.orderId);
      if (!order) throw new Error("Order not found");

      if (order.status !== "pending") {
        throw new Error("Order is not in pending status");
      }

      let paymentResponse;
      let paymentReference = "";

      switch (paymentRequest.paymentMethod) {
        case "vnpay":
          const vnpayResponse = await vnPayService.createPaymentUrl({
            orderId: order.orderNumber,
            amount: order.total,
            orderDescription: `Thanh toán đơn hàng ${order.orderNumber}`,
            customerEmail: paymentRequest.customerInfo?.email,
            customerName: paymentRequest.customerInfo?.name,
          });

          paymentResponse = {
            paymentUrl: vnpayResponse.paymentUrl,
            paymentReference: vnpayResponse.transactionRef,
          };
          paymentReference = vnpayResponse.transactionRef;
          break;

        case "momo":
          const stripeResponse = await stripeService.createPaymentIntent({
            orderId: order.orderNumber,
            amount: order.total,
            currency: "USD",
            orderDescription: `Thanh toán đơn hàng ${order.orderNumber}`,
            customerEmail: paymentRequest.customerInfo?.email,
            customerName: paymentRequest.customerInfo?.name,
            customerPhone: paymentRequest.customerInfo?.phone,
          });

          if (stripeResponse.status !== "requires_payment_method") {
            throw new Error(`Stripe payment failed: ${stripeResponse.status}`);
          }

          paymentResponse = {
            paymentUrl: `#stripe-payment-${stripeResponse.id}`,
            paymentReference: stripeResponse.id,
          };
          paymentReference = stripeResponse.id;
          break;

        default:
          throw new Error("Unsupported payment method");
      }

      // Update order with payment reference
      await this.updateOrder(order.id, {
        status: "processing",
        paymentStatus: "processing",
        paymentMethod: paymentRequest.paymentMethod,
        paymentReference,
        updatedAt: new Date().toISOString(),
      });

      return paymentResponse;
    } catch (error) {
      throw new Error(`Failed to create payment: ${error}`);
    }
  }

  /**
   * Update order status
   */
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from("orders")
        .update(updateData as any)
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;

      return data as Order;
    } catch (error) {
      throw new Error(`Failed to update order: ${error}`);
    }
  }

  /**
   * Confirm payment (webhook handler)
   */
  async confirmPayment(
    orderId: string,
    transactionId: string,
    paymentMethod: PaymentMethod
  ): Promise<Order> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) throw new Error("Order not found");

      const updates: Partial<Order> = {
        status: "paid",
        paymentStatus: "completed",
        transactionId,
        paidAt: new Date().toISOString(),
      };

      // Auto-confirm digital products
      const hasOnlyDigitalItems = order.items.every(
        (item) => item.type === "course" || item.type === "service"
      );

      if (hasOnlyDigitalItems) {
        updates.status = "completed";
        updates.completedAt = new Date().toISOString();
      }

      return await this.updateOrder(order.id, updates);
    } catch (error) {
      throw new Error(`Failed to confirm payment: ${error}`);
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) throw new Error("Order not found");

      if (["paid", "completed", "cancelled"].includes(order.status)) {
        throw new Error("Cannot cancel order in current status");
      }

      return await this.updateOrder(orderId, {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        notes: reason
          ? `${order.notes || ""}\nCancellation reason: ${reason}`.trim()
          : order.notes,
      });
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error}`);
    }
  }

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");

    return `NLC${year}${month}${day}${random}`;
  }

  /**
   * Generate item ID
   */
  private generateItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate order pricing
   */
  private async calculatePricing(
    items: Omit<OrderItem, "id">[],
    discountCode?: string
  ): Promise<{
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  }> {
    const subtotal = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    let discount = 0;
    if (discountCode) {
      // Apply discount logic here
      discount = await this.calculateDiscount(subtotal, discountCode);
    }

    const taxRate = 0.1; // 10% VAT
    const taxableAmount = subtotal - discount;
    const tax = Math.round(taxableAmount * taxRate);

    const total = subtotal - discount + tax;

    return {
      subtotal,
      discount,
      tax,
      total,
    };
  }

  /**
   * Calculate shipping fee
   */
  private async calculateShippingFee(
    items: Omit<OrderItem, "id">[],
    shippingInfo: Omit<ShippingInfo, "shippingFee">
  ): Promise<number> {
    // Simple shipping calculation
    // In real app, integrate with shipping providers
    const hasPhysicalItems = items.some((item) => item.type === "product");

    if (!hasPhysicalItems) return 0;

    // Base shipping fee by city
    const cityRates: Record<string, number> = {
      "Hà Nội": 30000,
      "TP. Hồ Chí Minh": 30000,
      "Đà Nẵng": 40000,
    };

    return cityRates[shippingInfo.city] || 50000;
  }

  /**
   * Calculate discount
   */
  private async calculateDiscount(
    subtotal: number,
    discountCode: string
  ): Promise<number> {
    try {
      // Query discount codes from database
      const { data, error } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", discountCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) return 0;

      const discount = data as {
        type: "percentage" | "fixed";
        value: number;
        min_amount?: number;
        max_discount?: number;
      };

      if (discount.min_amount && subtotal < discount.min_amount) {
        return 0;
      }

      let discountAmount = 0;
      if (discount.type === "percentage") {
        discountAmount = Math.round((subtotal * discount.value) / 100);
        if (discount.max_discount && discountAmount > discount.max_discount) {
          discountAmount = discount.max_discount;
        }
      } else {
        discountAmount = discount.value;
      }

      return Math.min(discountAmount, subtotal);
    } catch (error) {
      console.error("Failed to calculate discount:", error);
      return 0;
    }
  }
}

// Export singleton instance
export const orderManager = new OrderManager();
export default orderManager;
