import { Resource } from "@/types/resource";

export const resourcesData: Resource[] = [
  {
    id: "r-pdf-001",
    slug: "tieu-chuan-bim-2025",
    title: "Tiêu chuẩn BIM Việt Nam 2025",
    type: "pdf",
    access: "free",
    domain: "BIM",
    year: 2025,
    tags: ["BIM", "Standard", "Vietnam"],
    thumbnail: "/images/resources/bim-std.jpg",
    createdAt: "2025-08-05T00:00:00.000Z"
  },
  {
    id: "r-guide-001",
    slug: "huong-dan-revit-architecture",
    title: "Hướng dẫn Revit Architecture từ A-Z",
    type: "guide",
    access: "member",
    domain: "BIM",
    year: 2025,
    tags: ["Revit", "Architecture", "Tutorial"],
    thumbnail: "/images/resources/revit-guide.jpg",
    createdAt: "2025-07-25T00:00:00.000Z"
  },
  {
    id: "r-project-001",
    slug: "do-an-nha-o-xanh",
    title: "Đồ án: Thiết kế Nhà ở Xanh 200m²",
    type: "project",
    access: "paid",
    domain: "Green Architecture",
    year: 2025,
    tags: ["Green Design", "Residential", "Architecture"],
    thumbnail: "/images/resources/green-house.jpg",
    createdAt: "2025-07-10T00:00:00.000Z"
  },
  {
    id: "r-doc-001",
    slug: "quy-trinh-quan-ly-chat-luong",
    title: "Quy trình Quản lý Chất lượng Xây dựng",
    type: "doc",
    access: "free",
    domain: "Quality Management",
    year: 2025,
    tags: ["QM", "Process", "Construction"],
    thumbnail: "/images/resources/qm-process.jpg",
    createdAt: "2025-06-30T00:00:00.000Z"
  },
  {
    id: "r-pdf-002",
    slug: "bang-don-gia-xay-dung-2025",
    title: "Bảng Đơn giá Xây dựng 2025",
    type: "pdf",
    access: "member",
    domain: "Cost Estimation",
    year: 2025,
    tags: ["Cost", "Pricing", "Estimation"],
    thumbnail: "/images/resources/price-list.jpg",
    createdAt: "2025-06-15T00:00:00.000Z"
  },
  {
    id: "r-project-002",
    slug: "do-an-cau-be-tong-cot-thep",
    title: "Đồ án: Thiết kế Cầu Bê tông Cốt thép",
    type: "project",
    access: "paid",
    domain: "Bridge Design",
    year: 2025,
    tags: ["Bridge", "Concrete", "Structural"],
    thumbnail: "/images/resources/bridge-design.jpg",
    createdAt: "2025-05-20T00:00:00.000Z"
  }
];