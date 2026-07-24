"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/SuggestionsSection.jsx
 *
 * Center-column feed — real recommended-venues rail, fed by the exact same
 * `Api_recommeded(regions)` call + `localStorage.getItem("vb_preferred_location")`
 * read the home page uses (home/page.jsx's getRecommendedVenues), fetched
 * ONCE in page.jsx and passed down to both this and ReelsForYouSection so
 * they agree on one list rather than each fetching/mocking their own.
 *
 * Header is the same SectionHeading + ViewAllLink pattern every other panel
 * on this page uses (Collections/Liked/RecentlyViewed/Reels) — deliberately
 * NOT home/components/HorizontalRail's own arrow-nav header, which would
 * be the only section here with a different header language. "View All"
 * goes to the real /home page, since that's the one page with the full,
 * unpaginated Recommended Venues rail this list is sourced from — there's
 * no dedicated "all suggestions" route to link to instead.
 *
 * Reuses the real home-page PropertyCard directly (not via
 * home/components/VenueSection.jsx, which assumes a single `activeCategory`
 * from CategoryContext) since this list can span several categories at
 * once — each card reads its own category straight off the venue for both
 * the price-suffix and the click-through URL, same fallback chain
 * PropertyCard itself already uses for name/location/price.
 */

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

import { SectionCard, SectionHeading, ViewAllLink } from "../shared/ui";
import PropertyCard from "@/app/[locale]/[country]/home/components/PropertyCard";

function venueCategory(v) {
  return v.category || v.venueType || v.property_type || "venues";
}
function venueId(v) {
  return v.childVenueId ?? v.child_venue_id ?? v.id ?? v._id;
}

export default function SuggestionsSection({ venues = [], loading = false, locale, country, flat = false }) {
  const t = useTranslations("profile.suggestions");
  const router = useRouter();

  if (!loading && venues.length === 0) return null;

  return (
    <SectionCard flat={flat}>
      <SectionHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-900/30">
            <Sparkles size={14} className="text-violet-600" />
          </span>
        }
        action={
          !loading && venues.length > 0 && (
            <ViewAllLink href={`/${locale}/${country}/home`} small>
              {t("viewAll")}
            </ViewAllLink>
          )
        }
      />

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="shrink-0 w-[160px] space-y-2">
                <div className="aspect-[5/4] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="h-3 w-2/3 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
              </div>
            ))
          : venues.map((v, i) => {
              const id = venueId(v);
              const cat = venueCategory(v);
              return (
                <div
                  key={id ?? i}
                  onClick={() => id && router.push(`/${locale}/${country}/search/${cat}/${id}`)}
                  className="shrink-0 w-[160px] cursor-pointer"
                >
                  <PropertyCard venue={v} dataSource="api" category={cat} variant="medium" />
                </div>
              );
            })}
      </div>
    </SectionCard>
  );
}
