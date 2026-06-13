"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, X, ChevronDown, Upload, Trash2, ImageIcon, Banknote, CreditCard, QrCode, LucideIcon } from "lucide-react";
import Image from "next/image";
import { PaymentMethod, PaymentType } from "./types";

const PAYMENT_TYPES: PaymentType[] = ["Cash", "Card", "UPI"];

const typeIconConfig: Record<PaymentType, { icon: LucideIcon; bg: string; color: string; label: string }> = {
  Cash: { icon: Banknote,   bg: "bg-success/10",      color: "text-success",      label: "Cash"   },
  Card: { icon: CreditCard, bg: "bg-sidebar-bg/10",   color: "text-sidebar-bg",   label: "Card"   },
  UPI:  { icon: QrCode,     bg: "bg-primary/10",      color: "text-primary",      label: "UPI QR" },
};

interface PaymentFormProps {
  mode: "add" | "edit";
  initial?: PaymentMethod | null;
  existingNames: string[];
  onSave: (data: Omit<PaymentMethod, "id">) => void;
  onCancel: () => void;
}

export function PaymentForm({ mode, initial, existingNames, onSave, onCancel }: PaymentFormProps) {
  const [name,        setName]        = useState(initial?.name        ?? "");
  const [type,        setType]        = useState<PaymentType>(initial?.type ?? "Cash");
  const [upiId,       setUpiId]       = useState(initial?.upiId       ?? "");
  const [upiQrImage,  setUpiQrImage]  = useState<string | null>(initial?.upiQrImage ?? null);
  const [active,      setActive]      = useState(initial?.active      ?? false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [typeOpen,    setTypeOpen]    = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (type !== "UPI") { setUpiId(""); setUpiQrImage(null); }
  }, [type]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUpiQrImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    const dupeName = existingNames
      .filter(n => mode === "edit" ? n !== initial?.name : true)
      .some(n => n.toLowerCase() === name.trim().toLowerCase());
    if (dupeName) e.name = "A payment method with this name already exists.";
    if (type === "UPI" && !upiId.trim()) e.upiId = "UPI ID is required.";
    if (type === "UPI" && upiId.trim() && !upiId.includes("@"))
      e.upiId = "Enter a valid UPI ID (e.g. cafe@ybl).";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      name: name.trim(),
      type,
      upiId: type === "UPI" ? upiId.trim() : "",
      upiQrImage: type === "UPI" ? upiQrImage : null,
      active,
    });
  };

  return (
    <div className="bg-surface border border-border-custom rounded-[20px] overflow-hidden shadow-sm theme-transition">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom bg-surface">
        <h3 className="text-[15px] font-bold text-text-heading">
          {mode === "add" ? "New Payment Method" : `Edit · ${initial?.name}`}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 rounded-[10px] bg-border-custom hover:bg-border-custom/80 flex items-center justify-center text-text-muted transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-text-heading">
              Payment Method Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
              placeholder="e.g. UPI – Merchant"
              className={`bg-surface border rounded-[12px] px-4 py-3 text-[14px] font-semibold text-text-heading placeholder:text-text-muted outline-none transition-colors theme-transition ${
                errors.name ? "border-danger" : "border-border-custom focus:border-primary"
              }`}
            />
            {errors.name && <p className="text-[12px] font-semibold text-danger">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-text-heading">Type</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setTypeOpen(o => !o)}
                onBlur={() => setTimeout(() => setTypeOpen(false), 150)}
                className="w-full bg-surface border border-border-custom rounded-[12px] px-4 py-3 flex items-center justify-between text-[14px] font-semibold text-text-heading hover:border-primary transition-colors"
              >
                <span className="flex items-center gap-2">
                  {(() => { const Icon = typeIconConfig[type].icon; return <Icon size={16} strokeWidth={1.75} className={typeIconConfig[type].color} />; })()}
                  <span>{type}</span>
                </span>
                <ChevronDown size={16} className={`text-text-muted transition-transform ${typeOpen ? "rotate-180" : ""}`} />
              </button>
              {typeOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-input border border-border-custom rounded-[14px] shadow-xl z-20 py-1.5 overflow-hidden theme-transition">
                  {PAYMENT_TYPES.map(t => {
                    const Icon = typeIconConfig[t].icon;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setType(t); setTypeOpen(false); setErrors(p => ({ ...p, upiId: "" })); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                          type === t ? "bg-primary/10 text-primary" : "text-text-body hover:bg-surface"
                        }`}
                      >
                        <Icon size={16} strokeWidth={1.75} className={typeIconConfig[t].color} />
                        <span>{t}</span>
                        {type === t && <Check size={14} className="ml-auto text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {type === "UPI" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-text-heading">
                UPI ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => { setUpiId(e.target.value); setErrors(p => ({ ...p, upiId: "" })); }}
                placeholder="e.g. cafe@ybl"
                className={`bg-surface border rounded-[12px] px-4 py-3 text-[14px] font-semibold text-text-heading placeholder:text-text-muted outline-none transition-colors font-mono ${
                  errors.upiId ? "border-danger" : "border-border-custom focus:border-primary"
                }`}
              />
              {errors.upiId && <p className="text-[12px] font-semibold text-danger">{errors.upiId}</p>}
              <p className="text-[11px] text-text-muted font-medium">
                Enter your UPI ID — or upload your own QR code on the right.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between bg-surface rounded-[14px] px-4 py-3 border border-border-custom theme-transition">
            <div>
              <p className="text-[13px] font-bold text-text-heading">Activate</p>
              <p className="text-[12px] text-text-muted">
                {active ? "Available at checkout" : "Hidden at checkout"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActive(a => !a)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${active ? "bg-success" : "bg-border-custom"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-input rounded-full shadow transition-transform duration-200 ${active ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-surface hover:bg-border-custom text-text-heading text-[14px] font-bold py-3 rounded-[14px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-primary hover:brightness-105 text-white text-[14px] font-bold py-3 rounded-[14px] transition-all flex items-center justify-center gap-2"
            >
              <Check size={15} strokeWidth={2.5} />
              {mode === "add" ? "Add Method" : "Save Changes"}
            </button>
          </div>
        </div>

        {type === "UPI" ? (
          <div className="flex flex-col gap-4 bg-surface border border-border-custom rounded-[16px] p-5 theme-transition">
            <div className="text-center">
              <p className="text-[14px] font-bold text-text-heading">QR Code</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                Upload your UPI QR code image — displayed at checkout for customers to scan.
              </p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-[14px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group min-h-[80px] px-4 py-4 ${
                upiQrImage
                  ? "border-primary bg-primary/5"
                  : "border-border-custom hover:border-primary hover:bg-primary/5"
              }`}
            >
              {upiQrImage ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-border-custom shrink-0 bg-input">
                    <Image src={upiQrImage} alt="Uploaded QR" fill className="object-contain p-1" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-primary">QR Uploaded ✓</p>
                    <p className="text-[11px] text-text-muted mt-0.5">Click to replace</p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setUpiQrImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="w-8 h-8 rounded-full bg-danger/10 hover:bg-danger flex items-center justify-center shrink-0 transition-colors group/del"
                  >
                    <Trash2 size={13} className="text-danger group-hover/del:text-white transition-colors" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-input border border-border-custom group-hover:border-primary flex items-center justify-center transition-colors">
                    <Upload size={17} className="text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-text-muted group-hover:text-primary transition-colors">
                      Upload QR Image
                    </p>
                    <p className="text-[11px] text-text-muted">PNG, JPG up to 5MB</p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {upiId.trim() && (
              <div className="bg-input border border-border-custom rounded-[12px] px-4 py-2.5 text-center theme-transition">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">UPI Deeplink</p>
                <p className="text-[11px] font-mono text-text-body mt-0.5 break-all">
                  upi://pay?pa={upiId}&pn=Brewhouse
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 bg-surface border border-border-custom rounded-[16px] p-6 theme-transition">
            <div className={`w-20 h-20 rounded-[24px] border border-border-custom flex items-center justify-center shadow-sm ${typeIconConfig[type].bg}`}>
              {(() => { const Icon = typeIconConfig[type].icon; return <Icon size={36} strokeWidth={1.5} className={typeIconConfig[type].color} />; })()}
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold text-text-heading">{type} Payment</p>
              <p className="text-[13px] text-text-muted mt-2 leading-relaxed">
                {type === "Cash"
                  ? "Employee enters cash received and the system calculates change due at checkout."
                  : "Employee enters a card transaction reference number to complete the payment."}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-input border border-border-custom rounded-[12px] px-4 py-2.5">
              <ImageIcon size={14} className="text-text-muted" />
              <p className="text-[12px] text-text-muted font-semibold">No QR code needed for {type}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
