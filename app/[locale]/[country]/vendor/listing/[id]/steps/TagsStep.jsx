"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Lightbulb } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";
import { getEventTypeIcon } from "./categoryIcons";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY-AWARE TAG CONFIG
   Only heading/subtitle are used — the actual tag OPTIONS come from the
   `property` / `event` props (real backend data), not a hardcoded list.
───────────────────────────────────────────────────────────────────────────── */
const TAG_CONFIG = {
  venues:      { heading: "Tags & Discovery", subtitle: "Add tags to help guests find your venue for the right occasions." },
  farmstays:   { heading: "Tags & Discovery", subtitle: "Help travellers find your farmstay with the right tags." },
  studios:     { heading: "Tags & Discovery", subtitle: "Help creators and crew find your studio with relevant tags." },
  workspaces:  { heading: "Tags & Discovery", subtitle: "Help professionals find your workspace with accurate tags." },
  rentals:     { heading: "Tags & Discovery", subtitle: "Add tags to attract the right guests to your property." },
  experiences: { heading: "Tags & Discovery", subtitle: "Help guests find your experience by tagging it accurately." },
};

/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    cardAlt: isDark ? "#0d1526"                : "#f8fafc",
    border:  isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)",
    text:    isDark ? "#ffffff"                : "#0f172a",
    muted:   isDark ? "#94a3b8"                : "#64748b",
    dimmed:  isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    inputBg: isDark ? "#0d1526"                : "#ffffff",
    inputBd: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)",
  };
}



/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function TagsStep({ form, setForm, category = "venues" , property, event}) {
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
  const config = TAG_CONFIG[category] ?? TAG_CONFIG.venues;

  const venueSelected = new Set(form.venue_tags || []);
  const eventSelected = new Set(form.event_tags || []);

  const venueAtMax = venueSelected.size >= 2;
  const eventAtMax = eventSelected.size >= 10;

  const toggleVenue = (tag) => {
    const next = new Set(venueSelected);
    if (next.has(tag.id)) next.delete(tag.id);
    else if (!venueAtMax) next.add(tag.id);
    setForm({ ...form, venue_tags: Array.from(next) });
  };

  const toggleEvent = (tag) => {
    const next = new Set(eventSelected);
    if (next.has(tag.id)) next.delete(tag.id);
    else if (!eventAtMax) next.add(tag.id);
    setForm({ ...form, event_tags: Array.from(next) });
  };

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

      {/* Venue Category — the grid below is the single source of truth for
          what's selected (accent fill + checkmark), so there's no separate
          "currently selected" pill row repeating the same tags a second
          time above it. */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: tk.text }}>
            Venue Type
          </p>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums"
            style={{
              background: venueAtMax ? "rgba(239,68,68,0.12)" : `${theme.ring}0.12)`,
              color:      venueAtMax ? "#ef4444" : theme.accent,
            }}
          >
            {venueSelected.size}/2
          </span>
        </div>

        {/* Uniform grid cards instead of variable-width wrapped pills —
            keeps rows aligned regardless of how long each tag's name is. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {property.map((tag) => {
            const isOn = venueSelected.has(tag.id);
            const disabled = !isOn && venueAtMax;

            return (
              <motion.button
                key={tag.id}
                type="button"
                whileTap={!disabled ? { scale: 0.96 } : {}}
                onClick={() => !disabled && toggleVenue(tag)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-left transition-all duration-200"
                style={{
                  background: isOn ? `${theme.ring}0.10)` : tk.cardAlt,
                  border: `1px solid ${isOn ? `${theme.accent}66` : tk.border}`,
                  color: isOn ? theme.accent : tk.text,
                  opacity: disabled ? 0.45 : 1,
                }}
              >
                <div
                  className="relative w-6 h-6 rounded-md flex items-center justify-center shrink-0 overflow-visible"
                  style={{ background: isOn ? `${theme.ring}0.18)` : tk.trackBg }}
                >
                  {tag.icon && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${tag.icon}`}
                      alt=""
                      className="w-4 h-4 object-contain"
                    />
                  )}
                  {isOn && (
                    <span
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{ background: theme.accent }}
                    >
                      <Check size={8} strokeWidth={3.5} color="#fff" />
                    </span>
                  )}
                </div>
                <span className="truncate capitalize">{tag.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Event Category */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: tk.text }}>
            Event Category
          </p>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums"
            style={{
              background: eventAtMax ? "rgba(239,68,68,0.12)" : `${theme.ring}0.12)`,
              color:      eventAtMax ? "#ef4444" : theme.accent,
            }}
          >
            {eventSelected.size}/10
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {event.map((tag) => {
            const isOn = eventSelected.has(tag.id);
            const disabled = !isOn && eventAtMax;
            const TagIcon = getEventTypeIcon(tag.event_name);

            return (
              <motion.button
                key={tag.id}
                type="button"
                whileTap={!disabled ? { scale: 0.96 } : {}}
                onClick={() => !disabled && toggleEvent(tag)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-left transition-all duration-200"
                style={{
                  background: isOn ? `${theme.ring}0.10)` : tk.cardAlt,
                  border: `1px solid ${isOn ? `${theme.accent}66` : tk.border}`,
                  color: isOn ? theme.accent : tk.text,
                  opacity: disabled ? 0.45 : 1,
                }}
              >
                <div
                  className="relative w-6 h-6 rounded-md flex items-center justify-center shrink-0 overflow-visible"
                  style={{ background: isOn ? `${theme.ring}0.18)` : tk.trackBg }}
                >
                  <TagIcon size={12} strokeWidth={1.9} style={{ color: isOn ? theme.accent : tk.muted }} />
                  {isOn && (
                    <span
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{ background: theme.accent }}
                    >
                      <Check size={8} strokeWidth={3.5} color="#fff" />
                    </span>
                  )}
                </div>
                <span className="truncate capitalize">{tag.event_name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: tk.dimmed }}>
        <Lightbulb size={11} style={{ color: theme.accent }} />
        Well-tagged listings appear in more searches and get discovered faster.
      </div>
    </div>
  );
}
