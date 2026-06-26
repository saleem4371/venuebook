"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ScrollCarousel
 * Wraps any horizontal-scroll area and adds:
 *  - Left/right fade overlays when more content exists off-screen
 *  - Arrow buttons that appear only when scrollable in that direction
 *
 * Usage:
 *   <ScrollCarousel className="pb-1">
 *     <div className="flex gap-3 w-max">…pills…</div>
 *   </ScrollCarousel>
 *
 * Props:
 *   className  — extra classes applied to the inner scroll container
 *   step       — px scrolled per arrow click (default 260)
 */
export default function ScrollCarousel({ children, className = "", step = 260 }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Give DOM a tick to compute widths before first check
    const t = setTimeout(sync, 60);
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);

    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  const move = (dir) =>
    ref.current?.scrollBy({ left: dir * step, behavior: "smooth" });

  return (
    <div className="relative">
      {/* ── LEFT FADE + ARROW ── */}
      {canLeft && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-white dark:from-gray-950 to-transparent pointer-events-none z-10" />
          <button
            onClick={() => move(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:shadow-lg transition-all duration-150"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* ── SCROLLABLE CONTENT ── */}
      <div
        ref={ref}
        className={`overflow-x-auto ${className}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {/* ── RIGHT FADE + ARROW ── */}
      {canRight && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-white dark:from-gray-950 to-transparent pointer-events-none z-10" />
          <button
            onClick={() => move(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:shadow-lg transition-all duration-150"
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </>
      )}
    </div>
  );
}
