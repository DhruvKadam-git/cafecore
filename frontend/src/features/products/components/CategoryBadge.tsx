"use client";

import React from "react";
import { Product } from "@/lib/product-types";

interface CategoryBadgeProps {
  category: Product["category"];
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const styles = {
    Espresso: "bg-primary/10 text-primary",
    "Cold Brew": "bg-sidebar-bg/10 text-sidebar-bg",
    Pastries: "bg-success/10 text-success",
    Sandwiches: "bg-primary/10 text-primary",
    Tea: "bg-gold/10 text-gold",
  };

  return (
    <span
      className={`inline-flex items-center justify-center h-[24px] px-3 rounded-full text-[13px] font-medium font-sans select-none border border-black/5 ${
        styles[category] || "bg-gray-100 text-gray-800"
      }`}
    >
      {category}
    </span>
  );
}
