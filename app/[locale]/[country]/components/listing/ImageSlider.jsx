"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Pure translateX slide — same animation used by iOS Photos
const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit:  (dir) => ({ x: dir >= 0 ? "-100%" : "100%" }),
};

function getTouchDist(touches) {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );
}

export default function ImageSlider({ images, index, setIndex, onClose }) {
  const [dir,   setDir]   = useState(1);
  const [scale, setScale] = useState(1);
  const [pan,   setPan]   = useState({ x: 0, y: 0 });

  const touchStartX   = useRef(null);
  const touchStartY   = useRef(null);
  const lastPinchDist = useRef(null);
  const lastPanPos    = useRef(null);
  const lastTapTime   = useRef(0);

  // ── Navigate to prev/next image ──────────────────────────────────────────
  const navigate = useCallback((newDir) => {
    if (scale > 1.05) return; // block nav while zoomed
    setDir(newDir);
    setScale(1);
    setPan({ x: 0, y: 0 });
    setIndex((prev) =>
      newDir > 0
        ? (prev + 1) % images.length
        : (prev - 1 + images.length) % images.length
    );
  }, [images.length, scale, setIndex]);

  // ── Keyboard: ← → ESC ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") navigate(1);
      else if (e.key === "ArrowLeft") navigate(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, onClose]);

  // ── Touch: swipe nav, swipe-down close, pinch zoom, pan when zoomed ──────
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      lastPanPos.current  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.touches.length === 2) {
      lastPinchDist.current = getTouchDist(e.touches);
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const dist  = getTouchDist(e.touches);
      const ratio = lastPinchDist.current ? dist / lastPinchDist.current : 1;
      setScale((s) => Math.min(Math.max(s * ratio, 1), 5));
      lastPinchDist.current = dist;
    } else if (e.touches.length === 1 && scale > 1.05) {
      // Pan image when zoomed in
      const dx = e.touches[0].clientX - (lastPanPos.current?.x ?? e.touches[0].clientX);
      const dy = e.touches[0].clientY - (lastPanPos.current?.y ?? e.touches[0].clientY);
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const onTouchEnd = (e) => {
    lastPinchDist.current = null;
    // Snap back to 1× if pinch ended near identity
    if (scale < 1.08) { setScale(1); setPan({ x: 0, y: 0 }); }

    if (e.changedTouches.length === 1 && touchStartX.current !== null) {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (scale <= 1.05) {
        if (Math.abs(dy) > 80 && Math.abs(dy) > Math.abs(dx)) {
          onClose(); // swipe down to dismiss
        } else if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          navigate(dx < 0 ? 1 : -1); // swipe left/right
        }
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // ── Double-tap to zoom / unzoom ──────────────────────────────────────────
  const onDoubleTap = (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      setScale((s) => (s > 1 ? 1 : 2.5));
      setPan({ x: 0, y: 0 });
      lastTapTime.current = 0;
    } else {
      lastTapTime.current = now;
    }
  };

  return (
    // Outer fade-in only for the overlay shell — images themselves never fade
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* ── Header ── */}
      <div className="flex-none flex items-center justify-between px-4 py-3 z-10">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition"
          aria-label="Close viewer"
        >
          <X size={20} className="text-white" />
        </button>

        <p className="text-sm text-white/60 font-medium tabular-nums">
          {index + 1} / {images.length}
        </p>

        {/* Spacer to centre the counter */}
        <div className="w-10" aria-hidden />
      </div>

      {/* ── Image viewport ── */}
      <div
        className="flex-1 relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={onDoubleTap}
      >
        {/*
          Both enter + exit images are absolute and animate simultaneously —
          no blank frame, no opacity change. Pure physical slide.
        */}
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ willChange: "transform" }}
          >
            <img
              src={images[index]}
              alt={`Photo ${index + 1}`}
              className="max-h-full max-w-full object-contain select-none"
              draggable={false}
              style={{
                transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
                transformOrigin: "center",
                transition: scale === 1 ? "transform 0.22s ease" : "none",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Desktop arrows — hidden on touch devices */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate(-1); }}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 items-center justify-center text-white transition z-10"
          aria-label="Previous photo"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(1); }}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 items-center justify-center text-white transition z-10"
          aria-label="Next photo"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </motion.div>
  );
}
