/**
 * Advanced Analytics Service
 * Enterprise-grade analytics and tracking
 *
 * Features:
 * - Google Analytics 4
 * - Mixpanel for product analytics
 * - PostHog for user behavior
 * - Sentry for error tracking
 * - Custom event tracking
 * - A/B testing support
 * - Conversion funnel tracking
 */

import posthog from 'posthog-js';
import mixpanel from 'mixpanel-browser';
import * as Sentry from '@sentry/react';
import { logger } from '../../lib/logger/logger';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

export interface UserProfile {
  userId: string;
  email?: string;
  name?: string;
  subscriptionPlan?: string;
  signupDate?: Date;
  totalRevenue?: number;
  properties?: Record<string, any>;
}

export interface ConversionFunnel {
  name: string;
  steps: Array<{
    step: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
}

class AnalyticsService {
  private initialized = false;
  private userId: string | null = null;

  /**
   * Initialize all analytics providers
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize PostHog
      if (process.env.REACT_APP_POSTHOG_KEY) {
        posthog.init(process.env.REACT_APP_POSTHOG_KEY, {
          api_host: process.env.REACT_APP_POSTHOG_HOST || 'https://app.posthog.com',
          autocapture: true,
          capture_pageview: true,
          capture_pageleave: true,
          session_recording: {
            recordCrossOriginIframes: true,
          },
        });
        logger.info('PostHog initialized');
      }

      // Initialize Mixpanel
      if (process.env.REACT_APP_MIXPANEL_TOKEN) {
        mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN, {
          debug: process.env.NODE_ENV === 'development',
          track_pageview: true,
          persistence: 'localStorage',
        });
        logger.info('Mixpanel initialized');
      }

      // Initialize Sentry for error tracking
      if (process.env.REACT_APP_SENTRY_DSN) {
        Sentry.init({
          dsn: process.env.REACT_APP_SENTRY_DSN,
          environment: process.env.NODE_ENV,
          integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
              maskAllText: false,
              blockAllMedia: false,
            }),
          ],
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        });
        logger.info('Sentry initialized');
      }

      this.initialized = true;
      logger.info('Analytics service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Identify user across all platforms
   */
  identifyUser(profile: UserProfile): void {
    this.userId = profile.userId;

    // PostHog
    if (process.env.REACT_APP_POSTHOG_KEY) {
      posthog.identify(profile.userId, {
        email: profile.email,
        name: profile.name,
        subscription_plan: profile.subscriptionPlan,
        signup_date: profile.signupDate,
        total_revenue: profile.totalRevenue,
        ...profile.properties,
      });
    }

    // Mixpanel
    if (process.env.REACT_APP_MIXPANEL_TOKEN) {
      mixpanel.identify(profile.userId);
      mixpanel.people.set({
        $email: profile.email,
        $name: profile.name,
        subscription_plan: profile.subscriptionPlan,
        signup_date: profile.signupDate,
        total_revenue: profile.totalRevenue,
        ...profile.properties,
      });
    }

    // Sentry
    if (process.env.REACT_APP_SENTRY_DSN) {
      Sentry.setUser({
        id: profile.userId,
        email: profile.email,
        username: profile.name,
      });
    }

    logger.info('User identified:', { userId: profile.userId });
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    const { name, properties, userId } = event;

    // PostHog
    if (process.env.REACT_APP_POSTHOG_KEY) {
      posthog.capture(name, properties);
    }

    // Mixpanel
    if (process.env.REACT_APP_MIXPANEL_TOKEN) {
      mixpanel.track(name, properties);
    }

    // Custom logging
    logger.info('Event tracked:', { name, properties, userId: userId || this.userId });
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, properties?: Record<string, any>): void {
    this.trackEvent({
      name: 'Page Viewed',
      properties: {
        page_name: pageName,
        path: window.location.pathname,
        url: window.location.href,
        ...properties,
      },
    });
  }

  /**
   * Track conversion funnel step
   */
  trackFunnelStep(funnelName: string, step: string, properties?: Record<string, any>): void {
    this.trackEvent({
      name: `Funnel: ${funnelName}`,
      properties: {
        funnel_step: step,
        funnel_name: funnelName,
        ...properties,
      },
    });
  }

