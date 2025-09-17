-- Cart Schema for Nam Long Center
-- Tạo bảng giỏ hàng và các bảng liên quan

-- Bảng cart_items để lưu các sản phẩm trong giỏ hàng
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('product', 'course')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Đảm bảo mỗi user chỉ có 1 item của cùng 1 sản phẩm/khóa học
    UNIQUE(user_id, product_id, item_type),
    UNIQUE(user_id, course_id, item_type)
);

-- Bảng products nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(500),
    category VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_course_id ON cart_items(course_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_item_type ON cart_items(item_type);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- RLS Policies cho cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users chỉ có thể xem và chỉnh sửa giỏ hàng của chính họ
CREATE POLICY "Users can view their own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies cho products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Tất cả users đều có thể xem products
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Policy: Chỉ admin mới có thể quản lý products
CREATE POLICY "Only admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM account_nam_long_center 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers cho updated_at
CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON cart_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function để tính tổng giá trị giỏ hàng
CREATE OR REPLACE FUNCTION get_cart_total(user_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(quantity * price) 
         FROM cart_items 
         WHERE user_id = user_uuid), 
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Function để đếm số lượng items trong giỏ hàng
CREATE OR REPLACE FUNCTION get_cart_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(quantity) 
         FROM cart_items 
         WHERE user_id = user_uuid), 
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Sample data cho products
INSERT INTO products (name, description, price, image_url, category, stock_quantity) VALUES
('Khóa học React cơ bản', 'Học React từ A-Z cho người mới bắt đầu', 299000, '/images/products/react-basic.jpg', 'course', 100),
('Khóa học Node.js nâng cao', 'Xây dựng API và backend với Node.js', 499000, '/images/products/nodejs-advanced.jpg', 'course', 50),
('E-book JavaScript ES6+', 'Tài liệu học JavaScript hiện đại', 99000, '/images/products/js-es6-ebook.jpg', 'ebook', 200),
('Template Landing Page', 'Template HTML/CSS responsive', 199000, '/images/products/landing-template.jpg', 'template', 30),
('Khóa học TypeScript', 'TypeScript từ cơ bản đến nâng cao', 399000, '/images/products/typescript-course.jpg', 'course', 75)
ON CONFLICT DO NOTHING;
