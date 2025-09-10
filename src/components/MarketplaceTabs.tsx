
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Star, Zap, Book, Code, Package, Wrench } from 'lucide-react';
import { Product } from '@/lib/mockData';

interface MarketplaceTabsProps {
  products: Product[];
}

const MarketplaceTabs: React.FC<MarketplaceTabsProps> = ({ products }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'tool' | 'book' | 'software' | 'bundle'>('all');

  const tabs = [
    { id: 'all', label: 'Tất cả', icon: Package, color: 'blue' },
    { id: 'tool', label: 'Công cụ', icon: Wrench, color: 'green' },
    { id: 'book', label: 'Sách', icon: Book, color: 'purple' },
    { id: 'software', label: 'Phần mềm', icon: Code, color: 'indigo' },
    { id: 'bundle', label: 'Gói Bundle', icon: Zap, color: 'orange' }
  ];

  const filteredProducts = products.filter(product => 
    activeTab === 'all' || product.category === activeTab
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tool':
        return <Wrench className="w-5 h-5" />;
      case 'book':
        return <Book className="w-5 h-5" />;
      case 'software':
        return <Code className="w-5 h-5" />;
      case 'bundle':
        return <Zap className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tool':
        return 'bg-green-100 text-green-800';
      case 'book':
        return 'bg-purple-100 text-purple-800';
      case 'software':
        return 'bg-indigo-100 text-indigo-800';
      case 'bundle':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${
              i < Math.floor(rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`} 
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Marketplace
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá các công cụ, sách, phần mềm và gói bundle chất lượng cao cho ngành xây dựng
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id as 'all' | 'tool' | 'book' | 'software' | 'bundle')}
                className={`flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? `bg-${tab.color}-600 hover:bg-${tab.color}-700 text-white` 
                    : `hover:bg-${tab.color}-50 hover:text-${tab.color}-600 hover:border-${tab.color}-200`
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.slice(0, 6).map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden bg-white">
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {/* Placeholder with category icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl opacity-30">
                    {getCategoryIcon(product.category)}
                  </div>
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.isNew && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      MỚI
                    </span>
                  )}
                  {product.isHot && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      HOT
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(product.category)}`}>
                    {getCategoryIcon(product.category)}
                    {product.category === 'tool' ? 'Công cụ' :
                     product.category === 'book' ? 'Sách' :
                     product.category === 'software' ? 'Phần mềm' :
                     product.category === 'bundle' ? 'Bundle' : 'Khác'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="mb-4">
                  <StarRating rating={product.rating} />
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Mua ngay
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Show More Section */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
          >
            Xem tất cả sản phẩm ({filteredProducts.length})
          </Button>
        </div>

        {/* Special Offers Banner */}
        <div className="mt-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-8 text-center text-white">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Ưu Đãi Đặc Biệt</h3>
            <p className="text-lg mb-6 text-white/90">
              Mua 2 sản phẩm bất kỳ và nhận ngay voucher 500K cho lần mua tiếp theo
            </p>
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold">
              Khám phá ngay
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceTabs;