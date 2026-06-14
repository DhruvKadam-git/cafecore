"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface SessionOpenActionsProps {
  openingCash: string;
  onError: (message: string) => void;
}

export function SessionOpenActions({ openingCash, onError }: SessionOpenActionsProps) {
  const router = useRouter();

  const handleConfirm = () => {
    const amount = Number(openingCash);
    if (!openingCash || isNaN(amount) || amount <= 0) {
      onError("Enter a valid opening cash amount.");
      return;
    }
    onError("");
    try {
      sessionStorage.setItem("pos-opening-cash", String(amount));
    } catch {
      // ignore storage errors in prototype
    }
    router.push("/pos");
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href="/pos/session"
        className="h-[52px] flex items-center justify-center rounded-[14px] border border-[#D8CCC1] bg-white text-[15px] font-bold text-[#1D1B1A] hover:bg-[#F5F0EA] transition-colors"
      >
        Back
      </Link>
      <button
        type="button"
        onClick={handleConfirm}
        className="h-[52px] flex items-center justify-center rounded-[14px] bg-[#C9773A] hover:bg-[#B86A30] text-[15px] font-bold text-white transition-all duration-200 active:scale-[0.98]"
      >
        Confirm & Open
      </button>
    </div>
  );
}
