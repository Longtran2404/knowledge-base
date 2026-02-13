/**
 * Single source of truth for all route paths.
 * Import ROUTES here instead of hardcoding paths in components.
 */

export const ROUTES = {
  // Public - home
  HOME: '/',
  TRANG_CHU: '/trang-chu',

  // Public - content
  GIOI_THIEU: '/gioi-thieu',
  KHOA_HOC: '/khoa-hoc',
  BAI_VIET: '/bai-viet',
  SAN_PHAM: '/san-pham',
  TAI_NGUYEN: '/tai-nguyen',
  TAI_LIEU: '/tai-lieu',
  HOP_TAC: '/hop-tac',
  CHO_MUA_BAN: '/cho-mua-ban',
  WORKFLOWS: '/workflows',
  TAI_LEN: '/tai-len',

  // Public - support
  CONTACT: '/contact',
  FAQ: '/faq',
  SUPPORT: '/support',
  CHINH_SACH_BAO_MAT: '/chinh-sach-bao-mat',
  DIEU_KHOAN: '/dieu-khoan-su-dung',

  // Auth (no header/footer)
  DANG_NHAP: '/dang-nhap',
  XAC_MINH_EMAIL: '/xac-minh-email',
  QUEN_MAT_KHAU: '/quen-mat-khau',
  DAT_LAI_MAT_KHAU: '/dat-lai-mat-khau',
  GUI_LAI_XAC_MINH: '/gui-lai-xac-minh',

  // Legal
  BAO_MAT: '/bao-mat',
  QUAN_LY_TAI_KHOAN: '/quan-ly-tai-khoan',
  CHANGE_PASSWORD: '/change-password',
  LICH_SU_HOAT_DONG: '/lich-su-hoat-dong',
  DIEU_KHOAN_BAO_MAT: '/dieu-khoan-bao-mat',

  // Success pages
  GOI_DICH_VU: '/goi-dich-vu',
  HUONG_DAN: '/huong-dan',
  THANH_CONG_FREE: '/thanh-cong/free',
  THANH_CONG_PREMIUM: '/thanh-cong/premium',
  THANH_CONG_PARTNER: '/thanh-cong/partner',

  // User
  HO_SO: '/ho-so',
  QUAN_LY: '/quan-ly',
  ACCOUNT_UPGRADE: '/account/upgrade',

  // Admin
  ADMIN_WORKFLOWS: '/admin/workflows',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_CMS: '/admin/cms',
  ADMIN_PAYMENT_METHODS: '/admin/payment-methods',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_SETUP: '/admin/setup',
  ADMIN_THANH_TOAN: '/admin/thanh-toan',

  // Other
  DEMO_NOTIFICATIONS: '/demo/notifications',
  SHOWCASE: '/showcase',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
