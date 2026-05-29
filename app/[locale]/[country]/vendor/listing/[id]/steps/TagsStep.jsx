"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Tag, Lightbulb } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";
import { Exo_2 } from "next/font/google";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY-AWARE TAG CONFIG
───────────────────────────────────────────────────────────────────────────── */
const TAG_CONFIG = {
  venues: {
    heading:  "Tags & Discovery",
    subtitle: "Add tags to help guests find your venue for the right occasions.",
    maxTags:  10,
    groups: [
      {
        label: "Event Types",
        items: ["Wedding", "Corporate Event", "Birthday Party", "Anniversary", "Baby Shower", "Product Launch", "Team Outing", "Award Night", "Cocktail Party", "Gala Dinner"],
      },
      {
        label: "Venue Vibe",
        items: ["Luxury", "Rustic", "Modern", "Vintage", "Minimalist", "Industrial", "Garden Party", "Beach Vibes", "Heritage", "Rooftop"],
      },
      {
        label: "Practical",
        items: ["Budget Friendly", "Premium", "Pet Friendly", "Kid Friendly", "Outdoor", "Indoor", "Hybrid", "Fully Air-Conditioned", "Accessible"],
      },
    ],
  },

  farmstays: {
    heading:  "Tags & Discovery",
    subtitle: "Help travellers find your farmstay with the right tags.",
    maxTags:  10,
    groups: [
      {
        label: "Stay Type",
        items: ["Weekend Getaway", "Family Trip", "Couples Retreat", "Solo Travel", "Group Trip", "Workation", "Honeymoon", "Adventure Trip"],
      },
      {
        label: "Nature & Setting",
        items: ["Riverfront", "Mountain View", "Jungle", "Coastal", "Hilltop", "Valley", "Organic Farm", "Heritage Property"],
      },
      {
        label: "Experience",
        items: ["Bonfire Nights", "Stargazing", "Trekking", "Bird Watching", "Farm-to-Table", "Yoga Retreat", "Off-Grid", "Pet Friendly"],
      },
    ],
  },

  studios: {
    heading:  "Tags & Discovery",
    subtitle: "Help creators and crew find your studio with relevant tags.",
    maxTags:  10,
    groups: [
      {
        label: "Studio Type",
        items: ["Photography Studio", "Video Studio", "Podcast Studio", "Music Studio", "Dance Studio", "Art Studio", "Film Set"],
      },
      {
        label: "Speciality",
        items: ["Product Shoots", "Fashion Shoots", "Portrait Photography", "Music Videos", "Ad Films", "Social Media Content", "Live Streaming", "Recording"],
      },
      {
        label: "Features",
        items: ["Green Screen", "Natural Light", "Blackout", "Soundproof", "High Ceilings", "Multiple Backdrops", "Makeup Artist On-Site"],
      },
    ],
  },

  workspaces: {
    heading:  "Tags & Discovery",
    subtitle: "Help professionals find your workspace with accurate tags.",
    maxTags:  10,
    groups: [
      {
        label: "Space Type",
        items: ["Co-working", "Private Office", "Hot Desk", "Dedicated Desk", "Meeting Room", "Board Room", "Training Room", "Virtual Office"],
      },
      {
        label: "Community",
        items: ["Startup Friendly", "Tech Hub", "Creative Space", "Finance & Legal", "Freelancer Friendly", "Enterprise", "Incubator"],
      },
      {
        label: "Perks",
        items: ["24/7 Access", "Fibre Internet", "Pet Friendly", "Rooftop View", "Café In-house", "Gym Access", "Female Only Floor", "Networking Events"],
      },
    ],
  },

  rentals: {
    heading:  "Tags & Discovery",
    subtitle: "Add tags to attract the right guests to your property.",
    maxTags:  10,
    groups: [
      {
        label: "Stay Type",
        items: ["Short Stay", "Long Stay", "Monthly Rental", "Weekend Break", "Business Travel", "Family Vacation", "Couple Getaway", "Solo Stay"],
      },
      {
        label: "Property Feel",
        items: ["Luxury", "Budget Friendly", "Minimalist", "Homely", "Modern", "Heritage", "Sea View", "City View", "Forest View"],
      },
      {
        label: "Neighbourhood",
        items: ["Near Metro", "Beach Facing", "Near Airport", "Central Location", "Quiet Neighbourhood", "Night Market Nearby", "Safe Area"],
      },
    ],
  },

  experiences: {
    heading:  "Tags & Discovery",
    subtitle: "Help guests find your experience by tagging it accurately.",
    maxTags:  10,
    groups: [
      {
        label: "Experience Type",
        items: ["Adventure", "Culinary", "Cultural", "Wellness", "Wildlife", "Water Sports", "Art & Craft", "Music & Dance", "Educational"],
      },
      {
        label: "Who It's For",
        items: ["Family Friendly", "Couples", "Solo Travellers", "Groups", "Kids", "Seniors", "Beginners", "Advanced"],
      },
      {
        label: "When",
        items: ["Sunrise", "Sunset", "Night", "All Day", "Indoor", "Outdoor", "Seasonal", "Available Year-Round"],
      },
    ],
  },
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
    inputBg: isDark ? "#0d1526"                : "#ffffff",
    inputBd: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)",
  };
}



