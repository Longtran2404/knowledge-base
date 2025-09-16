import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { useAppStore } from "../../lib/stores/app-store";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Separator } from "../ui/separator";
import { OptimizedImage } from "../ui/optimized-image";

interface ShoppingCartProps {
  className?: string;
}

export function ShoppingCart({ className }: ShoppingCartProps) {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  } = useAppStore();

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    toast.success("Đang chuyển đến trang thanh toán...");
    // Navigate to checkout page
    window.location.href = "/checkout";
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative hover:bg-blue-50 ${className}`}
          aria-label={`Giỏ hàng (${itemCount} sản phẩm)`}
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
            >
              {itemCount > 99 ? "99+" : itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-6 w-6" />
            Giỏ hàng ({itemCount})
          </SheetTitle>
          <SheetDescription>
            Xem lại các khóa học và sản phẩm đã chọn
          </SheetDescription>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Giỏ hàng trống
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Hãy khám phá các khóa học và sản phẩm tuyệt vời của chúng tôi
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link to="/khoa-hoc">
                Xem khóa học
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.type}`} className="group">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    {/* Item Image */}
                    <div className="relative w-16 h-16 bg-white rounded-md overflow-hidden border">
                      <OptimizedImage
                        src={item.image || ""}
                        alt={item.title}
                        width={64}
                        height={64}
                        className="object-cover"
                        fallback={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop&crop=center&auto=format&q=80`}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        {item.type === "course" ? "Khóa học" : "Sản phẩm"}
                      </p>

                      {/* Price */}
                      <div className="mt-2">
                        <span className="font-bold text-blue-600">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Cart Summary */}
            <div className="space-y-4">
              {/* Clear Cart */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Xóa tất cả
                </Button>
              </div>

              {/* Total */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Đã bao gồm VAT (nếu có)
                </p>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all group"
                onClick={handleCheckout}
              >
                <CreditCard className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Thanh toán ngay
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Continue Shopping */}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/san-pham">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Mini cart component for quick access
export function MiniCart() {
  const { cartItems } = useAppStore();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all animate-bounce">
            <ShoppingBag className="h-6 w-6" />
            <Badge className="absolute -top-2 -right-2 bg-red-500">
              {itemCount}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <ShoppingCart />
        </SheetContent>
      </Sheet>
    </div>
  );
}
