"use client";

/**
 * components/shared/SplashScreen.jsx
 *
 * One-time brand splash shown on first load of a tab session — a
 * JioHotstar-style logo glow / scale-in, hold, then zoom-fade-out into
 * the app underneath.
 *
 * This is a fixed dark-background branding moment (mirrors LogoutOverlay's
 * pattern of a full-screen client-only cover), independent of the user's
 * light/dark theme preference — the theme system itself is not read or
 * touched. It overlays on top of the app rather than gating it: everything
 * underneath continues to hydrate in parallel, so this adds no load
 * latency, only a brief visual layer.
 *
 * Mounted once in app/[locale]/layout.jsx, alongside DiamondWelcomeGate.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import logo from "@/assets/logo.png"; // white wordmark — the dark-bg variant already used by Navbar's Brand()
import { useSplashScreen } from "@/hooks/useSplashScreen";

export default function SplashScreen() {
  const { show, stage } = useSplashScreen();
  const t = useTranslations("splash");
  const exiting = stage === "exit";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="vb-splash"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 flex items-center justify-center overflow-hidden"
          style={{ zIndex: 999999, background: "#030712" }}
          role="status"
          aria-label={t("loading_label")}
        >
          <SplashGlow />

          <motion.img
            src={logo.src ?? logo}
            alt=""
            draggable={false}
            initial={{ opacity: 0, scale: 0.55 }}
            animate={
              exiting
                ? { opacity: 0, scale: 1.15 }
                : { opacity: 1, scale: 1 }
            }
            transition={{
              opacity: { duration: exiting ? 0.45 : 0.55, ease: "easeInOut" },
              scale: { duration: exiting ? 0.55 : 0.65, ease: [0.16, 1, 0.3, 1] },
            }}
            className="relative w-[46vw] max-w-[220px] min-w-[140px]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Two blurred gradient blobs pulsing behind the logo — echoes the
   pink → cyan gradient already baked into the brand mark itself. */
function SplashGlow() {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="absolute rounded-full blur-3xl"
        style={{
          width: 260,
          height: 260,
          background: "#fc00ff",
          left: "50%",
          top: "50%",
          marginLeft: -230,
          marginTop: -40,
        }}
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute rounded-full blur-3xl"
        style={{
          width: 260,
          height: 260,
          background: "#00dbde",
          left: "50%",
          top: "50%",
          marginLeft: -30,
          marginTop: -20,
        }}
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
    </>
  );
}
