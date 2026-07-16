"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon, BellIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

import MobileSearchSheet   from "./MobileSearchSheet";
import LocationAutoComplete from "./LocationAutoComplete";
import GuestPicker          from "./GuestPicker";
import DatePicker           from "./DatePicker";

import { CATEGORIES, CATEGORY_ORDER, CATEGORY_TINTS } from "@/config/categoryConfig";
import { useCategory } from "@/context/CategoryContext";

import { country_of_category } from "@/services/global.service";

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
const SEARCH_CONFIG = {
  venues: [
    { id: "location",  label: "Location",   type: "location",  placeholder: "City or area" },
    { id: "date",      label: "Event Date",  type: "date"                                    },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests"          },
  ],
  farmstays: [
    { id: "location", label: "Destination", type: "location", placeholder: "Where to?" },
    { id: "dates",     type: "daterange", startId: "checkin",   endId: "checkout",   startLabel: "Check In",   endLabel: "Check Out" },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests_detailed" },
  ],
  studios: [
    { id: "location",  label: "Location",   type: "location",  placeholder: "City or area" },
    { id: "startdate", label: "Start",       type: "datetime"                                },
    { id: "enddate",   label: "End",         type: "datetime"                                },
    { id: "guests",    label: "Team Size",   type: "guests",    guestType: "attendees"       },
  ],
  rentals: [
    { id: "location", label: "Location",    type: "location", placeholder: "City or area" },
    { id: "dates",     type: "daterange", startId: "startdate", endId: "enddate", startLabel: "Start Date", endLabel: "End Date" },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests"          },
  ],
  workspaces: [
    { id: "location", label: "Location",    type: "location", placeholder: "City or area" },
    { id: "dates",     type: "daterange", startId: "startdate", endId: "enddate", startLabel: "Start Date", endLabel: "End Date" },
    { id: "guests",    label: "Team Size",   type: "guests",    guestType: "attendees"       },
  ],
  experiences: null,
};
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
export default function HeroSection() {
   const router = useRouter();
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

  /* Refs to each search field container — used for auto-advance on location select */
  const fieldRefs = useRef([]);

   const [searchData, setSearchData] = useState({
  location: "",
  date: "",
  checkin: "",
  checkout: "",
  guests: "",
});

console.log(mediaMap)

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
  const isComingSoon = CATEGORIES[activeCategory]?.comingSoon ?? false;

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
      <section className="relative flex flex-col min-h-[45svh] md:min-h-[80vh]">

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
        <div className="relative z-10 flex flex-col flex-1 justify-center w-full mx-auto lg:max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-32 md:pt-28 pb-8 md:pb-10">

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
              className="mt-4 md:mt-5"
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
                  {/* Desktop search bar */}
                  <div
                    className="hidden md:flex backdrop-blur-2xl rounded-2xl border max-w-4xl overflow-visible"
                    style={glassStyle}
                  >
                    {Array.isArray(fields) &&
                      fields.map((field, i) => {
                        /* create a stable ref for each field slot */
                        if (!fieldRefs.current[i]) fieldRefs.current[i] = { current: null };
                        return (
                          <SearchField
                            key={`${activeCategory}-${field.id}`}
                            field={field}
                            tint={tint}
                            category={activeCategory}
                            countryCode={String(country || "in").toLowerCase()}
                            isLast={i === fields.length - 1}
                            dates={dates}
                            onDateChange={(key, v) =>
                              setDates((p) => ({ ...p, [key]: v }))
                            }
                            setSearchData={setSearchData}
                            /* register this field's DOM node so previous field can advance to it */
                            selfRefCb={(el) => { fieldRefs.current[i] = { current: el }; }}
                            nextRef={i + 1 < fields.length ? { get current() { return fieldRefs.current[i + 1]?.current ?? null; } } : null}
                          />
                        );
                      })}

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
                        Search
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
                        {mobileSummary.location || "Where to?"}
                      </span>
                      <span className="text-sm text-white/70 truncate w-full">
                        {mobileSummary.location
                          ? [mobileSummary.dateSummary, mobileSummary.guestSummary].filter(Boolean).join(" · ") || "Tap to edit your search"
                          : "Search location, date, guests…"}
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

      <MobileSearchSheet open={openSearch} setOpen={setOpenSearch} onSummaryChange={setMobileSummary} />
    </>
  );
}

