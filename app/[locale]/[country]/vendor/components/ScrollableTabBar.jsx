"use client";

/**
 * ScrollableTabBar
 * ─────────────────────────────────────────────────────────────────
 * Production-grade horizontal tab bar with:
 *   • Premium glass-morphism arrow buttons (circular, backdrop-blur,
 *     gradient border, shadow — light + dark mode)
 *   • Left / right edge-fade gradient overlays
 *   • Arrows appear only when overflow exists; fade when at boundary
 *   • Smooth momentum scrolling, hidden scrollbar, optional snap
 *   • Consistent bottom-border active indicator (violet brand)
 *   • RTL-safe (uses logical CSS: start/end)
 *
 * Usage (state-based):
 *   <ScrollableTabBar tabs={TABS} active={activeKey} onChange={setActiveKey} />
 *
 * Usage (router-based — full control via renderTab):
 *   <ScrollableTabBar
 *     tabs={TABS}
 *     active={activeKey}
 *     renderTab={(tab, isActive) => (
 *       <Link href={`?tab=${tab.key}`} className={tabActiveCls(isActive)}>
 *         {tab.label}
 *       </Link>
 *     )}
 *   />
 *
 * Tab shape:
 *   { key: string, label: string, icon?: LucideIcon, count?: number }
 */

import { useRef, useEffect, useState, useCallback } from "react";

/* ─── Shared active / inactive class builders ───────────────────── */
export function tabActiveCls(isActive) {
  return [
    "relative flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium",
    "whitespace-nowrap transition-colors shrink-0 border-b-2 -mb-px",
    "outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1",
    isActive
      ? "text-violet-700 dark:text-violet-300 border-violet-600 dark:border-violet-400"
      : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-white/20",
  ].join(" ");
}

export function tabIconCls(isActive) {
  return `shrink-0 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"}`;
}

/* ─── Premium glass arrow button ────────────────────────────────── */
function GlassArrow({ direction, onClick, visible }) {
  const isLeft = direction === "left";

  return (
    <div
      aria-hidden={!visible}
      className={[
        "pointer-events-none absolute top-0 bottom-0 z-20 flex items-center transition-opacity duration-200",
        isLeft ? "start-0 pe-4" : "end-0 ps-4",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{ willChange: "opacity" }}
    >
      {/* Edge fade */}
      <div
        className={[
          "absolute inset-y-0 w-12",
          isLeft
            ? "start-0 bg-gradient-to-r from-white dark:from-[#030712] to-transparent"
            : "end-0 bg-gradient-to-l from-white dark:from-[#030712] to-transparent",
        ].join(" ")}
      />

      {/* Glass pill button */}
      <button
        type="button"
        aria-label={isLeft ? "Scroll tabs left" : "Scroll tabs right"}
        onClick={onClick}
        tabIndex={visible ? 0 : -1}
        className={[
          "pointer-events-auto relative z-10 flex h-6 w-6 items-center justify-center",
          "rounded-full transition-all duration-150",
          // Glass background
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md",
          // Border — subtle gradient ring effect via box-shadow
          "ring-1 ring-gray-200/80 dark:ring-white/[0.10]",
          // Shadow for depth
          "shadow-[0_2px_8px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.40)]",
          // Hover
          "hover:bg-white dark:hover:bg-gray-800 hover:ring-violet-300/60 dark:hover:ring-violet-500/30",
          "hover:shadow-[0_2px_12px_rgba(164,75,243,0.18)] dark:hover:shadow-[0_2px_12px_rgba(164,75,243,0.25)]",
          "active:scale-90",
        ].join(" ")}
      >
        {isLeft ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-500 dark:text-gray-400">
            <path d="M6.5 8L3.5 5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-500 dark:text-gray-400">
            <path d="M3.5 2L6.5 5l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────── */
export default function ScrollableTabBar({
  tabs            = [],
  active,
  onChange,
  renderTab,           // optional custom renderer: (tab, isActive) => ReactNode
  trailingAction,      // optional node pinned at the right end of the bar (outside scroll area)
  className       = "",
  snap            = false,
}) {
  const scrollRef  = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  /* ── Update overflow indicators ────────────────────────────── */
  const updateIndicators = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateIndicators();
    el.addEventListener("scroll", updateIndicators, { passive: true });
    const ro = new ResizeObserver(updateIndicators);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateIndicators);
      ro.disconnect();
    };
  }, [updateIndicators]);

  /* ── Nudge scroll on arrow click ───────────────────────────── */
  const nudge = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 140, behavior: "smooth" });
  }, []);

  return (
    /*
     * Outer div owns border-b + flex alignment so both the scrollable
     * tab area AND any trailingAction share the same underline baseline.
     * The inner wrapper (flex-1 min-w-0) contains the overflow + arrows
     * so trailingAction is pinned at the right and never scrolls away.
     */
    <div className={`relative flex items-end border-b border-gray-200 dark:border-white/[0.07] ${className}`}>

      {/* Scrollable section — arrows + tab list */}
      <div className="relative flex-1 min-w-0">
        <GlassArrow direction="left"  onClick={() => nudge(-1)} visible={canLeft}  />
        <GlassArrow direction="right" onClick={() => nudge(1)}  visible={canRight} />

        <div
          ref={scrollRef}
          className={[
            "flex items-end overflow-x-auto",
            snap ? "snap-x snap-mandatory" : "",
          ].join(" ").trim()}
          style={{
            scrollbarWidth: "none",           /* Firefox */
            WebkitOverflowScrolling: "touch", /* iOS momentum */
            msOverflowStyle: "none",          /* IE/Edge */
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            const Icon     = tab.icon;

            if (renderTab) return renderTab(tab, isActive);

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChange?.(tab.key)}
                className={tabActiveCls(isActive)}
              >
                {Icon && (
                  <Icon size={12} className={tabIconCls(isActive)} aria-hidden="true" />
                )}
                <span>{tab.label}</span>
                {tab.count != null && tab.count > 0 && (
                  <span
                    className={`text-[11px] font-bold tabular-nums ${
                      isActive
                        ? "text-violet-500 dark:text-violet-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trailing action — pinned right, outside scroll, always visible */}
      {trailingAction && (
        <div className="shrink-0">{trailingAction}</div>
      )}
    </div>
  );
}
