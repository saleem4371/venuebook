"use client";

/**
 * FilterRow — Airbnb-style compact category strip
 * ─────────────────────────────────────────────────
 * • No active-item jumping — padding identical for active/inactive
 * • 60px actual icon size for categories
 * • Overflow arrows (glass, fade in/out) on desktop + tablet
 * • Mouse drag-to-scroll + wheel support
 * • Filters: glass pill, stands out without breaking rhythm
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const AWS = (process.env.NEXT_PUBLIC_AWS_BUCKET_URL ?? "").replace(/\/+$/, "");

function buildIconSrc(icon) {
  if (!icon) return null;
  if (/^https?:\/\//i.test(icon)) return icon;
  return `${AWS}/${icon.replace(/^\/+/, "")}`;
}

/* ── Image with error fallback ─────────────────────────────────────────── */
function CatImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return <DefaultCatIcon size={60} />;
  return (
    <img
      src={src} alt={alt}
      onError={() => setFailed(true)}
      width={60} height={60}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}

/* ── Category / utility strip item ─────────────────────────────────────── */
function Strip({ active, onClick, icon, label, minW = 96 }) {
  return (
    <button
      onClick={onClick}
      /* position:relative for the absolute underline indicator */
      style={{ position: "relative", minWidth: minW }}
      className={[
        "flex flex-col items-center flex-shrink-0 cursor-pointer select-none",
        /* IDENTICAL padding for active and inactive — no jumping */
        "pt-2 pb-3 px-3",
        "transition-colors duration-200",
        active
          ? "text-purple-600 dark:text-purple-400"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
      ].join(" ")}
    >
      {/* Icon wrapper — same size always, bg-only change on active */}
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{
          marginBottom: 8,
          width: "auto", height: "auto",
          /* Subtle tint bg — does NOT add padding so height stays constant */
          background: active ? "rgba(124,58,237,0.07)" : "transparent",
          borderRadius: 10,
          transition: "background 0.2s",
          /* Inset padding via box-shadow so layout dimensions don't change */
          padding: 0,
        }}
      >
        {icon}
      </span>

      {/* Label */}
      <span className="text-[11px] font-semibold whitespace-nowrap leading-none tracking-wide">
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
          background: active ? "#7c3aed" : "transparent",
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
        transform: "translateY(-50%)",
        [direction]: direction === "left" ? 4 : 4,
        zIndex: 10,
        width: 36, height: 36,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        border: "1px solid rgba(0,0,0,0.07)",
        cursor: "pointer",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.2s ease",
        color: "#374151",
      }}
    >
      {direction === "left"
        ? <ChevronLeft size={18} strokeWidth={2} />
        : <ChevronRight size={18} strokeWidth={2} />
      }
    </button>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────── */
function AllIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2"  y="2"  width="9" height="9" rx="2.5" fill="currentColor"/>
      <rect x="13" y="2"  width="9" height="9" rx="2.5" fill="currentColor" opacity="0.65"/>
      <rect x="2"  y="13" width="9" height="9" rx="2.5" fill="currentColor" opacity="0.65"/>
      <rect x="13" y="13" width="9" height="9" rx="2.5" fill="currentColor" opacity="0.35"/>
    </svg>
  );
}

function DefaultCatIcon({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  );
}

/* ── FilterRow ──────────────────────────────────────────────────────────── */
export default function FilterRow({ selectedCategory, setSelectedCategory, loadData = [], onFilterOpen }) {
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
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native horizontal — let it pass
    e.preventDefault();
    scrollRef.current?.scrollBy({ left: e.deltaY * 1.5 });
  };

  return (
    <div
      className="flex items-stretch bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800"
      style={{ position: "relative" }}
    >
      <style>{`.vb-strip::-webkit-scrollbar{display:none}`}</style>

      {/* ── Overflow arrows ───────────────────────────────────────── */}
      <Arrow direction="left"  onClick={() => scrollBy(-1)} visible={canLeft}  />
      <Arrow direction="right" onClick={() => scrollBy(+1)} visible={canRight} />

      {/* ── Scrollable strip ──────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="vb-strip flex flex-1 min-w-0 bg-white dark:bg-gray-950 px-1"
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
          minW={80}
        />

        {loadData.map((cat) => (
          <Strip
            key={cat.id}
            active={selectedCategory === cat.id}
            onClick={() => toggle(cat.id)}
            icon={<CatImage src={buildIconSrc(cat.icon)} alt={cat.name ?? ""} />}
            label={cat.name}
            minW={96}
          />
        ))}
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
              marginBottom: 8,
              background: "rgba(124,58,237,0.06)",
              border: "1px solid rgba(124,58,237,0.15)",
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
              className="text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors"
            />
          </span>
          <span className="text-[11px] font-semibold whitespace-nowrap leading-none tracking-wide text-purple-600 dark:text-purple-400">
            Filters
          </span>
        </button>
      </div>
    </div>
  );
}
