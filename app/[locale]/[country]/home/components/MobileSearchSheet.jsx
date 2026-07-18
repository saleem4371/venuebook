"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronDown,
} from "lucide-react";
import LocationAutoComplete   from "./LocationAutoComplete";
import DatePicker             from "./DatePicker";
import GuestPicker, { summarizeFields, getCategoryFields, GUEST_CONFIGS } from "./GuestPicker";

import { useCategory }    from "@/context/CategoryContext";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
import { LoadProperty }   from "@/services/venues.service";
import { DEFAULT_FILTERS } from "@/app/[locale]/[country]/search/[type]/components/FilterDrawer";

/* ── Per-category config ────────────────────────────────────── */
const SHEET_CONFIG = {
  venues:      { title: "Find a Venue",     guestType: "guests",          dateMode: "single",   dateLabel: "Event Date",   locationLabel: "Location",    locationPlaceholder: "City, area or venue name"  },
  farmstays:   { title: "Find a Farmstay",  guestType: "guests_detailed", dateMode: "range",    dateLabel: "Check In/Out", locationLabel: "Destination", locationPlaceholder: "Where do you want to go?"  },
  studios:     { title: "Book a Studio",    guestType: "attendees",       dateMode: "datetime", dateLabel: "Start Time",   locationLabel: "Location",    locationPlaceholder: "City or studio name"        },
  rentals:     { title: "Rent a Space",     guestType: "guests_detailed", dateMode: "range",    dateLabel: "Dates",        locationLabel: "Location",    locationPlaceholder: "City or space name"         },
  workspaces:  { title: "Find a Workspace", guestType: "attendees",       dateMode: "range",    dateLabel: "Dates",        locationLabel: "Location",    locationPlaceholder: "City or area"               },
  experiences: { title: "Explore",          guestType: "guests",          dateMode: "single",   dateLabel: "Date",         locationLabel: "Location",    locationPlaceholder: "City or area"               },
};

