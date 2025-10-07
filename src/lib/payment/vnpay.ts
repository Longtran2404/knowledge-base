/**
 * VNPay Payment Gateway Integration
 * Vietnamese payment gateway implementation
 */

import CryptoJS from 'crypto-js';

/**
 * Get client IP address
 * Falls back to localhost if unable to fetch
 */
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    const data = await response.json();
    return data.ip || '127.0.0.1';
  } catch (error) {
    console.warn('Failed to get client IP, using fallback:', error);
    return '127.0.0.1';
  }
}

// VNPay Configuration
export const VNPAY_CONFIG = {
  VERSION: '2.1.0',
  COMMAND: 'pay',
  TMN_CODE: process.env.REACT_APP_VNPAY_TMN_CODE || 'YOUR_TMN_CODE',
  HASH_SECRET: process.env.REACT_APP_VNPAY_HASH_SECRET || 'YOUR_HASH_SECRET',
  URL: process.env.REACT_APP_VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  RETURN_URL: process.env.REACT_APP_VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay/return',
  API_URL: process.env.REACT_APP_VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
};

export interface VNPayOrderInfo {
  orderId: string;
  amount: number; // VND amount (no decimal)
  orderDescription: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  productType?: string;
  locale?: 'vn' | 'en';
  bankCode?: string;
}

export interface VNPayResponse {
  paymentUrl: string;
  orderId: string;
  amount: number;
  transactionRef: string;
}

export interface VNPayReturnData {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_SecureHashType: string;
}

class VNPayService {
  private tmnCode: string;
  private hashSecret: string;
  private url: string;
  private returnUrl: string;

  constructor() {
    this.tmnCode = VNPAY_CONFIG.TMN_CODE;
    this.hashSecret = VNPAY_CONFIG.HASH_SECRET;
    this.url = VNPAY_CONFIG.URL;
    this.returnUrl = VNPAY_CONFIG.RETURN_URL;
  }

  /**
   * Create payment URL for VNPay gateway
   */
  async createPaymentUrl(orderInfo: VNPayOrderInfo): Promise<VNPayResponse> {
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 minutes

    // Generate transaction reference
    const transactionRef = `${orderInfo.orderId}_${Date.now()}`;

    // Get client IP address
    const clientIP = await getClientIP();

    // VNPay parameters
    const vnpParams: Record<string, string> = {
      vnp_Version: VNPAY_CONFIG.VERSION,
      vnp_Command: VNPAY_CONFIG.COMMAND,
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: (orderInfo.amount * 100).toString(), // Convert to VNPay format (multiply by 100)
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: clientIP, // Get real client IP
      vnp_Locale: orderInfo.locale || 'vn',
      vnp_OrderInfo: orderInfo.orderDescription,
      vnp_OrderType: orderInfo.productType || 'other',
      vnp_ReturnUrl: this.returnUrl,
      vnp_TxnRef: transactionRef,
      vnp_ExpireDate: expireDate,
    };

    // Add optional parameters
    if (orderInfo.bankCode) {
      vnpParams.vnp_BankCode = orderInfo.bankCode;
    }

    // Sort parameters alphabetically
    const sortedParams = Object.keys(vnpParams)
      .sort()
      .reduce((result: Record<string, string>, key) => {
        result[key] = vnpParams[key];
        return result;
      }, {});

    // Create query string
    const queryString = Object.keys(sortedParams)
      .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&');

    // Create secure hash
    const signData = queryString;
    const secureHash = CryptoJS.HmacSHA512(signData, this.hashSecret).toString();

    // Final payment URL
    const paymentUrl = `${this.url}?${queryString}&vnp_SecureHash=${secureHash}`;

    return {
      paymentUrl,
      orderId: orderInfo.orderId,
      amount: orderInfo.amount,
      transactionRef,
    };
  }

  /**
   * Verify return data from VNPay
   */
  verifyReturn(returnData: VNPayReturnData): {
    isValid: boolean;
    isSuccess: boolean;
    message: string;
    orderId: string;
    amount: number;
    transactionNo?: string;
  } {
    const { vnp_SecureHash, ...params } = returnData;

    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: Record<string, string>, key) => {
        result[key] = params[key as keyof typeof params];
        return result;
      }, {});

    // Create query string for verification
    const queryString = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');

    // Verify secure hash
    const calculatedHash = CryptoJS.HmacSHA512(queryString, this.hashSecret).toString();
    const isValid = calculatedHash === vnp_SecureHash;

    // Check transaction status
    const isSuccess = returnData.vnp_ResponseCode === '00';

    // Parse order ID from transaction reference
    const orderId = returnData.vnp_TxnRef.split('_')[0];
    const amount = parseInt(returnData.vnp_Amount) / 100; // Convert back to VND

    let message = '';
    if (!isValid) {
      message = 'Chữ ký không hợp lệ';
    } else if (!isSuccess) {
      message = this.getResponseMessage(returnData.vnp_ResponseCode);
    } else {
      message = 'Thanh toán thành công';
    }

    return {
      isValid,
      isSuccess,
      message,
      orderId,
      amount,
      transactionNo: returnData.vnp_TransactionNo,
    };
  }

  /**
   * Query transaction status from VNPay
   */
  async queryTransaction(transactionRef: string, transactionDate: string): Promise<any> {
    const clientIP = await getClientIP();

    const requestData = {
      vnp_RequestId: Date.now().toString(),
      vnp_Version: VNPAY_CONFIG.VERSION,
      vnp_Command: 'querydr',
      vnp_TmnCode: this.tmnCode,
      vnp_TxnRef: transactionRef,
      vnp_OrderInfo: `Query transaction ${transactionRef}`,
      vnp_TransactionDate: transactionDate,
      vnp_CreateDate: this.formatDate(new Date()),
      vnp_IpAddr: clientIP,
    };

    // Create secure hash for API request
    const sortedData = Object.keys(requestData)
      .sort()
      .reduce((result: Record<string, string>, key) => {
        result[key] = requestData[key as keyof typeof requestData];
        return result;
      }, {});

    const queryString = Object.keys(sortedData)
      .map(key => `${key}=${sortedData[key]}`)
      .join('&');

    const secureHash = CryptoJS.HmacSHA512(queryString, this.hashSecret).toString();

    const finalData = {
      ...requestData,
      vnp_SecureHash: secureHash,
    };

    try {
      const response = await fetch(VNPAY_CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      return await response.json();
    } catch (error) {
      throw new Error(`Query transaction failed: ${error}`);
    }
  }

  /**
   * Format date for VNPay (yyyyMMddHHmmss)
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
   * Get Vietnamese error message from response code
   */
  private getResponseMessage(code: string): string {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
    };

    return messages[code] || 'Lỗi không xác định';
  }
}

// Export singleton instance
export const vnPayService = new VNPayService();
export default vnPayService;