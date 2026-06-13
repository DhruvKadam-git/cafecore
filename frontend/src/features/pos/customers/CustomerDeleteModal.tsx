"use client";

import { AlertTriangle, X } from "lucide-react";

interface CustomerDeleteModalProps {
  customerName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function CustomerDeleteModal({ customerName, onConfirm, onClose }: CustomerDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[380px] p-6 shadow-2xl flex flex-col gap-5 theme-transition">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-[16px] bg-danger/10 flex items-center justify-center">
            <AlertTriangle size={22} className="text-danger" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[10px] bg-background hover:bg-surface flex items-center justify-center text-text-muted transition-colors theme-transition"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <h3 className="text-[18px] font-bold text-text-heading">Delete Customer?</h3>
          <p className="text-[14px] text-text-muted mt-1.5 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-text-heading">{customerName}</span>? This action cannot
            be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-background hover:bg-surface text-text-heading text-[14px] font-bold py-3 rounded-[14px] transition-colors theme-transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-danger hover:brightness-105 text-white text-[14px] font-bold py-3 rounded-[14px] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
