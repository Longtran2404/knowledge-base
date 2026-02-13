import { Course } from "../types/course";
import { nlcApi } from "../lib/api/nlc-database-api";
import type { NLCCourse } from "../types/database";

// Convert NLCCourse to legacy Course format for compatibility
function convertNLCCourseToLegacyCourse(nlcCourse: NLCCourse): Course {
  return {
    id: nlcCourse.id,
    slug: nlcCourse.course_slug,
    title: nlcCourse.title,
    level:
      nlcCourse.course_level === "Cơ bản"
        ? "Beginner"
        : nlcCourse.course_level === "Trung cấp"
        ? "Intermediate"
        : "Advanced",
    domain: nlcCourse.course_category,
    year: new Date(nlcCourse.created_at).getFullYear(),
    tags: nlcCourse.course_tags || [],
    ratingAvg: nlcCourse.avg_rating || 0,
    ratingCount: nlcCourse.review_count,
    thumbnail:
      nlcCourse.thumbnail_url ||
      nlcCourse.course_image_url ||
      "/images/placeholder.svg",
    price: nlcCourse.course_price,
    isHot: nlcCourse.is_featured,
    createdAt: nlcCourse.created_at,
  };
}

// Legacy mock data as fallback
const fallbackCoursesData: Course[] = [
  {
    id: "c-react-001",
    slug: "react-co-ban-2024",
    title: "React.js Cơ bản 2024",
    level: "Beginner",
    domain: "Lập trình",
    year: 2024,
    tags: ["React", "JavaScript", "Frontend"],
    ratingAvg: 4.8,
    ratingCount: 121,
    thumbnail: "/images/placeholder.svg",
    price: 299000,
    isHot: true,
    createdAt: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "c-node-002",
    slug: "nodejs-backend-api",
    title: "Node.js Backend Development",
    level: "Intermediate",
    domain: "Lập trình",
    year: 2024,
    tags: ["Node.js", "Express", "API", "Backend"],
    ratingAvg: 4.6,
    ratingCount: 86,
    thumbnail: "/images/placeholder.svg",
    price: 399000,
    createdAt: "2024-11-15T00:00:00.000Z",
  },
  {
    id: "c-fullstack-003",
    slug: "fullstack-javascript",
    title: "Full-stack JavaScript",
    level: "Advanced",
    domain: "Lập trình",
    year: 2024,
    tags: ["Full-stack", "React", "Node.js", "MongoDB"],
    ratingAvg: 4.9,
    ratingCount: 203,
    thumbnail: "/images/placeholder.svg",
    price: 599000,
    isHot: true,
    createdAt: "2024-10-20T00:00:00.000Z",
  },
];

// Main function to get courses data
export async function getCoursesData(): Promise<Course[]> {
  try {
    const response = await nlcApi.courses.getCourses();

    if (response.success && response.data) {
      // Convert NLC courses to legacy format
      return response.data.map(convertNLCCourseToLegacyCourse);
    } else {
      console.warn("Failed to load courses from database, using fallback data");
      return fallbackCoursesData;
    }
  } catch (error) {
    console.error("Error loading courses from database:", error);
    return fallbackCoursesData;
  }
}

// Export coursesData for immediate use (synchronous fallback)
export const coursesData: Course[] = fallbackCoursesData;

// Export function to get featured courses
export async function getFeaturedCoursesData(): Promise<Course[]> {
  try {
    const response = await nlcApi.courses.getFeaturedCourses();

    if (response.success && response.data) {
      return response.data.map(convertNLCCourseToLegacyCourse);
    } else {
      // Return featured courses from fallback
      return fallbackCoursesData.filter((course) => course.isHot);
    }
  } catch (error) {
    console.error("Error loading featured courses:", error);
    return fallbackCoursesData.filter((course) => course.isHot);
  }
}

// Export function to get course by slug
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const response = await nlcApi.courses.getCourseBySlug(slug);

    if (response.success && response.data) {
      return convertNLCCourseToLegacyCourse(response.data);
    } else {
      // Fallback to mock data
      return fallbackCoursesData.find((course) => course.slug === slug) || null;
    }
  } catch (error) {
    console.error("Error loading course by slug:", error);
    return fallbackCoursesData.find((course) => course.slug === slug) || null;
  }
}
