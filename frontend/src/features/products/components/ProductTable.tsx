"use client";

import React from "react";
import { Product } from "@/lib/product-types";
import { CategoryBadge } from "./CategoryBadge";
import { StatusToggle } from "./StatusToggle";
import { ProductActions } from "./ProductActions";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductTableProps) {
  return (
    <div className="w-full bg-surface border border-border-custom rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden theme-transition">
      
      {/* Horizontal Scroll wrapper for responsiveness */}
      <div className="overflow-x-auto w-full no-scrollbar">
        <table className="w-full border-collapse text-left font-sans min-w-[800px]">
          
          {/* Table Header */}
          <thead>
            <tr className="bg-card-bg h-[44px] border-b border-border-custom theme-transition">
              <th className="px-6 py-2 text-[13px] font-bold text-text-heading select-none">
                Name
              </th>
              <th className="px-6 py-2 text-[13px] font-bold text-text-heading select-none">
                Category
              </th>
              <th className="px-6 py-2 text-[13px] font-bold text-text-heading select-none">
                Price
              </th>
              <th className="px-6 py-2 text-[13px] font-bold text-text-heading select-none">
                UOM
              </th>
              <th className="px-6 py-2 text-[13px] font-bold text-text-heading select-none">
                Tax
              </th>
              <th className="px-6 py-2 text-[13px] font-bold text-text-heading select-none">
                Active
              </th>
              <th className="px-6 py-2 text-[13px] font-bold text-text-heading select-none text-right">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="h-[58px] border-b border-border-custom last:border-0 hover:bg-surface/80 transition-colors duration-200 theme-transition"
              >
                {/* Product Name */}
                <td className="px-6 py-2 text-[15px] font-bold text-text-heading">
                  {product.name}
                </td>
                
                {/* Category Badge */}
                <td className="px-6 py-2">
                  <CategoryBadge category={product.category} />
                </td>
                
                {/* Price */}
                <td className="px-6 py-2 text-[15px] font-semibold text-text-heading">
                  ${product.price.toFixed(2)}
                </td>
                
                {/* UOM */}
                <td className="px-6 py-2 text-[15px] font-medium text-text-body">
                  {product.uom}
                </td>
                
                {/* Tax Rate */}
                <td className="px-6 py-2 text-[15px] font-medium text-text-muted">
                  {product.tax}
                </td>
                
                {/* Active Toggle Switch */}
                <td className="px-6 py-2">
                  <StatusToggle
                    checked={product.active}
                    onChange={() => onToggleActive(product.id)}
                  />
                </td>
                
                {/* Action Buttons (Edit & Delete circles) */}
                <td className="px-6 py-2 text-right">
                  <div className="flex items-center justify-end">
                    <ProductActions
                      onEdit={() => onEdit(product)}
                      onDelete={() => onDelete(product.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-[15px] font-medium text-text-muted">
                  No products found. Click &quot;+ New Product&quot; to add one!
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
