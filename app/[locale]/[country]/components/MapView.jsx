"use client";

import {
  GoogleMap,
  Marker,
  MarkerClusterer,
  OverlayView,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Star, MapPin } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// ---------------- COUNTRY CONFIG ----------------
// NOTE: `iso` is the ISO 3166-1 alpha-2 code required by Google's
// Geocoder `componentRestrictions.country` field. This MUST be a 2-letter
// country code (e.g. "in", "ae", "gb") — NOT a full country/city name like
// "India" or "London". Passing full names here was the root cause of
// geocoding silently failing (Google returns ZERO_RESULTS for invalid
// country restriction values).
const countryConfig = {
  india: {
    name: "India",
    iso: "in",
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 5,
    bounds: { north: 35.5, south: 6.5, west: 68, east: 97.5 },
  },
  dubai: {
    name: "Dubai",
    iso: "ae",
    center: { lat: 24.4, lng: 54.0 },
    zoom: 8,
    /* west 51.5° clips Qatar; strictBounds ensures viewport never shows outside this box */
    bounds: { north: 26.3, south: 22.3, west: 51.4, east: 56.6 },
    strictBounds: true,
  },
  saudi: {
    name: "Saudi Arabia",
    iso: "sa",
    center: { lat: 23.8859, lng: 45.0792 },
    zoom: 5,
    bounds: { north: 32.0, south: 16.0, west: 34.0, east: 56.0 },
  },
  london: {
    name: "London",
    iso: "gb",
    center: { lat: 51.5074, lng: -0.1278 },
    zoom: 10,
    bounds: { north: 51.7, south: 51.3, west: -0.5, east: 0.3 },
  },
  usa: {
    name: "USA",
    iso: "us",
    center: { lat: 37.0902, lng: -95.7129 },
    zoom: 4,
    bounds: { north: 49, south: 24, west: -125, east: -66 },
  },
  france: {
    name: "France",
    iso: "fr",
    center: { lat: 46.2276, lng: 2.2137 },
    zoom: 5,
    bounds: { north: 51, south: 41, west: -5, east: 9 },
  },
};

// ---------------- VENUE FIELD NORMALIZERS ----------------
/**
 * Returns { lat, lng } as finite, in-range numbers — or null for anything
 * that must NEVER become a map marker. Handles lat/latitude/etc. field names.
 *
 * A marker with a bad coordinate is the root cause of the "cluster jumps to
 * Chhattisgarh/Odisha" bug: when an invalid point (0,0, NaN, a string, or an
 * out-of-range value) slips into a cluster, the bounds computed from that
 * cluster include the bad point, and Google's fitBounds — constrained by the
 * India `restriction` box — resolves the camera to the interior of that box
 * (central India ≈ 20.6N, 79E). Filtering here means invalid points are never
 * turned into markers, so they can never be clustered and can never drag the
 * camera anywhere. This is the single validation gate every consumer relies on.
 */
