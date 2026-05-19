"use client";
import { useState, useEffect } from "react";
import { Pencil, CheckCircle2, Star, MapPin } from "lucide-react";
import { CATEGORY_LABELS } from "../wizardConfig";
import { AMENITY_META }    from "./config/amenitiesConfig";
import { CAPACITY_CONFIG, SEATING_STYLES } from "./config/capacityConfig";
import { PRICING_CONFIG, VENUE_SHIFTS }    from "./config/pricingConfig";
import { getCountryName, getLocationConfig } from "./config/locationConfig";

import { getAmenties } from "@/services/global.service";


// ─── Section card ──────────────────────────────────────────────────────────

function Section({ title, stepIndex, onEdit, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepIndex)}
          className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline underline-offset-2"
        >
          <Pencil size={11} />
          Edit
        </button>
      </div>
      <div className="px-5 py-4 space-y-2.5">{children}</div>
    </div>
  );
}

// ─── Key / value row ───────────────────────────────────────────────────────

function Row({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  const display = Array.isArray(value)
    ? (value.length > 0 ? value.join(", ") : null)
    : String(value);
  if (!display) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-gray-400 dark:text-gray-500 w-36 flex-shrink-0 text-xs pt-0.5">{label}</span>
      <span className="text-gray-800 dark:text-gray-200 font-medium flex-1 leading-snug break-words">{display}</span>
    </div>
  );
}

// ─── Long-text row (description) ──────────────────────────────────────────

function TextRow({ label, value }) {
  if (!value?.trim()) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-gray-400 dark:text-gray-500 w-36 flex-shrink-0 text-xs pt-0.5">{label}</span>
      <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed flex-1">{value}</p>
    </div>
  );
}

// ─── Amenity tag pill ──────────────────────────────────────────────────────

