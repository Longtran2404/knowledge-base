/**
 * Order Manager Tests
 */

import { orderManager } from './order-manager';
import type { CreateOrderData, OrderItem } from './order-manager';

// Mock Supabase
const mockSupabase = {
  from: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'order-123',
            orderNumber: 'NLC2501001',
            userId: 'user-123',
            status: 'pending',
          },
          error: null,
        }),
      }),
    }),
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'order-123',
            orderNumber: 'NLC2501001',
            status: 'pending',
          },
          error: null,
        }),
        range: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'order-123',
              orderNumber: 'NLC2501001',
              status: 'pending',
            },
          ],
          count: 1,
          error: null,
        }),
      }),
      order: jest.fn().mockReturnThis(),
    }),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'order-123',
              status: 'paid',
              updatedAt: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      }),
    }),
  }),
};

jest.mock('../supabase-config', () => ({
  supabase: mockSupabase,
}));

// Mock payment services
jest.mock('../payment/vnpay', () => ({
  vnPayService: {
    createPaymentUrl: jest.fn().mockReturnValue({
      paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?test=1',
      transactionRef: 'test-order-123_1234567890',
    }),
  },
}));

jest.mock('../payment/momo', () => ({
  momoService: {
    createPayment: jest.fn().mockResolvedValue({
      resultCode: 0,
      payUrl: 'https://test-payment.momo.vn/gw_payment/transactionProcessor',
      requestId: 'test-request-123',
    }),
  },
}));

