"use client";

/**
 * FilterRow — Airbnb-style compact category strip
 * ─────────────────────────────────────────────────
 * No arrows, anywhere, at any width. Navigation is entirely native
 * scrolling — touch swipe, mouse drag, and horizontal wheel:
 *   • The scroll track always renders at exactly 100% of its column —
 *     from the first chip all the way to the Filters divider, with zero
 *     dead space and zero chance of sliding under the Filters button.
 *     Whenever there are more categories than fit, the chips themselves
 *     simply overflow that full-width edge — a trailing chip ends up
 *     naturally cut off, which is the "there's more to scroll" cue. No
 *     arrow, no gradient, no indicator, and no separate narrower "peek"
 *     box that could leave a gap.
 *   • Native touch scroll, momentum (-webkit-overflow-scrolling: touch),
 *     hidden scrollbar.
 *   • The active chip auto-scrolls into view (never clipped) whenever the
 *     selection changes.
 *   • Skeleton chips (shimmer) while categories are loading — no empty
 *     space — that fade into the real chips once data arrives.
 *   • The Filters button is a fixed-width flex sibling (never inside the
 *     scroll track), so it can never overlap or hide a category chip.
 *
 * Chips are memoized with primitive props (not pre-built JSX) so the strip
 * never re-renders chips that haven't actually changed.
 */

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useCategory } from "@/context/CategoryContext";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

const AWS = (process.env.NEXT_PUBLIC_AWS_BUCKET_URL ?? "").replace(/\/+$/, "");

function buildIconSrc(icon) {
  if (!icon) return null;
  if (/^https?:\/\//i.test(icon)) return icon;
  return `${AWS}/${icon.replace(/^\/+/, "")}`;
}

/*
 * Images render landscape (wider than tall) with object-contain.
 *   IMG_W: 57–72px   IMG_H: 38–44px   (aspect ~1.6:1)
 *   ALL_SIZE: 36–44px square (same height as IMG_H, centers in 60px box)
 *
 * Responsive item horizontal padding: 8px (768px) → 12px (1440px)
 * Responsive item min-width:          80px (768px) → 96px (1440px)
 *
 * Label:      10px (768px) → 11px (1440px)
 */
const IMG_W      = "clamp(57px, calc(2vw + 43px), 72px)";
const IMG_H      = "clamp(38px, calc(0.9vw + 31px), 44px)";
const ALL_SIZE   = "clamp(36px, calc(1.1vw + 27.5px), 44px)";
const LABEL_SIZE = "clamp(10px, calc(0.17vw + 8.55px), 11px)";
const ITEM_PX    = "clamp(8px, calc(0.6vw + 3.4px), 12px)";
const ITEM_MINW  = "clamp(80px, calc(3vw + 60px), 96px)";
const ALL_MINW   = "clamp(60px, calc(3vw + 37px), 80px)";

const ALL_ID = "__all__"; // sentinel key for the "All" chip (ref map + auto-scroll)

/* ── Image with error fallback ─────────────────────────────────────────── */
const CatImage = memo(function CatImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return <DefaultCatIcon />;
  return (
    <img
      src={src} alt={alt}
      onError={() => setFailed(true)}
      style={{ width: IMG_W, height: IMG_H, objectFit: "contain", display: "block", flexShrink: 0 }}
    />
  );
});

/* ── Category / utility strip item ─────────────────────────────────────────
   Primitive props only (strings/booleans/numbers) — no pre-built JSX icon
   element passed in — so React.memo's shallow comparison actually works
   and a chip only re-renders when ITS OWN data changes. */
