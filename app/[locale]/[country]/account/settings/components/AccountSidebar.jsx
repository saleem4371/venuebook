"use client";

/**
 * /app/[locale]/[country]/account/settings/components/AccountSidebar.jsx
 *
 * Left navigation for Account Settings, per spec:
 *   - Desktop (lg+):  sticky, ~280px, icon + label, active item highlighted.
 *   - Tablet (md–lg): collapses to a sticky icon-only rail (no labels) —
 *     "collapsible" per spec, implemented as a breakpoint-driven collapse
 *     rather than horizontal tabs, which the spec explicitly rules out.
 *   - Mobile (<md):   a native-app-style master/detail flow (like Airbnb's
 *     mobile Account settings): `MobileAccountList` is a full-screen flat
 *     list with chevrons and no content underneath. Tapping a row is a real
 *     router navigation (page.jsx pushes ?tab=<id>), and the detail screen's
 *     back arrow calls router.back() — so the phone/browser's own back
 *     gesture returns to the list, exactly like a native settings app.
 *
 */

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  IconUser,
  IconShieldLock,
  IconBellRinging,
  IconCreditCard,
  IconAward,
  IconAdjustments,
  IconLock,
  IconDeviceLaptop,
  IconPlugConnected,
  IconHelpCircle,
  IconChevronRight,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { id: "personal", icon: IconUser },
  { id: "security", icon: IconShieldLock },
  { id: "notifications", icon: IconBellRinging },
  { id: "payments", icon: IconCreditCard },
  { id: "rewards", icon: IconAward, farmstayOnly: true },
  { id: "preferences", icon: IconAdjustments },
  { id: "privacy", icon: IconLock },
  { id: "devices", icon: IconDeviceLaptop },
  { id: "connected", icon: IconPlugConnected },
  { id: "help", icon: IconHelpCircle },
];

/* `showRewards` — Rewards & Membership is Farmstay-only per spec ("Hidden
   for venue-only users"), reusing the exact same hasFarmstayBooking()
   signal the Profile dashboard's own FarmRewards card already gates on,
   so the two features never disagree about who qualifies. */
export function useAccountNavItems({ isVendor, showRewards = true } = {}) {
  return NAV_ITEMS.filter((item) => {
    if (item.vendorOnly && !isVendor) return false;
    if (item.farmstayOnly && !showRewards) return false;
    return true;
  });
}

/* ── Desktop sidebar — only from 1024px (lg) up. Below that (including
   tablet) the page renders MobileAccountList's full-screen master/detail
   flow instead, so there's no intermediate icon-only rail state anymore. ── */
export function AccountSidebar({ active, onSelect, isVendor, showRewards }) {
  const t = useTranslations("accountSettings.nav");
  const items = useAccountNavItems({ isVendor, showRewards });

  return (
    <nav
      aria-label={t("groupAccount")}
      className="hidden lg:flex lg:flex-col lg:w-[300px] shrink-0 lg:h-full lg:min-h-0 lg:overflow-y-auto no-scrollbar py-2 lg:border-r lg:border-gray-100 dark:lg:border-gray-800 lg:pr-6"
    >
      <ul className="flex flex-col gap-1.5 px-2 pt-2">
        {items.map(({ id, icon: Icon, danger }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                type="button"
                title={t(id)}
                onClick={() => onSelect(id)}
                className={`relative w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15.5px] font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-white font-semibold"
                    : danger
                      ? "text-red-500/80 hover:bg-red-50/60 dark:hover:bg-red-900/10"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="account-nav-active"
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute inset-0 rounded-2xl shadow-md ${danger ? "bg-red-600 shadow-red-600/20" : "shadow-violet-600/25"}`}
                    style={danger ? undefined : { background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
                  />
                )}
                <Icon size={21} stroke={1.75} className="relative shrink-0" />
                <span className="relative truncate">{t(id)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── Mobile — full-screen flat list, no content underneath (screen 1 of
   the native-app-style master/detail flow) ──────────────────────────── */
export function MobileAccountList({ onSelect, isVendor, showRewards }) {
  const t = useTranslations("accountSettings.nav");
  const items = useAccountNavItems({ isVendor, showRewards });

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {items.map(({ id, icon: Icon, danger }) => (
        <li key={id}>
          <button
            type="button"
            onClick={() => onSelect(id)}
            className="w-full flex items-center justify-between gap-3 py-4 text-left active:bg-gray-50 dark:active:bg-gray-800/40 transition-colors"
          >
            <span className="flex items-center gap-3.5 min-w-0">
              <Icon size={20} stroke={1.75} className={`shrink-0 ${danger ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`} />
              <span className={`text-[15px] font-medium truncate ${danger ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-50"}`}>
                {t(id)}
              </span>
            </span>
            <IconChevronRight size={16} className="shrink-0 text-gray-300 dark:text-gray-600 rtl:rotate-180" />
          </button>
        </li>
      ))}
    </ul>
  );
}
