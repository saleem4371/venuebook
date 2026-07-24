"use client";

/**
 * BookingReviewCard.jsx
 *
 * Step 1 "Review" left-column property summary — an icon-grid of
 * category-specific booking details (event date, shift, guests, location…).
 * The property image now lives at the top of the pricing sidebar
 * (BookingSummary.jsx) instead of here. Header styled to match the
 * "Recommended Add-ons" section (icon badge + title + subtitle) for
 * consistency across the step 1 cards.
 *
 * Purely presentational — the pricing sidebar (BookingSummary.jsx) owns the
 * financial breakdown; this card owns the "what did I book" recap.
 */

import { useTranslations } from "next-intl";

/* ─── Icons (kept local — small, single-use, avoids a new dependency) ── */
const ICONS = {
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  tag: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
};

function InfoIcon({ name, className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {ICONS[name] ?? ICONS.calendar}
    </svg>
  );
}

function InfoTile({ icon, label, value, tint, full }) {
  if (!value) return null;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 p-3 ${
        full ? "col-span-2" : ""
      }`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: tint.light, color: tint.hex }}
      >
        <InfoIcon name={icon} className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─── Category → info-tile field sets ───────────────────────────────── */
function useCategoryTiles(normCat, booking, bookingDetails, venueData, t, tBook) {
  switch (normCat) {
    case "venues":
      return [
        { icon: "calendar", label: t("event_date"), value: booking.date },
        {
          icon: "clock",
          label: t("shift"),
          value: booking.shift ? tBook(`shift_${booking.shift}`) : null,
        },
        { icon: "tag", label: t("event_type"), value: booking.eventType },
        {
          icon: "users",
          label: t("guest_count"),
          value: booking.guests ? t("guests_value", { count: booking.guests }) : null,
        },
      ];
    case "farmstays":
      return [
        { icon: "calendar", label: t("check_in"), value: booking.checkIn },
        { icon: "calendar", label: t("check_out"), value: booking.checkOut },
        {
          // booking only carries a flat `guests` count (see CheckoutClient's
          // searchParams parsing) — there's no adults/children split coming
          // through, so use the same guests_value format venues uses.
          icon: "users",
          label: t("guest_count"),
          value: booking.guests ? t("guests_value", { count: booking.guests }) : null,
        },
      ];
    case "studios":
      return [
        { icon: "calendar", label: t("shoot_date"), value: bookingDetails.shootDate },
        { icon: "clock", label: t("time_slot"), value: bookingDetails.timeSlot },
      ];
    case "workspaces":
      return [
        { icon: "clock", label: t("booking_hours"), value: bookingDetails.timeSlot },
        {
          icon: "users",
          label: t("seats"),
          value: bookingDetails.seats ? t("seats_value", { count: bookingDetails.seats }) : null,
        },
      ];
    case "rentals":
      return [
        { icon: "calendar", label: t("rental_duration"), value: bookingDetails.rentalStart ? bookingDetails.rentalStart : null },
        { icon: "pin", label: t("pickup"), value: bookingDetails.pickup },
      ];
    case "experiences":
      return [
        { icon: "calendar", label: t("experience_date"), value: bookingDetails.experienceDate },
        { icon: "clock", label: t("session"), value: bookingDetails.sessionTime },
        {
          icon: "users",
          label: t("participants"),
          value: bookingDetails.participants
            ? t("participants_value", { count: bookingDetails.participants })
            : null,
        },
      ];
    default:
      return [];
  }
}

export default function BookingReviewCard({
  tint,
  normCat,
  booking,
  bookingDetails,
  venueData,
  loading,
}) {
  const t = useTranslations("checkout.summary");
  const tBook = useTranslations("checkout.booking");
  const tReview = useTranslations("checkout.review");

  const tiles = useCategoryTiles(normCat, booking, bookingDetails, venueData, t, tBook);
  const locationValue = [venueData?.venue_city, venueData?.venue_state].filter(Boolean).join(", ")
    || venueData?.parent_address;

  if (loading) {
    // Skeleton tile count tracks the real per-category tile set (venues: 4,
    // farmstays/experiences: 3, studios/workspaces/rentals: 2) plus the
    // always-present full-width location tile — so the loaded content
    // doesn't reflow the card once real data arrives.
    const skeletonTileCount = tiles.length;
    return (
      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Header — icon badge + title + subtitle placeholders, matching
            the two-line real header exactly so it doesn't grow on load. */}
        <div className="px-4 sm:px-5 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="min-w-0 space-y-1.5">
            <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-44 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: skeletonTileCount }).map((_, n) => (
              <div key={n} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
            {/* Location tile — always full-width in the real layout */}
            <div className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse col-span-2" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
      aria-label={tReview("title")}
    >
      {/* Header — icon badge + title + subtitle, matching the
          "Recommended Add-ons" section for uniformity across step 1 cards. */}
      <div className="px-4 sm:px-5 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: tint.hex }}
        >
          <InfoIcon name="calendar" className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {tReview("title")}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            {tReview("subtitle")}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((tile) => (
            <InfoTile key={tile.label} icon={tile.icon} label={tile.label} value={tile.value} tint={tint} />
          ))}
          <InfoTile icon="pin" label={tReview("location")} value={locationValue} tint={tint} full />
        </div>
      </div>
    </section>
  );
}
