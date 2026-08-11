"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  loadMapboxGL,
  isMapboxTokenConfigured,
  isWebGLSupported,
  enableCooperativeGestures,
} from "@/hooks/useMapboxGL";

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS  (module-level — stable references, never re-created on render)
───────────────────────────────────────────────────────────────────────────── */
const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";

// Emerald circle anchored to real map coordinates.
// Radius is in metres → scales naturally with zoom level and pans with the map
// (rebuilt as a GeoJSON polygon on every zoom/move so it stays geographically
// accurate instead of a fixed-pixel circle).
const CIRCLE_FILL_COLOR = "#10b981"; // emerald-500
const CIRCLE_FILL_OPACITY = 0.13;
const CIRCLE_STROKE_COLOR = "#059669"; // emerald-600
const CIRCLE_STROKE_OPACITY = 0.9;
const CIRCLE_STROKE_WEIGHT = 2;
const CIRCLE_RADIUS_M = 500;

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

/** Builds a GeoJSON circle polygon (metres → degrees) — the Mapbox
 *  equivalent of Google's google.maps.Circle (which is metre-radius native). */
function createGeoJSONCircle(center, radiusM, points = 64) {
  const coords = [];
  const R = 111320;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dLat = (radiusM / R) * Math.cos(angle);
    const dLng = (radiusM / R) / Math.cos((center.lat * Math.PI) / 180) * Math.sin(angle);
    coords.push([center.lng + dLng, center.lat + dLat]);
  }
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [coords] },
    properties: {},
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   FARMSTAY MARKER — teardrop pin with a tree-pine icon
   Built once at module load (not per component mount).
   No default Mapbox pin is used anywhere in this component.
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
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markerRef    = useRef(null);
  const cleanupGestureRef = useRef(() => {});

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [showHint, setShowHint] = useState(false);

  // Stable approximate center — same for this listing every time
  const approxCenter = useMemo(
    () => getApproxCoords(Number(rawLat), Number(rawLng), String(listingId)),
    [rawLat, rawLng, listingId]
  );

  /* ── Init map once (StrictMode-safe: guarded by mapRef) ── */
  useEffect(() => {
    if (!containerRef.current) return;

    if (!isMapboxTokenConfigured()) {
      setStatus("error");
      return;
    }
    if (!isWebGLSupported()) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    loadMapboxGL().then((mapboxgl) => {
      if (cancelled || !mapboxgl || mapRef.current) return;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [approxCenter.lng, approxCenter.lat],
        zoom: 14,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: true,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new mapboxgl.FullscreenControl(), "top-right");

      cleanupGestureRef.current = enableCooperativeGestures(map, containerRef.current, setShowHint);

      map.on("load", () => {
        if (cancelled) return;

        map.addSource("approx-circle", {
          type: "geojson",
          data: createGeoJSONCircle(approxCenter, CIRCLE_RADIUS_M),
        });
        map.addLayer({
          id: "approx-circle-fill",
          type: "fill",
          source: "approx-circle",
          paint: { "fill-color": CIRCLE_FILL_COLOR, "fill-opacity": CIRCLE_FILL_OPACITY },
        });
        map.addLayer({
          id: "approx-circle-stroke",
          type: "line",
          source: "approx-circle",
          paint: {
            "line-color": CIRCLE_STROKE_COLOR,
            "line-opacity": CIRCLE_STROKE_OPACITY,
            "line-width": CIRCLE_STROKE_WEIGHT,
          },
        });

        const el = document.createElement("img");
        el.src = FARMSTAY_PIN_URL;
        el.style.width = "44px";
        el.style.height = "58px";
        el.style.pointerEvents = "none"; // clickable:false, draggable:false in the original

        markerRef.current = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([approxCenter.lng, approxCenter.lat])
          .addTo(map);

        setStatus("ready");
      });

      map.on("error", (e) => {
        console.error("[ApproximateLocationMap] Mapbox error:", e?.error || e);
        if (!mapRef.current?.loaded?.()) setStatus("error");
      });
    });

    return () => {
      cancelled = true;
      cleanupGestureRef.current?.();
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Keep circle + marker + center in sync if inputs change post-mount ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;

    map.setCenter([approxCenter.lng, approxCenter.lat]);
    markerRef.current?.setLngLat([approxCenter.lng, approxCenter.lat]);
    const source = map.getSource("approx-circle");
    if (source) source.setData(createGeoJSONCircle(approxCenter, CIRCLE_RADIUS_M));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approxCenter.lat, approxCenter.lng]);

  /* ── Loading skeleton ── */
  if (status === "loading") {
    return (
      <div className="w-full h-full rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-emerald-500 animate-spin" />
      </div>
    );
  }

  /* ── Error fallback ── */
  if (status === "error") {
    return (
      <div className="w-full h-full rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <p className="text-sm text-gray-400 dark:text-gray-500">Map unavailable</p>
      </div>
    );
  }

  /* ── Map ── */
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
      <div ref={containerRef} className="w-full h-full" />
      {showHint && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-medium">
            Use ctrl + scroll to zoom the map
          </span>
        </div>
      )}
    </div>
  );
}
