"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface DeleteActionButtonProps {
  onDelete: () => void;
  title?: string;
}

export function DeleteActionButton({
  onDelete,
  title = "Delete",
}: DeleteActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onDelete}
      className="w-[30px] h-[30px] rounded-full bg-danger/10 text-danger hover:brightness-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
      title={title}
    >
      <Trash2 size={14} strokeWidth={2} />
    </button>
  );
}
