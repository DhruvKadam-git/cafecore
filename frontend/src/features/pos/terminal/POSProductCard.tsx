import { POSProduct } from "@/lib/pos-product-types";

interface POSProductCardProps {
  product: POSProduct;
  onAdd: (product: POSProduct) => void;
}

export function POSProductCard({ product, onAdd }: POSProductCardProps) {
  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      className="h-[136px] w-full rounded-[18px] bg-[#F5F1EB] border border-[#D7C9BB] p-5 flex flex-col text-left hover:border-[#D17A3B] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D17A3B]/30"
    >
      <span className="text-[28px] leading-none mb-3">{product.emoji}</span>
      <p className="text-[18px] font-medium text-[#1F1712] leading-tight flex-1">{product.name}</p>
      <p className="text-[16px] font-bold text-[#D17A3B] mt-1">${product.price.toFixed(2)}</p>
    </button>
  );
}
