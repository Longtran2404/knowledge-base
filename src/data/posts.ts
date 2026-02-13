import { Post } from "../types/post";

export const postsData: Post[] = [
  {
    id: "post-01",
    slug: "knowledge-base-ra-mat",
    title: "Knowledge Base chính thức ra mắt",
    excerpt:
      "Nền tảng học thuật & automation hàng đầu dành cho kỹ sư xây dựng Việt Nam. Khám phá hành trình mới trong giáo dục công nghệ xây dựng.",
    category: "Company",
    thumbnail: "/images/placeholder.svg",
    tags: ["Company", "Launch", "Education"],
    createdAt: "2025-08-15T00:00:00.000Z",
  },
  {
    id: "post-02",
    slug: "xu-huong-bim-2025",
    title: "Xu hướng BIM trong Xây dựng Việt Nam 2025",
    excerpt:
      "Phân tích xu hướng ứng dụng BIM tại Việt Nam, từ các dự án lớn đến các công ty vừa và nhỏ. Cơ hội và thách thức trong thời đại số.",
    category: "Technology",
    thumbnail: "/images/placeholder.svg",
    tags: ["BIM", "Trends", "Vietnam"],
    createdAt: "2025-08-10T00:00:00.000Z",
  },
  {
    id: "post-03",
    slug: "huong-dan-revit-2025",
    title: "Hướng dẫn Revit Architecture 2025 cho người mới bắt đầu",
    excerpt:
      "Series bài viết chi tiết về Revit Architecture 2025, từ cài đặt đến các kỹ thuật modeling nâng cao. Phù hợp cho kỹ sư và sinh viên.",
    category: "Tutorial",
    thumbnail: "/images/placeholder.svg",
    tags: ["Revit", "Tutorial", "Architecture"],
    createdAt: "2025-08-05T00:00:00.000Z",
  },
  {
    id: "post-04",
    slug: "case-study-nha-o-xanh",
    title: "Case Study: Thiết kế Nhà ở Xanh 200m²",
    excerpt:
      "Phân tích chi tiết quy trình thiết kế nhà ở xanh từ concept đến execution. Bao gồm BIM workflow, sustainable design và cost optimization.",
    category: "Case Study",
    thumbnail: "/images/placeholder.svg",
    tags: ["Green Building", "Case Study", "BIM"],
    createdAt: "2025-07-28T00:00:00.000Z",
  },
  {
    id: "post-05",
    slug: "automation-xay-dung",
    title: "Automation trong Xây dựng: Tương lai đã đến",
    excerpt:
      "Khám phá các công nghệ automation đang thay đổi ngành xây dựng: từ 3D printing đến robotics, AI và IoT trong construction management.",
    category: "Technology",
    thumbnail: "/images/placeholder.svg",
    tags: ["Automation", "Technology", "Future"],
    createdAt: "2025-07-20T00:00:00.000Z",
  },
];
