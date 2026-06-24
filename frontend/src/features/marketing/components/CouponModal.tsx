"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Coupon,
  CouponDiscountType,
  CouponFormData,
} from "@/lib/marketing-types";
import { StatusToggle } from "@/features/products/components/StatusToggle";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CouponFormData) => Promise<void>;
  coupon?: Coupon | null;
  existingCodes: string[];
  saving?: boolean;
}

const inputClass =
  "h-[44px] w-full px-4 rounded-[12px] bg-surface border border-border-custom text-[14px] font-medium text-text-heading outline-none focus:border-primary transition-colors placeholder:text-text-muted";

const labelClass = "text-[14px] font-semibold text-text-heading mb-1.5";

export function CouponModal({
  isOpen,
  onClose,
  onSave,
  coupon,
  existingCodes,
  saving = false,
}: CouponModalProps) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] =
    useState<CouponDiscountType>("percentage");
  const [value, setValue] = useState("");
  const [active, setActive] = useState(true);
  const [codeError, setCodeError] = useState("");
  const [valueError, setValueError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCode(coupon?.code ?? "");
      setDiscountType(coupon?.discountType ?? "percentage");
      setValue(coupon ? String(coupon.value) : "");
      setActive(coupon?.active ?? true);
      setCodeError("");
      setValueError("");
    }
  }, [isOpen, coupon]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setCodeError("Coupon code is required.");
      return;
    }

    const numericValue = parseFloat(value);
    if (!value || isNaN(numericValue) || numericValue <= 0) {
      setValueError("Enter a discount value greater than 0.");
      return;
    }

    const isDuplicate = existingCodes
      .filter((c) => (coupon ? c !== coupon.code : true))
      .some((c) => c.toUpperCase() === trimmedCode);

    if (isDuplicate) {
      setCodeError("A coupon with this code already exists.");
      return;
    }

    await onSave({
      id: coupon?.id,
      code: trimmedCode,
      discountType,
      value: numericValue,
      active,
    });
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
              {coupon ? "Edit Coupon" : "New Coupon"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="p-1 rounded-full text-text-muted hover:text-text-heading hover:bg-surface transition-colors cursor-pointer theme-transition disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Coupon code *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeError("");
              }}
              placeholder="BREW10"
              disabled={saving}
              className={`${inputClass} ${codeError ? "border-danger" : ""}`}
            />
            {codeError && (
              <p className="text-[12px] font-semibold text-danger mt-1">
                {codeError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={labelClass}>Discount type</label>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as CouponDiscountType)
                }
                disabled={saving}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed amount</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Value</label>
              <input
                type="number"
                min="0"
                step={discountType === "percentage" ? "1" : "0.01"}
                required
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setValueError("");
                }}
                placeholder={discountType === "percentage" ? "10" : "50"}
                disabled={saving}
                className={`${inputClass} ${valueError ? "border-danger" : ""}`}
              />
              {valueError && (
                <p className="text-[12px] font-semibold text-danger mt-1">
                  {valueError}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[14px] font-semibold text-text-heading">
              Active
            </span>
            <StatusToggle checked={active} onChange={setActive} />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-[44px] rounded-[12px] bg-white border border-border-custom text-[14px] font-semibold text-text-heading hover:bg-surface transition-colors cursor-pointer theme-transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-[44px] rounded-[12px] bg-primary text-white text-[14px] font-semibold hover:brightness-[1.04] transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving..." : coupon ? "Save Coupon" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
