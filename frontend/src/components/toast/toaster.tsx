"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { ToastItem } from "./toast-types";

interface ToasterProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const variantStyles = {
  success: {
    container: "bg-text-heading text-white border-success/30",
    icon: CheckCircle2,
    iconClass: "text-success",
  },
  error: {
    container: "bg-text-heading text-white border-danger/40",
    icon: AlertCircle,
    iconClass: "text-danger",
  },
  info: {
    container: "bg-text-heading text-white border-primary/30",
    icon: Info,
    iconClass: "text-primary",
  },
};

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-full max-w-[420px] px-4 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const styles = variantStyles[toast.variant];
        const Icon = styles.icon;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-[14px] border shadow-xl animate-fade-in theme-transition ${styles.container}`}
            role="status"
          >
            <Icon size={18} className={`shrink-0 mt-0.5 ${styles.iconClass}`} />
            <p className="flex-1 text-[13px] font-semibold leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 p-0.5 rounded-md text-white/50 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