/* ── Collapsible field section ──────────────────────────────── */
function FieldSection({ icon: Icon, label, value, isOpen, onToggle, tint, children }) {
  const tintHex = tint?.hex ?? "#7c3aed";
  return (
    /*
     * The open field now fills the rest of the sheet's available height
     * (flex-1) and scrolls WITHIN itself (overflow-y-auto), instead of
     * growing to its full natural content height and pushing the whole
     * page tall — that was fine for a handful of rows but blew out the
     * screen once the calendar started stacking 6 months. `min-h-0` on
     * both the flexed wrapper and the scroll region is required — flex
     * items default to a content-based min-height that silently defeats
     * `overflow-y-auto` otherwise. Closed fields stay their natural
     * (shrink-0) row height, same as before.
     *
     * The open field gets a neutral border + shadow instead of the same
     * flat gray border every field had regardless of state, giving the
     * card stack actual depth instead of sitting flush against the
     * sheet's own white background.
     */
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col ${
        isOpen
          ? "flex-1 min-h-0 border-gray-300 dark:border-white/20 shadow-md"
          : "shrink-0 border-gray-200 dark:border-white/[0.1] shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full shrink-0 flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-start rounded-2xl"
      >
        <div
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
          style={isOpen
            ? { background: tint?.light ?? "rgba(124,58,237,0.12)" }
            : { background: "rgba(0,0,0,0.045)" }
          }
        >
          <Icon
            className="w-4 h-4"
            style={isOpen ? { color: tintHex } : {}}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 leading-none mb-1">
            {label}
          </p>
          <p className={`text-sm font-medium truncate ${value ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>
            {value || `Add ${label.toLowerCase()}`}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="flex-1 min-h-0 overflow-y-auto rounded-b-2xl"
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="px-3 pb-3.5 pt-2.5 bg-gray-50/60 dark:bg-gray-900/50 border-t border-gray-100 dark:border-white/[0.06]">
            {children}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── Main sheet ─────────────────────────────────────────────── */
export default function MobileSearchSheet({ open, setOpen, onSummaryChange , itemDest}) {
  const { activeCategory } = useCategory();
  const params              = useParams();
  const countryCode         = String(params?.country || "in").toLowerCase();
  const tint                = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const config               = SHEET_CONFIG[activeCategory]   ?? SHEET_CONFIG.venues;

  const [openSection, setOpenSection] = useState("location");
  const [location,    setLocation]    = useState("");
  const [startDate,   setStartDate]   = useState(null);
  const [endDate,     setEndDate]     = useState(null);
  const [guests,      setGuests]      = useState({});
  const [duration,    setDuration]    = useState(null);   // e.g. "Evening", "Weekly" — informational only
  const [eventType,   setEventType]   = useState(null);   // venues only

  // Section header used to stay "Location"/"Destination" (straight from
  // SHEET_CONFIG) even after switching to Property mode inside the field —
  // only the placeholder changed. LocationAutoComplete reports its live
  // label via onModeChange; this mirrors it into the section header.
  const [locationLabel, setLocationLabel] = useState(config.locationLabel);
  useEffect(() => { setLocationLabel(config.locationLabel); }, [config.locationLabel]);

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
  // `guests` stays `{}` until the user actually touches a stepper (that's
  // when GuestPicker's onChange first fires) — summarizing an empty object
  // would otherwise show "0 adults" instead of the FieldSection's normal
  // grey "Add guests" placeholder.
  const guestSummary = Object.keys(guests).length > 0 ? (summarizeFields(guestFields, guests) || "") : "";
  const guestSummaryDisplay = eventType ? [guestSummary, eventType].filter(Boolean).join(" · ") : guestSummary;

  // Mirrors the current selection up to whoever opened this sheet (the
  // homepage's collapsed "Where to?" trigger button) so that button can
  // show the same live summary as the sticky bar inside the sheet itself,
  // instead of staying on its static placeholder after the user has
  // already picked a location/date/guests.
  useEffect(() => {
    onSummaryChange?.({ location, dateSummary, guestSummary: guestSummaryDisplay });
  }, [location, dateSummary, guestSummaryDisplay, onSummaryChange]);

  const toggle = (section) =>
    setOpenSection((prev) => (prev === section ? null : section));

  const handleClear = () => {
    setLocation(""); setStartDate(null); setEndDate(null); setGuests({});
    setDuration(null); setEventType(null);
    setOpenSection("location");
  };

  const isReady = !!location;

  /* ── Live matching-listings estimate ──────────────────────────────────
     No "count matching listings" endpoint exists anywhere in this
     codebase. This calls the real /listing endpoint (the same one the
     Search page itself uses — see LocationAutoComplete's identical call
     for the full rationale) with the currently selected location and
     reads how many rows come back. It's a genuine live count of what
     LoadProperty currently returns for this location/category — not a
     fabricated number — but it doesn't yet factor in the date/guest
     selections (this simple picker has no dedicated backend params for
     those), so treat it as an approximate, not a fully filtered count. */
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

  const ctaLabel = `Search ${activeCategory.charAt(0).toUpperCase()}${activeCategory.slice(1)}`;

  // Portal renders at document.body to escape any ancestor stacking contexts
  // (e.g. sticky z-30 SearchBar wrapper that would otherwise cap the sheet's z-index)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9998] md:hidden">

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={() => setOpen(false)}
          />

          {/* Sheet — full screen rather than a partial-height bottom sheet,
              so it slides up and covers the whole viewport. */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 w-full bg-white dark:bg-gray-900 flex flex-col"
            style={{ height: "100dvh" }}
          >
            {/* Header — a tint-colored icon badge gives the title an anchor
                point instead of sitting as bare text, and the border-b
                separates it from the scrollable content once that content
                scrolls underneath it. */}
            <div
              className="px-5 pb-3.5 flex items-center justify-between gap-3 shrink-0 border-b border-gray-100 dark:border-white/[0.06]"
              style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: tint?.light ?? "rgba(124,58,237,0.12)" }}
                >
                  <Search className="w-[18px] h-[18px]" style={{ color: tint?.hex ?? "#7c3aed" }} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base leading-snug truncate">
                    {config.title}
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Fill in your search details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -me-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition shrink-0"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content — no overflow/scroll of its own anymore. The open
                FieldSection fills this flex column (flex-1) and scrolls
                internally instead, so the collapsed sibling rows and the
                header/footer around them stay put instead of scrolling
                away too — the open field effectively takes over the rest
                of the screen, closer to how Airbnb's search sheet behaves. */}
            <div className="flex-1 min-h-0 flex flex-col px-5 pt-4 pb-3 gap-3">

              {/* ── Location ── */}
              <FieldSection
                icon={MapPin}
                label={locationLabel}
                value={location}
                isOpen={openSection === "location"}
                onToggle={() => toggle("location")}
                tint={tint}
              >
                {/*
                  inline=true: suggestions render in document flow (no absolute positioning).
                  onSelect: updates parent location state so the search button activates.
                */}
                <LocationAutoComplete
                  category={activeCategory}
                  tint={tint}
                  countryCode={countryCode}
                  placeholder={config.locationPlaceholder}
                  textClass="text-gray-800 dark:text-white"
                  placeholderClass="placeholder-gray-400 dark:placeholder-white/35"
                  clearClass="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/80"
                  inline
                  lightDropdown={true}
                  onSelect={(value) => {
                    // Property-mode picks/queries arrive as objects
                    // ({ mode: "property", propertyName | propertyQuery }),
                    // not the plain city string Location mode sends —
                    // normalize both into the summary string this sheet
                    // displays in the collapsed header.
                    const summary =
                      typeof value === "string"
                        ? value
                        : value?.propertyName || value?.propertyQuery || value?.city || "";
                    setLocation(summary);
                    if (summary) setOpenSection("date");
                  }}
                  onModeChange={setLocationLabel}
                  itemDest={itemDest}
                />
              </FieldSection>

              {/* ── Date ── */}
              <FieldSection
                icon={Calendar}
                label={config.dateLabel}
                value={dateSummary}
                isOpen={openSection === "date"}
                onToggle={() => toggle("date")}
                tint={tint}
              >
                {/*
                  alwaysOpen=true: calendar renders inline (no popup trigger).
                  Dark glassmorphism calendar fits within the light sheet via
                  the dark bg baked into alwaysOpen mode.
                */}
                <DatePicker
                  mode={config.dateMode}
                  tint={tint}
                  category={activeCategory}
                  countryCode={countryCode}
                  startDate={startDate}
                  endDate={endDate}
                  lightMode={true}
                  onChangeStart={(d) => {
                    setStartDate(d);
                    // `d` arrives null from the new "Clear date" button —
                    // only auto-advance to Guests on an actual pick, not
                    // on a clear (which should just leave the date empty).
                    if (d && !isRange && !isDatetime) setOpenSection("guests");
                  }}
                  onChangeEnd={(d) => {
                    setEndDate(d);
                    if (isRange && d) setOpenSection("guests");
                  }}
                  onDurationChange={setDuration}
                  alwaysOpen
                />
              </FieldSection>

              {/* ── Guests / Team size ── */}
              <FieldSection
                icon={Users}
                label={config.guestType === "attendees" ? "Team Size" : "Guests"}
                value={guestSummaryDisplay}
                isOpen={openSection === "guests"}
                onToggle={() => toggle("guests")}
                tint={tint}
              >
                {/*
                  inline=true: steppers render directly (no trigger/popup inside the sheet).
                  category drives the richer per-category field set (Adults/VIP/Staff for
                  venues, People/Meeting Rooms/Cabins for workspaces, etc) — see GuestPicker.
                */}
                <GuestPicker
                  type={config.guestType}
                  category={activeCategory}
                  tint={tint}
                  onChange={setGuests}
                  onEventTypeChange={setEventType}
                  inline
                />
              </FieldSection>

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
                    <div className="px-5 pt-3 flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                      {location && <span className="font-semibold text-gray-800 dark:text-gray-100">{location}</span>}
                      {dateSummary && <span>{dateSummary}</span>}
                      {guestSummaryDisplay && <span>{guestSummaryDisplay}</span>}
                      {location && (
                        <span className="ms-auto font-medium" style={{ color: tint?.hex ?? "#7c3aed" }}>
                          {matchLoading ? "Checking…" : matchCount != null ? `${matchCount} matching ${activeCategory}` : ""}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="px-5 pt-3.5 flex items-center justify-between gap-3"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
              >
                <button
                  onClick={handleClear}
                  className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-3 py-2.5 -ms-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200 transition whitespace-nowrap"
                >
                  Clear all
                </button>

                <button
                  onClick={() => isReady && setOpen(false)}
                  disabled={!isReady}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 flex-1 justify-center"
                  style={{ background: tint.hex, boxShadow: "0 6px 18px rgba(0,0,0,0.22)" }}
                >
                  <Search className="w-4 h-4" />
                  {ctaLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
