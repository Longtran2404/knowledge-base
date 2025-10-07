/**
 * Course Enrollment Component
 * Handles course enrollment process with real database integration
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Loader2,
  CheckCircle,
  PlayCircle,
  Clock,
  Users,
  Star,
} from "lucide-react";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { nlcApi } from "../../lib/api/nlc-database-api";
import type { NLCCourse, NLCEnrollment } from "../../types/database";

interface CourseEnrollmentProps {
  course: NLCCourse;
  onEnrollmentChange?: (enrolled: boolean) => void;
}

export function CourseEnrollment({
  course,
  onEnrollmentChange,
}: CourseEnrollmentProps) {
  const { user, userProfile, isAuthenticated } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<NLCEnrollment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!isAuthenticated || !user || !userProfile) return;

      setIsLoading(true);
      try {
        const enrolledResponse = await nlcApi.enrollments.isEnrolled(
          userProfile.user_id,
          course.id
        );

        if (enrolledResponse.success && enrolledResponse.data) {
          setIsEnrolled(true);

          // Get enrollment details
          const enrollmentResponse = await nlcApi.enrollments.getEnrollment(
            userProfile.user_id,
            course.id
          );

          if (enrollmentResponse.success && enrollmentResponse.data) {
            setEnrollment(enrollmentResponse.data);
          }
        } else {
          setIsEnrolled(false);
          setEnrollment(null);
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
        setError("Không thể kiểm tra trạng thái đăng ký");
      } finally {
        setIsLoading(false);
      }
    };

    checkEnrollment();
  }, [isAuthenticated, user, userProfile, course.id]);

  // Handle enrollment
  const handleEnrollment = async () => {
    if (!isAuthenticated || !user || !userProfile) {
      setError("Vui lòng đăng nhập để đăng ký khóa học");
      return;
    }

    setIsEnrolling(true);
    setError(null);

    try {
      const enrollmentType = course.course_price > 0 ? "paid" : "free";

      const enrollmentData = {
        student_user_id: userProfile.user_id,
        enrolled_course_id: course.id,
        enrollment_type: enrollmentType as any,
        paid_amount: course.course_price > 0 ? course.course_price : undefined,
      };

      const response = await nlcApi.enrollments.enrollInCourse(
        userProfile.user_id,
        course.id,
        enrollmentType as any
      );

      if (response.success && response.data) {
        setIsEnrolled(true);
        setEnrollment(response.data);
        onEnrollmentChange?.(true);

        // Log enrollment activity
        await nlcApi.activityLog.logActivity(
          userProfile.user_id,
          userProfile.email,
          userProfile.account_role,
          "course_enroll",
          `Enrolled in course: ${course.title}`,
          {
            resourceType: "course",
            resourceId: course.id,
            metadata: {
              course_title: course.title,
              enrollment_type: enrollmentType,
              price: course.course_price,
            },
          }
        );
      } else {
        throw new Error(response.error || "Không thể đăng ký khóa học");
      }
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      setError(error.message || "Có lỗi xảy ra khi đăng ký khóa học");
    } finally {
      setIsEnrolling(false);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Format duration
  const formatDuration = (hours?: number) => {
    if (!hours) return "Chưa xác định";
    return `${hours} giờ`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-blue-600" />
          Đăng ký khóa học
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{course.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Badge variant="outline">{course.course_level}</Badge>
            <Badge variant="outline">{course.course_category}</Badge>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{formatDuration(course.duration_hours)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{course.enrollment_count} học viên</span>
          </div>
          {course.avg_rating && course.avg_rating > 0 && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>
                {course.avg_rating}/5 ({course.review_count} đánh giá)
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {formatPrice(course.course_price)}
            </span>
            {course.original_price &&
              course.original_price > course.course_price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(course.original_price)}
                </span>
              )}
          </div>
        </div>

        {/* Enrollment Status & Actions */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Đang kiểm tra...</span>
          </div>
        ) : isEnrolled && enrollment ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Đã đăng ký</span>
            </div>

            {/* Progress Info */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ:</span>
                <span className="font-medium">
                  {enrollment.progress_percent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${enrollment.progress_percent}%` }}
                />
              </div>
              {enrollment.is_completed && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Đã hoàn thành</span>
                </div>
              )}
            </div>

            {/* Study Actions */}
            <div className="space-y-2">
              <Button
                className="w-full"
                variant={enrollment.is_completed ? "outline" : "default"}
              >
                {enrollment.is_completed ? "Ôn tập" : "Tiếp tục học"}
              </Button>
              {enrollment.last_accessed_at && (
                <p className="text-xs text-gray-500 text-center">
                  Lần truy cập cuối:{" "}
                  {new Date(enrollment.last_accessed_at).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {!isAuthenticated ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Vui lòng đăng nhập để đăng ký khóa học
                </p>
                <Button variant="outline" className="w-full">
                  Đăng nhập
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleEnrollment}
                disabled={isEnrolling}
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang đăng ký...
                  </>
                ) : course.course_price > 0 ? (
                  "Mua khóa học"
                ) : (
                  "Đăng ký miễn phí"
                )}
              </Button>
            )}
          </div>
        )}

        {/* Course Features */}
        {course.learning_outcomes && course.learning_outcomes.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">Bạn sẽ học được:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {course.learning_outcomes.slice(0, 3).map((outcome, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-1 text-green-500 flex-shrink-0" />
                  <span>{outcome}</span>
                </li>
              ))}
              {course.learning_outcomes.length > 3 && (
                <li className="text-xs text-gray-500">
                  +{course.learning_outcomes.length - 3} kỹ năng khác...
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
