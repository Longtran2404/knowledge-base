/**
 * Upload Page - Modern Dark Theme với đầy đủ tính năng
 * Upload, quản lý file với metadata, tags, settings
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Video,
  Image as ImageIcon,
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
  X,
  Check,
  Tag,
  Settings,
  FolderOpen,
  File,
  Plus,
  Clock,
  User,
  BarChart3,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { NLCUserFile, supabase } from "../lib/supabase-config";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

interface UserStats {
  totalFiles: number;
  totalSize: number;
  totalDownloads: number;
  publicFiles: number;
  privateFiles: number;
  videoFiles: number;
  documentFiles: number;
  imageFiles: number;
  storageUsed: number;
  storageLimit: number;
}

interface FileUploadState {
  file: File | null;
  progress: number;
  uploading: boolean;
  metadata: {
    description: string;
    tags: string[];
    isPublic: boolean;
    destinationPage: "library" | "course" | "product" | "profile";
    associatedCourseId?: string;
    lessonId?: string;
    isProtected: boolean;
    allowDownload: boolean;
    allowShare: boolean;
    watermarkText?: string;
  };
}

export default function UploadPage() {
  const { userProfile, isLoading: authLoading } = useAuth();
  const [files, setFiles] = useState<NLCUserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    progress: 0,
    uploading: false,
    metadata: {
      description: "",
      tags: [],
      isPublic: true,
      destinationPage: "library",
      isProtected: false,
      allowDownload: true,
      allowShare: true,
    },
  });
  const [editingFile, setEditingFile] = useState<NLCUserFile | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [stats, setStats] = useState<UserStats>({
    totalFiles: 0,
    totalSize: 0,
    totalDownloads: 0,
    publicFiles: 0,
    privateFiles: 0,
    videoFiles: 0,
    documentFiles: 0,
    imageFiles: 0,
    storageUsed: 0,
    storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
  });

  useEffect(() => {
    if (authLoading) return;

    if (userProfile?.id) {
      loadUserFiles();
      const timer = setTimeout(() => calculateStats(), 100);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id, authLoading]);

  const loadUserFiles = useCallback(async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("nlc_user_files")
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
        .from("nlc_user_files")
        .select("file_size, file_type, is_public, download_count")
        .eq("user_id", userProfile.id);

      if (error) throw error;

      // Cast data to any[] to bypass TypeScript type inference issues
      const statsData = (data || []) as any[];

      const newStats: UserStats = {
        totalFiles: statsData.length,
        totalSize: statsData.reduce((sum, file) => sum + (file.file_size || 0), 0),
        totalDownloads: statsData.reduce((sum, file) => sum + (file.download_count || 0), 0),
        publicFiles: statsData.filter((f) => f.is_public).length,
        privateFiles: statsData.filter((f) => !f.is_public).length,
        videoFiles: statsData.filter((f) => f.file_type === "video").length,
        documentFiles: statsData.filter((f) => f.file_type === "document").length,
        imageFiles: statsData.filter((f) => f.file_type === "image").length,
        storageUsed: statsData.reduce((sum, file) => sum + (file.file_size || 0), 0),
        storageLimit: 5 * 1024 * 1024 * 1024,
      };

      setStats(newStats);
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  }, [userProfile?.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadState((prev) => ({ ...prev, file }));
      setShowUploadDialog(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadState.file || !userProfile?.id) return;

    try {
      setUploadState((prev) => ({ ...prev, uploading: true, progress: 0 }));

      // Determine detailed file type
      const mimeType = uploadState.file.type.toLowerCase();
      const extension = uploadState.file.name.split('.').pop()?.toLowerCase() || '';

      let fileType = "document";
      let fileCategory = "other";

      if (mimeType.startsWith("video/") || ["mp4", "webm", "ogg", "avi", "mov", "mkv", "flv", "wmv"].includes(extension)) {
        fileType = "video";
        fileCategory = "video";
      } else if (mimeType.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a", "flac", "aac", "wma"].includes(extension)) {
        fileType = "audio";
        fileCategory = "audio";
      } else if (mimeType.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(extension)) {
        fileType = "image";
        fileCategory = "image";
      } else if (mimeType === "application/pdf" || extension === "pdf") {
        fileType = "pdf";
        fileCategory = "document";
      } else if (["zip", "rar", "7z", "tar", "gz", "bz2", "xz"].includes(extension) ||
                 mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("compressed")) {
        fileType = "archive";
        fileCategory = "archive";
      } else if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp"].includes(extension)) {
        fileType = "office";
        fileCategory = "document";
      } else if (["txt", "md", "json", "xml", "csv", "log"].includes(extension)) {
        fileType = "text";
        fileCategory = "document";
      } else {
        fileType = "other";
        fileCategory = "other";
      }

      // Upload to Supabase Storage
      const fileName = `${userProfile.id}/${Date.now()}_${uploadState.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("user-files")
        .upload(fileName, uploadState.file);

      if (uploadError) throw uploadError;

      // Simulate progress
      setUploadState((prev) => ({ ...prev, progress: 100 }));

      // Get public URL
      const { data: urlData } = supabase.storage.from("user-files").getPublicUrl(fileName);

      // Insert metadata into database with new fields
      const { error: dbError } = await (supabase as any).from("nlc_user_files").insert({
        user_id: userProfile.id,
        filename: fileName,
        original_filename: uploadState.file.name,
        file_path: urlData.publicUrl,
        file_type: fileType,
        file_category: fileCategory,
        file_extension: extension,
        mime_type: uploadState.file.type,
        file_size: uploadState.file.size,
        description: uploadState.metadata.description,
        tags: uploadState.metadata.tags,
        is_public: uploadState.metadata.isPublic,

        // Destination and association
        destination_page: uploadState.metadata.destinationPage,
        associated_course_id: uploadState.metadata.associatedCourseId || null,
        lesson_id: uploadState.metadata.lessonId || null,

        // Security settings for videos
        is_protected: fileCategory === "video" ? uploadState.metadata.isProtected : false,
        allow_download: uploadState.metadata.allowDownload,
        allow_share: uploadState.metadata.allowShare,
        watermark_text: uploadState.metadata.watermarkText || (userProfile.email || "Nam Long Center"),

        status: "ready",
        upload_progress: 100,
      });

      if (dbError) throw dbError;

      toast.success("Upload thành công!");
      setShowUploadDialog(false);
      setUploadState({
        file: null,
        progress: 0,
        uploading: false,
        metadata: {
          description: "",
          tags: [],
          isPublic: true,
          destinationPage: "library",
          isProtected: false,
          allowDownload: true,
          allowShare: true,
        },
      });
      loadUserFiles();
      calculateStats();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Lỗi khi upload file");
    } finally {
      setUploadState((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa file này?")) return;

    try {
      const { error } = await supabase.from("nlc_user_files").delete().eq("id", fileId);
      if (error) throw error;

      toast.success("Đã xóa file");
      loadUserFiles();
      calculateStats();
    } catch (error) {
      toast.error("Không thể xóa file");
    }
  };

  const handleTogglePrivacy = async (file: NLCUserFile) => {
    try {
      const { error } = await (supabase as any)
        .from("nlc_user_files")
        .update({ is_public: !file.is_public })
        .eq("id", file.id);

      if (error) throw error;

      toast.success(file.is_public ? "Chuyển thành riêng tư" : "Chuyển thành công khai");
      loadUserFiles();
      calculateStats();
    } catch (error) {
      toast.error("Không thể cập nhật quyền riêng tư");
    }
  };

  const handleEditFile = (file: NLCUserFile) => {
    setEditingFile(file);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;

    try {
      const { error } = await (supabase as any)
        .from("nlc_user_files")
        .update({
          description: editingFile.description,
          tags: editingFile.tags,
        })
        .eq("id", editingFile.id);

      if (error) throw error;

      toast.success("Đã cập nhật thông tin file");
      setShowEditDialog(false);
      setEditingFile(null);
      loadUserFiles();
    } catch (error) {
      toast.error("Không thể cập nhật file");
    }
  };

  const addTag = (tag: string) => {
    if (!tag.trim()) return;

    if (editingFile) {
      setEditingFile({
        ...editingFile,
        tags: [...(editingFile.tags || []), tag.trim()],
      });
    } else {
      setUploadState((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...prev.metadata.tags, tag.trim()],
        },
      }));
    }
    setTagInput("");
  };

  const removeTag = (index: number) => {
    if (editingFile) {
      setEditingFile({
        ...editingFile,
        tags: editingFile.tags?.filter((_, i) => i !== index) || [],
      });
    } else {
      setUploadState((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: prev.metadata.tags.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch =
        file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "public" && file.is_public) ||
        (selectedCategory === "private" && !file.is_public) ||
        (selectedCategory === "video" && file.file_type === "video") ||
        (selectedCategory === "document" && file.file_type === "document") ||
        (selectedCategory === "image" && file.file_type === "image");

      return matchesSearch && matchesCategory;
    });
  }, [files, searchTerm, selectedCategory]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const storagePercent = (stats.storageUsed / stats.storageLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Upload className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Quản lý Tài liệu & Video
                </h1>
                <p className="text-gray-400">Upload và chia sẻ tài liệu một cách an toàn</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <File className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Tổng files</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalFiles}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-green-400" />
                  <span className="text-gray-400 text-sm">Công khai</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{stats.publicFiles}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-orange-400" />
                  <span className="text-gray-400 text-sm">Riêng tư</span>
                </div>
                <p className="text-2xl font-bold text-orange-400">{stats.privateFiles}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">Lượt tải</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">{stats.totalDownloads}</p>
              </div>
            </div>

            {/* Storage Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Dung lượng</span>
                <span className="text-sm font-medium">
                  {formatFileSize(stats.storageUsed)} / {formatFileSize(stats.storageLimit)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(storagePercent, 100)}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="public">Công khai</option>
              <option value="private">Riêng tư</option>
              <option value="video">Video</option>
              <option value="image">Hình ảnh</option>
              <option value="document">Tài liệu</option>
            </select>

            {/* View Mode */}
            <div className="flex gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Upload Button */}
            <label className="cursor-pointer">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all">
                <Plus className="h-5 w-5" />
                Upload
              </div>
            </label>
          </div>
        </div>

        {/* Files Grid/List */}
        {filteredFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center"
          >
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-xl text-gray-400 mb-2">Chưa có file nào</p>
            <p className="text-gray-500">Bắt đầu upload file đầu tiên của bạn</p>
          </motion.div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            }
          >
            <AnimatePresence>
              {filteredFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-blue-500/50 transition-all group ${
                    viewMode === "list" ? "flex items-center gap-4" : ""
                  }`}
                >
                  {/* File Icon */}
                  <div className={`${viewMode === "grid" ? "mb-3" : ""}`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-blue-400">
                      {getFileIcon(file.file_type)}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate mb-1">
                      {file.original_filename}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={file.is_public ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {file.is_public ? (
                          <Eye className="h-3 w-3 mr-1" />
                        ) : (
                          <Lock className="h-3 w-3 mr-1" />
                        )}
                        {file.is_public ? "Công khai" : "Riêng tư"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.file_size)}
                      </span>
                    </div>
                    {file.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {file.description}
                      </p>
                    )}
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {file.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex gap-2 ${viewMode === "grid" ? "mt-3" : ""}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditFile(file)}
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTogglePrivacy(file)}
                      className="text-gray-400 hover:text-green-400"
                    >
                      {file.is_public ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(file.file_path, "_blank")}
                      className="text-gray-400 hover:text-purple-400"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(file.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Upload File</DialogTitle>
            <DialogDescription className="text-gray-400">
              Thêm thông tin và metadata cho file của bạn
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Info */}
            {uploadState.file && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <File className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadState.file.name}</p>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(uploadState.file.size)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <Label className="text-white mb-2 block">Mô tả</Label>
              <Textarea
                placeholder="Thêm mô tả cho file..."
                value={uploadState.metadata.description}
                onChange={(e) =>
                  setUploadState((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, description: e.target.value },
                  }))
                }
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <Label className="text-white mb-2 block">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Thêm tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag(tagInput))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <Button
                  onClick={() => addTag(tagInput)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadState.metadata.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(i)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Destination Page */}
            <div>
              <Label className="text-white mb-2 block">Đích đến</Label>
              <select
                value={uploadState.metadata.destinationPage}
                onChange={(e) =>
                  setUploadState((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, destinationPage: e.target.value as any },
                  }))
                }
                className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="library" className="bg-gray-800">Thư viện tài liệu</option>
                <option value="course" className="bg-gray-800">Khóa học</option>
                <option value="product" className="bg-gray-800">Sản phẩm</option>
                <option value="profile" className="bg-gray-800">Hồ sơ cá nhân</option>
              </select>
              {uploadState.metadata.destinationPage === "course" && (
                <p className="text-xs text-gray-400 mt-1">
                  File sẽ được thêm vào khóa học. Bạn có thể chọn khóa học cụ thể sau khi upload.
                </p>
              )}
            </div>

            {/* Video Protection Settings */}
            {uploadState.file?.type.startsWith("video/") && (
              <div className="space-y-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h4 className="font-medium text-blue-300 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Bảo vệ Video
                </h4>

                {/* Protected Video Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Bật bảo vệ DRM</p>
                    <p className="text-xs text-gray-400">
                      Ngăn chặn quay màn hình, screenshot, tải xuống
                    </p>
                  </div>
                  <Switch
                    checked={uploadState.metadata.isProtected}
                    onCheckedChange={(checked) =>
                      setUploadState((prev) => ({
                        ...prev,
                        metadata: { ...prev.metadata, isProtected: checked },
                      }))
                    }
                  />
                </div>

                {/* Allow Download */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cho phép tải xuống</p>
                    <p className="text-xs text-gray-400">
                      Người xem có thể tải video về máy
                    </p>
                  </div>
                  <Switch
                    checked={uploadState.metadata.allowDownload}
                    onCheckedChange={(checked) =>
                      setUploadState((prev) => ({
                        ...prev,
                        metadata: { ...prev.metadata, allowDownload: checked },
                      }))
                    }
                    disabled={uploadState.metadata.isProtected}
                  />
                </div>

                {/* Allow Share */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cho phép chia sẻ</p>
                    <p className="text-xs text-gray-400">
                      Người xem có thể chia sẻ link video
                    </p>
                  </div>
                  <Switch
                    checked={uploadState.metadata.allowShare}
                    onCheckedChange={(checked) =>
                      setUploadState((prev) => ({
                        ...prev,
                        metadata: { ...prev.metadata, allowShare: checked },
                      }))
                    }
                    disabled={uploadState.metadata.isProtected}
                  />
                </div>

                {/* Watermark */}
                <div>
                  <Label className="text-white mb-2 block text-sm">Watermark (tùy chọn)</Label>
                  <Input
                    placeholder="VD: Nam Long Center - Khóa học XYZ"
                    value={uploadState.metadata.watermarkText || ""}
                    onChange={(e) =>
                      setUploadState((prev) => ({
                        ...prev,
                        metadata: { ...prev.metadata, watermarkText: e.target.value },
                      }))
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Privacy */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2">
                {uploadState.metadata.isPublic ? (
                  <Eye className="h-5 w-5 text-green-400" />
                ) : (
                  <Lock className="h-5 w-5 text-orange-400" />
                )}
                <div>
                  <p className="font-medium">
                    {uploadState.metadata.isPublic ? "Công khai" : "Riêng tư"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {uploadState.metadata.isPublic
                      ? "Mọi người có thể xem file này"
                      : "Chỉ bạn có thể xem file này"}
                  </p>
                </div>
              </div>
              <Switch
                checked={uploadState.metadata.isPublic}
                onCheckedChange={(checked) =>
                  setUploadState((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, isPublic: checked },
                  }))
                }
              />
            </div>

            {/* Progress */}
            {uploadState.uploading && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Đang upload...</span>
                  <span className="text-sm font-medium">{Math.round(uploadState.progress)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
              disabled={uploadState.uploading}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadState.uploading || !uploadState.file}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {uploadState.uploading ? "Đang upload..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Chỉnh sửa File</DialogTitle>
            <DialogDescription className="text-gray-400">
              Cập nhật thông tin metadata
            </DialogDescription>
          </DialogHeader>

          {editingFile && (
            <div className="space-y-4 py-4">
              {/* File Info */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    {getFileIcon(editingFile.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{editingFile.original_filename}</p>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(editingFile.file_size)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-white mb-2 block">Mô tả</Label>
                <Textarea
                  placeholder="Thêm mô tả..."
                  value={editingFile.description || ""}
                  onChange={(e) =>
                    setEditingFile({ ...editingFile, description: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div>
                <Label className="text-white mb-2 block">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Thêm tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag(tagInput))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                  <Button
                    onClick={() => addTag(tagInput)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editingFile.tags || []).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(i)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
