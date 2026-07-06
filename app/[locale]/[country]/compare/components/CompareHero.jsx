"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

/**
 * Simple, clean hero. The page wrapper already accounts for the fixed
 * Navbar height (pt-16 / md:pt-[72px]) — this component only owns the
 * spacing *within* the hero itself.
 *
 * Title/subtitle sit on the left, the "Comparing N Properties" badge is
 * pinned top-right on the same row via flex + justify-between. On narrow
 * viewports flex-wrap drops the badge to its own line below the subtitle
 * instead of squeezing the row.
 */
export default function CompareHero({ count, children }) {
  const t = useTranslations("compare.hero");

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-8 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-[26px] md:text-[32px] font-semibold tracking-tight text-gray-900 dark:text-gray-50"
          >
            {t("title")}
          </motion.h1>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-2 max-w-lg">
            {t("subtitle")}
          </p>
        </div>

        {count > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/50 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-[12.5px] font-semibold text-violet-700 dark:text-violet-300 whitespace-nowrap">
              {t("comparingCount", { count })}
            </span>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
