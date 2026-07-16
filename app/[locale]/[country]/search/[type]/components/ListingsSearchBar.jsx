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

import { useState, useRef , useEffect} from "react";
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
    { id: "location", label: "Destination", type: "location", placeholder: "Where to?" },
    { id: "dates",     type: "daterange", startId: "checkin",   endId: "checkout",   startLabel: "Check In",   endLabel: "Check Out" },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests_detailed"       },
  ],
  studios: [
    { id: "location",  label: "Location",    type: "location",  placeholder: "City or studio"     },
    { id: "startdate", label: "Start",       type: "datetime"                                      },
    { id: "enddate",   label: "End",         type: "datetime"                                      },
    { id: "guests",    label: "Team Size",   type: "guests",    guestType: "attendees"             },
  ],
  rentals: [
    { id: "location", label: "Location",    type: "location", placeholder: "City or area" },
    { id: "dates",     type: "daterange", startId: "startdate", endId: "enddate", startLabel: "Start Date", endLabel: "End Date" },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests"                },
  ],
  workspaces: [
    { id: "location", label: "Location",    type: "location", placeholder: "City or area" },
    { id: "dates",     type: "daterange", startId: "startdate", endId: "enddate", startLabel: "Start Date", endLabel: "End Date" },
    { id: "guests",    label: "Team Size",   type: "guests",    guestType: "attendees"             },
  ],
  experiences: [
    { id: "location",  label: "Location",    type: "location",  placeholder: "City or area"       },
    { id: "date",      label: "Date",        type: "date"                                          },
    { id: "guests",    label: "Guests",      type: "guests",    guestType: "guests"                },
  ],
};

/* ── Light-mode input overrides
   Applied to the INPUT ELEMENT only — dropdowns stay dark (homepage behavior) ──
   All four fields (Location / Date / Guests) now share one label color and one
   placeholder color so the bar reads consistently instead of each field
   picking its own shade. */
const TEXT_CLS        = "text-gray-800 dark:text-white";
/* Real <input> (LocationAutoComplete): `placeholder-*` targets the native
   ::placeholder pseudo-element, which only exists on form controls. */
const PLACEHOLDER_CLS = "placeholder-gray-400 dark:placeholder-white/35";
/* DatePicker / GuestPicker fake their placeholder with a <span>, which has
   no ::placeholder pseudo-element — `placeholder-*` silently no-ops on it.
   Same visual shade as PLACEHOLDER_CLS above, expressed as a real text color
   so it actually renders on a span. */
const SPAN_PLACEHOLDER_CLS = "text-gray-400 dark:text-white/35";
const CLEAR_CLS       = "text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/80";
/* Field label ("DESTINATION", "CHECK IN", …) — was text-gray-400/80, too
   washed out to read as a label against the value text below it. */
const LABEL_CLS       = "text-gray-500 dark:text-white/45";

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

