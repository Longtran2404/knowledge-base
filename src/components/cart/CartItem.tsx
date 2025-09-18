/**
 * Cart Item Component
 * Hiển thị từng item trong giỏ hàng
 */

import React from 'react';
import { Minus, Plus, Trash2, BookOpen, Package } from 'lucide-react';
import { useCart, CartItemWithDetails } from '../../contexts/CartContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface CartItemProps {
  item: CartItemWithDetails;
  onRemove?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export function CartItem({ 
  item, 
  onRemove, 
  onUpdateQuantity, 
  showActions = true,
  variant = 'default'
}: CartItemProps) {
  const { updateQuantity, removeFromCart, isLoading } = useCart();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(item.id);
      onRemove?.(item.id);
    } else {
      await updateQuantity(item.id, newQuantity);
      onUpdateQuantity?.(item.id, newQuantity);
    }
  };

  const handleRemove = async () => {
    await removeFromCart(item.id);
    onRemove?.(item.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getItemIcon = () => {
    return item.item_type === 'course' ? (
      <BookOpen size={16} className="text-blue-600" />
    ) : (
      <Package size={16} className="text-green-600" />
    );
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              {getItemIcon()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">
                {item.item_type === 'course' ? 'Khóa học' : 'Sản phẩm'}
              </Badge>
              <span className="text-sm font-semibold text-blue-600">
                {formatPrice(item.price)}
              </span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Minus size={14} />
              </Button>
              
              <span className="w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Plus size={14} />
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              disabled={isLoading}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              {getItemIcon()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {item.name}
                </h3>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">
                    {item.item_type === 'course' ? 'Khóa học' : 'Sản phẩm'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {item.item_type === 'course' ? 'course' : 'product'}
                  </span>
                </div>
                
                <div className="mt-2">
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(item.price)}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    mỗi {item.item_type === 'course' ? 'khóa học' : 'sản phẩm'}
                  </span>
                </div>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <Minus size={16} />
                  </Button>
                  
                  <span className="w-12 text-center text-lg font-medium">
                    {item.quantity}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(item.quantity * item.price)}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRemove}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-1"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
