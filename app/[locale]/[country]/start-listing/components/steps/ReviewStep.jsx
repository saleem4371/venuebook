"use client";

import { Pencil, CheckCircle2 } from "lucide-react";
import { CATEGORY_LABELS, WIZARD_STEPS } from "../wizardConfig";

// ─────────────────────────────────────────────────────────────────────────────
//  ReviewStep — summary of all collected data with per-section edit links
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, stepIndex, onEdit, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepIndex)}
          className="flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>
      <div className="px-5 py-4 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  const display =
    Array.isArray(value)
      ? value.length > 0
        ? value.join(", ")
        : null
      : String(value);
  if (!display) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-gray-400 dark:text-gray-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-gray-800 dark:text-gray-200 font-medium flex-1">{display}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ReviewStep({ form, goToStep }) {
  const details = form.details || {};
  const images = form.images || [];
  const pricing = form.pricing || {};

  const coverImage = images.find((img) => img.cover) || images[0];

  return (
    <div className="space-y-4">

      {/* Hero preview */}
      {coverImage && (
        <div className="relative h-44 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage.url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-bold text-lg leading-tight">{form.title || "—"}</p>
            <p className="text-white/70 text-xs mt-0.5">
              {CATEGORY_LABELS[form.category] || form.category}
            </p>
          </div>
        </div>
      )}

      {/* Basics */}
      <Section title="Property Basics" stepIndex={0} onEdit={goToStep}>
        <Row label="Name" value={form.title} />
        <Row label="Category" value={CATEGORY_LABELS[form.category] || form.category} />
        <Row label="Description" value={form.description} />
      </Section>

      {/* Location */}
      <Section title="Location" stepIndex={1} onEdit={goToStep}>
        <Row label="Address" value={form.address} />
        <Row label="City" value={form.city} />
        <Row label="State" value={form.state} />
        <Row label="PIN Code" value={form.pincode} />
        <Row label="Country" value={form.country} />
      </Section>

      {/* Details */}
      <Section title="Details" stepIndex={2} onEdit={goToStep}>
        {Object.entries(details).map(([key, val]) => (
          <Row
            key={key}
            label={key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (c) => c.toUpperCase())}
            value={val}
          />
        ))}
      </Section>

      {/* Media */}
      <Section title="Photos" stepIndex={3} onEdit={goToStep}>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {images.length} photo{images.length !== 1 ? "s" : ""} uploaded
        </p>
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {images.slice(0, 6).map((img) => (
              <div
                key={img.id}
                className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {images.length > 6 && (
              <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 font-medium">
                +{images.length - 6}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Pricing */}
      <Section title="Pricing" stepIndex={4} onEdit={goToStep}>
        <Row
          label="Base price"
          value={
            form.basePrice
              ? `₹${Number(form.basePrice).toLocaleString("en-IN")} ${form.priceUnit || ""}`
              : null
          }
        />
        {form.weekendPricingEnabled && (
          <Row
            label="Weekend price"
            value={
              form.weekendPrice
                ? `₹${Number(form.weekendPrice).toLocaleString("en-IN")}`
                : null
            }
          />
        )}
        {form.deposit && (
          <Row
            label="Security deposit"
            value={`₹${Number(form.deposit).toLocaleString("en-IN")}`}
          />
        )}
      </Section>

      {/* Submit note */}
      <div className="flex gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
          Your listing looks great! Click <strong>Submit Listing</strong> below to publish it.
          You can edit or update it at any time from your dashboard.
        </p>
      </div>

    </div>
  );
}
