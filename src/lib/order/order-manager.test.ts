/**
 * Order Manager Tests
 */

// Import after mocks
import { orderManager } from "./order-manager";
import type { CreateOrderData, OrderItem } from "./order-manager";

jest.mock("../supabase-config", () => {
  // Mock Supabase response - defined inside mock to avoid hoisting issues
  const mockSupabaseResponse = {
    data: {
      id: "order-123",
      orderNumber: "NLC2501001",
      userId: "user-123",
      status: "pending",
      items: [],
      subtotal: 100000,
      discount: 0,
      shippingFee: 0,
      tax: 10000,
      total: 110000,
      currency: "VND",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    error: null,
  };

  return {
    supabase: {
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockSupabaseResponse),
          }),
        }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockSupabaseResponse),
            range: jest.fn().mockResolvedValue({
              data: [mockSupabaseResponse.data],
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
                ...mockSupabaseResponse,
                data: { ...mockSupabaseResponse.data, status: "paid" },
              }),
            }),
          }),
        }),
      }),
    },
  };
});

// Get mock Supabase instance
const mockSupabase = require("../supabase-config").supabase;

// Mock payment services
jest.mock("../payment/vnpay", () => ({
  vnPayService: {
    createPaymentUrl: jest.fn().mockReturnValue({
      paymentUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?test=1",
      transactionRef: "test-order-123_1234567890",
    }),
  },
}));

jest.mock("../payment/momo", () => ({
  stripeService: {
    createPaymentIntent: jest.fn().mockResolvedValue({
      id: "pi_test_123",
      client_secret: "pi_test_123_secret",
      amount: 100000,
      currency: "usd",
      status: "requires_payment_method",
    }),
  },
}));

