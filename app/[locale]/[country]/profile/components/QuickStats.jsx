"use client";

/**
 * /app/[locale]/[country]/profile/components/QuickStats.jsx
 *
 * Four premium stat cards (Upcoming / Completed / Collections / Saved).
 * Collections + Saved counts are REAL — passed down from the same
 * UserWishlistCategory / UserWishlist calls collections/page.jsx already
 * uses. Upcoming/Completed are derived from the mock bookings list per the
 * agreed Bookings data decision. A 5th "Reward Points" card only renders
 * when the user actually has points to show — brief: "Only show points if
 * applicable."
 */

import { useTranslations } from "next-intl";
import { CalendarCheck2, CalendarClock, Folder, Bookmark, Gift } from "lucide-react";

import { StatCard } from "./shared/ui";
import { MOCK_BOOKINGS } from "../data/mockProfileData";

export default function QuickStats({ collectionsCount = 0, savedCount = 0, loading = false, walletPoints = 0 }) {
  const t = useTranslations("profile.stats");

  const upcoming = MOCK_BOOKINGS.filter((b) => b.bookingStatus === "upcoming").length;
  const completed = MOCK_BOOKINGS.filter((b) => b.bookingStatus === "completed").length;
  const showPoints = walletPoints > 0;

  const stats = [
    { key: "upcoming", value: upcoming, Icon: CalendarClock, color: "#7C3AED", loading: false },
    { key: "completed", value: completed, Icon: CalendarCheck2, color: "#16A34A", loading: false },
    { key: "collections", value: collectionsCount, Icon: Folder, color: "#2563EB", loading },
    { key: "saved", value: savedCount, Icon: Bookmark, color: "#EA580C", loading },
  ];

  if (showPoints) {
    stats.push({ key: "points", value: walletPoints.toLocaleString(), Icon: Gift, color: "#DB2777", loading: false });
  }

  return (
    <div className={`grid grid-cols-2 ${showPoints ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-2.5`}>
      {stats.map((s) => (
        <StatCard key={s.key} label={t(s.key)} value={s.value} Icon={s.Icon} color={s.color} loading={s.loading} />
      ))}
    </div>
  );
}
