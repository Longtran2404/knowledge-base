// Payment processing utilities
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'credit_card' | 'e_wallet' | 'cod';
  icon: string;
  isActive: boolean;
}

export interface PaymentData {
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    type: 'bank_transfer',
    icon: 'bank',
    isActive: true
  },
  {
    id: 'credit_card',
    name: 'Thẻ tín dụng/ghi nợ',
    type: 'credit_card',
    icon: 'credit-card',
    isActive: true
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    type: 'e_wallet',
    icon: 'momo',
    isActive: true
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    type: 'e_wallet',
    icon: 'zalopay',
    isActive: true
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    type: 'e_wallet',
    icon: 'vnpay',
    isActive: true
  }
];

export const processPayment = async (
  paymentData: PaymentData,
  method: PaymentMethod
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful payment
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId
    };
  } catch (error) {
    return {
      success: false,
      error: 'Có lỗi xảy ra khi xử lý thanh toán'
    };
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const calculateDiscount = (originalPrice: number, discountPercent: number): number => {
  return Math.round((originalPrice * discountPercent) / 100);
};

export const calculateTotal = (items: Array<{ price: number; quantity: number }>): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};
