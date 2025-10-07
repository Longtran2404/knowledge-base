/**
 * Payment Webhook API Routes
 * Express-like API handlers for payment gateway webhooks
 * Can be used with backend framework or serverless functions
 */

import { webhookHandler } from "../payment/webhook-handler";
import { stripeService, STRIPE_CONFIG } from "../payment/stripe";
import { orderManager } from "../order/order-manager";
import type {
  VNPayWebhookData,
  MoMoWebhookData,
  WebhookResponse,
} from "../payment/webhook-handler";

// Types for request/response handling
export interface WebhookRequest {
  body: any;
  headers: Record<string, string>;
  method: string;
  url: string;
  query?: Record<string, string>;
}

// Stripe API Types
export interface StripePaymentIntentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
  customer_email?: string;
  customer_name?: string;
}

export interface StripePaymentIntentResponse {
  client_secret: string;
  id: string;
  status: string;
}

export interface WebhookAPIResponse {
  status: number;
  data: WebhookResponse | any;
  headers?: Record<string, string>;
}

/**
 * Stripe Create Payment Intent API
 * POST /api/payment/stripe/create-payment-intent
 */
export async function handleStripeCreatePaymentIntent(
  request: WebhookRequest
): Promise<WebhookAPIResponse> {
  try {
    const body: StripePaymentIntentRequest = request.body;

    // Validate required fields
    if (!body.amount || !body.currency || !body.description) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: amount, currency, description",
        },
      };
    }

    // Create Payment Intent with Stripe
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_CONFIG.SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": STRIPE_CONFIG.API_VERSION,
      },
      body: new URLSearchParams({
        amount: body.amount.toString(),
        currency: body.currency,
        description: body.description,
        metadata: JSON.stringify(body.metadata || {}),
        ...(body.customer_email && { receipt_email: body.customer_email }),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        status: 400,
        data: {
          error: error.error?.message || "Failed to create payment intent",
        },
      };
    }

    const paymentIntent = await response.json();

    return {
      status: 200,
      data: {
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id,
        status: paymentIntent.status,
      } as StripePaymentIntentResponse,
    };
  } catch (error) {
    console.error("Stripe create payment intent error:", error);
    return {
      status: 500,
      data: { error: "Internal server error" },
    };
  }
}

/**
 * Stripe Webhook Handler
 * POST /api/payment/stripe/webhook
 */
