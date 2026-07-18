"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid, ImageOff } from "lucide-react";
import { useCallback, useRef, useState } from "react";

function useImagePreloader(images, count = 10) {
  const fired = useRef(false);
  return useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    images.slice(0, count).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images, count]);
}

// Pure translateX slide — no opacity, no flash, GPU-accelerated
const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit:  (dir) => ({ x: dir >= 0 ? "-100%" : "100%" }),
};

// ── Skeleton-backed image ────────────────────────────────────────────────
// Shows an animated shimmer skeleton until the image loads. If it errors,
// stays on the skeleton (no broken-image icon / "no image available" box).
function SkeletonImage({ src, alt, className, style, onClick, onMouseEnter, loading, decoding }) {
  const [status, setStatus] = useState("loading"); // "loading" | "loaded" | "error"

  return (
    <div className="relative w-full h-full" onClick={onClick} onMouseEnter={onMouseEnter}>
      {status !== "loaded" && (
        <div className="absolute inset-0 overflow-hidden bg-neutral-200">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.55) 50%, rgba(0,0,0,0) 100%)",
              backgroundSize: "200% 100%",
              animation: "skeleton-shimmer 1.4s ease-in-out infinite",
            }}
          />
        </div>
      )}
      {status !== "error" && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          draggable={false}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={className}
          style={{ ...style, opacity: status === "loaded" ? 1 : 0, transition: "opacity 0.3s ease" }}
        />
      )}
      <style jsx>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default function Gallery({ images, setOpen, openTour }) {
  const [index, setIndex] = useState(0);
  const [dir,   setDir]   = useState(1);
  const preload           = useImagePreloader(images || []);

  // Native touch tracking — no Framer drag (avoids gesture conflicts)
  const touchStartX = useRef(null);

  const navigate = useCallback((newDir) => {
    setDir(newDir);
    setIndex((prev) =>
      newDir > 0
        ? (prev + 1) % images.length
        : (prev - 1 + images.length) % images.length
    );
  }, [images?.length]);

  // ── EMPTY STATE ────────────────────────────────────────────────────────
  if (!images || images.length === 0) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-neutral-100 flex flex-col items-center justify-center gap-2 h-[220px] md:h-[480px] -mx-4 sm:-mx-6 md:mx-0 text-neutral-400">
        <ImageOff size={28} strokeWidth={1.75} />
        <span className="text-sm font-medium">No photos available</span>
      </div>
    );
  }

  const sideImages = images.slice(1, 5);
  // Pad out to 4 so the desktop grid never hits an undefined src
  while (sideImages.length < 4) {
    sideImages.push(images[0]);
  }

  return (
    <>
      {/* ── MOBILE SLIDER ──────────────────────────────────────────────────── */}
      <div
        className="relative w-screen -mx-4 sm:-mx-6 overflow-hidden md:hidden"
        style={{ height: "clamp(220px, 56vw, 360px)", touchAction: "pan-y" }}
        onMouseEnter={preload}
        onTouchStart={(e) => {
          preload();
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 44) navigate(dx < 0 ? 1 : -1);
          touchStartX.current = null;
        }}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0"
            style={{ willChange: "transform" }}
          >
            <SkeletonImage
              src={images[index]}
              alt={`Photo ${index + 1}`}
              onClick={openTour}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Arrow buttons */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center transition z-10"
          aria-label="Previous photo"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center transition z-10"
          aria-label="Next photo"
        >
          <ChevronRight size={16} />
        </button>

        {/* Counter only — no dots */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium z-10 tabular-nums">
          {index + 1} / {images.length}
        </div>

        {/* Tap to open tour */}
        <button
          onClick={openTour}
          className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium z-10 flex items-center gap-1.5"
        >
          <LayoutGrid size={12} />
          All photos
        </button>
      </div>

      {/* ── DESKTOP GRID ───────────────────────────────────────────────────── */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-2 rounded-2xl overflow-hidden relative h-[480px]">

        {/* Main image */}
        <div className="row-span-2 relative overflow-hidden cursor-pointer group">
          <SkeletonImage
            src={images[0]}
            alt="Main"
            loading="eager"
            decoding="async"
            onClick={openTour}
            onMouseEnter={preload}
            className="w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.18] transition-colors duration-300 pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 30% 80%, rgba(0,0,0,0.18) 0%, transparent 65%)" }}
          />
        </div>

        {/* First 3 side images */}
        {sideImages.slice(0, 3).map((img, i) => (
          <div key={i} className="relative overflow-hidden cursor-pointer group">
            <SkeletonImage
              src={img}
              alt={`Photo ${i + 2}`}
              loading="eager"
              decoding="async"
              onClick={openTour}
              className="w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.07]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
          </div>
        ))}

        {/* Last tile — dark overlay + "Show all" label */}
        <div className="relative overflow-hidden cursor-pointer group">
          <SkeletonImage
            src={sideImages[3]}
            alt="Photo 5"
            loading="eager"
            decoding="async"
            onClick={openTour}
            onMouseEnter={preload}
            className="w-full h-full object-cover transition-transform duration-300 will-change-transform group-hover:scale-[1.01]"
          />
          <div
            className="absolute inset-0 transition-all duration-200"
            style={{ background: "rgba(0,0,0,0.58)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.70)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.58)")}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <LayoutGrid size={24} color="#ffffff" strokeWidth={2} />
            <span className="text-white text-sm lg:text-base font-semibold">
              Show all {images.length} photos
            </span>
          </div>
        </div>

      </div>
    </>
  );
}