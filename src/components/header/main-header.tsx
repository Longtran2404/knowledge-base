import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  User,
  ShoppingBag,
  LogOut,
  Settings,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { ThemeToggle } from "../ui/theme-toggle";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { Badge } from "../../components/ui/badge";

const navigationItems = [
  {
    label: "Trang chủ",
    href: "/",
  },
  {
    label: "Khóa học",
    href: "/khoa-hoc",
    items: [
      { label: "BIM & Revit", href: "/khoa-hoc/bim" },
      { label: "AutoCAD", href: "/khoa-hoc/autocad" },
      { label: "Kết cấu", href: "/khoa-hoc/ket-cau" },
      { label: "Quản lý dự án", href: "/khoa-hoc/quan-ly" },
    ],
  },
  {
    label: "Tài liệu",
    href: "/tai-lieu",
    items: [
      { label: "Tài liệu công khai", href: "/tai-lieu" },
      { label: "Tài liệu cá nhân", href: "/account" },
      { label: "Upload tài liệu", href: "/account" },
    ],
  },
  {
    label: "Marketplace",
    href: "/marketplace",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Hợp tác",
    href: "/hop-tac",
  },
];

export default function MainHeader() {
  const { userProfile: user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search logic here
      navigate(`/marketplace?search=${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-soft">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-3 flex-shrink-0 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-medium group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                <span className="text-lg font-bold text-white">NL</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors duration-300">
                  Nam Long Center
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Xây dựng tương lai
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList data-tour="navigation" className="gap-1">
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger className="text-sm font-medium h-9 px-3">
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid w-[300px] gap-2 p-3">
                            <NavigationMenuLink asChild>
                              <Link
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                to={item.href}
                              >
                                <div className="text-sm font-medium leading-none">
                                  {item.label}
                                </div>
                              </Link>
                            </NavigationMenuLink>
                            <div className="grid gap-1">
                              {item.items.map((subItem) => (
                                <NavigationMenuLink key={subItem.label} asChild>
                                  <Link
                                    to={subItem.href}
                                    className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  >
                                    <div className="text-sm leading-none">
                                      {subItem.label}
                                    </div>
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                        >
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="hidden md:block"
              data-tour="search"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm..."
                  className="w-48 h-9 pl-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Tìm kiếm"
                />
              </div>
            </form>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Actions */}
            <div className="flex items-center gap-1" data-tour="auth-buttons">
              {user ? (
                <>
                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="relative h-9 w-9 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar_url}
                            alt={user.full_name || user.email}
                          />
                          <AvatarFallback>
                            {(user.full_name || user.email)
                              ?.charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.full_name || "Người dùng"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/account">
                          <User className="mr-2 h-4 w-4" />
                          <span>Quản lý tài khoản</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>Khóa học của tôi</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/marketplace">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>Marketplace</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/security">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Bảo mật</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
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
                    className="hidden sm:inline-flex h-9"
                    asChild
                  >
                    <Link to="/auth">
                      <User className="h-4 w-4 mr-1" />
                      Đăng nhập
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    className="hidden sm:inline-flex h-9 bg-blue-600 hover:bg-blue-700"
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
                className="relative h-9 w-9"
                asChild
              >
                <Link to="/cart" aria-label="Giỏ hàng">
                  <ShoppingBag className="h-4 w-4" />
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-xs"
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
                    className="lg:hidden h-9 w-9"
                    aria-label="Mở menu"
                  >
                    {isOpen ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Menu className="h-4 w-4" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                      Điều hướng Nam Long Center
                    </SheetDescription>
                  </SheetHeader>

                  {/* Mobile Search */}
                  <div className="mt-6">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Tìm kiếm..."
                          className="w-full pl-10 h-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </form>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="mt-6">
                    <div className="space-y-3">
                      {navigationItems.map((item) => (
                        <div key={item.label} className="space-y-2">
                          <Link
                            to={item.href}
                            className="block text-base font-medium hover:text-blue-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.label}
                          </Link>
                          {item.items && (
                            <div className="ml-4 space-y-1">
                              {item.items.map((subItem) => (
                                <Link
                                  key={subItem.label}
                                  to={subItem.href}
                                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </nav>

                  {/* Mobile Auth Buttons */}
                  {!user && (
                    <div className="mt-8 space-y-2">
                      <Button variant="outline" className="w-full h-9" asChild>
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          Đăng nhập
                        </Link>
                      </Button>
                      <Button
                        className="w-full h-9 bg-blue-600 hover:bg-blue-700"
                        asChild
                      >
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          Đăng ký
                        </Link>
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
