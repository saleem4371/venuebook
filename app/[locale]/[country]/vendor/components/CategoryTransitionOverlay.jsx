"use client";

/**
 * CategoryTransitionOverlay
 * ──────────────────────────
 * Premium fullscreen workspace-switch transition.
 *
 * Design system: Linear / Apple / Stripe — cinematic, expensive, quiet.
 *
 * Images: Static local PNGs from /assets/Properties/ — zero network delay,
 *         bundled at build time, available instantly on first render.
 *
 * Phase flow (from VendorCategoryContext):
 *   'shrinking' → veil + overlay appear; background freezes + blurs
 *   'loading'   → fullscreen illustration enters; progress bar fills
 *   'idle'      → AnimatePresence exit (~420 ms)
 *
 * Motion choreography:
 *   1. Backdrop fades in 240 ms
 *   2. Illustration scales in from 0.86 → 1, lifts from y=28 → 0 (480 ms)
 *   3. Continuous 3.6 s float loop begins after entrance completes
 *   4. Text + progress bar stagger in 220 ms after illustration
 *   5. Progress bar fills 0 → 90% over 1.35 s with fast-start / slow-finish ease
 *   6. Exit: illustration scales out + rises, backdrop fades (420 ms)
 */

import { useEffect, useState }  from "react";
import { createPortal }         from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useVendorCategory }    from "@/context/VendorCategoryContext";

/* ─────────────────────────────────────────────────────────────────────────────
   STATIC ILLUSTRATION IMPORTS
   Bundled at build time — no network request, no loading state.
───────────────────────────────────────────────────────────────────────────── */
import venueImg      from "@/assets/Properties/Venue.png";
import farmstayImg   from "@/assets/Properties/Farmstay.png";
import studioImg     from "@/assets/Properties/Studio.png";
import workspaceImg  from "@/assets/Properties/Workspace.png";
import rentalImg     from "@/assets/Properties/Rental.png";
import experienceImg from "@/assets/Properties/Experience.png";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY CONFIG
───────────────────────────────────────────────────────────────────────────── */
const THEMES = {
  venues: {
    label: "Venues",
    img:   venueImg,
    rgb:   "124, 58, 237",
    from:  "#8b5cf6",
    to:    "#499ce8",
  },
  farmstays: {
    label: "Farmstays",
    img:   farmstayImg,
    rgb:   "5, 150, 105",
    from:  "#10b981",
    to:    "#34d399",
  },
  studios: {
    label: "Studios",
    img:   studioImg,
    rgb:   "217, 119, 6",
    from:  "#f97316",
    to:    "#fbbf24",
  },
  workspaces: {
    label: "Workspaces",
    img:   workspaceImg,
    rgb:   "8, 145, 178",
    from:  "#0891b2",
    to:    "#60a5fa",
  },
  rentals: {
    label: "Rentals",
    img:   rentalImg,
    rgb:   "37, 99, 235",
    from:  "#3b82f6",
    to:    "#818cf8",
  },
  experiences: {
    label: "Experiences",
    img:   experienceImg,
    rgb:   "219, 39, 119",
    from:  "#ec4899",
    to:    "#f59e0b",
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   EASING CURVES
───────────────────────────────────────────────────────────────────────────── */
const EASE_CINEMATIC = [0.16, 1, 0.3, 1];      /* Expo out — premium deceleration */
const EASE_IN_SHARP  = [0.4,  0, 1,   1];      /* Ease in  — clean exit           */
const EASE_PROGRESS  = [0.22, 0.61, 0.36, 1];  /* Fast start, slow finish         */

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function CategoryTransitionOverlay() {
  const { phase, nextCategory } = useVendorCategory();
  
  const [mounted, setMounted]   = useState(false);

  useEffect(() => setMounted(true), []);

  const category = localStorage.getItem("activeCategory");

  /*
   * Read nextCategory (destination), NOT activeCategory (current).
   * nextCategory is set synchronously the moment the user taps a category,
   * so the overlay always shows the TARGET image from its very first frame —
   * no flicker of the old category image.
   */
  const theme     = THEMES[category] ?? THEMES.venues;
  const isVisible = phase !== "idle";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isVisible && (
        <Overlay key="category-switch-overlay" theme={theme} />
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   OVERLAY
───────────────────────────────────────────────────────────────────────────── */
function Overlay({ theme }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.24, ease: "easeOut" } }}
      exit={{    opacity: 0, transition: { duration: 0.42, ease: EASE_CINEMATIC } }}
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex:               9999,
        backdropFilter:       "blur(28px) saturate(65%) brightness(0.52)",
        WebkitBackdropFilter: "blur(28px) saturate(65%) brightness(0.52)",
        backgroundColor:      "rgba(4, 4, 10, 0.52)",
      }}
      aria-hidden="true"
    >
      {/* Per-category ambient radial glow */}
      <AmbientGlow theme={theme} />

      {/* Centered content column */}
      <div className="relative flex flex-col items-center" style={{ gap: 0 }}>
        <IllustrationBlock theme={theme} />
        <TextBlock theme={theme} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AMBIENT GLOW
