/**
 * Modern Sidebar V2 - Complete Redesign
 * Ultra modern sidebar với floating quick actions và full navigation
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Package,
  FileText,
  Upload,
  Users,
  ShoppingBag,
  Search,
  X,
  Menu,
  LogIn,
  Sparkles,
  User,
  LayoutDashboard,
  CreditCard,
  Settings,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { QuickMenuPanel } from './QuickMenuPanel';
import { ROUTES } from 'config/routes';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  gradient?: string;
  adminOnly?: boolean; // Chỉ hiển thị cho admin
}

const mainNavItems: NavItem[] = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: <Home className="h-5 w-5" />,
    path: ROUTES.TRANG_CHU,
    gradient: 'from-primary to-primary/90',
  },
  {
    id: 'courses',
    label: 'Khóa học',
    icon: <BookOpen className="h-5 w-5" />,
    path: ROUTES.KHOA_HOC,
    gradient: 'from-primary to-primary/85',
  },
  {
    id: 'products',
    label: 'Sản phẩm',
    icon: <Package className="h-5 w-5" />,
    path: ROUTES.SAN_PHAM,
    gradient: 'from-primary/90 to-primary/80',
  },
  {
    id: 'resources',
    label: 'Tài nguyên',
    icon: <FileText className="h-5 w-5" />,
    path: ROUTES.TAI_NGUYEN,
    gradient: 'from-primary to-primary/85',
  },
  {
    id: 'upload',
    label: 'Tải lên tài liệu',
    icon: <Upload className="h-5 w-5" />,
    path: ROUTES.TAI_LEN,
    gradient: 'from-primary/90 to-primary',
  },
  {
    id: 'partners',
    label: 'Hợp tác',
    icon: <Users className="h-5 w-5" />,
    path: ROUTES.HOP_TAC,
    gradient: 'from-primary to-primary/90',
  },
  {
    id: 'marketplace',
    label: 'Chợ mua bán',
    icon: <ShoppingBag className="h-5 w-5" />,
    path: ROUTES.CHO_MUA_BAN,
    badge: 0,
    gradient: 'from-primary/85 to-primary/80',
  },
  {
    id: 'workflows',
    label: 'n8n Workflows',
    icon: <Sparkles className="h-5 w-5" />,
    path: ROUTES.WORKFLOWS,
    gradient: 'from-primary to-primary/90',
  },
  // Admin Navigation Items
  {
    id: 'admin-dashboard',
    label: 'Dashboard Admin',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: ROUTES.ADMIN_DASHBOARD,
    gradient: 'from-primary to-primary/90',
    adminOnly: true,
  },
  {
    id: 'admin-users',
    label: 'Quản lý Người dùng',
    icon: <Users className="h-5 w-5" />,
    path: ROUTES.ADMIN_USERS,
    gradient: 'from-primary/95 to-primary/85',
    adminOnly: true,
  },
  {
    id: 'admin-subscriptions',
    label: 'Quản lý Subscriptions',
    icon: <CreditCard className="h-5 w-5" />,
    path: ROUTES.ADMIN_SUBSCRIPTIONS,
    gradient: 'from-primary to-primary/90',
    adminOnly: true,
  },
  {
    id: 'admin-cms',
    label: 'Quản lý Nội dung',
    icon: <Globe className="h-5 w-5" />,
    path: ROUTES.ADMIN_CMS,
    gradient: 'from-primary/90 to-primary/80',
    adminOnly: true,
  },
  {
    id: 'admin-payments',
    label: 'Phương thức Thanh toán',
    icon: <Settings className="h-5 w-5" />,
    path: ROUTES.ADMIN_PAYMENT_METHODS,
    gradient: 'from-primary/85 to-primary/80',
    adminOnly: true,
  },
  {
    id: 'admin-thanh-toan',
    label: 'Xác minh thanh toán',
    icon: <CreditCard className="h-5 w-5" />,
    path: ROUTES.ADMIN_THANH_TOAN,
    gradient: 'from-primary to-primary/90',
    adminOnly: true,
  },
];

export function ModernSidebarV2() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const location = useLocation();

  // Clear pending when location matches
  useEffect(() => {
    if (pendingPath && location.pathname === pendingPath) {
      setPendingPath(null);
    }
  }, [location.pathname, pendingPath]);
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();

  // Check if desktop on mount and resize
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Close sidebar when clicking outside on desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('modern-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle-button');

      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Lọc items dựa trên role và search query
  const filteredItems = mainNavItems.filter((item) => {
    // Nếu là admin-only item, chỉ hiển thị cho admin và quan_ly
    if (item.adminOnly) {
      const isAdmin = userProfile?.account_role === 'admin' || userProfile?.account_role === 'quan_ly';
      if (!isAdmin) return false;
    }
    // Lọc theo search query
    return item.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleNavClick = () => {
    if (!isDesktop) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Toggle Button - Both Mobile and Desktop */}
      {!isOpen && (
        <button
          id="sidebar-toggle-button"
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 rounded-xl bg-primary text-primary-foreground shadow-medium hover:shadow-strong transition-shadow"
          aria-label="Mở menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      <QuickMenuPanel />

      {/* Overlay - Show when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            id="modern-sidebar"
            key="sidebar"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 top-0 h-screen w-80 bg-card border-r border-border z-50 flex flex-col shadow-strong overflow-hidden"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/weblogo/knowledge-logo-01.svg"
                      alt="Knowledge Base"
                      className="w-12 h-12 rounded-xl object-contain shrink-0"
                    />
                    <div>
                      <h2 className="font-bold text-foreground">Knowledge Base</h2>
                      <p className="text-xs text-muted-foreground">Xây dựng tương lai</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    aria-label="Đóng menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
                {filteredItems.map((item) => {
                  const isActive = location.pathname === item.path || pendingPath === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => {
                        setPendingPath(item.path);
                        handleNavClick();
                      }}
                      className={isActive ? 'block' : ''}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span className="flex-1 font-medium">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 border-t border-border">
                {isAuthenticated && userProfile ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => { navigate('/ho-so'); handleNavClick(); }}
                    onKeyDown={(e) => e.key === 'Enter' && (navigate('/ho-so'), handleNavClick())}
                    className="p-4 rounded-xl bg-muted/50 border border-border cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                          {userProfile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{userProfile.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                      </div>
                      <User className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                    {(userProfile.account_role === 'admin' || userProfile.account_role === 'quan_ly') && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); navigate('/admin/dashboard'); handleNavClick(); }}
                          className="px-3 py-2 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          Dashboard
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); navigate('/admin/subscriptions'); handleNavClick(); }}
                          className="px-3 py-2 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Subscriptions
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => { navigate('/dang-nhap'); handleNavClick(); }}
                      className="w-full px-4 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-5 w-5" />
                      Đăng nhập
                    </button>
                    <button
                      type="button"
                      onClick={() => { navigate('/dang-nhap?mode=signup'); handleNavClick(); }}
                      className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-5 w-5" />
                      Đăng ký ngay
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