function AmenityPill({ label }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs font-medium text-violet-700 dark:text-violet-300">
      {label}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const fmt = (n) =>
  n ? `₹${Number(n).toLocaleString("en-IN")}` : null;

const fmtCoord = (n) =>
  typeof n === "number" ? n.toFixed(6) : null;

// ─────────────────────────────────────────────────────────────────────────────
//  ReviewStep — complete listing summary
// ─────────────────────────────────────────────────────────────────────────────

export default function ReviewStep({ form, goToStep }) {
  const images   = form.images   || [];
  const pricing  = form.pricing  || {};
  const capacity = form.capacity || {};
  const amenities = form.amenities || [];

   // API
  const [amenitie, setAmenities] = useState([]);

  console.log(amenitie)
  
    useEffect(() => {
      load();
    }, [form.category]);
  
    const load = async () => {
      try {
        const res = await getAmenties(form.category);
        const mergedData = res?.data?.data;
        const flatAmenities = mergedData.flatMap((group) => group.children);
        setAmenities(flatAmenities);
      } catch (err) {
        console.log(err);
      }
    };

  const coverImage = images.find((img) => img.cover) || images[0];
  const catLabel   = CATEGORY_LABELS[form.category] || form.category || "";
  const category   = form.category || "venue";

  // ── Capacity ──
  const capConfig = CAPACITY_CONFIG[category] || CAPACITY_CONFIG.venue;
  const seating   = capacity.seatingStyles || {};
  const enabledSeatingStyles = SEATING_STYLES.filter((s) => seating[s.key]?.enabled);

  // ── Pricing ──
  const pricingConfig = PRICING_CONFIG[category];

  const renderPricing = () => {
    if (!pricingConfig) return null;

    if (pricingConfig.type === "venue_shifts") {
      const mode = pricing.mode || "venue";

      const pricedShifts   = VENUE_SHIFTS.filter(
        (s) => pricing.shifts?.[s.key]?.enabled && pricing.shifts[s.key]?.price
      );
      const selectedShifts = VENUE_SHIFTS.filter(
        (s) => pricing.shifts?.[s.key]?.enabled
      );

      return (
        <>
          <Row label="Pricing model" value={
            mode === "venue" ? "Venue flat rate"
            : mode === "pax"   ? "Per person"
            : "Both (flat + per person)"
          } />

          {(mode === "venue" || mode === "both") && pricedShifts.length > 0 && (
            <div className="flex gap-3 text-sm">
              <span className="text-gray-400 dark:text-gray-500 w-36 flex-shrink-0 text-xs pt-0.5">Shifts</span>
              <div className="flex-1 space-y-1">
                {pricedShifts.map((s) => (
                  <div key={s.key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{s.label} · {s.time}</span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {fmt(pricing.shifts[s.key].price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === "pax" && selectedShifts.length > 0 && (
            <div className="flex gap-3 text-sm">
              <span className="text-gray-400 dark:text-gray-500 w-36 flex-shrink-0 text-xs pt-0.5">Shifts</span>
              <div className="flex-1 space-y-1">
                {selectedShifts.map((s) => (
                  <div key={s.key}>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{s.label} · {s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(mode === "pax" || mode === "both") && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
              Per person pricing will be configured in the Listing Editor.
            </p>
          )}

          {pricing.deposit && <Row label="Security deposit" value={fmt(pricing.deposit)} />}
        </>
      );
    }

    // nightly / hourly_day / per_pax — PricingStep writes to flat keys (pricing.nightly etc.)
    const rates = pricingConfig.rates || [];
    return (
      <>
        {rates.map((r) => {
          // Support both flat (pricing.nightly) and nested (pricing.rates.nightly)
          const val = pricing[r.key] || pricing.rates?.[r.key];
          return val ? <Row key={r.key} label={r.label} value={fmt(val)} /> : null;
        })}
        {pricingConfig.weekendToggle && pricing.weekendEnabled && (
          <Row label="Weekend rate" value={fmt(pricing.weekendRate || pricing.weekendPrice)} />
        )}
        {pricingConfig.checkInOut && (
          <>
            <Row label="Check-in"  value={pricing.checkIn}  />
            <Row label="Check-out" value={pricing.checkOut} />
          </>
        )}
        {pricingConfig.hasDeposit && pricing.deposit && (
          <Row label="Security deposit" value={fmt(pricing.deposit)} />
        )}
      </>
    );
  };

  return (
    <div className="space-y-4">

      {/* ── Hero cover image ── */}
      {coverImage && (
        <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImage.url} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white font-bold text-xl leading-snug drop-shadow">
              {form.title || "—"}
            </p>
            <p className="text-white/70 text-xs mt-1 font-medium">{catLabel}</p>
          </div>
          {images.length > 1 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-full">
              <Star size={10} fill="white" className="flex-shrink-0" />
              {images.length} photos
            </div>
          )}
        </div>
      )}

      {/* ── Step 0: Basics ── */}
      <Section title="Property Basics" stepIndex={0} onEdit={goToStep}>
        <Row  label="Name"     value={form.title}       />
        <Row  label="Category" value={catLabel}         />
        <Row  label="Type"     value={form.subcategory} />
        <TextRow label="Description" value={form.description} />
      </Section>

      {/* ── Step 1: Location ── */}
      <Section title="Location" stepIndex={1} onEdit={goToStep}>
        {(() => {
          const locCfg = getLocationConfig(form.country);
          return (
            <>
              <Row label="Address"             value={form.address}               />
              <Row label={locCfg.cityLabel}    value={form.city}                  />
              <Row label={locCfg.stateLabel}   value={form.state}                 />
              <Row label={locCfg.postalLabel}  value={form.pincode}               />
              <Row label="Country"             value={getCountryName(form.country)} />
              {form.lat != null && form.lng != null && (
                <div className="flex gap-3 text-sm pt-1">
                  <span className="text-gray-400 dark:text-gray-500 w-36 flex-shrink-0 text-xs pt-0.5 inline-flex items-center gap-1">
                    <MapPin size={10} />
                    Coordinates
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs font-mono">
                    {fmtCoord(form.lat)}, {fmtCoord(form.lng)}
                  </span>
                </div>
              )}
            </>
          );
        })()}
      </Section>

      {/* ── Step 2: Amenities ── */}
      <Section title="Amenities" stepIndex={2} onEdit={goToStep}>

      
        
        {amenities.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">No amenities selected</p>
        ) : (
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
            {amenitie
    .filter((item) => form.amenities.includes(item.id))
    .map((item) => item.name)
    .join(', ')}
          </div>
        )}
      </Section>

      {/* ── Step 3: Capacity ── */}
      <Section title="Capacity & Space" stepIndex={3} onEdit={goToStep}>
        {capConfig.fields.map((field) => {
          const val = capacity[field.key];
          if (!val || Number(val) <= 0) return null;
          return (
            <Row
              key={field.key}
              label={field.label}
              value={`${Number(val).toLocaleString("en-IN")} ${field.unit}`}
            />
          );
        })}

        {enabledSeatingStyles.length > 0 && (
          <div className="flex gap-3 text-sm pt-1">
            <span className="text-gray-400 dark:text-gray-500 w-36 flex-shrink-0 text-xs pt-0.5">
              Seating styles
            </span>
            <div className="flex-1 space-y-1.5">
              {enabledSeatingStyles.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{s.label}</span>
                  {seating[s.key]?.capacity && (
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {Number(seating[s.key].capacity).toLocaleString("en-IN")} guests
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ── Step 4: Pricing ── */}
      <Section title="Pricing & Rates" stepIndex={4} onEdit={goToStep}>
        {renderPricing()}
      </Section>

      {/* ── Step 5: Photos ── */}
      <Section title="Photos" stepIndex={5} onEdit={goToStep}>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {images.length} photo{images.length !== 1 ? "s" : ""} uploaded
        </p>
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-1">
            {images.slice(0, 9).map((img) => (
              <div
                key={img.id}
                className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {img.cover && (
                  <div className="absolute inset-0 ring-2 ring-inset ring-violet-500 rounded-lg" />
                )}
              </div>
            ))}
            {images.length > 9 && (
              <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-semibold">
                +{images.length - 9}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── Submit CTA note ── */}
      <div className="flex gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
          Your listing looks great! Click <strong>Submit Listing</strong> below to publish it.
          You can edit or update details any time from your vendor dashboard.
        </p>
      </div>

    </div>
  );
}
