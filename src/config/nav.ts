/**
 * Shared nav config for Footer, Sidebar, QuickMenu.
 * Uses ROUTES so all links stay in sync.
 */

import { ROUTES } from 'config/routes';

export interface NavLink {
  label: string;
  href: string;
}

/** Liên kết nhanh (Footer cột 2) */
export const quickLinks: NavLink[] = [
  { label: 'Trang chủ', href: ROUTES.HOME },
  { label: 'Giới thiệu', href: ROUTES.GIOI_THIEU },
  { label: 'Khóa học', href: ROUTES.KHOA_HOC },
  { label: 'Thư viện', href: ROUTES.TAI_NGUYEN },
  { label: 'Blog', href: ROUTES.BAI_VIET },
];

/** Dịch vụ (Footer cột 3) - map về route có sẵn */
export const services: NavLink[] = [
  { label: 'Đào tạo trực tuyến', href: ROUTES.KHOA_HOC },
  { label: 'Tư vấn dự án', href: ROUTES.HOP_TAC },
  { label: 'Thiết kế BIM', href: ROUTES.KHOA_HOC },
  { label: 'Quản lý dự án', href: ROUTES.HOP_TAC },
  { label: 'Marketplace', href: ROUTES.CHO_MUA_BAN },
];

/** Hỗ trợ & pháp lý (Footer cột 4) */
export const supportLinks: NavLink[] = [
  { label: 'Liên hệ', href: ROUTES.CONTACT },
  { label: 'FAQ', href: ROUTES.FAQ },
  { label: 'Hỗ trợ', href: ROUTES.SUPPORT },
  { label: 'Chính sách bảo mật', href: ROUTES.CHINH_SACH_BAO_MAT },
  { label: 'Điều khoản sử dụng', href: ROUTES.DIEU_KHOAN },
];
