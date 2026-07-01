"use client";

import { useState } from "react";
import {
  TreePine, Waves, Flame, Leaf, PawPrint, Sunrise,
  Users, Building2, Car, Heart, Coffee, Droplets,
  Mountain, Home, Star, Sparkles, UtensilsCrossed,
  Camera, Music, Laptop, Zap, MapPin, Wind,
  ChevronDown, Mic, Film, Package,
} from "lucide-react";
import { normalizeCategory } from "../../utils/categoryConfig";

// ─── JIT-safe static colour maps ─────────────────────────────────────────────
const ICON_BG = {
  venues:      "bg-violet-100  dark:bg-violet-950/50  text-violet-600  dark:text-violet-400",
  farmstays:   "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
  studios:     "bg-blue-100    dark:bg-blue-950/50    text-blue-600    dark:text-blue-400",
  workspaces:  "bg-amber-100   dark:bg-amber-950/50   text-amber-600   dark:text-amber-400",
  rentals:     "bg-rose-100    dark:bg-rose-950/50    text-rose-600    dark:text-rose-400",
  experiences: "bg-cyan-100    dark:bg-cyan-950/50    text-cyan-600    dark:text-cyan-400",
};

const HOVER_BORDER = {
  venues:      "hover:border-violet-300  dark:hover:border-violet-700",
  farmstays:   "hover:border-emerald-300 dark:hover:border-emerald-700",
  studios:     "hover:border-blue-300    dark:hover:border-blue-700",
  workspaces:  "hover:border-amber-300   dark:hover:border-amber-700",
  rentals:     "hover:border-rose-300    dark:hover:border-rose-700",
  experiences: "hover:border-cyan-300    dark:hover:border-cyan-700",
};

const MORE_BTN = {
  venues:      "text-violet-600  dark:text-violet-400  border-violet-200  dark:border-violet-800  hover:bg-violet-50  dark:hover:bg-violet-950/30",
  farmstays:   "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
  studios:     "text-blue-600    dark:text-blue-400    border-blue-200    dark:border-blue-800    hover:bg-blue-50    dark:hover:bg-blue-950/30",
  workspaces:  "text-amber-600   dark:text-amber-400   border-amber-200   dark:border-amber-800   hover:bg-amber-50   dark:hover:bg-amber-950/30",
  rentals:     "text-rose-600    dark:text-rose-400    border-rose-200    dark:border-rose-800    hover:bg-rose-50    dark:hover:bg-rose-950/30",
  experiences: "text-cyan-600    dark:text-cyan-400    border-cyan-200    dark:border-cyan-800    hover:bg-cyan-50    dark:hover:bg-cyan-950/30",
};

