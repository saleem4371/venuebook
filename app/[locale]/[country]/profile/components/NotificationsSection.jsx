"use client";

/**
 * /app/[locale]/[country]/profile/components/NotificationsSection.jsx
 *
 * Mock — no confirmed customer-facing notifications endpoint exists
 * (getnotification/all_notification are only ever called from the vendor
 * side). Small card per spec, always showing a fixed 3-item preview —
 * "View All" used to expand the list in place, which grew the card taller
 * every time (and inconsistently vs. its neighbors, since this card sits
 * next to fixed-height siblings in the desktop dashboard's right column).
 * It now opens a real side panel instead, same pattern as Settings/
 * Membership, so the card itself never changes size and the full,
 * untruncated list gets real room to breathe.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, CalendarCheck, CreditCard, MessageSquare, Tag as TagIcon } from "lucide-react";

import { SectionCard, SectionHeading, EmptyState, SlideOverPanel } from "./shared/ui";
import { MOCK_NOTIFICATIONS } from "../data/mockProfileData";

const TYPE_ICON = {
  booking: CalendarCheck,
  payment: CreditCard,
  reply: MessageSquare,
  offer: TagIcon,
};

// Every row used to render with the same violet icon regardless of type,
// which made a 3-row list of differently-shaped-but-same-colored icons
// look flat/samey. Color-coded per type instead — same "each kind gets its
// own tone" convention STATUS_TONE/PAYMENT_TONE already use elsewhere.
const TYPE_TONE = {
  booking: { bg: "bg-violet-50 dark:bg-violet-900/30", text: "text-violet-600" },
  payment: { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-600" },
  reply: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600" },
  offer: { bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-600" },
};

export default function NotificationsSection({ compact = false, flat = false }) {
  const t = useTranslations("profile.notifications");
  const tDrawer = useTranslations("profile.drawer");
  const [open, setOpen] = useState(false);

  const preview = MOCK_NOTIFICATIONS.slice(0, 3);

  return (
    <SectionCard flat={flat}>
      <SectionHeading
        compact={compact}
        title={t("title")}
        icon={
          <span
            className={`flex items-center justify-center bg-violet-50 dark:bg-violet-900/30 ${
              compact ? "w-6 h-6 rounded-lg" : "w-8 h-8 rounded-xl"
            }`}
          >
            <Bell size={compact ? 12 : 16} className="text-violet-600" />
          </span>
        }
        action={
          MOCK_NOTIFICATIONS.length > 3 && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`${compact ? "text-[11px]" : "text-[12.5px]"} font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 transition-colors`}
            >
              {t("viewAll")}
            </button>
          )
        }
      />

      {MOCK_NOTIFICATIONS.length === 0 ? (
        <EmptyState icon={<Bell size={20} className="text-gray-400" />} title={t("empty")} compact />
      ) : (
        <ul className="space-y-2.5">
          {preview.map((n) => (
            <NotificationRow key={n.id} n={n} />
          ))}
        </ul>
      )}

      <SlideOverPanel open={open} onClose={() => setOpen(false)} title={tDrawer("notificationsTitle")}>
        <ul className="space-y-1">
          {MOCK_NOTIFICATIONS.map((n) => (
            <NotificationRow key={n.id} n={n} roomy />
          ))}
        </ul>
      </SlideOverPanel>
    </SectionCard>
  );
}

function NotificationRow({ n, roomy = false }) {
  const Icon = TYPE_ICON[n.type] || Bell;
  const tone = TYPE_TONE[n.type] || TYPE_TONE.booking;
  return (
    <li
      className={
        roomy
          ? "flex items-start gap-3 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
          : "flex items-start gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      }
    >
      <span
        className={`shrink-0 flex items-center justify-center ${tone.bg} ${
          roomy ? "w-9 h-9 rounded-xl" : "w-7 h-7 rounded-lg"
        }`}
      >
        <Icon size={roomy ? 15 : 13} className={tone.text} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold text-gray-900 dark:text-gray-50 ${roomy ? "text-[13px]" : "text-[12px]"}`}>
          {n.title}
        </p>
        <p className={`text-gray-500 dark:text-gray-400 ${roomy ? "text-[12px] mt-0.5" : "text-[11px] truncate"}`}>
          {n.body}
        </p>
      </div>
      <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{n.time}</span>
    </li>
  );
}
