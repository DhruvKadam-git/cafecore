"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/toast/use-toast";
import { toastApiError } from "@/components/toast/toast-utils";
import { sessionsApi } from "@/lib/api";

interface SessionOpenActionsProps {
  openingCash: string;
}

export function SessionOpenActions({ openingCash }: SessionOpenActionsProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const amount = Number(openingCash);
    if (!openingCash || isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid opening cash amount.");
      return;
    }
    setLoading(true);
    try {
      await sessionsApi.openSession(amount);
      toast.success("Session opened successfully");
      router.push("/pos");
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setLoading(false);
    }
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
        disabled={loading}
        className="h-[52px] flex items-center justify-center rounded-[14px] bg-[#C9773A] hover:bg-[#B86A30] disabled:opacity-60 text-[15px] font-bold text-white transition-all duration-200 active:scale-[0.98]"
      >
        {loading ? "Opening..." : "Confirm & Open"}
      </button>
    </div>
  );
}
