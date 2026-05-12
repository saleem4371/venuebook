"use client";

/**
 * /context/CategoryContext.jsx
 *
 * Provides ACTIVE_CATEGORY and setActiveCategory across all discovery pages.
 * Wrap any layout/page that needs category-aware components with <CategoryProvider>.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

import { CATEGORIES, DEFAULT_CATEGORY } from "@/config/categoryConfig";

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */

const CategoryContext = createContext(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */

/**
 * @param {{ children: React.ReactNode, initialCategory?: string }} props
 */
export function CategoryProvider({ children, initialCategory }) {
  const [activeCategory, setActiveCategoryRaw] = useState(
    () =>
      initialCategory && CATEGORIES[initialCategory]
        ? initialCategory
        : DEFAULT_CATEGORY,
  );

  const setActiveCategory = useCallback((id) => {
    if (CATEGORIES[id]) setActiveCategoryRaw(id);
  }, []);

  const value = useMemo(
    () => ({
      /** Current active category id, e.g. "venues" */
      activeCategory,
      /** Full config object from CATEGORIES[activeCategory] */
      categoryConfig: CATEGORIES[activeCategory],
      /** Update the active category */
      setActiveCategory,
    }),
    [activeCategory, setActiveCategory],
  );

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Consumer hook                                                       */
/* ------------------------------------------------------------------ */

/**
 * Access ACTIVE_CATEGORY and CATEGORY_CONFIG from anywhere inside CategoryProvider.
 *
 * const { activeCategory, categoryConfig, setActiveCategory } = useCategory();
 */
export function useCategory() {
  const ctx = useContext(CategoryContext);
  if (!ctx) {
    throw new Error("useCategory must be used within a <CategoryProvider>.");
  }
  return ctx;
}