/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function TagsStep({ form, setForm, category = "venues" , property, event}) {
  const [isDark, setIsDark] = useState(true);
  const [customInput, setCustomInput] = useState("");

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

  const selected = new Set(form.tags || []);
  const atMax    = selected.size >= 2;//config.maxTags;

  const toggle = (tag) => {
    const next = new Set(selected);
    if (next.has(tag)) {
      next.delete(tag);
    } else if (!atMax) {
      next.add(tag);
    }
    setForm({ ...form, tags: Array.from(next) });
  };

  const addCustom = () => {
    const val = customInput.trim();
    if (!val || selected.has(val) || atMax) return;
    setForm({ ...form, tags: [...Array.from(selected), val] });
    setCustomInput("");
  };


  const venueSelected = new Set(form.venue_tags || []);
const eventSelected = new Set(form.event_tags || []);

const venueAtMax = venueSelected.size >= 2;
const eventAtMax = eventSelected.size >= 10;

const toggleVenue = (tag) => {
  const next = new Set(venueSelected);

  if (next.has(tag.id)) {
    next.delete(tag.id);
  } else if (!venueAtMax) {
    next.add(tag.id);
  }

  setForm({
    ...form,
    venue_tags: Array.from(next),
  });
};

const toggleEvent = (tag) => {
  const next = new Set(eventSelected);

  if (next.has(tag.id)) {
    next.delete(tag.id);
  } else if (!eventAtMax) {
    next.add(tag.id);
  }

  setForm({
    ...form,
    event_tags: Array.from(next),
  });
};


const selectedVenueTags = property.filter((x) =>
  (form.venue_tags || []).includes(x.id)
);

const selectedEventTags = event.filter((x) =>
  (form.event_tags || []).includes(x.id)
);

console.log(selectedEventTags)

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
<div className="space-y-4">

  {selectedVenueTags.length > 0 && (
    <div>
      <p className="text-xs mb-2 font-semibold">
        Venue Tags
      </p>

      <div className="flex flex-wrap gap-2">
        {selectedVenueTags.map((tag) => (
          <div
            key={tag.id}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: `${theme.accent}15`,
              color: theme.accent,
              border: `1px solid ${theme.accent}30`,
            }}
          >
            {tag.name}
          </div>
        ))}
      </div>
    </div>
  )}

  {selectedEventTags.length > 0 && (
    <div>
      <p className="text-xs mb-2 font-semibold">
        Event Tags
      </p>

      <div className="flex flex-wrap gap-2">
        {selectedEventTags.map((tag) => (
          <div
            key={tag.id}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              // background: `${theme.ring}15`,
              color: theme.accent,
              border: `1px solid ${theme.ring}30`,
            }}
          >
            {tag.event_name}
          </div>
        ))}
      </div>
    </div>
  )}
