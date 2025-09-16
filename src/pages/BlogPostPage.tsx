import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Eye,
  Heart,
  Share2,
  Tag,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { postsData } from "../data/posts";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the post by ID
  const post = postsData.find((p) => p.id === id) || postsData[0];

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Không tìm thấy bài viết
              </h2>
              <p className="text-gray-600 mb-6">
                Bài viết bạn đang tìm kiếm không tồn tại.
              </p>
              <Button onClick={() => navigate("/blog")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại Blog
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/blog")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Blog
          </Button>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Nam Long Center</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>5 phút đọc</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>1.2k lượt xem</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-lg max-w-none">
                  {/* Featured Image */}
                  {post.thumbnail && (
                    <div className="mb-8">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                      />
                    </div>
                  )}

                  {/* Article Content */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Giới thiệu
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {post.excerpt ||
                        "Đây là nội dung bài viết mẫu. Trong thực tế, nội dung này sẽ được lưu trữ trong database và hiển thị theo định dạng markdown hoặc HTML."}
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900">
                      Nội dung chính
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Bài viết này cung cấp những kiến thức chuyên sâu về{" "}
                      {post.tags?.[0] || "công nghệ BIM"}, giúp bạn nâng cao kỹ
                      năng và hiểu biết trong lĩnh vực xây dựng hiện đại.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900">
                      Kết luận
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Với những kiến thức được chia sẻ trong bài viết này, bạn
                      đã có thêm những hiểu biết quan trọng để áp dụng vào công
                      việc thực tế của mình.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tác giả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    N
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Nam Long Center
                    </h4>
                    <p className="text-sm text-gray-600">Chuyên gia BIM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bài viết liên quan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {postsData.slice(0, 3).map((relatedPost) => (
                    <div key={relatedPost.id} className="space-y-2">
                      <h5 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                        {relatedPost.title}
                      </h5>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(relatedPost.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Heart className="h-4 w-4 mr-2" />
            Thích bài viết
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="h-4 w-4 mr-2" />
            Chia sẻ
          </Button>
        </div>
      </div>
    </div>
  );
}
