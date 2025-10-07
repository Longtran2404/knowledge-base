import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { Button } from "../ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { Checkbox } from "../ui/checkbox";
import {
  Upload,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  X,
  Check,
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  Calendar,
  Tag,
  FileType,
  Download,
  Eye,
  Shield,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadData {
  title: string;
  description: string;
  category: string;
  type: "document" | "template" | "ebook" | "video" | "audio" | "software";
  price: number;
  tags: string[];
  file: File | null;
  preview: string | null;
  isPublic: boolean;
  requiresApproval: boolean;
}

const initialData: DocumentUploadData = {
  title: "",
  description: "",
  category: "",
  type: "document",
  price: 0,
  tags: [],
  file: null,
  preview: null,
  isPublic: true,
  requiresApproval: false,
};

export function DocumentUpload() {
  const { user: authUser, userProfile: user } = useAuth();
  const navigate = useNavigate();
  const [uploadData, setUploadData] = useState<DocumentUploadData>(initialData);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagInput, setTagInput] = useState("");

  // Check user permissions - Must be before early return
  const canSetPrice =
    user?.account_role === "giang_vien" || user?.account_role === "admin";
  const canUploadPublic = user?.account_role === "admin";
  const needsApproval =
    user?.account_role === "sinh_vien" || user?.account_role === "giang_vien";

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File không được vượt quá 50MB");
      return;
    }

    // Create preview for images
    let preview = null;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }

    setUploadData((prev) => ({
      ...prev,
      file,
      preview,
      title: prev.title || file.name.split(".")[0],
    }));

    toast.success(`Đã chọn file: ${file.name}`);
  }, []);

  // Simple drag and drop implementation to replace useDropzone
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onDrop(files);
      }
    },
    [onDrop]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onDrop(files);
      }
    },
    [onDrop]
  );

  const getRootProps = () => ({
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    style: { outline: "none" },
  });

  const getInputProps = () => ({
    type: "file" as const,
    onChange: handleFileInputChange,
    accept:
      ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi,.mkv,.mp3,.wav,.flac,.txt,.zip,.rar",
    style: { display: "none" as const },
  });

  const getFileIcon = (file: File | null) => {
    if (!file) return <FileText className="w-8 h-8" />;

    if (file.type.startsWith("image/")) return <Image className="w-8 h-8" />;
    if (file.type.startsWith("video/")) return <Video className="w-8 h-8" />;
    if (file.type.startsWith("audio/")) return <Music className="w-8 h-8" />;
    if (file.type.includes("zip") || file.type.includes("rar"))
      return <Archive className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !uploadData.tags.includes(tag)) {
      setUploadData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setUploadData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadData.file || !uploadData.title.trim()) {
      toast.error("Vui lòng chọn file và nhập tiêu đề");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Final data preparation
      const finalData = {
        ...uploadData,
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uploadedBy: user?.id,
        uploadedAt: new Date().toISOString(),
        status: needsApproval ? "pending_approval" : "approved",
        price: canSetPrice ? uploadData.price : 0,
        isPublic: canUploadPublic ? uploadData.isPublic : false,
        fileSize: uploadData.file.size,
        fileType: uploadData.file.type,
        fileName: uploadData.file.name,
      };

      // Save to localStorage (in real app, this would be API call)
      const existingDocs = JSON.parse(
        localStorage.getItem("nlc_uploaded_documents") || "[]"
      );
      existingDocs.push(finalData);
      localStorage.setItem(
        "nlc_uploaded_documents",
        JSON.stringify(existingDocs)
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        toast.success(
          needsApproval
            ? "Tài liệu đã được gửi và đang chờ duyệt!"
            : "Tải lên thành công!"
        );
        setUploadData(initialData);
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải lên");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Check if user is logged in - After all hooks
  if (!authUser) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vui lòng đăng nhập để upload tài liệu
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Bạn cần đăng nhập vào tài khoản để có thể upload và chia sẻ tài liệu
          </p>
          <Button onClick={() => navigate("/dang-nhap")}>
            <LogIn className="mr-2 h-4 w-4" />
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Tải lên tài liệu</CardTitle>
            <CardDescription>
              Chia sẻ tài liệu, template và nội dung giá trị với cộng đồng
            </CardDescription>
          </div>
        </div>

        {/* User Permission Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Quyền hạn của bạn:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Check
                className={`w-4 h-4 ${
                  canSetPrice ? "text-green-600" : "text-gray-400"
                }`}
              />
              <span
                className={canSetPrice ? "text-green-700" : "text-gray-500"}
              >
                Đặt giá bán
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check
                className={`w-4 h-4 ${
                  canUploadPublic ? "text-green-600" : "text-gray-400"
                }`}
              />
              <span
                className={canUploadPublic ? "text-green-700" : "text-gray-500"}
              >
                Xuất bản trực tiếp
              </span>
            </div>
            <div className="flex items-center gap-2">
              {needsApproval ? (
                <Clock className="w-4 h-4 text-yellow-600" />
              ) : (
                <Check className="w-4 h-4 text-green-600" />
              )}
              <span
                className={needsApproval ? "text-yellow-700" : "text-green-700"}
              >
                {needsApproval ? "Cần duyệt" : "Tự động duyệt"}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>Chọn file tài liệu *</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : uploadData.file
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />

              {uploadData.file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    {getFileIcon(uploadData.file)}
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {uploadData.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadData.file.size)}
                      </p>
                    </div>
                  </div>

                  {uploadData.preview && (
                    <div className="max-w-xs mx-auto">
                      <img
                        src={uploadData.preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setUploadData((prev) => ({
                        ...prev,
                        file: null,
                        preview: null,
                      }))
                    }
                  >
                    <X className="w-4 h-4 mr-2" />
                    Chọn file khác
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-lg font-medium">
                    {isDragActive
                      ? "Thả file vào đây..."
                      : "Kéo thả file hoặc click để chọn"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Hỗ trợ: PDF, Word, Excel, PowerPoint, hình ảnh, video, audio
                    (max 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span>Đang tải lên...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>

          <Separator />

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={uploadData.title}
                onChange={(e) =>
                  setUploadData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Nhập tiêu đề tài liệu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Danh mục *</Label>
              <Select
                value={uploadData.category}
                onValueChange={(value) =>
                  setUploadData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bim">BIM</SelectItem>
                  <SelectItem value="cad">CAD</SelectItem>
                  <SelectItem value="architecture">Kiến trúc</SelectItem>
                  <SelectItem value="construction">Xây dựng</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="tutorials">Hướng dẫn</SelectItem>
                  <SelectItem value="ebooks">E-books</SelectItem>
                  <SelectItem value="software">Phần mềm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Loại tài liệu</Label>
              <Select
                value={uploadData.type}
                onValueChange={(value: any) =>
                  setUploadData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Tài liệu</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="ebook">E-book</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="software">Phần mềm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canSetPrice && (
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán (VND)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={uploadData.price}
                    onChange={(e) =>
                      setUploadData((prev) => ({
                        ...prev,
                        price: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="0 = Miễn phí"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Để 0 nếu muốn chia sẻ miễn phí
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={uploadData.description}
              onChange={(e) =>
                setUploadData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Mô tả chi tiết về tài liệu..."
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Nhập tag và nhấn Enter"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Thêm
              </Button>
            </div>
            {uploadData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            {canUploadPublic && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={uploadData.isPublic}
                  onCheckedChange={(checked) =>
                    setUploadData((prev) => ({
                      ...prev,
                      isPublic: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Công khai ngay lập tức (không cần duyệt)
                </Label>
              </div>
            )}

            {needsApproval && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Tài liệu sẽ được gửi đến quản lý để duyệt trước khi xuất bản
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={
                uploading || !uploadData.file || !uploadData.title.trim()
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1"
            >
              {uploading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {needsApproval ? "Gửi để duyệt" : "Tải lên"}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setUploadData(initialData);
                setTagInput("");
              }}
              disabled={uploading}
            >
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
