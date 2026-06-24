import { POSFloor } from "@/lib/pos-table-types";

interface FloorTabsProps {
  floors: POSFloor[];
  activeFloorId: string;
  onFloorChange: (floorId: string) => void;
}

export function FloorTabs({ floors, activeFloorId, onFloorChange }: FloorTabsProps) {
  return (
    <div className="flex items-center gap-2 px-6 md:px-8 pb-4 shrink-0">
      {floors.map((floor) => (
        <button
          key={floor.id}
          type="button"
          onClick={() => onFloorChange(floor.id)}
          className={`h-[42px] px-6 rounded-[14px] text-[14px] font-semibold transition-all duration-200 theme-transition ${
            activeFloorId === floor.id
              ? "bg-sidebar-bg text-white"
              : "bg-surface text-text-body hover:bg-background"
          }`}
        >
          {floor.name}
        </button>
      ))}
    </div>
  );
}
