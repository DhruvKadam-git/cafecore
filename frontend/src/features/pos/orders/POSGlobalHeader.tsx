import { Coffee } from "lucide-react";
import { POSUserMenu } from "@/features/pos/terminal/POSUserMenu";

export function POSGlobalHeader() {
  return (
    <header className="h-[60px] shrink-0 bg-sidebar-bg flex items-center justify-between px-5 md:px-6 theme-transition">
      <div className="flex items-center gap-2.5">
        <Coffee size={22} className="text-primary" strokeWidth={2} />
        <span className="text-[22px] font-bold text-white tracking-tight">Brewhouse POS</span>
      </div>
      <POSUserMenu />
    </header>
  );
}
