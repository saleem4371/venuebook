"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinIcon, ClockIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";

/* ── Category-aware popular destinations — India ─────────────── */
const POPULAR_BY_CATEGORY_IN = {
  venues: [
    { city: "Bengaluru",  state: "Karnataka",    desc: "Premium banquets & event spaces"  },
    { city: "Mumbai",     state: "Maharashtra",  desc: "Luxury rooftops & banquet halls"  },
    { city: "Delhi",      state: "NCR",          desc: "Grand wedding & convention spaces" },
    { city: "Hyderabad",  state: "Telangana",    desc: "Heritage & modern event venues"   },
    { city: "Chennai",    state: "Tamil Nadu",   desc: "Beachside & cultural venues"      },
    { city: "Pune",       state: "Maharashtra",  desc: "Corporate & social event spaces"  },
  ],
  farmstays: [
    { city: "Coorg",      state: "Karnataka",    desc: "Coffee estates & forest retreats" },
    { city: "Goa",        state: "Goa",          desc: "Beachside villas & eco-farms"     },
    { city: "Manali",     state: "Himachal Pradesh", desc: "Mountain cabins & nature stays" },
    { city: "Ooty",       state: "Tamil Nadu",   desc: "Tea garden stays & cottages"      },
    { city: "Pondicherry",state: "Puducherry",   desc: "Heritage villas & coastal farms"  },
    { city: "Wayanad",    state: "Kerala",       desc: "Jungle lodges & spice estates"    },
  ],
  studios: [
    { city: "Bengaluru",  state: "Karnataka",    desc: "Photography & podcast studios"    },
    { city: "Mumbai",     state: "Maharashtra",  desc: "Film sets & recording studios"    },
    { city: "Delhi",      state: "NCR",          desc: "Content creation & green screen"  },
    { city: "Hyderabad",  state: "Telangana",    desc: "Music & production studios"       },
    { city: "Pune",       state: "Maharashtra",  desc: "Creative & photography spaces"    },
    { city: "Chennai",    state: "Tamil Nadu",   desc: "Audio & video production"         },
  ],
  rentals: [
    { city: "Bengaluru",  state: "Karnataka",    desc: "Short-term event & party spaces"  },
    { city: "Mumbai",     state: "Maharashtra",  desc: "Pop-up & retail rental spaces"    },
    { city: "Delhi",      state: "NCR",          desc: "Exhibition & banquet rentals"     },
    { city: "Hyderabad",  state: "Telangana",    desc: "Corporate & social rentals"       },
    { city: "Goa",        state: "Goa",          desc: "Beach venue & villa rentals"      },
    { city: "Jaipur",     state: "Rajasthan",    desc: "Heritage & palace venue rentals"  },
  ],
  workspaces: [
    { city: "Bengaluru",  state: "Karnataka",    desc: "Tech hubs & coworking spaces"     },
    { city: "Mumbai",     state: "Maharashtra",  desc: "Premium offices & meeting rooms"  },
    { city: "Delhi",      state: "NCR",          desc: "Corporate & coworking centres"    },
    { city: "Hyderabad",  state: "Telangana",    desc: "IT parks & shared workspaces"     },
    { city: "Pune",       state: "Maharashtra",  desc: "Startup hubs & shared offices"    },
    { city: "Chennai",    state: "Tamil Nadu",   desc: "Business centres & coworking"     },
  ],
  experiences: [
    { city: "Bengaluru",  state: "Karnataka",    desc: "Workshops, tours & activities"    },
    { city: "Goa",        state: "Goa",          desc: "Adventure & culinary experiences" },
    { city: "Jaipur",     state: "Rajasthan",    desc: "Heritage & cultural experiences"  },
    { city: "Manali",     state: "Himachal Pradesh", desc: "Outdoor & adventure experiences" },
    { city: "Kochi",      state: "Kerala",       desc: "Cultural & eco-experiences"       },
    { city: "Rishikesh",  state: "Uttarakhand",  desc: "Yoga, rafting & wellness"         },
  ],
};

