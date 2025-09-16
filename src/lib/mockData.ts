// Mock data for development and testing
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  publishedAt: string;
  tags: string[];
  image: string;
  readTime: number;
  views: number;
  likes: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // in hours
  students: number;
  rating: number;
  image: string;
  category: string;
  field: string;
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  isHot: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  isHot: boolean;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "template" | "tool";
  access: "free" | "premium" | "pro";
  category: string;
  image: string;
  downloadCount: number;
  fileSize: string;
  tags: string[];
  isFeatured: boolean;
}

export interface SpotlightItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  isActive: boolean;
  link: string;
  buttonText: string;
}

// Mock data arrays
export const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Hướng dẫn học lập trình web từ cơ bản",
    excerpt: "Bài viết hướng dẫn chi tiết cách bắt đầu học lập trình web...",
    content: "Nội dung đầy đủ...",
    author: "Nguyễn Văn A",
    category: "Tutorial",
    publishedAt: "2024-01-15",
    tags: ["lập trình", "web", "hướng dẫn"],
    image: "/images/blog-1.jpg",
    readTime: 5,
    views: 1250,
    likes: 89,
  },
];

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Lập trình React từ A-Z",
    description: "Khóa học toàn diện về React...",
    instructor: "Nguyễn Văn A",
    price: 299000,
    originalPrice: 599000,
    level: "beginner",
    duration: 40,
    students: 1250,
    rating: 4.8,
    image: "/images/course-1.jpg",
    category: "Lập trình",
    field: "Programming",
    tags: ["react", "javascript", "frontend"],
    isFeatured: true,
    isNew: false,
    isHot: true,
    createdAt: "2024-01-01",
  },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Template Website Bán Hàng",
    description: "Template chuyên nghiệp cho website bán hàng...",
    price: 199000,
    originalPrice: 399000,
    category: "Template",
    image: "/images/product-1.jpg",
    rating: 4.9,
    reviews: 156,
    inStock: true,
    tags: ["template", "ecommerce", "responsive"],
    isFeatured: true,
    isNew: true,
    isHot: false,
  },
];

export const mockResources: Resource[] = [
  {
    id: "1",
    title: "Ebook Lập trình JavaScript",
    description: "Tài liệu học JavaScript từ cơ bản đến nâng cao...",
    type: "pdf",
    access: "free",
    category: "Tài liệu",
    image: "/images/resource-1.jpg",
    downloadCount: 2500,
    fileSize: "2.5 MB",
    tags: ["javascript", "ebook", "tài liệu"],
    isFeatured: true,
  },
];

export const mockSpotlightItems: SpotlightItem[] = [
  {
    id: "1",
    title: "Khóa học lập trình miễn phí",
    description: "Tham gia ngay khóa học lập trình web miễn phí",
    image: "/images/spotlight-1.jpg",
    category: "Khóa học",
    isActive: true,
    link: "/courses",
    buttonText: "Xem ngay",
  },
];
