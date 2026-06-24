"use client";

import React from "react";
import { Flame, ChefHat, CheckCircle } from "lucide-react";
import { KDSStage, KDS_STAGE_LABELS } from "@/lib/kds-types";

const stageConfig: Record<
  KDSStage,
  { icon: React.ReactNode; className: string; pulse?: boolean }
> = {
  "to-cook": {
    icon: <Flame size={12} strokeWidth={2.5} />,
    className: "bg-kds-amber-bg/80 text-kds-amber border border-kds-amber/30",
    pulse: true,
  },
  preparing: {
    icon: <ChefHat size={12} strokeWidth={2.5} />,
    className: "bg-kds-orange-bg/80 text-kds-orange border border-kds-orange/30",
  },
  ready: {
    icon: <CheckCircle size={12} strokeWidth={2.5} />,
    className: "bg-kds-green-bg/80 text-kds-green border border-kds-green/30",
  },
};

interface KDSStatusBadgeProps {
  stage: KDSStage;
  isNew?: boolean;
}

export function KDSStatusBadge({ stage, isNew }: KDSStatusBadgeProps) {
  const config = stageConfig[stage];

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.className} ${
        isNew && config.pulse ? "animate-kds-badge-pulse" : ""
      }`}
    >
      {config.icon}
      {KDS_STAGE_LABELS[stage]}
    </span>
  );
}
