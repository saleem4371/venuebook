"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/ReserveHoldCard.jsx
 *
 * Left column, directly below UpcomingBookingCard — a live countdown for
 * the soonest booking that's only PARTIALLY paid: if the remaining balance
 * isn't settled before `holdExpiresAt`, the date is released back to
 * general availability for other guests. Deliberately sourced from
 * getNextHoldExpiring() rather than getNextUpcomingBooking() — the single
 * soonest booking overall is often fully paid (nothing to warn about),
 * while the soonest AT-RISK booking can be a different, later one. Renders
 * nothing when no booking currently has an active hold.
 *
 * `holdExpiresAt` is a MOCK-ONLY field on MOCK_BOOKINGS entries with
 * `paymentStatus: "partial"` (see mockProfileData.js) — no real backend
 * concept of a payment hold exists yet for this to source from.
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlarmClock } from "lucide-react";

import { getNextHoldExpiring } from "../../data/mockProfileData";

function msRemaining(targetIso) {
  return Math.max(0, new Date(targetIso).getTime() - Date.now());
}

function useCountdown(targetIso) {
  const [remaining, setRemaining] = useState(() => (targetIso ? msRemaining(targetIso) : 0));

  useEffect(() => {
    if (!targetIso) return undefined;
    setRemaining(msRemaining(targetIso));
    const id = setInterval(() => setRemaining(msRemaining(targetIso)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return remaining;
}

export default function ReserveHoldCard() {
  const t = useTranslations("profile.reserveHold");
  const booking = getNextHoldExpiring();
  const remaining = useCountdown(booking?.holdExpiresAt);

  if (!booking) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="rounded-3xl bg-white dark:bg-gray-900 border border-amber-200/70 dark:border-amber-500/20 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-500/10 shrink-0">
          <AlarmClock size={13} className="text-amber-600" />
        </span>
        <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-50 truncate">{t("title")}</p>
      </div>

      <div className="flex items-baseline flex-wrap gap-x-1 tabular-nums">
        {days > 0 && (
          <>
            <span className="text-[18px] font-bold text-amber-600">{days}</span>
            <span className="text-[10.5px] text-gray-500 dark:text-gray-400 me-1.5">{t("d")}</span>
          </>
        )}
        <span className="text-[18px] font-bold text-amber-600">{pad(hours)}</span>
        <span className="text-[10.5px] text-gray-500 dark:text-gray-400">{t("h")}</span>
        <span className="text-[18px] font-bold text-amber-600 ms-1">{pad(minutes)}</span>
        <span className="text-[10.5px] text-gray-500 dark:text-gray-400">{t("m")}</span>
        {days === 0 && (
          <>
            <span className="text-[18px] font-bold text-amber-600 ms-1">{pad(seconds)}</span>
            <span className="text-[10.5px] text-gray-500 dark:text-gray-400">{t("s")}</span>
          </>
        )}
      </div>

      <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-1.5 truncate">
        {t("subtitle", { property: booking.propertyName })}
      </p>
    </div>
  );
}
