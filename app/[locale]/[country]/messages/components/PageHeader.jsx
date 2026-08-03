"use client";

/**
 * PageHeader
 * ──────────────────────────────────────────────────────────────────
 * Shared header used at the top of dashboard pages (Messages, Bookings,
 * Reservations, etc.) — title + subtitle on the left, an optional unread
 * count / status badge next to the title, and an optional actions slot
 * (buttons, filters, search) on the right.
 *
 * Kept intentionally simple and stateless — pages own their own data and
 * just pass in strings/nodes.
 *
 * Props:
 *   title      (string, required)  — main heading
 *   subtitle   (string)            — supporting line under the title
 *   badge      (ReactNode)         — small pill next to the title (e.g. unread count)
 *   actions    (ReactNode)         — right-aligned content (buttons, search, filters)
 *   icon       (ReactNode)         — optional icon shown before the title
 *   onBack     (function)          — if provided, shows a mobile-only back button
 *   className  (string)            — extra classes on the outer wrapper
 */

import { ChevronLeft } from "lucide-react";

export default function PageHeader({ title, subtitle, badge, actions, icon, onBack, className = "" }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-2.5 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="md:hidden mt-0.5 flex items-center justify-center w-8 h-8 -ms-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400 rtl:rotate-180" />
          </button>
        )}

        {icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[18px] sm:text-[20px] font-bold text-gray-900 dark:text-gray-50 leading-tight truncate">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-[12.5px] sm:text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}