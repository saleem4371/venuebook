"use client";

/**
 * DesktopReelPanel — in-panel reel discovery for the search page right column.
 *
 * Two modes, no fullscreen, no modal, no hiding listings:
 *
 *  BROWSER MODE (default)
 *   · 3-column portrait grid of 9:16 thumbnail cards
 *   · Hover → muted autoplay + scale 1.02 + deeper shadow
 *   · Click → switch to Expanded Mode for that reel
 *
 *  EXPANDED MODE
 *   · Single 9:16 reel centered in the panel (never landscape)
 *   · Black + blurred-cover background fills letterboxing
 *   · Back button top-left → returns to Browser Mode (not to Map)
 *   · Right-side nav arrows (up / down)
 *   · ReelCard handles: Wishlist / Compare / Share / Mute / property info / CTA
 *   · Up Next preview card (bottom-right) slides in when progress > 85%
 *   · Vertical slide transition between reels (no fade/blink)
 *   · Virtual: AnimatePresence mounts only current (+ exit) reel
 *   · Keyboard: ArrowUp / ArrowDown / Escape
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion }                  from "framer-motion";
import { ArrowLeft, ChevronUp, ChevronDown, Clapperboard } from "lucide-react";
import ReelCard from "./ReelCard";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL ?? "";

function getVenueCover(venue) {
  const img = (venue?.images ?? [])[0];
  if (!img) return null;
  return typeof img === "string"
    ? (img.startsWith("http") ? img : `${BASE_URL}/${img}`)
    : (img?.image || img?.url || null);
}

function formatINR(n) {
  if (!n) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n));
}

/* ─── Browser grid card ───────────────────────────────────────────────────── */
function BrowserCard({ venue, onClick }) {
  const videoRef       = useRef(null);
  const [hover, setHover]       = useState(false);
  const [vidReady, setVidReady] = useState(false);

  const cover    = getVenueCover(venue);
  const videoUrl = venue.videoUrl || venue.video_url || venue.coverVideo || null;
  const price    = venue.minPrice || venue.basePrice || venue.price;
  const location = [venue.city, venue.state].filter(Boolean).join(" · ") || venue.location || "";

  // Play/pause on hover
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (hover) {
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [hover]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative overflow-hidden rounded-xl cursor-pointer select-none"
      style={{
        aspectRatio: "9/16",
        backgroundColor: "#111",
        transform:  hover ? "scale(1.025)" : "scale(1)",
        boxShadow:  hover
          ? "0 14px 40px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.3)"
          : "0 4px 14px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.14)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        willChange: "transform",
      }}
    >
      {/* Cover thumbnail */}
      {cover && (
        <img
          src={cover}
          alt={venue.title || venue.name || "Property"}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          style={{ opacity: hover && vidReady ? 0 : 1, transition: "opacity 0.3s" }}
        />
      )}

      {/* Video — always mounted so it survives re-renders; preload=none avoids bandwidth waste */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: vidReady ? 1 : 0, transition: "opacity 0.3s" }}
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={() => setVidReady(true)}
        />
      )}

      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: "58%", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)" }}
      />

      {/* Property info */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none" style={{ padding: "0 10px 10px" }}>
        <p className="text-white font-bold leading-tight truncate" style={{ fontSize: 11 }}>
          {venue.title || venue.name || "Property"}
        </p>
        {location && (
          <p className="text-white/50 truncate mt-0.5" style={{ fontSize: 9 }}>{location}</p>
        )}
        {price && (
          <p className="text-white font-bold mt-0.5" style={{ fontSize: 10 }}>{formatINR(price)}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Slide variants (vertical, direction-aware, no opacity flicker) ──────── */
const SLIDE = {
  enter: (dir) => ({ y: dir >= 0 ? "100%" : "-100%", opacity: 1 }),
  center: { y: 0, opacity: 1 },
  exit:  (dir) => ({ y: dir >= 0 ? "-100%" : "100%", opacity: 1 }),
};
const SLIDE_TRANSITION = { type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] };

/* ─── Expanded Up Next card ───────────────────────────────────────────────── */
function UpNextCard({ venue, onClick }) {
  const cover = getVenueCover(venue);
  const price = venue.minPrice || venue.basePrice || venue.price;
  return (
    <button
      onClick={onClick}
      className="text-left overflow-hidden"
      style={{
        width: 144,
        borderRadius: 14,
        background: "rgba(10,10,10,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.6)",
      }}
    >
      <p style={{
        fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.4)", padding: "8px 10px 5px",
      }}>
        Up Next
      </p>
      {cover
        ? <img src={cover} alt="" className="w-full object-cover" style={{ height: 72, display: "block" }} />
        : <div style={{ height: 72, background: "#1a1a1a" }} />
      }
      <div style={{ padding: "8px 10px 10px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", lineHeight: 1.35,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {venue.title || venue.name}
        </p>
        {price && (
          <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>
            {formatINR(price)}
          </p>
        )}
      </div>
    </button>
  );
}

/* ─── Browser filter chips ───────────────────────────────────────────────── */
const CHIP_DEFS = [
  { id: "all",      label: "All",         filter: null },
  { id: "trending", label: "🔥 Trending", filter: v => v.isTrending || v.isMostViewed },
  { id: "new",      label: "✨ New",       filter: v => v.isNew },
  { id: "rated",    label: "⭐ Top Rated", filter: v => Number(v.rating || v.avgRating || 0) >= 4.5 },
];

/* ─── Ghost button style ─────────────────────────────────────────────────── */
const NAV_BTN = {
  width: 36, height: 36, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(0,0,0,0.52)", backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer",
  transition: "opacity 0.15s, transform 0.15s",
};

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function DesktopReelPanel({
  venues = [],
  category,
  locale,
  country,
  wishlist  = [],
  compares  = [],
  onWishlist,
  onCompare,
}) {
  // "browser" or "expanded"
  const [mode, setMode] = useState("browser");

  // [index, direction]: direction >= 0 → next (slide up), < 0 → prev (slide down)
  const [[activeIdx, dir], setPage] = useState([0, 0]);

  const [muted,      setMuted]      = useState(true);
  const [progress,   setProgress]   = useState(0);
  const [activeChip, setActiveChip] = useState("all");

  // Refs for wheel-scroll navigation in expanded mode
  const panelRef      = useRef(null);   // attached to expanded container
  const wheelAccum    = useRef(0);      // accumulated delta (trackpad momentum)
  const wheelCooldown = useRef(false);  // prevents rapid-fire on mouse wheel

  // Reset to browser when venues list changes (category switch, map pan)
  useEffect(() => {
    setMode("browser");
    setPage([0, 0]);
    setProgress(0);
    setActiveChip("all");
  }, [venues.length]);

  // Chips visible in the browser — only show a chip if at least one venue matches it
  const visibleChips = useMemo(
    () => CHIP_DEFS.filter(c => !c.filter || venues.some(c.filter)),
    [venues],
  );

  // Venues shown in the browser grid: [venue, originalIndexInVenues]
  // Keeping originalIndex ensures expand() opens the right reel even when filtered.
  const filteredWithIdx = useMemo(() => {
    const def = CHIP_DEFS.find(c => c.id === activeChip);
    return venues
      .map((v, i) => [v, i])
      .filter(([v]) => !def?.filter || def.filter(v));
  }, [venues, activeChip]);

  // Reset progress whenever active reel changes
  useEffect(() => { setProgress(0); }, [activeIdx]);

  const expand = useCallback((idx) => {
    setPage([idx, 1]);
    setMode("expanded");
    setProgress(0);
  }, []);

  const go = useCallback((delta) => {
    setPage(([i]) => {
      const next = Math.max(0, Math.min(venues.length - 1, i + delta));
      if (next === i) return [i, 0];
      return [next, delta];
    });
  }, [venues.length]);

  const backToBrowser = useCallback(() => setMode("browser"), []);

  // Keyboard shortcuts in expanded mode
  useEffect(() => {
    if (mode !== "expanded") return;
    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); go(1); }
      if (e.key === "ArrowUp"   || e.key === "PageUp")   { e.preventDefault(); go(-1); }
      if (e.key === "Escape")                             { backToBrowser(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, go, backToBrowser]);

  /**
   * Wheel / trackpad scroll navigation in expanded mode.
   *
   * Strategy: accumulate deltaY across rapid trackpad events.
   * Once the accumulation crosses ±60 px (normalized), navigate and start
   * a 500 ms cooldown so momentum scrolling doesn't skip multiple reels.
   * Mouse wheel sends large single deltas (100-120 px) so it triggers immediately.
   */
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wheelCooldown.current) {
      wheelAccum.current = 0; // drain momentum during cooldown
      return;
    }

    // Normalise across deltaMode values
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 20;   // line → pixel
    if (e.deltaMode === 2) delta *= 400;  // page → pixel

    wheelAccum.current += delta;

    if (Math.abs(wheelAccum.current) >= 60) {
      const direction = wheelAccum.current > 0 ? 1 : -1;
      wheelAccum.current = 0;
      wheelCooldown.current = true;
      setTimeout(() => { wheelCooldown.current = false; }, 500);
      go(direction);
    }
  }, [go]);

  useEffect(() => {
    if (mode !== "expanded") return;
    const el = panelRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      // Reset accumulators when leaving expanded mode
      wheelAccum.current = 0;
      wheelCooldown.current = false;
    };
  }, [mode, handleWheel]);

  /* ── Empty state ── */
  if (venues.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-950 select-none">
        <Clapperboard size={36} className="text-gray-700" strokeWidth={1.5} />
        <p className="text-[13px] text-gray-500 font-medium">No reels available</p>
      </div>
    );
  }

  const venue     = venues[activeIdx];
  const nextVenue = venues[activeIdx + 1];
  const liked     = wishlist.some(w => w.venue_id  === venue?.childVenueId);
  const compared  = compares.some(c => c.childVenueId === venue?.childVenueId);
  const cover     = getVenueCover(venue);

  /* ══════════════════════════════════════════════════════════════════
     EXPANDED MODE
  ══════════════════════════════════════════════════════════════════ */
  if (mode === "expanded") {
    return (
      <div ref={panelRef} className="absolute inset-0 bg-black flex flex-col overflow-hidden">

        {/* ── Cinematic background — blurred cover + dark overlay + vignette ──
            Mirrors YouTube Shorts / Netflix preview aesthetic.
            Works in both light and dark mode (always dark canvas). */}
        {cover && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            {/* Blurred version of the current reel's cover art */}
            <img
              src={cover}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: "blur(32px)", transform: "scale(1.18)" }}
            />
            {/* Flat dark overlay ~40% — keeps foreground reel readable */}
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.40)" }} />
            {/* Radial vignette — darkens edges, draws eye to the 9:16 reel */}
            <div className="absolute inset-0" style={{
              background: "radial-gradient(ellipse 75% 80% at 50% 50%, transparent 25%, rgba(0,0,0,0.70) 100%)",
            }} />
          </div>
        )}

        {/* ── Top bar ── */}
        <div
          className="relative flex-none flex items-center justify-between px-3"
          style={{
            height: 48, zIndex: 20,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)",
          }}
        >
          <button
            onClick={backToBrowser}
            className="flex items-center gap-1.5 hover:opacity-80 active:opacity-60 transition-opacity"
          >
            <ArrowLeft size={15} className="text-white" strokeWidth={2.5} />
            <span className="text-white font-semibold" style={{ fontSize: 12 }}>All Reels</span>
          </button>
          <span className="font-semibold tabular-nums" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            {activeIdx + 1} / {venues.length}
          </span>
        </div>

        {/* ── Reel area (flex-1) — centered 9:16, constrained to panel ── */}
        <div className="relative flex-1 min-h-0 overflow-hidden" style={{ zIndex: 1 }}>

          {/* Centering wrapper — absolute so it has a defined height */}
          <div className="absolute inset-0 flex items-center justify-center">

            {/*
              9:16 container:
              · height: 100% fills the flex-1 area
              · aspectRatio + maxWidth: 100% ensures it never overflows panel width
                (on very narrow panels the width clamps and height auto-adjusts)
            */}
            <div
              className="relative overflow-hidden"
              style={{
                height: "100%",
                aspectRatio: "9/16",
                maxWidth: "100%",
                borderRadius: 14,
              }}
            >
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={activeIdx}
                  custom={dir}
                  variants={SLIDE}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={SLIDE_TRANSITION}
                  className="absolute inset-0"
                  style={{ willChange: "transform" }}
                >
                  <ReelCard
                    venue={venue}
                    category={category}
                    locale={locale}
                    country={country}
                    liked={liked}
                    isCompared={compared}
                    onWishlist={onWishlist}
                    onCompare={onCompare}
                    active={true}
                    controlledMuted={muted}
                    onMuteChange={setMuted}
                    compact={false}
                    onProgress={setProgress}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Nav arrows — right edge of panel ── */}
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2"
            style={{ zIndex: 30 }}
          >
            <button
              onClick={() => go(-1)}
              disabled={activeIdx === 0}
              style={{ ...NAV_BTN, opacity: activeIdx === 0 ? 0.2 : 1 }}
              className="hover:scale-105 active:scale-90"
              aria-label="Previous reel"
            >
              <ChevronUp size={16} className="text-white" />
            </button>
            <button
              onClick={() => go(1)}
              disabled={activeIdx === venues.length - 1}
              style={{ ...NAV_BTN, opacity: activeIdx === venues.length - 1 ? 0.2 : 1 }}
              className="hover:scale-105 active:scale-90"
              aria-label="Next reel"
            >
              <ChevronDown size={16} className="text-white" />
            </button>
          </div>

          {/* ── Up Next ── slides in from right during final 15% ── */}
          <AnimatePresence>
            {progress > 0.85 && nextVenue && (
              <motion.div
                key={`upnext-${activeIdx}`}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute"
                style={{ right: 12, bottom: 80, zIndex: 30 }}
              >
                <UpNextCard venue={nextVenue} onClick={() => go(1)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     BROWSER MODE
     Light mode: soft neutral (#FAFAFB / gray-50) so the dark reel
     cards pop rather than merging into the page background.
     Dark mode: stays gray-950 (unchanged, already premium).
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div
      className="w-full h-full overflow-y-auto"
      style={{
        background: "var(--reel-browser-bg)",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div className="p-3 pb-6">

        {/* ── Header ── */}
        <div className="pt-0.5 mb-3">
          <p className="text-gray-900 dark:text-white font-bold leading-tight" style={{ fontSize: 15 }}>
            Explore Reels
          </p>
          <p className="text-gray-400 dark:text-gray-500 font-medium mt-0.5" style={{ fontSize: 11 }}>
            {filteredWithIdx.length} {filteredWithIdx.length === 1 ? "video" : "videos"}
            {activeChip !== "all" && (
              <span className="ml-1.5 text-gray-300 dark:text-gray-600">
                · tap <strong className="text-gray-500 dark:text-gray-400">All</strong> to see more
              </span>
            )}
          </p>
        </div>

        {/* ── Filter chips — only rendered when more than just "All" exists ── */}
        {visibleChips.length > 1 && (
          <div
            className="flex gap-1.5 mb-3 overflow-x-auto pb-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {visibleChips.map(chip => (
              <button
                key={chip.id}
                onClick={() => setActiveChip(chip.id)}
                className={[
                  "flex-none h-7 px-3 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap",
                  activeChip === chip.id
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500",
                ].join(" ")}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* ── 3-column 9:16 grid ── */}
        {filteredWithIdx.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {filteredWithIdx.map(([v, origIdx]) => (
              <BrowserCard
                key={v.childVenueId ?? origIdx}
                venue={v}
                onClick={() => expand(origIdx)}
              />
            ))}
          </div>
        ) : (
          /* Empty state when an active filter yields nothing */
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <p className="text-gray-400 dark:text-gray-500 font-medium" style={{ fontSize: 13 }}>
              No reels match this filter
            </p>
            <button
              onClick={() => setActiveChip("all")}
              className="mt-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 underline underline-offset-2"
            >
              Show all reels
            </button>
          </div>
        )}
      </div>

      <style>{`
        :root {
          --reel-browser-bg: #FAFAFB;
        }
        .dark {
          --reel-browser-bg: #030712; /* gray-950 */
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
