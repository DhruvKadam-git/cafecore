import { POSCustomer } from "@/lib/pos-customer-types";

interface CustomerMetricsProps {
  customer: POSCustomer;
}

export function CustomerMetrics({ customer }: CustomerMetricsProps) {
  return (
    <div className="flex items-center gap-6 md:gap-9 shrink-0">
      <div className="flex flex-col gap-0.5 min-w-[52px]">
        <span className="text-[14px] font-medium text-text-muted">Orders</span>
        <span className="text-[16px] font-bold text-text-heading">{customer.orderCount}</span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-[52px]">
        <span className="text-[14px] font-medium text-text-muted">Spent</span>
        <span className="text-[16px] font-bold text-success">
          ${customer.totalSpent % 1 === 0 ? customer.totalSpent : customer.totalSpent.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-[72px]">
        <span className="text-[14px] font-medium text-text-muted">Since</span>
        <span className="text-[16px] font-bold text-text-heading">{customer.memberSince}</span>
      </div>
    </div>
  );
}
