"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/BookingCard.jsx
 *
 * Extracted from BookingsSection.jsx so the desktop dashboard's Bookings
 * widget (BookingsPanel.jsx) can show the SAME full card — photo, category,
 * both status badges, date/guests/amount, actions — directly in the fixed
 * layout instead of behind a "View all" drawer. There is no more Bookings
 * side panel: what used to only be reachable in the drawer is now the
 * dashboard's real bookings view, just scrolling within its own column.
 *
 * The card's standing action row is exactly three buttons — Manage
 * Booking, Invoice, Message — with no separate "View" step in front of
 * them, and no extra outcome-specific buttons (Write Review/Book
 * Again/Rebook) added on top; Manage/Invoice open the shared detail modal
 * already on that section (see shared/BookingDetailModal.jsx), Message is
 * a direct link, no modal involved. Shown unconditionally (not gated by
 * booking type/status, aside from Invoice needing a real invoiceId) so
 * every card carries the same buttons and therefore the same content
 * height — which is what lets the photo stretch to fill the full card
 * edge-to-edge instead of sitting in a fixed-height box with dead space
 * below it.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Users, Settings2, FileText, MessageCircle } from "lucide-react";

import { StatusBadge, GhostButton } from "./ui";
import { STATUS_TONE, PAYMENT_TONE } from "./BookingDetailModal";
import { CATEGORY_COLORS } from "../../data/mockProfileData";

export function BookingCard({ booking, t, tCat, format, locale, country, onOpen }) {
  const b = booking;
  const dateLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(b.date),
  );

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition-shadow overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        {/*
          h-28 on mobile (stacked layout has no sibling to stretch against),
          sm:h-auto once the layout becomes a row so flex's cross-axis
          stretch makes this wrapper match the content column's height —
          driven by TEXT (title/badges/buttons), never by the photo. The
          <img> is `absolute inset-0` specifically so it's taken out of
          normal flow: a percentage height (h-full) can't resolve against
          an `auto`-height parent, so an in-flow <img> with h-full silently
          falls back to its own natural aspect ratio instead — a tall
          source photo was inflating the whole card. Absolute positioning
          means the wrapper's height is decided purely by its flex sibling,
          and the photo just crops (object-cover) to whatever that is.
        */}
        <div className="relative w-full sm:w-32 h-28 sm:h-auto shrink-0 overflow-hidden">
          <img
            src={b.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9.5px] font-semibold text-white shadow"
            style={{ backgroundColor: CATEGORY_COLORS[b.category] }}
          >
            {tCat(b.category.replace(/s$/, ""))}
          </span>
        </div>

        <div className="flex-1 p-3.5 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2.5">
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-gray-900 dark:text-gray-50 truncate">
                {b.propertyName}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {t("id")}: <span className="font-medium text-gray-700 dark:text-gray-300">{b.bookingId}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge label={t(`status.${b.bookingStatus}`)} tone={STATUS_TONE[b.bookingStatus]} />
              <StatusBadge label={t(`payment.${b.paymentStatus}`)} tone={PAYMENT_TONE[b.paymentStatus]} />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11.5px] text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} />
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={12} />
              {b.guests} {t("guests")}
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {t("amountPaid")}: {format(b.amountINR)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <GhostButton onClick={() => onOpen("manage")}>
              <Settings2 size={13} />
              {t("manage")}
            </GhostButton>

            {b.invoiceId && (
              <GhostButton onClick={() => onOpen("invoice")}>
                <FileText size={13} />
                {t("invoice")}
              </GhostButton>
            )}

            <GhostButton as={Link} href={`/${locale}/${country}/messages`}>
              <MessageCircle size={13} />
              {t("message")}
            </GhostButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
