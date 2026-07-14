"use client";

import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";

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

const FALLBACK_IMAGE =
  "https://api.venuebook.in/Gallery/venue_images/parent_venue_a709df8e-9490-4813-8eb0-b85c1d78fbeb/child_venue_c1a5667c-3c82-4ad2-b005-ae6700d405dc/thumbnail_69e68ecdc2158.png";

/*
 * VenueCard — Airbnb-style: the photo IS the card. No surrounding
 * white box, no border, no shadow-as-container — just a rounded,
 * near-square thumbnail with plain text underneath. That's what
 * actually reads as "clean" at this card size; a tall image wrapped
 * in its own bordered/shadowed box is what was making these look
 * elongated and boxy next to Airbnb's own layout.
 */
export default function VenueCard({ venue, dataSource, category }) {
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  /* ── Single thumbnail only — no slider ───────────────────────── */
  const rawImage = venue.images?.length ? venue.images[0] : venue.image;
  const rawSrc =
    typeof rawImage === "string" ? rawImage : rawImage?.image || rawImage?.url || "";
  const image = !rawSrc
    ? FALLBACK_IMAGE
    : rawSrc.startsWith("http")
      ? rawSrc
      : dataSource === "api"
        ? `${BASE_URL}/${rawSrc}`
        : rawSrc;

  /* ── Derived fields ─────────────────────────────────────────── */
  const name     = venue.venueName || venue.name || "";
  const location = [venue.city, venue.state].filter(Boolean).join(" · ") || venue.location || "";
  const ratingRaw = venue.rating || venue.avgRating || venue.averageRating;
  // Guard against a truthy-but-zero value (e.g. "0" as a string, or an
  // unrated venue defaulting to 0) rendering a nonsense "★ 0.0" badge.
  const rating = Number(ratingRaw) > 0 ? Number(ratingRaw) : null;
  const price    = venue.minPrice || venue.basePrice || venue.price;
  const suffix   = PRICE_SUFFIX[category] || "Starting Price";

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="group w-full cursor-pointer">
      {/* Thumbnail — near-square, rounded, no box around it */}
      <div className="relative aspect-[1/1] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <motion.img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4 }}
          loading="lazy"
        />

        {rating && (
          <div className="absolute top-2.5 start-2.5 flex items-center gap-1 bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100">
              {Number(rating).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Text — plain, directly under the image, no divider/border */}
      <div className="pt-2.5">
        <h3 className="text-[14px] font-semibold truncate leading-snug text-gray-900 dark:text-gray-50">
          {name}
        </h3>

        <div className="flex items-center gap-1 text-[13px] text-gray-500 dark:text-gray-400 min-w-0 mt-0.5">
          <MapPin size={11} className="flex-shrink-0 opacity-70" />
          <span className="truncate">{location}</span>
        </div>

        <p className="mt-1 text-[14px] truncate">
          <span className="font-semibold text-gray-900 dark:text-gray-50">
            {price ? formatINR(price) : "Contact"}
          </span>
          <span className="text-gray-500 dark:text-gray-400"> {price ? suffix : "for Price"}</span>
        </p>
      </div>
    </motion.div>
  );
}
