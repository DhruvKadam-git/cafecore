import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function OrdersPageHeader() {
  return (
    <div className="flex items-center h-20 px-6 md:px-8 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href="/pos"
          className="flex items-center gap-2 h-10 text-[14px] font-semibold text-primary hover:brightness-110 transition-colors theme-transition shrink-0"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          Back
        </Link>
        <div className="w-px h-7 bg-border-custom shrink-0 theme-transition" />
        <h1 className="text-[32px] font-bold text-text-heading leading-tight tracking-tight theme-transition">
          Orders
        </h1>
      </div>
    </div>
  );
}
