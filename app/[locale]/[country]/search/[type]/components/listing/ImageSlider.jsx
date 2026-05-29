"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ImageSlider({ images, index, setIndex, onClose }) {
  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black z-50 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* 🔹 HEADER */}
        <div className="flex justify-between items-center p-4 text-white">
          <button onClick={onClose}>
            <X size={28} />
          </button>
          <p className="text-sm">
            {index + 1} / {images.length}
          </p>
        </div>

        {/* 🔹 IMAGE */}
        <div className="flex-1 flex items-center justify-center px-2">
          <motion.img
            key={index}
            src={images[index]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-h-[75vh] w-auto rounded-xl"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset }) => {
              if (offset.x < -60) next();
              if (offset.x > 60) prev();
            }}
          />
        </div>

        {/* 🔹 CONTROLS */}
        <div className="flex justify-between items-center px-6 pb-6 text-white">
          <button onClick={prev} className="text-3xl">‹</button>
          <button onClick={next} className="text-3xl">›</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
