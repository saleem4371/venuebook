"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Scale, Building2, TreePine, X } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

/*
 * FAB_BOTTOM must match BottomMenu's constant so Compare (left) and Map (right)
 * sit on the EXACT same horizontal plane:
 *
 *   [ Compare ]                              [ Map ]
 *             ↑ both at this bottom value ↑
 *
 *              ──────── Footer ─────────
 */
const FAB_BOTTOM        = "calc(68px + env(safe-area-inset-bottom, 0px) + 12px)";
// Home shortcut button stacks above Map FAB (46px height + 10px gap = 56px offset)
const HOME_BTN_BOTTOM   = "calc(68px + env(safe-area-inset-bottom, 0px) + 12px + 56px)";
const SCROLL_THRESHOLD  = 80;

const FADE = {
  initial:    { opacity: 0, y: 10 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: 10 },
  transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function FloatingMenu({ compareList, setCompareList }) {
  const [open,    setOpen]    = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScroll = useRef(0);
  const ref        = useRef(null);

  const searchParams = useSearchParams();
  const pathname     = usePathname();
  const router       = useRouter();
  const { compareOpen, setCompareOpen } = useUI();

  /* ── Scroll tracking: hide on scroll-down, show on scroll-up ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y <= lastScroll.current || y <= SCROLL_THRESHOLD);
      lastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close home submenu on outside click ─────────────────────── */
  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const lastSegment = pathname.split("/").filter(Boolean).pop();

  const handleNavigate = (key) => {
    const basePath = pathname.split("/").slice(0, -1).join("/");
    router.push(`${basePath}/${key}`);
    setOpen(false);
  };

  const handleShare = async () => {
    const fullUrl = window.location.origin + pathname + "?" + searchParams.toString();
    if (navigator.share) {
      await navigator.share({ title: "Check this venue", url: fullUrl });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(fullUrl)}`, "_blank");
    }
  };

  const showButtons = visible && !compareOpen;

  return (
    <>
      {/*
        ┌─────────────────────────────────────────────────────────┐
        │ LEFT — Compare button                                   │
        │ Breakpoint: md:hidden (mobile <768px only)              │
        │ Bottom: same as Map FAB → horizontal alignment          │
        └─────────────────────────────────────────────────────────┘
      */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            key="compare-fab"
            {...FADE}
            style={{ position: "fixed", left: 16, bottom: FAB_BOTTOM, zIndex: 50 }}
            className="md:hidden"
          >
            <CompareButton count={compareList.length} onClick={() => setCompareOpen(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        ┌─────────────────────────────────────────────────────────┐
        │ RIGHT — Category shortcut (Home submenu)                │
        │ Breakpoint: md:hidden (mobile <768px only)              │
        │ Bottom: HOME_BTN_BOTTOM = FAB_BOTTOM + 56px             │
        │ Sits above Map FAB so they don't overlap                │
        └─────────────────────────────────────────────────────────┘
      */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            ref={ref}
            key="home-fab"
            {...FADE}
            style={{ position: "fixed", right: 16, bottom: HOME_BTN_BOTTOM, zIndex: 50 }}
            className="md:hidden flex flex-col items-end gap-2"
          >
            {/* Sub-items slide up from button */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1 }}
                  exit={{    opacity: 0, y: 16, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col items-end gap-2 pb-1"
                >
                  <MenuItem
                    icon={<Building2 size={15} />}
                    label="Venue"
                    active={lastSegment === "venues"}
                    onClick={() => handleNavigate("venues")}
                  />
                  <MenuItem
                    icon={<TreePine size={15} />}
                    label="Farmstay"
                    active={lastSegment === "farmstay"}
                    onClick={() => handleNavigate("farmstay")}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => setOpen((v) => !v)}
              whileTap={{ scale: 0.9 }}
              aria-label="Switch category"
              aria-expanded={open}
              className={[
                "rounded-full p-[11px] transition",
                "bg-white/90 dark:bg-gray-900/90",
                "backdrop-blur-md",
                "border border-white/40 dark:border-white/[0.08]",
                "shadow-[0_4px_16px_rgba(0,0,0,0.10)]",
                "hover:scale-105",
              ].join(" ")}
            >
              <Home size={17} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        ┌─────────────────────────────────────────────────────────┐
        │ Compare modal — bottom sheet                            │
        │ md:hidden so it only renders on mobile                  │
        └─────────────────────────────────────────────────────────┘
      */}
      <AnimatePresence>
        {compareOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-end justify-center z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCompareOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl p-5 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg dark:text-white">
                  Compare List ({compareList.length}/4)
                </h2>
                <button
                  onClick={() => setCompareOpen(false)}
                  aria-label="Close compare"
                  className="rounded-full p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {compareList.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No items added yet</p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {compareList.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm dark:text-white"
                    >
                      {item}
                      <button
                        onClick={() => setCompareList((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-red-500 text-xs ml-2 shrink-0"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {compareList.length >= 4 && (
                <p className="text-xs text-red-500 mb-2">Maximum 4 items allowed</p>
              )}

              <button
                disabled={compareList.length < 2}
                onClick={() => {
                  window.location.href = `/compare?items=${compareList.join(",")}`;
                }}
                className={`w-full py-3 rounded-xl font-medium transition ${
                  compareList.length < 2
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    : "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800"
                }`}
              >
                Compare Now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── CompareButton ──────────────────────────────────────────────── */
function CompareButton({ count, onClick }) {
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { if (count > 0) setAnimKey((p) => p + 1); }, [count]);

  return (
    <div className="relative flex items-center justify-center">
      <motion.button
        key={animKey}
        onClick={onClick}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.18, 0.95, 1], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open compare list"
        className="relative p-[11px] rounded-full bg-gradient-to-br from-[#7B61FF] to-[#9F7AEA] text-white shadow-[0_4px_16px_rgba(123,97,255,0.35)] transition-all duration-300"
      >
        <span className="absolute inset-0 rounded-full bg-purple-400 opacity-20 blur-md animate-ping" />
        <Scale size={17} className="relative z-10" />
      </motion.button>

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0, y: -4 }}
            animate={{ scale: [1, 1.3, 1], opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-white text-purple-700 text-[9px] font-bold rounded-full shadow-md"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── MenuItem ───────────────────────────────────────────────────── */
function MenuItem({ icon, label, onClick, active }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={[
        "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition",
        active
          ? "bg-purple-600 text-white shadow-lg"
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl border border-white/40 dark:border-white/[0.08] text-gray-800 dark:text-gray-200",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}
