"use client";

import { useState, useEffect } from "react";
import { AmenitiesSkeleton, useSkeletonDelay } from "./skeletons/index";

// import {
//   Wifi, Zap, Shield, Camera, Wind, Car, Coffee, Printer, Bell,
//   Music, Volume2, Lightbulb, Monitor, Mic, Video, ChefHat, Wine,
//   Utensils, Flame, Mountain, Bike, Leaf, Heart, HeartPulse, Star,
//   Building, Trees, Shirt, Dumbbell, Package, Waves, Tent,
//   PawPrint, Droplets, SlidersHorizontal, Tag, Sun,
//   Image, Move, Radio, Layers, Sparkles, ArrowUpDown,
//   UserCheck, Flower2, Gamepad2, DoorOpen, PenLine, Tv, Check,
//   RefreshCw,
// } from "lucide-react";

import * as Icons from "lucide-react";

import { AMENITY_META, FARMSTAY_FOOD_OPTIONS, FARMSTAY_PARKING_OPTIONS } from "./config/amenitiesConfig";
import { getAmenties } from "@/services/global.service";

// ─────────────────────────────────────────────────────────────────────────────
// Icon lookup
// ─────────────────────────────────────────────────────────────────────────────

// const ICON_MAP = {
//   Wifi, Zap, Shield, Camera, Wind, Car, Coffee, Printer, Bell,
//   Music, Volume2, Lightbulb, Monitor, Mic, Video, ChefHat, Wine,
//   Utensils, Flame, Mountain, Bike, Leaf, Heart, HeartPulse, Star,
//   Building, Trees, Shirt, Dumbbell, Package, Waves, Tent,
//   PawPrint, Droplets, SlidersHorizontal, Tag, Sun,
//   Image, Move, Radio, Layers, Sparkles, ArrowUpDown,
//   UserCheck, Flower2, Gamepad2, DoorOpen, PenLine, Tv, Check,
//   RefreshCw,
// };

// function AmenityIcon({ iconName, size = 18 }) {
//   const Comp = iconName || Check;
//   return <Comp size={iconName} aria-hidden="true" />;
// }
function AmenityIcon({
  iconName,
  size = 18,
  className = "",
}) {
  const Icon = Icons[iconName] || Icons.Circle;

  return <Icon size={size} className={className} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// AmenitiesStep
// ─────────────────────────────────────────────────────────────────────────────

export default function AmenitiesStep({
  form,
  updateForm,
  attempted,
}) {
  const isFarmstay = form.category === "farmstay";

  const selected = form.amenities || [];
  const showError = !!attempted?.amenities && selected.length < 1;

  // API
  const [amenities,  setAmenities]  = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const showSkeleton = useSkeletonDelay(isLoading);

  useEffect(() => {
    load();
  }, [form.category]);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await getAmenties(form.category);

      // Merge API data with AMENITY_META for icon/color metadata
      const mergedData = (res?.data?.data || []).map((group) => ({
        ...group,
        children: (group.children || []).map((item) => {
          const meta = AMENITY_META[item.name] || {};
          return { ...item, color: meta.color || "" };
        }),
      }));

      setAmenities(mergedData);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = (id) => {
    const next = selected.includes(id)
      ? selected.filter((k) => k !== id)
      : [...selected, id];

    updateForm({ amenities: next });
  };

  const totalSelected = selected.length;

  if (showSkeleton) return <AmenitiesSkeleton />;

  return (
    <div className="space-y-8 sk-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select all that apply to your property
        </p>

        {totalSelected > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <AmenityIcon  iconName='Check' />
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
                    {item.svg_icon}
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
                        <AmenityIcon  iconName='Check' size={9}
                        strokeWidth={3}
                        className="text-white"/>
                      
                    </span>
                  )}

                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Farmstay-specific extra sections ── */}
      {/* {isFarmstay && (
        <FarmstayExtraSections form={form} updateForm={updateForm} />
      )} */}

      {/* ── Listing Insight card ── */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/40">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icons.Lightbulb size={16} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-0.5">
            Listing insight
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Properties with 8+ amenities typically receive more enquiries and bookings.
          </p>
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  FarmstayExtraSections
//  Rendered ONLY when category === "farmstay", BELOW the API amenities.
//  Manages: Food Options, Parking, Pets
//  Stored in: form.farmstayFood (array), form.farmstayParking (array),
//             form.farmstayFoodOther (string), form.farmstayPets ('yes'|'no')
// ─────────────────────────────────────────────────────────────────────────────

function ChipToggle({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left",
        "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        "text-sm font-medium leading-snug",
        active
          ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-950/20",
      ].join(" ")}
    >
      <span className="flex-1 min-w-0 truncate">{label}</span>
      {active && (
        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center">
            <AmenityIcon  iconName='Check' size={9}
                        strokeWidth={3}
                        className="text-white"/>
        </span>
      )}
    </button>
  );
}

function RadioGroup({ label, value, onChange }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">{label}</p>
      <div className="flex gap-3">
        {["Yes", "No"].map((opt) => {
          const v = opt.toLowerCase();
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(active ? "" : v)}
              className={[
                "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                active
                  ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-violet-300",
              ].join(" ")}
            >
              <span className={[
                "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                active ? "border-violet-600" : "border-gray-300 dark:border-gray-600",
              ].join(" ")}>
                {active && <span className="w-2 h-2 rounded-full bg-violet-600" />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FarmstayExtraSections({ form, updateForm }) {
  const food    = form.farmstayFood    || [];
  const parking = form.farmstayParking || [];

  const toggleFood = (key) => {
    const next = food.includes(key) ? food.filter((k) => k !== key) : [...food, key];
    updateForm({ farmstayFood: next });
  };
  const toggleParking = (key) => {
    const next = parking.includes(key) ? parking.filter((k) => k !== key) : [...parking, key];
    updateForm({ farmstayParking: next });
  };

  const showFoodOther = food.includes("fs_food_other");

  return (
    <div className="space-y-8">

      {/* ── Food Options ── */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          Food Options
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {FARMSTAY_FOOD_OPTIONS.map((opt) => (
            <ChipToggle
              key={opt.key}
              label={opt.label}
              active={food.includes(opt.key)}
              onClick={() => toggleFood(opt.key)}
            />
          ))}
        </div>
        {showFoodOther && (
          <div className="mt-3">
            <input
              type="text"
              value={form.farmstayFoodOther || ""}
              onChange={(e) => updateForm({ farmstayFoodOther: e.target.value })}
              placeholder="Describe other food option…"
              className={[
                "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900",
                "text-gray-900 dark:text-white text-sm outline-none transition",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
              ].join(" ")}
            />
          </div>
        )}
      </div>

      {/* ── Parking ── */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          Parking
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {FARMSTAY_PARKING_OPTIONS.map((opt) => (
            <ChipToggle
              key={opt.key}
              label={opt.label}
              active={parking.includes(opt.key)}
              onClick={() => toggleParking(opt.key)}
            />
          ))}
        </div>
      </div>

      {/* ── Pets ── */}
      <RadioGroup
        label="Pets allowed?"
        value={form.farmstayPets || ""}
        onChange={(v) => updateForm({ farmstayPets: v })}
      />

    </div>
  );
}