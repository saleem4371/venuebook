"use client";

/**
 * /app/[locale]/[country]/account/settings/page.jsx
 *
 * Account Settings — a completely separate module from /profile, reached
 * only via IdentityPanel's gear/pencil buttons navigating here (see
 * profile/page.jsx's single-line onOpenSettings change). The Profile page
 * itself is NOT modified beyond that one navigation callback — everything
 * else in this file is new.
 *
 * LAYOUT (per spec):
 *   Desktop (lg+):  sticky 280px left nav, ~900px max-width scrollable
 *                   content on the right.
 *   Tablet (md–lg): nav collapses to an icon-only sticky rail.
 *   Mobile (<md):   no sidebar — a sticky "current section" bar opens a
 *                   bottom-sheet listing every item (NOT horizontal tabs).
 *
 * Section switching is query-param driven (?tab=personal) so a section is
 * directly linkable/refreshable, and each switch briefly shows a skeleton
 * (SectionSkeleton) before the real content fades in — a deliberate,
 * honest transition delay, not a fake network wait.
 *
 * `Host Settings` only appears for vendor accounts (isListed, from the
 * existing useAuth() — stable foundation, unmodified). `Rewards &
 * Membership` only appears for accounts with a farmstay booking
 * (hasFarmstayBooking(), the same signal the Profile dashboard's own
 * FarmRewards card already gates on), per spec ("Hidden for venue-only
 * users").
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { IconFolder } from "@tabler/icons-react";

import { useAuth } from "@/context/AuthContext";
import { hasFarmstayBooking } from "@/app/[locale]/[country]/profile/data/mockProfileData";

import { SectionHeader, SectionSkeleton } from "./components/ui";
import { AccountSidebar, MobileAccountNav, useAccountNavItems } from "./components/AccountSidebar";

import PersonalInfo from "./components/sections/PersonalInfo";
import LoginSecurity from "./components/sections/LoginSecurity";
import Notifications from "./components/sections/Notifications";
import Payments from "./components/sections/Payments";
import Addresses from "./components/sections/Addresses";
import Rewards from "./components/sections/Rewards";
import Preferences from "./components/sections/Preferences";
import Privacy from "./components/sections/Privacy";
import Devices from "./components/sections/Devices";
import ConnectedAccounts from "./components/sections/ConnectedAccounts";
import HostSettings from "./components/sections/HostSettings";
import HelpSupport from "./components/sections/HelpSupport";

const DEFAULT_SECTION = "personal";

export default function AccountSettingsPage() {
  const { user, loading: authLoading, isListed } = useAuth();
  const { locale, country } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tHeader = useTranslations("accountSettings");

  const showRewards = useMemo(() => hasFarmstayBooking(), []);
  const items = useAccountNavItems({ isVendor: isListed, showRewards });
  const validIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const requested = searchParams.get("tab");
  const active = requested && validIds.has(requested) ? requested : DEFAULT_SECTION;

  const [showSkeleton, setShowSkeleton] = useState(false);

  const goTo = useCallback(
    (id) => {
      if (id === active) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.push(`/${locale}/${country}/account/settings?${params.toString()}`, { scroll: false });
    },
    [active, searchParams, router, locale, country],
  );

  // Brief, honest transition on every section switch — not a real network
  // wait, just enough to avoid an instant jarring cut between two very
  // differently-shaped cards.
  useEffect(() => {
    setShowSkeleton(true);
    const timer = setTimeout(() => setShowSkeleton(false), 220);
    return () => clearTimeout(timer);
  }, [active]);

  // Keyboard shortcuts — "[" / "]" step to the previous/next sidebar item.
  // Ignored while typing in an input/textarea/select so it never hijacks
  // normal form entry inside the section content or an open drawer.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key !== "[" && e.key !== "]") return;
      const idx = items.findIndex((i) => i.id === active);
      if (idx === -1) return;
      const nextIdx = e.key === "]" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
      goTo(items[nextIdx].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, active, goTo]);

  if (!authLoading && !user) {
    return <SignedOutState onLogin={() => router.push(`/${locale}/${country}/profile`)} />;
  }

  if (authLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col bg-white dark:bg-gray-950">
      {/* Fixed header band — sits below the global navbar and never scrolls
          away on md+; on mobile it just scrolls with the page like before. */}
      <div className="shrink-0 w-full px-6 sm:px-10 lg:px-16 pt-24 pb-6 border-b border-gray-100 dark:border-gray-800">
        <SectionHeader
          title={tHeader("breadcrumb.settings")}
          subtitle={tHeader("pageSubtitle")}
          backHref={`/${locale}/${country}/profile`}
        />
      </div>

      {/* Below the header: sidebar and content each scroll independently on
          md+ (bounded by the remaining viewport height); on mobile this is
          just normal page flow. */}
      <div className="flex-1 md:min-h-0 flex flex-col md:flex-row gap-6 md:gap-6 lg:gap-8 px-6 sm:px-10 lg:px-16 pt-6 pb-16 md:pb-6 md:overflow-hidden">
        <AccountSidebar active={active} onSelect={goTo} isVendor={isListed} showRewards={showRewards} />

        <main className="flex-1 min-w-0 md:h-full md:min-h-0 md:overflow-y-auto md:pr-1 md:pl-2">
          <MobileAccountNav active={active} onSelect={goTo} isVendor={isListed} showRewards={showRewards} />

          <AnimatePresence mode="wait">
            {showSkeleton ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <SectionSkeleton />
              </motion.div>
            ) : (
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <SectionRouter section={active} user={user} isListed={isListed} onNavigate={goTo} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SectionRouter({ section, user, isListed, onNavigate }) {
  switch (section) {
    case "personal":
      return <PersonalInfo user={user} />;
    case "security":
      return <LoginSecurity user={user} onNavigate={onNavigate} />;
    case "notifications":
      return <Notifications />;
    case "payments":
      return <Payments />;
    case "addresses":
      return <Addresses />;
    case "rewards":
      return <Rewards />;
    case "preferences":
      return <Preferences />;
    case "privacy":
      return <Privacy onNavigate={onNavigate} />;
    case "devices":
      return <Devices />;
    case "connected":
      return <ConnectedAccounts />;
    case "host":
      return isListed ? <HostSettings /> : null;
    case "help":
      return <HelpSupport />;
    default:
      return <PersonalInfo user={user} />;
  }
}

function PageSkeleton() {
  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col bg-white dark:bg-gray-950">
      <div className="shrink-0 w-full px-6 sm:px-10 lg:px-16 pt-24 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="h-8 w-72 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse mb-3" />
        <div className="h-4 w-96 max-w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
      <div className="flex-1 md:min-h-0 flex flex-col md:flex-row gap-6 lg:gap-8 px-6 sm:px-10 lg:px-16 pt-6 pb-16 md:pb-6 md:overflow-hidden">
          <div className="hidden md:block md:w-[72px] lg:w-[300px] shrink-0 space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
          <div className="flex-1 md:h-full md:min-h-0 md:overflow-y-auto">
            <SectionSkeleton />
          </div>
      </div>
    </div>
  );
}

function SignedOutState({ onLogin }) {
  const t = useTranslations("profile.signedOut");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center pt-24 bg-white dark:bg-gray-950">
      <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
        <IconFolder size={26} className="text-violet-600" stroke={1.75} />
      </div>
      <div>
        <p className="text-[17px] font-semibold text-gray-900 dark:text-gray-50">{t("title")}</p>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">{t("subtitle")}</p>
      </div>
      <button
        type="button"
        onClick={onLogin}
        className="px-6 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13.5px] font-semibold hover:opacity-90 transition"
      >
        {t("cta")}
      </button>
    </div>
  );
}
