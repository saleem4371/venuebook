"use client";

import { Utensils, Users, Package2, Eye } from "lucide-react";
import ModalBase from "./ModalBase";
import PriceDisplay from "../ui/PriceDisplay";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/hooks/useCurrency";

const TYPE_KEYS = { 1: "pkg.adult", 2: "pkg.child", 0: "pkg.all_ages" };
const FOOD_KEYS = { 1: "pkg.veg", 2: "pkg.non_veg", 0: "pkg.food_both" };



const FOOD_DOT = { 1: "bg-emerald-500", 2: "bg-rose-500", 0: "bg-slate-400" };

/**
 * ViewPackageModal — immersive right-panel view of a package's included items.
 * Uses ModalBase variant="panel" with max-w-2xl for a spacious layout.
 */
export default function ViewPackageModal({
  open,
  onClose,
  packageData,
}) {
  const t = useTranslations();
  const { format } = useCurrency();
  if (!packageData) return null;

  const { name, price, details, food_preference, package_type } = packageData;
  const categoryKeys = Object.keys(details || {});
  const totalItems   = categoryKeys.reduce((acc, k) => acc + details[k].length, 0);

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={name}
      subtitle={`${format(Number(price) || 0)} · ${t("pkg.package_details")}`}
      maxWidth="max-w-2xl"
      variant="panel"
    >
      <div className="space-y-6">

        {/* ── Package meta pills ───────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {/* Price */}
          <div className="flex items-center gap-1.5 rounded-full border border-violet-200/60 bg-violet-50 px-3 py-1.5 dark:border-violet-500/20 dark:bg-violet-500/10">
            <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-300">
              {format(Number(price) || 0)}
            </span>
            <span className="text-[10px] text-violet-500/70 dark:text-violet-400/70">/ pax</span>
          </div>

          {/* Type */}
          {package_type != null && (
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
              <Users size={11} className="text-slate-500 dark:text-slate-400" />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {t(TYPE_KEYS[package_type] ?? "pkg.all_ages")}
              </span>
            </div>
          )}

          {/* Food */}
          {food_preference != null && (
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
              <span className={`h-2 w-2 flex-shrink-0 rounded-full ${FOOD_DOT[food_preference] ?? "bg-slate-400"}`} />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {t(FOOD_KEYS[food_preference] ?? "pkg.food_both")}
              </span>
            </div>
          )}

          {/* Total items */}
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
            <Package2 size={11} className="text-slate-500 dark:text-slate-400" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {totalItems} {t("pkg.menu_items")}
            </span>
          </div>
        </div>

        {/* ── Category sections ────────────────────────── */}
        {categoryKeys.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-white/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
              <Eye size={18} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("pkg.no_items_in_package")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categoryKeys.map((catName) => (
              <div
                key={catName}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]"
              >
                {/* Category header */}
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg,#a44bf3,#499ce8)" }}
                  >
                    <Utensils size={12} strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {catName}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {details[catName].length} items
                    </p>
                  </div>
                </div>

                {/* Item list */}
                <ul className="space-y-1.5">
                  {details[catName].map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2 dark:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                          item.food_pre === 1 ? "bg-emerald-500" : item.food_pre === 2 ? "bg-rose-500" : "bg-slate-400"
                        }`} />
                        <span className="truncate text-xs text-slate-700 dark:text-slate-200">
                          {item.name}
                        </span>
                      </div>
                      <PriceDisplay
                        amount={item.price}
                        className="ml-2 flex-shrink-0 text-[11px] font-medium text-slate-500 dark:text-slate-400"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ───────────────────────────────────── */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {t("pkg.close")}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
