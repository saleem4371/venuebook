"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRightLeft, Plus, Search } from "lucide-react";
import { CATEGORIES, CATEGORY_COLORS } from "@/config/categoryConfig";
import AddVenueModal from "./AddVenueModal";

/**
 * Shown whenever the focused category isn't ready to render a full
 * comparison — either it has 0 saved items (per spec: never show an empty
 * comparison table, show a "browse this category" prompt instead) or it
 * has exactly 1 (not enough to compare side by side yet). Keeps categories
 * from ever mixing on this page while still telling the user where their
 * other saved properties went.
 *
 * The primary action is now "Add {category}" — opens the same AddVenueModal
 * used on the full comparison grid, so the user can add straight from this
 * empty state instead of always having to leave the page to browse first.
 */
export default function CategorySwitchNotice({
  category, count = 0, otherCategories, onSwitch, onAdd, excludeIds, locale, country,
}) {
  const t = useTranslations("compare.categorySwitch");
  const tAdd = useTranslations("compare.addVenue");
  const tCat = useTranslations("categories");
  const [modalOpen, setModalOpen] = useState(false);
  const isEmpty = count === 0;
  const route = CATEGORIES[category]?.route || category;

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20">
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 p-8 text-center">
        <h3 className="text-[17px] font-semibold text-gray-900 dark:text-gray-50">
          {isEmpty ? t("emptyHeading", { category: tCat(category) }) : t("heading", { category: tCat(category) })}
        </h3>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
          {isEmpty ? t("emptyBody", { category: tCat(category) }) : t("body", { category: tCat(category) })}
        </p>

        {onAdd && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 text-white text-[13.5px] font-semibold px-6 py-3 rounded-2xl mt-6 transition active:scale-[0.98] hover:opacity-95"
            style={{ background: "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)" }}
          >
            <Plus size={15} />
            {tAdd("tileLabel", { category: tCat(category) })}
          </button>
        )}

        {isEmpty && (
          <Link
            href={`/${locale || "en"}/${country || "in"}/search/${route}`}
            className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-[12.5px] font-medium mt-4 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            <Search size={13} />
            {t("browseButton", { category: tCat(category) })}
          </Link>
        )}

        {otherCategories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {otherCategories.map((id) => {
              const colors = CATEGORY_COLORS[CATEGORIES[id].color];
              return (
                <button
                  key={id}
                  onClick={() => onSwitch(id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold border border-transparent transition hover:opacity-90 ${colors.light} ${colors.text}`}
                >
                  <ArrowRightLeft size={13} />
                  {t("switchButton", { category: tCat(id) })}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {onAdd && (
        <AddVenueModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          category={category}
          excludeIds={excludeIds}
          country={country}
          onAdd={onAdd}
        />
      )}
    </div>
  );
}
