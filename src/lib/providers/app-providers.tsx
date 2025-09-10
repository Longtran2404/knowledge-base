
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { MiniCart } from "@/components/cart/shopping-cart";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {children}
      
      {/* Global UI Components */}
      <Toaster 
        position="top-right"
        closeButton
        richColors
        expand
        visibleToasts={5}
      />
      
      {/* Mini Cart for quick access */}
      <MiniCart />
    </>
  );
}