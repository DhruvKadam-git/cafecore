"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Check, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { Product } from "./categoryProducts";

const UNIT_OPTIONS = ["per piece", "per kg", "per litre", "per dozen", "per serving"];
const TAX_OPTIONS  = [0, 5, 8, 12, 18];

// Generate a consistent bg color from a string (for letter avatars)
function letterAvatarBg(name: string, fallback: string): string {
  if (!name.trim()) return fallback + "33";
  const colors = [
    "#C9783A","#5B8FA8","#D6A144","#789658","#9B6A9B",
    "#4A7C8A","#D55C4C","#866443","#7C9C57","#A86D4D",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface ProductAvatarProps {
  image: string | null;
  name: string;
  categoryColor: string;
  size?: number;
  fontSize?: number;
  radius?: number;
}

export function ProductAvatar({ image, name, categoryColor, size = 44, fontSize = 18, radius = 12 }: ProductAvatarProps) {
  const letter = name.trim() ? name.trim()[0].toUpperCase() : "?";
  const bg = letterAvatarBg(name, categoryColor);

  if (image) {
    // External URL (Unsplash etc.) or base64 upload
    return (
      <div
        className="shrink-0 overflow-hidden relative"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          unoptimized={image.startsWith("data:")}
        />
      </div>
    );
  }

  return (
    <div
      className="shrink-0 flex items-center justify-center font-bold text-white select-none"
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg, fontSize }}
    >
      {letter}
    </div>
  );
}

