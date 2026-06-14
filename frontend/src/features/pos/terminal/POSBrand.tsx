import { Coffee } from "lucide-react";

export function POSBrand() {
  return (
    <div className="flex items-center gap-2.5 w-[220px] shrink-0">
      <Coffee size={22} className="text-[#D17A3B]" strokeWidth={2} />
      <span className="text-[22px] font-bold text-white tracking-tight">Brewhouse POS</span>
    </div>
  );
}
