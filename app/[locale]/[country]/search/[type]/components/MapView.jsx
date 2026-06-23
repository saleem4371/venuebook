"use client";

import {
  GoogleMap,
  Marker,
  MarkerClusterer,
  OverlayView,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState, useEffect, useRef, useMemo } from "react";
import { X, Star, MapPin } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// ---------------- COUNTRY CONFIG ----------------
const countryConfig = {
  india: {
    name: "India",
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 5,
    bounds: { north: 35.5, south: 6.5, west: 68, east: 97.5 },
  },
  dubai: {
    name: "Dubai",
    center: { lat: 24.4, lng: 54.0 },
    zoom: 8,
    /* west 51.5° clips Qatar; strictBounds ensures viewport never shows outside this box */
    bounds: { north: 26.3, south: 22.3, west: 51.4, east: 56.6 },
    strictBounds: true,
  },
  saudi: {
    name: "Saudi Arabia",
    center: { lat: 23.8859, lng: 45.0792 },
    zoom: 5,
    bounds: { north: 32.0, south: 16.0, west: 34.0, east: 56.0 },
  },
  london: {
    name: "London",
    center: { lat: 51.5074, lng: -0.1278 },
    zoom: 10,
    bounds: { north: 51.7, south: 51.3, west: -0.5, east: 0.3 },
  },
  usa: {
    name: "USA",
    center: { lat: 37.0902, lng: -95.7129 },
    zoom: 4,
    bounds: { north: 49, south: 24, west: -125, east: -66 },
  },
  france: {
    name: "France",
    center: { lat: 46.2276, lng: 2.2137 },
    zoom: 5,
    bounds: { north: 51, south: 41, west: -5, east: 9 },
  },
};

// ---------------- VENUE FIELD NORMALIZERS ----------------
/** Returns { lat, lng } numbers or null — handles lat/latitude/etc. */
function getVenueCoords(v) {
  const lat = v?.lat ?? v?.latitude ?? v?.location_lat;
  const lng = v?.lng ?? v?.longitude ?? v?.lon ?? v?.location_lng ?? v?.location_long;
  if (!lat || !lng) return null;
  const latN = Number(lat), lngN = Number(lng);
  return latN && lngN ? { lat: latN, lng: lngN } : null;
}

/** Returns the best available price number or null */
function getVenuePrice(v) {
  return v?.minPrice || v?.basePrice || v?.price || v?.starting_price || v?.min_price || null;
}

/** Formats a price number for map marker: 75000 → "₹75,000" (en-IN full format) */
function formatMarkerPrice(n) {
  const num = Number(n);
  if (!num || num <= 0) return null;
  return "₹" + new Intl.NumberFormat("en-IN").format(Math.round(num));
}

// ---------------- CATEGORY THEME ----------------
const CATEGORY_THEME = {
  venue:      "#7c3aed",  // purple
  farmstay:   "#16a34a",  // green
  studio:     "#2563eb",  // blue
  rental:     "#ea580c",  // orange
  workspace:  "#0d9488",  // teal
  experience: "#db2777",  // pink
};

// Maps every possible incoming slug (plural API values like "venues"/"farmstays",
// hyphenated, or cased) → canonical singular key used in CATEGORY_THEME.
const _CAT_KEY_MAP = {
  venues: "venue",       venue:      "venue",
  farmstays: "farmstay", farmstay:   "farmstay",
  studios: "studio",     studio:     "studio",
  rentals: "rental",     rental:     "rental",
  workspaces: "workspace", workspace: "workspace",
  experiences: "experience", experience: "experience",
};
function normalizeCatKey(cat) {
  if (!cat) return "venue";
  const k = String(cat).toLowerCase().replace(/[-_\s]/g, "");
  return _CAT_KEY_MAP[k] ?? "venue";
}

function getCategoryColor(cat) {
  return CATEGORY_THEME[normalizeCatKey(cat)] ?? CATEGORY_THEME.venue;
}

/**
 * Returns SVG path/shape strings for each category icon.
 * All icons are drawn inside an 11px-radius white circle centered at (cx, cy).
 * Icon draw area: ±8px from center for good visual padding.
 */
