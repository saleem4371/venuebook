"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ImageSlider from "./ImageSlider";

// ─── Section config ───────────────────────────────────────────────────────────
const SECTION_CONFIG = [
  { label: "01", title: "Spaces",   count: 4 },
  { label: "02", title: "Bedroom",  count: 4 },
  { label: "03", title: "Kitchen",  count: 4 },
  { label: "04", title: "Living",   count: 4 },
  { label: "05", title: "Exterior", count: 4 },
];

function buildSections(images) {
  const out = [];
  let cursor = 0;
  for (const cfg of SECTION_CONFIG) {
    if (cursor >= images.length) break;
    const slice = images.slice(cursor, cursor + cfg.count);
    if (!slice.length) break;
    out.push({ ...cfg, images: slice, offset: cursor });
    cursor += slice.length;
  }
  if (cursor < images.length) {
    out.push({
      label: String(out.length + 1).padStart(2, "0"),
      title: "More",
      images: images.slice(cursor),
      offset: cursor,
    });
  }
  return out;
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-gray-300 dark:text-gray-600 text-[10px] font-mono tracking-widest">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
      <span className="text-gray-400 dark:text-gray-500 text-[11px] font-semibold tracking-[0.15em] uppercase">
        {title}
      </span>
    </div>
  );
}

// ─── Static placeholder grid (ZERO CSS animation) ────────────────────────────
// Used ONLY during the 280ms open animation so no competing compositor layers
// steal GPU budget from the slide-up. Each cell is the exact same size as a
// real image cell — layout is fully reserved, zero CLS on swap.
function StaticGrid({ count }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-video rounded-xl bg-gray-100 dark:bg-gray-800"
        />
      ))}
    </div>
  );
}

