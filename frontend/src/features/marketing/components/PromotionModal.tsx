"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Promotion,
  PromotionDiscountType,
  PromotionFormData,
  PromotionScope,
} from "@/lib/marketing-types";

interface ProductOption {
  id: string;
  name: string;
}

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PromotionFormData) => void;
  promotion?: Promotion | null;
  products?: ProductOption[];
}

const inputClass =
  "h-[44px] w-full px-4 rounded-[12px] bg-surface border border-border-custom text-[14px] font-medium text-text-heading outline-none focus:border-primary transition-colors placeholder:text-text-muted";

const labelClass = "text-[14px] font-semibold text-text-heading mb-1.5";

export function PromotionModal({
  isOpen,
  onClose,
  onSave,
  promotion,
  products = [],
}: PromotionModalProps) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<PromotionScope>("product");
  const [productId, setProductId] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [discountType, setDiscountType] =
    useState<PromotionDiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [nameError, setNameError] = useState("");
  const [productError, setProductError] = useState("");
  const [thresholdError, setThresholdError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(promotion?.name ?? "");
      setScope(promotion?.scope ?? "product");
      setProductId(promotion?.productId ?? "");
      setMinQuantity(promotion?.minQuantity ? String(promotion.minQuantity) : "");
      setMinOrderAmount(
        promotion?.minOrderAmount ? String(promotion.minOrderAmount) : ""
      );
      setDiscountType(promotion?.discountType ?? "percentage");
      setDiscountValue(promotion ? String(promotion.discountValue) : "");
      setNameError("");
      setProductError("");
      setThresholdError("");
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

    if (scope === "product" && !productId) {
      setProductError("Product is required for product-scoped promotions.");
      return;
    }

    const parsedDiscountValue = parseFloat(discountValue);
    if (
      !discountValue ||
      isNaN(parsedDiscountValue) ||
      parsedDiscountValue <= 0
    ) {
      return;
    }

    let parsedMinQuantity: number | undefined;
    let parsedMinOrderAmount: number | undefined;

    if (scope === "product") {
      parsedMinQuantity = parseFloat(minQuantity);
      if (!minQuantity || isNaN(parsedMinQuantity) || parsedMinQuantity <= 0) {
        setThresholdError("Minimum quantity must be greater than 0.");
        return;
      }
    } else {
      parsedMinOrderAmount = parseFloat(minOrderAmount);
      if (
        !minOrderAmount ||
        isNaN(parsedMinOrderAmount) ||
        parsedMinOrderAmount <= 0
      ) {
        setThresholdError("Minimum order amount must be greater than 0.");
        return;
      }
    }

    setThresholdError("");
    setProductError("");

    onSave({
      id: promotion?.id,
      name: trimmedName,
      scope,
      productId: scope === "product" ? productId : undefined,
      minQuantity: parsedMinQuantity,
      minOrderAmount: parsedMinOrderAmount,
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
              onChange={(e) => {
                setScope(e.target.value as PromotionScope);
                setProductError("");
                setThresholdError("");
              }}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="product">Product</option>
              <option value="order">Order</option>
            </select>
          </div>

          {scope === "product" ? (
            <>
              <div className="flex flex-col">
                <label className={labelClass}>Product *</label>
                <select
                  value={productId}
                  onChange={(e) => {
                    setProductId(e.target.value);
                    setProductError("");
                  }}
                  className={`${inputClass} cursor-pointer ${productError ? "border-danger" : ""}`}
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {productError && (
                  <p className="text-[12px] font-semibold text-danger mt-1">
                    {productError}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className={labelClass}>Minimum quantity *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={minQuantity}
                  onChange={(e) => {
                    setMinQuantity(e.target.value);
                    setThresholdError("");
                  }}
                  placeholder="3"
                  className={`${inputClass} ${thresholdError ? "border-danger" : ""}`}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col">
              <label className={labelClass}>Minimum order amount *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={minOrderAmount}
                onChange={(e) => {
                  setMinOrderAmount(e.target.value);
                  setThresholdError("");
                }}
                placeholder="1000"
                className={`${inputClass} ${thresholdError ? "border-danger" : ""}`}
              />
            </div>
          )}

          {thresholdError && (
            <p className="text-[12px] font-semibold text-danger -mt-3">
              {thresholdError}
            </p>
          )}

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
