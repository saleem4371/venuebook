"use client";

import { useState, useEffect } from "react";

import {
  Wifi, Zap, Shield, Camera, Wind, Car, Coffee, Printer, Bell,
  Music, Volume2, Lightbulb, Monitor, Mic, Video, ChefHat, Wine,
  Utensils, Flame, Mountain, Bike, Leaf, Heart, HeartPulse, Star,
  Building, Trees, Shirt, Dumbbell, Package, Waves, Tent,
  PawPrint, Droplets, SlidersHorizontal, Tag, Sun,
  Image, Move, Radio, Layers, Sparkles, ArrowUpDown,
  UserCheck, Flower2, Gamepad2, DoorOpen, PenLine, Tv, Check,
} from "lucide-react";

import { AMENITY_META } from "./config/amenitiesConfig";
import { getAmenties } from "@/services/global.service";

// ─────────────────────────────────────────────────────────────────────────────
// Icon lookup
// ─────────────────────────────────────────────────────────────────────────────

const ICON_MAP = {
  Wifi, Zap, Shield, Camera, Wind, Car, Coffee, Printer, Bell,
  Music, Volume2, Lightbulb, Monitor, Mic, Video, ChefHat, Wine,
  Utensils, Flame, Mountain, Bike, Leaf, Heart, HeartPulse, Star,
  Building, Trees, Shirt, Dumbbell, Package, Waves, Tent,
  PawPrint, Droplets, SlidersHorizontal, Tag, Sun,
  Image, Move, Radio, Layers, Sparkles, ArrowUpDown,
  UserCheck, Flower2, Gamepad2, DoorOpen, PenLine, Tv, Check,
};

function AmenityIcon({ iconName, size = 18 }) {
  const Comp = ICON_MAP[iconName] || Check;
  return <Comp size={size} aria-hidden="true" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// AmenitiesStep
// ─────────────────────────────────────────────────────────────────────────────

export default function AmenitiesStep({
  form,
  updateForm,
  attempted,
}) {

  const selected = form.amenities || [];
  const showError = !!attempted?.amenities && selected.length < 1;

  // API
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    load();
  }, [form.category]);

  const load = async () => {
    try {
      const res = await getAmenties(form.category);

      // 🔥 Merge API data with AMENITY_META
       //
      const mergedData = (res?.data?.data || []).map((group) => ({
        ...group,
        children: (group.children || []).map((item) => {
          const meta = AMENITY_META[item.name] || {};

           

          return {
            ...item,
            icon: meta.icon || "Check",
            color: meta.color || "",
          };
        }),
      }));

      setAmenities(mergedData);
    } catch (err) {
      console.log(err);
    }
  };

  const toggle = (id) => {
    const next = selected.includes(id)
      ? selected.filter((k) => k !== id)
      : [...selected, id];

    updateForm({ amenities: next });
  };

  const totalSelected = selected.length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select all that apply to your property
        </p>

        {totalSelected > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Check size={11} />
            {totalSelected} selected
          </span>
        )}
      </div>

      {/* Error */}
      {showError && (
        <p className="text-xs text-red-500 -mt-4">
          Please select at least one amenity
        </p>
      )}

      {/* Groups */}
      {amenities.map((group) => (
        <div key={group.id}>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            {group.category}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">

            {group.children.map((item) => {

              const checked = selected.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={[
                    "relative flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left",
                    "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                    "text-sm font-medium leading-snug",
                    checked
                      ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-950/20",
                  ].join(" ")}
                >

                  {/* Icon */}
                  <span
                    className={[
                      "flex-shrink-0 transition-colors",
                      checked
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-gray-400 dark:text-gray-500",
                    ].join(" ")}
                  >
                    <AmenityIcon
                      iconName={item.icon}
                      size={17}
                    />
                  </span>

                  {/* Label */}
                  <span className="flex-1 min-w-0 truncate">
                    {item.name}
                  </span>

                  {/* Check */}
                  {checked && (
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center">
                      <Check
                        size={9}
                        strokeWidth={3}
                        className="text-white"
                      />
                    </span>
                  )}

                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Tip: Listings with 8+ amenities get 40% more bookings on average
      </p>

    </div>
  );
}