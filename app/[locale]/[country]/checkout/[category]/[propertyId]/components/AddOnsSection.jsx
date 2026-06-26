"use client";

/**
 * AddOnsSection.jsx
 *
 * Section 3: Smart add-on recommendations.
 * Category-specific upsells with image, description, price, and Add toggle.
 * Updates parent state instantly which recalculates the invoice.
 */

import { useTranslations } from "next-intl";

/* ─── Add-on card ────────────────────────────────────────────────────── */
function AddOnCard({ addOn, isSelected, onToggle, format, tint, t }) {
  const tAddons = useTranslations("checkout.addons");

  // Parse category-specific translation key
  // e.g. "checkout.addons.venue.drone.name" → namespace "checkout.addons", key "venue.drone.name"
  // We pass nameKey and descKey as dot-paths after "checkout.addons."
  const [, , ...rest] = addOn.nameKey.split(".");
  const namePath = rest.join(".");
  const [, , ...descRest] = addOn.descKey.split(".");
  const descPath = descRest.join(".");

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all duration-200 ${
        isSelected
          ? "shadow-md"
          : "border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700"
      }`}
      style={
        isSelected
          ? { borderColor: tint.hex, boxShadow: tint.glow }
          : {}
      }
    >
      {/* Image */}
      <div className="relative h-36 sm:h-40 overflow-hidden">
        <img
          src={addOn.image}
          alt={namePath}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {isSelected && (
          <div
            className="absolute top-3 end-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-lg"
            style={{ backgroundColor: tint.hex }}
          >
            ✓
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 bg-white dark:bg-neutral-900">
        <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100 leading-snug">
          {tAddons(namePath)}
        </p>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed">
          {tAddons(descPath)}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
          <p className="text-sm font-bold text-gray-900 dark:text-neutral-100">
            {format(addOn.priceINR)}
          </p>
          <button
            onClick={() => onToggle(addOn.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              isSelected
                ? "text-white"
                : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
            }`}
            style={isSelected ? { backgroundColor: tint.hex } : {}}
          >
            {isSelected ? t("added") : t("add")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────── */
export default function AddOnsSection({
  tint,
  category,
  addOns,
  selectedAddOns,
  onToggle,
  format,
}) {
  const t = useTranslations("checkout.addons");

  if (!addOns || addOns.length === 0) return null;

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
        {selectedAddOns.size > 0 && (
          <div
            className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: tint.hex }}
          >
            {selectedAddOns.size} added
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addOns.map((addon) => (
          <AddOnCard
            key={addon.id}
            addOn={addon}
            isSelected={selectedAddOns.has(addon.id)}
            onToggle={onToggle}
            format={format}
            tint={tint}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
