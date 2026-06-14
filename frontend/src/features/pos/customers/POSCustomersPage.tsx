"use client";

import { useMemo, useState } from "react";
import { MOCK_POS_CUSTOMERS } from "@/lib/mock-pos-customers";
import { POSCustomer, POSCustomerFormData } from "@/lib/pos-customer-types";
import { POSCustomersShell } from "./POSCustomersShell";
import { CustomersPageHeader } from "./CustomersPageHeader";
import { CustomerToolbar } from "./CustomerToolbar";
import { CustomerList } from "./CustomerList";
import { CustomerModal } from "./CustomerModal";
import { CustomerDeleteModal } from "./CustomerDeleteModal";

type ModalState =
  | { kind: "add" }
  | { kind: "edit"; customer: POSCustomer }
  | null;

let idCounter = 100;
const newCustomerId = () => `c${idCounter++}`;

function getCurrentMonthYear(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function filterCustomers(customers: POSCustomer[], search: string): POSCustomer[] {
  const query = search.trim().toLowerCase();
  if (!query) return customers;

  return customers.filter((customer) => {
    const haystack = [customer.name, customer.email, customer.phone].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

export function POSCustomersPage() {
  const [customers, setCustomers] = useState<POSCustomer[]>(MOCK_POS_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<POSCustomer | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filteredCustomers = useMemo(
    () => filterCustomers(customers, search),
    [customers, search]
  );

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2400);
  };

  const handleSave = (data: POSCustomerFormData) => {
    if (modal?.kind === "add") {
      const newCustomer: POSCustomer = {
        id: newCustomerId(),
        ...data,
        orderCount: 0,
        totalSpent: 0,
        memberSince: getCurrentMonthYear(),
      };
      setCustomers((prev) => [...prev, newCustomer]);
      showToast(`${data.name} added`);
    } else if (modal?.kind === "edit") {
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === modal.customer.id ? { ...customer, ...data } : customer
        )
      );
      showToast(`${data.name} updated`);
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setCustomers((prev) => prev.filter((customer) => customer.id !== deleteTarget.id));
    showToast(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  };

  return (
    <POSCustomersShell>
      <div className="flex flex-col min-h-full pb-8">
        <CustomersPageHeader count={customers.length} />
        <CustomerToolbar
          search={search}
          onSearchChange={setSearch}
          onAddCustomer={() => setModal({ kind: "add" })}
        />
        <div className="px-6 md:px-8">
          <CustomerList
            customers={filteredCustomers}
            onEdit={(customer) => setModal({ kind: "edit", customer })}
            onDelete={setDeleteTarget}
          />
        </div>
      </div>

      {modal && (
        <CustomerModal
          mode={modal.kind}
          customer={modal.kind === "edit" ? modal.customer : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <CustomerDeleteModal
          customerName={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-sidebar-bg text-white text-[13px] font-semibold px-5 py-2.5 rounded-full shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </POSCustomersShell>
  );
}
