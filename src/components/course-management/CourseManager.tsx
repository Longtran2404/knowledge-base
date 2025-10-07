/**
 * Course Manager Component
 * Quản lý khóa học và video content
 */

import React, { useState, useEffect } from "react";
import { Plus, Video, FileText, Play, Edit, Trash, Upload, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { StorageService } from "../../lib/storage/storage-service";
import { toast } from "react-hot-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  isPublished: boolean;
  duration: number; // in minutes
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  videoFileName?: string;
  duration: number; // in seconds
  order: number;
  materials: CourseMaterial[];
  isPublished: boolean;
}

interface CourseMaterial {
  id: string;
  lessonId: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  filePath: string;
  bucketName: string;
  uploadedAt: string;
}

interface UploadProgress {
  [key: string]: number;
}

export default function CourseManager() {
  const { user, userProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [activeTab, setActiveTab] = useState("courses");

  // New course form
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    level: "beginner" as const,
    category: ""
  });

  // New lesson form
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    order: 1
  });

  // Load courses (mock data for now)
  useEffect(() => {
    const loadCourses = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // TODO: Replace with actual API call when database is ready
        const mockCourses: Course[] = [
          {
            id: "1",
            title: "Khóa học React cơ bản",
            description: "Học React từ đầu cho người mới bắt đầu",
            level: "beginner",
            category: "Web Development",
            isPublished: true,
            duration: 480, // 8 hours
            lessons: [
              {
                id: "1",
                courseId: "1",
                title: "Giới thiệu về React",
                description: "Tìm hiểu về React và ecosystem",
                duration: 1800, // 30 minutes
                order: 1,
                materials: [],
                isPublished: true
              }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        setCourses(mockCourses);
      } catch (error) {
        console.error("Error loading courses:", error);
        toast.error("Không thể tải danh sách khóa học");
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [user]);

  // Create new course
  const handleCreateCourse = async () => {
    if (!user) return;

    try {
      const course: Course = {
        id: `course-${Date.now()}`,
        ...newCourse,
        isPublished: false,
        duration: 0,
        lessons: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCourses(prev => [course, ...prev]);
      setNewCourse({ title: "", description: "", level: "beginner", category: "" });
      setShowCreateCourse(false);
      toast.success("Tạo khóa học thành công");

      // TODO: Save to database when schema is ready
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Không thể tạo khóa học");
    }
  };

  // Create new lesson
  const handleCreateLesson = async () => {
    if (!selectedCourse || !user) return;

    try {
      const lesson: Lesson = {
        id: `lesson-${Date.now()}`,
        courseId: selectedCourse.id,
        ...newLesson,
        duration: 0,
        materials: [],
        isPublished: false
      };

      const updatedCourse = {
        ...selectedCourse,
        lessons: [...selectedCourse.lessons, lesson]
      };

      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? updatedCourse : c));
      setSelectedCourse(updatedCourse);
      setNewLesson({ title: "", description: "", order: selectedCourse.lessons.length + 1 });
      setShowCreateLesson(false);
      toast.success("Tạo bài học thành công");

      // TODO: Save to database when schema is ready
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("Không thể tạo bài học");
    }
  };

  // Handle video upload
  const handleVideoUpload = async (file: File, lessonId: string) => {
    if (!user) return;

    const uploadId = `video-${lessonId}-${Date.now()}`;

    try {
      // Validate video file
      if (!file.type.startsWith('video/')) {
        toast.error("Vui lòng chọn file video");
        return;
      }

      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast.error("File video quá lớn (tối đa 500MB)");
        return;
      }

      setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

      // Create file path
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `courses/${selectedCourse?.id}/${lessonId}/${timestamp}.${fileExtension}`;

      // Upload to course-videos bucket
      const result = await StorageService.uploadFile(file, "course-videos", fileName, {
        cacheControl: "3600",
        upsert: false
      });

      if (result.success) {
        // Get video URL
        const videoUrl = StorageService.getPublicUrl("course-videos", fileName);

        // Update lesson with video info
        if (selectedCourse) {
          const updatedCourse = {
            ...selectedCourse,
            lessons: selectedCourse.lessons.map(lesson =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    videoUrl,
                    videoFileName: file.name
                  }
                : lesson
            )
          };

          setCourses(prev => prev.map(c => c.id === selectedCourse.id ? updatedCourse : c));
          setSelectedCourse(updatedCourse);
        }

        setUploadProgress(prev => ({ ...prev, [uploadId]: 100 }));
        toast.success("Upload video thành công");

        // TODO: Save to database when schema is ready
      } else {
        toast.error(`Upload thất bại: ${result.error}`);
      }
    } catch (error) {
      console.error("Video upload error:", error);
      toast.error("Lỗi upload video");
    } finally {
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[uploadId];
          return newProgress;
        });
      }, 2000);
    }
  };

  // Handle material upload
  const handleMaterialUpload = async (files: FileList, lessonId: string) => {
    if (!user || !selectedCourse) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadId = `material-${lessonId}-${Date.now()}-${i}`;

      try {
        setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

        // Create file path
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `courses/${selectedCourse.id}/${lessonId}/materials/${timestamp}-${i}.${fileExtension}`;

        // Upload to course-materials bucket
        const result = await StorageService.uploadFile(file, "course-materials", fileName, {
          cacheControl: "3600",
          upsert: false
        });

        if (result.success) {
          // Create material record
          const material: CourseMaterial = {
            id: `material-${Date.now()}-${i}`,
            lessonId,
            name: fileName,
            originalName: file.name,
            type: file.type,
            size: file.size,
            filePath: fileName,
            bucketName: "course-materials",
            uploadedAt: new Date().toISOString()
          };

          // Update lesson with material
          const updatedCourse = {
            ...selectedCourse,
            lessons: selectedCourse.lessons.map(lesson =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    materials: [...lesson.materials, material]
                  }
                : lesson
            )
          };

          setCourses(prev => prev.map(c => c.id === selectedCourse.id ? updatedCourse : c));
          setSelectedCourse(updatedCourse);
          setUploadProgress(prev => ({ ...prev, [uploadId]: 100 }));
          toast.success(`Upload thành công: ${file.name}`);

          // TODO: Save to database when schema is ready
        } else {
          toast.error(`Upload thất bại: ${result.error}`);
        }
      } catch (error) {
        console.error("Material upload error:", error);
        toast.error(`Lỗi upload: ${file.name}`);
      } finally {
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[uploadId];
            return newProgress;
          });
        }, 2000);
      }
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Vui lòng đăng nhập để quản lý khóa học</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Khóa học</h1>
          <p className="text-gray-600">Tạo và quản lý khóa học với video content</p>
        </div>
        <Button onClick={() => setShowCreateCourse(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tạo khóa học mới
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">Khóa học</TabsTrigger>
          <TabsTrigger value="lessons" disabled={!selectedCourse}>
            Bài học {selectedCourse && `(${selectedCourse.title})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <BookOpen className="w-8 h-8 text-blue-500" />
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? "Đã xuất bản" : "Bản nháp"}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Cấp độ:</span>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Bài học:</span>
                        <span>{course.lessons.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Thời lượng:</span>
                        <span>{formatDuration(course.duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveTab("lessons");
                        }}
                        className="flex-1"
                      >
                        Quản lý bài học
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          {selectedCourse && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedCourse.title}</h2>
                  <p className="text-gray-600">{selectedCourse.lessons.length} bài học</p>
                </div>
                <Button onClick={() => setShowCreateLesson(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm bài học
                </Button>
              </div>

              <div className="space-y-4">
                {selectedCourse.lessons.map((lesson, index) => (
                  <Card key={lesson.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">{lesson.order}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{lesson.title}</h3>
                            <p className="text-gray-600 text-sm">{lesson.description}</p>
                          </div>
                        </div>
                        <Badge variant={lesson.isPublished ? "default" : "secondary"}>
                          {lesson.isPublished ? "Đã xuất bản" : "Bản nháp"}
                        </Badge>
                      </div>

                      {/* Video Section */}
                      <div className="border rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Video bài học
                          </h4>
                          <input
                            type="file"
                            accept="video/*"
                            id={`video-${lesson.id}`}
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleVideoUpload(e.target.files[0], lesson.id);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById(`video-${lesson.id}`)?.click()}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload Video
                          </Button>
                        </div>

                        {lesson.videoUrl ? (
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <Play className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                              <p className="font-medium text-green-800">{lesson.videoFileName}</p>
                              <p className="text-green-600 text-sm">Video đã sẵn sàng</p>
                            </div>
                            <Button size="sm" variant="outline">
                              Xem
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Chưa có video cho bài học này</p>
                          </div>
                        )}
                      </div>

                      {/* Materials Section */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Tài liệu ({lesson.materials.length})
                          </h4>
                          <input
                            type="file"
                            multiple
                            id={`materials-${lesson.id}`}
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleMaterialUpload(e.target.files, lesson.id);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById(`materials-${lesson.id}`)?.click()}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload Tài liệu
                          </Button>
                        </div>

                        {lesson.materials.length > 0 ? (
                          <div className="space-y-2">
                            {lesson.materials.map((material) => (
                              <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">{material.originalName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {Math.round(material.size / 1024)} KB
                                  </span>
                                  <Button size="sm" variant="ghost">
                                    <Trash className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <p className="text-sm">Chưa có tài liệu</p>
                          </div>
                        )}
                      </div>

                      {/* Upload Progress */}
                      {Object.entries(uploadProgress).some(([key]) => key.includes(lesson.id)) && (
                        <div className="mt-4 space-y-2">
                          {Object.entries(uploadProgress)
                            .filter(([key]) => key.includes(lesson.id))
                            .map(([fileId, progress]) => (
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
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Course Dialog */}
      <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo khóa học mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="course-title">Tiêu đề khóa học</Label>
              <Input
                id="course-title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="Nhập tiêu đề khóa học"
              />
            </div>
            <div>
              <Label htmlFor="course-description">Mô tả</Label>
              <Textarea
                id="course-description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Mô tả khóa học"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="course-level">Cấp độ</Label>
              <Select
                value={newCourse.level}
                onValueChange={(value: any) => setNewCourse({ ...newCourse, level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Cơ bản</SelectItem>
                  <SelectItem value="intermediate">Trung cấp</SelectItem>
                  <SelectItem value="advanced">Nâng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="course-category">Danh mục</Label>
              <Input
                id="course-category"
                value={newCourse.category}
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                placeholder="Ví dụ: Web Development, Mobile App..."
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateCourse(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateCourse}>
                Tạo khóa học
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog open={showCreateLesson} onOpenChange={setShowCreateLesson}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm bài học mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Tiêu đề bài học</Label>
              <Input
                id="lesson-title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                placeholder="Nhập tiêu đề bài học"
              />
            </div>
            <div>
              <Label htmlFor="lesson-description">Mô tả</Label>
              <Textarea
                id="lesson-description"
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                placeholder="Mô tả nội dung bài học"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="lesson-order">Thứ tự</Label>
              <Input
                id="lesson-order"
                type="number"
                min="1"
                value={newLesson.order}
                onChange={(e) => setNewLesson({ ...newLesson, order: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateLesson(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateLesson}>
                Tạo bài học
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}