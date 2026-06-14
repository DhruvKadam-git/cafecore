import { POSProduct } from "@/lib/pos-product-types";

interface POSProductCardProps {
  product: POSProduct;
  onAdd: (product: POSProduct) => void;
  cartQty?: number; // quantity currently in cart (0 or undefined = not in cart)
}

export function POSProductCard({ product, onAdd, cartQty = 0 }: POSProductCardProps) {
  const inCart = cartQty > 0;

  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      className={`relative h-[136px] w-full rounded-[18px] p-5 flex flex-col text-left hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D17A3B]/30 ${
        inCart
          ? "bg-[#FDF0E6] border-2 border-[#D17A3B] shadow-[0_0_0_3px_rgba(209,122,59,0.12)]"
          : "bg-[#F5F1EB] border border-[#D7C9BB] hover:border-[#D17A3B]"
      }`}
    >
      {/* Cart quantity badge — top right */}
      {inCart && (
        <span className="absolute top-2.5 right-2.5 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#D17A3B] text-white text-[12px] font-bold flex items-center justify-center leading-none select-none">
          {cartQty}
        </span>
      )}

      <span className="text-[28px] leading-none mb-3">{product.emoji}</span>
      <p className={`text-[18px] font-medium leading-tight flex-1 ${inCart ? "text-[#A85A20] font-semibold" : "text-[#1F1712]"}`}>
        {product.name}
      </p>
      <p className="text-[16px] font-bold text-[#D17A3B] mt-1">${product.price.toFixed(2)}</p>
    </button>
  );
}
