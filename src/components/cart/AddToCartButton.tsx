/**
 * Add to Cart Button Component
 * Button để thêm sản phẩm/khóa học vào giỏ hàng
 */

import React, { useState } from 'react';
import { ShoppingCart, Plus, Check, Loader2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Product, Course } from '../../lib/supabase-config';

interface AddToCartButtonProps {
  product?: Product;
  course?: Course;
  price: number;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
  onAdd?: () => void;
  onError?: (error: string) => void;
}

export function AddToCartButton({
  product,
  course,
  price,
  variant = 'default',
  size = 'md',
  showIcon = true,
  showText = true,
  className = '',
  onAdd,
  onError
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCart();
  const { user } = useAuth();
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const item = product || course;
  if (!item) return null;

  const itemType = product ? 'product' : 'course';
  const itemName = product ? product.name : course?.title || '';
  const itemImage = product ? product.image_url : course?.image_url;

  const handleAddToCart = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth';
      return;
    }

    try {
      setIsAdding(true);
      
      await addToCart({
        product_id: product?.id,
        course_id: course?.id,
        item_type: itemType,
        price,
        name: itemName,
        image_url: itemImage
      });

      setIsAdded(true);
      onAdd?.();

      // Reset after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);

    } catch (error) {
      console.error('Error adding to cart:', error);
      onError?.(error instanceof Error ? error.message : 'Không thể thêm vào giỏ hàng');
    } finally {
      setIsAdding(false);
    }
  };

  const getButtonText = () => {
    if (isAdding) return 'Đang thêm...';
    if (isAdded) return 'Đã thêm!';
    return showText ? 'Thêm vào giỏ' : '';
  };

  const getButtonIcon = () => {
    if (isAdding) return <Loader2 size={16} className="animate-spin" />;
    if (isAdded) return <Check size={16} />;
    if (showIcon) return <ShoppingCart size={16} />;
    return null;
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || isLoading}
      variant={isAdded ? 'outline' : variant}
      className={`${sizeClasses[size]} ${className} ${
        isAdded ? 'border-green-500 text-green-600 hover:bg-green-50' : ''
      }`}
    >
      {getButtonIcon()}
      {showText && (
        <span className={showIcon ? 'ml-2' : ''}>
          {getButtonText()}
        </span>
      )}
    </Button>
  );
}

// Quick Add Button (chỉ icon)
export function QuickAddButton({
  product,
  course,
  price,
  className = '',
  onAdd,
  onError
}: Omit<AddToCartButtonProps, 'showText' | 'showIcon'>) {
  return (
    <AddToCartButton
      product={product}
      course={course}
      price={price}
      showText={false}
      showIcon={true}
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 ${className}`}
      onAdd={onAdd}
      onError={onError}
    />
  );
}

// Course Add to Cart Button
export function CourseAddToCartButton({
  course,
  className = '',
  onAdd,
  onError
}: {
  course: Course;
  className?: string;
  onAdd?: () => void;
  onError?: (error: string) => void;
}) {
  return (
    <AddToCartButton
      course={course}
      price={course.price}
      variant="default"
      size="lg"
      className={`w-full ${className}`}
      onAdd={onAdd}
      onError={onError}
    />
  );
}

// Product Add to Cart Button
export function ProductAddToCartButton({
  product,
  className = '',
  onAdd,
  onError
}: {
  product: Product;
  className?: string;
  onAdd?: () => void;
  onError?: (error: string) => void;
}) {
  return (
    <AddToCartButton
      product={product}
      price={product.price}
      variant="default"
      size="md"
      className={className}
      onAdd={onAdd}
      onError={onError}
    />
  );
}
