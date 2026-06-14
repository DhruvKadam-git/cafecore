"use client";

import React from "react";
import { PromotionScope } from "@/lib/marketing-types";

interface ScopeBadgeProps {
  scope: PromotionScope;
}

const SCOPE_LABELS: Record<PromotionScope, string> = {
  product: "Product",
  order: "Order",
};

export function ScopeBadge({ scope }: ScopeBadgeProps) {
  return (
    <span className="inline-flex items-center justify-center h-[24px] px-3 rounded-full bg-primary/10 text-primary text-[13px] font-medium font-sans select-none">
      {SCOPE_LABELS[scope]}
    </span>
  );
}
