import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Loading } from "../components/ui/loading";
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  Clock,
  PlayCircle,
  Settings,
  Shield,
  Bell,
  CreditCard,
  Download,
  Star,
  TrendingUp,
  Target,
  MapPin,
  Briefcase,
  Globe,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  UserCheck,
  School,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ProfileCard } from "../components/ui/profile-card";
import { FluidGlass } from "../components/ui/fluid-glass";
import { supabase } from "../lib/supabase-config";

interface ExtendedUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: "sinh_vien" | "giang_vien" | "quan_ly" | "admin";
  created_at: string;
  phone?: string;
  bio?: string;
  location?: string;
  job_title?: string;
  company?: string;
  website?: string;
  birth_date?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  skills?: string[];
  interests?: string[];
  language?: string;
  timezone?: string;
  receive_email_notifications?: boolean;
  receive_push_notifications?: boolean;
  profile_visibility?: "public" | "private" | "friends_only";
}

export default function ProfilePage() {
  const { userProfile: user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Extended profile data state
  const [profileData, setProfileData] = useState<ExtendedUser>({
    id: user?.id || "",
    email: user?.email || "",
    full_name: user?.full_name || "",
    avatar_url: user?.avatar_url || "",
    role: user?.account_role || "sinh_vien",
    created_at: user?.created_at || new Date().toISOString(),
    phone: "",
    bio: "",
    location: "",
    job_title: "",
    company: "",
    website: "",
    birth_date: "",
    gender: "prefer_not_to_say",
    skills: [],
    interests: [],
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    receive_email_notifications: true,
    receive_push_notifications: true,
    profile_visibility: "private",
  });

  const [originalProfileData, setOriginalProfileData] = useState<ExtendedUser>(profileData);

  // Mock courses data
  const [userCourses] = useState([
    {
      id: "1",
      progress: 85,
      completed: false,
      started_at: "2024-01-15",
      course: {
        id: "1",
        title: "Revit Architecture 2024 - Từ cơ bản đến nâng cao",
        image_url: "https://images.unsplash.com/photo-1581093458791-9f3c3270e8b8?w=500",
        duration: "120 giờ",
        category: "BIM",
      },
    },
    {
      id: "2",
      progress: 100,
      completed: true,
      started_at: "2024-01-10",
      completed_at: "2024-02-20",
      course: {
        id: "2",
        title: "AutoCAD 2024 - Vẽ kỹ thuật chuyên nghiệp",
        image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500",
        duration: "80 giờ",
        category: "CAD",
      },
    },
  ]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Load extended profile data from localStorage or API
    loadExtendedProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadExtendedProfile = () => {
    try {
      const storedProfile = localStorage.getItem(`nlc_extended_profile_${user?.id}`);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        const merged = { ...profileData, ...parsed, ...user };
        setProfileData(merged);
        setOriginalProfileData(merged);
      } else {
        // Initialize with user data
        const initial = { ...profileData, ...user };
        setProfileData(initial);
        setOriginalProfileData(initial);
      }
    } catch (error) {
      console.error("Error loading extended profile:", error);
      const initial = { ...profileData, ...user };
      setProfileData(initial);
      setOriginalProfileData(initial);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Validate required fields
      if (!profileData.full_name.trim()) {
        toast.error("Vui lòng nhập họ và tên");
        return;
      }

      if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
        toast.error("Email không hợp lệ");
        return;
      }

      if (profileData.phone && !/^[0-9+\-\s()]+$/.test(profileData.phone)) {
        toast.error("Số điện thoại không hợp lệ");
        return;
      }

      if (profileData.website && !profileData.website.startsWith("http")) {
        setProfileData(prev => ({ ...prev, website: `https://${prev.website}` }));
      }

      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem(`nlc_extended_profile_${user.id}`, JSON.stringify(profileData));

      // Update original data to track changes
      setOriginalProfileData(profileData);
      setEditMode(false);

      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData(originalProfileData);
    setEditMode(false);
    toast.info("Đã hủy các thay đổi");
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    setLoading(true);
    try {
      // Mock password change (in real app, this would call API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      toast.success("Đổi mật khẩu thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Đăng xuất thành công");
      navigate("/");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File ảnh không được vượt quá 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setLoading(true);
    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileData(prev => ({ ...prev, avatar_url: result }));
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-files')
        .getPublicUrl(fileName);

      // Update database - both nlc_user_files and nlc_accounts
      const { error: filesError } = await (supabase as any)
        .from('nlc_user_files')
        .insert({
          user_id: user.id,
          filename: fileName,
          original_filename: file.name,
          file_path: urlData.publicUrl,
          file_type: 'image',
          file_category: 'image',
          file_extension: fileExt,
          mime_type: file.type,
          file_size: file.size,
          destination_page: 'profile',
          is_public: false,
          status: 'ready',
          upload_progress: 100,
        });

      if (filesError) console.error('Files table update error:', filesError);

      // Update user avatar_url in accounts table
      const { error: accountError } = await (supabase as any)
        .from('nlc_accounts')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (accountError) throw accountError;

      setProfileData(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast.error(error.message || "Không thể upload ảnh đại diện");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const hasUnsavedChanges = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loading size="lg" text="Đang tải hồ sơ..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Card Preview */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProfileCard
            name={profileData.full_name || user.email || "User"}
            email={profileData.email}
            phone={profileData.phone}
            avatar={profileData.avatar_url}
            role={profileData.role === "sinh_vien" ? "Học viên" : profileData.role === "giang_vien" ? "Giảng viên" : profileData.role === "admin" ? "Quản trị viên" : "Member"}
            location={profileData.location}
            joinDate={new Date(profileData.created_at).toLocaleDateString("vi-VN")}
            stats={[
              { label: "Khóa học", value: "12", icon: <BookOpen className="h-5 w-5" /> },
              { label: "Chứng chỉ", value: "8", icon: <Award className="h-5 w-5" /> },
              { label: "Giờ học", value: "124", icon: <Clock className="h-5 w-5" /> },
            ]}
            badges={profileData.skills?.slice(0, 3) || ["verified"]}
            onEdit={() => setEditMode(true)}
          />
        </motion.div>

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                Hồ sơ cá nhân
              </h1>
              <p className="text-gray-400 text-lg">
                Quản lý thông tin và tùy chỉnh tài khoản của bạn
              </p>
              {hasUnsavedChanges && (
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Edit3 className="w-3 h-3 mr-1" />
                    Có thay đổi chưa lưu
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {editMode ? (
                <>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? <Loading variant="spinner" size="sm" /> : <Save className="w-4 h-4 mr-2" />}
                    Lưu thay đổi
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Profile Info Sidebar */}
          <motion.div
            className="xl:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="sticky top-8">
              <CardHeader className="text-center pb-4">
                {/* Avatar Section */}
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={profileData.avatar_url} alt={profileData.full_name} />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {getInitials(profileData.full_name || profileData.email)}
                    </AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <div className="absolute -bottom-2 -right-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <div className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                          <Camera className="w-4 h-4" />
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-xl">
                    {profileData.full_name || "Chưa cập nhật tên"}
                  </CardTitle>
                  <CardDescription className="text-sm">{profileData.email}</CardDescription>
                  <div className="flex items-center justify-center">
                    <Badge
                      variant="secondary"
                      className={`${
                        profileData.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : profileData.role === "giang_vien"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {profileData.role === "admin"
                        ? "Quản trị viên"
                        : profileData.role === "giang_vien"
                        ? "Giảng viên"
                        : "Học viên"
                      }
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quick Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{profileData.email}</span>
                  </div>
                  {profileData.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                  {profileData.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{profileData.location}</span>
                    </div>
                  )}
                  {profileData.job_title && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{profileData.job_title}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      Tham gia {new Date(profileData.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {userCourses.length}
                    </div>
                    <div className="text-xs text-gray-500">Khóa học</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {userCourses.filter(c => c.completed).length}
                    </div>
                    <div className="text-xs text-gray-500">Hoàn thành</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="xl:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="profile" className="text-xs sm:text-sm">
                  <User className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Thông tin</span>
                </TabsTrigger>
                <TabsTrigger value="courses" className="text-xs sm:text-sm">
                  <BookOpen className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Khóa học</span>
                </TabsTrigger>
                <TabsTrigger value="certificates" className="text-xs sm:text-sm">
                  <Award className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Chứng chỉ</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="text-xs sm:text-sm">
                  <Shield className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Bảo mật</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm">
                  <Settings className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Cài đặt</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Information Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Thông tin cá nhân
                    </CardTitle>
                    <CardDescription>
                      Cập nhật thông tin cá nhân và liên hệ của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Basic Info */}
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Họ và tên *</Label>
                        <Input
                          id="full_name"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Nhập họ và tên"
                          disabled={!editMode}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Nhập số điện thoại"
                          disabled={!editMode}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birth_date">Ngày sinh</Label>
                        <Input
                          id="birth_date"
                          type="date"
                          value={profileData.birth_date}
                          onChange={(e) => setProfileData(prev => ({ ...prev, birth_date: e.target.value }))}
                          disabled={!editMode}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Địa chỉ</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Thành phố, Quốc gia"
                          disabled={!editMode}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Giới tính</Label>
                        <Select
                          value={profileData.gender}
                          onValueChange={(value: any) => setProfileData(prev => ({ ...prev, gender: value }))}
                          disabled={!editMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Nam</SelectItem>
                            <SelectItem value="female">Nữ</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                            <SelectItem value="prefer_not_to_say">Không muốn tiết lộ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Giới thiệu bản thân</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Viết vài dòng giới thiệu về bản thân..."
                        rows={4}
                        disabled={!editMode}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Thông tin nghề nghiệp
                    </CardTitle>
                    <CardDescription>
                      Thông tin về công việc và chuyên môn của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="job_title">Chức danh</Label>
                        <Input
                          id="job_title"
                          value={profileData.job_title}
                          onChange={(e) => setProfileData(prev => ({ ...prev, job_title: e.target.value }))}
                          placeholder="Kỹ sư, Kiến trúc sư, ..."
                          disabled={!editMode}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Công ty</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Tên công ty/tổ chức"
                          disabled={!editMode}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="website">Website cá nhân</Label>
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://your-website.com"
                          disabled={!editMode}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Khóa học của tôi
                      </div>
                      <Button onClick={() => navigate("/marketplace")} size="sm">
                        Khám phá thêm
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Theo dõi tiến độ và quản lý các khóa học đã đăng ký
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userCourses.length > 0 ? (
                      <div className="space-y-4">
                        {userCourses.map((userCourse) => (
                          <div key={userCourse.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex gap-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={userCourse.course.image_url}
                                  alt={userCourse.course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 line-clamp-1">
                                      {userCourse.course.title}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                      <Badge variant="outline">
                                        {userCourse.course.category}
                                      </Badge>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {userCourse.course.duration}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div
                                      className={`text-sm font-medium ${
                                        userCourse.completed
                                          ? "text-green-600"
                                          : "text-blue-600"
                                      }`}
                                    >
                                      {userCourse.completed
                                        ? "Hoàn thành"
                                        : `${userCourse.progress}%`}
                                    </div>
                                    {userCourse.completed && userCourse.completed_at && (
                                      <div className="text-xs text-gray-500">
                                        {new Date(userCourse.completed_at).toLocaleDateString("vi-VN")}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-gray-500">Tiến độ:</span>
                                    <span className="text-xs font-medium">{userCourse.progress}%</span>
                                  </div>
                                  <Progress value={userCourse.progress} className="h-2" />
                                </div>

                                <div className="flex gap-2 mt-4">
                                  <Button size="sm" className="flex-1">
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    {userCourse.progress === 0 ? "Bắt đầu học" : "Tiếp tục học"}
                                  </Button>
                                  {userCourse.completed && (
                                    <Button variant="outline" size="sm">
                                      <Download className="w-4 h-4 mr-2" />
                                      Chứng chỉ
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Chưa có khóa học nào
                        </h4>
                        <p className="text-gray-500 mb-4">
                          Khám phá marketplace để tìm khóa học phù hợp với bạn
                        </p>
                        <Button onClick={() => navigate("/marketplace")}>
                          Khám phá khóa học
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Certificates Tab */}
              <TabsContent value="certificates">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Chứng chỉ của tôi
                    </CardTitle>
                    <CardDescription>
                      Các chứng chỉ bạn đã đạt được sau khi hoàn thành khóa học
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userCourses.filter(c => c.completed).length > 0 ? (
                      <div className="space-y-4">
                        {userCourses.filter(c => c.completed).map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium">{course.course.title}</h4>
                                <p className="text-sm text-gray-500">
                                  Hoàn thành ngày {new Date(course.completed_at!).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Xem
                              </Button>
                              <Button size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Tải xuống
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Chưa có chứng chỉ nào
                        </h4>
                        <p className="text-gray-500">
                          Hoàn thành khóa học để nhận chứng chỉ
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Bảo mật tài khoản
                    </CardTitle>
                    <CardDescription>
                      Quản lý mật khẩu và cài đặt bảo mật
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">Mật khẩu</h4>
                          <p className="text-sm text-gray-500">
                            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowPasswordForm(!showPasswordForm)}
                          variant="outline"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Đổi mật khẩu
                        </Button>
                      </div>

                      {showPasswordForm && (
                        <motion.div
                          className="space-y-4 pt-4 border-t"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="space-y-2">
                            <Label htmlFor="current_password">Mật khẩu hiện tại</Label>
                            <Input
                              id="current_password"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Nhập mật khẩu hiện tại"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="new_password">Mật khẩu mới</Label>
                            <Input
                              id="new_password"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Nhập mật khẩu mới"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm_password">Xác nhận mật khẩu mới</Label>
                            <Input
                              id="confirm_password"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Nhập lại mật khẩu mới"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={handleChangePassword}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {loading ? <Loading variant="spinner" size="sm" /> : "Cập nhật mật khẩu"}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowPasswordForm(false);
                                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                              }}
                              variant="outline"
                            >
                              Hủy
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Xác thực hai yếu tố</h4>
                          <p className="text-sm text-gray-500">
                            Thêm lớp bảo mật bổ sung cho tài khoản
                          </p>
                        </div>
                        <Button variant="outline" disabled>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Sắp có
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Thông báo
                    </CardTitle>
                    <CardDescription>
                      Quản lý các loại thông báo bạn muốn nhận
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email thông báo</h4>
                        <p className="text-sm text-gray-500">
                          Nhận thông báo về khóa học và cập nhật qua email
                        </p>
                      </div>
                      <Checkbox
                        checked={profileData.receive_email_notifications}
                        onCheckedChange={(checked) =>
                          setProfileData(prev => ({ ...prev, receive_email_notifications: checked as boolean }))
                        }
                        disabled={!editMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Thông báo đẩy</h4>
                        <p className="text-sm text-gray-500">
                          Nhận thông báo đẩy trên trình duyệt
                        </p>
                      </div>
                      <Checkbox
                        checked={profileData.receive_push_notifications}
                        onCheckedChange={(checked) =>
                          setProfileData(prev => ({ ...prev, receive_push_notifications: checked as boolean }))
                        }
                        disabled={!editMode}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Tùy chọn hiển thị
                    </CardTitle>
                    <CardDescription>
                      Quản lý quyền riêng tư và hiển thị hồ sơ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Hiển thị hồ sơ</Label>
                      <RadioGroup
                        value={profileData.profile_visibility}
                        onValueChange={(value: any) =>
                          setProfileData(prev => ({ ...prev, profile_visibility: value }))
                        }
                        disabled={!editMode}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="public" id="public" />
                          <Label htmlFor="public">Công khai</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="private" id="private" />
                          <Label htmlFor="private">Riêng tư</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Ngôn ngữ</Label>
                      <Select
                        value={profileData.language}
                        onValueChange={(value) =>
                          setProfileData(prev => ({ ...prev, language: value }))
                        }
                        disabled={!editMode}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Múi giờ</Label>
                      <Select
                        value={profileData.timezone}
                        onValueChange={(value) =>
                          setProfileData(prev => ({ ...prev, timezone: value }))
                        }
                        disabled={!editMode}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</SelectItem>
                          <SelectItem value="Asia/Bangkok">Bangkok (UTC+7)</SelectItem>
                          <SelectItem value="Asia/Singapore">Singapore (UTC+8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}