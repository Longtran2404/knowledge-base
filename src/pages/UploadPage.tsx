/**
 * Upload Page - Trang quản lý upload và file cá nhân
 * Mỗi tài khoản có thể upload và quản lý tài liệu/video riêng
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Video,
  Image,
  Download,
  Eye,
  Trash2,
  Edit3,
  Share2,
  Lock,
  Unlock,
  Filter,
  Search,
  Grid,
  List,
  Calendar,
  User,
  Tag,
  BarChart3,
  Star,
  TrendingUp,
  Users,
  Play,
  Pause,
  MoreVertical,
  FolderOpen,
  Archive,
  Settings,
  Shield,
  Award,
} from "lucide-react";
import { LiquidGlassButton } from "../components/ui/liquid-glass-button";
import { LiquidGlassCard } from "../components/ui/liquid-glass-card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import AdvancedFileUpload from "../components/upload/AdvancedFileUpload";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { UserFile, supabase } from "../lib/supabase-config";
import { toast } from "sonner";

interface UserStats {
  totalFiles: number;
  totalSize: number;
  totalDownloads: number;
  publicFiles: number;
  privateFiles: number;
  videoFiles: number;
  documentFiles: number;
  storageUsed: number;
  storageLimit: number;
}

export default function UploadPage() {
  const { userProfile } = useAuth();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentTab, setCurrentTab] = useState("my-files");
  const [stats, setStats] = useState<UserStats>({
    totalFiles: 0,
    totalSize: 0,
    totalDownloads: 0,
    publicFiles: 0,
    privateFiles: 0,
    videoFiles: 0,
    documentFiles: 0,
    storageUsed: 0,
    storageLimit: 5 * 1024 * 1024 * 1024, // 5GB default limit
  });

  useEffect(() => {
    if (userProfile?.id) {
      loadUserFiles();
      calculateStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id]);

  const loadUserFiles = useCallback(async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_files")
        .select("*")
        .eq("user_id", userProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Không thể tải danh sách file");
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  const calculateStats = useCallback(async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from("user_files")
        .select("file_size, file_type, is_public, download_count")
        .eq("user_id", userProfile.id);

      if (error) throw error;

      const newStats: UserStats = {
        totalFiles: data?.length || 0,
        totalSize:
          data?.reduce(
            (sum, file) => sum + ((file as any).file_size || 0),
            0
          ) || 0,
        totalDownloads:
          data?.reduce(
            (sum, file) => sum + ((file as any).download_count || 0),
            0
          ) || 0,
        publicFiles: data?.filter((f) => (f as any).is_public).length || 0,
        privateFiles: data?.filter((f) => !(f as any).is_public).length || 0,
        videoFiles:
          data?.filter((f) => (f as any).file_type === "video").length || 0,
        documentFiles:
          data?.filter((f) => (f as any).file_type === "document").length || 0,
        storageUsed:
          data?.reduce(
            (sum, file) => sum + ((file as any).file_size || 0),
            0
          ) || 0,
        storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
      };

      setStats(newStats);
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  }, [userProfile?.id]);

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || file.file_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string, size: string = "h-8 w-8") => {
    switch (type) {
      case "video":
        return <Video className={`${size} text-purple-500`} />;
      case "image":
        return <Image className={`${size} text-green-500`} />;
      case "document":
        return <FileText className={`${size} text-blue-500`} />;
      default:
        return <FileText className={`${size} text-gray-500`} />;
    }
  };

  const handleFileAction = async (
    fileId: string,
    action: "delete" | "toggle-privacy" | "download"
  ) => {
    try {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      switch (action) {
        case "delete":
          const { error: deleteError } = await supabase
            .from("user_files")
            .delete()
            .eq("id", fileId);

          if (deleteError) throw deleteError;
          setFiles((prev) => prev.filter((f) => f.id !== fileId));
          toast.success("Đã xóa file thành công");
          break;

        case "toggle-privacy":
          const updateData = { is_public: !(file as any).is_public };
          const { error: updateError } = await (supabase as any)
            .from("user_files")
            .update(updateData as any)
            .eq("id", fileId);

          if (updateError) throw updateError;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, is_public: !f.is_public } : f
            )
          );
          toast.success(
            file.is_public ? "Chuyển thành riêng tư" : "Chuyển thành công khai"
          );
          break;

        case "download":
          // Simulate download
          const downloadData = {
            download_count: (file as any).download_count + 1,
          };
          const { error: downloadError } = await (supabase as any)
            .from("user_files")
            .update(downloadData as any)
            .eq("id", fileId);

          if (downloadError) throw downloadError;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, download_count: f.download_count + 1 }
                : f
            )
          );
          toast.success("Đang tải xuống...");
          break;
      }

      calculateStats();
    } catch (error) {
      console.error("Error handling file action:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <LiquidGlassCard
          variant="gradient"
          glow={true}
          className="mb-8 p-8 text-center text-white"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Upload className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Quản lý Tài liệu & Video</h1>
          </div>
          <p className="text-lg opacity-90">
            Upload, quản lý và chia sẻ tài liệu cá nhân một cách an toàn
          </p>

          {/* User Info & Storage */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <User className="h-5 w-5 mx-auto mb-1" />
              <p className="font-medium">
                {userProfile?.full_name || userProfile?.email}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <BarChart3 className="h-5 w-5 mx-auto mb-1" />
              <p className="font-medium">{stats.totalFiles} files</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <Archive className="h-5 w-5 mx-auto mb-1" />
              <p className="font-medium">
                {formatFileSize(stats.storageUsed)} /{" "}
                {formatFileSize(stats.storageLimit)}
              </p>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <LiquidGlassCard
            variant="interactive"
            hover={true}
            className="p-6 text-center"
          >
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalDownloads}
            </p>
            <p className="text-sm text-gray-600">Lượt tải</p>
          </LiquidGlassCard>

          <LiquidGlassCard
            variant="interactive"
            hover={true}
            className="p-6 text-center"
          >
            <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {stats.publicFiles}
            </p>
            <p className="text-sm text-gray-600">Công khai</p>
          </LiquidGlassCard>

          <LiquidGlassCard
            variant="interactive"
            hover={true}
            className="p-6 text-center"
          >
            <Lock className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {stats.privateFiles}
            </p>
            <p className="text-sm text-gray-600">Riêng tư</p>
          </LiquidGlassCard>

          <LiquidGlassCard
            variant="interactive"
            hover={true}
            className="p-6 text-center"
          >
            <Video className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {stats.videoFiles}
            </p>
            <p className="text-sm text-gray-600">Video</p>
          </LiquidGlassCard>
        </div>

        {/* Main Content */}
        <LiquidGlassCard variant="default" className="p-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-files" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                File của tôi
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload mới
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Cài đặt
              </TabsTrigger>
            </TabsList>

            {/* My Files Tab */}
            <TabsContent value="my-files" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm file..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="document">Tài liệu</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Hình ảnh</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>

                  <LiquidGlassButton
                    variant={viewMode === "grid" ? "primary" : "ghost"}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </LiquidGlassButton>

                  <LiquidGlassButton
                    variant={viewMode === "list" ? "primary" : "ghost"}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </LiquidGlassButton>
                </div>
              </div>

              {/* Files Display */}
              {filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {files.length === 0
                      ? "Chưa có file nào"
                      : "Không tìm thấy file"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {files.length === 0
                      ? "Bắt đầu bằng cách upload file đầu tiên của bạn"
                      : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"}
                  </p>
                  {files.length === 0 && (
                    <LiquidGlassButton
                      onClick={() => setCurrentTab("upload")}
                      variant="primary"
                      glow={true}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload file đầu tiên
                    </LiquidGlassButton>
                  )}
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  <AnimatePresence>
                    {filteredFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <LiquidGlassCard
                          variant="interactive"
                          hover={true}
                          className="p-4"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {file.thumbnail_url ? (
                                <img
                                  src={file.thumbnail_url}
                                  alt="Thumbnail"
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                getFileIcon(file.file_type, "h-12 w-12")
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {file.original_filename}
                              </h4>
                              <p className="text-sm text-gray-500 mb-2">
                                {formatFileSize((file as any).file_size)} •{" "}
                                {new Date(
                                  (file as any).created_at
                                ).toLocaleDateString()}
                              </p>

                              {file.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {file.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={
                                    file.is_public ? "default" : "secondary"
                                  }
                                >
                                  {file.is_public ? (
                                    <>
                                      <Eye className="h-3 w-3 mr-1" />
                                      Công khai
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="h-3 w-3 mr-1" />
                                      Riêng tư
                                    </>
                                  )}
                                </Badge>

                                {file.download_count > 0 && (
                                  <Badge variant="outline">
                                    <Download className="h-3 w-3 mr-1" />
                                    {file.download_count}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <LiquidGlassButton
                                  variant="ghost"
                                  onClick={() =>
                                    handleFileAction(file.id, "download")
                                  }
                                  className="text-blue-600"
                                >
                                  <Download className="h-4 w-4" />
                                </LiquidGlassButton>

                                <LiquidGlassButton
                                  variant="ghost"
                                  onClick={() =>
                                    handleFileAction(file.id, "toggle-privacy")
                                  }
                                  className="text-green-600"
                                >
                                  {file.is_public ? (
                                    <Lock className="h-4 w-4" />
                                  ) : (
                                    <Unlock className="h-4 w-4" />
                                  )}
                                </LiquidGlassButton>

                                <LiquidGlassButton
                                  variant="ghost"
                                  onClick={() =>
                                    handleFileAction(file.id, "delete")
                                  }
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </LiquidGlassButton>
                              </div>
                            </div>
                          </div>
                        </LiquidGlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload">
              <AdvancedFileUpload />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <LiquidGlassCard variant="default" className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Cài đặt bảo mật
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        Tự động công khai file mới
                      </h4>
                      <p className="text-sm text-gray-600">
                        File mới sẽ mặc định được đặt ở chế độ công khai
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        Cho phép download file công khai
                      </h4>
                      <p className="text-sm text-gray-600">
                        Người khác có thể tải về file công khai của bạn
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        Thông báo khi có người tải file
                      </h4>
                      <p className="text-sm text-gray-600">
                        Nhận thông báo qua email khi có người tải file của bạn
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard variant="default" className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Gói dung lượng
                </h3>

                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-lg">
                      Gói hiện tại: Miễn phí
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatFileSize(stats.storageUsed)} /{" "}
                      {formatFileSize(stats.storageLimit)} đã sử dụng
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{
                          width: `${Math.min(storagePercentage, 100)}%`,
                        }}
                      />
                    </div>

                    {storagePercentage > 80 && (
                      <div className="mb-4">
                        <p className="text-yellow-600 text-sm mb-2">
                          ⚠️ Dung lượng của bạn sắp đầy
                        </p>
                        <LiquidGlassButton variant="primary" glow={true}>
                          Nâng cấp gói Premium
                        </LiquidGlassButton>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <h4 className="font-medium">Gói Student</h4>
                      <p className="text-2xl font-bold text-blue-600 my-2">
                        50GB
                      </p>
                      <p className="text-sm text-gray-600 mb-4">299,000đ/năm</p>
                      <LiquidGlassButton variant="primary" className="w-full">
                        Nâng cấp
                      </LiquidGlassButton>
                    </div>

                    <div className="border rounded-lg p-4 text-center">
                      <h4 className="font-medium">Gói Business</h4>
                      <p className="text-2xl font-bold text-purple-600 my-2">
                        200GB
                      </p>
                      <p className="text-sm text-gray-600 mb-4">999,000đ/năm</p>
                      <LiquidGlassButton variant="primary" className="w-full">
                        Nâng cấp
                      </LiquidGlassButton>
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
