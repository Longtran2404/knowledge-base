import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Menu, X, Bell, Settings } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { CartIcon, MobileCartIcon } from './cart/CartIcon';
import { CartDrawer, MobileCartDrawer } from './cart/CartDrawer';
import { useAuth } from '../contexts/UnifiedAuthContext';
import { Badge } from './ui/badge';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { userProfile: user, signOut } = useAuth();

  const navigationItems = [
    { label: 'Trang chủ', href: '/', isActive: true },
    { label: 'Khóa học', href: '/courses' },
    { label: 'Thư viện', href: '/resources' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Blog', href: '/blog' },
    { label: 'Hợp tác', href: '/collaboration' },
    { label: 'Liên hệ', href: '/contact' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">NL</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Nam Long Center</h1>
                <p className="text-xs text-gray-500">Xây dựng tương lai</p>
              </div>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  item.isActive 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search - Hidden on mobile */}
            <div className="hidden md:block relative">
              <Input 
                type="text"
                placeholder="Tìm kiếm khóa học, sản phẩm..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {/* Cart Icon */}
              <CartIcon 
                onClick={() => setIsCartOpen(true)}
                className="hidden sm:flex"
              />
              
              {/* Mobile Cart Icon */}
              <MobileCartIcon 
                onClick={() => setIsCartOpen(true)}
                className="sm:hidden"
              />

              {user ? (
                /* User Profile */
                <div className="flex items-center gap-2">
                  {/* Desktop User Profile */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                      )}
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="p-2">
                        <Bell size={16} className="text-gray-600" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2">
                        <Settings size={16} className="text-gray-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={signOut}
                        className="text-red-600 hover:text-red-700"
                      >
                        Đăng xuất
                      </Button>
                    </div>
                  </div>

                  {/* Mobile User Profile */}
                  <div className="sm:hidden flex items-center gap-2">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                    )}
                    <div className="text-xs">
                      <p className="font-medium text-gray-900 truncate max-w-20">
                        {user.full_name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                /* Login/Register Buttons */
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hidden sm:flex text-gray-700 hover:text-blue-600"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    size="sm" 
                    className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Đăng ký
                  </Button>
                  
                  {/* Mobile Login Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="sm:hidden p-2"
                    onClick={() => window.location.href = '/auth'}
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="md:hidden relative">
                <Input 
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              {/* Navigation Links */}
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-sm font-medium py-2 px-4 rounded-lg transition-colors ${
                    item.isActive 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 sm:hidden">
                <Button 
                  variant="outline" 
                  className="justify-center"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.location.href = '/auth';
                  }}
                >
                  Đăng nhập
                </Button>
                <Button 
                  className="justify-center bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.location.href = '/auth';
                  }}
                >
                  Đăng ký
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cart Drawers */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          window.location.href = '/checkout';
        }}
      />
      
      <MobileCartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          window.location.href = '/checkout';
        }}
      />
    </header>
  );
};

export default Header;
