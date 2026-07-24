"use client";

/**
 * /app/[locale]/[country]/profile/page.jsx
 *
 * Customer Profile — full redesign, v2.
 *
 * LAYOUT: desktop (lg+) is a FIXED, no-page-scroll 3-column dashboard
 * (identity/upcoming | bookings/offers | collections/recently-viewed/
 * notifications), per direct user request after seeing a reference
 * mockup. Full detail that doesn't fit a glance view — Account Settings
 * (now its own route, see IdentityPanel's onOpenSettings), the complete
 * Bookings list, Member/Farm Rewards detail — lives in slide-over drawers
 * or dedicated toggled views instead of being cut.
 *
 * Mobile/tablet (< lg) is now the SAME widget set as desktop
 * (IdentityPanel/GreetingBar/BookingsPanel/ReelsForYouSection/
 * OffersPanel/SuggestionsSection/CollectionsPanel/LikedPropertiesPanel/
 * RecentlyViewedPanel/NotificationsSection), reflowed into a single
 * scrolling column of three bordered card groups instead of 3 side-by-side
 * columns — not the old always-expanded, everything-stacked-at-once page
 * (ProfileHeader/QuickStats/MemberCard/FarmRewards/BookingsSection/
 * CollectionsSection/RecentlyViewed/OffersSection/AccountSettingsGrid/
 * PasswordCard, all removed from this page). Bookings uses the exact same
 * GreetingBar-driven toggle as desktop (feed ↔ full Bookings) instead of
 * an always-expanded inline section; Collections/Liked/Recently Viewed
 * each already send "View All" to their own real page, and Notifications'
 * "View All" already opens its own drawer — so none of those needed a new
 * toggle state, only Bookings did.
 *
 * DATA REALITY (unchanged from v1 — see component headers for the full
 * breakdown):
 *   - user (name/email/avatar) — REAL, via useAuth().
 *   - Collections / Saved / Recently Viewed — REAL, same
 *     likedProperty/UserWishlist/UserWishlistCategory/UserCompare/
 *     recent_views calls collections/page.jsx already uses, fetched once
 *     here and passed to both the desktop widgets and the mobile fallback.
 *   - Bookings / Offers / Notifications — MOCK, no confirmed
 *     customer-facing endpoint exists yet (see BookingsPanel.jsx header).
 *   - Loyalty/membership — REAL SYSTEM (config/checkoutConfig.js), reused
 *     everywhere a points/tier number appears so they all agree.
 *
 * Nothing in /hooks/useRegion.js, /hooks/useCurrency.js, /hooks/useLocale.js,
 * /context/RegionContext.jsx, next-intl config, or the theme system was
 * touched — this page only consumes them.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Folder } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import {
  likedProperty,
  UserWishlist,
  UserWishlistCategory,
  UserCompare,
  addCompareAPI,
  removeCompareAPI,
} from "@/services/venues.service";
import { recent_views, Api_recommeded } from "@/services/home.service";
import { usePreferredLocation } from "@/hooks/usePreferredLocation";
import { POINTS_PER_INR } from "@/config/checkoutConfig";
import WishlistPopup from "@/app/[locale]/[country]/search/[type]/components/WishlistPopup";

import { SlideOverPanel } from "./components/shared/ui";

/* Full-detail components — only still used inside the Rewards drawer
   below (MemberCard/FarmRewards). Everything else that used to live here
   (ProfileHeader, QuickStats, BookingsSection, CollectionsSection,
   RecentlyViewed, OffersSection, AccountSettingsGrid, PasswordCard) has
   been replaced by the compact widgets below (reused on both desktop and
   mobile/tablet now) or, for account management, by the dedicated
   /account/settings route. */
import MemberCard from "./components/MemberCard";
import FarmRewards from "./components/FarmRewards";
import NotificationsSection from "./components/NotificationsSection";

/* Compact widgets — shared by desktop and mobile/tablet. */
import IdentityPanel from "./components/widgets/IdentityPanel";
import BookingsPanel from "./components/widgets/BookingsPanel";
import CollectionsPanel from "./components/widgets/CollectionsPanel";
import RecentlyViewedPanel from "./components/widgets/RecentlyViewedPanel";
import LikedPropertiesPanel from "./components/widgets/LikedPropertiesPanel";
import OffersPanel from "./components/widgets/OffersPanel";
import GreetingBar from "./components/widgets/GreetingBar";
import ReelsForYouSection from "./components/widgets/ReelsForYouSection";
import SuggestionsSection from "./components/widgets/SuggestionsSection";

