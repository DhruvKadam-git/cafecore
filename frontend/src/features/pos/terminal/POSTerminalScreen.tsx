"use client";

import { useMemo, useState } from "react";
import { POSProduct } from "@/lib/pos-product-types";
import {
  AppliedCoupon,
  CartItem,
  OrderTotals,
  calculateOrderTotals,
} from "@/lib/pos-order-utils";
import { POSHeader } from "./POSHeader";
import { ProductCatalog } from "./ProductCatalog";
import { OrderPanel } from "./OrderPanel";
import { FloorPopup } from "@/features/pos/components/FloorPopup";
import { PaymentModal } from "@/features/pos/components/PaymentModal";
import { useToast } from "@/components/toast/use-toast";
import { toastApiError } from "@/components/toast/toast-utils";
import { getErrorMessage } from "@/lib/api/errors";
import {
  customersApi,
  marketingApi,
  ordersApi,
  parseAppliedCouponResponse,
  sessionsApi,
} from "@/lib/api";

interface SelectedTable {
  id: string;
  number: string;
  seats: number;
  hasOrder: boolean;
}

export function POSTerminalScreen() {
  const toast = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showFloor, setShowFloor] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTable, setSelectedTable] = useState<SelectedTable | null>(null);
  const [kitchenSent, setKitchenSent] = useState(false);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [serverTotals, setServerTotals] = useState<OrderTotals | null>(null);
  const [busy, setBusy] = useState(false);

  const resetOrderState = () => {
    setActiveOrderId(null);
    setAppliedCoupon(null);
    setServerTotals(null);
  };

  const addToCart = (product: POSProduct) => {
    resetOrderState();
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

  const updateQty = (id: string, delta: number) => {
    resetOrderState();
    setCartItems((prev) =>
      prev.flatMap((i) => {
        const newQty = i.quantity + delta;
        if (newQty <= 0) return [];
        return [{ ...i, quantity: newQty }];
      })
    );
  };

  const removeItem = (id: string) => {
    resetOrderState();
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const resolveCustomerId = async (): Promise<string> => {
    const customers = await customersApi.getCustomers();
    if (customers.length > 0) return customers[0].id;
    const created = await customersApi.createCustomer({
      name: "Walk-in Customer",
      email: `walkin-${Date.now()}@brewhouse.local`,
      phone: "",
    });
    return created.id;
  };

  const ensureOrder = async (): Promise<string> => {
    if (activeOrderId) return activeOrderId;
    if (!selectedTable) throw new Error("Select a table before continuing.");

    const session = await sessionsApi.getCurrentSession();
    if (!session) {
      throw new Error("Open a POS session before taking orders.");
    }

    const existingOrder = await ordersApi.getTableOrder(selectedTable.id);
    if (existingOrder?.id) {
      setActiveOrderId(existingOrder.id);
      return existingOrder.id;
    }

    const customerId = await resolveCustomerId();
    const order = await ordersApi.createOrder({
      sessionId: session.id,
      tableId: selectedTable.id,
      customerId,
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    });

    if (!order?.id) {
      throw new Error("Failed to create order. Please try again.");
    }

    setActiveOrderId(order.id);
    return order.id;
  };

  const handleApplyCoupon = async (code: string) => {
    if (!selectedTable) {
      setShowFloor(true);
      throw new Error("Select a table before applying a coupon.");
    }

    const orderId = await ensureOrder();
    const res = await marketingApi.applyCoupon(orderId, code);
    const parsed = parseAppliedCouponResponse(res, code);
    if (!parsed) {
      throw new Error("Invalid or expired coupon code");
    }

    setAppliedCoupon(parsed.appliedCoupon);
    setServerTotals(parsed.totals);
    toast.success(`Coupon "${parsed.appliedCoupon.code}" applied`);
  };

  const sendToKitchen = async () => {
    if (cartItems.length === 0) return;
    setBusy(true);
    try {
      const orderId = await ensureOrder();
      await ordersApi.sendOrderToKitchen(orderId);
      toast.success("Order sent to kitchen");
      setKitchenSent(true);
      setTimeout(() => setKitchenSent(false), 3000);
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setBusy(false);
    }
  };

  const handleCheckout = (total: number) => {
    if (!selectedTable) {
      toast.error("Select a table before checkout.");
      setShowFloor(true);
      return;
    }
    setPaymentTotal(total);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment successful");
    setCartItems([]);
    setShowPayment(false);
    setSelectedTable(null);
    resetOrderState();
  };

  const cartQuantities = useMemo(
    () =>
      cartItems.reduce<Record<string, number>>((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {}),
    [cartItems]
  );

  const checkoutTotal =
    calculateOrderTotals(cartItems, appliedCoupon, serverTotals).total;

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
            appliedCoupon={appliedCoupon}
            serverTotals={serverTotals}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            onSendToKitchen={sendToKitchen}
            onCheckout={handleCheckout}
            onApplyCoupon={async (code) => {
              try {
                await handleApplyCoupon(code);
              } catch (err) {
                toastApiError(toast, err);
                throw err instanceof Error ? err : new Error(getErrorMessage(err));
              }
            }}
            busy={busy}
          />
        </div>
      </div>

      {showFloor && (
        <FloorPopup
          onClose={() => setShowFloor(false)}
          onSelectTable={(t) => {
            setSelectedTable(t);
            resetOrderState();
          }}
        />
      )}

      {showPayment && (
        <PaymentModal
          total={paymentTotal || checkoutTotal}
          orderId={activeOrderId}
          cartItems={cartItems}
          tableId={selectedTable?.id}
          onEnsureOrder={ensureOrder}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
