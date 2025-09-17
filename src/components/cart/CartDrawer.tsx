/**
 * Cart Drawer Component
 * Drawer hiển thị giỏ hàng trên mobile và desktop
 */

import React from 'react';
import { X, ShoppingCart, Trash2, CreditCard, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { CartItem } from './CartItem';
import { Loading } from '../ui/loading';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, total, count, isLoading, clearCart } = useCart();
  const { user } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth';
      return;
    }
    onCheckout?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <ShoppingCart size={24} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Giỏ hàng
              </h2>
              {count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {count} sản phẩm
                </Badge>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loading size="lg" text="Đang tải giỏ hàng..." />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <ShoppingCart size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Giỏ hàng trống
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
                </p>
                <Button onClick={onClose} variant="outline">
                  Tiếp tục mua sắm
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    variant="compact"
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tạm tính ({count} sản phẩm):
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(total)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Phí vận chuyển:
                  </span>
                  <span className="font-medium text-green-600">
                    Miễn phí
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">
                    Tổng cộng:
                  </span>
                  <span className="text-blue-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 text-lg font-semibold"
                  disabled={isLoading}
                >
                  <CreditCard size={20} className="mr-2" />
                  Thanh toán
                  <ArrowRight size={20} className="ml-2" />
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Tiếp tục mua sắm
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={clearCart}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Xóa tất cả
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile Cart Drawer (full screen)
export function MobileCartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, total, count, isLoading, clearCart } = useCart();
  const { user } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleCheckout = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    onCheckout?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <ShoppingCart size={24} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Giỏ hàng
            </h2>
            {count > 0 && (
              <Badge variant="secondary" className="ml-2">
                {count}
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loading size="lg" text="Đang tải..." />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <ShoppingCart size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Hãy thêm sản phẩm vào giỏ hàng
              </p>
              <Button onClick={onClose} variant="outline">
                Tiếp tục mua sắm
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  variant="compact"
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900 dark:text-white">
                Tổng cộng:
              </span>
              <span className="text-blue-600">
                {formatPrice(total)}
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading}
            >
              <CreditCard size={20} className="mr-2" />
              Thanh toán
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Tiếp tục mua sắm
              </Button>
              
              <Button
                variant="ghost"
                onClick={clearCart}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