───────────────────────────────────────────────────────────────────────────── */
function AmbientGlow({ theme }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.7, ease: "easeOut" } }}
      exit={{    opacity: 0, transition: { duration: 0.3 } }}
      style={{
        background: `radial-gradient(
          ellipse 72% 55% at 50% 42%,
          rgba(${theme.rgb}, 0.12) 0%,
          rgba(${theme.rgb}, 0.04) 60%,
          transparent 82%
        )`,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ILLUSTRATION BLOCK
   Layer 1 — entrance: opacity / scale / y   (480 ms, EASE_CINEMATIC)
   Layer 2 — float loop: y [0, -12, 0]       (3.6 s, delayed until entrance ends)
───────────────────────────────────────────────────────────────────────────── */
function IllustrationBlock({ theme }) {
  /* next/image imported assets give us an object { src, width, height };
     plain <img> works fine here — it's a transient overlay, not a page LCP image. */
  const src = typeof theme.img === "object" ? theme.img.src : theme.img;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.86, y: 28 }}
      animate={{
        opacity: 1,
        scale:   1,
        y:       0,
        transition: { duration: 0.48, ease: EASE_CINEMATIC },
      }}
      exit={{
        opacity: 0,
        scale:   0.92,
        y:       -18,
        transition: { duration: 0.28, ease: EASE_IN_SHARP },
      }}
      className="relative flex items-center justify-center"
      style={{
        width:  "clamp(200px, 30vw, 340px)",
        height: "clamp(200px, 30vw, 340px)",
      }}
    >
      {/* Soft depth glow ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          inset:      "-32px",
          background: `radial-gradient(ellipse at center,
            rgba(${theme.rgb}, 0.20) 0%,
            rgba(${theme.rgb}, 0.06) 50%,
            transparent 72%
          )`,
          filter: "blur(28px)",
        }}
      />

      {/* Float layer — starts after entrance completes */}
      <motion.div
        className="relative w-full h-full"
        animate={{ y: [0, -12, 0] }}
        transition={{
          duration:   3.6,
          ease:       "easeInOut",
          repeat:     Infinity,
          repeatType: "mirror",
          delay:      0.48,
        }}
      >
        <img
          src={src}
          alt={theme.label}
          className="w-full h-full object-contain select-none"
          style={{
            filter:     "drop-shadow(0 40px 80px rgba(0,0,0,0.55)) drop-shadow(0 8px 20px rgba(0,0,0,0.30))",
            userSelect: "none",
          }}
          draggable="false"
        />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TEXT BLOCK
   Staggers in 220 ms after illustration entrance begins.
───────────────────────────────────────────────────────────────────────────── */
function TextBlock({ theme }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      style={{ gap: "10px", marginTop: "clamp(24px, 3.5vw, 36px)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y:       0,
        transition: { duration: 0.45, ease: EASE_CINEMATIC, delay: 0.22 },
      }}
      exit={{
        opacity: 0,
        y:       -10,
        transition: { duration: 0.22, ease: EASE_IN_SHARP },
      }}
    >
      {/* Category name */}
      <span
        style={{
          fontSize:      "clamp(24px, 4vw, 36px)",
          fontWeight:    700,
          letterSpacing: "-0.015em",
          lineHeight:    1.08,
          color:         "rgba(255, 255, 255, 0.96)",
        }}
      >
        {theme.label}
      </span>

      {/* Subtitle */}
      <span
        style={{
          fontSize:      "clamp(10px, 1.2vw, 12px)",
          fontWeight:    400,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color:         "rgba(255, 255, 255, 0.36)",
        }}
      >
        Switching workspace
      </span>

      <ProgressBar theme={theme} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROGRESS BAR
   Fills 0 → 90% over 1.35 s.
   Trailing luminance tip rides the fill edge for depth.
───────────────────────────────────────────────────────────────────────────── */
function ProgressBar({ theme }) {
  return (
    <div
      className="relative overflow-hidden rounded-full"
      style={{
        width:      "clamp(96px, 14vw, 140px)",
        height:     "2px",
        marginTop:  "6px",
        background: "rgba(255, 255, 255, 0.08)",
      }}
      aria-hidden="true"
    >
      {/* Fill track */}
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }}
        initial={{ width: "0%" }}
        animate={{
          width: "90%",
          transition: { duration: 1.35, ease: EASE_PROGRESS, delay: 0.12 },
        }}
        exit={{
          width: "100%",
          transition: { duration: 0.18, ease: "easeOut" },
        }}
      />

      {/* Trailing luminance tip */}
      <motion.div
        className="absolute inset-y-0 rounded-full"
        style={{
          width:      "20px",
          background: "rgba(255, 255, 255, 0.22)",
          filter:     "blur(4px)",
        }}
        initial={{ left: "-20px" }}
        animate={{
          left: "calc(90% - 10px)",
          transition: { duration: 1.35, ease: EASE_PROGRESS, delay: 0.12 },
        }}
        exit={{
          left: "100%",
          transition: { duration: 0.18, ease: "easeOut" },
        }}
      />
    </div>
  );
}
