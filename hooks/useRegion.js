"use client";

/**
 * /hooks/useRegion.js
 *
 * Public hook for consuming shared region state.
 * State now lives in RegionContext so every hook instance
 * (including useCurrency) always reflects the same value.
 *
 * API is unchanged:
 *   const { region, regionConfig, setRegion, mounted } = useRegion();
 */

import { useRegionContext } from "@/context/RegionContext";

export function useRegion() {
  return useRegionContext();
}
