"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";

/* ── Format price in INR (same rule as search card) ─────────── */
function formatINR(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

/* ── Price suffix per category ───────────────────────────────── */
const PRICE_SUFFIX = {
  venues:      "Starting Price",
  farmstays:   "/ Night",
  studios:     "/ Hour",
  rentals:     "/ Day",
  workspaces:  "/ Day",
  experiences: "/ Person",
};

export default function VenueCard({ venue, dataSource, category }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [currentImage, setCurrentImage] = useState(0);
  const [hovered,      setHovered]      = useState(false);

  /* ── Normalise images ───────────────────────────────────────── */
  const rawImages = venue.images?.length
    ? venue.images
    : venue.image
      ? [venue.image]
      : [];

  const images = rawImages
    .map((item) => {
      const src = typeof item === "string" ? item : item?.image || item?.url || "";
      if (!src) return null;
      if (src.startsWith("http")) return src;
      return dataSource === "api" ? `${BASE_URL}/${src}` : src;
    })
    .filter(Boolean);

  const fallback =
    "https://api.venuebook.in/Gallery/venue_images/parent_venue_a709df8e-9490-4813-8eb0-b85c1d78fbeb/child_venue_c1a5667c-3c82-4ad2-b005-ae6700d405dc/thumbnail_69e68ecdc2158.png";

  const displayImages = images.length ? images : [fallback];

  /* ── Derived fields ─────────────────────────────────────────── */
  const name     = venue.venueName || venue.name || "";
  const location = [venue.city, venue.state].filter(Boolean).join(" · ") || venue.location || "";
  const rating   = venue.rating || venue.avgRating || venue.averageRating;
  const reviews  = venue.reviewCount || venue.review_count || venue.reviews;
  const price    = venue.minPrice || venue.basePrice || venue.price;
  const suffix   = PRICE_SUFFIX[category] || "Starting Price";

  const nextImage = (e) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImage((p) => (p + 1) % displayImages.length);
  };
  const prevImage = (e) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImage((p) => (p === 0 ? displayImages.length - 1 : p - 1));
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full"
    >
      <div className="
        rounded-2xl overflow-hidden
        bg-white dark:bg-gray-900
        border border-gray-100 dark:border-gray-800
        shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)]
        hover:border-gray-200 dark:hover:border-gray-700
        transition-all duration-200
      ">

        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={displayImages[currentImage]}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              loading="lazy"
            />
          </AnimatePresence>

          {/* gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

          {/* arrows */}
          {hovered && displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/85 p-1.5 rounded-full shadow"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/85 p-1.5 rounded-full shadow"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}

          {/* dots */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
              {displayImages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentImage ? "w-4 bg-white" : "w-1 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-1">

          {/* Name */}
          <h3 className="text-sm font-semibold truncate leading-snug text-gray-900 dark:text-gray-50">
            {name}
          </h3>

          {/* Location + Rating row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 min-w-0">
              <MapPin size={10} className="flex-shrink-0 opacity-70" />
              <span className="truncate">{location}</span>
            </div>
            {rating && (
              <div className="flex items-center gap-0.5 shrink-0 text-xs">
                <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {Number(rating).toFixed(1)}
                </span>
                {reviews && (
                  <span className="text-gray-400 dark:text-gray-500 ml-0.5">({reviews})</span>
                )}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-1 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-50">
              {price ? formatINR(price) : "Contact"}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              {price ? suffix : "for Price"}
            </span>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
