/**
 * Payment Webhook Handler
 * Handles payment confirmations from VNPay and MoMo gateways
 */

import { vnPayService } from './vnpay';
import { momoService } from './momo';
import { orderManager } from '../order/order-manager';
import { invoiceGenerator } from '../invoice/invoice-generator';
import { supabase } from '../supabase-config';

export interface WebhookResponse {
  success: boolean;
  message: string;
  orderId?: string;
  transactionId?: string;
}

export interface VNPayWebhookData {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_SecureHashType: string;
}

export interface MoMoWebhookData {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

class WebhookHandler {
  /**
   * Handle VNPay payment confirmation
   */
  async handleVNPayWebhook(webhookData: VNPayWebhookData): Promise<WebhookResponse> {
    try {
      console.log('Processing VNPay webhook:', webhookData.vnp_TxnRef);

      // Verify the webhook signature
      const verification = vnPayService.verifyReturn(webhookData);

      if (!verification.isValid) {
        console.error('VNPay webhook signature verification failed');
        return {
          success: false,
          message: 'Chữ ký không hợp lệ',
        };
      }

      if (!verification.isSuccess) {
        console.warn('VNPay payment failed:', verification.message);

        // Update order status to failed
        await this.updateOrderStatus(verification.orderId, 'failed', {
          paymentStatus: 'failed',
          notes: `VNPay payment failed: ${verification.message}`,
        });

        return {
          success: true,
          message: verification.message,
          orderId: verification.orderId,
        };
      }

      // Payment successful - update order
      const updatedOrder = await orderManager.confirmPayment(
        verification.orderId,
        verification.transactionNo || webhookData.vnp_TransactionNo,
        'vnpay'
      );

      // Generate invoice for successful payment
      if (updatedOrder.status === 'paid' || updatedOrder.status === 'completed') {
        await this.generateInvoiceForOrder(updatedOrder.id);
      }

      // Send confirmation email/SMS (implement as needed)
      await this.sendPaymentConfirmation(updatedOrder.id, 'vnpay');

      console.log('VNPay payment confirmed successfully:', updatedOrder.id);

      return {
        success: true,
        message: 'Thanh toán VNPay thành công',
        orderId: verification.orderId,
        transactionId: verification.transactionNo,
      };

    } catch (error) {
      console.error('VNPay webhook processing failed:', error);
      return {
        success: false,
        message: `Lỗi xử lý webhook VNPay: ${error}`,
      };
    }
  }

  /**
   * Handle MoMo payment confirmation
   */
  async handleMoMoWebhook(webhookData: MoMoWebhookData): Promise<WebhookResponse> {
    try {
      console.log('Processing MoMo webhook:', webhookData.orderId);

      // Verify the webhook signature
      const verification = momoService.verifyCallback(webhookData);

      if (!verification.isValid) {
        console.error('MoMo webhook signature verification failed');
        return {
          success: false,
          message: 'Chữ ký không hợp lệ',
        };
      }

      if (!verification.isSuccess) {
        console.warn('MoMo payment failed:', verification.message);

        // Update order status to failed
        await this.updateOrderStatus(verification.orderId, 'failed', {
          paymentStatus: 'failed',
          notes: `MoMo payment failed: ${verification.message}`,
        });

        return {
          success: true,
          message: verification.message,
          orderId: verification.orderId,
        };
      }

      // Payment successful - update order
      const updatedOrder = await orderManager.confirmPayment(
        verification.orderId,
        verification.transactionId?.toString() || webhookData.transId.toString(),
        'momo'
      );

      // Generate invoice for successful payment
      if (updatedOrder.status === 'paid' || updatedOrder.status === 'completed') {
        await this.generateInvoiceForOrder(updatedOrder.id);
      }

      // Send confirmation email/SMS (implement as needed)
      await this.sendPaymentConfirmation(updatedOrder.id, 'momo');

      console.log('MoMo payment confirmed successfully:', updatedOrder.id);

      return {
        success: true,
        message: 'Thanh toán MoMo thành công',
        orderId: verification.orderId,
        transactionId: verification.transactionId?.toString(),
      };

    } catch (error) {
      console.error('MoMo webhook processing failed:', error);
      return {
        success: false,
        message: `Lỗi xử lý webhook MoMo: ${error}`,
      };
    }
  }

