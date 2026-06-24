"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { POSCustomer, POSCustomerFormData } from "@/lib/pos-customer-types";

type CustomerModalMode = "add" | "edit";

interface CustomerModalProps {
  mode: CustomerModalMode;
  customer?: POSCustomer | null;
  onSave: (data: POSCustomerFormData) => void;
  onClose: () => void;
}

export function CustomerModal({ mode, customer, onSave, onClose }: CustomerModalProps) {
  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Enter a valid email.";
    if (!phone.trim()) next.phone = "Phone is required.";
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[440px] shadow-2xl theme-transition">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
          <h2 className="text-[20px] font-bold text-text-heading">
            {mode === "add" ? "New Customer" : "Edit Customer"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-[12px] bg-background hover:bg-surface text-text-muted flex items-center justify-center transition-colors theme-transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label htmlFor="customer-name" className="text-[13px] font-semibold text-text-heading">
              Name
            </label>
            <input
              id="customer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1.5 w-full h-11 rounded-[12px] bg-background border px-4 text-[14px] font-medium text-text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all theme-transition ${
                errors.name ? "border-danger" : "border-border-custom"
              }`}
            />
            {errors.name && <p className="text-[12px] text-danger mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="customer-email" className="text-[13px] font-semibold text-text-heading">
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1.5 w-full h-11 rounded-[12px] bg-background border px-4 text-[14px] font-medium text-text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all theme-transition ${
                errors.email ? "border-danger" : "border-border-custom"
              }`}
            />
            {errors.email && <p className="text-[12px] text-danger mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="customer-phone" className="text-[13px] font-semibold text-text-heading">
              Phone
            </label>
            <input
              id="customer-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`mt-1.5 w-full h-11 rounded-[12px] bg-background border px-4 text-[14px] font-medium text-text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all theme-transition ${
                errors.phone ? "border-danger" : "border-border-custom"
              }`}
            />
            {errors.phone && <p className="text-[12px] text-danger mt-1">{errors.phone}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-[14px] bg-background border border-border-custom text-text-heading text-[14px] font-bold hover:bg-surface transition-colors theme-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-[14px] bg-primary hover:brightness-95 text-white text-[14px] font-bold transition-all active:scale-[0.98]"
            >
              {mode === "add" ? "Add Customer" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
