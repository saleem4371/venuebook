"use client";

/**
 * /app/[locale]/[country]/profile/page.jsx
 *
 * Customer Profile — full redesign, v2.
 *
 * LAYOUT: desktop (lg+) is a FIXED, no-page-scroll 3-column dashboard
 * (identity/upcoming | bookings/offers | collections/recently-viewed/
 * notifications), per direct user request after seeing a reference
 * mockup. Full detail that doesn't fit a glance view — Account Settings,
 * Password, Danger Zone, the complete Bookings list, Member/Farm Rewards
 * detail — lives in slide-over drawers instead of being cut. Mobile/tablet
 * falls back to the original full-detail vertical stack (same components,
 * unchanged) because a phone screen can't fit a fixed dashboard regardless
 * of layout.
 *
 * DATA REALITY (unchanged from v1 — see component headers for the full
 * breakdown):
 *   - user (name/email/avatar) — REAL, via useAuth().
 *   - Collections / Saved / Recently Viewed — REAL, same
 *     likedProperty/UserWishlist/UserWishlistCategory/UserCompare/
 *     recent_views calls collections/page.jsx already uses, fetched once
 *     here and passed to both the desktop widgets and the mobile fallback.
 *   - Bookings / Offers / Notifications — MOCK, no confirmed
 *     customer-facing endpoint exists yet (see BookingsSection.jsx header).
 *   - Loyalty/membership — REAL SYSTEM (config/checkoutConfig.js), reused
 *     everywhere a points/tier number appears so they all agree.
 *
 * Nothing in /hooks/useRegion.js, /hooks/useCurrency.js, /hooks/useLocale.js,
 * /context/RegionContext.jsx, next-intl config, or the theme system was
 * touched — this page only consumes them.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Folder } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import {
  likedProperty,
  UserWishlist,
  UserWishlistCategory,
  UserCompare,
  addLikedProperty,
  addCompareAPI,
  removeCompareAPI,
} from "@/services/venues.service";
import { recent_views } from "@/services/home.service";
import { POINTS_PER_INR } from "@/config/checkoutConfig";
import WishlistPopup from "@/app/[locale]/[country]/search/[type]/components/WishlistPopup";

import { SlideOverPanel } from "./components/shared/ui";

/* Full-detail components — used in drawers (desktop) and as the whole page
   (mobile fallback). Unchanged from v1. */
import ProfileHeader from "./components/ProfileHeader";
import QuickStats from "./components/QuickStats";
import MemberCard from "./components/MemberCard";
import FarmRewards from "./components/FarmRewards";
import BookingsSection from "./components/BookingsSection";
import CollectionsSection from "./components/CollectionsSection";
import RecentlyViewed from "./components/RecentlyViewed";
import OffersSection from "./components/OffersSection";
import NotificationsSection from "./components/NotificationsSection";
import AccountSettingsGrid from "./components/AccountSettingsGrid";
import PasswordCard from "./components/PasswordCard";

/* Compact widgets — desktop fixed dashboard only. */
import IdentityPanel from "./components/widgets/IdentityPanel";
import UpcomingBookingCard from "./components/widgets/UpcomingBookingCard";
import BookingsPanel from "./components/widgets/BookingsPanel";
import CollectionsPanel from "./components/widgets/CollectionsPanel";
import RecentlyViewedPanel from "./components/widgets/RecentlyViewedPanel";
import OffersPanel from "./components/widgets/OffersPanel";

import { computeMockWalletPoints, hasFarmstayBooking } from "./data/mockProfileData";

function unwrapList(res) {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.result)) return d.result;
  return [];
}

function extractId(raw) {
  return (
    raw?.venue_id || raw?.property_id || raw?.childVenueId || raw?.child_venue_id || raw?.id || raw?.venueId || null
  );
}

