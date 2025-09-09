import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { getUserCourses, getUserProfile, updateUserProfile } from '../lib/supabase';
import AvatarUpload from '../components/avatar-upload';
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
  Target
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    avatar_url: user?.user_metadata?.avatar_url || '',
  });

  // mock data defined inside effect to avoid lint missing dep in CI

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadUserData = async () => {
      try {
        // Load user profile from database
        const profile = await getUserProfile(user.id);
        setUserProfile(profile);
        setProfileData({
          full_name: profile.full_name || user.user_metadata?.full_name || '',
          phone: profile.phone || user.user_metadata?.phone || '',
          avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || '',
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to auth metadata
        setProfileData({
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          avatar_url: user.user_metadata?.avatar_url || '',
        });
      }

      // Simulate loading user courses
      setTimeout(() => {
        const mockUserCourses = [
          {
            id: '1',
            progress: 75,
            completed: false,
            started_at: '2024-01-15',
            course: {
              id: '1',
              title: 'Revit Architecture 2024 - Từ cơ bản đến nâng cao',
              image_url: 'https://images.unsplash.com/photo-1581093458791-9f3c3270e8b8?w=500',
              duration: '120 giờ',
              category: 'BIM'
            }
          },
          {
            id: '2',
            progress: 100,
            completed: true,
            started_at: '2024-01-10',
            completed_at: '2024-02-20',
            course: {
              id: '2',
              title: 'AutoCAD 2024 - Vẽ kỹ thuật chuyên nghiệp',
              image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500',
              duration: '80 giờ',
              category: 'CAD'
            }
          }
        ];
        setUserCourses(mockUserCourses);
        setLoading(false);
      }, 500);
    };

    loadUserData();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đăng xuất thành công');
      navigate('/');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!user) return;
      
      await updateUserProfile(user.id, {
        full_name: profileData.full_name,
        phone: profileData.phone,
      });
      
      setEditMode(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setProfileData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
    // Update userProfile state as well
    if (userProfile) {
      setUserProfile({ ...userProfile, avatar_url: newAvatarUrl });
    }
  };

  const getCompletedCoursesCount = () => {
    return userCourses.filter(uc => uc.completed).length;
  };

  const getAverageProgress = () => {
    if (userCourses.length === 0) return 0;
    const totalProgress = userCourses.reduce((sum, uc) => sum + uc.progress, 0);
    return Math.round(totalProgress / userCourses.length);
  };

  const getTotalLearningTime = () => {
    // Mock calculation
    return '240 giờ';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
              <p className="text-gray-600">Quản lý thông tin và theo dõi tiến độ học tập</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700">
              Đăng xuất
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mb-4">
                  <AvatarUpload
                    currentAvatar={profileData.avatar_url}
                    userId={user.id}
                    userName={profileData.full_name || user.email || 'User'}
                    onAvatarUpdate={handleAvatarUpdate}
                    size="lg"
                  />
                </div>
                <CardTitle className="text-xl">
                  {profileData.full_name || 'Chưa cập nhật tên'}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <Badge variant="secondary" className="w-fit mx-auto">
                  Học viên
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                      <Input
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} size="sm" className="flex-1">
                        Lưu
                      </Button>
                      <Button onClick={() => setEditMode(false)} variant="outline" size="sm" className="flex-1">
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    {profileData.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Tham gia {new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <Button onClick={() => setEditMode(true)} size="sm" className="w-full mt-4">
                      <Settings className="w-4 h-4 mr-2" />
                      Chỉnh sửa thông tin
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Instruction Guide quick actions */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Hướng dẫn sử dụng</div>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate('/huong-dan')} size="sm" className="flex-1">
                      Xem hướng dẫn
                    </Button>
                    <Button
                      onClick={() => {
                        try {
                          localStorage.removeItem('nlc_guide_completed');
                          toast.success('Đã đặt lại trạng thái hướng dẫn');
                        } catch {}
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Đặt lại
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{userCourses.length}</div>
                    <div className="text-xs text-gray-500">Khóa học</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{getCompletedCoursesCount()}</div>
                    <div className="text-xs text-gray-500">Hoàn thành</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Thống kê học tập
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiến độ trung bình</span>
                  <span className="text-sm font-medium">{getAverageProgress()}%</span>
                </div>
                <Progress value={getAverageProgress()} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tổng thời gian học</span>
                  <span className="text-sm font-medium">{getTotalLearningTime()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Chứng chỉ đạt được</span>
                  <span className="text-sm font-medium">{getCompletedCoursesCount()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="courses" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="courses">Khóa học</TabsTrigger>
                <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
                <TabsTrigger value="achievements">Thành tích</TabsTrigger>
                <TabsTrigger value="settings">Cài đặt</TabsTrigger>
              </TabsList>

              {/* Courses Tab */}
              <TabsContent value="courses" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Khóa học của tôi</h3>
                  <Button onClick={() => navigate('/marketplace')} size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Khám phá thêm
                  </Button>
                </div>

                <div className="grid gap-4">
                  {userCourses.map((userCourse) => (
                    <Card key={userCourse.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
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
                                <div className={`text-sm font-medium ${userCourse.completed ? 'text-green-600' : 'text-blue-600'}`}>
                                  {userCourse.completed ? 'Hoàn thành' : `${userCourse.progress}%`}
                                </div>
                                {userCourse.completed && userCourse.completed_at && (
                                  <div className="text-xs text-gray-500">
                                    {new Date(userCourse.completed_at).toLocaleDateString('vi-VN')}
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
                                {userCourse.progress === 0 ? 'Bắt đầu học' : 'Tiếp tục học'}
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
                      </CardContent>
                    </Card>
                  ))}

                  {userCourses.length === 0 && (
                    <Card className="text-center py-12">
                      <CardContent>
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Chưa có khóa học nào
                        </h4>
                        <p className="text-gray-500 mb-4">
                          Khám phá marketplace để tìm khóa học phù hợp với bạn
                        </p>
                        <Button onClick={() => navigate('/marketplace')}>
                          Khám phá khóa học
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
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
                    {userCourses.filter(uc => uc.completed).length > 0 ? (
                      <div className="grid gap-4">
                        {userCourses.filter(uc => uc.completed).map((userCourse) => (
                          <div key={userCourse.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Award className="w-6 h-6 text-yellow-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{userCourse.course.title}</h4>
                                <p className="text-sm text-gray-500">
                                  Hoàn thành ngày {new Date(userCourse.completed_at).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Tải xuống
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có chứng chỉ nào</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Thành tích
                    </CardTitle>
                    <CardDescription>
                      Các thành tích bạn đã đạt được trong quá trình học tập
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Tính năng đang được phát triển</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Thông báo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Email thông báo khóa học</h4>
                            <p className="text-sm text-gray-500">Nhận thông báo về khóa học mới</p>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Nhắc nhở học tập</h4>
                            <p className="text-sm text-gray-500">Nhận nhắc nhở khi chưa học trong thời gian dài</p>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Bảo mật
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Đổi mật khẩu
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}