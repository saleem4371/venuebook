"use client";

/**
 * QuickFilterChips — Level 1 Quick Filters
 * ─────────────────────────────────────────
 * Emoji + label chips visible directly above listings.
 * Category-aware: each top-level category shows its own chip set.
 * Selecting a chip toggles it in filters.quickFilter array.
 * Does NOT touch existing filter logic — just updates filters.quickFilter.
 */

import { useTranslations } from "next-intl";
import { useCategory } from "@/context/CategoryContext";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

/* ── Per-category chip config ──────────────────────────────────────────── */
const QUICK_CHIPS = {
  venues: [
    { id: "wedding",    emoji: "🎉", key: "wedding" },
    { id: "engagement", emoji: "💍", key: "engagement" },
    { id: "birthday",   emoji: "🎂", key: "birthday" },
    { id: "corporate",  emoji: "🏢", key: "corporate" },
    { id: "graduation", emoji: "🎓", key: "graduation" },
    { id: "religious",  emoji: "🙏", key: "religious" },
    { id: "concert",    emoji: "🎤", key: "concert" },
    { id: "banquet",    emoji: "🍽", key: "banquet" },
  ],
  farmstays: [
    { id: "coconut_farm",  emoji: "🌴", key: "coconut_farm" },
    { id: "riverside",     emoji: "🌊", key: "riverside" },
    { id: "beachfront",    emoji: "🏖", key: "beachfront" },
    { id: "plantation",    emoji: "🌿", key: "plantation" },
    { id: "hill_view",     emoji: "⛰",  key: "hill_view" },
    { id: "bonfire",       emoji: "🔥", key: "bonfire" },
    { id: "pet_friendly",  emoji: "🐶", key: "pet_friendly" },
    { id: "swimming_pool", emoji: "🏊", key: "swimming_pool" },
  ],
  studios: [
    { id: "photography", emoji: "📷", key: "photography_studio" },
    { id: "podcast",     emoji: "🎙",  key: "podcast_studio" },
    { id: "music",       emoji: "🎵", key: "music_studio" },
    { id: "dance",       emoji: "💃", key: "dance_studio" },
    { id: "film",        emoji: "🎬", key: "film_studio" },
  ],
  workspaces: [
    { id: "coworking",       emoji: "🤝", key: "coworking" },
    { id: "private_office",  emoji: "🚪", key: "private_office" },
    { id: "meeting_room",    emoji: "📋", key: "meeting_room" },
    { id: "conference_room", emoji: "🎯", key: "conference_room" },
    { id: "hot_desk",        emoji: "💻", key: "hot_desk" },
    { id: "dedicated_desk",  emoji: "🖥",  key: "dedicated_desk" },
  ],
  rentals: [
    { id: "cars",           emoji: "🚗", key: "cars" },
    { id: "bikes",          emoji: "🏍",  key: "bikes" },
    { id: "furniture",      emoji: "🪑", key: "furniture" },
    { id: "decor",          emoji: "🎨", key: "decor" },
    { id: "sound_equipment",emoji: "🔊", key: "sound_equipment" },
    { id: "generators",     emoji: "⚡", key: "generators" },
  ],
  experiences: [
    { id: "adventure",    emoji: "🧗", key: "adventure" },
    { id: "water_sports", emoji: "🏄", key: "water_sports" },
    { id: "workshops",    emoji: "🛠",  key: "workshops" },
    { id: "tours",        emoji: "🗺",  key: "tours" },
    { id: "camping",      emoji: "⛺", key: "camping" },
    { id: "wellness",     emoji: "🧘", key: "wellness" },
  ],
};

export default function QuickFilterChips({ filters, setFilters }) {
  const t = useTranslations("filter");
  const { activeCategory } = useCategory();

  const chips = QUICK_CHIPS[activeCategory] ?? [];
  if (chips.length === 0) return null;

  const tint   = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const active = filters?.quickFilter ?? [];

  const toggle = (id) => {
    setFilters((prev) => {
      const current = prev.quickFilter ?? [];
      return {
        ...prev,
        quickFilter: current.includes(id)
          ? current.filter((i) => i !== id)
          : [...current, id],
      };
    });
  };

  return (
    <div className="w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <div
        className="flex items-center gap-2 px-4 py-3 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {chips.map((chip) => {
          const isActive = active.includes(chip.id);
          return (
            <button
              key={chip.id}
              onClick={() => toggle(chip.id)}
              className={[
                "flex-shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-full",
                "text-sm font-medium border transition-all duration-200 whitespace-nowrap",
                "select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              ].join(" ")}
              style={
                isActive
                  ? {
                      background: tint.activeBg,
                      borderColor: tint.activeBorder,
                      color: tint.hex,
                      boxShadow: tint.glow,
                    }
                  : {
                      background: "transparent",
                      borderColor: "var(--tw-border, #e5e7eb)",
                      color: "inherit",
                    }
              }
            >
              <span
                className="text-base leading-none"
                aria-hidden="true"
                style={{ filter: isActive ? "none" : "grayscale(0.3)" }}
              >
                {chip.emoji}
              </span>
              <span>{t(chip.key)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
