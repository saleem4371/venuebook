"use client";

/**
 * components/shared/DiamondWelcomeModal.jsx
 *
 * Centered premium overlay card — the "VIP entry moment" — shown on
 * every login for accounts detected as Diamond Tier. Same centered card
 * treatment at every breakpoint, including mobile (no full-screen
 * takeover). Controlled component — all eligibility logic lives in
 * hooks/useDiamondWelcome.js, this file only renders.
 *
 * Follows the same shell conventions as the app's other hand-rolled
 * modals (components/shared/LogoutConfirmationModal.jsx): fixed
 * positioning (no portal), high inline z-index, Framer Motion
 * AnimatePresence, ESC-to-close, body scroll lock, backdrop click to
 * dismiss. The one deliberate difference: the card itself always renders
 * as a fixed dark/indigo gradient surface regardless of the site's
 * light/dark theme — the same choice MemberCard.jsx already makes for
 * its tier card, so this isn't a new pattern, just reused for a second
 * "always-premium" surface.
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, Sparkles, X } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const COUNT_UP_DURATION_MS = 900;

/* Same local count-up convention as MemberCard.jsx / FarmRewards.jsx —
   duplicated on purpose to match existing precedent rather than
   introducing a shared hook this feature alone would depend on. */
function useCountUp(target, active, durationMs = COUNT_UP_DURATION_MS) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let raf;
    const start = performance.now();
    const safeTarget = Number.isFinite(target) ? target : 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(safeTarget * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);

  return value;
}

export default function DiamondWelcomeModal({ open, bonusPoints, onClose }) {
  const t = useTranslations("diamondWelcome");
  const params = useParams();
  const base = `/${params?.locale}/${params?.country}`;

  const animatedPoints = useCountUp(bonusPoints, open);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="dwm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 99998 }}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="dwm-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dwm-title"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.45, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className={[
              "fixed overflow-hidden text-white flex flex-col",
              "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[calc(100vw-32px)] max-w-[440px] max-h-[85vh] rounded-[28px]",
              "shadow-[0_32px_80px_rgba(0,0,0,0.35)]",
            ].join(" ")}
            style={{
              zIndex: 99999,
              background:
                "radial-gradient(120% 90% at 50% 0%, #2c2861 0%, #171433 45%, #0a0a14 100%)",
            }}
          >
            {/* Decorative glow blobs — same "blurred orb" convention as
                MemberCard.jsx, tinted to the Diamond tier color (#818cf8),
                one with a slow ambient pulse so the surface doesn't feel
                static without resorting to confetti/particles. */}
            <div className="pointer-events-none absolute -top-16 -end-16 w-64 h-64 rounded-full bg-[#818cf8]/25 blur-3xl" />
            <motion.div
              className="pointer-events-none absolute top-1/3 -start-20 w-56 h-56 rounded-full bg-[#a44bf3]/20 blur-3xl"
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close_aria")}
              className="absolute top-4 end-4 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur transition active:scale-95"
            >
              <X size={16} />
            </button>

            <div className="relative flex-1 overflow-y-auto no-scrollbar px-7 pt-12 pb-7 flex flex-col items-center text-center">
              {/* Diamond / VIP visual */}
              <motion.div
                initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                className="relative w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                style={{
                  background: "linear-gradient(135deg, #818cf8 0%, #6366f1 55%, #312e81 130%)",
                  boxShadow: "0 12px 32px -8px rgba(129,140,248,0.65)",
                }}
              >
                <Gem size={32} className="text-white" strokeWidth={1.75} />
                <Sparkles
                  size={16}
                  className="absolute -top-1.5 -end-1.5 text-white/90"
                  strokeWidth={2}
                />
              </motion.div>

              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25, ease: EASE }}
                className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c7d2fe]"
              >
                {t("eyebrow")}
              </motion.p>

              {/* Title */}
              <motion.h2
                id="dwm-title"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3, ease: EASE }}
                className="text-[26px] sm:text-[28px] font-bold leading-tight mt-1.5"
              >
                {t("title")}
              </motion.h2>

              {/* Supporting line */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.35, ease: EASE }}
                className="text-[13.5px] text-white/65 mt-2 max-w-[280px]"
              >
                {t("subtitle")}
              </motion.p>

              {/* Reward hero */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.48, ease: EASE }}
                className="relative w-full mt-6 rounded-3xl p-[1.5px]"
                style={{
                  background: "linear-gradient(135deg, #818cf8, #a44bf3, #499ce8)",
                }}
              >
                <div
                  className="rounded-[22px] px-6 py-6"
                  style={{
                    background: "linear-gradient(160deg, #1c1a3a 0%, #0f0e24 100%)",
                  }}
                >
                  <motion.p
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1, 1.06, 1] }}
                    transition={{ duration: 0.5, delay: (COUNT_UP_DURATION_MS + 550) / 1000, ease: EASE }}
                    className="text-[36px] sm:text-[40px] font-extrabold tracking-tight bg-clip-text text-transparent"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%)",
                    }}
                  >
                    {animatedPoints.toLocaleString()}
                  </motion.p>
                  <p className="text-[13px] font-semibold text-[#c7d2fe] mt-0.5">
                    {t("points_label")}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <p className="text-[12px] font-medium text-white/70">{t("points_credited")}</p>
                  </div>
                </div>
              </motion.div>

              {/* Ready-to-use line */}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.6, ease: EASE }}
                className="text-[13px] text-white/60 mt-5 max-w-[280px]"
              >
                {t("points_ready")}
              </motion.p>

              <div className="flex-1 min-h-4" />

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.72, ease: EASE }}
                className="w-full mt-7 flex flex-col gap-2.5"
              >
                <Link
                  href={`${base}/profile`}
                  onClick={onClose}
                  autoFocus
                  className="min-h-[48px] w-full rounded-2xl flex items-center justify-center text-[14px] font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #a44bf3, #499ce8)" }}
                >
                  {t("cta_primary")}
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] w-full rounded-2xl flex items-center justify-center text-[13.5px] font-medium text-white/60 hover:text-white/85 transition active:scale-[0.98]"
                >
                  {t("cta_secondary")}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
