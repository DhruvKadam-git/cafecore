import { SessionTable } from "@/lib/pos-session-types";
import { TableTile } from "./TableTile";

interface SessionFloorPlanProps {
  tables: SessionTable[];
}

export function SessionFloorPlan({ tables }: SessionFloorPlanProps) {
  return (
    <div>
      <p className="text-[13px] font-medium text-[#7A6E63] mb-3">Floor plan</p>
      <div className="rounded-[16px] border border-[#D8CCC1] bg-[#F8F5F1] p-3.5">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 justify-items-center">
          {tables.map((table) => (
            <TableTile key={table.id} table={table} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-5 mt-4 text-[12px] font-medium text-[#7A6E63]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ECE5DB] border border-[#D6C8BA]" />
            Available
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-[#D17A3B] bg-[#FFF5EE]" />
            Active order
          </div>
        </div>
      </div>
    </div>
  );
}
