import React from "react";
import InstructionGuide, {
  GuideSection,
} from "../components/guide/InstructionGuide";

const InstructionPage: React.FC = () => {
  const sections: GuideSection[] = [
    {
      id: "intro",
      title: "Giới thiệu chung",
      items: [
        {
          id: "intro-1",
          title: "Mục tiêu nền tảng",
          description: "Tổng quan trang và giá trị cốt lõi.",
        },
        {
          id: "intro-2",
          title: "Cấu trúc nội dung",
          description: "Các mục Trang chủ, Khóa học, Sản phẩm, Tài nguyên.",
          to: "/gioi-thieu",
        },
      ],
    },
    {
      id: "plans",
      title: "Gói dịch vụ",
      items: [
        {
          id: "plans-1",
          title: "Free",
          description: "Truy cập cơ bản, bắt đầu nhanh.",
          to: "/goi-dich-vu",
        },
        {
          id: "plans-2",
          title: "Premium",
          description: "Nội dung nâng cao, hỗ trợ ưu tiên.",
          to: "/goi-dich-vu",
        },
        {
          id: "plans-3",
          title: "Partner",
          description: "Quyền lợi hợp tác và ưu đãi.",
          to: "/goi-dich-vu",
        },
      ],
    },
    {
      id: "payments",
      title: "Thanh toán & đăng ký",
      items: [
        {
          id: "pay-1",
          title: "Checkout",
          description: "Thanh toán qua Stripe Checkout.",
          to: "/goi-dich-vu",
        },
        {
          id: "pay-2",
          title: "Embedded",
          description: "UI nhúng Stripe trong ứng dụng.",
          to: "/goi-dich-vu",
        },
      ],
    },
    {
      id: "support",
      title: "Hỗ trợ & liên hệ",
      items: [
        {
          id: "sup-1",
          title: "Cộng đồng",
          description: "Nơi trao đổi câu hỏi, thảo luận.",
        },
        {
          id: "sup-2",
          title: "Liên hệ",
          description: "Thông tin liên hệ và phản hồi.",
        },
      ],
    },
  ];

  const STORAGE_KEY = "nlc_guide_completed";
  const completed =
    typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1";

  const markCompleted = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    window.location.reload();
  };

  const resetCompleted = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-10 flex justify-center">
      {completed ? (
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2">
            Bạn đã hoàn thành hướng dẫn
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bạn có thể xem lại bất cứ lúc nào.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={resetCompleted}
              className="underline text-blue-600"
            >
              Xem lại hướng dẫn
            </button>
          </div>
        </div>
      ) : (
        <InstructionGuide
          sections={sections}
          initiallyOpenIds={["intro", "plans"]}
          onComplete={markCompleted}
          storageKey="nlc_guide_items_done"
        />
      )}
    </div>
  );
};

export default InstructionPage;
