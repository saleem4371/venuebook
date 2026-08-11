"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapPin } from "lucide-react";
import {
  loadMapboxGL,
  isMapboxTokenConfigured,
  isWebGLSupported,
  boundsBoxToMapboxBounds,
} from "@/hooks/useMapboxGL";
import MapVenueCard from "./MapVenueCard";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
const SOURCE_ID = "venuebook-venues";
const SOURCE_TILER_LAYER = "vb-source-tiler"; // invisible — see doc comment near addLayer() below
const CLUSTER_MAX_ZOOM = 16; // matches the "fully zoomed in" caps used by the cluster-click logic below
const CLUSTER_RADIUS = 60;   // px grid used by Mapbox's own clustering (supercluster)
const EMPTY_FC = { type: "FeatureCollection", features: [] };

// ---------------- COUNTRY CONFIG ----------------
// NOTE: `iso` is the ISO 3166-1 alpha-2 code required by Google's
// Geocoder `componentRestrictions.country` field (geocoding still runs
// through window.google.maps.Geocoder — see geocodeLabel() below; that is
// existing, out-of-scope location/search infrastructure loaded app-wide in
// app/layout.jsx for the Places search bar. Only map *rendering* is Mapbox).
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
 * that must NEVER become a map marker. Handles lat/latitude/etc. field names
 * (the search-results API has been observed to use different casings across
 * endpoints, so every known variant is checked).
 *
 * A marker with a bad coordinate is the root cause of the "cluster jumps to
 * Chhattisgarh/Odisha" bug: when an invalid point (0,0, NaN, a string, or an
 * out-of-range value) slips into a cluster, the bounds computed from that
 * cluster include the bad point, and a fitBounds constrained by the India
 * `maxBounds` box resolves the camera to the interior of that box (central
 * India ≈ 20.6N, 79E). Filtering here means invalid points never become
 * markers, so they can never be clustered and can never drag the camera
 * anywhere. This is the single validation gate every consumer relies on.
 */
function getVenueCoords(v) {
  const lat =
    v?.lat ?? v?.latitude ?? v?.location_lat ?? v?.geo?.lat ?? v?.location?.lat ??
    v?.coordinates?.lat ?? v?.geoLocation?.lat;
  const lng =
    v?.lng ?? v?.longitude ?? v?.lon ?? v?.location_lng ?? v?.location_long ??
    v?.geo?.lng ?? v?.location?.lng ?? v?.coordinates?.lng ?? v?.geoLocation?.lng;

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

function getVenueId(v) {
  const id = v?.childVenueId || v?.id || v?._id || null;
  return id === null || id === undefined ? null : String(id);
}

/** Returns the best available price number or null */
function getVenuePrice(v) {
  return v?.minPrice || v?.basePrice || v?.price || v?.starting_price || v?.min_price || null;
}

/**
 * Compact price label for the marker pill — e.g. "₹45.2K" / "₹2.5L".
 * Built on Intl.NumberFormat's compact notation (no hardcoded currency
 * symbol/units): en-IN compact notation already renders Lakh/Crore
 * abbreviations natively, matching the app's existing INR-only pricing.
 */
const markerPriceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});
function formatMarkerPrice(n) {
  const num = Number(n);
  if (!num || num <= 0) return "Ask";
  return markerPriceFormatter.format(num);
}

// ---------------- SKELETON / ERROR ----------------
const MapSkeleton = () => (
  <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
    <div className="text-gray-500 dark:text-gray-400 text-sm">Loading Map...</div>
  </div>
);

const MapErrorState = ({ message }) => (
  <div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-2 px-6 text-center">
      <MapPin size={22} className="text-gray-400 dark:text-gray-600" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">{message || "Map unavailable"}</p>
    </div>
  </div>
);

// ---------------- GEOCODE HELPER ----------------
/**
 * Geocodes a free-text label, scoped to a country. Still backed by
 * window.google.maps.Geocoder (loaded app-wide in layout.jsx) — this is
 * existing search/location infrastructure, intentionally left untouched by
 * the Mapbox migration and out of scope for this task.
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
        componentRestrictions: { country: countryCfg.iso.toLowerCase() },
      },
      (results, status) => {
        if (status === "OK" && results?.length) {
          const pos = results[0].geometry.location;
          callback({ lat: pos.lat(), lng: pos.lng() });
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
function sameNavTarget(a, b) {
  if (!a || !b) return false;
  return (
    Math.abs(a.lat - b.lat) < 1e-6 &&
    Math.abs(a.lng - b.lng) < 1e-6 &&
    a.zoom === b.zoom
  );
}

/**
 * Intersects a bounds box with the map's maxBounds before it is handed to
 * fitBounds(). See the doc comment history in this file's git log for the
 * "cluster click lands in Chhattisgarh" incident this guards against —
 * without it, a fitBounds request the hard maxBounds can't satisfy gets
 * silently substituted with the box's own centre instead of erroring.
 */
