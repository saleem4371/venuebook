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
 *   Mobile (<md):   a native-app-style master/detail flow (like Airbnb's
 *                   mobile Account settings): a full-screen list
 *                   (MobileAccountList) with no content underneath;
 *                   tapping a row is a real router.push(?tab=<id>), and the
 *                   detail screen's back arrow calls router.back() — so the
 *                   phone/browser's own back gesture returns to the list.
 *
 * Section switching is query-param driven (?tab=personal) so a section is
 * directly linkable/refreshable, and each switch briefly shows a skeleton
 * (SectionSkeleton) before the real content fades in — a deliberate,
 * honest transition delay, not a fake network wait. On mobile, the absence
 * of ?tab (or an invalid value) means "show the list" — DEFAULT_SECTION is
 * only used to pick what desktop's always-visible content pane shows.
 *
 * `Rewards & Membership` only appears for accounts with a farmstay booking
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
import { AccountSidebar, MobileAccountList, useAccountNavItems } from "./components/AccountSidebar";

import PersonalInfo from "./components/sections/PersonalInfo";
import LoginSecurity from "./components/sections/LoginSecurity";
import Notifications from "./components/sections/Notifications";
import Payments from "./components/sections/Payments";
import Rewards from "./components/sections/Rewards";
import Preferences from "./components/sections/Preferences";
import Privacy from "./components/sections/Privacy";
import Devices from "./components/sections/Devices";
import ConnectedAccounts from "./components/sections/ConnectedAccounts";
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

  // `requested` is the raw ?tab value (or null) — used as-is to decide the
  // mobile list-vs-detail screen. `active` is the same thing but defaulted,
  // used for desktop's always-visible content pane and as the section key.
  const requested = searchParams.get("tab");
  const requestedValid = requested && validIds.has(requested);
  const active = requestedValid ? requested : DEFAULT_SECTION;
  const mobileListMode = !requestedValid;

  const [showSkeleton, setShowSkeleton] = useState(false);

  // Only the very first "list → detail" transition (no tab yet → a tab)
  // pushes a new history entry — that's what makes the mobile detail
  // screen's back gesture return to the list. Every switch after that
  // (detail → another detail on mobile, or sidebar clicks on desktop)
  // uses replace instead, exactly like Messages' handleSelect: without
  // it, clicking through several sections stacks one history entry per
  // click, and the header's back arrow would need one press per section
  // visited before it actually left the page — landing nowhere useful in
  // between — instead of returning straight to wherever the user came
  // from before opening Account Settings at all.
  const goTo = useCallback(
    (id) => {
      if (id === requested) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      const url = `/${locale}/${country}/account/settings?${params.toString()}`;
      if (mobileListMode) {
        router.push(url, { scroll: false });
      } else {
        router.replace(url, { scroll: false });
      }
    },
    [requested, searchParams, router, locale, country, mobileListMode],
  );

  const backToList = useCallback(() => router.back(), [router]);

  // One-shot "slide up + fade in" entrance for phone widths (<768px) only —
  // desktop/tablet mount instantly (initial={false}), matching a native
  // settings screen opening smoothly instead of just popping in.
  const [mobileEntry] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

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
    <motion.div
      initial={mobileEntry ? { y: 16, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-white dark:bg-gray-950"
    >
      {/* Fixed header band — sits below the global navbar and never scrolls
          away on lg+; below that (including tablet) it just scrolls with
          the page like before. Desktop (lg+) always shows "Account
          Settings". Everything below lg — phone AND tablet — gets the
          master/detail flow: this switches between the list screen header
          and the active section's own title + a back arrow that returns to
          the list, matching a native settings app / Airbnb's mobile
          Account settings all the way up to 1024px. */}
      <div
        className="shrink-0 w-full px-6 sm:px-10 lg:px-16 pt-4 md:pt-20 lg:pt-28 pb-3 border-b border-gray-100 dark:border-gray-800 lg:border-b lg:border-gray-100 dark:lg:border-gray-800 lg:pb-6"
      >
        <div className="hidden lg:block">
          <SectionHeader title={tHeader("breadcrumb.settings")} subtitle={tHeader("pageSubtitle")} onBack={backToList} />
        </div>
        <div className="lg:hidden">
          {mobileListMode ? (
            <SectionHeader title={tHeader("breadcrumb.settings")} subtitle={tHeader("pageSubtitle")} onBack={backToList} />
          ) : (
            <SectionHeader onBack={backToList} />
          )}
        </div>
      </div>

      {/* Below the header: sidebar and content each scroll independently on
          lg+ (bounded by the remaining viewport height). Below lg (phone +
          tablet) this is a real router-driven master/detail flow — only the
          list OR the detail content is ever mounted, never both. */}
      <div
        className="flex-1 lg:min-h-0 flex flex-col lg:flex-row gap-6 lg:gap-8 px-6 sm:px-10 lg:px-16 pt-4 lg:pt-6 pb-16 lg:pb-6 lg:overflow-hidden"
      >
        <AccountSidebar active={active} onSelect={goTo} isVendor={isListed} showRewards={showRewards} />

        {mobileListMode && (
          <div className="lg:hidden flex-1 min-w-0">
            <MobileAccountList onSelect={goTo} isVendor={isListed} showRewards={showRewards} />
          </div>
        )}

        <main
          className={`flex-1 min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pl-2 ${mobileListMode ? "hidden lg:block" : "block"}`}
        >
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
                <SectionRouter section={active} user={user} onNavigate={goTo} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}

function SectionRouter({ section, user, onNavigate }) {
  switch (section) {
    case "personal":
      return <PersonalInfo user={user} />;
    case "security":
      return <LoginSecurity user={user} onNavigate={onNavigate} />;
    case "notifications":
      return <Notifications />;
    case "payments":
      return <Payments />;
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
    case "help":
      return <HelpSupport />;
    default:
      return <PersonalInfo user={user} />;
  }
}

function PageSkeleton() {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-white dark:bg-gray-950">
      <div className="shrink-0 w-full px-6 sm:px-10 lg:px-16 pt-4 md:pt-20 lg:pt-28 pb-3 sm:pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="h-8 w-72 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse mb-3" />
        <div className="h-4 w-96 max-w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
      <div className="flex-1 lg:min-h-0 flex flex-col lg:flex-row gap-6 lg:gap-8 px-6 sm:px-10 lg:px-16 pt-4 lg:pt-6 pb-16 lg:pb-6 lg:overflow-hidden">
          <div className="hidden lg:block lg:w-[300px] shrink-0 space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
          <div className="flex-1 lg:h-full lg:min-h-0 lg:overflow-y-auto">
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
