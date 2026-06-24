import { Coffee } from "lucide-react";

export function SessionBrandHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-16 h-16 rounded-[18px] bg-[#1B120D] flex items-center justify-center shadow-md shrink-0">
        <Coffee size={28} className="text-[#D17A3B]" strokeWidth={2} />
      </div>
      <div>
        <h1 className="text-[28px] font-bold text-[#1D1B1A] leading-tight tracking-tight">
          Brewhouse POS
        </h1>
        <p className="text-[15px] font-medium text-[#7A6E63] mt-0.5">POS Session Manager</p>
      </div>
    </div>
  );
}