</div>
      {/* Selected tags row */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: tk.dimmed }}>
                Selected tags
              </p>
              <span className="text-[11px] font-semibold" style={{ color: atMax ? "#f87171" : theme.accent }}>
                {selected.size} / {config.maxTags}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(selected).map((tag) => (
                <motion.button
                  key={tag.id}
                  type="button"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => toggle(tag)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer"
                  style={{ background: `${theme.ring}0.12)`, border: `1px solid ${theme.ring}0.35)`, color: theme.accent }}
                >
                  <Tag size={10} />
                  {tag.name}
                  <span className="ml-0.5 opacity-60">×</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag Groups */}
      <div className="space-y-3">
  <div className="flex items-center justify-between">
    <p
      className="text-[11px] font-bold uppercase tracking-[0.2em]"
      style={{ color: tk.dimmed }}
    >
      Venue Category
    </p>

    <span
      className="text-[11px] font-semibold"
      style={{
        color: venueAtMax ? "#ef4444" : theme.accent,
      }}
    >
      {venueSelected.size}/2
    </span>
  </div>

  <div className="flex flex-wrap gap-3">
    {property.map((tag) => {
      const isOn = venueSelected.has(tag.id);
      const disabled = !isOn && venueAtMax;

      return (
        <motion.button
          key={tag.id}
          type="button"
          whileTap={!disabled ? { scale: 0.96 } : {}}
          onClick={() => !disabled && toggleVenue(tag)}
          className="relative overflow-hidden px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200"
          style={{
            background: isOn
              ? `linear-gradient(135deg, ${theme.accent}22, ${theme.ring}22)`
              : tk.cardAlt,
            border: `1px solid ${
              isOn ? `${theme.accent}66` : tk.border
            }`,
            color: isOn ? theme.accent : tk.text,
            opacity: disabled ? 0.45 : 1,
          }}
        >
          <div className="flex items-center gap-2">
            {isOn && <Check size={14} strokeWidth={3} />}
            {tag.name}
          </div>
        </motion.button>
      );
    })}
  </div>
</div>
      
      <div className="space-y-3">
  <div className="flex items-center justify-between">
    <p
      className="text-[11px] font-bold uppercase tracking-[0.2em]"
      style={{ color: tk.dimmed }}
    >
      Event Category
    </p>

    <span
      className="text-[11px] font-semibold"
      style={{
        color: eventAtMax ? "#ef4444" : theme.accent,
      }}
    >
      {eventSelected.size}/10
    </span>
  </div>

  <div className="flex flex-wrap gap-3">
    {event.map((tag) => {
      const isOn = eventSelected.has(tag.id);
      const disabled = !isOn && eventAtMax;

      return (
        <motion.button
          key={tag.id}
          type="button"
          whileTap={!disabled ? { scale: 0.96 } : {}}
          onClick={() => !disabled && toggleEvent(tag)}
          className="relative overflow-hidden px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200"
          style={{
            background: isOn
              ? `linear-gradient(135deg, ${theme.accent}18, ${theme.ring}18)`
              : tk.cardAlt,
            border: `1px solid ${
              isOn ? `${theme.accent}55` : tk.border
            }`,
            color: isOn ? theme.accent : tk.text,
            opacity: disabled ? 0.45 : 1,
          }}
        >
          <div className="flex items-center gap-2">
            {isOn && <Check size={14} strokeWidth={3} />}
            {tag.event_name}
          </div>
        </motion.button>
      );
    })}
  </div>
</div>

      {/* Custom tag input */}
      {/* <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: tk.dimmed }}>
          Add custom tag
        </p>
        <div className="flex gap-2">
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            placeholder="e.g. Heritage property, EV Charging..."
            disabled={atMax}
            className="flex-1 px-4 py-3 rounded-xl text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-violet-500/20"
            style={{
              background: tk.inputBg,
              border:     `1px solid ${tk.inputBd}`,
              color:      tk.text,
              opacity:    atMax ? 0.5 : 1,
            }}
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={addCustom}
            disabled={!customInput.trim() || atMax}
            className="px-5 py-3 rounded-xl text-[13px] font-semibold text-white transition-opacity"
            style={{
              background: theme.gradient,
              opacity: (!customInput.trim() || atMax) ? 0.5 : 1,
              cursor:  (!customInput.trim() || atMax) ? "not-allowed" : "pointer",
            }}
          >
            Add
          </motion.button>
        </div>
      </div> */}

      {/* Max limit hint */}
      {atMax && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[12px]"
          style={{ color: "#f87171" }}
        >
          Maximum {config.maxTags} tags reached. Remove a tag to add a new one.
        </motion.p>
      )}

      {/* Bottom hint */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: tk.dimmed }}>
        <Lightbulb size={11} style={{ color: theme.accent }} />
        Well-tagged listings appear in more searches and get discovered faster.
      </div>
    </div>
  );
}
