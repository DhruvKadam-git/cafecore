"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthGuard } from "@/components/providers/auth-guard";
import { ToastProvider } from "@/components/toast/toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AuthGuard>
            {children}
            <ThemeSwitcher />
          </AuthGuard>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