function getVenueCoords(v) {
  const lat = v?.lat ?? v?.latitude ?? v?.location_lat;
  const lng = v?.lng ?? v?.longitude ?? v?.lon ?? v?.location_lng ?? v?.location_long;

  // Reject null / undefined / empty-string BEFORE coercion (Number("") === 0,
  // which would otherwise sneak a (0,0) marker through).
  if (lat === null || lat === undefined || lat === "" ||
      lng === null || lng === undefined || lng === "") {
    return null;
  }

  const latN = Number(lat), lngN = Number(lng);

  // Reject NaN and ±Infinity (Number.isFinite is false for both).
  if (!Number.isFinite(latN) || !Number.isFinite(lngN)) return null;

  // Reject the (0,0) sentinel used for ungeocoded/blank records. No real
  // India/UAE venue sits at the Gulf of Guinea; treat it as "no location".
  if (latN === 0 && lngN === 0) return null;

  // Reject anything physically off the globe (swapped/garbage coordinates).
  if (latN < -90 || latN > 90 || lngN < -180 || lngN > 180) return null;

  return { lat: latN, lng: lngN };
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
const _mkClusterStyle = (size) => {
  const half = size / 2;
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
// Module-level constant — created once, never recreated on render.
const CLUSTER_STYLES = [44, 50, 56, 62, 68].map(_mkClusterStyle);

function getClusterPx(count) {
  if (count < 10)   return 44;
  if (count < 100)  return 50;
  if (count < 500)  return 56;
  if (count < 1000) return 62;
  return 68;
}

// ---------------- MARKER ICON BUILDER ----------------
function buildMarkerIcon(venue, isSelected, isMapHovered, category) {
  const price    = getVenuePrice(venue);
  const label    = formatMarkerPrice(price);
  const catKey   = normalizeCatKey(category || venue?.category || venue?.type);
  const catColor = getCategoryColor(catKey);
  const isHov = isMapHovered && !isSelected;

  if (!label) {
    const pinColor  = isSelected ? "#111827" : catColor;
    const iconColor = isSelected ? "#7c3aed" : catColor;
    const pinPath   = `M18,2 C10,2 4,8 4,16 C4,24 10,34 18,49 C26,34 32,24 32,16 C32,8 26,2 18,2 Z`;
    // Cleaner, softer two-layer drop shadow (was a single harsh 0.25 alpha).
    const shadow    = `<filter id="sh" x="-50%" y="-25%" width="200%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(17,24,39,0.20)"/><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(17,24,39,0.12)"/></filter>`;
    const icon      = getCategoryIcon(catKey, iconColor, 18, 16);
    const svg       = (
      `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="50">` +
      `<defs>${shadow}</defs>` +
      // White hairline around the pin separates it from busy map tiles.
      `<path d="${pinPath}" fill="${pinColor}" stroke="#ffffff" stroke-width="1.5" filter="url(#sh)"/>` +
      // White icon disc with a stronger neutral border + a faint category-tinted
      // inner ring for better contrast and visual balance (icon stays centered
      // at 18,16 with ~8px padding inside the r=11 disc).
      `<circle cx="18" cy="16" r="11" fill="#ffffff" stroke="rgba(17,24,39,0.14)" stroke-width="1"/>` +
      `<circle cx="18" cy="16" r="9.6" fill="none" stroke="${iconColor}" stroke-width="0.9" opacity="0.16"/>` +
      `${icon}` +
      `</svg>`
    );
    const sw = isHov ? 40 : 36;
    const sh = isHov ? 56 : 50;
    return {
      url:        "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(sw, sh),
      anchor:     new window.google.maps.Point(sw / 2, Math.round(sh * 0.98)),
    };
  }

  const bg    = isSelected ? "#111827" : "#ffffff";
  const textC = isSelected ? "#ffffff" : "#111827";
  const fs    = label.length > 10 ? 10 : label.length > 8 ? 11 : 12;
  const h     = 32;
  const gap   = 3;
  const totalH = h + gap;

  // Clean price-only pill — no category icon/badge, just the price text,
  // centered both ways. Keeps the same pill height/shadow/border/hover-grow
  // behavior as before, just without the left icon zone eating into it.
  const padX   = 14;
  const textW  = label.length * 7;
  const w      = Math.max(56, textW + padX * 2);
  const textCx = w / 2;
  const shadow = `<filter id="sh" x="-40%" y="-60%" width="180%" height="220%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.07)"/></filter>`;
  const svg   = (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${totalH}">` +
    `<defs>${shadow}</defs>` +
    `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${(h - 2) / 2}" fill="${bg}" stroke="rgba(0,0,0,0.08)" stroke-width="1" filter="url(#sh)"/>` +
    `<text x="${textCx}" y="${h / 2 + 0.5}" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="${fs}" fill="${textC}" font-weight="700" letter-spacing="-0.3">${label}</text>` +
    `</svg>`
  );
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
/**
 * Geocodes a free-text label, scoped to a country.
 *
 * @param {string} label - the place text to search for
 * @param {{name: string, iso: string}} countryCfg - the selected country's
 *   config object. `iso` MUST be a 2-letter ISO 3166-1 alpha-2 code
 *   (e.g. "in", "ae", "gb") because that's what Google's
 *   componentRestrictions.country field requires. Passing the full
 *   country/city name here (e.g. "India", "London") causes Google to
 *   return ZERO_RESULTS for almost every query.
 * @param {(pos: {lat: number, lng: number}) => void} callback
 */
function geocodeLabel(label, countryCfg, callback) {
  if (typeof window === "undefined") return;
  if (!countryCfg?.iso) return;

  const attempt = () => {
    if (!window.google?.maps?.Geocoder) return false;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      {
        address: `${label}, ${countryCfg.name}`,
        componentRestrictions: {
          country: countryCfg.iso.toLowerCase(),
        },
      },
      (results, status) => {
        if (status === "OK" && results?.length) {
          const pos = results[0].geometry.location;
          callback({
            lat: pos.lat(),
            lng: pos.lng(),
          });
        }
      }
    );

    return true;
  };

  if (!attempt()) {
    let tries = 0;

    const timer = setInterval(() => {
      if (attempt() || ++tries >= 5) clearInterval(timer);
    }, 300);
  }
}

// ---------------- NAVIGATION HELPER ----------------
// Prevents repeated panTo/setZoom calls (and the idle events they trigger)
// when an effect re-runs due to prop-reference churn but the actual
// target lat/lng/zoom hasn't changed.
function sameNavTarget(a, b) {
  if (!a || !b) return false;
  return (
    Math.abs(a.lat - b.lat) < 1e-6 &&
    Math.abs(a.lng - b.lng) < 1e-6 &&
    a.zoom === b.zoom
  );
}

// ---------------- MAPVIEW COMPONENT ----------------
export default function MapView({
  venues = [],
  hoverVenue = null,
  country = "india",
  category = "venue",
  isLoading = false,
  onBoundsChange,
  preferredLocation = null,
  searchLocationLabel = null,
  searchCenter = null,
  onVenueClick = null,
  onVisibleVenuesChange = null,
  onMapClusterHover = null,
  onMapMarkerHover = null,
  resetKey = 0,
}) {

  const mapRef = useRef(null);
  const clusterOvRef = useRef(null);
  const markerVenueMapRef = useRef(new Map());
  const clusterZoomingRef = useRef(false);

  // Tracks the last lat/lng/zoom we imperatively navigated to.
  // This is what actually breaks the re-render → re-navigate → idle loop.
  const lastNavTargetRef = useRef(null);

  const [mapInstance, setMapInstance] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [visibleVenues, setVisibleVenues] = useState(venues);
  const [hoveredVenueId, setHoveredVenueId] = useState(null);
  const [mapHoveredId, setMapHoveredId] = useState(null);
  const [clusterData, setClusterData] = useState([]);
  const [selected, setSelected] = useState(null);
  const popupCoords = useMemo(() => selected ? getVenueCoords(selected) : null, [selected]);
  const [geocodedCenter, setGeocodedCenter] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // ---------------- SAFE COUNTRY KEY ----------------
  const countryKey = String(country || "india").toLowerCase();
  // Memoized: only produces a new object reference when countryKey actually
  // changes, instead of on every render (was previously a plain const,
  // which is *usually* stable, but memoizing makes the invariant explicit
  // and cheap to verify — this object feeds two effects and the options
  // object below, so its identity matters).
  const selectedCountryConfig = useMemo(
    () => countryConfig[countryKey] || countryConfig["india"],
    [countryKey]
  );

  // ---------------- GOOGLE MAPS LOADER ----------------
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    libraries: ["places"],
  });

  /* ── EARLY GEOCODE ── */
  useEffect(() => {
    if (!isLoaded) return;
    // Exact coordinates from the URL (Home-page search) win outright — center
    // on them directly with no Geocoder round-trip. This is what makes a
    // Home→Search navigation land on the searched location. When they're
    // absent (e.g. an in-page search cleared them), fall back to geocoding
    // the text label as before.
    const la = Number(searchCenter?.lat);
    const ln = Number(searchCenter?.lng);
    if (Number.isFinite(la) && Number.isFinite(ln) && !(la === 0 && ln === 0)) {
      setGeocodedCenter({ lat: la, lng: ln });
      return;
    }
    if (!searchLocationLabel) { setGeocodedCenter(null); return; }
    geocodeLabel(
      searchLocationLabel,
      selectedCountryConfig,
      (pos) => {
        setGeocodedCenter(pos);
      }
    );
    // `selectedCountryConfig` is included so switching countries while a
    // search label is present re-geocodes against the new country instead
    // of silently reusing a stale restriction.
  }, [isLoaded, searchCenter, searchLocationLabel, selectedCountryConfig]);

  // Captured once — the controlled center/zoom props on <GoogleMap> are only
  // used for the very first paint. All navigation after mount happens
  // imperatively via navigateTo(), never by changing these props again.
  // This removes the second writer that was fighting with panTo/setZoom.
  const initialCenterRef = useRef(geocodedCenter ?? selectedCountryConfig.center);
  const initialZoomRef   = useRef(geocodedCenter ? 12 : selectedCountryConfig.zoom);

  useEffect(() => {
    // Only used to update the *first* real position once geocoding
    // resolves shortly after mount and before the map has meaningfully
    // settled anywhere else. Subsequent changes go through navigateTo.
    if (geocodedCenter && !mapInstance) {
      initialCenterRef.current = geocodedCenter;
      initialZoomRef.current = 12;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geocodedCenter, mapInstance]);

  // ── MARKER VALIDATION PASS (runs once per dataset, memoized) ──
  // Partitions the incoming venues into valid vs rejected markers BEFORE any
  // of them can reach the clusterer, and logs every rejected one so bad
  // coordinates are visible in the console. Only rebuilds when `venues`
  // changes (dataset/filters), never on map pan/zoom.
  const validVenues = useMemo(() => {
    const valid = [];
    const rejected = [];
    for (const v of venues) {
      if (getVenueCoords(v) !== null) valid.push(v);
      else {
        rejected.push({
          name: v?.venueName || v?.name || v?.childVenueId || v?.id || "(unknown)",
          lat: v?.lat ?? v?.latitude ?? v?.location_lat ?? null,
          lng: v?.lng ?? v?.longitude ?? v?.lon ?? v?.location_lng ?? v?.location_long ?? null,
        });
      }
    }
    if (rejected.length) {
      /* eslint-disable no-console */
      console.groupCollapsed(
        `[MapView] Rejected ${rejected.length} marker(s) with invalid coordinates (null/NaN/0,0/out-of-range)`
      );
      console.table(rejected);
      console.groupEnd();
      /* eslint-enable no-console */
    }
    return valid;
  }, [venues]);

  useEffect(() => {
    // Only venues with valid coords can appear on the map
    const withCoords = validVenues;

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
  }, [validVenues, mapBounds]);

  // Idempotent imperative navigation — the loop-breaker.
  // If the resolved target (lat/lng/zoom) is unchanged from the last
  // navigation, this is a no-op, even if the calling effect re-ran because
  // of unrelated prop-reference churn (e.g. a new-but-equal preferredLocation
  // object from the parent). No panTo/setZoom call means no extra `idle`.
  const navigateTo = useCallback((map, lat, lng, zoom) => {
    if (!map) return;

    const target = { lat, lng, zoom };

    if (sameNavTarget(lastNavTargetRef.current, target)) return;

    lastNavTargetRef.current = target;

    map.panTo({ lat, lng });
    map.setZoom(zoom);
  }, []);

  // Reset map when resetKey changes — explicit user action, always navigates.
  useEffect(() => {
    if (!mapInstance || resetKey === 0) return;

    if (geocodedCenter) {
      navigateTo(mapInstance, geocodedCenter.lat, geocodedCenter.lng, 12);
    } else if (searchLocationLabel) {
      geocodeLabel(
        searchLocationLabel,
        selectedCountryConfig,
        (pos) => {
          setGeocodedCenter(pos);
          navigateTo(mapInstance, pos.lat, pos.lng, 12);
        }
      );
    } else if (preferredLocation?.lat && preferredLocation?.lng) {
      navigateTo(mapInstance, preferredLocation.lat, preferredLocation.lng, 11);
    } else if (preferredLocation?.label) {
      // FIX: previously called as geocodeLabel(label, callback) — missing
      // the country config arg entirely, which crashed inside geocodeLabel
      // (countryCfg.iso was actually the callback function).
      geocodeLabel(preferredLocation.label, selectedCountryConfig, (pos) => {
        navigateTo(mapInstance, pos.lat, pos.lng, 11);
      });
    } else {
      navigateTo(
        mapInstance,
        selectedCountryConfig.center.lat,
        selectedCountryConfig.center.lng,
        selectedCountryConfig.zoom
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, mapInstance]);

  // ---------------- UNIFIED CENTER PRIORITY ----------------
  // Priority: geocodedCenter (from searchLocationLabel) > preferredLocation > country default.
  // This effect may re-run purely because of prop-reference churn from the
  // parent (e.g. preferredLocation being recreated with the same values on
  // every SearchPage re-render). navigateTo() makes that harmless: it only
  // touches the map when the actual target changed.
  useEffect(() => {
    if (!mapInstance) return;

    if (geocodedCenter) {
      navigateTo(mapInstance, geocodedCenter.lat, geocodedCenter.lng, 12);
      return;
    }

    if (searchLocationLabel && !geocodedCenter) {
      geocodeLabel(
        searchLocationLabel,
        selectedCountryConfig,
        (pos) => {
          setGeocodedCenter(pos);
          navigateTo(mapInstance, pos.lat, pos.lng, 12);
        }
      );
      return;
    }

    if (preferredLocation) {
      if (preferredLocation.lat && preferredLocation.lng) {
        navigateTo(mapInstance, preferredLocation.lat, preferredLocation.lng, 11);
      } else if (preferredLocation.label) {
        geocodeLabel(
          preferredLocation.label,
          selectedCountryConfig,
          (pos) => {
            navigateTo(mapInstance, pos.lat, pos.lng, 11);
          }
        );
      }
      return;
    }

    navigateTo(
      mapInstance,
      selectedCountryConfig.center.lat,
      selectedCountryConfig.center.lng,
      selectedCountryConfig.zoom
    );
  }, [
    geocodedCenter,
    searchLocationLabel,
    preferredLocation,
    selectedCountryConfig,
    mapInstance,
    navigateTo,
  ]);

  useEffect(() => {
    const venueId = hoverVenue?.childVenueId || hoverVenue?.id || hoverVenue?._id;
    if (!hoverVenue || !venueId) {
      setHoveredVenueId(null);
      return;
    }
    setHoveredVenueId(venueId);
  }, [hoverVenue]);

  const hoveredCluster = useMemo(() => {
    if (!hoveredVenueId || !clusterData.length) return null;
    return clusterData.find((cl) => cl.venueIds.includes(hoveredVenueId)) ?? null;
  }, [hoveredVenueId, clusterData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
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
        transform:       "translate(-50%, -50%) scale(0.8)",
        opacity:         "0",
        transition:      "transform 260ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms ease",
        willChange:      "transform, opacity",
      });
      div.textContent = String(size);
      this.getPanes().floatPane.appendChild(div);
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

  const lastBoundsRef = useRef(null);

  // Stable options object — a new reference here forces @react-google-maps/api
  // to call map.setOptions() on every render, which can itself perturb the
  // viewport (e.g. re-applying `restriction`). Memoizing means setOptions
  // only fires when the country/bounds genuinely change.
  const mapOptions = useMemo(() => ({
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
  }), [selectedCountryConfig]);

  // Stable onIdle — passing an inline arrow function to <GoogleMap> means the
  // wrapper tears down and re-attaches the idle listener on every render.
  // useCallback keeps the same function reference across renders (deps only
  // change on real prop changes), so the listener is attached once.
  const handleIdle = useCallback(() => {
    if (clusterZoomingRef.current) return;
    if (!mapRef.current) return;

    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const mapData = {
      north: Number(ne.lat().toFixed(6)),
      east: Number(ne.lng().toFixed(6)),
      south: Number(sw.lat().toFixed(6)),
      west: Number(sw.lng().toFixed(6)),
    };

    const prev = lastBoundsRef.current;
    if (
      prev &&
      prev.north === mapData.north &&
      prev.east === mapData.east &&
      prev.south === mapData.south &&
      prev.west === mapData.west
    ) {
      return;
    }

    lastBoundsRef.current = mapData;
    onBoundsChange?.(mapData);

    const filtered = venues.filter((venue) => {
      const c = getVenueCoords(venue);
      if (!c) return false;
      return (
        c.lat <= mapData.north &&
        c.lat >= mapData.south &&
        c.lng <= mapData.east &&
        c.lng >= mapData.west
      );
    });

    setVisibleVenues(filtered);
    onVisibleVenuesChange?.(filtered);
  }, [venues, onBoundsChange, onVisibleVenuesChange]);

  const handleClusterMouseOver = useCallback((cluster) => {
    if (!cluster?.getMarkers) return;
    const ids = cluster.getMarkers()
      .map((m) => markerVenueMapRef.current.get(m))
      .filter(Boolean);
    if (ids.length) onMapClusterHover?.(ids);
  }, [onMapClusterHover]);

  const handleClusterMouseOut = useCallback(() => {
    onMapClusterHover?.([]);
  }, [onMapClusterHover]);

  const handleClusteringEnd = useCallback((mc) => {
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
  }, []);

  const handleClusterClick = useCallback((cluster) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const clusterMarkers = cluster?.getMarkers?.() || [];
    if (!clusterMarkers.length) return;

    const currentZoom = map.getZoom() ?? 0;

    // ── Collect ONLY this cluster's own markers, validated. ──
    // cluster.getMarkers() returns exactly the markers the MarkerClusterer
    // grouped into THIS cluster (see @react-google-maps/marker-clusterer
    // Cluster.getMarkers → this.markers). We never touch the global marker
    // list or venues.find(); every position below belongs to this cluster.
    const bounds = new window.google.maps.LatLngBounds();
    const members = [];
    let sumLat = 0, sumLng = 0, validCount = 0;
    clusterMarkers.forEach((m) => {
      const p = m?.getPosition?.();
      if (!p) return;
      const lat = p.lat(), lng = p.lng();
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      if (lat === 0 && lng === 0) return;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
      bounds.extend(p);
      sumLat += lat; sumLng += lng; validCount++;
      const venueId = markerVenueMapRef.current.get(m);
      const v = venues.find((x) => (x.childVenueId || x.id || x._id) === venueId);
      members.push({ name: v?.venueName || v?.name || venueId || "(unknown)", lat, lng });
    });
    if (!validCount) return;

    // ── TEMP VERIFICATION LOG (remove after confirming) ──
    // Prints every marker actually inside the clicked cluster so you can
    // confirm whether these 12 are really all Karnataka or whether the
    // pixel-grid cluster has pulled in markers from neighbouring states.
    /* eslint-disable no-console */
    console.groupCollapsed(`[cluster click] ${validCount} marker(s) in clicked cluster`);
    console.table(members);
    console.groupEnd();
    /* eslint-enable no-console */

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const latSpan = Math.abs(ne.lat() - sw.lat());
    const lngSpan = Math.abs(ne.lng() - sw.lng());
    const isSamePoint = latSpan < 0.0001 && lngSpan < 0.0001;

    // Anchor = the position of the cluster ICON the user actually clicked.
    // MarkerClusterer draws the icon at cluster.center (averageCenter=false →
    // the first member marker's real position). Falling back to the member
    // average only if getCenter() is somehow unavailable. This anchor is
    // guaranteed to be one of the cluster's own markers, i.e. inside the
    // clicked area — so zooming toward it can never leave that area.
    const c = cluster.getCenter?.();
    const anchor = c || new window.google.maps.LatLng(sumLat / validCount, sumLng / validCount);

    const fireBoundsUpdate = () => {
      const b = map.getBounds();
      if (!b) return;
      const bne = b.getNorthEast(), bsw = b.getSouthWest();
      const mapData = { north: bne.lat(), east: bne.lng(), south: bsw.lat(), west: bsw.lng() };
      onBoundsChange?.(mapData);
      const filtered = venues.filter((v) => {
        const cc = getVenueCoords(v);
        if (!cc) return false;
        return cc.lat <= mapData.north && cc.lat >= mapData.south &&
               cc.lng <= mapData.east  && cc.lng >= mapData.west;
      });
      setVisibleVenues(filtered);
      onVisibleVenuesChange?.(filtered);
    };

    clusterZoomingRef.current = true;

    // Threshold (~0.75° ≈ 80 km). Above this the cluster spans a large area:
    // that only happens at low zoom where a single icon covers several states.
    const SPREAD_DEG = 0.75;
    const isSpread = latSpan > SPREAD_DEG || lngSpan > SPREAD_DEG;

    const onDone = () => {
      clusterZoomingRef.current = false;
      const nz = map.getZoom() ?? 0;
      if (nz > 16) map.setZoom(16);
      fireBoundsUpdate();
    };

    if (isSpread) {
      // ── ROOT-CAUSE FIX ──
      // A spread cluster's fitBounds would frame the whole extent and
      // recenter the camera on the MIDDLE of that extent — for an
      // India-scale spread that middle is central India (Chhattisgarh).
      // Instead we keep the camera on the clicked icon (a real member,
      // e.g. in Karnataka) and zoom in one step. The clusterer then
      // re-splits into smaller clusters over the real markers. Repeated
      // clicks drill down — Google-native behaviour — and the camera
      // never leaves the clicked location's area.
      map.setCenter(anchor);
      map.setZoom(Math.min(currentZoom + 2, 16));
      window.google.maps.event.addListenerOnce(map, "idle", onDone);
      return;
    }

    if (isSamePoint) {
      // All markers stacked on one point — just zoom in on it.
      map.setCenter(anchor);
      map.setZoom(Math.min(currentZoom + 4, 17));
      window.google.maps.event.addListenerOnce(map, "idle", onDone);
      return;
    }

    // Tight cluster (all members within ~80 km): safe to frame them all so
    // individual price pins become visible. Bounds are strictly this
    // cluster's own markers, so the camera stays within the cluster.
    map.fitBounds(bounds, 80);
    window.google.maps.event.addListenerOnce(map, "idle", onDone);
  }, [venues, onBoundsChange, onVisibleVenuesChange]);

   const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;


  if (!isLoaded) return <MapSkeleton />;

  return (
    <>
    <style>{`
      @keyframes vcDot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
        40%            { transform: scale(1.1); opacity: 1;   }
      }
      .vc-loading-chip { top: 64px; }
    `}</style>
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={initialCenterRef.current}
      zoom={initialZoomRef.current}
      onLoad={(map) => {
        mapRef.current = map;
        setMapInstance(map);
      }}
      onClick={() => setSelected(null)}
      options={mapOptions}
      onIdle={handleIdle}
    >
      {/* MARKERS */}
      <MarkerClusterer
        styles={CLUSTER_STYLES}
        zoomOnClick={false}
        onMouseOver={handleClusterMouseOver}
        onMouseOut={handleClusterMouseOut}
        onClusteringEnd={handleClusteringEnd}
        onClick={handleClusterClick}
      >
        {(clusterer) =>
          visibleVenues
            .filter((venue) => getVenueCoords(venue) !== null)
            .map((venue) => {
              const coords  = getVenueCoords(venue);
              const venueId = venue.childVenueId || venue.id || venue._id;
              const isSelected =
                selected && (selected.childVenueId || selected.id || selected._id) === venueId;
              const isActive   = isSelected || hoveredVenueId === venueId;
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
            {selected.images?.[0] && (
              <div style={{ position: "relative", height: 110, overflow: "hidden" }}>
                <img
                src={`${BASE_URL}/${typeof selected.images?.[0] === "string"
  ? selected.images[0]
  : selected.images?.[0]?.image ?? ""
}`}
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
                    : "Enquiry"}
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

    {selected && isMobile && (
      <>
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 998,
            background: "rgba(0,0,0,0.18)",
          }}
        />
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
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e5e7eb" }} />
          </div>

          <div style={{ display: "flex", gap: 12, padding: "8px 16px 36px" }}>
            {selected.images?.[0] && (
              <div style={{ width: 90, height: 90, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                <img
                  src={`${BASE_URL}/${typeof selected.images?.[0] === "string"
  ? selected.images[0]
  : selected.images?.[0]?.image ?? ""
}`}
                  alt={selected.venueName || selected.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

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
                  : "Enquiry"}
              </p>
            </div>

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