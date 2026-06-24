"use client";

import React from "react";
import { Product } from "@/lib/product-types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function ProductGrid({
  products,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="w-full py-16 text-center text-[15px] font-medium text-text-muted font-sans">
        No products found. Click &quot;New Product&quot; to add one!
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
}
