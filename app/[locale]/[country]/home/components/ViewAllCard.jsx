"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* Straight-edged photo mosaic (Airbnb collection-cover style) instead of
   a rotated fan of floating cards — one big photo + up to two smaller
   ones stacked beside it, hairline gaps, no rotation. Each photo still
   gets a subtle zoom on hover, driven off the PARENT's hover via Framer
   Motion variant propagation: the button below sets initial="rest" /
   whileHover="hover", and every child image sharing these variant names
   (without its own initial/whileHover) animates automatically — no
   per-image hover handlers needed. */
const zoomVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.06 },
};

const liftVariants = {
  rest: { y: 0 },
  hover: { y: -6 },
};

/* Same image-aspect map PropertyCard uses per variant, so the mosaic is
   genuinely the same size as the sibling images in its row instead of
   stretching to fill whatever space is left over. */
const IMAGE_ASPECT = {
  editorial: "aspect-[6/5]",
  medium: "aspect-[5/4]",
  landscape: "aspect-[16/10]",
  compact: "aspect-square",
};

/**
 * ViewAllCard
 * ─────────────────────────────────────────────────────────────
 * The last card in a rail — same footprint as its PropertyCard
 * siblings, and split the same way: the photo mosaic is its own
 * fully-rounded image-card (same aspect ratio as `variant`, matching
 * the sibling cards exactly), and "View all" sits centered below it.
 */
export default function ViewAllCard({ images = [], label = "View all", onClick, accent = "#7c3aed", variant = "medium" }) {
  const thumbs = images.filter(Boolean).slice(0, 3);
  const aspect = IMAGE_ASPECT[variant] ?? IMAGE_ASPECT.medium;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={liftVariants}
      transition={{ duration: 0.2 }}
      className="group w-full flex flex-col text-start cursor-pointer"
    >
      {/* Mosaic — same aspect ratio + rounding/shadow treatment as the
          sibling PropertyCard images in this row */}
      <div className={`relative ${aspect} rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:shadow-[0_14px_32px_rgba(0,0,0,0.12)] transition-shadow duration-300`}>
        {thumbs.length >= 3 ? (
          <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
            <motion.img
              variants={zoomVariants}
              transition={{ duration: 0.4 }}
              src={thumbs[0]}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="grid grid-rows-2 gap-0.5">
              <motion.img
                variants={zoomVariants}
                transition={{ duration: 0.4 }}
                src={thumbs[1]}
                alt=""
                className="w-full h-full object-cover"
              />
              <motion.img
                variants={zoomVariants}
                transition={{ duration: 0.4 }}
                src={thumbs[2]}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : thumbs.length === 2 ? (
          <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
            {thumbs.map((src, i) => (
              <motion.img
                key={i}
                variants={zoomVariants}
                transition={{ duration: 0.4 }}
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        ) : thumbs.length === 1 ? (
          <motion.img
            variants={zoomVariants}
            transition={{ duration: 0.4 }}
            src={thumbs[0]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowRight className="w-8 h-8" style={{ color: accent }} />
          </div>
        )}

        {/* Subtle bottom scrim — same visual language as PropertyCard's own photo overlay */}
        {thumbs.length > 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0 pointer-events-none" />
        )}
      </div>

      {/* Content — centered below the mosaic, same vertical rhythm as
          PropertyCard's content block but centered rather than left-led,
          since there's no name/location/price to left-align against */}
      <div className="pt-2.5 flex items-center justify-center gap-2">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ background: `${accent}1a`, color: accent }}
        >
          <ArrowRight size={14} />
        </span>
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-50 truncate">{label}</span>
      </div>
    </motion.button>
  );
}
