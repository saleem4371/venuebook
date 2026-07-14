"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/ui.jsx
 *
 * Shared visual primitives for the redesigned Customer Profile dashboard.
 * Not a new design system — these mirror the tokens already established in
 * collections/page.jsx (rounded-3xl cards, shadow-[0_2px_8px_rgba(0,0,0,0.04)],
 * violet-600 accent, gray-900/gray-500 text on a white/gray-950 surface) so
 * the profile page reads as the same application, not a bolt-on.
 *
 * Kept local to /profile rather than promoted to /components/shared to avoid
 * touching any file outside this feature while redesigning it.
 */

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION CARD — the base "premium card" wrapper every section sits in.
   ═══════════════════════════════════════════════════════════════════════ */
export function SectionCard({ children, className = "", padded = true }) {
  return (
    <div
      className={`rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${
        padded ? "p-4 sm:p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({ title, subtitle, icon, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3.5">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[14.5px] sm:text-[15.5px] font-semibold text-gray-900 dark:text-gray-50">
          {icon}
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BUTTONS — consistent pill actions used across every section.
   ═══════════════════════════════════════════════════════════════════════ */
export function PrimaryButton({ children, className = "", as: As = "button", ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[12.5px] font-semibold transition-all duration-200 active:scale-[0.97] ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export function SecondaryButton({ children, className = "", as: As = "button", ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[12.5px] font-semibold transition-all duration-200 active:scale-[0.97] ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export function GhostButton({ children, className = "", as: As = "button", ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[12px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export function ViewAllLink({ href, onClick, children }) {
  const className = "text-[12.5px] font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 transition-colors";
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STATUS BADGE — color-coded pill for booking / payment status.
   ═══════════════════════════════════════════════════════════════════════ */
const STATUS_TONES = {
  green: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/40",
  violet: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/40",
  amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/40",
  red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/40",
  gray: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

export function StatusBadge({ label, tone = "gray", className = "" }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border ${STATUS_TONES[tone] || STATUS_TONES.gray} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PROGRESS BAR — animated fill, used by Profile Completion + Member tier.
   ═══════════════════════════════════════════════════════════════════════ */
export function ProgressBar({ percent = 0, colorClass = "bg-violet-600", trackClass = "bg-gray-100 dark:bg-gray-800", height = "h-2" }) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <div className={`w-full rounded-full overflow-hidden ${height} ${trackClass}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${safe}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`h-full rounded-full ${colorClass}`}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STAT CARD — the 4-up Quick Stats row.
   ═══════════════════════════════════════════════════════════════════════ */
export function StatCard({ label, value, Icon, color = "#7C3AED", loading = false }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] p-3.5 flex items-center gap-2.5 transition-shadow"
    >
      <span
        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full"
        style={{ backgroundColor: `${color}1A` }}
      >
        <Icon size={16} color={color} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        {loading ? (
          <div className="h-5 w-8 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
        ) : (
          <p className="text-[18px] font-bold text-gray-900 dark:text-gray-50 leading-none">{value}</p>
        )}
        <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-1 truncate">{label}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EMPTY STATE — every section's "never leave blank white space" fallback.
   ═══════════════════════════════════════════════════════════════════════ */
export function EmptyState({ icon, title, subtitle, ctaLabel, ctaHref, onCtaClick, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-3xl bg-gray-50/60 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700 ${
        compact ? "py-6 px-4" : "py-8 px-5"
      }`}
    >
      <div className="w-11 h-11 rounded-full bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50 mb-1">{title}</p>
      {subtitle && (
        <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-4 max-w-xs">{subtitle}</p>
      )}
      {ctaHref && (
        <PrimaryButton as={Link} href={ctaHref}>
          {ctaLabel}
        </PrimaryButton>
      )}
      {!ctaHref && onCtaClick && (
        <PrimaryButton onClick={onCtaClick}>{ctaLabel}</PrimaryButton>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SKELETONS — loading placeholders, never a blank flash.
   ═══════════════════════════════════════════════════════════════════════ */
export function SkeletonBlock({ className = "" }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />;
}

export function SkeletonCards({ count = 3, className = "" }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
          <div className="h-36 bg-gray-100 dark:bg-gray-800" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-2/3" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SLIDE-OVER PANEL — shared drawer shell for Settings and "View all
   Bookings". Fixed dashboard has no page scroll, so anything that needs
   full detail (not a glance) lives in here instead of on the main grid.
   ═══════════════════════════════════════════════════════════════════════ */
export function SlideOverPanel({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[560px] bg-white dark:bg-gray-950 shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 sm:p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
