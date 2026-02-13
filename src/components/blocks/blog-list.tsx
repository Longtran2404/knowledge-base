
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { ArrowRight, Calendar, Clock } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";

import { Post } from "../../types/post";
import { formatDate } from "../../lib/shared/formatters";

interface BlogListProps {
  className?: string;
  showTitle?: boolean;
  limit?: number;
}

export default function BlogList({ className, showTitle = true, limit }: BlogListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/posts");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data: Post[] = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, limit ? limit : posts.length);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log("Newsletter subscription:", email);
      setEmail("");
      // Handle newsletter subscription logic
    }
  };

  const PostCard = ({ post, isFeatured = false }: { post: Post; isFeatured?: boolean }) => (
    <Card className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
      isFeatured ? "lg:col-span-2" : ""
    }`}>
      <div className={`${isFeatured ? "lg:grid lg:grid-cols-2 lg:gap-8" : ""}`}>
        {/* Post Image */}
        <div className={`relative ${isFeatured ? "h-64 lg:h-auto" : "h-48"} bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden`}>
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-30">📰</div>
            </div>
          )}
          
          {isFeatured && (
            <div className="absolute top-4 left-4">
              <Badge variant="destructive">
                NỔI BẬT
              </Badge>
            </div>
          )}
        </div>

        {/* Post Content */}
        <CardContent className={`${isFeatured ? "p-8 lg:py-12" : "p-6"}`}>
          <div className="space-y-4">
            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>5 phút đọc</span>
              </div>
            </div>

            {/* Title */}
            <h3 className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 ${
              isFeatured ? "text-2xl lg:text-3xl" : "text-xl"
            }`}>
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className={`text-muted-foreground leading-relaxed ${
              isFeatured ? "text-lg line-clamp-3" : "text-sm line-clamp-2"
            }`}>
              {post.excerpt}
            </p>

            {/* Read More Button */}
            <div className={isFeatured ? "pt-4" : ""}>
              <Button 
                variant={isFeatured ? "default" : "outline"}
                className={`group-hover:translate-x-1 transition-transform ${
                  isFeatured ? "bg-blue-600 hover:bg-blue-700" : ""
                }`}
                asChild
              >
                <Link to={`/blog/${post.slug}`}>
                  Đọc tiếp
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  const LoadingSkeleton = ({ isFeatured = false }: { isFeatured?: boolean }) => (
    <Card className={`overflow-hidden ${isFeatured ? "lg:col-span-2" : ""}`}>
      <div className={`${isFeatured ? "lg:grid lg:grid-cols-2 lg:gap-8" : ""}`}>
        <Skeleton className={`w-full ${isFeatured ? "h-64 lg:h-auto" : "h-48"}`} />
        <CardContent className={`${isFeatured ? "p-8 lg:py-12" : "p-6"}`}>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className={`w-full ${isFeatured ? "h-8" : "h-6"}`} />
            <Skeleton className={`w-full ${isFeatured ? "h-20" : "h-12"}`} />
            <Skeleton className={`${isFeatured ? "h-12 w-32" : "h-10 w-24"}`} />
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tin Tức & Blog
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cập nhật xu hướng mới nhất trong ngành xây dựng và chia sẻ kiến thức chuyên môn
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-12">
            {/* Featured Post Skeleton */}
            <LoadingSkeleton isFeatured />
            
            {/* Recent Posts Skeleton */}
            <div>
              <Skeleton className="h-8 w-48 mx-auto mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-12">
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-12">
                <PostCard post={featuredPost} isFeatured />
              </div>
            )}

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-center text-foreground mb-8">
                  Bài Viết Gần Đây
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {recentPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* View All Button */}
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="px-8 py-3"
                    asChild
                  >
                    <Link to="/blog">
                      Xem tất cả bài viết
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Chưa có bài viết</h3>
            <p className="text-muted-foreground">Hãy quay lại sau để đọc những bài viết mới nhất</p>
          </div>
        )}

        {/* Newsletter Subscription */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Đăng Ký Nhận Tin</h3>
            <p className="text-lg mb-6 text-blue-100">
              Nhận thông báo về các bài viết mới và xu hướng ngành xây dựng
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                required
              />
              <Button 
                type="submit"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold whitespace-nowrap"
              >
                Đăng ký
              </Button>
            </form>
            <p className="text-xs text-blue-200 mt-3">
              Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất cứ lúc nào.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
