"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Heart, X, Plus } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import AddVenueModal from "./AddVenueModal";

/* ═══════════════════════════════════════════════════════════════════════
   Single premium comparison card.
   Actions are intentionally limited to Wishlist / Remove — the user is
   already comparing, so "View Property" / "Check Availability" / "Compare"
   would just be duplicate actions on this page.
   ═══════════════════════════════════════════════════════════════════════ */
function PropertyCompareCard({ property, onRemove, onWishlistToggle, isWishlisted }) {
  const t = useTranslations("compare.card");
  const { format } = useCurrency();
  const location = [property.city, property.state].filter(Boolean).join(", ");
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="snap-center flex-shrink-0 w-[82%] sm:w-[47%] lg:w-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)] transition-shadow group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={`${BASE_URL}/${property.images?.[0]}`}
          alt={property.venueName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <button
          onClick={() => onWishlistToggle(property.childVenueId)}
          aria-label={t("wishlist")}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-white/30"
        >
          <Heart size={15} className={isWishlisted ? "fill-pink-500 text-pink-500" : "text-gray-700"} />
        </button>

        <button
          onClick={() => onRemove(property.childVenueId)}
          aria-label={t("remove")}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-white/30 hover:bg-white transition"
        >
          <X size={15} className="text-gray-700" />
        </button>

      </div>

      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-sm font-semibold truncate leading-snug text-gray-900 dark:text-gray-50 mt-0.5">
          {property.venueName}
        </h3>

        {property.parentVenueName ? (
          <p className="text-xs text-violet-500 dark:text-violet-400 truncate -mt-0.5 font-medium">{property.parentVenueName}</p>
        ) : (
          <div className="h-[14px] flex-shrink-0" aria-hidden="true" />
        )}

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 min-w-0">
            <MapPin size={11} className="flex-shrink-0 opacity-70" />
            <span className="truncate">{location}</span>
          </span>
          {property.rating && (
            <span className="flex items-center gap-0.5 shrink-0 text-xs text-gray-700 dark:text-gray-300">
              <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
              <span className="font-semibold">{Number(property.rating).toFixed(1)}</span>
              {property.reviewCount ? <span className="text-gray-400 dark:text-gray-500 ml-0.5">({property.reviewCount})</span> : null}
            </span>
          )}
        </div>

        {property.minPrice != null && (
          <div className="mt-1.5 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold text-gray-900 dark:text-gray-50">{format(property.minPrice)}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t("startingFrom")}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   AddVenueTile — fills a slot left empty by a removed property (or never
   filled in the first place) so the grid never looks empty/lopsided.
   Matches PropertyCompareCard's footprint exactly (same rounded-3xl card,
   same height) so the row stays visually even.
   ═══════════════════════════════════════════════════════════════════════ */
function AddVenueTile({ onClick, category }) {
  const t = useTranslations("compare.addVenue");
  const tCat = useTranslations("categories");
  return (
    <button
      onClick={onClick}
      className="snap-center flex-shrink-0 w-[82%] sm:w-[47%] lg:w-auto min-h-[288px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
    >
      <span className="w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center">
        <Plus size={22} />
      </span>
      <span className="text-[13.5px] font-semibold">{t("tileLabel", { category: tCat(category) })}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Responsive card row.
   Desktop (lg+): fixed 4-column grid, no scroll.
   Tablet: 2 cards visible, horizontal swipe (scroll-snap).
   Mobile: ~1 card visible, swipe between properties, dot indicator.
   Empty slots (up to maxSlots) render as an "Add Venue" tile instead of
   shrinking the row, so removing a property never leaves the page looking
   empty — the same slot just becomes an invitation to add another.
   ═══════════════════════════════════════════════════════════════════════ */
export default function ComparisonCards({
  properties, onRemove, onWishlistToggle, wishlistIds,
  onAdd, category, country, maxSlots = 4,
}) {
  const scrollerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const excludeIds = new Set(properties.map((p) => p.childVenueId));
  const emptySlotCount = Math.max(0, maxSlots - properties.length);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el || !el.firstChild) return;
    const cardWidth = el.firstChild.offsetWidth + 20; // + gap-6
    setActiveIndex(Math.min(properties.length - 1, Math.max(0, Math.round(el.scrollLeft / cardWidth))));
  };

  const scrollToIndex = (i) => {
    const el = scrollerRef.current;
    const card = el?.children?.[i];
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex lg:grid lg:grid-cols-4 gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none no-scrollbar pb-2"
      >
        <AnimatePresence initial={false}>
          {properties.map((p) => (
            <PropertyCompareCard
              key={p.childVenueId}
              property={p}
              onRemove={onRemove}
              onWishlistToggle={onWishlistToggle}
              isWishlisted={wishlistIds?.has(p.childVenueId)}
            />
          ))}
        </AnimatePresence>

        {onAdd && Array.from({ length: emptySlotCount }).map((_, i) => (
          <AddVenueTile key={`add-slot-${i}`} category={category} onClick={() => setModalOpen(true)} />
        ))}
      </div>

      {/* Dot indicator — mobile/tablet only */}
      {properties.length > 1 && (
        <div className="flex lg:hidden items-center justify-center gap-2 mt-4">
          {properties.map((p, i) => (
            <button
              key={p.childVenueId}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to ${p.venueName}`}
              className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-5 bg-violet-500" : "w-1.5 bg-gray-300 dark:bg-gray-700"}`}
            />
          ))}
        </div>
      )}

      {onAdd && (
        <AddVenueModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          category={category}
          excludeIds={excludeIds}
          country={country}
          onAdd={(id) => onAdd(id)}
        />
      )}
    </div>
  );
}
