"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Promotion,
  PromotionDiscountType,
  PromotionFormData,
  PromotionScope,
  PromotionTriggerType,
} from "@/lib/marketing-types";

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PromotionFormData) => void;
  promotion?: Promotion | null;
}

const inputClass =
  "h-[44px] w-full px-4 rounded-[12px] bg-surface border border-border-custom text-[14px] font-medium text-text-heading outline-none focus:border-primary transition-colors placeholder:text-text-muted";

const labelClass = "text-[14px] font-semibold text-text-heading mb-1.5";

export function PromotionModal({
  isOpen,
  onClose,
  onSave,
  promotion,
}: PromotionModalProps) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<PromotionScope>("product");
  const [triggerType, setTriggerType] =
    useState<PromotionTriggerType>("min_qty");
  const [triggerValue, setTriggerValue] = useState("");
  const [discountType, setDiscountType] =
    useState<PromotionDiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(promotion?.name ?? "");
      setScope(promotion?.scope ?? "product");
      setTriggerType(promotion?.triggerType ?? "min_qty");
      setTriggerValue(promotion ? String(promotion.triggerValue) : "");
      setDiscountType(promotion?.discountType ?? "percentage");
      setDiscountValue(promotion ? String(promotion.discountValue) : "");
      setNameError("");
    }
  }, [isOpen, promotion]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Promotion name is required.");
      return;
    }

    const parsedTriggerValue = parseFloat(triggerValue);
    const parsedDiscountValue = parseFloat(discountValue);

    if (
      !triggerValue ||
      isNaN(parsedTriggerValue) ||
      parsedTriggerValue <= 0 ||
      !discountValue ||
      isNaN(parsedDiscountValue) ||
      parsedDiscountValue <= 0
    ) {
      return;
    }

    onSave({
      id: promotion?.id,
      name: trimmedName,
      scope,
      triggerType,
      triggerValue: parsedTriggerValue,
      discountType,
      discountValue: parsedDiscountValue,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="bg-surface border border-border-custom rounded-[20px] w-full max-w-[480px] shadow-xl theme-transition"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-text-heading">
              {promotion ? "Edit Promotion" : "New Promotion"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-text-muted hover:text-text-heading hover:bg-surface transition-colors cursor-pointer theme-transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="Buy 2 Croissants"
              className={`${inputClass} ${nameError ? "border-danger" : ""}`}
            />
            {nameError && (
              <p className="text-[12px] font-semibold text-danger mt-1">
                {nameError}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as PromotionScope)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="product">Product</option>
              <option value="order">Order</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={labelClass}>Trigger type</label>
              <select
                value={triggerType}
                onChange={(e) =>
                  setTriggerType(e.target.value as PromotionTriggerType)
                }
                className={`${inputClass} cursor-pointer`}
              >
                <option value="min_qty">Min Qty</option>
                <option value="min_amount">Min Amount</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Trigger value</label>
              <input
                type="number"
                min="0"
                step={triggerType === "min_qty" ? "1" : "0.01"}
                required
                value={triggerValue}
                onChange={(e) => setTriggerValue(e.target.value)}
                placeholder={triggerType === "min_qty" ? "2" : "30"}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={labelClass}>Discount type</label>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as PromotionDiscountType)
                }
                className={`${inputClass} cursor-pointer`}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed amount</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Discount value</label>
              <input
                type="number"
                min="0"
                step={discountType === "percentage" ? "1" : "0.01"}
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "15" : "5"}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] rounded-[12px] bg-white border border-border-custom text-[14px] font-semibold text-text-heading hover:bg-surface transition-colors cursor-pointer theme-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[44px] rounded-[12px] bg-primary text-white text-[14px] font-semibold hover:brightness-[1.04] transition-all cursor-pointer"
            >
              {promotion ? "Save Promotion" : "Create Promotion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
