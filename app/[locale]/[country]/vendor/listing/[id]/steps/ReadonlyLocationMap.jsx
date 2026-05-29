"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useJsApiLoader, GoogleMap, MarkerF } from "@react-google-maps/api";
import { MapPin } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const API_KEY   = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ?? "";
const LIBRARIES = ["places", "geocoding"];

/* ─────────────────────────────────────────────────────────────────────────────
   PREMIUM SVG PIN BUILDER
   Generates a branded VenueBook teardrop marker as a data: URL.
   colorStart / colorEnd drive the gradient so each category gets its own pin.
───────────────────────────────────────────────────────────────────────────── */
function buildPinDataUrl(colorStart, colorEnd) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 54" fill="none">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="${colorStart}"/>
      <stop offset="100%" stop-color="${colorEnd}"/>
    </linearGradient>
    <filter id="s" x="-35%" y="-20%" width="170%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#000000" flood-opacity="0.26"/>
    </filter>
  </defs>
  <path d="M20 2C10.6 2 3 9.6 3 19C3 25.2 6.2 30.7 11 34L20 52L29 34C33.8 30.7 37 25.2 37 19C37 9.6 29.4 2 20 2Z"
        fill="url(#g)" filter="url(#s)"/>
  <circle cx="20" cy="19" r="9.5" fill="white" opacity="0.95"/>
  <circle cx="20" cy="19" r="4.5" fill="url(#g)"/>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const MAP_OPTIONS_BASE = {
  fullscreenControl:  false,
  streetViewControl:  false,
  mapTypeControl:     false,
  keyboardShortcuts:  false,
  zoomControl:        true,
  draggable:          false,
  scrollwheel:        false,
  clickableIcons:     false,
  disableDoubleClickZoom: true,
};

/* Google Maps dark-mode style — matches the dark dashboard palette */
const DARK_STYLE = [
  { elementType: "geometry",                  stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill",          stylers: [{ color: "#94a3b8" }] },
  { elementType: "labels.text.stroke",        stylers: [{ color: "#0f172a" }] },
  { featureType: "administrative",            elementType: "geometry",                stylers: [{ color: "#1e293b" }] },
  { featureType: "administrative.country",    elementType: "labels.text.fill",        stylers: [{ color: "#9ca3af" }] },
  { featureType: "administrative.locality",   elementType: "labels.text.fill",        stylers: [{ color: "#d1d5db" }] },
  { featureType: "poi",                       elementType: "labels.text.fill",        stylers: [{ color: "#64748b" }] },
  { featureType: "poi.park",                  elementType: "geometry",                stylers: [{ color: "#1e293b" }] },
  { featureType: "poi.park",                  elementType: "labels.text.fill",        stylers: [{ color: "#475569" }] },
  { featureType: "road",                      elementType: "geometry",                stylers: [{ color: "#1e3a5f" }] },
  { featureType: "road",                      elementType: "geometry.stroke",         stylers: [{ color: "#172554" }] },
  { featureType: "road",                      elementType: "labels.text.fill",        stylers: [{ color: "#9ca3af" }] },
  { featureType: "road.highway",              elementType: "geometry",                stylers: [{ color: "#1d4ed8" }] },
  { featureType: "road.highway",              elementType: "geometry.stroke",         stylers: [{ color: "#1e40af" }] },
  { featureType: "road.highway",              elementType: "labels.text.fill",        stylers: [{ color: "#93c5fd" }] },
  { featureType: "transit",                   elementType: "geometry",                stylers: [{ color: "#1e293b" }] },
  { featureType: "transit.station",           elementType: "labels.text.fill",        stylers: [{ color: "#64748b" }] },
  { featureType: "water",                     elementType: "geometry",                stylers: [{ color: "#0c1a2e" }] },
  { featureType: "water",                     elementType: "labels.text.fill",        stylers: [{ color: "#1e3a5f" }] },
  { featureType: "water",                     elementType: "labels.text.stroke",      stylers: [{ color: "#0c1a2e" }] },
];

/* ─────────────────────────────────────────────────────────────────────────────
   GEOCODE HELPER — resolves an address string to { lat, lng }
───────────────────────────────────────────────────────────────────────────── */
function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.Geocoder) return reject(new Error("Geocoder not ready"));
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        reject(new Error(`Geocode failed: ${status}`));
      }
    });
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   Props:
     address      — full address string (used for geocoding if no lat/lng)
     lat          — optional pre-resolved latitude  (number)
     lng          — optional pre-resolved longitude (number)
     isDark       — boolean for dark/light map style
     accentColor  — CSS colour string for the container glow/border
     gradient     — CSS gradient string for bottom accent strip
     height       — map container height (default "380px")
