/**
 * MoMo Payment Gateway Tests
 */

import { momoService } from './momo';
import type { MoMoOrderInfo, MoMoCallbackData } from './momo';

// Mock crypto-js
jest.mock('crypto-js', () => ({
  HmacSHA256: jest.fn().mockReturnValue({
    toString: () => 'mock-momo-signature',
  }),
}));

describe('MoMoService', () => {
  const mockOrderInfo: MoMoOrderInfo = {
    orderId: 'test-order-123',
    amount: 100000,
    orderInfo: 'Test payment for order test-order-123',
    userInfo: {
      name: 'Test Customer',
      phoneNumber: '0901234567',
      email: 'test@example.com',
    },
    lang: 'vi',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({
        partnerCode: 'TESTPARTNER',
        orderId: 'test-order-123',
        requestId: 'test-request-123',
        amount: 100000,
        responseTime: Date.now(),
        message: 'Success',
        resultCode: 0,
        payUrl: 'https://test-payment.momo.vn/gw_payment/transactionProcessor',
        qrCodeUrl: 'https://test-payment.momo.vn/qr/123456',
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const result = await momoService.createPayment(mockOrderInfo);

      expect(result.resultCode).toBe(0);
      expect(result.message).toBe('Success');
      expect(result.payUrl).toBeDefined();
      expect(result.qrCodeUrl).toBeDefined();
      expect(result.orderId).toBe(mockOrderInfo.orderId);
      expect(result.amount).toBe(mockOrderInfo.amount);
    });

    it('should include user info in request when provided', async () => {
      await momoService.createPayment(mockOrderInfo);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"userInfo"'),
        })
      );
    });

    it('should generate unique request ID when not provided', async () => {
      const orderWithoutRequestId = { ...mockOrderInfo };
      delete (orderWithoutRequestId as any).requestId;

      await momoService.createPayment(orderWithoutRequestId);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(mockOrderInfo.orderId),
        })
      );
    });

    it('should include delivery info when provided', async () => {
      const orderWithDelivery = {
        ...mockOrderInfo,
        deliveryInfo: {
          deliveryAddress: '123 Test Street',
          deliveryFee: 30000,
          quantity: 1,
        },
      };

      await momoService.createPayment(orderWithDelivery);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"deliveryInfo"'),
        })
      );
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(momoService.createPayment(mockOrderInfo))
        .rejects.toThrow('MoMo payment creation failed: Error: Network error');
    });

    it('should include signature in request', async () => {
      await momoService.createPayment(mockOrderInfo);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"signature":"mock-momo-signature"'),
        })
      );
    });
  });

  describe('queryTransaction', () => {
    const mockQueryResponse = {
      partnerCode: 'TESTPARTNER',
      orderId: 'test-order-123',
      requestId: 'query-request-123',
      amount: 100000,
      responseTime: Date.now(),
      message: 'Transaction found',
      resultCode: 0,
    };

    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(mockQueryResponse),
      }) as jest.Mock;
    });

    it('should query transaction status successfully', async () => {
      const result = await momoService.queryTransaction('test-order-123');

      expect(result.resultCode).toBe(0);
      expect(result.orderId).toBe('test-order-123');
      expect(result.message).toBe('Transaction found');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/query'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should include signature in query request', async () => {
      await momoService.queryTransaction('test-order-123');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"signature":"mock-momo-signature"'),
        })
      );
    });

    it('should handle query errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Query failed'));

      await expect(momoService.queryTransaction('test-order-123'))
        .rejects.toThrow('MoMo query transaction failed: Error: Query failed');
    });
  });

  describe('verifyCallback', () => {
    const mockCallbackData: MoMoCallbackData = {
      partnerCode: 'TESTPARTNER',
      orderId: 'test-order-123',
      requestId: 'test-request-123',
      amount: 100000,
      orderInfo: 'Test payment',
      orderType: 'momo_wallet',
      transId: 123456789,
      resultCode: 0,
      message: 'Success',
      payType: 'qr',
      responseTime: Date.now(),
      extraData: '',
      signature: 'mock-momo-signature',
    };

    it('should verify successful callback with valid signature', () => {
      const result = momoService.verifyCallback(mockCallbackData);

      expect(result.isValid).toBe(true);
      expect(result.isSuccess).toBe(true);
      expect(result.message).toBe('Thanh toán thành công');
      expect(result.orderId).toBe('test-order-123');
      expect(result.amount).toBe(100000);
      expect(result.transactionId).toBe(123456789);
    });

    it('should handle invalid signature', () => {
      const invalidCallbackData = {
        ...mockCallbackData,
        signature: 'invalid-signature',
      };

      const result = momoService.verifyCallback(invalidCallbackData);

      expect(result.isValid).toBe(false);
      expect(result.isSuccess).toBe(false);
      expect(result.message).toBe('Chữ ký không hợp lệ');
    });

    it('should handle payment failure with valid signature', () => {
      const failedCallbackData = {
        ...mockCallbackData,
        resultCode: 1001, // Insufficient balance
      };

      const result = momoService.verifyCallback(failedCallbackData);

      expect(result.isValid).toBe(true);
      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('không đủ tiền');
    });

    it('should handle unknown result codes', () => {
      const unknownCallbackData = {
        ...mockCallbackData,
        resultCode: 9999,
      };

      const result = momoService.verifyCallback(unknownCallbackData);

      expect(result.isValid).toBe(true);
      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('Lỗi không xác định');
    });
  });

  describe('confirmPayment', () => {
    const mockConfirmResponse = {
      partnerCode: 'TESTPARTNER',
      orderId: 'test-order-123',
      requestId: 'confirm-request-123',
      amount: 100000,
      responseTime: Date.now(),
      message: 'Confirm success',
      resultCode: 0,
    };

    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(mockConfirmResponse),
      }) as jest.Mock;
    });

    it('should confirm payment successfully', async () => {
      const result = await momoService.confirmPayment(
        'test-order-123',
        'test-request-123',
        100000,
        'Confirm test payment'
      );

      expect(result.resultCode).toBe(0);
      expect(result.message).toBe('Confirm success');
      expect(result.orderId).toBe('test-order-123');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/confirm'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should include description in confirm request', async () => {
      const description = 'Custom confirm description';

      await momoService.confirmPayment(
        'test-order-123',
        'test-request-123',
        100000,
        description
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(description),
        })
      );
    });

    it('should handle confirm errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Confirm failed'));

      await expect(
        momoService.confirmPayment(
          'test-order-123',
          'test-request-123',
          100000
        )
      ).rejects.toThrow('MoMo confirm payment failed: Error: Confirm failed');
    });
  });

  describe('signature creation', () => {
    it('should create raw signature with sorted parameters', () => {
      // Access private method for testing
      const createRawSignature = (momoService as any).createRawSignature;

      const testData = {
        orderId: 'test-order',
        amount: 100000,
        partnerCode: 'TEST',
        requestId: 'test-request',
      };

      const rawSignature = createRawSignature(testData);

      // Should sort keys alphabetically
      expect(rawSignature).toContain('amount=100000');
      expect(rawSignature).toContain('orderId=test-order');
      expect(rawSignature).toContain('partnerCode=TEST');
      expect(rawSignature).toContain('requestId=test-request');

      // Should join with &
      expect(rawSignature.split('&')).toHaveLength(4);
    });

    it('should exclude signature field from raw signature', () => {
      const createRawSignature = (momoService as any).createRawSignature;

      const testData = {
        orderId: 'test-order',
        signature: 'should-be-excluded',
        amount: 100000,
      };

      const rawSignature = createRawSignature(testData);

      expect(rawSignature).not.toContain('signature');
      expect(rawSignature).toContain('amount=100000');
      expect(rawSignature).toContain('orderId=test-order');
    });
  });

  describe('getResultMessage', () => {
    it('should return correct Vietnamese messages for result codes', () => {
      // Access private method for testing
      const getResultMessage = (momoService as any).getResultMessage;

      expect(getResultMessage(0)).toBe('Thành công');
      expect(getResultMessage(1001)).toContain('không đủ tiền');
      expect(getResultMessage(1003)).toContain('bị hủy');
      expect(getResultMessage(1006)).toContain('từ chối xác nhận');
      expect(getResultMessage(9999)).toContain('Lỗi không xác định');
    });
  });
});