/**
 * Subscription plans - Single source of truth cho 3 gói: Miễn phí, Hội viên Premium, Đối tác.
 * Dùng cho PricingPage (/goi-dich-vu) và HopTacPage (/hop-tac).
 */

export interface SubscriptionPlanItem {
  id: 'free' | 'premium' | 'partner';
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  period: string;
  features: string[];
  limitations: string[];
  buttonText: string;
  popular: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanItem[] = [
  {
    id: 'free',
    name: 'Miễn phí',
    description: 'Gói cơ bản cho người dùng mới',
    price: 0,
    priceDisplay: '0đ',
    period: 'tháng',
    features: [
      'Tải 10 tài liệu trong 1 tháng',
      'Xem preview khóa học',
      'Truy cập tài nguyên cơ bản',
      'Hỗ trợ cộng đồng',
      'Không xem được khóa học đầy đủ',
      'Không tải được sản phẩm',
    ],
    limitations: [
      'Giới hạn 10 tài liệu/tháng',
      'Không có quyền truy cập đầy đủ',
    ],
    buttonText: 'Bắt đầu miễn phí',
    popular: false,
  },
  {
    id: 'premium',
    name: 'Hội viên Premium',
    description: 'Gói cao cấp cho người dùng chuyên nghiệp',
    price: 299000,
    priceDisplay: '299.000đ',
    period: 'tháng',
    features: [
      'Tải tài liệu không giới hạn',
      'Xem khóa học miễn phí đầy đủ',
      'Truy cập tài nguyên thực hành',
      'Tải sản phẩm và tools',
      'Hướng dẫn sử dụng chi tiết',
      'Hỗ trợ ưu tiên 24/7',
      'Chứng chỉ hoàn thành khóa học',
      'Cập nhật nội dung mới nhất',
    ],
    limitations: [],
    buttonText: 'Đăng ký Premium',
    popular: true,
  },
  {
    id: 'partner',
    name: 'Đối tác',
    description: 'Gói đặc biệt cho đối tác và chuyên gia',
    price: 199000,
    priceDisplay: '199.000đ',
    period: 'tháng',
    features: [
      'Xem khóa học theo chuyên ngành',
      'Tài liệu chuyên ngành đầy đủ',
      'Tools và plugins chuyên ngành',
      'Đăng tải tài liệu của riêng bạn',
      'Đăng tải sản phẩm của riêng bạn',
      'Quản lý nội dung cá nhân',
      'Hỗ trợ kỹ thuật chuyên sâu',
      'Cơ hội hợp tác kinh doanh',
      'Chia sẻ doanh thu từ nội dung',
    ],
    limitations: [],
    buttonText: 'Trở thành đối tác',
    popular: false,
  },
];