interface ProductModalProps {
  mode: "add" | "edit";
  initial?: Product | null;
  categoryColor: string;
  categoryName: string;
  onSave: (data: Omit<Product, "id">) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function ProductModal({
  mode, initial, categoryColor, categoryName, onSave, onDelete, onClose,
}: ProductModalProps) {
  const [name,          setName]          = useState(initial?.name          ?? "");
  const [price,         setPrice]         = useState(initial?.price != null ? initial.price.toFixed(2) : "");
  const [unitOfMeasure, setUnitOfMeasure] = useState(initial?.unitOfMeasure ?? "per piece");
  const [tax,           setTax]           = useState(initial?.tax           ?? 5);
  const [description,   setDescription]   = useState(initial?.description   ?? "");
  const [image,         setImage]         = useState<string | null>(initial?.image ?? null);
  const [status,        setStatus]        = useState<"Active"|"Inactive">(initial?.status ?? "Active");
  const [errors,        setErrors]        = useState<Record<string,string>>({});
  const [visible,       setVisible]       = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 220); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!name.trim()) e.name = "Product name is required.";
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) e.price = "Enter a valid price.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      name: name.trim(),
      price: parseFloat(parseFloat(price).toFixed(2)),
      unitOfMeasure, tax,
      description: description.trim(),
      image,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* Sheet */}
      <div className={`relative bg-surface w-full sm:max-w-[500px] sm:rounded-[24px] rounded-t-[24px] shadow-2xl overflow-hidden transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}>
        {/* Color accent */}
        <div className="h-[5px] w-full" style={{ backgroundColor: categoryColor }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
          <div>
            <h3 className="text-[18px] font-bold text-text-heading">
              {mode === "add" ? "Add Product" : "Edit Product"}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[12px] font-semibold text-text-muted">in</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: categoryColor }}>
                {categoryName}
              </span>
            </div>
          </div>
          <button onClick={handleClose} className="w-9 h-9 rounded-[12px] flex items-center justify-center bg-surface hover:bg-border-custom/30 text-text-muted transition-colors theme-transition">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto no-scrollbar max-h-[75vh] px-6 py-5 flex flex-col gap-5">

          {/* Image upload */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-heading">Product Image</label>
            <div className="flex items-center gap-4">
              {/* Avatar preview */}
              <div className="relative shrink-0">
                <ProductAvatar image={image} name={name} categoryColor={categoryColor} size={72} fontSize={28} radius={16} />
                {image && (
                  <button
                    onClick={() => setImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-danger flex items-center justify-center shadow-md hover:brightness-105 transition-colors"
                  >
                    <Trash2 size={11} className="text-white" />
                  </button>
                )}
              </div>

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-border-custom hover:border-primary rounded-[14px] px-4 py-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-surface group-hover:bg-primary/10 flex items-center justify-center transition-colors theme-transition">
                  <Upload size={15} className="text-text-muted group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[13px] font-semibold text-text-muted group-hover:text-primary transition-colors text-center">
                  {image ? "Change image" : "Upload image"}
                </p>
                <p className="text-[11px] text-text-muted text-center">PNG, JPG up to 5MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            {!image && name.trim() && (
              <p className="text-[12px] text-text-muted font-medium">
                No image? We&apos;ll use the letter <span className="font-bold text-text-heading">&quot;{name.trim()[0].toUpperCase()}&quot;</span> as the avatar.
              </p>
            )}
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-text-heading">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
              placeholder="e.g. Espresso Shot"
              className={`bg-surface border rounded-[12px] px-4 py-3 text-[14px] font-semibold text-text-heading placeholder:text-text-muted outline-none transition-colors ${
                errors.name ? "border-danger" : "border-border-custom focus:border-primary"
              }`}
            />
            {errors.name && <p className="text-[12px] font-semibold text-danger">{errors.name}</p>}
          </div>

          {/* Price + Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-text-heading">
                Price <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-bold text-text-muted">$</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={e => { setPrice(e.target.value); setErrors(p => ({ ...p, price: "" })); }}
                  placeholder="0.00"
                  className={`w-full bg-surface border rounded-[12px] pl-7 pr-3 py-3 text-[14px] font-semibold text-text-heading outline-none transition-colors ${
                    errors.price ? "border-danger" : "border-border-custom focus:border-primary"
                  }`}
                />
              </div>
              {errors.price && <p className="text-[12px] font-semibold text-danger">{errors.price}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-text-heading">Tax %</label>
              <div className="flex flex-wrap gap-1.5">
                {TAX_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTax(t)}
                    className={`px-2.5 py-1.5 rounded-[9px] text-[12px] font-bold transition-all ${
                      tax === t ? "text-white shadow-sm" : "bg-surface text-text-muted hover:text-text-body"
                    }`}
                    style={{ backgroundColor: tax === t ? categoryColor : undefined }}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Unit of Measure */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-text-heading">Unit of Measure</label>
            <div className="flex flex-wrap gap-2">
              {UNIT_OPTIONS.map(u => (
                <button
                  key={u}
                  onClick={() => setUnitOfMeasure(u)}
                  className={`px-3 py-1.5 rounded-[10px] text-[12px] font-semibold transition-all border ${
                    unitOfMeasure === u ? "text-white border-transparent" : "bg-surface text-text-muted border-transparent hover:border-border-custom"
                  }`}
                  style={{ backgroundColor: unitOfMeasure === u ? categoryColor : undefined }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-text-heading">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description of the product…"
              rows={2}
              className="bg-surface border border-border-custom rounded-[12px] px-4 py-3 text-[14px] font-medium text-text-heading placeholder:text-text-muted outline-none focus:border-primary transition-colors resize-none theme-transition"
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between bg-surface rounded-[14px] px-4 py-3 theme-transition">
            <div>
              <p className="text-[13px] font-bold text-text-heading">Status</p>
              <p className="text-[12px] text-text-muted">Active products appear in the POS</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={status === "Active"}
              onClick={() => setStatus(s => s === "Active" ? "Inactive" : "Active")}
              className={`relative inline-flex shrink-0 cursor-pointer h-[26px] w-12 rounded-full p-[4px] transition-colors duration-200 ${status === "Active" ? "bg-success" : "bg-border-custom"}`}
            >
              <span className={`block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${status === "Active" ? "translate-x-[22px]" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Preview */}
          <div className="bg-surface border border-border-custom rounded-[14px] px-4 py-3 theme-transition">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <ProductAvatar image={image} name={name} categoryColor={categoryColor} size={44} fontSize={18} radius={12} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-text-heading truncate">{name || "Product Name"}</p>
                <p className="text-[12px] text-text-muted truncate">{description || "Description"}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[15px] font-bold text-text-heading">${price ? parseFloat(price).toFixed(2) : "0.00"}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${status === "Active" ? "bg-success/10 text-success" : "bg-surface text-text-muted"}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 border-t border-border-custom flex gap-3">
          {mode === "edit" && onDelete && (
            !showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-3 rounded-[14px] bg-danger/10 hover:bg-danger/20 text-danger text-[13px] font-bold transition-colors">
                Delete
              </button>
            ) : (
              <button onClick={onDelete} className="px-4 py-3 rounded-[14px] bg-danger hover:brightness-105 text-white text-[13px] font-bold transition-colors">
                Confirm Delete
              </button>
            )
          )}
          <button onClick={handleClose} className="flex-1 bg-surface hover:bg-border-custom/30 text-text-heading text-[14px] font-bold py-3 rounded-[14px] transition-colors theme-transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 text-white text-[14px] font-bold py-3 rounded-[14px] transition-all hover:brightness-90 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ backgroundColor: categoryColor }}
          >
            <Check size={15} strokeWidth={2.5} />
            {mode === "add" ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
