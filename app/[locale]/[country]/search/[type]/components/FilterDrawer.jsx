"use client";

/**
 * FilterDrawer — Airbnb-style centered modal with full-screen blur
 * ─────────────────────────────────────────────────────────────────
 * Level 2: Main filter sections visible directly in the modal.
 * Level 3: Collapsible accordion sections.
 *
 * Desktop: centered modal, max-w-2xl, max-h-[90vh], scrollable body
 * Mobile:  full-screen modal sliding up from bottom
 */

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, SlidersHorizontal, Calendar, Wallet, Users, Clock, BookCheck, Building2, Sparkles, Settings2, UtensilsCrossed, Crown, Leaf, Waves, PawPrint, Baby, Tractor, ChefHat, BedDouble, Camera, Zap, Briefcase, Package, Compass, Heart, Mic, Map, GraduationCap, PartyPopper, Wine, Gem, Sun, Sunrise, Sunset, Home, Trees, Layers, Flower2, Theater, Car, Snowflake, Wifi, Battery, DoorOpen, Speaker, Shield, Accessibility, ArrowUpDown, Fish, Apple, Mountain, Sprout, Thermometer, Gamepad2, Flame, Music, Film, Lightbulb, VolumeX, Lock, Video, Laptop, Monitor, Printer, Phone, CalendarDays, CalendarRange, Bike, Armchair, Palette, Tent, MessageSquare, Truck, Timer, Coffee, Tag, Medal, Star, Utensils, Droplets, Infinity } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCategory } from "@/context/CategoryContext";
import { useCurrency } from "@/hooks/useCurrency";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

/* ══════════════════════════════════════════════════════════════
   DEFAULT FILTERS (exported for page.jsx initial state)
   ══════════════════════════════════════════════════════════════ */
const PRICE_MIN_INR = 0;
const PRICE_MAX_INR = 500000;


// Maps option id → Lucide icon component for filter chips
const CHIP_ICONS = {
  // Event types
  wedding: Heart, engagement: Gem, reception: Wine, birthday: PartyPopper,
  corporate: Briefcase, conference: Users, seminar: GraduationCap, workshop: Settings2,
  exhibition: Camera, concert: Mic, religious: Star, graduation: GraduationCap,
  baby_shower: Baby, naming: Baby, farewell: Calendar,
  // Capacity
  "1-50": Users, "50-100": Users, "100-250": Building2, "250-500": Building2,
  "500-1000": Building2, "1000+": Building2,
  // Shift
  morning: Sunrise, afternoon: Sun, evening: Sunset, full_day: Clock,
  // Booking
  instant: Zap, reserve: Calendar, enquiry: MessageSquare,
  // Venue style
  indoor: Home, outdoor: Trees, both: Layers, poolside: Waves,
  garden: Flower2, beachfront: Waves, rooftop: Building2, banquet_hall: UtensilsCrossed,
  auditorium: Theater, convention: Building2,
  // Amenities
  parking: Car, ac: Snowflake, wifi: Wifi, power_backup: Battery,
  green_room: DoorOpen, projector: Monitor, stage: Mic, sound_system: Speaker,
  dining_area: UtensilsCrossed, bridal_room: Heart, valet_parking: Car,
  wheelchair: Accessibility, lift: ArrowUpDown, changing: Settings2, cctv: Camera,
  security: Shield, kids_area: Baby, lawn: Flower2, generator: Zap,
  // Food & catering
  inhouse: ChefHat, outside: Truck, veg: Leaf, non_veg: Utensils,
  alcohol: Wine, no_alcohol: Shield,
  // Loyalty
  gold: Medal, platinum: Star, diamond: Gem, special: Tag,
  // Farmstay type
  coconut: Trees, riverside: Waves, coastal: Waves, coffee: Coffee,
  areca: Leaf, mango: Apple, organic: Sprout, mountain: Mountain,
  // Pool
  swimming: Waves, infinity: Infinity, kids: Baby, jacuzzi: Droplets,
  temp: Thermometer, lifeguard: Shield,
  // Pet
  dogs: PawPrint, cats: PawPrint, play_area: Heart, pet_bed: BedDouble,
  pet_food: Utensils, pet_sit: Heart,
  // Kid-friendly
  indoor_g: Gamepad2, outdoor_g: Heart, kids_pool: Waves, baby_crib: Baby,
  family: Users,
  // Farm experiences
  animals: PawPrint, cow: PawPrint, horse: Compass, fishing: Fish,
  walk: Compass, fruits: Apple, birds: Star, campfire: Flame,
  bbq: Flame, stargazing: Star,
  // Farm food
  self_cook: Flame, chef: ChefHat, trad: Utensils, pure_veg: Leaf,
  seafood: Fish, breakfast: Coffee, half: UtensilsCrossed, full: UtensilsCrossed,
  // Stay type
  entire: Home, cottage: Home, room: DoorOpen, shared: Users,
  luxury: Sparkles, eco: Leaf,
  // Studio type
  photography: Camera, podcast: Mic, music: Music, dance: Music, film: Film,
  // Studio features
  green_screen: Monitor, cyclorama: Layers, lighting: Lightbulb,
  photo_equip: Camera, soundproof: VolumeX,
  // Studio/workspace booking
  hourly: Clock, full: CalendarDays,
  // Workspace type
  coworking: Users, private: Lock, meeting: Video, hot_desk: Laptop, dedicated: Monitor,
  // Workspace features
  "247": Clock, internet: Wifi, printer: Printer, reception: Phone, power: Battery,
  // Workspace/rental booking
  day: CalendarDays, weekly: CalendarRange, monthly: Calendar,
  // Rental categories
  cars: Car, bikes: Bike, furniture: Armchair, decor: Palette,
  lighting: Lightbulb, sound: Speaker, generators: Zap, photo: Camera,
  projectors: Monitor, delivery: Truck, pickup: Package, instant_r: Zap,
  // Quick chip specific ids
  coconut_farm: Trees, plantation: Leaf, hill_view: Mountain, bonfire: Flame,
  pet_friendly: PawPrint, swimming_pool: Waves, banquet: UtensilsCrossed,
  private_office: Lock, meeting_room: Video, conference_room: Users,
  dedicated_desk: Monitor, sound_equipment: Speaker,
  water_sports: Waves,
  // Experience types
  adventure: Mountain, water: Waves, workshops: Settings2, tours: Map,
  camping: Tent, photo_walk: Camera, cooking: ChefHat, wellness: Heart, team: Users,
  // Suitability
  couple: Heart, group: Users,
};

