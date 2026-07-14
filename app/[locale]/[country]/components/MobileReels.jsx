"use client";

/**
 * MobileReels — Fullscreen vertical snap-scroll reels for mobile.
 * Uses CSS scroll-snap + IntersectionObserver for autoplay.
 * Feels like a premium property discovery feed.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clapperboard } from "lucide-react";
import ReelCard from "./ReelCard";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

const PRELOAD_AHEAD = 1; // only current + prev + next (point 9: performance)
const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL ?? "";

function getVenueCover(venue) {
  const img = (venue?.images ?? [])[0];
  if (!img) return null;
  return typeof img === "string"
    ? (img.startsWith("http") ? img : `${BASE_URL}/${img}`)
    : (img?.image || img?.url || null);
}

/** Small "Up Next" preview card shown near the end of a reel */
function MobileUpNextCard({ venue, onClick }) {
  const cover = getVenueCover(venue);
  return (
    <button
      onClick={onClick}
      className="text-left overflow-hidden"
      style={{
        width: 136,
        borderRadius: 14,
        background: "rgba(12,12,12,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.55)",
      }}
    >
      <p style={{
        fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.4)", padding: "8px 10px 4px",
      }}>
        Up Next
      </p>
      {cover
        ? <img src={cover} alt="" className="w-full object-cover" style={{ height: 68, display: "block" }} />
        : <div className="w-full bg-gray-800" style={{ height: 68 }} />
      }
      <div style={{ padding: "8px 10px 10px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.3,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {venue.title || venue.venueName || "Next Property"}
        </p>
      </div>
    </button>
  );
}

export default function MobileReels({
  open,
  onClose,
  venues = [],
  category,
  locale,
  country,
  wishlist = [],
  compares = [],
  onWishlist,
  onCompare,
  startIndex = 0,
}) {
  const scrollRef   = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress,  setProgress]  = useState(0);
  const accent      = CATEGORY_TINTS[category]?.hex ?? "#7c3aed";

  // Reset progress whenever the active reel changes
  useEffect(() => { setProgress(0); }, [activeIdx]);

  const scrollToNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.querySelector(`[data-reel-idx="${activeIdx + 1}"]`);
    target?.scrollIntoView({ behavior: "smooth" });
  }, [activeIdx]);

  // Scroll to the correct reel when opened (supports resume-from-position)
  useEffect(() => {
    if (!open) return;
    const idx = startIndex ?? 0;
    setActiveIdx(idx);
    setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (idx === 0) {
        el.scrollTo({ top: 0, behavior: "instant" });
      } else {
        el.querySelector(`[data-reel-idx="${idx}"]`)
          ?.scrollIntoView({ behavior: "instant" });
      }
    }, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startIndex]);

  // IntersectionObserver: track which reel is visible
  useEffect(() => {
    if (!open || !scrollRef.current) return;
    const items = scrollRef.current.querySelectorAll("[data-reel-idx]");
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.reelIdx);
            setActiveIdx(idx);
          }
        });
      },
      { root: scrollRef.current, threshold: 0.65 }
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [open, venues.length]);

  // Pass activeIdx so the caller (e.g. GlobalMobileReels) can save position for smart resume
  const handleClose = useCallback(() => { onClose?.(activeIdx); }, [onClose, activeIdx]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-reels"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="fixed inset-0 z-50 bg-black"
          style={{ touchAction: "pan-y" }}
        >
          {/* Close button — top-LEFT so it never overlaps wishlist/compare buttons (top-right) */}
          <button
            onClick={handleClose}
            className="absolute z-30 w-11 h-11 rounded-full flex items-center justify-center"
            style={{ top: "max(20px, env(safe-area-inset-top, 20px))", left: "max(16px, env(safe-area-inset-left, 16px))", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
            aria-label="Close reels"
          >
            <ArrowLeft size={20} className="text-white" strokeWidth={2.5} />
          </button>

          {/* Up Next — slides in from right during final 15% of reel */}
          <AnimatePresence>
            {progress > 0.85 && venues[activeIdx + 1] && (
              <motion.div
                key={`upnext-${activeIdx}`}
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 60, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute z-30"
                style={{
                  right: 16,
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 108px)",
                }}
              >
                <MobileUpNextCard
                  venue={venues[activeIdx + 1]}
                  onClick={scrollToNext}
                />
              </motion.div>
            )}
          </AnimatePresence>



          {/* Empty state */}
          {venues.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <Clapperboard size={48} className="text-gray-700" strokeWidth={1.5} />
              <p className="text-[15px] font-semibold text-gray-400">No results to show</p>
              <p className="text-[13px] text-gray-600">Try adjusting your filters or map area</p>
              <button
                onClick={handleClose}
                className="mt-4 h-11 px-6 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: accent }}
              >
                Back to Listings
              </button>
            </div>
          )}

          {/* Snap scroll container */}
          {venues.length > 0 && (
            <div
              ref={scrollRef}
              className="w-full h-full overflow-y-scroll"
              style={{
                scrollSnapType: "y mandatory",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
            >
              {venues.map((venue, idx) => {
                const shouldRender = Math.abs(idx - activeIdx) <= PRELOAD_AHEAD;
                const liked    = wishlist.some(w => w.venue_id === venue.childVenueId);
                const compared = compares.some(c => c.childVenueId === venue.childVenueId);

                return (
                  <div
                    key={venue.childVenueId ?? idx}
                    data-reel-idx={idx}
                    style={{
                      height: "100dvh",
                      scrollSnapAlign: "start",
                      scrollSnapStop: "always",
                      flexShrink: 0,
                    }}
                  >
                    {shouldRender ? (
                      <ReelCard
                        venue={venue}
                        category={category}
                        locale={locale}
                        country={country}
                        liked={liked}
                        isCompared={compared}
                        onWishlist={onWishlist}
                        onCompare={onCompare}
                        active={idx === activeIdx}
                        onProgress={idx === activeIdx ? setProgress : undefined}
                      />
                    ) : (
                      /* Lightweight placeholder while not in render window */
                      <div className="w-full h-full bg-gray-950 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

                  </motion.div>
      )}
    </AnimatePresence>
  );
}
