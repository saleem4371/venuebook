"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

// ─── LIKE BUTTON ───────────────────────────────────────────────────────────
//
// Just the heart — no circular backdrop, no box-shadow. The heart sits
// directly on the photo with a light stroke (Airbnb-style) for contrast,
// a dark translucent fill when empty, and heart-red when liked.
//
// On like: the heart scales 0.9 → 1.15 → 1, the fill transitions
// smoothly, and a tiny (~150ms) red glow pulses behind it.
//
// Usage:
//   <LikeButton liked={false} onChange={(liked) => ...} />
//
// Fully controlled OR uncontrolled:
//   - Pass `liked` + `onChange` to control it from a parent (e.g. to
//     persist to a backend, with optimistic updates + rollback).
//   - Omit `liked` and it manages its own state from `initialLiked`.

const LIKE_COLOR = "#FF3040"; // Heart red — classic "liked" color

export default function LikeButton({
  liked: likedProp,
  initialLiked = false,
  onChange,
  size = 18,
  className = "",
}) {
  const isControlled = likedProp !== undefined;

  const [internalLiked, setInternalLiked] = useState(initialLiked);
  const liked = isControlled ? likedProp : internalLiked;

  const [glow, setGlow] = useState(false);
  const glowTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(glowTimerRef.current), []);

  const handleClick = (e) => {
    // Stop the click from bubbling — this button is often nested inside a
    // clickable card/link, and a like tap should never also trigger
    // navigation.
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const nextLiked = !liked;

    if (!isControlled) setInternalLiked(nextLiked);
    onChange?.(nextLiked);

    if (nextLiked) {
      setGlow(true);
      clearTimeout(glowTimerRef.current);
      glowTimerRef.current = setTimeout(() => setGlow(false), 150);
    }
  };

  return (
    <motion.button
      type="button"
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      onClick={handleClick}
      className={className}
      whileTap={{ scale: 0.9 }}
      animate={{ scale: liked ? [0.9, 1.15, 1] : 1 }}
      transition={{ duration: 0.24, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        // Inline styles always beat a className, so an "absolute" class
        // passed in for card positioning (e.g. top-3 right-3) must be
        // reflected here too — otherwise this "relative" would win and
        // the button would sit in normal flow instead of the corner.
        position: /\babsolute\b/.test(className) ? "absolute" : "relative",
        // No fixed circular box anymore — the button hugs the heart
        // itself (plus a small hit-area) instead of an invisible
        // oversized circle that offset it from the true corner.
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        padding: 4,
        margin: -4,
        cursor: "pointer",
        overflow: "visible",
      }}
    >
      {/* Purple glow pulse — ~150ms, only on like. Confined tight to the
          heart glyph itself (not an oversized circle). */}
      <AnimatePresence>
        {glow && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.55, scale: 1.5 }}
            exit={{ opacity: 0, scale: 1.7 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${LIKE_COLOR}70 0%, ${LIKE_COLOR}00 70%)`,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Light stroke (Airbnb-style) keeps the heart legible on any photo
          without a shadow or backing circle. Empty state uses a soft dark
          tint fill instead of a hollow outline. */}
      <Heart
        size={size}
        fill={liked ? LIKE_COLOR : "rgba(0,0,0,0.35)"}
        color="rgba(255,255,255,0.95)"
        strokeWidth={1.5}
        style={{
          position: "relative",
          zIndex: 1,
          transition: "fill .22s ease",
        }}
      />
    </motion.button>
  );
}
