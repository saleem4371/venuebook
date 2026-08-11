"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon, BellIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import MobileSearchSheet   from "./MobileSearchSheet";
import LocationAutoComplete from "./LocationAutoComplete";
import GuestPicker          from "./GuestPicker";
import DatePicker           from "./DatePicker";
import SearchSelectField    from "./SearchSelectField";

import { CATEGORIES, CATEGORY_ORDER, CATEGORY_TINTS } from "@/config/categoryConfig";
import { useCategory } from "@/context/CategoryContext";

import { country_of_category } from "@/services/global.service";
/* Field schema now lives in one shared config — see searchFieldsConfig.js.
   Previously copy-pasted here, in ListingsSearchBar.jsx and in
   MobileSearchSheet.jsx, and had drifted out of sync between them. */
import { SEARCH_CONFIG, getFieldSummary, TOGGLE_BAR_CATEGORIES } from "./searchFieldsConfig";

/* ─── Labels ────────────────────────────────────────────────── */
const WORD_LABEL = {
  venues:      "Venue",
  farmstays:   "Farmstay",
  studios:     "Studio",
  rentals:     "Rental",
  workspaces:  "Workspace",
  experiences: "Experience",
};
// const TAB_LABEL = {
//   venues:      "Venues",
//   farmstays:   "Farmstays",
//   studios:     "Studios",
//   rentals:     "Rentals",
//   workspaces:  "Workspaces",
//   experiences: "Experiences",
// };

/* ─── Search field matrix ───────────────────────────────────── */
/*
 * types:
 *   location   → LocationAutoComplete (category-aware)
 *   date       → DatePicker (single)
 *   daterange  → DatePicker (range) — occupies 2 columns visually
 *   datetime   → DatePicker (with time)
 *   guests     → GuestPicker (guestType controls which variant)
 */
const CATEGORY_KEY_MAP = {
  venues: "venues",
  venue: "venues",

  farmstays: "farmstays",
  farmstay: "farmstays",

  studios: "studios",
  studio: "studios",

  rentals: "rentals",
  rental: "rentals",

  workspaces: "workspaces",
  workspace: "workspaces",

  experiences: "experiences",
  experience: "experiences",
};
const WORDS = CATEGORY_ORDER.map((id) => WORD_LABEL[id]);

