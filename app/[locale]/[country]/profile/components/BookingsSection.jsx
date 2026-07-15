"use client";

/**
 * /app/[locale]/[country]/profile/components/BookingsSection.jsx
 *
 * Most important section — full-detail bookings list for the mobile/tablet
 * full-page stack. Uses MOCK_BOOKINGS per the agreed data decision — there
 * is no confirmed customer-facing bookings endpoint anywhere in this app
 * today (all_reservations is only ever called from the vendor reservations
 * dashboard). Field names on the mock objects intentionally mirror what
 * that endpoint is expected to return, so swapping in a real
 * `useEffect(() => { all_reservations().then(...) }, [])` later is a
 * data-source change, not a rewrite of this component.
 *
 * The desktop fixed dashboard shows this exact same card (shared/
 * BookingCard.jsx) directly in its Bookings widget — there's no separate
 * "view all" drawer anymore, so this component's only job now is being the
 * mobile full list.
 */

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { CalendarRange, PackageSearch } from "lucide-react";

import { useCurrency } from "@/hooks/useCurrency";
import { SectionCard, SectionHeading, EmptyState } from "./shared/ui";
import { BookingDetailModal } from "./shared/BookingDetailModal";
import { BookingCard } from "./shared/BookingCard";
import BookingTabs, { filterBookingsByTab } from "./shared/BookingTabs";
import { MOCK_BOOKINGS } from "../data/mockProfileData";

export default function BookingsSection() {
  const t = useTranslations("profile.bookings");
  const tCat = useTranslations("card.badge");
  const { locale, country } = useParams();
  const { format } = useCurrency();

  const [modal, setModal] = useState(null); // { booking, mode }
  const [activeTab, setActiveTab] = useState("all");

  const allBookings = useMemo(
    () => [...MOCK_BOOKINGS].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [],
  );
  const bookings = useMemo(() => filterBookingsByTab(allBookings, activeTab), [allBookings, activeTab]);

  return (
    <SectionCard>
      <SectionHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30">
            <CalendarRange size={16} className="text-violet-600" />
          </span>
        }
      />

      {/* Sticky below the app's fixed navbar so the tabs stay reachable
          while the booking list scrolls underneath them. */}
      <div className="sticky top-20 z-10 -mx-4 sm:-mx-5 px-4 sm:px-5 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <BookingTabs active={activeTab} onChange={setActiveTab} t={t} />
      </div>

      {bookings.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            icon={<PackageSearch size={22} className="text-violet-600" />}
            title={t(`empty.byTab.${activeTab}.title`)}
            subtitle={t(`empty.byTab.${activeTab}.subtitle`)}
            ctaLabel={t("empty.cta")}
            ctaHref={`/${locale}/${country}/search/venues`}
          />
        </div>
      ) : (
        <div className="space-y-3 mt-3">
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
