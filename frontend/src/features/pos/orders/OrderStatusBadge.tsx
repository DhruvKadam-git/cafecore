import { POSOrderStatus } from "@/lib/pos-order-types";

const statusStyles: Record<POSOrderStatus, string> = {
  Paid: "bg-success/10 text-success",
  Draft: "bg-gold/10 text-gold",
  Cancelled: "bg-danger/10 text-danger",
};

interface OrderStatusBadgeProps {
  status: POSOrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center h-7 px-3.5 rounded-full text-[13px] font-semibold select-none theme-transition ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
