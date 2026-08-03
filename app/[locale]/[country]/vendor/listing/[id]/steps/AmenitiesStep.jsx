"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import * as Icons from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY-AWARE COPY
   The actual amenity OPTIONS shown below come from the `amenities` prop
   (real backend data — grouped { category, children: [{ id, name, icon }] },
   where `icon` is a lucide-react component NAME, e.g. "Wifi", "Zap" — same
   convention the start-listing flow's AmenitiesStep already uses). This
   just supplies the per-category page copy.
───────────────────────────────────────────────────────────────────────────── */
const AMENITY_CONFIG = {
  venues:      { heading: "Amenities",                   subtitle: "Select all the facilities and features available at your venue." },
  farmstays:   { heading: "Amenities & Activities",       subtitle: "Let guests know what they can enjoy at your farmstay." },
  studios:     { heading: "Studio Equipment & Facilities",subtitle: "List all gear, equipment, and features available in your studio." },
  workspaces:  { heading: "Workspace Amenities",          subtitle: "What facilities and perks does your workspace offer professionals?" },
  rentals:     { heading: "Property Amenities",           subtitle: "Let guests know what's available in and around your rental." },
  experiences: { heading: "What's Included",              subtitle: "Tell guests what you provide as part of this experience." },
};

/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    cardAlt: isDark ? "#0d1526"                 : "#f8fafc",
    border:  isDark ? "rgba(255,255,255,0.09)"  : "rgba(0,0,0,0.08)",
    text:    isDark ? "#ffffff"                 : "#0f172a",
    muted:   isDark ? "#94a3b8"                 : "#64748b",
    dimmed:  isDark ? "rgba(255,255,255,0.22)"  : "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)"  : "rgba(0,0,0,0.05)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function AmenitiesStep({ form, setForm, category = "venues" , amenities}) {
  const [isDark, setIsDark] = useState(() => typeof window !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const tk     = tokens(isDark);
  const theme = getCategoryTheme(category);
  const config = AMENITY_CONFIG[category] ?? AMENITY_CONFIG.venues;
  const selected = new Set(form.amenities || []);

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setForm({ ...form, amenities: Array.from(next) });
  };

  const apiAmenities = amenities || [];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-[22px] font-bold leading-tight" style={{ color: tk.text }}>
          {config.heading}
        </h2>
        <p className="text-[13px] mt-1" style={{ color: tk.muted }}>
          {config.subtitle}
        </p>
      </div>

      {/* Amenity Groups */}
      <div className="space-y-8">
        {apiAmenities.map((group) => (
          <div key={group.id}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: tk.text }}>
              {group.category}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {(group.children || []).map((item) => {
                const isOn    = selected.has(item.id);
                const ItemIcon = Icons[item.icon] || Icons.Circle;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggle(item.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 cursor-pointer"
                    style={{
                      background: isOn ? `${theme.ring}0.08)` : tk.cardAlt,
                      border:     `1px solid ${isOn ? `${theme.ring}0.40)` : tk.border}`,
                      boxShadow:  isOn ? `0 0 0 2px ${theme.ring}0.08)` : "none",
                    }}
                  >
                    {/* SVG icon pill */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: isOn ? `${theme.ring}0.15)` : tk.trackBg }}
                    >
                      <ItemIcon size={14} strokeWidth={1.75} style={{ color: isOn ? theme.accent : tk.muted }} />
                    </div>

                    <span className="text-[12px] font-medium leading-tight flex-1" style={{ color: isOn ? theme.accent : tk.text }}>
                      {item.name}
                    </span>

                    {/* Check mark */}
                    <AnimatePresence>
                      {isOn && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: theme.accent }}
                        >
                          <Check size={8} strokeWidth={3} style={{ color: "#fff" }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: tk.dimmed }}>
        <Check size={11} style={{ color: theme.accent }} />
        Listings with more amenities receive significantly higher booking rates.
      </div>
    </div>
  );
}
