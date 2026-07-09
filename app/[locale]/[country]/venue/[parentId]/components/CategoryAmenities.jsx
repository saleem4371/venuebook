"use client";

import {
  ParkingSquare, Waves, Trees, Building2, Sun, UtensilsCrossed, Wine,
  Salad, ClipboardList, Users, Sparkles, Camera, Video, Music2, ShieldCheck,
  Car, Wifi, Monitor, Projector, Speaker, Tv, Accessibility, ArrowUpDown,
  Flame, Sailboat, Scissors, Lightbulb, Radio, CheckCircle2,
} from "lucide-react";

// Icon lookup for the estate's own amenity vocabulary (see
// data/estateData.js `amenities` groups). Anything not mapped falls back
// to a plain checkmark rather than breaking the layout.
const ICON_MAP = {
  "Parking": ParkingSquare,
  "Swimming Pool": Waves,
  "Garden": Trees,
  "Lawn": Trees,
  "Indoor Hall": Building2,
  "Rooftop": Sun,
  "Outdoor Terrace": Sun,
  "Common Pool": Waves,
  "In-house Catering": UtensilsCrossed,
  "Outside Catering Allowed": UtensilsCrossed,
  "Bar & Beverages": Wine,
  "Veg Menu": Salad,
  "Non-veg Menu": UtensilsCrossed,
  "Custom Menu": ClipboardList,
  "Halal Options": CheckCircle2,
  "BBQ Setup": Flame,
  "Event Coordinator": Users,
  "Decoration": Sparkles,
  "Photography": Camera,
  "Videography": Video,
  "DJ": Music2,
  "Live Music": Music2,
  "Security": ShieldCheck,
  "Valet Parking": Car,
  "Kayaking Guide": Sailboat,
  "Styling Assistance": Scissors,
  "High-speed WiFi": Wifi,
  "AV Equipment": Monitor,
  "Projector": Projector,
  "Sound System": Speaker,
  "LED Screen": Tv,
  "Lighting Rig": Lightbulb,
  "Live Streaming": Radio,
  "Wheelchair Access": Accessibility,
  "Elevator": ArrowUpDown,
  "Accessible Restrooms": Accessibility,
};

function getIcon(label) {
  return ICON_MAP[label] ?? CheckCircle2;
}

/**
 * Icon-card amenities layout, grouped under uppercase section labels —
 * matches the individual listing page's "What this place offers" style
 * instead of plain text pills. `theme` supplies the category's accent
 * (bg/text) so the icon tiles pick up the same violet/emerald/blue/amber
 * palette used everywhere else on this category's section.
 */
export default function CategoryAmenities({ groups, theme, label }) {
  const entries = Object.entries(groups || {});
  if (entries.length === 0) return null;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Amenities &amp; Facilities</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 max-w-2xl">
          Shared across all {label.toLowerCase()} within this estate — individual properties may offer a few
          extras of their own, noted on their own listing page.
        </p>
      </div>

      <div className="space-y-8">
        {entries.map(([group, items]) => (
          <div key={group}>
            <div className="flex items-center gap-2 mb-3.5">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
              <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                {group}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {items.map((item) => {
                const Icon = getIcon(item);
                return (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02] hover:border-gray-200 dark:hover:border-white/[0.12] transition-colors"
                  >
                    <div className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center ${theme.bg} ${theme.text}`}>
                      <Icon size={15} strokeWidth={1.75} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
