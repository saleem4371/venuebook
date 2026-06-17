"use client";

/**
 * ListingsSearchBar
 * ─────────────────
 * Reuses the EXACT homepage search components:
 *   LocationAutoComplete → same destination panel, same suggestions
 *   DatePicker           → same calendar popup
 *   GuestPicker          → same guest selector
 *   MobileSearchSheet    → same mobile bottom sheet
 *
 * Layout mirrors HeroSection's SearchField exactly.
 * Container adapted to a light page background:
 *   • white bg / gray border instead of dark glass backdrop
 *   • field label color flipped to gray
 *   • field dividers use gray border classes
 *   • input text overridden to dark via textClass / lightMode props
 *   • picker DROPDOWNS remain unchanged (dark glass — same as homepage)
 *
 * Property-type chips and filter button are NOT here.
 * They live in <FilterRow /> above this component.
 */

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import LocationAutoComplete from "@/app/[locale]/[country]/home/components/LocationAutoComplete";
import DatePicker           from "@/app/[locale]/[country]/home/components/DatePicker";
import GuestPicker          from "@/app/[locale]/[country]/home/components/GuestPicker";
import MobileSearchSheet    from "@/app/[locale]/[country]/home/components/MobileSearchSheet";

import { useCategory }    from "@/context/CategoryContext";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

/* ── Per-category field schema (mirrors HeroSection SEARCH_CONFIG) ── */
const SEARCH_CONFIG = {
  venues: [
    { id: "location",  label: "Location",    type: "location",  placeholder: "City or area"       },
    { id: "date",      label: "Event Date",  type: "date"                                          },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests"                },
  ],
  farmstays: [
    { id: "location",  label: "Destination", type: "location",  placeholder: "Where to?"          },
    { id: "checkin",   label: "Check In",    type: "date"                                          },
    { id: "checkout",  label: "Check Out",   type: "date"                                          },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests_detailed"       },
  ],
  studios: [
    { id: "location",  label: "Location",    type: "location",  placeholder: "City or studio"     },
    { id: "startdate", label: "Start",       type: "datetime"                                      },
    { id: "enddate",   label: "End",         type: "datetime"                                      },
    { id: "guests",    label: "Team Size",   type: "guests",    guestType: "attendees"             },
  ],
  rentals: [
    { id: "location",  label: "Location",    type: "location",  placeholder: "City or area"       },
    { id: "startdate", label: "Start Date",  type: "date"                                          },
    { id: "enddate",   label: "End Date",    type: "date"                                          },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests"                },
  ],
  workspaces: [
    { id: "location",  label: "Location",    type: "location",  placeholder: "City or area"       },
    { id: "startdate", label: "Start Date",  type: "date"                                          },
    { id: "enddate",   label: "End Date",    type: "date"                                          },
    { id: "guests",    label: "Team Size",   type: "guests",    guestType: "attendees"             },
  ],
  experiences: [
    { id: "location",  label: "Location",    type: "location",  placeholder: "City or area"       },
    { id: "date",      label: "Date",        type: "date"                                          },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests"                },
  ],
};

/* ── Light-mode input overrides
   Applied to the INPUT ELEMENT only — dropdowns stay dark (homepage behavior) ── */
const TEXT_CLS        = "text-gray-800 dark:text-white";
const PLACEHOLDER_CLS = "placeholder-gray-400 dark:placeholder-white/35";
const CLEAR_CLS       = "text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/80";

