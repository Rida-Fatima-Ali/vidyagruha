"use client";

import { type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { BandwidthProvider } from "./bandwidth-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <BandwidthProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </BandwidthProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
