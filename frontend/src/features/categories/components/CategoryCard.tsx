"use client";

import React, { useState } from "react";
import { MoreVertical, Pencil, Trash2, Package } from "lucide-react";
import Image from "next/image";
import { Category } from "./types";

interface CategoryCardProps {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onView: (cat: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete, onView }: CategoryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onClick={() => !menuOpen && onView(category)}
      className="bg-surface border border-border-custom rounded-[20px] overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:border-primary transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] group relative cursor-pointer theme-transition"
    >
      {/* Image or color band */}
      {category.image && typeof category.image === "string" && category.image.trim() !== "" ? (
        <div className="relative h-[100px] w-full overflow-hidden">
          <Image src={category.image} alt={category.name} fill className="object-cover" unoptimized />
          {/* Gradient overlay so badge stays readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Color accent bar at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 h-[4px]" style={{ backgroundColor: category.color }} />
        </div>
      ) : (
        <div className="h-[8px] w-full" style={{ backgroundColor: category.color }} />
      )}

      <div className="p-5">
        {/* Row 1: Badge + menu */}
        <div className="flex items-start justify-between gap-2">
          <span
            className="px-3.5 py-1.5 rounded-full text-[13px] font-bold text-white shadow-sm select-none"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>

          {/* 3-dot menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
              className="w-8 h-8 rounded-[10px] flex items-center justify-center text-text-muted hover:bg-surface hover:text-text-heading transition-colors theme-transition"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 bg-white border border-border-custom rounded-[14px] shadow-xl z-20 py-1.5 min-w-[140px] overflow-hidden">
                <button
                  onClick={() => { onEdit(category); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-text-body hover:bg-surface transition-colors theme-transition"
                >
                  <Pencil size={14} className="text-primary" /> Edit
                </button>
                <button
                  onClick={() => { onDelete(category.id); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-danger hover:bg-danger/10 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Color swatch row */}
        <div className="flex items-center gap-2 mt-4">
          <div
            className="w-8 h-8 rounded-[10px] border border-white/30 shadow-sm shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-[12px] font-mono font-bold text-text-muted uppercase tracking-wider">
            {category.color}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-surface rounded-[12px] p-3 flex flex-col gap-0.5 theme-transition">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Package size={12} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Products</span>
            </div>
            <span className="text-[20px] font-bold text-text-heading leading-none">{category.productCount}</span>
          </div>
          <div className="bg-surface rounded-[12px] p-3 flex flex-col gap-0.5 theme-transition">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Revenue</span>
            <span className="text-[20px] font-bold leading-none" style={{ color: category.color }}>
              {category.revenue}
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[11px] font-medium text-text-muted mt-3 pt-3 border-t border-border-custom/60 flex items-center justify-between">
          <span>Created {category.createdAt}</span>
          <span className="text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            View products →
          </span>
        </p>
      </div>
    </div>
  );
}
