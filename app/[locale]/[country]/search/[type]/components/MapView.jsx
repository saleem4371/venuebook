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

// ---------------- CUSTOM CLUSTER STYLES ----------------
// @react-google-maps/api MarkerClusterer uses the legacy `styles` array API.
// Each entry controls one tier of cluster sizes (1-9, 10-99, 100-999 …).
// The SVG provides the circle background; `textColor`/`textSize` control the overlaid count.
const _mkClusterStyle = (size) => {
  const half = size / 2;
  const svg  = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half - 2}" fill="#111827" stroke="#fff" stroke-width="2.5"/></svg>`;
  return {
    url:        "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    width:      size,
    height:     size,
    // anchorIcon NOT set → library defaults to [0,0] = top-left corner at the lat/lng pixel.
    // The OverlayView hover overlay uses offset {x:0,y:0} to match this exactly.
    textColor:  "#ffffff",
    textSize:   14,
    fontWeight: "700",
    fontFamily: "Arial,sans-serif",
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
// Size NEVER changes — fill color and ring change on selected/mapHover states.
// isSelected  → dark fill (#111827)
// isMapHovered → deeper purple + inner white ring (mouse is over the pin itself)
function buildMarkerIcon(venue, isSelected, isMapHovered) {
  const price = getVenuePrice(venue);
  const label = formatMarkerPrice(price);
  const color = isSelected ? "#111827" : isMapHovered ? "#5b21b6" : "#7c3aed";

  if (!label) {
    // No-price venue → 30 px circle with a mini location-pin icon inside
    const s = 30, cx = 15, cy = 15, r = 13;
    // Teardrop map-pin: head centered at (15,12.5), tip at (15,21.5)
    const pin  = `M15,21.5 C12.5,18.5 9,16.2 9,12.5 C9,9.0 11.7,6.5 15,6.5 C18.3,6.5 21,9.0 21,12.5 C21,16.2 17.5,18.5 15,21.5 Z`;
    // Inner hole → same fill as circle so it looks like a cutout
    const hole = `<circle cx="15" cy="12.5" r="3" fill="${color}" opacity="0.85"/>`;
    const hoverRing = isMapHovered
      ? `<circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5"/>`
      : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><defs><filter id="sh" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/></filter></defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#fff" stroke-width="2.5" filter="url(#sh)"/><path d="${pin}" fill="#fff" opacity="0.92"/>${hole}${hoverRing}</svg>`;
    return {
      url:        "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(s, s),
      anchor:     new window.google.maps.Point(cx, cy),
    };
  }

  // Price pill — fixed height (32 px body + 8 px arrow), width auto-scales to text
  const w      = Math.max(76, label.length * 7.5 + 24);
  const bodyH  = 32;   // constant — no size jump on hover/select
  const arrowH = 8;
  const h      = bodyH + arrowH;
  const cx     = w / 2;
  const fs     = label.length > 9 ? 11 : 12;
  // On map-hover: white inner stroke gives a "lit up" border effect without resizing
  const innerRing = isMapHovered
    ? `<rect rx="14" ry="14" x="2" y="2" width="${w - 4}" height="${bodyH - 4}" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>`
    : "";
  const svg    = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect rx="16" ry="16" x="0" y="0" width="${w}" height="${bodyH}" fill="${color}"/>${innerRing}<polygon points="${cx - 7},${bodyH} ${cx + 7},${bodyH} ${cx},${h}" fill="${color}"/><text x="${cx}" y="${bodyH / 2}" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fs}" fill="#fff" font-weight="700">${label}</text></svg>`;
  return {
    url:        "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize: new window.google.maps.Size(w, h),
    anchor:     new window.google.maps.Point(cx, h),
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
}) {
  const mapRef = useRef(null);
  // Imperative Google Maps marker used for cluster hover highlight.
  // Cannot use a React <Marker> because MarkerClusterer icons render at
  // MAX_ZINDEX+1, making any React Marker with lower zIndex invisible under the cluster.
  const hoverMarkerRef = useRef(null);
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
    const hv = visibleVenues.find((v) => (v.childVenueId || v.id || v._id) === hoveredVenueId);
    if (!hv) return null;
    const hc = getVenueCoords(hv);
    if (!hc) return null;
    const EPS = 0.00015;
    return clusterData.find((cl) =>
      cl.markerPositions.some(
        (m) => Math.abs(m.lat - hc.lat) < EPS && Math.abs(m.lng - hc.lng) < EPS
      )
    ) ?? null;
  }, [hoveredVenueId, clusterData, visibleVenues]);

  // Drive the imperative hover marker from hoveredCluster.
  // useEffect must be above the early return to keep hook order stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;

    if (!hoveredCluster) {
      hoverMarkerRef.current?.setMap(null);
      return;
    }

    const { position, size } = hoveredCluster;
    const px   = getClusterPx(size);
    const half = px / 2;
    const fs   = px >= 50 ? 15 : 14;
    const svg  = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"><circle cx="${half}" cy="${half}" r="${half - 2}" fill="#7c3aed" stroke="#fff" stroke-width="2.5"/><text x="${half}" y="${half}" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fs}" fill="#fff" font-weight="700">${size}</text></svg>`;
    const icon = {
      url:        "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(px, px),
      anchor:     new window.google.maps.Point(half, half),
    };

    if (hoverMarkerRef.current) {
      hoverMarkerRef.current.setPosition(position);
      hoverMarkerRef.current.setIcon(icon);
      hoverMarkerRef.current.setMap(mapRef.current);
    } else {
      hoverMarkerRef.current = new window.google.maps.Marker({
        map:       mapRef.current,
        position,
        icon,
        // Must exceed MarkerClusterer's MAX_ZINDEX+1 so the purple circle renders on top
        zIndex:    (window.google.maps.Marker.MAX_ZINDEX ?? 1_000_000) + 100,
        clickable: false,
      });
    }

    return () => { hoverMarkerRef.current?.setMap(null); };
  }, [hoveredCluster]);

  if (!isLoaded) return <MapSkeleton />;

  return (
    <>
    {/* Spinner keyframe */}
    <style>{`@keyframes vcSpin { to { transform: rotate(360deg); } }`}</style>
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
        onClusteringEnd={(mc) => {
          // Track cluster positions + their member marker coords for hover highlighting
          const data = mc.getClusters()
            .filter((c) => c.getSize() > 1)
            .map((c) => ({
              position: { lat: c.getCenter().lat(), lng: c.getCenter().lng() },
              size: c.getSize(),
              markerPositions: c.getMarkers().map((m) => ({
                lat: m.getPosition().lat(),
                lng: m.getPosition().lng(),
              })),
            }));
          setClusterData(data);
        }}
        onClick={(cluster) => {
          if (!mapRef.current) return;
          const center = cluster?.getCenter?.();
          if (!center) return;
          const markers = cluster?.getMarkers?.();
          if (!markers?.length) return;

          const currentZoom = mapRef.current.getZoom() ?? 0;

          // Build tight bounds from the cluster's marker positions
          const bounds = new window.google.maps.LatLngBounds();
          markers.forEach((m) => { const p = m.getPosition(); if (p) bounds.extend(p); });

          // Suppress onIdle during the fitBounds animation so the re-render cascade
          // doesn't interrupt the smooth pan+zoom. We fire the update manually after.
          clusterZoomingRef.current = true;
          mapRef.current.fitBounds(bounds, 80);

          window.google.maps.event.addListenerOnce(mapRef.current, "idle", () => {
            clusterZoomingRef.current = false;

            const newZoom = mapRef.current?.getZoom() ?? 0;
            // Cap over-zoom (all markers at the same point)
            if (newZoom > 16) mapRef.current.setZoom(16);
            // fitBounds didn't zoom in (cluster spans a huge area at low zoom) →
            // fall back to center + step zoom so the animation still lands correctly
            else if (newZoom <= currentZoom) {
              mapRef.current.panTo({ lat: center.lat(), lng: center.lng() });
              mapRef.current.setZoom(Math.min(currentZoom + 3, 15));
            }

            // Manually fire the bounds/venues update now that animation has settled
            const b = mapRef.current?.getBounds();
            if (b) {
              const ne = b.getNorthEast(), sw = b.getSouthWest();
              const mapData = { north: ne.lat(), east: ne.lng(), south: sw.lat(), west: sw.lng() };
              onBoundsChange?.(mapData);
              const filtered = venues.filter((v) => {
                const c = getVenueCoords(v);
                if (!c) return false;
                return c.lat <= mapData.north && c.lat >= mapData.south &&
                       c.lng <= mapData.east  && c.lng >= mapData.west;
              });
              setVisibleVenues(filtered);
              onVisibleVenuesChange?.(filtered);
            }
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
                  icon={window.google?.maps ? buildMarkerIcon(venue, isActive, isMapHov) : undefined}
                  onClick={() => {
                    // No pan/zoom on click — map stays where it is, card opens only
                    setSelected(venue);
                    onVenueClick?.(venue);
                  }}
                  onMouseOver={() => setMapHoveredId(venueId)}
                  onMouseOut={() => setMapHoveredId(null)}
                />
              );
            })
        }
      </MarkerClusterer>

      {/* Cluster hover highlight is driven by an imperative google.maps.Marker in the
           useEffect above — NOT a React Marker — so it can exceed MAX_ZINDEX+1 */}

      {/* Skeleton OverlayViews removed — loading state is shown outside the map */}

      {/* ── DESKTOP POPUP: anchored below the marker via OverlayView ── */}
      {selected && getVenueCoords(selected) && !isMobile && (
        <OverlayView
          position={getVenueCoords(selected)}
          mapPaneName={OverlayView.FLOAT_PANE}
          getPixelPositionOffset={(w) => ({ x: -(w / 2), y: 14 })}
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
            {/* Arrow pointing UP toward the marker */}
            <div style={{
              position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "9px solid transparent",
              borderRight: "9px solid transparent",
              borderBottom: "9px solid #fff",
              filter: "drop-shadow(0 -2px 3px rgba(0,0,0,0.08))",
            }} />

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
        </OverlayView>
      )}

    </GoogleMap>

    {/* ── LOADING CHIP: top-center badge while venue data fetches ── */}
    {isLoading && (
      <div style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: 24,
        padding: "8px 18px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)",
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}>
        <div style={{
          width: 14, height: 14,
          border: "2px solid #e5e7eb",
          borderTopColor: "#7c3aed",
          borderRadius: "50%",
          animation: "vcSpin 0.75s linear infinite",
          flexShrink: 0,
        }}/>
        Loading venues…
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

