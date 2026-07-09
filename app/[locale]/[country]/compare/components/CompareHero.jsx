"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

/**
 * Simple, clean hero. The page wrapper already accounts for the fixed
 * Navbar height (pt-16 / md:pt-[72px]) — this component only owns the
 * spacing *within* the hero itself.
 *
 * Title/subtitle read per-category (Compare Venues / Compare Farmstays /
 * ...) via titleByCategory / subtitleByCategory instead of one generic
 * "Compare Properties" line for every category.
 *
 * Title/subtitle/badge all stack in a single left-aligned column. The
 * "Comparing N Properties" badge previously sat pinned top-right via
 * flex+justify-between, in the same on-screen region the globally fixed
 * universal category switcher (CategoryNavigator, `fixed`,
 * insetInlineEnd:40px, top:83px) occupies on every page — the two visibly
 * overlapped at common viewport widths. Stacking the badge under the
 * subtitle instead means it can never collide with that fixed element,
 * regardless of viewport width, without having to touch the shared global
 * nav component itself.
 */
export default function CompareHero({ count, category, children }) {
  const t = useTranslations("compare.hero");

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-6 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-[26px] md:text-[32px] font-semibold tracking-tight text-gray-900 dark:text-gray-50"
      >
        {t(`titleByCategory.${category}`)}
      </motion.h1>
      <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-2 max-w-lg">
        {t(`subtitleByCategory.${category}`)}
      </p>

      {count > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--cat-light)] border border-[var(--cat-border)] mt-3">
          <span className="w-2 h-2 rounded-full bg-[var(--cat-accent)]" />
          <span className="text-[12.5px] font-semibold text-[var(--cat-accent)] whitespace-nowrap">
            {t("comparingCount", { count })}
          </span>
        </div>
      )}

      {children}
    </div>
  );
}
