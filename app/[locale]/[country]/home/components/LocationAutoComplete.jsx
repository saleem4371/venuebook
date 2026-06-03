"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinIcon, ClockIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";

/* ── Category-aware popular destinations ─────────────────────── */
const POPULAR_BY_CATEGORY = {
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

const RECENT_STORAGE_KEY = "vb_recent_locations";

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function saveRecent(city) {
  try {
    const prev    = loadRecent().filter((c) => c !== city).slice(0, 4);
    const updated = [city, ...prev];
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}
function removeRecent(city) {
  try {
    const updated = loadRecent().filter((c) => c !== city);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch { return []; }
}

/* ── Shared suggestion list (popup + inline) ─────────────────── */
function SuggestionList({ query, google, recents, setRecents, popular, tint, onSelect, light = false }) {
  const tintHex = tint?.hex ?? "#7c3aed";

  /* theme-aware classes — light=false preserves all existing homepage behaviour */
  const headCls  = light ? "text-gray-400 dark:text-white/30"           : "text-white/30";
  const itemCls  = light ? "text-gray-800 dark:text-white"              : "text-white";
  const subCls   = light ? "text-gray-400 dark:text-white/40"           : "text-white/40";
  const hoverCls = light ? "hover:bg-gray-50 dark:hover:bg-white/[0.07]" : "hover:bg-white/[0.07]";
  const iconBg   = light ? "bg-gray-100 dark:bg-white/[0.08]"           : "bg-white/[0.08]";
  const iconCl   = light ? "text-gray-400 dark:text-white/50"           : "text-white/50";
  const divCls   = light ? "border-gray-100 dark:border-white/[0.07]"   : "border-white/[0.07]";

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
        <p className={`text-[9px] font-bold uppercase tracking-widest ${headCls} px-2 pb-2 pt-3.5`}>
          Suggestions
        </p>
        {google.map((place) => (
          <button
            key={place.place_id}
            type="button"
            onClick={() => onSelect(place.description)}
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
        <div className={`p-2 border-b ${divCls}`}>
          <p className={`text-[9px] font-bold uppercase tracking-widest ${headCls} px-2 py-1.5`}>
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
                      const updated = removeRecent(city);
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
        <p className={`text-[9px] font-bold uppercase tracking-widest ${headCls} px-2 pb-2 pt-3.5`}>
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
}) {
  const inputRef  = useRef(null);
  const wrapRef   = useRef(null);
  const [show,    setShow]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [google,  setGoogle]  = useState([]);
  const [recents, setRecents] = useState([]);

  const popular = POPULAR_BY_CATEGORY[category] ?? POPULAR_BY_CATEGORY.venues;

  useEffect(() => { setRecents(loadRecent()); }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.google || query.length < 2) { setGoogle([]); return; }
    const svc = new window.google.maps.places.AutocompleteService();
    svc.getPlacePredictions({ input: query, componentRestrictions: { country: "in" } }, (preds) => {
      setGoogle(preds ?? []);
    });
  }, [query]);

  useEffect(() => {
    if (inline || !show) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [show, inline]);

  const handleSelect = (city) => {
    setQuery(city);
    saveRecent(city);
    setRecents(loadRecent());
    setShow(false);
    onSelectProp?.(city);
  };

  const tintBorder = tint?.border ?? "rgba(255,255,255,0.15)";
  const tintGlow   = tint?.glow   ?? "0 0 24px rgba(255,255,255,0.05)";

  const inputEl = (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => { setQuery(e.target.value); if (!inline) setShow(true); }}
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
              "absolute top-full mt-1.5 min-w-[320px] max-w-[400px] z-[9999] rounded-2xl overflow-hidden",
              lightDropdown
                ? "bg-white dark:bg-[rgba(12,12,18,0.97)] border border-gray-200 dark:border-white/15 shadow-xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
                : "backdrop-blur-2xl",
            ].join(" ")}
          >
            <SuggestionList
              query={query} google={google} recents={recents} setRecents={setRecents}
              popular={popular} tint={tint} onSelect={handleSelect} light={lightDropdown}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
