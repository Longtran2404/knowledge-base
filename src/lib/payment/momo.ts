/**
 * MoMo Payment Gateway Integration
 * Vietnamese e-wallet payment implementation
 */

import CryptoJS from 'crypto-js';

// MoMo Configuration
export const MOMO_CONFIG = {
  PARTNER_CODE: process.env.REACT_APP_MOMO_PARTNER_CODE || 'YOUR_PARTNER_CODE',
  ACCESS_KEY: process.env.REACT_APP_MOMO_ACCESS_KEY || 'YOUR_ACCESS_KEY',
  SECRET_KEY: process.env.REACT_APP_MOMO_SECRET_KEY || 'YOUR_SECRET_KEY',
  ENDPOINT: process.env.REACT_APP_MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api',
  CREATE_ORDER_URL: 'create',
  QUERY_ORDER_URL: 'query',
  CONFIRM_ORDER_URL: 'confirm',
  RETURN_URL: process.env.REACT_APP_MOMO_RETURN_URL || 'http://localhost:3000/payment/momo/return',
  NOTIFY_URL: process.env.REACT_APP_MOMO_NOTIFY_URL || 'http://localhost:3000/api/payment/momo/notify',
};

export interface MoMoOrderInfo {
  orderId: string;
  amount: number; // VND amount
  orderInfo: string;
  requestId?: string;
  extraData?: string;
  items?: MoMoOrderItem[];
  userInfo?: MoMoUserInfo;
  deliveryInfo?: MoMoDeliveryInfo;
  autoCapture?: boolean;
  lang?: 'vi' | 'en';
}

export interface MoMoOrderItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  manufacturer?: string;
  price: number;
  quantity: number;
  unit?: string;
  totalPrice: number;
}

export interface MoMoUserInfo {
  name: string;
  phoneNumber: string;
  email: string;
}

export interface MoMoDeliveryInfo {
  deliveryAddress: string;
  deliveryFee: number;
  quantity: number;
}

export interface MoMoResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  deeplinkMiniApp?: string;
}

export interface MoMoCallbackData {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

class MoMoService {
  private partnerCode: string;
  private accessKey: string;
  private secretKey: string;
  private endpoint: string;
  private returnUrl: string;
  private notifyUrl: string;

  constructor() {
    this.partnerCode = MOMO_CONFIG.PARTNER_CODE;
    this.accessKey = MOMO_CONFIG.ACCESS_KEY;
    this.secretKey = MOMO_CONFIG.SECRET_KEY;
    this.endpoint = MOMO_CONFIG.ENDPOINT;
    this.returnUrl = MOMO_CONFIG.RETURN_URL;
    this.notifyUrl = MOMO_CONFIG.NOTIFY_URL;
  }

  /**
   * Create payment request to MoMo
   */
  async createPayment(orderInfo: MoMoOrderInfo): Promise<MoMoResponse> {
    const requestId = orderInfo.requestId || `${orderInfo.orderId}_${Date.now()}`;
    const orderType = 'momo_wallet';

    // Prepare request data
    const requestData = {
      partnerCode: this.partnerCode,
      partnerName: 'Nam Long Center',
      storeId: 'NamLongCenter',
      requestId,
      amount: orderInfo.amount,
      orderId: orderInfo.orderId,
      orderInfo: orderInfo.orderInfo,
      redirectUrl: this.returnUrl,
      ipnUrl: this.notifyUrl,
      lang: orderInfo.lang || 'vi',
      extraData: orderInfo.extraData || '',
      requestType: 'captureWallet',
      autoCapture: orderInfo.autoCapture !== false,
    };

    // Add optional data
    if (orderInfo.items && orderInfo.items.length > 0) {
      (requestData as any).items = orderInfo.items;
    }

    if (orderInfo.userInfo) {
      (requestData as any).userInfo = orderInfo.userInfo;
    }

    if (orderInfo.deliveryInfo) {
      (requestData as any).deliveryInfo = orderInfo.deliveryInfo;
    }

    // Create signature
    const rawSignature = this.createRawSignature(requestData);
    const signature = this.createSignature(rawSignature);

    const finalRequestData = {
      ...requestData,
      signature,
    };

    try {
      const response = await fetch(`${this.endpoint}/${MOMO_CONFIG.CREATE_ORDER_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalRequestData),
      });

      const result: MoMoResponse = await response.json();
      return result;
    } catch (error) {
      throw new Error(`MoMo payment creation failed: ${error}`);
    }
  }

  /**
   * Query transaction status
   */
  async queryTransaction(orderId: string, requestId?: string): Promise<MoMoResponse> {
    const queryRequestId = requestId || `${orderId}_query_${Date.now()}`;

    const requestData = {
      partnerCode: this.partnerCode,
      requestId: queryRequestId,
      orderId,
      lang: 'vi',
    };

    const rawSignature = this.createRawSignature(requestData);
    const signature = this.createSignature(rawSignature);

    const finalRequestData = {
      ...requestData,
      signature,
    };

    try {
      const response = await fetch(`${this.endpoint}/${MOMO_CONFIG.QUERY_ORDER_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalRequestData),
      });

      const result: MoMoResponse = await response.json();
      return result;
    } catch (error) {
      throw new Error(`MoMo query transaction failed: ${error}`);
    }
  }