function clampToRestriction(b, r) {
  if (!b || !r) return b;
  const north = Math.min(b.north, r.north);
  const south = Math.max(b.south, r.south);
  const east  = Math.min(b.east,  r.east);
  const west  = Math.max(b.west,  r.west);
  return (north <= south || east <= west) ? b : { north, south, east, west };
}

// ---------------- MARKER / CLUSTER DOM BUILDERS ----------------
// Real HTML elements (not GPU layers) so each one is a genuine, focusable
// <button> — keyboard users get the same interaction as mouse/touch users
// for free, and CSS gets real transitions/hover/active/focus-visible states
// instead of Mapbox paint-expression approximations of them.

function clusterSizePx(count) {
  if (count >= 50) return 52;
  if (count >= 10) return 44;
  return 36;
}
function clusterFontPx(count) {
  if (count >= 50) return 15;
  if (count >= 10) return 14;
  return 13;
}

function buildMarkerEl() {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "vb-marker";
  return el;
}

function updateMarkerEl(el, { name, priceLabel, selected, hovered }) {
  el.textContent = priceLabel;
  el.setAttribute(
    "aria-label",
    `${name || "Venue"}, starting from ${priceLabel === "Ask" ? "price on enquiry" : priceLabel}${selected ? ", selected" : ""}`
  );
  el.setAttribute("aria-pressed", String(!!selected));
  el.classList.toggle("vb-marker--selected", !!selected);
  el.classList.toggle("vb-marker--hover", !!hovered && !selected);
}

function buildClusterEl() {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "vb-cluster";
  return el;
}

function updateClusterEl(el, { count, label }) {
  const size = clusterSizePx(count);
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.fontSize = `${clusterFontPx(count)}px`;
  el.textContent = label || String(count);
  el.setAttribute("aria-label", `${count} venues in this area. Press to zoom in.`);
}

