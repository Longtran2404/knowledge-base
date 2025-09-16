import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  User,
  ShoppingBag,
  LogOut,
  Settings,
  BookOpen,
  Bell,
  Building2,
  GraduationCap,
  FileText,
  Store,
  MessageCircle,
  Users,
  Download,
} from "lucide-react";
import { useEmailAuth } from "../../contexts/EmailAuthContext";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Badge } from "../ui/badge";
import { ThemeToggle } from "../ui/theme-toggle";

const navigationItems = [
  {
    label: "Trang chủ",
    href: "/",
    icon: Building2,
    description: "Về trang chủ Nam Long Center",
  },
  {
    label: "Khóa học",
    href: "/khoa-hoc",
    icon: GraduationCap,
    description: "Khóa học chuyên môn cho kỹ sư xây dựng",
    items: [
      { 
        label: "BIM & Revit", 
        href: "/khoa-hoc/bim",
        description: "Khóa học BIM và Autodesk Revit chuyên sâu",
        featured: true
      },
      { 
        label: "AutoCAD", 
        href: "/khoa-hoc/autocad",
        description: "Thiết kế 2D/3D với AutoCAD"
      },
      { 
        label: "Kết cấu", 
        href: "/khoa-hoc/ket-cau",
        description: "Thiết kế kết cấu công trình"
      },
      { 
        label: "Quản lý dự án", 
        href: "/khoa-hoc/quan-ly",
        description: "Quản lý dự án xây dựng chuyên nghiệp"
      },
    ],
  },
  {
    label: "Tài liệu",
    href: "/tai-nguyen",
    icon: FileText,
    description: "Tài liệu, đồ án, luận văn chất lượng cao",
    items: [
      { 
        label: "Tài liệu công khai", 
        href: "/tai-nguyen",
        description: "Thư viện tài liệu mở cho cộng đồng"
      },
      { 
        label: "Tài liệu cá nhân", 
        href: "/account",
        description: "Quản lý tài liệu riêng tư"
      },
      { 
        label: "Upload tài liệu", 
        href: "/account",
        description: "Chia sẻ tài liệu với cộng đồng"
      },
    ],
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: Store,
    description: "Công cụ, sách, phần mềm cho xây dựng",
    badge: "Mới"
  },
  {
    label: "Blog",
    href: "/blog",
    icon: MessageCircle,
    description: "Tin tức và kiến thức ngành",
  },
  {
    label: "Hợp tác",
    href: "/hop-tac",
    icon: Users,
    description: "Cơ hội hợp tác và đối tác",
  },
];

