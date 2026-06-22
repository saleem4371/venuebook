"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { useCallback, useRef, useState } from "react";

// Preloads the first N images into browser cache so the modal opens to warm content.
// Fires at most once per Gallery mount — on first hover or touch of "Show all photos".
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

export default function Gallery({ images, setOpen, openTour }) {
  const [index, setIndex] = useState(0);
  const preload = useImagePreloader(images);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  const sideImages = images.slice(1, 5);

  return (
    <>
      {/* ================= MOBILE SLIDER ================= */}
      <div
        className="relative w-full h-[260px] sm:h-[320px] overflow-hidden rounded-2xl lg:hidden"
        onMouseEnter={preload}
        onTouchStart={preload}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index]}
            onClick={openTour}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, { offset }) => {
              if (offset.x < -50) next();
              if (offset.x > 50) prev();
            }}
            className="w-full h-full object-cover cursor-pointer"
          />
        </AnimatePresence>

        {/* Prev / Next */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition"
        >
          <ChevronRight size={16} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === index ? "bg-white w-5" : "bg-white/50 w-1.5"
              }`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
          {index + 1} / {images.length}
        </div>
      </div>

      {/* ================= DESKTOP GRID ================= */}
      <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-2 rounded-2xl overflow-hidden relative h-[480px]">

        {/* ── Main Image ── */}
        <div
          className="row-span-2 relative overflow-hidden cursor-pointer group"
          onClick={openTour}
          onMouseEnter={preload}
        >
          <img
            src={images[0]}
            alt="Main"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/18 transition-colors duration-300 pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 30% 80%, rgba(0,0,0,0.18) 0%, transparent 65%)",
            }}
          />
        </div>

        {/* ── Side Images ── */}
        {sideImages.map((img, i) => (
          <div
            key={i}
            className="relative overflow-hidden cursor-pointer group"
            onClick={openTour}
          >
            <img
              src={img}
              alt={`Photo ${i + 2}`}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.07]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: "linear-gradient(125deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.0) 100%)",
              }}
            />
          </div>
        ))}

        {/* ── Show all button ── */}
        {/* Preloads remaining images on hover so modal content is warm */}
        <button
          onClick={openTour}
          onMouseEnter={preload}
          onTouchStart={preload}
          className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 text-sm font-medium px-4 py-2 rounded-xl shadow-md flex items-center gap-2 hover:bg-white hover:shadow-lg active:scale-95 transition-all duration-200 border border-gray-100"
        >
          <LayoutGrid size={15} strokeWidth={2} />
          Show all photos
        </button>
      </div>
    </>
  );
}
