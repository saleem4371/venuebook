"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  LocateFixed,
  Building2,
  TreePine,
  Landmark,
  Building,
  Key,
  Camera,
  Compass,
  Search,
  History,
  TrendingUp,
  X,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { LoadProperty } from "@/services/venues.service";
import { recent_views } from "@/services/home.service";
// Reusing the Search page's own default-filters shape (a plain exported
// constant, not a component) so this dropdown's LoadProperty call matches
// exactly what the Search page itself sends on a fresh, filter-less load.
// Sending `filters: {}` instead — missing `budget.min`/`.max` etc. that a
// lot of downstream filter logic reads without optional chaining — was the
// actual reason the dropdown was coming back empty (the request/parse threw
// and got swallowed by the .catch() below). This only imports a data
// constant; the Search page's own file is untouched.
import { DEFAULT_FILTERS } from "@/app/[locale]/[country]/search/[type]/components/FilterDrawer";

/* ═══════════════════════════════════════════════════════════════════════
   ICONS: lucide-react throughout (already a project dependency — no
   install step needed). Naming maps to the spec: map-pin → MapPin,
   venue-building-2 → Building2, tree-pine → TreePine,
   building-community → Landmark (estate), building → Building
   (workspace), key → Key, search → Search, history → History,
   trending-up → TrendingUp.
   ═══════════════════════════════════════════════════════════════════════ */

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

/* ── Destination card gradients ───────────────────────────────
   Popular Destinations render as photo cards, but this dropdown has no
   verified/working image URLs to pull real destination photography from
   (nothing in this codebase currently maps a city to a real photo asset,
   and guessing at third-party photo IDs risks broken images). Each entry
   below CAN carry an optional `img` field — if one is ever added, the
   card uses it — but until then, a curated per-city gradient plus a large
   watermark pin icon reads as an intentional, premium tile rather than a
   broken-image placeholder. Cycled deterministically by city name so the
   same city always gets the same gradient. */
const DESTINATION_GRADIENTS = [
  "linear-gradient(135deg,#7c3aed,#c026d3)",
  "linear-gradient(135deg,#0ea5e9,#6366f1)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#10b981,#0ea5e9)",
  "linear-gradient(135deg,#ec4899,#f97316)",
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#14b8a6,#3b82f6)",
  "linear-gradient(135deg,#f43f5e,#a855f7)",
];
function destinationGradient(city) {
  let hash = 0;
  for (let i = 0; i < (city || "").length; i++) hash = (hash * 31 + city.charCodeAt(i)) | 0;
  return DESTINATION_GRADIENTS[Math.abs(hash) % DESTINATION_GRADIENTS.length];
}

/* ── Trending searches (Property mode) — static, category-aware chip set.
   No trending/analytics endpoint exists anywhere in this codebase, so
   these are curated examples per category rather than a live "what's
   actually trending right now" feed. */
const TRENDING_SEARCHES = {
  venues:      ["Wedding Venues", "Corporate Events", "Beach Venues", "Banquet Halls", "Rooftop Venues"],
  farmstays:   ["Weekend Farmstays", "Pet-Friendly Stays", "Pool Farmstays", "Heritage Estates"],
  studios:     ["Photography Studios", "Podcast Studios", "Film Sets", "Green Screen Studios"],
  rentals:     ["Party Venues", "Pop-up Spaces", "Event Halls", "Rooftop Rentals"],
  workspaces:  ["Meeting Rooms", "Private Offices", "Conference Halls", "Coworking Desks"],
  experiences: ["Adventure Experiences", "Cultural Tours", "Wellness Retreats"],
};
function getTrending(category) {
  return TRENDING_SEARCHES[(category || "").toLowerCase()] ?? TRENDING_SEARCHES.venues;
}

/* ── Region-keyed recent LOCATION searches ───────────────────── */
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

/* ── Region-keyed recent PROPERTY searches — deliberately a SEPARATE
   localStorage key/namespace from location recents, per spec ("Separate
   recent history for Location and Property modes"). Entries can be either
   a resolved listing ({ id, name, category, city, thumb }) or a bare
   free-typed query ({ query }) when the user hits Enter without picking a
   suggestion. Deduped by id when present, otherwise by query text. ────── */