describe('OrderManager', () => {
  const mockOrderItems: Omit<OrderItem, 'id'>[] = [
    {
      type: 'course',
      refId: 'course-123',
      title: 'React Development Course',
      description: 'Learn React from basics to advanced',
      price: 500000,
      quantity: 1,
      discount: 0,
    },
    {
      type: 'product',
      refId: 'product-456',
      title: 'Development Tools Package',
      price: 200000,
      quantity: 2,
      discount: 50000,
    },
  ];

  const mockOrderData: CreateOrderData = {
    items: mockOrderItems,
    shippingInfo: {
      recipientName: 'John Doe',
      phone: '0901234567',
      email: 'john@example.com',
      address: '123 Test Street',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
    },
    notes: 'Test order',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully with correct calculations', async () => {
      const result = await orderManager.createOrder('user-123', mockOrderData);

      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('orders');

      // Verify the insert was called with correct data structure
      const insertCall = mockSupabase.from().insert;
      expect(insertCall).toHaveBeenCalledWith([
        expect.objectContaining({
          userId: 'user-123',
          items: expect.arrayContaining([
            expect.objectContaining({
              title: 'React Development Course',
              price: 500000,
              quantity: 1,
            }),
          ]),
          status: 'pending',
          paymentStatus: 'pending',
          currency: 'VND',
        }),
      ]);
    });

    it('should generate unique order number', async () => {
      const spy = jest.spyOn(orderManager as any, 'generateOrderNumber');

      await orderManager.createOrder('user-123', mockOrderData);

      expect(spy).toHaveBeenCalled();
    });

    it('should calculate pricing correctly', async () => {
      const spy = jest.spyOn(orderManager as any, 'calculatePricing');

      await orderManager.createOrder('user-123', mockOrderData);

      expect(spy).toHaveBeenCalledWith(mockOrderData.items, undefined);
    });

    it('should calculate shipping fee for physical products', async () => {
      const spy = jest.spyOn(orderManager as any, 'calculateShippingFee');

      await orderManager.createOrder('user-123', mockOrderData);

      expect(spy).toHaveBeenCalledWith(
        mockOrderData.items,
        mockOrderData.shippingInfo
      );
    });

    it('should handle order creation failure', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Insert failed' },
      });

      await expect(
        orderManager.createOrder('user-123', mockOrderData)
      ).rejects.toThrow('Failed to create order');
    });

    it('should apply discount code when provided', async () => {
      const orderWithDiscount = {
        ...mockOrderData,
        discountCode: 'TESTCODE',
      };

      const spy = jest.spyOn(orderManager as any, 'calculatePricing');

      await orderManager.createOrder('user-123', orderWithDiscount);

      expect(spy).toHaveBeenCalledWith(
        mockOrderData.items,
        'TESTCODE'
      );
    });
  });

  describe('getOrder', () => {
    it('should retrieve order successfully', async () => {
      const result = await orderManager.getOrder('order-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('order-123');
      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
    });

    it('should filter by user ID when provided', async () => {
      await orderManager.getOrder('order-123', 'user-123');

      const selectQuery = mockSupabase.from().select();
      expect(selectQuery.eq).toHaveBeenCalledWith('id', 'order-123');
      expect(selectQuery.eq).toHaveBeenCalledWith('userId', 'user-123');
    });

    it('should return null when order not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });

      const result = await orderManager.getOrder('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(orderManager.getOrder('order-123')).rejects.toThrow(
        'Failed to get order'
      );
    });
  });

  describe('getUserOrders', () => {
    it('should retrieve user orders with pagination', async () => {
      const result = await orderManager.getUserOrders('user-123', 1, 10);

      expect(result).toHaveProperty('orders');
      expect(result).toHaveProperty('total');
      expect(result.orders).toHaveLength(1);
      expect(result.total).toBe(1);

      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
    });

    it('should filter by status when provided', async () => {
      await orderManager.getUserOrders('user-123', 1, 10, 'paid');

      const query = mockSupabase.from().select();
      expect(query.eq).toHaveBeenCalledWith('status', 'paid');
    });

    it('should handle pagination correctly', async () => {
      await orderManager.getUserOrders('user-123', 2, 5);

      const query = mockSupabase.from().select();
      expect(query.range).toHaveBeenCalledWith(5, 9); // (2-1)*5, 2*5-1
    });
  });

  describe('createPayment', () => {
    const mockPaymentRequest = {
      orderId: 'order-123',
      paymentMethod: 'vnpay' as const,
      customerInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0901234567',
      },
    };

    it('should create VNPay payment successfully', async () => {
      const result = await orderManager.createPayment(mockPaymentRequest);

      expect(result).toHaveProperty('paymentUrl');
      expect(result).toHaveProperty('paymentReference');
      expect(result.paymentUrl).toContain('vnpayment.vn');
    });

    it('should create MoMo payment successfully', async () => {
      const momoRequest = {
        ...mockPaymentRequest,
        paymentMethod: 'momo' as const,
      };

      const result = await orderManager.createPayment(momoRequest);

      expect(result).toHaveProperty('paymentUrl');
      expect(result).toHaveProperty('paymentReference');
    });

    it('should handle unsupported payment method', async () => {
      const invalidRequest = {
        ...mockPaymentRequest,
        paymentMethod: 'invalid' as any,
      };

      await expect(
        orderManager.createPayment(invalidRequest)
      ).rejects.toThrow('Unsupported payment method');
    });

    it('should handle order not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(
        orderManager.createPayment(mockPaymentRequest)
      ).rejects.toThrow('Order not found');
    });

    it('should handle non-pending order status', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { ...mockOrderData, status: 'paid' },
        error: null,
      });

      await expect(
        orderManager.createPayment(mockPaymentRequest)
      ).rejects.toThrow('Order is not in pending status');
    });
  });

  describe('updateOrder', () => {
    it('should update order successfully', async () => {
      const updates = {
        status: 'paid' as const,
        paymentStatus: 'completed' as const,
      };

      const result = await orderManager.updateOrder('order-123', updates);

      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('orders');

      const updateCall = mockSupabase.from().update;
      expect(updateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updates,
          updatedAt: expect.any(String),
        })
      );
    });

    it('should handle update failure', async () => {
      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        orderManager.updateOrder('order-123', { status: 'paid' })
      ).rejects.toThrow('Failed to update order');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment and update order status', async () => {
      const result = await orderManager.confirmPayment(
        'order-123',
        'txn-123',
        'vnpay'
      );

      expect(result).toBeDefined();

      const updateCall = mockSupabase.from().update;
      expect(updateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'paid',
          paymentStatus: 'completed',
          transactionId: 'txn-123',
          paidAt: expect.any(String),
        })
      );
    });

    it('should auto-confirm digital products', async () => {
      const digitalOrder = {
        id: 'order-123',
        items: [
          { type: 'course', title: 'Test Course' },
          { type: 'service', title: 'Test Service' },
        ],
      };

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: digitalOrder,
        error: null,
      });

      await orderManager.confirmPayment('order-123', 'txn-123', 'vnpay');

      const updateCall = mockSupabase.from().update;
      expect(updateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          completedAt: expect.any(String),
        })
      );
    });

    it('should not auto-confirm orders with physical products', async () => {
      const mixedOrder = {
        id: 'order-123',
        items: [
          { type: 'course', title: 'Test Course' },
          { type: 'product', title: 'Physical Product' },
        ],
      };

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mixedOrder,
        error: null,
      });

      await orderManager.confirmPayment('order-123', 'txn-123', 'vnpay');

      const updateCall = mockSupabase.from().update;
      expect(updateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'paid', // Not completed
        })
      );
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      await orderManager.cancelOrder('order-123', 'User requested cancellation');

      const updateCall = mockSupabase.from().update;
      expect(updateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'cancelled',
          cancelledAt: expect.any(String),
          notes: expect.stringContaining('User requested cancellation'),
        })
      );
    });

    it('should prevent cancellation of completed orders', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { id: 'order-123', status: 'completed' },
        error: null,
      });

      await expect(
        orderManager.cancelOrder('order-123')
      ).rejects.toThrow('Cannot cancel order in current status');
    });
  });

  describe('private methods', () => {
    describe('generateOrderNumber', () => {
      it('should generate unique order numbers', () => {
        const generateOrderNumber = (orderManager as any).generateOrderNumber;

        const orderNumber1 = generateOrderNumber();
        const orderNumber2 = generateOrderNumber();

        expect(orderNumber1).toMatch(/^NLC\d{10}$/);
        expect(orderNumber2).toMatch(/^NLC\d{10}$/);
        expect(orderNumber1).not.toBe(orderNumber2);
      });
    });

    describe('calculatePricing', () => {
      it('should calculate subtotal correctly', async () => {
        const calculatePricing = (orderManager as any).calculatePricing;

        const pricing = await calculatePricing(mockOrderItems);

        const expectedSubtotal = 500000 + (200000 * 2); // 900000
        expect(pricing.subtotal).toBe(expectedSubtotal);
      });

      it('should calculate tax correctly', async () => {
        const calculatePricing = (orderManager as any).calculatePricing;

        const pricing = await calculatePricing(mockOrderItems);

        const expectedTax = Math.round((pricing.subtotal - pricing.discount) * 0.1);
        expect(pricing.tax).toBe(expectedTax);
      });

      it('should calculate total correctly', async () => {
        const calculatePricing = (orderManager as any).calculatePricing;

        const pricing = await calculatePricing(mockOrderItems);

        const expectedTotal = pricing.subtotal - pricing.discount + pricing.tax;
        expect(pricing.total).toBe(expectedTotal);
      });
    });

    describe('calculateShippingFee', () => {
      it('should return 0 for digital-only orders', async () => {
        const calculateShippingFee = (orderManager as any).calculateShippingFee;
        const digitalItems = [
          { type: 'course', title: 'Test Course' },
          { type: 'service', title: 'Test Service' },
        ];

        const fee = await calculateShippingFee(digitalItems, {});

        expect(fee).toBe(0);
      });

      it('should calculate fee based on city for physical products', async () => {
        const calculateShippingFee = (orderManager as any).calculateShippingFee;
        const physicalItems = [
          { type: 'product', title: 'Physical Product' },
        ];

        const feeHCM = await calculateShippingFee(physicalItems, {
          city: 'TP. Hồ Chí Minh',
        });
        const feeHN = await calculateShippingFee(physicalItems, {
          city: 'Hà Nội',
        });
        const feeOther = await calculateShippingFee(physicalItems, {
          city: 'Cần Thơ',
        });

        expect(feeHCM).toBe(30000);
        expect(feeHN).toBe(30000);
        expect(feeOther).toBe(50000); // Default fee
      });
    });
  });
});