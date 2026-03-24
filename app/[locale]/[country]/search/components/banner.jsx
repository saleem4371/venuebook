"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdBannerSlider({ ads = [], autoSlide = true, interval = 4000 }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

  if (!ads || ads.length === 0) return null;

  const prev = () => {
    setDirection(-1);
    setCurrent(current > 0 ? current - 1 : ads.length - 1);
  };

  const next = () => {
    setDirection(1);
    setCurrent(current < ads.length - 1 ? current + 1 : 0);
  };

  // Auto-slide effect
  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(() => {
      next();
    }, interval);
    return () => clearInterval(slideInterval);
  }, [current, autoSlide, interval]);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300, // slide from left/right
      opacity: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300, // slide out opposite
      opacity: 1,
    }),
  };

  return (
    <div className="relative w-full h-[130px] overflow-hidden rounded-2xl">
      <AnimatePresence custom={direction} initial={false}>
        <motion.img
          key={current}
          src={ads[current]}
          alt={`Ad ${current + 1}`}
          className="absolute top-0 left-0 w-full h-full object-cover"
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>

      {/* LEFT / RIGHT ARROWS */}
      {ads.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full shadow hover:bg-white z-20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full shadow hover:bg-white z-20"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
