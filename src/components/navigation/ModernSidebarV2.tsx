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
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  User,
  Plus,
  LayoutDashboard,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../contexts/UnifiedAuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  gradient?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
  gradient: string;
}

const mainNavItems: NavItem[] = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: <Home className="h-5 w-5" />,
    path: '/trang-chu',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'courses',
    label: 'Khóa học',
    icon: <BookOpen className="h-5 w-5" />,
    path: '/khoa-hoc',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'products',
    label: 'Sản phẩm',
    icon: <Package className="h-5 w-5" />,
    path: '/san-pham',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'resources',
    label: 'Tài nguyên',
    icon: <FileText className="h-5 w-5" />,
    path: '/tai-nguyen',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: <Upload className="h-5 w-5" />,
    path: '/tai-len',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'partners',
    label: 'Hợp tác',
    icon: <Users className="h-5 w-5" />,
    path: '/hop-tac',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: <ShoppingBag className="h-5 w-5" />,
    path: '/cho-mua-ban',
    badge: 0,
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'workflows',
    label: 'n8n Workflows',
    icon: <Sparkles className="h-5 w-5" />,
    path: '/workflows',
    gradient: 'from-cyan-500 to-blue-500',
  },
];

export function ModernSidebarV2() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const location = useLocation();
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

  const quickActions: QuickAction[] = [
    {
      id: 'upload',
      label: 'Upload tài liệu',
      icon: <Upload className="h-5 w-5" />,
      path: '/tai-len',
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      id: 'courses',
      label: 'Khóa học mới',
      icon: <BookOpen className="h-5 w-5" />,
      path: '/khoa-hoc',
      gradient: 'from-green-400 to-green-600',
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: <ShoppingBag className="h-5 w-5" />,
      path: '/cho-mua-ban',
      gradient: 'from-purple-400 to-purple-600',
    },
    {
      id: 'support',
      label: 'Hỗ trợ',
      icon: <HelpCircle className="h-5 w-5" />,
      path: '/support',
      gradient: 'from-amber-400 to-amber-600',
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: <MessageCircle className="h-5 w-5" />,
      path: '/faq',
      gradient: 'from-cyan-400 to-cyan-600',
    },
    {
      id: 'contact',
      label: 'Liên hệ',
      icon: <Phone className="h-5 w-5" />,
      path: '/contact',
      gradient: 'from-emerald-400 to-emerald-600',
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="h-5 w-5" />,
      path: '/contact',
      gradient: 'from-pink-400 to-pink-600',
    },
  ];

  const filteredItems = mainNavItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavClick = () => {
    if (!isDesktop) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Toggle Button - Both Mobile and Desktop */}
      {!isOpen && (
        <motion.button
          id="sidebar-toggle-button"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-2xl"
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          style={{
            boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Menu className="h-6 w-6" />
        </motion.button>
      )}

      {/* Floating Quick Actions Button - Right Bottom */}
      <motion.div
        className="fixed bottom-8 right-8 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        {/* Quick Action Menu */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-20 right-0 w-64 space-y-2 mb-4"
            >
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    if (action.path) navigate(action.path);
                    if (action.onClick) action.onClick();
                    setShowQuickActions(false);
                  }}
                  className={`w-full px-4 py-3 rounded-2xl bg-gradient-to-r ${action.gradient} text-white font-medium shadow-xl hover:shadow-2xl transition-all flex items-center gap-3`}
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    {action.icon}
                  </div>
                  <span className="flex-1 text-left">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 text-white shadow-2xl flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: showQuickActions ? 45 : 0 }}
          style={{
            boxShadow: '0 10px 40px rgba(236, 72, 153, 0.5)',
          }}
        >
          <Plus className="h-8 w-8" />
        </motion.button>
      </motion.div>

      {/* Overlay - Show when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Show only when isOpen */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            id="modern-sidebar"
            key="sidebar"
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-screen w-80 bg-gradient-to-br from-gray-950 via-gray-900 to-black border-r border-white/5 backdrop-blur-2xl z-50 flex flex-col shadow-2xl overflow-hidden"
            style={{
              boxShadow: '20px 0 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-50" />
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-2xl shadow-xl relative overflow-hidden"
                    >
                      <span className="relative z-10">NL</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    </motion.div>
                    <div>
                      <h2 className="text-white font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Nam Long Center
                      </h2>
                      <p className="text-gray-400 text-xs">Xây dựng tương lai</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-400 transition-all"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {filteredItems.map((item, index) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={handleNavClick}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${
                            isActive
                              ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {/* Glow Effect on Active */}
                          {isActive && (
                            <motion.div
                              layoutId="activeBg"
                              className="absolute inset-0 rounded-xl"
                              style={{
                                background: `linear-gradient(135deg, ${item.gradient?.split(' ')[0]?.replace('from-', '') || 'transparent'}, ${item.gradient?.split(' ')[2]?.replace('to-', '') || 'transparent'})`,
                                filter: 'blur(20px)',
                                opacity: 0.3,
                              }}
                            />
                          )}

                          {/* Icon Container */}
                          <div className="relative z-10">
                            <motion.div
                              animate={{
                                rotate: isActive ? [0, -10, 10, 0] : 0,
                                scale: isActive ? 1.1 : 1,
                              }}
                              transition={{ duration: 0.3 }}
                              className={`${isActive ? 'drop-shadow-lg' : ''}`}
                            >
                              {item.icon}
                            </motion.div>
                          </div>

                          {/* Label */}
                          <span className="flex-1 font-medium relative z-10">{item.label}</span>

                          {/* Badge */}
                          {item.badge !== undefined && item.badge > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg relative z-10"
                            >
                              {item.badge}
                            </motion.div>
                          )}

                          {/* Hover Indicator */}
                          {!isActive && (
                            <motion.div
                              initial={{ width: 0 }}
                              whileHover={{ width: 3 }}
                              className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 rounded-r-full bg-gradient-to-r ${item.gradient}`}
                            />
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer - User Profile or Auth Buttons */}
              <div className="p-4 border-t border-white/10">
                {isAuthenticated && userProfile ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl cursor-pointer"
                    onClick={() => {
                      navigate('/ho-so');
                      handleNavClick();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {userProfile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {userProfile.full_name || 'User'}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {userProfile.email}
                        </p>
                      </div>
                      <User className="h-5 w-5 text-gray-400" />
                    </div>

                    {/* Quick Links for Authenticated Users */}
                    {(userProfile.account_role === 'admin' || userProfile.account_role === 'quan_ly') && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/quan-ly');
                            handleNavClick();
                          }}
                          className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-all flex items-center justify-center gap-1.5"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          Quản lý
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/admin/thanh-toan');
                            handleNavClick();
                          }}
                          className="px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-all flex items-center justify-center gap-1.5"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Thanh toán
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate('/dang-nhap');
                        handleNavClick();
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 hover:border-white/30 transition-all flex items-center justify-center gap-2 backdrop-blur-xl"
                    >
                      <LogIn className="h-5 w-5" />
                      Đăng nhập
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate('/dang-nhap');
                        handleNavClick();
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-bold shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-5 w-5" />
                      Đăng ký ngay
                    </motion.button>
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
