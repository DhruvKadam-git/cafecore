"use client";

import React from "react";
import { Clock } from "lucide-react";
import { getTimerUrgency } from "@/lib/kds-types";

interface KDSTimerBadgeProps {
  elapsed: number;
}

const urgencyStyles = {
  normal: "bg-kds-elevated text-kds-timer border-kds-border",
  warning: "bg-kds-orange-bg text-kds-orange border-kds-orange/40",
  danger: "bg-kds-danger-bg text-kds-danger border-kds-danger/50 animate-kds-pulse-danger",
} as const;

export function KDSTimerBadge({ elapsed }: KDSTimerBadgeProps) {
  const urgency = getTimerUrgency(elapsed);
  const isOverdue = urgency === "danger";

  return (
    <div
      className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[12px] font-semibold tabular-nums ${urgencyStyles[urgency]}`}
      aria-label={`${elapsed} minutes elapsed${isOverdue ? ", overdue" : ""}`}
    >
      <Clock size={12} aria-hidden />
      <span>{elapsed}m</span>
      {isOverdue && (
        <span className="text-[10px] font-bold uppercase tracking-wider">Overdue</span>
      )}
    </div>
  );
}
