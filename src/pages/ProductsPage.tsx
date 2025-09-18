/**
 * Products Page - Trang sản phẩm
 * Hiển thị danh sách sản phẩm và khóa học
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Clock, Users } from 'lucide-react';
import { LiquidGlassButton } from '../components/ui/liquid-glass-button';
import { LiquidGlassCard } from '../components/ui/liquid-glass-card';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AddToCartButton, CourseAddToCartButton, ProductAddToCartButton } from '../components/cart/AddToCartButton';
import { useCart } from '../contexts/CartContext';
import { Product, Course } from '../lib/supabase-config';
import { supabase } from '../lib/supabase-config';
import { productsData } from '../data/products';
import { AnimeScrollEffects, StaggerAnimation } from '../components/animations/anime-scroll-effects';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
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

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load products from Supabase
      const { data: supabaseProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Load courses from Supabase
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      // If Supabase data is empty or error, use static data as fallback
      if (productsError || !supabaseProducts || supabaseProducts.length === 0) {
        console.warn('Using static products data as fallback');
        // Convert static data to Product format
        const staticProducts: Product[] = productsData.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.thumbnail || undefined,
          category: product.type,
          stock_quantity: 100,
          is_active: true,
          created_at: product.createdAt,
          updated_at: product.createdAt
        }));
        setProducts(staticProducts);
      } else {
        setProducts(supabaseProducts);
      }

      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Use static data as ultimate fallback
      const staticProducts: Product[] = productsData.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.thumbnail || undefined,
        category: product.type,
        stock_quantity: 100,
        is_active: true,
        created_at: product.createdAt,
        updated_at: product.createdAt
      }));
      setProducts(staticProducts);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <AnimeScrollEffects animationType="fadeInUp" delay={200}>
          <LiquidGlassCard variant="gradient" glow={true} className="mb-8 p-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Sản phẩm & <span className="text-blue-600">Khóa học</span>
            </h1>
            <p className="text-xl text-gray-700">
              Khám phá các khóa học và sản phẩm chất lượng cao
            </p>
          </LiquidGlassCard>
        </AnimeScrollEffects>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm, khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <LiquidGlassButton
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </LiquidGlassButton>
              <LiquidGlassButton
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </LiquidGlassButton>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <StaggerAnimation staggerDelay={100}>
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredData().map((item, index) => (
              <AnimeScrollEffects
                key={item.id}
                animationType="fadeInUp"
                delay={300 + index * 50}
              >
                <LiquidGlassCard variant="interactive" hover={true} className="overflow-hidden">
              {item.image_url ? (
                <div className="aspect-video bg-gray-100">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      {item.item_type === 'course' ? (
                        <Users className="w-8 h-8 text-white" />
                      ) : (
                        <Star className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <p className="text-sm text-blue-600 font-medium">
                      {item.item_type === 'course' ? 'Khóa học' : 'Sản phẩm'}
                    </p>
                  </div>
                </div>
              )}

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {item.item_type === 'course' ? 'Khóa học' : item.category || 'Sản phẩm'}
                  </Badge>
                  {item.item_type === 'course' && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>4 tuần</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(item.price)}
                  </div>
                  
                  <LiquidGlassButton
                    onClick={() => handleAddToCart(item)}
                    variant="primary"
                    glow={true}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Thêm vào giỏ
                  </LiquidGlassButton>
                </div>
              </CardContent>
            </LiquidGlassCard>
              </AnimeScrollEffects>
            ))}
          </div>
        </StaggerAnimation>

        {/* Empty State */}
        {filteredData().length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-500 mb-4">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
            <LiquidGlassButton
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="secondary"
            >
              Xóa bộ lọc
            </LiquidGlassButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
