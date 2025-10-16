import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Clock, Users, BookOpen, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { useGlobalData } from '../contexts/GlobalDataContext';
import { Product, Course } from '../lib/supabase-config';
import { supabase } from '../lib/supabase-config';
import { productsData } from '../data/products';

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addToCart } = useCart();

  // Categories
  const categories = [
    { id: 'all', name: 'Tất cả', count: 0 },
    { id: 'course', name: 'Khóa học', count: 0 },
    { id: 'ebook', name: 'E-book', count: 0 },
    { id: 'template', name: 'Template', count: 0 },
  ];

  // Load data from global context
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([refreshProducts(), refreshCourses()]);
      setLoading(false);
    };

    loadData();
  }, [refreshProducts, refreshCourses]);

  useEffect(() => {
    setLoading(productsLoading || coursesLoading);
  }, [productsLoading, coursesLoading]);

  // Filter data
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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'course') {
        filtered = filtered.filter(item => item.item_type === 'course');
      } else {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }
    }

    return filtered;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-sm p-6">
                  <div className="h-48 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="bg-transparent relative py-16 mb-8 rounded-lg">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sản phẩm & Khóa học
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Sản phẩm & <span className="text-blue-600">Khóa học</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              Khám phá các khóa học BIM, AutoCAD và sản phẩm chất lượng cao từ Nam Long Center
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-transparent border rounded-lg mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm sản phẩm, khóa học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-white/20 rounded-md bg-white/10 text-white"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
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

        {/* Products Grid */}
        <section className="py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Tất cả sản phẩm & khóa học</h2>
            <p className="text-lg text-gray-400">
              Tìm thấy {filteredData().length} sản phẩm phù hợp
            </p>
          </div>

          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
          }>
            {filteredData().map((item) => (
              <Card key={item.id} className="border border-white/10 shadow-sm hover:shadow-md transition-shadow bg-white/5 backdrop-blur-sm overflow-hidden">
                {item.image_url ? (
                  <div className="h-48 bg-white/10">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        {item.item_type === 'course' ? (
                          <BookOpen className="w-8 h-8 text-white" />
                        ) : (
                          <ShoppingCart className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <p className="text-sm text-blue-400 font-medium">
                        {item.item_type === 'course' ? 'Khóa học' : 'Sản phẩm'}
                      </p>
                    </div>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-400/30">
                      {item.item_type === 'course' ? 'Khóa học' : item.category || 'Sản phẩm'}
                    </Badge>
                    <div className="text-xl font-bold text-white">
                      {!item.price || item.price === 0 ? "Miễn phí" : `${item.price.toLocaleString()}đ`}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 text-white">
                    {item.name}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {item.description}
                    </p>
                    {item.item_type === 'course' && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Thời lượng: 4 tuần</span>
                      </div>
                    )}
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Thêm vào giỏ hàng
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {filteredData().length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-400 mb-4">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="outline"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
