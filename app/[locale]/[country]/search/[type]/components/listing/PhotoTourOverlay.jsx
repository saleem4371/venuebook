"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Expand, Grid3X3 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCategoryColors } from "../../utils/categoryConfig";
import ImageSlider from "./ImageSlider";

// ─────────────────────────────────────────────────────────────────────────────
// Data helpers
// ─────────────────────────────────────────────────────────────────────────────
// Builds gallery sections directly from the categoryWiseGallery API shape:
// [{ id, title, images: [{ id, attachment }] }, ...]
// Skips categories with no (or empty) images, and tracks a running `offset`
// so each section's images map back correctly onto the flattened "All Photos"
// array (needed for the fullscreen ImageSlider index).
function buildSectionsFromGallery(categoryWiseGallery = []) {
  const out = [];
  let cursor = 0;

  for (const cat of categoryWiseGallery) {
    const urls = (cat?.images || [])
      .map((img) => img?.attachment)
      .filter(Boolean);

    if (!urls.length) continue; // e.g. "additonal images" with images: []

    out.push({
      id: cat.id,
      label: String(out.length + 1).padStart(2, "0"),
      title: cat.title || "Gallery",
      images: urls,
      offset: cursor,
    });
    cursor += urls.length;
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

// Shimmer skeleton — diagonal sweep instead of a flat pulse.
// Reused for both the initial load and every category switch.
function SkeletonCell({ index }) {
  return (
    <div
      className={`${ASPECT_PATTERN[index % ASPECT_PATTERN.length]} rounded-xl mb-2 break-inside-avoid relative overflow-hidden bg-gray-200 dark:bg-gray-700`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
    </div>
  );
}

function StaticGrid({ count }) {
  return (
    <div className="columns-2 md:columns-3" style={{ columnGap: 8 }}>
      {Array.from({ length: Math.min(count, 9) }).map((_, i) => (
        <SkeletonCell key={i} index={i} />
      ))}
    </div>
  );
}

function PhotoCell({ src, alt, onClick, priority }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="absolute inset-0">
      {!loaded && (
        <div className="absolute inset-0 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
        </div>
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
      <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {isAll ? (
          <div className="absolute inset-0 grid grid-cols-2 gap-px">
            {section.images.slice(0, 4).map((img, i) => (
              <img key={i} src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
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

        {isActive && <div className="absolute inset-0 bg-white/10 pointer-events-none" />}

        <div className="absolute bottom-1.5 right-1.5 bg-black/55 backdrop-blur-sm rounded px-1.5 py-0.5 z-10">
          <span className="text-[9px] font-semibold text-white tabular-nums leading-none">{count}</span>
        </div>
      </div>

      <div
        className={[
          "px-2.5 py-2 transition-colors",
          isActive ? colors.light : "bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/60",
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
// Mobile horizontal category card
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
        isActive ? `border-2 ${colors.tabBorderColor} shadow-md` : "border border-gray-200 dark:border-gray-700 shadow-sm",
      ].join(" ")}
    >
      <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {isAll ? (
          <div className="absolute inset-0 grid grid-cols-2 gap-px">
            {section.images.slice(0, 4).map((img, i) => (
              <img key={i} src={img} className="w-full h-full object-cover" loading="lazy" alt="" />
            ))}
          </div>
        ) : (
          <img src={section.images[0]} className="absolute inset-0 w-full h-full object-cover" loading="lazy" alt="" />
        )}
        {isActive && <div className="absolute inset-0 bg-black/5 pointer-events-none" />}
      </div>

      <div className={["px-1.5 py-1.5 transition-colors", isActive ? colors.light : "bg-white dark:bg-gray-900"].join(" ")}>
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
// ─────────────────────────────────────────────────────────────────────────────
function SidebarScrollContainer({ scrollRef, children }) {
  const [atTop, setAtTop] = useState(true);
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
    sync();
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
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto gallery-sidebar-scroll"
        style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}
      >
        {children}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white dark:from-gray-950 to-transparent z-10 transition-opacity duration-300"
        style={{ opacity: atTop ? 0 : 1 }}
      />
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
export default function PhotoTourOverlay({ categoryWiseGallery = [], category = "venues", onClose }) {
  const [sliderIndex, setSliderIndex] = useState(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [phase, setPhase] = useState("open");           // overlay-open animation gate
  const [sectionReady, setSectionReady] = useState(false); // per-section skeleton gate

  const colors = getCategoryColors(category);

  // Build sections straight from categoryWiseGallery — no count-based slicing needed,
  // each category already carries its own images.
  const sections = useMemo(
    () => buildSectionsFromGallery(categoryWiseGallery),
    [categoryWiseGallery],
  );

  // Flatten every section's images, in order, for "All Photos" + the lightbox index.
  const images = useMemo(() => sections.flatMap((s) => s.images), [sections]);

  const allSection = useMemo(
    () => ({ title: "All Photos", images, offset: 0, isAll: true }),
    [images],
  );

  const allSections = useMemo(() => [allSection, ...sections], [allSection, sections]);
  const activeSection = allSections[activeSectionIdx];

  const rightPanelRef = useRef(null);
  const sidebarScrollRef = useRef(null);
  const mobileStripRef = useRef(null);
  const cardRefs = useRef([]);

  const handleSelectCategory = useCallback((idx) => {
    setActiveSectionIdx(idx);
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Brief skeleton flash on every category switch — not just the very first open.
  useEffect(() => {
    setSectionReady(false);
    const t = setTimeout(() => setSectionReady(true), 220);
    return () => clearTimeout(t);
  }, [activeSectionIdx]);

  useEffect(() => {
    cardRefs.current[activeSectionIdx]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeSectionIdx]);

  useEffect(() => {
    const strip = mobileStripRef.current;
    if (!strip) return;
    strip.children[activeSectionIdx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeSectionIdx]);

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

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleAnimationComplete = useCallback(() => setPhase("loaded"), []);

  const showSkeleton = phase === "open" || !sectionReady;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .gallery-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .gallery-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .gallery-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .gallery-sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 9999px;
          min-height: 32px;
        }
        .gallery-sidebar-scroll::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; }
        .dark .gallery-sidebar-scroll { scrollbar-color: #374151 transparent; }
        .dark .gallery-sidebar-scroll::-webkit-scrollbar-thumb { background-color: #374151; }
        .dark .gallery-sidebar-scroll::-webkit-scrollbar-thumb:hover { background-color: #4b5563; }
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

        <div className="flex-1 flex overflow-hidden">
          <div
            className="hidden md:flex flex-col md:w-44 lg:w-52 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
            onKeyDown={handleSidebarKeyDown}
            tabIndex={-1}
            aria-label="Photo categories"
          >
            <SidebarScrollContainer scrollRef={sidebarScrollRef}>
              <div className="px-3 pt-2 pb-20 flex flex-col gap-2">
                {allSections.map((sec, i) => (
                  <DesktopCategoryCard
                    key={sec.id ?? i}
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

          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className="md:hidden flex-none border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-x-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div ref={mobileStripRef} className="flex gap-2 pl-3 pr-6 pt-3 pb-3" style={{ width: "max-content" }}>
                {allSections.map((sec, i) => (
                  <MobileCategoryCard
                    key={sec.id ?? i}
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

            <div
              ref={rightPanelRef}
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={activeSectionIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  <div className="px-4 md:px-6 py-6">
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

                    {showSkeleton ? (
                      <StaticGrid count={Math.min(activeSection.images.length || 9, 9)} />
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