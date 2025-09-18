import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Search,
  Upload,
  Download,
  FileText,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPublicFiles,
  downloadFile,
  formatFileSize,
  getFileIcon,
  FileUpload as FileUploadType,
} from "../lib/file-service";

export default function PublicFilesPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileUploadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "size" | "date" | "downloads">(
    "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const publicFiles = await getPublicFiles();
      setFiles(publicFiles);
    } catch (error) {
      toast.error("Không thể tải danh sách tài liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const result = await downloadFile(fileId);
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      } else {
        toast.error(`Tải file thất bại: ${result.error}`);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải file");
    }
  };

  const filteredFiles = files
    .filter((file) => {
      const matchesSearch = file.original_filename
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === "all" || file.mime_type.includes(filterType);
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.original_filename.localeCompare(b.original_filename);
          break;
        case "size":
          comparison = a.file_size - b.file_size;
          break;
        case "date":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "downloads":
          comparison = a.download_count - b.download_count;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const fileTypes = [
    { value: "all", label: "Tất cả" },
    { value: "pdf", label: "PDF" },
    { value: "image", label: "Hình ảnh" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Âm thanh" },
    { value: "document", label: "Tài liệu" },
    { value: "archive", label: "Nén" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tài liệu công khai
              </h1>
              <p className="text-gray-600">
                Khám phá và tải xuống tài liệu miễn phí
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm tài liệu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {fileTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split("-");
                    setSortBy(sort as any);
                    setSortOrder(order as any);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="date-desc">Mới nhất</option>
                  <option value="date-asc">Cũ nhất</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                  <option value="size-desc">Lớn nhất</option>
                  <option value="size-asc">Nhỏ nhất</option>
                  <option value="downloads-desc">Tải nhiều nhất</option>
                </select>

                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 ${
                      viewMode === "grid"
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 ${
                      viewMode === "list"
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải tài liệu...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery
                  ? "Không tìm thấy tài liệu"
                  : "Chưa có tài liệu nào"}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                  : "Tài liệu sẽ được hiển thị ở đây khi có người upload"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">
                      {getFileIcon(file.mime_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {file.original_filename}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize((file as any).file_size)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.download_count} lượt tải
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(file.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(file.id)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {files.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {files.length}
                  </p>
                  <p className="text-sm text-gray-600">Tài liệu</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {files.reduce((sum, file) => sum + file.download_count, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Lượt tải</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatFileSize(
                      files.reduce(
                        (sum, file) => sum + (file as any).file_size,
                        0
                      )
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Tổng dung lượng</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Set(files.map((f) => f.mime_type.split("/")[0])).size}
                  </p>
                  <p className="text-sm text-gray-600">Loại file</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
