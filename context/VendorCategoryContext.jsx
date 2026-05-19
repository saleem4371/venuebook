"use client";

/**
 * /context/VendorCategoryContext.jsx
 *
 * Shared active-category state for all vendor pages.
 *
 * Pattern mirrors CategoryContext.jsx (customer side) so both sides of the
 * platform use the same architectural idiom.
 *
 * VENDOR_CATEGORIES drives which categories the navigator shows.
 * Replace the mock constant with an API call once auth is wired up.
 *
 * Usage:
 *   const { activeCategory, setActiveCategory, vendorCategories, categoryConfig }
 *     = useVendorCategory();
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
const VendorCategoryContext = createContext(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */
/**
 * @param {{
 *   children: React.ReactNode,
 *   vendorCategories: string[]   — only the vendor's enabled categories
 * }} props
 */
export function VendorCategoryProvider({ children, vendorCategories }) {
  const firstValid = vendorCategories?.[0] ?? DEFAULT_CATEGORY;

  const [activeCategory, setActiveCategoryRaw] = useState(firstValid);

  /* Guard: only allow switching to a category this vendor has enabled */
  const setActiveCategory = useCallback(
    (id) => {
      if (vendorCategories.includes(id)) setActiveCategoryRaw(id);
    },
    [vendorCategories],
  );

  const value = useMemo(
    () => ({
      activeCategory,
      setActiveCategory,
      vendorCategories,
      categoryConfig: CATEGORIES[activeCategory] ?? CATEGORIES[DEFAULT_CATEGORY],
    }),
    [activeCategory, setActiveCategory, vendorCategories],
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
