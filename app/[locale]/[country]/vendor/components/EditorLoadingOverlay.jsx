"use client";

/**
 * EditorLoadingOverlay
 * ──────────────────────
 * Shared full-screen loading overlay for the "open listing editor"
 * transition. Used by BOTH:
 *   1. VenueCard  — the brief moment between tapping "Edit Listing"
 *      and the route push firing.
 *   2. listing/[id]/page.jsx — while the editor fetches listing data
 *      after the route has changed.
 *
 * Rendering the exact same component (same layout, same spinner) in
 * both places means the two phases read as ONE continuous overlay
 * instead of a jarring handoff between two different loading UIs.
 *
 * Theme: follows the site's existing dark-mode system (Tailwind
 * `dark` class on <html>, toggled via state + localStorage — see
 * project's ThemeContext). This overlay is NOT hardcoded dark; it
 * reads the live theme the same way listing/[id]/page.jsx does, so
 * light-mode users get a light glass overlay, not a black one.
 *
 * Always portaled to document.body — this escapes PageMainWrapper's
 * always-on framer-motion transform/filter in vendor/layout.jsx,
 * which otherwise turns `position: fixed` into "fixed relative to
 * that container" instead of the real viewport (same fix already
 * applied via CategoryTransitionOverlay).
 */

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const EASE_CINEMATIC = [0.16, 1, 0.3, 1];

function useIsDarkTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return isDark;
}

export default function EditorLoadingOverlay({
  show,
  title = "Opening Editor",
  subtitle,
}) {
  const [mounted, setMounted] = useState(false);
  const isDark = useIsDarkTheme();
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const tk = isDark
    ? {
        backdrop: "rgba(5, 6, 14, 0.62)",
        backdropFilter: "blur(26px) saturate(140%) brightness(0.6)",
        glow: "rgba(139, 92, 246, 0.22)",
        ringTrack: "rgba(255,255,255,0.10)",
        title: "rgba(255,255,255,0.96)",
        subtitle: "rgba(255,255,255,0.42)",
      }
    : {
        backdrop: "rgba(248, 250, 252, 0.78)",
        backdropFilter: "blur(22px) saturate(160%) brightness(1.02)",
        glow: "rgba(124, 58, 237, 0.10)",
        ringTrack: "rgba(15,23,42,0.08)",
        title: "#0f172a",
        subtitle: "rgba(15,23,42,0.46)",
      };

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.24, ease: "easeOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.32, ease: EASE_CINEMATIC } }}
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 9999,
            backdropFilter: tk.backdropFilter,
            WebkitBackdropFilter: tk.backdropFilter,
            backgroundColor: tk.backdrop,
          }}
          aria-hidden="true"
        >
          {/* Ambient brand glow */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            style={{
              background: `radial-gradient(ellipse 60% 46% at 50% 46%, ${tk.glow} 0%, transparent 78%)`,
            }}
          />

          {/* Loader content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{
              scale: 1, opacity: 1, y: 0,
              transition: { duration: 0.4, ease: EASE_CINEMATIC },
            }}
            exit={{
              scale: 0.94, opacity: 0, y: -10,
              transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
            }}
            className="relative flex flex-col items-center"
          >
            <Spinner ringTrack={tk.ringTrack} />

            <div className="flex flex-col items-center mt-6 gap-1.5">
              <p
                className="text-center"
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color: tk.title,
                }}
              >
                {title}
              </p>
              {subtitle && (
                <p
                  className="text-center max-w-[240px] truncate"
                  style={{
                    fontSize: "11px",
                    fontWeight: 400,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: tk.subtitle,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SPINNER
   Breathing glow + smooth conic-gradient ring (mask-based, no dashed
   gap) — reads as more premium than a static SVG stroke-dasharray
   spinner and needs no theme-matched "hole" fill since it's a ring
   cut with a mask, not a filled circle sitting on top of a track.
───────────────────────────────────────────────────────────────────────────── */
function Spinner({ ringTrack }) {
  return (
    <div className="relative w-16 h-16">
      {/* Static track ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: `2px solid ${ringTrack}` }}
      />

      {/* Breathing glow */}
      <motion.div
        className="absolute -inset-2 rounded-full pointer-events-none"
        animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 72%)",
          filter: "blur(6px)",
        }}
      />

      {/* Rotating gradient ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, #8b5cf6 30%, #6366f1 60%, transparent 78%)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          mask:
            "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
        }}
      />
    </div>
  );
}