// ─── Real image cell with shimmer skeleton ────────────────────────────────────
// The shimmer animation only runs AFTER the modal is fully open so it never
// competes with the slide-up transition on the GPU.
function PhotoCell({ src, alt, onClick, priority }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {/* Shimmer skeleton — fades out when image is ready */}
      <div
        aria-hidden
        className={`absolute inset-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 transition-opacity duration-200 ${
          loaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />
      </div>

      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        className={`absolute inset-0 w-full h-full object-cover cursor-pointer transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

// ─── Main overlay ─────────────────────────────────────────────────────────────
export default function PhotoTourOverlay({ images = [], onClose }) {
  const [sliderIndex, setSliderIndex] = useState(null);
  const [activeIdx,   setActiveIdx]   = useState(0);

  // "open"   → slide animation is running (static gray placeholders only)
  // "loaded" → animation done, real PhotoCells with shimmer + images mount
  const [phase, setPhase] = useState("open");

  // Tab strip overflow arrows
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const bodyRef     = useRef(null);
  const tabsRef     = useRef(null);
  const tabBtnRefs  = useRef([]);
  const sectionRefs = useRef([]);

  const sections = useMemo(() => buildSections(images), [images]);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Tab strip overflow arrows ─────────────────────────────────────────────
  const checkTabOverflow = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    checkTabOverflow();
    el.addEventListener("scroll", checkTabOverflow, { passive: true });
    const ro = new ResizeObserver(checkTabOverflow);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkTabOverflow); ro.disconnect(); };
  }, [checkTabOverflow]);

  const scrollTabs = useCallback((dir) => {
    const el = tabsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 120, behavior: "smooth" });
  }, []);

  // ── Active tab tracking ───────────────────────────────────────────────────
  const updateActive = useCallback(() => {
    const container = bodyRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;

    // Scrolled to very top → always reset to first tab
    if (scrollTop < 10) {
      setActiveIdx(0);
      return;
    }

    // At bottom → last tab
    if (scrollHeight - scrollTop - clientHeight < 80) {
      setActiveIdx(sections.length - 1);
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    const triggerLine  = containerTop + clientHeight * 0.4;
    let winner = 0;
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      if (el.getBoundingClientRect().top <= triggerLine) winner = i;
    });
    setActiveIdx(winner);
  }, [sections.length]);

  useEffect(() => {
    const container = bodyRef.current;
    if (!container) return;
    container.addEventListener("scroll", updateActive, { passive: true });
    return () => container.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  // ── Auto-scroll active tab chip into view ────────────────────────────────
  useEffect(() => {
    tabBtnRefs.current[activeIdx]?.scrollIntoView({
      behavior: "smooth", block: "nearest", inline: "center",
    });
  }, [activeIdx]);

  // ── Jump to section ───────────────────────────────────────────────────────
  const jumpTo = useCallback((i) => {
    const el        = sectionRefs.current[i];
    const container = bodyRef.current;
    if (!el || !container) return;
    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop - 72;
    container.scrollTo({ top, behavior: "smooth" });
    setActiveIdx(i);
  }, []);

  // ── Called when the slide-up animation fully completes ───────────────────
  // Only NOW do we mount PhotoCells + shimmer animations. The GPU is free.
  const handleAnimationComplete = useCallback(() => {
    setPhase("loaded");
  }, []);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[190] flex flex-col bg-white dark:bg-gray-950"
        style={{ willChange: "transform" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
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

        {/* ── TAB STRIP ── */}
        <div className="flex-none relative border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">

          {/* Left arrow — only when scrolled right */}
          {canScrollLeft && (
            <button
              onClick={() => scrollTabs(-1)}
              aria-label="Scroll tabs left"
              className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-1.5 bg-gradient-to-r from-white dark:from-gray-950 to-transparent pr-4"
            >
              <span className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center">
                <ChevronLeft size={13} className="text-gray-600 dark:text-gray-400" />
              </span>
            </button>
          )}

          {/* Scrollable tab row */}
          <div
            ref={tabsRef}
            className="flex gap-2 px-4 md:px-8 py-3 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {sections.map((sec, i) => (
              <button
                key={i}
                ref={(el) => (tabBtnRefs.current[i] = el)}
                onClick={() => jumpTo(i)}
                className={`flex-none px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-200 ${
                  activeIdx === i
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-transparent"
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>

          {/* Right arrow — only when more content exists to the right */}
          {canScrollRight && (
            <button
              onClick={() => scrollTabs(1)}
              aria-label="Scroll tabs right"
              className="absolute right-0 top-0 bottom-0 z-10 flex items-center px-1.5 bg-gradient-to-l from-white dark:from-gray-950 to-transparent pl-4"
            >
              <span className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center">
                <ChevronRight size={13} className="text-gray-600 dark:text-gray-400" />
              </span>
            </button>
          )}
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto overscroll-contain bg-white dark:bg-gray-950"
          style={{
            scrollbarWidth: "thin",
            WebkitOverflowScrolling: "touch",
            transform: "translateZ(0)",
          }}
        >
          <div className="px-4 md:px-8 py-6 space-y-10">
            {sections.map((section, sIdx) => (
              <div key={sIdx} ref={(el) => (sectionRefs.current[sIdx] = el)}>

                <SectionHeader label={section.label} title={section.title} />

                {phase === "open" ? (
                  /*
                   * PHASE 1 — slide animation is running.
                   * Static gray boxes: no CSS animation, no compositor layers,
                   * zero GPU competition with the slide-up.
                   */
                  <StaticGrid count={section.images.length} />
                ) : (
                  /*
                   * PHASE 2 — animation complete, GPU is free.
                   * Real PhotoCells mount: shimmer plays while each image loads,
                   * then fades to the real photo.
                   */
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {section.images.map((img, imgIdx) => {
                      const globalIdx = section.offset + imgIdx;
                      return (
                        <div
                          key={imgIdx}
                          className="relative aspect-video overflow-hidden rounded-xl cursor-pointer group hover:scale-[1.015] transition-transform duration-300"
                          onClick={() => setSliderIndex(globalIdx)}
                        >
                          <PhotoCell
                            src={img}
                            alt={`${section.title} ${imgIdx + 1}`}
                            priority={sIdx === 0}
                            onClick={() => setSliderIndex(globalIdx)}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 pointer-events-none rounded-xl" />
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                              <Expand size={11} className="text-gray-600 dark:text-gray-300" />
                              <span className="text-gray-600 dark:text-gray-300 text-[10px] font-medium">View</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            <div className="h-4" />
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
