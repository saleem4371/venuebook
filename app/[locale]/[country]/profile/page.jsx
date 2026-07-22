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
import BookingsPanel from "./components/widgets/BookingsPanel";
import CollectionsPanel from "./components/widgets/CollectionsPanel";
import RecentlyViewedPanel from "./components/widgets/RecentlyViewedPanel";
import LikedPropertiesPanel from "./components/widgets/LikedPropertiesPanel";
import MessagesNavCard from "./components/widgets/MessagesNavCard";
import OffersPanel from "./components/widgets/OffersPanel";

import { computeMockWalletPoints, hasFarmstayBooking, MOCK_BOOKINGS } from "./data/mockProfileData";

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

  // TEMPORARY — dev-only preview toggle (see IdentityPanel.jsx's header
  // comment), for reviewing the Bookings↔Offers layout swap below without
  // actually emptying MOCK_BOOKINGS. Remove alongside that toggle once the
  // swapped layout has been reviewed.
  const [previewNoBookings, setPreviewNoBookings] = useState(false);
  const hasBookings = !previewNoBookings && MOCK_BOOKINGS.length > 0;

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

  /* isDesktop === null → not measured yet (first paint). Show a skeleton
     that approximates the desktop layout on lg+ and the mobile stack below. */
  if (isDesktop === null || authLoading) {
    return <ProfileSkeleton />;
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

           The whole grid used to be 3 SEPARATE cards (each with its own
           rounded corners/border/shadow) sitting in a `gap-3` grid — which
           looked fine when every column's content filled its height, but
           the moment one didn't (e.g. only 3 offers in the expanded Offers
           view, or a short bookings list) that column read as a floating
           box with dead space around it, disconnected from its neighbors.
           Per direct feedback, this is now ONE shared card (rounded-3xl
           border/shadow on the OUTER wrapper only) with `divide-x` between
           Left/Center/Right in place of the gap, and each widget passes
           `flat` so it renders as a plain section (no nested card chrome)
           separated from its neighbors by a `divide-y` line instead of its
           own border+shadow+gap. A short section now just reads as empty
           space within one continuous surface, not a mismatched card.
           ════════════════════════════════════════════════════════════════ */
        <div className="flex flex-col h-screen pt-20 pb-3 px-3 xl:px-4 overflow-hidden">
          <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex-1 min-h-0 min-w-0 overflow-hidden">
            <div className="grid grid-cols-[260px_1fr_280px] xl:grid-cols-[300px_1fr_320px] h-full divide-x divide-gray-100 dark:divide-gray-800">
              {/* LEFT — identity + messages shortcut + offers ribbon (or, when
                  there are no bookings anywhere, Bookings itself moves here
                  in compact form and Offers takes over the center — see
                  `hasBookings` above). overflow-y-auto guards against a
                  shorter viewport clipping the new MessagesNavCard — same
                  pattern the right column already uses for the same reason. */}
              <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 min-h-0 min-w-0 overflow-y-auto no-scrollbar">
                <IdentityPanel
                  flat
                  user={user}
                  walletPoints={walletPoints}
                  collectionsCount={collections.length}
                  memberSinceYear={memberSinceYear}
                  onOpenSettings={() => setSettingsOpen(true)}
                  onOpenRewards={() => setRewardsOpen(true)}
                  previewNoBookings={previewNoBookings}
                  onTogglePreview={() => setPreviewNoBookings((v) => !v)}
                />
                <MessagesNavCard flat locale={locale} country={country} />
                {hasBookings ? <OffersPanel flat /> : <BookingsPanel compact flat />}
              </div>

              {/* CENTER — bookings (most important section), or Offers
                  expanded to fill this spot when there are no bookings at
                  all to show. */}
              <div className="flex flex-col min-h-0 min-w-0">
                {hasBookings ? <BookingsPanel flat /> : <OffersPanel expanded flat />}
              </div>

              {/* RIGHT — collections, liked properties, recently viewed, notifications */}
              <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 min-h-0 min-w-0 overflow-y-auto no-scrollbar">
                <CollectionsPanel flat collections={collections} wishlist={wishlist} loading={dataLoading} locale={locale} country={country} />
                <LikedPropertiesPanel flat liked={liked} loading={dataLoading} locale={locale} country={country} />
                <RecentlyViewedPanel flat recentViews={recentViews} loading={dataLoading} locale={locale} country={country} />
                <NotificationsSection compact flat />
              </div>
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
        <div className="space-y-5">
          <AccountSettingsGrid user={user} showHeader={false} />
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

