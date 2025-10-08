/**
 * Modern Sidebar V2 - Ultra Modern Design
 * Sidebar mới với thiết kế hiện đại, gradient và animations
 */

import React, { useState } from 'react';
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
  ChevronRight,
  Sparkles,
  LogIn,
  UserPlus,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { FluidGlass } from '../ui/fluid-glass';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  gradient?: string;
}

const navItems: NavItem[] = [
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
];

export function ModernSidebarV2() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Menu className="h-5 w-5" />
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen w-80 bg-gradient-to-b from-gray-900 via-gray-900/95 to-black border-r border-white/10 backdrop-blur-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-xl shadow-lg">
                    NL
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Nam Long Center</h2>
                    <p className="text-gray-400 text-xs">Xây dựng tương lai</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {filteredItems.map((item, index) => {
                const isActive = location.pathname === item.path;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onHoverStart={() => setHoveredItem(item.id)}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      <motion.div
                        whileHover={{ x: 8 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {/* Icon */}
                        <motion.div
                          animate={{
                            scale: isActive || hoveredItem === item.id ? 1.1 : 1,
                            rotate: isActive || hoveredItem === item.id ? [0, -10, 10, 0] : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.icon}
                        </motion.div>

                        {/* Label */}
                        <span className="flex-1 font-medium">{item.label}</span>

                        {/* Badge */}
                        {item.badge !== undefined && item.badge > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold"
                          >
                            {item.badge}
                          </motion.div>
                        )}

                        {/* Arrow */}
                        {(isActive || hoveredItem === item.id) && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        )}

                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute inset-0 rounded-xl"
                            style={{
                              boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
                            }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer - Auth Buttons */}
            <div className="p-4 border-t border-white/10 space-y-2">
              {isAuthenticated && userProfile ? (
                <FluidGlass variant="dark" blur="lg" className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {userProfile.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {userProfile.full_name || 'User'}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>
                </FluidGlass>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigate('/dang-nhap');
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Đăng nhập
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigate('/dang-nhap');
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Đăng ký ngay
                  </motion.button>
                </>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
