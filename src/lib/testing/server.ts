/**
 * Mock Service Worker (MSW) server for API mocking in tests
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { Order } from '../order/order-manager';
import type { VNPayResponse } from '../payment/vnpay';
import type { MoMoResponse } from '../payment/momo';

// Mock data
const mockOrder: Order = {
  id: 'test-order-1',
  orderNumber: 'NLC25011001',
  userId: 'test-user-1',
  items: [
    {
      id: 'item-1',
      type: 'course',
      refId: 'course-123',
      title: 'React Development Course',
      description: 'Learn React from basics to advanced',
      price: 500000,
      quantity: 1,
      discount: 0,
    },
  ],
  subtotal: 500000,
  discount: 0,
  shippingFee: 0,
  tax: 50000,
  total: 550000,
  currency: 'VND',
  status: 'pending',
  paymentStatus: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockVNPayResponse: VNPayResponse = {
  paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=55000000&vnp_Command=pay',
  orderId: 'test-order-1',
  amount: 550000,
  transactionRef: 'test-order-1_1234567890',
};

const mockMoMoResponse: MoMoResponse = {
  partnerCode: 'TESTPARTNER',
  orderId: 'test-order-1',
  requestId: 'test-request-1',
  amount: 550000,
  responseTime: Date.now(),
  message: 'Success',
  resultCode: 0,
  payUrl: 'https://test-payment.momo.vn/gw_payment/transactionProcessor',
  qrCodeUrl: 'https://test-payment.momo.vn/qr/123456',
};

// API handlers
export const handlers = [
  // Order Management
  http.post('/api/orders', async ({ request }) => {
    const orderData = await request.json();
    return HttpResponse.json({
      ...mockOrder,
      ...orderData,
      id: 'new-order-' + Date.now(),
      orderNumber: 'NLC' + Date.now(),
    });
  }),

  http.get('/api/orders/:orderId', ({ params }) => {
    return HttpResponse.json({
      ...mockOrder,
      id: params.orderId,
    });
  }),

  http.get('/api/users/:userId/orders', () => {
    return HttpResponse.json({
      orders: [mockOrder],
      total: 1,
    });
  }),

  http.put('/api/orders/:orderId', async ({ request, params }) => {
    const updates = await request.json();
    return HttpResponse.json({
      ...mockOrder,
      ...updates,
      id: params.orderId,
      updatedAt: new Date().toISOString(),
    });
  }),

  // Payment Processing
  http.post('/api/payment/create', async ({ request }) => {
    const paymentRequest = await request.json();
    const { paymentMethod } = paymentRequest;

    if (paymentMethod === 'vnpay') {
      return HttpResponse.json(mockVNPayResponse);
    } else if (paymentMethod === 'momo') {
      return HttpResponse.json(mockMoMoResponse);
    } else {
      return HttpResponse.json(
        { error: 'Unsupported payment method' },
        { status: 400 }
      );
    }
  }),

  // VNPay Mock Endpoints
  http.post('https://sandbox.vnpayment.vn/merchant_webapi/api/transaction', () => {
    return HttpResponse.json({
      vnp_ResponseCode: '00',
      vnp_Message: 'Success',
      vnp_TransactionStatus: '00',
      vnp_Amount: '55000000',
      vnp_TxnRef: 'test-order-1_1234567890',
    });
  }),

  // MoMo Mock Endpoints
  http.post('https://test-payment.momo.vn/v2/gateway/api/create', () => {
    return HttpResponse.json(mockMoMoResponse);
  }),

  http.post('https://test-payment.momo.vn/v2/gateway/api/query', () => {
    return HttpResponse.json({
      ...mockMoMoResponse,
      resultCode: 0,
      message: 'Transaction is successful',
    });
  }),

  // Supabase Mock Endpoints
  http.post('https://byidgbgvnrfhujprzzge.supabase.co/rest/v1/*', async ({ request }) => {
    const url = new URL(request.url);
    const table = url.pathname.split('/').pop();

    // Mock responses based on table
    switch (table) {
      case 'orders':
        return HttpResponse.json([mockOrder]);
      case 'invoices':
        return HttpResponse.json([{
          id: 'invoice-1',
          invoiceNumber: 'INV2501001',
          orderId: 'test-order-1',
          total: 550000,
        }]);
      case 'discount_codes':
        return HttpResponse.json([{
          id: 'discount-1',
          code: 'TESTCODE',
          type: 'percentage',
          value: 10,
          isActive: true,
        }]);
      default:
        return HttpResponse.json([]);
    }
  }),

  http.get('https://byidgbgvnrfhujprzzge.supabase.co/rest/v1/*', () => {
    return HttpResponse.json([mockOrder]);
  }),

  // Webhook Handlers
  http.post('/api/payment/vnpay/notify', async ({ request }) => {
    const webhookData = await request.formData();
    return HttpResponse.json({
      RspCode: '00',
      Message: 'Success',
    });
  }),

  http.post('/api/payment/momo/notify', async ({ request }) => {
    const webhookData = await request.json();
    return new HttpResponse(null, { status: 204 });
  }),

  // Error handlers for testing
  http.get('/api/error/500', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),

  http.get('/api/error/404', () => {
    return HttpResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }),
];

// Setup server with handlers
export const server = setupServer(...handlers);