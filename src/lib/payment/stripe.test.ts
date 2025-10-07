/**
 * Stripe Payment Gateway Tests
 */

import { stripeService, commissionService, StripeService } from "./stripe";
import type { StripeOrderInfo, CommissionTransaction } from "./stripe";

// Mock @stripe/stripe-js
jest.mock("@stripe/stripe-js", () => ({
  loadStripe: jest.fn().mockResolvedValue({
    confirmCardPayment: jest.fn().mockResolvedValue({
      error: null,
      paymentIntent: {
        id: "pi_test_123",
        status: "succeeded",
      },
    }),
  }),
}));

describe("StripeService", () => {
  const mockOrderInfo: StripeOrderInfo = {
    orderId: "test-order-123",
    amount: 10000, // $100.00 in cents
    currency: "usd",
    orderDescription: "Test payment for order test-order-123",
    customerEmail: "test@example.com",
    customerName: "Test Customer",
    customerPhone: "0901234567",
    metadata: {
      partner_id: "partner-123",
      category: "course",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful fetch response for createPaymentIntent
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "pi_test_123",
          client_secret: "pi_test_123_secret",
          amount: 10000,
          currency: "usd",
          status: "requires_payment_method",
        }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createPaymentIntent", () => {
    it("should create payment intent successfully", async () => {
      const result = await stripeService.createPaymentIntent(mockOrderInfo);

      expect(result.id).toBe("pi_test_123");
      expect(result.client_secret).toBe("pi_test_123_secret");
      expect(result.amount).toBe(10000);
      expect(result.currency).toBe("usd");
      expect(result.status).toBe("requires_payment_method");

      expect(fetch).toHaveBeenCalledWith(
        "/api/payment/stripe/create-payment-intent",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining('"amount":10000'),
        })
      );
    });

    it("should include customer information in request", async () => {
      await stripeService.createPaymentIntent(mockOrderInfo);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"customer_email":"test@example.com"'),
        })
      );
    });

    it("should include metadata in request", async () => {
      await stripeService.createPaymentIntent(mockOrderInfo);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"metadata"'),
        })
      );
    });

    it("should handle API errors", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            error: { message: "Invalid amount" },
          }),
      }) as jest.Mock;

      await expect(
        stripeService.createPaymentIntent(mockOrderInfo)
      ).rejects.toThrow("Stripe API error: Invalid amount");
    });

    it("should handle network errors", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(
        stripeService.createPaymentIntent(mockOrderInfo)
      ).rejects.toThrow("Create payment intent failed: Error: Network error");
    });
  });

  describe("convertToCents", () => {
    it("should convert USD to cents correctly", () => {
      const cents = StripeService.convertToCents(100.5, "USD");
      expect(cents).toBe(10050);
    });

    it("should handle zero decimal currencies", () => {
      const jpyAmount = StripeService.convertToCents(1000, "JPY");
      expect(jpyAmount).toBe(1000);

      const vndAmount = StripeService.convertToCents(50000, "VND");
      expect(vndAmount).toBe(50000);
    });

    it("should round amounts correctly", () => {
      const cents = StripeService.convertToCents(100.555, "USD");
      expect(cents).toBe(10056); // Rounded up
    });
  });

  describe("convertFromCents", () => {
    it("should convert cents to USD correctly", () => {
      const dollars = StripeService.convertFromCents(10050, "USD");
      expect(dollars).toBe(100.5);
    });

    it("should handle zero decimal currencies", () => {
      const jpyAmount = StripeService.convertFromCents(1000, "JPY");
      expect(jpyAmount).toBe(1000);

      const vndAmount = StripeService.convertFromCents(50000, "VND");
      expect(vndAmount).toBe(50000);
    });
  });

  describe("getSupportedCardBrands", () => {
    it("should return list of supported card brands", () => {
      const brands = stripeService.getSupportedCardBrands();

      expect(brands).toContain("visa");
      expect(brands).toContain("mastercard");
      expect(brands).toContain("amex");
      expect(brands).toContain("discover");
    });
  });

  describe("processPaymentWithCommission", () => {
    it("should process payment with commission calculation", async () => {
      const partnerInfo = {
        partnerId: "partner-123",
        category: "course" as const,
      };

      const result = await stripeService.processPaymentWithCommission(
        mockOrderInfo,
        partnerInfo
      );

      expect(result.paymentIntent).toBeDefined();
      expect(result.commission).toBeDefined();
      expect(result.commission?.partnerId).toBe("partner-123");
      expect(result.commission?.grossAmount).toBe(10000);
    });

    it("should process payment without commission when no partner info", async () => {
      const result = await stripeService.processPaymentWithCommission(
        mockOrderInfo
      );

      expect(result.paymentIntent).toBeDefined();
      expect(result.commission).toBeUndefined();
    });
  });

  describe("getCommissionService", () => {
    it("should return commission service instance", () => {
      const service = stripeService.getCommissionService();
      expect(service).toBeDefined();
      expect(service).toStrictEqual(commissionService);
    });
  });
});

