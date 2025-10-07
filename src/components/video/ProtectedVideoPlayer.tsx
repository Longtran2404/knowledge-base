import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Lock } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface ProtectedVideoPlayerProps {
  videoUrl: string;
  courseId?: string;
  lessonId?: string;
  allowDownload?: boolean;
  watermarkText?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export const ProtectedVideoPlayer: React.FC<ProtectedVideoPlayerProps> = ({
  videoUrl,
  courseId,
  lessonId,
  allowDownload = false,
  watermarkText,
  onProgress,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Disable right-click context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showSecurityWarning();
      return false;
    };

    // Prevent video download
    const preventDownload = () => {
      if (video) {
        // Use setAttribute to avoid TypeScript errors
        video.setAttribute("controlsList", "nodownload");
        video.setAttribute("disablePictureInPicture", "true");
      }
    };

    // Detect screen recording attempts (visibility change)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      }
    };

    // Detect screenshot attempts (keyboard shortcuts)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common screenshot shortcuts
      const isScreenshot =
        (e.key === "PrintScreen") ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) || // Mac screenshots
        (e.shiftKey && e.key === "S" && (e.ctrlKey || e.metaKey)) || // Windows Snipping Tool
        (e.key === "F12") || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === "I"); // DevTools

      if (isScreenshot) {
        e.preventDefault();
        blurVideo();
        showSecurityWarning();
        return false;
      }
    };

    // Detect DevTools
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        blurVideo();
        showSecurityWarning();
      }
    };

    // Prevent text selection and dragging
    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Handle video progress tracking
    const handleTimeUpdate = () => {
      if (video && onProgress) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
    };

    // Handle video completion
    const handleEnded = () => {
      if (onComplete) {
        onComplete();
      }
    };

    // Blur video on security violation
    const blurVideo = () => {
      setIsBlurred(true);
      video.pause();
      setViolationCount((prev) => prev + 1);

      setTimeout(() => {
        setIsBlurred(false);
      }, 3000);
    };

    const showSecurityWarning = () => {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 5000);
    };

    // Apply all protections
    preventDownload();

    container.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    container.addEventListener("selectstart", preventSelection);
    container.addEventListener("dragstart", preventSelection);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // Check for DevTools periodically
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Disable copy-paste
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener("copy", preventCopy);

    // Cleanup
    return () => {
      container.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("selectstart", preventSelection);
      container.removeEventListener("dragstart", preventSelection);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("copy", preventCopy);
      clearInterval(devToolsInterval);
    };
  }, [onProgress, onComplete]);

  // Add watermark overlay
  useEffect(() => {
    if (!watermarkText) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 100;
    ctx.font = "20px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.rotate(-20 * Math.PI / 180);
    ctx.fillText(watermarkText, 10, 50);

    const watermarkUrl = canvas.toDataURL();

    const style = document.createElement("style");
    style.textContent = `
      .video-watermark::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url(${watermarkUrl});
        background-repeat: repeat;
        pointer-events: none;
        z-index: 10;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [watermarkText]);

  return (
    <div className="relative w-full">
      {showWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Cảnh báo: Phát hiện hành vi vi phạm bản quyền! Video đã bị tạm dừng.
            {violationCount >= 3 && " Tài khoản của bạn có thể bị khóa nếu tiếp tục vi phạm."}
          </AlertDescription>
        </Alert>
      )}

      <div
        ref={containerRef}
        className={`relative bg-black rounded-lg overflow-hidden ${watermarkText ? "video-watermark" : ""}`}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {/* Security Overlay */}
        {isBlurred && (
          <div className="absolute inset-0 backdrop-blur-xl z-20 flex items-center justify-center">
            <div className="text-center text-white">
              <Lock className="h-16 w-16 mx-auto mb-4" />
              <p className="text-xl font-bold">Bảo vệ nội dung</p>
              <p className="text-sm mt-2">Video đã bị tạm dừng do phát hiện hành vi vi phạm</p>
            </div>
          </div>
        )}

        {/* Hidden URL to prevent link exposure */}
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          controlsList={allowDownload ? "" : "nodownload"}
          disablePictureInPicture
          playsInline
          onContextMenu={(e) => e.preventDefault()}
          style={{
            objectFit: "contain",
            pointerEvents: isBlurred ? "none" : "auto",
          }}
        >
          {/* Use blob URL or signed URL instead of direct URL */}
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Trình duyệt của bạn không hỗ trợ video HTML5.
        </video>

        {/* Invisible overlay to prevent direct interaction */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 5 }}
        />
      </div>

      {/* Copyright Notice */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <Lock className="inline h-3 w-3 mr-1" />
        Nội dung được bảo vệ bản quyền. Nghiêm cấm sao chép, chia sẻ hoặc phân phối.
      </div>
    </div>
  );
};

export default ProtectedVideoPlayer;
