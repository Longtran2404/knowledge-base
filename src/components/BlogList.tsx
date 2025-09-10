
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Calendar, Clock, Tag, TrendingUp } from 'lucide-react';
import { BlogPost } from '@/lib/mockData';

interface BlogListProps {
  posts: BlogPost[];
  showTitle?: boolean;
}

const BlogList: React.FC<BlogListProps> = ({ posts, showTitle = true }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Công nghệ': 'bg-blue-100 text-blue-800',
      'BIM': 'bg-purple-100 text-purple-800',
      'Nghề nghiệp': 'bg-green-100 text-green-800',
      'Tin tức': 'bg-orange-100 text-orange-800',
      'Hướng dẫn': 'bg-indigo-100 text-indigo-800',
      'Xu hướng': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tin Tức & Blog
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cập nhật xu hướng mới nhất trong ngành xây dựng và chia sẻ kiến thức chuyên môn
            </p>
          </div>
        )}

        {/* Featured Post */}
        {posts.length > 0 && (
          <div className="mb-12">
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                {/* Featured Image */}
                <div className="relative h-64 lg:h-auto bg-gradient-to-br from-blue-100 to-indigo-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl opacity-30">📰</div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                      NỔI BẬT
                    </span>
                  </div>
                </div>

                {/* Featured Content */}
                <div className="p-8 lg:py-12">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(posts[0].category)}`}>
                      {posts[0].category}
                    </span>
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {posts[0].title}
                  </h3>

                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    {posts[0].excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(posts[0].publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{posts[0].readTime} phút đọc</span>
                      </div>
                    </div>

                    <Button className="bg-blue-600 hover:bg-blue-700 group">
                      Đọc tiếp
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Posts Grid */}
        {posts.length > 1 && (
          <>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Bài Viết Gần Đây</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(1).map((post) => (
                  <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden bg-white">
                    {/* Post Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl opacity-30">📝</div>
                      </div>
                      
                      {/* Reading time overlay */}
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-xs font-medium">
                          {post.readTime} phút
                        </span>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6">
                      {/* Category */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)}`}>
                          <Tag className="w-3 h-3" />
                          {post.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h4>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}p</span>
                        </div>
                      </div>

                      {/* Action */}
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200"
                      >
                        Đọc tiếp
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
              >
                Xem tất cả bài viết
              </Button>
            </div>
          </>
        )}

        {/* Newsletter Subscription */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Đăng Ký Nhận Tin</h3>
            <p className="text-lg mb-6 text-blue-100">
              Nhận thông báo về các bài viết mới và xu hướng ngành xây dựng
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-300"
              />
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold whitespace-nowrap">
                Đăng ký
              </Button>
            </div>
            <p className="text-xs text-blue-200 mt-3">
              Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất cứ lúc nào.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogList;