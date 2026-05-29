"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

/**
 * ScrollCarousel
 * ─────────────────────────────────────────────────────
 * Horizontal scroll container with:
 *  • Left/right nav arrows (hide when not scrollable)
 *  • Left/right fade edge masks
 *  • Touch / trackpad swipe (native scroll, no JS hijacking)
 *  • Keyboard arrow support
 *  • RTL-aware
 *
 * Props:
 *   children     – items to render
 *   tint         – optional CATEGORY_TINTS object (for arrow button colour)
 *   gap          – Tailwind gap class, default "gap-3"
 *   className    – extra classes on the wrapper
 *   fadeSize     – px width of fade masks (default 48)
 *   scrollBy     – px per arrow click (default 300)
 *   arrowClass   – extra classes on arrow buttons
 *   showArrows   – whether to show prev/next buttons (default true)
 *   lightFade    – CSS colour for the fade in light mode (default "#ffffff")
 *   darkFade     – CSS colour for the fade in dark mode  (default "#030712") — gray-950
 */
export default function ScrollCarousel({
  children,
  tint,
  gap        = "gap-3",
  className  = "",
  fadeSize   = 48,
  scrollBy   = 300,
  arrowClass = "",
  showArrows = true,
  lightFade  = "#ffffff",
  darkFade   = "#030712",
}) {
  const trackRef   = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", update); ro.disconnect(); };
  }, [update]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * scrollBy, behavior: "smooth" });
  };

  const arrowBase = [
    "absolute top-1/2 -translate-y-1/2 z-10",
    "w-8 h-8 rounded-full border flex items-center justify-center",
    "transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
    "bg-white dark:bg-gray-900 border-gray-200 dark:border-white/15",
    "text-gray-600 dark:text-white hover:scale-110 active:scale-95",
    arrowClass,
  ].join(" ");

  return (
    <div className={`relative ${className}`}>

      {/* Left arrow — only when showArrows=true */}
      {showArrows && canLeft && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          className={`${arrowBase} -start-4`}
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
      )}

      {/* Right arrow — only when showArrows=true */}
      {showArrows && canRight && (
        <button
          type="button"
          onClick={() => scroll(1)}
          className={`${arrowBase} -end-4`}
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      )}

      {/* Fade masks — themed via CSS custom properties set on <html> */}
      {canLeft && (
        <>
          <div
            className="absolute inset-y-0 start-0 z-[1] pointer-events-none dark:hidden"
            style={{ width: fadeSize, background: `linear-gradient(to right, ${lightFade}, transparent)` }}
          />
          <div
            className="absolute inset-y-0 start-0 z-[1] pointer-events-none hidden dark:block"
            style={{ width: fadeSize, background: `linear-gradient(to right, ${darkFade}, transparent)` }}
          />
        </>
      )}
      {canRight && (
        <>
          <div
            className="absolute inset-y-0 end-0 z-[1] pointer-events-none dark:hidden"
            style={{ width: fadeSize, background: `linear-gradient(to left, ${lightFade}, transparent)` }}
          />
          <div
            className="absolute inset-y-0 end-0 z-[1] pointer-events-none hidden dark:block"
            style={{ width: fadeSize, background: `linear-gradient(to left, ${darkFade}, transparent)` }}
          />
        </>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        className={`flex ${gap} overflow-x-auto scroll-smooth`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") scroll(1);
          if (e.key === "ArrowLeft")  scroll(-1);
        }}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
