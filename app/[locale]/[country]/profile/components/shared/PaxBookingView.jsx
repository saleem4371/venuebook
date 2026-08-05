"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/PaxBookingView.jsx
 *
 * Rendered by ManageBookingView.jsx INSTEAD of the normal tabbed
 * Overview/Edit/Payment/Cancel UI whenever `booking.bookingStatus === "pax"`.
 *
 * A "pax" booking represents a multi-package inquiry/hold (e.g. a group
 * booking still choosing between several package options) rather than a
 * single confirmed line item, so it gets its own page: every package the
 * customer is considering, a running summary, and a way to jump into the
 * conversation with the vendor about it — instead of the payment/cancel
 * tabs which don't make sense until one package is actually chosen.
 *
 * SCOPE DECISIONS:
 *   - Packages are read from `booking.packages` (array). If it's missing
 *     or empty, an empty state is shown rather than crashing — same
 *     defensive fallback pattern ManageBookingView.jsx uses for money
 *     fields that may not exist on every mock booking yet.
 *   - "Chat" is just a Link into the existing /messages route (same
 *     pattern as the Sidebar's "Contact Support" button in
 *     ManageBookingView.jsx) — no inline chat UI, no new endpoint.
 *   - Summary card totals fall back to summing package prices when the
 *     booking doesn't carry its own total_amount/amount yet.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Users,
  CalendarDays,
  MessageCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";

import { CATEGORY_COLORS } from "../../data/mockProfileData";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric" }).format(
    new Date(date),
  );

/* ── Local card/row primitives (kept self-contained so this file doesn't
   depend on ManageBookingView.jsx's un-exported helpers) ───────────────── */
function Card({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
      <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
        {description && (
          <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value, bold, highlight, accentColor = CATEGORY_COLORS.venues }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        highlight ? "p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40" : ""
      }`}
    >
      <span
        className={`text-[13px] ${
          bold ? "font-semibold text-gray-900 dark:text-gray-50" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
      </span>
      <span
        style={highlight ? { color: accentColor } : undefined}
        className={`font-semibold ${highlight ? "text-[16px]" : "text-[13px] text-gray-900 dark:text-gray-50"}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Package card ─────────────────────────────────────────────────────── */
function PackageCard({ pkg, format, categoryColor, selected }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={selected ? { borderColor: categoryColor, backgroundColor: `${categoryColor}0D` } : undefined}
      className={`rounded-2xl border p-4 space-y-3 ${
        selected ? "" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${categoryColor}14` }}
          >
            <Package size={16} style={{ color: categoryColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50 truncate">
              {pkg.name}
            </p>
            {pkg.description && (
              <p className="text-[11.5px] text-gray-500 dark:text-gray-400 line-clamp-2">
                {pkg.description}
              </p>
            )}
          </div>
        </div>

        {selected ? (
          <CheckCircle2 size={18} style={{ color: categoryColor }} className="shrink-0" />
        ) : (
          <Circle size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 text-[11.5px] text-gray-500 dark:text-gray-400">
          {pkg.guests != null && (
            <span className="flex items-center gap-1">
              <Users size={12} /> {pkg.guests}
            </span>
          )}
          {pkg.date && (
            <span className="flex items-center gap-1">
              <CalendarDays size={12} /> {formatDate(pkg.date)}
            </span>
          )}
        </div>
        <span className="text-[14px] font-bold text-gray-900 dark:text-gray-50">
          {format(pkg.price ?? 0)}
        </span>
      </div>
    </motion.div>
  );
}

/* ── Main view ────────────────────────────────────────────────────────── */
export function PaxBookingView({ booking: b, t, format, locale, country, categoryColor, onBack }) {
  const packages = Array.isArray(b.packages) ? b.packages : [];
  const selectedPackageId = b.selectedPackageId ?? null;

  const totalAmount =
    b.total_amount ?? packages.reduce((sum, pkg) => sum + (pkg.price ?? 0), 0);
  const amountPaid = b.amount ?? 0;
  const remainingBalance = Math.max(Math.round(totalAmount - amountPaid), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50 truncate">
            {b.propertyName}
          </h2>
          <p className="text-[11.5px] text-gray-500 dark:text-gray-400">
            {packages.length} {packages.length === 1 ? "package" : "packages"} available
          </p>
        </div>
      </div>

      {/* Summary */}
      <Card title="Booking Summary" description="Overview across all packages for this request">
        <SummaryRow label="Total Value" value={format(totalAmount)} />
        <SummaryRow label="Amount Paid" value={format(amountPaid)} />
        <SummaryRow
          label="Remaining Balance"
          value={format(remainingBalance)}
          bold
          highlight
          accentColor={categoryColor}
        />
      </Card>

      {/* Packages */}
      <Card title="All Packages" description="Everything included in this booking request">
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                format={format}
                categoryColor={categoryColor}
                selected={pkg.id === selectedPackageId}
              />
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-gray-500 dark:text-gray-400 text-center py-6">
            No packages have been added to this booking yet.
          </p>
        )}
      </Card>

      {/* Chat */}
      <Link
        href={`/${locale}/${country}/messages${b.conversationId ? `?conversation=${b.conversationId}` : ""}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-white text-[13px] font-semibold shadow-sm transition-transform active:scale-[0.98]"
        style={{ backgroundColor: categoryColor }}
      >
        <MessageCircle size={15} />
        Chat with Vendor
      </Link>
    </div>
  );
}

export default PaxBookingView;