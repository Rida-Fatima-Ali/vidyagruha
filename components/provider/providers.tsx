"use client";

import { type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";
import { LiteModeProvider } from "./lite-mode-provider";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <LiteModeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </LiteModeProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
