"use client";

import React from "react";
import { Coffee } from "lucide-react";
import { SignInPanel } from "./SignInPanel";
import { SignUpPanel } from "./SignUpPanel";

export function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 auth-dot-grid bg-[#FDFAF6]">
      {/* Branding */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-[52px] h-[52px] rounded-[14px] bg-[#2C2118] flex items-center justify-center shadow-md mb-4">
          <Coffee size={26} className="text-primary" strokeWidth={2} />
        </div>
        <h1 className="text-[26px] font-bold text-text-heading tracking-tight">Brewhouse POS</h1>
        <p className="text-[14px] font-medium text-text-muted mt-1">Café management system</p>
      </div>

      {/* Split card */}
      <div className="w-full max-w-[920px] rounded-[24px] overflow-hidden shadow-[0_8px_40px_rgba(44,33,24,0.12)] border border-[#E8DDD0]/60">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <SignInPanel />
          <SignUpPanel />
        </div>
      </div>

      {/* Footer */}
      <p className="text-[12px] font-medium text-text-muted mt-8 select-none">
        &copy; 2026 Brewhouse POS &mdash; All rights reserved
      </p>
    </div>
  );
}
