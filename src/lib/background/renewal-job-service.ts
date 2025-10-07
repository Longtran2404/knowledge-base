/**
 * Subscription Renewal Background Job Service
 * Dịch vụ xử lý auto-renewal subscription trong background
 */

import { SubscriptionService, SubscriptionData } from '../subscription/subscription-service';
import { createVNPayRecurringService, VNPayRecurringService } from '../vnpay/vnpay-recurring-service';

export interface RenewalJobConfig {
  checkIntervalMs: number; // Interval để check renewal (mặc định 1 giờ)
  daysBeforeExpiry: number; // Số ngày trước khi hết hạn để bắt đầu renewal
  maxRetryAttempts: number; // Số lần retry khi payment fail
  retryDelayMs: number; // Delay giữa các lần retry
}

export interface RenewalJobResult {
  totalChecked: number;
  successfulRenewals: number;
  failedRenewals: number;
  skippedRenewals: number;
  errors: string[];
}

export class RenewalJobService {
  private vnpayService: VNPayRecurringService;
  private config: RenewalJobConfig;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config?: Partial<RenewalJobConfig>) {
    this.vnpayService = createVNPayRecurringService();
    this.config = {
      checkIntervalMs: 60 * 60 * 1000, // 1 hour
      daysBeforeExpiry: 3,
      maxRetryAttempts: 3,
      retryDelayMs: 5 * 60 * 1000, // 5 minutes
      ...config
    };
  }

  /**
   * Bắt đầu background job để check renewal định kỳ
   */
  startRenewalJob(): void {
    if (this.isRunning) {
      console.log('Renewal job is already running');
      return;
    }

    console.log('Starting subscription renewal background job...');
    this.isRunning = true;

    // Chạy ngay lập tức
    this.runRenewalCheck();

    // Thiết lập interval
    this.intervalId = setInterval(() => {
      this.runRenewalCheck();
    }, this.config.checkIntervalMs);
  }

  /**
   * Dừng background job
   */
  stopRenewalJob(): void {
    if (!this.isRunning) {
      console.log('Renewal job is not running');
      return;
    }

    console.log('Stopping subscription renewal background job...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Chạy một lần check renewal (có thể gọi manual)
   */
  async runRenewalCheck(): Promise<RenewalJobResult> {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Starting renewal check...`);

    const result: RenewalJobResult = {
      totalChecked: 0,
      successfulRenewals: 0,
      failedRenewals: 0,
      skippedRenewals: 0,
      errors: []
    };

    try {
      // Lấy các subscription cần renewal
      const { data: subscriptions, error } = await SubscriptionService.getSubscriptionsForRenewal(this.config.daysBeforeExpiry);

      if (error) {
        result.errors.push(`Failed to fetch subscriptions: ${error.message || error}`);
        return result;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('No subscriptions due for renewal');
        return result;
      }

      result.totalChecked = subscriptions.length;
      console.log(`Found ${subscriptions.length} subscriptions due for renewal`);

      // Xử lý từng subscription
      for (const subscription of subscriptions) {
        try {
          const renewalResult = await this.processSubscriptionRenewal(subscription);

          if (renewalResult.success) {
            result.successfulRenewals++;
            console.log(`✅ Renewed subscription ${subscription.id} successfully`);
          } else {
            result.failedRenewals++;
            result.errors.push(`Failed to renew ${subscription.id}: ${renewalResult.error}`);
            console.error(`❌ Failed to renew subscription ${subscription.id}: ${renewalResult.error}`);
          }
        } catch (error: any) {
          result.failedRenewals++;
          result.errors.push(`Exception renewing ${subscription.id}: ${error.message}`);
          console.error(`💥 Exception renewing subscription ${subscription.id}:`, error);
        }

        // Delay giữa các renewal để tránh overload
        await this.sleep(1000);
      }

    } catch (error: any) {
      result.errors.push(`Renewal check failed: ${error.message}`);
      console.error('Renewal check failed:', error);
    }

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Renewal check completed in ${duration}ms:`, {
      total: result.totalChecked,
      success: result.successfulRenewals,
      failed: result.failedRenewals,
      skipped: result.skippedRenewals,
      errors: result.errors.length
    });

    return result;
  }

  /**
   * Xử lý renewal cho một subscription cụ thể
   */
  private async processSubscriptionRenewal(subscription: SubscriptionData): Promise<{ success: boolean; error?: string }> {
    try {
      // Kiểm tra điều kiện renewal
      if (subscription.status !== 'active') {
        return { success: false, error: 'Subscription is not active' };
      }

      if (!subscription.auto_renewal) {
        return { success: false, error: 'Auto-renewal is disabled' };
      }

      if (subscription.billing_cycle === 'one_time') {
        return { success: false, error: 'One-time subscription does not need renewal' };
      }

      // Kiểm tra có phương thức thanh toán không
      const { data: paymentMethod } = await SubscriptionService.getUserDefaultPaymentMethod(subscription.user_id);

      if (!paymentMethod || !paymentMethod.is_active) {
        // Disable auto-renewal nếu không có payment method
        await SubscriptionService.updateSubscription(subscription.id!, {
          auto_renewal: false,
          metadata: {
            ...subscription.metadata,
            auto_renewal_disabled_reason: 'No active payment method',
            auto_renewal_disabled_at: new Date().toISOString()
          }
        });

        return { success: false, error: 'No active payment method found' };
      }

      // Thực hiện renewal payment
      const paymentResult = await this.vnpayService.processRecurringPayment(subscription.id!);

      if (paymentResult.success) {
        // Tạo renewal record
        await SubscriptionService.createSubscriptionRenewal(subscription.id!);

        // Log success
        await this.logRenewalEvent(subscription.id!, 'success', {
          transactionId: paymentResult.transactionId,
          amount: subscription.amount,
          paymentMethod: paymentMethod.id
        });

        return { success: true };
      } else {
        // Handle renewal failure
        await this.handleRenewalFailure(subscription, paymentResult.error || 'Unknown payment error');

        return { success: false, error: paymentResult.error };
      }

    } catch (error: any) {
      await this.handleRenewalFailure(subscription, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Xử lý khi renewal thất bại
   */
  private async handleRenewalFailure(subscription: SubscriptionData, errorMessage: string): Promise<void> {
    try {
      // Log failure
      await this.logRenewalEvent(subscription.id!, 'failed', {
        error: errorMessage,
        attemptTime: new Date().toISOString()
      });

      // Tính toán retry logic
      const currentAttempts = this.getRenewalAttempts(subscription);

      if (currentAttempts >= this.config.maxRetryAttempts) {
        // Quá số lần retry, disable auto-renewal
        await SubscriptionService.updateSubscription(subscription.id!, {
          auto_renewal: false,
          status: 'suspended',
          metadata: {
            ...subscription.metadata,
            renewal_failed: true,
            renewal_failure_reason: errorMessage,
            max_retry_reached: true,
            suspended_at: new Date().toISOString()
          }
        });

        // Gửi notification cho user (có thể implement sau)
        await this.notifyRenewalFailure(subscription, 'max_retry_reached');

      } else {
        // Schedule retry
        const nextRetryTime = new Date(Date.now() + this.config.retryDelayMs);

        await SubscriptionService.updateSubscription(subscription.id!, {
          metadata: {
            ...subscription.metadata,
            renewal_retry_count: currentAttempts + 1,
            next_retry_time: nextRetryTime.toISOString(),
            last_renewal_error: errorMessage
          }
        });

        console.log(`Scheduled retry for subscription ${subscription.id} at ${nextRetryTime.toISOString()}`);
      }

    } catch (error) {
      console.error('Failed to handle renewal failure:', error);
    }
  }

  /**
   * Lấy số lần đã retry renewal
   */
  private getRenewalAttempts(subscription: SubscriptionData): number {
    return subscription.metadata?.renewal_retry_count || 0;
  }

  /**
   * Log renewal event (success hoặc failure)
   */
  private async logRenewalEvent(subscriptionId: string, type: 'success' | 'failed', data: any): Promise<void> {
    try {
      // Có thể implement logging vào database hoặc external service
      console.log(`[RENEWAL_${type.toUpperCase()}] Subscription ${subscriptionId}:`, data);

      // Ví dụ: lưu vào renewal_logs table (nếu có)
      // await supabase.from('renewal_logs').insert({
      //   subscription_id: subscriptionId,
      //   event_type: type,
      //   data: data,
      //   created_at: new Date().toISOString()
      // });

    } catch (error) {
      console.error('Failed to log renewal event:', error);
    }
  }

  /**
   * Gửi notification cho user khi renewal thất bại
   */
  private async notifyRenewalFailure(subscription: SubscriptionData, reason: string): Promise<void> {
    try {
      // Implement notification logic (email, push notification, etc.)
      console.log(`[NOTIFICATION] Renewal failed for subscription ${subscription.id}, reason: ${reason}`);

      // Ví dụ: gửi email
      // await emailService.sendRenewalFailureNotification(subscription.user_id, {
      //   subscriptionId: subscription.id,
      //   reason: reason,
      //   actionRequired: true
      // });

    } catch (error) {
      console.error('Failed to send renewal failure notification:', error);
    }
  }

  /**
   * Utility function để sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Kiểm tra trạng thái của job
   */
  getJobStatus(): { isRunning: boolean; config: RenewalJobConfig } {
    return {
      isRunning: this.isRunning,
      config: this.config
    };
  }

  /**
   * Cập nhật config của job
   */
  updateConfig(newConfig: Partial<RenewalJobConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Renewal job config updated:', this.config);
  }
}

// Singleton instance cho global usage
let globalRenewalJobService: RenewalJobService | null = null;

/**
 * Lấy hoặc tạo instance global của RenewalJobService
 */
export const getRenewalJobService = (config?: Partial<RenewalJobConfig>): RenewalJobService => {
  if (!globalRenewalJobService) {
    globalRenewalJobService = new RenewalJobService(config);
  }
  return globalRenewalJobService;
};

/**
 * Bắt đầu background renewal job
 */
export const startGlobalRenewalJob = (config?: Partial<RenewalJobConfig>): void => {
  const service = getRenewalJobService(config);
  service.startRenewalJob();
};

/**
 * Dừng background renewal job
 */
export const stopGlobalRenewalJob = (): void => {
  if (globalRenewalJobService) {
    globalRenewalJobService.stopRenewalJob();
  }
};