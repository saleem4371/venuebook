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
 */

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { CalendarRange, PackageSearch } from "lucide-react";

import { useCurrency } from "@/hooks/useCurrency";
import { SectionCard, SectionHeading, EmptyState } from "../shared/ui";
import { BookingDetailModal } from "../shared/BookingDetailModal";
import { BookingCard } from "../shared/BookingCard";
import BookingTabs, { filterBookingsByTab } from "../shared/BookingTabs";
import { MOCK_BOOKINGS } from "../../data/mockProfileData";

export default function BookingsPanel() {
  const t = useTranslations("profile.bookings");
  const tCat = useTranslations("card.badge");
  const { locale, country } = useParams();
  const { format } = useCurrency();

  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const allBookings = useMemo(
    () => [...MOCK_BOOKINGS].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [],
  );
  const bookings = useMemo(() => filterBookingsByTab(allBookings, activeTab), [allBookings, activeTab]);

  return (
    <SectionCard className="flex flex-col min-h-0 flex-1" padded={false}>
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

      {bookings.length === 0 ? (
        <div className="p-4 pt-0">
          <EmptyState
            icon={<PackageSearch size={20} className="text-violet-600" />}
            title={t("empty.title")}
            subtitle={t("empty.subtitle")}
            ctaLabel={t("empty.cta")}
            ctaHref={`/${locale}/${country}/search/venues`}
            compact
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-3 space-y-3">
          {bookings.map((b) => (
            <BookingCard
              key={b.bookingId}
              booking={b}
              t={t}
              tCat={tCat}
              format={format}
              locale={locale}
              country={country}
              onOpen={(mode) => setModal({ booking: b, mode })}
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
