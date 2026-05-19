"use client";

import { useState,useEffect } from "react";
import { IndianRupee, Info, ChevronDown, Check, Clock, AlertCircle } from "lucide-react";
import { PRICING_CONFIG, VENUE_SHIFTS, TIME_SLOTS } from "./config/pricingConfig";

// ─── Shared helpers ────────────────────────────────────────────────────────

const inputCls = (invalid) => [
  "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900",
  "text-gray-900 dark:text-white text-sm outline-none transition",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  invalid
    ? "border-red-400 ring-1 ring-red-400"
    : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
].join(" ");

function RupeeInput({ value, onChange, onBlur, placeholder, invalid }) {
  return (
    <div className="relative">
      <IndianRupee
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="number"
        min="0"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={[
          "w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition",
          "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          invalid
            ? "border-red-400 ring-1 ring-red-400"
            : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
        ].join(" ")}
      />
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-10 h-6 rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-violet-600 transition-colors flex-shrink-0" />
      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
    </label>
  );
}

// ─── Venue: Shift list with price inputs (Flat Rate / Both mode) ───────────

function ShiftPricingList({ pricing, onChange, showErrors }) {
  const shifts = pricing.shifts || {};

  const toggleShift = (key) => {
    const cur = shifts[key] || { enabled: false, price: "" };
    onChange("shifts", { ...shifts, [key]: { ...cur, enabled: !cur.enabled } });
  };

  const setPrice = (key, price) => {
    const cur = shifts[key] || { enabled: true, price: "" };
    onChange("shifts", { ...shifts, [key]: { ...cur, price } });
  };

  const hasEnabledWithPrice = VENUE_SHIFTS.some(
    (s) => shifts[s.key]?.enabled && Number(shifts[s.key]?.price) > 0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Shift pricing
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Enable shifts you offer and set a price for each
          </p>
        </div>
        {showErrors && !hasEnabledWithPrice && (
          <span className="text-xs text-red-500 font-medium">At least one required</span>
        )}
      </div>

      <div className="space-y-2">
        {VENUE_SHIFTS.map((shift) => {
          const entry   = shifts[shift.key] || { enabled: false, price: "" };
          const enabled = !!entry.enabled;
          const priceInvalid = showErrors && enabled && !Number(entry.price);

          return (
            <div
              key={shift.key}
              role="button"
              tabIndex={0}
              onClick={() => toggleShift(shift.key)}
              onKeyDown={(e) => (e.key === " " || e.key === "Enter") && toggleShift(shift.key)}
              className={[
                "rounded-xl border transition-all duration-150 cursor-pointer select-none",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                enabled
                  ? "border-violet-400 dark:border-violet-700 bg-violet-50/30 dark:bg-violet-950/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-violet-300 dark:hover:border-violet-700",
              ].join(" ")}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Checkbox — visual indicator, click bubbles to card */}
                <span
                  className={[
                    "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors pointer-events-none",
                    enabled
                      ? "bg-violet-600 border-violet-600"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
                  ].join(" ")}
                >
                  {enabled && <Check size={11} strokeWidth={3} className="text-white" />}
                </span>

                {/* Abbr badge */}
                <span
                  className={[
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                    enabled
                      ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
                  ].join(" ")}
                >
                  {shift.abbr}
                </span>

                {/* Label + time */}
                <div className="flex-1 min-w-0">
                  <p className={[
                    "text-sm font-semibold",
                    enabled ? "text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400",
                  ].join(" ")}>
                    {shift.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{shift.time}</p>
                </div>

                {/* Price input — stopPropagation so typing doesn't toggle the card */}
                {enabled && (
                  <div
                    className="w-32 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <RupeeInput
                      value={entry.price}
                      onChange={(v) => setPrice(shift.key, v)}
                      placeholder="0"
                      invalid={priceInvalid}
                    />
                  </div>
                )}
              </div>

              {/* Inline error for missing price */}
              {priceInvalid && (
                <p className="text-xs text-red-500 px-4 pb-2.5">
                  Enter a price for this shift
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Venue: Shift selector only — no price inputs (Per Person mode) ────────

function ShiftSelectorList({ pricing, onChange }) {
  const shifts = pricing.shifts || {};

  const toggleShift = (key) => {
    const cur = shifts[key] || { enabled: false };
    onChange("shifts", { ...shifts, [key]: { ...cur, enabled: !cur.enabled } });
  };

  const anyEnabled = VENUE_SHIFTS.some((s) => shifts[s.key]?.enabled);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Available shifts
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Select the time slots guests can book
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {VENUE_SHIFTS.map((shift) => {
          const enabled = !!(shifts[shift.key]?.enabled);
          return (
            <button
              key={shift.key}
              type="button"
              onClick={() => toggleShift(shift.key)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left",
                "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                enabled
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-violet-300 dark:hover:border-violet-700",
              ].join(" ")}
            >
              <span
                className={[
                  "w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors",
                  enabled
                    ? "bg-violet-600 border-violet-600"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
                ].join(" ")}
              >
                {enabled && <Check size={9} strokeWidth={3} className="text-white" />}
              </span>
              <div className="min-w-0">
                <p className={[
                  "text-sm font-semibold leading-none mb-0.5",
                  enabled
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-gray-700 dark:text-gray-300",
                ].join(" ")}>
                  {shift.label}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                  {shift.time}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Per-person info note */}
      <div className="mt-4 flex gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
        <Info size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
          Per person pricing will be configured in the <strong>Listing Editor</strong> after your listing is published.
        </p>
      </div>
    </div>
  );
}

// ─── Generic: Rate list (farmstay, studio, workspace, rental) ─────────────

function RateList({ rates, pricing, onChange, attempted }) {
  const showErr = !!attempted?.pricing;

  return (
    <div className="space-y-5">
      {rates.map((rate) => {
        const val     = pricing.rates?.[rate.key] || pricing[rate.key] || "";
        const invalid = showErr && rate.required && (!val || Number(val) <= 0);

        return (
          <div key={rate.key}>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {rate.label}
              {rate.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <RupeeInput
              value={val}
              onChange={(v) => {
                // Support both flat keys (pricing.nightly) and nested (pricing.rates.nightly)
                onChange(rate.key, v);
              }}
              placeholder={rate.placeholder}
              invalid={invalid}
            />
            {invalid && (
              <p className="text-xs text-red-500 mt-1">Please enter a valid price</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared: Security deposit ──────────────────────────────────────────────

function DepositField({ pricing, onChange, totalShiftPrice }) {
  const deposit        = Number(pricing.deposit) || 0;
  const cap            = totalShiftPrice > 0 ? totalShiftPrice * 0.5 : null;
  const exceedsCap     = cap !== null && deposit > cap;
  const formattedCap   = cap !== null
    ? cap.toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : null;

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Security deposit{" "}
        <span className="text-xs text-gray-400 font-normal">(optional)</span>
      </label>
      <RupeeInput
        value={pricing.deposit}
        onChange={(v) => onChange("deposit", v)}
        placeholder="0"
        invalid={exceedsCap}
      />
      {exceedsCap && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
          <AlertCircle size={12} className="flex-shrink-0" />
          Deposit cannot exceed 50% of total shift revenue
          {formattedCap && <span className="font-medium">(max ₹{formattedCap})</span>}
        </p>
      )}
    </div>
  );
}

// ─── Shared: Info note ─────────────────────────────────────────────────────

function InfoNote() {
  return (
    <div className="flex gap-2.5 p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900">
      <Info size={14} className="text-violet-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
        Pricing can be updated at any time. VenueBook charges zero commission on your first 3 bookings.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main PricingStep
// ─────────────────────────────────────────────────────────────────────────────

export default function PricingStep({ form, updateForm, attempted }) {
  const category = form.category || "venue";
  const config   = PRICING_CONFIG[category] || PRICING_CONFIG.farmstay;
  const pricing  = form.pricing || {};
  

  const [venueMode, setVenueMode] = useState("venue");

useEffect(() => {
  if (pricing?.mode) {
    setVenueMode(pricing.mode);
  }
}, [pricing?.mode]);

  // const update = (key, val) =>
  //   updateForm({ pricing: { ...pricing, [key]: val } });

  
const update = (key, val) => {
  const next =
    typeof updateForm === "function"
      ? updateForm
      : null;

  updateForm({
    ...form,
    pricing: {
      ...(form?.pricing || {}),
      [key]: val,
    },
  });
};

  const switchMode = (mode) => {
  setVenueMode(mode);
  update("mode", mode);
};

  const showErrors = !!attempted?.pricing;

  // ── Venue pricing ──────────────────────────────────────────────────────

  if (config.type === "venue_shifts") {
    // Compute total of enabled + priced shifts for deposit cap validation
    const shifts = pricing.shifts || {};
    const totalShiftPrice = Object.values(shifts)
      .filter((s) => s?.enabled && Number(s?.price) > 0)
      .reduce((sum, s) => sum + Number(s.price), 0);

    return (
      <div className="space-y-7">

        {/* ── Pricing model selector ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Pricing model
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {config.modes.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => switchMode(m.key)}
                className={[
                  "px-4 py-3.5 rounded-xl border text-left transition-all duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  venueMode === m.key
                    ? "border-violet-600 bg-violet-50 dark:bg-violet-950/30"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-violet-300 dark:hover:border-violet-700",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={[
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      venueMode === m.key
                        ? "border-violet-600"
                        : "border-gray-300 dark:border-gray-600",
                    ].join(" ")}
                  >
                    {venueMode === m.key && (
                      <span className="w-2 h-2 rounded-full bg-violet-600" />
                    )}
                  </span>
                  <span
                    className={[
                      "text-sm font-semibold",
                      venueMode === m.key
                        ? "text-violet-700 dark:text-violet-300"
                        : "text-gray-700 dark:text-gray-300",
                    ].join(" ")}
                  >
                    {m.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Venue Flat Rate: shifts + per-shift prices ── */}
        {venueMode === "venue" && (
          <ShiftPricingList
            pricing={pricing}
            onChange={update}
            showErrors={showErrors}
          />
        )}

        {/* ── Per Person: shift selection only, no price inputs ── */}
        {venueMode === "pax" && (
          <ShiftSelectorList
            pricing={pricing}
            onChange={update}
          />
        )}

        {/* ── Both: shift prices + info that pax comes later ── */}
        {venueMode === "both" && (
          <div className="space-y-4">
            <ShiftPricingList
              pricing={pricing}
              onChange={update}
              showErrors={showErrors}
            />
            <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
              <Info size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Per person pricing will be configured in the <strong>Listing Editor</strong> after publishing.
              </p>
            </div>
          </div>
        )}

        {/* ── Security deposit ── */}
        <DepositField pricing={pricing} onChange={update} totalShiftPrice={totalShiftPrice} />

        <InfoNote />
      </div>
    );
  }

  // ── Nightly / Hourly-day / Per-pax (non-venue categories) ─────────────

  return (
    <div className="space-y-7">

      <RateList
        rates={config.rates}
        pricing={pricing}
        onChange={update}
        attempted={attempted}
      />

      {/* Weekend markup */}
      {config.weekendToggle && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Weekend / peak pricing
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Charge more on Fri – Sun
              </p>
            </div>
            <Toggle
              checked={!!pricing.weekendEnabled}
              onChange={(v) => update("weekendEnabled", v)}
            />
          </div>

          {pricing.weekendEnabled && (
            <RupeeInput
              value={pricing.weekendPrice}
              onChange={(v) => update("weekendPrice", v)}
              placeholder="Weekend / peak rate"
            />
          )}
        </div>
      )}

      {/* Check-in / check-out (farmstay) */}
      {config.checkInOut && (
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Check-in &amp; check-out
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { field: "checkIn",  label: "Check-in",  default: "2:00 PM" },
              { field: "checkOut", label: "Check-out", default: "11:00 AM" },
            ].map(({ field, label, default: def }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={pricing[field] || def}
                    onChange={(e) => update(field, e.target.value)}
                    className={[
                      "w-full pl-9 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700",
                      "bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm",
                      "outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition appearance-none",
                    ].join(" ")}
                  >
                    {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {config.hasDeposit && <DepositField pricing={pricing} onChange={update} />}

      <InfoNote />
    </div>
  );
}