export default function EnhancedHeader() {
  const { user, logout } = useEmailAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50" 
          : "bg-white/90 backdrop-blur-sm border-b border-gray-100"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-18 items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                className="relative"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <span className="text-lg font-bold text-white">NL</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </motion.div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Nam Long Center
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Xây dựng tương lai
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger 
                          className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                            isActiveRoute(item.href) ? "text-blue-600" : "text-gray-700"
                          }`}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                              {item.badge}
                            </Badge>
                          )}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <motion.div 
                            className="grid w-[500px] gap-4 p-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Main category */}
                            <div className="row-span-3">
                              <NavigationMenuLink asChild>
                                <Link
                                  className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-6 no-underline outline-none focus:shadow-md hover:shadow-lg transition-shadow duration-200"
                                  to={item.href}
                                >
                                  <item.icon className="h-8 w-8 text-blue-600 mb-2" />
                                  <div className="mb-2 text-lg font-semibold text-gray-900">
                                    {item.label}
                                  </div>
                                  <p className="text-sm leading-tight text-gray-600">
                                    {item.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </div>
                            
                            {/* Sub items */}
                            <div className="grid grid-cols-2 gap-2">
                              {item.items.map((subItem) => (
                                <NavigationMenuLink key={subItem.label} asChild>
                                  <Link
                                    to={subItem.href}
                                    className="group block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-gray-50 focus:bg-gray-50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {subItem.label}
                                      </div>
                                      {subItem.featured && (
                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                          Hot
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {subItem.description}
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </motion.div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className={`group inline-flex h-10 w-max items-center justify-center rounded-lg bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-blue-600 focus:bg-gray-50 focus:text-blue-600 focus:outline-none ${
                            isActiveRoute(item.href) ? "text-blue-600 bg-blue-50" : "text-gray-700"
                          }`}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </motion.div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              className="hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm khóa học, sản phẩm..."
                  className="w-72 pl-10 pr-4 h-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Tìm kiếm"
                />
              </div>
            </motion.form>

            {/* Theme Toggle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ThemeToggle />
            </motion.div>

            {/* User Actions */}
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {user ? (
                <>
                  {/* Notifications */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex relative h-10 w-10 rounded-xl hover:bg-gray-100"
                  >
                    <Bell className="h-4 w-4" />
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      3
                    </Badge>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="relative h-10 w-10 rounded-xl hover:bg-gray-100"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar_url}
                            alt={user.full_name || user.email}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                            {(user.full_name || user.email)
                              ?.charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-64 rounded-xl shadow-lg border-0 bg-white/95 backdrop-blur-md"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal p-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                {(user.full_name || user.email)?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.full_name || "Người dùng"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/account" className="cursor-pointer">
                          <User className="mr-3 h-4 w-4" />
                          <span>Quản lý tài khoản</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <BookOpen className="mr-3 h-4 w-4" />
                          <span>Khóa học của tôi</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/tai-nguyen" className="cursor-pointer">
                          <Download className="mr-3 h-4 w-4" />
                          <span>Tài liệu đã tải</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/security" className="cursor-pointer">
                          <Settings className="mr-3 h-4 w-4" />
                          <span>Cài đặt bảo mật</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex h-10 px-4 rounded-xl hover:bg-gray-100"
                    asChild
                  >
                    <Link to="/auth">
                      <User className="h-4 w-4 mr-2" />
                      Đăng nhập
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    className="hidden sm:inline-flex h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    asChild
                  >
                    <Link to="/auth">Đăng ký</Link>
                  </Button>
                </>
              )}

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-xl hover:bg-gray-100" 
                asChild
              >
                <Link to="/cart" aria-label="Giỏ hàng">
                  <ShoppingBag className="h-4 w-4" />
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    0
                  </Badge>
                </Link>
              </Button>

              {/* Mobile Menu Toggle */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden h-10 w-10 rounded-xl hover:bg-gray-100"
                    aria-label="Mở menu"
                  >
                    <AnimatePresence mode="wait">
                      {isOpen ? (
                        <motion.div
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <X className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="menu"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Menu className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[320px] sm:w-[400px] bg-white/95 backdrop-blur-md border-l border-gray-200"
                >
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Menu điều hướng
                    </SheetTitle>
                    <SheetDescription className="text-gray-600">
                      Khám phá Nam Long Center
                    </SheetDescription>
                  </SheetHeader>

                  {/* Mobile Search */}
                  <div className="mt-6">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="search"
                          placeholder="Tìm kiếm..."
                          className="w-full pl-10 h-11 rounded-xl border-gray-200"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </form>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="mt-8">
                    <div className="space-y-2">
                      {navigationItems.map((item, index) => (
                        <motion.div 
                          key={item.label} 
                          className="space-y-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            to={item.href}
                            className={`flex items-center gap-3 text-base font-medium p-3 rounded-xl transition-colors ${
                              isActiveRoute(item.href)
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto text-xs bg-blue-100 text-blue-700">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                          {item.items && (
                            <div className="ml-8 space-y-1">
                              {item.items.map((subItem) => (
                                <Link
                                  key={subItem.label}
                                  to={subItem.href}
                                  className="block text-sm text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </nav>

                  {/* Mobile Auth Buttons */}
                  {!user && (
                    <motion.div 
                      className="mt-8 space-y-3 pt-6 border-t border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-50" 
                        asChild
                      >
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          Đăng nhập
                        </Link>
                      </Button>
                      <Button
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg"
                        asChild
                      >
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          Đăng ký ngay
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </SheetContent>
              </Sheet>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}