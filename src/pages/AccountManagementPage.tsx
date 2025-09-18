import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import FileUpload from "../components/FileUpload";
import {
  ArrowLeft,
  User,
  Settings,
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Package,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserFiles,
  FileUpload as FileUploadType,
  formatFileSize,
  getFileIcon,
} from "../lib/file-service";

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const { userProfile: user, updateProfile, isLoading: loading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    bio: "",
  });
  const [personalFiles, setPersonalFiles] = useState<FileUploadType[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const loadPersonalFiles = useCallback(async () => {
    if (!user) return;

    setLoadingFiles(true);
    try {
      const files = await getUserFiles(user.id);
      setPersonalFiles(files);
    } catch (error) {
      toast.error("Không thể tải danh sách file");
    } finally {
      setLoadingFiles(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
      });
      loadPersonalFiles();
    }
  }, [user, loadPersonalFiles]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const result = await updateProfile(editForm);
      if (result.success) {
        toast.success("Cập nhật thông tin thành công");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
      });
    }
    setIsEditing(false);
  };

  const handleFileUpload = (file: FileUploadType) => {
    setPersonalFiles((prev) => [file, ...prev]);
  };

  const handleFileDelete = (fileId: string) => {
    setPersonalFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Cần đăng nhập
            </h2>
            <p className="text-gray-600 mb-4">
              Vui lòng đăng nhập để quản lý tài khoản
            </p>
            <Button onClick={() => navigate("/dang-nhap")} className="w-full">
              Đăng nhập ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý tài khoản
              </h1>
              <p className="text-gray-600">
                Quản lý thông tin cá nhân và tài liệu của bạn
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-4">
            <TabsTrigger value="profile" className="text-xs md:text-sm">
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="files" className="text-xs md:text-sm">
              Tài liệu
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs md:text-sm">
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm">
              Cài đặt
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Thông tin cá nhân
                    </CardTitle>
                    <CardDescription>
                      Quản lý thông tin cá nhân của bạn
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Họ và tên</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              full_name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Giới thiệu bản thân</Label>
                      <textarea
                        id="bio"
                        className="w-full p-3 border border-gray-300 rounded-md resize-none"
                        rows={4}
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        placeholder="Viết vài dòng về bản thân..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Họ và tên
                        </Label>
                        <p className="text-gray-900">
                          {user.full_name || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Số điện thoại
                        </Label>
                        <p className="text-gray-900">
                          {user.phone || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Vai trò
                        </Label>
                        <p className="text-gray-900">
                          {user.role === "student"
                            ? "Học viên"
                            : user.role === "instructor"
                            ? "Giảng viên"
                            : "Quản trị viên"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Địa chỉ
                      </Label>
                      <p className="text-gray-900">
                        {user.address || "Chưa cập nhật"}
                      </p>
                    </div>

                    {user.bio && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Giới thiệu
                        </Label>
                        <p className="text-gray-900">{user.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload tài liệu cá nhân
                  </CardTitle>
                  <CardDescription>
                    Upload và quản lý tài liệu cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    fileType="personal"
                    onUploadComplete={handleFileUpload}
                    onFileDelete={handleFileDelete}
                    maxFileSize={50}
                    acceptedTypes={["*"]}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tài liệu đã upload
                  </CardTitle>
                  <CardDescription>
                    Danh sách tài liệu cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingFiles ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Đang tải...</p>
                    </div>
                  ) : personalFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Chưa có tài liệu nào</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {personalFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {getFileIcon(file.mime_type)}
                            </span>
                            <div>
                              <p className="font-medium text-sm">
                                {file.original_filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize((file as any).file_size)} •{" "}
                                {file.download_count} lượt tải •
                                {new Date(file.created_at).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `/api/files/${file.id}/download`,
                                  "_blank"
                                )
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileDelete(file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Đơn hàng của tôi
                </CardTitle>
                <CardDescription>
                  Theo dõi các đơn hàng và giao dịch của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample Order */}
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Đơn hàng #NLC001</p>
                          <p className="text-sm text-gray-500">15/01/2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          599,000 VNĐ
                        </p>
                        <p className="text-sm text-green-600">Hoàn thành</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Khóa học React cơ bản + TypeScript nâng cao
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Xem chi tiết
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Tải hóa đơn
                      </Button>
                    </div>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Chưa có đơn hàng nào</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Khám phá các khóa học và sản phẩm của chúng tôi
                    </p>
                    <Button
                      onClick={() => (window.location.href = "/cho-mua-ban")}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Mua sắm ngay
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài đặt tài khoản
                </CardTitle>
                <CardDescription>
                  Quản lý cài đặt và bảo mật tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Thay đổi mật khẩu</h3>
                      <p className="text-sm text-gray-600">
                        Cập nhật mật khẩu để bảo mật tài khoản
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/bao-mat")}
                    >
                      Thay đổi
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Xóa tài khoản</h3>
                      <p className="text-sm text-gray-600">
                        Xóa vĩnh viễn tài khoản và dữ liệu
                      </p>
                    </div>
                    <Button variant="destructive">Xóa tài khoản</Button>
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
