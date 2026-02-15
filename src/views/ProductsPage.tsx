import React, { useState, useEffect } from 'react';
import { Search, Grid, List, BookOpen, ShoppingCart } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { useGlobalData } from '../contexts/GlobalDataContext';
import { Product, Course } from '../lib/supabase-config';

interface CombinedItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  item_type: 'product' | 'course';
  is_active: boolean;
}

const ProductsPage: React.FC = () => {
  const { products, courses, productsLoading, coursesLoading, refreshProducts, refreshCourses } = useGlobalData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addToCart } = useCart();

  const loading = productsLoading || coursesLoading;

  const categories = [
    { id: 'all', name: 'Tất cả', count: products.length + courses.length },
    { id: 'course', name: 'Khóa học', count: courses.length },
    { id: 'ebook', name: 'E-book', count: products.filter(p => p.category === 'ebook').length },
    { id: 'template', name: 'Template', count: products.filter(p => p.category === 'template').length },
  ];

  useEffect(() => {
    refreshProducts();
    refreshCourses();
  }, [refreshProducts, refreshCourses]);

  const filteredData = (): CombinedItem[] => {
    let filtered: CombinedItem[] = [
      ...products.map(product => ({
        ...product,
        item_type: 'product' as const,
        name: product.name
      })),
      ...courses.map(course => ({
        id: course.id,
        name: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        image_url: course.image_url,
        item_type: 'course' as const,
        is_active: course.is_published,
      }))
    ];
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'course') {
        filtered = filtered.filter(item => item.item_type === 'course');
      } else {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }
    }
    return filtered;
  };

  const handleAddToCart = async (item: CombinedItem) => {
    try {
      await addToCart({
        product_id: item.item_type === 'product' ? item.id : undefined,
        course_id: item.item_type === 'course' ? item.id : undefined,
        item_type: item.item_type,
        price: item.price,
        name: item.name,
        image_url: item.image_url
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Sản phẩm & Khóa học" description="Khám phá khóa học BIM, AutoCAD và sản phẩm chất lượng cao" url="/san-pham" />

      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sản phẩm & Khóa học
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Sản phẩm & Khóa học
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Khám phá các khóa học BIM, AutoCAD và sản phẩm chất lượng cao từ Knowledge Base
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-8 -mt-4 relative z-10">

        <section className="py-6 border border-border rounded-xl mb-8 bg-card">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm, khóa học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
                  aria-label="Tìm kiếm sản phẩm và khóa học"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Lưới
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                Danh sách
              </Button>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Tất cả sản phẩm & khóa học</h2>
            <p className="text-muted-foreground">
              {loading ? 'Đang tải...' : `Tìm thấy ${filteredData().length} sản phẩm phù hợp`}
            </p>
          </div>

          {loading ? (
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6">
                  <div className="h-48 bg-muted rounded mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
            {filteredData().map((item) => (
              <Card key={item.id} className="border border-border bg-card shadow-sm hover:shadow-md overflow-hidden">
                {item.image_url ? (
                  <div className="h-48 bg-muted">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }} />
                  </div>
                ) : (
                  <div className="h-48 bg-primary/5 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
                        {item.item_type === 'course' ? <BookOpen className="w-8 h-8" /> : <ShoppingCart className="w-8 h-8" />}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {item.item_type === 'course' ? 'Khóa học' : 'Sản phẩm'}
                      </p>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      {item.item_type === 'course' ? 'Khóa học' : item.category || 'Sản phẩm'}
                    </Badge>
                    <div className="text-lg font-bold text-foreground">
                      {!item.price || item.price === 0 ? 'Miễn phí' : `${item.price.toLocaleString()}đ`}
                    </div>
                  </div>
                  <CardTitle className="text-base line-clamp-2 text-foreground">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{item.description}</p>
                  <Button className="w-full" onClick={() => handleAddToCart(item)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Thêm vào giỏ hàng
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </section>

        {!loading && filteredData().length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              {products.length === 0 && courses.length === 0 ? (
                <BookOpen className="w-12 h-12 text-muted-foreground" />
              ) : (
                <Search className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {products.length === 0 && courses.length === 0
                ? 'Nội dung đang được cập nhật'
                : 'Không tìm thấy sản phẩm phù hợp'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {products.length === 0 && courses.length === 0
                ? 'Chúng tôi đang chuẩn bị các khóa học và sản phẩm chất lượng. Vui lòng quay lại sau.'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm kết quả.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <Button
                variant="outline"
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
