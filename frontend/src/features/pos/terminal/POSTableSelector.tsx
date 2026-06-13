import { LayoutGrid } from "lucide-react";

interface POSTableSelectorProps {
  tableLabel: string | null;
  onClick: () => void;
}

export function POSTableSelector({ tableLabel, onClick }: POSTableSelectorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 h-[38px] min-w-[126px] px-4 rounded-[12px] bg-[#2B221D] border border-[#3A2D26] text-[#F5F0EA] text-[14px] font-semibold hover:bg-[#352A24] transition-colors"
    >
      <LayoutGrid size={18} strokeWidth={2} />
      {tableLabel ?? "Select Table"}
    </button>
  );
}
