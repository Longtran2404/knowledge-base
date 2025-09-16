import { supabase } from "../lib/supabase";
import { EnhancedAuth } from "./enhanced-auth";

export interface MonitoringResult {
  processed: number;
  downgraded: number;
  errors: number;
}

export class SubscriptionMonitor {
  /**
   * Check all active subscriptions for overdue payments
   */
  static async checkMonthlyPayments(): Promise<MonitoringResult> {
    const result: MonitoringResult = {
      processed: 0,
      downgraded: 0,
      errors: 0,
    };

    try {
      // Get all active subscriptions that are past their period end
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active")
        .lt("current_period_end", new Date().toISOString());

      if (error) {
        console.error("Error fetching subscriptions:", error);
        result.errors++;
        return result;
      }

      if (!subscriptions || subscriptions.length === 0) {
        return result;
      }

      for (const subscription of subscriptions) {
        try {
          result.processed++;

          const gracePeriodDays = subscription.grace_period_days || 7;
          const periodEnd = new Date(subscription.current_period_end);
          const gracePeriod = new Date(
            periodEnd.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000
          );

          const now = new Date();

          if (now > gracePeriod) {
            // Downgrade to free plan
            await EnhancedAuth.downgradeToFree(subscription.user_id);
            result.downgraded++;

            console.log(
              `User ${subscription.user_id} downgraded due to overdue payment`
            );
          }
        } catch (error) {
          console.error(
            `Error processing subscription ${subscription.id}:`,
            error
          );
          result.errors++;
        }
      }

      return result;
    } catch (error) {
      console.error("Monthly payment check error:", error);
      result.errors++;
      return result;
    }
  }

  /**
   * Start automatic monitoring (runs every hour)
   */
  static startMonitoring(): () => void {
    console.log("Starting subscription monitoring...");

    // Run immediately
    this.checkMonthlyPayments();

    // Set up interval to run every hour
    const intervalId = setInterval(() => {
      this.checkMonthlyPayments();
    }, 60 * 60 * 1000); // 1 hour

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      console.log("Subscription monitoring stopped");
    };
  }

  /**
   * Check specific user's subscription
   */
  static async checkUserSubscription(userId: string): Promise<boolean> {
    try {
      const subscriptionStatus = await EnhancedAuth.checkSubscriptionStatus(
        userId
      );
      return subscriptionStatus ? subscriptionStatus.isActive : false;
    } catch (error) {
      console.error(`Error checking subscription for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get subscription statistics
   */
  static async getSubscriptionStats(): Promise<{
    totalActive: number;
    totalOverdue: number;
    totalFree: number;
  }> {
    try {
      const { data: activeSubscriptions } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("status", "active");

      const { data: overdueSubscriptions } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("status", "past_due");

      const { data: freeAccounts } = await supabase
        .from("account_nam_long_center")
        .select("user_id")
        .eq("plan", "free");

      return {
        totalActive: activeSubscriptions?.length || 0,
        totalOverdue: overdueSubscriptions?.length || 0,
        totalFree: freeAccounts?.length || 0,
      };
    } catch (error) {
      console.error("Error getting subscription stats:", error);
      return {
        totalActive: 0,
        totalOverdue: 0,
        totalFree: 0,
      };
    }
  }

  /**
   * Send payment reminders
   */
  static async sendPaymentReminders(): Promise<void> {
    try {
      // Get subscriptions expiring in 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const { data: expiringSubscriptions } = await supabase
        .from("subscriptions")
        .select("*, account_nam_long_center(email, full_name)")
        .eq("status", "active")
        .lte("current_period_end", threeDaysFromNow.toISOString());

      if (expiringSubscriptions) {
        for (const subscription of expiringSubscriptions) {
          // TODO: Implement email reminder
          console.log(
            `Sending payment reminder to ${subscription.account_nam_long_center?.email}`
          );
        }
      }
    } catch (error) {
      console.error("Error sending payment reminders:", error);
    }
  }
}