export async function handleStripeWebhook(
  request: WebhookRequest
): Promise<WebhookAPIResponse> {
  try {
    const signature = request.headers["stripe-signature"];
    const payload = JSON.stringify(request.body);

    if (!signature) {
      return {
        status: 400,
        data: { error: "Missing stripe-signature header" },
      };
    }

    // Verify webhook signature (in production)
    // const event = stripe.webhooks.constructEvent(payload, signature, STRIPE_CONFIG.WEBHOOK_SECRET);
    const event = request.body; // For development

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return {
      status: 200,
      data: { received: true },
    };
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return {
      status: 400,
      data: { error: "Webhook signature verification failed" },
    };
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: any): Promise<void> {
  const orderId = paymentIntent.metadata?.order_id;

  if (!orderId) return;

  try {
    // Update order status
    await orderManager.updateOrder(orderId, {
      status: "paid",
      paymentStatus: "completed",
    });

    // TODO: Handle commission for partners
    // await commissionService.processCommission(orderId);

    // Send confirmation email
    // await emailService.sendPaymentConfirmation(orderId);

    console.log(`Payment succeeded for order ${orderId}`);
  } catch (error) {
    console.error(
      `Error handling payment success for order ${orderId}:`,
      error
    );
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: any): Promise<void> {
  const orderId = paymentIntent.metadata?.order_id;

  if (!orderId) return;

  try {
    // Update order status
    await orderManager.updateOrder(orderId, {
      status: "failed",
      paymentStatus: "failed",
    });

    // Send failure notification
    // await emailService.sendPaymentFailureNotification(orderId);

    console.log(`Payment failed for order ${orderId}`);
  } catch (error) {
    console.error(
      `Error handling payment failure for order ${orderId}:`,
      error
    );
  }
}

/**
 * VNPay IPN (Instant Payment Notification) handler
 * POST /api/payment/vnpay/notify
 */
export async function handleVNPayIPN(
  req: WebhookRequest
): Promise<WebhookAPIResponse> {
  try {
    // Verify request method
    if (req.method !== "POST") {
      return {
        status: 405,
        data: { error: "Method not allowed" },
      };
    }

    // Verify webhook origin for security
    const origin = req.headers["origin"] || req.headers["referer"] || "";
    if (!webhookHandler.verifyWebhookOrigin(origin, "vnpay")) {
      await webhookHandler.logWebhookActivity("vnpay", "unknown", "invalid", {
        origin,
        headers: req.headers,
      });

      return {
        status: 403,
        data: { error: "Forbidden" },
      };
    }

    const webhookData = (req.query || req.body) as Partial<VNPayWebhookData>;

    // Validate required fields
    if (!webhookData.vnp_TxnRef || !webhookData.vnp_SecureHash) {
      return {
        status: 400,
        data: { error: "Missing required webhook data" },
      };
    }

    // Process the webhook
    const result = await webhookHandler.handleVNPayWebhook(
      webhookData as VNPayWebhookData
    );

    // Log webhook activity
    await webhookHandler.logWebhookActivity(
      "vnpay",
      result.orderId || "unknown",
      result.success ? "success" : "failed",
      webhookData
    );

    // VNPay expects specific response format
    if (result.success) {
      return {
        status: 200,
        data: { RspCode: "00", Message: "Success" },
      };
    } else {
      return {
        status: 200, // Still return 200 to VNPay but with error code
        data: { RspCode: "01", Message: result.message },
      };
    }
  } catch (error) {
    console.error("VNPay IPN handler error:", error);

    // Log the error
    await webhookHandler.logWebhookActivity("vnpay", "unknown", "failed", {
      error: String(error),
      body: req.body,
    });

    return {
      status: 200, // Return 200 to prevent VNPay retries
      data: { RspCode: "99", Message: "System error" },
    };
  }
}

/**
 * VNPay return URL handler (user redirect after payment)
 * GET /payment/vnpay/return
 */
export async function handleVNPayReturn(
  req: WebhookRequest
): Promise<WebhookAPIResponse> {
  try {
    const returnData = req.query || ({} as Partial<VNPayWebhookData>);

    if (!returnData.vnp_TxnRef) {
      return {
        status: 400,
        data: { error: "Invalid return data" },
      };
    }

    const result = await webhookHandler.handlePaymentReturn(
      "vnpay",
      returnData
    );

    // Return data for frontend to handle
    return {
      status: 200,
      data: {
        success: result.success,
        message: result.message,
        orderId: result.orderId,
        transactionId: result.transactionId,
        paymentGateway: "vnpay",
      },
    };
  } catch (error) {
    console.error("VNPay return handler error:", error);
    return {
      status: 500,
      data: {
        success: false,
        message: "Lỗi xử lý kết quả thanh toán",
        error: String(error),
      },
    };
  }
}

/**
 * MoMo IPN (Instant Payment Notification) handler
 * POST /api/payment/momo/notify
 */
export async function handleMoMoIPN(
  req: WebhookRequest
): Promise<WebhookAPIResponse> {
  try {
    if (req.method !== "POST") {
      return {
        status: 405,
        data: { error: "Method not allowed" },
      };
    }

    // Verify webhook origin for security
    const origin = req.headers["origin"] || req.headers["referer"] || "";
    if (!webhookHandler.verifyWebhookOrigin(origin, "momo")) {
      await webhookHandler.logWebhookActivity("momo", "unknown", "invalid", {
        origin,
        headers: req.headers,
      });

      return {
        status: 403,
        data: { error: "Forbidden" },
      };
    }

    const webhookData: MoMoWebhookData = req.body;

    // Validate required fields
    if (!webhookData.orderId || !webhookData.signature) {
      return {
        status: 400,
        data: { error: "Missing required webhook data" },
      };
    }

    // Process the webhook
    const result = await webhookHandler.handleMoMoWebhook(webhookData);

    // Log webhook activity
    await webhookHandler.logWebhookActivity(
      "momo",
      result.orderId || "unknown",
      result.success ? "success" : "failed",
      webhookData
    );

    // MoMo expects specific response format
    return {
      status: 204, // MoMo expects 204 No Content for successful processing
      data: null,
    };
  } catch (error) {
    console.error("MoMo IPN handler error:", error);

    // Log the error
    await webhookHandler.logWebhookActivity("momo", "unknown", "failed", {
      error: String(error),
      body: req.body,
    });

    return {
      status: 500,
      data: { error: "Internal server error" },
    };
  }
}

/**
 * MoMo return URL handler (user redirect after payment)
 * GET /payment/momo/return
 */
export async function handleMoMoReturn(
  req: WebhookRequest
): Promise<WebhookAPIResponse> {
  try {
    const returnData = req.query || {};

    if (!returnData.orderId) {
      return {
        status: 400,
        data: { error: "Invalid return data" },
      };
    }

    // For MoMo return, we might need to query the transaction status
    // since return URL doesn't always contain complete payment info
    const result = await webhookHandler.handlePaymentReturn("momo", returnData);

    return {
      status: 200,
      data: {
        success: result.success,
        message: result.message,
        orderId: result.orderId,
        transactionId: result.transactionId,
        paymentGateway: "momo",
      },
    };
  } catch (error) {
    console.error("MoMo return handler error:", error);
    return {
      status: 500,
      data: {
        success: false,
        message: "Lỗi xử lý kết quả thanh toán",
        error: String(error),
      },
    };
  }
}

/**
 * Generic payment status check endpoint
 * GET /api/payment/status/:orderId
 */
export async function checkPaymentStatus(
  orderId: string
): Promise<WebhookAPIResponse> {
  try {
    // Import order manager to check status
    const { orderManager } = await import("../order/order-manager");

    const order = await orderManager.getOrder(orderId);

    if (!order) {
      return {
        status: 404,
        data: { error: "Order not found" },
      };
    }

    return {
      status: 200,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        total: order.total,
        currency: order.currency,
        paidAt: order.paidAt,
        updatedAt: order.updatedAt,
      },
    };
  } catch (error) {
    console.error("Payment status check error:", error);
    return {
      status: 500,
      data: { error: "Internal server error" },
    };
  }
}

/**
 * Express.js middleware example for webhook endpoints
 */
export function createExpressWebhookRoutes() {
  return `
// Add these routes to your Express.js app
app.post('/api/payment/vnpay/notify', async (req, res) => {
  const result = await handleVNPayIPN({
    body: req.body,
    query: req.query,
    headers: req.headers,
    method: req.method,
    url: req.url
  });

  res.status(result.status).json(result.data);
});

app.get('/payment/vnpay/return', async (req, res) => {
  const result = await handleVNPayReturn({
    query: req.query,
    headers: req.headers,
    method: req.method,
    url: req.url
  });

  if (result.data.success) {
    res.redirect(\`/order-confirmation?orderId=\${result.data.orderId}&status=success\`);
  } else {
    res.redirect(\`/order-confirmation?orderId=\${result.data.orderId}&status=failed&message=\${encodeURIComponent(result.data.message)}\`);
  }
});

app.post('/api/payment/momo/notify', async (req, res) => {
  const result = await handleMoMoIPN({
    body: req.body,
    headers: req.headers,
    method: req.method,
    url: req.url
  });

  res.status(result.status).json(result.data);
});

app.get('/payment/momo/return', async (req, res) => {
  const result = await handleMoMoReturn({
    query: req.query,
    headers: req.headers,
    method: req.method,
    url: req.url
  });

  if (result.data.success) {
    res.redirect(\`/order-confirmation?orderId=\${result.data.orderId}&status=success\`);
  } else {
    res.redirect(\`/order-confirmation?orderId=\${result.data.orderId}&status=failed&message=\${encodeURIComponent(result.data.message)}\`);
  }
});

app.get('/api/payment/status/:orderId', async (req, res) => {
  const result = await checkPaymentStatus(req.params.orderId);
  res.status(result.status).json(result.data);
});
  `;
}

/**
 * Serverless function examples (Vercel, Netlify, etc.)
 */
export function createServerlessExamples() {
  return `
// Vercel API Route: api/payment/vnpay/notify.ts
import { handleVNPayIPN } from '../../lib/api/payment-webhooks';

export default async function handler(req: any, res: any) {
  const result = await handleVNPayIPN({
    body: req.body,
    query: req.query,
    headers: req.headers,
    method: req.method,
    url: req.url
  });

  res.status(result.status).json(result.data);
}

// Netlify Function: netlify/functions/vnpay-webhook.ts
export { handleVNPayIPN as handler };
  `;
}