/* ─── Component ─────────────────────────────────────────────── */
export default function HeroSection({itemDest}) {
   const router = useRouter();
const t  = useTranslations("searchBar");
const tf = useTranslations("filter");
const params = useParams();

const locale = params?.locale || "en";
const country = params?.country || "in";

  const { activeCategory, setActiveCategory } = useCategory();

  const [isMobile,    setIsMobile]    = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [openSearch,  setOpenSearch]  = useState(false);
  // Mirrors MobileSearchSheet's current selection so the collapsed "Where
  // to?" trigger button below reflects it too, not just the sheet's own
  // sticky summary bar.
  const [mobileSummary, setMobileSummary] = useState({ location: "", dateSummary: "", guestSummary: "" });
  const [wordIdx,     setWordIdx]     = useState(0);
  const [loadData,    setLoadData]    = useState([]);
  const [dates,       setDates]       = useState({});
  const [mediaMap,    setMediaMap]    = useState({});
  // True until the actual background video/image has visually loaded.
  // Previously there was nothing behind it while country_of_category()
  // was in flight (or while the video file itself was still buffering) —
  // just the dark overlay sitting on a blank frame, which read as the
  // section having silently failed rather than still loading.
  const [mediaReady,  setMediaReady]  = useState(false);

   const [searchData, setSearchData] = useState({
  location: "",
  date: "",
  checkin: "",
  checkout: "",
  guests: "",
  occasion: "",
  vibe: "",
});

  /* ── Desktop collapse/expand toggle — same behavior as
     ListingsSearchBar.jsx's bar (see that file for the full rationale).
     Only the active field is expanded; the rest collapse to an icon +
     short label + value-summary pill. Declared here (not next to `fields`
     below) because it's a hook and hooks can't sit after the `if
     (!mounted) return null` guard further down. */
  const [activeFieldId, setActiveFieldId] = useState(() => SEARCH_CONFIG[activeCategory]?.[0]?.id ?? null);
  useEffect(() => {
    const catFields = SEARCH_CONFIG[activeCategory] ?? [];
    if (!catFields.some((f) => f.id === activeFieldId)) {
      setActiveFieldId(catFields[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);


  /* Category tab scroll state */
  const tabsRef                       = useRef(null);
  const [canTabLeft,  setCanTabLeft]  = useState(false);
  const [canTabRight, setCanTabRight] = useState(false);


    const TAB_LABEL = loadData.reduce((acc, item) => {
    const key = CATEGORY_KEY_MAP[item.name?.toLowerCase()?.trim()];
    if (!key) return acc;
    acc[key] =
  (item.name?.charAt(0)?.toUpperCase() || "") +
  (item.name?.slice(1) || "") +
  (item.name?.endsWith("s") ? "" : "s");
    return acc;
  }, {});

  const enabledCategories = Object.keys(TAB_LABEL);

  const WORDS =
    enabledCategories.length > 0
      ? enabledCategories
          .filter((id) => WORD_LABEL[id])
          .map((id) => WORD_LABEL[id])
      : [];


       useEffect(() => {
    if (!enabledCategories.length) return;
    if (!enabledCategories.includes(activeCategory)) {
      setActiveCategory(enabledCategories[0]);
      setDates({});
    }
  }, [enabledCategories, activeCategory]);

//Load 

  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    try {
      const res = await country_of_category();
      setLoadData(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };




  const updateTabScroll = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanTabLeft(scrollLeft > 4);
    setCanTabRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  const scrollTabs = (dir) => {
    const el = tabsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 160, behavior: "smooth" });
  };

  /* Hydration */
  useEffect(() => setMounted(true), []);

  /* Word rotation */
 useEffect(() => {
  if (!WORDS.length) return;

  const t = setInterval(() => {
    setWordIdx((p) => (p + 1) % WORDS.length);
  }, 2800);

  return () => clearInterval(t);
}, [WORDS.length]);

  /* Mobile detection */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Tab scroll arrow visibility */
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    updateTabScroll();
    el.addEventListener("scroll", updateTabScroll, { passive: true });
    const ro = new ResizeObserver(updateTabScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateTabScroll); ro.disconnect(); };
  }, [updateTabScroll, mounted]);

  /* Clear date values on category switch */
  const handleTabClick = (id) => {
    setActiveCategory(id);
    setDates({});
  };


  useEffect(() => {
    const map = {};
    loadData.forEach((item) => {
      const key = CATEGORY_KEY_MAP[item.name?.toLowerCase()?.trim()];
      if (!key) return;
      map[key] = {
        image: item.image,
        video: item.video,
      };
    });

    setMediaMap(map);
  }, [loadData]);

  /* Re-arm the skeleton whenever the resolved media actually changes
     (category switch, or the real data arriving after the fallback) —
     keyed on the resolved src values themselves, not the whole `mediaMap`
     object, so an unrelated category's data landing doesn't spuriously
     re-trigger the skeleton for the one currently on screen. */
  const activeMedia = mediaMap[activeCategory] || {};
  useEffect(() => {
    setMediaReady(false);
  }, [activeMedia.image, activeMedia.video]);

const handleSearch = () => {
  const params = new URLSearchParams();

  Object.entries(searchData).forEach(([key, value]) => {
    if (value == null || value === "") return;

    // Date
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, "0");
      const d = String(value.getDate()).padStart(2, "0");

      params.set(key, `${y}-${m}-${d}`);
      return;
    }

    // Location
   if (key === "location") {
  if (typeof value === "object") {
    // Property-mode free-text payload from LocationAutoComplete (typed a
    // name, hit Enter, no specific suggestion picked) — distinct shape
    // from a location pick (no city/lat/lng), so it's routed to its own
    // param instead of being silently dropped by the city/address
    // fallback below.
    if (value.mode === "property") {
      if (value.propertyQuery) params.set("q", value.propertyQuery);
      return;
    }

    params.set("location", value.city || value.address || "");

    if (value.lat) params.set("lat", value.lat);
    if (value.lng) params.set("lng", value.lng);

    if (value.bounds) {
      params.set("north", value.bounds.north);
      params.set("south", value.bounds.south);
      params.set("east", value.bounds.east);
      params.set("west", value.bounds.west);
    }
  } else {
    params.set("location", value);
  }
  return;
}
    // Guests
    if (key === "guests") {
      if (typeof value === "object") {
        const total = Object.values(value).reduce(
          (sum, n) => sum + Number(n || 0),
          0
        );

        if (total > 0) {
          params.set("guests", String(total));
        }
      } else {
        params.set("guests", String(value));
      }
      return;
    }

    params.set(key, String(value));
  });

  router.push(
    `/${locale}/${country}/search/${activeCategory}?${params.toString()}`
  );
};

  if (!mounted) return null;

  const tint        = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const fields = SEARCH_CONFIG[activeCategory] ?? [];
  // Only farmstays gets the collapse/expand toggle bar — see
  // TOGGLE_BAR_CATEGORIES in searchFieldsConfig.js for why. Every other
  // category keeps the classic bar where all fields stay visible.
  const useToggleBar = TOGGLE_BAR_CATEGORIES.includes(activeCategory);
  const isComingSoon = CATEGORIES[activeCategory]?.comingSoon ?? false;
  // Same "equal width only while nothing's spotlighted" rule as
  // ListingsSearchBar.jsx's SearchField — see that file for the full
  // rationale. Columns stay unequal (active field grows) exactly while
  // `activeFieldId` points at a real field — including a REOPENED one, so
  // re-editing a field after everything's filled gets the same
  // comfortable width it had the first time, not squeezed into an equal
  // share. Falls back to equal width only once nothing is active (closed
  // without advancing, or a value got cleared) — otherwise every field
  // pins at 104px with nothing absorbing the leftover width, leaving a
  // dead gap instead of filling the bar.
  const equalWidth = activeFieldId == null;

  /* Tint-aware glass style for search bar */
  const glassStyle = {
    background:  `rgba(0,0,0,0.28)`,
    borderColor:  tint.border,
    boxShadow:   `0 8px 40px rgba(0,0,0,0.35), ${tint.glow}`,
  };

  // Same value as `activeMedia` computed earlier (needed there so the
  // mediaReady-reset effect above could run before the mount check).
  const currentMedia = activeMedia;

  return (
    <>
      {/*
        overflow-hidden is on the inner background wrapper, NOT the section.
        This lets absolutely-positioned dropdowns (z-50) escape without clipping.
      */}
      <section id="hero-section" className="relative flex flex-col h-[100vh] max-h-[100vh]">

        {/* Background — overflow-hidden scoped here so video scale-105 doesn't bleed */}
        <div className="absolute inset-0 overflow-hidden">
  {/* Skeleton — shown until the actual video/image has visually loaded.
      Previously there was nothing behind the overlay while
      country_of_category() was in flight (or while the fallback video
      was still buffering): just the dark gradient sitting on a blank
      black frame, which read as the whole section having silently
      failed rather than still loading. */}
  {!mediaReady && (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
  )}

  {isMobile ? (
    <img
      key={currentMedia.image || "default-image"}
      src={
        currentMedia.image
          ? `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${currentMedia.image}`
          : "https://www.venuebook.in/img/sintra.6885ed95.png"
      }
      alt=""
      onLoad={() => setMediaReady(true)}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${mediaReady ? "opacity-100" : "opacity-0"}`}
    />
  ) : (
    <video
      key={currentMedia.video || "default-video"}
      src={
        currentMedia.video
          ? `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${currentMedia.video}`
          : "https://api.venuebook.in/Upload/Video/HomePage.mp4"
      }
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      onLoadedData={() => setMediaReady(true)}
      className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-500 ${mediaReady ? "opacity-100" : "opacity-0"}`}
    />
  )}

  {/* Overlay — a touch darker than the previous pass (45/25/55 read as too
      washed out); still well short of the original 70/55/80 that flattened
      the video into a dull, muddy wash. */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
</div>

        {/* Content */}
        {/* Mobile: flex-1 fills the full 100svh section again, but instead
            of a fixed `mt-*` guess on the search area to create the gap
            above it, the search area itself gets `mt-auto` (see below) —
            a self-sizing flexbox push-to-bottom instead of a magic-number
            margin. pt-32/pb-32 frame the block symmetrically top and
            bottom; the headline+tabs group sits right after the top
            padding, the search area sits right before the bottom padding,
            and `mt-auto` absorbs whatever space is left between them.
            Desktop keeps its original centered layout, untouched. */}
        <div className="relative z-10 flex flex-col flex-1 justify-start md:justify-center w-full mx-auto lg:max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-32 md:pt-28 pb-32 md:pb-10">

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="font-bold leading-[1.08] tracking-tight text-white text-[1.7rem] sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              Your Next Great Story
              <br className="hidden sm:block" />{" "}
              Starts with the Right{" "}
              <span
                className="relative inline-block align-bottom"
                style={{ minWidth: "clamp(100px, 17vw, 200px)", height: "1.1em" }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                   key={WORDS[wordIdx] || "default"}
                    initial={{ opacity: 0, y: 12, filter: "blur(5px)" }}
                    animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                    exit={{   opacity: 0, y: -12, filter: "blur(5px)" }}
                    transition={{ duration: 0.42, ease: "easeInOut" }}
                    className="absolute left-0 top-0 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap"
                  >
                    {WORDS[wordIdx] || ""}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-white/60 text-sm sm:text-base leading-relaxed max-w-lg"
            >
              Discover, compare, and instantly book venues, farmstays &amp; event spaces — all on one platform.
            </motion.p>
          </motion.div>

          {/* Category tabs — scrollable, fade edges + small arrows when overflowing */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mt-6 md:mt-7"
          >
            <div className="relative">
              {/* Left arrow */}
              {canTabLeft && (
                <button
                  type="button"
                  onClick={() => scrollTabs(-1)}
                  className="absolute start-0 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-all"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeftIcon className="w-3 h-3" />
                </button>
              )}

              {/* Right arrow */}
              {canTabRight && (
                <button
                  type="button"
                  onClick={() => scrollTabs(1)}
                  className="absolute end-0 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-all"
                  aria-label="Scroll categories right"
                >
                  <ChevronRightIcon className="w-3 h-3" />
                </button>
              )}

              {/* Left fade */}
              {canTabLeft && (
                <div
                  className="absolute inset-y-0 start-0 w-10 pointer-events-none z-10"
                />
              )}
              {/* Right fade */}
              <div
                className="absolute inset-y-0 end-0 w-12 pointer-events-none z-10"
              />

              <div
                ref={tabsRef}
                className="flex items-center gap-2 overflow-x-auto mb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
              >
                {/* Leading spacer when left arrow shows */}
                {canTabLeft && <div className="shrink-0 w-4" />}

                {CATEGORY_ORDER.map((id) => {
                if (!TAB_LABEL[id]) return null;
                const isActive = activeCategory === id;
                const isSoon = CATEGORIES[id]?.comingSoon;
                const tabTint = CATEGORY_TINTS[id];

                  return (
                    <button
                      key={id}
                      onClick={() => handleTabClick(id)}
                      style={isActive ? {
                        background:  tabTint.activeBg,
                        borderColor: tabTint.activeBorder,
                        color:       "#fff",
                      } : {}}
                      className={[
                        "relative flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 border",
                        "text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                        isActive
                          ? "font-semibold"
                          : "bg-white/[0.07] border-white/[0.15] text-white/80 hover:bg-white/[0.14] hover:border-white/30 active:scale-95",
                      ].join(" ")}
                    >
                     
                       {TAB_LABEL[id]}
                      {isSoon && (
                        <span className="text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-full uppercase tracking-wide leading-none">
                          Soon
                        </span>
                      )}
                    </button>
                  );
                })}
                {/* Trailing spacer so last chip clears the right fade/arrow */}
                <div className="shrink-0 w-8" />
              </div>
            </div>
          </motion.div>

          {/* Search area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-auto md:mt-5"
            >
              {isComingSoon ? (
                /* Coming soon panel */
                <div
                  className="flex items-center gap-3 backdrop-blur-2xl rounded-2xl px-5 py-4 max-w-md border"
                  style={glassStyle}
                >
                  <span className="text-xl">🔔</span>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {TAB_LABEL[activeCategory]} launches soon
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      Be the first to know when we go live.
                    </p>
                  </div>
                  <button
                    className="ms-auto flex items-center gap-1.5 shrink-0 bg-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
                    style={{ color: tint.hex }}
                  >
                    <BellIcon className="w-3.5 h-3.5" />
                    Get Notified
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop search bar — fixed 69px height: was implicit/content-
                     driven, so the row's own height shifted by a few px as
                     fields swapped between collapsed/expanded and between
                     field types with slightly different natural content
                     heights. Every field now stretches to fill this fixed
                     height and centers its own content within it (see
                     SearchField below), so only width animates, never
                     height. Same fixed height as ListingsSearchBar.jsx's
                     bar too, for consistency between the two. */}
                  <div
                    className="hidden md:flex h-[69px] backdrop-blur-2xl rounded-2xl border max-w-4xl overflow-visible"
                    style={glassStyle}
                  >
                    {Array.isArray(fields) &&
                      fields.map((field, i) => (
                          <SearchField
                            key={`${activeCategory}-${field.id}`}
                            field={field}
                            tint={tint}
                            category={activeCategory}
                            countryCode={String(country || "in").toLowerCase()}
                            isFirst={i === 0}
                            isLast={i === fields.length - 1}
                            equalWidth={equalWidth}
                            dates={dates}
                            onDateChange={(key, v) =>
                              setDates((p) => ({ ...p, [key]: v }))
                            }
                            setSearchData={setSearchData}
                            searchData={searchData}
                         itemDest={itemDest}
                         t={t}
                         tf={tf}
                         isActive={!useToggleBar || activeFieldId === field.id}
                         onActivate={() => setActiveFieldId(field.id)}
                         onAdvance={() => setActiveFieldId(fields[i + 1]?.id ?? field.id)}
                         // See ListingsSearchBar.jsx's SearchField for why —
                         // collapses this field back to its display pill
                         // the moment its own popup closes without
                         // advancing (click outside, Escape, reselect).
                         onDeactivate={() => setActiveFieldId((cur) => (cur === field.id ? null : cur))}
                            />
                      ))}

                    {/* Search button */}
                    <div className="flex items-center px-3 py-2">
                      <button
                        className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all whitespace-nowrap text-white"
                        style={{
                          background: tint.hex,
                          boxShadow:  tint.activeGlow,
                        }}

                         onClick={() => handleSearch()}
                      >
                        <MagnifyingGlassIcon className="w-4 h-4" />
                        {t("search")}
                      </button>
                    </div>
                  </div>

                  {/* Mobile search trigger — reflects the sheet's current
                      selection (see mobileSummary/onSummaryChange) instead
                      of staying on a static placeholder once the user has
                      picked a location/date/guests inside it. */}
                  <button
                    onClick={() => setOpenSearch(true)}
                    className="md:hidden w-full flex items-center justify-between backdrop-blur-xl border text-white rounded-xl px-4 py-3.5 transition active:scale-[0.98]"
                    style={{
                      background:  "rgba(0,0,0,0.25)",
                      borderColor:  tint.border,
                      boxShadow:    tint.glow,
                    }}
                  >
                    <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1 text-start">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40 truncate w-full">
                        {mobileSummary.location || t("where_to")}
                      </span>
                      <span className="text-sm text-white/70 truncate w-full">
                        {mobileSummary.location
                          ? [mobileSummary.dateSummary, mobileSummary.guestSummary].filter(Boolean).join(" · ") || t("tap_to_edit")
                          : t("mobile_trigger_placeholder")}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg text-white shrink-0" style={{ background: tint.hex }}>
                      <MagnifyingGlassIcon className="w-4 h-4" />
                    </div>
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      <MobileSearchSheet open={openSearch} setOpen={setOpenSearch} 
      onSummaryChange={setMobileSummary}  itemDest={itemDest}/>
    </>
  );
}

/* ─── Search field renderer ─────────────────────────────────── */
function SearchField({ field, tint, category, isFirst, isLast, equalWidth = false, dates, onDateChange, setSearchData,
   countryCode, itemDest, t, tf, searchData, isActive = true, onActivate, onAdvance, onDeactivate }) {
  // The header label above the location field used to be permanently
  // "LOCATION" (straight from SEARCH_CONFIG) even after switching to
  // Property mode inside the dropdown — only the placeholder changed,
  // which read as half-finished. LocationAutoComplete reports its live
  // label ("Location" or the active category's word, e.g. "Venue") via
  // onModeChange; this mirrors it so the header swaps too.
  const fieldLabel = field.labelKey ? t(field.labelKey) : field.label;
  const [locationLabel, setLocationLabel] = useState(fieldLabel);
  useEffect(() => { setLocationLabel(fieldLabel); }, [fieldLabel]);

  // Same collapse/expand toggle as ListingsSearchBar.jsx's SearchField —
  // see that file for the full rationale. Kept as two near-identical
  // implementations (not a shared component) because this bar's dark
  // glass chrome and the results-page bar's light chrome were already
  // separate before this change; only the field SCHEMA was deduped.
  //
  // `displayActive` vs `isActive`: the box's width (driven by `isActive`
  // via CSS transition below) and the content swap used to both flip the
  // instant `isActive` changed — two independently-timed animations
  // racing each other. Collapsing was fine (the compact pill fits at any
  // width), but EXPANDING showed the full control immediately, while the
  // box was still only 104px wide and hadn't grown yet, so content
  // wrapped across multiple lines until the box caught up. Dropping to
  // collapsed stays instant (safe at any width); rising to expanded waits
  // for the box to actually finish growing.
  const [displayActive, setDisplayActive] = useState(isActive);
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setDisplayActive(true), 300);
      return () => clearTimeout(timer);
    }
    setDisplayActive(false);
  }, [isActive]);

  // .click() for button-triggered pickers (DatePicker/GuestPicker/
  // SearchSelectField), .focus() for LocationAutoComplete's text input —
  // see the full rationale in ListingsSearchBar.jsx's SearchField:
  // .click() on an <input> doesn't reliably move focus (browsers focus
  // text inputs on "mousedown", which .click() never dispatches), so
  // Location's onFocus-gated suggestions weren't opening until a real
  // second click.
  const contentRef = useRef(null);
  useEffect(() => {
    if (!displayActive) return;
    const raf = requestAnimationFrame(() => {
      const el = contentRef.current?.querySelector("button, input");
      if (!el) return;
      if (el.tagName === "INPUT") el.focus();
      else el.click();
    });
    return () => cancelAnimationFrame(raf);
  }, [displayActive]);

  const Icon = field.icon;
  const summary = getFieldSummary(field, { searchData, dates, t, tf });

  return (
    // Two width modes via `equalWidth` — see the matching comment in
    // ListingsSearchBar.jsx's SearchField for the full rationale:
    // unequal (active field grows, rest pin at 104px) while there's still
    // a "next" field to spotlight; equal split once every field is filled.
    //
    // Real CSS flex (not Framer's `layout`/transform-scale trick) still
    // renders each column: that trick stretches nested non-motion children
    // whenever the box resizes. AnimatePresence below only crossfades
    // opacity, which doesn't touch layout.
    <div
      className={[
        "relative min-w-0 overflow-visible",
        "transition-[flex-grow,min-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        !isLast ? "border-e" : "",
      ].join(" ")}
      style={{
        ...(equalWidth
          ? { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: "0px" }
          : {
              flexGrow: isActive ? 1 : 0,
              flexShrink: isActive ? 1 : 0,
              flexBasis: "0%",
              minWidth: isActive ? "0px" : "104px",
            }),
        ...(!isLast ? { borderColor: "rgba(255,255,255,0.1)" } : {}),
      }}
    >
      {/* mode="wait" removed: `displayActive` already gates when each
         branch mounts, so exit-then-enter sequencing was just dead time
         after the box had finished resizing. Both branches are now
         `absolute inset-0` so a simultaneous crossfade overlaps cleanly
         in the same spot instead of stacking in flow. */}
      <AnimatePresence initial={false}>
        {!displayActive ? (
          /* First-time (nothing picked yet): short label with the icon
             centered underneath instead of a dash. Once a value exists:
             icon-left, short label + value stacked to the right,
             left-aligned like every other field. */
          <motion.button
            key="collapsed"
            type="button"
            onClick={onActivate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className={[
              "absolute inset-0 flex items-center w-full h-full px-3.5 py-3 hover:bg-white/[0.06] transition-colors text-start",
              // Same fix as ListingsSearchBar.jsx's SearchField — this
              // pill's hover background is absolute inset-0, so it needs
              // its own start-corner rounding on the first field to match
              // the bar's rounded-2xl, since the bar itself is
              // overflow-visible (required for dropdowns to escape it).
              isFirst ? "rounded-s-2xl" : "",
            ].join(" ")}
          >
            {summary ? (
              <div className="flex items-center gap-2 w-full min-w-0">
                {Icon && <Icon className="w-4 h-4 shrink-0 text-white/70" aria-hidden="true" />}
                <div className="min-w-0 leading-tight">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 whitespace-nowrap">
                    {field.shortLabelKey ? t(field.shortLabelKey) : fieldLabel}
                  </p>
                  <p className="text-xs truncate text-white/85">{summary}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 w-full">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 whitespace-nowrap">
                  {field.shortLabelKey ? t(field.shortLabelKey) : fieldLabel}
                </p>
                {Icon && <Icon className="w-4 h-4 shrink-0 text-white/70" aria-hidden="true" />}
              </div>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            ref={contentRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            // h-full + justify-center: matches the collapsed pill's own
            // centering so both states sit centered within the bar's
            // fixed 69px height instead of this one being top-aligned.
            // absolute inset-0: overlaps the collapsed pill during the
            // simultaneous crossfade instead of stacking below it.
            className="absolute inset-0 min-w-0 h-full flex flex-col justify-center px-5"
          >
            {/* truncate (not just whitespace-nowrap) — see the matching
               comment in ListingsSearchBar.jsx's SearchField: an un-clipped
               long label in a narrow equal-width column would overflow
               past this field's border into the next one. */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1.5 truncate">
              {field.type === "location" ? locationLabel : fieldLabel}
            </p>

      {field.type === "location" && (
        <LocationAutoComplete
          category={category}
          tint={tint}
          placeholder={field.placeholderKey ? t(field.placeholderKey) : field.placeholder}
          countryCode={countryCode}
          /* This field unmounts when collapsed (only renders inside the
             `displayActive` branch above) and remounts fresh every time
             it's reopened — so without a `defaultValue`, reopening it
             always showed the empty placeholder even after a location had
             already been picked, no matter what was selected. Same fix as
             ListingsSearchBar.jsx's SearchField; see that file for why the
             string/object branching. */
          defaultValue={
            typeof searchData.location === "string"
              ? searchData.location
              : searchData.location?.city || ""
          }
          onSelect={(value) =>
            setSearchData((p) => ({ ...p, location: value }))
          }
          onNext={onAdvance}
          onModeChange={setLocationLabel}
          itemDest={itemDest}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}

      {field.type === "date" && (
        <DatePicker
          mode="single"
          tint={tint}
          startDate={dates[field.id] ?? null}
          placeholder={t("select_date")}
          onChangeStart={(v) => {
            onDateChange(field.id, v);
            setSearchData((p) => ({ ...p, [field.id]: v }));
          }}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}

      {field.type === "datetime" && (
        <DatePicker
          mode="datetime"
          tint={tint}
          startDate={dates[field.id] ?? null}
          placeholder={t("select_date_time")}
          onChangeStart={(v) => {
            onDateChange(field.id, v);
            setSearchData((p) => ({ ...p, [field.id]: v }));
          }}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}

      {/* Single merged trigger ("12 Aug → 15 Aug") instead of two separate
         Check In / Check Out cells — both opened the exact same shared
         calendar anyway. Matches ListingsSearchBar.jsx and the mobile
         sheet, which never split these into two cells either. */}
      {field.type === "daterange" && (
        <DatePicker
          mode="range"
          tint={tint}
          startDate={dates[field.startId] ?? null}
          endDate={dates[field.endId] ?? null}
          placeholder={field.placeholderKey ? t(field.placeholderKey) : t("select_date")}
          onChangeStart={(v) => {
            onDateChange(field.startId, v);
            setSearchData((p) => ({ ...p, [field.startId]: v }));
          }}
          onChangeEnd={(v) => {
            onDateChange(field.endId, v);
            setSearchData((p) => ({ ...p, [field.endId]: v }));
            if (v) onAdvance?.();
          }}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}

      {field.type === "guests" && (
        <GuestPicker
          type={field.guestType ?? "guests"}
          tint={tint}
            onChange={(val) =>
    setSearchData((p) => ({ ...p, guests: val }))
  }
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}

      {field.type === "select" && (
        <SearchSelectField
          options={(field.options ?? []).map((o) => ({ id: o.id, label: tf(`${field.optionKeyPrefix ?? ""}${o.id}`), icon: o.icon, image: o.image }))}
          value={searchData?.[field.id] ?? ""}
          onChange={(val) => {
            setSearchData((p) => ({ ...p, [field.id]: val }));
            // Same auto-advance as location/date-range below — was missing
            // here, so Occasion/Vibe were the only fields that didn't hand
            // off to the next one after picking a value.
            if (val) onAdvance?.();
          }}
          tint={tint}
          label={fieldLabel}
          placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
