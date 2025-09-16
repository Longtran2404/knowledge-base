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
    description: "Về trang chủ Nam Long Center",
    icon: <Home className="h-5 w-5" />,
    path: "/",
    color: "text-blue-600",
    bgColor: "bg-blue-100 hover:bg-blue-200",
  },
  {
    id: "courses",
    title: "Khóa học",
    description: "Khóa học BIM, Revit, AutoCAD",
    icon: <BookOpen className="h-5 w-5" />,
    path: "/khoa-hoc",
    color: "text-green-600",
    bgColor: "bg-green-100 hover:bg-green-200",
  },
  {
    id: "resources",
    title: "Tài liệu",
    description: "Tài liệu, đồ án, luận văn",
    icon: <FileText className="h-5 w-5" />,
    path: "/tai-nguyen",
    color: "text-purple-600",
    bgColor: "bg-purple-100 hover:bg-purple-200",
  },
  {
    id: "marketplace",
    title: "Marketplace",
    description: "Công cụ, sách, phần mềm",
    icon: <Package className="h-5 w-5" />,
    path: "/marketplace",
    color: "text-orange-600",
    bgColor: "bg-orange-100 hover:bg-orange-200",
  },
  {
    id: "blog",
    title: "Blog",
    description: "Tin tức và kiến thức ngành",
    icon: <Newspaper className="h-5 w-5" />,
    path: "/blog",
    color: "text-pink-600",
    bgColor: "bg-pink-100 hover:bg-pink-200",
  },
  {
    id: "collaboration",
    title: "Hợp tác",
    description: "Cơ hội hợp tác và đối tác",
    icon: <Handshake className="h-5 w-5" />,
    path: "/hop-tac",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 hover:bg-indigo-200",
  },
];

const userMenuItems: MenuItem[] = [
  {
    id: "profile",
    title: "Hồ sơ",
    description: "Quản lý thông tin cá nhân",
    icon: <User className="h-5 w-5" />,
    path: "/profile",
    color: "text-gray-600",
    bgColor: "bg-gray-100 hover:bg-gray-200",
  },
  {
    id: "settings",
    title: "Cài đặt",
    description: "Cài đặt tài khoản",
    icon: <Settings className="h-5 w-5" />,
    path: "/settings",
    color: "text-gray-600",
    bgColor: "bg-gray-100 hover:bg-gray-200",
  },
  {
    id: "help",
    title: "Trợ giúp",
    description: "Hướng dẫn sử dụng",
    icon: <HelpCircle className="h-5 w-5" />,
    path: "/help",
    color: "text-gray-600",
    bgColor: "bg-gray-100 hover:bg-gray-200",
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
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[280px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Menu nhanh
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMenus}
                  className="h-10 w-10 p-0 min-w-[44px] min-h-[44px]"
                  aria-label="Đóng menu nhanh"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {menuItems.map((item) => (
                  <Tooltip
                    key={item.id}
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
                        className={`w-full h-16 flex flex-col items-center justify-center gap-2 min-h-[64px] ${item.bgColor} ${item.color} hover:shadow-md transition-all duration-200`}
                        aria-label={`Mở ${item.title}`}
                      >
                        {item.icon}
                        <span className="text-xs font-medium">
                          {item.title}
                        </span>
                      </Button>
                    </Link>
                  </Tooltip>
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
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[200px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tài khoản
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMenus}
                  className="h-10 w-10 p-0 min-w-[44px] min-h-[44px]"
                  aria-label="Đóng menu tài khoản"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-2">
                {userMenuItems.map((item) => (
                  <Tooltip
                    key={item.id}
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
                        className={`w-full justify-start gap-3 min-h-[44px] ${item.bgColor} ${item.color} hover:shadow-md transition-all duration-200`}
                        aria-label={`Mở ${item.title}`}
                      >
                        {item.icon}
                        <span className="text-sm">{item.title}</span>
                      </Button>
                    </Link>
                  </Tooltip>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* User Menu Button */}
        {user && (
          <Tooltip content="Tài khoản" placement="left">
            <Button
              onClick={toggleUserMenu}
              className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 min-w-[56px] min-h-[56px] ${
                showUserMenu
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
              aria-label={
                showUserMenu ? "Đóng menu tài khoản" : "Mở menu tài khoản"
              }
              aria-expanded={showUserMenu}
            >
              <User className="h-6 w-6 text-white" />
            </Button>
          </Tooltip>
        )}

        {/* Main Menu Button */}
        <Tooltip content={isOpen ? "Đóng menu" : "Mở menu"} placement="left">
          <Button
            onClick={toggleMenu}
            className={`h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 min-w-[64px] min-h-[64px] ${
              isOpen
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-red-500 hover:bg-red-600"
            }`}
            aria-label={isOpen ? "Đóng menu chính" : "Mở menu chính"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <div className="text-white text-2xl font-bold">+</div>
            )}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
