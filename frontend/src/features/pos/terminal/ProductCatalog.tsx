"use client";

import { useMemo, useState } from "react";
import { POSProduct } from "@/lib/pos-product-types";
import { POS_CATEGORIES, POS_PRODUCTS } from "@/lib/mock-pos-products";
import { POSSearchBar } from "./POSSearchBar";
import { POSCategoryFilters } from "./POSCategoryFilters";
import { POSProductGrid } from "./POSProductGrid";

interface ProductCatalogProps {
  onAddToCart: (product: POSProduct) => void;
}

export function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return POS_PRODUCTS.filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="flex flex-col h-full bg-[#F5F1EB] p-5 md:p-6 gap-4 overflow-hidden">
      <POSSearchBar value={search} onChange={setSearch} />
      <POSCategoryFilters
        categories={POS_CATEGORIES}
        active={activeCategory}
        onChange={setActiveCategory}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pos-terminal-scrollbar pr-1">
        <POSProductGrid products={filtered} onAdd={onAddToCart} />
      </div>
    </div>
  );
}