/* ── Category-aware popular destinations — UAE ───────────────── */
const POPULAR_BY_CATEGORY_AE = {
  venues: [
    { city: "Dubai",         state: "Dubai",        desc: "Luxury ballrooms & rooftop venues"  },
    { city: "Abu Dhabi",     state: "Abu Dhabi",    desc: "Premium halls & convention centres" },
    { city: "Sharjah",       state: "Sharjah",      desc: "Cultural & heritage event venues"   },
    { city: "Ras Al Khaimah",state: "RAK",          desc: "Beachside & mountain resort venues" },
    { city: "Ajman",         state: "Ajman",        desc: "Modern & affordable event spaces"   },
    { city: "Fujairah",      state: "Fujairah",     desc: "Coastal & nature venues"            },
  ],
  farmstays: [
    { city: "Ras Al Khaimah",state: "RAK",          desc: "Mountain eco-retreats & farm stays" },
    { city: "Al Ain",        state: "Abu Dhabi",    desc: "Desert oases & garden retreats"     },
    { city: "Fujairah",      state: "Fujairah",     desc: "Wadi camps & coastal stays"         },
    { city: "Hatta",         state: "Dubai",        desc: "Highland retreats & dam-side stays" },
    { city: "Sharjah",       state: "Sharjah",      desc: "Desert safari & heritage farms"     },
    { city: "Liwa",          state: "Abu Dhabi",    desc: "Grand dunes & oasis escapes"        },
  ],
  studios: [
    { city: "Dubai",         state: "Dubai",        desc: "Photo, film & podcast studios"      },
    { city: "Abu Dhabi",     state: "Abu Dhabi",    desc: "Media city & production studios"    },
    { city: "Sharjah",       state: "Sharjah",      desc: "Creative arts & studio spaces"      },
    { city: "Dubai Marina",  state: "Dubai",        desc: "Content creation & green screen"    },
    { city: "Business Bay",  state: "Dubai",        desc: "Corporate media & recording"        },
    { city: "JLT",           state: "Dubai",        desc: "Podcast & commercial studios"       },
  ],
  rentals: [
    { city: "Dubai",         state: "Dubai",        desc: "Luxury villa & holiday rentals"     },
    { city: "Palm Jumeirah", state: "Dubai",        desc: "Waterfront villa & penthouse stays" },
    { city: "Abu Dhabi",     state: "Abu Dhabi",    desc: "Premium apartments & villas"        },
    { city: "Ras Al Khaimah",state: "RAK",          desc: "Resort & nature rental homes"       },
    { city: "Sharjah",       state: "Sharjah",      desc: "Affordable & family rentals"        },
    { city: "Fujairah",      state: "Fujairah",     desc: "Beachfront & coastal home rentals"  },
  ],
  workspaces: [
    { city: "Dubai",         state: "Dubai",        desc: "DIFC, Business Bay & co-working"   },
    { city: "Abu Dhabi",     state: "Abu Dhabi",    desc: "Premium offices & meeting rooms"    },
    { city: "Dubai Marina",  state: "Dubai",        desc: "Creative & tech co-working hubs"    },
    { city: "JLT",           state: "Dubai",        desc: "Shared offices & business centres"  },
    { city: "Sharjah",       state: "Sharjah",      desc: "Affordable business workspaces"     },
    { city: "Ajman",         state: "Ajman",        desc: "SME-friendly office spaces"         },
  ],
  experiences: [
    { city: "Dubai",         state: "Dubai",        desc: "Desert safaris & city experiences"  },
    { city: "Abu Dhabi",     state: "Abu Dhabi",    desc: "Heritage tours & cultural activities"},
    { city: "Ras Al Khaimah",state: "RAK",          desc: "Adventure & zip-line experiences"   },
    { city: "Hatta",         state: "Dubai",        desc: "Kayaking, hiking & eco-tours"       },
    { city: "Fujairah",      state: "Fujairah",     desc: "Diving, snorkelling & wadi trips"   },
    { city: "Al Ain",        state: "Abu Dhabi",    desc: "Wildlife parks & oasis tours"       },
  ],
};

/* ── Pick popular destinations based on country code ─────────── */
function getPopular(category, countryCode) {
  const map = countryCode === "ae" ? POPULAR_BY_CATEGORY_AE : POPULAR_BY_CATEGORY_IN;
  return map[category] ?? map.venues;
}

