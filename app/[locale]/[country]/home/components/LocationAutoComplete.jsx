"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinIcon, ClockIcon, FireIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";

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

/* ── Main component ─────────────────────────────────────────── */
export default function LocationAutoComplete({ category = "venues", tint, placeholder, textClass, placeholderClass, clearClass }) {
  const inputRef  = useRef(null);
  const wrapRef   = useRef(null);
  const [show,    setShow]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [google,  setGoogle]  = useState([]);
  const [recents, setRecents] = useState([]);

  const popular = POPULAR_BY_CATEGORY[category] ?? POPULAR_BY_CATEGORY.venues;

  /* Load recents on mount */
  useEffect(() => { setRecents(loadRecent()); }, []);

  /* Google autocomplete */
  useEffect(() => {
    if (!window.google || query.length < 2) { setGoogle([]); return; }
    const svc = new window.google.maps.places.AutocompleteService();
    svc.getPlacePredictions({ input: query, componentRestrictions: { country: "in" } }, (preds) => {
      setGoogle(preds ?? []);
    });
  }, [query]);

  /* Outside click */
  useEffect(() => {
    if (!show) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [show]);

  const handleSelect = (city) => {
    setQuery(city);
    saveRecent(city);
    setRecents(loadRecent());
    setShow(false);
  };

  const tintBorder = tint?.border ?? "rgba(255,255,255,0.15)";
  const tintGlow   = tint?.glow   ?? "0 0 24px rgba(255,255,255,0.05)";
  const tintHex    = tint?.hex    ?? "#7c3aed";

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShow(true)}
          placeholder={placeholder ?? "Search city or area"}
          className={`bg-transparent outline-none w-full text-sm ${placeholderClass ?? "placeholder-white/35"} ${textClass ?? "text-white"}`}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className={`transition shrink-0 ${clearClass ?? "text-white/40 hover:text-white/80"}`}
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 8,   scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              background:        "rgba(12,12,18,0.97)",
              border:            `1px solid ${tintBorder}`,
              boxShadow:         `0 24px 64px rgba(0,0,0,0.6), ${tintGlow}`,
              insetInlineStart:  0,
            }}
            className="absolute top-full mt-3 w-max min-w-full min-w-[300px] max-w-[380px] z-[9999] rounded-2xl backdrop-blur-2xl overflow-hidden"
          >
            {/* Google suggestions when typing */}
            {query.length >= 2 && google.length > 0 && (
              <div className="p-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-2 py-1.5">
                  Suggestions
                </p>
                {google.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    onClick={() => handleSelect(place.description)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.07] transition text-start group"
                  >
                    <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-white/[0.08] group-hover:bg-white/[0.12] transition">
                      <MagnifyingGlassIcon className="w-3.5 h-3.5 text-white/50" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate leading-snug">
                        {place.structured_formatting?.main_text ?? place.description}
                      </p>
                      <p className="text-white/40 text-xs truncate mt-0.5">
                        {place.structured_formatting?.secondary_text ?? ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Empty query — show recents + popular */}
            {query.length < 2 && (
              <>
                {/* Recent searches */}
                {recents.length > 0 && (
                  <div className="p-2 border-b border-white/[0.07]">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-2 py-1.5">
                      Recent searches
                    </p>
                    {recents.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleSelect(city)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.07] transition text-start"
                      >
                        <div className="shrink-0 p-1.5 rounded-lg bg-white/[0.08]">
                          <ClockIcon className="w-3.5 h-3.5 text-white/50" />
                        </div>
                        <p className="text-white/80 text-sm">{city}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular destinations — category-aware */}
                <div className="p-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-2 py-1.5">
                    Popular destinations
                  </p>
                  {popular.map((loc) => (
                    <button
                      key={loc.city}
                      type="button"
                      onClick={() => handleSelect(loc.city)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.07] transition text-start group"
                    >
                      <div
                        className="shrink-0 mt-0.5 p-1.5 rounded-lg transition"
                        style={{ background: tint?.light ?? "rgba(124,58,237,0.15)" }}
                      >
                        <MapPinIcon className="w-3.5 h-3.5" style={{ color: tintHex }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium leading-relaxed break-words">
                          {loc.city}
                          <span className="text-white/40 font-normal"> · {loc.state}</span>
                        </p>
                        <p className="text-white/40 text-xs mt-0.5 leading-relaxed break-words">{loc.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* No google results */}
            {query.length >= 2 && google.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-white/40 text-sm">No results for "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
