/**
 * VNPay Payment Service
 * Tích hợp thanh toán với VNPay
 */

import crypto from 'crypto';
import { safeResponseJson } from '../safe-json';

export interface VNPayConfig {
  vnp_TmnCode: string; // Terminal ID
  vnp_HashSecret: string; // Hash Secret
  vnp_Url: string; // VNPay Gateway URL
  vnp_ReturnUrl: string; // Return URL
  vnp_ApiUrl?: string; // API URL for query transactions
}

export interface VNPayPaymentRequest {
  amount: number;
  orderInfo: string;
  orderType: string;
  txnRef: string;
  ipAddr: string;
  locale?: 'vn' | 'en';
  createDate?: string;
  expireDate?: string;
  bankCode?: string;
}

export interface VNPayResponse {
  paymentUrl?: string;
  error?: string;
  data?: Record<string, any>;
}

export class VNPayService {
  private config: VNPayConfig;

  constructor(config: VNPayConfig) {
    this.config = config;
  }

  /**
   * Tạo URL thanh toán VNPay
   */
  createPaymentUrl(paymentRequest: VNPayPaymentRequest): VNPayResponse {
    try {
      const vnp_Params: Record<string, string> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.config.vnp_TmnCode,
        vnp_Locale: paymentRequest.locale || 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: paymentRequest.txnRef,
        vnp_OrderInfo: paymentRequest.orderInfo,
        vnp_OrderType: paymentRequest.orderType,
        vnp_Amount: (paymentRequest.amount * 100).toString(), // VNPay expects amount in VND * 100
        vnp_ReturnUrl: this.config.vnp_ReturnUrl,
        vnp_IpAddr: paymentRequest.ipAddr,
        vnp_CreateDate: paymentRequest.createDate || this.formatDate(new Date()),
      };

      // Add optional parameters
      if (paymentRequest.expireDate) {
        vnp_Params.vnp_ExpireDate = paymentRequest.expireDate;
      }
      if (paymentRequest.bankCode) {
        vnp_Params.vnp_BankCode = paymentRequest.bankCode;
      }

      // Sort parameters
      const sortedParams = this.sortObject(vnp_Params);

      // Create query string
      const signData = new URLSearchParams(sortedParams).toString();

      // Generate secure hash
      const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      // Add hash to parameters
      sortedParams.vnp_SecureHash = signed;

      // Create payment URL
      const paymentUrl = this.config.vnp_Url + '?' + new URLSearchParams(sortedParams).toString();

      return { paymentUrl };
    } catch (error) {
      console.error('VNPay create payment URL error:', error);
      return { error: 'Không thể tạo link thanh toán' };
    }
  }

  /**
   * Xác thực phản hồi từ VNPay
   */
  verifyReturnUrl(vnp_Params: Record<string, string>): boolean {
    try {
      const secureHash = vnp_Params.vnp_SecureHash;
      delete vnp_Params.vnp_SecureHash;
      delete vnp_Params.vnp_SecureHashType;

      // Sort parameters
      const sortedParams = this.sortObject(vnp_Params);

      // Create sign data
      const signData = new URLSearchParams(sortedParams).toString();

      // Generate hash
      const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      return secureHash === signed;
    } catch (error) {
      console.error('VNPay verify return URL error:', error);
      return false;
    }
  }

  /**
   * Query transaction status
   */
  async queryTransaction(txnRef: string, transDate: string): Promise<VNPayResponse> {
    try {
      if (!this.config.vnp_ApiUrl) {
        return { error: 'API URL không được cấu hình' };
      }

      const vnp_Params: Record<string, string> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'querydr',
        vnp_TmnCode: this.config.vnp_TmnCode,
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: `Query transaction ${txnRef}`,
        vnp_TransactionNo: '',
        vnp_TransDate: transDate,
        vnp_CreateDate: this.formatDate(new Date()),
        vnp_IpAddr: '127.0.0.1',
      };

      // Sort and sign parameters
      const sortedParams = this.sortObject(vnp_Params);
      const signData = new URLSearchParams(sortedParams).toString();
      const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
      sortedParams.vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      // Make API request
      const response = await fetch(this.config.vnp_ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(sortedParams).toString(),
      });

      const data = await response.text();
      const parsedData = new URLSearchParams(data);
      const result: Record<string, any> = {};

      for (const [key, value] of parsedData.entries()) {
        result[key] = value;
      }

      return { data: result };
    } catch (error) {
      console.error('VNPay query transaction error:', error);
      return { error: 'Không thể truy vấn giao dịch' };
    }
  }

  /**
   * Sort object parameters
   */
  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const str: string[] = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }

    str.sort();

    for (let i = 0; i < str.length; i++) {
      const key = str[i];
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }

    return sorted;
  }

  /**
   * Format date for VNPay
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Generate transaction reference
   */
  static generateTxnRef(): string {
    return `NLC_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  /**
   * Get client IP address (for browser environment)
   */
  static async getClientIP(): Promise<string> {
    try {
      // In production, you might want to use a proper IP detection service
      // For development, return localhost
      if (typeof window !== 'undefined') {
        // Browser environment - use a service to get public IP
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await safeResponseJson(response, { ip: '127.0.0.1' } as { ip?: string });
        return data.ip || '127.0.0.1';
      }
      return '127.0.0.1';
    } catch (error) {
      console.warn('Could not get client IP:', error);
      return '127.0.0.1';
    }
  }
}

/**
 * Default VNPay configuration for Knowledge Base
 * Note: These should be moved to environment variables in production
 */
export const createVNPayService = (): VNPayService => {
  const config: VNPayConfig = {
    vnp_TmnCode: process.env.REACT_APP_VNPAY_TMN_CODE || 'VNPAY_DEMO', // Replace with your Terminal ID
    vnp_HashSecret: process.env.REACT_APP_VNPAY_HASH_SECRET || 'VNPAY_HASH_SECRET', // Replace with your Hash Secret
    vnp_Url: process.env.REACT_APP_VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // Sandbox URL
    vnp_ReturnUrl: process.env.REACT_APP_VNPAY_RETURN_URL || 'http://localhost:3000/payment/return',
    vnp_ApiUrl: process.env.REACT_APP_VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
  };

  return new VNPayService(config);
};

// Export bank codes for VNPay
export const VNPayBankCodes = {
  VNPAYQR: 'VNPAYQR', // VNPay QR
  VNBANK: 'VNBANK', // Nội địa
  INTCARD: 'INTCARD', // Thẻ quốc tế
  VIETCOMBANK: 'VCB',
  TECHCOMBANK: 'TCB',
  VIETINBANK: 'CTG',
  AGRIBANK: 'VBA',
  ACB: 'ACB',
  BIDV: 'BIDV',
  SACOMBANK: 'STB',
  MBBANK: 'MB',
  VPBANK: 'VPB',
  TPBANK: 'TPB',
  DONGABANK: 'DAB',
  EXIMBANK: 'EIB',
  HDBANK: 'HDB',
  LIENVIETPOSTBANK: 'LPB',
  MARITIMEBANK: 'MSB',
  NAMABANK: 'NVB',
  OCEANBANK: 'OJB',
  PGBANK: 'PGB',
  PUBLICBANK: 'PVCB',
  SAIGONBANK: 'SGB',
  SEAABANK: 'SEAB',
  SHBANK: 'SHB',
  VIETABANK: 'VAB',
  VIETCAPITALBANK: 'VCCB',
  VIETBANK: 'VIB',
} as const;