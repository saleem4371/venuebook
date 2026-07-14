"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/RecentlyViewedPanel.jsx
 *
 * Right column, compact — real recent_views() data hydrated through the
 * same lib/resolveVenue.js helper RecentlyViewed.jsx (mobile fallback) and
 * collections/page.jsx use. Deliberately just a row of thumbnails here
 * (no name/price rows) so this stays a short strip instead of competing
 * with Collections and Notifications for vertical space in a fixed right
 * column. "View All" routes to the real /collections page, which already
 * has a "Recently Viewed" tab backed by this same recent_views() data
 * (collections/page.jsx) — that tab is local component state, not a URL
 * param, so this links to the page itself rather than inventing a
 * ?tab=recent deep link into a page this feature doesn't own.
 */

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Clock, ImageOff } from "lucide-react";

import { SectionCard, SectionHeading, ViewAllLink } from "../shared/ui";
import { resolveVenue } from "@/lib/resolveVenue";

export default function RecentlyViewedPanel({ recentViews = [], loading = false, locale, country }) {
  const t = useTranslations("profile.recentlyViewed");

  // Capped at 4 — the narrowest right-column width (260px, lg breakpoint)
  // only has room for about 4 of these 48px thumbnails after SectionCard's
  // own padding. Scroll-to-see-more looked like an overflow bug with no
  // visible scroll affordance, so this shows fewer, but every one of them
  // is fully visible with no clipping or horizontal scroll needed.
  const venues = useMemo(() => recentViews.map(resolveVenue).filter(Boolean).slice(0, 4), [recentViews]);

  // Nothing to show and nothing loading — skip the section entirely
  // instead of taking up a whole card in the right column just to say
  // "properties you view will show up here."
  if (!loading && venues.length === 0) return null;

  return (
    <SectionCard>
      <SectionHeading
        title={t("title")}
        icon={
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-900/30">
            <Clock size={14} className="text-violet-600" />
          </span>
        }
        action={<ViewAllLink href={`/${locale}/${country}/collections`}>{t("viewAll")}</ViewAllLink>}
      />

      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          {venues.map((v) => (
            <Thumb
              key={v.childVenueId}
              venue={v}
              href={`/${locale}/${country}/search/${v.category || "venues"}/${v.childVenueId}`}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/**
 * Some recent_views() rows resolve (lib/resolveVenue.js) with an image URL
 * that 404s — a thin relation row's `image` field pointing at a broken
 * path is a data-shape issue upstream, not something to fix here, but a
 * broken <img> renders its alt text in normal text flow, which overflows
 * a 48px box no matter what the parent's overflow-hidden says. Catching
 * the load failure and swapping to a plain icon avoids that overflow
 * instead of fighting it with CSS.
 */
function Thumb({ venue: v, href }) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(v.images?.[0]) && !errored;

  return (
    <Link
      href={href}
      title={v.venueName}
      className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 ring-1 ring-transparent hover:ring-violet-300 dark:hover:ring-violet-700 transition-all flex items-center justify-center"
    >
      {showImage ? (
        <img
          src={v.images[0]}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <ImageOff size={16} className="text-gray-400 dark:text-gray-500" />
      )}
    </Link>
  );
}
