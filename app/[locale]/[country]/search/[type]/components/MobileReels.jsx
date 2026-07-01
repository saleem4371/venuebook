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

const PRELOAD_AHEAD = 2; // preload images N reels ahead

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
}) {
  const scrollRef   = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const accent      = CATEGORY_TINTS[category]?.hex ?? "#7c3aed";

  // Reset to top when opened
  useEffect(() => {
    if (open) {
      setActiveIdx(0);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
      }, 50);
    }
  }, [open]);

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

  const handleClose = useCallback(() => { onClose?.(); }, [onClose]);

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