function getCategoryIcon(cat, color, cx, cy) {
  const c = color;
  switch (normalizeCatKey(cat)) {
    case "farmstay":
      // Tabler-style leaf: organic asymmetric shape with diagonal center vein
      return (
        `<path d="M${cx},${cy+8} C${cx-7},${cy+5} ${cx-8},${cy-1} ${cx-4},${cy-6} C${cx-1},${cy-9} ${cx+4},${cy-9} ${cx+7},${cy-5} C${cx+9},${cy-1} ${cx+6},${cy+5} ${cx},${cy+8}Z" fill="${c}"/>` +
        `<line x1="${cx-1}" y1="${cy+6}" x2="${cx+2}" y2="${cy-7}" stroke="white" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/>`
      );
    case "studio":
      // Tabler-style camera: body + viewfinder notch + outer/inner lens circles
      return (
        `<rect x="${cx-6.5}" y="${cy-3.5}" width="13" height="9.5" rx="2" fill="${c}"/>` +
        `<path d="M${cx-3},${cy-3.5} L${cx-2},${cy-6.5} L${cx+2},${cy-6.5} L${cx+3},${cy-3.5}" fill="${c}"/>` +
        `<circle cx="${cx}" cy="${cy+0.5}" r="3.2" fill="white"/>` +
        `<circle cx="${cx}" cy="${cy+0.5}" r="1.8" fill="${c}"/>`
      );
    case "workspace":
      // Tabler-style briefcase: rectangular body + arched handle + horizontal seam
      return (
        `<rect x="${cx-6.5}" y="${cy-2}" width="13" height="9" rx="1.8" fill="${c}"/>` +
        `<path d="M${cx-3},${cy-2} L${cx-3},${cy-4.5} Q${cx-3},${cy-5.5} ${cx-1.5},${cy-5.5} L${cx+1.5},${cy-5.5} Q${cx+3},${cy-5.5} ${cx+3},${cy-4.5} L${cx+3},${cy-2}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/>` +
        `<rect x="${cx-6.5}" y="${cy+1.5}" width="13" height="1.2" fill="white" opacity="0.4"/>`
      );
    case "experience":
      // Tabler-style star: well-proportioned 5-point star
      return `<path d="M${cx},${cy-7.5} L${cx+2.1},${cy-2.3} L${cx+7.5},${cy-2.3} L${cx+3.2},${cy+1.4} L${cx+4.6},${cy+6.8} L${cx},${cy+3.8} L${cx-4.6},${cy+6.8} L${cx-3.2},${cy+1.4} L${cx-7.5},${cy-2.3} L${cx-2.1},${cy-2.3}Z" fill="${c}"/>`;
    case "rental":
      // Tabler-style house: triangle roof + rectangular walls + centered door
      return (
        `<polygon points="${cx},${cy-8} ${cx-7},${cy-1.5} ${cx+7},${cy-1.5}" fill="${c}"/>` +
        `<rect x="${cx-5.5}" y="${cy-1.5}" width="11" height="8.5" rx="0.5" fill="${c}"/>` +
        `<rect x="${cx-2.2}" y="${cy+1.5}" width="4.4" height="5.5" rx="0.8" fill="white"/>`
      );
    default: // venue — classical building: pediment + entablature + 3 columns + base
      return (
        `<polygon points="${cx},${cy-8} ${cx-7.5},${cy-2.5} ${cx+7.5},${cy-2.5}" fill="${c}"/>` +
        `<rect x="${cx-7.5}" y="${cy-2.5}" width="15" height="2" rx="0" fill="${c}"/>` +
        `<rect x="${cx-6.5}" y="${cy-0.5}" width="3.5" height="7.5" rx="0.4" fill="${c}"/>` +
        `<rect x="${cx-1.75}" y="${cy-0.5}" width="3.5" height="7.5" rx="0.4" fill="${c}"/>` +
        `<rect x="${cx+3}" y="${cy-0.5}" width="3.5" height="7.5" rx="0.4" fill="${c}"/>` +
        `<rect x="${cx-7.5}" y="${cy+7}" width="15" height="2" rx="0" fill="${c}"/>`
      );
  }
}

// ---------------- CUSTOM CLUSTER STYLES ----------------
// @react-google-maps/api MarkerClusterer uses the legacy `styles` array API.
// Each entry controls one tier of cluster sizes (1-9, 10-99, 100-999 …).
// The SVG provides the circle background; `textColor`/`textSize` control the overlaid count.
const _mkClusterStyle = (size) => {
  const half = size / 2;
  // Clean dark circle with crisp white ring — no shadow
  const svg  = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half - 1}" fill="#111827" stroke="#fff" stroke-width="2.5"/></svg>`;
  return {
    url:        "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    width:      size,
    height:     size,
    textColor:  "#ffffff",
    textSize:   13,
    fontWeight: "700",
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif",
  };
};
// Five tiers matching the default MarkerClusterer breakpoints
const CLUSTER_STYLES = [44, 50, 56, 62, 68].map(_mkClusterStyle);

