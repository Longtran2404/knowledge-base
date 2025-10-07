/**
 * VNPay Payment Gateway Tests
 */

import { vnPayService } from './vnpay';
import type { VNPayOrderInfo } from './vnpay';

// Mock crypto-js
jest.mock('crypto-js', () => ({
  HmacSHA512: jest.fn().mockReturnValue({
    toString: () => 'mock-hash-signature',
  }),
}));

describe('VNPayService', () => {
  const mockOrderInfo: VNPayOrderInfo = {
    orderId: 'test-order-123',
    amount: 100000,
    orderDescription: 'Test payment for order test-order-123',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    locale: 'vn',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentUrl', () => {
    it('should generate a valid payment URL with correct parameters', async () => {
      const result = await vnPayService.createPaymentUrl(mockOrderInfo);

      expect(result).toHaveProperty('paymentUrl');
      expect(result).toHaveProperty('orderId', mockOrderInfo.orderId);
      expect(result).toHaveProperty('amount', mockOrderInfo.amount);
      expect(result).toHaveProperty('transactionRef');

      // Verify payment URL structure
      expect(result.paymentUrl).toContain('vnp_Amount=10000000'); // Amount * 100
      expect(result.paymentUrl).toContain('vnp_TxnRef=');
      expect(result.paymentUrl).toContain('vnp_SecureHash=mock-hash-signature');
      expect(result.paymentUrl).toContain('vnp_OrderInfo=');
    });

    it('should include bank code when provided', async () => {
      const orderWithBankCode = {
        ...mockOrderInfo,
        bankCode: 'NCB',
      };

      const result = await vnPayService.createPaymentUrl(orderWithBankCode);

      expect(result.paymentUrl).toContain('vnp_BankCode=NCB');
    });

    it('should use correct locale', async () => {
      const orderWithEnglish = {
        ...mockOrderInfo,
        locale: 'en' as const,
      };

      const result = await vnPayService.createPaymentUrl(orderWithEnglish);

      expect(result.paymentUrl).toContain('vnp_Locale=en');
    });

    it('should generate unique transaction references', async () => {
      const result1 = await vnPayService.createPaymentUrl(mockOrderInfo);
      const result2 = await vnPayService.createPaymentUrl(mockOrderInfo);

      expect(result1.transactionRef).not.toBe(result2.transactionRef);
    });

    it('should convert amount to VNPay format (multiply by 100)', async () => {
      const result = await vnPayService.createPaymentUrl(mockOrderInfo);

      expect(result.paymentUrl).toContain('vnp_Amount=10000000'); // 100000 * 100
    });
  });

  describe('verifyReturn', () => {
    const mockReturnData = {
      vnp_Amount: '10000000',
      vnp_BankCode: 'NCB',
      vnp_BankTranNo: 'VNP123456',
      vnp_CardType: 'ATM',
      vnp_OrderInfo: 'Test payment',
      vnp_PayDate: '20240101120000',
      vnp_ResponseCode: '00',
      vnp_TmnCode: 'TESTCODE',
      vnp_TransactionNo: '123456789',
      vnp_TransactionStatus: '00',
      vnp_TxnRef: 'test-order-123_1234567890',
      vnp_SecureHash: 'mock-hash-signature',
      vnp_SecureHashType: 'SHA512',
    };

    it('should verify successful payment with valid signature', () => {
      const result = vnPayService.verifyReturn(mockReturnData);

      expect(result.isValid).toBe(true);
      expect(result.isSuccess).toBe(true);
      expect(result.message).toBe('Thanh toán thành công');
      expect(result.orderId).toBe('test-order-123');
      expect(result.amount).toBe(100000); // Converted back from VNPay format
      expect(result.transactionNo).toBe('123456789');
    });

    it('should handle invalid signature', () => {
      const invalidData = {
        ...mockReturnData,
        vnp_SecureHash: 'invalid-signature',
      };

      const result = vnPayService.verifyReturn(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.isSuccess).toBe(false);
      expect(result.message).toBe('Chữ ký không hợp lệ');
    });

    it('should handle payment failure with valid signature', () => {
      const failedPaymentData = {
        ...mockReturnData,
        vnp_ResponseCode: '24', // User cancelled
      };

      const result = vnPayService.verifyReturn(failedPaymentData);

      expect(result.isValid).toBe(true);
      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('hủy giao dịch');
    });

    it('should parse order ID from transaction reference', () => {
      const result = vnPayService.verifyReturn(mockReturnData);

      expect(result.orderId).toBe('test-order-123');
    });

    it('should convert amount back to original format', () => {
      const result = vnPayService.verifyReturn(mockReturnData);

      expect(result.amount).toBe(100000); // 10000000 / 100
    });
  });

  describe('formatDate', () => {
    it('should format date in VNPay format (yyyyMMddHHmmss)', () => {
      const testDate = new Date('2024-01-01T12:30:45.000Z');

      // Access private method for testing
      const formatDate = (vnPayService as any).formatDate;
      const formatted = formatDate(testDate);

      expect(formatted).toMatch(/^\d{14}$/); // 14 digits
      expect(formatted).toBe('20240101123045');
    });
  });

  describe('getResponseMessage', () => {
    it('should return correct Vietnamese messages for response codes', () => {
      // Access private method for testing
      const getResponseMessage = (vnPayService as any).getResponseMessage;

      expect(getResponseMessage('00')).toBe('Giao dịch thành công');
      expect(getResponseMessage('24')).toContain('hủy giao dịch');
      expect(getResponseMessage('51')).toContain('không đủ số dư');
      expect(getResponseMessage('99')).toContain('lỗi khác');
      expect(getResponseMessage('UNKNOWN')).toBe('Lỗi không xác định');
    });
  });

  describe('queryTransaction', () => {
    beforeEach(() => {
      // Mock fetch for API calls
      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({
          vnp_ResponseCode: '00',
          vnp_Message: 'Success',
          vnp_TransactionStatus: '00',
        }),
      }) as jest.Mock;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should query transaction status successfully', async () => {
      const result = await vnPayService.queryTransaction(
        'test-order-123_1234567890',
        '20240101120000'
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('merchant_webapi/api/transaction'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('test-order-123_1234567890'),
        })
      );

      expect(result).toEqual({
        vnp_ResponseCode: '00',
        vnp_Message: 'Success',
        vnp_TransactionStatus: '00',
      });
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        vnPayService.queryTransaction(
          'test-order-123_1234567890',
          '20240101120000'
        )
      ).rejects.toThrow('Query transaction failed: Error: Network error');
    });
  });
});