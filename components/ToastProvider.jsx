"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

/**
 * Global toast system.
 *
 * Mount <ToastProvider> once near the root of the app (e.g. in app/layout.jsx,
 * inside <body>, wrapping {children}) so every page and component shares the
 * same notification stack instead of each page rolling its own local <Toast>.
 *
 * Usage from any client component:
 *
 *   import { useToast } from "@/components/toast/ToastProvider";
 *   const toast = useToast();
 *   toast.success("Payment recorded");
 *   toast.error("Could not save changes");
 *   toast.info("Heads up — invoice is locked");
 *   toast.warning("Balance still pending");
 *
 * Each call returns the toast id, which you can pass to toast.dismiss(id)
 * if you need to close it programmatically before its timeout.
 */

const ToastContext = createContext(null);

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-400",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-400",
  },
};

let idCounter = 0;

export function ToastProvider({ children, position = "bottom-center" }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback((message, variant = "info", opts = {}) => {
    const id = ++idCounter;
    const duration = opts.duration ?? 3200;

    setToasts(prev => {
      // Cap the visible stack so a burst of calls (e.g. several API errors
      // firing in quick succession) doesn't pile up indefinitely.
      const next = [...prev, { id, message, variant, ...opts }];
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });

    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }

    return id;
  }, [dismiss]);

  const api = {
    show,
    dismiss,
    success: (msg, opts) => show(msg, "success", opts),
    error: (msg, opts) => show(msg, "error", opts),
    info: (msg, opts) => show(msg, "info", opts),
    warning: (msg, opts) => show(msg, "warning", opts),
  };

  const positionClass = {
    "bottom-center": "bottom-6 left-1/2 -translate-x-1/2 items-center",
    "bottom-right": "bottom-6 right-6 items-end",
    "top-center": "top-6 left-1/2 -translate-x-1/2 items-center",
    "top-right": "top-6 right-6 items-end",
  }[position] || "bottom-6 left-1/2 -translate-x-1/2 items-center";

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className={`fixed z-[100] flex flex-col gap-2 pointer-events-none ${positionClass}`}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const variant = VARIANTS[toast.variant] || VARIANTS.info;
  const Icon = variant.icon;

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-center gap-2.5 bg-slate-900 text-white text-xs font-semibold pl-3.5 pr-2.5 py-2.5 rounded-xl shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-sm"
    >
      <Icon size={15} className={`shrink-0 ${variant.iconClass}`} />
      <span className="leading-snug">{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-1 shrink-0 w-5 h-5 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast() must be used inside a <ToastProvider>. Mount it once near your app root (e.g. app/layout.jsx).");
  }
  return ctx;
}
