"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check, X, MapPin, Camera, Star } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";
import { HIGHLIGHTS, MAX_HIGHLIGHTS } from "../../../../components/highlightsConfig";
import { NEARBY_TYPES, MAX_NEARBY } from "../../../../components/nearbyConfig";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY-AWARE COPY
   The actual category OPTIONS shown in the picker below come from the
   `property` prop (real backend data — id/name only, no icon or
   description), not from a hardcoded list here. This just supplies the
   per-property-type page copy; icons for the real options are resolved
   by keyword from ./categoryIcons.js.
───────────────────────────────────────────────────────────────────────────── */
const CATEGORY_COPY = {
  venues: {
    heading:          "Basic Details",
    subtitle:         "Give your venue a compelling name and description that attracts guests.",
    nameLabel:        "Venue Name",
    namePlaceholder:  "e.g. The Grand Coastal Pavilion",
    aboutLabel:       "About the Venue",
    aboutPlaceholder: "Describe the ambience, unique features, and what makes your venue special…",
    categoryLabel:    "Venue Type",
  },
  farmstays: {
    heading:          "Property Details",
    subtitle:         "Tell guests what makes your farmstay unique and memorable.",
    nameLabel:        "Property Name",
    namePlaceholder:  "e.g. Peace Valley Farm Retreat",
    aboutLabel:       "About the Property",
    aboutPlaceholder: "Describe the farm, surroundings, activities, and what makes it a special escape…",
    categoryLabel:    "Property Type",
  },
  studios: {
    heading:          "Studio Details",
    subtitle:         "Describe your studio and what creators can expect.",
    nameLabel:        "Studio Name",
    namePlaceholder:  "e.g. LensBox Photography Studio",
    aboutLabel:       "About the Studio",
    aboutPlaceholder: "Describe the equipment, backdrops, lighting setup, and what sets your studio apart…",
    categoryLabel:    "Studio Type",
  },
  workspaces: {
    heading:          "Space Details",
    subtitle:         "Tell professionals what your workspace offers.",
    nameLabel:        "Space Name",
    namePlaceholder:  "e.g. The Hub Co-working Space",
    aboutLabel:       "About the Space",
    aboutPlaceholder: "Describe the environment, facilities, vibe, and what makes it productive…",
    categoryLabel:    "Space Type",
  },
  rentals: {
    heading:          "Property Details",
    subtitle:         "Tell guests about your rental property.",
    nameLabel:        "Property Name",
    namePlaceholder:  "e.g. Skyline Villa, Bandra West",
    aboutLabel:       "About the Property",
    aboutPlaceholder: "Describe the layout, neighbourhood, features, and why guests will love it…",
    categoryLabel:    "Property Type",
  },
  experiences: {
    heading:          "Experience Details",
    subtitle:         "Describe the experience you offer to guests.",
    nameLabel:        "Experience Name",
    namePlaceholder:  "e.g. Sunrise Hot Air Balloon Ride",
    aboutLabel:       "About the Experience",
    aboutPlaceholder: "Describe what guests will do, see, and feel during this experience…",
    categoryLabel:    "Experience Type",
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
  const descWordCount   = (form?.description || "").trim().split(/\s+/).filter(Boolean).length;

  const touch = (field) => setTouched((p) => ({ ...p, [field]: true }));

  /* "Why Guests Love This Place" — up to MAX_HIGHLIGHTS selling points the
     vendor picks to feature on their public listing page. */
  const highlightOptions = HIGHLIGHTS[category] ?? HIGHLIGHTS.venues;
  const selectedHighlights = form?.highlights || [];
  const highlightsAtMax = selectedHighlights.length >= MAX_HIGHLIGHTS;

  const toggleHighlight = (title) => {
    const isSelected = selectedHighlights.includes(title);
    if (!isSelected && highlightsAtMax) return;
    const next = isSelected
      ? selectedHighlights.filter((t) => t !== title)
      : [...selectedHighlights, title];
    setForm({ ...form, highlights: next });
  };

  /* "Nearby Attractions" — up to MAX_NEARBY real, location-specific places
     the vendor picks a preset TYPE for (Hotel, Airport, Temple, …) and then
     fills in the actual name/distance/travel time themselves. */
  const nearbyOptions  = NEARBY_TYPES[category] ?? NEARBY_TYPES.venues;
  const nearbyPlaces   = form?.nearbyAttractions || [];
  const nearbyAtMax    = nearbyPlaces.length >= MAX_NEARBY;

  const toggleNearbyType = (type) => {
    const isSelected = nearbyPlaces.some((p) => p.type === type);
    if (!isSelected && nearbyAtMax) return;
    const next = isSelected
      ? nearbyPlaces.filter((p) => p.type !== type)
      : [...nearbyPlaces, { type, name: type, distance: "", travel: "", rating: "", image: "" }];
    setForm({ ...form, nearbyAttractions: next });
  };

  const updateNearbyField = (type, field, value) => {
    const next = nearbyPlaces.map((p) => (p.type === type ? { ...p, [field]: value } : p));
    setForm({ ...form, nearbyAttractions: next });
  };

  // Vendor swaps in their own photo of the place instead of the generic
  // type stock image. Client-side preview via object URL now; the raw File
  // travels with the place entry so the save step can upload it.
  const updateNearbyImage = (type, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const next = nearbyPlaces.map((p) => (p.type === type ? { ...p, image: url, imageFile: file } : p));
    setForm({ ...form, nearbyAttractions: next });
  };

  const INPUT_BASE = `
    w-full px-4 py-3 rounded-xl text-[14px] font-medium outline-none transition-all duration-200
    focus:ring-2 ${isDark ? "focus:ring-white/10" : "focus:ring-black/10"}
  `;

  // A background just for these two primary fields — distinct from tk.card/
  // tk.cardAlt (already reused everywhere else in this step) so Name/About
  // read as their own thing instead of blending into plain white.
  const FIELD_BG = isDark ? "#0c1424" : "#f3f4f8";

  const inputStyle = (hasErr) => ({
    background: FIELD_BG,
    border:     `1px solid ${hasErr ? "#f87171" : tk.inputBd}`,
    color:      tk.text,
    boxShadow:  hasErr ? "0 0 0 3px rgba(248,113,113,0.12)" : "none",
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
          style={inputStyle(touched.title && !isTitleValid)}
        />
      </FieldGroup>

      {/* ── Description ── */}
      <FieldGroup
        label={copy.aboutLabel}
        required
        hint={`${descWordCount} / 500 words`}
        error={touched.description && !isDescValid ? "Minimum 10 characters required" : null}
        tk={tk}
        theme={theme}
      >
        <textarea
          value={form?.description || ""}
          onChange={(e) => {
            const val = e.target.value;
            const words = val.trim().split(/\s+/).filter(Boolean);
            if (words.length > 500) {
              // Covers paste (dropping hundreds of words in at once) as well
              // as fast typing that jumps straight past the cap — always
              // truncate to exactly the first 500 words, never further.
              setForm({ ...form, description: words.slice(0, 500).join(" ") });
            } else if (val.length > 6000) {
              // Word count alone can't catch someone growing a single
              // "word" with no spaces into an unbounded blob (word count
              // never moves past whatever it already was) — this hard
              // character ceiling is just a backstop against that, set
              // well above anything 500 real words would ever reach.
              return;
            } else {
              setForm({ ...form, description: val });
            }
          }}
          onBlur={() => touch("description")}
          rows={5}
          placeholder={copy.aboutPlaceholder}
          className={`${INPUT_BASE} resize-none`}
          style={inputStyle(touched.description && !isDescValid)}
        />
      </FieldGroup>

      {/* ── Sub-category picker ── */}
      <FieldGroup
        label={copy.categoryLabel}
        required
        error={touched.category && !isCategoryValid ? "Please select a type" : null}
        tk={tk}
        theme={theme}
      >
        {/* Icon-forward tile grid — light gray tile behind each icon, label
            below. Fixed responsive column counts (tops out at 8/row on
            large screens) instead of auto-fill, so the row count is
            predictable rather than shifting at arbitrary widths. No tick
            badge — the accent ring + label color is the selection cue. */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-5 gap-y-6 mt-2"
          onClick={() => touch("category")}
        >
          {property.map((cat) => {
            const isActive = form?.category == cat.id;
            return (
              <motion.button
                key={cat.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -2 }}
                onClick={() => setForm({ ...form, category: cat.id })}
                className="flex flex-col items-center gap-2 text-center cursor-pointer"
              >
                <div
                  className="relative w-full aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-200"
                  style={{
                    background: tk.trackBg,
                    boxShadow: isActive ? `0 0 0 2px ${theme.accent}` : `0 0 0 1px ${tk.border}`,
                  }}
                >
                  {cat.icon && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${cat.icon}`}
                      alt=""
                      className="w-[72%] h-[72%] object-contain"
                    />
                  )}
                </div>

                <span className="text-[12.5px] font-semibold truncate w-full" style={{ color: isActive ? theme.accent : tk.text }}>
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </FieldGroup>

      {/* ── Property Highlights ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold" style={{ color: tk.text }}>
            Why Guests Love This Place
          </label>
          <span className="text-[11px] tabular-nums" style={{ color: highlightsAtMax ? theme.accent : tk.dimmed }}>
            {selectedHighlights.length} / {MAX_HIGHLIGHTS}
          </span>
        </div>
        <p className="text-[12px] -mt-1" style={{ color: tk.muted }}>
          Pick up to {MAX_HIGHLIGHTS} standout features to show first on your public listing page.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 mt-2">
          {highlightOptions.map((h) => {
            const isActive = selectedHighlights.includes(h.title);
            const disabled = !isActive && highlightsAtMax;
            const HIcon = h.Icon;

            return (
              <button
                key={h.title}
                type="button"
                onClick={() => toggleHighlight(h.title)}
                disabled={disabled}
                className="relative flex flex-col items-start gap-2 text-left p-3 rounded-2xl transition-all duration-150"
                style={{
                  background: isActive ? tk.trackBg : tk.cardAlt,
                  border: isActive ? `1.5px solid ${isDark ? "#ffffff" : "#0f172a"}` : `1px solid ${tk.border}`,
                  opacity: disabled ? 0.45 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                {isActive && (
                  <span
                    className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: isDark ? "#ffffff" : "#0f172a" }}
                  >
                    <Check size={9} strokeWidth={3} style={{ color: isDark ? "#0f172a" : "#ffffff" }} />
                  </span>
                )}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: tk.card }}>
                  <HIcon size={15} style={{ color: tk.text }} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold leading-snug" style={{ color: tk.text }}>
                    {h.title}
                  </p>
                  <p className="text-[10.5px] mt-0.5 leading-snug" style={{ color: tk.muted }}>
                    {h.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Nearby Attractions — plain section, no card wrapper, same
          treatment as "Why Guests Love This Place" above it ── */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: tk.cardAlt, border: `1px solid ${tk.border}` }}>
              <MapPin size={16} style={{ color: tk.text }} />
            </div>
            <div>
              <p className="text-[13.5px] font-bold" style={{ color: tk.text }}>Nearby Attractions</p>
              <p className="text-[12px] mt-0.5" style={{ color: tk.muted }}>
                Pick up to {MAX_NEARBY} nearby places, then add the real name, distance, and drive time for each.
              </p>
            </div>
          </div>
          <span className="text-[11px] tabular-nums shrink-0 mt-1" style={{ color: nearbyAtMax ? theme.accent : tk.dimmed }}>
            {nearbyPlaces.length} / {MAX_NEARBY}
          </span>
        </div>

        {/* Unified cards — before selecting, the card previews all the
            fields (name, rating, distance, drive time) as read-only so
            vendors see what the public card will look like; after
            selecting, those same fields become editable inputs. */}
        {/* items-start: without it, CSS Grid stretches every card in a row
            to match the tallest one — so a selected card (extra input rows)
            was forcing its unselected row-mates to stretch too, distorting
            their photo/panel proportions. Each card now sizes to its own
            content and stays flush at the top. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 mt-2 items-start">
          {nearbyOptions.map((opt) => {
            const place = nearbyPlaces.find((p) => p.type === opt.type);
            const isActive = !!place;
            const disabled = !isActive && nearbyAtMax;
            const TIcon = opt.Icon;

            if (!isActive) {
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => toggleNearbyType(opt.type)}
                  disabled={disabled}
                  className="rounded-2xl overflow-hidden text-left transition-all duration-200"
                  style={{
                    boxShadow: `0 0 0 1px ${tk.border}`,
                    opacity: disabled ? 0.45 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  {/* Photo preview */}
                  <div className="group relative h-24 sm:h-28 overflow-hidden">
                    <img
                      src={opt.defaultImage}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    {/* Just enough dark gradient to keep the type badge
                        legible over the photo — it does NOT reach or match
                        the panel color below, so photo and panel stay two
                        visually distinct sections instead of blending. */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-medium bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                      <TIcon size={9} />
                      {opt.type}
                    </span>
                  </div>

                  {/* Read-only preview of what shows once selected — a clearly
                      separate block below the photo, its own flat background
                      plus a hard divider line, no fade/blend into the image. */}
                  <div className="p-2.5 space-y-1" style={{ background: tk.cardAlt, borderTop: `1px solid ${tk.border}` }}>
                    <p className="text-[11.5px] font-semibold truncate" style={{ color: tk.text }}>
                      {opt.type}
                    </p>
                    <div className="flex items-center gap-2 text-[10px]" style={{ color: tk.muted }}>
                      <span>— km</span>
                      <span>·</span>
                      <span>— min</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Star size={9} /> —</span>
                    </div>
                  </div>
                </button>
              );
            }

            return (
              <div
                key={opt.type}
                className="rounded-2xl overflow-hidden"
                style={{ boxShadow: `0 0 0 1.5px ${isDark ? "#ffffff" : "#0f172a"}` }}
              >
                {/* Photo — swap via camera button, remove via X */}
                <div className="relative h-24 sm:h-28">
                  <img src={place.image || opt.defaultImage} alt="" className="w-full h-full object-cover" />
                  {/* Same subtle legibility-only gradient as the unselected
                      card — not blended into the panel below. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

                  <button
                    type="button"
                    onClick={() => toggleNearbyType(opt.type)}
                    className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm outline-none focus:outline-none focus-visible:outline-none"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <X size={16} style={{ color: "#fff" }} />
                  </button>

                  <label
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                    title="Change photo"
                  >
                    <Camera size={16} style={{ color: "#fff" }} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => updateNearbyImage(opt.type, e.target.files?.[0])}
                    />
                  </label>

                  <span className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-medium bg-black/35 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20">
                    <TIcon size={9} />
                    {opt.type}
                  </span>
                </div>

                {/* Name + rating are fixed display, same as the unselected
                    preview — only Distance, Travel and the photo (via the
                    camera button above) are actually editable. Colors come
                    from the theme tokens, and a hard border (not a gradient
                    fade) keeps this panel visually separate from the photo. */}
                <div className="p-2.5 space-y-1.5" style={{ background: tk.cardAlt, borderTop: `1px solid ${tk.border}` }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11.5px] font-semibold truncate" style={{ color: tk.text }}>
                      {place.name || opt.type}
                    </p>
                    <span className="flex items-center gap-0.5 text-[10px] shrink-0" style={{ color: tk.muted }}>
                      <Star size={9} /> {place.rating || "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={place.distance}
                        onChange={(e) => updateNearbyField(opt.type, "distance", e.target.value)}
                        placeholder="2.1"
                        className="w-full pl-2 pr-6 py-1.5 rounded-md text-[11px] outline-none transition-colors"
                        style={{ background: tk.inputBg, border: `1px solid ${tk.inputBd}`, color: tk.text }}
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none" style={{ color: tk.muted }}>km</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={place.travel}
                        onChange={(e) => updateNearbyField(opt.type, "travel", e.target.value)}
                        placeholder="7"
                        className="w-full pl-2 pr-7 py-1.5 rounded-md text-[11px] outline-none transition-colors"
                        style={{ background: tk.inputBg, border: `1px solid ${tk.inputBd}`, color: tk.text }}
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none" style={{ color: tk.muted }}>min</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FIELD GROUP
───────────────────────────────────────────────────────────────────────────── */
function FieldGroup({ label, required, hint, error, tk, theme, children }) {
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

      {/* Only surfaces an error — a green "All set" confirmation on every
          filled field was firing across nearly the whole form at once. */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
            <AlertCircle size={12} style={{ color: "#f87171" }} />
            <span className="text-[12px]" style={{ color: "#f87171" }}>{error}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
