"use client";

/**
 * /app/[locale]/[country]/profile/components/BookingsSection.jsx
 *
 * Most important section — full-detail bookings list for the mobile/tablet
 * full-page stack. Now sourced from the real `allbookingData()` API call
 * instead of MOCK_BOOKINGS (see profile.service). BookingCard's expected
 * prop shape mirrors the old mock objects, so API rows are mapped onto
 * that same shape (mapApiBookingToCard below) rather than changing
 * BookingCard/BookingDetailModal/BookingTabs, keeping the existing design
 * and behaviour identical.
 */

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarRange, PackageSearch, AlertCircle } from "lucide-react";

import { useCurrency } from "@/hooks/useCurrency";
import { SectionCard, SectionHeading, EmptyState } from "./shared/ui";
import { BookingDetailModal } from "./shared/BookingDetailModal";
import { BookingCard } from "./shared/BookingCard";
import BookingTabs, { filterBookingsByTab } from "./shared/BookingTabs";
import { allbookingData } from "@/services/profile.service";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

// Maps a raw API booking row onto the shape BookingCard/BookingDetailModal
// already expect (the old MOCK_BOOKINGS shape) — this keeps every
// downstream component and its design completely unchanged.
function mapApiBookingToCard(b) {
  return {
    bookingId: b.bookingId,
    propertyName: b.child_venue_name || b.venue_name_snapshot,
    image: b.coverImage ? `${IMAGE_BASE_URL}/${b.coverImage}` : "/images/placeholder.jpg",
    date: b.event_date,
    guests: b.pax ?? 0,
    bookingStatus: b.bookingStatus || b.status || "confirmed",
    paymentStatus: b.paymentStatus || "paid",
    category: b.category || "venues",
    amount: b.price ?? 0,
    venueCity: b.venue_city,
    venueState: b.venue_state,
    shiftName: b.shift_name,
    startTime: b.start_time,
    endTime: b.end_time,
    eventDateId: b.eventDateId,
    // Keep the raw row around too, in case any deeper view needs a field
    // not covered by the mapping above.
    _raw: b,
  };
}

function BookingCardSkeleton({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="rounded-2xl border border-gray-100 dark:border-gray-800 p-3 flex gap-3"
    >
      <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay: 0.1 }}
          />
        </div>
        <div className="h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay: 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function BookingsSection() {

  const t = useTranslations("profile.bookings");
  const tCat = useTranslations("card.badge");
  const { locale, country } = useParams();
  const { format } = useCurrency();

  const [modal, setModal] = useState(null); // { booking, mode }
  const [activeTab, setActiveTab] = useState("all");

  const [rawBookings, setRawBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
    
      setLoading(true);
      setError(null);
      try {
        const res = await allbookingData();
        // Tolerate a couple of likely response shapes without assuming one.
        const list = Array.isArray(res) ? res : res?.data || res?.bookings || [];
        if (!cancelled) setRawBookings(list);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const allBookings = useMemo(
    () =>
      [...rawBookings]
        .map(mapApiBookingToCard)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [rawBookings],
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

      {loading ? (
        <div className="space-y-3 mt-3">
          {[0, 1, 2].map((i) => (
            <BookingCardSkeleton key={i} delay={i * 0.05} />
          ))}
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex flex-col items-center text-center gap-2 py-8"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20">
            <AlertCircle size={18} className="text-red-500" />
          </span>
          <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
            {t("error.title", { defaultValue: "Couldn't load your bookings" })}
          </p>
          <p className="text-[12px] text-gray-400 dark:text-gray-500">
            {t("error.subtitle", { defaultValue: "Please try again in a moment." })}
          </p>
        </motion.div>
      ) : bookings.length === 0 ? (
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
        <motion.div layout className="space-y-3 mt-3">
          <AnimatePresence mode="popLayout">
            {bookings.map((b, i) => (
              <motion.div
                key={b.bookingId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: i * 0.03, ease: "easeOut" }}
              >
                <BookingCard
                  booking={b}
                  t={t}
                  tCat={tCat}
                  format={format}
                  locale={locale}
                  country={country}
                  onOpen={(mode) => setModal({ booking: b, mode })}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
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