"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { X, Star, MapPin } from "lucide-react";
import DateShiftFilters from "./shared/DateShiftFilters";

/* ── One mini property chip in the sticky bar ─────────────────────────── */
function MiniPropertyCard({ property, onRemove, t }) {
  const location = [property.city, property.state].filter(Boolean).join(", ");
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
      transition={{ duration: 0.25 }}
      className="relative flex-shrink-0 w-[212px] lg:w-full flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-2 border border-gray-100 dark:border-gray-800"
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
        <img src={property.gallery?.[0] || property.images?.[0]} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-100 truncate">{property.venueName}</p>
        {property.parentVenueName && (
          <p className="text-[10.5px] text-violet-500 dark:text-violet-400 truncate">{property.parentVenueName}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-[10.5px] text-gray-400 dark:text-gray-500 truncate">
            <MapPin size={9} className="flex-shrink-0" />
            <span className="truncate">{location}</span>
          </span>
          {property.rating && (
            <span className="flex items-center gap-0.5 text-[10.5px] font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
              <Star size={9} className="fill-amber-400 text-amber-400" />
              {Number(property.rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(property.childVenueId)}
        aria-label={t("remove")}
        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

export default function StickyCompareBar({
  properties,
  onRemove,
  experience,
  selectedDate,
  setSelectedDate,
  selectedShift,
  setSelectedShift,
}) {
  const t = useTranslations("compare.stickyBar");

  return (
    <div className="sticky top-16 md:top-[72px] z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
        {/* lg:grid-cols-4 mirrors ComparisonCards' grid exactly (same gap,
            same px-4 lg:px-8 container) so each mini card sits flush above
            its full card below — full width, evenly spaced, no left-packed
            dead space when there are fewer than 4 properties. */}
        <div className="flex lg:grid lg:grid-cols-4 gap-2 lg:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar">
          <AnimatePresence initial={false}>
            {properties.map((p) => (
              <MiniPropertyCard key={p.childVenueId} property={p} onRemove={onRemove} t={t} />
            ))}
          </AnimatePresence>
        </div>

        {/* Sticky date/shift selector — venue experience only (Availability
            section). Custom popover calendar + custom dropdown replace the
            browser-default <input type="date"> / <select> so styling is
            consistent across every browser/OS, not just whatever native UI
            the visitor's platform happens to render. */}
        {experience === "venue" && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <DateShiftFilters
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedShift={selectedShift}
              setSelectedShift={setSelectedShift}
              t={t}
            />
          </div>
        )}
      </div>
    </div>
  );
}
