"use client";

/**
 * /app/[locale]/[country]/profile/components/CollectionsSection.jsx
 *
 * Read-only preview of the user's real collections — same source of truth
 * as /collections (UserWishlistCategory + UserWishlist, fetched once in
 * page.jsx and passed down here, so this section doesn't duplicate that
 * network call). "View All" hands off to the real, existing /collections
 * route where the full create/rename/move flows already live; this
 * preview intentionally doesn't reimplement them.
 */

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Folder } from "lucide-react";

import { SectionCard, SectionHeading, SkeletonCards, ViewAllLink } from "./shared/ui";
import { resolveCollectionIcon } from "@/app/[locale]/[country]/search/[type]/components/collectionIcons";

export default function CollectionsSection({ collections = [], wishlist = [], loading = false, locale, country }) {
  const t = useTranslations("profile.collections");

  const coverFor = (categoryId) => {
    const rel = wishlist.find((i) => i.category_id === categoryId);
    return rel?.image || rel?.images?.[0] || null;
  };

  const preview = useMemo(() => collections.slice(0, 4), [collections]);
  // Deep-links into the real /collections page's "Collections" tab — see
  // collections/page.jsx's header comment for the ?tab=/?collection= param
  // contract (mirrors widgets/CollectionsPanel.jsx's desktop version).
  const collectionsHref = `/${locale}/${country}/collections?tab=collections`;

  return (
    <SectionCard>
      <SectionHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30">
            <Folder size={16} className="text-violet-600" />
          </span>
        }
        action={<ViewAllLink href={collectionsHref}>{t("viewAll")}</ViewAllLink>}
      />

      {loading ? (
        <SkeletonCards count={4} />
      ) : preview.length === 0 ? (
        // The whole box is the link — a separate CTA button underneath
        // repeating the title's wording was two actions doing one job.
        <Link
          href={`/${locale}/${country}/search/venues`}
          className="flex flex-col items-center justify-center text-center rounded-3xl bg-gray-50/60 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/40 dark:hover:bg-violet-900/10 transition-colors py-8 px-5"
        >
          <span className="w-11 h-11 rounded-full bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center mb-3">
            <Folder size={22} className="text-violet-600" />
          </span>
          <p className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50 mb-1">{t("empty.title")}</p>
          <p className="text-[11.5px] text-gray-500 dark:text-gray-400 max-w-xs">{t("empty.subtitle")}</p>
        </Link>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {preview.map((cat) => {
            const { Icon, color } = resolveCollectionIcon(cat);
            const cover = coverFor(cat.id);
            const count = wishlist.filter((i) => i.category_id === cat.id).length;
            return (
              <motion.div
                key={cat.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`${collectionsHref}&collection=${cat.id}`}
                  className="group block rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)] transition-shadow"
                >
                  <div className="h-20 relative overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${color}26, ${color}0D)` }}
                      >
                        <Icon size={22} color={color} strokeWidth={1.75} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-50 truncate">{cat.name}</p>
                    <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5">{count}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