describe("CommissionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateCommission", () => {
    it("should calculate commission for course category", () => {
      const result = commissionService.calculateCommission(
        100000, // 1000 USD in cents
        "partner-123",
        "course"
      );

      expect(result.grossAmount).toBe(100000);
      expect(result.platformCommission).toBe(15000); // 15%
      expect(result.partnerCommission).toBe(85000); // 85%
      expect(result.netAmount).toBe(85000);
    });

    it("should calculate commission for document category", () => {
      const result = commissionService.calculateCommission(
        100000,
        "partner-123",
        "document"
      );

      expect(result.grossAmount).toBe(100000);
      expect(result.platformCommission).toBe(20000); // 20%
      expect(result.partnerCommission).toBe(80000); // 80%
      expect(result.netAmount).toBe(80000);
    });

    it("should calculate commission for subscription category", () => {
      const result = commissionService.calculateCommission(
        100000,
        "partner-123",
        "subscription"
      );

      expect(result.grossAmount).toBe(100000);
      expect(result.platformCommission).toBe(10000); // 10%
      expect(result.partnerCommission).toBe(90000); // 90%
      expect(result.netAmount).toBe(90000);
    });

    it("should calculate commission for membership category", () => {
      const result = commissionService.calculateCommission(
        100000,
        "partner-123",
        "membership"
      );

      expect(result.grossAmount).toBe(100000);
      expect(result.platformCommission).toBe(25000); // 25%
      expect(result.partnerCommission).toBe(75000); // 75%
      expect(result.netAmount).toBe(75000);
    });
  });

  describe("createCommissionTransaction", () => {
    it("should create commission transaction successfully", async () => {
      const transaction = await commissionService.createCommissionTransaction(
        "order-123",
        "partner-123",
        100000,
        "course"
      );

      expect(transaction.id).toMatch(/^comm_\d+_[a-z0-9]+$/);
      expect(transaction.orderId).toBe("order-123");
      expect(transaction.partnerId).toBe("partner-123");
      expect(transaction.platformId).toBe("namlong_platform");
      expect(transaction.grossAmount).toBe(100000);
      expect(transaction.platformCommission).toBe(15000);
      expect(transaction.partnerCommission).toBe(85000);
      expect(transaction.netAmount).toBe(85000);
      expect(transaction.status).toBe("pending");
      expect(transaction.createdAt).toBeInstanceOf(Date);
    });

    it("should generate unique transaction IDs", async () => {
      const transaction1 = await commissionService.createCommissionTransaction(
        "order-123",
        "partner-123",
        100000,
        "course"
      );

      const transaction2 = await commissionService.createCommissionTransaction(
        "order-124",
        "partner-124",
        200000,
        "document"
      );

      expect(transaction1.id).not.toBe(transaction2.id);
    });
  });

  describe("updateCommissionStatus", () => {
    it("should update commission status", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await commissionService.updateCommissionStatus("order-123", "paid");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Commission status updated for order order-123: paid"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getPartnerCommissionStats", () => {
    it("should return default stats structure", async () => {
      const stats = await commissionService.getPartnerCommissionStats(
        "partner-123"
      );

      expect(stats).toEqual({
        totalEarnings: 0,
        totalCommission: 0,
        pendingAmount: 0,
        paidAmount: 0,
        transactionCount: 0,
      });
    });
  });
});
