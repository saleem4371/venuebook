"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

const COUNTRIES = ["India", "UAE", "USA", "UK", "Singapore", "Australia"];

// ─────────────────────────────────────────────────────────────────────────────

export default function LocationStep({ form, updateForm, attempted }) {
  const [touched, setTouched] = useState({});

  const touch = (field) => setTouched((p) => ({ ...p, [field]: true }));
  const showErr = (field) => touched[field] || attempted?.location;

  const v = {
    address: form.address?.trim().length > 5,
    city: form.city?.trim().length > 1,
    state: form.state?.trim().length > 1,
    pincode: /^[0-9]{6}$/.test(form.pincode || ""),
    country: !!form.country,
  };

  const inputCls = (field) =>
    [
      "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
      "outline-none transition text-sm",
      showErr(field) && !v[field]
        ? "border-red-400 ring-1 ring-red-400"
        : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
    ].join(" ");

  return (
    <div className="space-y-6">

      {/* Street address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Street address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.address || ""}
          onChange={(e) => updateForm({ address: e.target.value })}
          onBlur={() => touch("address")}
          placeholder="123, MG Road, Indiranagar"
          className={inputCls("address")}
        />
        {showErr("address") && !v.address && (
          <p className="text-xs text-red-500 mt-1">Enter a valid address</p>
        )}
      </div>

      {/* City / State row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.city || ""}
            onChange={(e) => updateForm({ city: e.target.value })}
            onBlur={() => touch("city")}
            placeholder="Bangalore"
            className={inputCls("city")}
          />
          {showErr("city") && !v.city && (
            <p className="text-xs text-red-500 mt-1">Enter a valid city</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.state || ""}
            onChange={(e) => updateForm({ state: e.target.value })}
            onBlur={() => touch("state")}
            placeholder="Karnataka"
            className={inputCls("state")}
          />
          {showErr("state") && !v.state && (
            <p className="text-xs text-red-500 mt-1">Enter a valid state</p>
          )}
        </div>
      </div>

      {/* PIN / Country row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            PIN Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={form.pincode || ""}
            onChange={(e) =>
              updateForm({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
            }
            onBlur={() => touch("pincode")}
            placeholder="560001"
            className={inputCls("pincode")}
          />
          {showErr("pincode") && !v.pincode && (
            <p className="text-xs text-red-500 mt-1">Enter a valid 6-digit PIN code</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            value={form.country || ""}
            onChange={(e) => { updateForm({ country: e.target.value }); touch("country"); }}
            onBlur={() => touch("country")}
            className={inputCls("country")}
          >
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {showErr("country") && !v.country && (
            <p className="text-xs text-red-500 mt-1">Please select a country</p>
          )}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 h-44 flex flex-col items-center justify-center gap-2 text-gray-400">
        <MapPin size={28} className="text-gray-300 dark:text-gray-600" />
        <p className="text-sm font-medium">Map preview</p>
        <p className="text-xs">Interactive map will appear here</p>
      </div>

    </div>
  );
}
