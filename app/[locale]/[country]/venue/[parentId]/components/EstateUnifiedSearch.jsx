"use client";

import { useState } from "react";
import { Users, IndianRupee, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { CATEGORY_LABELS, getCategoryTheme } from "../utils/estateTheme";

/**
 * Sticky unified search — filters only apply within this estate's own
 * inventory (never leaves the estate). Category, Guests and Price are
 * wired to real client-side filtering of the active category's listings.
 * Availability / Location / Amenities are presented per the spec but are
 * NOT yet wired to real filtering logic — there's no per-listing
 * availability/location/amenity data model to filter against yet. They're
 * left as visible, honest placeholders rather than fake functionality.
 */
export default function EstateUnifiedSearch({
  categoryKeys,
  activeCat,
  onCategoryChange,
  guests,
  onGuestsChange,
  maxPrice,
  onMaxPriceChange,
}) {
  const [openStub, setOpenStub] = useState(null);
  const stubs = [
    { id: "availability", label: "Availability", Icon: CalendarDays },
    { id: "location", label: "Location", Icon: MapPin },
    { id: "amenities", label: "Amenities", Icon: Sparkles },
  ];

  return (
    <div className="sticky top-[80px] md:top-[90px] z-[36] rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-white/[0.08] shadow-sm p-3 sm:p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        {/* Category */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05] overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {categoryKeys.map((key) => {
            const theme = getCategoryTheme(key);
            const isActive = key === activeCat;
            return (
              <button
                key={key}
                onClick={() => onCategoryChange(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive ? `${theme.solid} text-white` : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.06]"
                }`}
              >
                {CATEGORY_LABELS[key] ?? key}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />

        {/* Guests */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07]">
          <Users size={13} className="text-gray-400" />
          <input
            type="number"
            min={0}
            value={guests}
            onChange={(e) => onGuestsChange(Number(e.target.value) || 0)}
            placeholder="Guests"
            className="w-14 bg-transparent text-xs text-gray-700 dark:text-gray-200 outline-none placeholder:text-gray-400"
          />
        </label>

        {/* Price */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07]">
          <IndianRupee size={13} className="text-gray-400" />
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value) || 0)}
            placeholder="Max budget"
            className="w-24 bg-transparent text-xs text-gray-700 dark:text-gray-200 outline-none placeholder:text-gray-400"
          />
        </label>

        {/* Presentational-only stubs */}
        {stubs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setOpenStub((s) => (s === id ? null : id))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07] hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {openStub && (
        <p className="mt-2 px-1 text-[11px] text-gray-400 dark:text-gray-500">
          {stubs.find((s) => s.id === openStub)?.label} filtering is coming in a later update.
        </p>
      )}
    </div>
  );
}
