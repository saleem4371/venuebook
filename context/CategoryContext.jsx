"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

import { CATEGORIES, DEFAULT_CATEGORY } from "@/config/categoryConfig";

const CategoryContext = createContext(null);

export function CategoryProvider({ children, initialCategory }) {
  // Initial category
  const [activeCategory, setActiveCategoryRaw] = useState(() => {
    if (
      initialCategory &&
      CATEGORIES[initialCategory]
    ) {
      return initialCategory;
    }

    return DEFAULT_CATEGORY;
  });

  // Load category from localStorage (runs once)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("activeCategory");

    if (saved && CATEGORIES[saved]) {
      setActiveCategoryRaw(saved);
    }
  }, []);

  // Save category to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (activeCategory) {
      localStorage.setItem(
        "activeCategory",
        activeCategory
      );
    }
  }, [activeCategory]);

  const setActiveCategory = useCallback((id) => {
    if (!CATEGORIES[id]) return;

    setActiveCategoryRaw(id);

    if (typeof window !== "undefined") {
      localStorage.setItem("activeCategory", id);
    }
  }, []);

  const value = useMemo(
    () => ({
      activeCategory,
      categoryConfig: CATEGORIES[activeCategory],
      setActiveCategory,
    }),
    [activeCategory, setActiveCategory]
  );

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const ctx = useContext(CategoryContext);

  if (!ctx) {
    throw new Error(
      "useCategory must be used within CategoryProvider"
    );
  }

  return ctx;
}