/* ─── Search field renderer ─────────────────────────────────── */
function SearchField({ field, tint, category, isLast, dates, onDateChange, setSearchData, countryCode, nextRef, selfRefCb }) {
  // The header label above the location field used to be permanently
  // "LOCATION" (straight from SEARCH_CONFIG) even after switching to
  // Property mode inside the dropdown — only the placeholder changed,
  // which read as half-finished. LocationAutoComplete reports its live
  // label ("Location" or the active category's word, e.g. "Venue") via
  // onModeChange; this mirrors it so the header swaps too.
  const [locationLabel, setLocationLabel] = useState(field.label);
  useEffect(() => { setLocationLabel(field.label); }, [field.label]);

  return (
    <div
      ref={selfRefCb}
      /* overflow-visible so dropdowns escape the flex row. daterange gets
         double width — it replaces what used to be two separate columns
         (Check In + Check Out / Start + End Date). */
      className={[
        "relative min-w-0 px-5 py-3.5 overflow-visible",
        field.type === "daterange" ? "flex-[2]" : "flex-1",
        !isLast ? "border-e" : "",
      ].join(" ")}
      style={!isLast ? { borderColor: "rgba(255,255,255,0.1)" } : {}}
    >
      {/* daterange renders its own two mini-labels (Check In / Check Out)
         internally — one shared label here would just be redundant. */}
      {field.type !== "daterange" && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1.5 whitespace-nowrap">
          {field.type === "location" ? locationLabel : field.label}
        </p>
      )}

      {field.type === "location" && (
        <LocationAutoComplete
          category={category}
          tint={tint}
          placeholder={field.placeholder}
          countryCode={countryCode}
          onSelect={(value) =>
            setSearchData((p) => ({ ...p, location: value }))
          }
          onNext={() => {
            /* Click the first button/input in the next field to open the date picker */
            const trigger = nextRef?.current?.querySelector("button, input");
            if (trigger) trigger.click();
          }}
          onModeChange={setLocationLabel}
        />
      )}

      {field.type === "date" && (
        <DatePicker
          mode="single"
          tint={tint}
          startDate={dates[field.id] ?? null}
          placeholder="Select date"
          onChangeStart={(v) => {
            onDateChange(field.id, v);
            setSearchData((p) => ({ ...p, [field.id]: v }));
          }}
        />
      )}

      {field.type === "datetime" && (
        <DatePicker
          mode="datetime"
          tint={tint}
          startDate={dates[field.id] ?? null}
          placeholder="Select date & time"
          onChangeStart={(v) => {
            onDateChange(field.id, v);
            setSearchData((p) => ({ ...p, [field.id]: v }));
          }}
        />
      )}

      {/* Single connected range calendar — was two independent single-date
         pickers (Check In / Check Out), which let checkout land before
         check-in with no validation. One DatePicker in mode="range" (same
         component the mobile sheet already uses for farmstays) enforces
         start-before-end and highlights the span between them. */}
      {field.type === "daterange" && (
        <DatePicker
          mode="range"
          tint={tint}
          startDate={dates[field.startId] ?? null}
          endDate={dates[field.endId] ?? null}
          splitLabels={{ start: field.startLabel ?? "Start", end: field.endLabel ?? "End" }}
          onChangeStart={(v) => {
            onDateChange(field.startId, v);
            setSearchData((p) => ({ ...p, [field.startId]: v }));
          }}
          onChangeEnd={(v) => {
            onDateChange(field.endId, v);
            setSearchData((p) => ({ ...p, [field.endId]: v }));
          }}
        />
      )}

      {field.type === "guests" && (
        <GuestPicker
          type={field.guestType ?? "guests"}
          tint={tint}
            onChange={(val) =>
    setSearchData((p) => ({ ...p, guests: val }))
  }
        />
      )}
    </div>
  );
}
