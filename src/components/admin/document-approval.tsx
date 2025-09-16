import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Check,
  X,
  Clock,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  User,
  Calendar,
  DollarSign,
  Eye,
  Download,
  AlertTriangle,
  MessageSquare,
  Filter,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { toast } from "sonner";

interface UploadedDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  price: number;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  status: "pending_approval" | "approved" | "rejected";
  fileName: string;
  fileSize: number;
  fileType: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  views?: number;
  downloads?: number;
}

export function DocumentApproval() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] =
    useState<UploadedDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Check if user has permission to approve documents
  const canApprove = user?.role === "admin";

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    try {
      const storedDocs = localStorage.getItem("nlc_uploaded_documents");
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Có lỗi khi tải danh sách tài liệu");
    } finally {
      setLoading(false);
    }
  };

  const approveDocument = async (documentId: string) => {
    if (!canApprove) {
      toast.error("Bạn không có quyền duyệt tài liệu");
      return;
    }

    try {
      const updatedDocs = documents.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              status: "approved" as const,
              approvedBy: user?.id,
              approvedAt: new Date().toISOString(),
            }
          : doc
      );

      setDocuments(updatedDocs);
      localStorage.setItem(
        "nlc_uploaded_documents",
        JSON.stringify(updatedDocs)
      );

      toast.success("Đã duyệt tài liệu thành công!");
      setSelectedDocument(null);
    } catch (error) {
      toast.error("Có lỗi khi duyệt tài liệu");
    }
  };

  const rejectDocument = async (documentId: string, reason: string) => {
    if (!canApprove) {
      toast.error("Bạn không có quyền từ chối tài liệu");
      return;
    }

    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      const updatedDocs = documents.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              status: "rejected" as const,
              rejectionReason: reason,
              approvedBy: user?.id,
              approvedAt: new Date().toISOString(),
            }
          : doc
      );

      setDocuments(updatedDocs);
      localStorage.setItem(
        "nlc_uploaded_documents",
        JSON.stringify(updatedDocs)
      );

      toast.success("Đã từ chối tài liệu");
      setSelectedDocument(null);
      setRejectionReason("");
    } catch (error) {
      toast.error("Có lỗi khi từ chối tài liệu");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="w-5 h-5" />;
    if (fileType.startsWith("video/")) return <Video className="w-5 h-5" />;
    if (fileType.startsWith("audio/")) return <Music className="w-5 h-5" />;
    if (fileType.includes("zip") || fileType.includes("rar"))
      return <Archive className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_approval":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Chờ duyệt
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Từ chối
          </Badge>
        );
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || doc.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "date":
        default:
          comparison =
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const pendingCount = documents.filter(
    (doc) => doc.status === "pending_approval"
  ).length;
  const approvedCount = documents.filter(
    (doc) => doc.status === "approved"
  ).length;
  const rejectedCount = documents.filter(
    (doc) => doc.status === "rejected"
  ).length;

  if (!canApprove) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Không có quyền truy cập
          </h3>
          <p className="text-gray-500">
            Bạn cần quyền quản trị để duyệt tài liệu
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p>Đang tải danh sách tài liệu...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Duyệt tài liệu
          </CardTitle>
          <CardDescription>
            Quản lý và duyệt tài liệu do người dùng tải lên
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-gray-500">Tổng tài liệu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
                <p className="text-sm text-gray-500">Chờ duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {approvedCount}
                </p>
                <p className="text-sm text-gray-500">Đã duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {rejectedCount}
                </p>
                <p className="text-sm text-gray-500">Từ chối</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tiêu đề, danh mục..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="pending_approval">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>

            <div>
              <Label htmlFor="sort">Sắp xếp</Label>
              <div className="flex gap-2">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Ngày tải</option>
                  <option value="title">Tiêu đề</option>
                  <option value="status">Trạng thái</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredDocuments.map((doc) => (
            <motion.div
              key={doc.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* File Icon */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getFileIcon(doc.fileType)}
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {doc.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {doc.description}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          {getStatusBadge(doc.status)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDocument(doc)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Chi tiết
                              </Button>
                            </DialogTrigger>
                            <DocumentDetailModal
                              document={selectedDocument}
                              onApprove={approveDocument}
                              onReject={rejectDocument}
                              rejectionReason={rejectionReason}
                              setRejectionReason={setRejectionReason}
                            />
                          </Dialog>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {doc.uploadedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatPrice(doc.price)}
                        </div>
                        <div>
                          {formatFileSize(doc.fileSize)} • {doc.category}
                        </div>
                      </div>

                      {doc.status === "rejected" && doc.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-700 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">Lý do từ chối:</span>
                          </div>
                          <p className="text-red-600 text-sm mt-1">
                            {doc.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Quick Actions */}
                      {doc.status === "pending_approval" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => approveDocument(doc.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Duyệt
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Từ chối
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Từ chối tài liệu</DialogTitle>
                                <DialogDescription>
                                  Vui lòng nhập lý do từ chối tài liệu này
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                  }
                                  placeholder="Nhập lý do từ chối..."
                                  rows={4}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() =>
                                      rejectDocument(doc.id, rejectionReason)
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Xác nhận từ chối
                                  </Button>
                                  <Button variant="outline">Hủy</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="text-center p-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có tài liệu nào
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all"
                  ? "Không tìm thấy tài liệu phù hợp với bộ lọc"
                  : "Chưa có tài liệu nào được tải lên"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Document Detail Modal Component
function DocumentDetailModal({
  document,
  onApprove,
  onReject,
  rejectionReason,
  setRejectionReason,
}: {
  document: UploadedDocument | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
}) {
  if (!document) return null;

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <FileText className="w-5 h-5" />
          Chi tiết tài liệu
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-lg mb-2">{document.title}</h3>
          <p className="text-gray-600">{document.description}</p>
        </div>

        {/* File Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Tên file:</span>
            <p className="text-gray-600">{document.fileName}</p>
          </div>
          <div>
            <span className="font-medium">Kích thước:</span>
            <p className="text-gray-600">
              {(document.fileSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <div>
            <span className="font-medium">Danh mục:</span>
            <p className="text-gray-600">{document.category}</p>
          </div>
          <div>
            <span className="font-medium">Giá:</span>
            <p className="text-gray-600">
              {document.price === 0
                ? "Miễn phí"
                : `${document.price.toLocaleString()} VND`}
            </p>
          </div>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div>
            <span className="font-medium block mb-2">Tags:</span>
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Status and Actions */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Trạng thái: </span>
              {document.status === "pending_approval" && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  Chờ duyệt
                </Badge>
              )}
              {document.status === "approved" && (
                <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>
              )}
              {document.status === "rejected" && (
                <Badge className="bg-red-100 text-red-800">Từ chối</Badge>
              )}
            </div>

            {document.status === "pending_approval" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onApprove(document.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Duyệt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    if (rejectionReason.trim()) {
                      onReject(document.id, rejectionReason);
                    }
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Từ chối
                </Button>
              </div>
            )}
          </div>

          {document.status === "pending_approval" && (
            <div className="mt-4">
              <Label htmlFor="rejection-reason">Lý do từ chối (nếu có):</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={3}
              />
            </div>
          )}

          {document.status === "rejected" && document.rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="font-medium text-red-700">Lý do từ chối:</span>
              <p className="text-red-600 mt-1">{document.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}
