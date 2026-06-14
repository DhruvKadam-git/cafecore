"use client";

import { useMemo, useState } from "react";
import { POSProduct } from "@/lib/pos-product-types";
import { CartItem } from "@/lib/pos-order-utils";
import { POSHeader } from "./POSHeader";
import { ProductCatalog } from "./ProductCatalog";
import { OrderPanel } from "./OrderPanel";
import { FloorPopup } from "@/features/pos/components/FloorPopup";
import { PaymentModal } from "@/features/pos/components/PaymentModal";

interface Table {
  id: number;
  number: string;
  seats: number;
  hasOrder: boolean;
}

export function POSTerminalScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showFloor, setShowFloor] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [kitchenSent, setKitchenSent] = useState(false);
  const [paymentTotal, setPaymentTotal] = useState(0);

  const addToCart = (product: POSProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          emoji: product.emoji,
          quantity: 1,
        },
      ];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.flatMap((i) => {
        const newQty = i.quantity + delta;
        if (newQty <= 0) return [];
        return [{ ...i, quantity: newQty }];
      })
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const sendToKitchen = () => {
    setKitchenSent(true);
    setTimeout(() => setKitchenSent(false), 3000);
  };

  const handleCheckout = (total: number) => {
    setPaymentTotal(total);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setCartItems([]);
    setShowPayment(false);
    setSelectedTable(null);
  };

  // Build a productId → quantity lookup for the product grid highlights
  const cartQuantities = useMemo(
    () =>
      cartItems.reduce<Record<number, number>>((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {}),
    [cartItems]
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F5F1EB]">
      <POSHeader
        tableLabel={selectedTable?.number ?? null}
        onSelectTable={() => setShowFloor(true)}
      />

      {kitchenSent && (
        <div className="shrink-0 flex items-center justify-center gap-2 bg-[#769E4D]/15 text-[#769E4D] text-[13px] font-bold py-2 animate-pulse">
          Order sent to kitchen!
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
        <div className="flex-[3] min-w-0 min-h-0 md:min-h-full overflow-hidden">
          <ProductCatalog onAddToCart={addToCart} cartQuantities={cartQuantities} />
        </div>
        <div className="shrink-0 md:flex-[1] min-w-0 md:min-w-[300px] md:max-w-[370px] border-t md:border-t-0 border-[#D8CCC0] h-[45vh] md:h-auto">
          <OrderPanel
            items={cartItems}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            onSendToKitchen={sendToKitchen}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {showFloor && (
        <FloorPopup
          onClose={() => setShowFloor(false)}
          onSelectTable={(t) => setSelectedTable(t)}
        />
      )}

      {showPayment && (
        <PaymentModal
          total={paymentTotal}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
