"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * ViewAllCard
 * ─────────────────────────────────────────────────────────────
 * The last card in a rail — a stacked-photo collage + "See all",
 * same footprint as its siblings so it sits naturally at the end
 * of the row instead of living only as a header link.
 */
export default function ViewAllCard({ images = [], label = "See all", onClick }) {
  const thumbs = images.filter(Boolean).slice(0, 3);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)] hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 text-start"
    >
      {/* Collage */}
      <div className="relative h-48 bg-gray-50 dark:bg-gray-800/60 overflow-hidden">
        {thumbs.length ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {thumbs.map((src, i) => {
              const offset = i - (thumbs.length - 1) / 2;
              return (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="absolute w-24 h-24 rounded-xl object-cover border-2 border-white dark:border-gray-900 shadow-md"
                  style={{
                    transform: `translateX(${offset * 34}px) rotate(${offset * 8}deg)`,
                    zIndex: 10 - Math.abs(offset),
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowRight className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>

      {/* Label */}
      <div className="flex-1 p-3 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 font-semibold text-sm text-gray-900 dark:text-gray-50">
          {label}
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </motion.button>
  );
}