import { computeMockWalletPoints, hasFarmstayBooking } from "./data/mockProfileData";

function unwrapList(res) {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.result)) return d.result;
  return [];
}

/**
 * Real conditional render, not a CSS-hide of both layouts — the desktop
 * 3-column grid and the mobile/tablet stacked-card layout are different
 * component trees (each mounts its own IdentityPanel/GreetingBar/
 * BookingsPanel/etc. instances; mounting both at once on every screen size
 * would double every widget's mock-data reads and event handlers for no
 * reason). `null` = not yet measured (first paint/SSR) — resolves to a
 * real boolean before the first user-visible frame in practice since this
 * runs in a layoutEffect-like pass via useEffect on mount.
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
  const router = useRouter();
  const tDrawer = useTranslations("profile.drawer");

  const [liked, setLiked] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [collections, setCollections] = useState([]);
  const [compares, setCompares] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [wishlistVenue, setWishlistVenue] = useState(null);

  // Recommended venues — same source (Api_recommeded + the "vb_preferred_location"
  // localStorage key) home/page.jsx's own getRecommendedVenues() uses, fetched
  // for SuggestionsSection below. ReelsForYouSection no longer reads from this
  // — that live, location-scoped call can come back thin/single-category,
  // which made the Reels rail read as "category-wise"; it now sources from
  // MOCK_REELS (data/mockProfileData.js) instead, shuffled across every
  // category on each mount.
  const [recommended, setRecommended] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);

  const [rewardsOpen, setRewardsOpen] = useState(false);

  // Center-column toggle — GreetingBar's "Bookings" pill (always visible,
  // both modes) swaps the CENTER column between the feed (Reels +
  // Suggestions + Offers) and a single Bookings panel filling the column —
  // see BookingsPanel.jsx's `onBack`, which flips this back from the other
  // side. Bookings itself now lives permanently in the LEFT column
  // (compact) while in feed mode, and visually "moves" into the center via
  // the shared `layoutId="bookings-panel"` motion transition below when
  // toggled open — replacing the old data-driven hasBookings↔Offers swap.
  const [showFullBookings, setShowFullBookings] = useState(false);

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

  // Same real preferred-location source home/page.jsx's own
  // getRecommendedVenues() reads from — but via the hook (hooks/
  // usePreferredLocation.js) instead of a raw localStorage read, so a
  // profile page visit that never went through /home first still gets a
  // location: the hook falls back to IP-based detection (ipapi.co) when
  // nothing is cached yet, the exact same fallback /home itself depends
  // on. Without this, Reels/Suggestions would only ever populate for an
  // account that happened to visit /home first, and silently stay empty
  // (indistinguishable from "no recommendations") for everyone else.
  const { location: preferredLocation } = usePreferredLocation();

  const loadRecommended = useCallback(async (loc) => {
    setRecommendedLoading(true);
    try {
      const res = await Api_recommeded(JSON.stringify(loc));
      setRecommended(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      // Logged rather than swallowed — an empty Reels/Suggestions row is
      // indistinguishable from "no recommendations" otherwise. If this
      // still comes back empty after the fallback location below, check
      // this console line: a thrown network/4xx/5xx here means the
      // /home/recommeded endpoint itself is the problem, not the location.
      console.error("[profile] Api_recommeded failed:", err);
      setRecommended([]);
    } finally {
      setRecommendedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (preferredLocation) {
      loadRecommended(preferredLocation);
      return;
    }
    // Still resolving (cache read, or the hook's own IP-detect fetch in
    // flight, which itself depends on ipapi.co being reachable) — give it
    // a few seconds, then fall back to a default location (matching
    // VENUEBOOK_STATE in mockProfileData.js) rather than giving up
    // entirely, so a blocked/failed IP lookup doesn't permanently blank
    // out Reels/Suggestions for this session.
    const timer = setTimeout(() => {
      loadRecommended({ label: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946 });
    }, 4000);
    return () => clearTimeout(timer);
  }, [preferredLocation, loadRecommended]);

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
           Per direct feedback, this is now ONE continuous full-bleed
           surface — no outer card border/shadow/margin either, it fills
           the entire viewport width and height below the navbar — with
           `divide-x` between Left/Center/Right in place of the old gap,
           and each widget passes `flat` so it renders as a plain section
           (no nested card chrome) separated from its neighbors by a
           `divide-y` line instead of its own border+shadow+gap. A short
           section now just reads as empty space within one continuous
           page, not a mismatched floating card.
           ════════════════════════════════════════════════════════════════ */
        <div className="flex flex-col h-screen pt-20 overflow-hidden">
          <LayoutGroup>
          <div className="grid grid-cols-[260px_1fr_280px] xl:grid-cols-[300px_1fr_320px] flex-1 min-h-0 min-w-0 divide-x divide-gray-100 dark:divide-gray-800">
            {/* LEFT — identity, then Bookings (compact). Bookings lives
                here permanently in feed mode — no more hasBookings-driven
                swap with Offers, Offers now lives in the center feed
                instead (below). When GreetingBar's "Bookings" pill is
                toggled on, this card disappears from here and the same
                `layoutId="bookings-panel"` reappears full-size in the
                center — framer-motion animates the transition between the
                two positions/sizes automatically, so it visually "moves"
                left → center rather than just popping in and out.
                `LayoutGroup` (wrapping this whole grid) is what lets that
                shared-element animation stay coordinated across the two
                separate AnimatePresence blocks below, instead of just
                cutting over. The messages shortcut used to live here as
                its own card (MessagesNavCard); it's now the "Messages"
                pill in GreetingBar's quick actions (center column), so
                this column doesn't repeat it. */}
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 min-h-0 min-w-0 overflow-y-auto no-scrollbar">
              <IdentityPanel
                flat
                user={user}
                walletPoints={walletPoints}
                onOpenSettings={() => router.push(`/${locale}/${country}/account/settings`)}
                onOpenRewards={() => setRewardsOpen(true)}
              />
              <AnimatePresence>
                {!showFullBookings && (
                  <motion.div
                    key="bookings-left"
                    layoutId="bookings-panel"
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <BookingsPanel compact flat />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CENTER — GreetingBar stays visible in BOTH modes (its
                "Bookings" pill is the toggle, so it can't disappear when
                toggled on — that's the "top header fix": it used to be
                feed-only content and vanished along with everything else).
                Below it:
                  · FEED mode (default): Reels for you, Offers, then
                    Suggestions (embedded — no internal scroll of its own,
                    this column owns the one scrollbar). Wrapped in its own
                    fade so the whole group crossfades out together rather
                    than each section popping independently while Bookings
                    is mid-flight into this column.
                  · FULL BOOKINGS mode: the same `layoutId="bookings-panel"`
                    from the left column reappears here, full height, owning
                    its own internal scroll (GreetingBar above it does not
                    scroll away) — the pill is the only way back now. */}
            <div
              className={
                showFullBookings
                  ? "flex flex-col min-h-0 min-w-0"
                  : "flex flex-col divide-y divide-gray-100 dark:divide-gray-800 min-h-0 min-w-0 overflow-y-auto no-scrollbar"
              }
            >
              <GreetingBar
                flat
                user={user}
                locale={locale}
                country={country}
                bookingsActive={showFullBookings}
                onToggleBookings={() => setShowFullBookings((v) => !v)}
              />

              {/* mode="wait" would delay this element's mount until
                  feed-rest's own exit finishes — by then the left card's
                  layoutId snapshot is already gone, so the entrance into
                  the center had no animation at all (just an instant pop).
                  Default (concurrent) mode lets both the left card's exit
                  and this one's entrance run in the same commit, which is
                  what the shared `layoutId="bookings-panel"` FLIP needs to
                  actually interpolate position/size instead of cutting over. */}
              <AnimatePresence initial={false}>
                {showFullBookings ? (
                  <motion.div
                    key="bookings-center"
                    layoutId="bookings-panel"
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col flex-1 min-h-0 border-t border-gray-100 dark:border-gray-800"
                  >
                    <BookingsPanel flat />
                  </motion.div>
                ) : (
                  <motion.div
                    key="feed-rest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800"
                  >
                    <ReelsForYouSection
                      flat
                      locale={locale}
                      country={country}
                      wishlist={wishlist}
                      compares={compares}
                      onWishlist={setWishlistVenue}
                      onCompare={onCompare}
                    />
                    <OffersPanel expanded flat embedded />
                    <SuggestionsSection flat venues={recommended} loading={recommendedLoading} locale={locale} country={country} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT — collections, liked properties, recently viewed, notifications */}
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 min-h-0 min-w-0 overflow-y-auto no-scrollbar">
              <CollectionsPanel flat collections={collections} wishlist={wishlist} loading={dataLoading} locale={locale} country={country} />
              <LikedPropertiesPanel flat liked={liked} loading={dataLoading} locale={locale} country={country} />
              <RecentlyViewedPanel flat recentViews={recentViews} loading={dataLoading} locale={locale} country={country} />
              <NotificationsSection compact flat />
            </div>
          </div>
          </LayoutGroup>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════════
           MOBILE / TABLET (< lg) — the same widgets as the desktop grid,
           reflowed into one scrolling column of 3 bordered card groups
           instead of 3 side-by-side columns:
             1. Identity + greeting/actions (desktop's LEFT top block +
                CENTER header, combined since there's no column to split
                them across).
             2. Feed ↔ full Bookings — same GreetingBar-driven toggle as
                desktop's center column; nothing here is ever "everything
                stacked at once," Bookings replaces the feed instead of
                joining it.
             3. Collections / Liked / Recently Viewed / Notifications —
                same as desktop's RIGHT column; each already sends
                "View All" to its own real page or drawer, so none of them
                needed a new toggle state.
           ════════════════════════════════════════════════════════════════ */
        <div className="min-h-screen pt-20 pb-14 overflow-x-hidden">
          <div className="max-w-[720px] mx-auto min-w-0 flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
            <IdentityPanel
              flat
              user={user}
              walletPoints={walletPoints}
              onOpenSettings={() => router.push(`/${locale}/${country}/account/settings`)}
              onOpenRewards={() => setRewardsOpen(true)}
            />
            <GreetingBar
              flat
              user={user}
              locale={locale}
              country={country}
              bookingsActive={showFullBookings}
              onToggleBookings={() => setShowFullBookings((v) => !v)}
            />

            <AnimatePresence mode="wait" initial={false}>
              {showFullBookings ? (
                <motion.div
                  key="bookings-mobile"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <BookingsPanel flat embedded />
                </motion.div>
              ) : (
                <motion.div
                  key="feed-mobile"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800"
                >
                  <ReelsForYouSection
                    flat
                    locale={locale}
                    country={country}
                    wishlist={wishlist}
                    compares={compares}
                    onWishlist={setWishlistVenue}
                    onCompare={onCompare}
                  />
                  <OffersPanel expanded flat embedded />
                  <SuggestionsSection flat venues={recommended} loading={recommendedLoading} locale={locale} country={country} />
                </motion.div>
              )}
            </AnimatePresence>

            <CollectionsPanel flat collections={collections} wishlist={wishlist} loading={dataLoading} locale={locale} country={country} />
            <LikedPropertiesPanel flat liked={liked} loading={dataLoading} locale={locale} country={country} />
            <RecentlyViewedPanel flat recentViews={recentViews} loading={dataLoading} locale={locale} country={country} />
            <NotificationsSection compact flat />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DRAWERS — reachable from both layouts' triggers (Account Settings
          now navigates to its own /account/settings route instead of
          opening a drawer here — see IdentityPanel's onOpenSettings above).
          ══════════════════════════════════════════════════════════════════ */}
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

      {/* ── DESKTOP skeleton (lg+) ──────────────────────────────────────
          Mirrors the real dashboard's current shape exactly: full-bleed,
          no outer card/border/shadow, divide-x between columns and
          divide-y between each column's own widgets (see the real render
          above — this used to wrap everything in a rounded/bordered card,
          which no longer exists). Left column has no MessagesNavCard
          placeholder anymore (that widget was removed); center column
          gains the greeting pills + reels rail + suggestions grid rows
          that didn't exist when this skeleton was last touched; right
          column gains a 4th block for NotificationsSection. */}
      <div className="hidden lg:flex flex-col h-screen pt-20 overflow-hidden">
        <div className="grid grid-cols-[260px_1fr_280px] xl:grid-cols-[300px_1fr_320px] flex-1 min-h-0 min-w-0 divide-x divide-gray-100 dark:divide-gray-800">

          {/* LEFT — identity, then offers/bookings ribbon */}
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 min-h-0 overflow-hidden">
            <div className="p-4 space-y-4">
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
                <Sk className="h-3 w-28 rounded-full" />
                <Sk className="h-2.5 rounded-full" />
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              <Sk className="h-4 w-24 rounded-full" />
              {[...Array(2)].map((_, i) => <Sk key={i} className="h-16 rounded-2xl" />)}
            </div>
          </div>

          {/* CENTER — greeting + quick-action pills, reels rail, suggestions grid, bookings list */}
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 min-h-0 overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="space-y-2 min-w-0">
                <Sk className="h-5 w-40" />
                <Sk className="h-3 w-32" />
              </div>
              <div className="flex gap-2 shrink-0">
                {[...Array(3)].map((_, i) => <Sk key={i} className="h-7 w-20 rounded-full" />)}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <Sk className="h-4 w-32 rounded-full" />
              <div className="flex gap-2 overflow-hidden">
                {[...Array(5)].map((_, i) => <Sk key={i} className="w-[88px] aspect-[9/16] rounded-xl flex-none" />)}
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1">
              <Sk className="h-4 w-36 rounded-full" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => <Sk key={i} className="h-32 rounded-2xl" />)}
              </div>
            </div>
          </div>

          {/* RIGHT — collections / liked / recent / notifications */}
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 min-h-0 overflow-hidden">
            {[
              { rows: 3, w: "w-28" },
              { rows: 2, w: "w-24" },
              { rows: 2, w: "w-32" },
              { rows: 2, w: "w-28" },
            ].map((block, bi) => (
              <div key={bi} className="p-4 space-y-3">
                <Sk className={`h-4 ${block.w} rounded-full`} />
                {[...Array(block.rows)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Sk className="w-10 h-10 rounded-xl flex-none" />
                    <div className="flex-1 space-y-1.5">
                      <Sk className="h-3 w-full" />
                      <Sk className="h-2.5 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── MOBILE/TABLET skeleton (below lg) ── one continuous flat
          column, no card boxes — mirrors the real layout's single
          divide-y flow (identity, greeting, feed, collections/liked/
          recent/notifications) instead of boxing each group. */}
      <div className="lg:hidden pt-20 pb-14 max-w-[720px] mx-auto flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
        {/* Identity */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Sk className="w-14 h-14 rounded-full flex-none" />
            <div className="flex-1 space-y-2">
              <Sk className="h-4 w-32" />
              <Sk className="h-3 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[...Array(2)].map((_, i) => <Sk key={i} className="h-14 rounded-2xl" />)}
          </div>
        </div>

        {/* Greeting */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="space-y-2 min-w-0">
            <Sk className="h-5 w-40" />
            <Sk className="h-3 w-32" />
          </div>
          <div className="flex gap-2 shrink-0">
            {[...Array(2)].map((_, i) => <Sk key={i} className="h-7 w-16 rounded-full" />)}
          </div>
        </div>

        {/* Feed — reels rail, offers grid */}
        <div className="p-4 space-y-3">
          <Sk className="h-4 w-32 rounded-full" />
          <div className="flex gap-2 overflow-hidden">
            {[...Array(4)].map((_, i) => <Sk key={i} className="w-[88px] aspect-[9/16] rounded-xl flex-none" />)}
          </div>
        </div>
        <div className="p-4 space-y-3">
          <Sk className="h-4 w-24 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <Sk key={i} className="h-24 rounded-2xl" />)}
          </div>
        </div>

        {/* Collections / liked / recently viewed / notifications */}
        {[
          { rows: 3, w: "w-28" },
          { rows: 2, w: "w-24" },
          { rows: 2, w: "w-32" },
          { rows: 2, w: "w-28" },
        ].map((block, bi) => (
          <div key={bi} className="p-4 space-y-3">
            <Sk className={`h-4 ${block.w} rounded-full`} />
            {[...Array(block.rows)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Sk className="w-10 h-10 rounded-xl flex-none" />
                <div className="flex-1 space-y-1.5">
                  <Sk className="h-3 w-full" />
                  <Sk className="h-2.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ))}
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
