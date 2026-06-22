"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ImageSlider({ images, index, setIndex, onClose }) {
  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-white dark:bg-gray-950 z-[60] flex flex-col"
        style={{ willChange: "transform" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
      >
        {/* Header */}
        <div className="flex-none flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <X size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
            {index + 1} / {images.length}
          </p>
        </div>

        {/* Image + side arrows */}
        <div className="flex-1 flex items-center justify-center relative px-16 bg-gray-50 dark:bg-gray-900">
          {/* Prev arrow */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-gray-700 dark:text-gray-300 transition z-10"
          >
            <ChevronLeft size={22} />
          </button>

          <motion.img
            key={index}
            src={images[index]}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="max-h-[78vh] max-w-full w-auto rounded-2xl object-contain shadow-lg"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, { offset }) => {
              if (offset.x < -60) next();
              if (offset.x > 60) prev();
            }}
          />

          {/* Next arrow */}
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-gray-700 dark:text-gray-300 transition z-10"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Dot strip */}
        <div className="flex-none flex justify-center gap-1.5 py-5 border-t border-gray-100 dark:border-gray-800">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === index
                  ? "bg-gray-800 dark:bg-white w-5 h-1.5"
                  : "bg-gray-300 dark:bg-gray-600 w-1.5 h-1.5 hover:bg-gray-400 dark:hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