───────────────────────────────────────────────────────────────────────────── */
export default function ReadonlyLocationMap({
  address,
  lat,
  lng,
  isDark       = true,
  accentColor  = "#a44bf3",
  gradient     = "linear-gradient(90deg,#a44bf3,#499ce8)",
  pinStart     = "#a44bf3",
  pinEnd       = "#499ce8",
  height       = "380px",
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES,
  });

  const [coords, setCoords]     = useState(
    lat && lng ? { lat: Number(lat), lng: Number(lng) } : null
  );
  const [geoError, setGeoError] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapRef = useRef(null);

  /* Geocode if no coords yet and map SDK is ready */
  useEffect(() => {
    if (coords || !isLoaded || !address) return;
    setIsGeocoding(true);
    setGeoError(null);
    geocodeAddress(address)
      .then((c) => setCoords(c))
      .catch((e) => setGeoError(e.message))
      .finally(() => setIsGeocoding(false));
  }, [isLoaded, address, coords]);

  /* Re-geocode when address changes (and no explicit lat/lng) */
  useEffect(() => {
    if (lat && lng) {
      setCoords({ lat: Number(lat), lng: Number(lng) });
      return;
    }
    if (!isLoaded || !address) return;
    setCoords(null);
    setIsGeocoding(true);
    setGeoError(null);
    geocodeAddress(address)
      .then((c) => setCoords(c))
      .catch((e) => setGeoError(e.message))
      .finally(() => setIsGeocoding(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, lat, lng]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const mapOptions = {
    ...MAP_OPTIONS_BASE,
    styles: isDark ? DARK_STYLE : [],
  };

  /* ── Skeleton / loading ── */
  if (!isLoaded || isGeocoding) {
    return (
      <div
        style={{ height, position: "relative", overflow: "hidden" }}
        className="flex items-center justify-center"
      >
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)"
              : "linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${accentColor} transparent ${accentColor} ${accentColor}` }}
          />
          <p className="text-[12px] font-medium" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
            {!isLoaded ? "Loading map…" : "Locating address…"}
          </p>
        </div>
        {/* Gradient strip at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: "3px", background: gradient, opacity: 0.85 }}
        />
      </div>
    );
  }

  /* ── Error / not found ── */
  if (loadError || geoError) {
    return (
      <div
        style={{ height, position: "relative", overflow: "hidden" }}
        className="flex items-center justify-center"
      >
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)"
              : "linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-2 text-center px-6">
          <MapPin size={28} style={{ color: accentColor, opacity: 0.6 }} />
          <p className="text-[13px] font-semibold" style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>
            Map unavailable
          </p>
          <p className="text-[12px]" style={{ color: isDark ? "#64748b" : "#94a3b8" }}>
            {geoError ?? "Could not load Google Maps"}
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: "3px", background: gradient, opacity: 0.85 }}
        />
      </div>
    );
  }

  /* ── Map ── */
  return (
    <div style={{ height, position: "relative", overflow: "hidden" }}>
      {coords ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={coords}
          zoom={15}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          <MarkerF
            position={coords}
            options={{
              icon: {
                url:        buildPinDataUrl(pinStart, pinEnd),
                scaledSize: new window.google.maps.Size(40, 54),
                anchor:     new window.google.maps.Point(20, 52),
              },
              clickable:  false,
              draggable:  false,
              animation:  null,
            }}
          />
        </GoogleMap>
      ) : (
        /* Address given but geocode returned nothing — fallback plain map centred on world */
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: 20, lng: 78 }}
          zoom={4}
          options={mapOptions}
          onLoad={onMapLoad}
        />
      )}

      {/* Category accent glow strip at map bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: "3px", background: gradient, opacity: 0.85 }}
      />
    </div>
  );
}
