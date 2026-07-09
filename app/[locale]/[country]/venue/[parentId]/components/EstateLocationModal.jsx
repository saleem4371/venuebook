"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, MapPin } from "lucide-react";
import { buildMapSrc } from "../utils/estateMap";
import FarmstayAreaMap from "./FarmstayAreaMap";

/**
 * Full-size location explorer — opened from the "View all locations"
 * button next to the inline Location section. Left: a larger map. Right:
 * a scrollable list of this category's properties, clickable to re-center
 * the map. Scoped to whatever category the page has active — no tabs of
 * its own, since the page-level switcher already owns that job.
 */
export default function EstateLocationModal({ open, onClose, items, label, theme, isFarmstay }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? null);
  useEffect(() => {
    setSelectedId(items[0]?.id ?? null);
  }, [items]);

  const selected = items.find((l) => l.id === selectedId) ?? items[0] ?? null;
  const mapSrc = selected && !isFarmstay ? buildMapSrc(selected) : null;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className="w-full max-w-7xl flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
              style={{ height: "85vh" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <Dialog.Title className="text-[16px] font-semibold text-gray-900 dark:text-gray-50">
                  {label} Locations
                </Dialog.Title>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body: map left, scrollable list right */}
              <div className="flex-1 min-h-0 flex flex-col sm:flex-row p-4 gap-4">
                <div
                  className="relative flex-1 min-w-0 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-950"
                  style={{ minHeight: 240 }}
                >
                  <div className="absolute inset-0">
                    {isFarmstay ? (
                      <FarmstayAreaMap lat={selected?.lat} lng={selected?.lng} />
                    ) : mapSrc ? (
                      <iframe
                        key={mapSrc}
                        src={mapSrc}
                        className="w-full h-full border-0 block"
                        loading="lazy"
                        title="Property location map"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                        No locations to show
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full sm:w-80 shrink-0 overflow-y-auto space-y-2">
                  {items.length === 0 ? (
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 text-center py-10">No properties in this category yet.</p>
                  ) : (
                    items.map((l) => {
                      const isActive = l.id === selectedId;
                      return (
                        <button
                          key={l.id}
                          onClick={() => setSelectedId(l.id)}
                          className={`w-full flex items-start gap-3 p-3 rounded-2xl border text-left transition-colors ${
                            isActive
                              ? `${theme.bg} ${theme.border}`
                              : "bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isActive ? theme.solid : theme.bg}`}>
                            <MapPin size={13} className={isActive ? "text-white" : theme.text} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 leading-tight truncate">{l.name}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5">
                              {isFarmstay ? "Approximate area — exact location shared after booking" : l.address}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
