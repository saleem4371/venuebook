"use client";

/**
 * hooks/usePreferredLocation.js
 *
 * Persists the user's preferred city/location — SCOPED PER REGION, so
 * switching between regions (e.g. India ⇄ UAE) never leaks one region's
 * saved location into another. Each region remembers its own location
 * independently.
 *
 * Storage keys:
 *   vb_preferred_location_<countryCode>          → { label, lat, lng }
 *   vb_preferred_location_source_<countryCode>   → "ip" | "manual"
 *   vb_ip_country                                → shared, IP-detected country
 *
 * On first mount for a region with nothing saved yet:
 *   → calls ipapi.co; the result only pre-fills THIS region if the
 *     IP-detected country actually matches it (an Indian city has no
 *     business appearing as a UAE default).
 */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { safeJsonParse } from "@/utils/safeJson";

const STORAGE_PREFIX = "vb_preferred_location_";
const SOURCE_PREFIX = "vb_preferred_location_source_";
const IP_COUNTRY_KEY = "vb_ip_country";

/* Every mounted instance of this hook keeps its own React state, all
 * reading/writing the same localStorage keys — there is no shared context.
 * Without this, saving a new location in one place (e.g. the Preferences
 * modal) never reaches an *already-mounted* consumer elsewhere on the same
 * page (e.g. the Search Page's map) until that consumer remounts. This
 * custom event is a same-tab broadcast; the native `storage` event only
 * fires in *other* tabs/windows, never the one that made the write. */
const LOCATION_CHANGE_EVENT = "vb:preferred-location-change";

/* ── Synchronous helpers — safe to call outside React (e.g. from a click
 * handler) when you need a region's saved location right away, without
 * waiting on an effect/render cycle. ─────────────────────────────────── */

export function getStoredLocation(countryCode) {
  if (!countryCode) return null;
  try {
    const raw = localStorage.getItem(
      STORAGE_PREFIX + countryCode.toLowerCase(),
    );
    return raw ? safeJsonParse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredLocationIsAutoDetected(countryCode) {
  if (!countryCode) return false;
  try {
    return (
      localStorage.getItem(SOURCE_PREFIX + countryCode.toLowerCase()) === "ip"
    );
  } catch {
    return false;
  }
}

async function detectIPLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    if (data.city && data.latitude && data.longitude) {
      return {
        label: data.city,
        lat: data.latitude,
        lng: data.longitude,
        countryCode: (data.country_code || "").toLowerCase(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {string} [regionOverride] Country code ("in", "ae", ...) to scope
 *   this hook instance to. Defaults to the active region from the URL.
 *   Pass this when previewing a *different* region than the one currently
 *   active (e.g. a region switcher).
 */
export function usePreferredLocation(regionOverride) {
  const params = useParams();
  const countryCode = (regionOverride || params?.country || "in").toLowerCase();

  const [location, _setLocation] = useState(null);
  const [ipCountryCode, setIpCountryCode] = useState(null);
  /* True only when `location` came from IP auto-detection and hasn't been
   * overridden by the user since — lets the UI show an "Auto-detected from
   * your IP" hint only when that's actually true. */
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  /* ── Reload whenever the scoped region changes ─────────────── */
  useEffect(() => {
    /* Restore cached IP country */
    try {
      const cached = localStorage.getItem(IP_COUNTRY_KEY);
      if (cached) setIpCountryCode(cached);
    } catch {}

    const saved = getStoredLocation(countryCode);
    if (saved) {
      _setLocation(saved);
      setIsAutoDetected(getStoredLocationIsAutoDetected(countryCode));
      return; // already cached for this region — skip IP fetch
    }

    /* Nothing saved for this region yet — don't inherit another region's
     * value; start clean. */
    _setLocation(null);
    setIsAutoDetected(false);

    detectIPLocation().then((loc) => {
      if (!loc) return;
      const { countryCode: detectedCode, ...locData } = loc;
      try {
        localStorage.setItem(IP_COUNTRY_KEY, detectedCode);
      } catch {}
      setIpCountryCode(detectedCode);

      /* Only pre-fill THIS region if it's the one the user is actually in. */
      if (detectedCode !== countryCode) return;

      _setLocation(locData);
      setIsAutoDetected(true);
      try {
        localStorage.setItem(
          STORAGE_PREFIX + countryCode,
          JSON.stringify(locData),
        );
        localStorage.setItem(SOURCE_PREFIX + countryCode, "ip");
      } catch {}
    });
  }, [countryCode]);

  /* ── Stay in sync with OTHER instances of this hook (e.g. the Search
   * Page's map should pick up a location saved via the Preferences modal
   * immediately, without a remount). Scoped to this instance's own
   * countryCode — a change saved for a different region is ignored, same
   * as the mount-time read above. ─────────────────────────────────── */
  useEffect(() => {
    const applyExternal = (loc) => {
      _setLocation(loc);
      setIsAutoDetected(getStoredLocationIsAutoDetected(countryCode));
    };
    const onCustomEvent = (e) => {
      if (e.detail?.countryCode !== countryCode) return;
      applyExternal(e.detail.loc ?? null);
    };
    const onStorageEvent = (e) => {
      if (e.key !== STORAGE_PREFIX + countryCode) return;
      applyExternal(e.newValue ? safeJsonParse(e.newValue) : null);
    };
    window.addEventListener(LOCATION_CHANGE_EVENT, onCustomEvent);
    window.addEventListener("storage", onStorageEvent);
    return () => {
      window.removeEventListener(LOCATION_CHANGE_EVENT, onCustomEvent);
      window.removeEventListener("storage", onStorageEvent);
    };
  }, [countryCode]);

  /* ── Setter: update state + localStorage for the scoped region ─ */
  const setLocation = useCallback(
    (loc) => {
      _setLocation(loc);
      /* Any manual save (typed, picked from suggestions, or region-switch
       * re-entry) is no longer "auto-detected". */
      setIsAutoDetected(false);
      try {
        if (loc) {
          localStorage.setItem(
            STORAGE_PREFIX + countryCode,
            JSON.stringify(loc),
          );
          localStorage.setItem(SOURCE_PREFIX + countryCode, "manual");
        } else {
          localStorage.removeItem(STORAGE_PREFIX + countryCode);
          localStorage.removeItem(SOURCE_PREFIX + countryCode);
        }
        window.dispatchEvent(
          new CustomEvent(LOCATION_CHANGE_EVENT, {
            detail: { countryCode, loc: loc ?? null },
          }),
        );
      } catch {}
    },
    [countryCode],
  );

  return { location, setLocation, ipCountryCode, isAutoDetected };
}
