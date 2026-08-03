"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Users } from "lucide-react";

import { useCurrency } from "@/hooks/useCurrency";
import { PrimaryButton, GhostButton } from "../shared/ui";
import { BookingDetailModal } from "../shared/BookingDetailModal";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

export default function UpcomingBookingCard({ bookingCurrent }) {
  const t = useTranslations("profile.upcomingBooking");
  const tb = useTranslations("profile.bookings");
  const tCat = useTranslations("card.badge");

  const { locale, country } = useParams();
  const { format } = useCurrency();

  const [open, setOpen] = useState(false);

  const booking = bookingCurrent;

  if (!booking) {
    return (
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
        <p className="text-[12px] text-gray-400 dark:text-gray-500">{t("empty")}</p>
      </div>
    );
  }

  const imageUrl = booking.coverImage
    ? `${IMAGE_BASE_URL}/${booking.coverImage}`
    : "/images/placeholder.jpg";

  const venueName = booking.child_venue_name || booking.venue_name_snapshot;

  // Format the date properly (this was returning an empty string before)
  const dateLabel = booking.event_date
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
        new Date(booking.event_date),
      )
    : "";

  const daysToGo = booking.daysLeft ?? 0;
  const daysToGoLabel =
    daysToGo <= 0
      ? t("today")
      : daysToGo === 1
      ? t("tomorrow")
      : t("inDays", { days: daysToGo });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative h-24 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src={imageUrl}
            alt={venueName || ""}
            fill
            className="object-cover"
            unoptimized
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute top-2 start-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            className="inline-flex items-center rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-400"
          >
            {daysToGoLabel}
          </motion.span>
        </div>

        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-white text-[13px] font-bold truncate">{venueName}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-900 p-3">
        <div className="flex items-center gap-3 text-[10.5px] text-gray-500 dark:text-gray-400 mb-2.5">
          <span className="inline-flex items-center gap-1">
            <CalendarClock size={11} />
            {dateLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={11} />
            {booking.pax ?? 0}
          </span>
        </div>

        <div className="flex gap-1.5">
          <PrimaryButton
            onClick={() => setOpen(true)}
            className="flex-1 !px-2 !py-1.5 !text-[11px]"
          >
            {t("openItinerary")}
          </PrimaryButton>
          <GhostButton
            as={Link}
            href={`/${locale}/${country}/messages`}
            className="!px-2 !py-1.5 !text-[11px]"
          >
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
    </motion.div>
  );
}