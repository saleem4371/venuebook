"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/MessagesNavCard.jsx
 *
 * Left column, below UpcomingBookingCard — a single always-visible shortcut
 * into the real Messages inbox (app/[locale]/[country]/messages/page.jsx),
 * independent of any one booking. UpcomingBookingCard already has a
 * "Message host" action, but that's scoped to the soonest booking only —
 * this is the general entry point so a customer with no upcoming booking
 * (or a question unrelated to one) can still reach their inbox from the
 * dashboard glance view.
 *
 * The unread count is read from the same MOCK_CONVERSATIONS the Messages
 * page itself renders (messages/_data.js) — not a second, disconnected
 * number — so this badge and the inbox agree. Swapping that file for a
 * real conversations endpoint later keeps this badge correct for free.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MessageCircle, ChevronRight } from "lucide-react";

import { MOCK_CONVERSATIONS } from "@/app/[locale]/[country]/messages/_data";

export default function MessagesNavCard({ locale, country }) {
  const t = useTranslations("profile.messagesNav");

  const unreadCount = MOCK_CONVERSATIONS.reduce((sum, c) => sum + (c.unread || 0), 0);

  return (
    <Link
      href={`/${locale}/${country}/messages`}
      className="group flex items-center gap-3 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition-shadow p-3.5"
    >
      <span className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-900/30 shrink-0">
        <MessageCircle size={17} className="text-violet-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-50">{t("title")}</p>
        <p className="text-[10.5px] text-gray-500 dark:text-gray-400 truncate">{t("subtitle")}</p>
      </div>

      <ChevronRight size={15} className="text-gray-300 dark:text-gray-600 group-hover:text-violet-500 transition-colors shrink-0" />
    </Link>
  );
}
