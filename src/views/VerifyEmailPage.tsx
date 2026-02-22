import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../lib/email-auth";

const API_BASE =
  typeof window !== "undefined"
    ? `${window.location.origin}/api`
    : process.env.REACT_APP_API_URL || "/api";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no_token">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("no_token");
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success && data.email) {
          setStatus("success");
          setMessage("Email đã xác thực. Tài khoản của bạn đã sẵn sàng.");
          setVerifiedEmail(data.email);
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        const result = await verifyEmail(token);
        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email đã được xác thực thành công!");
          setUser(result.user);
          setTimeout(() => navigate("/"), 3000);
        } else {
          setStatus("error");
          setMessage(result.error || "Xác thực thất bại");
        }
      } catch (err: unknown) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Có lỗi xảy ra khi xác thực email");
      }
    };

    verifyUser();
  }, [searchParams, navigate]);

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = resendEmail.trim();
    if (!email) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      const res = await fetch(`${API_BASE}/request-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setResendMessage({ type: "success", text: data.message || "Đã gửi email xác thực. Kiểm tra hộp thư." });
        setResendEmail("");
      } else {
        setResendMessage({ type: "error", text: data.error || data.details || "Gửi thất bại." });
      }
    } catch {
      setResendMessage({ type: "error", text: "Không thể kết nối. Thử lại sau." });
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoHome = () => navigate("/");

  if (status === "no_token") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gửi email xác thực</h1>
          <p className="text-gray-600 mb-6">Nhập email để nhận link xác thực.</p>
          <form onSubmit={handleResendSubmit} className="space-y-3 text-left">
            <div>
              <label htmlFor="resend-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="resend-email"
                type="email"
                value={resendEmail}
                onChange={(e) => { setResendEmail(e.target.value); setResendMessage(null); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
                required
              />
            </div>
            {resendMessage && (
              <p className={`text-sm ${resendMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {resendMessage.text}
              </p>
            )}
            <button
              type="submit"
              disabled={resendLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {resendLoading ? "Đang gửi..." : "Gửi email xác thực"}
            </button>
          </form>
          <button
            type="button"
            onClick={handleGoHome}
            className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            {status === "loading" && (
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            {status === "success" && (
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === "error" && (
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed">{message}</p>
          {status === "success" && verifiedEmail && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">Email {verifiedEmail} đã được xác thực.</p>
              <p className="text-green-600 text-sm mt-1">Tài khoản của bạn đã sẵn sàng.</p>
            </div>
          )}
          {status === "success" && user && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">Chào mừng {user.full_name}!</p>
              <p className="text-green-600 text-sm mt-1">Tài khoản của bạn đã được kích hoạt thành công.</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {status === "success" && (
            <button
              type="button"
              onClick={handleGoHome}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Về trang chủ
            </button>
          )}

          {status === "error" && (
            <>
              {!showResendForm ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowResendForm(true)}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Gửi lại email xác thực
                  </button>
                  <button
                    type="button"
                    onClick={handleGoHome}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Về trang chủ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResendSubmit} className="space-y-3 text-left">
                  <label htmlFor="resend-email-err" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="resend-email-err"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => { setResendEmail(e.target.value); setResendMessage(null); }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                    required
                  />
                  {resendMessage && (
                    <p className={`text-sm ${resendMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {resendMessage.text}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {resendLoading ? "Đang gửi..." : "Gửi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowResendForm(false); setResendMessage(null); }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ? Liên hệ{" "}
            <a href="mailto:info@knowledgebase.com" className="text-blue-600 hover:underline">
              info@knowledgebase.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
