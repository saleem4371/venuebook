"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Expand, Grid3X3 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCategoryColors } from "../../utils/categoryConfig";
import ImageSlider from "./ImageSlider";

// ─────────────────────────────────────────────────────────────────────────────
// Data helpers
// ─────────────────────────────────────────────────────────────────────────────
function buildSections(images = [], galleryCategory = []) {
  const out = [];
  let cursor = 0;
  for (const cfg of galleryCategory) {
    if (!cfg.count || cfg.count <= 0) continue;
    if (cursor >= images.length) break;
    const slice = images.slice(cursor, cursor + cfg.count);
    if (!slice.length) continue;
    out.push({ ...cfg, images: slice, offset: cursor });
    cursor += slice.length;
  }
  if (cursor < images.length) {
    out.push({
      label: String(out.length + 1).padStart(2, "0"),
      title: "More",
      count: images.length - cursor,
      images: images.slice(cursor),
      offset: cursor,
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Masonry helpers
// ─────────────────────────────────────────────────────────────────────────────
const ASPECT_PATTERN = [
  "aspect-video",   "aspect-square",  "aspect-[3/4]",
  "aspect-[4/3]",   "aspect-video",   "aspect-square",
  "aspect-[3/4]",   "aspect-[4/3]",
];

function StaticGrid({ count }) {
  return (
    <div className="columns-2 md:columns-3" style={{ columnGap: 8 }}>
      {Array.from({ length: Math.min(count, 9) }).map((_, i) => (
        <div
          key={i}
          className={`${ASPECT_PATTERN[i % ASPECT_PATTERN.length]} rounded-xl bg-gray-200 dark:bg-gray-700 mb-2 break-inside-avoid animate-pulse`}
        />
      ))}
    </div>
  );
}

function PhotoCell({ src, alt, onClick, priority }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="absolute inset-0">
      {!loaded && (
        <div className="absolute inset-0 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        className={`absolute inset-0 w-full h-full object-cover cursor-pointer rounded-xl transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function MasonryGrid({ images, globalOffset, onImageClick, priority }) {
  return (
    <div className="columns-2 md:columns-3" style={{ columnGap: 8 }}>
      {images.map((img, i) => (
        <div
          key={`${globalOffset}-${i}`}
          className={`relative ${ASPECT_PATTERN[i % ASPECT_PATTERN.length]} overflow-hidden rounded-xl cursor-pointer group mb-2 break-inside-avoid`}
          onClick={() => onImageClick(globalOffset + i)}
        >
          <PhotoCell
            src={img}
            alt={`Photo ${globalOffset + i + 1}`}
            priority={priority && i < 6}
            onClick={() => onImageClick(globalOffset + i)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl pointer-events-none" />
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
              <Expand size={11} className="text-gray-600 dark:text-gray-300" />
              <span className="text-gray-600 dark:text-gray-300 text-[10px] font-medium">View</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop category card
// — fixed 16:9 thumbnail (never clipped), improved active state
// ─────────────────────────────────────────────────────────────────────────────
function DesktopCategoryCard({ section, isActive, isAll, totalCount, colors, onClick, cardRef }) {
  const count = isAll ? totalCount : section.images.length;

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      className={[
        "group w-full text-left rounded-xl overflow-hidden shrink-0",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1",
        isActive
          ? `border-2 ${colors.tabBorderColor}`
          : "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm",
      ].join(" ")}
    >
      {/* ── Thumbnail — fixed 16:9 aspect, object-cover, never clips title ── */}
      <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {isAll ? (
          <div className="absolute inset-0 grid grid-cols-2 gap-px">
            {section.images.slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        ) : (
          <img
            src={section.images[0]}
            alt={section.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            loading="lazy"
          />
        )}

        {/* Active tint */}
        {isActive && (
          <div className="absolute inset-0 bg-white/10 pointer-events-none" />
        )}

        {/* Photo count chip */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/55 backdrop-blur-sm rounded px-1.5 py-0.5 z-10">
          <span className="text-[9px] font-semibold text-white tabular-nums leading-none">
            {count}
          </span>
        </div>
      </div>

      {/* ── Label ── */}
      <div
        className={[
          "px-2.5 py-2 transition-colors",
          isActive
            ? colors.light
            : "bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/60",
        ].join(" ")}
      >
        <p
          className={[
            "text-[11px] font-semibold leading-tight",
            isActive ? colors.accentBold : "text-gray-800 dark:text-gray-200",
          ].join(" ")}
        >
          {isAll ? "All Photos" : section.title}
        </p>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile horizontal category card (improved aspect ratio + sizing)
// ─────────────────────────────────────────────────────────────────────────────
function MobileCategoryCard({ section, isActive, isAll, totalCount, colors, onClick }) {
  const count = isAll ? totalCount : section.images.length;
  return (
    <button
      onClick={onClick}
      style={{ width: "27vw", minWidth: 88, maxWidth: 120 }}
      className={[
        "flex-none rounded-xl overflow-hidden transition-all duration-200",
        "focus:outline-none active:scale-95",
        isActive
          ? `border-2 ${colors.tabBorderColor} shadow-md`
          : "border border-gray-200 dark:border-gray-700 shadow-sm",
      ].join(" ")}
    >
      {/* Thumbnail — 4:3 so text below never gets clipped */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {isAll ? (
          <div className="absolute inset-0 grid grid-cols-2 gap-px">
            {section.images.slice(0, 4).map((img, i) => (
              <img key={i} src={img} className="w-full h-full object-cover" loading="lazy" alt="" />
            ))}
          </div>
        ) : (
          <img
            src={section.images[0]}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            alt=""
          />
        )}
        {isActive && <div className="absolute inset-0 bg-black/5 pointer-events-none" />}
      </div>

      {/* Label */}
      <div
        className={[
          "px-1.5 py-1.5 transition-colors",
          isActive ? colors.light : "bg-white dark:bg-gray-900",
        ].join(" ")}
      >
        <p
          className={[
            "text-[10px] font-bold text-center truncate leading-tight",
            isActive ? colors.accentBold : "text-gray-600 dark:text-gray-400",
          ].join(" ")}
        >
          {isAll ? "All" : section.title}
        </p>
        <p
          className={[
            "text-[9px] text-center leading-tight mt-0.5",
            isActive ? colors.accent : "text-gray-400 dark:text-gray-500",
          ].join(" ")}
        >
          {count} photos
        </p>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SidebarScrollContainer
//
// Wraps the scrollable list and wires up dynamic top + bottom fade indicators.
//
// Architecture:
//   outer  →  relative + flex-1 + min-h-0 + overflow-hidden
//             (gives the scroller a concrete pixel height via flex allocation)
//   scroller→  h-full + overflow-y-auto
//             (h-full explicitly matches the outer's pixel height → scroll fires)
//   fades  →  absolute overlays that transition opacity based on scroll state
// ─────────────────────────────────────────────────────────────────────────────
function SidebarScrollContainer({ scrollRef, children }) {
  const [atTop,    setAtTop]    = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setAtTop(scrollTop <= 4);
    setAtBottom(scrollTop >= scrollHeight - clientHeight - 4);
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    sync(); // initial check
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">

      {/* ── Scroller ──
          h-full is critical: it targets the outer's concrete pixel height
          rather than relying on flex-1 resolution (which varies by engine).  */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto gallery-sidebar-scroll"
        style={{
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        }}
      >
        {children}
      </div>

      {/* Top fade — hidden when already at the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white dark:from-gray-950 to-transparent z-10 transition-opacity duration-300"
        style={{ opacity: atTop ? 0 : 1 }}
      />

      {/* Bottom fade — hidden when at the bottom (peek disappears, confirming end) */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white dark:from-gray-950 to-transparent z-10 transition-opacity duration-300"
        style={{ opacity: atBottom ? 0 : 1 }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main overlay
// ─────────────────────────────────────────────────────────────────────────────
export default function PhotoTourOverlay({ images = [], category = "venues", onClose, galleyCategory }) {
  const [sliderIndex,      setSliderIndex]      = useState(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [phase,            setPhase]            = useState("open");

  const colors = getCategoryColors(category);

  const sections = useMemo(
    () => buildSections(images, galleyCategory),
    [images, galleyCategory],
  );

  const allSection = useMemo(
    () => ({ title: "All Photos", images, offset: 0, isAll: true }),
    [images],
  );

  const allSections    = useMemo(() => [allSection, ...sections], [allSection, sections]);
  const activeSection  = allSections[activeSectionIdx];

  // Panel refs
  const rightPanelRef    = useRef(null);
  const sidebarScrollRef = useRef(null);
  const mobileStripRef   = useRef(null);

  // Per-card refs for keyboard-driven scroll-into-view
  const cardRefs = useRef([]);

  const handleSelectCategory = useCallback((idx) => {
    setActiveSectionIdx(idx);
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Auto-scroll the active sidebar card into view whenever selection changes
  useEffect(() => {
    cardRefs.current[activeSectionIdx]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeSectionIdx]);

  // Auto-scroll active mobile tab into view (horizontal)
  useEffect(() => {
    const strip = mobileStripRef.current;
    if (!strip) return;
    strip.children[activeSectionIdx]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeSectionIdx]);

  // Keyboard: ↑ / ↓ navigate sidebar categories
  const handleSidebarKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleSelectCategory(Math.min(activeSectionIdx + 1, allSections.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleSelectCategory(Math.max(activeSectionIdx - 1, 0));
      }
    },
    [activeSectionIdx, allSections.length, handleSelectCategory],
  );

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleAnimationComplete = useCallback(() => setPhase("loaded"), []);

  return (
    <>
      {/*
        Custom scrollbar styles — scoped to .gallery-sidebar-scroll
        • Firefox: scrollbar-width + scrollbar-color
        • Chrome/Safari/Edge: webkit pseudo-elements with rounded thumb
        • Dark mode: lighter thumb on dark backgrounds
      */}
      <style>{`
        .gallery-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .gallery-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .gallery-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .gallery-sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 9999px;
          min-height: 32px;
        }
        .gallery-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .dark .gallery-sidebar-scroll {
          scrollbar-color: #374151 transparent;
        }
        .dark .gallery-sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #374151;
        }
        .dark .gallery-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #4b5563;
        }
      `}</style>

      <motion.div
        className="fixed inset-0 z-[190] flex flex-col bg-white dark:bg-gray-950"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ backfaceVisibility: "hidden", transform: "translateZ(0)" }}
        onAnimationComplete={handleAnimationComplete}
      >

        {/* ── HEADER ── */}
        <div className="flex-none flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
            Back
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500">{images.length} photos</span>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 flex overflow-hidden">

          {/*
            ════════════════════════════════════════════════════════════
            DESKTOP SIDEBAR
            ════════════════════════════════════════════════════════════

            Height chain (how the scroller gets a concrete pixel height):

            1. motion.div     →  fixed inset-0 (= 100vh, concrete)
            2. header         →  flex-none     (= fixed px, concrete)
            3. body           →  flex-1        (= 100vh − header, concrete)
            4. sidebar outer  →  flex-col + overflow-hidden
                                 overflow-hidden clamps to cross-axis size
                                 assigned by the flex-row parent = body height.
                                 Without overflow-hidden the browser lets the
                                 element expand to content height and scroll
                                 never fires.
            5. SidebarScrollContainer  →  relative + flex-1 + min-h-0 + overflow-hidden
            6. scroller       →  h-full + overflow-y-auto
                                 h-full explicitly targets step-5's px height.
                                 This is the only cross-browser reliable trigger.
          */}
          <div
            className="hidden md:flex flex-col md:w-44 lg:w-52 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
            onKeyDown={handleSidebarKeyDown}
            tabIndex={-1}
            aria-label="Photo categories"
          >

            {/* ── Scrollable card list with dynamic top + bottom fades ── */}
            <SidebarScrollContainer scrollRef={sidebarScrollRef}>
              {/*
                pb-20: ensures the last card peeks above the h-20 bottom fade.
                When the user reaches the very bottom, SidebarScrollContainer
                detects atBottom=true and the fade disappears, confirming end.
              */}
              <div className="px-3 pt-2 pb-20 flex flex-col gap-2">
                {allSections.map((sec, i) => (
                  <DesktopCategoryCard
                    key={i}
                    cardRef={(el) => { cardRefs.current[i] = el; }}
                    section={sec}
                    isActive={activeSectionIdx === i}
                    isAll={!!sec.isAll}
                    totalCount={images.length}
                    colors={colors}
                    onClick={() => handleSelectCategory(i)}
                  />
                ))}
              </div>
            </SidebarScrollContainer>
          </div>

          {/* ════ RIGHT PANEL ════ */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/*
              Mobile horizontal tab strip
              — 27vw cards give ~3.6 visible at once, right edge naturally peeks
              — pr-6 adds breathing room after the last card
            */}
            <div
              className="md:hidden flex-none border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-x-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div
                ref={mobileStripRef}
                className="flex gap-2 pl-3 pr-6 pt-3 pb-3"
                style={{ width: "max-content" }}
              >
                {allSections.map((sec, i) => (
                  <MobileCategoryCard
                    key={i}
                    section={sec}
                    isActive={activeSectionIdx === i}
                    isAll={!!sec.isAll}
                    totalCount={images.length}
                    colors={colors}
                    onClick={() => handleSelectCategory(i)}
                  />
                ))}
              </div>
            </div>

            {/* Scrollable image area */}
            <div
              ref={rightPanelRef}
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={activeSectionIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.14 }}
                >
                  <div className="px-4 md:px-6 py-6">

                    {/* Desktop section heading */}
                    <div className="hidden md:flex items-end justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {activeSection.isAll ? "All Photos" : activeSection.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {activeSection.isAll ? images.length : activeSection.images.length} photos
                        </p>
                      </div>
                      {activeSection.isAll && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Grid3X3 size={13} />
                          <span>Browse by category on the left</span>
                        </div>
                      )}
                    </div>

                    {phase === "open" ? (
                      <StaticGrid count={Math.min(activeSection.images.length, 9)} />
                    ) : (
                      <MasonryGrid
                        images={activeSection.images}
                        globalOffset={activeSection.offset ?? 0}
                        onImageClick={setSliderIndex}
                        priority
                      />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="h-8" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen viewer — z-[200] sits above overlay z-[190] */}
      <AnimatePresence>
        {sliderIndex !== null && (
          <ImageSlider
            images={images}
            index={sliderIndex}
            setIndex={setSliderIndex}
            onClose={() => setSliderIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
