"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Check, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { Category } from "./types";

const PRESET_COLORS = [
  "#C9783A", "#866443", "#D6A144", "#789658", "#A86D4D",
  "#D55C4C", "#7C9C57", "#5B8FA8", "#9B6A9B", "#4A7C8A",
  "#E8A45A", "#6B8E5E", "#C4616A", "#7A6E9B", "#3D8B7A",
  "#D4956B", "#8B7355", "#B5C4A0", "#A0B4C8", "#C4A882",
];

interface CategoryModalProps {
  mode: "add" | "edit";
  initial?: Category | null;
  existingNames: string[];
  onSave: (data: { name: string; color: string; image: string | null; imageFile: File | null }) => void;
  onClose: () => void;
}

export function CategoryModal({ mode, initial, existingNames, onSave, onClose }: CategoryModalProps) {
  const [name,        setName]        = useState(initial?.name        ?? "");
  const [color,       setColor]       = useState(initial?.color       ?? PRESET_COLORS[0]);
  const [customColor, setCustomColor] = useState(initial?.color       ?? PRESET_COLORS[0]);
  const [image,       setImage]       = useState<string | null>(initial?.image ?? null);
  const [imageFile,   setImageFile]   = useState<File | null>(null);
  const [nameError,   setNameError]   = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setColor(initial.color);
      setCustomColor(initial.color);
      setImage(initial.image ?? null);
    }
  }, [initial]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) { setNameError("Category name is required."); return; }
    const isDupe = existingNames
      .filter(n => mode === "edit" ? n !== initial?.name : true)
      .some(n => n.toLowerCase() === trimmed.toLowerCase());
    if (isDupe) { setNameError("A category with this name already exists."); return; }
    onSave({ name: trimmed, color, image, imageFile });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div
        className="bg-surface border border-border-custom rounded-[24px] w-full max-w-[460px] shadow-2xl overflow-hidden theme-transition"
        onClick={e => e.stopPropagation()}
      >
        {/* Accent strip */}
        <div className="h-[6px] w-full transition-colors duration-200" style={{ backgroundColor: color }} />

        <div className="p-6 flex flex-col gap-5">
          {/* Title row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-bold text-text-heading">
                {mode === "add" ? "New Category" : "Edit Category"}
              </h2>
              <p className="text-[13px] text-text-muted mt-0.5">
                {mode === "add" ? "Add a new product category" : "Update category details"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-[12px] flex items-center justify-center bg-surface hover:bg-border-custom/30 text-text-muted hover:text-text-heading transition-colors theme-transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Preview pill */}
          <div className="flex items-center gap-3 bg-surface border border-border-custom rounded-[16px] px-4 py-3 theme-transition">
            <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Preview</span>
            <span
              className="px-3.5 py-1.5 rounded-full text-[13px] font-bold text-white shadow-sm select-none transition-all duration-200"
              style={{ backgroundColor: color }}
            >
              {name || "Category Name"}
            </span>
          </div>

          {/* ── Image upload ── */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-heading">Category Image <span className="text-text-muted font-medium">(optional)</span></label>

            {image && typeof image === "string" && image.trim() !== "" ? (
              /* Uploaded image preview */
              <div className="relative rounded-[16px] overflow-hidden border border-[#D8CCBF] group" style={{ height: 140 }}>
                <Image src={image} alt="Category" fill className="object-cover" unoptimized />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-text-heading text-[12px] font-bold px-3 py-2 rounded-[10px] transition-colors"
                  >
                    <Upload size={13} /> Replace
                  </button>
                  <button
                    onClick={() => { setImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="flex items-center gap-1.5 bg-[#D55C4C]/90 hover:bg-[#D55C4C] text-white text-[12px] font-bold px-3 py-2 rounded-[10px] transition-colors"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
                {/* Color tint strip at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-[4px]" style={{ backgroundColor: color }} />
              </div>
            ) : (
              /* Upload zone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D8CCBF] hover:border-[#CB7637] rounded-[16px] px-4 py-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group bg-[#F1ECE5] hover:bg-[#FAEEE0]"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#D8CCBF] group-hover:border-[#CB7637] flex items-center justify-center transition-colors">
                  <Upload size={17} className="text-text-muted group-hover:text-[#CB7637] transition-colors" />
                </div>
                <p className="text-[13px] font-semibold text-text-muted group-hover:text-[#CB7637] transition-colors">
                  Upload category image
                </p>
                <p className="text-[11px] text-text-muted">PNG, JPG up to 5MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-text-heading">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameError(""); }}
              placeholder="e.g. Espresso, Pastries…"
              className={`bg-surface border rounded-[12px] px-4 py-3 text-[14px] font-semibold text-text-heading placeholder:text-text-muted outline-none transition-colors ${
                nameError ? "border-danger focus:border-danger" : "border-border-custom focus:border-primary"
              }`}
            />
            {nameError && (
              <p className="text-[12px] font-semibold text-danger">{nameError}</p>
            )}
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[13px] font-bold text-text-heading">Color</label>
            <div className="grid grid-cols-10 gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setCustomColor(c); }}
                  className="w-8 h-8 rounded-[10px] border-2 flex items-center justify-center transition-all duration-150 hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "var(--text-heading)" : "transparent",
                    boxShadow: color === c ? "0 0 0 2px white, 0 0 0 4px " + c : "none",
                  }}
                >
                  {color === c && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>

            {/* Custom hex input */}
            <div className="flex items-center gap-3 bg-surface border border-border-custom rounded-[12px] px-3 py-2 theme-transition">
              <div
                className="w-7 h-7 rounded-[8px] border border-white/30 shrink-0 shadow-sm transition-all duration-200"
                style={{ backgroundColor: color }}
              />
              <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Custom</span>
              <input type="color" value={customColor}
                onChange={e => { setCustomColor(e.target.value); setColor(e.target.value); }}
                className="flex-1 h-7 cursor-pointer rounded bg-transparent border-none outline-none" />
              <span className="text-[12px] font-mono font-bold text-text-body uppercase">{color}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 bg-surface hover:bg-border-custom/30 text-text-heading text-[14px] font-bold py-3 rounded-[14px] transition-colors theme-transition"
            >
              Cancel
            </button>
            <button onClick={handleSave}
              className="flex-1 text-white text-[14px] font-bold py-3 rounded-[14px] transition-all hover:brightness-90 active:scale-[0.98]"
              style={{ backgroundColor: color }}>
              {mode === "add" ? "Create Category" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
