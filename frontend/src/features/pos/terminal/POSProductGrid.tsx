import { POSProduct } from "@/lib/pos-product-types";
import { POSProductCard } from "./POSProductCard";

interface POSProductGridProps {
  products: POSProduct[];
  onAdd: (product: POSProduct) => void;
}

export function POSProductGrid({ products, onAdd }: POSProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#8E7A68]">
        <span className="text-3xl mb-2">🔍</span>
        <span className="text-[14px] font-semibold">No products found</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
      {products.map((product) => (
        <POSProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}
