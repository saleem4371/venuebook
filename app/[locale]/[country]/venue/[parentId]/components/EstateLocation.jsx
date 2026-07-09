"use client";

import { useMemo, useState, useEffect } from "react";
import { MapPin, Maximize2 } from "lucide-react";
import { buildMapSrc } from "../utils/estateMap";
import EstateLocationModal from "./EstateLocationModal";
import FarmstayAreaMap from "./FarmstayAreaMap";

/**
 * Location — map on the left, clickable list of this category's own
 * listings on the right. Fully driven by the page's active category
 * (no internal category tabs anymore — the switcher at the top of the
 * page already owns that job): switching categories swaps the pins,
 * the list, and the map itself. Venues show an exact pin; farmstays
 * only ever show the general area (see estateMap.js) for guest privacy.
 * Collapses entirely if this category has no listings with a location
 * on file, per the page's empty-data rule.
 */
export default function EstateLocation({ estate, categoryKey, label, theme }) {
  const items = useMemo(() => {
    return (estate.categories?.[categoryKey]?.listings ?? [])
      .filter((l) => l.address)
      .map((l) => ({ ...l, category: categoryKey }));
  }, [estate, categoryKey]);

  const [selectedId, setSelectedId] = useState(items[0]?.id ?? null);
  useEffect(() => {
    setSelectedId(items[0]?.id ?? null);
  }, [items]);

  const selected = items.find((l) => l.id === selectedId) ?? null;
  const [modalOpen, setModalOpen] = useState(false);

  if (items.length === 0) return null;

  const isFarmstay = categoryKey === "farmstays";
  const mapSrc = !isFarmstay ? (buildMapSrc(selected) ?? estate.mapEmbedSrc) : null;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{label} Locations</h2>
        {items.length > 4 && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors shrink-0"
          >
            <Maximize2 size={12} /> View all locations
          </button>
        )}
      </div>

      {selected && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selected.name}</span>
          <span className="text-sm text-gray-400 dark:text-gray-500">·</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isFarmstay ? "Approximate area — exact location shared after booking" : selected.address}
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Map */}
        <div
          className="relative flex-1 min-w-0 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08] shadow-sm bg-gray-100 dark:bg-gray-900"
          style={{ minHeight: 260 }}
        >
          <div className="absolute inset-0">
            {isFarmstay ? (
              <FarmstayAreaMap lat={selected?.lat} lng={selected?.lng} />
            ) : (
              <iframe
                key={mapSrc}
                src={mapSrc}
                className="w-full h-full border-0 block"
                loading="lazy"
                title="Estate location map"
              />
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <div className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 border border-gray-100 dark:border-white/[0.08]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                {items.length} active location{items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Listing picker */}
        <div className="w-full md:w-[300px] shrink-0 space-y-2">
          {items.map((l) => {
            const isActive = l.id === selectedId;
            return (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-colors ${
                  isActive
                    ? `${theme.bg} ${theme.border}`
                    : "bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isActive ? theme.solid : theme.bg}`}>
                  <MapPin size={13} className={isActive ? "text-white" : theme.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 leading-tight truncate">{l.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5 truncate">
                    {isFarmstay ? "Approximate area only" : l.address}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-500">Active</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <EstateLocationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        items={items}
        label={label}
        theme={theme}
        isFarmstay={isFarmstay}
      />
    </div>
  );
}
