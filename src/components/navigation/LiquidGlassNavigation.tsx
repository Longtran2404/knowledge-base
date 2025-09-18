/**
 * Liquid Glass Navigation - Inspired by iOS 26 Design
 * Modern glassmorphism navigation with liquid effects
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  Package,
  FileText,
  Users,
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Bell,
  Settings,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { useCart } from '../../contexts/CartContext';
import { ComponentWithIcon } from '../../types/common';

interface NavItem extends ComponentWithIcon {
  label: string;
  href: string;
  badge?: number;
}

export default function LiquidGlassNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const { userProfile: user, signOut } = useAuth();
  const { count: cartCount } = useCart();

  // Track scroll for dynamic glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems: NavItem[] = [
    { label: 'Trang chủ', href: '/', icon: Home },
    { label: 'Khóa học', href: '/khoa-hoc', icon: BookOpen },
    { label: 'Sản phẩm', href: '/san-pham', icon: Package },
    { label: 'Tài nguyên', href: '/tai-nguyen', icon: FileText },
    { label: 'Upload', href: '/tai-len', icon: Upload },
    { label: 'Hợp tác', href: '/hop-tac', icon: Users },
    { label: 'Marketplace', href: '/cho-mua-ban', icon: ShoppingBag, badge: cartCount },
  ];

  const isActive = (href: string) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Toggle Button - Fixed on left */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-6 left-6 z-50 p-4 rounded-2xl transition-all duration-500"
        style={{
          background: isCollapsed
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(99, 102, 241, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.8) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: isCollapsed
            ? '0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            : '0 20px 25px -5px rgba(239, 68, 68, 0.2), 0 10px 10px -5px rgba(239, 68, 68, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {isCollapsed ? <Menu className="w-6 h-6 text-white" /> : <X className="w-6 h-6 text-white" />}
        </motion.div>

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/10"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      </motion.button>

      {/* Left Sidebar Header */}
      <AnimatePresence>
        {!isCollapsed && (
          <>
            {/* Backdrop for all screen sizes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCollapsed(true)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />

            {/* Main Sidebar */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-80 lg:w-96 z-50 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.90) 50%, rgba(240,245,251,0.95) 100%)',
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                borderRight: '1px solid rgba(229, 231, 235, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <div className="flex flex-col h-full overflow-hidden">
                {/* Liquid Glass Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-4 mb-6 pt-8">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className="relative"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(99, 102, 241, 0.8) 50%, rgba(168, 85, 247, 0.9) 100%)',
                          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3) inset',
                        }}
                      >
                        <span className="text-white font-bold text-xl">NL</span>
                      </div>
                      {/* Glow effect */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 50%, rgba(168, 85, 247, 0.3) 100%)',
                          filter: 'blur(8px)',
                        }}
                        initial={{ scale: 1, opacity: 0 }}
                        whileHover={{ scale: 1.3, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Nam Long Center</h1>
                      <p className="text-sm text-gray-600">Xây dựng tương lai</p>
                    </div>
                  </div>

                  {/* Liquid Glass Search */}
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      className="w-full h-11 pl-11 pr-4 rounded-2xl text-gray-800 placeholder-gray-500 text-sm transition-all duration-300 border-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(248,250,252,0.6) 100%)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3) inset, 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      onFocus={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)';
                        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.3) inset';
                      }}
                      onBlur={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(248,250,252,0.6) 100%)';
                        e.target.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.3) inset, 0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                    />
                    <div
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
                      }}
                    >
                      <Search className="text-blue-600 w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Scrollable Navigation */}
                <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setIsCollapsed(true)}
                        className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                          isActive(item.href)
                            ? 'text-blue-700'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                        style={{
                          background: isActive(item.href)
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)'
                            : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive(item.href)) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,250,252,0.4) 100%)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive(item.href)) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {/* Glass reflection effect */}
                        {isActive(item.href) && (
                          <motion.div
                            className="absolute inset-0 rounded-2xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%)',
                              boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2) inset',
                            }}
                            layoutId="activeGlass"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}

                        <item.icon className="w-6 h-6 relative z-10" />
                        <span className="font-medium text-base relative z-10">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold relative z-10"
                            style={{
                              boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.8)',
                            }}
                          >
                            {item.badge > 99 ? '99+' : item.badge}
                          </motion.span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Fixed Bottom User Section */}
                <div
                  className="p-6 pt-4"
                  style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.8) 20%, rgba(248,250,252,0.9) 100%)',
                    backdropFilter: 'blur(16px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {user ? (
                    <div className="space-y-3">
                      {/* Compact User Profile */}
                      <Link
                        to="/quan-ly-tai-khoan"
                        onClick={() => setIsCollapsed(true)}
                        className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,250,252,0.4) 100%)',
                          backdropFilter: 'blur(12px)',
                          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3) inset',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.6) 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,250,252,0.4) 100%)';
                        }}
                      >
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || user.email}
                            className="w-10 h-10 rounded-xl object-cover shadow-md"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                            style={{
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
                            }}
                          >
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{user.full_name || user.email}</p>
                          <p className="text-xs text-gray-500">
                            {user.role === "student" ? "Học viên" :
                             user.role === "instructor" ? "Giảng viên" :
                             user.role === "admin" ? "Admin" : "User"}
                          </p>
                        </div>
                      </Link>

                      {/* Compact Actions */}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-300"
                          style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2) inset',
                          }}
                        >
                          <Bell className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">Thông báo</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setIsCollapsed(true);
                            signOut();
                          }}
                          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-300"
                          style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.08) 100%)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.2) inset',
                          }}
                        >
                          <Settings className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-medium text-red-700">Đăng xuất</span>
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/dang-nhap"
                        onClick={() => setIsCollapsed(true)}
                        className="block w-full p-3 text-center rounded-2xl font-medium transition-all duration-300 text-sm"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,250,252,0.4) 100%)',
                          backdropFilter: 'blur(12px)',
                          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3) inset',
                          color: 'rgb(59, 130, 246)',
                        }}
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/dang-nhap"
                        onClick={() => setIsCollapsed(true)}
                        className="block w-full p-3 text-center rounded-2xl font-medium transition-all duration-300 text-white text-sm shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(99, 102, 241, 0.8) 100%)',
                          backdropFilter: 'blur(12px)',
                          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3) inset, 0 8px 25px -5px rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        Đăng ký ngay
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Mobile Slide-out Menu with Liquid Glass */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 z-50 lg:hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
                backdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(229, 231, 235, 0.4)',
              }}
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Menu
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100/60 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Search Mobile */}
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full h-12 pl-14 pr-4 rounded-xl bg-gray-50/80 backdrop-blur-lg border border-gray-200/60 focus:border-blue-300/60 focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.9) 0%, rgba(243, 244, 246, 0.8) 100%)',
                    }}
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg bg-blue-100/50 backdrop-blur-sm"
                  >
                    <Search className="text-blue-600 w-5 h-5" />
                  </motion.div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-100/20 to-indigo-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Navigation Items */}
                <div className="space-y-2">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                          isActive(item.href)
                            ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/60 text-blue-700 border border-blue-200/40 shadow-sm'
                            : 'hover:bg-gray-50/60 text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-auto h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* User Actions */}
                {user && (
                  <div className="pt-4 border-t border-gray-200/40 space-y-2">
                    <Link
                      to="/quan-ly-tai-khoan"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50/60 transition-colors text-gray-700 hover:text-gray-900"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Quản lý tài khoản</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50/70 transition-colors text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                      <span className="font-medium">Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}