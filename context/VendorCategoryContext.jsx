"use client";

/**
 * /context/VendorCategoryContext.jsx
 *
 * Shared active-category state for all vendor pages.
 *
 * Phase state machine — drives cinematic category switching:
 *
 *   'idle'      → nothing transitioning
 *   'shrinking' → page scales down, veil fades in        (0 – 180 ms)
 *   'loading'   → fullscreen overlay visible, skeleton   (180 – 880 ms)
 *                 category swaps at the 180 ms boundary
 *
 * When phase returns to 'idle', AnimatePresence in
 * CategoryTransitionOverlay handles the exit animation (~300 ms).
 *
 * Total perceived transition: ~1 100 ms (felt, not waited).
 *
 * isTransitioning is kept as a boolean alias for any legacy consumer.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { CATEGORIES, DEFAULT_CATEGORY } from "@/config/categoryConfig";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
/** @typedef {'idle' | 'shrinking' | 'loading'} TransitionPhase */

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */
const VendorCategoryContext = createContext(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */
export function VendorCategoryProvider({ children, vendorCategories }) {
  const firstValid = vendorCategories?.[0] ?? DEFAULT_CATEGORY;

  const [activeCategory,  setActiveCategoryRaw] = useState(firstValid);
  const [prevCategory,    setPrevCategory]       = useState(firstValid);
  /** @type {[TransitionPhase, Function]} */
  const [phase,           setPhase]              = useState("idle");
  const timerRef = useRef(null);

  /* Derived boolean alias kept for legacy consumers */
  const isTransitioning = phase !== "idle";

  /**
   * Cinematic 3-phase category switch.
   *
   * shrinking (180 ms) → loading (700 ms) → idle
   *         ↑ category swaps here ↑
   */
  const setActiveCategory = useCallback(
    (id) => {
      if (!vendorCategories.includes(id) || id === activeCategory) return;

      /* Clear any in-flight timers */
      if (timerRef.current) {
        clearTimeout(timerRef.current.t1);
        clearTimeout(timerRef.current.t2);
      }

      setPrevCategory(activeCategory);
      setPhase("shrinking");

      timerRef.current = {};

      /* ① After shrink → swap category + enter loading */
      timerRef.current.t1 = setTimeout(() => {
        setActiveCategoryRaw(id);
        setPhase("loading");

        /* ② After loading → return to idle (overlay exits via AnimatePresence) */
        timerRef.current.t2 = setTimeout(() => {
          setPhase("idle");
        }, 950);
      }, 180);
    },
    [vendorCategories, activeCategory],
  );

  const value = useMemo(
    () => ({
      /* Core */
      activeCategory,
      prevCategory,
      phase,
      isTransitioning,        /* legacy alias */
      setActiveCategory,
      /* Vendor config */
      vendorCategories,
      categoryConfig: CATEGORIES[activeCategory] ?? CATEGORIES[DEFAULT_CATEGORY],
    }),
    [activeCategory, prevCategory, phase, isTransitioning, setActiveCategory, vendorCategories],
  );

  return (
    <VendorCategoryContext.Provider value={value}>
      {children}
    </VendorCategoryContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Consumer hook                                                       */
/* ------------------------------------------------------------------ */
export function useVendorCategory() {
  const ctx = useContext(VendorCategoryContext);
  if (!ctx) {
    throw new Error(
      "useVendorCategory must be used within <VendorCategoryProvider>.",
    );
  }
  return ctx;
}
