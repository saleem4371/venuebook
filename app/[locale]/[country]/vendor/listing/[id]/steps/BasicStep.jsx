"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

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

  /* Only the error state gets a highlighted border/glow now — a green
     "success" ring on every filled field (regardless of whether the
     vendor is even done editing it) was firing on nearly the whole
     form at once and reading as noise rather than useful feedback. */
  const inputStyle = (hasErr) => ({
    background: tk.inputBg,
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
        hint={`${form?.description?.length ?? 0} / 500`}
        error={touched.description && !isDescValid ? "Minimum 10 characters required" : null}
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
