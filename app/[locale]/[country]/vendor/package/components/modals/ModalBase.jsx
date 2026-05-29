"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ModalBase — cinematic overlay primitive.
 *
 * variant="panel"   (default)
 *   Full-height right-side workspace panel.
 *   Framer spring slide-in from right edge.
 *   Use for: ItemModal, ViewPackageModal.
 *
 * variant="confirm"
 *   Centered glass dialog (bottom-sheet on mobile).
 *   Framer scale + fade entrance.
 *   Use for: DeleteConfirmModal, CategoryModal, HelpModal, UploadModal.
 *
 * Backdrop: three composited layers — dark base + blur-2xl saturate + radial vignette.
 * Panel/Dialog: premium glass surface with gradient edge accent + ambient glow.
 */

/* ── Animation configs ─────────────────────────────────────────── */
const SPRING = { type: "spring", damping: 32, stiffness: 280, mass: 0.9 };
const EASE_OUT = [0.16, 1, 0.3, 1];      // Custom expo ease-out (Apple/Linear feel)
const EASE_IN  = [0.4, 0, 1, 1];

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
  exit:    { opacity: 0, transition: { duration: 0.18, ease: EASE_IN } },
};

const panelVariants = {
  hidden:  { x: "100%", opacity: 0.6 },
  visible: { x: 0, opacity: 1, transition: SPRING },
  exit:    { x: "100%", opacity: 0, transition: { duration: 0.22, ease: EASE_IN } },
};

const confirmVariants = {
  hidden:  { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0,   transition: { duration: 0.28, ease: EASE_OUT } },
  exit:    { opacity: 0, scale: 0.97, y: 10, transition: { duration: 0.18, ease: EASE_IN } },
};

const sheetVariants = {
  hidden:  { y: "100%", opacity: 0.6 },
  visible: { y: 0, opacity: 1, transition: SPRING },
  exit:    { y: "100%", opacity: 0, transition: { duration: 0.2, ease: EASE_IN } },
};

/* ── Shared header ─────────────────────────────────────────────── */
function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="relative flex flex-shrink-0 items-start justify-between border-b border-slate-100/80 px-6 py-5 dark:border-white/[0.06]">
      {/* Ambient glow under header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-violet-500/[0.04] to-transparent dark:from-violet-500/[0.08]" />
      <div className="relative min-w-0 pr-4">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.08] dark:hover:text-white"
      >
        <X size={15} strokeWidth={2} />
      </button>
    </div>
  );
}

/* ── Backdrop — uniform blur matching reference design ─────────── */
function CinematicBackdrop({ onClick }) {
  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 bg-black/30 backdrop-blur-md dark:bg-black/50"
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function ModalBase({
  open,
  onClose,
  title,
  subtitle,
  maxWidth  = "max-w-md",
  variant   = "panel",
  children,
}) {
  /* SSR-safe portal mount point */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  /* Escape key + body scroll lock */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open, onClose]);

  /* ═══════════════════════════════════════════════════════════
     PANEL — full-height right-side workspace
  ═══════════════════════════════════════════════════════════ */
  if (variant === "panel") {
    const panelContent = (
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-[999] flex items-stretch justify-end"
            aria-modal="true"
            role="dialog"
          >
            <CinematicBackdrop onClick={onClose} />

            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`
                relative z-10 flex h-full w-full flex-col ${maxWidth}
                overflow-hidden
                bg-white dark:bg-[#0d1117]
              `}
              style={{
                boxShadow:
                  "-60px 0 180px -20px rgba(0,0,0,0.5), -1px 0 0 rgba(0,0,0,0.08)",
              }}
            >
              {/* Gradient left edge accent */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-[2px]"
                style={{
                  background:
                    "linear-gradient(180deg,transparent 0%,#a44bf3 30%,#499ce8 70%,transparent 100%)",
                }}
              />
              {/* Top ambient glow */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-violet-500/[0.06] to-transparent dark:from-violet-500/[0.10]" />
              {/* Subtle inner border on left */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/20 dark:bg-white/[0.04]" />

              <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />

              {/* Scrollable body */}
              <div className="relative flex-1 overflow-y-auto overscroll-contain px-6 py-5">
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
    return mounted ? createPortal(panelContent, document.body) : null;
  }

  /* ═══════════════════════════════════════════════════════════
     CONFIRM — centered glass dialog (bottom-sheet on mobile)
  ═══════════════════════════════════════════════════════════ */
  const confirmContent = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-end justify-center sm:items-center"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          aria-modal="true"
          role="dialog"
        >
          <CinematicBackdrop onClick={onClose} />

          {/* Mobile: bottom-sheet */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative z-10 w-full sm:hidden
              rounded-t-[28px] overflow-hidden
              bg-white dark:bg-[#0d1117]
            `}
            style={{
              boxShadow: "0 -24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
            </div>
            {/* Top accent line */}
            <div
              className="absolute inset-x-0 top-0 h-[1.5px]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#a44bf3 30%,#499ce8 70%,transparent)",
              }}
            />
            <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />
            <div className="relative px-6 py-5">{children}</div>
          </motion.div>

          {/* Desktop: centered dialog */}
          <motion.div
            variants={confirmVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative z-10 hidden w-full sm:block ${maxWidth}
              overflow-hidden
            `}
            style={{
              borderRadius: "28px",
              background: "rgba(255,255,255,0.97)",
              boxShadow:
                "0 40px 120px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            {/* Top gradient accent */}
            <div
              className="absolute inset-x-0 top-0 h-[1.5px]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#a44bf3 30%,#499ce8 70%,transparent)",
              }}
            />
            {/* Inner glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-violet-500/[0.05] to-transparent" />

            {/* Dark mode override via class */}
            <div className="dark:hidden">
              <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />
              <div className="relative px-6 py-5">{children}</div>
            </div>
            <div
              className="hidden dark:block overflow-hidden"
              style={{
                borderRadius: "28px",
                background: "#0d1117",
                boxShadow:
                  "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[1.5px]"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,#a44bf3 30%,#499ce8 70%,transparent)",
                }}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-violet-500/[0.08] to-transparent" />
              <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />
              <div className="relative px-6 py-5">{children}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
  return mounted ? createPortal(confirmContent, document.body) : null;
}
