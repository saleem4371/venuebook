"use client";

/**
 * AddVenueModal — opened from an "Add" slot in the sticky compare bar
 * (see StickyCompareBar.jsx) or the category-switch notice. Lets the user
 * search the SAME category currently being compared and add another
 * property without leaving the compare page. Never offers a different
 * category here — that would mix comparisons, which the platform never does.
 */

import { useEffect, useState ,useMemo} from "react";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { Search, Star, MapPin, X, Plus, Users, BedDouble, Ruler, CheckCircle2 } from "lucide-react";
import { STATIC_VENUES } from "@/app/[locale]/[country]/search/[type]/data/staticVenues";
import { useCurrency } from "@/hooks/useCurrency";
import { MAX_COMPARE_PROPERTIES, getCategoryAccent, darkenHex } from "../utils/compareHelpers";


import {
  LoadProperty
} from "@/services/venues.service";

/**
 * STATIC_VENUES stores the full country name ("india", "dubai", ...) while
 * the route param is the short code ("in", "ae", ...) — same mapping
 * search/[type]/page.jsx uses. Without this, every result gets filtered
 * out (the code never equals the name) and the modal always looks empty,
 * for every category, not just farmstays.
 */
const COUNTRY_CODE_TO_NAME = { in: "india", ae: "dubai", us: "usa" };

/**
 * One quick, category-appropriate stat besides price — just enough for the
 * user to judge fit before adding a property sight-unseen (this modal has
 * no full detail page behind it). Mirrors the same field names used in
 * QuickCompareSummary/VenueCard so it stays consistent with the rest of
 * the compare experience.
 */
function getSecondaryMeta(v) {
  switch (v.category) {
    case "farmstays":
      return v.bedrooms ? { icon: BedDouble, label: `${v.bedrooms} Bedroom${v.bedrooms !== 1 ? "s" : ""}` } : null;
    case "studios":
      return v.studioArea || v.sizeSqft
        ? { icon: Ruler, label: `${Number(v.studioArea || v.sizeSqft).toLocaleString("en-IN")} Sq Ft` }
        : null;
    case "workspaces":
      return v.seats || v.seatingCapacity
        ? { icon: Users, label: `${v.seats || v.seatingCapacity} Seats` }
        : null;
    case "rentals":
      return v.maxGuests ? { icon: Users, label: `${v.maxGuests} Guests` } : null;
    case "venues":
    default:
      return v.maxGuests ? { icon: Users, label: `Up to ${v.maxGuests} Guests` } : null;
  }
}

function getPrice(v) {
  return v.pricing?.rate ?? v.minPrice ?? v.pricing?.startingPrice ?? v.hourlyPrice ?? null;
}

