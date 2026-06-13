import { POSCustomer } from "@/lib/pos-customer-types";
import { CustomerCard } from "./CustomerCard";

interface CustomerListProps {
  customers: POSCustomer[];
  onEdit: (customer: POSCustomer) => void;
  onDelete: (customer: POSCustomer) => void;
}

export function CustomerList({ customers, onEdit, onDelete }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="py-16 text-center text-text-muted text-[14px] font-semibold">
        No customers match your search.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
