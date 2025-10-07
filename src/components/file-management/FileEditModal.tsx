/**
 * File Edit Modal Component
 * Chỉnh sửa thông tin file và metadata
 */

import React, { useState, useEffect } from "react";
import { X, Save, Tag, Type, Globe, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { toast } from "react-hot-toast";

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
    title?: string;
  };
}

interface FileEditModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedFile: FileItem) => void;
  courses?: Array<{ id: string; title: string; }>;
}

export default function FileEditModal({
  file,
  isOpen,
  onClose,
  onSave,
  courses = []
}: FileEditModalProps) {
  const [editedFile, setEditedFile] = useState<FileItem | null>(null);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (file) {
      setEditedFile({
        ...file,
        metadata: {
          description: "",
          tags: [],
          ...file.metadata
        }
      });
    }
  }, [file]);

  const handleSave = async () => {
    if (!editedFile) return;

    setIsLoading(true);
    try {
      // TODO: Call API to update file metadata when database is ready
      console.log("Updating file metadata:", editedFile);

      onSave(editedFile);
      toast.success("Cập nhật file thành công");
      onClose();
    } catch (error) {
      console.error("Error updating file:", error);
      toast.error("Không thể cập nhật file");
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (!newTag.trim() || !editedFile) return;

    const currentTags = editedFile.metadata?.tags || [];
    if (currentTags.includes(newTag.trim())) {
      toast.error("Tag đã tồn tại");
      return;
    }

    setEditedFile({
      ...editedFile,
      metadata: {
        ...editedFile.metadata,
        tags: [...currentTags, newTag.trim()]
      }
    });
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    if (!editedFile) return;

    setEditedFile({
      ...editedFile,
      metadata: {
        ...editedFile.metadata,
        tags: editedFile.metadata?.tags?.filter(tag => tag !== tagToRemove) || []
      }
    });
  };

  const updateField = (field: string, value: any) => {
    if (!editedFile) return;

    if (field.startsWith('metadata.')) {
      const metadataField = field.replace('metadata.', '');
      setEditedFile({
        ...editedFile,
        metadata: {
          ...editedFile.metadata,
          [metadataField]: value
        }
      });
    } else {
      setEditedFile({
        ...editedFile,
        [field]: value
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!editedFile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Chỉnh sửa thông tin file
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Thông tin file</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tên file:</span>
                <p className="font-medium">{editedFile.originalName}</p>
              </div>
              <div>
                <span className="text-gray-500">Kích thước:</span>
                <p className="font-medium">{formatFileSize(editedFile.size)}</p>
              </div>
              <div>
                <span className="text-gray-500">Loại file:</span>
                <p className="font-medium">{editedFile.type}</p>
              </div>
              <div>
                <span className="text-gray-500">Ngày upload:</span>
                <p className="font-medium">
                  {new Date(editedFile.uploadedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề hiển thị</Label>
              <Input
                id="title"
                value={editedFile.metadata?.title || editedFile.originalName}
                onChange={(e) => updateField('metadata.title', e.target.value)}
                placeholder="Nhập tiêu đề hiển thị"
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={editedFile.metadata?.description || ""}
                onChange={(e) => updateField('metadata.description', e.target.value)}
                placeholder="Mô tả nội dung file"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Danh mục</Label>
              <Select
                value={editedFile.category}
                onValueChange={(value) => updateField('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Tài liệu</SelectItem>
                  <SelectItem value="image">Hình ảnh</SelectItem>
                  <SelectItem value="course">Khóa học</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="public">Công khai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Selection for course category */}
            {editedFile.category === "course" && courses.length > 0 && (
              <div>
                <Label htmlFor="courseId">Khóa học</Label>
                <Select
                  value={editedFile.metadata?.courseId || ""}
                  onValueChange={(value) => updateField('metadata.courseId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khóa học" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Privacy Setting */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  {editedFile.isPublic ? (
                    <Globe className="w-4 h-4 text-green-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-600" />
                  )}
                  File công khai
                </Label>
                <p className="text-sm text-gray-500">
                  File công khai có thể được truy cập bởi bất kỳ ai
                </p>
              </div>
              <Switch
                checked={editedFile.isPublic}
                onCheckedChange={(checked) => updateField('isPublic', checked)}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4" />
              Tags
            </Label>

            {/* Current Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {editedFile.metadata?.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Thêm tag mới..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button onClick={addTag} variant="outline">
                Thêm
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}