// ---------------- SCOPED MAP CHROME + DESIGN-SYSTEM STYLES ----------------
// One shared visual language for markers, clusters and the map venue card:
// Plus Jakarta Sans (font-sans), rounded-full/rounded-2xl radii, soft
// elevation shadows, and a single emerald accent for "selected/active"
// state — deliberately NOT the site's existing purple, per design brief.
const MAP_CHROME_STYLES = `
  @keyframes vcDot {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
    40%            { transform: scale(1.1); opacity: 1;   }
  }
  .vc-loading-chip { top: 64px; }

  .mapboxgl-popup.vc-popup .mapboxgl-popup-tip { display: none; }
  .mapboxgl-popup.vc-popup .mapboxgl-popup-content {
    padding: 0;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }

  /* ── Individual venue marker: compact floating price pill ── */
  .vb-marker {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 11px;
    border-radius: 999px;
    font-family: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: -0.01em;
    white-space: nowrap;
    background: #ffffff;
    color: #111827;
    border: 1px solid rgba(0,0,0,0.08);
    box-shadow: 0 2px 6px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06);
    transform: translateY(0) scale(1);
    transition: transform 180ms cubic-bezier(0.25,0.46,0.45,0.94),
                box-shadow 180ms ease, background-color 180ms ease,
                color 180ms ease, border-color 180ms ease;
  }
  .dark .vb-marker {
    background: #1c1c22;
    color: #f4f4f5;
    border-color: rgba(255,255,255,0.10);
    box-shadow: 0 2px 6px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.3);
  }
  .vb-marker:hover {
    transform: translateY(-2px) scale(1.045);
    box-shadow: 0 6px 16px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.08);
    border-color: rgba(0,0,0,0.14);
    z-index: 4;
  }
  .dark .vb-marker:hover {
    box-shadow: 0 6px 16px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35);
    border-color: rgba(255,255,255,0.18);
  }
  .vb-marker:active {
    transform: translateY(0) scale(0.96);
    transition-duration: 100ms;
  }
  .vb-marker:focus-visible {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }
  .vb-marker--hover {
    transform: translateY(-2px) scale(1.045);
    box-shadow: 0 6px 16px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.08);
    z-index: 4;
  }
  .vb-marker--selected {
    background: #059669;
    color: #ffffff;
    border-color: #047857;
    box-shadow: 0 8px 20px rgba(5,150,105,0.32), 0 2px 6px rgba(0,0,0,0.10);
    transform: translateY(-2px) scale(1.08);
    z-index: 5;
  }
  .vb-marker--selected:hover,
  .vb-marker--selected.vb-marker--hover {
    transform: translateY(-2px) scale(1.08);
  }

  /* ── Venue cluster: compact count badge ── */
  .vb-cluster {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-family: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: #ffffff;
    background: #111827;
    border: 2.5px solid #ffffff;
    box-shadow: 0 3px 10px rgba(0,0,0,0.22);
    transform: scale(1);
    transition: transform 180ms cubic-bezier(0.25,0.46,0.45,0.94),
                background-color 180ms ease, box-shadow 180ms ease;
  }
  .dark .vb-cluster {
    border-color: #0a0a0c;
    box-shadow: 0 3px 10px rgba(0,0,0,0.55);
  }
  .vb-cluster:hover { transform: scale(1.07); }
  .vb-cluster:active {
    transform: scale(0.96);
    transition-duration: 100ms;
  }
  .vb-cluster:focus-visible {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }
  .vb-cluster--active {
    background: #059669;
    box-shadow: 0 6px 18px rgba(5,150,105,0.38);
  }
`;

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
  // ── design-phase additions: map venue card needs these to render a real
  // link + working wishlist heart, mirroring what VenueCard already gets ──
  locale = "en",
  urlCountry = "in",
  likedData = null,
  onLikedProperty = null,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const mapboxglRef = useRef(null);

  const markersRef = useRef(new Map());        // "p<id>" | "c<clusterId>" -> {marker, el, type, venueId?, clusterId?}
  const clusterLeavesCacheRef = useRef({});     // cluster_id -> venueId[] (lazy, for hover sync)
  const prevSelectedIdRef = useRef(null);

  const lastNavTargetRef = useRef(null);
  const lastBoundsRef = useRef(null);
  const lastFitResetKeyRef = useRef(undefined);

  const popupRef = useRef(null);
  const [popupEl] = useState(() => (typeof document !== "undefined" ? document.createElement("div") : null));

  const [mapInstance, setMapInstance] = useState(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [hoveredVenueId, setHoveredVenueId] = useState(null); // driven by hoverVenue prop (card hover)
  const [mapHoveredId, setMapHoveredId] = useState(null);     // driven by pointer/focus directly on a marker
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
  const selectedCountryConfig = useMemo(
    () => countryConfig[countryKey] || countryConfig["india"],
    [countryKey]
  );

  // ---------------- ONE SOURCE OF TRUTH ----------------
  // The map renders exactly the current search-result set (`venues`) — the
  // same set the listing cards render. No separate viewport-based
  // filtering happens here: Mapbox already only *draws* what's in view:
  // panning the map does not, and must not, change what's considered "the
  // result set". `mapVenues` is just `venues` narrowed to the ones with a
  // plottable coordinate.
  const mapVenues = useMemo(() => {
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
    if (typeof window !== "undefined") {
      /* eslint-disable no-console */
      if (rejected.length) {
        console.groupCollapsed(
          `[MapView] ${rejected.length} of ${venues.length} venue(s) have no valid coordinates and will NOT appear on the map (still shown in listing cards)`
        );
        console.table(rejected);
        console.groupEnd();
      } else if (venues.length) {
        console.debug(`[MapView] ${valid.length}/${venues.length} venues have valid coordinates`);
      }
      /* eslint-enable no-console */
    }
    return valid;
  }, [venues]);

  // NOTE: `onVisibleVenuesChange` is intentionally NOT called with a
  // map-narrowed subset. Venues without valid coordinates must still show
  // up in the listing cards (per spec), and the listing cards are the
  // source of truth the map mirrors — not the other way around. The prop
  // stays in the API for compatibility with the existing call site, but
  // this component no longer uses it to filter what the parent renders.

  const venueByIdRef = useRef(new Map());
  useEffect(() => {
    const map = new Map();
    for (const v of mapVenues) {
      const id = getVenueId(v);
      if (id) map.set(id, v);
    }
    venueByIdRef.current = map;
  }, [mapVenues]);

  // ---------------- LATEST-VALUES REF ----------------
  // Imperative Mapbox event handlers (marker clicks, moveend, render) are
  // attached once, not re-created every render — this ref lets them always
  // read the current props/state instead of closing over stale ones.
  const stateRef = useRef({});
  stateRef.current = {
    venues,
    mapVenues,
    category,
    selected,
    hoveredVenueId,
    mapHoveredId,
    onVenueClick,
    onMapMarkerHover,
    onMapClusterHover,
    onBoundsChange,
    selectedCountryConfig,
  };

  // ---------------- MAPBOX SCRIPT LOAD ----------------
  useEffect(() => {
    if (!isMapboxTokenConfigured()) {
      setMapError("Map is not configured (missing Mapbox token).");
      return;
    }
    if (!isWebGLSupported()) {
      setMapError("Your browser doesn't support the map view.");
      return;
    }
    let cancelled = false;
    loadMapboxGL().then((mapboxgl) => {
      if (cancelled || !mapboxgl) return;
      mapboxglRef.current = mapboxgl;
      setScriptReady(true);
    }).catch(() => {
      if (!cancelled) setMapError("The map failed to load.");
    });
    return () => { cancelled = true; };
  }, []);

  /* ── EARLY GEOCODE ── */
  useEffect(() => {
    const la = Number(searchCenter?.lat);
    const ln = Number(searchCenter?.lng);
    if (Number.isFinite(la) && Number.isFinite(ln) && !(la === 0 && ln === 0)) {
      setGeocodedCenter({ lat: la, lng: ln });
      return;
    }
    if (!searchLocationLabel) { setGeocodedCenter(null); return; }
    geocodeLabel(searchLocationLabel, selectedCountryConfig, (pos) => setGeocodedCenter(pos));
  }, [searchCenter, searchLocationLabel, selectedCountryConfig]);

  // Captured once — used only for the very first paint. All navigation
  // after mount happens imperatively via navigateTo()/fitBounds().
  const initialCenterRef = useRef(geocodedCenter ?? selectedCountryConfig.center);
  const initialZoomRef   = useRef(geocodedCenter ? 12 : selectedCountryConfig.zoom);

  useEffect(() => {
    if (geocodedCenter && !mapInstance) {
      initialCenterRef.current = geocodedCenter;
      initialZoomRef.current = 12;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geocodedCenter, mapInstance]);

  // Idempotent imperative navigation — the loop-breaker. Mapbox GL exposes
  // the same panTo(lngLat)/setZoom(zoom) pair Google Maps does.
  const navigateTo = useCallback((map, lat, lng, zoom) => {
    if (!map) return;
    const target = { lat, lng, zoom };
    if (sameNavTarget(lastNavTargetRef.current, target)) return;
    lastNavTargetRef.current = target;
    map.panTo({ lng, lat });
    map.setZoom(zoom);
  }, []);

  // Reset map when resetKey changes — explicit user action (new search),
  // always navigates to the searched location's coarse context.
  useEffect(() => {
    if (!mapInstance || resetKey === 0) return;

    if (geocodedCenter) {
      navigateTo(mapInstance, geocodedCenter.lat, geocodedCenter.lng, 12);
    } else if (searchLocationLabel) {
      geocodeLabel(searchLocationLabel, selectedCountryConfig, (pos) => {
        setGeocodedCenter(pos);
        navigateTo(mapInstance, pos.lat, pos.lng, 12);
      });
    } else if (preferredLocation?.lat && preferredLocation?.lng) {
      navigateTo(mapInstance, preferredLocation.lat, preferredLocation.lng, 11);
    } else if (preferredLocation?.label) {
      geocodeLabel(preferredLocation.label, selectedCountryConfig, (pos) => {
        navigateTo(mapInstance, pos.lat, pos.lng, 11);
      });
    } else {
      navigateTo(mapInstance, selectedCountryConfig.center.lat, selectedCountryConfig.center.lng, selectedCountryConfig.zoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, mapInstance]);

  // ---------------- UNIFIED CENTER PRIORITY ----------------
  // Priority: geocodedCenter (from searchLocationLabel) > preferredLocation > country default.
  // This sets the *coarse* map context from the search location. The
  // "FIT TO VENUE RESULTS" effect further below then refines the viewport
  // to the actual venue coordinates once results for this search have
  // settled — search location and venue locations are kept as separate
  // concepts on purpose (a search for "Mangaluru" should not force every
  // venue marker onto the Mangaluru city-centre point).
  useEffect(() => {
    if (!mapInstance) return;

    if (geocodedCenter) {
      navigateTo(mapInstance, geocodedCenter.lat, geocodedCenter.lng, 12);
      return;
    }
    if (searchLocationLabel && !geocodedCenter) {
      geocodeLabel(searchLocationLabel, selectedCountryConfig, (pos) => {
        setGeocodedCenter(pos);
        navigateTo(mapInstance, pos.lat, pos.lng, 12);
      });
      return;
    }
    if (preferredLocation) {
      if (preferredLocation.lat && preferredLocation.lng) {
        navigateTo(mapInstance, preferredLocation.lat, preferredLocation.lng, 11);
      } else if (preferredLocation.label) {
        geocodeLabel(preferredLocation.label, selectedCountryConfig, (pos) => {
          navigateTo(mapInstance, pos.lat, pos.lng, 11);
        });
      }
      return;
    }
    navigateTo(mapInstance, selectedCountryConfig.center.lat, selectedCountryConfig.center.lng, selectedCountryConfig.zoom);
  }, [geocodedCenter, searchLocationLabel, preferredLocation, selectedCountryConfig, mapInstance, navigateTo]);

  // ---------------- FIT TO VENUE RESULTS ----------------
  // Runs once per "result-set epoch" (keyed on resetKey, same signal the
  // search bar already bumps on every new search) — never on every render,
  // never while the user is mid-pan. 0 venues: leave the search-location
  // context from above in place. 1 venue: center on it. 2+: fit bounds with
  // padding, capped so a tight cluster of venues doesn't zoom in absurdly
  // far. Runs again if venues resolve after the initial fit for the same
  // epoch (e.g. loading finished later) — deduped by loading state.
  useEffect(() => {
    if (!mapInstance || isLoading) return;
    if (lastFitResetKeyRef.current === resetKey) return;
    lastFitResetKeyRef.current = resetKey;

    const coords = mapVenues.map(getVenueCoords).filter(Boolean);
    if (coords.length === 0) {
      return; // no mappable venues — keep the search-location-based context
    }
    if (coords.length === 1) {
      navigateTo(mapInstance, coords[0].lat, coords[0].lng, 14);
      return;
    }
    let north = -90, south = 90, east = -180, west = 180;
    for (const c of coords) {
      north = Math.max(north, c.lat); south = Math.min(south, c.lat);
      east  = Math.max(east,  c.lng); west  = Math.min(west,  c.lng);
    }
    mapInstance.fitBounds([[west, south], [east, north]], {
      padding: 64,
      maxZoom: 15,
      duration: 600,
    });
  }, [mapInstance, isLoading, resetKey, mapVenues, navigateTo]);

  useEffect(() => {
    const venueId = getVenueId(hoverVenue);
    setHoveredVenueId(hoverVenue && venueId ? venueId : null);
  }, [hoverVenue]);

  // Keep the country's hard pan restriction current when country changes.
  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.setMaxBounds(boundsBoxToMapboxBounds(selectedCountryConfig.bounds));
  }, [mapInstance, selectedCountryConfig]);

  // ---------------- BOUNDS REPORTING ----------------
  // Reports the current viewport up to the parent (existing "search this
  // area" business logic some pages hook into) — this does NOT change what
  // the map itself renders. The map always renders the full current result
  // set; only the server-side search (if the parent chooses to use this
  // callback) narrows by area.
  const emitBoundsUpdate = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    const ne = b.getNorthEast(), sw = b.getSouthWest();
    const mapData = {
      north: Number(ne.lat.toFixed(6)),
      east: Number(ne.lng.toFixed(6)),
      south: Number(sw.lat.toFixed(6)),
      west: Number(sw.lng.toFixed(6)),
    };
    const prev = lastBoundsRef.current;
    if (prev && prev.north === mapData.north && prev.east === mapData.east &&
        prev.south === mapData.south && prev.west === mapData.west) {
      return;
    }
    lastBoundsRef.current = mapData;
    stateRef.current.onBoundsChange?.(mapData);
  }, []);

  // ---------------- MARKER / CLUSTER CLICK HANDLERS ----------------
  const onMarkerClick = useCallback((venueId) => {
    const venue = venueByIdRef.current.get(venueId);
    if (!venue) return;
    setSelected(venue);
    stateRef.current.onVenueClick?.(venue);
  }, []);

  const onMarkerHoverStart = useCallback((venueId) => {
    setMapHoveredId(venueId);
    stateRef.current.onMapMarkerHover?.(venueId);
  }, []);

  const onMarkerHoverEnd = useCallback(() => {
    setMapHoveredId(null);
    stateRef.current.onMapMarkerHover?.(null);
  }, []);

  const clusterZoomingRef = useRef(false);

  const onClusterClick = useCallback((clusterId, clusterLngLat) => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(SOURCE_ID);
    if (!source) return;

    source.getClusterLeaves(clusterId, Infinity, 0, (err, leaves) => {
      if (err || !leaves?.length) return;

      const currentZoom = map.getZoom() ?? 0;
      const { venues: allVenues, selectedCountryConfig: cfg } = stateRef.current;

      let north = -90, south = 90, east = -180, west = 180;
      let validCount = 0;
      const members = [];

      leaves.forEach((leaf) => {
        const [lng, lat] = leaf.geometry.coordinates;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        if (lat === 0 && lng === 0) return;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
        north = Math.max(north, lat); south = Math.min(south, lat);
        east = Math.max(east, lng); west = Math.min(west, lng);
        validCount++;
        const venueId = leaf.properties?.venueId;
        const v = allVenues.find((x) => getVenueId(x) === venueId);
        members.push({ name: v?.venueName || v?.name || venueId || "(unknown)", lat, lng });
      });
      if (!validCount) return;

      /* eslint-disable no-console */
      console.groupCollapsed(`[cluster click] ${validCount} marker(s) in clicked cluster`);
      console.table(members);
      console.groupEnd();
      /* eslint-enable no-console */

      const latSpan = Math.abs(north - south);
      const lngSpan = Math.abs(east - west);
      const isSamePoint = latSpan < 0.0001 && lngSpan < 0.0001;

      // Anchor = the clicked cluster icon's own position — guaranteed to be
      // inside the clicked area, so zooming toward it can never leave that
      // area (see clampToRestriction's doc comment).
      const anchor = { lng: clusterLngLat[0], lat: clusterLngLat[1] };

      clusterZoomingRef.current = true;
      const onDone = () => {
        clusterZoomingRef.current = false;
        const nz = map.getZoom() ?? 0;
        if (nz > 16) map.setZoom(16);
        emitBoundsUpdate();
      };

      // Smooth, non-abrupt camera transitions only — no snapping straight
      // to a computed zoom. Every branch below animates via easeTo/fitBounds
      // with an explicit duration so the "drill down into a cluster" motion
      // always reads as one continuous camera move, never a jump-cut.
      const SPREAD_DEG = 0.75; // ~80km — above this a single cluster icon covers several states
      const isSpread = latSpan > SPREAD_DEG || lngSpan > SPREAD_DEG;

      if (isSpread) {
        map.easeTo({ center: anchor, zoom: Math.min(currentZoom + 2, 16), duration: 550 });
        map.once("moveend", onDone);
        return;
      }
      if (isSamePoint) {
        map.easeTo({ center: anchor, zoom: Math.min(currentZoom + 4, 17), duration: 550 });
        map.once("moveend", onDone);
        return;
      }

      const fit = clampToRestriction({ north, south, east, west }, cfg.bounds);
      map.fitBounds([[fit.west, fit.south], [fit.east, fit.north]], { padding: 80, duration: 550 });
      map.once("moveend", onDone);
    });
  }, [emitBoundsUpdate]);

  const onClusterHoverStart = useCallback((clusterId) => {
    const cached = clusterLeavesCacheRef.current[clusterId];
    if (cached) {
      stateRef.current.onMapClusterHover?.(cached);
      return;
    }
    const map = mapRef.current;
    const source = map?.getSource(SOURCE_ID);
    source?.getClusterLeaves(clusterId, Infinity, 0, (err, leaves) => {
      if (err || !leaves) return;
      const ids = leaves.map((l) => l.properties?.venueId).filter(Boolean);
      clusterLeavesCacheRef.current[clusterId] = ids;
      stateRef.current.onMapClusterHover?.(ids);
    });
  }, []);

  const onClusterHoverEnd = useCallback(() => {
    stateRef.current.onMapClusterHover?.([]);
  }, []);

  // ---------------- DOM MARKER / CLUSTER SYNC ----------------
  // Reconciles the live set of mapboxgl.Marker HTML elements against
  // Mapbox's own clustered tiles (via querySourceFeatures). This mirrors
  // Mapbox's documented "HTML clusters with custom properties" pattern:
  // resync on every `render` frame (cheap — Mapbox only fires it while the
  // camera/style is actually changing) plus once right after every
  // source.setData(). All reads go through refs so this callback's identity
  // never changes, which is what lets it be attached once, in the map-init
  // effect, without ever going stale.
  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxglRef.current;
    if (!map || !mapboxgl) return;
    const source = map.getSource(SOURCE_ID);
    if (!source || !map.isSourceLoaded?.(SOURCE_ID)) return;

    let features;
    try {
      features = map.querySourceFeatures(SOURCE_ID);
    } catch {
      return;
    }

    const { selected: sel, hoveredVenueId: hv, mapHoveredId: mh } = stateRef.current;
    const selId = sel ? getVenueId(sel) : null;
    const hoverId = mh || hv || null;

    // Tiles can repeat features across tile boundaries — dedupe by id.
    const clusterById = new Map();
    const pointById = new Map();
    for (const f of features) {
      if (f.properties?.cluster) {
        clusterById.set(f.properties.cluster_id, f);
      } else {
        const vid = f.properties?.venueId;
        if (vid) pointById.set(vid, f);
      }
    }

    const seen = new Set();

    clusterById.forEach((f, clusterId) => {
      const key = `c${clusterId}`;
      seen.add(key);
      const [lng, lat] = f.geometry.coordinates;
      let entry = markersRef.current.get(key);
      if (!entry) {
        const el = buildClusterEl();
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onClusterClick(clusterId, [lng, lat]);
        });
        el.addEventListener("mouseenter", () => onClusterHoverStart(clusterId));
        el.addEventListener("mouseleave", () => onClusterHoverEnd());
        el.addEventListener("focus", () => onClusterHoverStart(clusterId));
        el.addEventListener("blur", () => onClusterHoverEnd());
        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);
        entry = { marker, el, type: "cluster", clusterId };
        markersRef.current.set(key, entry);
      } else {
        entry.marker.setLngLat([lng, lat]);
      }
      updateClusterEl(entry.el, {
        count: f.properties.point_count,
        label: f.properties.point_count_abbreviated,
      });
      const cachedLeaves = clusterLeavesCacheRef.current[clusterId];
      const isActive = hoverId ? cachedLeaves?.includes(hoverId) : false;
      entry.el.classList.toggle("vb-cluster--active", !!isActive);
    });

    pointById.forEach((f, venueId) => {
      const key = `p${venueId}`;
      seen.add(key);
      const [lng, lat] = f.geometry.coordinates;
      let entry = markersRef.current.get(key);
      if (!entry) {
        const el = buildMarkerEl();
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onMarkerClick(venueId);
        });
        el.addEventListener("mouseenter", () => onMarkerHoverStart(venueId));
        el.addEventListener("mouseleave", () => onMarkerHoverEnd());
        el.addEventListener("focus", () => onMarkerHoverStart(venueId));
        el.addEventListener("blur", () => onMarkerHoverEnd());
        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([lng, lat])
          .addTo(map);
        entry = { marker, el, type: "point", venueId };
        markersRef.current.set(key, entry);
      } else {
        entry.marker.setLngLat([lng, lat]);
      }
      const venue = venueByIdRef.current.get(venueId);
      updateMarkerEl(entry.el, {
        name: venue?.venueName || venue?.name,
        priceLabel: formatMarkerPrice(getVenuePrice(venue)),
        selected: selId === venueId,
        hovered: hoverId === venueId,
      });
    });

    // Remove markers/clusters no longer present (out of view, or the
    // clustering shape changed at this zoom level).
    markersRef.current.forEach((entry, key) => {
      if (!seen.has(key)) {
        entry.marker.remove();
        markersRef.current.delete(key);
      }
    });

    prevSelectedIdRef.current = selId;
  }, [onMarkerClick, onMarkerHoverStart, onMarkerHoverEnd, onClusterClick, onClusterHoverStart, onClusterHoverEnd]);

  // Lightweight re-application of selected/hover classes without a full
  // requery — runs immediately on selection/hover change so the marker
  // reacts within a frame, not waiting for the next `render` event.
  useEffect(() => {
    const { selected: sel, hoveredVenueId: hv, mapHoveredId: mh } = stateRef.current;
    const selId = sel ? getVenueId(sel) : null;
    const hoverId = mh || hv || null;
    markersRef.current.forEach((entry) => {
      if (entry.type === "point") {
        const venue = venueByIdRef.current.get(entry.venueId);
        updateMarkerEl(entry.el, {
          name: venue?.venueName || venue?.name,
          priceLabel: formatMarkerPrice(getVenuePrice(venue)),
          selected: entry.venueId === selId,
          hovered: entry.venueId === hoverId,
        });
      } else if (entry.type === "cluster") {
        const cachedLeaves = clusterLeavesCacheRef.current[entry.clusterId];
        const isActive = hoverId ? cachedLeaves?.includes(hoverId) : false;
        entry.el.classList.toggle("vb-cluster--active", !!isActive);
      }
    });
  }, [selected, hoveredVenueId, mapHoveredId]);

  // ---------------- MAP INIT (StrictMode-safe: guarded by mapRef) ----------------
  useEffect(() => {
    if (!scriptReady || !containerRef.current || mapRef.current) return;
    const mapboxgl = mapboxglRef.current;
    if (!mapboxgl) return;

    let map;
    try {
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [initialCenterRef.current.lng, initialCenterRef.current.lat],
        zoom: initialZoomRef.current,
        maxBounds: boundsBoxToMapboxBounds(selectedCountryConfig.bounds),
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: true,
      });
    } catch (e) {
      console.error("[MapView] Failed to initialize Mapbox map:", e);
      setMapError("The map failed to load.");
      return;
    }

    mapRef.current = map;
    setMapInstance(map);

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    // Markers/clusters are real DOM elements layered above the canvas, so
    // (unlike GPU layers) clicks on them never reach this handler — no
    // re-hit-test needed, a click here always means "background of map".
    map.on("click", () => setSelected(null));

    map.on("moveend", () => {
      if (clusterZoomingRef.current) return;
      emitBoundsUpdate();
    });

    map.on("render", () => syncMarkers());

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: EMPTY_FC,
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
        clusterRadius: CLUSTER_RADIUS,
      });

      // Invisible, zero-radius layer with no interactions attached. Markers
      // and clusters are rendered as real DOM elements (see syncMarkers),
      // not by this layer — it exists purely so the GeoJSON source always
      // has at least one consuming layer, which is the documented condition
      // for Mapbox to request/tile the source's data at all.
      map.addLayer({
        id: SOURCE_TILER_LAYER,
        type: "circle",
        source: SOURCE_ID,
        paint: { "circle-radius": 0, "circle-opacity": 0 },
      });

      applyVenuesToSourceRef.current?.();
      syncMarkers();
    });

    map.on("error", (e) => {
      console.error("[MapView] Mapbox error:", e?.error || e);
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      markersRef.current.forEach((entry) => entry.marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady]);

  // ---------------- KEEP THE GEOJSON SOURCE IN SYNC WITH mapVenues ----------------
  const applyVenuesToSourceRef = useRef(null);
  applyVenuesToSourceRef.current = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(SOURCE_ID);
    if (!source) return;

    const features = mapVenues
      .map((venue) => {
        const c = getVenueCoords(venue);
        const venueId = getVenueId(venue);
        if (!c || !venueId) return null;
        return {
          type: "Feature",
          id: venueId,
          geometry: { type: "Point", coordinates: [c.lng, c.lat] },
          properties: { venueId },
        };
      })
      .filter(Boolean);

    source.setData({ type: "FeatureCollection", features });
    clusterLeavesCacheRef.current = {};
    // Result set changed — stale marker/cluster DOM elements (venues that
    // dropped out, clusters that no longer exist at this shape) must go,
    // not just have their labels updated in place.
    markersRef.current.forEach((entry) => entry.marker.remove());
    markersRef.current.clear();
    syncMarkers();
  }, [mapVenues, syncMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded() && map.getSource(SOURCE_ID)) {
      applyVenuesToSourceRef.current();
    }
    // else: the "load" handler above calls it once the source exists.
  }, [mapVenues]);

  // ---------------- DESKTOP POPUP (Mapbox Popup + React portal) ----------------
  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxglRef.current;
    if (!map || !mapboxgl || !popupEl) return;

    if (!selected || !popupCoords || isMobile) {
      popupRef.current?.remove();
      popupRef.current = null;
      return;
    }

    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: "top",
        offset: 18,
        className: "vc-popup",
      });
    }

    popupRef.current
      .setLngLat([popupCoords.lng, popupCoords.lat])
      .setDOMContent(popupEl)
      .addTo(map);
  }, [selected, popupCoords, isMobile, popupEl]);

  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  const selectedVenueId = selected ? getVenueId(selected) : null;
  const isSelectedLiked = useMemo(() => {
    if (!selectedVenueId || !likedData) return false;
    if (likedData instanceof Set) return likedData.has(selectedVenueId);
    if (Array.isArray(likedData)) return likedData.some((item) => item.property_id === selectedVenueId || item.venue_id === selectedVenueId);
    return false;
  }, [selectedVenueId, likedData]);

  const handleToggleLike = useCallback(() => {
    if (!selected) return;
    onLikedProperty?.(selected);
  }, [selected, onLikedProperty]);

  if (mapError) {
    return <MapErrorState message={mapError} />;
  }

  if (!scriptReady) return <MapSkeleton />;

  return (
    <>
      <style>{MAP_CHROME_STYLES}</style>

      <div ref={containerRef} style={containerStyle} />

      {/* ── DESKTOP: floating card overlay, portaled into the Mapbox Popup's DOM node ── */}
      {selected && popupCoords && !isMobile && popupEl && createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ transition: "opacity 220ms cubic-bezier(0.25,0.46,0.45,0.94), transform 220ms cubic-bezier(0.25,0.46,0.45,0.94)" }}
        >
          <MapVenueCard
            venue={selected}
            variant="floating"
            baseUrl={BASE_URL}
            liked={isSelectedLiked}
            onToggleLike={handleToggleLike}
            onClose={() => setSelected(null)}
            locale={locale}
            country={urlCountry}
            category={category}
          />
        </div>,
        popupEl
      )}

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

      {/* ── MOBILE: bottom-sheet preview, existing sheet chrome + new MapVenueCard content ── */}
      {selected && isMobile && (
        <>
          <div
            onClick={() => setSelected(null)}
            className="vb-sheet-backdrop"
            style={{
              position: "fixed", inset: 0, zIndex: 998,
              background: "rgba(0,0,0,0.18)",
              transition: "opacity 220ms ease",
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900"
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999,
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.16)",
              overflow: "hidden",
              transition: "transform 220ms cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-9 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="px-4 pb-9 pt-1">
              <MapVenueCard
                venue={selected}
                variant="sheet"
                baseUrl={BASE_URL}
                liked={isSelectedLiked}
                onToggleLike={handleToggleLike}
                onClose={() => setSelected(null)}
                locale={locale}
                country={urlCountry}
                category={category}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
