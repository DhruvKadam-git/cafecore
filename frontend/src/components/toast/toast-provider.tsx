"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastApi, ToastItem, ToastVariant } from "./toast-types";
import { Toaster } from "./toaster";

const MAX_VISIBLE = 3;
const DURATION_MS: Record<ToastVariant, number> = {
  success: 3500,
  error: 5000,
  info: 3500,
};

interface ToastContextValue extends ToastApi {
  toasts: ToastItem[];
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;

function nextId() {
  toastCounter += 1;
  return `toast-${toastCounter}-${Date.now()}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = nextId();
      const item: ToastItem = { id, message, variant };

      setToasts((prev) => [item, ...prev].slice(0, MAX_VISIBLE));

      const timer = setTimeout(() => dismiss(id), DURATION_MS[variant]);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const success = useCallback((message: string) => push(message, "success"), [push]);
  const error = useCallback((message: string) => push(message, "error"), [push]);
  const info = useCallback((message: string) => push(message, "info"), [push]);

  const value = useMemo(
    () => ({ toasts, success, error, info, dismiss }),
    [toasts, success, error, info, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return { success: ctx.success, error: ctx.error, info: ctx.info, dismiss: ctx.dismiss };
}
