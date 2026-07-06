"use client";

import { Disclosure } from "@headlessui/react";
import { ChevronDown, EyeOff, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { bestIndices, allEqual } from "../../utils/compareHelpers";

/* ═══════════════════════════════════════════════════════════════════════
   ComparisonSection — collapsible accordion (headlessui Disclosure) at
   every breakpoint. The entire header row is the toggle target (not just
   the chevron) on mobile, tablet, and desktop alike. A hairline divider
   below each section separates it from the next.
   ═══════════════════════════════════════════════════════════════════════ */
export function ComparisonSection({ title, icon, children, defaultOpen = false }) {
  return (
    <section className="max-w-[1400px] mx-auto border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <Disclosure defaultOpen={defaultOpen}>
        {({ open }) => (
          <>
            {/* Padding lives on the button itself (not the section) so the
                hover fill runs edge-to-edge, flush with the divider above
                and below — no gap between the hover bar and the borders. */}
            <Disclosure.Button
              className="w-full flex items-center justify-between gap-2 px-4 lg:px-8 py-4 lg:py-5
                         hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-[15.5px] lg:text-[16px] font-medium text-gray-800 dark:text-gray-100">
                <span className="text-violet-500">{icon}</span>
                {title}
              </span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 lg:px-8 pt-4 pb-4">{children}</Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ComparisonBlock — one comparison "row" rendered as premium cards,
   never as a <table>. One value-card per property, best value tinted
   green (never overused — only the true winner, and never when every
   property ties).
   ═══════════════════════════════════════════════════════════════════════ */
export function ComparisonBlock({ label, icon, properties, values, direction, renderValue, zebra, bestLabel }) {
  const winners = bestIndices(values, direction);
  return (
    <div className={`rounded-2xl p-4 mb-4 border ${zebra ? "bg-gray-50/70 dark:bg-gray-900/40" : "bg-white dark:bg-gray-900"} border-gray-100 dark:border-gray-800`}>
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
        <h4 className="text-[12.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</h4>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {properties.map((p, i) => {
          const isBest = winners.has(i);
          const val = renderValue ? renderValue(values[i], p, i) : (values[i] ?? "—");
          return (
            <div
              key={p.childVenueId}
              className={`rounded-xl p-4 border transition-colors ${
                isBest
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800"
              }`}
            >
              <p className="text-[10.5px] text-gray-400 dark:text-gray-500 truncate mb-1">{p.venueName}</p>
              <p className={`text-[13.5px] font-semibold leading-snug ${isBest ? "text-emerald-700 dark:text-emerald-300" : "text-gray-900 dark:text-gray-100"}`}>
                {val ?? "—"}
              </p>
              {isBest && bestLabel && (
                <span className="text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                  {bestLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * FieldRow — wraps ComparisonBlock with automatic "identical values"
 * detection. When every property has the same value and the user has
 * chosen to hide similarities, the row simply doesn't render.
 */
export function FieldRow({ showSimilarities, field, properties, zebra }) {
  const identical = allEqual(field.values);
  if (identical && !showSimilarities) return null;
  return (
    <ComparisonBlock
      label={field.label}
      icon={field.icon}
      properties={properties}
      values={field.values}
      direction={field.direction}
      renderValue={field.renderValue}
      bestLabel={field.bestLabel}
      zebra={zebra}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ChipGroupCard — grouped boolean fields shown as colored yes/no chips,
   one card per property (Event Suitability, Food, Activities, Comfort...).
   ═══════════════════════════════════════════════════════════════════════ */
export function ChipGroupCard({ label, icon, properties, getItems, zebra }) {
  return (
    <div className={`rounded-2xl p-4 mb-4 border ${zebra ? "bg-gray-50/70 dark:bg-gray-900/40" : "bg-white dark:bg-gray-900"} border-gray-100 dark:border-gray-800`}>
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
        <h4 className="text-[12.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {properties.map((p) => {
          const items = getItems(p) || {};
          return (
            <div key={p.childVenueId} className="rounded-xl p-4 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <p className="text-[10.5px] text-gray-400 dark:text-gray-500 truncate mb-2">{p.venueName}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(items).map(([itemLabel, value]) => (
                  <span
                    key={itemLabel}
                    className={`text-[10.5px] font-medium px-2 py-1 rounded-full ${
                      value
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                    }`}
                  >
                    {itemLabel}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FeatureGroupCard — grouped facility checklist (✓ / —), one card per
   property. Used instead of a long spreadsheet-style checklist.
   ═══════════════════════════════════════════════════════════════════════ */
export function FeatureGroupCard({ label, properties, getItems }) {
  return (
    <div className="mb-4">
      <p className="text-[12.5px] font-semibold text-gray-600 dark:text-gray-300 mb-2">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {properties.map((p) => {
          const items = getItems(p) || [];
          return (
            <div key={p.childVenueId} className="rounded-xl p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <p className="text-[10.5px] text-gray-400 dark:text-gray-500 truncate mb-2">{p.venueName}</p>
              <ul className="space-y-2">
                {items.map((it) => (
                  <li key={it.label} className="flex items-center gap-2 text-[12px]">
                    <span className={it.included ? "text-emerald-500 font-bold" : "text-gray-300 dark:text-gray-600"}>
                      {it.included ? "✓" : "—"}
                    </span>
                    <span className={it.included ? "text-gray-700 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}>
                      {it.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DifferenceToggle — "Hide Similarities / Show Similarities"
   ═══════════════════════════════════════════════════════════════════════ */
export function DifferenceToggle({ showSimilarities, onToggle, hiddenCount }) {
  const t = useTranslations("compare.differences");
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
      <p className="text-[12.5px] text-gray-500 dark:text-gray-400">
        {showSimilarities ? t("allRowsShown") : t("hiddenCount", { count: hiddenCount })}
      </p>
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-4 py-2 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/50 transition"
      >
        {showSimilarities ? <EyeOff size={14} /> : <Eye size={14} />}
        {showSimilarities ? t("hideSimilarities") : t("showSimilarities")}
      </button>
    </div>
  );
}

/** Count how many of the given fields have identical values across every property. */
export function countIdenticalFields(fields) {
  return fields.filter((f) => allEqual(f.values)).length;
}
