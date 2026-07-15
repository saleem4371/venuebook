"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/UpcomingBookingCard.jsx
 *
 * Left column, below IdentityPanel — the single soonest upcoming booking,
 * mirroring the reference mockup's "Spiti Valley · Komic Skyfarm" card.
 * "Open itinerary" reuses the same BookingDetailModal (view mode) as every
 * other booking touchpoint on this page; "Message host" routes to the real
 * Messages page, same as BookingsSection's Support action.
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { CalendarClock, Users } from "lucide-react";

import { useCurrency } from "@/hooks/useCurrency";
import { PrimaryButton, GhostButton } from "../shared/ui";
import { BookingDetailModal } from "../shared/BookingDetailModal";
import { getNextUpcomingBooking } from "../../data/mockProfileData";

export default function UpcomingBookingCard() {
  const t = useTranslations("profile.upcomingBooking");
  const tb = useTranslations("profile.bookings");
  const tCat = useTranslations("card.badge");
  const { locale, country } = useParams();
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);

  const booking = getNextUpcomingBooking();

  if (!booking) {
    return (
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
        <p className="text-[12px] text-gray-400 dark:text-gray-500">{t("empty")}</p>
      </div>
    );
  }

  const dateLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(booking.date),
  );

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="relative h-24">
        <img src={booking.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-white text-[13px] font-bold truncate">{booking.propertyName}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-3">
        <div className="flex items-center gap-3 text-[10.5px] text-gray-500 dark:text-gray-400 mb-2.5">
          <span className="inline-flex items-center gap-1">
            <CalendarClock size={11} />
            {dateLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={11} />
            {booking.guests}
          </span>
        </div>
        <div className="flex gap-1.5">
          <PrimaryButton onClick={() => setOpen(true)} className="flex-1 !px-2 !py-1.5 !text-[11px]">
            {t("openItinerary")}
          </PrimaryButton>
          <GhostButton as={Link} href={`/${locale}/${country}/messages`} className="!px-2 !py-1.5 !text-[11px]">
            {t("messageHost")}
          </GhostButton>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <BookingDetailModal
            booking={booking}
            mode="view"
            t={tb}
            tCat={tCat}
            format={format}
            locale={locale}
            country={country}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
