import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  FileText,
  Package,
  Newspaper,
  Handshake,
  User,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/UnifiedAuthContext";

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
}

const menuItems: MenuItem[] = [
  {
    id: "home",
    title: "Trang chủ",
    description: "Về trang chủ Knowledge Base",
    icon: <Home className="h-5 w-5" />,
    path: "/",
    color: "text-blue-700",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200",
  },
  {
    id: "courses",
    title: "Khóa học",
    description: "Khóa học BIM, Revit, AutoCAD",
    icon: <BookOpen className="h-5 w-5" />,
    path: "/khoa-hoc",
    color: "text-emerald-700",
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200",
  },
  {
    id: "resources",
    title: "Tài liệu",
    description: "Tài liệu, đồ án, luận văn",
    icon: <FileText className="h-5 w-5" />,
    path: "/tai-nguyen",
    color: "text-purple-700",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200",
  },
  {
    id: "marketplace",
    title: "Marketplace",
    description: "Công cụ, sách, phần mềm",
    icon: <Package className="h-5 w-5" />,
    path: "/marketplace",
    color: "text-amber-700",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200",
  },
  {
    id: "blog",
    title: "Blog",
    description: "Tin tức và kiến thức ngành",
    icon: <Newspaper className="h-5 w-5" />,
    path: "/blog",
    color: "text-rose-700",
    bgColor: "bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200",
  },
  {
    id: "collaboration",
    title: "Hợp tác",
    description: "Cơ hội hợp tác và đối tác",
    icon: <Handshake className="h-5 w-5" />,
    path: "/hop-tac",
    color: "text-indigo-700",
    bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200",
  },
];

const userMenuItems: MenuItem[] = [
  {
    id: "profile",
    title: "Hồ sơ",
    description: "Quản lý thông tin cá nhân",
    icon: <User className="h-5 w-5" />,
    path: "/profile",
    color: "text-slate-700",
    bgColor: "bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200",
  },
  {
    id: "settings",
    title: "Cài đặt",
    description: "Cài đặt tài khoản",
    icon: <Settings className="h-5 w-5" />,
    path: "/settings",
    color: "text-slate-700",
    bgColor: "bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200",
  },
  {
    id: "help",
    title: "Trợ giúp",
    description: "Hướng dẫn sử dụng",
    icon: <HelpCircle className="h-5 w-5" />,
    path: "/help",
    color: "text-slate-700",
    bgColor: "bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200",
  },
];

export default function SimpleFloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { userProfile: user } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setIsOpen(false);
  };

  const closeMenus = () => {
    setIsOpen(false);
    setShowUserMenu(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-16 right-0 mb-4"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="bg-white/95 rounded-3xl shadow-strong border border-gray-200/50 p-6 min-w-[300px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Menu nhanh
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMenus}
                  className="h-10 w-10 p-0 min-w-[44px] min-h-[44px] hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200"
                  aria-label="Đóng menu nhanh"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.15 }}
                  >
                    <Tooltip
                      content={
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-gray-300">
                            {item.description}
                          </p>
                        </div>
                      }
                      placement="left"
                    >
                      <Link to={item.path} onClick={closeMenus}>
                        <Button
                          variant="ghost"
                          className={`w-full h-18 flex flex-col items-center justify-center gap-2 min-h-[72px] ${item.bgColor} ${item.color} hover:shadow-medium transition-all duration-150 rounded-2xl border border-transparent hover:border-gray-200/50 hover:scale-102 active:scale-98`}
                          aria-label={`Mở ${item.title}`}
                        >
                          <div className="p-2 rounded-xl bg-white/60 shadow-soft">
                            {item.icon}
                          </div>
                          <span className="text-xs font-semibold">
                            {item.title}
                          </span>
                        </Button>
                      </Link>
                    </Tooltip>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Menu */}
      <AnimatePresence>
        {showUserMenu && user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-16 right-0 mb-4"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="bg-white/95 rounded-3xl shadow-strong border border-gray-200/50 p-5 min-w-[220px]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900 bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
                  Tài khoản
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMenus}
                  className="h-10 w-10 p-0 min-w-[44px] min-h-[44px] hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200"
                  aria-label="Đóng menu tài khoản"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-3">
                {userMenuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.15 }}
                  >
                    <Tooltip
                      content={
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-gray-300">
                            {item.description}
                          </p>
                        </div>
                      }
                      placement="left"
                    >
                      <Link to={item.path} onClick={closeMenus}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-4 min-h-[48px] p-3 ${item.bgColor} ${item.color} hover:shadow-medium transition-all duration-150 rounded-2xl border border-transparent hover:border-gray-200/50 hover:scale-102 active:scale-98`}
                          aria-label={`Mở ${item.title}`}
                        >
                          <div className="p-2 rounded-lg bg-white/60 shadow-soft">
                            {item.icon}
                          </div>
                          <span className="text-sm font-semibold">{item.title}</span>
                        </Button>
                      </Link>
                    </Tooltip>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="flex flex-col gap-3" style={{ willChange: 'transform' }}>
        {/* User Menu Button */}
        {user && (
          <Tooltip content="Tài khoản" placement="left">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                onClick={toggleUserMenu}
                className={`h-14 w-14 rounded-full shadow-strong hover:shadow-glow transition-all duration-200 min-w-[56px] min-h-[56px] ${
                  showUserMenu
                    ? "bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                    : "bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
                } border-2 border-white/20`}
                style={{ willChange: 'transform' }}
                aria-label={
                  showUserMenu ? "Đóng menu tài khoản" : "Mở menu tài khoản"
                }
                aria-expanded={showUserMenu}
              >
                <User className="h-6 w-6 text-white" />
              </Button>
            </motion.div>
          </Tooltip>
        )}

        {/* Enhanced Main Menu Button */}
        <Tooltip content={isOpen ? "Đóng menu" : "Mở menu"} placement="left">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              onClick={toggleMenu}
              className={`h-16 w-16 rounded-full shadow-strong hover:shadow-glow transition-all duration-200 min-w-[64px] min-h-[64px] border-2 border-white/20 overflow-hidden group ${
                isOpen
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  : "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              }`}
              style={{ willChange: 'transform' }}
              aria-label={isOpen ? "Đóng menu chính" : "Mở menu chính"}
              aria-expanded={isOpen}
            >
              <motion.div
                animate={{
                  rotate: isOpen ? 45 : 0,
                  scale: isOpen ? 1.1 : 1
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut"
                }}
                className="relative"
              >
                <motion.div
                  animate={{ opacity: isOpen ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-white text-2xl font-bold">+</div>
                </motion.div>
                <motion.div
                  animate={{ opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <X className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>

              {/* Pulse animation for closed state - simplified */}
              {!isOpen && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-300/60"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Inner glow effect - static */}
              <div
                className="absolute inset-1 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-200"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                }}
              />
            </Button>
          </motion.div>
        </Tooltip>
      </div>
    </div>
  );
}
