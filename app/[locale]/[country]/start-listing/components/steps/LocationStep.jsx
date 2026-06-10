"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Search, MapPin, Navigation, ChevronDown, X, CheckCircle2, Loader2,
} from "lucide-react";
import {
  COUNTRY_LIST, URL_COUNTRY_TO_CODE, getLocationConfig,
} from "./config/locationConfig";
import CenterPin from "./MapCenterPin";

// ─────────────────────────────────────────────────────────────────────────────
//  Google Maps dark-mode style palette
// ─────────────────────────────────────────────────────────────────────────────

const DARK_MAP_STYLES = [
  { elementType: "geometry",           stylers: [{ color: "#1e1e2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1e1e2e" }] },
  { elementType: "labels.text.fill",   stylers: [{ color: "#8a8aaa" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill",
    stylers: [{ color: "#c084fc" }] },
  { featureType: "poi",  elementType: "labels.text.fill", stylers: [{ color: "#a78bfa" }] },
  { featureType: "poi.park", elementType: "geometry",     stylers: [{ color: "#1e2e26" }] },
  { featureType: "road", elementType: "geometry",         stylers: [{ color: "#2a2a3e" }] },
  { featureType: "road", elementType: "geometry.stroke",  stylers: [{ color: "#161628" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4c1d95" }] },
  { featureType: "road.highway", elementType: "labels.text.fill",
    stylers: [{ color: "#ddd6fe" }] },
  { featureType: "transit", elementType: "geometry",      stylers: [{ color: "#252540" }] },
  { featureType: "water",   elementType: "geometry",      stylers: [{ color: "#0f172a" }] },
  { featureType: "water",   elementType: "labels.text.fill", stylers: [{ color: "#3b4563" }] },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseAddressComponents(components = []) {
  const get = (type) =>
    (components.find((c) => c.types.includes(type)) || {}).long_name || "";

  const streetNum  = get("street_number");
  const route      = get("route");
  const premise    = get("premise");
  const subloc1    = get("sublocality_level_1");
  const subloc2    = get("sublocality_level_2");
  const locality   = get("locality");
  const postalTown = get("postal_town");
  const admin1     = get("administrative_area_level_1");
  const admin2     = get("administrative_area_level_2");
  const postal     = get("postal_code");

  const parts = [];
  if (streetNum && route) parts.push(`${streetNum} ${route}`);
  else if (route)         parts.push(route);
  else if (premise)       parts.push(premise);
  if (subloc2)            parts.push(subloc2);
  if (subloc1)            parts.push(subloc1);

  return {
    address: parts.join(", "),
    city:    locality || postalTown || admin2,
    state:   admin1,
    pincode: postal,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-component: Country dropdown
// ─────────────────────────────────────────────────────────────────────────────

function CountryDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = COUNTRY_LIST.find((c) => c.code === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left outline-none",
          "bg-white dark:bg-gray-900 focus-visible:ring-2 focus-visible:ring-violet-500",
          open
            ? "border-violet-500 ring-1 ring-violet-500"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
        ].join(" ")}
      >
        {selected ? (
          <>
            <span className="text-2xl leading-none flex-shrink-0">{selected.flag}</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1 truncate">
              {selected.name}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 mr-0.5">
              {selected.currency}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500 flex-1">
            Select country
          </span>
        )}
        <ChevronDown
          size={14}
          className={[
            "flex-shrink-0 text-gray-400 transition-transform duration-150",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={[
            "absolute z-50 top-[calc(100%+6px)] left-0 right-0 max-h-60 overflow-y-auto",
            "rounded-xl border border-gray-200 dark:border-gray-700",
            "bg-white dark:bg-gray-900 shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden",
          ].join(" ")}
        >
          {COUNTRY_LIST.map((c) => (
            <button
              key={c.code}
              type="button"
              role="option"
              aria-selected={value === c.code}
              onClick={() => { onChange(c.code); setOpen(false); }}
              className={[
                "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                value === c.code
                  ? "bg-violet-50 dark:bg-violet-950/40"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/60",
              ].join(" ")}
            >
              <span className="text-xl leading-none flex-shrink-0">{c.flag}</span>
              <span
                className={[
                  "text-sm font-medium flex-1",
                  value === c.code
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-gray-700 dark:text-gray-300",
                ].join(" ")}
              >
                {c.name}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{c.currency}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-component: Search bar + suggestions dropdown
// ─────────────────────────────────────────────────────────────────────────────

function SearchBar({ value, suggestions, showSugg, onChange, onSelect, onClear, onFocus, onBlur }) {
  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Search address, landmark or area…"
          autoComplete="off"
          spellCheck={false}
          className={[
            "w-full pl-10 pr-10 py-3 rounded-xl border transition-all text-sm outline-none",
            "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "border-gray-200 dark:border-gray-700",
            "focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
          ].join(" ")}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showSugg && suggestions.length > 0 && (
        <div
          className={[
            "absolute z-50 top-[calc(100%+6px)] left-0 right-0 overflow-hidden",
            "rounded-xl border border-gray-200 dark:border-gray-700",
            "bg-white dark:bg-gray-900 shadow-xl shadow-black/8 dark:shadow-black/40",
          ].join(" ")}
        >
          {suggestions.slice(0, 5).map((s, i) => (
            <button
              key={s.place_id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onSelect(s); }}
              className={[
                "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                "hover:bg-violet-50 dark:hover:bg-violet-950/30",
                i < suggestions.length - 1 && i < 4
                  ? "border-b border-gray-100 dark:border-gray-800"
                  : "",
              ].join(" ")}
            >
              <MapPin size={14} className="text-violet-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug truncate">
                  {s.structured_formatting?.main_text || s.description}
                </p>
                {s.structured_formatting?.secondary_text && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                    {s.structured_formatting.secondary_text}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Shared input helper
// ─────────────────────────────────────────────────────────────────────────────

const inputCls = (invalid) =>
  [
    "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900",
    "text-gray-900 dark:text-white text-sm outline-none transition",
    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
    invalid
      ? "border-red-400 ring-1 ring-red-400"
      : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
  ].join(" ");

// ─────────────────────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function LocationStep({ form, updateForm, attempted }) {
  const params = useParams();

  const [touched,     setTouched]     = useState({});
  const [searchVal,   setSearchVal]   = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg,    setShowSugg]    = useState(false);
  const [mapsReady,   setMapsReady]   = useState(false);
  const [mapMounted,  setMapMounted]  = useState(false);
  // Loading indicators — shown inline (never block the full page)
  const [detailing,   setDetailing]   = useState(false);  // place detail lookup after suggestion select
  const [geocoding,   setGeocoding]   = useState(false);  // reverse geocode after map drag
  const [locating,    setLocating]    = useState(false);
  const [isDragging,  setIsDragging]  = useState(false);  // drives CenterPin animation

  // Google Maps refs (no Marker — CenterPin overlay handles visuals)
  const mapRef       = useRef(null);
  const mapInst      = useRef(null);
  const placesRef    = useRef(null);
  const acRef        = useRef(null);
  const geocoderRef  = useRef(null);

  // Idle geocoding control
  // skipNextIdle: set before programmatic pans so idle doesn't overwrite clean data
  // idleCount:    skip the very first idle that fires when the map loads
  const skipNextIdle = useRef(false);
  const idleCount    = useRef(0);

  // ── Fallback country if form.country is empty ──
  const countryFromUrl = URL_COUNTRY_TO_CODE[(params?.country || "in").toLowerCase()] || "IN";
  const effectiveCountry = form.country || countryFromUrl;
  const cfg = getLocationConfig(effectiveCountry);

  const touch   = (f) => setTouched((p) => ({ ...p, [f]: true }));
  const showErr = (f) => touched[f] || !!attempted?.location;

  const v = {
    address: form.address?.trim().length > 5,
    city:    form.city?.trim().length > 1,
    state:   !cfg.stateRequired || form.state?.trim().length > 1,
    pincode: cfg.postalRegex.test(form.pincode || ""),
    country: !!form.country,
  };
  const allFilled = v.address && v.city && v.state && v.pincode && v.country;

  // ── Poll for Google Maps ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google?.maps) { setMapsReady(true); return; }
    const id = setInterval(() => {
      if (window.google?.maps) { setMapsReady(true); clearInterval(id); }
    }, 150);
    return () => clearInterval(id);
  }, []);

  // ── Initialize map once ──
  useEffect(() => {
    if (!mapsReady || !mapRef.current || mapInst.current) return;

    const isDark     = document.documentElement.classList.contains("dark");
    const initCountry = form.country || URL_COUNTRY_TO_CODE[(params?.country || "in").toLowerCase()] || "IN";
    const initCfg    = getLocationConfig(initCountry);
    const center     = initCfg.mapCenter;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom:              initCfg.mapZoom,
      mapTypeControl:    false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl:       false,
      gestureHandling:   "greedy",
      styles: isDark ? DARK_MAP_STYLES : [],
    });

    mapInst.current     = map;
    placesRef.current   = new window.google.maps.places.PlacesService(map);
    acRef.current       = new window.google.maps.places.AutocompleteService();
    geocoderRef.current = new window.google.maps.Geocoder();

    // ── Reverse geocode the map center ──
    const doReverseGeocode = (lat, lng) => {
      setGeocoding(true);
      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        setGeocoding(false);
        if (status === "OK" && results[0]) {
          const p = parseAddressComponents(results[0].address_components);
          updateForm({
            ...(p.address && { address: p.address }),
            ...(p.city    && { city: p.city }),
            ...(p.state   && { state: p.state }),
            ...(p.pincode && { pincode: p.pincode }),
            lat, lng,
          });
        }
      });
    };

    // ── Drag start — pin floats up ──
    map.addListener("dragstart", () => {
      setIsDragging(true);
    });

    // ── Idle — pin drops back, then reverse-geocode ──
    // Skip the very first idle (initial load) and programmatic pans.
    map.addListener("idle", () => {
      setIsDragging(false);   // always reset so pin always lands cleanly

      idleCount.current += 1;
      if (idleCount.current <= 1) return;    // skip initial load
      if (skipNextIdle.current) {
        skipNextIdle.current = false;
        return;
      }
      const c = map.getCenter();
      doReverseGeocode(c.lat(), c.lng());
    });

    setMapMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady]);

  // ── Pan map when country changes ──
  useEffect(() => {
    if (!mapInst.current || !form.country) return;
    const newCfg = getLocationConfig(form.country);
    skipNextIdle.current = true;
    mapInst.current.setCenter(newCfg.mapCenter);
    mapInst.current.setZoom(newCfg.mapZoom);
  }, [form.country]);

  // ── Dark mode sync ──
  useEffect(() => {
    if (!mapInst.current) return;
    const sync = () => {
      const dark = document.documentElement.classList.contains("dark");
      mapInst.current.setOptions({ styles: dark ? DARK_MAP_STYLES : [] });
    };
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [mapMounted]);

  // ── Autocomplete suggestions ──
  useEffect(() => {
    if (!acRef.current || !searchVal.trim()) { setSuggestions([]); return; }
    acRef.current.getPlacePredictions(
      { input: searchVal, componentRestrictions: { country: cfg.countryRestriction } },
      (predictions, status) => {
        const OK = window.google?.maps?.places?.PlacesServiceStatus?.OK;
        setSuggestions(status === OK ? (predictions || []) : []);
      }
    );
  }, [searchVal, form.country, cfg.countryRestriction]);

  // ── Select suggestion → fill fields + pan map ──
  const handleSelectSuggestion = useCallback((prediction) => {
    setSearchVal(prediction.description);
    setShowSugg(false);
    setSuggestions([]);
    if (!placesRef.current) return;

    setDetailing(true);
    placesRef.current.getDetails(
      { placeId: prediction.place_id, fields: ["address_components", "geometry"] },
      (place, status) => {
        setDetailing(false);
        if (status !== "OK" || !place) return;
        const p   = parseAddressComponents(place.address_components || []);
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();

        updateForm({
          ...(p.address && { address: p.address }),
          ...(p.city    && { city: p.city }),
          ...(p.state   && { state: p.state }),
          ...(p.pincode && { pincode: p.pincode }),
          ...(lat !== undefined && { lat }),
          ...(lng !== undefined && { lng }),
        });

        if (mapInst.current && place.geometry?.location) {
          skipNextIdle.current = true;
          mapInst.current.panTo(place.geometry.location);
          mapInst.current.setZoom(16);
        }
      }
    );
  }, [updateForm]);

  // ── Use my location ──
  const handleUseMyLocation = () => {
    if (!navigator.geolocation || locating) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        if (mapInst.current) {
          skipNextIdle.current = true;
          mapInst.current.panTo({ lat, lng });
          mapInst.current.setZoom(16);
        }
        geocoderRef.current?.geocode({ location: { lat, lng } }, (results, status) => {
          setLocating(false);
          if (status === "OK" && results[0]) {
            const p = parseAddressComponents(results[0].address_components);
            updateForm({
              ...(p.address && { address: p.address }),
              ...(p.city    && { city: p.city }),
              ...(p.state   && { state: p.state }),
              ...(p.pincode && { pincode: p.pincode }),
              lat, lng,
            });
          }
        });
      },
      () => setLocating(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCountryChange = (code) => {
    updateForm({ country: code, pincode: "" });
    touch("country");
  };

  const selectedCountry = COUNTRY_LIST.find((c) => c.code === effectiveCountry);

  // ── Sync map when lat/lng is set externally (address search, "Use my location") ──
  // Skip re-pan when coordinates already match the map center — this happens right
  // after the user drags (idle handler sets form.lat/lng from map.getCenter()) and
  // prevents the round-trip pan that caused a visual jump / secondary repositioning.
  useEffect(() => {
    if (!mapInst.current || !form.lat || !form.lng) return;

    const newLat = Number(form.lat);
    const newLng = Number(form.lng);
    const center = mapInst.current.getCenter();

    if (center) {
      const THRESHOLD = 0.000015; // ~1.5 m — ignore floating-point noise from map.getCenter()
      if (
        Math.abs(center.lat() - newLat) < THRESHOLD &&
        Math.abs(center.lng() - newLng) < THRESHOLD
      ) {
        return; // already at this position — no pan needed
      }
    }

    skipNextIdle.current = true;
    mapInst.current.panTo({ lat: newLat, lng: newLng });
    mapInst.current.setZoom(16);
  }, [form.lat, form.lng]);

  return (
    <div className="space-y-6">

      {/* ── 1. Country selector ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Country <span className="text-red-500">*</span>
        </label>
        <CountryDropdown value={effectiveCountry} onChange={handleCountryChange} />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
          Sets map region, address format, and postal code validation
        </p>
      </div>

      {/* ── 2. Smart search ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Search address
        </label>
        <SearchBar
          value={searchVal}
          suggestions={suggestions}
          showSugg={showSugg}
          onChange={setSearchVal}
          onSelect={handleSelectSuggestion}
          onClear={() => { setSearchVal(""); setSuggestions([]); }}
          onFocus={() => setShowSugg(true)}
          onBlur={() => setTimeout(() => setShowSugg(false), 100)}
        />
        {/* Address lookup indicator — shown while getDetails resolves */}
        {detailing ? (
          <p className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 mt-1.5">
            <Loader2 size={11} className="animate-spin flex-shrink-0" />
            Looking up address…
          </p>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            Or move the map to pin the location · Or fill in the address fields below directly
          </p>
        )}
      </div>

      {/* ── 3. Map ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Pin your location
          </span>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className={[
              "flex items-center gap-1.5 text-xs font-semibold transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded",
              locating
                ? "text-gray-400 cursor-not-allowed"
                : "text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300",
            ].join(" ")}
          >
            {locating ? (
              <><Loader2 size={12} className="animate-spin" /> Locating…</>
            ) : (
              <><Navigation size={12} /> Use my location</>
            )}
          </button>
        </div>

        {/* Map container — CenterPin overlay, no Google Maps Marker */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 h-60 sm:h-72 bg-gray-100 dark:bg-gray-800">

          {/* Google Maps renders here */}
          <div ref={mapRef} className="absolute inset-0 w-full h-full" />

          {/* Animated, category-aware center pin (user moves the map under it) */}
          {mapsReady && (
            <CenterPin
              category={form.category}
              isDragging={isDragging}
            />
          )}

          {/* Loading skeleton */}
          {!mapsReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-900">
              <div className="w-9 h-9 rounded-full border-2 border-violet-200 dark:border-violet-800 border-t-violet-600 animate-spin" />
              <p className="text-xs text-gray-400 dark:text-gray-500">Loading map…</p>
            </div>
          )}

          {/* Bottom hint */}
          {mapsReady && (
            <div className="absolute bottom-0 inset-x-0 px-4 py-2 bg-white/85 dark:bg-gray-950/85 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 pointer-events-none">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
                Move the map to pin your exact location — address fills automatically
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Address fields ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
          {geocoding ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-500 dark:text-violet-400">
              <Loader2 size={10} className="animate-spin flex-shrink-0" />
              Updating address…
            </span>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Address Details
            </span>
          )}
          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
        </div>

        {/* Street address */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {cfg.addressLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.address || ""}
            onChange={(e) => updateForm({ address: e.target.value })}
            onBlur={() => touch("address")}
            placeholder={cfg.addressPlaceholder}
            className={inputCls(showErr("address") && !v.address)}
          />
          {showErr("address") && !v.address && (
            <p className="text-xs text-red-500 mt-1">Enter a valid street address</p>
          )}
        </div>

        {/* City / State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {cfg.cityLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.city || ""}
              onChange={(e) => updateForm({ city: e.target.value })}
              onBlur={() => touch("city")}
              placeholder={cfg.cityPlaceholder}
              className={inputCls(showErr("city") && !v.city)}
            />
            {showErr("city") && !v.city && (
              <p className="text-xs text-red-500 mt-1">Enter a valid city</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {cfg.stateLabel}
              {cfg.stateRequired && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              type="text"
              value={form.state || ""}
              onChange={(e) => updateForm({ state: e.target.value })}
              onBlur={() => touch("state")}
              placeholder={cfg.statePlaceholder}
              className={inputCls(showErr("state") && !v.state)}
            />
            {showErr("state") && !v.state && (
              <p className="text-xs text-red-500 mt-1">
                Enter a valid {cfg.stateLabel.toLowerCase()}
              </p>
            )}
          </div>
        </div>

        {/* Postal code / Country locked */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {cfg.postalLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="text"
              value={form.pincode || ""}
              onChange={(e) => updateForm({ pincode: cfg.postalFilter(e.target.value) })}
              onBlur={() => touch("pincode")}
              placeholder={cfg.postalPlaceholder}
              className={inputCls(showErr("pincode") && !v.pincode)}
            />
            {showErr("pincode") && !v.pincode && (
              <p className="text-xs text-red-500 mt-1">
                Enter a valid {cfg.postalLabel.toLowerCase()}
              </p>
            )}
          </div>

          {/* Country — locked, reflects top selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Country
            </label>
            <div
              className={[
                "w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border",
                "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
                "text-sm font-medium text-gray-500 dark:text-gray-400 select-none",
              ].join(" ")}
            >
              <span className="text-lg leading-none flex-shrink-0">
                {selectedCountry?.flag || "🌍"}
              </span>
              <span className="flex-1 truncate">
                {selectedCountry?.name || "Not selected"}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-600 flex-shrink-0">
                ↑ Set above
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Confirmation card ── */}
      {allFilled && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
          <CheckCircle2 size={16} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-0.5">
              Address confirmed
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 leading-relaxed">
              {[form.address, form.city, form.state].filter(Boolean).join(", ")}
              {" — "}{form.pincode}
              {", "}{selectedCountry?.name || form.country}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}