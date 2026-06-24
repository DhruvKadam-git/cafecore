"use client";

import { useMemo, useState } from "react";
import { POSCustomer, POSCustomerFormData } from "@/lib/pos-customer-types";
import { POSCustomersShell } from "./POSCustomersShell";
import { CustomersPageHeader } from "./CustomersPageHeader";
import { CustomerToolbar } from "./CustomerToolbar";
import { CustomerList } from "./CustomerList";
import { CustomerModal } from "./CustomerModal";
import { CustomerDeleteModal } from "./CustomerDeleteModal";
import { useAsyncData } from "@/hooks/use-async-data";
import { useToast } from "@/components/toast/use-toast";
import { toastApiError } from "@/components/toast/toast-utils";
import { customersApi, mapCustomerToPOSCustomer } from "@/lib/api";

type ModalState =
  | { kind: "add" }
  | { kind: "edit"; customer: POSCustomer }
  | null;

function filterCustomers(customers: POSCustomer[], search: string): POSCustomer[] {
  const query = search.trim().toLowerCase();
  if (!query) return customers;

  return customers.filter((customer) => {
    const haystack = [customer.name, customer.email, customer.phone].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

export function POSCustomersPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const apiCustomers = await customersApi.getCustomers();
      return apiCustomers.map(mapCustomerToPOSCustomer);
    },
    [],
    { toastOnError: true }
  );

  const customers = data ?? [];

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<POSCustomer | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredCustomers = useMemo(
    () => filterCustomers(customers, search),
    [customers, search]
  );

  const handleSave = async (data: POSCustomerFormData) => {
    setSaving(true);
    try {
      if (modal?.kind === "add") {
        await customersApi.createCustomer(data);
        toast.success(`${data.name} added`);
      } else if (modal?.kind === "edit") {
        await customersApi.updateCustomer(modal.customer.id, data);
        toast.success(`${data.name} updated`);
      }
      setModal(null);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await customersApi.deleteCustomer(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <POSCustomersShell>
      <div className="flex flex-col min-h-full pb-8">
        <CustomersPageHeader count={customers.length} />
        {error && (
          <div className="mx-6 md:mx-8 mb-4 flex items-center justify-between bg-danger/10 text-danger rounded-[12px] px-4 py-3 text-[13px] font-semibold">
            <span>{error}</span>
            <button type="button" onClick={reload} className="underline">
              Retry
            </button>
          </div>
        )}
        <CustomerToolbar
          search={search}
          onSearchChange={setSearch}
          onAddCustomer={() => setModal({ kind: "add" })}
        />
        <div className="px-6 md:px-8">
          {loading ? (
            <div className="text-center py-16 text-text-muted">Loading customers...</div>
          ) : (
            <CustomerList
              customers={filteredCustomers}
              onEdit={(customer) => setModal({ kind: "edit", customer })}
              onDelete={setDeleteTarget}
            />
          )}
        </div>
      </div>

      {modal && (
        <CustomerModal
          mode={modal.kind}
          customer={modal.kind === "edit" ? modal.customer : null}
          onSave={handleSave}
          onClose={() => !saving && setModal(null)}
        />
      )}

      {deleteTarget && (
        <CustomerDeleteModal
          customerName={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => !saving && setDeleteTarget(null)}
        />
      )}
    </POSCustomersShell>
  );
}
