/**
 * Supabase Real-time Subscriptions
 * Real-time updates for orders, notifications, and live data
 */

import { supabase } from '../supabase-config';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export interface OrderUpdatePayload {
  eventType: RealtimeEventType;
  new: any;
  old: any;
  table: string;
  timestamp: string;
}

export interface NotificationPayload {
  id: string;
  userId: string;
  type: 'order_status' | 'payment_success' | 'payment_failed' | 'system' | 'promotion';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

class SupabaseRealtime {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, RealtimeSubscription> = new Map();

  /**
   * Subscribe to order updates for a specific user
   */
  subscribeToOrderUpdates(
    userId: string,
    callback: (payload: OrderUpdatePayload) => void
  ): RealtimeSubscription {
    const channelId = `orders:${userId}`;

    if (this.subscriptions.has(channelId)) {
      console.warn(`Already subscribed to orders for user ${userId}`);
      return this.subscriptions.get(channelId)!;
    }

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          callback({
            eventType: payload.eventType as RealtimeEventType,
            new: payload.new,
            old: payload.old,
            table: 'orders',
            timestamp: new Date().toISOString(),
          });
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelId);
        this.subscriptions.delete(channelId);
      },
    };

    this.channels.set(channelId, channel);
    this.subscriptions.set(channelId, subscription);

    return subscription;
  }

  /**
   * Subscribe to notifications for a specific user
   */
  subscribeToNotifications(
    userId: string,
    callback: (payload: NotificationPayload) => void
  ): RealtimeSubscription {
    const channelId = `notifications:${userId}`;

    if (this.subscriptions.has(channelId)) {
      console.warn(`Already subscribed to notifications for user ${userId}`);
      return this.subscriptions.get(channelId)!;
    }

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.new) {
            callback(payload.new as NotificationPayload);
          }
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelId);
        this.subscriptions.delete(channelId);
      },
    };

    this.channels.set(channelId, channel);
    this.subscriptions.set(channelId, subscription);

    return subscription;
  }

  /**
   * Subscribe to payment status updates
   */
  subscribeToPaymentUpdates(
    orderId: string,
    callback: (payload: OrderUpdatePayload) => void
  ): RealtimeSubscription {
    const channelId = `payment:${orderId}`;

    if (this.subscriptions.has(channelId)) {
      console.warn(`Already subscribed to payments for order ${orderId}`);
      return this.subscriptions.get(channelId)!;
    }

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Only trigger if payment status or status changed
          if (
            payload.new?.payment_status !== payload.old?.payment_status ||
            payload.new?.status !== payload.old?.status
          ) {
            callback({
              eventType: 'UPDATE',
              new: payload.new,
              old: payload.old,
              table: 'orders',
              timestamp: new Date().toISOString(),
            });
          }
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelId);
        this.subscriptions.delete(channelId);
      },
    };

    this.channels.set(channelId, channel);
    this.subscriptions.set(channelId, subscription);

    return subscription;
  }

  /**
   * Subscribe to live course/product updates
   */
  subscribeToContentUpdates(
    contentType: 'courses' | 'products' | 'resources',
    callback: (payload: any) => void
  ): RealtimeSubscription {
    const channelId = `content:${contentType}`;

    if (this.subscriptions.has(channelId)) {
      console.warn(`Already subscribed to ${contentType} updates`);
      return this.subscriptions.get(channelId)!;
    }

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: contentType,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          callback({
            eventType: payload.eventType as RealtimeEventType,
            new: payload.new,
            old: payload.old,
            table: contentType,
            timestamp: new Date().toISOString(),
          });
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelId);
        this.subscriptions.delete(channelId);
      },
    };

    this.channels.set(channelId, channel);
    this.subscriptions.set(channelId, subscription);

    return subscription;
  }

  /**
   * Subscribe to admin dashboard updates
   */
  subscribeToAdminUpdates(
    adminUserId: string,
    callback: (payload: any) => void
  ): RealtimeSubscription {
    const channelId = `admin:${adminUserId}`;

    if (this.subscriptions.has(channelId)) {
      console.warn(`Already subscribed to admin updates for user ${adminUserId}`);
      return this.subscriptions.get(channelId)!;
    }

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          callback({
            type: 'order_update',
            eventType: payload.eventType as RealtimeEventType,
            new: payload.new,
            old: payload.old,
            table: 'orders',
            timestamp: new Date().toISOString(),
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'users',
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          callback({
            type: 'new_user',
            eventType: 'INSERT',
            new: payload.new,
            table: 'users',
            timestamp: new Date().toISOString(),
          });
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelId);
        this.subscriptions.delete(channelId);
      },
    };

    this.channels.set(channelId, channel);
    this.subscriptions.set(channelId, subscription);

    return subscription;
  }

  /**
   * Send real-time notification to user
   */
  async sendNotification(
    userId: string,
    notification: Omit<NotificationPayload, 'id' | 'createdAt' | 'isRead'>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Failed to get unread notification count:', error);
      return 0;
    }
  }

  /**
   * Broadcast custom event to specific channel
   */
  async broadcastEvent(
    channelId: string,
    event: string,
    payload: any
  ): Promise<void> {
    const channel = this.channels.get(channelId);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    } else {
      console.warn(`Channel ${channelId} not found`);
    }
  }

  /**
   * Subscribe to custom broadcast events
   */
  subscribeToBroadcastEvents(
    channelId: string,
    event: string,
    callback: (payload: any) => void
  ): RealtimeSubscription {
    const subscriptionId = `broadcast:${channelId}:${event}`;

    if (this.subscriptions.has(subscriptionId)) {
      console.warn(`Already subscribed to broadcast event ${event} on channel ${channelId}`);
      return this.subscriptions.get(subscriptionId)!;
    }

    const channel = supabase
      .channel(channelId)
      .on('broadcast', { event }, (payload) => {
        callback(payload);
      })
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelId);
        this.subscriptions.delete(subscriptionId);
      },
    };

    this.channels.set(channelId, channel);
    this.subscriptions.set(subscriptionId, subscription);

    return subscription;
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Unsubscribe from specific subscription
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): string {
    return supabase.realtime.isConnected() ? 'connected' : 'disconnected';
  }
}

// Export singleton instance
export const supabaseRealtime = new SupabaseRealtime();
export default supabaseRealtime;