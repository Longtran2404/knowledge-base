import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTopOnMount() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, [pathname]);

  return null;
}
