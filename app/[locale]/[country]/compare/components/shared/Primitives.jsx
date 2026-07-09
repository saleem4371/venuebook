"use client";

import { Disclosure } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { bestIndices, allEqual } from "../../utils/compareHelpers";

/* ═══════════════════════════════════════════════════════════════════════
   ComparisonSection — collapsible accordion (headlessui Disclosure) at
   every breakpoint. The entire header row is the toggle target (not just
   the chevron) on mobile, tablet, and desktop alike. No full-bleed hairline
   divider between sections anymore — with the header now a persistent,
   inset rounded card (see Disclosure.Button below), a full-width divider
   line ran wider than the card sitting right above it, an obvious mismatch.
   The card's own background plus its vertical margin already separates
   each section from the next.
   ═══════════════════════════════════════════════════════════════════════ */
export function ComparisonSection({ title, icon, children, defaultOpen = false }) {
  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8">
      <Disclosure defaultOpen={defaultOpen}>
        {({ open }) => (
          <>
            {/* Horizontal padding now lives on the section (above), leaving
                the button inset from both edges so its persistent tint reads
                as a rounded card — matching the rounded-xl cards it sits
                above/below — instead of a flush rectangle with hard square
                corners against the page background. */}
            <Disclosure.Button
              className="w-full flex items-center justify-between gap-2 px-4 py-4 lg:py-5 my-2 rounded-xl
                         bg-gray-50 dark:bg-gray-900/40
                         hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
            >
              <span className="flex items-center gap-2 text-[15.5px] lg:text-[16px] font-medium text-gray-800 dark:text-gray-100">
                <span className="text-[var(--cat-accent)]">{icon}</span>
                {title}
              </span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="pt-2 pb-4">{children}</Disclosure.Panel>
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

   The property-name label above each value is hidden at lg+ (1024px):
   from that breakpoint up, this grid is column-aligned 1:1 with
   StickyCompareBar's mini-card row (both switch to a 4-column grid at
   the same lg breakpoint), so the name is already visible directly above
   in the same column — repeating it in every single row below added
   nothing but noise. Below lg the sticky bar collapses to a horizontal
   scroll (no reliable column alignment), so the label stays visible there.
   ═══════════════════════════════════════════════════════════════════════ */
export function ComparisonBlock({ label, icon, properties, values, direction, renderValue, zebra, bestLabel }) {
  const winners = bestIndices(values, direction);
  return (
    <div className={`rounded-xl p-3 mb-2.5 border ${zebra ? "bg-gray-50/70 dark:bg-gray-900/40" : "bg-white dark:bg-gray-900"} border-gray-100 dark:border-gray-800`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
        <h4 className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</h4>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {properties.map((p, i) => {
          const isBest = winners.has(i);
          const val = renderValue ? renderValue(values[i], p, i) : (values[i] ?? "—");
          return (
            <div
              key={p.childVenueId}
              className={`rounded-lg px-3 py-2 border transition-colors ${
                isBest
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800"
              }`}
            >
              <p className="lg:hidden text-[10px] text-gray-400 dark:text-gray-500 truncate mb-0.5">{p.venueName}</p>
              {/* Value and the "Lowest Price" style best-value badge share
                  one row (value left, badge right-aligned) instead of the
                  badge stacking on its own line underneath — same info,
                  half the vertical space. */}
              <div className="flex items-center justify-between gap-2">
                <p className={`text-[13px] font-semibold leading-snug truncate ${isBest ? "text-emerald-700 dark:text-emerald-300" : "text-gray-900 dark:text-gray-100"}`}>
                  {val ?? "—"}
                </p>
                {isBest && bestLabel && (
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                    {bestLabel}
                  </span>
                )}
              </div>
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
    <div className={`rounded-xl p-3 mb-2.5 border ${zebra ? "bg-gray-50/70 dark:bg-gray-900/40" : "bg-white dark:bg-gray-900"} border-gray-100 dark:border-gray-800`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
        <h4 className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {properties.map((p) => {
          const items = getItems(p) || {};
          return (
            <div key={p.childVenueId} className="rounded-lg px-3 py-2 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <p className="lg:hidden text-[10px] text-gray-400 dark:text-gray-500 truncate mb-1">{p.venueName}</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(items).map(([itemLabel, value]) => (
                  <span
                    key={itemLabel}
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
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
    <div className="mb-2.5">
      <p className="text-[11.5px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {properties.map((p) => {
          const items = getItems(p) || [];
          return (
            <div key={p.childVenueId} className="rounded-lg p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <p className="lg:hidden text-[10px] text-gray-400 dark:text-gray-500 truncate mb-1">{p.venueName}</p>
              <ul className="space-y-1">
                {items.map((it) => (
                  <li key={it.label} className="flex items-center gap-1.5 text-[11.5px]">
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

