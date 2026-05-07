"use client";

/**
 * /hooks/useCurrency.js
 *
 * Manages the user's selected currency with localStorage persistence.
 *
 * Priority:
 *   1. Value stored in localStorage (user preference)
 *   2. Region default currency (from shared RegionContext)
 *   3. "INR" (global fallback)
 *
 * Usage:
 *   const { currency, setCurrency, format, currencyConfig, mounted } = useCurrency();
 *   const price = format(5000); // formats 5000 INR in selected currency
 */

import { useState, useEffect } from "react";
import { formatPrice, getCurrencyConfig, CURRENCIES } from "@/lib/currency";
import { useRegionContext } from "@/context/RegionContext";

const STORAGE_KEY = "vb_currency";

export function useCurrency() {
  /*
   * Read directly from the shared RegionContext — not from a second
   * useRegion() instance — so setRegion() anywhere in the tree is
   * immediately reflected here.
   */
  const { regionConfig, mounted: regionMounted } = useRegionContext();

  const [currency, setCurrencyCode] = useState("INR");
  const [mounted,  setMounted]      = useState(false);

  useEffect(() => {
    if (!regionMounted) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CURRENCIES[saved]) {
        setCurrencyCode(saved);
      } else {
        /* No stored preference — default to the region's currency */
        setCurrencyCode(regionConfig?.currency || "INR");
      }
    } catch (_) {
      setCurrencyCode(regionConfig?.currency || "INR");
    }

    setMounted(true);
  }, [regionMounted, regionConfig]);

  /**
   * Set a new currency and persist it to localStorage.
   *
   * @param {string} currencyCode  e.g. "INR" | "AED"
   */
  const setCurrency = (currencyCode) => {
    if (!CURRENCIES[currencyCode]) return;
    setCurrencyCode(currencyCode);
    try {
      localStorage.setItem(STORAGE_KEY, currencyCode);
    } catch (_) {}
  };

  /**
   * Format a price stored in INR for display in the selected currency.
   *
   * @param {number} amountInINR
   * @param {string} [localeOverride]  Optional BCP 47 locale
   * @returns {string}
   */
  const format = (amountInINR, localeOverride) => {
    return formatPrice(amountInINR, currency, localeOverride);
  };

  return {
    currency,
    setCurrency,
    format,
    currencyConfig: getCurrencyConfig(currency),
    mounted,
  };
}
