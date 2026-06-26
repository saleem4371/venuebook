"use client";

import { useState } from "react";
import {
  Wifi, Snowflake, ParkingSquare, Car, Mic2, Monitor, Zap,
  UtensilsCrossed, Coffee, Waves, Flame, Leaf, Building2, Lock,
  Printer, Film, Camera, Mic, Package, ShieldCheck, Heart,
  ClipboardList, TreePine, Users, CheckCircle2, Phone, Lightbulb,
  Sunrise, Wrench, Truck, MapPin, Clock, BedDouble, Bath, Tv,
  Wind, Star, ChevronDown, ChevronUp,
} from "lucide-react";
import { normalizeCategory } from "../../utils/categoryConfig";

// ─── Comprehensive icon lookup ─────────────────────────────────────────────────
// Any unmatched label falls back to CheckCircle2
const ICON_MAP = {
  // Connectivity
  "High-speed Wi-Fi":      Wifi,
  "High Speed WiFi":       Wifi,
  "Wi-Fi":                 Wifi,
  "WiFi":                  Wifi,
  "1 Gbps Internet":       Zap,
  "Internet":              Wifi,

  // Climate
  "Central AC":            Snowflake,
  "Air Conditioning":      Snowflake,
  "AC":                    Snowflake,
  "Heating":               Wind,
  "Air Cooler":            Wind,

  // Parking / Transport
  "Free Parking":          ParkingSquare,
  "Valet Parking":         Car,
  "Parking":               ParkingSquare,
  "200 Cars Parking":      Car,
  "Paid Parking":          ParkingSquare,

  // AV / Stage
  "Stage & PA System":     Mic2,
  "Stage & AV":            Mic2,
  "AV Equipment":          Monitor,
  "Projector":             Monitor,
  "LED Screen":            Tv,
  "Teleprompter":          Monitor,
  "Editing Suite":         Monitor,

  // Power / Tech
  "Power Backup":          Zap,
  "Electricity Backup":    Zap,
  "Backup Generator":      Zap,
  "24/7 Access":           Lock,

  // Food & Beverage
  "In-house Catering":     UtensilsCrossed,
  "Catering":              UtensilsCrossed,
  "Free Coffee":           Coffee,
  "Coffee & Tea":          Coffee,
  "Fully Equipped Kitchen": UtensilsCrossed,
  "Kitchen":               UtensilsCrossed,
  "BBQ Grill":             Flame,

  // Outdoor & Nature
  "Private Pool":          Waves,
  "Pool":                  Waves,
  "Bonfire Pit":           Flame,
  "Bonfire Area":          Flame,
  "Plantation Trail":      Leaf,
  "Garden":                Leaf,
  "Organic Plantation":    Leaf,
  "Outdoor Area":          TreePine,
  "Entire Estate":         TreePine,
  "Sunrise View":          Sunrise,
  "Pet Friendly":          Heart,

  // Office / Work
  "Meeting Rooms":         Building2,
  "Boardroom":             Building2,
  "Printing Included":     Printer,
  "Whiteboard":            ClipboardList,
  "Whiteboard Walls":      ClipboardList,
  "Phone Booths":          Phone,
  "24/7 Support":          Phone,

  // Studio
  "Photography Setup":     Camera,
  "Soundproofed":          Mic,
  "Green Screen":          Film,
  "Lighting Included":     Lightbulb,
  "Props Available":       Package,

  // Services / Safety
  "Security":              ShieldCheck,
  "ShieldCheck":           ShieldCheck,
  "Staff Available":       Users,
  "Delivery Available":    Truck,
  "Setup Included":        Wrench,
  "Free Cancellation":     CheckCircle2,

  // Accommodation
  "Bridal Suite":          Heart,
  "Bedrooms":              BedDouble,
  "Bathrooms":             Bath,
  "Concierge":             Star,

  // Maps / Location
  "Expert Guide":          MapPin,
  "Flexible Timings":      Clock,
};

function icon(label) {
  return ICON_MAP[label] ?? CheckCircle2;
}

// ─── Category icon accent (static JIT-safe map) ───────────────────────────────
const ICON_ACCENT = {
  venues:      "bg-violet-100  dark:bg-violet-950/50  text-violet-600  dark:text-violet-400",
  farmstays:   "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
  studios:     "bg-blue-100    dark:bg-blue-950/50    text-blue-600    dark:text-blue-400",
  workspaces:  "bg-amber-100   dark:bg-amber-950/50   text-amber-600   dark:text-amber-400",
  rentals:     "bg-rose-100    dark:bg-rose-950/50    text-rose-600    dark:text-rose-400",
  experiences: "bg-cyan-100    dark:bg-cyan-950/50    text-cyan-600    dark:text-cyan-400",
};

const COLLAPSE_AT = 9; // items visible before "show all"

export default function AmenitiesGrid({ amenities = [], category }) {
  const key       = normalizeCategory(category);
  const accent    = ICON_ACCENT[key] ?? ICON_ACCENT.venues;
  const [open, setOpen] = useState(false);

  const visible  = open ? amenities : amenities.slice(0, COLLAPSE_AT);
  const hasMore  = amenities.length > COLLAPSE_AT;

  return (
    <div id="amenities" className="border-t border-gray-100 dark:border-gray-800 pt-8 pb-2">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        What this place offers
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visible.map((label) => {
          const Icon = icon(label);
          return (
            <div
              key={label}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-900 transition-all duration-150"
            >
              <div className={`flex-none w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-5 flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 underline decoration-dotted underline-offset-2 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {open ? (
            <><ChevronUp size={14} /> Show fewer</>
          ) : (
            <><ChevronDown size={14} /> Show all {amenities.length} amenities</>
          )}
        </button>
      )}
    </div>
  );
}
