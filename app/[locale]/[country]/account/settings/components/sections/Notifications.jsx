"use client";

/**
 * Notifications — Booking Updates, Offers, Marketing, Wishlist Alerts,
 * Price Drop Alerts × Email/SMS/WhatsApp/Push.
 *
 * Each category is its own block: the category label sits on its own full-
 * width line (wraps normally — never truncated, so the user always knows
 * what a category actually is) with a row of four channel checkboxes
 * underneath. That checkbox row shares the exact same 4-column grid
 * template as the header above it, so Email/SMS/WhatsApp/Push stay
 * perfectly aligned with their checkboxes without needing a real <table>
 * (whose content-driven column widths would force horizontal scrolling on
 * narrow screens once labels get long).
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  IconBellRinging,
  IconCalendarEvent,
  IconTag,
  IconSpeakerphone,
  IconHeart,
  IconTrendingDown,
  IconMail,
  IconMessage,
  IconBrandWhatsapp,
  IconDeviceMobile,
} from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { SettingsCard, CardHeading, Checkbox } from "../ui";

const CATEGORIES = [
  { key: "bookingUpdates", icon: IconCalendarEvent, defaults: { email: true, sms: true, whatsapp: false, push: true } },
  { key: "offers", icon: IconTag, defaults: { email: true, sms: false, whatsapp: false, push: true } },
  { key: "marketing", icon: IconSpeakerphone, defaults: { email: false, sms: false, whatsapp: false, push: false } },
  { key: "wishlistAlerts", icon: IconHeart, defaults: { email: true, sms: false, whatsapp: false, push: true } },
  { key: "priceDropAlerts", icon: IconTrendingDown, defaults: { email: true, sms: false, whatsapp: false, push: true } },
];

const CHANNELS = [
  { key: "email", icon: IconMail },
  { key: "sms", icon: IconMessage },
  { key: "whatsapp", icon: IconBrandWhatsapp },
  { key: "push", icon: IconDeviceMobile },
];

// Shared by the header and every checkbox row — this is what keeps the
// channel columns aligned under their headers regardless of how long a
// category label above them wraps to.
const CHANNEL_GRID = "grid-cols-4";

export default function Notifications() {
  const t = useTranslations("accountSettings.notifications");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();

  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, { ...c.defaults }])),
  );

  const flip = (categoryKey, channelKey) => {
    setPrefs((p) => ({
      ...p,
      [categoryKey]: { ...p[categoryKey], [channelKey]: !p[categoryKey][channelKey] },
    }));
    toast.info(tCommon("comingSoon"));
  };

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconBellRinging size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      <div className="w-full min-w-0">
        {/* Header — channel icon + label per column. */}
        <div className={`grid ${CHANNEL_GRID} gap-1 sm:gap-2 pb-2.5 mb-3 border-b border-gray-100 dark:border-gray-800`}>
          {CHANNELS.map(({ key, icon: ChIcon }) => (
            <div key={key} className="flex flex-col items-center gap-1 min-w-0 px-0.5">
              <ChIcon size={15} stroke={1.75} className="text-gray-400 dark:text-gray-500 shrink-0" />
              <span className="text-[10px] sm:text-[11.5px] font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight">
                {t(`channels.${key}`)}
              </span>
            </div>
          ))}
        </div>

        {/* Each category: full label line (wraps, never truncates) + a
            checkbox row below it aligned to the header via CHANNEL_GRID. */}
        {CATEGORIES.map(({ key, icon: CatIcon }) => (
          <div key={key} className="py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
            <div className="flex items-start gap-2.5 mb-3">
              <span className="shrink-0 w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center">
                <CatIcon size={15} className="text-gray-500 dark:text-gray-400" stroke={1.75} />
              </span>
              <span className="text-[13px] sm:text-[13.5px] font-semibold text-gray-900 dark:text-gray-50 leading-snug pt-1.5">
                {t(`categories.${key}`)}
              </span>
            </div>
            <div className={`grid ${CHANNEL_GRID} gap-1 sm:gap-2`}>
              {CHANNELS.map(({ key: chKey }) => (
                <div key={chKey} className="flex justify-center">
                  <Checkbox
                    checked={prefs[key][chKey]}
                    onChange={() => flip(key, chKey)}
                    label={`${t(`categories.${key}`)} — ${t(`channels.${chKey}`)}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
