/**
 * Refund Management System
 * Handles refund processing for VNPay and Stripe payments
 */

import { supabase } from '../supabase-config';
import { stripeService } from './stripe';
import { vnPayService } from './vnpay';
import { logger } from '../logger/logger';
import { ErrorHandler, AppError } from '../errors/app-error';

// Type helper for NLC tables
const nlc = (supabase as any);

export interface RefundRequest {
  orderId: string;
  amount: number;
  reason: string;
  userId: string;
  requestedBy: string; // 'customer' | 'admin'
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  status: 'pending' | 'completed' | 'failed';
  message: string;
  transactionId?: string;
}

export class RefundManager {
  /**
   * Process refund for an order
   */
  async processRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      logger.info('Processing refund request', {
        orderId: request.orderId,
        amount: request.amount,
        reason: request.reason,
      });

      // 1. Validate refund eligibility
      const eligibility = await this.checkRefundEligibility(request.orderId);
      if (!eligibility.eligible) {
        throw new AppError('PAYMENT_ERROR', eligibility.reason || 'Not eligible for refund', {
          statusCode: 400,
          context: { orderId: request.orderId },
        });
      }

      // 2. Get order details
      const order = await this.getOrderDetails(request.orderId);
      if (!order) {
        throw new AppError('NOT_FOUND', 'Order not found', {
          statusCode: 404,
          context: { orderId: request.orderId },
        });
      }

      // 3. Process refund based on payment method
      let refundResult: RefundResult;

      if (order.payment_method === 'stripe') {
        refundResult = await this.processStripeRefund(order, request);
      } else if (order.payment_method === 'vnpay') {
        refundResult = await this.processVNPayRefund(order, request);
      } else {
        throw new AppError('PAYMENT_ERROR', 'Unsupported payment method', {
          context: { paymentMethod: order.payment_method },
        });
      }

      // 4. Update order status
      await this.updateOrderStatus(request.orderId, 'refunded', refundResult.refundId);

      // 5. Update commission records (reverse commission)
      if (order.commission_transaction_id) {
        await this.reverseCommission(order.commission_transaction_id, request.amount);
      }

      // 6. Send notification
      await this.sendRefundNotification(request.userId, refundResult);

      // 7. Log activity
      await this.logRefundActivity(request, refundResult);

      logger.info('Refund processed successfully', {
        orderId: request.orderId,
        refundId: refundResult.refundId,
        amount: refundResult.amount,
      });

