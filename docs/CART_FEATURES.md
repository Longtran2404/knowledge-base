# 🛒 Chức năng Giỏ hàng - Cart Features

## Tổng quan

Hệ thống giỏ hàng hoàn chỉnh cho Knowledge Base với các tính năng:

- ✅ **Giỏ hàng cá nhân**: Mỗi user có giỏ hàng riêng biệt
- ✅ **Đồng bộ Supabase**: Lưu trữ và đồng bộ với database
- ✅ **Local Storage**: Lưu trữ tạm thời khi chưa đăng nhập
- ✅ **Responsive Design**: Tối ưu cho mobile và desktop
- ✅ **Real-time Updates**: Cập nhật real-time khi có thay đổi
- ✅ **Type Safety**: TypeScript đầy đủ

## 🗄️ Database Schema

### Bảng `products`
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category TEXT,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng `cart_items`
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    product_id UUID REFERENCES products(id),
    course_id UUID REFERENCES courses(id),
    item_type TEXT CHECK (item_type IN ('product', 'course')),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, product_id, item_type),
    UNIQUE(user_id, course_id, item_type)
);
```

## 🧩 Components

### 1. CartContext (`src/contexts/CartContext.tsx`)
- Quản lý state giỏ hàng toàn cục
- Đồng bộ với Supabase và localStorage
- Cung cấp các functions: addToCart, removeFromCart, updateQuantity, clearCart

### 2. CartIcon (`src/components/cart/CartIcon.tsx`)
- Icon giỏ hàng với số lượng items
- Hỗ trợ desktop và mobile variants
- Hiển thị loading state

### 3. CartDrawer (`src/components/cart/CartDrawer.tsx`)
- Drawer hiển thị giỏ hàng
- Desktop và mobile variants
- Tích hợp checkout flow

### 4. CartItem (`src/components/cart/CartItem.tsx`)
- Component hiển thị từng item trong giỏ hàng
- Hỗ trợ compact và default variants
- Actions: update quantity, remove item

### 5. AddToCartButton (`src/components/cart/AddToCartButton.tsx`)
- Button thêm sản phẩm vào giỏ hàng
- Hỗ trợ products và courses
- Loading states và feedback

## 🚀 Cách sử dụng

### 1. Setup Database
```bash
# Chạy script setup cart database
npm run setup:cart
```

### 2. Sử dụng trong Component
```tsx
import { useCart } from '../contexts/CartContext';
import { AddToCartButton } from '../components/cart/AddToCartButton';

function ProductCard({ product }) {
  const { addToCart, items, total, count } = useCart();

  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <AddToCartButton 
        product={product}
        price={product.price}
        onAdd={() => console.log('Added to cart!')}
      />
    </div>
  );
}
```

### 3. Hiển thị Cart Icon
```tsx
import { CartIcon } from '../components/cart/CartIcon';

function Header() {
  return (
    <header>
      <CartIcon onClick={() => setCartOpen(true)} />
    </header>
  );
}
```

## 📱 Mobile Responsive

### Header Mobile
- Hiển thị thông tin user thay vì nút đăng nhập
- Cart icon với số lượng items
- User avatar và role badge

### Cart Drawer Mobile
- Full screen drawer
- Touch-friendly controls
- Optimized for small screens

## 🔄 State Management

### Cart State
```typescript
interface CartState {
  items: CartItemWithDetails[];
  total: number;
  count: number;
  isLoading: boolean;
  error: string | null;
}
```

### Actions
- `addToCart()`: Thêm item vào giỏ hàng
- `removeFromCart()`: Xóa item khỏi giỏ hàng
- `updateQuantity()`: Cập nhật số lượng
- `clearCart()`: Xóa toàn bộ giỏ hàng
- `syncCart()`: Đồng bộ với Supabase
- `refreshCart()`: Refresh giỏ hàng

## 🔐 Security

### Row Level Security (RLS)
- Users chỉ có thể xem/sửa giỏ hàng của chính họ
- Products có thể xem bởi tất cả users
- Chỉ admin mới có thể quản lý products

### Data Validation
- Kiểm tra quantity > 0
- Kiểm tra price >= 0
- Unique constraints cho user + product/course

## 🧪 Testing

### Test Cart Functions
```bash
# Test database connection
npm run test:db

# Test cart functionality
npm run test:cart
```

### Manual Testing
1. Thêm sản phẩm vào giỏ hàng
2. Kiểm tra persistence khi refresh
3. Test đồng bộ khi đăng nhập/đăng xuất
4. Test responsive trên mobile

## 🚀 Deployment

### Environment Variables
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. Chạy `complete-schema.sql` trong Supabase SQL Editor
2. Hoặc chạy `npm run setup:cart` để setup tự động

## 📊 Performance

### Optimizations
- Lazy loading cho cart drawer
- Debounced quantity updates
- Efficient re-renders với useReducer
- Local storage caching

### Monitoring
- Cart abandonment tracking
- Performance metrics
- Error logging

## 🔮 Future Enhancements

- [ ] Wishlist functionality
- [ ] Cart sharing
- [ ] Bulk operations
- [ ] Cart analytics
- [ ] Offline support
- [ ] Push notifications for cart updates

## 📞 Support

Nếu gặp vấn đề với chức năng giỏ hàng:

1. Kiểm tra console logs
2. Verify database connection
3. Check RLS policies
4. Test với sample data

---

**🎉 Chức năng giỏ hàng đã sẵn sàng sử dụng!**
