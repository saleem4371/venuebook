"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { X, Scale } from "lucide-react";

import MapView           from "./components/MapView";
import VenueCard         from "./components/VenueCard";
import FilterDrawer      from "./components/FilterDrawer";
import WishlistPopup     from "./components/WishlistPopup";
import FilterRow         from "./components/FilterRow";
import ListingsSearchBar from "./components/ListingsSearchBar";

import { useCategory }          from "@/context/CategoryContext";
import { useUI }                from "@/context/UIContext";
import { useAuth }              from "@/context/AuthContext";
import { usePreferredLocation } from "@/hooks/usePreferredLocation";
import { getStaticVenues }      from "./data/staticVenues";

import {
  LoadProperty,
  UserWishlistCategory,
  UserWishlist,
  remove_wishlist,
  removeCompareAPI,
  addCompareAPI,
  UserCompare,
  userRecentViews,
} from "@/services/venues.service";
import { findPropertyname } from "@/services/global.service";

/*
 * NEW ORDER: SearchBar → FilterRow → Cards (toolbar removed)
 *
 * MOBILE  (< md)   nav=64px
 *   SearchBar  top : 64
 *   SearchBar  h   : mt-3 mb-0 (12) + trigger py-3.5+content (66) = 78px
 *   FilterRow  top : 64 + 78 = 142
 *   FilterRow  h   : pt-3(12)+icon(72)+mb-2(8)+label(16)+pb-3.5(14)+border(1) = 123px
 *
 * DESKTOP (≥ md)   nav=72px
 *   SearchBar  top : 72
 *   SearchBar  h   : mt-3 mb-2 (20) + bar border+pad+content (72) = 92px
 *   FilterRow  top : 72 + 92 = 164
 *   FilterRow  h   : same = 123px
 *
 * Z-index (higher = paints on top when overlapping):
 *   Navbar       z-50   fixed  top:0
 *   SearchBar    z-40   sticky (first layer, on top)
 *   FilterRow    z-30   sticky (second layer, below search)
 *   Map          —      sticky top:72 desktop
 *   Cards        z-[1]  low stacking context
 *   Compare FAB  z-[45] floating above everything below header
 */
const MAP_TOP = 72;
const MAP_H   = `calc(100vh - ${MAP_TOP}px)`;


