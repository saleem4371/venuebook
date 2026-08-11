"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronLeft,
  Compass,
  Sparkles,
} from "lucide-react";
import LocationAutoComplete   from "./LocationAutoComplete";
import MobileDateCalendar     from "./MobileDateCalendar";
import GuestPicker, { summarizeFields, getCategoryFields, GUEST_CONFIGS } from "./GuestPicker";
import SearchSelectField      from "./SearchSelectField";

import { useCategory }    from "@/context/CategoryContext";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
import { LoadProperty }   from "@/services/venues.service";
import { DEFAULT_FILTERS } from "@/app/[locale]/[country]/search/[type]/components/FilterDrawer";
/* Per-category config now lives in one shared file — see
   searchFieldsConfig.js. Previously duplicated here, in HeroSection.jsx
   and in ListingsSearchBar.jsx. */
import { SHEET_CONFIG, SHEET_EXTRA_FIELDS } from "./searchFieldsConfig";

/* ── Tab strip → tab meta for category-specific extra facets (e.g.
   farmstay Occasion/Vibe) — icon + short label matching the same
   short_why/short_feel pills already used on the desktop bar, so mobile
   and desktop read as the same field order: Where → Why → Feel →
   Dates → Who. Only farmstays have entries in SHEET_EXTRA_FIELDS today;
   any id without a meta entry here falls back to a generic icon. */
const EXTRA_FIELD_TAB_META = {
  occasion: { labelKey: "short_why", icon: Compass },
  vibe: { labelKey: "short_feel", icon: Sparkles },
};

