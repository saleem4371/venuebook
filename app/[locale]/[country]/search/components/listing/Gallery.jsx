"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Gallery({ images, setOpen ,openTour}) {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      {/* ================= MOBILE SLIDER ================= */}
      <div className="relative w-full h-[260px] sm:h-[320px] overflow-hidden rounded-2xl lg:hidden">

        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index]}
              onClick={openTour}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset }) => {
              if (offset.x < -50) next();
              if (offset.x > 50) prev();
            }}
            className="w-full h-full object-cover cursor-pointer"
          />
        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full ${
                i === index ? "bg-white scale-125" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
          {index + 1}/{images.length}
        </div>
      </div>

      {/* ================= DESKTOP GRID ================= */}
      <div className="hidden lg:grid grid-cols-4 gap-2 rounded-2xl overflow-hidden relative">

        {/* Main Image */}
        <motion.div
          
           onClick={openTour}
          className="col-span-2 row-span-2 cursor-pointer"
        >
          <img
            src={images[0]}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Side Images */}
        {images.slice(1, 5).map((img, i) => (
          <motion.div
            key={i}
            
             onClick={openTour}
            className="cursor-pointer"
          >
            <img
              src={img}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}

        {/* Show all */}
        <button
          onClick={openTour}
          className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          Show all photos
        </button>
      </div>
    </>
  );
}
