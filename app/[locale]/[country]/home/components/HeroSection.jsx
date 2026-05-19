"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon, BellIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";

import MobileSearchSheet   from "./MobileSearchSheet";
import LocationAutoComplete from "./LocationAutoComplete";
import GuestPicker          from "./GuestPicker";
import DatePicker           from "./DatePicker";

import { CATEGORIES, CATEGORY_ORDER, CATEGORY_TINTS } from "@/config/categoryConfig";
import { useCategory } from "@/context/CategoryContext";

import { useGeo } from "@/context/GeoContext";


/* ─── Labels ────────────────────────────────────────────────── */
const WORD_LABEL = {
  venues:      "Venue",
  farmstays:   "Farmstay",
  studios:     "Studio",
  rentals:     "Rental",
  workspaces:  "Workspace",
  experiences: "Experience",
};
const TAB_LABEL = {
  venues:      "Venues",
  farmstays:   "Farmstays",
  studios:     "Studios",
  rentals:     "Rentals",
  workspaces:  "Workspaces",
  experiences: "Experiences",
};

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
    { id: "location",  label: "Destination", type: "location",  placeholder: "Where to?"    },
    { id: "checkin",   label: "Check In",    type: "date"                                    },
    { id: "checkout",  label: "Check Out",   type: "date"                                    },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests_detailed" },
  ],
  studios: [
    { id: "location",  label: "Location",   type: "location",  placeholder: "City or area" },
    { id: "startdate", label: "Start",       type: "datetime"                                },
    { id: "enddate",   label: "End",         type: "datetime"                                },
    { id: "guests",    label: "Team Size",   type: "guests",    guestType: "attendees"       },
  ],
  rentals: [
    { id: "location",  label: "Location",   type: "location",  placeholder: "City or area" },
    { id: "startdate", label: "Start Date",  type: "date"                                    },
    { id: "enddate",   label: "End Date",    type: "date"                                    },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests"          },
  ],
  workspaces: [
    { id: "location",  label: "Location",   type: "location",  placeholder: "City or area" },
    { id: "startdate", label: "Start Date",  type: "date"                                    },
    { id: "enddate",   label: "End Date",    type: "date"                                    },
    { id: "guests",    label: "Team Size",   type: "guests",    guestType: "attendees"       },
  ],
  experiences: null,
};

const WORDS = CATEGORY_ORDER.map((id) => WORD_LABEL[id]);

