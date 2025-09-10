import { SpotlightItem } from "@/types/spotlight";

export const spotlightData: SpotlightItem[] = [
  {
    id: "s1",
    refType: "course",
    refId: "c-bim-001",
    title: "Khóa học BIM Automation cho Kỹ sư XDDD",
    subtitle: "Học tư duy workflow + tool tự động",
    ctaLabel: "Tham gia ngay",
    ctaHref: "/khoa-hoc/bim-automation",
    image: "/images/spotlight-bim.jpg",
    pinned: true,
    isHot: true,
    priority: 10,
    createdAt: "2025-08-10T00:00:00.000Z"
  },
  {
    id: "s2",
    refType: "product",
    refId: "p-tool-001",
    title: "Ra mắt AutoCAD Cleaner Tool 2.0",
    subtitle: "Công cụ dọn dẹp và tối ưu file AutoCAD",
    ctaLabel: "Khám phá ngay",
    ctaHref: "/san-pham/autocad-cleaner",
    image: "/images/spotlight-tool.jpg",
    pinned: false,
    isHot: true,
    priority: 8,
    createdAt: "2025-08-05T00:00:00.000Z"
  },
  {
    id: "s3",
    refType: "collab",
    refId: "collab-001",
    title: "Hợp tác với các trường Đại học hàng đầu",
    subtitle: "Chương trình đào tạo chuyên sâu BIM & Construction Tech",
    ctaLabel: "Liên hệ hợp tác",
    ctaHref: "/hop-tac",
    image: "/images/spotlight-collab.jpg",
    pinned: false,
    isHot: false,
    priority: 5,
    createdAt: "2025-08-01T00:00:00.000Z"
  }
];