"use client";

/**
 * ReelFeedPanel — Desktop vertical snap-scroll reel discovery feed.
 *
 * Replaces the old single-reel ReelsPanel in the search page right panel.
 *
 * Design:
 *  - Each reel card = ~83% of panel height → next reel always peeks at bottom
 *  - CSS scroll-snap (mandatory, always-stop) → one reel per scroll step
 *  - Scroll events are isolated: wheel inside feed never scrolls the listings
 *  - Hover: slight scale + deeper shadow — communicates interactivity
 *  - Expand button (top-left, hover-reveal) → opens universal ReelViewer fullscreen
 *  - Double-click anywhere on card → same fullscreen expand
 *  - Muted state is lifted so it persists across reel navigation
 *  - Virtual rendering: only ±2 cards from active actually mount (GPU-friendly)
 *  - IntersectionObserver drives active index → autoplay for visible reel only
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Clapperboard, Maximize2, ChevronUp, ChevronDown } from "lucide-react";
import ReelCard from "./ReelCard";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
import { useReelViewer } from "@/context/ReelViewerContext";

const RENDER_WINDOW = 2; // mount ±N from active index

const BTN_SM = {
  width: 34, height: 34, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(0,0,0,0.58)", backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer",
};

export default function ReelFeedPanel({
  venues = [],
  category,
  locale,
  country,
  wishlist = [],
  compares = [],
  onWishlist,
  onCompare,
}) {
  const scrollRef   = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted,     setMuted]     = useState(true);
  const { openViewer } = useReelViewer();

  /* ── Isolated scroll: stop wheel bubbling to the listings column ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = e => e.stopPropagation();
    el.addEventListener("wheel", handler, { passive: true });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  /* ── IntersectionObserver: which card is most visible ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !venues.length) return;
    const items = el.querySelectorAll("[data-feed-reel-idx]");
    if (!items.length) return;

    const observer = new IntersectionObserver(
      entries => {
        let best = null, bestRatio = 0;
        entries.forEach(entry => {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = entry.target;
          }
        });
        if (best && bestRatio >= 0.45) {
          setActiveIdx(Number(best.dataset.feedReelIdx));
        }
      },
      { root: el, threshold: [0, 0.45, 0.75, 1] },
    );
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [venues.length]);

  /* ── Programmatic scroll helper ── */
  const scrollToIdx = useCallback(idx => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.querySelector(`[data-feed-reel-idx="${idx}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* ── Keyboard nav (only when feed is focused) ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = e => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToIdx(Math.min(venues.length - 1, activeIdx + 1));
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToIdx(Math.max(0, activeIdx - 1));
      }
      if (e.key === "Home") { e.preventDefault(); scrollToIdx(0); }
      if (e.key === "End")  { e.preventDefault(); scrollToIdx(venues.length - 1); }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [activeIdx, venues.length, scrollToIdx]);

  /* ── Open fullscreen viewer ── */
  const handleExpand = useCallback(idx => {
    openViewer({
      venues, startIndex: idx, category, locale, country,
      wishlist, compares, onWishlist, onCompare,
    });
  }, [venues, category, locale, country, wishlist, compares, onWishlist, onCompare, openViewer]);

  /* ── Empty state ── */
  if (venues.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-950 select-none">
        <Clapperboard size={36} className="text-gray-700" strokeWidth={1.5} />
        <p className="text-[13px] text-gray-500 font-medium">No reels available yet</p>
        <p className="text-[11px] text-gray-600">Cover images shown as reels</p>
      </div>
    );
  }

  const accent = CATEGORY_TINTS[category]?.hex ?? "#7c3aed";

  return (
    <div className="relative w-full h-full bg-gray-950 overflow-hidden">

      {/* ── SNAP SCROLL CONTAINER ── */}
      <div
        ref={scrollRef}
        tabIndex={0}
        className="w-full h-full overflow-y-scroll focus:outline-none"
        style={{
          scrollSnapType: "y mandatory",
          overscrollBehavior: "contain",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Leading gap so first card doesn't feel flush to the toggle bar */}
        <div style={{ height: 10, scrollSnapAlign: "none", flexShrink: 0 }} />

        {venues.map((venue, idx) => {
          const inWindow  = Math.abs(idx - activeIdx) <= RENDER_WINDOW;
          const isActive  = idx === activeIdx;
          const liked     = wishlist.some(w => w.venue_id === venue?.childVenueId);
          const compared  = compares.some(c => c.childVenueId === venue?.childVenueId);

          return (
            /*
             * Slot: 83% of panel height so the next reel always peeks below.
             * Panel height ≈ calc(100vh - 128px) [72px nav + 56px toggle].
             * Each slot = calc(0.83 × (100vh − 128px)) ≈ calc(83vh − 106px).
             */
            <div
              key={venue.childVenueId ?? idx}
              data-feed-reel-idx={idx}
              style={{
                height: "calc(83vh - 106px)",
                minHeight: 300,
                padding: "0 12px 12px 12px",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                flexShrink: 0,
              }}
            >
              {/* Card: rounded corners + elevated shadow + hover scale */}
              <div
                className="relative w-full h-full rounded-2xl overflow-hidden group cursor-pointer"
                style={{
                  boxShadow: isActive
                    ? `0 12px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)`
                    : `0 6px 24px rgba(0,0,0,0.40), 0 1px 4px rgba(0,0,0,0.25)`,
                  transition: "box-shadow 0.3s ease, transform 0.3s ease",
                  transform: "translateZ(0)", // GPU layer
                  willChange: "transform",
                }}
                /* Subtle scale on hover — feels premium, not bouncy */
                onMouseEnter={e  => { e.currentTarget.style.transform = "scale(1.012) translateZ(0)"; }}
                onMouseLeave={e  => { e.currentTarget.style.transform = "scale(1) translateZ(0)"; }}
                onDoubleClick={() => handleExpand(idx)}
              >
                {inWindow ? (
                  <ReelCard
                    venue={venue}
                    category={category}
                    locale={locale}
                    country={country}
                    liked={liked}
                    isCompared={compared}
                    onWishlist={onWishlist}
                    onCompare={onCompare}
                    active={isActive}
                    controlledMuted={muted}
                    onMuteChange={setMuted}
                    compact={false}
                  />
                ) : (
                  /* Lightweight placeholder — thumbnail only, no video */
                  <div className="absolute inset-0 bg-gray-900">
                    {(() => {
                      const img = (venue.images ?? [])[0];
                      const src = typeof img === "string"
                        ? (img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL ?? ""}/${img}`)
                        : img?.image || img?.url || null;
                      return src ? (
                        <img src={src} className="w-full h-full object-cover opacity-40" loading="lazy" alt="" />
                      ) : null;
                    })()}
                  </div>
                )}

                {/*
                  Expand button — top-left, hidden until hover.
                  z-[30] sits above ReelCard's tap-zone (z-4) so clicks register
                  on the button, not the tap zone.
                  stopPropagation prevents the double-click handler from also firing.
                */}
                <button
                  onClick={e => { e.stopPropagation(); handleExpand(idx); }}
                  className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto hover:scale-110 active:scale-90 transition-transform"
                  style={{ ...BTN_SM, zIndex: 30 }}
                  title="Open fullscreen"
                  aria-label="Open fullscreen viewer"
                >
                  <Maximize2 size={13} className="text-white" strokeWidth={2} />
                </button>

                {/* Active indicator — thin accent line at card top */}
                {isActive && (
                  <div
                    className="absolute top-0 inset-x-0 pointer-events-none"
                    style={{ zIndex: 29, height: 2.5, background: accent, opacity: 0.85 }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Trailing gap */}
        <div style={{ height: 12, flexShrink: 0 }} />
      </div>

      {/* ── NAV ARROWS — right edge of panel ── */}
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto"
        style={{ zIndex: 30 }}
      >
        <button
          onClick={() => scrollToIdx(Math.max(0, activeIdx - 1))}
          disabled={activeIdx === 0}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-all disabled:opacity-20 hover:scale-105 active:scale-90"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.14)" }}
          aria-label="Previous reel"
        >
          <ChevronUp size={17} className="text-white" />
        </button>
        <button
          onClick={() => scrollToIdx(Math.min(venues.length - 1, activeIdx + 1))}
          disabled={activeIdx === venues.length - 1}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-all disabled:opacity-20 hover:scale-105 active:scale-90"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.14)" }}
          aria-label="Next reel"
        >
          <ChevronDown size={17} className="text-white" />
        </button>
      </div>

      {/* ── SCROLL HINT — only visible when first reel is active ── */}
      {activeIdx === 0 && venues.length > 1 && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none animate-bounce"
          style={{ zIndex: 30, opacity: 0.45 }}
        >
          <ChevronDown size={16} className="text-white" />
          <span className="text-[9px] font-semibold text-white tracking-widest uppercase">Scroll</span>
        </div>
      )}
    </div>
  );
}
