import React from "react";
import { Button } from "../ui/button";
import { useNotification } from "../../contexts/NotificationContext";
import { notification } from "../../contexts/NotificationContext";

export default function NotificationDemo() {
  const { showSuccess, showError, showWarning, showInfo, showCustom } =
    useNotification();

  const handleShowSuccess = () => {
    showSuccess(
      "🎉 Thành công rồi!",
      "Bạn đã hoàn thành nhiệm vụ với điểm số cao nhất!"
    );
  };

  const handleShowError = () => {
    showError(
      "❌ Có lỗi xảy ra!",
      "Không thể kết nối tới máy chủ. Vui lòng thử lại sau."
    );
  };

  const handleShowWarning = () => {
    showWarning(
      "⚠️ Cảnh báo bảo mật",
      "Tài khoản của bạn sẽ bị khóa sau 3 lần đăng nhập sai."
    );
  };

  const handleShowInfo = () => {
    showInfo(
      "💡 Thông tin hữu ích",
      "Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai."
    );
  };

  const handleShowCustom = () => {
    showCustom(
      "🚀 Tính năng mới",
      "Chúng tôi vừa ra mắt tính năng AI thông minh!",
      {
        type: "success",
      }
    );
  };

  const handleGlobalNotification = () => {
    notification.success(
      "🌟 Thông báo toàn cục",
      "Đây là thông báo được gọi từ bất kỳ đâu trong ứng dụng!"
    );
  };

  const handleMultipleNotifications = () => {
    notification.info("📢 Thông báo 1", "Đây là thông báo đầu tiên");

    setTimeout(() => {
      notification.warning("⏰ Thông báo 2", "Đây là thông báo thứ hai");
    }, 1000);

    setTimeout(() => {
      notification.success("✅ Thông báo 3", "Đây là thông báo cuối cùng");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔔 Demo Hệ Thống Thông Báo Nâng Cao
        </h1>
        <p className="text-gray-600">
          Khám phá hệ thống thông báo với background đẹp, animation mượt mà và
          tương tác phong phú
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Success Notification */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
            🎉 Thành Công
          </h3>
          <p className="text-green-600 text-sm mb-4">
            Thông báo khi hoàn thành thành công
          </p>
          <Button
            onClick={handleShowSuccess}
            className="bg-green-600 hover:bg-green-700 text-white w-full"
          >
            Hiển thị
          </Button>
        </div>

        {/* Error Notification */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
            ❌ Lỗi
          </h3>
          <p className="text-red-600 text-sm mb-4">
            Thông báo khi có lỗi xảy ra
          </p>
          <Button
            onClick={handleShowError}
            className="bg-red-600 hover:bg-red-700 text-white w-full"
          >
            Hiển thị
          </Button>
        </div>

        {/* Warning Notification */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-2xl border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            ⚠️ Cảnh Báo
          </h3>
          <p className="text-yellow-600 text-sm mb-4">
            Thông báo cảnh báo quan trọng
          </p>
          <Button
            onClick={handleShowWarning}
            className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
          >
            Hiển thị
          </Button>
        </div>

        {/* Info Notification */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
            💡 Thông Tin
          </h3>
          <p className="text-blue-600 text-sm mb-4">
            Thông báo thông tin hữu ích
          </p>
          <Button
            onClick={handleShowInfo}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
          >
            Hiển thị
          </Button>
        </div>

        {/* Custom Notification */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center gap-2">
            🚀 Tùy Chỉnh
          </h3>
          <p className="text-purple-600 text-sm mb-4">
            Thông báo với tùy chỉnh đặc biệt
          </p>
          <Button
            onClick={handleShowCustom}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full"
          >
            Hiển thị
          </Button>
        </div>

        {/* Global Notification */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            🌟 Toàn Cục
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Gọi thông báo từ bất kỳ đâu
          </p>
          <Button
            onClick={handleGlobalNotification}
            className="bg-gray-600 hover:bg-gray-700 text-white w-full"
          >
            Hiển thị
          </Button>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 text-center">
          ✨ Tính Năng Nâng Cao
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleMultipleNotifications}
            variant="outline"
            className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            🔥 Nhiều thông báo liên tiếp
          </Button>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          ✨ Tính Năng Đặc Biệt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-700">
                Background gradient đẹp mắt
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-gray-700">
                Animation mượt mà với Framer Motion
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-sm text-gray-700">
                Hiệu ứng shimmer khi hover
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="text-sm text-gray-700">
                Progress bar tự động
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-sm text-gray-700">
                Action buttons tương tác
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-sm text-gray-700">
                Multiple notifications support
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              <span className="text-sm text-gray-700">
                Responsive cho mọi thiết bị
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              <span className="text-sm text-gray-700">
                Gọi từ bất kỳ đâu trong app
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
