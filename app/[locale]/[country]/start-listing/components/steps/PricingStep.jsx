"use client";

import { useState } from "react";
import { IndianRupee, Info } from "lucide-react";

const PRICE_UNITS = {
  venue:      ["per day", "per shift", "per hour"],
  farmstay:   ["per night", "per day", "per weekend"],
  studio:     ["per hour", "per half-day", "per day"],
  workspace:  ["per hour", "per day", "per month"],
  rental:     ["per night", "per week", "per month"],
  experience: ["per person", "per group", "per session"],
};

// ─────────────────────────────────────────────────────────────────────────────

export default function PricingStep({ form, updateForm, attempted }) {
  const [touched, setTouched] = useState({});

  const touch = (f) => setTouched((p) => ({ ...p, [f]: true }));
  const showErr = (f) => touched[f] || attempted?.pricing;

  const category = form.category || "venue";
  const units = PRICE_UNITS[category] || PRICE_UNITS.venue;
  const unit = form.priceUnit || units[0];

  const isPriceValid = !!form.basePrice && Number(form.basePrice) > 0;

  return (
    <div className="space-y-8">

      {/* Base price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Base price <span className="text-red-500">*</span>
        </label>

        <div className="flex gap-3">
          {/* Price input */}
          <div className="relative flex-1">
            <IndianRupee
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="number"
              min="0"
              value={form.basePrice || ""}
              onChange={(e) => updateForm({ basePrice: e.target.value })}
              onBlur={() => touch("basePrice")}
              placeholder="5,000"
              className={[
                "w-full pl-9 pr-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none transition text-sm",
                showErr("basePrice") && !isPriceValid
                  ? "border-red-400 ring-1 ring-red-400"
                  : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
              ].join(" ")}
            />
          </div>

          {/* Unit selector */}
          <select
            value={unit}
            onChange={(e) => { updateForm({ priceUnit: e.target.value }); touch("priceUnit"); }}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition text-sm"
          >
            {units.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {showErr("basePrice") && !isPriceValid && (
          <p className="text-xs text-red-500 mt-1.5">Please enter a valid price</p>
        )}
      </div>

      {/* Weekend pricing */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Weekend / peak pricing{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!form.weekendPricingEnabled}
              onChange={(e) => updateForm({ weekendPricingEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 peer-checked:bg-violet-600 rounded-full transition-colors" />
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
          </label>
        </div>

        {form.weekendPricingEnabled && (
          <div className="relative">
            <IndianRupee
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="number"
              min="0"
              value={form.weekendPrice || ""}
              onChange={(e) => updateForm({ weekendPrice: e.target.value })}
              placeholder="Weekend / peak price"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition text-sm"
            />
          </div>
        )}
      </div>

      {/* Security deposit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Security deposit{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <IndianRupee
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="number"
            min="0"
            value={form.deposit || ""}
            onChange={(e) => updateForm({ deposit: e.target.value })}
            placeholder="0"
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition text-sm"
          />
        </div>
      </div>

      {/* Info note */}
      <div className="flex gap-3 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900">
        <Info size={16} className="text-violet-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
          You can update your pricing at any time after listing. VenueBook does not charge
          any commission on your first booking.
        </p>
      </div>

    </div>
  );
}
