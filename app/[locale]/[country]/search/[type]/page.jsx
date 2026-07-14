"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams ,useRouter } from "next/navigation";
import {
  X,
  Scale,
  SearchX,
  MapPin,
  SlidersHorizontal,
  Clapperboard,
  Map as MapIcon,
} from "lucide-react";

import MapView from "./components/MapView";
import VenueCard from "./components/VenueCard";
import FilterDrawer from "./components/FilterDrawer";
import WishlistPopup from "./components/WishlistPopup";
import FilterRow from "./components/FilterRow";
import SearchFooter from "./components/SearchFooter";
import DesktopReelPanel from "./components/DesktopReelPanel";
import { DEFAULT_FILTERS } from "./components/FilterDrawer";
import ListingsSearchBar from "./components/ListingsSearchBar";

import { useCategory } from "@/context/CategoryContext";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { usePreferredLocation } from "@/hooks/usePreferredLocation";
import { useMobileReels } from "@/context/MobileReelsContext";

import {
  LoadProperty,
  UserWishlistCategory,
  UserWishlist,
  remove_wishlist,
  removeCompareAPI,
  addCompareAPI,
  UserCompare,
  userRecentViews,
  totalLikedProperty,
  addLikedProperty,
  likedProperty,
} from "@/services/venues.service";

import { findPropertyname } from "@/services/global.service";

const MAP_TOP = 72;
const MAP_H = `calc(100vh - ${MAP_TOP}px)`;

