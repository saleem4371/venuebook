"use client";

/**
 * /app/[locale]/[country]/account/settings/components/ui.jsx
 *
 * Shared visual primitives for the Account Settings module ONLY. This is a
 * deliberately separate module from /profile — per the brief, Account
 * Settings is not a dashboard widget set, it is where the account is
 * permanently managed. These primitives still use the exact same design
 * tokens already established across venuebook.in (violet-600 accent, white/
 * gray-900 surfaces, soft `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`, gray-100/
 * gray-800 hairlines) so the module reads as part of the same product, not
 * a bolt-on — no new colors are introduced anywhere in this file.
 *
 * `SlideOverPanel` is imported (not duplicated) from the Profile feature's
 * shared ui.jsx — it is a generic drawer shell with no Profile-specific
 * logic baked in, so reusing it satisfies "reuse existing components
 * wherever possible" without touching or depending on Profile page state.
 */

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronRight, IconArrowLeft, IconX, IconAlertTriangle } from "@tabler/icons-react";

import { SlideOverPanel } from "@/app/[locale]/[country]/profile/components/shared/ui";

/* ═══════════════════════════════════════════════════════════════════════
   BREADCRUMB — "Profile > Account Settings", per spec.
   ═══════════════════════════════════════════════════════════════════════ */
export function Breadcrumb({ profileHref, current }) {
  const t = useTranslations("accountSettings.breadcrumb");
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[14px] text-gray-500 dark:text-gray-400 mb-1">
      <Link href={profileHref} className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium">
        {t("profile")}
      </Link>
      <IconChevronRight size={14} className="shrink-0 rtl:rotate-180" />
      <span className="text-gray-900 dark:text-gray-50 font-semibold">{current || t("settings")}</span>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SETTINGS CARD — the base "premium card" every section's content sits in.
   24px padding / 16px radius, per spec (not the profile dashboard's
   rounded-3xl — a slightly tighter radius reads more "settings", less
   "dashboard widget", while staying on the same token system).
   ═══════════════════════════════════════════════════════════════════════ */
export function SettingsCard({ children, className = "", noPad = false }) {
  return (
    <div className={`${noPad ? "" : "p-8 lg:p-11"} ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeader({ title, subtitle, icon, action, backHref }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="flex items-center gap-3 text-[21px] sm:text-[24px] font-bold text-gray-900 dark:text-gray-50">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back"
              className="shrink-0 w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
              <IconArrowLeft size={18} stroke={1.75} className="rtl:rotate-180" />
            </Link>
          )}
          {icon}
          {title}
        </h1>
        {subtitle && <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-2 max-w-xl ml-12">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardHeading({ title, subtitle, icon, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-6">
      <div className="min-w-0 flex items-center gap-3.5">
        {icon && (
          <span className="shrink-0 w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold text-gray-900 dark:text-gray-50">{title}</h2>
          {subtitle && <p className="text-[13.5px] text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ROW ITEM — Label / current value / Edit button. The core building block
   for Personal Information, Login & Security, Payments, Addresses.
   ═══════════════════════════════════════════════════════════════════════ */
export function RowItem({ label, value, placeholder, onEdit, editLabel, icon, badge, last = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-6 ${
        last ? "" : "border-b border-gray-100 dark:border-gray-800"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {icon && (
          <span className="shrink-0 w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center text-gray-500 dark:text-gray-400">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-[16px] font-semibold text-gray-900 dark:text-gray-50 truncate mt-1">
            {value || <span className="text-gray-400 dark:text-gray-500 font-normal">{placeholder}</span>}
          </p>
        </div>
        {badge}
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 px-6 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          {editLabel}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TOGGLE SWITCH — real, accessible, violet-accented.
   ═══════════════════════════════════════════════════════════════════════ */
export function ToggleSwitch({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-700"}`}
    >
      <motion.span
        layout
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm rtl:right-0.5"
        style={{ left: checked ? "calc(100% - 1.25rem - 2px)" : "2px" }}
      />
    </button>
  );
}

export function ToggleRow({ label, description, checked, onChange, disabled, last = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3.5 ${last ? "" : "border-b border-gray-100 dark:border-gray-800"}`}>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-50">{label}</p>
        {description && <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} label={label} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BUTTONS — same pill language as the rest of venuebook.in.
   ═══════════════════════════════════════════════════════════════════════ */
export function PrimaryButton({ children, className = "", as: As = "button", ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-gray-900 text-[13px] font-semibold transition-all duration-200 active:scale-[0.97] ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export function SecondaryButton({ children, className = "", as: As = "button", ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[13px] font-semibold transition-all duration-200 active:scale-[0.97] ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export function DangerButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-[13px] font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STATUS PILL — verified / connected / active indicators.
   ═══════════════════════════════════════════════════════════════════════ */
const PILL_TONES = {
  green: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/40",
  violet: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/40",
  amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/40",
  gray: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

export function StatusPill({ label, tone = "gray" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border shrink-0 ${PILL_TONES[tone] || PILL_TONES.gray}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EDIT DRAWER — every "Edit" click opens this, never inline editing (per
   spec). Wraps the existing SlideOverPanel and adds Esc-to-close + a
   dirty-state "unsaved changes" indicator next to the title.
   ═══════════════════════════════════════════════════════════════════════ */
export function EditDrawer({ open, onClose, title, dirty = false, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <SlideOverPanel open={open} onClose={onClose} title={title}>
      {dirty && <UnsavedBadge className="mb-4" />}
      {children}
    </SlideOverPanel>
  );
}

export function UnsavedBadge({ className = "" }) {
  const t = useTranslations("accountSettings.common");
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-semibold ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      {t("unsavedChanges")}
    </span>
  );
}

export function FormField({ label, className = "", children }) {
  return (
    <div className={className}>
      <label className="block text-[11.5px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-gray-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-colors ${props.className || ""}`}
    />
  );
}

export function SelectInput({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-gray-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-colors ${className}`}
    >
      {children}
    </select>
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-gray-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-colors resize-none ${props.className || ""}`}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CONFIRM DIALOG — centered modal, reused for every destructive action
   (logout device, disconnect account, delete data) so there is exactly one
   confirmation pattern in the module.
   ═══════════════════════════════════════════════════════════════════════ */
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, cancelLabel, danger = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const tCommon = useTranslations("accountSettings.common");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? "bg-red-100 dark:bg-red-900/40" : "bg-violet-100 dark:bg-violet-900/40"}`}>
                <IconAlertTriangle size={18} className={danger ? "text-red-600" : "text-violet-600"} />
              </span>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <IconX size={16} />
              </button>
            </div>
            <h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">{title}</h4>
            {description && <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-1.5">{description}</p>}
            <div className="flex gap-2 mt-5">
              <SecondaryButton className="flex-1" onClick={onClose}>
                {cancelLabel || tCommon("cancel")}
              </SecondaryButton>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 rounded-full text-white text-[13px] font-semibold transition-colors ${
                  danger ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {confirmLabel || tCommon("confirm")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SKELETONS — section-switch loading state, never a blank flash.
   ═══════════════════════════════════════════════════════════════════════ */
export function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="h-3.5 w-72 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-1">
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-3.5 w-40 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
            <div className="h-7 w-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EMPTY STATE — reused wherever a section has no data yet.
   ═══════════════════════════════════════════════════════════════════════ */
export function EmptyRow({ icon, title, subtitle, cta }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-5 rounded-2xl bg-gray-50/60 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700">
      <div className="w-11 h-11 rounded-full bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50 mb-1">{title}</p>
      {subtitle && <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-4 max-w-xs">{subtitle}</p>}
      {cta}
    </div>
  );
}
