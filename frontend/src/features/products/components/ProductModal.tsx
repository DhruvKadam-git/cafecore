"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Product, ProductCategoryOption, ProductFormData } from "@/lib/product-types";
import { X } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData) => void;
  product?: Product | null;
  categories: ProductCategoryOption[];
}

const UOMS = ["Cup", "Can", "Piece", "Plate", "Bottle"];
const TAXES = ["5%", "8%", "10%", "0%"];

export function ProductModal({ isOpen, onClose, onSave, product, categories }: ProductModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [uom, setUom] = useState("Cup");
  const [tax, setTax] = useState("8%");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setName(product ? product.name : "");
    setCategoryId(
      product?.categoryId ||
        categories[0]?.id ||
        ""
    );
    setPrice(product ? product.price.toString() : "");
    setUom(product ? product.uom : "Cup");
    setTax(product ? product.tax : "8%");
    setActive(product ? product.active : true);
  }, [isOpen, product, categories]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || isNaN(parseFloat(price)) || !categoryId) return;

    onSave({
      id: product?.id,
      name: name.trim(),
      categoryId,
      price: parseFloat(price),
      uom,
      tax,
      active,
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-modal-overlay-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border-custom rounded-[20px] shadow-xl w-full max-w-[500px] overflow-hidden flex flex-col theme-transition"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom/60 bg-card-bg theme-transition">
          <h3 className="text-[18px] font-bold text-text-heading font-sans">
            {product ? "Edit Product" : "New Product"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-text-muted hover:text-text-heading hover:bg-border-custom/50 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 font-sans">
          <div className="flex flex-col">
            <label className="text-[13px] font-bold text-text-body mb-1.5 uppercase tracking-wider">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Flat White"
              className="h-[42px] px-3.5 rounded-[10px] bg-white border border-border-custom text-[14px] font-medium text-text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-muted"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[13px] font-bold text-text-body mb-1.5 uppercase tracking-wider">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={categories.length === 0}
                className="h-[42px] px-3.5 rounded-[10px] bg-white border border-border-custom text-[14px] font-semibold text-text-heading outline-none focus:border-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {categories.length === 0 ? (
                  <option value="">No categories — create one first</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[13px] font-bold text-text-body mb-1.5 uppercase tracking-wider">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 5.50"
                className="h-[42px] px-3.5 rounded-[10px] bg-white border border-border-custom text-[14px] font-medium text-text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[13px] font-bold text-text-body mb-1.5 uppercase tracking-wider">
                UOM
              </label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="h-[42px] px-3.5 rounded-[10px] bg-white border border-border-custom text-[14px] font-semibold text-text-heading outline-none focus:border-primary transition-all cursor-pointer"
              >
                {UOMS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[13px] font-bold text-text-body mb-1.5 uppercase tracking-wider">
                Tax Rate
              </label>
              <select
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="h-[42px] px-3.5 rounded-[10px] bg-white border border-border-custom text-[14px] font-semibold text-text-heading outline-none focus:border-primary transition-all cursor-pointer"
              >
                {TAXES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-custom/60 pt-4 mt-2 select-none">
            <span className="text-[14px] font-bold text-text-body">
              Active in Menu
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setActive(!active)}
              className={`relative inline-flex shrink-0 cursor-pointer h-[26px] w-12 rounded-full p-[4px] transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                active ? "bg-success" : "bg-border-custom"
              }`}
            >
              <span
                className={`block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                  active ? "translate-x-[22px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] px-5 rounded-[12px] bg-card-bg text-text-body text-[14px] font-bold hover:bg-border-custom/70 transition-colors cursor-pointer select-none theme-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={categories.length === 0}
              className="h-[40px] px-5 rounded-[12px] bg-primary text-white text-[14px] font-bold hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_2px_4px_rgba(201,120,58,0.2)] cursor-pointer select-none"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
