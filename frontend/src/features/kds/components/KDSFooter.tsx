"use client";

import React from "react";
import { HelpCircle } from "lucide-react";

interface KDSFooterProps {
  activeCount: number;
  avgWaitMinutes: number;
}

export function KDSFooter({ activeCount, avgWaitMinutes }: KDSFooterProps) {
  return (
    <footer className="shrink-0 relative h-12 flex items-center border-t border-kds-border/60 bg-kds-bg px-7">
      <p className="text-[12px] font-medium text-kds-muted">
        {activeCount} active order{activeCount !== 1 ? "s" : ""}
        {activeCount > 0 && (
          <span className="text-kds-timer"> · avg {avgWaitMinutes}m wait</span>
        )}
      </p>

      <p className="absolute left-1/2 -translate-x-1/2 text-[11px] font-medium text-kds-muted/70 hidden md:block">
        Drag handle to move ·{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-kds-elevated border border-kds-border text-[10px]">Space</kbd>
        {" "}bump ·{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-kds-elevated border border-kds-border text-[10px]">D</kbd>
        {" "}dismiss
      </p>

      <button
        type="button"
        aria-label="Help"
        className="kds-focus-ring absolute right-7 w-8 h-8 rounded-full border border-kds-border flex items-center justify-center text-kds-muted hover:text-kds-text hover:border-kds-amber/50 transition-colors"
      >
        <HelpCircle size={16} />
      </button>
    </footer>
  );
}
