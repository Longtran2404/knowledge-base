/**
 * File Management Page
 * Trang quản lý files tổng hợp cho từng tài khoản
 */

import React, { useState } from "react";
import { FileText, Video, Image, BookOpen, Settings, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../contexts/UnifiedAuthContext";
import FileManager from "../components/file-management/FileManager";
import CourseManager from "../components/course-management/CourseManager";

interface FileStats {
  totalFiles: number;
  totalSize: number;
  categories: {
    documents: number;
    images: number;
    videos: number;
    courses: number;
    blog: number;
  };
  storageUsed: number;
  storageLimit: number;
}

export default function FileManagementPage() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock stats for now
  const stats: FileStats = {
    totalFiles: 25,
    totalSize: 156 * 1024 * 1024, // 156MB
    categories: {
      documents: 12,
      images: 8,
      videos: 3,
      courses: 2,
      blog: 0
    },
    storageUsed: 156 * 1024 * 1024, // 156MB
    storageLimit: 1024 * 1024 * 1024 // 1GB
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStoragePercentage = (): number => {
    return Math.round((stats.storageUsed / stats.storageLimit) * 100);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Vui lòng đăng nhập
            </h2>
            <p className="text-gray-600 mb-4">
              Bạn cần đăng nhập để truy cập quản lý files
            </p>
            <Button onClick={() => window.location.href = "/dang-nhap"}>
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Files & Khóa học
              </h1>
              <p className="text-gray-600 mt-1">
                Xin chào, {userProfile?.full_name || user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                {userProfile?.membership_type || "Free"}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Khóa học
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Cài đặt
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Storage Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Tổng quan lưu trữ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.totalFiles}
                    </div>
                    <div className="text-sm text-gray-500">Tổng files</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatFileSize(stats.totalSize)}
                    </div>
                    <div className="text-sm text-gray-500">Đã sử dụng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatFileSize(stats.storageLimit)}
                    </div>
                    <div className="text-sm text-gray-500">Giới hạn</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {getStoragePercentage()}%
                    </div>
                    <div className="text-sm text-gray-500">Đã dùng</div>
                  </div>
                </div>

                {/* Storage Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Dung lượng đã sử dụng</span>
                    <span>
                      {formatFileSize(stats.storageUsed)} / {formatFileSize(stats.storageLimit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getStoragePercentage() > 80
                          ? "bg-red-500"
                          : getStoragePercentage() > 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${getStoragePercentage()}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.categories.documents}
                  </div>
                  <div className="text-sm text-gray-500">Tài liệu</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Image className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.categories.images}
                  </div>
                  <div className="text-sm text-gray-500">Hình ảnh</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Video className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.categories.videos}
                  </div>
                  <div className="text-sm text-gray-500">Video</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.categories.courses}
                  </div>
                  <div className="text-sm text-gray-500">Khóa học</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.categories.blog}
                  </div>
                  <div className="text-sm text-gray-500">Blog</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab("files")}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Quản lý Files</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("courses")}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                  >
                    <Video className="w-6 h-6" />
                    <span>Tạo Khóa học</span>
                  </Button>
                  <Button
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                    disabled
                  >
                    <Settings className="w-6 h-6" />
                    <span>Cài đặt</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <FileManager />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <CourseManager />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Cài đặt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Thông tin tài khoản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                          {user.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ tên
                        </label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                          {userProfile?.full_name || "Chưa cập nhật"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Gói thành viên</h3>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-green-600">
                        {userProfile?.membership_type || "Free"}
                      </Badge>
                      <Button variant="outline" size="sm" disabled>
                        Nâng cấp gói
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Lưu trữ</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Dung lượng hiện tại</span>
                        <span className="font-medium">
                          {formatFileSize(stats.storageUsed)} / {formatFileSize(stats.storageLimit)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getStoragePercentage()}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Bạn đã sử dụng {getStoragePercentage()}% dung lượng lưu trữ
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" disabled>
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}