import React, { useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User, Menu, X, Bell, Settings, Activity, Home, BookOpen, Package, FileText, MessageSquare, Handshake, Mail, ShoppingCart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { CartIcon, MobileCartIcon } from "./cart/CartIcon";
import { CartDrawer, MobileCartDrawer } from "./cart/CartDrawer";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Badge } from "./ui/badge";
import { GooeyNav, GooeyNavMobile } from "./ui/gooey-nav";
import { motion } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { userProfile: user, signOut } = useAuth();
  const location = useLocation();

  // Memoize navigation items để tránh re-render không cần thiết
  const navigationItems = useMemo(
    () => [
      { label: "Trang chủ", href: "/trang-chu", icon: <Home className="w-4 h-4" /> },
      { label: "Khóa học", href: "/khoa-hoc", icon: <BookOpen className="w-4 h-4" /> },
      { label: "Sản phẩm", href: "/san-pham", icon: <Package className="w-4 h-4" /> },
      { label: "Tài nguyên", href: "/tai-nguyen", icon: <FileText className="w-4 h-4" /> },
      { label: "Blog", href: "/bai-viet", icon: <MessageSquare className="w-4 h-4" /> },
      { label: "Hợp tác", href: "/hop-tac", icon: <Handshake className="w-4 h-4" /> },
    ],
    []
  );

  // Memoize handlers để tránh re-render
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [signOut]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <span className="text-white font-bold text-xl">NL</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Nam Long Center
                </h1>
                <p className="text-xs text-gray-400">Xây dựng tương lai</p>
              </div>
            </Link>
          </motion.div>

          {/* Navigation - Desktop with GooeyNav */}
          <div className="hidden lg:block">
            <GooeyNav items={navigationItems} />
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search - Hidden on mobile */}
            <div className="hidden md:block relative">
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {/* Cart Icon */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={toggleCart}
                  className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors relative"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-300" />
                </button>
              </motion.div>

              {/* Mobile Cart Icon */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="sm:hidden">
                <button
                  onClick={toggleCart}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-300" />
                </button>
              </motion.div>

              {user ? (
                /* User Profile */
                <div className="flex items-center gap-2">
                  {/* Desktop User Profile */}
                  <div className="hidden sm:flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link
                        to="/quan-ly-tai-khoan"
                        className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-full transition-colors backdrop-blur-sm border border-white/10"
                      >
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || user.email}
                            className="w-9 h-9 rounded-full object-cover border-2 border-blue-500/30"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-500/30">
                            <User size={18} className="text-white" />
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="font-medium text-white">
                            {user.full_name || user.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            {user.account_role === "sinh_vien"
                              ? "Học viên"
                              : user.account_role === "giang_vien"
                              ? "Giảng viên"
                              : user.account_role === "admin"
                              ? "Quản trị viên"
                              : "Người dùng"}
                          </p>
                        </div>
                      </Link>
                    </motion.div>

                    <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <button className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                          <Bell size={18} className="text-gray-300" />
                        </button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <button
                          className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                          title="Lịch sử hoạt động"
                          onClick={() =>
                            (window.location.href = "/lich-su-hoat-dong")
                          }
                        >
                          <Activity size={18} className="text-gray-300" />
                        </button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <button
                          className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                          title="Quản lý tài khoản"
                          onClick={() =>
                            (window.location.href = "/quan-ly-tai-khoan")
                          }
                        >
                          <Settings size={18} className="text-gray-300" />
                        </button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button
                          onClick={handleSignOut}
                          className="px-4 py-2 rounded-full bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
                        >
                          Đăng xuất
                        </button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Mobile User Profile */}
                  <div className="sm:hidden flex items-center gap-2">
                    <Link
                      to="/quan-ly-tai-khoan"
                      className="flex items-center gap-2"
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || user.email}
                          className="w-9 h-9 rounded-full object-cover border-2 border-blue-500/30"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-500/30">
                          <User size={18} className="text-white" />
                        </div>
                      )}
                    </Link>
                  </div>
                </div>
              ) : (
                /* Login/Register Buttons */
                <div className="flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button
                      className="hidden sm:flex px-4 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 backdrop-blur-sm border border-white/10 transition-colors"
                      onClick={() => (window.location.href = "/dang-nhap")}
                    >
                      Đăng nhập
                    </button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button
                      className="hidden sm:flex px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white text-sm font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
                      onClick={() => (window.location.href = "/dang-nhap")}
                    >
                      Đăng ký
                    </button>
                  </motion.div>

                  {/* Mobile Login Button */}
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="sm:hidden">
                    <button
                      className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                      onClick={() => (window.location.href = "/dang-nhap")}
                    >
                      <User className="w-5 h-5 text-gray-300" />
                    </button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="lg:hidden">
              <button
                className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-300" />
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation with GooeyNavMobile */}
      <GooeyNavMobile
        items={navigationItems}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Cart Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          window.location.href = "/checkout";
        }}
      />

      <MobileCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          window.location.href = "/checkout";
        }}
      />
    </motion.header>
  );
};

export default Header;
