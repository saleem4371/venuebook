"use client";

import {
  Users, Snowflake, UtensilsCrossed, Camera, Home,
  TreePine, Waves, PawPrint, Flame, Leaf, Sunrise,
  Lightbulb, Film, Mic, Monitor, Package,
  Zap, Coffee, Printer, Building2, Lock, ParkingSquare,
  Truck, ShieldCheck, Wrench, ClipboardList, Phone,
  Clock, Ticket, MapPin, Backpack, Utensils, Bus,
} from "lucide-react";
import { normalizeCategory } from "../../utils/categoryConfig";
import ScrollCarousel from "./ScrollCarousel";

// ─── Static hover classes (must be literal strings for Tailwind JIT) ──────────
const HOVER = {
  venues:      "hover:bg-violet-50  hover:border-violet-200  dark:hover:bg-violet-950/20  dark:hover:border-violet-800",
  farmstays:   "hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-800",
  studios:     "hover:bg-blue-50    hover:border-blue-200    dark:hover:bg-blue-950/20    dark:hover:border-blue-800",
  workspaces:  "hover:bg-amber-50   hover:border-amber-200   dark:hover:bg-amber-950/20   dark:hover:border-amber-800",
  rentals:     "hover:bg-rose-50    hover:border-rose-200    dark:hover:bg-rose-950/20    dark:hover:border-rose-800",
  experiences: "hover:bg-cyan-50    hover:border-cyan-200    dark:hover:bg-cyan-950/20    dark:hover:border-cyan-800",
};

const ICON_COLOR = {
  venues:      "group-hover:text-violet-600  dark:group-hover:text-violet-400",
  farmstays:   "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
  studios:     "group-hover:text-blue-600    dark:group-hover:text-blue-400",
  workspaces:  "group-hover:text-amber-600   dark:group-hover:text-amber-400",
  rentals:     "group-hover:text-rose-600    dark:group-hover:text-rose-400",
  experiences: "group-hover:text-cyan-600    dark:group-hover:text-cyan-400",
};

// ─── Highlight definitions per category ──────────────────────────────────────
// type "ac-badge" renders as a special green/gray availability badge
const HIGHLIGHTS = {
  venues: [
    { Icon: Users,           label: "1,000 Guests",      type: "normal" },
    { Icon: Snowflake,       label: "AC",                 type: "ac-badge", available: true },
    { Icon: UtensilsCrossed, label: "Catering Available", type: "normal" },
    { Icon: Building2,       label: "Convention Hall",    type: "normal" },
    { Icon: Home,            label: "Indoor Venue",       type: "normal" },
    { Icon: ParkingSquare,   label: "Parking Available",  type: "normal" },
  ],
  farmstays: [
    { Icon: TreePine, label: "Entire Estate",      type: "normal" },
    { Icon: Waves,    label: "Private Pool",       type: "normal" },
    { Icon: PawPrint, label: "Pet Friendly",       type: "normal" },
    { Icon: Flame,    label: "Bonfire Pit",        type: "normal" },
    { Icon: Leaf,     label: "Organic Plantation", type: "normal" },
    { Icon: Sunrise,  label: "Sunrise View",       type: "normal" },
  ],
  studios: [
    { Icon: Camera,    label: "Photography Setup",  type: "normal" },
    { Icon: Lightbulb, label: "Lighting Included",  type: "normal" },
    { Icon: Film,      label: "Green Screen",       type: "normal" },
    { Icon: Mic,       label: "Soundproofed",       type: "normal" },
    { Icon: Monitor,   label: "Editing Suite",      type: "normal" },
    { Icon: Package,   label: "Props Available",    type: "normal" },
  ],
  workspaces: [
    { Icon: Zap,           label: "1 Gbps Internet",  type: "normal" },
    { Icon: Coffee,        label: "Free Coffee",       type: "normal" },
    { Icon: Printer,       label: "Printing Included", type: "normal" },
    { Icon: Building2,     label: "Meeting Rooms",     type: "normal" },
    { Icon: Lock,          label: "24/7 Access",       type: "normal" },
    { Icon: ParkingSquare, label: "Free Parking",      type: "normal" },
  ],
  rentals: [
    { Icon: Truck,         label: "Delivery Available", type: "normal" },
    { Icon: Zap,           label: "Instant Booking",    type: "normal" },
    { Icon: ShieldCheck,   label: "Fully Insured",      type: "normal" },
    { Icon: Wrench,        label: "Setup Included",     type: "normal" },
    { Icon: ClipboardList, label: "Damage Waiver",      type: "normal" },
    { Icon: Phone,         label: "24/7 Support",       type: "normal" },
  ],
  experiences: [
    { Icon: Clock,    label: "6 Hour Experience",  type: "normal" },
    { Icon: Ticket,   label: "Instant Confirm",    type: "normal" },
    { Icon: MapPin,   label: "Expert Guide",        type: "normal" },
    { Icon: Backpack, label: "Gear Included",       type: "normal" },
    { Icon: Utensils, label: "Meals Included",      type: "normal" },
    { Icon: Bus,      label: "Transport Provided",  type: "normal" },
  ],
};

export default function HeroHighlights({ category }) {
  const key        = normalizeCategory(category);
  const highlights = HIGHLIGHTS[key] ?? HIGHLIGHTS.venues;
  const hoverClass = HOVER[key]      ?? HOVER.venues;
  const iconClass  = ICON_COLOR[key] ?? ICON_COLOR.venues;
  const isVenue    = key === "venues";

  // ── Render a single pill ──────────────────────────────────────────────────
  const Pill = ({ Icon, label, type, available }, i) => {
    // AC / Non-AC availability badge
    if (type === "ac-badge") {
      return (
        <div
          key={i}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-200 ${
            available
              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
              : "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
          }`}
        >
          <Icon
            size={15}
            strokeWidth={1.75}
            className={available ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}
          />
          <span className={`text-sm font-semibold whitespace-nowrap ${
            available ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"
          }`}>
            {available ? "AC" : "Non-AC"}
          </span>
        </div>
      );
    }

    // Normal pill
    return (
      <div
        key={i}
        className={`flex items-center gap-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl px-4 py-2.5 ${hoverClass} transition-all duration-200 cursor-default group`}
      >
        <Icon
          size={16}
          strokeWidth={1.75}
          className={`flex-none text-gray-400 dark:text-gray-500 ${iconClass} transition-colors`}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {label}
        </span>
      </div>
    );
  };

  const isFarmstay = key === "farmstays";

  // ── Venues + Farmstays: wrap layout (no scroll) ───────────────────────────
  if (isVenue || isFarmstay) {
    return (
      <div className="border-t border-gray-100 dark:border-gray-800 py-4">
        <div className="flex flex-wrap gap-2.5">
          {highlights.map((h, i) => Pill(h, i))}
        </div>
      </div>
    );
  }

  // ── Other categories: horizontal scroll with ScrollCarousel ──────────────
  return (
    <div className="border-t border-gray-100 dark:border-gray-800 py-4">
      <ScrollCarousel className="pb-1">
        <div className="flex gap-2.5 w-max px-1">
          {highlights.map((h, i) => Pill(h, i))}
        </div>
      </ScrollCarousel>
    </div>
  );
}
