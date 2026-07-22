"use client";

import { useMemo } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  MarkerF,
  CircleF,
} from "@react-google-maps/api";

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS  (module-level — stable references, never re-created on render)
───────────────────────────────────────────────────────────────────────────── */
const API_KEY   = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ?? "";
const LIBRARIES = /** @type {const} */ (["places"]);

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

// Allow zoom + pan + fullscreen so the user can explore the neighbourhood.
// "cooperative" gestureHandling prevents accidental map zoom while page-scrolling
// (desktop: ctrl+scroll to zoom; mobile: two-finger zoom). Zoom ± buttons still work.
const MAP_OPTIONS = {
  fullscreenControl:    true,
  streetViewControl:    false,
  mapTypeControl:       false,
  keyboardShortcuts:    false,
  zoomControl:          true,
  gestureHandling:      "cooperative",
  clickableIcons:       false,
};

// Emerald circle anchored to real map coordinates.
// Radius is in metres → scales naturally with zoom level and pans with the map.
const CIRCLE_OPTIONS = {
  strokeColor:   "#059669",   // emerald-600
  strokeOpacity: 0.90,
  strokeWeight:  2,
  fillColor:     "#10b981",   // emerald-500
  fillOpacity:   0.13,
  clickable:     false,
  zIndex:        1,
};

/* ─────────────────────────────────────────────────────────────────────────────
   DETERMINISTIC APPROXIMATE COORDS
   Derives a stable offset from (rawLat, rawLng) using the listing ID as seed.
   Always produces the same output for the same inputs — no randomness per render.
   Offset: 300–800 m in a direction that varies per listing (golden-angle spread).
───────────────────────────────────────────────────────────────────────────── */
function getApproxCoords(rawLat, rawLng, seed = "") {
  // Hash the seed string into a stable integer
  let n = 0;
  for (let i = 0; i < seed.length; i++) {
    n = ((n * 31) + seed.charCodeAt(i)) & 0x0fffffff;
  }

  const bearing = (n * 137.508) % 360;  // 0–360° (golden angle gives good spread)
  const distM   = 300 + (n % 500);       // 300–800 m

  // Convert metres → degree offsets
  // 1° lat ≈ 111,320 m;  1° lng ≈ 111,320 × cos(lat) m
  const R    = 111320;
  const dLat = (distM / R) * Math.cos((bearing * Math.PI) / 180);
  const dLng = (distM / R) / Math.cos((rawLat * Math.PI) / 180)
                 * Math.sin((bearing * Math.PI) / 180);

  return { lat: rawLat + dLat, lng: rawLng + dLng };
}

/* ─────────────────────────────────────────────────────────────────────────────
   FARMSTAY MARKER — teardrop pin with a tree-pine icon
   Built once at module load (not per component mount).
   No Google red pin is used anywhere in this component.
───────────────────────────────────────────────────────────────────────────── */
function buildFarmstayPinUrl() {
  const dark  = "#065f46"; // emerald-900
  const mid   = "#059669"; // emerald-600
  const light = "#34d399"; // emerald-400

  // viewBox 44×58: teardrop centered at (22,21), tip at y=56
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 58" fill="none">`,
    `<defs>`,
      `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">`,
        `<stop offset="0%" stop-color="${mid}"/>`,
        `<stop offset="100%" stop-color="${dark}"/>`,
      `</linearGradient>`,
      `<filter id="d" x="-40%" y="-15%" width="180%" height="155%">`,
        `<feDropShadow dx="0" dy="3" stdDeviation="3.2" flood-color="#000" flood-opacity="0.28"/>`,
      `</filter>`,
    `</defs>`,
    // Teardrop body
    `<path d="M22 2C11.5 2 3 10.5 3 21C3 27.8 6.5 33.8 11.8 37.2L22 56L32.2 37.2C37.5 33.8 41 27.8 41 21C41 10.5 32.5 2 22 2Z" fill="url(#g)" filter="url(#d)"/>`,
    // White icon background circle
    `<circle cx="22" cy="21" r="11.5" fill="white" opacity="0.96"/>`,
    // Tree-pine: three stacked triangles (top → bottom) + trunk rect
    `<polygon points="22,12 18,18 26,18" fill="${dark}"/>`,
    `<polygon points="22,15 16,22.5 28,22.5" fill="${mid}"/>`,
    `<polygon points="22,18.5 13.5,27 30.5,27" fill="${light}" opacity="0.88"/>`,
    `<rect x="20" y="27" width="4" height="4" rx="0.8" fill="${dark}"/>`,
    `</svg>`,
  ].join("");

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const FARMSTAY_PIN_URL = buildFarmstayPinUrl();

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
   Props:
     rawLat    — true latitude  (number or numeric string)
     rawLng    — true longitude (number or numeric string)
     listingId — stable ID used as seed for deterministic offset (string)
   The parent div controls the rendered height via Tailwind classes.
───────────────────────────────────────────────────────────────────────────── */
export default function ApproximateLocationMap({
  rawLat,
  rawLng,
  listingId = "",
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries:        LIBRARIES,
  });

  // Stable approximate center — same for this listing every time
  const approxCenter = useMemo(
    () => getApproxCoords(Number(rawLat), Number(rawLng), String(listingId)),
    [rawLat, rawLng, listingId]
  );

  // Marker icon object — uses window.google, so built only after SDK loads
  const markerOptions = useMemo(() => {
    if (!isLoaded) return {};
    return {
      icon: {
        url:        FARMSTAY_PIN_URL,
        scaledSize: new window.google.maps.Size(44, 58),
        anchor:     new window.google.maps.Point(22, 56),
      },
      clickable: false,
      draggable: false,
      zIndex:    2,
    };
  }, [isLoaded]);

  /* ── Loading skeleton ── */
  if (!isLoaded) {
    return (
      <div className="w-full h-full rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-emerald-500 animate-spin" />
      </div>
    );
  }

  /* ── Error fallback ── */
  if (loadError) {
    return (
      <div className="w-full h-full rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <p className="text-sm text-gray-400 dark:text-gray-500">Map unavailable</p>
      </div>
    );
  }

  /* ── Map ── */
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={approxCenter}
        zoom={14}
        options={MAP_OPTIONS}
      >
        {/*
          Area circle — a real google.maps.Circle anchored to approxCenter.
          Radius is in metres, so it scales correctly as the user zooms in/out,
          and moves with the map when panned. NOT a CSS overlay.
        */}
        <CircleF
          center={approxCenter}
          radius={500}
          options={CIRCLE_OPTIONS}
        />

        {/*
          Custom tree-pine marker at the approximate center.
          Uses our SVG data URL — the default Google red pin is suppressed by
          not using the default MarkerF icon.
        */}
        <MarkerF
          position={approxCenter}
          options={markerOptions}
        />
      </GoogleMap>
    </div>
  );
}
