"use client";

/**
 * /app/[locale]/[country]/account/settings/components/AccountSidebar.jsx
 *
 * Left navigation for Account Settings, per spec:
 *   - Desktop (lg+):  sticky, ~280px, icon + label, active item highlighted.
 *   - Tablet (md–lg): collapses to a sticky icon-only rail (no labels) —
 *     "collapsible" per spec, implemented as a breakpoint-driven collapse
 *     rather than horizontal tabs, which the spec explicitly rules out.
 *   - Mobile (<md):   no sidebar at all. A slim sticky bar shows the
 *     current section name; tapping it opens a bottom-sheet drawer listing
 *     every item — explicitly NOT horizontal scrolling tabs.
 *
 * `Host Settings` only renders for vendor accounts (isListed from
 * useAuth()), per spec ("only visible if vendor").
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUser,
  IconShieldLock,
  IconBellRinging,
  IconCreditCard,
  IconMapPin,
  IconAward,
  IconAdjustments,
  IconLock,
  IconDeviceLaptop,
  IconPlugConnected,
  IconBuildingStore,
  IconHelpCircle,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { id: "personal", icon: IconUser },
  { id: "security", icon: IconShieldLock },
  { id: "notifications", icon: IconBellRinging },
  { id: "payments", icon: IconCreditCard },
  { id: "addresses", icon: IconMapPin },
  { id: "rewards", icon: IconAward, farmstayOnly: true },
  { id: "preferences", icon: IconAdjustments },
  { id: "privacy", icon: IconLock },
  { id: "devices", icon: IconDeviceLaptop },
  { id: "connected", icon: IconPlugConnected },
  { id: "host", icon: IconBuildingStore, vendorOnly: true },
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

/* ── Desktop / tablet sidebar ─────────────────────────────────────────── */
export function AccountSidebar({ active, onSelect, isVendor, showRewards }) {
  const t = useTranslations("accountSettings.nav");
  const items = useAccountNavItems({ isVendor, showRewards });

  return (
    <nav
      aria-label={t("groupAccount")}
      className="hidden md:flex md:flex-col md:w-[76px] lg:w-[300px] shrink-0 md:h-full md:min-h-0 md:overflow-y-auto no-scrollbar py-2 md:border-r md:border-gray-100 dark:md:border-gray-800 md:pr-4 lg:pr-6"
    >
      <ul className="flex flex-col gap-1.5 px-2 lg:px-2 pt-2">
        {items.map(({ id, icon: Icon, danger }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                type="button"
                title={t(id)}
                onClick={() => onSelect(id)}
                className={`relative w-full flex items-center gap-3.5 lg:gap-3.5 md:justify-center lg:justify-start px-4 py-3.5 rounded-2xl text-[15.5px] font-medium transition-colors duration-150 ${
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
                <span className="relative hidden lg:inline truncate">{t(id)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── Mobile — sticky current-section bar + bottom sheet ──────────────── */
export function MobileAccountNav({ active, onSelect, isVendor, showRewards }) {
  const t = useTranslations("accountSettings.nav");
  const items = useAccountNavItems({ isVendor, showRewards });
  const current = items.find((i) => i.id === active);

  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-4"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {current?.icon && <current.icon size={18} stroke={1.75} className="text-violet-600 shrink-0" />}
          <span className="text-[14px] font-semibold text-gray-900 dark:text-gray-50 truncate">{t(active)}</span>
        </span>
        <IconChevronDown size={16} className="text-gray-400 shrink-0" />
      </button>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSheetOpen(false)}
            className="fixed inset-0 z-[997] bg-black/50 backdrop-blur-sm md:hidden"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-950 rounded-t-3xl shadow-2xl"
            >
              <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">{t("groupAccount")}</h2>
                <button onClick={() => setSheetOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <IconX size={16} />
                </button>
              </div>
              <ul className="p-2.5">
                {items.map(({ id, icon: Icon, danger }) => {
                  const isActive = active === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => { onSelect(id); setSheetOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-medium transition-colors ${
                          isActive
                            ? danger
                              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                              : "text-white font-semibold shadow-sm"
                            : danger
                              ? "text-red-500/80"
                              : "text-gray-700 dark:text-gray-200"
                        }`}
                        style={isActive && !danger ? { background: "linear-gradient(242deg, #a44bf3, #499ce8)" } : undefined}
                      >
                        <Icon size={19} stroke={1.75} />
                        {t(id)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