// ─── Highlight data per category — priority ordered ───────────────────────────
// These are SELLING POINTS, not amenities. Kept entirely separate from AmenitiesGrid.
const HIGHLIGHTS = {
  venues: [
    { Icon: Users,           title: "1,000 Guest Capacity",  desc: "Grand scale for any celebration" },
    { Icon: Building2,       title: "Luxury Ballroom",        desc: "Premium air-conditioned main hall" },
    { Icon: Home,            title: "Indoor + Outdoor",       desc: "Versatile setup for all weather" },
    { Icon: Heart,           title: "Bridal Suite",           desc: "Dedicated bridal preparation room" },
    { Icon: Car,             title: "Valet Parking",          desc: "Hassle-free parking for all guests" },
    { Icon: UtensilsCrossed, title: "Multi-Cuisine Catering", desc: "In-house culinary team, curated menus" },
    { Icon: Star,            title: "Heritage Property",      desc: "Colonial-era landmark architecture" },
    { Icon: Sparkles,        title: "Premium Décor",          desc: "Award-winning décor partnerships" },
    { Icon: Wind,            title: "AC Throughout",          desc: "Central air conditioning in all zones" },
    { Icon: MapPin,          title: "Prime City Location",    desc: "Minutes from major transit hubs" },
  ],
  farmstays: [
    { Icon: TreePine,        title: "Entire Estate",          desc: "Exclusive private property for your group" },
    { Icon: Waves,           title: "Private Pool",           desc: "Infinity pool with valley views" },
    { Icon: PawPrint,        title: "Pet Friendly",           desc: "Welcome your furry companions" },
    { Icon: Flame,           title: "Bonfire Area",           desc: "Nightly bonfire under the stars" },
    { Icon: Leaf,            title: "Organic Plantation",     desc: "Fresh-from-the-farm produce daily" },
    { Icon: Sunrise,         title: "Sunrise View",           desc: "Panoramic sunrise vistas from the estate" },
    { Icon: MapPin,          title: "Plantation Walks",       desc: "Guided coffee & spice trails" },
    { Icon: Coffee,          title: "Home Cooked Food",       desc: "Traditional estate meals, local flavours" },
    { Icon: Droplets,        title: "Riverside Access",       desc: "Private access to the river" },
    { Icon: Mountain,        title: "Nature Trails",          desc: "Explore the estate on foot" },
  ],
  studios: [
    { Icon: Camera,          title: "Cyclorama Wall",         desc: "Professional seamless backdrop" },
    { Icon: Zap,             title: "2400W Strobes",          desc: "Studio-grade lighting rig included" },
    { Icon: Mic,             title: "Soundproofed",           desc: "Zero external noise bleed" },
    { Icon: Film,            title: "Green Screen",           desc: "Full chroma key setup" },
    { Icon: Music,           title: "Recording Booth",        desc: "Isolation booth for audio sessions" },
    { Icon: Laptop,          title: "Editing Suite",          desc: "Full DAW workstation included" },
    { Icon: Package,         title: "Prop Room",              desc: "Curated creative prop library" },
    { Icon: Building2,       title: "Private Studio",         desc: "Exclusive access, no shared spaces" },
  ],
  workspaces: [
    { Icon: Zap,             title: "1 Gbps Internet",        desc: "Fibre-fast, always-on connection" },
    { Icon: Building2,       title: "Meeting Rooms",          desc: "Bookable boardrooms & private pods" },
    { Icon: Users,           title: "Up to 40 People",        desc: "Scales from solo to full team" },
    { Icon: Laptop,          title: "Ergonomic Desks",        desc: "Sit-stand desks in quiet zones" },
    { Icon: Coffee,          title: "Free Coffee",            desc: "Unlimited barista-quality coffee" },
    { Icon: MapPin,          title: "Phone Booths",           desc: "Quiet booths for private calls" },
    { Icon: Star,            title: "24/7 Access",            desc: "Work fully on your own schedule" },
    { Icon: Mic,             title: "Podcast Setup",          desc: "AV-ready recording corner" },
  ],
  rentals: [
    { Icon: Zap,             title: "Instant Booking",        desc: "Confirm and receive same day" },
    { Icon: Car,             title: "Delivery Available",     desc: "Delivered straight to your venue" },
    { Icon: Star,            title: "Fully Insured",          desc: "All items covered end-to-end" },
    { Icon: Building2,       title: "Vast Inventory",         desc: "3,000+ items across categories" },
    { Icon: Heart,           title: "Wedding Specialists",    desc: "Curated décor packages" },
    { Icon: Users,           title: "Setup Crew",             desc: "On-site assembly team included" },
    { Icon: Sparkles,        title: "Premium Brands",         desc: "Top-tier equipment only" },
    { Icon: Flame,           title: "Outdoor Gear",           desc: "Tents, stages & PA systems" },
  ],
  experiences: [
    { Icon: MapPin,          title: "Expert Guide",           desc: "Certified local naturalist" },
    { Icon: Mountain,        title: "Off the Beaten Track",   desc: "Routes not on any tourist map" },
    { Icon: Package,         title: "Gear Included",          desc: "All safety equipment provided" },
    { Icon: UtensilsCrossed, title: "Meals Included",         desc: "Regional cuisine throughout the day" },
    { Icon: Car,             title: "Transport Provided",     desc: "Door-to-door group transfers" },
    { Icon: Zap,             title: "Instant Confirmation",   desc: "No waiting, book and go" },
    { Icon: Heart,           title: "Small Groups Only",      desc: "Intimate, never overcrowded" },
    { Icon: Star,            title: "Safety Certified",       desc: "Fully audited for your safety" },
  ],
};

// Show 8 initially; "+N More" reveals the rest
const SHOW_INITIAL = 8;

// ─── Single highlight card ────────────────────────────────────────────────────
function HighlightCard({ Icon, title, desc, hoverBorder, iconBg }) {
  return (
    <div
      className={`flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 ${hoverBorder} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default`}
    >
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-none ${iconBg}`}>
        <Icon size={17} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-snug">
          {title}
        </p>
        {desc && (
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
            {desc}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function HeroHighlights({ category }) {
  const key         = normalizeCategory(category);
  const highlights  = HIGHLIGHTS[key]    ?? HIGHLIGHTS.venues;
  const hoverBorder = HOVER_BORDER[key]  ?? HOVER_BORDER.venues;
  const iconBg      = ICON_BG[key]       ?? ICON_BG.venues;
  const moreBtn     = MORE_BTN[key]      ?? MORE_BTN.venues;

  const [expanded, setExpanded] = useState(false);
  const visible   = expanded ? highlights : highlights.slice(0, SHOW_INITIAL);
  const remaining = highlights.length - SHOW_INITIAL;

  return (
    <div id="highlights" className="border-t border-gray-100 dark:border-gray-800 py-6 sm:py-8">

      {/* Section heading */}
      <div className="mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          Why Guests Love This Place
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          The standout features that set this property apart
        </p>
      </div>

      {/* Cards: 2-col mobile → 3-col sm → 4-col lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {visible.map((h, i) => (
          <HighlightCard
            key={i}
            Icon={h.Icon}
            title={h.title}
            desc={h.desc}
            hoverBorder={hoverBorder}
            iconBg={iconBg}
          />
        ))}
      </div>

      {/* Expand / collapse toggle */}
      {remaining > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`mt-4 flex items-center gap-1.5 text-sm font-medium border rounded-xl px-4 py-2.5 transition-colors ${moreBtn}`}
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Show Less" : `+${remaining} More Highlights`}
        </button>
      )}

    </div>
  );
}
