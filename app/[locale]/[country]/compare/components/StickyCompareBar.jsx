"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { X, Star, MapPin, Briefcase, Plus, Heart } from "lucide-react";
import { MAX_COMPARE_PROPERTIES, getPropertyType } from "../utils/compareHelpers";
import DateShiftFilters from "./shared/DateShiftFilters";
import AddVenueModal from "./AddVenueModal";

/* ── One mini property chip in the sticky bar ─────────────────────────── */
function MiniPropertyCard({ property, category, onRemove, onWishlistToggle, isWishlisted, t }) {
  const tCard = useTranslations("compare.card");
  const location = [property.city, property.state].filter(Boolean).join(", ");
  const propertyType = getPropertyType(property, category);

 const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;
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
        <img   src={`${BASE_URL}/${property.images?.[0]}`} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-100 truncate">{property.venueName}</p>
        {property.parentVenueName && (
          <p className="text-[10.5px] text-[var(--cat-accent)] truncate">{property.parentVenueName}</p>
        )}
        {propertyType && (
          <p className="flex items-center gap-1 text-[10.5px] text-gray-400 dark:text-gray-500 truncate">
            <Briefcase size={9} className="flex-shrink-0 opacity-70" />
            <span className="truncate">{propertyType}</span>
          </p>
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
      {/* Wishlist — a real, comfortably-tappable outer badge (mirrors the
          remove button's size/position on the opposite corner) instead of
          a cramped icon squeezed inside the 48px thumbnail, which was too
          small to reliably tap on mobile. */}
      {onWishlistToggle && (
        <button
          onClick={() => onWishlistToggle(property.childVenueId)}
          aria-label={tCard("wishlist")}
          className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center transition"
        >
          <Heart size={13} className={isWishlisted ? "fill-pink-500 text-pink-500" : "text-gray-500"} />
        </button>
      )}
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

/* ── Empty slot in the sticky row — same footprint as MiniPropertyCard so
   the row never looks lopsided, and the "Add" flow now lives here instead
   of a separate full-size card grid further down the page. ───────────── */
function MiniAddTile({ category, onClick }) {
  const t = useTranslations("compare.addVenue");
  const tCat = useTranslations("categories");
  return (
    // No fixed height here on purpose — MiniPropertyCard's height is
    // content-driven (image + name + type + location rows), and a fixed
    // h-16 here previously didn't match it, making the Add tile visibly
    // shorter/taller than its siblings. Flex/grid's default
    // align-items:stretch (never overridden on the row) makes this tile
    // match whatever height the tallest property card in the row settles
    // on; min-h-[64px] is only a floor for the rare all-empty-slots case.
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[212px] lg:w-full min-h-[64px] flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[var(--cat-active-border)] hover:text-[var(--cat-accent)] transition-colors"
    >
      <span className="w-6 h-6 rounded-full bg-[var(--cat-accent)] text-white flex items-center justify-center flex-shrink-0">
        <Plus size={14} />
      </span>
      <span className="text-[12px] font-semibold truncate">{t("tileLabel", { category: tCat(category) })}</span>
    </button>
  );
}

export default function StickyCompareBar({
  properties,
  onRemove,
  onWishlistToggle,
  wishlistIds,
  experience,
  selectedDate,
  setSelectedDate,
  selectedShift,
  setSelectedShift,
  selectedEventType,
  setSelectedEventType,
  onAdd,
  category,
  country,
  excludeIds,
  maxSlots = MAX_COMPARE_PROPERTIES,
}) {
  const t = useTranslations("compare.stickyBar");
  const [modalOpen, setModalOpen] = useState(false);
  const emptySlotCount = Math.max(0, maxSlots - properties.length);

  return (
    <div className="sticky top-16 md:top-[72px] z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-3">
        {/* lg:grid-cols-4 — full width, evenly spaced, no left-packed dead
            space when there are fewer than 4 properties. The Add slot and
            each property's type both live directly in this row now (see
            MiniPropertyCard / MiniAddTile above) — there's no separate
            full-size card grid further down the page repeating the same
            name/location/rating/type info a second time. */}
        <div className="flex lg:grid lg:grid-cols-4 gap-2 lg:gap-4 overflow-x-auto lg:overflow-visible no-scrollbar">
          <AnimatePresence initial={false}>
            {properties.map((p) => (
              <MiniPropertyCard
                key={p.childVenueId}
                property={p}
                category={category}
                onRemove={onRemove}
                onWishlistToggle={onWishlistToggle}
                isWishlisted={wishlistIds?.has(p.childVenueId)}
                t={t}
              />
            ))}
          </AnimatePresence>

          {onAdd && Array.from({ length: emptySlotCount }).map((_, i) => (
            <MiniAddTile key={`sticky-add-slot-${i}`} category={category} onClick={() => setModalOpen(true)} />
          ))}
        </div>

        {/* Sticky date/shift selector — venue experience only (Availability
            section). Custom popover calendar + custom dropdown replace the
            browser-default <input type="date"> / <select> so styling is
            consistent across every browser/OS, not just whatever native UI
            the visitor's platform happens to render. */}
        {experience === "venue" && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <DateShiftFilters
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedShift={selectedShift}
              setSelectedShift={setSelectedShift}
              selectedEventType={selectedEventType}
              setSelectedEventType={setSelectedEventType}
              t={t}
            />
          </div>
        )}
      </div>

      {onAdd && (
        <AddVenueModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          category={category}
          excludeIds={excludeIds}
          country={country}
          onAdd={(id) => onAdd(id)}
          remainingSlots={emptySlotCount}
        />
      )}
    </div>
  );
}