/* ─── Component ─────────────────────────────────────────────── */
export default function HeroSection() {
  const { activeCategory, setActiveCategory } = useCategory();

  const [isMobile,    setIsMobile]    = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [openSearch,  setOpenSearch]  = useState(false);
  const [wordIdx,     setWordIdx]     = useState(0);
  /* date / guest values keyed by field id */
  const [dates,       setDates]       = useState({});

  /* Hydration */
  useEffect(() => setMounted(true), []);

  /* Word rotation */
  useEffect(() => {
    const t = setInterval(() => setWordIdx((p) => (p + 1) % WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);

  /* Mobile detection */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Clear date values on category switch */
  const handleTabClick = (id) => {
    setActiveCategory(id);
    setDates({});
  };

  if (!mounted) return null;

  const tint        = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const fields      = SEARCH_CONFIG[activeCategory] ?? null;
  const isComingSoon = CATEGORIES[activeCategory]?.comingSoon ?? false;

  /* Tint-aware glass style for search bar */
  const glassStyle = {
    background:  `rgba(0,0,0,0.28)`,
    borderColor:  tint.border,
    boxShadow:   `0 8px 40px rgba(0,0,0,0.35), ${tint.glow}`,
  };

   const { country, loading } = useGeo();

  return (
    <>
      {/*
        overflow-hidden is on the inner background wrapper, NOT the section.
        This lets absolutely-positioned dropdowns (z-50) escape without clipping.
      */}
      <section className="relative flex flex-col min-h-[55svh] md:min-h-[80vh]">

        {/* Background — overflow-hidden scoped here so video scale-105 doesn't bleed */}
        <div className="absolute inset-0 overflow-hidden">
          {isMobile ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://www.venuebook.in/img/sintra.6885ed95.png')" }}
            />
          ) : (
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover scale-105">
              <source src="https://api.venuebook.in/Upload/Video/HomePage.mp4" type="video/mp4" />
            </video>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 justify-center w-full max-w-6xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-24 md:pt-28 pb-8 md:pb-10">

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
                    key={WORDS[wordIdx]}
                    initial={{ opacity: 0, y: 12, filter: "blur(5px)" }}
                    animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                    exit={{   opacity: 0, y: -12, filter: "blur(5px)" }}
                    transition={{ duration: 0.42, ease: "easeInOut" }}
                    className="absolute left-0 top-0 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap"
                  >
                    {WORDS[wordIdx]}
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

          {/* Category tabs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mt-6 md:mt-7"
          >
            <div
              className="flex items-center gap-2 overflow-x-auto pb-0.5"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {CATEGORY_ORDER.map((id) => {
                const isActive = activeCategory === id;
                const isSoon   = CATEGORIES[id].comingSoon;
                const tabTint  = CATEGORY_TINTS[id];

                return (
                  <button
                    key={id}
                    onClick={() => handleTabClick(id)}
                    style={isActive ? {
                      background:  tabTint.activeBg,
                      borderColor: tabTint.activeBorder,
                      color:       "#fff",
                      boxShadow:   `${tabTint.activeGlow}, 0 2px 8px rgba(0,0,0,0.3)`,
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
                        Soon   {loading ? "Loading..." : `Country: ${country}`}
                      </span>
                    )}
                  </button>
                );
              })}
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
                    {fields.map((field, i) => (
                      <SearchField
                        key={`${activeCategory}-${field.id}`}
                        field={field}
                        tint={tint}
                        category={activeCategory}
                        isLast={i === fields.length - 1}
                        /* date state */
                        dateValue={dates[field.id] ?? null}
                        onDateChange={(v) => setDates((p) => ({ ...p, [field.id]: v }))}
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
                      >
                        <MagnifyingGlassIcon className="w-4 h-4" />
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Mobile search trigger */}
                  <button
                    onClick={() => setOpenSearch(true)}
                    className="md:hidden w-full flex items-center justify-between backdrop-blur-xl border text-white rounded-xl px-4 py-3.5 transition active:scale-[0.98]"
                    style={{
                      background:  "rgba(0,0,0,0.25)",
                      borderColor:  tint.border,
                      boxShadow:    tint.glow,
                    }}
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        Where to?
                      </span>
                      <span className="text-sm text-white/70">
                        Search location, date, guests…
                      </span>
                    </div>
                    <div className="p-2 rounded-lg text-white" style={{ background: tint.hex }}>
                      <MagnifyingGlassIcon className="w-4 h-4" />
                    </div>
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      <MobileSearchSheet open={openSearch} setOpen={setOpenSearch} />
    </>
  );
}

/* ─── Search field renderer ─────────────────────────────────── */
function SearchField({ field, tint, category, isLast, dateValue, onDateChange }) {
  return (
    <div
      /* overflow-visible so dropdowns escape the flex row */
      className={[
        "relative flex-1 min-w-0 px-5 py-3.5 overflow-visible",
        !isLast ? "border-e" : "",
      ].join(" ")}
      style={!isLast ? { borderColor: "rgba(255,255,255,0.1)" } : {}}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1.5 whitespace-nowrap">
        {field.label}
      </p>

      {field.type === "location" && (
        <LocationAutoComplete
          category={category}
          tint={tint}
          placeholder={field.placeholder}
        />
      )}

      {field.type === "date" && (
        <DatePicker
          mode="single"
          tint={tint}
          startDate={dateValue}
          onChangeStart={onDateChange}
          placeholder="Select date"
        />
      )}

      {field.type === "datetime" && (
        <DatePicker
          mode="datetime"
          tint={tint}
          startDate={dateValue}
          onChangeStart={onDateChange}
          placeholder="Select date & time"
        />
      )}

      {field.type === "guests" && (
        <GuestPicker
          type={field.guestType ?? "guests"}
          tint={tint}
        />
      )}
    </div>
  );
}
