"use client";

/**
 * AddOnsSection.jsx
 *
 * Section 3: Smart add-on recommendations.
 * Category-specific upsells with image, description, price, and Add toggle.
 *
 * Controlled component: `selectedAddOns` (Map<add_on_id, {addon, qty}>) and
 * `onToggle(addon, action)` are owned by the parent, matching:
 *
 *   <AddOnsSection
 *     tint={tint}
 *     category={normCat}
 *     addOns={catConfig.addOns}
 *     selectedAddOns={selectedAddOns}
 *     onToggle={toggleAddOn}
 *     format={format}
 *     addons={addons}
 *   />
 *
 * `action` is one of: "add" | "remove" (unit-type addons) or "toggle"
 * (flat/one-time addons). The parent's `toggleAddOn` must branch on it —
 * see toggleAddOn-snippet.js for the matching implementation.
 */

import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

/* ─── Animation variants ────────────────────────────────────────────── */
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
  },
};

/* ─── Add-on card ────────────────────────────────────────────────────── */
function AddOnCard({ addOn, isSelected, qty, onToggle, format, tint, t }) {
  const isUnit = addOn.type === "unit";
  const outOfStock = isUnit && addOn.stock === 0;

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="relative rounded-2xl overflow-hidden border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
      animate={{
        borderColor: isSelected ? tint.hex : undefined,
        boxShadow: isSelected ? tint.glow ?? "0 0 0 1px rgba(0,0,0,0)" : "0 0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.25 }}
    >
      {/* Image */}
      <div className="h-40 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img
          src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${addOn.attachment}`}
          alt={addOn.add_on_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Popular Badge */}
      {addOn.popular && (
        <div
          className="absolute top-3 start-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${tint.hex}, ${tint.activeBg ?? tint.hex})` }}
        >
          {t("popular")}
        </div>
      )}


      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {addOn.add_on_name}
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {addOn.more_details || t("no_description")}
        </p>

        <div className="flex items-center justify-between gap-2 mt-3 text-xs">
          <span className="shrink-0 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
            {isUnit ? t("per_unit_badge") : t("flat_badge")}
          </span>

          {isUnit && addOn.stock > 0 && (
            <span className="text-green-600 truncate">{t("available", { count: addOn.stock })}</span>
          )}
          {outOfStock && <span className="text-red-500 truncate">{t("out_of_stock")}</span>}
        </div>

        {/* Price + action — single footer, one source of truth */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {format(addOn.price)}
              {isUnit && <span className="text-xs font-normal text-gray-400"> /unit</span>}
            </p>
            {isUnit && qty > 0 && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {qty} × {format(addOn.price)} = <span className="font-semibold">{format(addOn.price * qty)}</span>
              </p>
            )}
          </div>

          {isUnit ? (
            qty === 0 ? (
              // First tap is just "Add" — the -/qty/+ stepper only appears
              // once there's actually a quantity to step, instead of
              // showing a "- 0 +" row before anything's been added.
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onToggle(addOn, "add")}
                disabled={outOfStock}
                className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
                style={{ backgroundColor: tint.hex }}
              >
                {t("add")}
              </motion.button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggle(addOn, "remove")}
                  className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 disabled:opacity-40 font-semibold"
                >
                  −
                </motion.button>

                <span className="w-6 text-center font-semibold overflow-hidden inline-block h-5 relative">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={qty}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0"
                    >
                      {qty}
                    </motion.span>
                  </AnimatePresence>
                </span>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggle(addOn, "add")}
                  disabled={outOfStock || qty >= (addOn.stock ?? Infinity)}
                  className="w-8 h-8 rounded-lg text-white disabled:opacity-40 font-semibold"
                  style={{ backgroundColor: tint.hex }}
                >
                  +
                </motion.button>
              </div>
            )
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onToggle(addOn, "toggle")}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: isSelected ? "#ef4444" : tint.hex }}
            >
              {isSelected ? t("remove") : t("add")}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Skeleton card (loading state) ─────────────────────────────────── */
function AddOnSkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-4 w-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-9 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse mt-2" />
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────── */
export default function AddOnsSection({
  tint,
  category,
  addOns,   // some callers pass the category-config list under this name
  addons,   // others pass the resolved list under this name
  selectedAddOns,
  onToggle,
  format,
  onTotalChange,
  loading = false,
}) {
  const t = useTranslations("checkout.addons");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Accept either prop name for the list; prefer `addons` if both are given.
  const items = addons ?? addOns ?? [];

  // Distinct addon categories (falls back to a single implicit group when
  // the data doesn't carry one) — purely additive, doesn't require every
  // addon source to supply `category_name`.
  const addonCategories = useMemo(() => {
    const names = new Set();
    items.forEach((addon) => {
      const name = addon.category_name || addon.category;
      if (name) names.add(name);
    });
    return Array.from(names);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (categoryFilter === "all") return items;
    return items.filter((addon) => (addon.category_name || addon.category) === categoryFilter);
  }, [items, categoryFilter]);

  // Split totals: unit-priced add-ons vs one-time/"total" add-ons, plus grand total
  // const { unitTotal, flatTotal, grandTotal } = useMemo(() => {
  //   let unit = 0;
  //   let flat = 0;
  //   (selectedAddOns ?? new Map()).forEach(({ addon, qty }) => {
  //     const price = addon?.price || 0;
  //     if (addon?.type === "unit") unit += price * (qty || 1);
  //     else flat += price;
  //   });
  //   return { unitTotal: unit, flatTotal: flat, grandTotal: unit + flat };
  // }, [selectedAddOns]);

  const { unitTotal, flatTotal, grandTotal } = useMemo(() => {
  let unit = 0;
  let flat = 0;

  (selectedAddOns ?? new Map()).forEach(({ addon, qty }) => {
    const price = Number(addon?.price || 0);

    if (addon?.type === "unit") {
      unit += price * (qty || 1);
    } else {
      flat += price;
    }
  });

  return {
    unitTotal: unit,
    flatTotal: flat,
    grandTotal: unit + flat,
  };
}, [selectedAddOns]);


useEffect(() => {
  onTotalChange?.({
    unitTotal,
    flatTotal,
    grandTotal,
    selectedAddOns,
  });
}, [unitTotal, flatTotal, grandTotal, selectedAddOns, onTotalChange]);

  if (!loading && (!items || items.length === 0)) return null;

  return (
    <section
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
      aria-label="Recommended Add-ons"
    >
      {/* Header — icon badge + title/subtitle, pulse-placeholder while
          loading like BookingReviewCard's header, instead of flashing the
          real "Recommended Add-ons" copy in ahead of the actual content. */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
        {loading ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
            <div className="min-w-0 space-y-1.5">
              <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-3 w-44 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: tint.hex }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {t("title")}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <AnimatePresence>
              {selectedAddOns?.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap"
                  style={{ backgroundColor: tint.hex }}
                >
                  {t("added_count", { count: selectedAddOns.size })}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {loading ? (
        <>
          {/* Skeleton tabs */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 flex gap-2 overflow-x-auto">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="h-9 w-20 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
          {/* Skeleton grid */}
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((n) => (
              <AddOnSkeletonCard key={n} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Category tabs — only shown when the data actually carries categories */}
          {addonCategories.length > 1 && (
            <div className="px-4 sm:px-6 pt-4 sm:pt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === "all"
                    ? "text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
                style={categoryFilter === "all" ? { backgroundColor: tint.hex } : {}}
              >
                {t("all_categories")}
              </button>
              {addonCategories.map((catName) => (
                <button
                  key={catName}
                  onClick={() => setCategoryFilter(catName)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === catName
                      ? "text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                  style={categoryFilter === catName ? { backgroundColor: tint.hex } : {}}
                >
                  {catName}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            layout
            className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {filteredItems.map((addon) => {
              const selected = selectedAddOns?.get(addon.add_on_id);
              return (
                <AddOnCard
                  key={addon.add_on_id}
                  addOn={addon}
                  isSelected={Boolean(selected)}
                  qty={selected?.qty || 0}
                  onToggle={onToggle}
                  format={format}
                  tint={tint}
                  t={t}
                />
              );
            })}
          </motion.div>
        </>
      )}

      {/* Add-ons subtotal/grand-total intentionally not repeated here — the
          sidebar's "Add-ons" breakdown group (BookingSummary.jsx) is the
          single source of truth for pricing, this section only selects. */}
    </section>
  );
}