const Strip = memo(function Strip({
  id,
  active,
  isAll,
  iconSrc,
  label,
  minW = ITEM_MINW,
  accentColor,
  onSelect,
  registerRef,
}) {
  const handleClick = useCallback(() => onSelect(id), [onSelect, id]);
  const setRef = useCallback((node) => registerRef(id, node), [registerRef, id]);

  return (
    <button
      ref={setRef}
      onClick={handleClick}
      style={{ position: "relative", minWidth: minW, paddingLeft: ITEM_PX, paddingRight: ITEM_PX, color: active && accentColor ? accentColor : undefined }}
      className={[
        "flex flex-col items-center flex-shrink-0 cursor-pointer select-none",
        "pt-2 pb-3",
        "transition-colors duration-200",
        active
          ? ""
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
      ].join(" ")}
    >
      {/* Icon wrapper — FIXED 60px height for ALL items (preserves row height + alignment).
          Icon content (landscape image or AllIcon) centers itself inside. Gap→4px. */}
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{
          marginBottom: 4,
          width: "100%",
          height: 60,
          /* Subtle tint bg — does NOT shift layout */
          background: active && accentColor ? `${accentColor}12` : active ? "rgba(124,58,237,0.07)" : "transparent",
          borderRadius: 10,
          transition: "background 0.2s",
          padding: 0,
        }}
      >
        {isAll ? <AllIcon /> : <CatImage src={iconSrc} alt={label ?? ""} />}
      </span>

      {/* Label — scales with viewport, same weight/tracking as before */}
      <span
        style={{ fontSize: LABEL_SIZE }}
        className="font-semibold whitespace-nowrap leading-none tracking-wide"
      >
        {label}
      </span>

      {/* Underline — position:absolute so it never affects layout */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: "18%", right: "18%",
          height: 3,
          borderRadius: "3px 3px 0 0",
          background: active && accentColor ? accentColor : active ? "#7c3aed" : "transparent",
          transition: "background 0.2s",
        }}
      />
    </button>
  );
});

/* ── Skeleton chip — same footprint as a real chip, shimmering ──────────── */
const SkeletonChip = memo(function SkeletonChip({ minW = ITEM_MINW }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col items-center flex-shrink-0 pt-2 pb-3"
      style={{ minWidth: minW, paddingLeft: ITEM_PX, paddingRight: ITEM_PX }}
    >
      <span
        className="vb-shimmer flex-shrink-0"
        style={{ marginBottom: 4, width: "100%", height: 60, borderRadius: 10 }}
      />
      <span className="vb-shimmer" style={{ width: "70%", height: 9, borderRadius: 5 }} />
    </div>
  );
});

/* ── Icons ──────────────────────────────────────────────────────────────── */
function AllIcon() {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ width: ALL_SIZE, height: ALL_SIZE, flexShrink: 0 }}
    >
      <rect x="2"  y="2"  width="9" height="9" rx="2.5" fill="currentColor"/>
      <rect x="13" y="2"  width="9" height="9" rx="2.5" fill="currentColor" opacity="0.65"/>
      <rect x="2"  y="13" width="9" height="9" rx="2.5" fill="currentColor" opacity="0.65"/>
      <rect x="13" y="13" width="9" height="9" rx="2.5" fill="currentColor" opacity="0.35"/>
    </svg>
  );
}

function DefaultCatIcon() {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ width: IMG_W, height: IMG_H, flexShrink: 0 }}
    >
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  );
}

