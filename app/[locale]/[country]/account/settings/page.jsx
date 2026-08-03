"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { IconFolder } from "@tabler/icons-react";

import { useAuth } from "@/context/AuthContext";
import { hasFarmstayBooking } from "@/app/[locale]/[country]/profile/data/mockProfileData";

import { SectionHeader, SectionSkeleton } from "./components/ui";
import {
  AccountSidebar,
  MobileAccountList,
  useAccountNavItems,
} from "./components/AccountSidebar";

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

import {
  updateProfile as updateProfileApi,
  loadProfileApi,
  rewardsApi,
} from "@/services/account.service";

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
  const requestedValid = requested && validIds.has(requested);
  const active = requestedValid ? requested : DEFAULT_SECTION;
  const mobileListMode = !requestedValid;

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [profiles, setProfiles] = useState({});
  const [rewards, setRewards] = useState({});

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
  const [mobileEntry] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
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
      const nextIdx =
        e.key === "]"
          ? (idx + 1) % items.length
          : (idx - 1 + items.length) % items.length;
      goTo(items[nextIdx].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, active, goTo]);

  if (!authLoading && !user) {
    return (
      <SignedOutState
        onLogin={() => router.push(`/${locale}/${country}/profile`)}
      />
    );
  }

  const handleUpdateProfile = async (payload) => {
    try {
      const res = await updateProfileApi(payload);

      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const load = useCallback(async () => {
    try {
      const resp = await loadProfileApi();
      setProfiles(resp.data);
      const respq = await rewardsApi();
      setRewards(respq.data);
    } finally {
      // setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

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
      <div className="shrink-0 w-full px-6 sm:px-10 lg:px-16 pt-4 md:pt-20 lg:pt-28 pb-3 border-b border-gray-100 dark:border-gray-800 lg:border-b lg:border-gray-100 dark:lg:border-gray-800 lg:pb-6">
        <div className="hidden lg:block">
          <SectionHeader
            title={tHeader("breadcrumb.settings")}
            subtitle={tHeader("pageSubtitle")}
            onBack={backToList}
          />
        </div>
        <div className="lg:hidden">
          {mobileListMode ? (
            <SectionHeader
              title={tHeader("breadcrumb.settings")}
              subtitle={tHeader("pageSubtitle")}
              onBack={backToList}
            />
          ) : (
            <SectionHeader onBack={backToList} />
          )}
        </div>
      </div>

      <div className="flex-1 lg:min-h-0 flex flex-col lg:flex-row gap-6 lg:gap-8 px-6 sm:px-10 lg:px-16 pt-4 lg:pt-6 pb-16 lg:pb-6 lg:overflow-hidden">
        <AccountSidebar
          active={active}
          onSelect={goTo}
          isVendor={isListed}
          showRewards={showRewards}
        />

        {mobileListMode && (
          <div className="lg:hidden flex-1 min-w-0">
            <MobileAccountList
              onSelect={goTo}
              isVendor={isListed}
              showRewards={showRewards}
            />
          </div>
        )}

        <main
          className={`flex-1 min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pl-2 ${mobileListMode ? "hidden lg:block" : "block"}`}
        >
          <AnimatePresence mode="wait">
            {showSkeleton ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
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
                <SectionRouter
                  section={active}
                  user={user}
                  onNavigate={goTo}
                  profiles={profiles}
                  updateProfile={handleUpdateProfile}
                  rewards={rewards}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}

function SectionRouter({
  section,
  user,
  onNavigate,
  profiles,
  updateProfile,
  rewards,
}) {
  switch (section) {
    case "personal":
      return (
        <PersonalInfo
          user={user}
          profiles={profiles}
          updateProfile={updateProfile}
        />
      );
    case "security":
      return <LoginSecurity user={user} onNavigate={onNavigate} />;
    case "notifications":
      return <Notifications />;
    case "payments":
      return <Payments />;
    case "rewards":
      return <Rewards rewards={rewards} />;
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
            <div
              key={i}
              className="h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
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
        <p className="text-[17px] font-semibold text-gray-900 dark:text-gray-50">
          {t("title")}
        </p>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
          {t("subtitle")}
        </p>
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
