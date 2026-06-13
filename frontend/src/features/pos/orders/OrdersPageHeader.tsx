import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function OrdersPageHeader() {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/pos"
        className="flex items-center gap-2 h-10 text-[14px] font-semibold text-primary hover:brightness-110 transition-colors theme-transition"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
        Back
      </Link>
      <h1 className="text-[44px] font-bold text-text-heading leading-[1.1] tracking-tight theme-transition">
        Orders
      </h1>
    </div>
  );
}
