"use client";

import { useParams } from "next/navigation";
import ReelCard from "../../../search/[type]/components/ReelCard";
import { getFallbackVideo } from "../utils/fallbackMedia";

/**
 * ONE reel per category — reusing the actual search page ReelCard
 * (same vertical, hover/auto-play, wishlist-styled component) rather
 * than a lookalike, per spec. It's fed a "venue" shaped object built
 * from this category's first listing; wishlist/compare are no-ops here
 * since this page has no such state wired up yet. Falls back to the
 * category's house-stock clip when the listing has no reel of its own,
 * and always plays (no hover-to-play gating) since it's the sole,
 * featured reel rather than one of many in a grid.
 */
export default function CategoryReels({ estate, categoryKey }) {
  const { locale, country } = useParams();
  const cat = estate.categories?.[categoryKey];
  const listing = cat?.listings?.[0];
  if (!listing) return null;

  const venue = {
    childVenueId: listing.id,
    venueName: listing.name,
    title: listing.name,
    images: [listing.image],
    videoUrl: listing.reelUrl || getFallbackVideo(categoryKey),
    minPrice: listing.priceINR,
    rating: listing.rating,
    city: listing.city,
    state: listing.state,
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-w-full"
      style={{ width: 320, height: 569 }}
    >
      <ReelCard
        venue={venue}
        category={categoryKey}
        locale={locale || "en"}
        country={country || "in"}
        liked={false}
        isCompared={false}
        onWishlist={() => {}}
        onCompare={() => {}}
        active
      />
    </div>
  );
}
