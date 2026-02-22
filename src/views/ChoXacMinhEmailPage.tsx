import React, { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase-config";

const ChoXacMinhEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const emailFromState =
    (location.state as { email?: string } | null)?.email ||
    searchParams.get("email") ||
    "";

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleResend = async () => {
    const email = emailFromState.trim();
    if (!email) {
      setResendMessage({ type: "error", text: "Không có email để gửi lại." });
      return;
    }
    setResendLoading(true);
    setResendMessage(null);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      setResendMessage({
        type: "success",
        text: "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể gửi lại email.";
      setResendMessage({ type: "error", text: msg });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng ký thành công
          </h1>
          <p className="text-gray-600 mb-4">Knowledge Base</p>
          <p className="text-gray-700 text-sm leading-relaxed">
            Vui lòng kiểm tra hộp thư và bấm link xác thực để kích hoạt tài khoản.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Nếu không thấy email, hãy kiểm tra thư mục Spam.
          </p>
        </div>

        {emailFromState && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Email: <span className="font-medium">{emailFromState}</span>
            </p>
          </div>
        )}

        {resendMessage && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              resendMessage.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {resendMessage.text}
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => navigate("/dang-nhap")}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Về trang đăng nhập
          </button>
          {emailFromState && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? "Đang gửi..." : "Gửi lại email xác thực"}
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ? Liên hệ{" "}
            <a
              href="mailto:info@knowledgebase.com"
              className="text-blue-600 hover:underline"
            >
              info@knowledgebase.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChoXacMinhEmailPage;
