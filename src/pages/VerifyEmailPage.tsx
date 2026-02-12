import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../lib/email-auth";
import { motion } from "framer-motion";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token xác thực không hợp lệ");
      return;
    }

    const verifyUser = async () => {
      try {
        const result = await verifyEmail(token);

        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email đã được xác thực thành công!");
          setUser(result.user);

          // Auto redirect to home page after 3 seconds
          setTimeout(() => {
            navigate("/");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(result.error || "Xác thực thất bại");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Có lỗi xảy ra khi xác thực email");
      }
    };

    verifyUser();
  }, [searchParams, navigate]);

  const handleResendEmail = () => {
    // Redirect to resend page or show resend form
    navigate("/resend-verification");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            {status === "loading" && (
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            {status === "success" && (
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {status === "error" && (
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === "loading" && "Đang xác thực..."}
            {status === "success" && "Xác thực thành công!"}
            {status === "error" && "Xác thực thất bại"}
          </h1>
          <p className="text-gray-600">Knowledge Base</p>
        </div>

        {/* Message */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed">{message}</p>

          {status === "success" && user && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">
                Chào mừng {user.full_name}!
              </p>
              <p className="text-green-600 text-sm mt-1">
                Tài khoản của bạn đã được kích hoạt thành công.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {status === "success" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleGoHome}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Về trang chủ
            </motion.button>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Gửi lại email xác thực
              </button>
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
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
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
