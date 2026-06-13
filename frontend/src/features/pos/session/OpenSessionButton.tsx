"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export function OpenSessionButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/pos/session/open")}
      className="w-full h-[60px] flex items-center justify-center gap-2 bg-[#C9773A] hover:bg-[#B86A30] hover:-translate-y-px text-white text-[18px] font-bold rounded-[18px] transition-all duration-200 active:scale-[0.98] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9773A]/40 focus-visible:ring-offset-2"
    >
      Open Session
      <ChevronRight size={20} strokeWidth={2.5} />
    </button>
  );
}
