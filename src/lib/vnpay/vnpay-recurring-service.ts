/**
 * VNPay Recurring Payment Service
 * Dịch vụ thanh toán định kỳ với VNPay cho subscription
 */

import { VNPayService, VNPayPaymentRequest, createVNPayService } from './vnpay-service';
import { SubscriptionService, SubscriptionData, PaymentHistoryData, AutoPaymentData } from '../subscription/subscription-service';

export interface RecurringPaymentSetupRequest {
  subscriptionId: string;
  amount: number;
  planType: 'premium' | 'partner';
  userInfo: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RecurringPaymentResult {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
  data?: any;
}

export interface TokenizeCardRequest {
  amount: number;
  orderInfo: string;
  returnUrl: string;
  userInfo: {
    id: string;
    email: string;
    name: string;
  };
}

export class VNPayRecurringService {
  private vnpayService: VNPayService;

  constructor() {
    this.vnpayService = createVNPayService();
  }

  /**
   * Tạo link thanh toán để lưu thẻ cho subscription (tokenization)
   */
  async setupRecurringPayment(request: RecurringPaymentSetupRequest): Promise<RecurringPaymentResult> {
    try {
      // Tạo payment record trong database
      const paymentData: Omit<PaymentHistoryData, 'id'> = {
        subscription_id: request.subscriptionId,
        user_id: request.userInfo.id,
        amount: request.amount,
        currency: 'VND',
        payment_method: 'vnpay',
        payment_type: request.planType === 'premium' ? 'subscription' : 'one_time',
        status: 'pending',
        description: `Thanh toán ${request.planType === 'premium' ? 'subscription' : 'một lần'} - ${request.planType}`,
        metadata: {
          setupRecurring: request.planType === 'premium',
          planType: request.planType
        }
      };

      const { data: payment, error: paymentError } = await SubscriptionService.createPaymentHistory(paymentData);

      if (paymentError || !payment) {
        return {
          success: false,
          error: 'Không thể tạo payment record'
        };
      }

      // Tạo transaction reference
      const txnRef = `${request.planType.toUpperCase()}_${payment.id}_${Date.now()}`;

      // Lấy IP address
      const ipAddr = await VNPayService.getClientIP();

      // Tạo VNPay payment request
      const vnpayRequest: VNPayPaymentRequest = {
        amount: request.amount,
        orderInfo: `Nam Long Center - ${request.planType === 'premium' ? 'Premium Subscription' : 'Partner Package'}`,
        orderType: request.planType === 'premium' ? 'subscription' : 'other',
        txnRef: txnRef,
        ipAddr: ipAddr,
        locale: 'vn'
      };

      // Nếu là premium (recurring), thêm parameter cho tokenization
      if (request.planType === 'premium') {
        // VNPay sẽ lưu thông tin thẻ để tái sử dụng
        vnpayRequest.bankCode = 'INTCARD'; // Thẻ quốc tế để hỗ trợ tokenization
      }

      const result = this.vnpayService.createPaymentUrl(vnpayRequest);

      if (result.error) {
        // Cập nhật payment status thành failed
        await SubscriptionService.updatePaymentStatus(payment.id!, 'failed');

        return {
          success: false,
          error: result.error
        };
      }

      // Cập nhật payment với transaction reference
      await SubscriptionService.updatePaymentStatus(payment.id!, 'pending', {
        transaction_id: txnRef
      });

      return {
        success: true,
        paymentUrl: result.paymentUrl,
        transactionId: txnRef,
        data: {
          paymentId: payment.id,
          subscriptionId: request.subscriptionId
        }
      };

    } catch (error) {
      console.error('Setup recurring payment error:', error);
      return {
        success: false,
        error: 'Lỗi hệ thống khi tạo thanh toán'
      };
    }
  }

