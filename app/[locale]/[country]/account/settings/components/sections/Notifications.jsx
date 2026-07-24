"use client";

/**
 * Notifications — Booking Updates, Offers, Marketing, Wishlist Alerts,
 * Price Drop Alerts × Email/SMS/WhatsApp/Push. One card per category, a
 * 2×2 (mobile) / 1×4 (sm+) grid of channel toggles inside — avoids both a
 * giant table (overflows on mobile) and one long form.
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
import { SettingsCard, CardHeading } from "../ui";

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

      <div className="space-y-3">
        {CATEGORIES.map(({ key, icon: CatIcon }) => (
          <div
            key={key}
            className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-violet-200 dark:hover:border-violet-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="shrink-0 w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center">
                <CatIcon size={15} className="text-gray-500 dark:text-gray-400" stroke={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-50">{t(`categories.${key}`)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CHANNELS.map(({ key: chKey, icon: ChIcon }) => {
                const checked = prefs[key][chKey];
                return (
                  <button
                    key={chKey}
                    type="button"
                    onClick={() => flip(key, chKey)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11.5px] font-medium transition-colors ${
                      checked
                        ? "bg-gray-200 dark:bg-gray-700 border-transparent text-gray-900 dark:text-gray-100 font-semibold"
                        : "bg-gray-50 dark:bg-gray-800/40 border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    <ChIcon size={14} stroke={1.75} className="shrink-0" />
                    <span className="truncate">{t(`channels.${chKey}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
