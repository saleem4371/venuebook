"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/LikedPropertiesPanel.jsx
 *
 * Right column, compact — real likedProperty() data (fetched once in
 * page.jsx as `liked`, same call collections/page.jsx's "Liked Properties"
 * tab uses), resolved through the same lib/resolveVenue.js helper as
 * RecentlyViewedPanel.jsx. Deliberately the same thumbnail-strip layout as
 * that panel — one visual language for "here's a few properties, go see
 * the rest" rather than inventing a second card style. "View All" routes
 * to the real /collections page's "Liked Properties" tab via ?tab=liked —
 * see collections/page.jsx's header comment for the param contract.
 */

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Heart, ImageOff } from "lucide-react";

import { SectionCard, SectionHeading, ViewAllLink } from "../shared/ui";
import { resolveVenue } from "@/lib/resolveVenue";

export default function LikedPropertiesPanel({ liked = [], loading = false, locale, country, flat = false }) {
  const t = useTranslations("profile.likedProperties");

  // Same 5-thumbnail cap as RecentlyViewedPanel for the same reason — a
  // 5-col grid (not a fixed-width flex row) shrinks each tile just enough
  // to fit one more real preview than a 4-col row would, while still
  // stretching to fill the card's actual width instead of leaving dead
  // space to the right on a wider (xl breakpoint, 320px) right column.
  // When there are more than 5, the last tile dims and shows "+N" instead
  // of silently cutting off — see RecentlyViewedPanel.jsx's Thumb comment.
  const resolved = useMemo(() => liked.map(resolveVenue).filter(Boolean), [liked]);
  const venues = resolved.slice(0, 5);
  const moreCount = resolved.length - venues.length;

  // Nothing to show and nothing loading — skip the section rather than
  // taking up a card just to say "properties you like will show up here."
  if (!loading && venues.length === 0) return null;

  return (
    <SectionCard flat={flat}>
      <SectionHeading
        compact
        title={t("title")}
        icon={
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-50 dark:bg-red-900/20">
            <Heart size={12} className="text-[#FF3040]" />
          </span>
        }
        action={
          <ViewAllLink href={`/${locale}/${country}/collections?tab=liked`} small>
            {t("viewAll")}
          </ViewAllLink>
        }
      />

      {loading ? (
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-1.5">
          {venues.map((v, i) => (
            <Thumb
              key={v.childVenueId}
              venue={v}
              href={`/${locale}/${country}/search/${v.category || "venues"}/${v.childVenueId}`}
              moreCount={i === venues.length - 1 ? moreCount : 0}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/** Same broken-image fallback as RecentlyViewedPanel.jsx's Thumb — see
 *  that file's comment for why onError swaps to an icon instead of letting
 *  a 404'd <img> overflow the 48px box with its alt text. `moreCount` > 0
 *  on the last tile dims it and overlays "+N" — same convention. */
function Thumb({ venue: v, href, moreCount = 0 }) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(v.images?.[0]) && !errored;

  return (
    <Link
      href={href}
      title={v.venueName}
      className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 ring-1 ring-transparent hover:ring-[#FF3040]/40 transition-all flex items-center justify-center"
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
      {moreCount > 0 && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-[1px] text-white text-[14px] font-bold tracking-tight">
          +{moreCount}
        </span>
      )}
    </Link>
  );
}