/* ── Main sheet ─────────────────────────────────────────────── */
export default function MobileSearchSheet({ open, setOpen, onSummaryChange , itemDest}) {
  const t   = useTranslations("searchBar");
  const tf  = useTranslations("filter");
  const { activeCategory } = useCategory();
  const params              = useParams();
  const router              = useRouter();
  const locale              = String(params?.locale || "en");
  const countryCode         = String(params?.country || "in").toLowerCase();
  const tint                = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const config               = SHEET_CONFIG[activeCategory]   ?? SHEET_CONFIG.venues;
  const extraFields          = SHEET_EXTRA_FIELDS[activeCategory] ?? [];

  const [openSection, setOpenSection] = useState("location");
  // Values for category-specific extra fields (e.g. farmstay Occasion/Vibe),
  // keyed by field id. Reset on category switch below.
  const [extraValues, setExtraValues] = useState({});
  useEffect(() => { setExtraValues({}); }, [activeCategory]);
  const [location,    setLocation]    = useState("");
  // Raw payload from LocationAutoComplete's onSelect — kept alongside the
  // display string above. `location` is just text for the UI (collapsed
  // header, sticky summary bar); this holds the full object (mode, city,
  // lat, lng, bounds, propertyQuery, ...) so handleSearch can still build
  // proper query params (lat/lng, map bounds, ?q= for property-mode free
  // text) instead of only ever seeing a flattened string.
  const [locationValue, setLocationValue] = useState(null);
  const [startDate,   setStartDate]   = useState(null);
  const [endDate,     setEndDate]     = useState(null);
  const [guests,      setGuests]      = useState({});
  const [duration,    setDuration]    = useState(null);   // e.g. "Evening", "Weekly" — informational only
  const [eventType,   setEventType]   = useState(null);   // venues only

  // Section header used to stay "Location"/"Destination" (straight from
  // SHEET_CONFIG) even after switching to Property mode inside the field —
  // only the placeholder changed. LocationAutoComplete reports its live
  // label via onModeChange; this mirrors it into the section header.
  const [locationLabel, setLocationLabel] = useState(t(config.locationLabelKey));
  useEffect(() => { setLocationLabel(t(config.locationLabelKey)); }, [config.locationLabelKey, t]);

  const isRange    = config.dateMode === "range";
  const isDatetime = config.dateMode === "datetime";

  /* Human-readable summaries shown in collapsed headers + the sticky bar */
  const dateSummary = (() => {
    if (!startDate) return "";
    const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    let base;
    if (isRange && endDate) base = `${fmt(startDate)} → ${fmt(endDate)}`;
    else if (isRange)       base = `${fmt(startDate)} → Check-out`;
    else {
      base = fmt(startDate);
      if (isDatetime) {
        const t = startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        base = `${base}, ${t}`;
      }
    }
    return duration ? `${base} · ${duration}` : base;
  })();

  // Reuses the EXACT same field set GuestPicker itself renders internally
  // (category-specific: Adults/VIP/Staff for venues, People/Meeting
  // Rooms/Cabins for workspaces, etc) so the summary text's labels always
  // match what's actually in the panel instead of a hand-maintained
  // parallel copy that could drift out of sync.
  const guestFields = getCategoryFields(activeCategory) ?? GUEST_CONFIGS[config.guestType] ?? GUEST_CONFIGS.guests;
  const guestSummary = Object.keys(guests).length > 0 ? (summarizeFields(guestFields, guests) || "") : "";
  const guestSummaryDisplay = eventType ? [guestSummary, eventType].filter(Boolean).join(" · ") : guestSummary;
  useEffect(() => {
    onSummaryChange?.({ location, dateSummary, guestSummary: guestSummaryDisplay });
  }, [location, dateSummary, guestSummaryDisplay, onSummaryChange]);

  // Persistent tab strip — Where / (Why / Feel, category-dependent) /
  // Dates / Who, always visible and tappable in any order (not a gated
  // one-at-a-time accordion any more). Order matches the desktop bar's
  // Where → Why → Feel → Dates → Who.
  const tabs = [
    { id: "location", label: t("short_where"), icon: MapPin },
    ...extraFields.map((f) => ({
      id: f.id,
      label: t(EXTRA_FIELD_TAB_META[f.id]?.labelKey ?? f.labelKey),
      icon: EXTRA_FIELD_TAB_META[f.id]?.icon ?? Sparkles,
    })),
    { id: "date", label: t("short_dates"), icon: Calendar },
    { id: "guests", label: t("short_who"), icon: Users },
  ];

  const handleClear = () => {
    setLocation(""); setLocationValue(null); setStartDate(null); setEndDate(null); setGuests({});
    setDuration(null); setEventType(null); setExtraValues({});
    setOpenSection("location");
  };

  const isReady = !!location;
  // Header's "Clear All" per spec only shows once there's actually
  // something to clear — same fields handleClear() resets.
  const hasAnyValue = !!(
    location || startDate ||
    Object.values(guests).some((n) => n > 0) ||
    Object.values(extraValues).some(Boolean)
  );
  const [matchCount,   setMatchCount]   = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setMatchLoading(true);
      LoadProperty({
        type: activeCategory,
        category: null,
        filters: { ...DEFAULT_FILTERS },
        mapBounds: null,
        location: location || "",
        date: "",
        guests: "",
      })
        .then((res) => { if (!cancelled) setMatchCount((res?.data?.data ?? []).length); })
        .catch(() => { if (!cancelled) setMatchCount(null); })
        .finally(() => { if (!cancelled) setMatchLoading(false); });
    }, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [activeCategory, location]);

  const ctaLabel = `${t("search")} ${activeCategory.charAt(0).toUpperCase()}${activeCategory.slice(1)}`;

  // Builds the query string from everything currently selected in the sheet
  // and pushes to the category's search results route. Mirrors the
  // param-building logic already used elsewhere in the app (date/location/
  // guests handling) so results pages get the same shape of params
  // regardless of which entry point (desktop bar or this mobile sheet)
  // produced them.
  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    const searchData = {
      // Prefer the raw picker payload (has lat/lng/bounds/mode) — fall
      // back to the plain string if for some reason only that was set.
      location: locationValue ?? location,
      ...(isRange
        ? { startDate, endDate }
        : { date: startDate }),
      guests,
      ...(duration ? { duration } : {}),
      ...(eventType ? { eventType } : {}),
      // Category-specific extras (e.g. farmstay occasion/vibe) — only
      // included when actually selected, same as duration/eventType above.
      ...extraValues,
    };

    Object.entries(searchData).forEach(([key, value]) => {
      if (value == null || value === "") return;

      // Date
      if (value instanceof Date) {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, "0");
        const d = String(value.getDate()).padStart(2, "0");
        searchParams.set(key, `${y}-${m}-${d}`);
        return;
      }

      // Location
      if (key === "location") {
        if (typeof value === "object") {
          // Property-mode free-text payload from LocationAutoComplete (typed a
          // name, hit Enter, no specific suggestion picked) — distinct shape
          // from a location pick (no city/lat/lng), so it's routed to its own
          // param instead of being silently dropped by the city/address
          // fallback below.
          if (value.mode === "property") {
            if (value.propertyQuery) searchParams.set("q", value.propertyQuery);
            return;
          }

          searchParams.set("location", value.city || value.address || "");

          if (value.lat) searchParams.set("lat", value.lat);
          if (value.lng) searchParams.set("lng", value.lng);

          if (value.bounds) {
            searchParams.set("north", value.bounds.north);
            searchParams.set("south", value.bounds.south);
            searchParams.set("east", value.bounds.east);
            searchParams.set("west", value.bounds.west);
          }
        } else {
          searchParams.set("location", value);
        }
        return;
      }

      // Guests
      if (key === "guests") {
        if (typeof value === "object") {
          const total = Object.values(value).reduce(
            (sum, n) => sum + Number(n || 0),
            0
          );

          if (total > 0) {
            searchParams.set("guests", String(total));
          }
        } else {
          searchParams.set("guests", String(value));
        }
        return;
      }

      searchParams.set(key, String(value));
    });

    router.push(
      `/${locale}/${countryCode}/search/${activeCategory}?${searchParams.toString()}`
    );
  };

  // Portal renders at document.body to escape any ancestor stacking contexts
  // (e.g. sticky z-30 SearchBar wrapper that would otherwise cap the sheet's z-index)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Prevent the page underneath from scrolling while the full-screen sheet
  // is open — otherwise a touch-drag that starts on the backdrop (outside
  // any of the sheet's own overflow-y-auto regions) can scroll the page
  // behind it. Restores whatever the page's own overflow was on close/
  // unmount, rather than assuming it was always "".
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9998] md:hidden">

          {/* Backdrop — a touch of real blur (not just a dim) reads as the
              sheet growing forward out of the page behind it. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* Sheet — full screen rather than a partial-height bottom sheet,
              so it slides up and covers the whole viewport. The small
              scale pairs with the slide so it reads as expanding open
              rather than just sliding up, without the fragility of a true
              shared-element transition from the search bar (that trigger
              lives in two separate call sites — HeroSection.jsx and
              ListingsSearchBar.jsx — a mismatched/missing layoutId on
              either one would silently break the animation instead of
              just looking slightly less fancy). */}
          <motion.div
            initial={{ y: "100%", scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 w-full bg-white dark:bg-gray-900 flex flex-col"
            style={{ height: "100dvh" }}
          >
            {/* Header — Back and Clear All only, nothing else, ~56px tall
                (excluding the safe-area inset, which is extra device
                chrome space on top of that). No title: the first card
                below ("Where are you going?") already tells you what
                screen you're on. */}
            <div
              className="flex items-center justify-between px-2 pb-2 shrink-0 border-b border-gray-100 dark:border-white/[0.06]"
              style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)" }}
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                aria-label={t("back")}
                className="w-11 h-11 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition shrink-0"
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </motion.button>

              <AnimatePresence>
                {hasAnyValue && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClear}
                    className="text-sm font-semibold px-3 min-h-[44px] -me-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition whitespace-nowrap"
                    style={{ color: tint?.hex ?? "#7c3aed" }}
                  >
                    {t("clear_all")}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Persistent tab strip — Where / Why / Feel / Dates / Who,
                always visible, any tab reachable in any order (replaces
                the previous one-at-a-time accordion + special-cased
                full-screen Where). Active tab gets a colored icon/label
                and a colored underline; the panel below swaps to match. */}
            <div
              className="flex items-stretch shrink-0 border-b border-gray-100 dark:border-white/[0.06] px-1"
              role="tablist"
              aria-label={ctaLabel}
            >
              {tabs.map((tabItem) => {
                const Icon = tabItem.icon;
                const isActive = openSection === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setOpenSection(tabItem.id)}
                    className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] border-b-2 transition-colors ${
                      isActive ? "" : "border-transparent"
                    }`}
                    style={isActive ? { borderColor: tint?.hex ?? "#7c3aed" } : undefined}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: isActive ? (tint?.hex ?? "#7c3aed") : undefined }}
                    />
                    <span
                      className={`text-[11px] font-semibold truncate max-w-full ${isActive ? "" : "text-gray-400 dark:text-white/35"}`}
                      style={isActive ? { color: tint?.hex ?? "#7c3aed" } : undefined}
                    >
                      {tabItem.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Content — a single panel for whichever tab is active. Each
                panel fills the rest of the sheet (flex-1) and scrolls
                within itself, so the tab strip and header/footer around
                it stay put. */}
            <div className="flex-1 min-h-0 flex flex-col px-4 pt-3 pb-3">
              {openSection === "location" && (
                <div className="flex-1 min-h-0 flex flex-col">
                  {/* Empty-state prompt — spec's exact copy, shown only until a destination is picked */}
                  {!location && (
                    <p className="text-[15px] font-bold text-gray-800 dark:text-white mb-3 px-0.5 shrink-0">
                      {t("where_going")}
                    </p>
                  )}
                  <div className="flex-1 min-h-0 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
                    {/*
                      inline=true: suggestions render in document flow (no absolute positioning).
                      onSelect: updates parent location state so the search button activates.
                    */}
                    <LocationAutoComplete
                      category={activeCategory}
                      tint={tint}
                      countryCode={countryCode}
                      textClass="text-gray-800 dark:text-white"
                      placeholderClass="placeholder-gray-400 dark:placeholder-white/35"
                      clearClass="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/80"
                      inline
                      lightDropdown={true}
                      autoFocus
                      // Where unmounts/remounts every time the tab strip
                      // switches away and back (it's a plain conditional
                      // render, not a hidden/kept-alive panel) — without
                      // this, LocationAutoComplete's own defaultValue sync
                      // effect ran with `undefined` on every fresh mount
                      // and force-cleared its internal query state to "",
                      // so the input box went blank even though `location`
                      // (and the footer summary) still correctly held the
                      // previous pick.
                      defaultValue={location}
                      onSelect={(value) => {
                        // Property-mode picks/queries arrive as objects
                        // ({ mode: "property", propertyName | propertyQuery }),
                        // not the plain city string Location mode sends —
                        // normalize both into the summary string this sheet
                        // displays in the collapsed header/summary bar. The
                        // raw `value` itself is kept in locationValue for
                        // handleSearch.
                        const summary =
                          typeof value === "string"
                            ? value
                            : value?.propertyName || value?.propertyQuery || value?.city || "";
                        setLocation(summary);
                        setLocationValue(value);
                        // Advance to the next tab in field order — the
                        // first extra facet (Why/Feel) if this category has
                        // one, otherwise straight to Dates. Purely a
                        // convenience default; every tab stays reachable
                        // regardless, so this never traps anyone.
                        if (summary) setOpenSection(extraFields[0]?.id ?? "date");
                      }}
                      onModeChange={setLocationLabel}
                      itemDest={itemDest}
                    />
                  </div>
                </div>
              )}

              {/* ── Category-specific extra facets (e.g. farmstay Occasion/Vibe) ──
                  Config-driven via SHEET_EXTRA_FIELDS, one full tab each
                  (matching the desktop bar's Where → Why → Feel → Dates → Who
                  order). Picking a value auto-advances to the next tab in
                  that order — the next extra facet if there is one,
                  otherwise Dates — same "no extra tap" behaviour Where→Date
                  and Date→Who already have. Every tab still stays reachable
                  by hand regardless, so this is a convenience, not a gate. */}
              {extraFields.map((field, fieldIndex) =>
                openSection === field.id ? (
                  <div key={field.id} className="flex-1 min-h-0 flex flex-col">
                    <p className="text-[15px] font-bold text-gray-800 dark:text-white mb-3 px-0.5 shrink-0">
                      {t(field.labelKey)}
                    </p>
                    <div className="flex-1 min-h-0 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
                      <SearchSelectField
                        inline
                        options={field.options.map((o) => ({ id: o.id, label: tf(`${field.optionKeyPrefix}${o.id}`), icon: o.icon, image: o.image }))}
                        value={extraValues[field.id] ?? ""}
                        onChange={(v) => {
                          setExtraValues((p) => ({ ...p, [field.id]: v }));
                          if (v) setOpenSection(extraFields[fieldIndex + 1]?.id ?? "date");
                        }}
                        tint={tint}
                      />
                    </div>
                  </div>
                ) : null
              )}

              {/* ── Dates ── */}
              {openSection === "date" && (
                <div className="flex-1 min-h-0 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
                  {/*
                    Premium swipeable calendar (large month cards, sticky
                    month header) — see MobileDateCalendar.jsx. Per the
                    "auto progression, no extra tap" spec: single-date
                    categories advance to Guests the instant a date is
                    tapped, range categories advance once the full range is
                    picked. Datetime (studios) is the one exception — a date
                    alone isn't "done" there (a time still needs setting),
                    so it doesn't auto-advance — the user taps the "Who"
                    tab themselves once ready, same as jumping to any other
                    tab. `d &&` guards against firing on the calendar's own
                    Clear action, which reports null.
                  */}
                  <MobileDateCalendar
                    mode={config.dateMode}
                    tint={tint}
                    category={activeCategory}
                    countryCode={countryCode}
                    startDate={startDate}
                    endDate={endDate}
                    onChangeStart={(d) => {
                      setStartDate(d);
                      if (d && !isRange && !isDatetime) setOpenSection("guests");
                    }}
                    onChangeEnd={(d) => {
                      setEndDate(d);
                      if (isRange && d) setOpenSection("guests");
                    }}
                    onDurationChange={setDuration}
                  />
                </div>
              )}

              {/* ── Who ── */}
              {openSection === "guests" && (
                <div className="flex-1 min-h-0 flex flex-col">
                  {/* Empty-state prompt — spec's exact copy, shown only until a count is set */}
                  {Object.keys(guests).length === 0 && (
                    <p className="text-[15px] font-bold text-gray-800 dark:text-white mb-3 px-0.5 shrink-0">
                      {t("add_guests_prompt")}
                    </p>
                  )}
                  <div className="flex-1 min-h-0 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
                    {/*
                      inline=true: steppers render directly (no trigger/popup inside the sheet).
                      category drives the richer per-category field set (Adults/VIP/Staff for
                      venues, People/Meeting Rooms/Cabins for workspaces, etc) — see GuestPicker.
                      cardMode: elevated card-per-field styling per the redesign spec, purely
                      visual — same values/onChange contract either way.
                    */}
                    <GuestPicker
                      type={config.guestType}
                      category={activeCategory}
                      tint={tint}
                      onChange={setGuests}
                      onEventTypeChange={setEventType}
                      inline
                      cardMode
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Live Search Summary — sticky bar replacing the old plain
                footer. Shows what's actually selected plus a best-effort
                matching-listings count (see the matchCount effect above
                for exactly what that number does and doesn't account for),
                so the CTA isn't the only feedback the user gets. */}
            <div
              className="shrink-0 border-t border-gray-100 dark:border-white/[0.07] bg-white dark:bg-gray-900"
              style={{ boxShadow: "0 -4px 16px rgba(0,0,0,0.04)" }}
            >
              <AnimatePresence>
                {(location || startDate || Object.values(guests).some((n) => n > 0)) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pt-3 flex items-center gap-x-4 gap-y-1.5 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                      {location && (
                        <span className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-100">
                          <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: tint?.hex ?? "#7c3aed" }} />
                          <span className="truncate max-w-[40vw]">{location}</span>
                        </span>
                      )}
                      {dateSummary && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: tint?.hex ?? "#7c3aed" }} />
                          {dateSummary}
                        </span>
                      )}
                      {guestSummaryDisplay && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 shrink-0" style={{ color: tint?.hex ?? "#7c3aed" }} />
                          {guestSummaryDisplay}
                        </span>
                      )}
                      {location && (
                        <span className="ms-auto font-medium shrink-0" style={{ color: tint?.hex ?? "#7c3aed" }}>
                          {matchLoading ? t("searching") : matchCount != null ? `${matchCount} matching ${activeCategory}` : ""}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="px-4 pt-3.5"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!isReady) return;
                    handleSearch();
                    setOpen(false);
                  }}
                  disabled={!isReady}
                  className="w-full flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 justify-center"
                  style={{ background: tint.hex, boxShadow: "0 6px 18px rgba(0,0,0,0.22)" }}
                >
                  <Search className="w-4 h-4" />
                  {ctaLabel}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}