  /**
   * Handle payment return (user redirected back to site)
   */
  async handlePaymentReturn(
    gateway: 'vnpay' | 'momo',
    returnData: any
  ): Promise<WebhookResponse> {
    try {
      if (gateway === 'vnpay') {
        return await this.handleVNPayWebhook(returnData as VNPayWebhookData);
      } else if (gateway === 'momo') {
        return await this.handleMoMoWebhook(returnData as MoMoWebhookData);
      } else {
        throw new Error('Unsupported payment gateway');
      }
    } catch (error) {
      console.error('Payment return handling failed:', error);
      return {
        success: false,
        message: `Lỗi xử lý payment return: ${error}`,
      };
    }
  }

  /**
   * Update order status with additional data
   */
  private async updateOrderStatus(
    orderId: string,
    status: any,
    additionalData: Record<string, any> = {}
  ): Promise<void> {
    try {
      await orderManager.updateOrder(orderId, {
        status,
        ...additionalData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }

  /**
   * Generate invoice for paid order
   */
  private async generateInvoiceForOrder(orderId: string): Promise<void> {
    try {
      const order = await orderManager.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found for invoice generation');
      }

      // Get customer info from order or database
      const customerInfo = await this.getCustomerInfo(order.userId);

      if (customerInfo) {
        const invoice = invoiceGenerator.createInvoiceFromOrder(order, customerInfo);

        // Save invoice to database
        await this.saveInvoice(invoice);

        console.log('Invoice generated successfully:', invoice.invoiceNumber);
      }
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      // Don't throw - invoice generation shouldn't block payment confirmation
    }
  }

  /**
   * Get customer information for invoice
   */
  private async getCustomerInfo(userId: string): Promise<any> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('full_name, email, phone, address')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        name: profile.full_name || 'N/A',
        email: profile.email || 'N/A',
        phone: profile.phone,
        address: profile.address,
      };
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }

  /**
   * Save invoice to database
   */
  private async saveInvoice(invoice: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('invoices')
        .insert([invoice]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save invoice:', error);
      throw error;
    }
  }

  /**
   * Send payment confirmation notification
   */
  private async sendPaymentConfirmation(
    orderId: string,
    gateway: 'vnpay' | 'momo'
  ): Promise<void> {
    try {
      // This would integrate with email service, SMS service, etc.
      // For now, just log the event
      console.log(`Payment confirmation sent for order ${orderId} via ${gateway}`);

      // TODO: Implement actual notification sending
      // - Email confirmation with invoice
      // - SMS notification
      // - Push notification (if mobile app)
      // - Webhook to external systems

    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      // Don't throw - notification failure shouldn't block payment processing
    }
  }

  /**
   * Verify webhook authenticity by checking request origin
   */
  verifyWebhookOrigin(origin: string, gateway: 'vnpay' | 'momo'): boolean {
    const allowedOrigins = {
      vnpay: [
        'sandbox.vnpayment.vn',
        'vnpayment.vn',
        '127.0.0.1', // For testing
      ],
      momo: [
        'payment.momo.vn',
        'test-payment.momo.vn',
        '127.0.0.1', // For testing
      ],
    };

    const allowed = allowedOrigins[gateway];
    return allowed.some(allowedOrigin => origin.includes(allowedOrigin));
  }

  /**
   * Log webhook activity for audit trail
   */
  async logWebhookActivity(
    gateway: 'vnpay' | 'momo',
    orderId: string,
    status: 'success' | 'failed' | 'invalid',
    data: any
  ): Promise<void> {
    try {
      const logEntry = {
        gateway,
        order_id: orderId,
        status,
        webhook_data: data,
        processed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('webhook_logs')
        .insert([logEntry]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to log webhook activity:', error);
      // Don't throw - logging failure shouldn't block processing
    }
  }
}

// Export singleton instance
export const webhookHandler = new WebhookHandler();
export default webhookHandler;