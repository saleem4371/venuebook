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

import { useMemo,useEffect } from "react";
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
      className="relative rounded-2xl overflow-hidden border bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
      animate={{
        borderColor: isSelected ? tint.hex : undefined,
        boxShadow: isSelected ? tint.glow ?? "0 0 0 1px rgba(0,0,0,0)" : "0 0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2 }}
    >
      {/* Image */}
      <div className="h-40 bg-gray-100 dark:bg-neutral-800 overflow-hidden">
        <img
          src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${addOn.attachment}`}
          alt={addOn.add_on_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Selected Badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: -45, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-lg"
            style={{ backgroundColor: tint.hex }}
          >
            ✓
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {addOn.add_on_name}
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {addOn.more_details || "No description available"}
        </p>

        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800">
            {isUnit ? "Per Unit" : "Total"}
          </span>

          {isUnit && addOn.stock > 0 && (
            <span className="text-green-600">{addOn.stock} Available</span>
          )}
          {outOfStock && <span className="text-red-500">Out of stock</span>}
        </div>

        {/* Price + action — single footer, one source of truth */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {format(addOn.price)}
              {isUnit && <span className="text-xs font-normal text-gray-400"> /unit</span>}
            </p>
            {isUnit && qty > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {qty} × {format(addOn.price)} = <span className="font-semibold">{format(addOn.price * qty)}</span>
              </p>
            )}
          </div>

          {isUnit ? (
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => onToggle(addOn, "remove")}
                disabled={qty === 0}
                className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-neutral-800 disabled:opacity-40 font-semibold"
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
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onToggle(addOn, "toggle")}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: isSelected ? "#ef4444" : tint.hex }}
            >
              {isSelected ? "Remove" : "Add"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
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
  onTotalChange
}) {
  const t = useTranslations("checkout.addons");

  // Accept either prop name for the list; prefer `addons` if both are given.
  const items = addons ?? addOns ?? [];

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

  if (!items || items.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
      aria-label="Recommended Add-ons"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: tint.hex }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
              {t("title")}
            </h2>
            <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
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
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: tint.hex }}
            >
              {selectedAddOns.size} added
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="show"
        layout
        className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {items.map((addon) => {
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

      {/* Totals — unit subtotal, one-time subtotal, and grand total */}
      <AnimatePresence>
        {selectedAddOns?.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/40 space-y-1.5">
              {unitTotal > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Per-unit add-ons</span>
                  <span>{format(unitTotal)}</span>
                </div>
              )}
              {flatTotal > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>One-time add-ons</span>
                  <span>{format(flatTotal)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1.5 border-t border-gray-200 dark:border-neutral-700">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Add-ons total
                </span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={grandTotal}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="text-base font-bold text-gray-900 dark:text-white"
                  >
                    {format(grandTotal)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}