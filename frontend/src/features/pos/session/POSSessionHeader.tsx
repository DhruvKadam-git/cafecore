"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

export function POSSessionHeader() {
  return (
    <header className="h-[72px] flex items-center justify-end px-6 md:px-8 border-b border-[#D8CCC1]/60 bg-[#FAF7F3]/80 backdrop-blur-sm shrink-0">
      <Link
        href="/login"
        className="flex items-center gap-2 text-[14px] font-semibold text-[#7A6E63] hover:text-[#1D1B1A] transition-colors"
      >
        <LogOut size={16} strokeWidth={2} />
        Sign out
      </Link>
    </header>
  );
}
