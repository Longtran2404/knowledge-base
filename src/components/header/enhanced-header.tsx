import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User, LogOut, Settings, BookOpen, ShoppingBag, Menu, X, Bell, Heart } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/search/search-bar";
import { ShoppingCart } from "@/components/cart/shopping-cart";
import { AuthModal } from "@/components/auth/auth-modal";
import { OptimizedImage } from "@/components/ui/optimized-image";

const navigationItems = [
  {
    label: "Trang chủ",
    href: "/",
  },
  {
    label: "Khóa học",
    href: "/khoa-hoc",
    items: [
      {
        label: "Tất cả khóa học",
        href: "/khoa-hoc",
        description: "Khám phá toàn bộ khóa học"
      },
      {
        label: "Xây dựng dân dụng",
        href: "/khoa-hoc/xay-dung-dan-dung",
        description: "Kiến thức về xây dựng nhà ở"
      },
      {
        label: "Kết cấu công trình",
        href: "/khoa-hoc/ket-cau-cong-trinh",
        description: "Thiết kế và tính toán kết cấu"
      },
      {
        label: "BIM & CAD",
        href: "/khoa-hoc/bim-cad",
        description: "Phần mềm thiết kế hiện đại"
      },
      {
        label: "Quản lý dự án",
        href: "/khoa-hoc/quan-ly-du-an",
        description: "Kỹ năng quản lý xây dựng"
      }
    ]
  },
  {
    label: "Sản phẩm",
    href: "/san-pham",
    items: [
      {
        label: "Phần mềm",
        href: "/san-pham/phan-mem",
        description: "Công cụ thiết kế và tính toán"
      },
      {
        label: "Sách & Tài liệu",
        href: "/san-pham/sach-tai-lieu",
        description: "Giáo trình và tham khảo"
      },
      {
        label: "Templates",
        href: "/san-pham/templates",
        description: "Mẫu thiết kế có sẵn"
      },
      {
        label: "Bundle Deals",
        href: "/san-pham/bundle",
        description: "Gói sản phẩm ưu đãi"
      }
    ]
  },
  {
    label: "Tài nguyên",
    href: "/tai-nguyen",
    items: [
      {
        label: "Thư viện tài liệu",
        href: "/tai-nguyen/thu-vien",
        description: "Tài liệu tham khảo miễn phí"
      },
      {
        label: "Video hướng dẫn",
        href: "/tai-nguyen/video",
        description: "Clip hướng dẫn chi tiết"
      },
      {
        label: "Tiêu chuẩn xây dựng",
        href: "/tai-nguyen/tieu-chuan",
        description: "TCVN, QCXDVN mới nhất"
      },
      {
        label: "Tools & Calculator",
        href: "/tai-nguyen/tools",
        description: "Công cụ tính toán online"
      }
    ]
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Hợp tác",
    href: "/hop-tac",
  }
];

export default function EnhancedHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, cartItems, notifications } = useAppStore();

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const unreadNotifications = notifications.length;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất thành công');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
      isScrolled ? 'shadow-md' : ''
    }`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">NL</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Nam Long Center</h1>
                <p className="text-xs text-gray-500">Xây dựng tương lai</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  {item.items ? (
                    <>
                      <NavigationMenuTrigger className="font-medium hover:text-blue-600 transition-colors">
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[400px] gap-3 p-6">
                          {item.items.map((subItem) => (
                            <NavigationMenuLink key={subItem.label} asChild>
                              <Link
                                to={subItem.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">{subItem.label}</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {subItem.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.href}
                        className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar 
              variant="minimal"
              placeholder="Tìm khóa học, sản phẩm..."
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Search (Mobile) */}
            <div className="md:hidden">
              <SearchBar 
                variant="minimal"
                placeholder="Tìm kiếm..."
                showIcon={true}
              />
            </div>

            {/* Notifications */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Thông báo ({unreadNotifications})</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Không có thông báo mới
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem key={notification.id} className="p-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Favorites */}
            {isAuthenticated && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/yeu-thich" className="relative">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Shopping Cart */}
            <ShoppingCart />

            {/* User Menu or Auth Buttons */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-courses" className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Khóa học của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>Đơn hàng</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Cài đặt</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <AuthModal>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Đăng nhập
                  </Button>
                </AuthModal>
                <AuthModal defaultTab="register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Đăng ký
                  </Button>
                </AuthModal>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">NL</span>
                    </div>
                    Nam Long Center
                  </SheetTitle>
                  <SheetDescription>
                    Khám phá khóa học và sản phẩm
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Mobile Auth */}
                  {!isAuthenticated && (
                    <div className="flex flex-col gap-2">
                      <AuthModal>
                        <Button variant="outline" className="w-full">
                          <User className="h-4 w-4 mr-2" />
                          Đăng nhập
                        </Button>
                      </AuthModal>
                      <AuthModal defaultTab="register">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Đăng ký ngay
                        </Button>
                      </AuthModal>
                    </div>
                  )}

                  {/* Mobile Navigation */}
                  <nav className="space-y-4">
                    {navigationItems.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <Link
                          to={item.href}
                          className="block text-lg font-medium hover:text-blue-600 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                        {item.items && (
                          <div className="ml-4 space-y-2">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.label}
                                to={subItem.href}
                                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}