export default function AddVenueModal({
  open, onClose, category, excludeIds, country, onAdd, remainingSlots = MAX_COMPARE_PROPERTIES,
}) {
  const t = useTranslations("compare.addVenue");
  const tCat = useTranslations("categories");
  const { format } = useCurrency();
  const [query, setQuery] = useState("");
  const [addedIds, setAddedIds] = useState(() => new Set());


const [properties, setProperties] = useState([]);
const [loading, setLoading] = useState(false);

  const countryName = COUNTRY_CODE_TO_NAME[String(country || "in").toLowerCase()] || COUNTRY_CODE_TO_NAME.in;

 
  const remaining = Math.max(0, remainingSlots);
  const isFull = remaining <= 0;
  const accent = getCategoryAccent(category);

  useEffect(() => {
  if (!open) return;

  const loadProperties = async () => {
    try {
      setLoading(true);

      const payload = {
        type: category,
        filters: {},
        mapBounds: null,
        location: "",
        date: "",
        guests: "",
      };

      const res = await LoadProperty(payload);

      setProperties(res?.data?.data ?? []);
    } catch (err) {
      console.error("LoadProperty Error:", err);
    } finally {
      setLoading(false);
    }
  };

  loadProperties();
}, [open, category]);


  // const results = useMemo(() => {
  //   if (isFull) return [];
  //   const q = query.trim().toLowerCase();

  //   return STATIC_VENUES.filter((v) => {
  //     if (v.category !== category) return false;
  //     if (v.country && v.country.toLowerCase() !== countryName) return false;
  //     if (excludeIds?.has(v.childVenueId) || addedIds.has(v.childVenueId)) return false;
  //     if (!q) return true;
  //     const haystack = `${v.venueName} ${v.parentVenueName || ""} ${v.city || ""} ${v.state || ""}`.toLowerCase();
  //     return haystack.includes(q);
  //   }).slice(0, 30);

  // }, [query, category, countryName, excludeIds, addedIds, isFull]);

  const results = useMemo(() => {
  if (isFull) return [];

  const q = query.trim().toLowerCase();

  return properties
    .filter((v) => {
      if (excludeIds?.has(v.childVenueId) || addedIds.has(v.childVenueId))
        return false;

      if (!q) return true;

      const haystack = `${v.venueName} ${v.city || ""} ${v.state || ""}`.toLowerCase();

      return haystack.includes(q);
    })
    .slice(0, 30);
}, [properties, query, excludeIds, addedIds, isFull]);

  const handleAdd = (venue) => {
    if (isFull) return;
    setAddedIds((prev) => new Set(prev).add(venue.childVenueId));
    onAdd?.(venue.childVenueId);
  };

  const handleClose = () => {
    setQuery("");
    setAddedIds(new Set());
    onClose?.();
  };

   const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
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
              className="w-full max-w-lg max-h-[80vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
              style={{ "--modal-accent": accent }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <Dialog.Title className="text-[17px] font-semibold text-gray-900 dark:text-gray-50">
                  {t("modalTitle", { category: tCat(category) })}
                </Dialog.Title>
                <button
                  onClick={handleClose}
                  aria-label={t("close")}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {!isFull && (
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t("searchPlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13.5px] text-gray-800 dark:text-gray-100 outline-none focus:border-[var(--modal-accent)]"
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-3">
                {isFull ? (
                  // Reached MAX_COMPARE_PROPERTIES this session — stop
                  // offering more results instead of letting "Add" keep
                  // being clicked past the cap (previously unbounded).
                  <div className="flex flex-col items-center text-center py-10 px-4">
                    <span className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                      <CheckCircle2 size={22} />
                    </span>
                    <p className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-100">
                      {t("maxReachedHeading", { max: MAX_COMPARE_PROPERTIES })}
                    </p>
                    <p className="text-[12.5px] text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
                      {t("maxReachedBody", { category: tCat(category) })}
                    </p>
                  </div>
                ) : results.length === 0 ? (
                  <p className="text-[13px] text-gray-400 dark:text-gray-500 text-center py-10">{t("noResults")}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {results.map((v) => {
                      const price = getPrice(v);
                      const meta = getSecondaryMeta(v);
                      return (
                      <div
                        key={v.childVenueId}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
                      >
                      <img
  src={`${BASE_URL}/${
    typeof v.images?.[0] === "string"
      ? v.images[0]
      : v.images?.[0]?.image || v.coverImage
  }`}
  alt={v.venueName}
  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
/>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50 truncate">{v.venueName}</p>

                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="flex items-center gap-1 text-[11.5px] text-gray-400 dark:text-gray-500 truncate min-w-0">
                              <MapPin size={10} className="flex-shrink-0" />
                              <span className="truncate">{[v.city, v.state].filter(Boolean).join(", ")}</span>
                            </p>
                            {v.rating && (
                              <p className="flex items-center gap-1 text-[11.5px] font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                {Number(v.rating).toFixed(1)}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 mt-1">
                            {price != null && (
                              <span className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-100">
                                {format(price)}
                              </span>
                            )}
                            {meta && (
                              <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                <meta.icon size={10} className="flex-shrink-0 opacity-70" />
                                <span className="truncate">{meta.label}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAdd(v)}
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-3.5 py-2 rounded-xl flex-shrink-0 transition active:scale-[0.97] hover:opacity-95"
                          style={{ background: `linear-gradient(135deg, ${accent} 0%, ${darkenHex(accent)} 100%)` }}
                        >
                          <Plus size={13} />
                          {t("addButton")}
                        </button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
