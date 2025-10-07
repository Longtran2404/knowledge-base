/**
 * File Manager Component
 * Quản lý files cho từng tài khoản với categorization
 */

import React, { useState, useEffect, useCallback } from "react";
import { Upload, File, Video, Image, BookOpen, Edit, Trash, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { StorageService, STORAGE_BUCKETS } from "../../lib/storage/storage-service";
import { toast } from "react-hot-toast";
import FileEditModal from "./FileEditModal";

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  category: "blog" | "document" | "course" | "image" | "public";
  bucketName: string;
  filePath: string;
  uploadedAt: string;
  isPublic: boolean;
  downloadCount?: number;
  metadata?: {
    description?: string;
    tags?: string[];
    courseId?: string;
    lessonId?: string;
  };
}

interface UploadProgress {
  [key: string]: number;
}

export default function FileManager() {
  const { user, userProfile } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter files based on category and search
  const filteredFiles = files.filter(file => {
    const matchesCategory = activeTab === "all" || file.category === activeTab;
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get file icon based on type
  const getFileIcon = (type: string, category: string) => {
    if (category === "course") return <Video className="w-5 h-5 text-blue-500" />;
    if (type.startsWith("image/")) return <Image className="w-5 h-5 text-green-500" />;
    if (type.startsWith("video/")) return <Video className="w-5 h-5 text-purple-500" />;
    if (type === "application/pdf") return <File className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Load user files (mock for now since database is not ready)
  const loadFiles = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call when database is ready
      // For now, create mock data
      const mockFiles: FileItem[] = [
        {
          id: "1",
          name: "sample-document.pdf",
          originalName: "Tài liệu mẫu.pdf",
          size: 2048000,
          type: "application/pdf",
          category: "document",
          bucketName: "user-documents",
          filePath: "documents/sample-document.pdf",
          uploadedAt: new Date().toISOString(),
          isPublic: false,
          metadata: {
            description: "Tài liệu mẫu cho hệ thống",
            tags: ["sample", "document"]
          }
        }
      ];

      setFiles(mockFiles);
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Không thể tải danh sách files");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Handle file upload
  const handleFileUpload = async (fileList: FileList, category: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để upload file");
      return;
    }

    const validCategories = ["blog", "document", "course", "image", "public"];
    if (!validCategories.includes(category)) {
      toast.error("Loại file không hợp lệ");
      return;
    }

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileId = `upload-${Date.now()}-${i}`;

      try {
        // Get appropriate bucket for file type
        const bucketName = StorageService.getBucketForFileType(file.type, category);

        // Validate file type and size
        if (!StorageService.isFileTypeAllowed(file.type, bucketName)) {
          toast.error(`File ${file.name}: Loại file không được phép`);
          continue;
        }

        if (!StorageService.isFileSizeAllowed(file.size, bucketName)) {
          toast.error(`File ${file.name}: Kích thước file quá lớn`);
          continue;
        }

        // Create file path
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${user.id}/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;

        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Upload file
        const result = await StorageService.uploadFile(file, bucketName, fileName, {
          cacheControl: "3600",
          upsert: false
        });

        if (result.success) {
          // Create file record
          const newFile: FileItem = {
            id: fileId,
            name: fileName,
            originalName: file.name,
            size: file.size,
            type: file.type,
            category: category as any,
            bucketName,
            filePath: fileName,
            uploadedAt: new Date().toISOString(),
            isPublic: bucketName.includes("public"),
            metadata: {
              description: "",
              tags: []
            }
          };

          setFiles(prev => [newFile, ...prev]);
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          toast.success(`Upload thành công: ${file.name}`);

          // TODO: Save to database when schema is ready
          console.log("File uploaded successfully:", newFile);
        } else {
          toast.error(`Upload thất bại: ${result.error}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Lỗi upload: ${file.name}`);
      } finally {
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 2000);
      }
    }
  };

  // Handle file delete
  const handleFileDelete = async (file: FileItem) => {
    try {
      const result = await StorageService.deleteFile(file.bucketName, file.filePath);

      if (result.success) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
        toast.success("Xóa file thành công");

        // TODO: Delete from database when schema is ready
      } else {
        toast.error(`Lỗi xóa file: ${result.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Không thể xóa file");
    }
  };

  // Handle file download
  const handleFileDownload = async (file: FileItem) => {
    try {
      if (file.isPublic) {
        const publicUrl = StorageService.getPublicUrl(file.bucketName, file.filePath);
        window.open(publicUrl, '_blank');
      } else {
        const result = await StorageService.createSignedUrl(file.bucketName, file.filePath, 3600);

        if (result.signedUrl) {
          window.open(result.signedUrl, '_blank');
          toast.success("Đang tải file...");
        } else {
          toast.error(`Lỗi tải file: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Không thể tải file");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Vui lòng đăng nhập để quản lý files</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Files</h1>
          <p className="text-gray-600">Quản lý tài liệu, hình ảnh và video của bạn</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {["document", "image", "blog", "course", "public"].map((category) => (
              <div key={category} className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    id={`upload-${category}`}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files, category);
                        e.target.value = '';
                      }
                    }}
                  />
                  <label
                    htmlFor={`upload-${category}`}
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {category === "document" && <File className="w-8 h-8 text-blue-500" />}
                    {category === "image" && <Image className="w-8 h-8 text-green-500" />}
                    {category === "blog" && <BookOpen className="w-8 h-8 text-purple-500" />}
                    {category === "course" && <Video className="w-8 h-8 text-red-500" />}
                    {category === "public" && <Upload className="w-8 h-8 text-gray-500" />}
                    <span className="text-sm font-medium capitalize">{category}</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId}>
                  <div className="flex items-center justify-between text-sm">
                    <span>Đang upload...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Tìm kiếm files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* File Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="document">Tài liệu</TabsTrigger>
          <TabsTrigger value="image">Hình ảnh</TabsTrigger>
          <TabsTrigger value="course">Khóa học</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="public">Công khai</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.type, file.category)}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{file.originalName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Badge variant={file.isPublic ? "default" : "secondary"}>
                        {file.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {file.category}
                      </Badge>
                      {file.metadata?.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {file.metadata?.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {file.metadata.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{new Date(file.uploadedAt).toLocaleDateString('vi-VN')}</span>
                      {file.downloadCount && (
                        <span>{file.downloadCount} lượt tải</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFileDownload(file)}
                        className="flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Tải
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingFile(file);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFileDelete(file)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? "Không tìm thấy file nào" : "Chưa có file nào"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* File Edit Modal */}
      <FileEditModal
        file={editingFile}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingFile(null);
        }}
        onSave={(updatedFile) => {
          setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
          setShowEditModal(false);
          setEditingFile(null);
        }}
      />
    </div>
  );
}