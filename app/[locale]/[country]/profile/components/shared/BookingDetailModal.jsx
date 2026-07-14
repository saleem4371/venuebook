"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/BookingDetailModal.jsx
 *
 * Extracted from BookingsSection.jsx so the compact BookingsPanel widget
 * (fixed-dashboard center column) and the full BookingsSection (used inside
 * the "View all bookings" drawer) share one modal instead of two copies.
 * STATUS_TONE/PAYMENT_TONE are exported too since both card list variants
 * need the same status→color mapping.
 *
 * The card's own buttons ARE Manage Booking / Invoice / Message directly —
 * there's no "View" step in front of them. Clicking Manage or Invoice on
 * the card opens this modal already on that section (`mode` decides what's
 * expanded on first render); Message never opens this modal at all, it's a
 * plain link to /messages. All three actions are also repeated here inside
 * the modal so you can switch between Manage/Invoice without closing it.
 * Shown unconditionally on every booking, not gated by type/status, so
 * every card carries the same fixed action row. "review" remains its own
 * dedicated flow (a star-rating form), not one of these three actions.
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { X, Star, MessageCircle, Settings2, FileText } from "lucide-react";

import { StatusBadge, PrimaryButton, GhostButton } from "./ui";
import { InvoiceDocument } from "./InvoiceDocument";

export const STATUS_TONE = { upcoming: "violet", completed: "green", cancelled: "red", enquiry: "amber", draft: "gray" };
export const PAYMENT_TONE = { paid: "green", partial: "amber", pending: "amber", refunded: "gray" };

export function BookingDetailModal({ booking: b, mode, t, tCat, format, locale, country, onClose }) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [openSection, setOpenSection] = useState(mode === "invoice" ? "invoice" : mode === "manage" ? "manage" : null);

  const dateLabel = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
    new Date(b.date),
  );

  const toggleSection = (key) => setOpenSection((s) => (s === key ? null : key));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full ${
          openSection === "invoice" ? "sm:max-w-xl" : "sm:max-w-lg"
        } bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto transition-[max-width] duration-200`}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-[17px] font-semibold text-gray-900 dark:text-gray-50">{b.propertyName}</h3>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{b.bookingId}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {mode !== "review" && (
          <div className="space-y-3 text-[13.5px]">
            <Row label={t("date")} value={dateLabel} />
            <Row label={t("category")} value={tCat(b.category.replace(/s$/, ""))} />
            <Row label={t("guests")} value={b.guests} />
            {b.nights ? <Row label={t("nights")} value={b.nights} /> : null}
            <Row label={t("amountPaid")} value={format(b.amountINR)} />
            <div className="flex items-center justify-between py-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t("statusLabel")}</span>
              <StatusBadge label={t(`status.${b.bookingStatus}`)} tone={STATUS_TONE[b.bookingStatus]} />
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t("paymentLabel")}</span>
              <StatusBadge label={t(`payment.${b.paymentStatus}`)} tone={PAYMENT_TONE[b.paymentStatus]} />
            </div>

            {/* The three actions — hidden once the Invoice document itself
                is open, since it's a full self-contained view and doesn't
                need the switcher that opened it repeated inside it. */}
            {openSection !== "invoice" && (
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <GhostButton onClick={() => toggleSection("manage")}>
                  <Settings2 size={13} />
                  {t("manage")}
                </GhostButton>
                <GhostButton onClick={() => toggleSection("invoice")}>
                  <FileText size={13} />
                  {t("invoice")}
                </GhostButton>
                <GhostButton as={Link} href={`/${locale}/${country}/messages`}>
                  <MessageCircle size={13} />
                  {t("message")}
                </GhostButton>
              </div>
            )}

            {openSection === "manage" && (
              <p className="text-[12.5px] text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                {t("manageHelp")}
              </p>
            )}

            {openSection === "invoice" && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <InvoiceDocument booking={b} t={t} />
              </div>
            )}
          </div>
        )}

        {mode === "review" && (
          <div>
            {submitted ? (
              <p className="text-[13.5px] text-green-600 font-medium py-4 text-center">{t("reviewThanks")}</p>
            ) : (
              <>
                <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-3">{t("reviewPrompt")}</p>
                <div className="flex gap-1.5 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)}>
                      <Star
                        size={26}
                        className={n <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-700"}
                      />
                    </button>
                  ))}
                </div>
                <PrimaryButton className="w-full" disabled={rating === 0} onClick={() => setSubmitted(true)}>
                  {t("writeReview")}
                </PrimaryButton>
              </>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  );
}
