import { useEffect } from "react";

export default function LocatorSetup() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      import("@locator/runtime")
        .then((module) => {
          const setupLocatorUI = module.default;
          setupLocatorUI({ targets: { cursor: "cursor" } });
        })
        .catch(() => { /* @locator/runtime có thể không tương thích với Next.js 15 - bỏ qua */ });
    }
  }, []);

  return null;
}