/* ── Region-keyed recent searches ───────────────────────────── */
function recentKey(countryCode) {
  return `vb_recent_locations_${countryCode || "in"}`;
}
function loadRecent(countryCode) {
  try { return JSON.parse(localStorage.getItem(recentKey(countryCode)) ?? "[]"); } catch { return []; }
}
function saveRecent(city, countryCode) {
  try {
    const prev    = loadRecent(countryCode).filter((c) => c !== city).slice(0, 4);
    const updated = [city, ...prev];
    localStorage.setItem(recentKey(countryCode), JSON.stringify(updated));
  } catch {}
}
function removeRecent(city, countryCode) {
  try {
    const updated = loadRecent(countryCode).filter((c) => c !== city);
    localStorage.setItem(recentKey(countryCode), JSON.stringify(updated));
    return updated;
  } catch { return []; }
}

/* ── FIX: extract the actual CITY from Places address_components ──────────
   Previously `city` was set to `place.name`, which is the specific place
   the user clicked (e.g. "Bangalore Palace", "Phoenix MarketCity") — not
   the city it's in. That polluted both the input box text and whatever
   gets saved to recents / sent to onSelectProp.
   This walks address_components in priority order (locality first, then
   broader admin levels) and falls back to place.name only if nothing
   usable is found (e.g. for a bare city-level prediction). ─────────────── */
function extractCity(components) {
  if (!Array.isArray(components) || components.length === 0) return null;
  const findByType = (type) =>
    components.find((c) => Array.isArray(c.types) && c.types.includes(type))?.long_name;

  return (
    findByType("locality") ||
    findByType("postal_town") ||
    findByType("administrative_area_level_2") ||
    findByType("sublocality") ||
    findByType("administrative_area_level_1") ||
    null
  );
}

