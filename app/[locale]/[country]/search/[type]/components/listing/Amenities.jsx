"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ImageModal({ images, index, setIndex, onClose }) {
  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-white">
          <X size={30} />
        </button>

        <motion.img
          key={index}
          src={images[index]}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-h-[80vh] rounded-xl"
        />

        {/* Navigation */}
        <button
          onClick={prev}
          className="absolute left-5 text-white text-3xl"
        >
          ‹
        </button>

        <button
          onClick={next}
          className="absolute right-5 text-white text-3xl"
        >
          ›
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