// ── Skeleton card placeholder ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm animate-pulse">
      {/* Image */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      {/* Body */}
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
 
  const mapRef = useRef(null);
  const { user }            = useAuth();
  const t                   = useTranslations();
  const { locale, country } = useParams();
  const searchParams        = useSearchParams();

  const { showMap, setShowMap, filterOpen, setFilterOpen, setLoginOpen } = useUI();
  const { activeCategory } = useCategory();

  /* ── data ──────────────────────────────────────────────────── */
  const [hoverVenue,       setHoverVenue]       = useState(null);
  const [wishlistVenue,    setWishlistVenue]     = useState(null);
  const [loadData,         setLoadData]          = useState([]);
  const [loadProperty,     setLoadProperty]      = useState([]);
  const [isLoadingVenues,  setIsLoadingVenues]   = useState(true);
  const [wishlistCategory, setWishlistCategory]  = useState([]);
  const [wishlist,         setWishlist]          = useState([]);
  const [compares,         setCompares]          = useState([]);
  const [showComparePanel, setShowComparePanel]  = useState(false);
  const [fabVisible,       setFabVisible]        = useState(true);
  const [isMobileWidth,    setIsMobileWidth]     = useState(false);
  const fabLastScroll = useRef(0);
  const [selectedCategory, setSelectedCategory]  = useState(null);
  const [mapBounds,        setMapBounds]         = useState(null);
  /* Venues reported as visible by MapView — drives the card grid */
  const [cardVenues,       setCardVenues]        = useState(null);
  /* Init from URL params (passed by home page search) */
  const [searchLocLabel,   setSearchLocLabel]    = useState(() => searchParams.get("location") || null);

  /* Sync URL → searchLocLabel on mount (handles Next.js hydration timing) */
  useEffect(() => {
    const loc = searchParams.get("location");
    if (loc) setSearchLocLabel(loc);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Preferred location from user preferences */
  const { location: preferredLocation } = usePreferredLocation();

  const [filters, setFilters] = useState({
    category_cards: [],
    shift:   [],
    booking: [],
    budget:  { min: 200, max: 100000 },
  });

  /* ── country ───────────────────────────────────────────────── */
  const COUNTRY_MAP = {
    in: { name: "india", center: { lat: 20.5937, lng: 78.9629 } },
    ae: { name: "dubai", center: { lat: 25.2048, lng: 55.2708 } },
    us: { name: "usa",   center: { lat: 25.2048, lng: 55.2708 } },
  };
  const selected_country =
    COUNTRY_MAP[String(country || "in").toLowerCase()] || COUNTRY_MAP.in;

  /* ── Static venues — filtered by country + activeCategory + bounds ──
     Memoized so the array reference only changes when deps genuinely change,
     preventing MapView's useEffect([venues]) from re-firing on every render. */
  const staticVenues = useMemo(
    () => getStaticVenues(selected_country.name, activeCategory || null, mapBounds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected_country.name, activeCategory, mapBounds],
  );

  /* All venues sent to the map — static + API, unfiltered.
     Stable reference prevents the onVisibleVenuesChange → re-render → new venues → loop. */
  const allCards = useMemo(
    () => [...staticVenues, ...loadProperty],
    [staticVenues, loadProperty],
  );

  /*
   * cardVenues = what the map is currently showing as markers.
   * Set by MapView's onVisibleVenuesChange callback: only venues with valid
   * coords that fall inside the current viewport.
   * Before the first map idle fires, fall back to allCards so something renders.
   */
  const displayCards = cardVenues ?? allCards;

  /* ── Pagination ───────────────────────────────────────────────── */
  const PAGE_SIZE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the visible set changes (map pan, category switch, etc.)
  useEffect(() => { setCurrentPage(1); }, [displayCards.length, activeCategory]);

  const totalPages    = Math.max(1, Math.ceil(displayCards.length / PAGE_SIZE));
  const paginatedCards = displayCards.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /* Map marker click — map handles its own popup via onVenueClick */
  const handleVenueClick = (_venue) => { /* intentionally no-op at page level; MapView handles popup */ };

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  /* ── load public data ──────────────────────────────────────── */
  const load = async () => {
    try {
      if (!activeCategory) return;
      setIsLoadingVenues(true);
      const payload = { type: activeCategory, category: selectedCategory, filters, mapBounds };
      const [res, resProperty] = await Promise.all([
        findPropertyname(activeCategory),
        LoadProperty(payload),
      ]);
      setLoadData(res?.data?.data ?? []);
      setLoadProperty(resProperty?.data?.data ?? []);
    } catch (err) { console.error(err); } finally {
      setIsLoadingVenues(false);
    }
  };

  useEffect(() => { load(); }, [activeCategory, selectedCategory, filters, mapBounds]);

  /* ── load user data ────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    const loadUser = async () => {
      try {
        const [wCat, wList, cList] = await Promise.all([
          UserWishlistCategory(), UserWishlist(), UserCompare(),
        ]);
        setWishlistCategory(wCat?.data ?? []);
        setWishlist(wList?.data ?? []);
        setCompares(cList?.data ?? []);
      } catch (err) { console.error(err); }
    };
    loadUser();
  }, [user]);

  /* Card hover highlights the marker via hoverVenue prop — no map pan (avoids onIdle lag) */

  /* ── FAB scroll tracking: hide on scroll-down, show on scroll-up (mobile only) ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setFabVisible(y <= fabLastScroll.current || y <= 80);
      fabLastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Track mobile breakpoint — scroll-hide only on < 768px ── */
  useEffect(() => {
    const check = () => setIsMobileWidth(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── body scroll lock when filter open ────────────────────── */
  useEffect(() => {
    const w = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow     = filterOpen ? "hidden" : "auto";
    document.body.style.paddingRight = filterOpen ? `${w}px`  : "0px";
    return () => {
      document.body.style.overflow     = "auto";
      document.body.style.paddingRight = "0px";
    };
  }, [filterOpen]);

  /* ── compare ───────────────────────────────────────────────── */
  const handleCompare = async (venue, action) => {
    if (!user) { setLoginOpen(true); return; }
    const payload = { venue_id: venue.childVenueId };
    action ? await addCompareAPI(payload) : await removeCompareAPI(payload);
    load();
  };

  const userRecentView = async (venue) => {
    if (!user) return;
    await userRecentViews({ venue_id: venue.childVenueId });
  };

  const removeWishlistAPI = async (venue) => {
    try {
      await remove_wishlist({ venue_id: venue.childVenueId });
      setWishlist((p) => p.filter((i) => i.venue_id !== venue.childVenueId));
    } catch (err) { console.error(err); }
  };

  /* ── shared card props ─────────────────────────────────────── */
  const cardProps = {
    wishlist, compares,
    onHover:          setHoverVenue,
    onLeave:          () => setHoverVenue(null),
    onWishlist:       setWishlistVenue,
    onCompare:        handleCompare,
    onRecentViews:    userRecentView,
    locale, country,
    onRemoveWishlist: removeWishlistAPI,
  };

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="pt-16 md:pt-[72px] flex flex-col min-h-screen bg-white dark:bg-gray-950">

      <div className="flex flex-col lg:flex-row flex-1">

        {/* ── LEFT: Listings column ──────────────────────────────────
            Order: SearchBar → FilterRow → Cards
            ─────────────────────────────────────────────────────── */}
        <div className="flex-1 lg:w-[60%] flex flex-col min-w-0">

          {/* STICKY 1 — Search bar (topmost, z-40)
              mobile top=64  desktop top=72 */}
          <div className="sticky z-40 bg-white dark:bg-gray-950 top-16 md:top-[72px]">
            <ListingsSearchBar
              countryCode={String(country || "in").toLowerCase()}
              defaultValues={{
                location: searchParams.get("location") || "",
                date:     searchParams.get("date")     || "",
                guests:   searchParams.get("guests")   || "",
              }}
              onSearch={(data) => {
                if (data?.location) setSearchLocLabel(data.location);
              }}
            />
          </div>

          {/* STICKY 2 — Property type + Filters strip (z-30)
              mobile top=142  desktop top=148  (search bar is now ~60px shorter) */}
          <div className="sticky z-30 bg-white dark:bg-gray-950 top-[142px] md:top-[148px]">
            <FilterRow
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              loadData={loadData}
              onFilterOpen={() => setFilterOpen(true)}
            />
          </div>

          {/* Cards grid */}
          <div className="flex-1 px-4 pt-3 pb-4 lg:pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoadingVenues
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : paginatedCards.map((venue) => (
                    <VenueCard key={venue.childVenueId || venue.id} venue={venue} {...cardProps} />
                  ))
              }
            </div>

            {/* ── Pagination ── */}
            {!isLoadingVenues && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-8 pb-24 lg:pb-8">
                {/* Prev */}
                <button
                  onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-600 dark:hover:border-violet-400 dark:hover:text-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                {/* Page numbers */}
                {(() => {
                  const pages = [];
                  const delta = 1; // pages to show either side of current
                  for (let i = 1; i <= totalPages; i++) {
                    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                      pages.push(i);
                    } else if (pages[pages.length - 1] !== "…") {
                      pages.push("…");
                    }
                  }
                  return pages.map((p, idx) =>
                    p === "…" ? (
                      <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm select-none">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                          p === currentPage
                            ? "bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900"
                            : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-500 hover:text-violet-600 dark:hover:border-violet-400 dark:hover:text-violet-400"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}

                {/* Next */}
                <button
                  onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-600 dark:hover:border-violet-400 dark:hover:text-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            )}
          </div>

          <WishlistPopup
            wishvenue={wishlistCategory}
            venue={wishlistVenue}
            open={!!wishlistVenue}
            user={user}
            onClose={() => setWishlistVenue(null)}
          />
        </div>

        {/* ── RIGHT: Map column (40%) — desktop only ────────────── */}
        <div className="hidden lg:block w-[40%] flex-shrink-0">
          <div
            className="sticky overflow-hidden relative"
            style={{ top: MAP_TOP, height: MAP_H }}
          >
            <MapView
              venues={allCards}
              hoverVenue={hoverVenue}
              country={selected_country.name}
              isLoading={isLoadingVenues}
              onBoundsChange={setMapBounds}
              preferredLocation={preferredLocation}
              searchLocationLabel={searchLocLabel}
              onVenueClick={handleVenueClick}
              onVisibleVenuesChange={setCardVenues}
            />

            {/* ── Listing count overlay — top-left of map ── */}
            <div className="absolute top-5 left-5 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-900 rounded-full px-3 py-1.5 shadow-md text-sm font-semibold text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-800">
                <span className="font-bold">{displayCards.length}</span>
                {t("venues_in_this_area")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile listing count (below filter strip, above cards) ── */}
      <div className="lg:hidden px-4 pt-2 pb-1">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          <span className="font-bold text-gray-900 dark:text-white">{displayCards.length}</span>{" "}
          {t("venues_in_this_area")}
        </p>
      </div>

      {/* ── Floating Compare FAB — bottom-left, glassmorphism ─────── */}
      <style>{`
        @keyframes vb-fab-glow {
          0%, 100% { box-shadow: 0 8px 28px rgba(124,58,237,0.22), 0 2px 8px rgba(0,0,0,0.10); }
          50%       { box-shadow: 0 8px 32px rgba(124,58,237,0.42), 0 2px 8px rgba(0,0,0,0.10); }
        }
        @keyframes vb-badge-pop {
          0%, 100% { transform: scale(1); }
          40%       { transform: scale(1.25); }
          60%       { transform: scale(0.95); }
        }
        .vb-fab-pulse { animation: vb-fab-glow 2.8s ease-in-out infinite; }
        .vb-badge-anim { animation: vb-badge-pop 2.8s ease-in-out infinite; }
      `}</style>

      <AnimatePresence>
        {compares.length > 0 && (
          <motion.div
            key="compare-fab"
            /* Entry: slides up + fades in */
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            /* Scroll-aware on mobile only — tablet/desktop always visible */
            animate={
              (isMobileWidth ? fabVisible : true)
                ? { opacity: 1,  scale: 1,    y: 0  }
                : { opacity: 0,  scale: 0.95, y: 14 }
            }
            /* Exit when compare list clears */
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed z-[35]"
            style={{
              bottom: "calc(68px + env(safe-area-inset-bottom, 0px) + 12px)",
              left: 25,
              /* Prevent click-through when hidden on scroll */
              pointerEvents: (isMobileWidth && !fabVisible) ? "none" : "auto",
            }}
          >
            <div className="relative">
              {/* FAB pill */}
              <button
                onClick={() => setShowComparePanel((p) => !p)}
                className={!showComparePanel ? "vb-fab-pulse" : ""}
                style={{
                  background: showComparePanel
                    ? "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)"
                    : "rgba(255,255,255,0.90)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: showComparePanel
                    ? "1.5px solid rgba(124,58,237,0.55)"
                    : "1.5px solid rgba(124,58,237,0.25)",
                  borderRadius: 999,
                  padding: "11px 20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  cursor: "pointer",
                  transition: "background 0.22s ease, border 0.22s ease, transform 0.15s ease",
                  color: showComparePanel ? "#fff" : "#4c1d95",
                  minWidth: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Scale size={19} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
                  Compare
                </span>
                {/* Animated badge */}
                <span
                  className="vb-badge-anim"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 22, height: 22,
                    padding: "0 5px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    background: showComparePanel
                      ? "rgba(255,255,255,0.28)"
                      : "linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)",
                    color: "#fff",
                    flexShrink: 0,
                    boxShadow: showComparePanel
                      ? "none"
                      : "0 2px 6px rgba(124,58,237,0.45)",
                  }}
                >
                  {compares.length}
                </span>
              </button>

              {/* Dropdown — opens upward */}
              {showComparePanel && (
                <>
                  <div className="fixed inset-0 z-[44]" onClick={() => setShowComparePanel(false)} />
                  <div className="absolute bottom-full left-0 mb-3 w-72 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl z-[46] overflow-hidden"
                    style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)" }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Compare ({compares.length})</h3>
                      <button onClick={() => setShowComparePanel(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none">✕</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {compares.map((item, i) => (
                        <div key={i} className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-none">
                          <img src={`${BASE_URL}/${item.image}`} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1">{item.title}</p>
                            <button onClick={() => handleCompare(item, false)} className="text-xs text-red-500 hover:underline mt-0.5">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                      <button
                        className="w-full text-white text-sm font-semibold py-2.5 rounded-xl transition hover:opacity-90 active:scale-[0.98]"
                        style={{ background: "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}
                      >
                        Compare Now
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: fullscreen map overlay ─────────────────────── */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="fixed inset-0 z-50 bg-white dark:bg-gray-950 lg:hidden"
          >
            <MapView
              venues={allCards}
              hoverVenue={hoverVenue}
              country={selected_country.name}
              isLoading={isLoadingVenues}
              onBoundsChange={setMapBounds}
              preferredLocation={preferredLocation}
              searchLocationLabel={searchLocLabel}
              onVenueClick={handleVenueClick}
              onVisibleVenuesChange={setCardVenues}
            />
            <button
              onClick={() => setShowMap(false)}
              className="absolute top-5 right-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-white flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-sm font-medium"
            >
              <X size={14} /> Close map
            </button>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── Filter drawer ────────────────────────────────────────── */}
      <FilterDrawer
        open={filterOpen}
        setOpen={setFilterOpen}
        venueCount={loadProperty.length}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}
