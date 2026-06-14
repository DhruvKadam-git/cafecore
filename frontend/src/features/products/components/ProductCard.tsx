"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/product-types";
import { StatusToggle } from "./StatusToggle";
import { ProductActions } from "./ProductActions";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState(
    product.defaultSize ?? product.sizes[0] ?? "Small"
  );

  return (
    <div className="bg-input border border-border-custom rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.03)] hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-[250ms] ease-in-out flex flex-col theme-transition">
      <div className="relative m-[10px]">
        <div className="relative h-[170px] w-full overflow-hidden rounded-[14px]">
          {product.imageUrl && typeof product.imageUrl === "string" && product.imageUrl.trim() !== "" ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-border-custom/30 rounded-[14px]">
              <span className="text-primary font-bold text-4xl select-none font-sans">
                {product.name.trim() ? product.name.trim()[0].toUpperCase() : "?"}
              </span>
            </div>
          )}
        </div>

        <span
          className={`absolute top-1.5 right-1.5 w-[14px] h-[14px] rounded-full border-[3px] border-white ${
            product.active ? "bg-success" : "bg-border-custom/70"
          }`}
          aria-label={product.active ? "Available" : "Unavailable"}
        />
      </div>

      <div className="px-3 pb-3 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-bold text-text-heading font-sans truncate">
            {product.name}
          </h3>
          <span className="text-[15px] font-bold text-primary font-sans shrink-0">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <p className="text-[13px] font-medium text-text-body font-sans mt-1">
          {product.category} · {product.uom} · {product.tax} tax
        </p>

        <div className="flex items-center gap-2 mt-2.5">
          {product.sizes.map((size) => {
            const isActive = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`h-[26px] px-3 rounded-full text-[13px] font-semibold font-sans transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-white text-text-body border border-border-custom hover:border-primary/40"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-2.5 border-t border-border-custom flex items-center justify-between">
          <StatusToggle
            checked={product.active}
            onChange={() => onToggleActive(product.id)}
          />
          <ProductActions
            onEdit={() => onEdit(product)}
            onDelete={() => onDelete(product.id)}
          />
        </div>
      </div>
    </div>
  );
}
