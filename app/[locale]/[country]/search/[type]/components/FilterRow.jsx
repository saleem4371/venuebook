"use client";

/**
 * FilterRow — Airbnb-style compact category strip
 * ─────────────────────────────────────────────────
 * • No active-item jumping — padding identical for active/inactive
 * • Overflow arrows (glass, fade in/out) on desktop + tablet
 * • Mouse drag-to-scroll + wheel support
 * • Filters: glass pill, stands out without breaking rhythm
 *
 * ONLY change vs original: icon image and label scale with viewport
 * via clamp() — all layout, spacing, and structure is unchanged.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
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
 * Arrow size: 32px (768px) → 40px (1440px)
 * Label:      10px (768px) → 11px (1440px)
 */
const IMG_W      = "clamp(57px, calc(2vw + 43px), 72px)";
const IMG_H      = "clamp(38px, calc(0.9vw + 31px), 44px)";
const ALL_SIZE   = "clamp(36px, calc(1.1vw + 27.5px), 44px)";
const LABEL_SIZE = "clamp(10px, calc(0.17vw + 8.55px), 11px)";
const ITEM_PX    = "clamp(8px, calc(0.6vw + 3.4px), 12px)";
const ITEM_MINW  = "clamp(80px, calc(3vw + 60px), 96px)";
const ALL_MINW   = "clamp(60px, calc(3vw + 37px), 80px)";
const ARROW_SZ   = "clamp(32px, calc(1.2vw + 23px), 40px)";

/* ── Image with error fallback ─────────────────────────────────────────── */
function CatImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return <DefaultCatIcon />;
  return (
    <img
      src={src} alt={alt}
      onError={() => setFailed(true)}
      style={{ width: IMG_W, height: IMG_H, objectFit: "contain", display: "block", flexShrink: 0 }}
    />
  );
}

/* ── Category / utility strip item ─────────────────────────────────────── */
function Strip({ active, onClick, icon, label, minW = ITEM_MINW, accentColor }) {
  return (
    <button
      onClick={onClick}
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
        {icon}
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
}

/* ── Overflow arrow button ──────────────────────────────────────────────── */
function Arrow({ direction, onClick, visible }) {
  return (
    <button
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
      onClick={onClick}
      style={{
        position: "absolute",
        top: "50%",
        transform: visible
          ? "translateY(-50%) scale(1)"
          : "translateY(-50%) scale(0.85)",
        [direction]: 6,
        zIndex: 10,
        width: ARROW_SZ, height: ARROW_SZ,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--arrow-bg, rgba(255,255,255,0.88))",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "var(--arrow-shadow, 0 1px 8px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.05))",
        border: "var(--arrow-border, 1px solid rgba(0,0,0,0.08))",
        cursor: "pointer",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.22s ease, transform 0.22s ease, box-shadow 0.18s ease",
        color: "var(--arrow-color, #374151)",
      }}
      className="vb-arrow"
      onMouseEnter={(e) => {
        if (!visible) return;
        e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
        e.currentTarget.style.boxShadow = "var(--arrow-shadow-hover, 0 4px 14px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        e.currentTarget.style.boxShadow = "var(--arrow-shadow, 0 1px 8px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.05))";
      }}
    >
      {direction === "left"
        ? <ChevronLeft size={15} strokeWidth={2.2} />
        : <ChevronRight size={15} strokeWidth={2.2} />
      }
    </button>
  );
}

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
export default function FilterRow({ selectedCategory, setSelectedCategory, loadData = [], onFilterOpen }) {
  const { activeCategory } = useCategory();
  const tint = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const accent = tint.hex;
  const toggle = (id) => setSelectedCategory(selectedCategory === id ? null : id);

  const scrollRef  = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  /* ── Track scroll position to show/hide arrows ── */
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll, loadData]);

  /* ── Arrow click scroll ── */
  const scrollBy = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  /* ── Mouse drag-to-scroll ── */
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

  /* ── Horizontal mouse-wheel ── */
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    scrollRef.current?.scrollBy({ left: e.deltaY * 1.5 });
  };

  return (
    <div className="flex items-stretch bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <style>{`
        .vb-strip::-webkit-scrollbar{display:none}
        .dark .vb-arrow {
          --arrow-bg: rgba(30,30,40,0.82);
          --arrow-border: 1px solid rgba(255,255,255,0.10);
          --arrow-shadow: 0 1px 8px rgba(0,0,0,0.28), 0 1px 3px rgba(0,0,0,0.18);
          --arrow-shadow-hover: 0 4px 14px rgba(0,0,0,0.38), 0 1px 4px rgba(0,0,0,0.22);
          --arrow-color: #e5e7eb;
        }
      `}</style>

      {/* ── Scrollable strip — position:relative so arrows are scoped to it ── */}
      <div className="relative flex-1 min-w-0">

        {/* Overflow arrows — inside scroll area, never touching Filters */}
        <Arrow direction="left"  onClick={() => scrollBy(-1)} visible={canLeft}  />
        <Arrow direction="right" onClick={() => scrollBy(+1)} visible={canRight} />

        <div
          ref={scrollRef}
          className="vb-strip flex min-w-0 bg-white dark:bg-gray-950 px-1"
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            gap: 2,
            alignItems: "stretch",
            cursor: "grab",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
        >
          <Strip
            active={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
            icon={<AllIcon />}
            label="All"
            minW={ALL_MINW}
            accentColor={accent}
          />

          {loadData.map((cat) => (
            <Strip
              key={cat.id}
              active={selectedCategory === cat.id}
              onClick={() => toggle(cat.id)}
              icon={<CatImage src={buildIconSrc(cat.icon)} alt={cat.name ?? ""} />}
              label={cat.name}
              minW={ITEM_MINW}
              accentColor={accent}
            />
          ))}
        </div>
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
