"use client";

/**
 * MapVenueCard — the dedicated, compact venue preview shown when a marker
 * or cluster-drilldown selects a single venue on the Search Page map.
 *
 * This is intentionally NOT VenueCard.jsx reused: VenueCard is the dense
 * grid result card (image slider, compare button, category meta rows...).
 * This is a much smaller "just enough to decide" preview, sharing the same
 * design tokens (radius, shadow, type, color, motion) as the rest of the
 * venuebook.in map system (marker pills + cluster badges) so the three
 * pieces read as one connected system instead of three separate designs.
 *
 * Two layouts, same content/logic:
 *   variant="floating" — vertical card, image on top (desktop popup)
 *   variant="sheet"    — horizontal card, image on the left (mobile sheet)
 */

import Link from "next/link";
import { Star, Users, MapPin, X, ImageOff } from "lucide-react";
import LikeButton from "@/components/LikeButton";

function resolveImage(venue, baseUrl) {
  const raw = venue?.images?.[0];
  if (!raw) return null;
  const path = typeof raw === "string" ? raw : raw?.image || raw?.url || "";
  if (!path) return null;
  return path.startsWith("http") ? path : `${baseUrl}/${path}`;
}

function resolveCapacity(venue) {
  return (
    venue?.maxGuests ||
    venue?.capacity ||
    venue?.guestCapacity ||
    venue?.seating_capacity ||
    null
  );
}

function resolvePrice(venue) {
  return venue?.minPrice || venue?.basePrice || venue?.price || venue?.starting_price || venue?.min_price || null;
}

function formatPrice(n) {
  const num = Number(n);
  if (!num || num <= 0) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function MapVenueCard({
  venue,
  variant = "floating",
  baseUrl,
  liked = false,
  onToggleLike,
  onClose,
  locale = "en",
  country = "in",
  category = "venues",
}) {
  if (!venue) return null;

  const name = venue.venueName || venue.name || "Untitled venue";
  const location = [venue.city, venue.state].filter(Boolean).join(", ");
  const rating = venue.rating || venue.avgRating || venue.averageRating;
  const reviewCount = venue.reviewCount || venue.review_count || venue.totalReviews;
  const capacity = resolveCapacity(venue);
  const price = formatPrice(resolvePrice(venue));
  const image = resolveImage(venue, baseUrl);
  const vid = venue.childVenueId || venue.id;
  const href = `/${locale}/${country}/search/${category}/${vid}`;

  const isSheet = variant === "sheet";

  return (
    <div
      role="group"
      aria-label={`${name} preview`}
      className={[
        "vb-map-card relative",
        isSheet
          ? "flex items-stretch gap-3 w-full"
          : "flex flex-col w-[220px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden",
      ].join(" ")}
      style={
        isSheet
          ? undefined
          : { boxShadow: "0 14px 36px rgba(0,0,0,0.20), 0 3px 10px rgba(0,0,0,0.10)" }
      }
    >
      {/* ── IMAGE ── */}
      <Link
        href={href}
        target="_blank"
        className={[
          "relative shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-2xl",
          isSheet ? "w-[104px] h-[104px]" : "w-full h-[124px] rounded-b-none",
        ].join(" ")}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff size={isSheet ? 20 : 26} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
          </div>
        )}
      </Link>

      {!isSheet && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-sm hover:bg-white dark:hover:bg-gray-900 transition-colors"
        >
          <X size={12} className="text-gray-700 dark:text-gray-200" />
        </button>
      )}

      <LikeButton
        liked={liked}
        onChange={onToggleLike}
        size={isSheet ? 16 : 18}
        className={isSheet ? "absolute top-2 left-2 z-10" : "absolute top-2 left-2 z-10"}
      />

      {/* ── CONTENT ── */}
      <Link
        href={href}
        target="_blank"
        className={[
          "min-w-0 flex flex-col",
          isSheet ? "flex-1 justify-center gap-1 px-3 py-2" : "gap-1.5 px-3 py-2.5",
        ].join(" ")}
      >
        <h3
          className={[
            "font-semibold text-gray-900 dark:text-gray-50 leading-tight truncate",
            isSheet ? "text-[13px]" : "text-[13.5px]",
          ].join(" ")}
        >
          {name}
        </h3>

        {location && (
          <div className="flex items-center gap-1 min-w-0">
            <MapPin size={10} className="text-gray-400 dark:text-gray-500 shrink-0" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{location}</span>
          </div>
        )}

        {(rating || capacity) && (
          <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-300">
            {rating && (
              <span className="inline-flex items-center gap-0.5 font-medium">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                {Number(rating).toFixed(1)}
                {reviewCount ? <span className="text-gray-400 dark:text-gray-500 font-normal">({reviewCount})</span> : null}
              </span>
            )}
            {rating && capacity && <span className="text-gray-300 dark:text-gray-600">·</span>}
            {capacity && (
              <span className="inline-flex items-center gap-0.5">
                <Users size={10} />
                Up to {capacity}
              </span>
            )}
          </div>
        )}

        <div className="flex items-baseline gap-1.5 pt-0.5">
          <span className="text-[14px] font-bold text-gray-900 dark:text-gray-50">
            {price ?? "Enquiry"}
          </span>
          {price && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">starting price</span>
          )}
        </div>
      </Link>
    </div>
  );
}