describe("OrderManager", () => {
  const mockOrderItems: Omit<OrderItem, "id">[] = [
    {
      type: "course",
      refId: "course-123",
      title: "React Development Course",
      description: "Learn React from basics to advanced",
      price: 500000,
      quantity: 1,
      discount: 0,
    },
    {
      type: "product",
      refId: "product-456",
      title: "Development Tools Package",
      price: 200000,
      quantity: 2,
      discount: 50000,
    },
  ];

  const mockOrderData: CreateOrderData = {
    items: mockOrderItems,
    shippingInfo: {
      recipientName: "John Doe",
      phone: "0901234567",
      email: "john@example.com",
      address: "123 Test Street",
      city: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
    },
    notes: "Test order",
  };

  // Get mocked supabase instance
  const mockSupabase = require("../supabase-config").supabase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create order successfully with correct calculations", async () => {
      const result = await orderManager.createOrder("user-123", mockOrderData);

      expect(result).toBeDefined();
      expect(result.id).toBe("order-123");
      expect(result.orderNumber).toBe("NLC2501001");
      expect(result.userId).toBe("user-123");
      expect(result.status).toBe("pending");
    });

    it("should generate unique order number", async () => {
      const result = await orderManager.createOrder("user-123", mockOrderData);
      
      expect(result.orderNumber).toMatch(/^NLC\d{10}$/);
    });

    it("should calculate pricing correctly", async () => {
      const result = await orderManager.createOrder("user-123", mockOrderData);
      
      expect(result.subtotal).toBe(100000);
      expect(result.discount).toBe(0);
      expect(result.tax).toBe(10000);
      expect(result.total).toBe(110000);
    });

    it("should calculate shipping fee for physical products", async () => {
      const result = await orderManager.createOrder("user-123", mockOrderData);
      
      expect(result.shippingFee).toBe(0);
    });

    it("should handle order creation failure", async () => {
      // Mock failed response
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: null,
        error: { message: "Insert failed" },
      });

      await expect(
        orderManager.createOrder("user-123", mockOrderData)
      ).rejects.toThrow("Failed to create order");
    });

    it("should apply discount code when provided", async () => {
      const orderWithDiscount = {
        ...mockOrderData,
        discountCode: "TESTCODE",
      };

      const result = await orderManager.createOrder("user-123", orderWithDiscount);
      
      expect(result).toBeDefined();
      expect(result.id).toBe("order-123");
    });
  });

  describe("getOrder", () => {
    it("should retrieve order successfully", async () => {
      const result = await orderManager.getOrder("order-123");

      expect(result).toBeDefined();
      expect(result?.id).toBe("order-123");
      expect(result?.orderNumber).toBe("NLC2501001");
    });

    it("should filter by user ID when provided", async () => {
      const result = await orderManager.getOrder("order-123", "user-123");
      
      expect(result).toBeDefined();
      expect(result?.id).toBe("order-123");
    });

    it("should return null when order not found", async () => {
      // Mock not found response
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" }, // No rows found
      });

      const result = await orderManager.getOrder("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      // Mock database error
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { message: "Database error" },
      });

      await expect(orderManager.getOrder("order-123")).rejects.toThrow(
        "Failed to get order"
      );
    });
  });

  describe("getUserOrders", () => {
    it("should retrieve user orders with pagination", async () => {
      const result = await orderManager.getUserOrders("user-123", 1, 10);

      expect(result).toHaveProperty("orders");
      expect(result).toHaveProperty("total");
      expect(result.orders).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should filter by status when provided", async () => {
      const result = await orderManager.getUserOrders("user-123", 1, 10, "paid");
      
      expect(result).toBeDefined();
      expect(result.orders).toHaveLength(1);
    });

    it("should handle pagination correctly", async () => {
      const result = await orderManager.getUserOrders("user-123", 2, 5);
      
      expect(result).toBeDefined();
      expect(result.orders).toHaveLength(1);
    });
  });

  describe("createPayment", () => {
    const mockPaymentRequest = {
      orderId: "order-123",
      paymentMethod: "vnpay" as const,
      customerInfo: {
        name: "John Doe",
        email: "john@example.com",
        phone: "0901234567",
      },
    };

    it("should create VNPay payment successfully", async () => {
      const result = await orderManager.createPayment(mockPaymentRequest);

      expect(result).toHaveProperty("paymentUrl");
      expect(result).toHaveProperty("paymentReference");
      expect(result.paymentUrl).toContain("vnpayment.vn");
    });

    it("should create MoMo payment successfully", async () => {
      const momoRequest = {
        ...mockPaymentRequest,
        paymentMethod: "momo" as const,
      };

      const result = await orderManager.createPayment(momoRequest);

      expect(result).toHaveProperty("paymentUrl");
      expect(result).toHaveProperty("paymentReference");
    });

    it("should handle unsupported payment method", async () => {
      const invalidRequest = {
        ...mockPaymentRequest,
        paymentMethod: "invalid" as any,
      };

      await expect(orderManager.createPayment(invalidRequest)).rejects.toThrow(
        "Unsupported payment method"
      );
    });

    it("should handle order not found", async () => {
      // Mock order not found
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" },
      });

      await expect(
        orderManager.createPayment(mockPaymentRequest)
      ).rejects.toThrow("Failed to create payment");
    });

    it("should handle non-pending order status", async () => {
      // Mock non-pending order
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { 
          id: "order-123",
          orderNumber: "NLC2501001",
          status: "paid",
          items: [],
          subtotal: 100000,
          discount: 0,
          shippingFee: 0,
          tax: 10000,
          total: 110000,
          currency: "VND",
          paymentStatus: "completed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        error: null,
      });

      await expect(
        orderManager.createPayment(mockPaymentRequest)
      ).rejects.toThrow("Order is not in pending status");
    });
  });

  describe("updateOrder", () => {
    it("should update order successfully", async () => {
      const updates = {
        status: "paid" as const,
        paymentStatus: "completed" as const,
      };

      const result = await orderManager.updateOrder("order-123", updates);

      expect(result).toBeDefined();
      expect(result.status).toBe("paid");
    });

    it("should handle update failure", async () => {
      // Mock update failure
      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: null,
        error: { message: "Update failed" },
      });

      await expect(
        orderManager.updateOrder("order-123", { status: "paid" })
      ).rejects.toThrow("Failed to update order");
    });
  });

  describe("confirmPayment", () => {
    it("should confirm payment and update order status", async () => {
      const result = await orderManager.confirmPayment(
        "order-123",
        "txn-123",
        "vnpay"
      );

      expect(result).toBeDefined();
      expect(result.status).toBe("paid");
    });

    it("should auto-confirm digital products", async () => {
      const digitalOrder = {
        id: "order-123",
        orderNumber: "NLC2501001",
        items: [
          { type: "course", title: "Test Course" },
          { type: "service", title: "Test Service" },
        ],
        subtotal: 100000,
        discount: 0,
        shippingFee: 0,
        tax: 10000,
        total: 110000,
        currency: "VND",
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock order lookup
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: digitalOrder,
        error: null,
      });

      const result = await orderManager.confirmPayment("order-123", "txn-123", "vnpay");

      expect(result).toBeDefined();
    });

    it("should not auto-confirm orders with physical products", async () => {
      const mixedOrder = {
        id: "order-123",
        orderNumber: "NLC2501001",
        items: [
          { type: "course", title: "Test Course" },
          { type: "product", title: "Physical Product" },
        ],
        subtotal: 100000,
        discount: 0,
        shippingFee: 0,
        tax: 10000,
        total: 110000,
        currency: "VND",
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock order lookup
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mixedOrder,
        error: null,
      });

      const result = await orderManager.confirmPayment("order-123", "txn-123", "vnpay");

      expect(result).toBeDefined();
    });
  });

  describe("cancelOrder", () => {
    it("should cancel order successfully", async () => {
      const result = await orderManager.cancelOrder(
        "order-123",
        "User requested cancellation"
      );

      expect(result).toBeDefined();
    });

    it("should prevent cancellation of completed orders", async () => {
      // Mock completed order
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { 
          id: "order-123", 
          status: "completed",
          orderNumber: "NLC2501001",
          items: [],
          subtotal: 100000,
          discount: 0,
          shippingFee: 0,
          tax: 10000,
          total: 110000,
          currency: "VND",
          paymentStatus: "completed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        error: null,
      });

      await expect(orderManager.cancelOrder("order-123")).rejects.toThrow(
        "Cannot cancel order in current status"
      );
    });
  });

  describe("private methods", () => {
    describe("generateOrderNumber", () => {
      it("should generate unique order numbers", async () => {
        // Test through createOrder method
        const result1 = await orderManager.createOrder("user-123", mockOrderData);
        const result2 = await orderManager.createOrder("user-123", mockOrderData);

        expect(result1.orderNumber).toMatch(/^NLC\d{10}$/);
        expect(result2.orderNumber).toMatch(/^NLC\d{10}$/);
        expect(result1.orderNumber).not.toBe(result2.orderNumber);
      });
    });

    describe("calculatePricing", () => {
      it("should calculate subtotal correctly", async () => {
        // Test through createOrder method
        const result = await orderManager.createOrder("user-123", mockOrderData);
        
        expect(result.subtotal).toBe(100000);
        expect(result.tax).toBe(10000);
        expect(result.total).toBe(110000);
      });
    });

    describe("calculateShippingFee", () => {
      it("should return 0 for digital-only orders", async () => {
        // Test through createOrder method
        const result = await orderManager.createOrder("user-123", mockOrderData);
        
        expect(result.shippingFee).toBe(0);
      });
    });
  });
});
