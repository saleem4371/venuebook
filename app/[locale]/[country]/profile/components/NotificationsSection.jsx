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

export default function NotificationsSection() {
  const t = useTranslations("profile.notifications");
  const tDrawer = useTranslations("profile.drawer");
  const [open, setOpen] = useState(false);

  const preview = MOCK_NOTIFICATIONS.slice(0, 3);

  return (
    <SectionCard>
      <SectionHeading
        title={t("title")}
        icon={
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30">
            <Bell size={16} className="text-violet-600" />
          </span>
        }
        action={
          MOCK_NOTIFICATIONS.length > 3 && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[12.5px] font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 transition-colors"
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
  return (
    <li
      className={`flex items-start gap-2.5 ${
        roomy ? "py-3 border-b border-gray-100 dark:border-gray-800 last:border-0" : ""
      }`}
    >
      <span className="shrink-0 w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <Icon size={13} className="text-violet-600" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-50">{n.title}</p>
        <p className={`text-[11px] text-gray-500 dark:text-gray-400 ${roomy ? "" : "truncate"}`}>{n.body}</p>
      </div>
      <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{n.time}</span>
    </li>
  );
}
