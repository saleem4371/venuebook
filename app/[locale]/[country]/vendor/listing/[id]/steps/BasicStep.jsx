"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle,
  Building2, Building, Users, BedDouble, Home, Leaf,
  Sprout, Landmark, Waves, Mountain, Trees, Umbrella,
  Camera, Film, Mic2, Music2, Palette, Music,
  Laptop, BookOpen, Globe, Wrench,
  Tent, Heart, ChefHat, Eye,
} from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY-AWARE COPY + SUB-CATEGORIES
   icon: lucide-react component reference
───────────────────────────────────────────────────────────────────────────── */
const CATEGORY_COPY = {
  venues: {
    heading:          "Basic Details",
    subtitle:         "Give your venue a compelling name and description that attracts guests.",
    nameLabel:        "Venue Name",
    namePlaceholder:  "e.g. The Grand Coastal Pavilion",
    aboutLabel:       "About the Venue",
    aboutPlaceholder: "Describe the ambience, unique features, and what makes your venue special…",
    categoryLabel:    "Venue Category",
    categories: [
      { id: "banquet",    name: "Banquet Hall",      icon: Building2, desc: "Grand halls for weddings & galas"   },
      { id: "conference", name: "Conference Center", icon: Users,     desc: "Corporate meetings & summits"        },
      { id: "resort",     name: "Resort",            icon: Umbrella,  desc: "Retreat & leisure experiences"       },
      { id: "hotel",      name: "Hotel",             icon: BedDouble, desc: "Luxury stay & dining packages"       },
      { id: "villa",      name: "Villa",             icon: Home,      desc: "Intimate private celebrations"       },
      { id: "farmhouse",  name: "Farmhouse",         icon: Leaf,      desc: "Open air & nature settings"          },
    ],
  },

  farmstays: {
    heading:          "Property Details",
    subtitle:         "Tell guests what makes your farmstay unique and memorable.",
    nameLabel:        "Property Name",
    namePlaceholder:  "e.g. Peace Valley Farm Retreat",
    aboutLabel:       "About the Property",
    aboutPlaceholder: "Describe the farm, surroundings, activities, and what makes it a special escape…",
    categoryLabel:    "Property Type",
    categories: [
      { id: "organic",   name: "Organic Farm",      icon: Sprout,   desc: "Sustainable & organic produce"     },
      { id: "heritage",  name: "Heritage Estate",   icon: Landmark, desc: "Historical & colonial properties"  },
      { id: "riverside", name: "Riverside",         icon: Waves,    desc: "By the river or lake"              },
      { id: "hilltop",   name: "Hilltop / Valley",  icon: Mountain, desc: "Scenic elevated getaways"          },
      { id: "jungle",    name: "Jungle / Forest",   icon: Trees,    desc: "Surrounded by nature & wildlife"   },
      { id: "coastal",   name: "Coastal",           icon: Umbrella, desc: "Beachside farmstay experience"     },
    ],
  },

  studios: {
    heading:          "Studio Details",
    subtitle:         "Describe your studio and what creators can expect.",
    nameLabel:        "Studio Name",
    namePlaceholder:  "e.g. LensBox Photography Studio",
    aboutLabel:       "About the Studio",
    aboutPlaceholder: "Describe the equipment, backdrops, lighting setup, and what sets your studio apart…",
    categoryLabel:    "Studio Type",
    categories: [
      { id: "photography", name: "Photography",      icon: Camera,  desc: "Professional photo shoots"         },
      { id: "video",       name: "Video / Film",     icon: Film,    desc: "Video production & filming"        },
      { id: "podcast",     name: "Podcast / Audio",  icon: Mic2,    desc: "Recording & broadcasting"          },
      { id: "dance",       name: "Dance / Rehearsal",icon: Music2,  desc: "Dance & performance practice"      },
      { id: "art",         name: "Art Studio",       icon: Palette, desc: "Creative & fine arts work"         },
      { id: "music",       name: "Music Studio",     icon: Music,   desc: "Music recording & production"      },
    ],
  },

  workspaces: {
    heading:          "Space Details",
    subtitle:         "Tell professionals what your workspace offers.",
    nameLabel:        "Space Name",
    namePlaceholder:  "e.g. The Hub Co-working Space",
    aboutLabel:       "About the Space",
    aboutPlaceholder: "Describe the environment, facilities, vibe, and what makes it productive…",
    categoryLabel:    "Space Type",
    categories: [
      { id: "coworking", name: "Co-working",      icon: Laptop,   desc: "Open hot-desk environment"          },
      { id: "private",   name: "Private Office",  icon: Building, desc: "Dedicated enclosed offices"         },
      { id: "meeting",   name: "Meeting Room",    icon: Users,    desc: "Boardrooms & conference rooms"      },
      { id: "training",  name: "Training Room",   icon: BookOpen, desc: "Workshops & seminars"               },
      { id: "virtual",   name: "Virtual Office",  icon: Globe,    desc: "Address & mail services"            },
      { id: "maker",     name: "Maker Space",     icon: Wrench,   desc: "Fabrication & prototyping lab"      },
    ],
  },

  rentals: {
    heading:          "Property Details",
    subtitle:         "Tell guests about your rental property.",
    nameLabel:        "Property Name",
    namePlaceholder:  "e.g. Skyline Villa, Bandra West",
    aboutLabel:       "About the Property",
    aboutPlaceholder: "Describe the layout, neighbourhood, features, and why guests will love it…",
    categoryLabel:    "Property Type",
    categories: [
      { id: "apartment",  name: "Apartment",   icon: Building,  desc: "Compact urban living"                },
      { id: "villa",      name: "Villa",        icon: Home,      desc: "Luxury standalone property"          },
      { id: "bungalow",   name: "Bungalow",     icon: Building2, desc: "Single-storey home"                  },
      { id: "penthouse",  name: "Penthouse",    icon: Landmark,  desc: "Top-floor luxury unit"               },
      { id: "cottage",    name: "Cottage",      icon: Tent,      desc: "Quaint & cosy retreat"               },
      { id: "studio_apt", name: "Studio Flat",  icon: BedDouble, desc: "Compact single-room unit"            },
    ],
  },

  experiences: {
    heading:          "Experience Details",
    subtitle:         "Describe the experience you offer to guests.",
    nameLabel:        "Experience Name",
    namePlaceholder:  "e.g. Sunrise Hot Air Balloon Ride",
    aboutLabel:       "About the Experience",
    aboutPlaceholder: "Describe what guests will do, see, and feel during this experience…",
    categoryLabel:    "Experience Type",
    categories: [
      { id: "adventure",  name: "Adventure",    icon: Mountain, desc: "Outdoor thrills & challenges"       },
      { id: "culinary",   name: "Culinary",      icon: ChefHat,  desc: "Cooking classes & food tours"       },
      { id: "cultural",   name: "Cultural",      icon: Globe,    desc: "Arts, heritage & traditions"        },
      { id: "wellness",   name: "Wellness",      icon: Heart,    desc: "Yoga, spa & mindfulness"            },
      { id: "wildlife",   name: "Wildlife",      icon: Eye,      desc: "Safari & nature encounters"         },
      { id: "water",      name: "Water Sports",  icon: Waves,    desc: "Surfing, kayaking, diving"          },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    card:    isDark ? "#111827"                : "#ffffff",
    cardAlt: isDark ? "#0d1526"               : "#f8fafc",
    border:  isDark ? "rgba(255,255,255,0.09)": "rgba(0,0,0,0.08)",
    text:    isDark ? "#ffffff"               : "#0f172a",
    muted:   isDark ? "#94a3b8"               : "#64748b",
    dimmed:  isDark ? "rgba(255,255,255,0.22)": "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)": "rgba(0,0,0,0.05)",
    inputBg: isDark ? "#0d1526"               : "#ffffff",
    inputBd: isDark ? "rgba(255,255,255,0.10)": "rgba(0,0,0,0.12)",
    shadow:  isDark ? "0 2px 16px rgba(0,0,0,0.40)" : "0 2px 12px rgba(0,0,0,0.07)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function BasicStep({ form, setForm, category = "venues" , property}) {
  console.log(property)
  
  const [isDark, setIsDark] = useState(() => typeof window !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const tk      = tokens(isDark);
  const theme = getCategoryTheme(category);
  const copy    = CATEGORY_COPY[category] ?? CATEGORY_COPY.venues;
  const [touched, setTouched] = useState({});

  const isTitleValid    = (form?.title?.length ?? 0) > 3;
  const isDescValid     = (form?.description?.length ?? 0) > 10;
  const isCategoryValid = !!form?.category;

  const touch = (field) => setTouched((p) => ({ ...p, [field]: true }));

  const INPUT_BASE = `
    w-full px-4 py-3 rounded-xl text-[14px] font-medium outline-none transition-all duration-200
    focus:ring-2 focus:ring-violet-500/20
  `;

  const inputStyle = (hasErr, isValid) => ({
    background: tk.inputBg,
    border:     `1px solid ${hasErr ? "#f87171" : isValid ? "#34d399" : tk.inputBd}`,
    color:      tk.text,
    boxShadow:  hasErr  ? "0 0 0 3px rgba(248,113,113,0.12)"
               : isValid ? "0 0 0 3px rgba(52,211,153,0.12)"
               : "none",
  });

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <h2 className="text-[22px] font-bold leading-tight" style={{ color: tk.text }}>
          {copy.heading}
        </h2>
        <p className="text-[13px] mt-1" style={{ color: tk.muted }}>
          {copy.subtitle}
        </p>
      </div>

      {/* ── Name field ── */}
      <FieldGroup
        label={copy.nameLabel}
        required
        hint={`${form?.title?.length ?? 0} / 50`}
        error={touched.title && !isTitleValid ? "Minimum 4 characters required" : null}
        valid={isTitleValid}
        tk={tk}
        theme={theme}
      >
        <input
          value={form?.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          onBlur={() => touch("title")}
          maxLength={50}
          placeholder={copy.namePlaceholder}
          className={INPUT_BASE}
          style={inputStyle(touched.title && !isTitleValid, isTitleValid)}
        />
      </FieldGroup>

      {/* ── Description ── */}
      <FieldGroup
        label={copy.aboutLabel}
        required
        hint={`${form?.description?.length ?? 0} / 500`}
        error={touched.description && !isDescValid ? "Minimum 10 characters required" : null}
        valid={isDescValid}
        tk={tk}
        theme={theme}
      >
        <textarea
          value={form?.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          onBlur={() => touch("description")}
          maxLength={500}
          rows={5}
          placeholder={copy.aboutPlaceholder}
          className={`${INPUT_BASE} resize-none`}
          style={inputStyle(touched.description && !isDescValid, isDescValid)}
        />
      </FieldGroup>

      {/* ── Sub-category picker ── */}
      <FieldGroup
        label={copy.categoryLabel}
        required
        error={touched.category && !isCategoryValid ? "Please select a type" : null}
        valid={isCategoryValid}
        tk={tk}
        theme={theme}
      >
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-1"
          onClick={() => touch("category")}
        >
          {property.map((cat) => {
            const isActive = form?.category == cat.id;
            const CatIcon  = cat.icon;
            return (
              <motion.button
                key={cat.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setForm({ ...form, category: cat.id })}
                className="relative flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive ? `${theme.ring}0.08)` : tk.cardAlt,
                  border:     `1px solid ${isActive ? `${theme.ring}0.45)` : tk.border}`,
                  boxShadow:  isActive ? `0 0 0 3px ${theme.ring}0.10)` : "none",
                }}
              >
                {/* Check badge */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: theme.accent }}
                    >
                      {/* <Check size={10} strokeWidth={3} style={{ color: "#fff" }} /> */}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SVG icon in pill */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: isActive ? `${theme.ring}0.15)` : tk.trackBg }}
                >
                  {/* <CatIcon size={18} strokeWidth={1.75} style={{ color: isActive ? theme.accent : tk.muted }} /> */}
                </div>

                <span className="text-[13px] font-bold leading-tight" style={{ color: isActive ? theme.accent : tk.text }}>
                  {cat.name}
                </span>
                <span className="text-[11px] leading-snug" style={{ color: isActive ? `${theme.ring}0.75)` : tk.muted }}>
                  {cat.desc}
                </span>
              </motion.button>
            );
          })}
        </div>
      </FieldGroup>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FIELD GROUP
───────────────────────────────────────────────────────────────────────────── */
function FieldGroup({ label, required, hint, error, valid, tk, theme, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-semibold" style={{ color: tk.text }}>
          {label}
          {required && <span className="ml-1" style={{ color: theme.accent }}>*</span>}
        </label>
        {hint && <span className="text-[11px] tabular-nums" style={{ color: tk.dimmed }}>{hint}</span>}
      </div>

      {children}

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
            <AlertCircle size={12} style={{ color: "#f87171" }} />
            <span className="text-[12px]" style={{ color: "#f87171" }}>{error}</span>
          </motion.div>
        ) : valid ? (
          <motion.div key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
            <Check size={12} strokeWidth={3} style={{ color: "#34d399" }} />
            <span className="text-[12px]" style={{ color: "#34d399" }}>All set</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
