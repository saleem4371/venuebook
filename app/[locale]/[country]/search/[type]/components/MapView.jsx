"use client";

import {
  GoogleMap,
  Marker,
  MarkerClusterer,
  OverlayView,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";
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
  onBoundsChange,
  /** { label: string, lat?: number, lng?: number } — from preferences modal */
  preferredLocation = null,
  /** string — city/area from the search bar (highest map priority) */
  searchLocationLabel = null,
  /** Called when a map marker is clicked — receives the venue object */
  onVenueClick = null,
}) {
  const mapRef = useRef(null);

  /* mapInstance tracks when the Google Map object is ready.
     The unified center effect depends on this — not on isLoaded —
     so it only runs after onLoad fires (avoiding the timing bug where
     isLoaded becomes true before mapRef.current is set). */
  const [mapInstance, setMapInstance] = useState(null);

  const [mapBounds, setMapBounds] = useState(null);
  const [visibleVenues, setVisibleVenues] = useState(venues);
  const [hoveredVenueId, setHoveredVenueId] = useState(null);
  const [selected, setSelected] = useState(null);
  /* Geocoded coords for searchLocationLabel — resolved as soon as Maps API loads */
  const [geocodedCenter, setGeocodedCenter] = useState(null);

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
    if (!mapBounds) {
      setVisibleVenues(venues);
      return;
    }

    const filtered = venues.filter((venue) => {
      if (!venue?.lat || !venue?.lng) return false;

      const lat = Number(venue.lat);
      const lng = Number(venue.lng);

      return (
        lat <= mapBounds.north &&
        lat >= mapBounds.south &&
        lng <= mapBounds.east &&
        lng >= mapBounds.west
      );
    });

    setVisibleVenues(filtered);
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
    if (!hoverVenue) {
      setHoveredVenueId(null);
      return;
    }

    if (mapRef.current) {
      mapRef.current.panTo({
        lat: Number(hoverVenue.lat),
        lng: Number(hoverVenue.lng),
      });
    }
  }, [hoverVenue]);

  useEffect(() => {
    if (!hoverVenue?.childVenueId) {
      setHoveredVenueId(null);
      return;
    }

    setHoveredVenueId(hoverVenue.childVenueId);

    if (mapRef.current && hoverVenue.lat && hoverVenue.lng) {
      mapRef.current.panTo({
        lat: Number(hoverVenue.lat),
        lng: Number(hoverVenue.lng),
      });
    }
  }, [hoverVenue]);

  if (!isLoaded) return <MapSkeleton />;

  return (
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

        // 🔥 send to parent
        onBoundsChange?.(mapData);

        const filtered = venues.filter((venue) => {
          if (!venue?.lat || !venue?.lng) return false;

          const lat = Number(venue.lat);
          const lng = Number(venue.lng);

          return (
            lat <= mapData.north &&
            lat >= mapData.south &&
            lng <= mapData.east &&
            lng >= mapData.west
          );
        });

        setVisibleVenues(filtered);
      }}
    >
      {/* MARKERS */}
      <MarkerClusterer>
        {(clusterer) =>
          visibleVenues
            .filter((venue) => venue?.lat && venue?.lng)
            .map((venue) => (
              <Marker
                key={venue.childVenueId}
                position={{
                  lat: Number(venue.lat),
                  lng: Number(venue.lng),
                }}
                clusterer={clusterer}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="78" height="34">
        <rect
          rx="18"
          ry="18"
          width="78"
          height="34"
          fill="${
            hoveredVenueId === venue.childVenueId || selected?.childVenueId === venue.childVenueId
              ? "#111827"
              : "#8368ef"
          }"
        />
        <text
          x="50%"
          y="55%"
          dominant-baseline="middle"
          text-anchor="middle"
          font-family="Arial"
          font-size="12"
          fill="#fff"
          font-weight="bold"
        >
          ₹${venue.minPrice || 0}
        </text>
      </svg>
    `),
                  scaledSize:
                    window.google?.maps &&
                    new window.google.maps.Size(
                      hoveredVenueId === venue.childVenueId || selected?.childVenueId === venue.childVenueId ? 72 : 64,
                      hoveredVenueId === venue.childVenueId || selected?.childVenueId === venue.childVenueId ? 36 : 32,
                    ),
                }}
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.panTo({
                      lat: Number(venue.lat),
                      lng: Number(venue.lng),
                    });
                    mapRef.current.setZoom(14);
                  }
                  setSelected(venue);
                  onVenueClick?.(venue);
                }}
              />
            ))
        }
      </MarkerClusterer>

      {/* POPUP — floats above the selected marker */}
      {selected && selected.lat && selected.lng && (
        <OverlayView
          position={{ lat: Number(selected.lat), lng: Number(selected.lng) }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={(w, h) => ({ x: -(w / 2), y: -(h + 18) })}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
              overflow: "hidden",
              width: 220,
              userSelect: "none",
            }}
          >
            {/* Image */}
            {selected.images?.[0] && (
              <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
                <img
                  src={selected.images[0]}
                  alt={selected.venueName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {/* close button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(255,255,255,0.92)",
                    border: "none", borderRadius: "50%",
                    width: 26, height: 26,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                  }}
                >
                  <X size={13} color="#374151" />
                </button>
              </div>
            )}
            {/* Content */}
            <div style={{ padding: "10px 12px 12px" }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 2, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {selected.venueName}
              </p>
              {/* location */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <MapPin size={10} color="#9ca3af" />
                <p style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {[selected.city, selected.state].filter(Boolean).join(" · ")}
                </p>
              </div>
              {/* price + rating row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>
                  {selected.minPrice
                    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(selected.minPrice)
                    : "Contact"}
                </p>
                {selected.rating && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Star size={11} fill="#fbbf24" color="#fbbf24" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{Number(selected.rating).toFixed(1)}</span>
                    {selected.reviewCount && (
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>({selected.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Arrow tip */}
            <div style={{
              position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "10px solid #fff",
              filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.10))",
            }} />
          </div>
        </OverlayView>
      )}

    </GoogleMap>
  );
}

