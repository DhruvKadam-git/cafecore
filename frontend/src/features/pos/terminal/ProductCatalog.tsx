"use client";

import { useMemo, useState } from "react";
import { POSProduct } from "@/lib/pos-product-types";
import { useAsyncData } from "@/hooks/use-async-data";
import { mapPosDataToTerminal, productsApi } from "@/lib/api";
import { POSSearchBar } from "./POSSearchBar";
import { POSCategoryFilters } from "./POSCategoryFilters";
import { POSProductGrid } from "./POSProductGrid";

interface ProductCatalogProps {
  onAddToCart: (product: POSProduct) => void;
  cartQuantities: Record<string, number>;
}

export function ProductCatalog({ onAddToCart, cartQuantities }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data, loading, error, reload } = useAsyncData(async () => {
    const products = await productsApi.getPosData();
    return mapPosDataToTerminal(products);
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.products.filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [data, activeCategory, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F5F1EB] text-[#8E7A68]">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#F5F1EB] gap-3">
        <p className="text-danger font-semibold">{error}</p>
        <button type="button" onClick={reload} className="text-primary font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F1EB] p-5 md:p-6 gap-4 overflow-hidden">
      <POSSearchBar value={search} onChange={setSearch} />
      <POSCategoryFilters
        categories={data?.categories ?? ["All"]}
        active={activeCategory}
        onChange={setActiveCategory}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pos-terminal-scrollbar pr-1">
        <POSProductGrid
          products={filtered}
          onAdd={onAddToCart}
          cartQuantities={cartQuantities}
        />
      </div>
    </div>
  );
}
