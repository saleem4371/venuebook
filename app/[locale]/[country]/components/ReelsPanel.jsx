"use client";

/**
 * ReelsPanel — Desktop right-panel reels
 * One reel fills the panel. Wheel / arrows / keyboard navigate one at a time.
 * Framer Motion slide + fade between reels (direction-aware).
 * Muted state lifted here so it survives reel navigation.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, ChevronDown, Clapperboard } from "lucide-react";
import ReelCard from "./ReelCard";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

// ── Slide + subtle scale — matches mobile reel feel ──────────────────────────
const TRANSITION = {
  type: "tween",
  duration: 0.26,
  ease: [0.25, 0.46, 0.45, 0.94],
};

const variants = {
  enter: (dir) => ({
    y: dir >= 0 ? "100%" : "-100%",
    opacity: 0.6,
    scale: 0.97,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: TRANSITION,
  },
  exit: (dir) => ({
    y: dir >= 0 ? "-100%" : "100%",
    opacity: 0.4,
    scale: 0.97,
    transition: TRANSITION,
  }),
};

export default function ReelsPanel({
  venues = [],
  category,
  locale,
  country,
  wishlist = [],
  compares = [],
  onWishlist,
  onCompare,
}) {
  const [[activeIdx, dir], setPage] = useState([0, 0]);
  const containerRef = useRef(null);
  const muteRef      = useRef(true);
  const [muted, setMuted] = useState(true);
  const accent = CATEGORY_TINTS[category]?.hex ?? "#7c3aed";

  // Clamp on venues change
  useEffect(() => {
    setPage(([i]) => [Math.min(i, Math.max(0, venues.length - 1)), 0]);
  }, [venues.length]);

  const go = useCallback((delta) => {
    setPage(([i]) => {
      const next = Math.max(0, Math.min(venues.length - 1, i + delta));
      if (next === i) return [i, 0];
      return [next, delta];
    });
  }, [venues.length]);

  const handleMuteToggle = useCallback((val) => {
    muteRef.current = val;
    setMuted(val);
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); go(1); }
      if (e.key === "ArrowUp")   { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);

  // Non-passive wheel — isolates from listings column, one reel per scroll
  const throttle = useRef(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (throttle.current) return;
      throttle.current = true;
      go(e.deltaY > 0 ? 1 : -1);
      setTimeout(() => { throttle.current = false; }, 550);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [go]);

  if (venues.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-950 select-none">
        <Clapperboard size={36} className="text-gray-700" strokeWidth={1.5} />
        <p className="text-[13px] text-gray-500 font-medium">No reels available yet</p>
        <p className="text-[11px] text-gray-600">Cover images shown as reels</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden select-none"
    >
      {/* ── ANIMATED REEL (direction-aware slide + fade) ── */}
      <AnimatePresence initial={false} custom={dir} mode="sync">
        <motion.div
          key={activeIdx}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          style={{ willChange: "transform, opacity" }}
        >
          {(() => {
            const venue    = venues[activeIdx];
            const liked    = wishlist.some(w => w.venue_id === venue?.childVenueId);
            const compared = compares.some(c => c.childVenueId === venue?.childVenueId);
            return (
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
                onMuteChange={handleMuteToggle}
              />
            );
          })()}
        </motion.div>
      </AnimatePresence>

      {/* Preload ±1 off-screen to avoid cold-start on next reel */}
      {[activeIdx - 1, activeIdx + 1].map((idx) => {
        if (idx < 0 || idx >= venues.length) return null;
        const v       = venues[idx];
        const liked   = wishlist.some(w => w.venue_id === v?.childVenueId);
        const compared = compares.some(c => c.childVenueId === v?.childVenueId);
        return (
          <div key={`pre-${idx}`} className="absolute inset-0 pointer-events-none"
            style={{ visibility: "hidden" }}>
            <ReelCard
              venue={v} category={category} locale={locale} country={country}
              liked={liked} isCompared={compared}
              onWishlist={onWishlist} onCompare={onCompare}
              active={false}
              controlledMuted={muted}
              onMuteChange={handleMuteToggle}
            />
          </div>
        );
      })}

      {/* ── NAV ARROWS ── */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30 pointer-events-auto">
        <button
          onClick={() => go(-1)}
          disabled={activeIdx === 0}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105 active:scale-90"
          style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(8px)" }}
          aria-label="Previous reel"
        >
          <ChevronUp size={18} className="text-white" />
        </button>
        <button
          onClick={() => go(1)}
          disabled={activeIdx === venues.length - 1}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105 active:scale-90"
          style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(8px)" }}
          aria-label="Next reel"
        >
          <ChevronDown size={18} className="text-white" />
        </button>
      </div>

      {/* ── COUNTER ── */}
      <div className="absolute z-20 pointer-events-none tabular-nums"
        style={{ right: 14, top: "calc(50% + 58px)" }}>
        <span className="text-[10px] font-semibold text-white/40">
          {activeIdx + 1}/{venues.length}
        </span>
      </div>
    </div>
  );
}
