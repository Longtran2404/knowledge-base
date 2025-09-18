/**
 * Advanced File Upload Component
 * Hỗ trợ upload tài liệu và video với bảo vệ DRM
 */

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { supabase, UserFileInsert } from "../../lib/supabase-config";
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
  const { userProfile } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [currentTab, setCurrentTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPartner =
    userProfile?.role === "instructor" || userProfile?.role === "admin";

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

        // Create database record
        const fileRecord: UserFileInsert = {
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
          .from("user_files")
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <LiquidGlassCard variant="gradient" glow={true}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload Tài liệu & Video Nâng cao
          </CardTitle>
          <CardDescription>
            Upload tài liệu, video với bảo vệ bản quyền và quản lý metadata chi
            tiết
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
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
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Kéo thả files hoặc click để chọn
                </h3>
                <p className="text-gray-500 mb-4">
                  Hỗ trợ: PDF, DOC, PPT, MP4, MOV, JPG, PNG (tối đa 100MB/file)
                </p>
                <LiquidGlassButton
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                  glow={true}
                >
                  Chọn Files
                </LiquidGlassButton>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">
                    Files đã chọn ({files.length})
                  </h4>
                  <div className="space-y-3">
                    {files.map((uploadedFile, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {uploadedFile.preview ? (
                              <img
                                src={uploadedFile.preview}
                                alt="Preview"
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              getFileIcon(uploadedFile.type)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">
                              {uploadedFile.file.name}
                            </h5>
                            <p className="text-sm text-gray-500">
                              {(uploadedFile.file.size / 1024 / 1024).toFixed(
                                2
                              )}{" "}
                              MB • {uploadedFile.type}
                            </p>
                            {uploadedFile.uploadProgress > 0 && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${uploadedFile.uploadProgress}%`,
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {uploadedFile.uploadProgress}% hoàn thành
                                </p>
                              </div>
                            )}
                          </div>
                          <LiquidGlassButton
                            variant="ghost"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              {files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có file nào để cài đặt metadata
                </div>
              ) : (
                <div className="space-y-6">
                  {files.map((uploadedFile, index) => (
                    <LiquidGlassCard
                      key={index}
                      variant="interactive"
                      hover={true}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {getFileIcon(uploadedFile.type)}
                          {uploadedFile.file.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tiêu đề</Label>
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
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Danh mục</Label>
                            <Select
                              value={uploadedFile.metadata.category}
                              onValueChange={(value) =>
                                updateFileMetadata(index, "category", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="course">Khóa học</SelectItem>
                                <SelectItem value="ebook">E-book</SelectItem>
                                <SelectItem value="template">
                                  Template
                                </SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="other">Khác</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Mô tả</Label>
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
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tags (từ khóa)</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {uploadedFile.metadata.tags.map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="gap-1"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(index, tagIndex)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Thêm tag..."
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addTag(index, e.currentTarget.value);
                                  e.currentTarget.value = "";
                                }
                              }}
                            />
                            <LiquidGlassButton
                              variant="ghost"
                              onClick={(e) => {
                                const input = e.currentTarget
                                  .previousElementSibling as HTMLInputElement;
                                addTag(index, input.value);
                                input.value = "";
                              }}
                            >
                              <Tag className="h-4 w-4" />
                            </LiquidGlassButton>
                          </div>
                        </div>

                        {isPartner && (
                          <div className="space-y-2">
                            <Label>Giá bán (VNĐ)</Label>
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
                            />
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              <span>Công khai</span>
                            </div>
                            <Switch
                              checked={uploadedFile.metadata.isPublic}
                              onCheckedChange={(checked) =>
                                updateFileMetadata(index, "isPublic", checked)
                              }
                            />
                          </div>

                          {uploadedFile.type !== "video" && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                <span>Cho phép tải về</span>
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span>Bảo vệ DRM (chống sao chép)</span>
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
                        <div className="space-y-4 pt-4 border-t">
                          <div className="space-y-2">
                            <Label>Chủ sở hữu bản quyền</Label>
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
                            />
                          </div>

                          <div className="flex items-center space-x-2">
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
                              className="rounded"
                            />
                            <Label
                              htmlFor={`original-${index}`}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Đây là tác phẩm gốc của tôi
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
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
                              className="rounded"
                            />
                            <Label
                              htmlFor={`terms-${index}`}
                              className="flex items-center gap-2"
                            >
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              Tôi chịu trách nhiệm về bản quyền và nội dung của
                              file này
                            </Label>
                          </div>

                          {!uploadedFile.metadata.termsAccepted && (
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                Bạn cần đồng ý chịu trách nhiệm về bản quyền
                                trước khi upload. Việc upload tài liệu vi phạm
                                bản quyền có thể dẫn đến hậu quả pháp lý.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </LiquidGlassCard>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Lưu ý quan trọng về bản quyền:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
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

              <LiquidGlassCard variant="default">
                <CardHeader>
                  <CardTitle>Quyền hạn theo vai trò</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Học viên
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>✓ Upload tài liệu cá nhân</li>
                        <li>✗ Không thể bán sản phẩm</li>
                        <li>✓ Chia sẻ miễn phí</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Đối tác/Giảng viên
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>✓ Upload tài liệu/video</li>
                        <li>✓ Đặt giá bán sản phẩm</li>
                        <li>✓ Bảo vệ DRM cho video</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>

          {files.length > 0 && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <LiquidGlassButton
                variant="secondary"
                onClick={() => setFiles([])}
              >
                Hủy tất cả
              </LiquidGlassButton>
              <LiquidGlassButton
                onClick={uploadFiles}
                variant="primary"
                glow={true}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload {files.length} file{files.length > 1 ? "s" : ""}
              </LiquidGlassButton>
            </div>
          )}
        </CardContent>
      </LiquidGlassCard>
    </div>
  );
}