export const DEFAULT_FILTERS = {
  category_cards: [], shift: [], booking: [],
  budget:         { min: PRICE_MIN_INR, max: PRICE_MAX_INR },
  quickFilter: [],
  eventType: [], capacity: [], venueStyle: [], amenities: [],
  foodCatering: [], loyaltyPerks: [],
  farmType: [], poolExperience: [], petFriendly: [], kidFriendly: [],
  farmExperiences: [], farmFood: [], stayType: [],
  studioType: [], studioFeatures: [],
  workspaceType: [], workspaceFeatures: [], workspaceBooking: [],
  rentalCategory: [], rentalFeatures: [],
  experienceType: [], suitability: [], expBooking: [],
};

/* ══════════════════════════════════════════════════════════════
   RANGE SLIDER CSS (injected once)
   ══════════════════════════════════════════════════════════════ */
const RANGE_CSS = `
  .vb-range { -webkit-appearance:none; appearance:none; background:transparent;
    pointer-events:none; position:absolute; width:100%; height:100%; margin:0; }
  .vb-range::-webkit-slider-thumb {
    -webkit-appearance:none; appearance:none; pointer-events:all;
    width:22px; height:22px; border-radius:50%; cursor:grab;
    border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.18);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .vb-range::-webkit-slider-thumb:hover { transform:scale(1.12); }
  .vb-range::-webkit-slider-thumb:active { cursor:grabbing; transform:scale(1.2); box-shadow:0 4px 16px rgba(0,0,0,0.22); }
  .vb-range::-moz-range-thumb {
    pointer-events:all; width:22px; height:22px; border-radius:50%; cursor:grab;
    border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.18);
  }
`;

/* ══════════════════════════════════════════════════════════════
   QUICK FILTER CHIPS (Level 1 — now lives inside the modal)
   ══════════════════════════════════════════════════════════════ */
const QUICK_CHIPS = {
  venues: [
    { id: "wedding", label: "Wedding" },
    { id: "engagement", label: "Engagement" },
    { id: "birthday", label: "Birthday" },
    { id: "corporate", label: "Corporate" },
    { id: "graduation", label: "Graduation" },
    { id: "religious", label: "Religious" },
    { id: "concert", label: "Concert" },
    { id: "banquet",  label: "Banquet" },
  ],
  farmstays: [
    { id: "coconut_farm", label: "Coconut Farm" },
    { id: "riverside", label: "Riverside" },
    { id: "beachfront",  label: "Beachfront" },
    { id: "plantation", label: "Plantation" },
    { id: "hill_view",  label: "Hill View" },
    { id: "bonfire", label: "Bonfire" },
    { id: "pet_friendly", label: "Pet Friendly" },
    { id: "swimming_pool", label: "Swimming Pool" },
  ],
  studios: [
    { id: "photography", label: "Photography" },
    { id: "podcast",  label: "Podcast" },
    { id: "music", label: "Music" },
    { id: "dance", label: "Dance" },
    { id: "film", label: "Film" },
  ],
  workspaces: [
    { id: "coworking", label: "Coworking" },
    { id: "private_office", label: "Private Office" },
    { id: "meeting_room", label: "Meeting Room" },
    { id: "conference_room", label: "Conference Room" },
    { id: "hot_desk", label: "Hot Desk" },
    { id: "dedicated_desk",  label: "Dedicated Desk" },
  ],
  rentals: [
    { id: "cars", label: "Cars" },
    { id: "bikes",  label: "Bikes" },
    { id: "furniture", label: "Furniture" },
    { id: "decor", label: "Decor" },
    { id: "sound_equipment", label: "Sound Equipment" },
    { id: "generators", label: "Generators" },
  ],
  experiences: [
    { id: "adventure", label: "Adventure" },
    { id: "water_sports", label: "Water Sports" },
    { id: "workshops",  label: "Workshops" },
    { id: "tours",  label: "Tours" },
    { id: "camping", label: "Camping" },
    { id: "wellness", label: "Wellness" },
  ],
};

