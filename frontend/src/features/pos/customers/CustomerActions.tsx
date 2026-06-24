import { Pencil, Trash2 } from "lucide-react";

interface CustomerActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function CustomerActions({ onEdit, onDelete }: CustomerActionsProps) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit customer"
        className="w-9 h-9 rounded-[12px] bg-surface hover:bg-background text-text-body flex items-center justify-center transition-all hover:scale-105 theme-transition"
      >
        <Pencil size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete customer"
        className="w-9 h-9 rounded-[12px] bg-danger/10 hover:bg-danger/15 text-danger flex items-center justify-center transition-all hover:scale-105 theme-transition"
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
