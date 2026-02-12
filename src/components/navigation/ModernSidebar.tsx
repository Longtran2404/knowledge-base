import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Package,
  FileText,
  Upload,
  Users,
  ShoppingBag,
  Mail,
  Phone,
  HelpCircle,
  Shield,
  FileCheck,
  LogIn,
  UserPlus,
  User,
  Menu,
  X,
  ChevronRight,
  Bell,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

interface MenuItemType {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  requireAuth?: boolean;
}

export function ModernSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const mainMenuItems: MenuItemType[] = [
    {
      id: "home",
      title: "Trang chủ",
      icon: <Home className="h-5 w-5" />,
      path: "/",
    },
    {
      id: "courses",
      title: "Khóa học",
      icon: <BookOpen className="h-5 w-5" />,
      path: "/khoa-hoc",
    },
    {
      id: "products",
      title: "Sản phẩm",
      icon: <Package className="h-5 w-5" />,
      path: "/san-pham",
    },
    {
      id: "resources",
      title: "Tài nguyên",
      icon: <FileText className="h-5 w-5" />,
      path: "/tai-nguyen",
    },
  ];

  const authMenuItems: MenuItemType[] = user
    ? [
        {
          id: "upload",
          title: "Upload tài liệu",
          icon: <Upload className="h-5 w-5" />,
          path: "/tai-len",
          requireAuth: true,
        },
        {
          id: "marketplace",
          title: "Marketplace",
          icon: <ShoppingBag className="h-5 w-5" />,
          path: "/marketplace",
        },
        {
          id: "profile",
          title: user.email || "Tài khoản",
          icon: <User className="h-5 w-5" />,
          path: "/profile",
          requireAuth: true,
        },
      ]
    : [
        {
          id: "login",
          title: "Đăng nhập",
          icon: <LogIn className="h-5 w-5" />,
          path: "/dang-nhap",
        },
        {
          id: "register",
          title: "Đăng ký ngay",
          icon: <UserPlus className="h-5 w-5" />,
          path: "/dang-nhap",
        },
      ];

  const secondaryMenuItems: MenuItemType[] = [
    {
      id: "partnership",
      title: "Hợp tác",
      icon: <Users className="h-5 w-5" />,
      path: "/hop-tac",
    },
    {
      id: "marketplace-bottom",
      title: "Marketplace",
      icon: <ShoppingBag className="h-5 w-5" />,
      path: "/marketplace",
      badge: 0,
    },
    {
      id: "support",
      title: "Hỗ trợ",
      icon: <HelpCircle className="h-5 w-5" />,
      path: "/support",
    },
    {
      id: "contact",
      title: "Liên hệ",
      icon: <Phone className="h-5 w-5" />,
      path: "/contact",
    },
    {
      id: "faq",
      title: "FAQ",
      icon: <HelpCircle className="h-5 w-5" />,
      path: "/faq",
    },
    {
      id: "email",
      title: "Email",
      icon: <Mail className="h-5 w-5" />,
      path: "mailto:contact@knowledgebase.com",
    },
  ];

  const legalMenuItems: MenuItemType[] = [
    {
      id: "privacy",
      title: "Chính sách bảo mật",
      icon: <Shield className="h-5 w-5" />,
      path: "/privacy-policy",
    },
    {
      id: "terms",
      title: "Điều khoản sử dụng",
      icon: <FileCheck className="h-5 w-5" />,
      path: "/terms-of-service",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const MenuItem = ({ item }: { item: MenuItemType }) => {
    const active = isActive(item.path);
    const isExternal = item.path.startsWith("http") || item.path.startsWith("mailto");

    const content = (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
          active
            ? "bg-blue-500/20 text-blue-400"
            : "text-gray-300 hover:bg-white/5 hover:text-white"
        )}
      >
        <div className={cn("transition-transform", active && "scale-110")}>
          {item.icon}
        </div>
        <span className="font-medium text-sm flex-1">{item.title}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
        {!isExternal && (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              active && "rotate-90"
            )}
          />
        )}
      </div>
    );

    if (isExternal) {
      return (
        <a href={item.path} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }

    return (
      <Link to={item.path} onClick={() => setIsOpen(false)}>
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Menu className="h-6 w-6 text-white" />
        )}
      </button>

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
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-gray-950 via-gray-900 to-black backdrop-blur-xl border-r border-white/10 z-50 overflow-y-auto shadow-2xl"
            style={{
              backgroundImage: 'radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)'
            }}
          >
            <div className="p-6 space-y-6">
              {/* Logo & Title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-purple-500/20">
                  <span className="text-white font-bold text-xl">NL</span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Knowledge Base</h2>
                  <p className="text-gray-400 text-xs">Xây dựng tương lai</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Main Menu */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">Menu chính</p>
                {mainMenuItems.map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>

              {/* Auth Menu */}
              {authMenuItems.length > 0 && (
                <div className="space-y-1">
                  {user ? (
                    <>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">Tài khoản</p>
                      {authMenuItems.map((item) => (
                        <MenuItem key={item.id} item={item} />
                      ))}
                    </>
                  ) : (
                    <div className="space-y-2 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10">
                      <p className="text-sm text-gray-300 mb-3">Đăng nhập để sử dụng đầy đủ tính năng</p>
                      {authMenuItems.map((item) => (
                        <Link key={item.id} to={item.path} onClick={() => setIsOpen(false)}>
                          <Button className={cn(
                            "w-full justify-start gap-3",
                            item.id === "register"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                              : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                          )}>
                            {item.icon}
                            {item.title}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Secondary Menu */}
              <div className="pt-4 border-t border-white/10 space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">Dịch vụ</p>
                {secondaryMenuItems.map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>

              {/* Legal Menu */}
              <div className="pt-4 border-t border-white/10 space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">Pháp lý</p>
                {legalMenuItems.map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>

              {/* User Profile Section (if logged in) */}
              {user && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">User</p>
                      <p className="text-xs text-gray-400 truncate">Học viên</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5">
                      <Bell className="h-4 w-4 mr-1" />
                      Thông báo
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                      <LogOut className="h-4 w-4 mr-1" />
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