function QuickFilterSection({ category, filters, setFilters, accent }) {
  const chips = QUICK_CHIPS[category] ?? [];
  if (!chips.length) return null;
  const active = filters?.quickFilter ?? [];

  const toggle = (id) =>
    setFilters((prev) => {
      const cur = prev.quickFilter ?? [];
      return {
        ...prev,
        quickFilter: cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id],
      };
    });

  return (
    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <Sparkles size={13} className="text-gray-500 dark:text-gray-400" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Quick Filters
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isActive = active.includes(chip.id);
          return (
            <button
              key={chip.id}
              onClick={() => toggle(chip.id)}
              className={[
                "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full",
                "text-[12px] font-medium border transition-all duration-150 select-none",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                isActive ? "shadow-sm" : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-700",
              ].join(" ")}
              style={isActive ? { background: accent + "18", borderColor: accent, color: accent, boxShadow: `0 0 0 1px ${accent}` } : {}}
            >
              {CHIP_ICONS[chip.id] && (() => { const QIcon = CHIP_ICONS[chip.id]; return <QIcon size={13} strokeWidth={2} aria-hidden="true" />; })()}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   PRIMITIVES
   ══════════════════════════════════════════════════════════════ */

function Divider() {
  return <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />;
}

function SectionHeader({ children, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && (
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <Icon size={13} className="text-gray-500 dark:text-gray-400" />
        </span>
      )}
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {children}
      </p>
    </div>
  );
}

function Section({ title, icon, children, border = true }) {
  return (
    <div className={`py-5 px-6 ${border ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
      {title && <SectionHeader icon={icon}>{title}</SectionHeader>}
      {children}
    </div>
  );
}

function Accordion({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-5 px-6 text-left group"
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              {(() => { const Icon = icon; return <Icon size={13} className="text-gray-500 dark:text-gray-400" />; })()}
            </span>
          )}
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {title}
          </span>
        </div>
        <span className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-400 group-hover:border-gray-400 transition-colors flex-shrink-0">
          {open
            ? <ChevronUp size={13} strokeWidth={2.5} />
            : <ChevronDown size={13} strokeWidth={2.5} />
          }
        </span>
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  );
}

function Chip({ active, label, icon: Icon, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12px] font-medium",
        "border transition-all duration-150 select-none cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        active
          ? "shadow-sm"
          : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-700 dark:hover:border-gray-300",
      ].join(" ")}
      style={active
        ? { background: accent + "18", borderColor: accent, color: accent, boxShadow: `0 0 0 1px ${accent}` }
        : {}
      }
    >
      {Icon && <Icon size={13} strokeWidth={2} aria-hidden="true" />}
      <span>{label}</span>
    </button>
  );
}

function ChipGroup({ filterKey, options, filters, setFilters, accent }) {
  const toggle = useCallback(
    (id) => {
      setFilters((prev) => {
        const cur = prev[filterKey] ?? [];
        return { ...prev, [filterKey]: cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id] };
      });
    },
    [filterKey, setFilters],
  );
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Chip key={opt.id} label={opt.label} icon={CHIP_ICONS[opt.id]} active={(filters[filterKey] ?? []).includes(opt.id)} onClick={() => toggle(opt.id)} accent={accent} />
      ))}
    </div>
  );
}

/* ── Dual range price slider ─────────────────────────────────────── */
function PriceRange({ filters, setFilters, format, t, accent }) {
  const min = filters?.budget?.min ?? PRICE_MIN_INR;
  const max = filters?.budget?.max ?? PRICE_MAX_INR;
  const minPct = ((min - PRICE_MIN_INR) / (PRICE_MAX_INR - PRICE_MIN_INR)) * 100;
  const maxPct = ((max - PRICE_MIN_INR) / (PRICE_MAX_INR - PRICE_MIN_INR)) * 100;

  const setMin = (v) => setFilters((p) => ({ ...p, budget: { ...p.budget, min: v } }));
  const setMax = (v) => setFilters((p) => ({ ...p, budget: { ...p.budget, max: v } }));

  return (
    <div className="space-y-5">
      {/* Track */}
      <div className="relative h-8 flex items-center select-none">
        {/* Inactive track */}
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-gray-200 dark:bg-gray-700" />
        {/* Active track */}
        <div
          className="absolute h-[3px] rounded-full"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%`, background: accent }}
        />
        {/* Visual thumbs */}
        <div className="absolute w-6 h-6 rounded-full border-[3px] border-white shadow-lg pointer-events-none z-10"
          style={{ left: `calc(${minPct}% - 12px)`, background: accent }} />
        <div className="absolute w-6 h-6 rounded-full border-[3px] border-white shadow-lg pointer-events-none z-10"
          style={{ left: `calc(${maxPct}% - 12px)`, background: accent }} />
        {/* Min input */}
        <input type="range" className="vb-range" min={PRICE_MIN_INR} max={PRICE_MAX_INR} step={1000} value={min}
          onChange={(e) => { const v = Math.min(Number(e.target.value), max - 5000); setMin(v); }}
          style={{ zIndex: min > PRICE_MAX_INR - 10000 ? 5 : 3, "--thumb-color": accent }}
        />
        {/* Max input */}
        <input type="range" className="vb-range" min={PRICE_MIN_INR} max={PRICE_MAX_INR} step={1000} value={max}
          onChange={(e) => { const v = Math.max(Number(e.target.value), min + 5000); setMax(v); }}
          style={{ zIndex: 4, "--thumb-color": accent }}
        />
      </div>

      {/* Value boxes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-900">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-medium">{t("price_min")}</p>
          <p className="text-[13px] font-bold text-gray-900 dark:text-white">{format(min)}</p>
        </div>
        <div className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-900 text-right">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-medium">{t("price_max")}</p>
          <p className="text-[13px] font-bold text-gray-900 dark:text-white">{format(max)}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PER-CATEGORY FILTER PANELS
   ══════════════════════════════════════════════════════════════ */

function VenueFilters({ filters, setFilters, format, t, accent, category }) {
  const F = (key, opts) => <ChipGroup filterKey={key} options={opts} filters={filters} setFilters={setFilters} accent={accent} />;

  const eventTypes = [
    { id: "wedding", label: t("wedding_event") }, { id: "engagement", label: t("engagement_event") },
    { id: "reception", label: t("reception") }, { id: "birthday", label: t("birthday_party") },
    { id: "corporate", label: t("corporate_event") }, { id: "conference", label: t("conference") },
    { id: "seminar", label: t("seminar") }, { id: "workshop", label: t("workshop_event") },
    { id: "exhibition", label: t("exhibition") }, { id: "concert", label: t("concert_event") },
    { id: "religious", label: t("religious_function") }, { id: "graduation", label: t("graduation_event") },
    { id: "baby_shower", label: t("baby_shower") }, { id: "naming", label: t("naming_ceremony") },
    { id: "farewell", label: t("farewell") },
  ];
  const capacities = [
    { id: "1-50", label: t("cap_1_50") }, { id: "50-100", label: t("cap_50_100") },
    { id: "100-250", label: t("cap_100_250") }, { id: "250-500", label: t("cap_250_500") },
    { id: "500-1000", label: t("cap_500_1000") }, { id: "1000+", label: t("cap_1000_plus") },
  ];
  const shifts = [
    { id: "morning", label: t("morning") }, { id: "afternoon", label: t("afternoon") },
    { id: "evening", label: t("evening") }, { id: "full_day", label: t("full_day") },
  ];
  const bookings = [
    { id: "instant", label: t("instant_book") }, { id: "reserve", label: t("reserve_slot") },
    { id: "enquiry", label: t("enquiry_only") },
  ];
  const styles = [
    { id: "indoor", label: t("indoor") }, { id: "outdoor", label: t("outdoor") },
    { id: "both", label: t("indoor_outdoor") }, { id: "poolside", label: t("poolside") },
    { id: "garden", label: t("garden") }, { id: "beachfront", label: t("beachfront") },
    { id: "rooftop", label: t("rooftop") }, { id: "banquet_hall", label: t("banquet_hall") },
    { id: "auditorium", label: t("auditorium") }, { id: "convention", label: t("convention_center") },
  ];
  const amenitiesPopular = [
    { id: "parking", label: t("parking") }, { id: "ac", label: t("ac") },
    { id: "wifi", label: t("wifi") }, { id: "power_backup", label: t("power_backup") },
    { id: "green_room", label: t("green_room") }, { id: "projector", label: t("projector") },
    { id: "stage", label: t("stage") }, { id: "sound_system", label: t("sound_system") },
    { id: "dining_area", label: t("dining_area") }, { id: "bridal_room", label: t("bridal_room") },
    { id: "valet_parking", label: t("valet_parking") },
  ];
  const amenitiesAdv = [
    { id: "wheelchair", label: t("wheelchair_access") }, { id: "lift", label: t("lift") },
    { id: "changing", label: t("changing_rooms") }, { id: "cctv", label: t("cctv") },
    { id: "security", label: t("security") }, { id: "kids_area", label: t("kids_area") },
    { id: "lawn", label: t("outdoor_lawn") }, { id: "generator", label: t("generator") },
  ];
  const food = [
    { id: "inhouse", label: t("inhouse_catering") }, { id: "outside", label: t("outside_catering") },
    { id: "veg", label: t("vegetarian") }, { id: "non_veg", label: t("non_vegetarian") },
    { id: "alcohol", label: t("alcohol_allowed") }, { id: "no_alcohol", label: t("alcohol_not_allowed") },
  ];
  const loyalty = [
    { id: "gold", label: t("gold_perks") }, { id: "platinum", label: t("platinum_perks") },
    { id: "diamond", label: t("diamond_perks") }, { id: "special", label: t("special_offers") },
  ];

  return (
    <>
      <QuickFilterSection category="venues" filters={filters} setFilters={setFilters} accent={accent} />
      <Section title={t("event_type")} icon={Calendar}>{F("eventType", eventTypes)}</Section>
      <Section title={t("price_range")} icon={Wallet}><PriceRange filters={filters} setFilters={setFilters} format={format} t={t} accent={accent} /></Section>
      <Section title={t("guest_capacity")} icon={Users}>{F("capacity", capacities)}</Section>
      <Section title={t("shift")} icon={Clock}>{F("shift", shifts)}</Section>
      <Section title={t("booking_type")} icon={BookCheck}>{F("booking", bookings)}</Section>
      <Section title={t("venue_style")} icon={Building2}>{F("venueStyle", styles)}</Section>
      <Section title={t("amenities")} icon={Sparkles}>{F("amenities", amenitiesPopular)}</Section>
      <Accordion title={`${t("amenities")} — ${t("advanced")}`} icon={Settings2}>{F("amenities", amenitiesAdv)}</Accordion>
      <Section title={t("food_catering")} icon={UtensilsCrossed}>{F("foodCatering", food)}</Section>
      <Accordion title={t("loyalty_perks")} icon={Crown}>{F("loyaltyPerks", loyalty)}</Accordion>
    </>
  );
}

function FarmstayFilters({ filters, setFilters, format, t, accent, category }) {
  const F = (key, opts) => <ChipGroup filterKey={key} options={opts} filters={filters} setFilters={setFilters} accent={accent} />;

  const farmTypes = [
    { id: "coconut", label: t("coconut_plantation") }, { id: "riverside", label: t("riverside_farm") },
    { id: "beachfront", label: t("beachfront_farm") }, { id: "coastal", label: t("coastal_farm") },
    { id: "coffee", label: t("coffee_estate") }, { id: "areca", label: t("areca_plantation") },
    { id: "mango", label: t("mango_orchard") }, { id: "organic", label: t("organic_farm") },
    { id: "mountain", label: t("mountain_farm") },
  ];
  const poolOpts = [
    { id: "swimming", label: t("pool_swimming") }, { id: "infinity", label: t("pool_infinity") },
    { id: "kids", label: t("pool_kids") }, { id: "indoor", label: t("pool_indoor") },
    { id: "outdoor", label: t("pool_outdoor") }, { id: "jacuzzi", label: t("pool_jacuzzi") },
    { id: "temp", label: t("pool_temp_controlled") }, { id: "lifeguard", label: t("pool_lifeguard") },
  ];
  const petOpts = [
    { id: "dogs", label: t("dogs_allowed") }, { id: "cats", label: t("cats_allowed") },
    { id: "play_area", label: t("pet_play_area") }, { id: "pet_bed", label: t("pet_bed") },
    { id: "pet_food", label: t("pet_food_avail") }, { id: "pet_sit", label: t("pet_sitting") },
  ];
  const kidOpts = [
    { id: "play_area", label: t("kids_play_area") }, { id: "indoor_g", label: t("indoor_games") },
    { id: "outdoor_g", label: t("outdoor_games") }, { id: "kids_pool", label: t("kids_pool_area") },
    { id: "baby_crib", label: t("baby_crib") }, { id: "family", label: t("family_friendly") },
  ];
  const expOpts = [
    { id: "animals", label: t("farm_animals") }, { id: "cow", label: t("cow_feeding") },
    { id: "horse", label: t("horse_riding") }, { id: "fishing", label: t("fishing") },
    { id: "walk", label: t("plantation_walk") }, { id: "fruits", label: t("fruit_picking") },
    { id: "birds", label: t("bird_watching") }, { id: "campfire", label: t("campfire") },
    { id: "bbq", label: t("bbq") }, { id: "stargazing", label: t("stargazing") },
  ];
  const foodOpts = [
    { id: "self_cook", label: t("self_cooking") }, { id: "chef", label: t("private_chef") },
    { id: "trad", label: t("traditional_food") }, { id: "pure_veg", label: t("pure_vegetarian") },
    { id: "seafood", label: t("seafood_package") }, { id: "breakfast", label: t("breakfast_included") },
    { id: "half", label: t("half_board") }, { id: "full", label: t("full_board") },
  ];
  const stayOpts = [
    { id: "entire", label: t("entire_farmhouse") }, { id: "cottage", label: t("private_cottage") },
    { id: "room", label: t("private_room") }, { id: "shared", label: t("shared_stay") },
    { id: "luxury", label: t("luxury_farmstay") }, { id: "eco", label: t("eco_farmstay") },
  ];
  const bookings = [
    { id: "instant", label: t("instant_book") }, { id: "enquiry", label: t("enquiry_only") },
  ];
  const loyalty = [
    { id: "gold", label: t("gold_perks") }, { id: "platinum", label: t("platinum_perks") },
    { id: "diamond", label: t("diamond_perks") },
  ];

  return (
    <>
      <QuickFilterSection category="farmstays" filters={filters} setFilters={setFilters} accent={accent} />
      <Section title={t("farmstay_type")} icon={Leaf}>{F("farmType", farmTypes)}</Section>
      <Section title={t("price_range")} icon={Wallet}><PriceRange filters={filters} setFilters={setFilters} format={format} t={t} accent={accent} /></Section>
      <Section title={t("pool_experience")} icon={Waves}>{F("poolExperience", poolOpts)}</Section>
      <Section title={t("pet_friendly")} icon={PawPrint}>{F("petFriendly", petOpts)}</Section>
      <Section title={t("kid_friendly")} icon={Baby}>{F("kidFriendly", kidOpts)}</Section>
      <Section title={t("farm_experiences")} icon={Tractor}>{F("farmExperiences", expOpts)}</Section>
      <Section title={t("stay_type")} icon={BedDouble}>{F("stayType", stayOpts)}</Section>
      <Section title={t("booking_type")} icon={BookCheck}>{F("booking", bookings)}</Section>
      <Accordion title={t("food_experience")} icon={ChefHat}>{F("farmFood", foodOpts)}</Accordion>
      <Accordion title={t("loyalty_perks")}>{F("loyaltyPerks", loyalty)}</Accordion>
    </>
  );
}

function StudioFilters({ filters, setFilters, format, t, accent, category }) {
  const F = (key, opts) => <ChipGroup filterKey={key} options={opts} filters={filters} setFilters={setFilters} accent={accent} />;
  const types = [
    { id: "photography", label: t("photography_studio") }, { id: "podcast", label: t("podcast_studio") },
    { id: "music", label: t("music_studio") }, { id: "dance", label: t("dance_studio") },
    { id: "film", label: t("film_studio") },
  ];
  const features = [
    { id: "green_screen", label: t("green_screen") }, { id: "cyclorama", label: t("cyclorama") },
    { id: "lighting", label: t("lighting_equipment") }, { id: "photo_equip", label: t("photography_equipment") },
    { id: "soundproof", label: t("soundproof") }, { id: "ac", label: t("ac") }, { id: "parking", label: t("parking") },
  ];
  const bookings = [
    { id: "hourly", label: t("hourly_rental") }, { id: "half", label: t("half_day_booking") }, { id: "full", label: t("full_day") },
  ];
  return (
    <>
      <QuickFilterSection category="studios" filters={filters} setFilters={setFilters} accent={accent} />
      <Section title={t("studio_type")} icon={Camera}>{F("studioType", types)}</Section>
      <Section title={t("features")} icon={Zap}>{F("studioFeatures", features)}</Section>
      <Section title={t("booking_type")} icon={BookCheck}>{F("booking", bookings)}</Section>
      <Section title={t("price_range")} icon={Wallet}><PriceRange filters={filters} setFilters={setFilters} format={format} t={t} accent={accent} /></Section>
      <Accordion title={t("loyalty_perks")} icon={Crown}>{F("loyaltyPerks", [
        { id: "gold", label: t("gold_perks") }, { id: "platinum", label: t("platinum_perks") }, { id: "diamond", label: t("diamond_perks") },
      ])}</Accordion>
    </>
  );
}

function WorkspaceFilters({ filters, setFilters, format, t, accent, category }) {
  const F = (key, opts) => <ChipGroup filterKey={key} options={opts} filters={filters} setFilters={setFilters} accent={accent} />;
  const types = [
    { id: "coworking", label: t("coworking") }, { id: "private", label: t("private_office") },
    { id: "meeting", label: t("meeting_room") }, { id: "conference", label: t("conference_room") },
    { id: "hot_desk", label: t("hot_desk") }, { id: "dedicated", label: t("dedicated_desk") },
  ];
  const features = [
    { id: "247", label: t("access_247") }, { id: "internet", label: t("high_speed_internet") },
    { id: "printer", label: t("printer") }, { id: "coffee", label: t("coffee") },
    { id: "parking", label: t("parking") }, { id: "reception", label: t("reception_desk") },
    { id: "power", label: t("power_backup") },
  ];
  const bookings = [
    { id: "day", label: t("day_pass") }, { id: "weekly", label: t("weekly_pass") }, { id: "monthly", label: t("monthly_pass") },
  ];
  return (
    <>
      <QuickFilterSection category="workspaces" filters={filters} setFilters={setFilters} accent={accent} />
      <Section title={t("workspace_type")} icon={Briefcase}>{F("workspaceType", types)}</Section>
      <Section title={t("features")} icon={Zap}>{F("workspaceFeatures", features)}</Section>
      <Section title={t("booking_type")} icon={BookCheck}>{F("workspaceBooking", bookings)}</Section>
      <Section title={t("price_range")} icon={Wallet}><PriceRange filters={filters} setFilters={setFilters} format={format} t={t} accent={accent} /></Section>
      <Accordion title={t("loyalty_perks")} icon={Crown}>{F("loyaltyPerks", [
        { id: "gold", label: t("gold_perks") }, { id: "platinum", label: t("platinum_perks") }, { id: "diamond", label: t("diamond_perks") },
      ])}</Accordion>
    </>
  );
}

function RentalFilters({ filters, setFilters, format, t, accent, category }) {
  const F = (key, opts) => <ChipGroup filterKey={key} options={opts} filters={filters} setFilters={setFilters} accent={accent} />;
  const cats = [
    { id: "cars", label: t("rental_cars") }, { id: "bikes", label: t("rental_bikes") },
    { id: "furniture", label: t("rental_furniture") }, { id: "decor", label: t("rental_decor") },
    { id: "lighting", label: t("rental_lighting") }, { id: "sound", label: t("rental_sound") },
    { id: "generators", label: t("rental_generators") }, { id: "photo", label: t("rental_photography") },
    { id: "projectors", label: t("rental_projectors") },
  ];
  const features = [
    { id: "delivery", label: t("delivery_available") }, { id: "pickup", label: t("pickup_available") },
    { id: "instant", label: t("instant_booking_r") },
  ];
  return (
    <>
      <QuickFilterSection category="rentals" filters={filters} setFilters={setFilters} accent={accent} />
      <Section title={t("rental_category")} icon={Package}>{F("rentalCategory", cats)}</Section>
      <Section title={t("features")} icon={Zap}>{F("rentalFeatures", features)}</Section>
      <Section title={t("price_range")} icon={Wallet}><PriceRange filters={filters} setFilters={setFilters} format={format} t={t} accent={accent} /></Section>
      <Accordion title={t("loyalty_perks")} icon={Crown}>{F("loyaltyPerks", [
        { id: "gold", label: t("gold_perks") }, { id: "platinum", label: t("platinum_perks") }, { id: "diamond", label: t("diamond_perks") },
      ])}</Accordion>
    </>
  );
}

function ExperienceFilters({ filters, setFilters, format, t, accent, category }) {
  const F = (key, opts) => <ChipGroup filterKey={key} options={opts} filters={filters} setFilters={setFilters} accent={accent} />;
  const types = [
    { id: "adventure", label: t("exp_adventure") }, { id: "water", label: t("exp_water_sports") },
    { id: "workshops", label: t("exp_workshops") }, { id: "tours", label: t("exp_tours") },
    { id: "camping", label: t("exp_camping") }, { id: "photo_walk", label: t("exp_photography_walk") },
    { id: "cooking", label: t("exp_cooking_class") }, { id: "wellness", label: t("exp_wellness") },
    { id: "team", label: t("exp_team_building") },
  ];
  const suitability = [
    { id: "family", label: t("suit_family") }, { id: "couple", label: t("suit_couple") },
    { id: "kids", label: t("suit_kids") }, { id: "group", label: t("suit_group") },
  ];
  const bookings = [
    { id: "instant", label: t("instant_book") }, { id: "enquiry", label: t("enquiry_only") },
  ];
  return (
    <>
      <QuickFilterSection category="experiences" filters={filters} setFilters={setFilters} accent={accent} />
      <Section title={t("experience_type")} icon={Compass}>{F("experienceType", types)}</Section>
      <Section title={t("suitability")} icon={Heart}>{F("suitability", suitability)}</Section>
      <Section title={t("booking_type")} icon={BookCheck}>{F("expBooking", bookings)}</Section>
      <Section title={t("price_range")} icon={Wallet}><PriceRange filters={filters} setFilters={setFilters} format={format} t={t} accent={accent} /></Section>
      <Accordion title={t("loyalty_perks")} icon={Crown}>{F("loyaltyPerks", [
        { id: "gold", label: t("gold_perks") }, { id: "platinum", label: t("platinum_perks") }, { id: "diamond", label: t("diamond_perks") },
      ])}</Accordion>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACTIVE COUNT BADGE (for header)
   ══════════════════════════════════════════════════════════════ */
function countActive(filters) {
  return Object.entries(filters ?? {})
    .filter(([k]) => k !== "quickFilter")
    .reduce((sum, [, v]) => {
      if (Array.isArray(v)) return sum + v.length;
      if (v && typeof v === "object") {
        const hasMin = (v.min ?? 0) !== PRICE_MIN_INR;
        const hasMax = (v.max ?? PRICE_MAX_INR) !== PRICE_MAX_INR;
        return sum + (hasMin ? 1 : 0) + (hasMax ? 1 : 0);
      }
      return sum;
    }, 0);
}

/* ══════════════════════════════════════════════════════════════
   MAIN MODAL
   ══════════════════════════════════════════════════════════════ */
export default function FilterDrawer({ open, setOpen, venueCount, filters, setFilters }) {
  const t                  = useTranslations("filter");
  const { activeCategory } = useCategory();
  const { format }         = useCurrency();
  const tint               = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const accent             = tint.hex;

  // Draft state — changes stay local until "Show Results" is clicked
  const [draft, setDraft] = useState(() => ({ ...filters }));

  // Sync draft when modal opens so it reflects current applied filters
  useEffect(() => {
    if (open) setDraft({ ...filters });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCount = countActive(draft);

  const clearAll   = useCallback(() => setDraft({ ...DEFAULT_FILTERS }), []);
  const applyDraft = useCallback(() => { setFilters(draft); setOpen(false); }, [draft, setFilters, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <style>{RANGE_CSS}</style>

          {/* ── FULL-SCREEN BLUR BACKDROP ── */}
          <motion.div
            key="fd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            onClick={() => setOpen(false)}
          />

          {/* ── CENTERED MODAL ── */}
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
            <motion.div
              key="fd-modal"
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={[
                "relative w-full pointer-events-auto",
                "bg-white dark:bg-gray-950",
                "rounded-t-2xl sm:rounded-2xl shadow-2xl",
                "flex flex-col",
                /* mobile: near-fullscreen; desktop: capped */
                "max-h-[92dvh] sm:max-h-[88vh]",
                "sm:max-w-lg",
              ].join(" ")}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── HEADER ── */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                {/* Close */}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close filters"
                >
                  <X size={15} strokeWidth={2.5} />
                </button>

                {/* Title */}
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} strokeWidth={2} style={{ color: accent }} />
                  <span className="text-[15px] font-bold text-gray-900 dark:text-white">
                    {t("title")}
                  </span>
                  {activeCount > 0 && (
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                      style={{ background: accent }}
                    >
                      {activeCount}
                    </span>
                  )}
                </div>

                {/* Clear */}
                <button
                  onClick={clearAll}
                  className={[
                    "text-[13px] font-semibold underline underline-offset-2 transition-all",
                    activeCount > 0
                      ? "text-gray-800 dark:text-gray-100 hover:text-gray-500"
                      : "text-gray-300 dark:text-gray-700 pointer-events-none",
                  ].join(" ")}
                >
                  {t("clear")}
                </button>
              </div>

              {/* ── SCROLLABLE BODY ── */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                {activeCategory === "venues"      && <VenueFilters      filters={draft} setFilters={setDraft} format={format} t={t} accent={accent} category="venues" />}
                {activeCategory === "farmstays"   && <FarmstayFilters   filters={draft} setFilters={setDraft} format={format} t={t} accent={accent} category="farmstays" />}
                {activeCategory === "studios"     && <StudioFilters     filters={draft} setFilters={setDraft} format={format} t={t} accent={accent} category="studios" />}
                {activeCategory === "workspaces"  && <WorkspaceFilters  filters={draft} setFilters={setDraft} format={format} t={t} accent={accent} category="workspaces" />}
                {activeCategory === "rentals"     && <RentalFilters     filters={draft} setFilters={setDraft} format={format} t={t} accent={accent} category="rentals" />}
                {activeCategory === "experiences" && <ExperienceFilters filters={draft} setFilters={setDraft} format={format} t={t} accent={accent} category="experiences" />}
              </div>

              {/* ── FOOTER ── */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-950 rounded-b-2xl">
                <button
                  onClick={clearAll}
                  className="h-12 px-6 rounded-xl border border-gray-300 dark:border-gray-600 text-[13px] font-semibold text-gray-700 dark:text-gray-200 hover:border-gray-700 dark:hover:border-gray-200 transition-colors"
                >
                  {t("clear")}
                </button>
                <button
                  onClick={applyDraft}
                  className="flex-1 h-12 rounded-xl text-white text-[14px] font-bold transition-all active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
                    boxShadow: `0 4px 20px ${accent}44`,
                  }}
                >
                  {t("show", { count: venueCount })}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
