"use client";

import { useTranslations } from "next-intl";

/**
 * FoodBadge — Veg / Non-Veg indicator chip.
 * food_pre: 0 = none/both | 1 = veg | 2 = non-veg
 * All labels sourced from pkg.veg / pkg.non_veg translations.
 */
export default function FoodBadge({ type, size = "sm" }) {
  const t = useTranslations();
  if (!type || type === 0) return null;

  const isVeg = type === 1;

  const dotCls = isVeg ? "bg-emerald-500" : "bg-rose-500";
  const textCls = isVeg
    ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20"
    : "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20";

  const label = (() => {
    try { return isVeg ? t("pkg.veg") : t("pkg.non_veg"); }
    catch { return ""; }
  })();

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${textCls} ${
        size === "xs" ? "px-1.5 text-[9px]" : ""
      }`}
    >
      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dotCls}`} />
      {label}
    </span>
  );
}
