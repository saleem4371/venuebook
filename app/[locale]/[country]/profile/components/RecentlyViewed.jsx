"use client";

/**
 * /app/[locale]/[country]/profile/components/RecentlyViewed.jsx
 *
 * Horizontal slider using the REAL search-page VenueCard component and the
 * REAL recent_views() relation (home.service.js) — same data source
 * collections/page.jsx's "Recently Viewed" tab already uses. Rows are
 * hydrated through lib/resolveVenue.js (see that file's header comment for
 * why full objects aren't returned directly by the relation endpoint).
 *
 * Data + handlers are fetched once in page.jsx and passed down as props so
 * this slider shares the same liked/wishlist/compare state as the rest of
 * the dashboard instead of drifting out of sync with its own copy.
 */

import { useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

import { SectionCard, SectionHeading, EmptyState } from "./shared/ui";
import { resolveVenue } from "@/lib/resolveVenue";
import VenueCard from "@/app/[locale]/[country]/search/[type]/components/VenueCard";

export default function RecentlyViewed({
  recentViews = [],
  loading = false,
  user,
  likedIds,
  likedTotal = 0,
  wishlist = [],
  compares = [],
  onWishlist,
  onCompare,
  onLikedProperty,
  locale,
  country,
}) {
  const t = useTranslations("profile.recentlyViewed");
  const scrollerRef = useRef(null);

  const venues = useMemo(
    () => recentViews.map(resolveVenue).filter(Boolean).slice(0, 10),
    [recentViews],
  );

  const scrollBy = (dir) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const cardProps = {
    likedData: likedIds,
    likedTotal,
    user,
    wishlist,
    compares,
    onWishlist,
    onCompare,
    onLikedProperty,
    locale,
    country,
  };

  if (!loading && venues.length === 0) {
    return (
      <SectionCard>
        <SectionHeading
          title={t("title")}
          subtitle={t("subtitle")}
          icon={
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30">
              <Clock size={16} className="text-violet-600" />
            </span>
          }
        />
        <EmptyState icon={<Clock size={22} className="text-gray-400" />} title={t("empty")} compact />
      </SectionCard>
    );
  }

  return (
    <SectionCard padded={false} className="p-5 sm:p-6 lg:p-7 overflow-hidden">
      <SectionHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30">
            <Clock size={16} className="text-violet-600" />
          </span>
        }
        action={
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[220px] sm:w-[250px] h-56 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div ref={scrollerRef} className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-1">
          {venues.map((v) => (
            <div key={v.childVenueId} className="shrink-0 w-[220px] sm:w-[250px] snap-start">
              <VenueCard venue={v} {...cardProps} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