export default function ListingsSearchBar({
  onSearch, countryCode = "in", defaultValues = {}, isSearching = false, isLoading = false }) {
  const { activeCategory } = useCategory();
  const tint   = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const fields = SEARCH_CONFIG[activeCategory] ?? SEARCH_CONFIG.venues;

  /* The Search-page bar now shows Location, Date and Guests — the same state
     created on the Home page. Location is seeded from the URL via
     `defaultValues.location`, displayed in the field, kept in local
     `searchData.location`, and re-emitted on every Search (see handleSearch),
     so URL persistence, app state, listing filtering and map centering all
     stay in sync. The Home page bar (HeroSection) is a separate component. */
  const visibleFields = fields;

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
  // Mirrors MobileSearchSheet's current selection so the collapsed "Where
  // to?" trigger button above reflects it too, not just the sheet's own
  // sticky summary bar (same pattern as HeroSection.jsx's mobileSummary).
  const [summary,     setSummary]     = useState({ location: "", dateSummary: "", guestSummary: "" });

  // const handleSearch = () => onSearch?.({ ...searchData, dates });

  const [clicking, setClicking] = useState(false);
  const lastPayloadRef = useRef(null);
  const clickTimerRef  = useRef(null);

  const busy = isSearching || clicking;

  const handleSearch = () => {
    if (busy) return; 

    const payload = JSON.stringify({ ...searchData, dates });

    if (payload === lastPayloadRef.current) return;

    lastPayloadRef.current = payload;
    setClicking(true);

    onSearch?.({ ...searchData, dates });

    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => setClicking(false), 800);
  };

  useEffect(() => () => clearTimeout(clickTimerRef.current), []);

  /* ── Initial-load skeleton — mirrors the real bar's shape/spacing so
     there's no layout jump once data arrives. Only used for the very
     first load (see isLoading gate in page.jsx); subsequent searches
     keep the real interactive bar with its "Searching…" button state.
     Placed after all hooks above so hook call order stays stable. */
  if (isLoading) {
    return (
      <>
        <div className="hidden md:flex items-stretch bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden mx-4 mt-2.5 mb-2">
          {visibleFields.map((field, i) => (
            <div
              key={field.id}
              className={[
                "flex-1 min-w-0 px-4 py-2.5",
                i !== visibleFields.length - 1 ? "border-e border-gray-100 dark:border-white/10" : "",
              ].join(" ")}
            >
              <div className="h-2.5 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mb-2" />
              <div className="h-4 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          ))}
          <div className="flex items-center px-2.5 py-1.5">
            <div className="h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        <div className="md:hidden mx-4 mt-3 mb-0 w-[calc(100%-2rem)] flex items-center justify-between rounded-xl px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-3 w-40 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      </>
    );
  }

   /* ── DESKTOP bar ───────────────────────────────────────────── */
  return (
    <>
      <div className="hidden md:flex items-stretch bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-visible mx-4 mt-2.5 mb-2">

        {visibleFields.map((field, i) => (
          <SearchField
            key={`${activeCategory}-${field.id}`}
            field={field}
            tint={tint}
            category={activeCategory}
            isLast={i === visibleFields.length - 1}
            dates={dates}
            onDateChange={(key, v) => setDates((p) => ({ ...p, [key]: v }))}
            setSearchData={setSearchData}
            searchData={searchData}
            countryCode={countryCode}
            defaultLocation={field.type === "location" ? (defaultValues.location || "") : ""}
            defaultGuests={field.type === "guests"   ? (defaultValues.guests   || "")  : ""}
          />
        ))}

        {/* Search button */}
        <div className="flex items-center px-2.5 py-1.5">
          <button
            onClick={handleSearch}
            disabled={busy}
            className={[
              "flex items-center gap-1.5 font-semibold text-sm px-4 py-2 rounded-lg transition-all whitespace-nowrap text-white",
              busy ? "opacity-70 cursor-not-allowed" : "hover:opacity-90 active:scale-95",
            ].join(" ")}
            style={{ background: tint.hex, boxShadow: tint.activeGlow }}
          >
            {busy ? (
              <span
                className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                aria-hidden="true"
              />
            ) : (
              <MagnifyingGlassIcon className="w-4 h-4" />
            )}
            {busy ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* ── MOBILE compact trigger → MobileSearchSheet ───────────
          Reflects the sheet's current selection (see summary/onSummaryChange)
          instead of staying on a static placeholder once the user has
          picked a location/date/guests inside it — same fix as HeroSection's
          own mobile trigger. */}
      <button
        onClick={() => setSheetOpen(true)}
        disabled={busy}
        className="md:hidden mx-4 mt-3 mb-0 w-[calc(100%-2rem)] flex items-center justify-between border text-left rounded-xl px-4 py-3.5 transition active:scale-[0.98] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-70"
      >
        <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1 text-start">
          <span className={`text-[10px] font-semibold uppercase tracking-widest truncate w-full ${LABEL_CLS}`}>
            {summary.location || "Where to?"}
          </span>
          <span className="text-sm text-gray-500 dark:text-white/70 truncate w-full">
            {summary.location
              ? [summary.dateSummary, summary.guestSummary].filter(Boolean).join(" · ") || "Tap to edit your search"
              : "Search location, date, guests…"}
          </span>
        </div>
        <div className="p-2 rounded-lg text-white shrink-0" style={{ background: tint.hex }}>
          {busy ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin block" />
          ) : (
            <MagnifyingGlassIcon className="w-4 h-4" />
          )}
        </div>
      </button>

      <MobileSearchSheet open={sheetOpen} setOpen={setSheetOpen} onSummaryChange={setSummary} />
    </>
  );
}

/* ── SearchField
   Mirrors HeroSection's SearchField exactly.
   Container colors adapted for white page; picker components unchanged.
   ────────────────────────────────────────────────────────────────── */
function SearchField({ field, tint, category, isLast, dates, onDateChange,searchData, setSearchData, countryCode, defaultLocation = "", defaultGuests = "" }) {
  // Header label above the location field used to stay permanently
  // "DESTINATION"/"LOCATION" (straight from SEARCH_CONFIG) even after
  // switching to Property mode inside the dropdown — only the placeholder
  // changed, which read as half-finished. LocationAutoComplete reports its
  // live label ("Location" or the active category's word, e.g. "Farmstay")
  // via onModeChange; this mirrors it so the header swaps too — same fix
  // already applied to HeroSection.jsx's SearchField.
  const [locationLabel, setLocationLabel] = useState(field.label);
  useEffect(() => { setLocationLabel(field.label); }, [field.label]);

  return (
    <div
      className={[
        "relative min-w-0 px-4 py-2.5 overflow-visible",
        field.type === "daterange" ? "flex-[2]" : "flex-1",
        !isLast ? "border-e border-gray-100 dark:border-white/10" : "",
      ].join(" ")}
    >
      {/* Field label — smaller, lighter; value text below should dominate.
         daterange renders its own two mini-labels (Check In / Check Out)
         internally, so a shared label here would be redundant. */}
      {field.type !== "daterange" && (
        <p className={`text-[9px] font-semibold uppercase tracking-[0.1em] mb-1 whitespace-nowrap ${LABEL_CLS}`}>
          {field.type === "location" ? locationLabel : field.label}
        </p>
      )}

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
          /* Inherited location from the URL arrives as a STRING
             (defaultLocation). The previous `searchData.location?.city` read
             `.city` off that string → undefined → the field showed nothing.
             Seed from the string so the Home-page location is visible here. */
          defaultValue={defaultLocation || (typeof searchData.location === "string" ? searchData.location : searchData.location?.city)}
          onSelect={(value) => setSearchData((p) => ({ ...p, location: value }))}
          onModeChange={setLocationLabel}
        />
      )}

      {field.type === "date" && (
        <DatePicker
          mode="single"
          tint={tint}
          startDate={dates[field.id] ?? null}
          placeholder="Select date"
          textClass={TEXT_CLS}
          placeholderClass={SPAN_PLACEHOLDER_CLS}
          lightMode={true}
          onChangeStart={(v) => {
            onDateChange(field.id, v);
            setSearchData((p) => ({ ...p, [field.id]: v }));
          }}
        />
      )}

      {field.type === "datetime" && (
        <DatePicker
          mode="datetime"
          tint={tint}
          startDate={dates[field.id] ?? null}
          placeholder="Select date & time"
          textClass={TEXT_CLS}
          placeholderClass={SPAN_PLACEHOLDER_CLS}
          lightMode={true}
          onChangeStart={(v) => {
            onDateChange(field.id, v);
            setSearchData((p) => ({ ...p, [field.id]: v }));
          }}
        />
      )}

      {/* Single connected range calendar — replaces two independent
         single-date Check In / Check Out (or Start/End Date) pickers that
         let checkout land before check-in with no validation. One
         DatePicker in mode="range" (same component the mobile sheet
         already uses for farmstays) enforces start-before-end and
         highlights the span between them. */}
      {field.type === "daterange" && (
        <DatePicker
          mode="range"
          tint={tint}
          startDate={dates[field.startId] ?? null}
          endDate={dates[field.endId] ?? null}
          splitLabels={{ start: field.startLabel ?? "Start", end: field.endLabel ?? "End" }}
          textClass={TEXT_CLS}
          placeholderClass={SPAN_PLACEHOLDER_CLS}
          lightMode={true}
          onChangeStart={(v) => {
            onDateChange(field.startId, v);
            setSearchData((p) => ({ ...p, [field.startId]: v }));
          }}
          onChangeEnd={(v) => {
            onDateChange(field.endId, v);
            setSearchData((p) => ({ ...p, [field.endId]: v }));
          }}
        />
      )}

      {field.type === "guests" && (
        <GuestPicker
          type={field.guestType ?? "guests"}
          tint={tint}
          lightMode={true}
          textClass={TEXT_CLS}
          placeholderClass={SPAN_PLACEHOLDER_CLS}
          chevronClass="text-gray-400 hover:text-gray-600 dark:text-white/50"
          placeholder="How many guests?"
          defaultValue={defaultGuests}
          onChange={(val) => setSearchData((p) => ({ ...p, guests: val }))}
        />
      )}
    </div>
  );
}