  /**
   * Track revenue/purchase
   */
  trackRevenue(amount: number, currency: string, properties?: Record<string, any>): void {
    // PostHog
    if (process.env.REACT_APP_POSTHOG_KEY) {
      posthog.capture('Purchase', {
        revenue: amount,
        currency,
        ...properties,
      });
    }

    // Mixpanel
    if (process.env.REACT_APP_MIXPANEL_TOKEN) {
      mixpanel.track('Purchase', {
        revenue: amount,
        currency,
        ...properties,
      });
      mixpanel.people.track_charge(amount);
    }

    this.trackEvent({
      name: 'Purchase',
      properties: {
        revenue: amount,
        currency,
        ...properties,
      },
    });
  }

  /**
   * Track course enrollment
   */
  trackCourseEnrollment(courseName: string, courseId: string, price?: number): void {
    this.trackFunnelStep('Course Enrollment', 'Enrolled', {
      course_name: courseName,
      course_id: courseId,
      price,
    });

    if (price) {
      this.trackRevenue(price, 'USD', {
        product_type: 'course',
        product_name: courseName,
        product_id: courseId,
      });
    }
  }

  /**
   * Track course completion
   */
  trackCourseCompletion(courseName: string, courseId: string, completionTime: number): void {
    this.trackEvent({
      name: 'Course Completed',
      properties: {
        course_name: courseName,
        course_id: courseId,
        completion_time_minutes: completionTime,
      },
    });
  }

  /**
   * Track AI interaction
   */
  trackAIInteraction(
    feature: 'tutor' | 'recommendations' | 'code-review' | 'quiz-generation',
    success: boolean,
    properties?: Record<string, any>
  ): void {
    this.trackEvent({
      name: 'AI Interaction',
      properties: {
        ai_feature: feature,
        success,
        ...properties,
      },
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    // Sentry
    if (process.env.REACT_APP_SENTRY_DSN) {
      Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
      });
    }

    // Also track as event
    this.trackEvent({
      name: 'Error',
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      },
    });
  }

  /**
   * Track A/B test variant
   */
  trackExperiment(experimentName: string, variant: string): void {
    // PostHog
    if (process.env.REACT_APP_POSTHOG_KEY) {
      posthog.capture('$feature_flag_called', {
        $feature_flag: experimentName,
        $feature_flag_response: variant,
      });
    }

    this.trackEvent({
      name: 'Experiment Viewed',
      properties: {
        experiment_name: experimentName,
        variant,
      },
    });
  }

  /**
   * Get feature flag value (A/B testing)
   */
  getFeatureFlag(flagName: string): boolean | string {
    if (process.env.REACT_APP_POSTHOG_KEY) {
      return posthog.getFeatureFlag(flagName) || false;
    }
    return false;
  }

  /**
   * Reset user (on logout)
   */
  reset(): void {
    this.userId = null;

    if (process.env.REACT_APP_POSTHOG_KEY) {
      posthog.reset();
    }

    if (process.env.REACT_APP_MIXPANEL_TOKEN) {
      mixpanel.reset();
    }

    if (process.env.REACT_APP_SENTRY_DSN) {
      Sentry.setUser(null);
    }

    logger.info('Analytics reset');
  }

  /**
   * Track user engagement score
   */
  updateEngagementScore(score: number): void {
    if (process.env.REACT_APP_MIXPANEL_TOKEN && this.userId) {
      mixpanel.people.set({
        engagement_score: score,
        last_active: new Date(),
      });
    }
  }

  /**
   * Track subscription changes
   */
  trackSubscriptionChange(
    action: 'upgrade' | 'downgrade' | 'cancel' | 'renew',
    fromPlan?: string,
    toPlan?: string,
    amount?: number
  ): void {
    this.trackEvent({
      name: 'Subscription Changed',
      properties: {
        action,
        from_plan: fromPlan,
        to_plan: toPlan,
        amount,
      },
    });

    if (process.env.REACT_APP_MIXPANEL_TOKEN && this.userId) {
      mixpanel.people.set({
        subscription_plan: toPlan || fromPlan,
        subscription_status: action,
      });
    }
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  analyticsService.initialize();
}

export default analyticsService;