function propertyRecentKey(countryCode) {
  return `vb_recent_properties_${countryCode || "in"}`;
}
function loadPropertyRecent(countryCode) {
  try { return JSON.parse(localStorage.getItem(propertyRecentKey(countryCode)) ?? "[]"); } catch { return []; }
}
function savePropertyRecent(entry, countryCode) {
  try {
    const prev = loadPropertyRecent(countryCode).filter((e) =>
      entry.id ? e.id !== entry.id : e.query !== entry.query
    ).slice(0, 4);
    const updated = [entry, ...prev];
    localStorage.setItem(propertyRecentKey(countryCode), JSON.stringify(updated));
    return updated;
  } catch { return []; }
}
function removePropertyRecent(entry, countryCode) {
  try {
    const updated = loadPropertyRecent(countryCode).filter((e) =>
      entry.id ? e.id !== entry.id : e.query !== entry.query
    );
    localStorage.setItem(propertyRecentKey(countryCode), JSON.stringify(updated));
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

/* ── Property-type → icon (Tabler icons, matching the spec's mapping) ── */
const PROPERTY_TYPE_ICON = {
  venues:      Building2,
  venue:       Building2,
  farmstays:   TreePine,
  farmstay:    TreePine,
  estate:      Landmark,
  estates:     Landmark,
  studios:     Camera,
  studio:      Camera,
  workspaces:  Building,
  workspace:   Building,
  rentals:     Key,
  rental:      Key,
  experiences: Compass,
  experience:  Compass,
};
function propertyTypeIcon(category) {
  return PROPERTY_TYPE_ICON[(category || "").toLowerCase()] || Building2;
}
function propertyTypeLabel(category) {
  if (!category) return "Property";
  const c = String(category);
  return c.charAt(0).toUpperCase() + c.slice(1);
}

/* ── Normalize a raw listing object (many possible field names across the
   API surface — see search page's own defensive `compareThumb`/`compareName`
   helpers, same idea applied here) into the shape this dropdown renders. ── */
function normalizeListing(item, fallbackCategory) {
  const id       = item.childVenueId || item.id || item._id;
  const name     = item.venueName || item.title || item.name || "Untitled property";
  const category = item.category || item.property_type || fallbackCategory;
  const city     = item.city || item.state || "";
  const rawImg   = item.images?.[0] || item.image || item.thumbnail || item.coverImage || null;
  const bucket   = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;
  const thumb    = rawImg ? (rawImg.startsWith("http") ? rawImg : `${bucket}/${rawImg}`) : null;
  return { id, name, category, city, thumb };
}

/* ── Property-mode toggle label/icon — driven by the active category tab
   (venues/farmstays/studios/...) so the pill reads "Venue"/"Farmstay"/etc.
   instead of a generic "Property", and its icon matches the same
   per-category glyph used throughout Property-mode suggestion rows. ───── */
const CATEGORY_LABEL = {
  venues: "Venue", venue: "Venue",
  farmstays: "Farmstay", farmstay: "Farmstay",
  studios: "Studio", studio: "Studio",
  rentals: "Rental", rental: "Rental",
  workspaces: "Workspace", workspace: "Workspace",
  experiences: "Experience", experience: "Experience",
};
function categoryModeLabel(category) {
  return CATEGORY_LABEL[(category || "").toLowerCase()] || "Property";
}
const CATEGORY_PLACEHOLDER = {
  venues: "Search venue name", venue: "Search venue name",
  farmstays: "Search farmstay name", farmstay: "Search farmstay name",
  studios: "Search studio name", studio: "Search studio name",
  rentals: "Search rental name", rental: "Search rental name",
  workspaces: "Search workspace name", workspace: "Search workspace name",
  experiences: "Search experience name", experience: "Search experience name",
};
function categoryPlaceholder(category) {
  return CATEGORY_PLACEHOLDER[(category || "").toLowerCase()] || "Search property name";
}

/* ── Segmented Location / [Category] pill switch ─────────────────────────
   Lives INSIDE the dropdown panel (not the input row), so the search bar's
   own height/width never changes — only the floating panel gains a header
   row. The active-pill highlight is one absolutely-positioned motion.div
   animated via `left`/spring so it slides smoothly between the two
   buttons instead of popping.

   IMPORTANT: this component is declared at MODULE scope (stable identity
   across every render), not nested inside LocationAutoComplete. Nesting it
   (or anything rendered from it) inside the main component body means React
   sees a brand-new function/component reference on every re-render, which
   forces a full unmount+remount of this subtree instead of a normal
   prop-update — that unmount/remount cycle is exactly what was causing the
   pill to visibly "shake": HeroSection's rotating headline word re-renders
   the whole tree every few seconds, and each of those re-renders was
   destroying and rebuilding the sliding indicator's DOM node from scratch. */
function ModeSwitch({ mode, setMode, light, tint, category }) {
  // `light` === lightDropdown (mobile, inline sheet) — that panel lives
  // inside the site's real light/dark theme, so its colors must respond to
  // the `dark:` class the same way every other row in this file already
  // does (see headCls/itemCls/hoverCls etc. below). The non-light branch is
  // the desktop popup, which is intentionally always-dark regardless of
  // site theme and is left untouched (raw rgba, no dark: variant needed).
  const trackCls = light
    ? "bg-black/[0.045] dark:bg-white/[0.06]"
    : "";
  const pillCls = light
    ? "bg-white dark:bg-white/[0.14] shadow-sm"
    : "bg-white/[0.14]";
  const activeText = light ? "text-gray-900 dark:text-white" : "text-white";
  const inactiveText = light ? "text-gray-400 dark:text-white/40" : "text-white/40";
  const tintHex = tint?.hex ?? "#7c3aed";

  const tabs = [
    { id: "location", label: "Location", icon: MapPin },
    { id: "property",  label: categoryModeLabel(category), icon: propertyTypeIcon(category) },
  ];

  return (
    <div
      className={`relative flex items-center p-1 rounded-full mx-2 mt-2 mb-1 ${trackCls}`}
      style={light ? undefined : { background: "rgba(255,255,255,0.06)" }}
      role="tablist"
      aria-label="Search mode"
    >
      <motion.div
        className={`absolute top-1 bottom-1 rounded-full ${pillCls}`}
        style={{ width: "calc(50% - 4px)" }}
        animate={{ left: mode === "location" ? 4 : "50%" }}
        transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.9 }}
      />
      {tabs.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setMode(m.id)}
            className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-colors duration-200 ${
              isActive ? activeText : inactiveText
            }`}
          >
            <Icon className="w-3.5 h-3.5" style={isActive ? { color: tintHex } : undefined} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Small shared row primitive used by every suggestion group ─────────
   iconStyle/iconTint (inline style, set only in lightDropdown/mobile mode)
   take over from the plain gray iconBg/iconCl classes when present, so the
   mobile sheet's suggestion rows pick up the active category's tint colour
   instead of a flat gray tile — matches the tinted badges/accents used
   everywhere else in the app instead of looking like a generic form. */
function Row({ icon: Icon, iconBg, iconCl, iconStyle, iconTint, hoverCls, itemCls, subCls, thumb, primary, secondary, badge, active, onSelect, onRemove }) {
  return (
    <div className={`flex items-center gap-2 group rounded-xl ${hoverCls} transition px-1 ${active ? "ring-1 ring-inset" : ""}`}
      style={active ? { background: "rgba(124,58,237,0.08)" } : undefined}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex items-center gap-3 flex-1 py-2 ps-2 text-start min-w-0"
      >
        {thumb ? (
          <img src={thumb} alt="" className="shrink-0 w-9 h-9 rounded-lg object-cover" />
        ) : (
          <div className={`shrink-0 p-1.5 rounded-lg ${iconStyle ? "" : iconBg}`} style={iconStyle}>
            <Icon className={`w-3.5 h-3.5 ${iconTint ? "" : iconCl}`} style={iconTint ? { color: iconTint } : undefined} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className={`${itemCls} text-sm font-medium truncate`}>{primary}</p>
            {badge && (
              <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${subCls}`} style={{ background: "rgba(124,58,237,0.12)" }}>
                {badge}
              </span>
            )}
          </div>
          {secondary && <p className={`${subCls} text-xs truncate mt-0.5`}>{secondary}</p>}
        </div>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className={`shrink-0 p-1.5 rounded-lg ${subCls} hover:bg-white/10 dark:hover:bg-white/10 transition opacity-0 group-hover:opacity-100 focus:opacity-100`}
          aria-label="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/* ── Popular Destinations — compact horizontally-scrollable photo cards
   instead of plain text rows. Uses a real photo (`img`) if one is ever
   supplied on the destination data; otherwise a deterministic per-city
   gradient plus a watermark pin icon — see DESTINATION_GRADIENTS note. */
