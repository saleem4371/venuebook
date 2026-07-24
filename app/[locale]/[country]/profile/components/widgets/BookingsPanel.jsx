"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/BookingsPanel.jsx
 *
 * Center column of the fixed dashboard — the real Bookings view, not a
 * teaser. It used to show a compact row list with a "View all" link that
 * opened the full detail behind a side drawer; per direct feedback the
 * drawer added a click for no reason, so this now renders the exact same
 * rich card (shared/BookingCard.jsx) that the mobile full-page stack uses
 * — photo, both status badges, date/guests/amount, actions — directly here.
 * It still scrolls WITHIN the panel (not the page), so this stays correct
 * at real scale (a customer's 47 bookings won't blow out the fixed layout).
 *
 * "Manage Booking" is an in-place VIEW SWAP, not a modal — per direct
 * feedback that a modal-over-modal-feeling overlay for something this
 * routine was heavier than it needed to be. Clicking it replaces this
 * panel's own header (title/subtitle/tabs) with a back button + the
 * booking's name/id/status badge, and swaps the card list for the full
 * ManageBookingView (Overview/Edit/Payment/Cancellation tabs + sidebar —
 * see shared/ManageBookingView.jsx), still inside this same SectionCard —
 * the center column never navigates to a real Next.js route or opens an
 * overlay for this. "Invoice" is unchanged and still opens
 * BookingDetailModal: an invoice is a real document meant to be
 * read/printed/downloaded on its own, which is a much better fit for a
 * focused overlay than a list-replacing inline view.
 *
 * `onBookingPatch` lets ManageBookingView push local payment/cancellation
 * state changes (e.g. paymentStatus flipping to "paid", bookingStatus
 * flipping to "cancelled") back up so this header's StatusBadge stays in
 * sync live — it does NOT mutate MOCK_BOOKINGS itself (same mock-only
 * limitation documented in ManageBookingView.jsx's own header comment).
 *
 * `compact` — used when page.jsx's Bookings↔Offers layout swap puts this
 * in the LEFT column instead of the center (see page.jsx's header comment):
 * a small icon+title card with a single empty-state message, matching its
 * new neighbors (Identity/Messages/Offers) instead of trying to fill a
 * whole column the way the center placement does.
 *
 * `embedded` — used when this sits BELOW the new Greeting/Reels/Suggestions
 * feed in the center column (see page.jsx) instead of being the column's
 * sole content. In that layout the CENTER COLUMN ITSELF owns the one
 * scrollbar for the whole feed, so this drops its own internal
 * `flex-1 min-h-0 overflow-y-auto` scroll ownership and just flows
 * naturally underneath — no nested/double scrollbars.
 *
 * This is also what renders (non-compact, non-embedded) when GreetingBar's
 * "Bookings" pill toggles `showFullBookings` on, filling the whole center
 * column on its own — the pill itself (icon/label swaps to "Back to
 * Feed") is the only way back, so this has no back button of its own
 * beyond the unrelated manage-view one above (out of a single booking's
 * detail, not out of this whole panel).
 */

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { CalendarRange, PackageSearch, ArrowLeft } from "lucide-react";

import { useCurrency } from "@/hooks/useCurrency";
import { SectionCard, SectionHeading, EmptyState, StatusBadge } from "../shared/ui";
import { BookingDetailModal, STATUS_TONE } from "../shared/BookingDetailModal";
import { BookingCard } from "../shared/BookingCard";
import { ManageBookingView } from "../shared/ManageBookingView";
import BookingTabs, { filterBookingsByTab } from "../shared/BookingTabs";
import { MOCK_BOOKINGS, CATEGORY_COLORS } from "../../data/mockProfileData";

export default function BookingsPanel({ compact = false, flat = false, embedded = false }) {
  const t = useTranslations("profile.bookings");
  const tCat = useTranslations("card.badge");
  const { locale, country } = useParams();
  const { format } = useCurrency();

  const [modal, setModal] = useState(null);
  const [manageBooking, setManageBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const allBookings = useMemo(
    () => [...MOCK_BOOKINGS].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [],
  );
  const bookings = useMemo(() => filterBookingsByTab(allBookings, activeTab), [allBookings, activeTab]);

  if (compact) {
    // Real data, not an assumed-empty placeholder — `compact` used to only
    // ever render when there were zero bookings anywhere (the old
    // hasBookings swap), so an unconditional EmptyState was correct then.
    // Now it's the permanent LEFT-column card regardless of whether real
    // bookings exist (see page.jsx), so it needs to actually check.
    const preview = allBookings.slice(0, 2);
    return (
      <SectionCard flat={flat}>
        <SectionHeading
          compact
          title={t("title")}
          icon={
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-900/30">
              <CalendarRange size={12} className="text-violet-600" />
            </span>
          }
        />
        {preview.length === 0 ? (
          <EmptyState
            icon={<PackageSearch size={18} className="text-violet-600" />}
            title={t("empty.byTab.all.title")}
            subtitle={t("empty.byTab.all.subtitle")}
            ctaLabel={t("empty.cta")}
            ctaHref={`/${locale}/${country}/search/venues`}
            compact
          />
        ) : (
          <div className="space-y-2">
            {preview.map((b) => (
              <div key={b.bookingId} className="flex items-center gap-2.5">
                <img src={b.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-semibold text-gray-900 dark:text-gray-50 truncate">
                    {b.propertyName}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{b.date}</p>
                </div>
                <StatusBadge
                  label={t(`status.${b.bookingStatus}`)}
                  tone={STATUS_TONE[b.bookingStatus]}
                  className="shrink-0"
                />
              </div>
            ))}
            {allBookings.length > preview.length && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center pt-1">
                +{allBookings.length - preview.length} more
              </p>
            )}
          </div>
        )}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      flat={flat}
      className={embedded ? "flex flex-col" : "flex flex-col min-h-0 flex-1"}
      padded={false}
    >
      {manageBooking ? (
        <div className="p-4 pb-0 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setManageBooking(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: CATEGORY_COLORS[manageBooking.category] || CATEGORY_COLORS.venues }}
            >
              {t("manage")}
            </p>
            <h3 className="text-[14.5px] font-semibold text-gray-900 dark:text-gray-50 truncate">
              {manageBooking.propertyName}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{manageBooking.bookingId}</p>
          </div>
          <StatusBadge
            label={t(`status.${manageBooking.bookingStatus}`)}
            tone={STATUS_TONE[manageBooking.bookingStatus]}
            className="shrink-0"
          />
        </div>
      ) : (
        <div className="p-4 pb-0">
          <SectionHeading
            title={t("title")}
            subtitle={t("subtitle")}
            icon={
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-900/30">
                <CalendarRange size={14} className="text-violet-600" />
              </span>
            }
          />
          <BookingTabs active={activeTab} onChange={setActiveTab} t={t} compact />
        </div>
      )}

      {manageBooking ? (
        <div className={embedded ? "px-4 pb-4 pt-3" : "flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-3"}>
          <ManageBookingView
            booking={manageBooking}
            t={t}
            tCat={tCat}
            format={format}
            locale={locale}
            country={country}
            onInvoice={() => setModal({ booking: manageBooking, mode: "invoice" })}
            onBack={() => setManageBooking(null)}
            onBookingPatch={(patch) => setManageBooking((prev) => (prev ? { ...prev, ...patch } : prev))}
          />
        </div>
      ) : bookings.length === 0 ? (
        // Same pt-3 top gap the populated list uses below (px-4 pb-4 pt-3),
        // and flex-1 so the dashed box stretches to fill whatever vertical
        // room the panel has instead of sitting at its own compact height —
        // EmptyState's own items-center/justify-center then centers the
        // icon/title/subtitle/CTA within that full height, not just at top.
        <div className={embedded ? "px-4 pb-4 pt-3" : "flex-1 min-h-0 flex flex-col px-4 pb-4 pt-3"}>
          <EmptyState
            icon={<PackageSearch size={20} className="text-violet-600" />}
            title={t(`empty.byTab.${activeTab}.title`)}
            subtitle={t(`empty.byTab.${activeTab}.subtitle`)}
            ctaLabel={t("empty.cta")}
            ctaHref={`/${locale}/${country}/search/venues`}
            fill={!embedded}
          />
        </div>
      ) : (
        <div className={embedded ? "px-4 pb-4 pt-3 space-y-3" : "flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-3 space-y-3"}>
          {bookings.map((b) => (
            <BookingCard
              key={b.bookingId}
              booking={b}
              t={t}
              tCat={tCat}
              format={format}
              locale={locale}
              country={country}
              onOpen={(mode) => (mode === "manage" ? setManageBooking(b) : setModal({ booking: b, mode }))}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <BookingDetailModal
            booking={modal.booking}
            mode={modal.mode}
            t={t}
            tCat={tCat}
            format={format}
            locale={locale}
            country={country}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}
