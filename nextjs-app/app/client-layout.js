"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/authContext";
import { Footer } from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <div className={`flex-1 ${pathname === "/" ? " flex flex-col " : ""} items-center justify-center`}>
          {children}
        </div>
      </AuthProvider>
      <Footer />
    </TooltipProvider>
  );
}