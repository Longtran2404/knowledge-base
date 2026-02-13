import React from "react";

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
            <span className="text-3xl">💎</span>
          </div>
          <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Gói dịch vụ
          </h1>
          <p className="text-center text-muted-foreground text-lg leading-relaxed">
            Trang gói dịch vụ hiện đang được cập nhật với nhiều ưu đãi hấp dẫn.
            Vui lòng quay lại sau để khám phá các gói dịch vụ tuyệt vời của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