function DestinationCard({ img, city, subtitle, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative shrink-0 w-[132px] h-[100px] rounded-2xl overflow-hidden text-start shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
      style={!img ? { background: destinationGradient(city) } : undefined}
    >
      {img ? (
        <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <MapPin className="absolute -bottom-2 -end-2 w-16 h-16 text-white/15" strokeWidth={1.5} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2.5">
        <p className="text-white text-[13px] font-bold leading-tight truncate">{city}</p>
        {subtitle && <p className="text-white/75 text-[10px] leading-snug truncate mt-0.5">{subtitle}</p>}
      </div>
    </button>
  );
}

/* ── Trending search chip — Property mode only ─────────────────────── */
function TrendingChip({ label, onSelect, hoverCls, divCls, subCls }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full border ${divCls} ${hoverCls} ${subCls} transition text-start whitespace-nowrap`}
    >
      {label}
    </button>
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
  /** Called with the selected value. Location picks keep the original
   *  { city, address, lat, lng, bounds } shape. Property picks/queries send
   *  { mode: "property", propertyId?, propertyName?, propertyType?, city?,
   *    propertyQuery? } — see HeroSection.handleSearch for how the
   *  propertyQuery key gets folded into the URL. */
  onSelect: onSelectProp,
  /** Called after a selection — use to advance focus to the next field. */
  onNext,
  /**
   * ISO 3166-1 alpha-2 country code used to restrict Places suggestions.
   * "in" = India (default), "ae" = UAE, etc.
   */
  countryCode = "in",
  /** Pre-fill value (e.g. from URL params on search page) */
  defaultValue = "",
  /** Called with the field label text whenever the mode (or active
   *  category) changes — "Location" in Location mode, or the singular
   *  category word ("Venue"/"Farmstay"/...) in Property mode. Lets the
   *  parent's field header swap from "LOCATION" to "VENUE" etc, not just
   *  the input's placeholder. */
  onModeChange,
}) {
  const router = useRouter();
  const params = useParams();
  const locale  = params?.locale  || "en";
  const country = params?.country || countryCode || "in";

  const { user } = useAuth();

  const inputRef  = useRef(null);
  const wrapRef   = useRef(null);
  const [show,    setShow]    = useState(false);
  const [mode,    setMode]    = useState("location"); // "location" | "property"
  const [query,   setQuery]   = useState(defaultValue || "");
  const [google,  setGoogle]  = useState([]);
  const [recents, setRecents] = useState([]);
  const [propertyRecents, setPropertyRecents] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const popular = getPopular(category, countryCode);

  /* Reload both recents lists whenever countryCode changes */
  useEffect(() => {
    setRecents(loadRecent(countryCode));
    setPropertyRecents(loadPropertyRecent(countryCode));
  }, [countryCode]);

  /* Tell the parent what the field's header label should read right now —
     "Location" in Location mode, or the active category's singular word
     ("Venue"/"Farmstay"/...) in Property mode — so the static "LOCATION"
     label above the input swaps along with the placeholder instead of
     staying put while everything else changes. */
  useEffect(() => {
    onModeChange?.(mode === "property" ? categoryModeLabel(category) : "Location");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, category]);

  /* Location-mode Google Places predictions — untouched from before, just
     scoped to mode === "location" so Property mode never fires Places
     calls while the user types a venue name. */
  useEffect(() => {
    if (mode !== "location") { setGoogle([]); return; }
    if (query.trim().length < 2) { setGoogle([]); return; }

    if (
      typeof window === "undefined" ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places ||
      !window.google.maps.places.AutocompleteService
    ) {
      console.error("Google Places API is not loaded.");
      setGoogle([]);
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();

    service.getPlacePredictions(
      {
        input: query,
        componentRestrictions: {
          country: countryCode || "in",
        },
      },
      (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setGoogle(predictions);
        } else {
          setGoogle([]);
        }
      }
    );
  }, [mode, query, countryCode]);

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

  /* ── Nearby locations (Location mode only) — permission-gated browser
     geolocation, reverse-geocoded via the same Geocoder used above. If the
     browser already granted permission earlier, this resolves silently on
     open; otherwise a single "Use current location" row prompts for it. ── */
  const [nearbyStatus, setNearbyStatus] = useState("idle"); // idle | prompt | checking | granted | denied | unsupported
  const [nearbyPlace,  setNearbyPlace]  = useState(null);

  useEffect(() => {
    if (mode !== "location" || typeof window === "undefined") return;
    if (!navigator.permissions?.query) { setNearbyStatus("prompt"); return; }
    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (cancelled) return;
        if (status.state === "granted") fetchNearby();
        else setNearbyStatus(status.state === "denied" ? "denied" : "prompt");
      })
      .catch(() => { if (!cancelled) setNearbyStatus("prompt"); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const fetchNearby = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setNearbyStatus("unsupported");
      return;
    }
    setNearbyStatus("checking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const geocoder = getGeocoder();
        if (!geocoder) { setNearbyStatus("granted"); return; }
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
            const cityName = extractCity(results[0].address_components) || results[0].formatted_address;
            setNearbyPlace({
              city: cityName,
              address: results[0].formatted_address,
              lat: latitude,
              lng: longitude,
            });
          }
          setNearbyStatus("granted");
        });
      },
      () => setNearbyStatus("denied"),
      { timeout: 8000 }
    );
  };

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

    // Nearby place — already resolved lat/lng/address from the browser
    if (item?.__nearby) {
      setQuery(item.city);
      setShow(false);
      onSelectProp?.({
        city: item.city,
        address: item.address,
        lat: item.lat,
        lng: item.lng,
        bounds: null,
      });
      saveRecent(item.city, countryCode);
      setRecents(loadRecent(countryCode));
      if (onNext) setTimeout(onNext, 60);
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

  /* ── Property mode: data sources ──────────────────────────────
     No backend "search properties by name" endpoint exists in this codebase
     (checked global.service.js, venues.service.js, home.service.js, and the
     Search page's own network calls) — findPropertyname()/getPropertyName()
     return CATEGORY taxonomy chips, not individual listings. This reuses
     the real listing endpoint the Search page already calls (LoadProperty)
     for "Popular listings", the real recent_views() endpoint for "Recently
     viewed properties" (auth-gated, same as Homepage's Recently Viewed
     rail), and filters both client-side by name as the user types. That's
     a real, disclosed limitation vs. a true server-side text search — but
     it's honest reuse of what already exists rather than a fake endpoint. */
  // `propertyPool` holds a much larger slice than what's ever shown idle
  // (up to 40, vs. the 6 shown under "Popular Properties") — typed-name
  // matching filters over this whole pool, not just the handful visible
  // when the field is empty. Capping the fetch itself to 8 was the other
  // reason searches for real property names came up empty: a name outside
  // the first 8 items simply had no data to match against.
  const [propertyPool, setPropertyPool] = useState([]);
  const [poolStatus, setPoolStatus] = useState("idle"); // idle | loading | ready | error
  useEffect(() => {
    if (mode !== "property") return;
    let cancelled = false;
    setPoolStatus("loading");
    LoadProperty({
      type: category,
      category: null,
      filters: { ...DEFAULT_FILTERS },
      mapBounds: null,
      location: "",
      date: "",
      guests: "",
    })
      .then((res) => {
        if (cancelled) return;
        const list = (res?.data?.data ?? []).map((it) => normalizeListing(it, category)).slice(0, 40);
        setPropertyPool(list);
        setPoolStatus("ready");
        if (list.length === 0 && process.env.NODE_ENV !== "production") {
          console.warn("[LocationAutoComplete] LoadProperty returned zero properties for category:", category, "— raw response:", res?.data);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setPropertyPool([]);
        setPoolStatus("error");
        if (process.env.NODE_ENV !== "production") {
          console.error("[LocationAutoComplete] LoadProperty request failed:", err?.response?.data ?? err?.message ?? err);
        }
      });
    return () => { cancelled = true; };
  }, [mode, category]);
  const popularListings = propertyPool.slice(0, 6);

  const [recentlyViewed, setRecentlyViewed] = useState([]);
  useEffect(() => {
    if (mode !== "property" || !user) { setRecentlyViewed([]); return; }
    let cancelled = false;
    recent_views()
      .then((res) => { if (!cancelled) setRecentlyViewed((res?.data ?? []).map((it) => normalizeListing(it, category)).slice(0, 6)); })
      .catch(() => { if (!cancelled) setRecentlyViewed([]); });
    return () => { cancelled = true; };
  }, [mode, user, category]);

  const handleSelectProperty = (item) => {
    setQuery(item.name);
    setShow(false);

    const updated = savePropertyRecent(
      { id: item.id, name: item.name, category: item.category, city: item.city, thumb: item.thumb },
      countryCode
    );
    setPropertyRecents(updated);

    onSelectProp?.({
      mode: "property",
      propertyId: item.id,
      propertyName: item.name,
      propertyType: item.category,
      city: item.city,
    });

    if (item.id) {
      router.push(`/${locale}/${country}/search/${item.category || category}/${item.id}`);
    }
  };

  const submitPropertyQuery = (text) => {
    if (!text?.trim()) return;
    setShow(false);
    const updated = savePropertyRecent({ query: text.trim() }, countryCode);
    setPropertyRecents(updated);
    onSelectProp?.({ mode: "property", propertyQuery: text.trim() });
    if (onNext) setTimeout(onNext, 60);
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

  /* ── Theme-aware classes shared by every row ─────────────────── */
  const headCls    = lightDropdown ? "text-gray-400 dark:text-white/30"            : "text-white/30";
  const itemCls     = lightDropdown ? "text-gray-800 dark:text-white"               : "text-white";
  const subCls      = lightDropdown ? "text-gray-400 dark:text-white/40"            : "text-white/40";
  const hoverCls    = lightDropdown ? "hover:bg-gray-50 dark:hover:bg-white/[0.07]" : "hover:bg-white/[0.07]";
  const iconBg      = lightDropdown ? "bg-gray-100 dark:bg-white/[0.08]"            : "bg-white/[0.08]";
  const iconCl      = lightDropdown ? "text-gray-400 dark:text-white/50"            : "text-white/50";
  const divCls      = lightDropdown ? "border-gray-100 dark:border-white/[0.07]"    : "border-white/[0.07]";
  const stickyBg    = lightDropdown
    ? "bg-white dark:bg-[rgba(12,12,18,0.97)]"
    : "bg-[rgba(12,12,18,0.97)]";

  // Mobile sheet (lightDropdown) only: tint-colored icon tiles instead of
  // flat gray, matching the category-tint accents used everywhere else in
  // the app (badges, active states, etc.) instead of reading like a bare
  // form. Desktop's dark glass dropdown is untouched — iconStyle/iconTint
  // stay undefined there, so Row falls back to its original classes.
  const iconStyle = lightDropdown ? { background: tint?.light ?? "rgba(124,58,237,0.10)" } : undefined;
  const iconTint  = lightDropdown ? (tint?.hex ?? "#7c3aed") : undefined;

  const rowProps = { hoverCls, itemCls, subCls, iconBg, iconCl, iconStyle, iconTint };

  /* ── Build the visual groups + a parallel flat list for keyboard nav ── */
  const { groups, flatItems } = useMemo(() => {
    const groups = [];
    let flat = [];
    const typing = query.trim().length >= 2;

    if (mode === "location") {
      if (typing) {
        if (google.length === 0) {
          return { groups: [{ empty: `No results for "${query}"` }], flatItems: [] };
        }
        const items = google.map((place) => ({
          key: place.place_id,
          icon: MapPin,
          primary: place.structured_formatting?.main_text ?? place.description,
          secondary: place.structured_formatting?.secondary_text ?? "",
          onSelect: () => handleSelect(place),
        }));
        groups.push({ header: "Suggestions", kind: "rows", items });
        flat = flat.concat(items);
      } else {
        if (recents.length > 0) {
          const items = recents.map((city) => ({
            key: `recent-${city}`,
            icon: History,
            primary: city,
            onSelect: () => handleSelect(city),
            onRemove: () => { const u = removeRecent(city, countryCode); setRecents(u); },
          }));
          groups.push({ header: "Recent Searches", kind: "rows", items });
          flat = flat.concat(items);
        }

        // Popular Destinations — photo cards only on the mobile sheet
        // (inline mode). Every *popup* variant — including the search
        // page's ListingsSearchBar, which sets lightDropdown={true} for
        // its white bg but is NOT inline — keeps the original plain text
        // rows (same shape as every other row group here: icon + primary
        // + secondary). `inline`, not `lightDropdown`, is what actually
        // means "the mobile embedded sheet".
        const popularItems = inline
          ? popular.map((loc) => ({
              key: `popular-${loc.city}`,
              img: loc.img,
              city: loc.city,
              cardSubtitle: loc.desc,
              onSelect: () => handleSelect(loc.city),
            }))
          : popular.map((loc) => ({
              key: `popular-${loc.city}`,
              icon: MapPin,
              primary: loc.city,
              secondary: loc.desc,
              onSelect: () => handleSelect(loc.city),
            }));
        groups.push({ header: "Popular Destinations", kind: inline ? "cards" : "rows", items: popularItems });
        flat = flat.concat(popularItems);

        // Nearby
        let nearbyItems = [];
        if (nearbyStatus === "granted" && nearbyPlace) {
          nearbyItems = [{
            key: "nearby-resolved",
            icon: LocateFixed,
            primary: nearbyPlace.city,
            secondary: "Near you",
            onSelect: () => handleSelect({ __nearby: true, ...nearbyPlace }),
          }];
        } else if (nearbyStatus === "prompt" || nearbyStatus === "denied" || nearbyStatus === "unsupported") {
          if (nearbyStatus !== "unsupported") {
            nearbyItems = [{
              key: "nearby-prompt",
              icon: LocateFixed,
              primary: "Use current location",
              secondary: nearbyStatus === "denied" ? "Location access denied — tap to try again" : "Find what's around you",
              onSelect: () => fetchNearby(),
            }];
          }
        } else if (nearbyStatus === "checking") {
          nearbyItems = [{
            key: "nearby-checking",
            icon: LocateFixed,
            primary: "Finding your location…",
            onSelect: () => {},
          }];
        }
        if (nearbyItems.length) {
          groups.push({ header: "Nearby", kind: "rows", items: nearbyItems });
          flat = flat.concat(nearbyItems);
        }
      }
      return { groups, flatItems: flat };
    }

    /* ── Property mode ── */
    if (typing) {
      const needle = query.trim().toLowerCase();
      // Match against the FULL fetched pool (up to 40), not just the 6
      // shown idle under "Popular Properties" — otherwise typing a real
      // property name that happens to be item #12 finds nothing.
      const pool = [...recentlyViewed, ...propertyPool];
      const seen = new Set();
      const matches = pool.filter((p) => {
        if (!p.name?.toLowerCase().includes(needle)) return false;
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      }).slice(0, 10);

      if (matches.length === 0) {
        return { groups: [{ empty: `No properties found for "${query}"` }], flatItems: [] };
      }

      // Group by property type when results span more than one category
      // (recentlyViewed can include categories outside the active tab) —
      // matches the spec's "group results by category" request. A single
      // matching category just gets one group headed by its own name
      // instead of a generic "Search Results" label.
      const byCategory = new Map();
      matches.forEach((p) => {
        const label = propertyTypeLabel(p.category) + "s";
        if (!byCategory.has(label)) byCategory.set(label, []);
        byCategory.get(label).push(p);
      });

      byCategory.forEach((group, label) => {
        const items = group.map((p) => ({
          key: `match-${p.id}`,
          icon: propertyTypeIcon(p.category),
          thumb: p.thumb,
          primary: p.name,
          secondary: p.city,
          badge: propertyTypeLabel(p.category),
          onSelect: () => handleSelectProperty(p),
        }));
        groups.push({ header: byCategory.size > 1 ? label : "Search Results", kind: "rows", items });
        flat = flat.concat(items);
      });

      return { groups, flatItems: flat };
    }

    // Empty query — grouped recents/recently-viewed/popular/trending
    if (propertyRecents.length > 0) {
      const items = propertyRecents.map((entry, i) => ({
        key: `prop-recent-${entry.id || entry.query}-${i}`,
        icon: entry.id ? propertyTypeIcon(entry.category) : Search,
        thumb: entry.thumb,
        primary: entry.id ? entry.name : entry.query,
        secondary: entry.id ? entry.city : "Recent search",
        badge: entry.id ? propertyTypeLabel(entry.category) : null,
        onSelect: () => entry.id ? handleSelectProperty(entry) : submitPropertyQuery(entry.query),
        onRemove: () => { const u = removePropertyRecent(entry, countryCode); setPropertyRecents(u); },
      }));
      groups.push({ header: "Recent Searches", kind: "rows", items });
      flat = flat.concat(items);
    }

    if (recentlyViewed.length > 0) {
      const items = recentlyViewed.map((p) => ({
        key: `viewed-${p.id}`,
        icon: propertyTypeIcon(p.category),
        thumb: p.thumb,
        primary: p.name,
        secondary: p.city,
        badge: propertyTypeLabel(p.category),
        onSelect: () => handleSelectProperty(p),
      }));
      groups.push({ header: "Recently Viewed Properties", kind: "rows", items });
      flat = flat.concat(items);
    }

    // Trending Searches — category-flavored chips (Wedding Venues, Weekend
    // Farmstays, ...), not a location or a specific listing. Tapping one
    // submits it as a free-text property query, same as typing it + Enter.
    const trendingItems = getTrending(category).map((label) => ({
      key: `trending-${label}`,
      label,
      onSelect: () => submitPropertyQuery(label),
    }));
    groups.push({ header: "Trending Searches", kind: "chips", items: trendingItems });
    flat = flat.concat(trendingItems);

    if (popularListings.length > 0) {
      const items = popularListings.slice(0, 6).map((p) => ({
        key: `popular-listing-${p.id}`,
        icon: propertyTypeIcon(p.category),
        thumb: p.thumb,
        primary: p.name,
        secondary: p.city,
        badge: propertyTypeLabel(p.category),
        onSelect: () => handleSelectProperty(p),
      }));
      groups.push({ header: "Popular Properties", kind: "rows", items });
      flat = flat.concat(items);
    }

    // Previously, if there was no recent history AND the pool fetch
    // hadn't resolved yet (or genuinely came back empty), this whole
    // panel rendered nothing at all below the mode switch — no loading
    // indicator, no "nothing here" message, just blank space. Trending
    // Searches chips are always present now, so the panel itself is never
    // visually empty — this only covers the genuine failure case (fetch
    // errored) with a small note so that isn't silently invisible.
    if (poolStatus === "error") {
      groups.push({ header: null, kind: "note", items: [{ key: "pool-error", text: "Couldn't load properties right now. Try again in a moment." }] });
    }

    return { groups, flatItems: flat };
  }, [mode, query, google, recents, popular, nearbyStatus, nearbyPlace, propertyRecents, recentlyViewed, propertyPool, poolStatus, countryCode, inline]);

  /* Reset keyboard selection whenever the visible list changes */
  useEffect(() => { setActiveIndex(-1); }, [mode, query, flatItems.length]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        flatItems[activeIndex].onSelect();
      } else if (mode === "property" && query.trim()) {
        submitPropertyQuery(query);
      }
    } else if (e.key === "Escape") {
      setShow(false);
      inputRef.current?.blur();
    }
  };

  /* ── Panel body: mode switch + grouped rows ──────────────────────────
     Built as a plain JSX expression (not a locally-declared component
     function) so it doesn't force a remount of ModeSwitch/Row on every
     parent re-render — see the note on ModeSwitch above for why that
     distinction is what fixed the shaking pill. */
  let runningIndex = 0;
  const panelBody = (
    <>
      <ModeSwitch mode={mode} setMode={setMode} light={lightDropdown} tint={tint} category={category} />
      {groups.map((g, gi) => {
        if (g.empty) {
          return (
            <div key={`empty-${gi}`} className="p-6 text-center">
              <p className={`text-sm ${subCls}`}>{g.empty}</p>
            </div>
          );
        }

        if (g.kind === "note") {
          return (
            <p key={`note-${gi}`} className={`px-4 pb-3 text-xs ${subCls}`}>
              {g.items[0]?.text}
            </p>
          );
        }

        if (g.kind === "cards") {
          return (
            <div key={g.header} className={`pb-3 ${gi < groups.length - 1 ? `border-b ${divCls} mb-1` : ""}`}>
              <p className={`sticky top-0 z-10 text-[9px] font-bold uppercase tracking-widest ${headCls} ${stickyBg} px-4 pb-2 pt-3.5`}>
                {g.header}
              </p>
              <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {g.items.map((item) => {
                  const myIndex = runningIndex++;
                  return (
                    <div key={item.key} className={activeIndex === myIndex ? "rounded-2xl ring-2 ring-offset-2 ring-offset-transparent" : ""} style={activeIndex === myIndex ? { "--tw-ring-color": tint?.hex ?? "#7c3aed" } : undefined}>
                      <DestinationCard img={item.img} city={item.city} subtitle={item.cardSubtitle} onSelect={item.onSelect} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        if (g.kind === "chips") {
          return (
            <div key={g.header} className={`pb-3 ${gi < groups.length - 1 ? `border-b ${divCls} mb-1` : ""}`}>
              <p className={`sticky top-0 z-10 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest ${headCls} ${stickyBg} px-4 pb-2 pt-3.5`}>
                <TrendingUp className="w-3 h-3" />
                {g.header}
              </p>
              <div className="flex flex-wrap gap-2 px-4">
                {g.items.map((item) => {
                  runningIndex++;
                  return (
                    <TrendingChip key={item.key} label={item.label} onSelect={item.onSelect} hoverCls={hoverCls} divCls={divCls} subCls={itemCls} />
                  );
                })}
              </div>
            </div>
          );
        }

        // kind === "rows" (default)
        return (
          <div key={g.header} className={`px-2 pb-2 ${gi < groups.length - 1 ? `border-b ${divCls}` : ""}`}>
            <p className={`sticky top-0 z-10 text-[9px] font-bold uppercase tracking-widest ${headCls} ${stickyBg} px-2 pb-2 pt-3.5`}>
              {g.header}
            </p>
            <AnimatePresence initial={false}>
              {g.items.map((item) => {
                const myIndex = runningIndex++;
                return (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <Row
                      {...rowProps}
                      icon={item.icon}
                      thumb={item.thumb}
                      primary={item.primary}
                      secondary={item.secondary}
                      badge={item.badge}
                      active={activeIndex === myIndex}
                      onSelect={item.onSelect}
                      onRemove={item.onRemove}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );

  const activePlaceholder =
    mode === "property"
      ? categoryPlaceholder(category)
      : (placeholder ?? "Search city, locality or landmark");

  // A leading icon anchors the input visually — previously it was just bare
  // text with no icon anywhere near it (the only icon lived in the parent's
  // collapsed field header, several rows away once expanded). The spec
  // calls for the generic search glyph here regardless of mode ("Large
  // search field ... Tabler Icon: search") — mode-specific iconography
  // (pin / building-type) already lives on every suggestion row instead.
  const LeadingIcon = Search;

  const inputEl = (
    <div className="flex items-center gap-2">
      <LeadingIcon className={`w-4 h-4 shrink-0 ${lightDropdown ? "text-gray-400 dark:text-white/40" : "text-white/40"}`} />
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
          // button already does. Property mode doesn't have an equivalent
          // "selection" concept for free text, so this only applies to
          // Location mode.
          if (val === "" && mode === "location") onSelectProp?.("");
        }}
        onFocus={() => !inline && setShow(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={inline ? true : show}
        aria-autocomplete="list"
        placeholder={activePlaceholder}
        className={`bg-transparent outline-none w-full text-sm ${placeholderClass ?? "placeholder-white/35"} ${textClass ?? "text-white"}`}
      />
      {query && (
        <button
          type="button"
          onClick={() => { setQuery(""); if (mode === "location") onSelectProp?.(""); inputRef.current?.focus(); }}
          className={`transition shrink-0 ${clearClass ?? "text-white/40 hover:text-white/80"}`}
        >
          <X className="w-3.5 h-3.5" />
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
            // No max-h/overflow clipping here — a fixed-height inner
            // scrollbox made the panel feel cramped and inconsistent as
            // the suggestion count changed (Recent Searches, cards,
            // chips...), the opposite of Airbnb's dropdown, which just
            // grows to fit its content. The sheet's own outer content
            // area (`overflow-y-auto` in MobileSearchSheet) is the only
            // scroll container now, so this expands fully instead.
            "mt-2.5 rounded-2xl w-full",
            // A pure white box nested inside the sheet's own white expanded
            // panel (which sits inside a white sheet) had nothing but a
            // hairline border to read as a distinct surface — a soft gray
            // wash gives it actual depth instead of three stacked white
            // boxes. Dark mode keeps the original glass treatment.
            lightDropdown
              ? "bg-gray-50/80 dark:bg-[rgba(12,12,18,0.97)] border border-gray-100 dark:border-white/15"
              : "",
          ].join(" ")}
          style={lightDropdown ? {} : { background: "rgba(12,12,18,0.97)", border: `1px solid ${tintBorder}` }}
        >
          {panelBody}
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
              "absolute top-full mt-1.5 min-w-[340px] max-w-[420px] z-[9999] rounded-2xl overflow-y-auto max-h-[420px]",
              lightDropdown
                ? "bg-white dark:bg-[rgba(12,12,18,0.97)] border border-gray-200 dark:border-white/15 shadow-xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
                : "backdrop-blur-2xl",
            ].join(" ")}
          >
            {panelBody}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
