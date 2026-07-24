"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/GreetingBar.jsx
 *
 * Top of the CENTER column — ALWAYS visible (both feed mode and full
 * Bookings mode, see page.jsx's `showFullBookings`), so its "Bookings"
 * pill can double as the toggle's persistent control, not just its opener.
 * Messages/Collections navigate away (real routes); Bookings is a local
 * toggle instead — clicking it swaps the rest of the center column between
 * the feed (Reels + Suggestions + Offers) and a single Bookings panel
 * filling the column (see BookingsPanel.jsx's `onBack`, which does the
 * same toggle from the other side). The pill's own icon/label/highlight
 * change with `bookingsActive` so it reads as a real toggle switch, not a
 * one-way action — same "shift here and there" mechanic the Bookings↔
 * Offers left/center placement already used to use, just user-driven here.
 *
 * The Messages pill carries the unread-count badge that used to live on
 * the left column's MessagesNavCard (now removed as a redundant second
 * entry point) — same MOCK_CONVERSATIONS source, so the two never drift.
 */

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalendarRange, ArrowLeft, MessageCircle, FolderHeart } from "lucide-react";

import { SectionCard } from "../shared/ui";
import { MOCK_CONVERSATIONS } from "@/app/[locale]/[country]/messages/_data";

function greetingKey(hour) {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default function GreetingBar({
  user,
  locale,
  country,
  flat = false,
  bookingsActive = false,
  onToggleBookings,
}) {
  const t = useTranslations("profile.greeting");

  const firstName = useMemo(() => {
    const full = (user?.name || "").trim();
    return full.split(" ")[0] || "";
  }, [user]);

  // Computed once per mount rather than re-evaluated every render — a
  // greeting flipping from "morning" to "afternoon" mid-session isn't
  // worth a ticking re-render for.
  const key = useMemo(() => greetingKey(new Date().getHours()), []);

  const unreadCount = useMemo(
    () => MOCK_CONVERSATIONS.reduce((sum, c) => sum + (c.unread || 0), 0),
    [],
  );

  // Each action is either a real route (`href`, rendered as a Link) or a
  // local toggle (`onClick`, rendered as a button) — Bookings is the
  // latter, and its icon/label swap to communicate "you're in Bookings —
  // tap to go back" while active.
  const actions = [
    {
      key: "bookings",
      onClick: onToggleBookings,
      icon: bookingsActive ? ArrowLeft : CalendarRange,
      label: bookingsActive ? t("actions.bookingsBack") : t("actions.bookings"),
      active: bookingsActive,
    },
    { key: "messages", href: `/${locale}/${country}/messages`, icon: MessageCircle, label: t("actions.messages"), badge: unreadCount },
    { key: "collections", href: `/${locale}/${country}/collections`, icon: FolderHeart, label: t("actions.collections") },
  ];

  return (
    <SectionCard flat={flat}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[16px] sm:text-[17px] font-bold text-gray-900 dark:text-gray-50 truncate">
            {t(key, { name: firstName || t("guest") })}
          </h2>
          <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions.map(({ key: actionKey, href, onClick, icon: Icon, label, badge, active }) => {
            const className = `relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-colors ${
              active
                ? "bg-violet-600 hover:bg-violet-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`;
            const content = (
              <>
                <Icon size={13} />
                {label}
                {badge > 0 && (
                  <span className="absolute -top-1.5 -end-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </>
            );
            return href ? (
              <Link key={actionKey} href={href} className={className}>
                {content}
              </Link>
            ) : (
              <button key={actionKey} type="button" onClick={onClick} className={className}>
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