      return refundResult;
    } catch (error: any) {
      const appError = ErrorHandler.handlePaymentError(error, {
        operation: 'processRefund',
        orderId: request.orderId,
      });
      logger.error('Refund processing failed', appError, {
        orderId: request.orderId,
      });
      throw appError;
    }
  }

  /**
   * Check if order is eligible for refund
   */
  private async checkRefundEligibility(orderId: string): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    const { data: order, error } = await nlc
      .from('nlc_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !order) {
      return { eligible: false, reason: 'Order not found' };
    }

    // Check order status
    if (order.order_status === 'refunded') {
      return { eligible: false, reason: 'Already refunded' };
    }

    if (order.order_status === 'cancelled') {
      return { eligible: false, reason: 'Order is cancelled' };
    }

    if (order.order_status !== 'completed' && order.order_status !== 'paid') {
      return { eligible: false, reason: 'Order not completed yet' };
    }

    // Check refund window (e.g., 30 days)
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    const REFUND_WINDOW_DAYS = 30;
    if (daysSinceOrder > REFUND_WINDOW_DAYS) {
      return {
        eligible: false,
        reason: `Refund window expired (${REFUND_WINDOW_DAYS} days)`
      };
    }

    return { eligible: true };
  }

  /**
   * Get order details
   */
  private async getOrderDetails(orderId: string): Promise<any> {
    const { data, error } = await nlc
      .from('nlc_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      throw ErrorHandler.handleSupabaseError(error, { orderId });
    }

    return data;
  }

  /**
   * Process Stripe refund
   */
  private async processStripeRefund(
    order: any,
    request: RefundRequest
  ): Promise<RefundResult> {
    try {
      // Call Stripe API to create refund
      const response = await fetch('/api/payment/stripe/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: order.payment_intent_id,
          amount: request.amount * 100, // Convert to cents
          reason: request.reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Stripe refund failed');
      }

      const refundData = await response.json();

      return {
        success: true,
        refundId: refundData.id,
        amount: request.amount,
        status: refundData.status === 'succeeded' ? 'completed' : 'pending',
        message: 'Refund processed successfully',
        transactionId: refundData.id,
      };
    } catch (error: any) {
      logger.error('Stripe refund failed', error, {
        orderId: order.order_id,
      });
      return {
        success: false,
        status: 'failed',
        message: error.message || 'Refund processing failed',
      };
    }
  }

  /**
   * Process VNPay refund
   */
  private async processVNPayRefund(
    order: any,
    request: RefundRequest
  ): Promise<RefundResult> {
    try {
      // VNPay refund requires backend API call
      const response = await fetch('/api/payment/vnpay/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_ref: order.transaction_ref,
          amount: request.amount,
          transaction_date: order.payment_date,
          reason: request.reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'VNPay refund failed');
      }

      const refundData = await response.json();

      return {
        success: true,
        refundId: refundData.refund_id,
        amount: request.amount,
        status: refundData.response_code === '00' ? 'completed' : 'pending',
        message: refundData.message || 'Refund processed successfully',
        transactionId: refundData.transaction_no,
      };
    } catch (error: any) {
      logger.error('VNPay refund failed', error, {
        orderId: order.order_id,
      });
      return {
        success: false,
        status: 'failed',
        message: error.message || 'Refund processing failed',
      };
    }
  }

  /**
   * Update order status
   */
  private async updateOrderStatus(
    orderId: string,
    status: string,
    refundId?: string
  ): Promise<void> {
    const { error } = await nlc
      .from('nlc_orders')
      .update({
        order_status: status,
        refund_id: refundId,
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    if (error) {
      throw ErrorHandler.handleSupabaseError(error, { orderId });
    }
  }

  /**
   * Reverse commission for refunded order
   */
  private async reverseCommission(
    commissionTransactionId: string,
    refundAmount: number
  ): Promise<void> {
    const { error } = await nlc
      .from('commission_transactions')
      .update({
        status: 'refunded',
        refund_amount: refundAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commissionTransactionId);

    if (error) {
      logger.error('Failed to reverse commission', error, {
        commissionTransactionId,
      });
      // Don't throw - commission reversal is not critical for refund
    }
  }

  /**
   * Send refund notification to user
   */
  private async sendRefundNotification(
    userId: string,
    refundResult: RefundResult
  ): Promise<void> {
    await nlc.from('nlc_notifications').insert({
      user_id: userId,
      notification_type: 'refund_processed',
      title: 'Hoàn tiền thành công',
      message: `Đơn hàng của bạn đã được hoàn tiền ${refundResult.amount?.toLocaleString('vi-VN')} VNĐ`,
      is_read: false,
      notification_priority: 'high',
      metadata: {
        refund_id: refundResult.refundId,
        amount: refundResult.amount,
        status: refundResult.status,
      },
    });
  }

  /**
   * Log refund activity
   */
  private async logRefundActivity(
    request: RefundRequest,
    result: RefundResult
  ): Promise<void> {
    await nlc.from('nlc_activity_log').insert({
      user_id: request.userId,
      activity_type: 'refund_processed',
      activity_description: `Refund processed: ${request.amount.toLocaleString('vi-VN')} VNĐ`,
      resource_type: 'order',
      resource_id: request.orderId,
      metadata: {
        refund_id: result.refundId,
        amount: request.amount,
        reason: request.reason,
        status: result.status,
        requested_by: request.requestedBy,
      },
    });
  }

  /**
   * Get refund history for a user
   */
  async getRefundHistory(userId: string): Promise<any[]> {
    const { data, error } = await nlc
      .from('nlc_orders')
      .select('*')
      .eq('user_id', userId)
      .eq('order_status', 'refunded')
      .order('refunded_at', { ascending: false });

    if (error) {
      throw ErrorHandler.handleSupabaseError(error, { userId });
    }

    return data || [];
  }

  /**
   * Get refund statistics
   */
  async getRefundStats(startDate?: string, endDate?: string): Promise<{
    total_refunds: number;
    total_amount: number;
    avg_refund_amount: number;
    refund_rate: number;
  }> {
    let query = nlc
      .from('nlc_orders')
      .select('total_amount, order_status');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw ErrorHandler.handleSupabaseError(error);
    }

    const totalOrders = data?.length || 0;
    const refundedOrders = data?.filter((o) => o.order_status === 'refunded') || [];
    const totalRefunds = refundedOrders.length;
    const totalAmount = refundedOrders.reduce((sum, o) => sum + o.total_amount, 0);

    return {
      total_refunds: totalRefunds,
      total_amount: totalAmount,
      avg_refund_amount: totalRefunds > 0 ? totalAmount / totalRefunds : 0,
      refund_rate: totalOrders > 0 ? (totalRefunds / totalOrders) * 100 : 0,
    };
  }
}

// Export singleton instance
export const refundManager = new RefundManager();