/* ════════════════════════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════════════════════════ */
/* Parse a YYYY-MM-DD string as a local-timezone Date (avoids UTC midnight shift) */
function parseDateParam(str) {
  if (!str) return null;
  const parts = str.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

export default function ListingsSearchBar({ onSearch, countryCode = "in", defaultValues = {} }) {
  const { activeCategory } = useCategory();
  const tint   = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const fields = SEARCH_CONFIG[activeCategory] ?? SEARCH_CONFIG.venues;

  /* Initialise dates from URL params (YYYY-MM-DD strings) */
  const [dates, setDates] = useState(() => ({
    date:      parseDateParam(defaultValues.date),
    checkin:   parseDateParam(defaultValues.checkin),
    checkout:  parseDateParam(defaultValues.checkout),
    startdate: parseDateParam(defaultValues.startdate),
    enddate:   parseDateParam(defaultValues.enddate),
  }));

  const [searchData,  setSearchData]  = useState({ location: defaultValues.location || "" });
  const [sheetOpen,   setSheetOpen]   = useState(false);

  const handleSearch = () => onSearch?.({ ...searchData, dates });

  /* ── DESKTOP bar ───────────────────────────────────────────── */
  return (
    <>
      <div className="hidden md:flex items-stretch bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-visible mx-4 mt-2.5 mb-2">

        {fields.map((field, i) => (
          <SearchField
            key={`${activeCategory}-${field.id}`}
            field={field}
            tint={tint}
            category={activeCategory}
            isLast={i === fields.length - 1}
            dateValue={dates[field.id] ?? null}
            onDateChange={(v) => setDates((p) => ({ ...p, [field.id]: v }))}
            setSearchData={setSearchData}
            countryCode={countryCode}
            defaultLocation={field.type === "location" ? (defaultValues.location || "") : ""}
            defaultGuests={field.type === "guests"   ? (defaultValues.guests   || "")  : ""}
          />
        ))}

        {/* Search button */}
        <div className="flex items-center px-2.5 py-1.5">
          <button
            onClick={handleSearch}
            className="flex items-center gap-1.5 font-semibold text-sm px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all whitespace-nowrap text-white"
            style={{ background: tint.hex, boxShadow: tint.activeGlow }}
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* ── MOBILE compact trigger → MobileSearchSheet ─────────── */}
      <button
        onClick={() => setSheetOpen(true)}
        className="md:hidden mx-4 mt-3 mb-0 w-[calc(100%-2rem)] flex items-center justify-between border text-left rounded-xl px-4 py-3.5 transition active:scale-[0.98] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
            Where to?
          </span>
          <span className="text-sm text-gray-500 dark:text-white/70">
            Search location, date, guests…
          </span>
        </div>
        <div className="p-2 rounded-lg text-white" style={{ background: tint.hex }}>
          <MagnifyingGlassIcon className="w-4 h-4" />
        </div>
      </button>

      {/* Same MobileSearchSheet used on homepage */}
      <MobileSearchSheet open={sheetOpen} setOpen={setSheetOpen} />
    </>
  );
}

/* ── SearchField
   Mirrors HeroSection's SearchField exactly.
   Container colors adapted for white page; picker components unchanged.
   ────────────────────────────────────────────────────────────────── */
function SearchField({ field, tint, category, isLast, dateValue, onDateChange, setSearchData, countryCode, defaultLocation = "", defaultGuests = "" }) {
  return (
    <div
      className={[
        "relative flex-1 min-w-0 px-4 py-2.5 overflow-visible",
        !isLast ? "border-e border-gray-100 dark:border-white/10" : "",
      ].join(" ")}
    >
      {/* Field label — smaller, lighter; value text below should dominate */}
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400/80 dark:text-white/30 mb-1 whitespace-nowrap">
        {field.label}
      </p>

      {field.type === "location" && (
        <LocationAutoComplete
          category={category}
          tint={tint}
          placeholder={field.placeholder}
          textClass={TEXT_CLS}
          placeholderClass={PLACEHOLDER_CLS}
          clearClass={CLEAR_CLS}
          lightDropdown={true}
          countryCode={countryCode}
          defaultValue={defaultLocation}
          onSelect={(value) => setSearchData((p) => ({ ...p, location: value }))}
        />
      )}

      {field.type === "date" && (
        <DatePicker
          mode="single"
          tint={tint}
          startDate={dateValue}
          placeholder="Select date"
          textClass={TEXT_CLS}
          placeholderClass={PLACEHOLDER_CLS}
          lightMode={true}
          onChangeStart={(v) => {
            onDateChange(v);
            setSearchData((p) => ({ ...p, [field.id]: v }));
          }}
        />
      )}

      {field.type === "datetime" && (
        <DatePicker
          mode="datetime"
          tint={tint}
          startDate={dateValue}
          placeholder="Select date & time"
          textClass={TEXT_CLS}
          placeholderClass={PLACEHOLDER_CLS}
          lightMode={true}
          onChangeStart={(v) => {
            onDateChange(v);
            setSearchData((p) => ({ ...p, [field.id]: v }));
          }}
        />
      )}

      {field.type === "guests" && (
        <GuestPicker
          type={field.guestType ?? "guests"}
          tint={tint}
          lightMode={true}
          textClass={TEXT_CLS}
          chevronClass="text-gray-400 hover:text-gray-600 dark:text-white/50"
          placeholder="How many guests?"
          defaultValue={defaultGuests}
          onChange={(val) => setSearchData((p) => ({ ...p, guests: val }))}
        />
      )}
    </div>
  );
}
