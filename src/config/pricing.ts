/**
 * Pricing Configuration - Single Source of Truth
 * Tất cả giá gói membership được định nghĩa tại đây
 */

export interface PricingPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  limits: {
    maxFileSize: number; // MB
    maxStorage: number; // MB, -1 = unlimited
    maxUploadsPerDay: number; // -1 = unlimited
    maxProjects?: number;
    apiAccess?: boolean;
  };
  isPopular: boolean;
  isActive: boolean;
  buttonText: string;
  badge?: string;
}

// Central pricing configuration
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free-plan',
    code: 'free',
    name: 'Miễn phí',
    description: 'Gói cơ bản cho người dùng mới',
    price: 0,
    currency: 'VND',
    billingCycle: 'monthly',
    features: [
      'Upload file tối đa 10MB',
      'Lưu trữ 100MB',
      'Truy cập tài liệu công khai',
      'Hỗ trợ cơ bản qua email',
      '3 projects tối đa'
    ],
    limits: {
      maxFileSize: 10,
      maxStorage: 100,
      maxUploadsPerDay: 5,
      maxProjects: 3,
      apiAccess: false
    },
    isPopular: false,
    isActive: true,
    buttonText: 'Sử dụng miễn phí'
  },
  {
    id: 'member-plan',
    code: 'member',
    name: 'Thành viên',
    description: 'Gói phổ biến cho người dùng thường xuyên',
    price: 199000,
    currency: 'VND',
    billingCycle: 'monthly',
    features: [
      'Upload file tối đa 50MB',
      'Lưu trữ 5GB',
      'Truy cập tài liệu độc quyền',
      'Hỗ trợ ưu tiên',
      'Tải về không giới hạn',
      'Chia sẻ file riêng tư',
      '20 projects tối đa',
      'Thống kê chi tiết'
    ],
    limits: {
      maxFileSize: 50,
      maxStorage: 5120, // 5GB
      maxUploadsPerDay: 50,
      maxProjects: 20,
      apiAccess: false
    },
    isPopular: true,
    isActive: true,
    buttonText: 'Nâng cấp ngay',
    badge: 'PHỔ BIẾN'
  },
  {
    id: 'premium-plan',
    code: 'premium',
    name: 'Premium',
    description: 'Gói cao cấp với đầy đủ tính năng',
    price: 399000,
    currency: 'VND',
    billingCycle: 'monthly',
    features: [
      'Upload file tối đa 500MB',
      'Lưu trữ không giới hạn',
      'Truy cập tất cả tài liệu',
      'Hỗ trợ 24/7',
      'API access',
      'Phân tích chi tiết',
      'Chia sẻ team không giới hạn',
      'Backup tự động',
      'Projects không giới hạn',
      'White-label option'
    ],
    limits: {
      maxFileSize: 500,
      maxStorage: -1, // unlimited
      maxUploadsPerDay: -1, // unlimited
      maxProjects: -1, // unlimited
      apiAccess: true
    },
    isPopular: false,
    isActive: true,
    buttonText: 'Nâng cấp Premium'
  }
];

// Helper functions
export const getPlanByCode = (code: string): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.code === code);
};

export const getActivePlans = (): PricingPlan[] => {
  return PRICING_PLANS.filter(plan => plan.isActive);
};

export const getPopularPlan = (): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.isPopular);
};

export const formatPrice = (price: number, currency: string = 'VND'): string => {
  if (price === 0) return 'Miễn phí';
  return `${price.toLocaleString('vi-VN')} ${currency}`;
};

export const getPlanLimits = (planCode: string) => {
  const plan = getPlanByCode(planCode);
  return plan?.limits || PRICING_PLANS[0].limits;
};

// Export for backward compatibility
export const MEMBERSHIP_PRICES = {
  FREE: 0,
  MEMBER: 199000,
  PREMIUM: 399000
} as const;

export const PRICING_CONFIG = {
  currency: 'VND',
  defaultPlan: 'free',
  popularPlan: 'member',
  plans: PRICING_PLANS
} as const;