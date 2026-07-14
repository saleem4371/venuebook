"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, Snowflake, ParkingSquare, Car, Mic2, Monitor, Zap,
  UtensilsCrossed, Coffee, Waves, Flame, Leaf, Building2, Lock,
  Printer, Film, Camera, Mic, Package, ShieldCheck, Heart,
  ClipboardList, TreePine, Users, CheckCircle2, Phone, Lightbulb,
  Sunrise, Wrench, Truck, MapPin, Clock, BedDouble, Bath, Tv,
  Wind, Star, X, ChevronRight,
} from "lucide-react";
import { normalizeCategory } from "../../utils/categoryConfig";

// ─── Comprehensive icon lookup ─────────────────────────────────────────────────
const ICON_MAP = {
  "High-speed Wi-Fi":       Wifi,
  "Wi-Fi":                  Wifi,
  "1 Gbps Internet":        Zap,
  "Central AC":             Snowflake,
  "Air Conditioning":       Snowflake,
  "Heating":                Wind,
  "Free Parking":           ParkingSquare,
  "Valet Parking":          Car,
  "200 Cars Parking":       Car,
  "Stage & PA System":      Mic2,
  "Stage & AV":             Mic2,
  "AV Equipment":           Monitor,
  "LED Screen":             Tv,
  "Power Backup":           Zap,
  "24/7 Access":            Lock,
  "In-house Catering":      UtensilsCrossed,
  "Catering":               UtensilsCrossed,
  "Free Coffee":            Coffee,
  "Fully Equipped Kitchen": UtensilsCrossed,
  "BBQ Grill":              Flame,
  "Private Pool":           Waves,
  "Bonfire Pit":            Flame,
  "Plantation Trail":       Leaf,
  "Organic Plantation":     Leaf,
  "Garden":                 Leaf,
  "Pet Friendly":           Heart,
  "Sunrise View":           Sunrise,
  "Entire Estate":          TreePine,
  "Meeting Rooms":          Building2,
  "Printing Included":      Printer,
  "Whiteboard Walls":       ClipboardList,
  "Phone Booths":           Phone,
  "24/7 Support":           Phone,
  "Photography Setup":      Camera,
  "Soundproofed":           Mic,
  "Green Screen":           Film,
  "Lighting Included":      Lightbulb,
  "Editing Suite":          Monitor,
  "Props Available":        Package,
  "Security":               ShieldCheck,
  "Fully Insured":          ShieldCheck,
  "Damage Waiver":          ShieldCheck,
  "Staff Available":        Users,
  "Delivery Available":     Truck,
  "Setup Included":         Wrench,
  "Free Cancellation":      CheckCircle2,
  "Instant Confirmation":   Zap,
  "Bridal Suite":           Heart,
  "Expert Guide":           MapPin,
  "Flexible Timings":       Clock,
  "Gear Included":          Package,
  "Meals Included":         UtensilsCrossed,
  "Transport Provided":     Truck,
  "Dedicated Manager":      Star,
  "Concierge":              Star,
  "Priority Support":       Phone,
};

function getIcon(label) {
  return ICON_MAP[label] ?? CheckCircle2;
}

// ─── Category-owned amenities ──────────────────────────────────────────────────
const AMENITIES = {
  venues: [
    "Central AC", "High-speed Wi-Fi", "Stage & PA System", "AV Equipment",
    "In-house Catering", "Valet Parking", "Power Backup", "Bridal Suite",
    "LED Screen", "Security", "24/7 Support", "Free Parking",
  ],
  farmstays: [
    "Private Pool", "High-speed Wi-Fi", "Central AC", "Fully Equipped Kitchen",
    "Bonfire Pit", "Free Parking", "Power Backup", "Plantation Trail",
    "Pet Friendly", "Organic Plantation", "Sunrise View", "Entire Estate",
    "BBQ Grill", "24/7 Support",
  ],
  studios: [
    "Photography Setup", "Lighting Included", "Green Screen", "Soundproofed",
    "Editing Suite", "Props Available", "High-speed Wi-Fi", "Free Parking",
    "Power Backup", "24/7 Support", "Flexible Timings",
  ],
  workspaces: [
    "1 Gbps Internet", "Free Coffee", "Printing Included", "Meeting Rooms",
    "24/7 Access", "Free Parking", "Whiteboard Walls", "Phone Booths",
    "Power Backup", "Security", "24/7 Support",
  ],
  rentals: [
    "Delivery Available", "Setup Included", "Fully Insured", "Damage Waiver",
    "24/7 Support", "Free Parking", "Power Backup", "Priority Support",
  ],
  experiences: [
    "Expert Guide", "Gear Included", "Meals Included", "Transport Provided",
    "24/7 Support", "Free Cancellation", "Instant Confirmation",
    "Flexible Timings", "Priority Support",
  ],
};