// Returns the pixel size for a given cluster count (matches the 5-tier CLUSTER_STYLES above)
function getClusterPx(count) {
  if (count < 10)   return 44;
  if (count < 100)  return 50;
  if (count < 500)  return 56;
  if (count < 1000) return 62;
  return 68;
}

// ---------------- MARKER ICON BUILDER ----------------
// Markers:
//   No-price  → colored teardrop pin (category color) + white inner circle + category icon
//   Has-price → clean white capsule pill, no caret (Airbnb ₹15,406 style)
//
// Hover (non-selected only): 1.12× scaledSize — anchor stays at tip/bottom so the
// geographic position never shifts. SVG content is identical; only rendered size changes.
function buildMarkerIcon(venue, isSelected, isMapHovered, category) {
  const price    = getVenuePrice(venue);
  const label    = formatMarkerPrice(price);
  // normalizeCatKey handles both plural API slugs ("venues","farmstays") and singular/mixed forms
  const catKey   = normalizeCatKey(category || venue?.category || venue?.type);
  const catColor = getCategoryColor(catKey);
  // Only scale non-selected markers on hover — selected marker anchor must stay
  // fixed so the popup OverlayView position doesn't shift.
  const isHov = isMapHovered && !isSelected;

  if (!label) {
    // ── Teardrop map-pin: colored body + white circle + category icon ──
    // SVG canvas: 36 × 50. Circle center: (18, 16) r=14. Tip: (18, 49).
    const pinColor  = isSelected ? "#111827" : catColor;
    const iconColor = isSelected ? "#7c3aed" : catColor;
    const pinPath   = `M18,2 C10,2 4,8 4,16 C4,24 10,34 18,49 C26,34 32,24 32,16 C32,8 26,2 18,2 Z`;
    const shadow    = `<filter id="sh" x="-45%" y="-20%" width="190%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.25)"/></filter>`;
    const icon      = getCategoryIcon(catKey, iconColor, 18, 16);
    const svg       = (
      `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="50">` +
      `<defs>${shadow}</defs>` +
      `<path d="${pinPath}" fill="${pinColor}" filter="url(#sh)"/>` +
      `<circle cx="18" cy="16" r="11" fill="white" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>` +
      `${icon}` +
      `</svg>`
    );
    // Hover: 36×50 → 40×56 (1.12×). Anchor ratio preserved: tip at 98% of height.
    const sw = isHov ? 40 : 36;
    const sh = isHov ? 56 : 50;
    return {
      url:        "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(sw, sh),
      anchor:     new window.google.maps.Point(sw / 2, Math.round(sh * 0.98)),
    };
  }

  // ── Price pill: clean capsule, no caret ──
  const bg    = isSelected ? "#111827" : "#ffffff";
  const textC = isSelected ? "#ffffff" : "#111827";
  const fs    = label.length > 10 ? 10 : label.length > 8 ? 11 : 12;
  const w     = Math.max(56, label.length * 7 + 14);
  const h     = 30;
  const gap   = 3;
  const totalH = h + gap;
  const cx    = w / 2;
  const shadow = `<filter id="sh" x="-40%" y="-60%" width="180%" height="220%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.07)"/></filter>`;
  const svg   = (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${totalH}">` +
    `<defs>${shadow}</defs>` +
    `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${(h - 2) / 2}" fill="${bg}" stroke="rgba(0,0,0,0.07)" stroke-width="1" filter="url(#sh)"/>` +
    `<text x="${cx}" y="${h / 2 + 0.5}" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="${fs}" fill="${textC}" font-weight="700" letter-spacing="-0.3">${label}</text>` +
    `</svg>`
  );
  // Hover: scale rendered size 1.12×; anchor stays at bottom-center so pill
  // grows upward/outward from its geographic point — no position jump.
  const sw = isHov ? Math.round(w * 1.12) : w;
  const sh = isHov ? Math.round(totalH * 1.12) : totalH;
  return {
    url:        "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize: new window.google.maps.Size(sw, sh),
    anchor:     new window.google.maps.Point(Math.round(sw / 2), sh),
  };
}

// ---------------- SKELETON ----------------
const MapSkeleton = () => (
  <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
    <div className="text-gray-500 text-sm">Loading Map...</div>
  </div>
);

// ---------------- GEOCODE HELPER ----------------
function geocodeLabel(label, callback) {
  if (typeof window === "undefined") return;

  const attempt = () => {
    if (!window.google?.maps?.Geocoder) return false;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: label }, (results, status) => {
      if (status === "OK" && results[0]) {
        const pos = results[0].geometry.location;
        callback({ lat: pos.lat(), lng: pos.lng() });
      }
    });
    return true;
  };

  // If Maps API not yet available, retry up to 5× at 300ms intervals
  if (!attempt()) {
    let tries = 0;
    const timer = setInterval(() => {
      if (attempt() || ++tries >= 5) clearInterval(timer);
    }, 300);
  }
}

