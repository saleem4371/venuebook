"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   LogoutOverlay — minimal full-screen cover shown while logout processes.
   Fades in at z-[99999], hiding any broken layout underneath.
   The caller handles timing + hard navigation (window.location.href).
─────────────────────────────────────────────────────────────────────────────── */
export default function LogoutOverlay({ open }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (open) setIsDark(document.documentElement.classList.contains("dark"));
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="vb-logout-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 99999,
            background: isDark ? "#030712" : "#ffffff",
            pointerEvents: "all",
          }}
          role="status"
          aria-label="Signing out"
        >
          <SpinnerRing isDark={isDark} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SpinnerRing({ isDark }) {
  return (
    <>
      <style>{`
        @keyframes vb-logout-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <svg
        width="36" height="36" viewBox="0 0 36 36"
        fill="none" aria-hidden="true"
        style={{ animation: "vb-logout-spin 0.75s linear infinite" }}
      >
        <defs>
          <linearGradient id="vb-lo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a44bf3" />
            <stop offset="100%" stopColor="#499ce8" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="14"
          stroke={isDark ? "#1f2937" : "#e5e7eb"} strokeWidth="3" />
        <path d="M32 18A14 14 0 0 0 18 4"
          stroke="url(#vb-lo-g)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </>
  );
}