// ─── Category icon accent (JIT-safe static map) ───────────────────────────────
const ICON_ACCENT = {
  venues:      "bg-violet-100  dark:bg-violet-950/50  text-violet-600  dark:text-violet-400",
  farmstays:   "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
  studios:     "bg-blue-100    dark:bg-blue-950/50    text-blue-600    dark:text-blue-400",
  workspaces:  "bg-amber-100   dark:bg-amber-950/50   text-amber-600   dark:text-amber-400",
  rentals:     "bg-rose-100    dark:bg-rose-950/50    text-rose-600    dark:text-rose-400",
  experiences: "bg-cyan-100    dark:bg-cyan-950/50    text-cyan-600    dark:text-cyan-400",
};

// ─── Category-grouped amenities (modal only) ──────────────────────────────────
const AMENITY_GROUPS = {
  venues: [
    { heading: "Climate & Infrastructure", items: ["Central AC", "Power Backup", "Security"] },
    { heading: "Event Setup",              items: ["Stage & PA System", "AV Equipment", "LED Screen"] },
    { heading: "Food & Hospitality",       items: ["In-house Catering", "Bridal Suite", "24/7 Support"] },
    { heading: "Parking & Connectivity",   items: ["Valet Parking", "Free Parking", "High-speed Wi-Fi"] },
  ],
  farmstays: [
    { heading: "Recreation",             items: ["Private Pool", "Bonfire Pit", "BBQ Grill"] },
    { heading: "Nature & Surroundings",  items: ["Plantation Trail", "Organic Plantation", "Sunrise View", "Entire Estate"] },
    { heading: "Comfort & Utilities",    items: ["Central AC", "Power Backup", "High-speed Wi-Fi"] },
    { heading: "Food & Extras",          items: ["Fully Equipped Kitchen", "Pet Friendly", "Free Parking", "24/7 Support"] },
  ],
  studios: [
    { heading: "Production Setup",   items: ["Photography Setup", "Lighting Included", "Green Screen"] },
    { heading: "Recording & Audio",  items: ["Soundproofed", "Editing Suite"] },
    { heading: "Props & Extras",     items: ["Props Available", "High-speed Wi-Fi"] },
    { heading: "Access & Support",   items: ["Free Parking", "Power Backup", "24/7 Support", "Flexible Timings"] },
  ],
  workspaces: [
    { heading: "Connectivity",       items: ["1 Gbps Internet", "Power Backup", "24/7 Access"] },
    { heading: "Facilities",         items: ["Free Coffee", "Printing Included", "Meeting Rooms", "Whiteboard Walls"] },
    { heading: "Comfort & Access",   items: ["Phone Booths", "Free Parking", "Security", "24/7 Support"] },
  ],
  rentals: [
    { heading: "Delivery & Setup",   items: ["Delivery Available", "Setup Included"] },
    { heading: "Protection",         items: ["Fully Insured", "Damage Waiver"] },
    { heading: "Support",            items: ["24/7 Support", "Free Parking", "Power Backup", "Priority Support"] },
  ],
  experiences: [
    { heading: "Guided & Geared",    items: ["Expert Guide", "Gear Included"] },
    { heading: "Food & Transport",   items: ["Meals Included", "Transport Provided"] },
    { heading: "Booking & Support",  items: ["24/7 Support", "Free Cancellation", "Instant Confirmation", "Flexible Timings", "Priority Support"] },
  ],
};

const COLLAPSE_AT = 9;

function AmenityItem({ label, accent }) {
  const Icon = getIcon(label);
  return (
    <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-900 transition-all duration-150">
      <div className={`flex-none w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={15} strokeWidth={1.75} />
      </div>
      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">{label}</span>
    </div>
  );
}

export default function AmenitiesGrid({ category }) {
  const key       = normalizeCategory(category);
  const accent    = ICON_ACCENT[key] ?? ICON_ACCENT.venues;
  const amenities = AMENITIES[key] ?? AMENITIES.venues;
  const groups    = AMENITY_GROUPS[key] ?? AMENITY_GROUPS.venues;
  const [modalOpen, setModalOpen] = useState(false);

  // Disable body scroll while modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  const visible = amenities.slice(0, COLLAPSE_AT);
  const hasMore = amenities.length > COLLAPSE_AT;

  return (
    <div id="amenities" className="border-t border-gray-100 dark:border-gray-800 pt-8 pb-2">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-5 sm:mb-6">
        What this place offers
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visible.map((label) => (
          <AmenityItem key={label} label={label} accent={accent} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setModalOpen(true)}
          className="mt-5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Show all {amenities.length} amenities <ChevronRight size={14} />
        </button>
      )}

      {/* ── All amenities modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[560px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[201] flex flex-col overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-none">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  What this place offers
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal body — scrollable, grouped */}
              <div className="overflow-y-auto px-6 py-5 flex-1 space-y-6">
                {groups.map((group) => (
                  <div key={group.heading}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                      {group.heading}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {group.items.map((label) => (
                        <AmenityItem key={label} label={label} accent={accent} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
