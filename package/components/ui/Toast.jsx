"use client";

import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

const TOAST_CONFIG = {
  success: {
    Icon: CheckCircle2,
    containerCls: "border-emerald-200/60 bg-white/95 dark:border-emerald-500/20 dark:bg-[#0d1117]/95",
    iconCls:      "text-emerald-500",
    dotCls:       "bg-emerald-500",
  },
  error: {
    Icon: XCircle,
    containerCls: "border-rose-200/60 bg-white/95 dark:border-rose-500/20 dark:bg-[#0d1117]/95",
    iconCls:      "text-rose-500",
    dotCls:       "bg-rose-500",
  },
  warning: {
    Icon: AlertTriangle,
    containerCls: "border-amber-200/60 bg-white/95 dark:border-amber-500/20 dark:bg-[#0d1117]/95",
    iconCls:      "text-amber-500",
    dotCls:       "bg-amber-500",
  },
};

/**
 * Toast — premium pill-style notification.
 * Appears at bottom-center with backdrop blur and subtle border glow.
 */
export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const config = TOAST_CONFIG[toast.type] ?? TOAST_CONFIG.success;
  const { Icon, containerCls, iconCls } = config;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[300] flex justify-center px-4">
      <div
        className={`pointer-events-auto animate-in slide-in-from-bottom-3 fade-in duration-300 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl ${containerCls}`}
      >
        <Icon size={16} className={`shrink-0 ${iconCls}`} strokeWidth={2} />
        <span className="text-sm font-medium text-slate-800 dark:text-white max-w-xs">
          {toast.msg}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
