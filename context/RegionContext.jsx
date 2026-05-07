"use client";

/**
 * /context/RegionContext.jsx
 *
 * Single shared region state for the entire app.
 * Both useRegion() and useCurrency() read from here so they
 * always see the same value — no duplicate, desynchronised instances.
 *
 * Add <RegionProvider> once, inside ClientLayout.
 */

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  getRegionConfig,
  getRegionByCountryCode,
  getDefaultRegion,
  DEFAULT_REGION,
} from "@/lib/region";

const RegionContext = createContext(null);

const STORAGE_KEY = "vb_region";

/* localStorage key used by useCurrency — cleared on region switch */
const CURRENCY_STORAGE_KEY = "vb_currency";

export function RegionProvider({ children }) {
  const params = useParams();

  const [region,       setRegionCode]      = useState(DEFAULT_REGION);
  const [regionConfig, setRegionConfigState] = useState(getDefaultRegion());
  const [mounted,      setMounted]         = useState(false);

  /*
   * Track the previous country so we can distinguish a real region change
   * from the initial mount — we must NOT wipe vb_currency on first load
   * (the user may have intentionally picked a different currency).
   */
  const prevCountryRef = useRef(null);

  /*
   * URL is the source of truth for region.
   * Re-runs whenever the [country] segment changes (soft navigation).
   * Falls back to localStorage, then DEFAULT_REGION.
   */
  useEffect(() => {
    const urlCountry = params?.country;

    if (urlCountry) {
      const config = getRegionByCountryCode(urlCountry);
      if (config) {
        /* Clear stale currency only when the region genuinely changes */
        if (prevCountryRef.current && prevCountryRef.current !== urlCountry) {
          try { localStorage.removeItem(CURRENCY_STORAGE_KEY); } catch (_) {}
        }
        prevCountryRef.current = urlCountry;

        setRegionCode(config.code);
        setRegionConfigState(config);
        try { localStorage.setItem(STORAGE_KEY, config.code); } catch (_) {}
        setMounted(true);
        return;
      }
    }

    prevCountryRef.current = urlCountry ?? null;

    /* Fallback: localStorage (e.g. pages without a [country] segment) */
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = getRegionConfig(saved);
        if (config) {
          setRegionCode(saved.toUpperCase());
          setRegionConfigState(config);
          setMounted(true);
          return;
        }
      }
    } catch (_) {}

    setMounted(true);
  }, [params?.country]);

  const setRegion = (regionCode) => {
    const upper  = regionCode.toUpperCase();
    const config = getRegionConfig(upper);
    setRegionCode(upper);
    setRegionConfigState(config);
    try {
      localStorage.setItem(STORAGE_KEY, upper);
      /* Remove stale currency so useCurrency falls back to the new region default */
      localStorage.removeItem(CURRENCY_STORAGE_KEY);
    } catch (_) {}
  };

  return (
    <RegionContext.Provider value={{ region, regionConfig, setRegion, mounted }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegionContext() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegionContext must be used inside <RegionProvider>");
  return ctx;
}
