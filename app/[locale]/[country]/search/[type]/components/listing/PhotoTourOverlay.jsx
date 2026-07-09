"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Expand, Grid3X3 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCategoryColors } from "../../utils/categoryConfig";
import ImageSlider from "./ImageSlider";

// ─── Section config ───────────────────────────────────────────────────────────
const SECTION_CONFIG = [
  { label: "01", title: "Spaces",   count: 4 },
  { label: "02", title: "Bedroom",  count: 4 },
  { label: "03", title: "Kitchen",  count: 4 },
  { label: "04", title: "Living",   count: 4 },
  { label: "05", title: "Exterior", count: 4 },
];
function buildSections(images = [], galleryCategory = []) {
  const out = [];
  let cursor = 0;

  for (const cfg of galleryCategory) {
    // Skip empty categories
    if (!cfg.count || cfg.count <= 0) {
      continue;
    }

    if (cursor >= images.length) break;

    const slice = images.slice(cursor, cursor + cfg.count);

    if (!slice.length) continue;

    out.push({
      ...cfg,
      images: slice,
      offset: cursor,
    });

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

// ─── Aspect ratio pattern — creates masonry feel ──────────────────────────────
const ASPECT_PATTERN = [
  "aspect-video", "aspect-square", "aspect-[3/4]",
  "aspect-[4/3]", "aspect-video",  "aspect-square",
  "aspect-[3/4]", "aspect-[4/3]",
];

// ─── Skeleton placeholder grid (animate-pulse, no custom keyframe needed) ────
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

// ─── Single photo cell with shimmer skeleton ──────────────────────────────────
function PhotoCell({ src, alt, onClick, priority }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="absolute inset-0">
      {/* Pulse skeleton — disappears once image loads */}
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

// ─── Masonry grid ─────────────────────────────────────────────────────────────
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

// ─── Desktop sidebar category card ────────────────────────────────────────────
function DesktopCategoryCard({ section, isActive, isAll, totalCount, colors, onClick }) {
  const borderCls = isActive ? `border-2 ${colors.tabBorderColor} shadow-sm` : "border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";
  const labelBg   = isActive ? colors.light : "bg-gray-50 dark:bg-gray-900";
  const titleCls  = isActive ? colors.accentBold : "text-gray-800 dark:text-gray-200";

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-xl overflow-hidden transition-all duration-200 focus:outline-none ${borderCls}`}
    >
      {/* Thumbnail */}
      <div className="relative h-[68px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {isAll ? (
          <div className="grid grid-cols-2 gap-px h-full">
            {section.images.slice(0, 4).map((img, i) => (
              <img key={i} src={img} className="w-full h-full object-cover" loading="lazy" alt="" />
            ))}
          </div>
        ) : (
          <img
            src={section.images[0]}
            alt={section.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
          />
        )}
        {isActive && <div className="absolute inset-0 bg-white/10 pointer-events-none" />}
      </div>

      {/* Label */}
      <div className={`px-3 py-2 transition-colors ${labelBg}`}>
        <p className={`text-xs font-semibold truncate ${titleCls}`}>
          {isAll ? "All Photos" : section.title}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-px">
          {isAll ? totalCount : section.images.length} Photos
        </p>
      </div>
    </button>
  );
}

// ─── Mobile horizontal tab card ───────────────────────────────────────────────
// Width is 26vw so ~3.5 cards fit on screen, giving a natural right-side peek
// that signals there are more categories to scroll to.
function MobileCategoryCard({ section, isActive, isAll, totalCount, colors, onClick }) {
  const borderCls = isActive
    ? `border-2 ${colors.tabBorderColor} shadow-md`
    : "border border-gray-200 dark:border-gray-700 shadow-sm";
  const labelBg  = isActive ? colors.light : "bg-white dark:bg-gray-900";
  const titleCls = isActive ? colors.accentBold : "text-gray-600 dark:text-gray-400";
  const countCls = isActive ? colors.accent : "text-gray-400 dark:text-gray-500";

  return (
    <button
      onClick={onClick}
      style={{ width: "calc(26vw)" }}
      className={`flex-none rounded-xl overflow-hidden transition-all duration-200 focus:outline-none ${borderCls}`}
    >
      {/* Thumbnail */}
      <div className="relative bg-gray-100 dark:bg-gray-800 overflow-hidden" style={{ height: "58px" }}>
        {isAll ? (
          <div className="grid grid-cols-2 gap-px h-full">
            {section.images.slice(0, 4).map((img, i) => (
              <img key={i} src={img} className="w-full h-full object-cover" loading="lazy" alt="" />
            ))}
          </div>
        ) : (
          <img src={section.images[0]} className="w-full h-full object-cover" loading="lazy" alt="" />
        )}
        {isActive && <div className="absolute inset-0 bg-black/5 pointer-events-none" />}
      </div>

      {/* Label */}
      <div className={`px-1.5 pt-1.5 pb-2 transition-colors ${labelBg}`}>
        <p className={`text-[10px] font-bold text-center truncate leading-tight ${titleCls}`}>
          {isAll ? "All" : section.title}
        </p>
        <p className={`text-[9px] text-center leading-tight mt-px ${countCls}`}>
          {isAll ? totalCount : section.images.length} Photos
        </p>
      </div>
    </button>
  );
}

// ─── Main overlay ─────────────────────────────────────────────────────────────
export default function PhotoTourOverlay({ images = [], category = "venues", onClose ,galleyCategory}) {
  const [sliderIndex,      setSliderIndex]      = useState(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0); // 0 = All Photos
  const [phase,            setPhase]            = useState("open");

  // Category-aware colours
  const colors = getCategoryColors(category);

  // const sections = useMemo(() => buildSections(images), [images] , galleyCategory);
  const sections = useMemo(
  () => buildSections(images, galleyCategory),
  [images, galleyCategory]
);

  const allSection = useMemo(() => ({
    title: "All Photos", images, offset: 0, isAll: true,
  }), [images]);

  const allSections = useMemo(() => [allSection, ...sections], [allSection, sections]);

  const activeSection = allSections[activeSectionIdx];

  // Scroll right panel to top on category change
  const rightPanelRef = useRef(null);
  const handleSelectCategory = useCallback((idx) => {
    setActiveSectionIdx(idx);
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Switch from placeholders → real images after slide-up completes
  const handleAnimationComplete = useCallback(() => setPhase("loaded"), []);

  return (
    <>
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

          {/* Desktop sidebar — sticky via flex layout */}
          <div
            className="hidden md:flex flex-col w-52 flex-none border-r border-gray-200 dark:border-gray-800 overflow-y-auto py-4 px-3 gap-2 bg-white dark:bg-gray-950"
            style={{ scrollbarWidth: "thin" }}
          >
            {allSections.map((sec, i) => (
              <DesktopCategoryCard
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

          {/* Right panel */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* ── Mobile tab strip — image cards ── */}
            <div
              className="md:hidden flex-none border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-x-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex gap-2 pl-3 pt-4 pb-3" style={{ width: "max-content" }}>
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
                        globalOffset={activeSection.offset}
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
