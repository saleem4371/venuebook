"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import LocationAutoComplete from "./LocationAutoComplete";
import DatePicker           from "./DatePicker";
import GuestPicker          from "./GuestPicker";

import { useCategory }    from "@/context/CategoryContext";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

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
  return (
    /*
     * No overflow-hidden on the outer div — that would clip the inline
     * LocationAutoComplete suggestion list and DatePicker calendar.
     * Rounded corners still render correctly without it.
     */
    <div className="border border-gray-200 dark:border-white/[0.1] rounded-2xl">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-start rounded-2xl"
      >
        <div
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
          style={isOpen
            ? { background: tint?.light ?? "rgba(124,58,237,0.12)" }
            : { background: "rgba(0,0,0,0.05)" }
          }
        >
          <Icon
            className="w-4 h-4"
            style={isOpen ? { color: tint?.hex ?? "#7c3aed" } : {}}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 leading-none mb-0.5">
            {label}
          </p>
          <p className={`text-sm font-medium truncate ${value ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>
            {value || `Add ${label.toLowerCase()}`}
          </p>
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden rounded-b-2xl"
          >
            <div className="px-4 pb-4 pt-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-white/[0.06]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main sheet ─────────────────────────────────────────────── */
export default function MobileSearchSheet({ open, setOpen }) {
  const { activeCategory } = useCategory();
  const tint               = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const config             = SHEET_CONFIG[activeCategory]   ?? SHEET_CONFIG.venues;

  const [openSection, setOpenSection] = useState("location");
  const [location,    setLocation]    = useState("");
  const [startDate,   setStartDate]   = useState(null);
  const [endDate,     setEndDate]     = useState(null);
  const [guests,      setGuests]      = useState({});

  const isRange    = config.dateMode === "range";
  const isDatetime = config.dateMode === "datetime";

  /* Human-readable summaries shown in collapsed headers */
  const dateSummary = (() => {
    if (!startDate) return "";
    const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (isRange && endDate) return `${fmt(startDate)} → ${fmt(endDate)}`;
    if (isRange)            return `${fmt(startDate)} → Check-out`;
    const base = fmt(startDate);
    if (isDatetime) {
      const t = startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      return `${base}, ${t}`;
    }
    return base;
  })();

  const guestSummary = (() => {
    const attendees = guests.attendees ?? 0;
    if (attendees) return `${attendees} attendee${attendees !== 1 ? "s" : ""}`;
    const adults   = guests.adults   ?? guests.guests ?? 1;
    const guestsCt = guests.guests   ?? 0;
    if (config.guestType === "guests") {
      const n = guests.guests ?? 0;
      return n ? `${n} guest${n !== 1 ? "s" : ""}` : "";
    }
    const children = guests.children ?? 0;
    const infants  = guests.infants  ?? 0;
    const pets     = guests.pets     ?? 0;
    const parts    = [`${adults} adult${adults !== 1 ? "s" : ""}`];
    if (children) parts.push(`${children} child${children !== 1 ? "ren" : ""}`);
    if (infants)  parts.push(`${infants} infant${infants !== 1 ? "s" : ""}`);
    if (pets)     parts.push(`${pets} pet${pets !== 1 ? "s" : ""}`);
    return parts.join(", ");
  })();

  const toggle = (section) =>
    setOpenSection((prev) => (prev === section ? null : section));

  const handleClear = () => {
    setLocation(""); setStartDate(null); setEndDate(null); setGuests({});
    setOpenSection("location");
  };

  const isReady = !!location;

  return (
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

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 w-full bg-white dark:bg-gray-900 rounded-t-3xl flex flex-col"
            style={{ maxHeight: "92svh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Header */}
            <div className="px-5 pt-1 pb-3 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base leading-snug">
                  {config.title}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Fill in your search details
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -me-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Scrollable content — overflow-y-auto here is fine because children use in-flow layouts */}
            <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2.5" style={{ overscrollBehavior: "contain" }}>

              {/* ── Location ── */}
              <FieldSection
                icon={MapPinIcon}
                label={config.locationLabel}
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
                  placeholder={config.locationPlaceholder}
                  textClass="text-gray-800 dark:text-white"
                  placeholderClass="placeholder-gray-400 dark:placeholder-white/35"
                  clearClass="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/80"
                  inline
                  onSelect={(city) => {
                    setLocation(city);
                    if (city) setOpenSection("date");
                  }}
                />
              </FieldSection>

              {/* ── Date ── */}
              <FieldSection
                icon={CalendarDaysIcon}
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
                  startDate={startDate}
                  endDate={endDate}
                  onChangeStart={(d) => {
                    setStartDate(d);
                    if (!isRange && !isDatetime) setOpenSection("guests");
                  }}
                  onChangeEnd={(d) => {
                    setEndDate(d);
                    if (isRange && d) setOpenSection("guests");
                  }}
                  alwaysOpen
                />
              </FieldSection>

              {/* ── Guests / Team size ── */}
              <FieldSection
                icon={UsersIcon}
                label={config.guestType === "attendees" ? "Team Size" : "Guests"}
                value={guestSummary}
                isOpen={openSection === "guests"}
                onToggle={() => toggle("guests")}
                tint={tint}
              >
                {/*
                  inline=true: steppers render directly (no trigger/popup inside the sheet).
                  Manual input only for venues (type="guests") — handled inside GuestPicker.
                */}
                <GuestPicker
                  type={config.guestType}
                  tint={tint}
                  onChange={setGuests}
                  inline
                />
              </FieldSection>

            </div>

            {/* Sticky footer */}
            <div className="shrink-0 px-4 py-3 border-t border-gray-100 dark:border-white/[0.07] bg-white dark:bg-gray-900 flex items-center justify-between gap-3">
              <button
                onClick={handleClear}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200 transition whitespace-nowrap"
              >
                Clear all
              </button>

              <button
                onClick={() => isReady && setOpen(false)}
                disabled={!isReady}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 flex-1 justify-center"
                style={{ background: tint.hex, boxShadow: `0 4px 16px rgba(0,0,0,0.2)` }}
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Search
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
