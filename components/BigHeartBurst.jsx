"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   BIG HEART BURST — Instagram-double-tap-style like animation, shown
   dead-centered over the image. Filled with heart-red. Slow, deliberate
   pop (~1.1s total) instead of a quick flash.

   The glow is a SEPARATE blurred circle layered behind the heart rather
   than a CSS `drop-shadow` on the heart itself — a drop-shadow follows
   the heart's exact (stroke-less, gradient-filled) silhouette and can
   render as an uneven/blotchy halo. A plain radial-gradient circle stays
   a clean, centered bloom no matter what.

   Purely decorative (`pointer-events-none`) and only ever mounted for the
   duration of the burst — see `showBigHeart` in the card component using it.

   NOTE: this is a byte-for-byte copy of the same-named component that
   lives inline inside search/[type]/components/VenueCard.jsx, EXCEPT the
   heart/glow sizes below are responsive (Search's own copy keeps its
   original fixed 84px/130px). It was duplicated rather than
   extracted-and-imported there, specifically so the Search page's file
   stays completely untouched (per explicit instruction). Yes, this means
   the animation now exists in two places — a deliberate, disclosed
   trade-off in favor of never touching Search.
   ═══════════════════════════════════════════════════════════════════════════ */
const BigHeartBurst = React.memo(function BigHeartBurst({ gradientId }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-[3] pointer-events-none"
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.2, 1, 1.05] }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.9,
        times: [0, 0.4, 0.75, 1],
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Soft round glow, centered behind the heart — sized in step with
          the heart itself across breakpoints instead of one fixed 130px */}
      <div
        className="absolute w-20 h-20 md:w-28 md:h-28 lg:w-[130px] lg:h-[130px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,48,64,0.45) 0%, rgba(255,48,64,0) 70%)",
          filter: "blur(6px)",
        }}
      />

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3040" />
            <stop offset="100%" stopColor="#FF3040" />
          </linearGradient>
        </defs>
      </svg>
      <Heart
        className="w-12 h-12 md:w-16 md:h-16 lg:w-[84px] lg:h-[84px]"
        fill={`url(#${gradientId})`}
        stroke="none"
        style={{ position: "relative" }}
      />
    </motion.div>
  );
});

export default BigHeartBurst;
