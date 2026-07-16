"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/CollectionsPanel.jsx
 *
 * Right column, compact — same real UserWishlistCategory/UserWishlist data
 * as CollectionsSection.jsx (fetched once in page.jsx, passed down), just a
 * leaner row list instead of an image-tile grid so it fits the fixed
 * right-column budget.
 *
 * Links deep-link into the real /collections page's "Collections" tab
 * (?tab=collections) instead of always landing on its default "Liked
 * Properties" tab — a single row also carries &collection=<id> so clicking
 * it pre-selects that one collection there, matching what the row visually
 * represents. See collections/page.jsx's header comment for the param
 * contract.
 */

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Folder } from "lucide-react";

import { SectionCard, SectionHeading, ViewAllLink } from "../shared/ui";
import { resolveCollectionIcon } from "@/app/[locale]/[country]/search/[type]/components/collectionIcons";

export default function CollectionsPanel({ collections = [], wishlist = [], loading = false, locale, country }) {
  const t = useTranslations("profile.collections");
  const preview = useMemo(() => collections.slice(0, 4), [collections]);
  const collectionsHref = `/${locale}/${country}/collections?tab=collections`;

  return (
    <SectionCard>
      <SectionHeading
        compact
        title={t("title")}
        icon={
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-900/30">
            <Folder size={12} className="text-violet-600" />
          </span>
        }
        action={
          <ViewAllLink href={collectionsHref} small>
            {t("viewAll")}
          </ViewAllLink>
        }
      />

      {loading ? (
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : preview.length === 0 ? (
        // The whole box is the link — a separate CTA button underneath
        // repeating the exact same words ("Start saving properties" /
        // "Start Saving Properties") was two actions doing one job.
        <a
          href={`/${locale}/${country}/search/venues`}
          className="flex flex-col items-center justify-center text-center rounded-2xl bg-gray-50/60 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/40 dark:hover:bg-violet-900/10 transition-colors py-5 px-4"
        >
          <span className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center mb-1.5">
            <Folder size={14} className="text-violet-600" />
          </span>
          <span className="text-[12px] font-semibold text-gray-900 dark:text-gray-50">{t("empty.title")}</span>
        </a>
      ) : (
        <div className="space-y-1">
          {preview.map((cat) => {
            const { Icon, color } = resolveCollectionIcon(cat);
            const count = wishlist.filter((i) => i.category_id === cat.id).length;
            return (
              <a
                key={cat.id}
                href={`${collectionsHref}&collection=${cat.id}`}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span
                  className="w-[26px] h-[26px] rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}1A` }}
                >
                  <Icon size={12} color={color} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11.5px] font-semibold text-gray-900 dark:text-gray-50 truncate">
                    {cat.name}
                  </span>
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">{count}</span>
              </a>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
