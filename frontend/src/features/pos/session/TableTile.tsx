import { SessionTable } from "@/lib/pos-session-types";

interface TableTileProps {
  table: SessionTable;
}

export function TableTile({ table }: TableTileProps) {
  const active = table.hasActiveOrder;

  return (
    <div
      className={`w-[56px] h-[56px] sm:w-[66px] sm:h-[66px] rounded-[10px] flex items-center justify-center text-[15px] font-bold transition-transform duration-200 hover:scale-[1.03] ${
        active
          ? "bg-[#FFF5EE] border border-[#D17A3B] text-[#D17A3B]"
          : "bg-[#ECE5DB] border border-[#D6C8BA] text-[#1D1B1A]"
      }`}
    >
      {table.number}
    </div>
  );
}