  /**
   * Verify callback data from MoMo
   */
  verifyCallback(callbackData: MoMoCallbackData): {
    isValid: boolean;
    isSuccess: boolean;
    message: string;
    orderId: string;
    amount: number;
    transactionId?: number;
  } {
    const { signature, ...params } = callbackData;

    // Create raw signature for verification
    const rawSignature = this.createRawSignature(params);
    const calculatedSignature = this.createSignature(rawSignature);

    const isValid = calculatedSignature === signature;
    const isSuccess = callbackData.resultCode === 0;

    let message = '';
    if (!isValid) {
      message = 'Chữ ký không hợp lệ';
    } else if (!isSuccess) {
      message = this.getResultMessage(callbackData.resultCode);
    } else {
      message = 'Thanh toán thành công';
    }

    return {
      isValid,
      isSuccess,
      message,
      orderId: callbackData.orderId,
      amount: callbackData.amount,
      transactionId: callbackData.transId,
    };
  }

  /**
   * Confirm payment (for manual capture)
   */
  async confirmPayment(
    orderId: string,
    requestId: string,
    amount: number,
    description?: string
  ): Promise<MoMoResponse> {
    const confirmRequestId = `${orderId}_confirm_${Date.now()}`;

    const requestData = {
      partnerCode: this.partnerCode,
      requestId: confirmRequestId,
      orderId,
      requestType: 'confirm',
      amount,
      lang: 'vi',
      description: description || `Confirm payment for order ${orderId}`,
    };

    const rawSignature = this.createRawSignature(requestData);
    const signature = this.createSignature(rawSignature);

    const finalRequestData = {
      ...requestData,
      signature,
    };

    try {
      const response = await fetch(`${this.endpoint}/${MOMO_CONFIG.CONFIRM_ORDER_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalRequestData),
      });

      const result: MoMoResponse = await response.json();
      return result;
    } catch (error) {
      throw new Error(`MoMo confirm payment failed: ${error}`);
    }
  }

  /**
   * Create raw signature string
   */
  private createRawSignature(data: Record<string, any>): string {
    // Sort keys alphabetically and create signature string
    const sortedKeys = Object.keys(data).sort();
    const signatureArray: string[] = [];

    for (const key of sortedKeys) {
      if (key !== 'signature' && data[key] !== undefined && data[key] !== null) {
        signatureArray.push(`${key}=${data[key]}`);
      }
    }

    return signatureArray.join('&');
  }

  /**
   * Create HMAC SHA256 signature
   */
  private createSignature(rawSignature: string): string {
    return CryptoJS.HmacSHA256(rawSignature, this.secretKey).toString();
  }

  /**
   * Get Vietnamese result message
   */
  private getResultMessage(resultCode: number): string {
    const messages: Record<number, string> = {
      0: 'Thành công',
      9000: 'Giao dịch được xác nhận thành công',
      8000: 'Giao dịch đang được xử lý',
      7000: 'Giao dịch đang chờ thanh toán',
      1000: 'Giao dịch đã được xác nhận thành công',
      11: 'Truy cập bị từ chối',
      12: 'Phiên bản API không được hỗ trợ cho yêu cầu này',
      13: 'Xác thực doanh nghiệp thất bại',
      20: 'Yêu cầu sai định dạng',
      21: 'Số tiền không hợp lệ',
      40: 'RequestId bị trùng',
      41: 'OrderId bị trùng',
      42: 'OrderId không hợp lệ hoặc không tồn tại',
      43: 'Yêu cầu bị từ chối vì có thể trùng lặp',
      1001: 'Giao dịch thanh toán thất bại do tài khoản người dùng không đủ tiền',
      1002: 'Giao dịch bị từ chối bởi nhà phát hành tài khoản người dùng',
      1003: 'Giao dịch bị hủy',
      1004: 'Giao dịch thất bại do không đủ thời gian để thanh toán',
      1005: 'Giao dịch thất bại do url hoặc QR code đã hết hạn',
      1006: 'Giao dịch thất bại do người dùng từ chối xác nhận thanh toán',
      2001: 'Giao dịch thất bại do sai thông tin liên kết',
      2007: 'Giao dịch thất bại do tài khoản người dùng đang bị tạm khóa',
      4001: 'Giao dịch thất bại do nhà cung cấp dịch vụ lỗi',
      4100: 'Giao dịch thất bại do người dùng chưa đăng ký hoặc chưa kích hoạt ví',
    };

    return messages[resultCode] || `Lỗi không xác định (${resultCode})`;
  }
}

// Export singleton instance
export const momoService = new MoMoService();
export default momoService;