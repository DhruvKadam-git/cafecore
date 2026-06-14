import { Clock, DollarSign } from "lucide-react";
import { SessionStats } from "@/lib/pos-session-types";

interface SessionStatCardsProps {
  stats: SessionStats;
}

export function SessionStatCards({ stats }: SessionStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="h-24 rounded-[16px] bg-[#F5F0EA] border border-[#D8CCC1] px-4 py-3.5 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-[#769E4D]" strokeWidth={2.5} />
          <span className="text-[12px] font-medium text-[#7A6E63]">Closing amount</span>
        </div>
        <p className="text-[22px] font-bold text-[#769E4D] leading-none">
          ${stats.closingAmount.toLocaleString()}
        </p>
      </div>

      <div className="h-24 rounded-[16px] bg-[#F5F0EA] border border-[#D8CCC1] px-4 py-3.5 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#D39A4A]" strokeWidth={2.5} />
          <span className="text-[12px] font-medium text-[#7A6E63]">Total orders</span>
        </div>
        <p className="text-[22px] font-bold text-[#1D1B1A] leading-none">
          {stats.totalOrders}
        </p>
      </div>
    </div>
  );
}
