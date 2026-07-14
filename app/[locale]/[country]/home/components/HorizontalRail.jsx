"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * HorizontalRail
 * ─────────────────────────────────────────────────────────────
 * One shared carousel behaviour for every homepage card row
 * (Recommended, Sponsored, Popular, Recently Viewed, ...).
 *
 * - Desktop/tablet: nav arrows live beside the section title, not
 *   floating over the cards. They only render once the row is
 *   actually scrollable, and disable at each end.
 * - Mobile: no arrows at all — native swipe with momentum + snap.
 * - Track gets vertical padding cancelled by a negative margin on
 *   the wrapper, so card hover lift/shadow/zoom never gets clipped
 *   (overflow-x:auto silently forces overflow-y to "auto" too — a
 *   CSS spec quirk — so the clipping box needs extra room).
 * - Card width is controlled by the caller via `basisClassName`;
 *   the default matches the spec: ~1.3 cards on mobile, 3 on
 *   tablet, 5–6 on desktop, 6–7 on large monitors.
 *
 * Props
 *   title, subtitle, eyebrow  – header copy (eyebrow optional, small label)
 *   count                     – total items, drives "View all" visibility
 *   viewAllCard               – rendered node (e.g. <ViewAllCard onClick={..}/>)
 *                               appended as the last item in the row — the
 *                               caller wires its own onClick — "View all"
 *                               lives in the rail itself, same footprint as
 *                               its siblings, not just a header link
 *   accent                    – colour for eyebrow/arrow hover (hex)
 *   gap                       – Tailwind gap class for the track (default gap-4)
 *   basisClassName            – override the responsive card width classes
 *   children                  – array of pre-rendered card nodes
 */
export default function HorizontalRail({
  title,
  subtitle,
  eyebrow,
  count = 0,
  viewAllCard,
  accent = "#7c3aed",
  gap = "gap-4",
  basisClassName,
  children,
}) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Generous on purpose — sub-pixel layout rounding was tripping canRight
  // into "true" even when every card already fit in view.
  const EPSILON = 24;

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > EPSILON);
    setCanRight(scrollLeft < scrollWidth - clientWidth - EPSILON);
  }, []);

  const items = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, items.length]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!items.length) return null;

  const showViewAll = Boolean(viewAllCard) && (count > items.length || count > 5);
  // "View all" now lives as the trailing card in the row itself.
  const trackItems = showViewAll ? [...items, viewAllCard] : items;
  const isScrollable = canLeft || canRight;
  // 5 cards per view from lg up (was stepping to 6, then 7, on xl/2xl).
  const defaultBasis =
    "basis-[76%] sm:basis-[58%] md:basis-[31%] lg:basis-[calc(20%-13px)]";

  return (
    // flow-root: the track below uses a negative margin (-my-3) to give
    // hover lift/shadow room without adding visible space. Without this,
    // that negative margin collapses straight through this div and the
    // section's own bottom margin, quietly eating into the gap before the next
    // section — flow-root contains margins (a new block-formatting
    // context) without clipping anything the way overflow-hidden would.
    <div className="w-full flow-root">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 mb-6">
        <div className="min-w-0">
          {eyebrow && (
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: accent }}
            >
              {eyebrow}
            </span>
          )}
          <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Arrows — desktop/tablet only, and only when there's something to scroll */}
          {isScrollable && (
            <div className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll(-1)}
                disabled={!canLeft}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                disabled={!canRight}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Track — py-3 gives hover lift/shadow room; -my-3 cancels it visually */}
      <div className="-my-3 -mx-1">
        <div
          ref={trackRef}
          className={`flex ${gap} overflow-x-auto scroll-smooth snap-x snap-mandatory py-3 px-1`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {trackItems.map((child, i) => (
            /* min-w-0 matters here: without it, a flex item's automatic
               minimum size defaults to its content's min-content width, so
               any card whose text (a long venue name/location) doesn't
               truncate cleanly quietly pushes that one card wider than its
               basis% — which is exactly why cards were rendering at
               different widths depending on their content. */
            <div key={i} className={`shrink-0 min-w-0 snap-start ${basisClassName ?? defaultBasis}`}>
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
