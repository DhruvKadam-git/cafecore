"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Eye, EyeOff } from "lucide-react";
import { User, UserRole, UserStatus } from "./types";

const AVATAR_COLORS = [
  "#C9783A","#866443","#5B8FA8","#789658","#9B6A9B",
  "#D6A144","#D55C4C","#4A7C8A","#7C9C57","#A86D4D",
];

type ModalMode = "add" | "edit" | "view" | "password";

interface UserModalProps {
  mode: ModalMode;
  user?: User | null;
  onSave: (data: Omit<User, "id"> & { password?: string }) => void;
  onClose: () => void;
}

export function UserModal({ mode, user, onSave, onClose }: UserModalProps) {
  const [name,        setName]        = useState(user?.name        ?? "");
  const [email,       setEmail]       = useState(user?.email       ?? "");
  const [role,        setRole]        = useState<UserRole>(user?.role   ?? "Employee");
  const [status,      setStatus]      = useState<UserStatus>(user?.status ?? "Active");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor ?? AVATAR_COLORS[0]);
  const [password,    setPassword]    = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [mounted,     setMounted]     = useState(false);
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRef.current = document.body;
    setMounted(true);
  }, []);

  const readOnly = mode === "view";

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode !== "password" && mode !== "view") {
      if (!name.trim())  e.name  = "Name is required.";
      if (!email.trim()) e.email = "Email is required.";
      if (email && !/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email.";
    }
    if (mode === "add" || mode === "password") {
      if (!password)             e.password = "Password is required.";
      if (password.length < 6)   e.password = "Minimum 6 characters.";
      if (password !== confirmPw) e.confirm  = "Passwords do not match.";
    }
    return e;
  };

  const handleSave = () => {
    if (readOnly) { onClose(); return; }
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      name: name.trim(),
      email: email.trim(),
      role, status, avatarColor,
      joinedAt: user?.joinedAt ?? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      ...(password ? { password } : {}),
    });
  };

  const titles: Record<ModalMode, string> = {
    add:      "New User",
    edit:     "Edit User",
    view:     "User Details",
    password: "Change Password",
  };

  if (!mounted || !portalRef.current) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border-custom rounded-[20px] shadow-xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col theme-transition">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom/60 bg-surface sticky top-0 z-10 rounded-t-[20px] theme-transition">
          <h3 className="text-[18px] font-bold text-text-heading">{titles[mode]}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-text-muted hover:text-text-heading hover:bg-border-custom/50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">

          {/* Password change form */}
          {mode === "password" && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-[15px]"
                  style={{ backgroundColor: user?.avatarColor }}>
                  {user?.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-text-heading">{user?.name}</p>
                  <p className="text-[12px] text-text-muted">{user?.email}</p>
                </div>
              </div>
              <PasswordField label="New Password" value={password} onChange={setPassword}
                show={showPw} onToggle={() => setShowPw(s => !s)} error={errors.password} />
              <PasswordField label="Confirm Password" value={confirmPw} onChange={setConfirmPw}
                show={showPw} onToggle={() => setShowPw(s => !s)} error={errors.confirm} />
            </>
          )}

          {/* Add / Edit / View form */}
          {mode !== "password" && (
            <>
              {/* Avatar color picker */}
              {!readOnly && (
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-text-body uppercase tracking-wider">Avatar Color</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setAvatarColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${avatarColor === c ? "border-text-heading scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-text-body uppercase tracking-wider">Name *</label>
                <input type="text" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({...p, name:""})); }}
                  readOnly={readOnly} placeholder="e.g. Jamie Sullivan"
                  className={`h-[42px] px-3.5 rounded-[10px] bg-input border text-[14px] font-medium text-text-heading outline-none transition-all placeholder:text-text-muted ${
                    errors.name ? "border-danger" : "border-border-custom focus:border-primary focus:ring-2 focus:ring-primary/10"
                  } ${readOnly ? "opacity-70 cursor-default" : ""}`} />
                {errors.name && <p className="text-[12px] text-danger font-semibold">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-text-body uppercase tracking-wider">Email *</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email:""})); }}
                  readOnly={readOnly} placeholder="e.g. jamie@brewhouse.co"
                  className={`h-[42px] px-3.5 rounded-[10px] bg-input border text-[14px] font-medium text-text-heading outline-none transition-all placeholder:text-text-muted ${
                    errors.email ? "border-danger" : "border-border-custom focus:border-primary focus:ring-2 focus:ring-primary/10"
                  } ${readOnly ? "opacity-70 cursor-default" : ""}`} />
                {errors.email && <p className="text-[12px] text-danger font-semibold">{errors.email}</p>}
              </div>

              {/* Role + Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-text-body uppercase tracking-wider">Role</label>
                  {readOnly ? (
                    <p className="h-[42px] flex items-center px-3.5 text-[14px] font-semibold text-text-heading">{role}</p>
                  ) : (
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)}
                      className="h-[42px] px-3.5 rounded-[10px] bg-input border border-border-custom text-[14px] font-semibold text-text-heading outline-none focus:border-primary transition-all cursor-pointer">
                      <option value="Employee">Employee</option>
                      <option value="Admin">Admin</option>
                    </select>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-text-body uppercase tracking-wider">Status</label>
                  {readOnly ? (
                    <p className="h-[42px] flex items-center px-3.5 text-[14px] font-semibold text-text-heading">{status}</p>
                  ) : (
                    <select value={status} onChange={e => setStatus(e.target.value as UserStatus)}
                      className="h-[42px] px-3.5 rounded-[10px] bg-input border border-border-custom text-[14px] font-semibold text-text-heading outline-none focus:border-primary transition-all cursor-pointer">
                      <option value="Active">Active</option>
                      <option value="Archived">Archived</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Password (add mode only) */}
              {mode === "add" && (
                <>
                  <PasswordField label="Password *" value={password} onChange={setPassword}
                    show={showPw} onToggle={() => setShowPw(s=>!s)} error={errors.password} />
                  <PasswordField label="Confirm Password *" value={confirmPw} onChange={setConfirmPw}
                    show={showPw} onToggle={() => setShowPw(s=>!s)} error={errors.confirm} />
                </>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="h-[40px] px-5 rounded-[12px] bg-surface text-text-body text-[14px] font-bold hover:bg-border-custom transition-colors cursor-pointer">
              {readOnly ? "Close" : "Cancel"}
            </button>
            {!readOnly && (
              <button type="button" onClick={handleSave}
                className="h-[40px] px-5 rounded-[12px] bg-primary text-white text-[14px] font-bold hover:brightness-105 transition-all shadow-sm cursor-pointer">
                {mode === "add" ? "Create User" : mode === "password" ? "Update Password" : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    portalRef.current
  );
}

// ── Reusable password field ───────────────────────────────────────────────────
function PasswordField({ label, value, onChange, show, onToggle, error }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-bold text-text-body uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          className={`w-full h-[42px] px-3.5 pr-10 rounded-[10px] bg-input border text-[14px] font-medium text-text-heading outline-none transition-all placeholder:text-text-muted ${
            error ? "border-danger" : "border-border-custom focus:border-primary focus:ring-2 focus:ring-primary/10"
          }`} />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading transition-colors">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-[12px] text-danger font-semibold">{error}</p>}
    </div>
  );
}
