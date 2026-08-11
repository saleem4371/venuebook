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
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";

import LocationAutoComplete from "@/app/[locale]/[country]/home/components/LocationAutoComplete";
import DatePicker           from "@/app/[locale]/[country]/home/components/DatePicker";
import GuestPicker          from "@/app/[locale]/[country]/home/components/GuestPicker";
import MobileSearchSheet    from "@/app/[locale]/[country]/home/components/MobileSearchSheet";
import SearchSelectField    from "@/app/[locale]/[country]/home/components/SearchSelectField";

import { useCategory }    from "@/context/CategoryContext";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
/* Field schema now lives in one shared config, imported by this file,
   HeroSection.jsx and MobileSearchSheet.jsx — see searchFieldsConfig.js
   for why (previously copy-pasted 3x and drifted). */
import { SEARCH_CONFIG, getFieldSummary, TOGGLE_BAR_CATEGORIES } from "@/app/[locale]/[country]/home/components/searchFieldsConfig";

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
  onSearch, countryCode = "in", defaultValues = {}, isSearching = false, isLoading = false ,destination}) {
  const t = useTranslations("searchBar");
  const tf = useTranslations("filter");
  const { activeCategory } = useCategory();
  const tint   = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const fields = SEARCH_CONFIG[activeCategory] ?? SEARCH_CONFIG.venues;
  // Only farmstays gets the collapse/expand toggle bar — see
  // TOGGLE_BAR_CATEGORIES in searchFieldsConfig.js for why. Every other
  // category keeps the classic bar where all fields stay visible.
  const useToggleBar = TOGGLE_BAR_CATEGORIES.includes(activeCategory);

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

  const [searchData,  setSearchData]  = useState({
    location: defaultValues.location || "",
    // Seeded at mount (not just on resync) so a direct/shared link with
    // ?occasion=...&vibe=... shows the right chip selected immediately,
    // same as location above.
    occasion: defaultValues.occasion || "",
    vibe:     defaultValues.vibe     || "",
  });
  const [sheetOpen,   setSheetOpen]   = useState(false);

  /* ── Desktop collapse/expand toggle ─────────────────────────────
     Only the active field renders its full label + control; the rest
     collapse to an icon + short label + value-summary pill (see
     getFieldSummary in searchFieldsConfig.js). Clicking a collapsed
     pill activates it and collapses whichever was active before —
     one field expanded "sideways" at a time, in the field order
     defined by SEARCH_CONFIG (Where → Why → Feel → Dates → Who for
     farmstays). Starts on the first field, same as the old bar always
     showing Location first. */
  const [activeFieldId, setActiveFieldId] = useState(() => visibleFields[0]?.id ?? null);
  useEffect(() => {
    // Field set changes when the category tab changes — if the
    // previously-active field doesn't exist in the new category's
    // fields, fall back to the first one instead of leaving nothing
    // expanded.
    if (!visibleFields.some((f) => f.id === activeFieldId)) {
      setActiveFieldId(visibleFields[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  /* ── Re-sync when a NEW navigation brings fresh defaultValues ──────────
     `dates`/`searchData` above are seeded from `defaultValues` only once,
     at mount (that's what useState(() => ...) means). A home-screen
     redirect that lands on this already-mounted page passes a brand new
     `defaultValues` prop (new location/date/guests), but these two
     `useState`s never re-run on their own — so the fields kept showing
     stale or empty values even though the URL and parent state were
     already correct.

     This effect watches a serialized signature of the incoming
     defaultValues and, whenever it's genuinely different from what's
     currently applied, re-seeds `dates`/`searchData` AND bumps
     `syncTick`. `syncTick` is folded into a `key` below so that
     LocationAutoComplete / GuestPicker — both uncontrolled components that
     only read `defaultValue` once — remount and pick up the fresh value
     instead of staying frozen on whatever they first rendered with. */
  const defaultsSignature = [
    defaultValues.location,
    defaultValues.date,
    defaultValues.checkin,
    defaultValues.checkout,
    defaultValues.startdate,
    defaultValues.enddate,
    defaultValues.guests,
    defaultValues.occasion,
    defaultValues.vibe,
  ].join("|");

  const appliedSignatureRef = useRef(defaultsSignature);
  const [syncTick, setSyncTick] = useState(0);

  useEffect(() => {
    if (defaultsSignature === appliedSignatureRef.current) return;
    appliedSignatureRef.current = defaultsSignature;

    setDates({
      date:      parseDateParam(defaultValues.date),
      checkin:   parseDateParam(defaultValues.checkin),
      checkout:  parseDateParam(defaultValues.checkout),
      startdate: parseDateParam(defaultValues.startdate),
      enddate:   parseDateParam(defaultValues.enddate),
    });
    setSearchData((p) => ({
      ...p,
      location: defaultValues.location || "",
      guests:   defaultValues.guests   || "",
      occasion: defaultValues.occasion || "",
      vibe:     defaultValues.vibe     || "",
    }));
    setSyncTick((t) => t + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsSignature]);

  // Mirrors MobileSearchSheet's current selection so the collapsed "Where
  // to?" trigger button above reflects it too, not just the sheet's own
  // sticky summary bar (same pattern as HeroSection.jsx's mobileSummary).
  const [summary,     setSummary]     = useState({ location: "", dateSummary: "", guestSummary: "" });

  // Columns stay unequal (active field grows, the rest pin at 104px)
  // exactly while a field is being spotlighted — that's what makes "which
  // field is active" readable while stepping through Where → Why → Feel →
  // Dates → Who, AND gives a REOPENED field the same comfortable width it
  // had the first time (reopening sets `activeFieldId` back to that
  // field, same as the initial walk-through — it doesn't matter that the
  // other fields still hold values from before).
  //
  // `activeFieldId` goes back to null once a field's own dropdown closes
  // without advancing to the next one (see onDeactivate below) — e.g. the
  // user closes Dates without picking anything, or clears a value they'd
  // already set. With nothing active, pinning every field at 104px left
  // none of them absorbing the leftover width — a dead gap after the
  // Search button instead of filling the bar. Equal width is the right
  // fallback there: there's nothing left to spotlight, so every column
  // gets an equal share instead of one of them staying stuck oversized
  // (or all of them staying stuck cramped).
  const equalWidth = activeFieldId == null;

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
        <div className="hidden md:flex items-stretch h-[69px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden mx-4 mt-2.5 mb-2">
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
      {/* Fixed height (69px) — was implicit/content-driven before, so the
         row's own height would shift by a few px as fields swapped
         between collapsed/expanded and between field types with
         slightly different natural content heights (a label+control
         stack vs. an icon+two-line pill). Every field now stretches to
         fill this fixed height and centers its own content within it
         (see SearchField below), so the bar itself never needs to
         resize vertically during a transition — only width does. */}
      <div className="hidden md:flex items-stretch h-[69px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-visible mx-4 mt-2.5 mb-2">

        {visibleFields.map((field, i) => (
          <SearchField
            key={`${activeCategory}-${field.id}-${syncTick}`}
            field={field}
            tint={tint}
            category={activeCategory}
            isFirst={i === 0}
            isLast={i === visibleFields.length - 1}
            equalWidth={equalWidth}
            dates={dates}
            onDateChange={(key, v) => setDates((p) => ({ ...p, [key]: v }))}
            setSearchData={setSearchData}
            searchData={searchData}
            countryCode={countryCode}
            defaultLocation={field.type === "location" ? (defaultValues.location || "") : ""}
            defaultGuests={field.type === "guests"   ? (defaultValues.guests   || "")  : ""}
            destination={destination}
            t={t}
            tf={tf}
            isActive={!useToggleBar || activeFieldId === field.id}
            onActivate={() => setActiveFieldId(field.id)}
            onAdvance={() => setActiveFieldId(visibleFields[i + 1]?.id ?? field.id)}
            // Fires when this field's own popup closes without advancing
            // (click outside, Escape, or reselecting) — collapses it back
            // to the display pill instead of leaving it looking "active"
            // forever. Guarded so it can't clobber a field that's already
            // moved on (e.g. via onAdvance firing first on the same close).
            onDeactivate={() => setActiveFieldId((cur) => (cur === field.id ? null : cur))}
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
            {busy ? t("searching") : t("search")}
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
            {summary.location || t("where_to")}
          </span>
          <span className="text-sm text-gray-500 dark:text-white/70 truncate w-full">
            {summary.location
              ? [summary.dateSummary, summary.guestSummary].filter(Boolean).join(" · ") || t("tap_to_edit")
              : t("mobile_trigger_placeholder")}
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

      <MobileSearchSheet open={sheetOpen} setOpen={setSheetOpen} onSummaryChange={setSummary}   itemDest={destination}/>
    </>
  );
}

/* ── SearchField
   Mirrors HeroSection's SearchField exactly.
   Container colors adapted for white page; picker components unchanged.
   ────────────────────────────────────────────────────────────────── */
function SearchField({ field, tint, category, isFirst, isLast, equalWidth = false, dates, onDateChange,searchData, setSearchData, countryCode, defaultLocation = "", defaultGuests = "" ,destination, t, tf, isActive = true, onActivate, onAdvance, onDeactivate }) {
  // Header label above the location field used to stay permanently
  // "DESTINATION"/"LOCATION" (straight from SEARCH_CONFIG) even after
  // switching to Property mode inside the dropdown — only the placeholder
  // changed, which read as half-finished. LocationAutoComplete reports its
  // live label ("Location" or the active category's word, e.g. "Farmstay")
  // via onModeChange; this mirrors it so the header swaps too — same fix
  // already applied to HeroSection.jsx's SearchField.
  const fieldLabel = field.labelKey ? t(field.labelKey) : field.label;
  const [locationLabel, setLocationLabel] = useState(fieldLabel);
  useEffect(() => { setLocationLabel(fieldLabel); }, [fieldLabel]);

  // The box's width (driven by `isActive` via CSS transition below) and
  // the content swap used to both flip the instant `isActive` changed —
  // two independently-timed animations racing each other. Collapsing was
  // fine (the compact pill fits at any width), but EXPANDING showed the
  // full control — label + "7 Sep 2026 → 25 Sep 2026", GuestPicker, etc —
  // immediately, while the box was still only 104px wide and hadn't
  // grown yet, so the content wrapped across multiple lines until the box
  // caught up. `displayActive` fixes this by only being asymmetric: it
  // drops to collapsed immediately (safe at any width), but only rises to
  // expanded once the box has actually finished growing.
  const [displayActive, setDisplayActive] = useState(isActive);
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setDisplayActive(true), 300);
      return () => clearTimeout(timer);
    }
    setDisplayActive(false);
  }, [isActive]);

  // Opens the field's own control the moment its full content actually
  // renders (displayActive, not isActive — see above), so a single click
  // on a collapsed pill both expands it AND shows its picker/dropdown,
  // instead of "click to expand, then click again to actually use it."
  // DatePicker/GuestPicker/SearchSelectField's trigger is a plain toggle
  // <button> — .click() fires the same onClick a real second click would
  // and opens the dropdown. LocationAutoComplete's trigger is a text
  // <input> whose suggestions open on onFocus, NOT onClick — and .click()
  // on an <input> does NOT reliably focus it. Browsers assign focus to a
  // text input on "mousedown", before "click" ever fires; .click() only
  // synthesizes the click event itself, so it skipped the mousedown step
  // that actually moves focus. The field visibly expanded (showing the
  // empty input) but never actually focused it, so onFocus — and the
  // suggestions it opens — never fired until a real second click. Calling
  // .focus() directly for inputs sidesteps the missing mousedown entirely.
  const contentRef = useRef(null);
  useEffect(() => {
    if (!displayActive) return;
    const raf = requestAnimationFrame(() => {
      const el = contentRef.current?.querySelector("button, input");
      if (!el) return;
      if (el.tagName === "INPUT") el.focus();
      else el.click();
    });
    return () => cancelAnimationFrame(raf);
  }, [displayActive]);

  const Icon = field.icon;
  const summary = getFieldSummary(field, { searchData, dates, t, tf });

  return (
    // Two width modes, chosen by the parent via `equalWidth`:
    //
    //  - Still filling in (equalWidth=false): the active field grows
    //    (flex-grow:1) while the rest pin at a fixed 104px icon-pill width.
    //    This is what makes "which field is active" readable while
    //    stepping through Where → Why → Feel → Dates → Who.
    //  - Everything filled (equalWidth=true): there's no more "next" field
    //    to spotlight, so every column becomes a fixed equal split instead
    //    of leaving one field permanently oversized once the bar is just
    //    sitting there fully populated.
    //
    // Real CSS flex (not Framer's `layout`/transform-scale trick) is what
    // renders each column either way: that trick stretches whatever's
    // inside a resizing box unless every nested node is also a tracked
    // motion element, which showed up as text/icons visibly ballooning
    // during a width change. AnimatePresence below only crossfades opacity
    // between collapsed/expanded content, which doesn't touch layout.
    <div
      className={[
        "relative min-w-0 overflow-visible",
        "transition-[flex-grow,min-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        !isLast ? "border-e border-gray-100 dark:border-white/10" : "",
      ].join(" ")}
      style={
        equalWidth
          ? { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: "0px" }
          : {
              // All active fields get the same flex-grow weight (Dates
              // used to get 2x for its old two-column layout — now that
              // it's a single merged trigger, the extra weight only
              // caused a "large then small" wobble in the rest of the
              // row, since animating flex-grow re-solves the WHOLE row's
              // distribution at every frame).
              flexGrow: isActive ? 1 : 0,
              flexShrink: isActive ? 1 : 0,
              flexBasis: "0%",
              // 104px is just enough for an icon + short label; the value
              // line beneath it can truncate.
              minWidth: isActive ? "0px" : "104px",
            }
      }
    >
      {/* mode="wait" (exit-then-enter) used to be load-bearing here, back
         when content timing was racing the box's width transition. Now
         that `displayActive` already gates when each branch mounts, that
         sequencing was just adding ~400ms of dead time after the box had
         already finished resizing. Default (simultaneous) crossfade is
         faster and reads as more responsive — safe now because both
         branches below are `absolute inset-0`, so they overlap in the
         exact same box during the fade instead of stacking in flow. */}
      <AnimatePresence initial={false}>
        {!displayActive ? (
          /* ── Collapsed pill — icon + short label + current value summary
             once something's picked, left-aligned like every other field.
             First-time (nothing picked yet) shows short label with the
             icon centered underneath instead of a dash — reads as "here's
             what this field is for" rather than "this is empty". */
          <motion.button
            key="collapsed"
            type="button"
            onClick={onActivate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className={[
              "absolute inset-0 flex items-center w-full h-full px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors text-start",
              // The bar is rounded-xl with overflow-visible (needed so
              // dropdowns can escape it), so this pill's own hover
              // background — being absolute inset-0 — must round its own
              // start corners to match, or the hover rect visibly pokes
              // past the bar's rounded corner on the first field.
              isFirst ? "rounded-s-xl" : "",
            ].join(" ")}
          >
            {summary ? (
              <div className="flex items-center gap-2 w-full min-w-0">
                {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: tint?.hex }} aria-hidden="true" />}
                <div className="min-w-0 leading-tight">
                  <p className={`text-[9px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap ${LABEL_CLS}`}>
                    {field.shortLabelKey ? t(field.shortLabelKey) : fieldLabel}
                  </p>
                  <p className="text-xs truncate text-gray-700 dark:text-white/80">{summary}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 w-full">
                <p className={`text-[9px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap ${LABEL_CLS}`}>
                  {field.shortLabelKey ? t(field.shortLabelKey) : fieldLabel}
                </p>
                {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: tint?.hex }} aria-hidden="true" />}
              </div>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            ref={contentRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            // h-full + justify-center: matches the collapsed pill's own
            // centering (items-center within its h-full) so both states
            // sit centered within the bar's fixed 69px height, instead of this
            // one being top-aligned with a bit of dead space below it.
            // absolute inset-0: overlaps the collapsed pill in the same spot
            // during the crossfade instead of stacking below it in flow.
            className="absolute inset-0 min-w-0 h-full flex flex-col justify-center px-4"
          >
            {/* truncate (not just whitespace-nowrap) — an un-clipped long
               label in a narrow equal-width column would overflow past
               this field's own border into the next one instead of just
               getting cut off with an ellipsis. */}
            <p className={`text-[9px] font-semibold uppercase tracking-[0.1em] mb-1 truncate ${LABEL_CLS}`}>
              {field.type === "location" ? locationLabel : fieldLabel}
            </p>
{/* itemDest */}
      {field.type === "location" && (
        <LocationAutoComplete
          category={category}
          tint={tint}
          placeholder={field.placeholderKey ? t(field.placeholderKey) : field.placeholder}
          textClass={TEXT_CLS}
          placeholderClass={PLACEHOLDER_CLS}
          clearClass={CLEAR_CLS}
          lightDropdown={true}
          countryCode={countryCode}
          /* This field UNMOUNTS when collapsed (it only renders inside the
             `displayActive` branch below) and remounts fresh every time
             it's reopened, so `defaultValue` — read once at mount — has to
             be the CURRENT selection, not the original URL-seeded one.
             Live `searchData.location` takes priority; `defaultLocation`
             (the URL value) is only a fallback for the very first mount,
             before anything's been picked yet. Getting this order backwards
             was the bug: `defaultLocation || searchData.location` meant a
             non-empty URL value would keep winning forever, so reopening
             the field after picking a NEW location showed the stale old
             one (or blank, on HeroSection which passed no defaultLocation
             at all — see that file's matching fix). Inherited location
             from the URL arrives as a STRING; `searchData.location` becomes
             an OBJECT ({ city, address, … }) once the picker sets it, so
             `.city` is read only in that case. */
          defaultValue={
            (typeof searchData.location === "string"
              ? searchData.location
              : searchData.location?.city) || defaultLocation
          }
          onSelect={(value) => {
            setSearchData((p) => ({ ...p, location: value }));
            onAdvance?.();
          }}
          onModeChange={setLocationLabel}
          itemDest={destination}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}

      {field.type === "date" && (
        <DatePicker
          mode="single"
          tint={tint}
          startDate={dates[field.id] ?? null}
          placeholder={t("select_date")}
          textClass={TEXT_CLS}
          placeholderClass={SPAN_PLACEHOLDER_CLS}
          lightMode={true}
          onChangeStart={(v) => {
            onDateChange(field.id, v);
            setSearchData((p) => ({ ...p, [field.id]: v }));
          }}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}

      {field.type === "datetime" && (
        <DatePicker
          mode="datetime"
          tint={tint}
          startDate={dates[field.id] ?? null}
          placeholder={t("select_date_time")}
          textClass={TEXT_CLS}
          placeholderClass={SPAN_PLACEHOLDER_CLS}
          lightMode={true}
          onChangeStart={(v) => {
            onDateChange(field.id, v);
            setSearchData((p) => ({ ...p, [field.id]: v }));
          }}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}

      {/* Single merged trigger ("12 Aug → 15 Aug") instead of two separate
         Check In / Check Out cells — both used to open the exact same
         shared calendar anyway, so the second cell was pure duplication.
         Mobile's sheet already does it this way (see MobileSearchSheet.jsx,
         which never passed splitLabels); this just brings the desktop bar
         in line with it and buys back width the bar badly needed once
         Occasion/Vibe joined it. */}
      {field.type === "daterange" && (
        <DatePicker
          mode="range"
          tint={tint}
          startDate={dates[field.startId] ?? null}
          endDate={dates[field.endId] ?? null}
          placeholder={field.placeholderKey ? t(field.placeholderKey) : t("select_date")}
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
            if (v) onAdvance?.();
          }}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
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
          placeholder={t("how_many_guests")}
          defaultValue={defaultGuests}
          onChange={(val) => setSearchData((p) => ({ ...p, guests: val }))}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}

      {field.type === "select" && (
        <SearchSelectField
          options={(field.options ?? []).map((o) => ({ id: o.id, label: tf(`${field.optionKeyPrefix ?? ""}${o.id}`), icon: o.icon, image: o.image }))}
          value={searchData[field.id] ?? ""}
          onChange={(val) => {
            setSearchData((p) => ({ ...p, [field.id]: val }));
            // Same auto-advance as location/date-range below — was missing
            // here, so Occasion/Vibe were the only fields that didn't hand
            // off to the next one after picking a value.
            if (val) onAdvance?.();
          }}
          tint={tint}
          label={fieldLabel}
          placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
          textClass={TEXT_CLS}
          placeholderClass={SPAN_PLACEHOLDER_CLS}
          chevronClass="text-gray-400 hover:text-gray-600 dark:text-white/50"
          lightMode={true}
          onOpenChange={(isOpen) => { if (!isOpen) onDeactivate?.(); }}
        />
      )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}