/**
 * Real conditional render, not a CSS-hide of both layouts — the desktop
 * fixed dashboard and the mobile full-detail stack are different component
 * trees (AccountSettingsGrid alone has a DOM id, real API calls, and a
 * mounted RegionLanguageModal; mounting both at once on every screen size
 * would double all of that and produce a duplicate id). `null` = not yet
 * measured (first paint/SSR) — resolves to a real boolean before the first
 * user-visible frame in practice since this runs in a layoutEffect-like
 * pass via useEffect on mount.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { setLoginOpen } = useUI();
  const { locale, country } = useParams();
  const tDrawer = useTranslations("profile.drawer");

  const [liked, setLiked] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [collections, setCollections] = useState([]);
  const [compares, setCompares] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [wishlistVenue, setWishlistVenue] = useState(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);

  const isDesktop = useIsDesktop();

  const load = useCallback(async () => {
    if (!user) {
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    try {
      const [likedRes, wlRes, catRes, cmpRes, rvRes] = await Promise.allSettled([
        likedProperty(),
        UserWishlist(),
        UserWishlistCategory(),
        UserCompare(),
        recent_views(),
      ]);
      setLiked(likedRes.status === "fulfilled" ? unwrapList(likedRes.value) : []);
      setWishlist(wlRes.status === "fulfilled" ? unwrapList(wlRes.value) : []);
      setCollections(catRes.status === "fulfilled" ? unwrapList(catRes.value) : []);
      setCompares(cmpRes.status === "fulfilled" ? unwrapList(cmpRes.value) : []);
      setRecentViews(rvRes.status === "fulfilled" ? unwrapList(rvRes.value) : []);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const likedIds = useMemo(() => new Set(liked.map(extractId).filter(Boolean)), [liked]);

  const onLikedProperty = useCallback(
    async (venue) => {
      if (!user) {
        setLoginOpen(true);
        return;
      }
      await addLikedProperty({ property_id: venue.childVenueId, property_type: venue.category || "venues" });
      load();
    },
    [user, load, setLoginOpen],
  );

  const onCompare = useCallback(
    async (venue, action) => {
      if (!user) {
        setLoginOpen(true);
        return;
      }
      const payload = { venue_id: venue.childVenueId };
      try {
        action ? await addCompareAPI(payload) : await removeCompareAPI(payload);
      } finally {
        load();
      }
    },
    [user, load, setLoginOpen],
  );

  const walletPoints = useMemo(() => computeMockWalletPoints(POINTS_PER_INR), []);
  const showFarmRewards = useMemo(() => hasFarmstayBooking(), []);

  const joinedRaw = user?.createdAt || user?.created_at || user?.joinedAt;
  const memberSinceYear =
    joinedRaw && !Number.isNaN(new Date(joinedRaw).getTime()) ? new Date(joinedRaw).getFullYear() : null;

  if (!authLoading && !user) {
    return <SignedOutState onLogin={() => setLoginOpen(true)} />;
  }

  /* isDesktop === null → not measured yet (first paint). Render nothing
     rather than guessing, to avoid a flash of the wrong layout. */
  if (isDesktop === null) {
    return <div className="min-h-screen bg-white dark:bg-gray-950" />;
  }

  return (
    <div className="bg-white dark:bg-gray-950 overflow-x-hidden">
      {isDesktop ? (
        /* ════════════════════════════════════════════════════════════════
           DESKTOP — fixed, single-screen 3-column dashboard, no page scroll.
           `min-w-0` on every column + `min-w-0` on this grid guards against
           the classic CSS-grid overflow trap: a grid item's default
           min-width is `auto` (= its content's min-content size), so a
           booking name or card that can't shrink below its intrinsic width
           can silently blow the 1fr center track past the viewport instead
           of wrapping/truncating — that's what was cutting the right column
           off-screen on real laptop widths.
           ════════════════════════════════════════════════════════════════ */
        <div className="flex flex-col h-screen pt-20 pb-3 px-3 xl:px-4 overflow-hidden">
          <div className="grid grid-cols-[260px_1fr_280px] xl:grid-cols-[300px_1fr_320px] gap-3 flex-1 min-h-0 min-w-0">
            {/* LEFT — identity + upcoming booking */}
            <div className="flex flex-col gap-3 min-h-0 min-w-0">
              <IdentityPanel
                user={user}
                walletPoints={walletPoints}
                collectionsCount={collections.length}
                memberSinceYear={memberSinceYear}
                onOpenSettings={() => setSettingsOpen(true)}
                onOpenRewards={() => setRewardsOpen(true)}
              />
              <UpcomingBookingCard />
            </div>

            {/* CENTER — bookings (most important section) + offers ribbon */}
            <div className="flex flex-col gap-3 min-h-0 min-w-0">
              <BookingsPanel />
              <OffersPanel />
            </div>

            {/* RIGHT — collections, recently viewed, notifications */}
            <div className="flex flex-col gap-3 min-h-0 min-w-0 overflow-y-auto no-scrollbar">
              <CollectionsPanel collections={collections} wishlist={wishlist} loading={dataLoading} locale={locale} country={country} />
              <RecentlyViewedPanel recentViews={recentViews} loading={dataLoading} locale={locale} country={country} />
              <NotificationsSection />
            </div>
          </div>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════════
           MOBILE / TABLET — full-detail vertical stack (unchanged from v1).
           ════════════════════════════════════════════════════════════════ */
        <div className="min-h-screen pt-20 pb-14 overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto px-4 space-y-4 min-w-0">
          <ProfileHeader user={user} />

          <QuickStats
            collectionsCount={collections.length}
            savedCount={wishlist.length}
            loading={dataLoading}
            walletPoints={walletPoints}
          />

          <div className={`grid grid-cols-1 ${showFarmRewards ? "sm:grid-cols-2" : ""} gap-4`}>
            <MemberCard walletPoints={walletPoints} memberSinceYear={memberSinceYear} />
            {showFarmRewards && <FarmRewards walletPoints={walletPoints} />}
          </div>

          <BookingsSection />

          <CollectionsSection collections={collections} wishlist={wishlist} loading={dataLoading} locale={locale} country={country} />

          <RecentlyViewed
            recentViews={recentViews}
            loading={dataLoading}
            user={user}
            likedIds={likedIds}
            likedTotal={liked.length}
            wishlist={wishlist}
            compares={compares}
            onWishlist={setWishlistVenue}
            onCompare={onCompare}
            onLikedProperty={onLikedProperty}
            locale={locale}
            country={country}
          />

          <div className="grid grid-cols-1 gap-4">
            <OffersSection />
            <NotificationsSection />
          </div>

          <AccountSettingsGrid user={user} />

          <PasswordCard user={user} />
        </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DRAWERS — only reachable from the desktop layout's triggers.
          ══════════════════════════════════════════════════════════════════ */}
      <SlideOverPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} title={tDrawer("settingsTitle")}>
        <div className="space-y-4">
          <AccountSettingsGrid user={user} />
          <PasswordCard user={user} />
        </div>
      </SlideOverPanel>

      <SlideOverPanel open={rewardsOpen} onClose={() => setRewardsOpen(false)} title={tDrawer("rewardsTitle")}>
        <div className={`grid grid-cols-1 ${showFarmRewards ? "gap-4" : ""}`}>
          <MemberCard walletPoints={walletPoints} memberSinceYear={memberSinceYear} />
          {showFarmRewards && <FarmRewards walletPoints={walletPoints} />}
        </div>
      </SlideOverPanel>

      {/* Same Save-to-Collection modal the search page and /collections use —
          reused, not reimplemented, so save/move/remove stays one code path. */}
      <WishlistPopup
        wishvenue={collections}
        wishlist={wishlist}
        venue={wishlistVenue}
        open={!!wishlistVenue}
        user={user}
        onClose={() => {
          setWishlistVenue(null);
          load();
        }}
      />
    </div>
  );
}

function SignedOutState({ onLogin }) {
  const t = useTranslations("profile.signedOut");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center pt-24 bg-white dark:bg-gray-950">
      <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
        <Folder size={26} className="text-violet-600" />
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
