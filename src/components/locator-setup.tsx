import { useEffect } from "react";

export default function LocatorSetup() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("@locator/runtime")
        .then((module) => {
          const setupLocatorUI = module.default;
          setupLocatorUI({
            targets: { cursor: "cursor" },
          });
        })
        .catch(console.error);
    }
  }, []);

  return null;
}
