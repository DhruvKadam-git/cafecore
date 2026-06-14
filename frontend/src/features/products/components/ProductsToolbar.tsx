"use client";

import React from "react";
import { Plus } from "lucide-react";
import { ProductViewMode } from "@/lib/product-types";
import { ViewToggle } from "./ViewToggle";

interface ProductsToolbarProps {
  viewMode: ProductViewMode;
  onViewModeChange: (mode: ProductViewMode) => void;
  onNewProduct: () => void;
}

export function ProductsToolbar({
  viewMode,
  onViewModeChange,
  onNewProduct,
}: ProductsToolbarProps) {
  return (
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 select-none">
      <h2 className="text-[20px] font-bold text-text-heading font-sans">
        Products
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        <ViewToggle value={viewMode} onChange={onViewModeChange} />

        <button
          onClick={onNewProduct}
          className="h-[40px] px-5 rounded-[14px] bg-primary text-white text-[15px] font-semibold flex items-center gap-2 hover:brightness-105 hover:translate-y-[-1px] transition-all duration-200 shadow-[0_2px_6px_rgba(201,120,58,0.2)] cursor-pointer"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>New Product</span>
        </button>
      </div>
    </div>
  );
}