  /**
   * Xử lý kết quả thanh toán và lưu thông tin thẻ (nếu thành công)
   */
  async handlePaymentReturn(vnpParams: Record<string, string>): Promise<RecurringPaymentResult> {
    try {
      // Verify VNPay signature
      const isValid = this.vnpayService.verifyReturnUrl(vnpParams);

      if (!isValid) {
        return {
          success: false,
          error: 'Chữ ký VNPay không hợp lệ'
        };
      }

      const responseCode = vnpParams.vnp_ResponseCode;
      const txnRef = vnpParams.vnp_TxnRef;
      const vnpTransactionNo = vnpParams.vnp_TransactionNo;
      const amount = parseInt(vnpParams.vnp_Amount) / 100; // VNPay amount is in VND * 100

      // Tìm payment record
      const paymentId = this.extractPaymentIdFromTxnRef(txnRef);

      if (!paymentId) {
        return {
          success: false,
          error: 'Không tìm thấy thông tin thanh toán'
        };
      }

      if (responseCode === '00') {
        // Thanh toán thành công
        await SubscriptionService.updatePaymentStatus(paymentId, 'completed', {
          vnpay_transaction_no: vnpTransactionNo,
          gateway_response: vnpParams
        });

        // Nếu có thông tin tokenization từ VNPay, lưu vào auto_payments
        if (vnpParams.vnp_CardType && vnpParams.vnp_PayDate) {
          await this.savePaymentMethod(paymentId, vnpParams);
        }

        // Cập nhật subscription status
        await this.updateSubscriptionAfterPayment(paymentId);

        return {
          success: true,
          transactionId: vnpTransactionNo,
          data: {
            paymentId: paymentId,
            amount: amount
          }
        };

      } else {
        // Thanh toán thất bại
        await SubscriptionService.updatePaymentStatus(paymentId, 'failed', {
          vnpay_transaction_no: vnpTransactionNo,
          gateway_response: vnpParams,
          failure_reason: this.getVNPayErrorMessage(responseCode)
        });

        return {
          success: false,
          error: this.getVNPayErrorMessage(responseCode)
        };
      }

    } catch (error) {
      console.error('Handle payment return error:', error);
      return {
        success: false,
        error: 'Lỗi xử lý kết quả thanh toán'
      };
    }
  }

