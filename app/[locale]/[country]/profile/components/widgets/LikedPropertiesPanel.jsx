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

export default function LikedPropertiesPanel({ liked = [], loading = false, locale, country }) {
  const t = useTranslations("profile.likedProperties");

  // Same 4-thumbnail cap as RecentlyViewedPanel for the same reason — the
  // narrowest right-column width only fits about 4 of these 48px tiles.
  const venues = useMemo(() => liked.map(resolveVenue).filter(Boolean).slice(0, 4), [liked]);

  // Nothing to show and nothing loading — skip the section rather than
  // taking up a card just to say "properties you like will show up here."
  if (!loading && venues.length === 0) return null;

  return (
    <SectionCard>
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

/** Same broken-image fallback as RecentlyViewedPanel.jsx's Thumb — see
 *  that file's comment for why onError swaps to an icon instead of letting
 *  a 404'd <img> overflow the 48px box with its alt text. */
function Thumb({ venue: v, href }) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(v.images?.[0]) && !errored;

  return (
    <Link
      href={href}
      title={v.venueName}
      className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 ring-1 ring-transparent hover:ring-[#FF3040]/40 transition-all flex items-center justify-center"
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