// ── Skeleton card placeholder ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
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
  const { user } = useAuth();
  const t = useTranslations();
  const { locale, country } = useParams();
  const searchParams = useSearchParams();

  const router = useRouter();

  const { showMap, setShowMap, filterOpen, setFilterOpen, setLoginOpen } =
    useUI();
  const { activeCategory } = useCategory();
  const { openReels, registerSource, unregisterSource } = useMobileReels();

  /* ── data ──────────────────────────────────────────────────── */
  const [hoverVenue, setHoverVenue] = useState(null);
  const [mapHighlightedIds, setMapHighlightedIds] = useState([]);
  const [wishlistVenue, setWishlistVenue] = useState(null);
  const [loadData, setLoadData] = useState([]);
  const [loadProperty, setLoadProperty] = useState([]);
  const [likedTotal, setLikedTotal] = useState([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [wishlistCategory, setWishlistCategory] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [compares, setCompares] = useState([]);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [fabVisible, setFabVisible] = useState(true);
  const [isMobileWidth, setIsMobileWidth] = useState(false);
  const fabLastScroll = useRef(0);
  const hasAutoOpened = useRef(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [mapResetKey, setMapResetKey] = useState(0);
  const [viewMode, setViewMode] = useState("map"); // "map" | "reels"
  const [cardVenues, setCardVenues] = useState(null);
  const [searchLocLabel, setSearchLocLabel] = useState(
    () => searchParams.get("location") || null,
  );

  const [searchCenter, setSearchCenter] = useState(() => {
    const la = Number(searchParams.get("lat"));
    const ln = Number(searchParams.get("lng"));
    return Number.isFinite(la) && Number.isFinite(ln) && !(la === 0 && ln === 0)
      ? { lat: la, lng: ln }
      : null;
  });
  const [likedData, setLikedData] = useState([]);

  const [searchData, setSearchData] = useState({
  location: searchParams.get("location") || "",
  date: searchParams.get("date") || "",
  guests: searchParams.get("guests") || "",
});

  console.log("==============SEARCH===============");
  console.log(searchData);

  // const lastBoundsRef = useRef(null);

  // Stable callback identity across re-renders — deps are empty because it
  // only touches refs/state setters (both stable). Prevents MapView from
  // seeing a "new" onBoundsChange prop on every SearchPage render.
  // const handleBoundsChange = useCallback((bounds) => {
  //   if (!bounds) return;

  //   const normalized = {
  //     north: Number(bounds.north.toFixed(4)),
  //     south: Number(bounds.south.toFixed(4)),
  //     east: Number(bounds.east.toFixed(4)),
  //     west: Number(bounds.west.toFixed(4)),
  //   };

  //   const prev = lastBoundsRef.current;

  //   if (
  //     prev &&
  //     prev.north === normalized.north &&
  //     prev.south === normalized.south &&
  //     prev.east === normalized.east &&
  //     prev.west === normalized.west
  //   ) {
  //     return;
  //   }

  //   lastBoundsRef.current = normalized;
  //   setMapBounds(normalized);
  // }, []);

  const lastBoundsRef = useRef(null);
  const suppressBoundsUntilRef = useRef(0); // NEW

  const handleBoundsChange = useCallback((bounds) => {
    if (!bounds) return;

    // Ignore bounds events fired by MapView's own auto-fit/recenter right after
    // new venues are rendered — otherwise: mapBounds -> load -> new venues ->
    // MapView recenters -> bounds event -> mapBounds -> load -> ... forever.
    if (Date.now() < suppressBoundsUntilRef.current) return;

    const normalized = {
      north: Number(bounds.north.toFixed(4)),
      south: Number(bounds.south.toFixed(4)),
      east: Number(bounds.east.toFixed(4)),
      west: Number(bounds.west.toFixed(4)),
    };

    const prev = lastBoundsRef.current;

    if (
      prev &&
      prev.north === normalized.north &&
      prev.south === normalized.south &&
      prev.east === normalized.east &&
      prev.west === normalized.west
    ) {
      return;
    }

    lastBoundsRef.current = normalized;
    setMapBounds(normalized);
  }, []);

  /* Sync URL → searchLocLabel on mount */
  useEffect(() => {
    const loc = searchParams.get("location");
    if (loc) setSearchLocLabel(loc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* Sync URL → searchLocLabel on mount */

  useEffect(() => {
    console.log(searchLocLabel);
    console.log(typeof searchLocLabel);
  }, [searchLocLabel]);

  /* Preferred location from user preferences.
     IMPORTANT: usePreferredLocation() may return a NEW object reference on
     every render even when lat/lng/label are unchanged (common with hooks
     that derive from context or re-fetch). Re-deriving here with useMemo,
     keyed on the primitive values, guarantees MapView only receives a new
     preferredLocation reference when the actual location changed — this is
     what stops MapView's center-priority effect from re-firing (and
     re-calling panTo/setZoom, which produces spurious `idle` events) on
     every unrelated parent re-render. */
  const { location: rawPreferredLocation } = usePreferredLocation();
  const preferredLocation = useMemo(() => {
    if (!rawPreferredLocation) return null;
    const { lat, lng, label } = rawPreferredLocation;
    return { lat, lng, label };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rawPreferredLocation?.lat,
    rawPreferredLocation?.lng,
    rawPreferredLocation?.label,
  ]);

  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }));

  /* ── country ───────────────────────────────────────────────── */
  const COUNTRY_MAP = {
    in: { name: "india", center: { lat: 20.5937, lng: 78.9629 } },
    ae: { name: "dubai", center: { lat: 25.2048, lng: 55.2708 } },
    us: { name: "usa", center: { lat: 25.2048, lng: 55.2708 } },
  };
  const selected_country =
    COUNTRY_MAP[String(country || "in").toLowerCase()] || COUNTRY_MAP.in;

  const allCards = useMemo(() => [...loadProperty], [loadProperty]);

  const displayCards = cardVenues ?? allCards;

  // Reels are a fully independent feed — only venues with a REAL reel/video
  // are included. Scraped listings without one are simply excluded: not
  // rendered, not counted, and never given a fabricated placeholder video.
  const reelVenues = useMemo(
    () =>
      displayCards.filter((venue) => {
        const videoUrl = venue.videoUrl || venue.video_url || venue.coverVideo;
        return Boolean(videoUrl) && videoUrl !== "0";
      }),
    [displayCards,activeCategory],
  );

  useEffect(() => {
    if (!reelVenues.length) return;
    registerSource(() => ({
      venues: reelVenues,
      category: activeCategory,
      locale,
      country,
      wishlist,
      compares,
      onWishlist: setWishlistVenue,
      onCompare: handleCompare,
    }));
    return () => unregisterSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reelVenues, activeCategory, locale, country, wishlist, compares]);

  useEffect(() => {
    if (
      searchParams.get("openReels") !== "1" ||
      hasAutoOpened.current ||
      !reelVenues.length
    )
      return;
    hasAutoOpened.current = true;
    openReels({
      venues: reelVenues,
      category: activeCategory,
      locale,
      country,
      wishlist,
      compares,
      onWishlist: setWishlistVenue,
      onCompare: handleCompare,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reelVenues.length]);

  /* ── Pagination ───────────────────────────────────────────────── */
  const PAGE_SIZE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [displayCards.length, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(displayCards.length / PAGE_SIZE));
  const paginatedCards = displayCards.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Stable — was an inline no-op recreated every render; harmless either way,
  // but useCallback keeps every MapView prop consistent in identity discipline.
  const handleVenueClick = useCallback((_venue) => {
    /* MapView handles its own popup */
  }, []);

  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  const loadingRef = useRef(false);

  // const load = useCallback(async () => {
  //   if (loadingRef.current) return;

  //   loadingRef.current = true;

  //   try {
  //     setIsLoadingVenues(true);

  //     const payload = {
  //       type: activeCategory,
  //       category: selectedCategory,
  //       filters,
  //       mapBounds,
  //     };

  //     const [res, resProperty] = await Promise.all([
  //       findPropertyname(activeCategory),
  //       LoadProperty(payload),
  //     ]);

  //     setLoadData(res?.data?.data ?? []);
  //     setLoadProperty(resProperty?.data?.data ?? []);

  //   } finally {
  //     loadingRef.current = false;
  //     setIsLoadingVenues(false);
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [activeCategory, selectedCategory, filters, mapBounds]);

  // const load = useCallback(async () => {
  //   if (loadingRef.current) return;

  //   loadingRef.current = true;

  //   try {
  //     setIsLoadingVenues(true);

  //     const payload = {
  //       type: activeCategory,
  //       category: selectedCategory,
  //       filters,
  //       mapBounds,
  //     };

  //     const [res, resProperty] = await Promise.all([
  //       findPropertyname(activeCategory),
  //       LoadProperty(payload), // i need this refresh
  //     ]);

  //     setLoadData(res?.data?.data ?? []);
  //     setLoadProperty(resProperty?.data?.data ?? []);

  //   } finally {
  //     loadingRef.current = false;
  //     setIsLoadingVenues(false);
  //     suppressBoundsUntilRef.current = Date.now() + 700;
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [activeCategory, selectedCategory, filters, mapBounds]);

  // Shared fetcher. `silent: true` skips the loading flag entirely, so the
  // grid never unmounts into skeleton cards — used for background
  // refreshes (like a single like/unlike) where nothing should visibly
  // "reload". `silent: false` (default) is the real filter/category/map
  // refresh, which still shows the skeleton because that's a real new
  // dataset moment.
  const refreshProperties = useCallback(
    async ({ silent = false } = {}) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        if (!silent) setIsLoadingVenues(true);

        const payload = {
  type: activeCategory,
  category: selectedCategory,
  filters,
  mapBounds,

  location: searchData.location,
  date: searchData.date,
  guests: searchData.guests,
};
        const [res, resProperty] = await Promise.all([
          findPropertyname(activeCategory),
          LoadProperty(payload),
        ]);

        setLoadData(res?.data?.data ?? []);
        setLoadProperty(resProperty?.data?.data ?? []);
      } finally {
        loadingRef.current = false;
        if (!silent) setIsLoadingVenues(false);
        suppressBoundsUntilRef.current = Date.now() + 700;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [activeCategory, selectedCategory, filters, mapBounds,searchData],
  );

  // `load` stays the name your existing filter/map/category effect already
  // calls — no changes needed anywhere else that references `load`.
  const load = useCallback(
    () => refreshProperties({ silent: false }),
    [refreshProperties],
  );

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

 useEffect(() => {
  if (!activeCategory) return;

  const timer = setTimeout(load, 500);

  return () => clearTimeout(timer);
}, [
  activeCategory,
  selectedCategory,
  filterKey,
  mapBounds,
  searchData.location,
  searchData.date,
  searchData.guests,
]);

  /* ── load user data ────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;

    loadUser();
  }, [user, mapBounds]);

  const loadUser = async () => {
    try {
      const [wCat, wList, cList, likedP] = await Promise.all([
        UserWishlistCategory(),
        UserWishlist(),
        UserCompare(),
        likedProperty(),
      ]);
      setWishlistCategory(wCat?.data ?? []);
      setWishlist(wList?.data ?? []);
      setCompares(cList?.data ?? []);

      // const likeds = likedP?.data ?? [];
      const likedIds = new Set(
        (likedP?.data ?? []).map((item) => item.property_id),
      );

      setLikedData(likedIds);
    } catch (err) {
      console.error(err);
    }
  };

  /* Map cluster/marker hover → highlight matching cards.
     useCallback keeps these as stable props for MapView. */
  const handleMapClusterHover = useCallback(
    (ids) => setMapHighlightedIds(ids || []),
    [],
  );
  const handleMapMarkerHover = useCallback(
    (id) => setMapHighlightedIds(id ? [id] : []),
    [],
  );

  /* ── FAB scroll tracking ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setFabVisible(y <= fabLastScroll.current || y <= 80);
      fabLastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const check = () => setIsMobileWidth(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleCompare = useCallback(
    async (venue, action) => {
      if (!user) {
        setLoginOpen(true);
        return;
      }
      const payload = { venue_id: venue.childVenueId };
      action ? await addCompareAPI(payload) : await removeCompareAPI(payload);
      loadUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [user, load],
  );

  /* ── LIKED PROPERTY  ───────────────────────────────────────────────── */

  const onLikedProperty = useCallback(
    async (venue) => {
      if (!user) {
        setLoginOpen(true);
        return;
      }
      const payload = {
        property_id: venue.childVenueId,
        property_type: activeCategory,
      };
      await addLikedProperty(payload);
      // A like/unlike must never re-fetch the listing — no network call to
      // `LoadProperty`/`findPropertyname`, no skeleton, no card refresh.
      // The card's own optimistic heart/count already reflects the change
      // instantly; `loadUser()` only syncs the lightweight user-scoped
      // liked/wishlist/compare sets (not the listing) in the background.
      loadUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [user],
  );

  const userRecentView = useCallback(
    async (venue) => {
      if (!user) return;
      await userRecentViews({ venue_id: venue.childVenueId });
    },
    [user],
  );

  const removeWishlistAPI = useCallback(async (venue) => {
    try {
      await remove_wishlist({ venue_id: venue.childVenueId });
      setWishlist((p) => p.filter((i) => i.venue_id !== venue.childVenueId));
      loadUser();
    } catch (err) {
      console.error(err);
    }
  }, []);

  /* ── shared card props ─────────────────────────────────────── */
  const cardProps = {
    wishlist,
    compares,
    onHover: setHoverVenue,
    onLeave: () => setHoverVenue(null),
    onWishlist: setWishlistVenue,
    onCompare: handleCompare,
    onRecentViews: userRecentView,
    locale,
    country,
    onRemoveWishlist: removeWishlistAPI,
    onLikedProperty: onLikedProperty,
  };

useEffect(() => {
  const rawNorth = searchParams.get("north");
  const rawSouth = searchParams.get("south");
  const rawEast  = searchParams.get("east");
  const rawWest  = searchParams.get("west");

  if (!rawNorth || !rawSouth || !rawEast || !rawWest) return;

  const north = Number(rawNorth);
  const south = Number(rawSouth);
  const east  = Number(rawEast);
  const west  = Number(rawWest);

  if ([north, south, east, west].some(Number.isNaN)) return;

  setMapBounds({ north, south, east, west });
}, [searchParams]);



useEffect(() => {
  const params = new URLSearchParams();

  if (searchData.location)
    params.set("location", searchData.location);

  if (searchData.date)
    params.set("date", searchData.date);

  if (searchData.guests)
    params.set("guests", searchData.guests);

  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}, [searchData]);

const compare = () =>{
 
   router.push(`/${locale}/${country}/compare`);
  // ${locale}/${country}
}
  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="pt-16 md:pt-[72px] flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <div className="flex flex-col lg:flex-row flex-1">
        {/* ── LEFT: Listings column ── */}
        <div className="flex-1 lg:w-[60%] flex flex-col min-w-0">
          <div className="sticky z-40 bg-white dark:bg-gray-950 top-16 md:top-[72px]">
            {/* <ListingsSearchBar
              countryCode={String(country || "in").toLowerCase()}
              isSearching={isLoadingVenues} // NEW
              defaultValues={{
                location: searchParams.get("location") || "",
                date: searchParams.get("date") || "",
                guests: searchParams.get("guests") || "",
              }}
              onSearch={(data) => {
                if (data?.location) {
                  setSearchLocLabel(
                    typeof data.location === "string"
                      ? data.location
                      : data.location.address || data.location.city || "",
                  );
                }
              }}
            /> */}
           <ListingsSearchBar
  countryCode={String(country || "in").toLowerCase()}
  isSearching={isLoadingVenues}
  isLoading={isLoadingVenues && loadData.length === 0}
  defaultValues={searchData}
  onSearch={(data) => {
    const location =
      typeof data.location === "string"
        ? data.location
        : data.location?.address ||
          data.location?.city ||
          "";

    // Update search state
    setSearchData({
      location,
      date: data.date,
      guests: data.guests,
    });

    setSearchLocLabel(location);

    // In-page search: drop the URL-derived coordinates so the map recenters
    // by geocoding the newly-typed label (via the mapResetKey path below).
    setSearchCenter(null);

    // New search -> don't keep previous map bounds
    lastBoundsRef.current = null;
    setMapBounds(null);
    setMapResetKey((k) => k + 1);
  }}
/>
          </div>

          <div className="sticky z-30 bg-white dark:bg-gray-950 top-[142px] md:top-[148px]">
            <FilterRow
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              loadData={loadData}
              onFilterOpen={() => setFilterOpen(true)}
              isLoading={isLoadingVenues && loadData.length === 0}
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0 px-4 pt-3 pb-4 lg:pb-4">
            {isLoadingVenues ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : paginatedCards.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center select-none">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <MapPin
                      size={32}
                      className="text-gray-300 dark:text-gray-600"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-white dark:border-gray-950">
                    <SearchX
                      size={14}
                      className="text-gray-400 dark:text-gray-500"
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <h3 className="text-[15px] font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  No results in this area
                </h3>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-[220px] leading-relaxed mb-6">
                  Try moving the map, zooming out, or adjusting your filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setMapBounds(null);
                      setMapResetKey((k) => k + 1);
                    }}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-gray-300 dark:border-gray-600 text-[12px] font-medium text-gray-700 dark:text-gray-300 hover:border-gray-700 dark:hover:border-gray-200 transition-colors"
                  >
                    <MapPin size={13} strokeWidth={2} />
                    Reset map area
                  </button>
                  <button
                    onClick={() => setFilterOpen(true)}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-gray-300 dark:border-gray-600 text-[12px] font-medium text-gray-700 dark:text-gray-300 hover:border-gray-700 dark:hover:border-gray-200 transition-colors"
                  >
                    <SlidersHorizontal size={13} strokeWidth={2} />
                    Adjust filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedCards.map((venue) => {
                  const vid = venue.childVenueId || venue.id;
                  return (
                    <VenueCard
                      key={vid}
                      venue={venue}
                      likedData={likedData}
                      likedTotal={likedTotal}
                        user={user}
                      {...cardProps}
                      isMapHighlighted={mapHighlightedIds.includes(vid)}
                    />
                  );
                })}
              </div>
            )}

            {!isLoadingVenues && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-8 pb-24 lg:pb-8">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-600 dark:hover:border-violet-400 dark:hover:text-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M10 12L6 8l4-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {(() => {
                  const pages = [];
                  const delta = 1;
                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      i === 1 ||
                      i === totalPages ||
                      (i >= currentPage - delta && i <= currentPage + delta)
                    ) {
                      pages.push(i);
                    } else if (pages[pages.length - 1] !== "…") {
                      pages.push("…");
                    }
                  }
                  return pages.map((p, idx) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm select-none"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => {
                          setCurrentPage(p);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                          p === currentPage
                            ? "bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900"
                            : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-500 hover:text-violet-600 dark:hover:border-violet-400 dark:hover:text-violet-400"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  );
                })()}

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-600 dark:hover:border-violet-400 dark:hover:text-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 12l4-4-4-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}

            {!isLoadingVenues && (
              <div className="mt-auto">
                <SearchFooter />
              </div>
            )}
          </div>

          <WishlistPopup
            wishvenue={wishlistCategory}
            wishlist={wishlist}
            venue={wishlistVenue}
            open={!!wishlistVenue}
            user={user}
            onClose={() => {
              setWishlistVenue(null);
              loadUser();
            }}
          />
        </div>

        {/* ── RIGHT: Map / Reels panel ── */}
        <div className="hidden lg:block w-[40%] flex-shrink-0 border-l border-gray-200 dark:border-gray-800">
          <div
            className="sticky z-[29] bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center px-3"
            style={{ top: MAP_TOP, height: 56 }}
          >
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              {[
                { key: "map", Icon: MapIcon, label: "Map" },
                { key: "reels", Icon: Clapperboard, label: "Reels" },
              ].map(({ key, Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={[
                    "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md text-[12px] font-semibold transition-all",
                    viewMode === key
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                  ].join(" ")}
                >
                  <Icon size={13} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="sticky relative"
            style={{
              top: MAP_TOP + 56,
              height: `calc(100vh - ${MAP_TOP + 56}px)`,
            }}
          >
            <div
              className={
                viewMode === "map"
                  ? "absolute inset-0 overflow-hidden"
                  : "absolute inset-0 overflow-hidden invisible pointer-events-none"
              }
            >
              {viewMode === "map" && (
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-gray-800 dark:text-gray-100 shadow-md"
                    style={{
                      background: "rgba(255,255,255,0.92)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span className="font-bold">{displayCards.length}</span>
                    {t("venues_in_this_area")}
                  </span>
                </div>
              )}
              <MapView
                venues={allCards}
                hoverVenue={hoverVenue}
                country={selected_country.name}
                category={activeCategory}
                isLoading={isLoadingVenues}
                onBoundsChange={handleBoundsChange}
                resetKey={mapResetKey}
                preferredLocation={preferredLocation}
                searchLocationLabel={searchLocLabel}
                searchCenter={searchCenter}
                onVenueClick={handleVenueClick}
                onVisibleVenuesChange={setCardVenues}
                onMapClusterHover={handleMapClusterHover}
                onMapMarkerHover={handleMapMarkerHover}
              />
            </div>

            {viewMode === "reels" && (
              <div className="absolute inset-0 overflow-hidden">
                <DesktopReelPanel
                  venues={reelVenues}
                  category={activeCategory}
                  locale={locale}
                  country={country}
                  wishlist={wishlist}
                  compares={compares}
                  onWishlist={setWishlistVenue}
                  onCompare={handleCompare}
                  onLiked={onLikedProperty}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Floating Compare FAB ── */}
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
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={
              (isMobileWidth ? fabVisible : true)
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.95, y: 14 }
            }
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed z-[35]"
            style={{
              bottom: "calc(68px + env(safe-area-inset-bottom, 0px) + 12px)",
              left: 25,
              pointerEvents: isMobileWidth && !fabVisible ? "none" : "auto",
            }}
          >
            <div className="relative">
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
                  transition:
                    "background 0.22s ease, border 0.22s ease, transform 0.15s ease",
                  color: showComparePanel ? "#fff" : "#4c1d95",
                  minWidth: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Scale size={19} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Compare
                </span>
                <span
                  className="vb-badge-anim"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 22,
                    height: 22,
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

              {showComparePanel && (
                <>
                  <div
                    className="fixed inset-0 z-[44]"
                    onClick={() => setShowComparePanel(false)}
                  />
                  <div
                    className="absolute bottom-full left-0 mb-3 w-72 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl z-[46] overflow-hidden"
                    style={{
                      boxShadow:
                        "0 16px 48px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Compare ({compares.length})
                      </h3>
                      <button
                        onClick={() => setShowComparePanel(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {compares.map((item, i) => (
                        <div
                          key={i}
                          className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-none"
                        >
                          <img
                            src={`${BASE_URL}/${item.image}`}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            alt=""
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1">
                              {item.title}
                            </p>
                            <button
                              onClick={() => handleCompare(item, false)}
                              className="text-xs text-red-500 hover:underline mt-0.5"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                      <button
                        className="w-full text-white text-sm font-semibold py-2.5 rounded-xl transition hover:opacity-90 active:scale-[0.98]"
                        style={{
                          background:
                            "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)",
                          boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
                        }}
                        onClick={compare}
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

      {/* ── Mobile: fullscreen map overlay ── */}
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
              category={activeCategory}
              isLoading={isLoadingVenues}
              onBoundsChange={handleBoundsChange}
              resetKey={mapResetKey}
              preferredLocation={preferredLocation}
              searchLocationLabel={searchLocLabel}
              searchCenter={searchCenter}
              onVenueClick={handleVenueClick}
              onVisibleVenuesChange={setCardVenues}
              onMapClusterHover={handleMapClusterHover}
              onMapMarkerHover={handleMapMarkerHover}
            />
            <div className="absolute top-5 left-4 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-900 rounded-full px-3 py-1.5 shadow-md text-sm font-semibold text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-800">
                <span className="font-bold">{displayCards.length}</span>
                {t("venues_in_this_area")}
              </span>
            </div>
            <button
              onClick={() => setShowMap(false)}
              className="absolute top-5 right-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-white flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-sm font-medium"
            >
              <X size={14} /> Close map
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