// ---------------- MAPVIEW COMPONENT ----------------
export default function MapView({
  venues = [],
  hoverVenue = null,
  country = "india",
  /** Active category slug ("venue", "farmstay", "studio", etc.) — drives pin color + icon */
  category = "venue",
  /** Show skeleton price-pill markers while API data is loading */
  isLoading = false,
  onBoundsChange,
  /** { label: string, lat?: number, lng?: number } — from preferences modal */
  preferredLocation = null,
  /** string — city/area from the search bar (highest map priority) */
  searchLocationLabel = null,
  /** Called when a map marker is clicked — receives the venue object */
  onVenueClick = null,
  /**
   * Called whenever the set of map-visible venues changes.
   * Receives the filtered array — only venues that have valid coords AND
   * fall inside the current map viewport. Use this to sync the card list.
   */
  onVisibleVenuesChange = null,
  /** Called when hovering a cluster icon on the map — receives array of venueIds in that cluster */
  onMapClusterHover = null,
  /** Called when hovering/leaving an individual marker on the map — receives venueId or null */
  onMapMarkerHover = null,
  /** Increment to programmatically reset map to country default center/zoom */
  resetKey = 0,
}) {
  const mapRef = useRef(null);
  // HTML OverlayView used for cluster hover gradient highlight (replaces imperative Marker approach).
  const clusterOvRef = useRef(null);
  // Maps google.maps.Marker instance → venueId for reliable cluster membership lookup.
  const markerVenueMapRef = useRef(new Map());
  // Suppresses onIdle processing while a cluster-click fitBounds animation is running.
  // Without this, onIdle fires mid-animation → setVisibleVenues → re-render → re-cluster,
  // which interrupts the animation and lands on a wrong location.
  const clusterZoomingRef = useRef(false);

  /* mapInstance tracks when the Google Map object is ready.
     The unified center effect depends on this — not on isLoaded —
     so it only runs after onLoad fires (avoiding the timing bug where
     isLoaded becomes true before mapRef.current is set). */
  const [mapInstance, setMapInstance] = useState(null);

  const [mapBounds, setMapBounds] = useState(null);
  const [visibleVenues, setVisibleVenues] = useState(venues);
  const [hoveredVenueId, setHoveredVenueId] = useState(null);
  // Tracks which marker the mouse is physically over (pin hover, separate from card hover)
  const [mapHoveredId, setMapHoveredId] = useState(null);
  // Cluster positions + member marker coords — populated by onClusteringEnd
  const [clusterData, setClusterData] = useState([]);
  const [selected, setSelected] = useState(null);
  // Stable reference — prevents OverlayView from recalculating position on unrelated re-renders
  const popupCoords = useMemo(() => selected ? getVenueCoords(selected) : null, [selected]);
  /* Geocoded coords for searchLocationLabel — resolved as soon as Maps API loads */
  const [geocodedCenter, setGeocodedCenter] = useState(null);
  /* Mobile breakpoint — drives bottom-sheet vs inline popup */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // ---------------- SAFE COUNTRY KEY ----------------
  const countryKey = String(country || "india").toLowerCase();
  const selectedCountryConfig =
    countryConfig[countryKey] || countryConfig["india"];

  // ---------------- GOOGLE MAPS LOADER ----------------
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    libraries: ["places"],
  });

  /* ── EARLY GEOCODE: resolve coords as soon as Maps API is ready ──
     This runs BEFORE the GoogleMap component mounts, so we get the
     correct coordinates to pass as the initial `center` prop — removing
     the jarring country-center → searched-location pan on first load. */
  useEffect(() => {
    if (!isLoaded) return;
    if (!searchLocationLabel) { setGeocodedCenter(null); return; }
    geocodeLabel(searchLocationLabel, (pos) => setGeocodedCenter(pos));
  }, [isLoaded, searchLocationLabel]);

  useEffect(() => {
    // Only venues with valid coords can appear on the map
    const withCoords = venues.filter((v) => getVenueCoords(v) !== null);

    if (!mapBounds) {
      setVisibleVenues(withCoords);
      onVisibleVenuesChange?.(withCoords);
      return;
    }

    const filtered = withCoords.filter((venue) => {
      const c = getVenueCoords(venue);
      return (
        c.lat <= mapBounds.north && c.lat >= mapBounds.south &&
        c.lng <= mapBounds.east  && c.lng >= mapBounds.west
      );
    });

    setVisibleVenues(filtered);
    onVisibleVenuesChange?.(filtered);
  }, [venues, mapBounds]);

  // Reset map when resetKey changes — mirrors the same priority as UNIFIED CENTER PRIORITY:
  // searched location → preferred/regional location → country default
  useEffect(() => {
    if (!mapInstance || resetKey === 0) return;

    if (geocodedCenter) {
      mapInstance.panTo(geocodedCenter);
      mapInstance.setZoom(12);
    } else if (searchLocationLabel) {
      geocodeLabel(searchLocationLabel, (pos) => {
        mapInstance.panTo(pos);
        mapInstance.setZoom(12);
      });
    } else if (preferredLocation?.lat && preferredLocation?.lng) {
      mapInstance.panTo({ lat: preferredLocation.lat, lng: preferredLocation.lng });
      mapInstance.setZoom(11);
    } else if (preferredLocation?.label) {
      geocodeLabel(preferredLocation.label, (pos) => {
        mapInstance.panTo(pos);
        mapInstance.setZoom(11);
      });
    } else {
      mapInstance.panTo(selectedCountryConfig.center);
      mapInstance.setZoom(selectedCountryConfig.zoom);
    }
  }, [resetKey, mapInstance]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------- UNIFIED CENTER PRIORITY ----------------
  // Runs after mapInstance is set. geocodedCenter is already resolved
  // (from the early-geocode effect above), so no async call needed here.
  // Priority: geocodedCenter (from searchLocationLabel) > preferredLocation > country default
  useEffect(() => {
    if (!mapInstance) return;

    // 1 — Pre-resolved search location (no extra geocode round-trip)
    if (geocodedCenter) {
      mapInstance.panTo(geocodedCenter);
      mapInstance.setZoom(12);
      return;
    }

    // 1b — searchLocationLabel exists but geocoding not done yet (fallback)
    if (searchLocationLabel && !geocodedCenter) {
      geocodeLabel(searchLocationLabel, (pos) => {
        setGeocodedCenter(pos);
        mapInstance.panTo(pos);
        mapInstance.setZoom(12);
      });
      return;
    }

    // 2 — Preferred location from preferences modal
    if (preferredLocation) {
      if (preferredLocation.lat && preferredLocation.lng) {
        mapInstance.panTo({ lat: preferredLocation.lat, lng: preferredLocation.lng });
        mapInstance.setZoom(11);
      } else if (preferredLocation.label) {
        geocodeLabel(preferredLocation.label, (pos) => {
          mapInstance.panTo(pos);
          mapInstance.setZoom(11);
        });
      }
      return;
    }

    // 3 — Country default (also handles region switch)
    mapInstance.panTo(selectedCountryConfig.center);
    mapInstance.setZoom(selectedCountryConfig.zoom);
  }, [
    geocodedCenter,
    searchLocationLabel,
    preferredLocation,
    selectedCountryConfig,
    mapInstance,
  ]);

  useEffect(() => {
    const venueId = hoverVenue?.childVenueId || hoverVenue?.id || hoverVenue?._id;
    if (!hoverVenue || !venueId) {
      setHoveredVenueId(null);
      return;
    }
    // Only highlight the marker — do NOT pan the map.
    // Panning on card hover causes onIdle → onBoundsChange → full re-render lag.
    setHoveredVenueId(venueId);
  }, [hoverVenue]);

  // ── These must stay ABOVE the early return so hook order is always stable ──

  // When a card is hovered, find which cluster (if any) contains that venue.
  // useMemo (not a plain IIFE) so the reference only changes when deps change —
  // this lets useEffect([hoveredCluster]) detect the case where hoveredVenueId is
  // already set and clusterData freshens up after onClusteringEnd fires.
  const hoveredCluster = useMemo(() => {
    if (!hoveredVenueId || !clusterData.length) return null;
    return clusterData.find((cl) => cl.venueIds.includes(hoveredVenueId)) ?? null;
  }, [hoveredVenueId, clusterData]);

  // Drive the CSS-animated gradient OverlayView from hoveredCluster.
  // HTML overlay gives us linear-gradient, box-shadow glow, and CSS scale transition —
  // none of which are possible with an SVG data-URI Marker icon.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Tear down any existing overlay first
    if (clusterOvRef.current) {
      clusterOvRef.current.setMap(null);
      clusterOvRef.current = null;
    }

    if (!hoveredCluster || !window.google?.maps || !mapRef.current) return;

    const { position, size } = hoveredCluster;
    const px = getClusterPx(size);
    const fs = px >= 50 ? 14 : 13;

    let div = null;
    const ov = new window.google.maps.OverlayView();

    ov.onAdd = function () {
      div = document.createElement("div");
      Object.assign(div.style, {
        position:        "absolute",
        width:           `${px}px`,
        height:          `${px}px`,
        background:      "linear-gradient(242deg, #a44bf3 0%, #499ce8 100%)",
        borderRadius:    "50%",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        color:           "#fff",
        fontWeight:      "700",
        fontSize:        `${fs}px`,
        fontFamily:      "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif",
        boxShadow:       "0 0 0 4px rgba(164,75,243,0.22), 0 4px 20px rgba(73,156,232,0.32)",
        border:          "2.5px solid rgba(255,255,255,0.4)",
        pointerEvents:   "none",
        userSelect:      "none",
        // Start hidden+small — CSS transition animates to final state
        transform:       "translate(-50%, -50%) scale(0.8)",
        opacity:         "0",
        transition:      "transform 260ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms ease",
        willChange:      "transform, opacity",
      });
      div.textContent = String(size);
      this.getPanes().floatPane.appendChild(div);
      // Double rAF ensures the transition fires (single rAF can batch with initial paint)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!div) return;
          div.style.transform = "translate(-50%, -50%) scale(1.18)";
          div.style.opacity   = "1";
        })
      );
    };

    ov.draw = function () {
      const proj = this.getProjection();
      if (!proj || !div) return;
      const pt = proj.fromLatLngToDivPixel(
        new window.google.maps.LatLng(position.lat, position.lng)
      );
      if (pt) {
        div.style.left = `${pt.x}px`;
        div.style.top  = `${pt.y}px`;
      }
    };

    ov.onRemove = function () {
      if (div?.parentNode) div.parentNode.removeChild(div);
      div = null;
    };

    ov.setMap(mapRef.current);
    clusterOvRef.current = ov;

    return () => {
      if (clusterOvRef.current) {
        clusterOvRef.current.setMap(null);
        clusterOvRef.current = null;
      }
    };
  }, [hoveredCluster]);

  if (!isLoaded) return <MapSkeleton />;

  return (
    <>
    {/* Spinner keyframe */}
    <style>{`
      @keyframes vcDot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
        40%            { transform: scale(1.1); opacity: 1;   }
      }
      .vc-loading-chip { top: 64px; }
    `}</style>
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={geocodedCenter ?? selectedCountryConfig.center}
      zoom={geocodedCenter ? 12 : selectedCountryConfig.zoom}
      onLoad={(map) => {
        mapRef.current = map;
        setMapInstance(map);
      }}
      onClick={() => setSelected(null)}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: "greedy",
        zoomControl: true,
        restriction: {
          latLngBounds: selectedCountryConfig.bounds,
          strictBounds: selectedCountryConfig.strictBounds ?? false,
        },
      }}
      onIdle={() => {
        // Skip mid-animation idle events fired during a cluster-click fitBounds.
        // The click handler fires the update manually once the animation settles.
        if (clusterZoomingRef.current) return;
        if (!mapRef.current) return;

        const bounds = mapRef.current.getBounds();
        if (!bounds) return;

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        const mapData = {
          north: ne.lat(),
          east: ne.lng(),
          south: sw.lat(),
          west: sw.lng(),
        };

        onBoundsChange?.(mapData);

        const filtered = venues
          .filter((venue) => {
            const c = getVenueCoords(venue);
            if (!c) return false;
            return (
              c.lat <= mapData.north && c.lat >= mapData.south &&
              c.lng <= mapData.east  && c.lng >= mapData.west
            );
          });

        setVisibleVenues(filtered);
        onVisibleVenuesChange?.(filtered);
      }}
    >
      {/* MARKERS */}
      <MarkerClusterer
        styles={CLUSTER_STYLES}
        zoomOnClick={false}
        onMouseOver={(cluster) => {
          if (!cluster?.getMarkers) return;
          const ids = cluster.getMarkers()
            .map((m) => markerVenueMapRef.current.get(m))
            .filter(Boolean);
          if (ids.length) onMapClusterHover?.(ids);
        }}
        onMouseOut={() => onMapClusterHover?.([])}
        onClusteringEnd={(mc) => {
          // Use venueId stored on each marker instance (via markerVenueMapRef) instead of
          // coordinate matching — avoids float precision issues and is O(1) per marker.
          const data = mc.getClusters()
            .filter((c) => c.getSize() > 1)
            .map((c) => {
              const center = c.getCenter();
              if (!center) return null;
              return {
                position: { lat: center.lat(), lng: center.lng() },
                size: c.getSize(),
                venueIds: c.getMarkers()
                  .map((m) => markerVenueMapRef.current.get(m))
                  .filter(Boolean),
              };
            })
            .filter(Boolean);
          setClusterData(data);
        }}
        onClick={(cluster) => {
          if (!mapRef.current) return;
          const clusterMarkers = cluster?.getMarkers?.();
          if (!clusterMarkers?.length) return;

          const currentZoom = mapRef.current.getZoom() ?? 0;

          // Build bounds by looking up coordinates from the venues prop via
          // markerVenueMapRef (marker → venueId → venue → coords).
          // This is more reliable than m.getPosition() which can drift in legacy
          // MarkerClusterer, and avoids the stale-closure issue with cluster.getCenter().
          const bounds = new window.google.maps.LatLngBounds();
          let validCount = 0;
          clusterMarkers.forEach((m) => {
            const vid    = markerVenueMapRef.current.get(m);
            const vn     = vid ? venues.find((v) => (v.childVenueId || v.id || v._id) === vid) : null;
            const coords = vn ? getVenueCoords(vn) : null;
            if (coords) {
              bounds.extend(new window.google.maps.LatLng(coords.lat, coords.lng));
              validCount++;
            } else {
              // Fallback: use marker's own position if venue lookup misses
              const p = m.getPosition();
              if (p) { bounds.extend(p); validCount++; }
            }
          });
          if (!validCount) return;

          const boundsCenter = bounds.getCenter();

          // Same-point: all venues share one lat/lng → fitBounds produces zero-size
          // bounds which causes extreme over-zoom. Step-zoom instead.
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          const isSamePoint =
            Math.abs(ne.lat() - sw.lat()) < 0.0001 &&
            Math.abs(ne.lng() - sw.lng()) < 0.0001;

          // Fire onBoundsChange + visible-venues sync after map settles.
          const fireBoundsUpdate = () => {
            const b = mapRef.current?.getBounds();
            if (!b) return;
            const bne = b.getNorthEast(), bsw = b.getSouthWest();
            const mapData = { north: bne.lat(), east: bne.lng(), south: bsw.lat(), west: bsw.lng() };
            onBoundsChange?.(mapData);
            const filtered = venues.filter((v) => {
              const c = getVenueCoords(v);
              if (!c) return false;
              return c.lat <= mapData.north && c.lat >= mapData.south &&
                     c.lng <= mapData.east  && c.lng >= mapData.west;
            });
            setVisibleVenues(filtered);
            onVisibleVenuesChange?.(filtered);
          };

          // Suppress main onIdle handler during animation to prevent re-clustering.
          clusterZoomingRef.current = true;

          if (isSamePoint) {
            mapRef.current.setCenter(boundsCenter);
            mapRef.current.setZoom(Math.min(currentZoom + 4, 17));
            window.google.maps.event.addListenerOnce(mapRef.current, "idle", () => {
              clusterZoomingRef.current = false;
              fireBoundsUpdate();
            });
            return;
          }

          // Numeric padding (80px) — universally supported across all Maps API versions.
          // If fitBounds results in a lower zoom (cluster spans a wide area) we trust it:
          // it correctly shows all listings. We only cap the upper bound at zoom 16.
          mapRef.current.fitBounds(bounds, 80);

          window.google.maps.event.addListenerOnce(mapRef.current, "idle", () => {
            clusterZoomingRef.current = false;
            const newZoom = mapRef.current?.getZoom() ?? 0;
            if (newZoom > 16) mapRef.current.setZoom(16);
            fireBoundsUpdate();
          });
        }}
      >
        {(clusterer) =>
          visibleVenues
            .filter((venue) => getVenueCoords(venue) !== null)
            .map((venue) => {
              const coords  = getVenueCoords(venue);
              const venueId = venue.childVenueId || venue.id || venue._id;
              const isSelected =
                selected && (selected.childVenueId || selected.id || selected._id) === venueId;
              // Pin is "active" (dark) when selected or highlighted from card hover
              const isActive   = isSelected || hoveredVenueId === venueId;
              // Pin is "map-hovered" when the mouse is physically over it
              const isMapHov   = mapHoveredId === venueId;
              return (
                <Marker
                  key={venueId}
                  position={coords}
                  clusterer={clusterer}
                  icon={window.google?.maps ? buildMarkerIcon(venue, isActive, isMapHov, category) : undefined}
                  zIndex={isMapHov || isActive ? 9999 : undefined}
                  onLoad={(m) => markerVenueMapRef.current.set(m, venueId)}
                  onUnmount={(m) => markerVenueMapRef.current.delete(m)}
                  onClick={() => {
                    setSelected(venue);
                    onVenueClick?.(venue);
                  }}
                  onMouseOver={() => {
                    setMapHoveredId(venueId);
                    onMapMarkerHover?.(venueId);
                  }}
                  onMouseOut={() => {
                    setMapHoveredId(null);
                    onMapMarkerHover?.(null);
                  }}
                />
              );
            })
        }
      </MarkerClusterer>

      {/* Cluster hover highlight is driven by an HTML OverlayView in the useEffect above —
           renders a CSS-animated gradient div that exceeds MAX_ZINDEX+1 */}

      {/* Skeleton OverlayViews removed — loading state is shown outside the map */}

      {/* ── DESKTOP POPUP: anchored just below the marker via OverlayView ── */}
      {selected && popupCoords && !isMobile && (
        <OverlayView
          position={popupCoords}
          mapPaneName={OverlayView.FLOAT_PANE}
          getPixelPositionOffset={(w) => ({ x: -(w / 2), y: 6 })}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 8px 28px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
              width: 210,
              overflow: "hidden",
              userSelect: "none",
              position: "relative",
            }}
          >
            <div>
            {/* Image */}
            {selected.images?.[0] && (
              <div style={{ position: "relative", height: 110, overflow: "hidden" }}>
                <img
                  src={selected.images[0]}
                  alt={selected.venueName || selected.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                  style={{
                    position: "absolute", top: 7, right: 7,
                    background: "rgba(255,255,255,0.9)",
                    border: "none", borderRadius: "50%",
                    width: 24, height: 24,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={12} color="#374151" />
                </button>
              </div>
            )}

            {/* Content */}
            <div style={{ padding: "9px 11px 11px" }}>
              <p style={{ fontWeight: 700, fontSize: 12.5, color: "#111827", lineHeight: 1.3, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {selected.venueName || selected.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 7 }}>
                <MapPin size={9} color="#9ca3af" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 10.5, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {[selected.city, selected.state].filter(Boolean).join(" · ")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f3f4f6", paddingTop: 7 }}>
                <p style={{ fontWeight: 800, fontSize: 13, color: "#111827" }}>
                  {getVenuePrice(selected)
                    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(getVenuePrice(selected))
                    : "Contact"}
                </p>
                {(selected.rating || selected.avgRating) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Star size={10} fill="#fbbf24" color="#fbbf24" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
                      {Number(selected.rating || selected.avgRating).toFixed(1)}
                    </span>
                    {(selected.reviewCount || selected.review_count) && (
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>
                        ({selected.reviewCount || selected.review_count})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </OverlayView>
      )}

    </GoogleMap>

    {/* ── LOADING CHIP: top-center badge while venue data fetches ── */}
    {isLoading && (
      <div className="vc-loading-chip" style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 7,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 99,
        padding: "11px 20px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
        pointerEvents: "none",
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 10, height: 10,
            borderRadius: "50%",
            background: "#9ca3af",
            animation: `vcDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    )}

    {/* ── MOBILE BOTTOM SHEET: slides up from the bottom when a marker is tapped ── */}
    {selected && isMobile && (
      <>
        {/* Dim backdrop */}
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 998,
            background: "rgba(0,0,0,0.18)",
          }}
        />
        {/* Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999,
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.16)",
            overflow: "hidden",
          }}
        >
          {/* Drag handle */}
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e5e7eb" }} />
          </div>

          <div style={{ display: "flex", gap: 12, padding: "8px 16px 36px" }}>
            {/* Image */}
            {selected.images?.[0] && (
              <div style={{ width: 90, height: 90, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                <img
                  src={selected.images[0]}
                  alt={selected.venueName || selected.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#111827", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {selected.venueName || selected.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin size={10} color="#9ca3af" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {[selected.city, selected.state].filter(Boolean).join(" · ")}
                </span>
              </div>
              {(selected.rating || selected.avgRating) && (
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Star size={10} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
                    {Number(selected.rating || selected.avgRating).toFixed(1)}
                  </span>
                  {(selected.reviewCount || selected.review_count) && (
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>({selected.reviewCount || selected.review_count})</span>
                  )}
                </div>
              )}
              <p style={{ fontWeight: 800, fontSize: 15, color: "#111827", marginTop: 2 }}>
                {getVenuePrice(selected)
                  ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(getVenuePrice(selected))
                  : "Contact for Price"}
              </p>
            </div>

            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              style={{
                alignSelf: "flex-start", background: "#f3f4f6",
                border: "none", borderRadius: "50%",
                width: 28, height: 28, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={13} color="#374151" />
            </button>
          </div>
        </div>
      </>
    )}
    </>
  );
}

