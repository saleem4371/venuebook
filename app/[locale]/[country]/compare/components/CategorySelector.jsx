"use client";

/**
 * CategorySelector — the compare page's own category switcher.
 *
 * Per spec this is a dropdown ("🏛 Venues ▾") placed directly beneath the
 * page heading, not a floating pill bar — that's why the platform-wide
 * floating CategoryNavigator is suppressed on this route in ClientLayout.jsx
 * (it was also the source of an earlier z-index collision with this page's
 * sticky comparison bar). This dropdown reads/writes the exact same shared
 * state (CATEGORY_ORDER / useCategory) as every other listing page, so
 * switching here stays fully consistent with the rest of the platform.
 *
 * Every live category is always listed (even ones with 0 saved items) with
 * its current compare count, matching the spec's example:
 *   Venues (4)   Farmstays (2)   Studios (1)   Workspaces (0)   Rentals (3)
 *
 * Rendered as a plain solid card (no blur, no glass) at a high z-index
 * (z-40) so the open panel always draws above the sticky comparison bar
 * (z-30) beneath it. It isn't portaled/floating, so there's no clipping
 * risk from any ancestor container.
 */

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { ChevronDown, Camera, Building2, Car, Sparkles } from "lucide-react";
import { useCategory } from "@/context/CategoryContext";
import { CATEGORY_ORDER, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS as SHARED_CATEGORY_ICONS } from "@/config/categoryConfig";

const CATEGORY_ICONS = {
  ...SHARED_CATEGORY_ICONS, // venues → Building2, farmstays → TreePine (platform standard)
  studios: Camera,
  workspaces: Building2,
  rentals: Car,
  experiences: Sparkles,
};

export default function CategorySelector({ counts, onSelect }) {
  const t = useTranslations("categories");
  const tSwitcher = useTranslations("compare.categorySwitcher");
  const { activeCategory, setActiveCategory } = useCategory();

  const selectCategory = (id) => {
    setActiveCategory(id);
    // Lets the page tell the difference between "this is just the site-wide
    // default" and "the user explicitly chose this category here" — the
    // latter must always be honored, even for a category with 0 items,
    // so picking an empty category from this dropdown reliably shows that
    // category's own empty state instead of silently jumping elsewhere.
    onSelect?.(id);
  };

  // Only offer categories that are actually live on the platform today.
  const listed = CATEGORY_ORDER.filter((id) => !CATEGORIES[id]?.comingSoon);
  if (listed.length <= 1) return null;

  const currentId = listed.includes(activeCategory) ? activeCategory : listed[0];
  const CurrentIcon = CATEGORY_ICONS[currentId] || Landmark;
  const currentColors = CATEGORY_COLORS[CATEGORIES[currentId]?.color];

  return (
    <div className="mt-4">
      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">
        {tSwitcher("label")}
      </p>

      <Menu as="div" className="relative inline-block z-40">
        <Menu.Button
          className="inline-flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl border text-[13.5px] font-semibold transition
                     bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100
                     hover:border-gray-300 dark:hover:border-gray-700"
        >
          <span className={currentColors?.text}>
            <CurrentIcon size={16} />
          </span>
          {t(currentId)}
          <ChevronDown size={15} className="text-gray-400" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-150"
          enterFrom="opacity-0 -translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
          <Menu.Items
            className="absolute left-0 mt-2 w-64 origin-top-left rounded-2xl bg-white dark:bg-gray-900
                       border border-gray-100 dark:border-gray-800 shadow-[0_16px_40px_rgba(0,0,0,0.12)]
                       py-2 z-40 focus:outline-none"
          >
            {listed.map((id) => {
              const Icon = CATEGORY_ICONS[id] || Landmark;
              const colors = CATEGORY_COLORS[CATEGORIES[id]?.color];
              const count = counts?.[id] || 0;
              const isActive = id === currentId;
              return (
                <Menu.Item key={id}>
                  {({ active }) => (
                    <button
                      onClick={() => selectCategory(id)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-[13.5px] font-medium transition
                                  ${isActive ? `${colors?.light} ${colors?.text}` : "text-gray-700 dark:text-gray-200"}
                                  ${active && !isActive ? "bg-gray-50 dark:bg-gray-800/60" : ""}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? colors?.text : "text-gray-400"} />
                        {t(id)}
                      </span>
                      <span className="text-[12px] font-semibold text-gray-400 dark:text-gray-500">({count})</span>
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
