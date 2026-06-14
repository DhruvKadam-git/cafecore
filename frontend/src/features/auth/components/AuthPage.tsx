"use client";

import React, { useState } from "react";
import { Coffee } from "lucide-react";
import { SignInPanel } from "./SignInPanel";
import { SignUpPanel } from "./SignUpPanel";

export function AuthPage() {
  const [view, setView] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background theme-transition">

      {/* Branding */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-[56px] h-[56px] rounded-[16px] bg-[#2C2118] flex items-center justify-center shadow-md mb-4">
          <Coffee size={26} className="text-primary" strokeWidth={2} />
        </div>
        <h1 className="text-[26px] font-bold text-text-heading tracking-tight">
          Brewhouse POS
        </h1>
        <p className="text-[14px] font-medium text-text-muted mt-1">
          Café management system
        </p>
      </div>

      {/* Single card — swaps between sign-in and sign-up */}
      <div className="w-full max-w-[440px] bg-surface border border-border-custom rounded-[24px] shadow-[0_8px_40px_rgba(44,33,24,0.10)] overflow-hidden theme-transition">
        {view === "signin" ? (
          <SignInPanel onCreateAccount={() => setView("signup")} />
        ) : (
          <SignUpPanel onBackToSignIn={() => setView("signin")} />
        )}
      </div>

      {/* Footer */}
      <p className="text-[12px] font-medium text-text-muted mt-8 select-none">
        &copy; 2026 Brewhouse POS &mdash; All rights reserved
      </p>
    </div>
  );
}
