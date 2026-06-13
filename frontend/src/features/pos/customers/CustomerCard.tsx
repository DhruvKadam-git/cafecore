import { Mail, Phone } from "lucide-react";
import { POSCustomer } from "@/lib/pos-customer-types";
import { CustomerAvatar } from "./CustomerAvatar";
import { CustomerMetrics } from "./CustomerMetrics";
import { CustomerActions } from "./CustomerActions";

interface CustomerCardProps {
  customer: POSCustomer;
  onEdit: (customer: POSCustomer) => void;
  onDelete: (customer: POSCustomer) => void;
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  return (
    <div className="bg-surface border border-border-custom rounded-[20px] min-h-[88px] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 hover:bg-background hover:-translate-y-px transition-all duration-200 theme-transition">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <CustomerAvatar name={customer.name} />
        <div className="min-w-0">
          <p className="text-[18px] font-semibold text-text-heading truncate">{customer.name}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-[14px] text-text-muted truncate">
              <Mail size={14} strokeWidth={2} className="shrink-0" />
              {customer.email}
            </span>
            <span className="flex items-center gap-1.5 text-[14px] text-text-muted">
              <Phone size={14} strokeWidth={2} className="shrink-0" />
              {customer.phone}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-16 sm:pl-0">
        <CustomerMetrics customer={customer} />
        <CustomerActions onEdit={() => onEdit(customer)} onDelete={() => onDelete(customer)} />
      </div>
    </div>
  );
}