/* ─────────────────────────────────────────────────────────────────────────────
   PROFILE SKELETON
   Shown while auth is loading or isDesktop hasn't resolved yet.
   Mirrors the real layout's column structure so the swap is seamless.
   Uses the global .sk-base class (CSS-variable shimmer, dark-mode aware,
   GPU-accelerated — defined in app/globals.css).
───────────────────────────────────────────────────────────────────────────── */
function Sk({ className }) {
  return <div className={`sk-base rounded-xl ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen overflow-x-hidden">

      {/* ── DESKTOP skeleton (lg+) ── 3-column mirroring the real dashboard */}
      <div className="hidden lg:flex flex-col h-screen pt-20 pb-3 px-3 xl:px-4 overflow-hidden">
        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex-1 min-h-0 overflow-hidden">
          <div className="grid grid-cols-[260px_1fr_280px] xl:grid-cols-[300px_1fr_320px] h-full divide-x divide-gray-100 dark:divide-gray-800">

            {/* Left — identity */}
            <div className="flex flex-col gap-5 p-5 overflow-hidden">
              <div className="flex items-center gap-3">
                <Sk className="w-14 h-14 rounded-full flex-none" />
                <div className="flex-1 space-y-2">
                  <Sk className="h-4 w-32" />
                  <Sk className="h-3 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => <Sk key={i} className="h-14 rounded-2xl" />)}
              </div>
              <div className="space-y-2">
                <Sk className="h-3 w-24 rounded-full" />
                <Sk className="h-2.5 rounded-full" />
              </div>
              <div className="mt-auto space-y-2.5">
                {[...Array(3)].map((_, i) => <Sk key={i} className="h-12 rounded-2xl" />)}
              </div>
            </div>

            {/* Center — bookings */}
            <div className="flex flex-col gap-3 p-5 overflow-hidden">
              <Sk className="h-5 w-36 rounded-full" />
              <div className="space-y-3 flex-1">
                {[...Array(4)].map((_, i) => <Sk key={i} className="h-24 rounded-2xl" />)}
              </div>
            </div>

            {/* Right — collections / liked / recent */}
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
              {/* Collections block */}
              <div className="flex-1 p-4 space-y-3">
                <Sk className="h-4 w-28 rounded-full" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Sk className="w-10 h-10 rounded-xl flex-none" />
                    <div className="flex-1 space-y-1.5">
                      <Sk className="h-3 w-full" />
                      <Sk className="h-2.5 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Liked block */}
              <div className="flex-1 p-4 space-y-3">
                <Sk className="h-4 w-24 rounded-full" />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Sk className="w-10 h-10 rounded-xl flex-none" />
                    <div className="flex-1 space-y-1.5">
                      <Sk className="h-3 w-full" />
                      <Sk className="h-2.5 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Recent block */}
              <div className="flex-1 p-4 space-y-3">
                <Sk className="h-4 w-32 rounded-full" />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Sk className="w-10 h-10 rounded-xl flex-none" />
                    <div className="flex-1 space-y-1.5">
                      <Sk className="h-3 w-full" />
                      <Sk className="h-2.5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── MOBILE skeleton (below lg) ── vertical stack */}
      <div className="lg:hidden pt-20 pb-14 px-4 space-y-4">
        {/* Profile header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Sk className="w-16 h-16 rounded-full flex-none" />
          <div className="flex-1 space-y-2">
            <Sk className="h-5 w-40" />
            <Sk className="h-3.5 w-28" />
            <Sk className="h-3 w-20" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2.5">
          {[...Array(4)].map((_, i) => <Sk key={i} className="h-16 rounded-2xl" />)}
        </div>

        {/* Member card */}
        <Sk className="h-28 rounded-2xl" />

        {/* Bookings */}
        <div className="space-y-3">
          <Sk className="h-4 w-28 rounded-full" />
          {[...Array(3)].map((_, i) => <Sk key={i} className="h-24 rounded-2xl" />)}
        </div>

        {/* Collections */}
        <div className="space-y-3">
          <Sk className="h-4 w-32 rounded-full" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(4)].map((_, i) => <Sk key={i} className="h-32 rounded-2xl" />)}
          </div>
        </div>

        {/* Recently viewed */}
        <div className="space-y-3">
          <Sk className="h-4 w-36 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <Sk key={i} className="h-28 rounded-2xl" />)}
          </div>
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