/* ── Shared suggestion list (popup + inline) ─────────────────── */
function SuggestionList({ query, google, recents, setRecents, popular, tint, onSelect, light = false, countryCode = "in" }) {
  const tintHex = tint?.hex ?? "#7c3aed";

  /* theme-aware classes */
  const headCls    = light ? "text-gray-400 dark:text-white/30"            : "text-white/30";
  const itemCls    = light ? "text-gray-800 dark:text-white"               : "text-white";
  const subCls     = light ? "text-gray-400 dark:text-white/40"            : "text-white/40";
  const hoverCls   = light ? "hover:bg-gray-50 dark:hover:bg-white/[0.07]" : "hover:bg-white/[0.07]";
  const iconBg     = light ? "bg-gray-100 dark:bg-white/[0.08]"            : "bg-white/[0.08]";
  const iconCl     = light ? "text-gray-400 dark:text-white/50"            : "text-white/50";
  const divCls     = light ? "border-gray-100 dark:border-white/[0.07]"    : "border-white/[0.07]";
  /* sticky header needs same bg as the scroll container */
  const stickyBg   = light
    ? "bg-white dark:bg-[rgba(12,12,18,0.97)]"
    : "bg-[rgba(12,12,18,0.97)]";

  if (query.length >= 2) {
    if (google.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className={`text-sm ${subCls}`}>No results for "{query}"</p>
        </div>
      );
    }
    return (
      <div className="px-2 pb-2">
        <p className={`sticky top-0 z-10 text-[9px] font-bold uppercase tracking-widest ${headCls} ${stickyBg} px-2 pb-2 pt-3.5`}>
          Suggestions
        </p>
        {google.map((place) => (
          <button
            key={place.place_id}
            type="button"
            onClick={() => onSelect(place)}
            className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl ${hoverCls} transition text-start group`}
          >
            <div className={`shrink-0 mt-0.5 p-1.5 rounded-lg ${iconBg} transition`}>
              <MagnifyingGlassIcon className={`w-3.5 h-3.5 ${iconCl}`} />
            </div>
            <div className="min-w-0">
              <p className={`${itemCls} text-sm font-medium truncate leading-snug`}>
                {place.structured_formatting?.main_text ?? place.description}
              </p>
              <p className={`${subCls} text-xs truncate mt-0.5`}>
                {place.structured_formatting?.secondary_text ?? ""}
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      {recents.length > 0 && (
        <div className={`px-2 pb-2 border-b ${divCls}`}>
          <p className={`sticky top-0 z-10 text-[9px] font-bold uppercase tracking-widest ${headCls} ${stickyBg} px-2 py-1.5`}>
            Recent searches
          </p>
          <AnimatePresence initial={false}>
            {recents.map((city) => (
              <motion.div
                key={city}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className={`flex items-center gap-2 group rounded-xl ${hoverCls} transition px-1`}>
                  <button
                    type="button"
                    onClick={() => onSelect(city)}
                    className="flex items-center gap-3 flex-1 py-2 ps-2 text-start"
                  >
                    <div className={`shrink-0 p-1.5 rounded-lg ${iconBg}`}>
                      <ClockIcon className={`w-3.5 h-3.5 ${iconCl}`} />
                    </div>
                    <p className={`${itemCls} text-sm`}>{city}</p>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = removeRecent(city, countryCode);
                      setRecents(updated);
                    }}
                    className={`shrink-0 p-1.5 rounded-lg ${subCls} hover:bg-white/10 dark:hover:bg-white/10 transition opacity-0 group-hover:opacity-100 focus:opacity-100`}
                    aria-label={`Remove ${city}`}
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="px-2 pb-2">
        <p className={`sticky top-0 z-10 text-[9px] font-bold uppercase tracking-widest ${headCls} ${stickyBg} px-2 pb-2 pt-3.5`}>
          Popular destinations
        </p>
        {popular.map((loc) => (
          <button
            key={loc.city}
            type="button"
            onClick={() => onSelect(loc.city)}
            className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl ${hoverCls} transition text-start group`}
          >
            <div
              className="shrink-0 mt-0.5 p-1.5 rounded-lg transition"
              style={{ background: tint?.light ?? "rgba(124,58,237,0.15)" }}
            >
              <MapPinIcon className="w-3.5 h-3.5" style={{ color: tintHex }} />
            </div>
            <div className="min-w-0">
              <p className={`${itemCls} text-sm font-medium leading-relaxed break-words`}>
                {loc.city}
                <span className={`${subCls} font-normal`}> · {loc.state}</span>
              </p>
              <p className={`${subCls} text-xs mt-0.5 leading-relaxed break-words`}>{loc.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function LocationAutoComplete({
  category = "venues",
  tint,
  placeholder,
  textClass,
  placeholderClass,
  clearClass,
  /** When true, renders suggestions inline (no absolute dropdown). For MobileSearchSheet. */
  inline        = false,
  /**
   * When true, the floating suggestion panel uses white bg in light mode / dark in dark mode.
   * Default false preserves original homepage dark-glass behaviour.
   */
  lightDropdown = false,
  /** Called with the selected city string. */
  onSelect: onSelectProp,
  /** Called after a city is selected — use to advance focus to the next field. */
  onNext,
  /**
   * ISO 3166-1 alpha-2 country code used to restrict Places suggestions.
   * "in" = India (default), "ae" = UAE, etc.
   */
  countryCode = "in",
  /** Pre-fill value (e.g. from URL params on search page) */
  defaultValue = "",
}) {
  const inputRef  = useRef(null);
  const wrapRef   = useRef(null);
  const [show,    setShow]    = useState(false);
  const [query,   setQuery]   = useState(defaultValue || "");
  const [google,  setGoogle]  = useState([]);
  const [recents, setRecents] = useState([]);

  const popular = getPopular(category, countryCode);

  /* Reload recents when countryCode changes */
  useEffect(() => { setRecents(loadRecent(countryCode)); }, [countryCode]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.google || query.length < 2) { setGoogle([]); return; }
    const svc = new window.google.maps.places.AutocompleteService();
    svc.getPlacePredictions(
      { input: query, componentRestrictions: { country: countryCode || "in" } },
      (preds) => { setGoogle(preds ?? []); }
    );
  }, [query, countryCode]);

  useEffect(() => {
    if (inline || !show) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [show, inline]);

  const placesServiceRef = useRef(null);

  // FIX: previously this was only created once, in a mount-effect with an
  // empty dependency array. If window.google wasn't loaded yet at the exact
  // moment this component mounted (very common — the Maps script usually
  // resolves asynchronously, after first render), placesServiceRef.current
  // stayed null FOREVER, since the effect never re-ran. handleSelect would
  // then silently bail out (`if (!placesServiceRef.current) return;`),
  // getDetails() never ran, and onSelectProp never fired — so the parent's
  // lat/lng/bounds just stayed at their initial null values, which is
  // exactly the symptom being reported.
  //
  // Creating it lazily, on demand, at the moment we actually need it means
  // it self-heals: even if Maps loaded late, by the time the user has typed
  // 2+ characters and clicked a suggestion, window.google is virtually
  // guaranteed to be ready.
  const getPlacesService = () => {
    if (typeof window === "undefined" || !window.google?.maps?.places) {
      return null;
    }
    if (!placesServiceRef.current) {
      const div = document.createElement("div");
      placesServiceRef.current = new window.google.maps.places.PlacesService(div);
    }
    return placesServiceRef.current;
  };

  // FIX: Recent-search and Popular-destination picks are plain strings
  // (e.g. "Bengaluru") with no coordinates attached. The old code just
  // shipped { lat: null, lng: null, bounds: null } for these unconditionally
  // — it never actually looked anything up. This geocodes the city name
  // (restricted to the active country) so these selections resolve real
  // coordinates too, same as a typed/autocompleted selection does.
  const geocoderRef = useRef(null);
  const getGeocoder = () => {
    if (typeof window === "undefined" || !window.google?.maps) return null;
    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
    return geocoderRef.current;
  };

  const geocodeCity = (cityStr, country) =>
    new Promise((resolve) => {
      const geocoder = getGeocoder();
      if (!geocoder) { resolve(null); return; }

      geocoder.geocode(
        { address: cityStr, componentRestrictions: { country: country || "in" } },
        (results, status) => {
          if (status !== window.google.maps.GeocoderStatus.OK || !results?.[0]) {
            resolve(null);
            return;
          }

          const res = results[0];
          const location = res.geometry.location;
          const viewport = res.geometry.viewport;

          let bounds = null;
          if (viewport) {
            const ne = viewport.getNorthEast();
            const sw = viewport.getSouthWest();
            bounds = { north: ne.lat(), east: ne.lng(), south: sw.lat(), west: sw.lng() };
          }

          resolve({
            address: res.formatted_address || cityStr,
            lat: location.lat(),
            lng: location.lng(),
            bounds,
          });
        }
      );
    });

  const handleSelect = async (item) => {
    // Recent / Popular — plain city string, needs geocoding for coordinates
    if (typeof item === "string") {
      setQuery(item);

      saveRecent(item, countryCode);
      setRecents(loadRecent(countryCode));
      setShow(false);

      // Resolve immediately with what we know; onSelectProp gets called
      // again below once geocoding resolves, so consumers that only care
      // about the city name still work instantly, and lat/lng/bounds
      // arrive a beat later instead of being permanently null.
      onSelectProp?.({
        city: item,
        address: item,
        lat: null,
        lng: null,
        bounds: null,
      });

      if (onNext) setTimeout(onNext, 60);

      const geo = await geocodeCity(item, countryCode);
      if (geo) {
        onSelectProp?.({
          city: item,
          address: geo.address,
          lat: geo.lat,
          lng: geo.lng,
          bounds: geo.bounds,
        });
      }
      return;
    }

    // Google prediction — resolve full details (coords, bounds, real city name)
    // FIX: show the short "main text" immediately instead of the full
    // "City, State, Country" description, so the box doesn't flash the
    // long string while getDetails() is resolving.
    setQuery(item.structured_formatting?.main_text ?? item.description);

    const service = getPlacesService();
    if (!service) {
      // Maps script genuinely isn't loaded — nothing we can resolve yet.
      // Logged so this is visible in dev instead of silently vanishing.
      console.warn("[LocationAutoComplete] Google Maps Places API not ready — could not resolve lat/lng/bounds for selection.");
      return;
    }

    service.getDetails(
      {
        placeId: item.place_id,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "address_components",
          "types",
        ],
      },
      (place, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !place ||
          !place.geometry
        ) {
          return;
        }

        const location = place.geometry.location;
        const viewport = place.geometry.viewport;

        let bounds = null;

        if (viewport) {
          const ne = viewport.getNorthEast();
          const sw = viewport.getSouthWest();

          bounds = {
            north: ne.lat(),
            east: ne.lng(),
            south: sw.lat(),
            west: sw.lng(),
          };
        }

        // FIX: derive the real city (locality) from address_components
        // instead of using place.name, which is the specific establishment
        // the user picked (e.g. "Bangalore Palace") rather than its city.
        const cityName = extractCity(place.address_components) || place.name;

        const result = {
          placeId: item.place_id,

          city: cityName,
          address: place.formatted_address,

          lat: location.lat(),
          lng: location.lng(),

          bounds,

          types: place.types ?? [],
          components: place.address_components ?? [],
        };

        // FIX: the input box previously kept showing the long
        // "City, State, Country" description forever — this corrects it
        // to the clean city name once details resolve.
        setQuery(cityName);

        saveRecent(cityName, countryCode);
        setRecents(loadRecent(countryCode));
        setShow(false);

        onSelectProp?.(result);

        if (onNext) {
          setTimeout(onNext, 60);
        }
      }
    );
  };

  const tintBorder = tint?.border ?? "rgba(255,255,255,0.15)";
  const tintGlow   = tint?.glow   ?? "0 0 24px rgba(255,255,255,0.05)";

  // FIX: previously `defaultValue` was only read once via
  // useState(defaultValue || ""), so if the parent updated `defaultValue`
  // later (reset a search, programmatically set a city, etc.) the input
  // just silently kept showing whatever was last typed/selected — it never
  // picked up the new external value. This keeps it in sync.
  useEffect(() => {
  if (!defaultValue) {
    setQuery("");
  } else if (typeof defaultValue === "string") {
    setQuery(defaultValue);
  } else {
    setQuery(
      defaultValue.city ||
      defaultValue.address ||
      ""
    );
  }
}, [defaultValue]);

  const inputEl = (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          if (!inline) setShow(true);

          // FIX: previously typing never told the parent anything — only
          // clicking a suggestion or the ✕ button did. That meant manually
          // backspacing the field to empty left the box blank while the
          // parent still held the last *selected* city/lat/lng/bounds,
          // out of sync with what's visibly in the input. Only notify on
          // the empty case (free-typed partial text isn't a "selection"
          // yet — that still only happens on pick), matching what the ✕
          // button already does.
          if (val === "") onSelectProp?.("");
        }}
        onFocus={() => !inline && setShow(true)}
        placeholder={placeholder ?? "Search city or area"}
        className={`bg-transparent outline-none w-full text-sm ${placeholderClass ?? "placeholder-white/35"} ${textClass ?? "text-white"}`}
      />
      {query && (
        <button
          type="button"
          onClick={() => { setQuery(""); onSelectProp?.(""); inputRef.current?.focus(); }}
          className={`transition shrink-0 ${clearClass ?? "text-white/40 hover:text-white/80"}`}
        >
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  /* ── Inline mode ─────────────────────────────────────────────── */
  if (inline) {
    return (
      <div className="w-full">
        {inputEl}
        <div
          className={[
            "mt-2 rounded-2xl overflow-y-auto max-h-[260px] w-full",
            lightDropdown
              ? "bg-white dark:bg-[rgba(12,12,18,0.97)] border border-gray-200 dark:border-white/15"
              : "",
          ].join(" ")}
          style={lightDropdown ? {} : { background: "rgba(12,12,18,0.97)", border: `1px solid ${tintBorder}` }}
        >
          <SuggestionList
            query={query} google={google} recents={recents} setRecents={setRecents}
            popular={popular} tint={tint} onSelect={handleSelect} light={lightDropdown}
            countryCode={countryCode}
          />
        </div>
      </div>
    );
  }

  /* ── Popup mode ──────────────────────────────────────────────── */
  return (
    <div ref={wrapRef} className="w-full">
      {inputEl}

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 8,   scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={lightDropdown ? { insetInlineStart: 0 } : {
              background:       "rgba(12,12,18,0.97)",
              border:           `1px solid ${tintBorder}`,
              boxShadow:        `0 24px 64px rgba(0,0,0,0.6), ${tintGlow}`,
              insetInlineStart: 0,
            }}
            className={[
              "absolute top-full mt-1.5 min-w-[320px] max-w-[400px] z-[9999] rounded-2xl overflow-y-auto max-h-[380px]",
              lightDropdown
                ? "bg-white dark:bg-[rgba(12,12,18,0.97)] border border-gray-200 dark:border-white/15 shadow-xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
                : "backdrop-blur-2xl",
            ].join(" ")}
          >
            <SuggestionList
              query={query} google={google} recents={recents} setRecents={setRecents}
              popular={popular} tint={tint} onSelect={handleSelect} light={lightDropdown}
              countryCode={countryCode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}