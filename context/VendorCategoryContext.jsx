"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";

import { CATEGORIES, DEFAULT_CATEGORY } from "@/config/categoryConfig";

const VendorCategoryContext = createContext(null);

export function VendorCategoryProvider({
  children,
  vendorCategories = [],
}) {
  const validCategories = vendorCategories.filter(
    (cat) => cat && CATEGORIES[cat]
  );

  const firstValid = validCategories?.[0] || null;

  const [activeCategory, setActiveCategoryRaw] = useState(null);
  const [prevCategory, setPrevCategory] = useState(null);
  const [phase, setPhase] = useState("idle");

  const timerRef = useRef(null);

  const isTransitioning = phase !== "idle";

  // Set category when API data arrives
  useEffect(() => {
    if (firstValid) {
      setActiveCategoryRaw(firstValid);
      setPrevCategory(firstValid);
    }
  }, [firstValid]);

  const setActiveCategory = useCallback(
    (id) => {
      if (
        !validCategories.includes(id) ||
        id === activeCategory
      ) {
        return;
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current.t1);
        clearTimeout(timerRef.current.t2);
      }

      setPrevCategory(activeCategory);
      setPhase("shrinking");

      timerRef.current = {};

      timerRef.current.t1 = setTimeout(() => {
        setActiveCategoryRaw(id);
        setPhase("loading");

        timerRef.current.t2 = setTimeout(() => {
          setPhase("idle");
        }, 950);
      }, 180);
    },
    [validCategories, activeCategory]
  );

  const value = useMemo(
    () => ({
      activeCategory,
      prevCategory,
      phase,
      isTransitioning,
      setActiveCategory,
      vendorCategories: validCategories,
      categoryConfig:
        CATEGORIES[activeCategory] ||
        CATEGORIES[firstValid] ||
        CATEGORIES[DEFAULT_CATEGORY],
    }),
    [
      activeCategory,
      prevCategory,
      phase,
      isTransitioning,
      setActiveCategory,
      validCategories,
      firstValid,
    ]
  );

  console.log("vendorCategories:", vendorCategories);
  console.log("validCategories:", validCategories);
  console.log("firstValid:", firstValid);
  console.log("activeCategory:", activeCategory);

  return (
    <VendorCategoryContext.Provider value={value}>
      {children}
    </VendorCategoryContext.Provider>
  );
}

export function useVendorCategory() {
  const ctx = useContext(VendorCategoryContext);

  if (!ctx) {
    throw new Error(
      "useVendorCategory must be used within VendorCategoryProvider"
    );
  }

  return ctx;
}