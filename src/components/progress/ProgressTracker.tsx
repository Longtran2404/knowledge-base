/**
 * Progress Tracker Component
 * Tracks and displays user course progress with real database integration
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  CheckCircle,
  PlayCircle,
  Clock,
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { nlcApi } from "../../lib/api/nlc-database-api";
import type { NLCEnrollment } from "../../types/database";

interface ProgressTrackerProps {
  enrollmentId?: string;
  userId?: string;
  courseId?: string;
  showDetailed?: boolean;
  onProgressUpdate?: (progress: number) => void;
}

interface EnrollmentWithCourse extends NLCEnrollment {
  course?: any; // Will be typed as NLCCourse
}

export function ProgressTracker({
  enrollmentId,
  userId,
  courseId,
  showDetailed = true,
  onProgressUpdate,
}: ProgressTrackerProps) {
  const { userProfile } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<EnrollmentWithCourse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine user ID to use
  const targetUserId = userId || userProfile?.user_id;

  // Load enrollment data
  useEffect(() => {
    const loadData = async () => {
      if (!targetUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        if (enrollmentId) {
          // Load specific enrollment (if we had this API)
          // For now, we'll use the courseId approach
          if (courseId) {
            const response = await nlcApi.enrollments.getEnrollment(
              targetUserId,
              courseId
            );
            if (response.success && response.data) {
              setSelectedEnrollment(response.data as EnrollmentWithCourse);
              setEnrollments([response.data as EnrollmentWithCourse]);
            }
          }
        } else if (courseId) {
          // Load specific course enrollment
          const response = await nlcApi.enrollments.getEnrollment(
            targetUserId,
            courseId
          );
          if (response.success && response.data) {
            setSelectedEnrollment(response.data as EnrollmentWithCourse);
            setEnrollments([response.data as EnrollmentWithCourse]);
          }
        } else {
          // Load all user enrollments
          const response = await nlcApi.enrollments.getUserEnrollments(
            targetUserId
          );
          if (response.success && response.data) {
            const enrollmentsData = response.data as EnrollmentWithCourse[];
            setEnrollments(enrollmentsData);
            if (enrollmentsData.length > 0) {
              setSelectedEnrollment(enrollmentsData[0]);
            }
          }
        }
      } catch (error: any) {
        console.error("Error loading progress data:", error);
        setError("Không thể tải dữ liệu tiến độ học tập");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [targetUserId, enrollmentId, courseId]);

  // Update progress
  const updateProgress = async (
    newProgress: number,
    currentLesson?: number,
    timeSpent?: number
  ) => {
    if (!selectedEnrollment || !targetUserId) return;

    try {
      const response = await nlcApi.enrollments.updateProgress(
        targetUserId,
        selectedEnrollment.enrolled_course_id,
        newProgress,
        currentLesson,
        timeSpent
      );

      if (response.success && response.data) {
        setSelectedEnrollment(response.data as EnrollmentWithCourse);
        onProgressUpdate?.(newProgress);

        // Log progress update
        if (userProfile) {
          await nlcApi.activityLog.logActivity(
            userProfile.user_id,
            userProfile.email,
            userProfile.account_role,
            "course_start",
            `Progress updated to ${newProgress}% for course`,
            {
              resourceType: "course",
              resourceId: selectedEnrollment.enrolled_course_id,
              metadata: {
                progress_percent: newProgress,
                current_lesson: currentLesson,
                time_spent: timeSpent,
              },
            }
          );
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      setError("Không thể cập nhật tiến độ học tập");
    }
  };

  // Format time spent
  const formatTimeSpent = (minutes: number): string => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Calculate completion status
  const getCompletionStatus = (progress: number) => {
    if (progress >= 100)
      return { status: "completed", color: "green", icon: Trophy };
    if (progress >= 75)
      return { status: "almost", color: "blue", icon: Target };
    if (progress >= 25)
      return { status: "progress", color: "yellow", icon: TrendingUp };
    return { status: "started", color: "gray", icon: PlayCircle };
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Đang tải tiến độ học tập...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (enrollments.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chưa có khóa học nào được đăng ký</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Selection (if multiple enrollments) */}
      {enrollments.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Khóa học của bạn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {enrollments.map((enrollment) => {
                const completionStatus = getCompletionStatus(
                  enrollment.progress_percent
                );
                const StatusIcon = completionStatus.icon;

                return (
                  <div
                    key={enrollment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedEnrollment?.id === enrollment.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedEnrollment(enrollment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon
                          className={`w-5 h-5 text-${completionStatus.color}-500`}
                        />
                        <div>
                          <h4 className="font-medium">
                            {enrollment.course?.title || "Khóa học"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {enrollment.progress_percent}% hoàn thành
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          enrollment.is_completed ? "default" : "outline"
                        }
                        className={`text-${completionStatus.color}-600`}
                      >
                        {enrollment.is_completed
                          ? "Hoàn thành"
                          : `${enrollment.progress_percent}%`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Progress View */}
      {selectedEnrollment && showDetailed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Tiến độ học tập
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Info */}
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {selectedEnrollment.course?.title || "Khóa học"}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Đăng ký: {formatDate(selectedEnrollment.enrolled_at)}
                </span>
                {selectedEnrollment.started_at && (
                  <span>
                    Bắt đầu: {formatDate(selectedEnrollment.started_at)}
                  </span>
                )}
                {selectedEnrollment.completed_at && (
                  <span className="text-green-600">
                    Hoàn thành: {formatDate(selectedEnrollment.completed_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tiến độ tổng thể</span>
                <span className="text-sm font-semibold">
                  {selectedEnrollment.progress_percent}%
                </span>
              </div>
              <Progress
                value={selectedEnrollment.progress_percent}
                className="h-3"
              />
              {selectedEnrollment.is_completed && (
                <div className="flex items-center gap-2 mt-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Đã hoàn thành khóa học!
                  </span>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <PlayCircle className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <div className="text-sm text-gray-600">Bài học hiện tại</div>
                <div className="font-semibold">
                  {selectedEnrollment.current_lesson || 1}
                </div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                <div className="text-sm text-gray-600">Thời gian học</div>
                <div className="font-semibold">
                  {formatTimeSpent(selectedEnrollment.total_time_spent)}
                </div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <div className="text-sm text-gray-600">Truy cập cuối</div>
                <div className="font-semibold text-xs">
                  {formatDate(selectedEnrollment.last_accessed_at)}
                </div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Target className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <div className="text-sm text-gray-600">Loại đăng ký</div>
                <div className="font-semibold capitalize">
                  {selectedEnrollment.enrollment_type === "free"
                    ? "Miễn phí"
                    : selectedEnrollment.enrollment_type === "paid"
                    ? "Trả phí"
                    : "Cấp quyền"}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                variant={
                  selectedEnrollment.is_completed ? "outline" : "default"
                }
              >
                {selectedEnrollment.is_completed
                  ? "Ôn tập lại"
                  : "Tiếp tục học"}
              </Button>

              {selectedEnrollment.progress_percent > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Demo: Simulate progress update
                    const newProgress = Math.min(
                      100,
                      selectedEnrollment.progress_percent + 10
                    );
                    updateProgress(
                      newProgress,
                      (selectedEnrollment.current_lesson || 1) + 1
                    );
                  }}
                >
                  Cập nhật tiến độ
                </Button>
              )}
            </div>

            {/* Payment Info (if paid course) */}
            {selectedEnrollment.enrollment_type === "paid" &&
              selectedEnrollment.paid_amount && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Đã thanh toán:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(selectedEnrollment.paid_amount)}
                    </span>
                  </div>
                  {selectedEnrollment.payment_reference && (
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600">Mã giao dịch:</span>
                      <span className="font-mono text-xs">
                        {selectedEnrollment.payment_reference}
                      </span>
                    </div>
                  )}
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Summary Card (for compact view) */}
      {!showDetailed && selectedEnrollment && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-500" />
                <div>
                  <h4 className="font-medium">
                    {selectedEnrollment.course?.title || "Khóa học"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatTimeSpent(selectedEnrollment.total_time_spent)} đã
                    học
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">
                  {selectedEnrollment.progress_percent}%
                </div>
                <Badge
                  variant={
                    selectedEnrollment.is_completed ? "default" : "outline"
                  }
                >
                  {selectedEnrollment.is_completed ? "Hoàn thành" : "Đang học"}
                </Badge>
              </div>
            </div>
            <Progress
              value={selectedEnrollment.progress_percent}
              className="mt-3"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
