/**
 * /lib/resolveVenue.js
 *
 * Shared "thin relation row → full venue object" resolver.
 *
 * The relation endpoints (likedProperty, UserWishlist, UserWishlistCategory,
 * UserCompare, recent_views) return thin rows — ids only, not full venue
 * objects — and there's no guaranteed image/name/price on every row. Two
 * features already independently worked around this the same way (see
 * compare/hooks/useCompareList.js and collections/page.jsx's own header
 * comment, which explicitly says it "reuses that same resolution strategy
 * rather than inventing a second one"). This module is that same strategy,
 * pulled out so a third consumer (the profile dashboard's Recently Viewed
 * slider) doesn't have to paste a third copy.
 *
 * Existing files are NOT modified to import from here — this is purely
 * additive, so nothing already working can regress.
 *
 * IMAGE PATHS: the relation rows' `image`/`images` field is often a bare
 * storage-relative path (e.g. "uploads/xyz.png"), not a full URL — that's
 * exactly what VenueCard.jsx already works around for the search/collections
 * grids (see its own `images` useMemo: prefix NEXT_PUBLIC_AWS_BUCKET_URL
 * unless the string already starts with "http"). `toImageUrl` below is that
 * same, idempotent transform, applied once here so every consumer of this
 * resolver (a plain <img>, not VenueCard) gets a real, loadable URL instead
 * of silently 404ing.
 */

import { STATIC_VENUES } from "@/app/[locale]/[country]/search/[type]/data/staticVenues";
import { enrichProperty } from "@/app/[locale]/[country]/compare/data/compareSchema";

const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

function toImageUrl(item) {
  const image = typeof item === "string" ? item : item?.image || item?.url || "";
  if (!image) return null;
  return image.startsWith("http") ? image : `${BASE_URL}/${image}`;
}

export function extractId(raw) {
  return (
    raw?.venue_id ||
    raw?.property_id ||
    raw?.childVenueId ||
    raw?.child_venue_id ||
    raw?.id ||
    raw?.venueId ||
    null
  );
}

export function unwrapList(res) {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.result)) return d.result;
  return [];
}

export function resolveVenue(raw) {
  const id = extractId(raw);
  if (!id) return null;
  const staticMatch = STATIC_VENUES.find((v) => v.childVenueId === id);
  const base =
    staticMatch || {
      childVenueId: id,
      venueName: raw?.title || raw?.name || raw?.venueName || "Property",
      category: raw?.category || raw?.property_type || "venues",
      city: raw?.city || "",
      state: raw?.state || "",
      images: (raw?.image ? [raw.image] : raw?.images || []).map(toImageUrl).filter(Boolean),
      minPrice: raw?.price || raw?.minPrice || null,
      rating: raw?.rating || 4.5,
      reviewCount: raw?.reviewCount || 0,
    };
  return enrichProperty(base);
}
