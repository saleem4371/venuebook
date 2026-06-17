"use client";

/**
 * hooks/usePreferredLocation.js
 *
 * Persists the user's preferred city/location in localStorage.
 * Shape: { label: string, lat: number | null, lng: number | null }
 *
 * Also exposes ipCountryCode (ISO 3166-1 alpha-2, lowercase) so the modal
 * can decide whether to pre-fill location when the user switches regions.
 *
 * On first mount (nothing saved):
 *   → calls ipapi.co which returns lat/lng + country_code directly.
 */

import { useState, useEffect } from "react";

const STORAGE_KEY     = "vb_preferred_location";
const IP_COUNTRY_KEY  = "vb_ip_country";

async function detectIPLocation() {
  try {
    const res  = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    if (data.city && data.latitude && data.longitude) {
      return {
        label       : data.city,
        lat         : data.latitude,
        lng         : data.longitude,
        countryCode : (data.country_code || "").toLowerCase(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function usePreferredLocation() {
  const [location,       _setLocation]      = useState(null);
  const [ipCountryCode,  setIpCountryCode]  = useState(null);

  /* ── Mount: read localStorage, fall back to IP detection ──── */
  useEffect(() => {
    /* Restore cached IP country */
    try {
      const cached = localStorage.getItem(IP_COUNTRY_KEY);
      if (cached) setIpCountryCode(cached);
    } catch {}

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        _setLocation(JSON.parse(saved));
        return; // location already cached — skip IP fetch
      }
    } catch {}

    detectIPLocation().then((loc) => {
      if (!loc) return;
      const { countryCode, ...locData } = loc;
      _setLocation(locData);
      try {
        localStorage.setItem(STORAGE_KEY,    JSON.stringify(locData));
        localStorage.setItem(IP_COUNTRY_KEY, countryCode);
      } catch {}
      setIpCountryCode(countryCode);
    });
  }, []);

  /* ── Setter: update state + localStorage ─────────────────── */
  const setLocation = (loc) => {
    _setLocation(loc);
    try {
      if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      else      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return { location, setLocation, ipCountryCode };
}