  /**
   * Lưu thông tin thẻ để sử dụng cho auto-renewal
   */
  private async savePaymentMethod(paymentId: string, vnpParams: Record<string, string>): Promise<void> {
    try {
      // Lấy thông tin payment để biết user_id và subscription_id
      // (Trong thực tế, bạn sẽ cần query database để lấy thông tin này)

      // Mock data - trong thực tế sẽ query từ payment_history table
      const paymentInfo = {
        user_id: 'user-id-from-payment',
        subscription_id: 'subscription-id-from-payment'
      };

      // Tạo token giả định (VNPay sẽ cung cấp token thực)
      const paymentMethodToken = `VNPAY_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const autoPaymentData: Omit<AutoPaymentData, 'id'> = {
        user_id: paymentInfo.user_id,
        subscription_id: paymentInfo.subscription_id,
        payment_method_token: paymentMethodToken,
        card_last_4: vnpParams.vnp_CardType?.slice(-4) || '',
        card_brand: this.getCardBrand(vnpParams.vnp_CardType || ''),
        is_active: true,
        is_default: true,
        gateway_customer_id: vnpParams.vnp_TmnCode,
        gateway_payment_method_id: vnpParams.vnp_TransactionNo,
        metadata: {
          vnpay_card_type: vnpParams.vnp_CardType,
          vnpay_bank_code: vnpParams.vnp_BankCode,
          created_from_payment: paymentId
        }
      };

      await SubscriptionService.saveAutoPaymentMethod(autoPaymentData);

    } catch (error) {
      console.error('Save payment method error:', error);
    }
  }

  /**
   * Cập nhật subscription status sau khi thanh toán thành công
   */
  private async updateSubscriptionAfterPayment(paymentId: string): Promise<void> {
    try {
      // Trong thực tế, bạn sẽ cần query payment_history để lấy subscription_id
      // Sau đó cập nhật subscription status thành 'active' và thiết lập ngày hết hạn

      // Mock implementation
      console.log('Updating subscription after successful payment:', paymentId);

    } catch (error) {
      console.error('Update subscription after payment error:', error);
    }
  }

  /**
   * Thực hiện thanh toán định kỳ (auto-renewal)
   */
  async processRecurringPayment(subscriptionId: string): Promise<RecurringPaymentResult> {
    try {
      // Lấy thông tin subscription
      const subscription = await this.getSubscriptionById(subscriptionId);
      if (!subscription) {
        return {
          success: false,
          error: 'Subscription không tồn tại'
        };
      }

      // Lấy default payment method
      const { data: paymentMethod } = await SubscriptionService.getUserDefaultPaymentMethod(subscription.user_id);
      if (!paymentMethod) {
        return {
          success: false,
          error: 'Không tìm thấy phương thức thanh toán'
        };
      }

      // Tạo payment record cho renewal
      const paymentData: Omit<PaymentHistoryData, 'id'> = {
        subscription_id: subscriptionId,
        user_id: subscription.user_id,
        amount: subscription.amount,
        currency: 'VND',
        payment_method: 'vnpay',
        payment_type: 'renewal',
        status: 'pending',
        description: `Auto-renewal - ${subscription.plan_type}`,
        metadata: {
          autoRenewal: true,
          paymentMethodId: paymentMethod.id
        }
      };

      const { data: payment } = await SubscriptionService.createPaymentHistory(paymentData);
      if (!payment) {
        return {
          success: false,
          error: 'Không thể tạo payment record'
        };
      }

      // Thực hiện thanh toán với saved token
      // (Trong thực tế, bạn sẽ gọi VNPay API để charge từ saved token)
      const chargeResult = await this.chargeFromSavedCard(paymentMethod, subscription.amount);

      if (chargeResult.success) {
        // Cập nhật payment status
        await SubscriptionService.updatePaymentStatus(payment.id!, 'completed', {
          vnpay_transaction_no: chargeResult.transactionId,
          gateway_response: chargeResult.data
        });

        // Renew subscription
        await SubscriptionService.renewSubscription(subscriptionId);

        return {
          success: true,
          transactionId: chargeResult.transactionId
        };
      } else {
        // Thanh toán thất bại
        await SubscriptionService.updatePaymentStatus(payment.id!, 'failed', {
          failure_reason: chargeResult.error
        });

        return {
          success: false,
          error: chargeResult.error
        };
      }

    } catch (error) {
      console.error('Process recurring payment error:', error);
      return {
        success: false,
        error: 'Lỗi xử lý thanh toán định kỳ'
      };
    }
  }

  /**
   * Charge từ saved card (mock implementation)
   */
  private async chargeFromSavedCard(paymentMethod: AutoPaymentData, amount: number): Promise<any> {
    // Mock implementation - trong thực tế sẽ gọi VNPay API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;

        if (success) {
          resolve({
            success: true,
            transactionId: `VNPAY_AUTO_${Date.now()}`,
            data: {
              amount: amount,
              currency: 'VND',
              method: 'saved_card'
            }
          });
        } else {
          resolve({
            success: false,
            error: 'Thẻ bị từ chối'
          });
        }
      }, 1000);
    });
  }

  /**
   * Helper methods
   */
  private extractPaymentIdFromTxnRef(txnRef: string): string | null {
    // Extract payment ID from transaction reference
    // Format: PREMIUM_paymentId_timestamp or PARTNER_paymentId_timestamp
    const parts = txnRef.split('_');
    return parts.length >= 2 ? parts[1] : null;
  }

  private getCardBrand(cardType: string): string {
    if (cardType.startsWith('4')) return 'Visa';
    if (cardType.startsWith('5')) return 'MasterCard';
    return 'Unknown';
  }

  private getVNPayErrorMessage(responseCode: string): string {
    const errorMessages: Record<string, string> = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
      '24': 'Khách hàng hủy giao dịch',
    };

    return errorMessages[responseCode] || `Giao dịch thất bại (Mã lỗi: ${responseCode})`;
  }

  private async getSubscriptionById(subscriptionId: string): Promise<SubscriptionData | null> {
    // Mock implementation - trong thực tế sẽ query từ database
    return null;
  }
}

export const createVNPayRecurringService = () => new VNPayRecurringService();