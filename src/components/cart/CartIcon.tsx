/**
 * Cart Icon Component
 * Hiển thị icon giỏ hàng với số lượng items
 */

import React from 'react';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface CartIconProps {
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function CartIcon({ 
  onClick, 
  variant = 'ghost', 
  size = 'md',
  showCount = true,
  className = ''
}: CartIconProps) {
  const { count, isLoading } = useCart();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={onClick}
      disabled={isLoading}
      className={`relative ${sizeClasses[size]} ${className}`}
      aria-label={`Giỏ hàng có ${count} sản phẩm`}
    >
      <ShoppingCart 
        size={iconSizes[size]} 
        className="text-gray-700 dark:text-gray-300" 
      />
      
      {showCount && count > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        </div>
      )}
    </Button>
  );
}

// Mobile Cart Icon với styling khác
export function MobileCartIcon({ onClick, className = '' }: { onClick?: () => void; className?: string }) {
  const { count, isLoading } = useCart();

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={`Giỏ hàng có ${count} sản phẩm`}
    >
      <ShoppingBag 
        size={20} 
        className="text-gray-700 dark:text-gray-300" 
      />
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {count > 99 ? '99+' : count}
        </span>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        </div>
      )}
    </button>
  );
}