/* ── FilterRow ──────────────────────────────────────────────────────────── */
export default function FilterRow({
  selectedCategory,
  setSelectedCategory,
  loadData = [],
  onFilterOpen,
  isLoading = false,
}) {
  const { activeCategory } = useCategory();
  const tint = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const accent = tint.hex;

  const scrollRef  = useRef(null);

  // Stable selection handler (functional update, no stale closure — and a
  // stable reference so memoized Strips don't re-render on selection
  // changes elsewhere). Clicking "All" clears the filter; clicking the
  // already-active category also clears it (toggle-off), same as before.
  const onChipSelect = useCallback((id) => {
    if (id === ALL_ID) {
      setSelectedCategory(null);
      return;
    }
    setSelectedCategory((prev) => (prev === id ? null : id));
  }, [setSelectedCategory]);

  /* ── Chip DOM refs, keyed by id (ALL_ID for "All") — used to scroll the
     active chip into view. ── */
  const chipRefs = useRef({});
  const registerRef = useCallback((id, node) => {
    if (node) chipRefs.current[id] = node;
    else delete chipRefs.current[id];
  }, []);

  /* ── Overflow-aware chip width ────────────────────────────────────────────
     The track's own width always stays 100% of its column (see below —
     that's what keeps this bug-free). What CAN flex a little, per the
     product ask, is the category chips' own width: when there are more
     categories than fit, nudge their width slightly so the trailing chip
     that gets cut off by the track's natural edge sits at ~50% visible —
     a clear, unmistakable "there's more to scroll" cue — instead of
     leaving it to chance (which can land anywhere from a sliver to nearly
     full).

     Natural chip width is computed analytically from the same clamp()
     formula the CSS uses (IMG/ITEM_MINW), rather than measured off the
     DOM — measuring the DOM would read back whatever override was applied
     on a previous pass, corrupting later recalculations. The adjustment
     itself is clamped to ±20% of that natural size so chips never look
     cramped or stretched thin. Applies at any width (mobile or desktop —
     there are no arrows anywhere anymore, so both need the same cue). ── */
  const [chipWidth, setChipWidth] = useState(null);

  const recomputeChipWidth = useCallback(() => {
    if (typeof window === "undefined" || isLoading || loadData.length === 0) {
      setChipWidth(null);
      return;
    }
    const track = scrollRef.current;
    if (!track) return;

    const available = track.clientWidth;
    if (!available) return;

    const vw   = window.innerWidth;
    const GAP  = 2;
    // Same clamp() math as ALL_MINW / ITEM_MINW in CSS.
    const allNatural  = Math.min(80, Math.max(60, vw * 0.03 + 37));
    const itemNatural = Math.min(96, Math.max(80, vw * 0.03 + 60));

    const remaining = available - allNatural - GAP;
    if (remaining <= 0) {
      setChipWidth(null);
      return;
    }

    const naturalPitch = itemNatural + GAP;
    const n    = remaining / naturalPitch;
    const frac = n - Math.floor(n);

    // Nothing overflows, or the natural cut is already a good clear ~half
    // — leave chip sizing exactly as designed.
    if (n <= 1 || (frac >= 0.4 && frac <= 0.6)) {
      setChipWidth(null);
      return;
    }

    const targetN     = Math.max(0.5, Math.floor(n) + 0.5);
    const targetWidth = remaining / targetN - GAP;
    const clamped     = Math.max(itemNatural * 0.8, Math.min(itemNatural * 1.2, targetWidth));
    setChipWidth(Math.round(clamped));
  }, [isLoading, loadData]);

  useEffect(() => {
    recomputeChipWidth();
    window.addEventListener("resize", recomputeChipWidth);
    window.addEventListener("orientationchange", recomputeChipWidth);
    return () => {
      window.removeEventListener("resize", recomputeChipWidth);
      window.removeEventListener("orientationchange", recomputeChipWidth);
    };
  }, [recomputeChipWidth]);

  /* ── Auto-scroll the active chip fully into view whenever selection
     changes — never leaves it clipped at either edge. ── */
  useEffect(() => {
    const id = selectedCategory ?? ALL_ID;
    const node = chipRefs.current[id];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [selectedCategory, loadData, isLoading]);

  /* ── Mouse drag-to-scroll (desktop) ── */
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };
  const onMouseMove = (e) => {
    if (!drag.current.active) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX);
  };
  const onMouseUp = () => {
    drag.current.active = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.userSelect = "";
    }
  };

  // NOTE: no custom wheel handler. `overflow-x: auto` already scrolls this
  // strip natively on a genuinely horizontal wheel/trackpad gesture — and
  // critically, a normal VERTICAL mouse-wheel scroll is left completely
  // alone (no preventDefault, no redirect into horizontal movement) so it
  // bubbles up and scrolls the page/listings exactly as if this row
  // weren't here. Category scroll and listing scroll are independent.

  const skeletonChips = useMemo(
    () => Array.from({ length: 6 }, (_, i) => <SkeletonChip key={i} />),
    [],
  );

  return (
    <div className="flex items-stretch bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <style>{`
        .vb-strip::-webkit-scrollbar{display:none}
        @keyframes vbShimmer {
          0%   { background-position: 150% 0; }
          100% { background-position: -150% 0; }
        }
        .vb-shimmer {
          display: block;
          background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%);
          background-size: 400% 100%;
          animation: vbShimmer 1.4s ease-in-out infinite;
        }
        .dark .vb-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.07) 25%, rgba(255,255,255,0.14) 37%, rgba(255,255,255,0.07) 63%);
          background-size: 400% 100%;
        }
        @keyframes vbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .vb-fade-in { animation: vbFadeIn 0.25s ease; }
      `}</style>

      {/* ── Scrollable strip — no arrows, ever ── */}
      <div className="relative flex-1 min-w-0">

        {isLoading ? (
          /* ── Skeleton state — same footprint, no empty space ── */
          <div
            className="flex min-w-0 bg-white dark:bg-gray-950 px-1"
            style={{ overflow: "hidden", gap: 2, alignItems: "stretch" }}
          >
            {skeletonChips}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="vb-strip vb-fade-in flex min-w-0 bg-white dark:bg-gray-950 px-1"
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth",
              // Isolates this strip's scroll from the page/listing scroll:
              // `touchAction: pan-x` tells the browser only horizontal
              // touch gestures belong to this element — a vertical or
              // diagonal swipe that starts here is handed to the page
              // instead of being fought over. `overscrollBehavior:
              // contain` stops horizontal scroll-chaining at the strip's
              // start/end edges from bleeding into any ancestor scroll.
              touchAction: "pan-x",
              overscrollBehavior: "contain",
              gap: 2,
              alignItems: "stretch",
              cursor: "grab",
              // Always exactly 100% of the flex-1 column (never narrower,
              // never wider) — the track reaches all the way from the
              // first chip to the Filters divider with zero dead space,
              // and can never spill under the Filters button either. The
              // "there's more" cue comes from the chips themselves simply
              // overflowing that full-width edge, not from resizing the
              // track.
              width: "100%",
              maxWidth: "100%",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <Strip
              id={ALL_ID}
              isAll
              active={selectedCategory === null}
              onSelect={onChipSelect}
              registerRef={registerRef}
              label="All"
              minW={ALL_MINW}
              accentColor={accent}
            />

            {loadData.map((cat) => (
              <Strip
                key={cat.id}
                id={cat.id}
                active={selectedCategory === cat.id}
                onSelect={onChipSelect}
                registerRef={registerRef}
                iconSrc={buildIconSrc(cat.icon)}
                label={cat.name}
                minW={chipWidth != null ? `${chipWidth}px` : ITEM_MINW}
                accentColor={accent}
              />
            ))}

            {/* End padding — guarantees that scrolling all the way right
                fully reveals the last category with breathing room, never
                flush against (or hidden behind) the Filters button. */}
            <div aria-hidden="true" style={{ flexShrink: 0, width: 16 }} />
          </div>
        )}
      </div>

      {/* ── Filters — glass pill, clearly an action ───────────────── */}
      <div className="flex-shrink-0 flex items-stretch border-l border-gray-100 dark:border-gray-800">
        <button
          onClick={onFilterOpen}
          className="flex flex-col items-center justify-center flex-shrink-0 cursor-pointer select-none pt-2 pb-3 px-4 transition-all duration-200 group"
          style={{ minWidth: 72 }}
        >
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{
              marginBottom: 4,
              background: `${accent}0f`,
              border: `1px solid ${accent}26`,
              borderRadius: 10,
              padding: "6px 8px",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              transition: "all 0.2s",
            }}
          >
            <SlidersHorizontal
              size={22}
              strokeWidth={1.75}
              style={{ color: accent }}
            />
          </span>
          <span
            style={{ fontSize: LABEL_SIZE, color: accent }}
            className="font-semibold whitespace-nowrap leading-none tracking-wide"
          > 
            Filters 
          </span>
        </button>
      </div>
    </div>
  );
}
