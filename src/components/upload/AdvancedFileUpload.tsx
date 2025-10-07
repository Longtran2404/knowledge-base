/**
 * Advanced File Upload Component
 * Hỗ trợ upload tài liệu và video với bảo vệ DRM
 */

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  File,
  Video,
  Image,
  FileText,
  AlertTriangle,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Tag,
  Hash,
  DollarSign,
  Users,
  Check,
  X,
  Info,
  LogIn,
  FolderOpen,
  Download,
  Settings,
} from "lucide-react";
import { LiquidGlassButton } from "../ui/liquid-glass-button";
import { LiquidGlassCard } from "../ui/liquid-glass-card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { supabase, NLCUserFileInsert } from "../../lib/supabase-config";
import { toast } from "sonner";

interface FileMetadata {
  title: string;
  description: string;
  tags: string[];
  category: string;
  price?: number;
  isPublic: boolean;
  allowDownload: boolean;
  drmProtected: boolean;
  copyrightOwner: string;
  originalWork: boolean;
  termsAccepted: boolean;
}

interface UploadedFile {
  file: File;
  metadata: FileMetadata;
  preview?: string;
  uploadProgress: number;
  type: "document" | "video" | "image" | "other";
}

export default function AdvancedFileUpload() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [currentTab, setCurrentTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPartner =
    userProfile?.account_role === "giang_vien" ||
    userProfile?.account_role === "admin";

  const getFileType = (
    file: File
  ): "document" | "video" | "image" | "other" => {
    const mimeType = file.type;
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("image/")) return "image";
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("text")
    )
      return "document";
    return "other";
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-8 w-8 text-purple-500" />;
      case "image":
        return <Image className="h-8 w-8 text-green-500" />;
      case "document":
        return <FileText className="h-8 w-8 text-blue-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFiles = useCallback(
    (fileList: File[]) => {
      const newFiles: UploadedFile[] = fileList.map((file) => {
        const fileType = getFileType(file);
        const defaultMetadata: FileMetadata = {
          title: file.name.split(".")[0],
          description: "",
          tags: [],
          category: fileType,
          isPublic: true,
          allowDownload: fileType !== "video",
          drmProtected: fileType === "video",
          copyrightOwner: userProfile?.full_name || userProfile?.email || "",
          originalWork: true,
          termsAccepted: false,
        };

        // Create preview for images
        let preview: string | undefined;
        if (fileType === "image") {
          preview = URL.createObjectURL(file);
        }

        return {
          file,
          metadata: defaultMetadata,
          preview,
          uploadProgress: 0,
          type: fileType,
        };
      });

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [userProfile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    },
    [handleFiles]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateFileMetadata = (
    index: number,
    field: keyof FileMetadata,
    value: any
  ) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index].metadata = {
        ...newFiles[index].metadata,
        [field]: value,
      };
      return newFiles;
    });
  };

  const addTag = (index: number, tag: string) => {
    if (tag.trim()) {
      updateFileMetadata(index, "tags", [
        ...files[index].metadata.tags,
        tag.trim(),
      ]);
    }
  };

  const removeTag = (index: number, tagIndex: number) => {
    const newTags = [...files[index].metadata.tags];
    newTags.splice(tagIndex, 1);
    updateFileMetadata(index, "tags", newTags);
  };

  const uploadFiles = async () => {
    if (!userProfile?.id) {
      toast.error("Vui lòng đăng nhập để upload files");
      return;
    }

    const filesWithoutTerms = files.filter((f) => !f.metadata.termsAccepted);
    if (filesWithoutTerms.length > 0) {
      toast.error("Vui lòng đồng ý với các điều khoản cho tất cả files");
      return;
    }

    toast.success("Bắt đầu upload files...");

    // Real Supabase Storage upload
    for (let i = 0; i < files.length; i++) {
      const uploadedFile = files[i];
      try {
        // Update progress to uploading
        setFiles((prev) => {
          const newFiles = [...prev];
          if (newFiles[i]) {
            newFiles[i].uploadProgress = 10;
          }
          return newFiles;
        });

        // Generate unique filename
        const fileExtension = uploadedFile.file.name.split(".").pop();
        const uniqueFileName = `${userProfile?.id}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExtension}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("user-files")
          .upload(uniqueFileName, uploadedFile.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Update progress to processing
        setFiles((prev) => {
          const newFiles = [...prev];
          if (newFiles[i]) {
            newFiles[i].uploadProgress = 60;
          }
          return newFiles;
        });

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("user-files")
          .getPublicUrl(uniqueFileName);

        // Create database record for nlc_user_files
        const fileRecord: NLCUserFileInsert = {
          user_id: userProfile!.id,
          filename: uniqueFileName,
          original_filename: uploadedFile.file.name,
          file_path: urlData.publicUrl,
          file_type: uploadedFile.type,
          mime_type: uploadedFile.file.type,
          file_size: uploadedFile.file.size,
          description: uploadedFile.metadata.description || "",
          tags: uploadedFile.metadata.tags || [],
          is_public: uploadedFile.metadata.isPublic,
          download_count: 0,
          upload_progress: 100,
          status: "ready",
        };

        const { error: dbError } = await supabase
          .from("nlc_user_files")
          .insert(fileRecord as any);

        if (dbError) {
          throw dbError;
        }

        // Update progress to completed
        setFiles((prev) => {
          const newFiles = [...prev];
          if (newFiles[i]) {
            newFiles[i].uploadProgress = 100;
          }
          return newFiles;
        });

        toast.success(`Upload thành công: ${uploadedFile.file.name}`);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Upload thất bại: ${uploadedFile.file.name}`);

        // Update file status to failed
        setFiles((prev) => {
          const newFiles = [...prev];
          if (newFiles[i]) {
            newFiles[i].uploadProgress = 0;
          }
          return newFiles;
        });
      }
    }

    // Clear files after upload
    setTimeout(() => {
      setFiles([]);
      setCurrentTab("upload");
      toast.success(`Hoàn thành upload ${files.length} files!`);
    }, 1000);
  };

  // Check if user is logged in - After all hooks
  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vui lòng đăng nhập để upload file
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Bạn cần đăng nhập vào tài khoản để có thể upload và quản lý file
          </p>
          <LiquidGlassButton onClick={() => navigate("/dang-nhap")}>
            <LogIn className="mr-2 h-4 w-4" />
            Đăng nhập
          </LiquidGlassButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 p-1">
          <TabsTrigger
            value="upload"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 transition-all"
          >
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger
            value="metadata"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 transition-all"
          >
            <Tag className="h-4 w-4" />
            Metadata
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 transition-all"
          >
            <Shield className="h-4 w-4" />
            Cài đặt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          {/* Upload Area */}
          <motion.div
            className={`relative rounded-2xl p-12 text-center transition-all duration-300 overflow-hidden ${
              dragActive
                ? "border-2 border-blue-500 bg-blue-500/10"
                : "border-2 border-dashed border-white/20 hover:border-white/40"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) =>
                handleFiles(Array.from(e.target.files || []))
              }
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif"
            />

            <div className="relative z-10">
              <motion.div
                animate={{
                  y: dragActive ? -10 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-3">
                {dragActive ? "Thả files tại đây" : "Kéo thả files hoặc click để chọn"}
              </h3>

              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Hỗ trợ: PDF, DOC, PPT, MP4, MOV, JPG, PNG (tối đa 100MB/file)
              </p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4 text-blue-400" />
                  Tài liệu
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Video className="h-4 w-4 text-purple-400" />
                  Video
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Image className="h-4 w-4 text-green-400" />
                  Hình ảnh
                </div>
              </div>

              <LiquidGlassButton
                onClick={() => fileInputRef.current?.click()}
                variant="primary"
                glow={true}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              >
                <Upload className="h-4 w-4 mr-2" />
                Chọn Files
              </LiquidGlassButton>
            </div>
          </motion.div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-400" />
                  Files đã chọn ({files.length})
                </h4>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {(files.reduce((sum, f) => sum + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>

              <div className="grid gap-3">
                {files.map((uploadedFile, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="rounded-xl p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {uploadedFile.preview ? (
                            <div className="relative">
                              <img
                                src={uploadedFile.preview}
                                alt="Preview"
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                              {getFileIcon(uploadedFile.type)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-white truncate mb-1 group-hover:text-blue-400 transition-colors">
                            {uploadedFile.file.name}
                          </h5>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                              {uploadedFile.type}
                            </Badge>
                          </div>

                          {uploadedFile.uploadProgress > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-400">Đang tải lên...</span>
                                <span className="text-xs text-blue-400 font-medium">
                                  {uploadedFile.uploadProgress}%
                                </span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${uploadedFile.uploadProgress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <LiquidGlassButton
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </LiquidGlassButton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
            </TabsContent>

        <TabsContent value="metadata" className="space-y-6 mt-6">
          {files.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Tag className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Chưa có file nào
              </h3>
              <p className="text-gray-500 mb-6">
                Chọn file ở tab Upload để cài đặt metadata
              </p>
              <LiquidGlassButton
                onClick={() => setCurrentTab("upload")}
                variant="primary"
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                Đi tới Upload
              </LiquidGlassButton>
            </div>
          ) : (
            <div className="space-y-6">
              {files.map((uploadedFile, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="rounded-2xl p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        {getFileIcon(uploadedFile.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {uploadedFile.file.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Tiêu đề</Label>
                          <Input
                            value={uploadedFile.metadata.title}
                            onChange={(e) =>
                              updateFileMetadata(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Nhập tiêu đề..."
                            className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Danh mục</Label>
                          <Select
                            value={uploadedFile.metadata.category}
                            onValueChange={(value) =>
                              updateFileMetadata(index, "category", value)
                            }
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/10">
                              <SelectItem value="course" className="text-white hover:bg-white/10">Khóa học</SelectItem>
                              <SelectItem value="ebook" className="text-white hover:bg-white/10">E-book</SelectItem>
                              <SelectItem value="template" className="text-white hover:bg-white/10">Template</SelectItem>
                              <SelectItem value="video" className="text-white hover:bg-white/10">Video</SelectItem>
                              <SelectItem value="other" className="text-white hover:bg-white/10">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Mô tả</Label>
                        <Textarea
                          value={uploadedFile.metadata.description}
                          onChange={(e) =>
                            updateFileMetadata(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Mô tả chi tiết về tài liệu..."
                          rows={3}
                          className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Tags (từ khóa)
                        </Label>
                        <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                          {uploadedFile.metadata.tags.length === 0 ? (
                            <span className="text-sm text-gray-500">Chưa có tag nào</span>
                          ) : (
                            uploadedFile.metadata.tags.map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                className="bg-blue-500/20 text-blue-400 border-blue-500/30 gap-1 hover:bg-blue-500/30 transition-colors"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(index, tagIndex)}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nhập tag và nhấn Enter..."
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addTag(index, e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                            className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                          />
                          <LiquidGlassButton
                            variant="ghost"
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              addTag(index, input.value);
                              input.value = "";
                            }}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Tag className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>

                      {isPartner && (
                        <div className="space-y-2">
                          <Label className="text-gray-300 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Giá bán (VNĐ)
                          </Label>
                          <Input
                            type="number"
                            value={uploadedFile.metadata.price || ""}
                            onChange={(e) =>
                              updateFileMetadata(
                                index,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0 = Miễn phí"
                            className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                          />
                        </div>
                      )}

                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Cài đặt quyền riêng tư
                        </h4>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                              <Eye className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <span className="text-white font-medium block">Công khai</span>
                              <span className="text-xs text-gray-400">Mọi người có thể xem</span>
                            </div>
                          </div>
                          <Switch
                            checked={uploadedFile.metadata.isPublic}
                            onCheckedChange={(checked) =>
                              updateFileMetadata(index, "isPublic", checked)
                            }
                          />
                        </div>

                        {uploadedFile.type !== "video" && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Download className="h-4 w-4 text-blue-400" />
                              </div>
                              <div>
                                <span className="text-white font-medium block">Cho phép tải về</span>
                                <span className="text-xs text-gray-400">Người khác có thể download</span>
                              </div>
                            </div>
                            <Switch
                              checked={uploadedFile.metadata.allowDownload}
                              onCheckedChange={(checked) =>
                                updateFileMetadata(
                                  index,
                                  "allowDownload",
                                  checked
                                )
                              }
                            />
                          </div>
                        )}

                        {uploadedFile.type === "video" && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-purple-400" />
                              </div>
                              <div>
                                <span className="text-white font-medium block">Bảo vệ DRM</span>
                                <span className="text-xs text-gray-400">Chống sao chép video</span>
                              </div>
                            </div>
                            <Switch
                              checked={uploadedFile.metadata.drmProtected}
                              onCheckedChange={(checked) =>
                                updateFileMetadata(
                                  index,
                                  "drmProtected",
                                  checked
                                )
                              }
                            />
                          </div>
                        )}
                      </div>

                      {/* Copyright & Terms */}
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Bản quyền & Điều khoản
                        </h4>

                        <div className="space-y-2">
                          <Label className="text-gray-300">Chủ sở hữu bản quyền</Label>
                          <Input
                            value={uploadedFile.metadata.copyrightOwner}
                            onChange={(e) =>
                              updateFileMetadata(
                                index,
                                "copyrightOwner",
                                e.target.value
                              )
                            }
                            placeholder="Tên người/tổ chức sở hữu bản quyền..."
                            className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <input
                              type="checkbox"
                              id={`original-${index}`}
                              checked={uploadedFile.metadata.originalWork}
                              onChange={(e) =>
                                updateFileMetadata(
                                  index,
                                  "originalWork",
                                  e.target.checked
                                )
                              }
                              className="mt-1 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
                            />
                            <Label
                              htmlFor={`original-${index}`}
                              className="flex items-start gap-2 text-white cursor-pointer flex-1"
                            >
                              <Check className="h-4 w-4 mt-0.5 text-green-400" />
                              <span>Đây là tác phẩm gốc của tôi</span>
                            </Label>
                          </div>

                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
                            <input
                              type="checkbox"
                              id={`terms-${index}`}
                              checked={uploadedFile.metadata.termsAccepted}
                              onChange={(e) =>
                                updateFileMetadata(
                                  index,
                                  "termsAccepted",
                                  e.target.checked
                                )
                              }
                              className="mt-1 rounded border-yellow-500/30 bg-yellow-500/5 text-yellow-600 focus:ring-yellow-500"
                            />
                            <Label
                              htmlFor={`terms-${index}`}
                              className="flex items-start gap-2 text-yellow-200 cursor-pointer flex-1"
                            >
                              <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-400" />
                              <span>Tôi chịu trách nhiệm về bản quyền và nội dung của file này</span>
                            </Label>
                          </div>
                        </div>

                        {!uploadedFile.metadata.termsAccepted && (
                          <Alert className="bg-red-500/10 border-red-500/20 text-red-200">
                            <Info className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-200">
                              Bạn cần đồng ý chịu trách nhiệm về bản quyền
                              trước khi upload. Việc upload tài liệu vi phạm
                              bản quyền có thể dẫn đến hậu quả pháp lý.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Alert className="bg-yellow-500/10 border-yellow-500/20">
            <Shield className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              <strong className="text-yellow-100">Lưu ý quan trọng về bản quyền:</strong>
              <ul className="list-disc list-inside mt-3 space-y-2 text-sm">
                <li>
                  Chỉ upload tài liệu mà bạn sở hữu bản quyền hoặc có quyền
                  phân phối
                </li>
                <li>
                  Video được bảo vệ DRM sẽ không thể tải về hoặc quay màn
                  hình
                </li>
                <li>Tài liệu vi phạm bản quyền sẽ bị gỡ bỏ ngay lập tức</li>
                <li>
                  Bạn chịu hoàn toàn trách nhiệm pháp lý về nội dung upload
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Quyền hạn theo vai trò
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  Học viên
                </h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Upload tài liệu cá nhân
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-400" />
                    Không thể bán sản phẩm
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Chia sẻ miễn phí
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-purple-400" />
                  </div>
                  Đối tác/Giảng viên
                </h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Upload tài liệu/video
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Đặt giá bán sản phẩm
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Bảo vệ DRM cho video
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10"
        >
          <div className="text-sm text-gray-400">
            <span className="font-medium text-white">{files.length}</span> file{files.length > 1 ? "s" : ""} đã chọn
            {files.filter(f => !f.metadata.termsAccepted).length > 0 && (
              <span className="ml-2 text-yellow-400">
                ({files.filter(f => !f.metadata.termsAccepted).length} chưa đồng ý điều khoản)
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <LiquidGlassButton
              variant="ghost"
              onClick={() => setFiles([])}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X className="h-4 w-4 mr-2" />
              Hủy tất cả
            </LiquidGlassButton>
            <LiquidGlassButton
              onClick={uploadFiles}
              variant="primary"
              glow={true}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload {files.length} file{files.length > 1 ? "s" : ""}
            </LiquidGlassButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}
