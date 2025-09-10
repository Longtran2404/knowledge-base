import { FloatingNavigation } from "./navigation/floating-navigation";
import EnhancedFloatingGuide from "./guide/EnhancedFloatingGuide";

export function ClientWrapper() {
  return (
    <>
      <FloatingNavigation />
      <EnhancedFloatingGuide />
    </>
  );
}
