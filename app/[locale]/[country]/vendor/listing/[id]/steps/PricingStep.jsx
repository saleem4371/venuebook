"use client";

import { useState } from "react";

export default function PricingStep({ form, setForm }) {
  const [touched, setTouched] = useState({});

  const pricing = form.pricing || {
    morning: { enabled: false, start: "", end: "", price: "" },
    afternoon: { enabled: false, start: "", end: "", price: "" },
    evening: { enabled: false, start: "", end: "", price: "" },
  };

  const updateShift = (shift, field, value) => {
    setForm({
      ...form,
      pricing: {
        ...pricing,
        [shift]: {
          ...pricing[shift],
          [field]: value,
        },
      },
    });
  };

  const toggleShift = (shift) => {
    setForm({
      ...form,
      pricing: {
        ...pricing,
        [shift]: {
          ...pricing[shift],
          enabled: !pricing[shift].enabled,
        },
      },
    });
  };

  // 🔥 VALIDATION
  const isValidShift = (shift) => {
    if (!shift.enabled) return true;

    return (
      shift.start &&
      shift.end &&
      shift.price > 0
    );
  };

  const shifts = [
    { key: "morning", label: "Morning Shift" },
    { key: "afternoon", label: "Afternoon Shift" },
    { key: "evening", label: "Evening Shift" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <h2 className="text-xl font-semibold">Pricing</h2>

      {shifts.map((item) => {
        const shift = pricing[item.key];
        const valid = isValidShift(shift);

        return (
          <div
            key={item.key}
            className="p-4 rounded-xl border border-gray-200 bg-white"
          >
            {/* 🔥 HEADER */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{item.label}</h3>
                <p className="text-xs text-gray-500">
                  Set timing and pricing
                </p>
              </div>

              <input
                type="checkbox"
                checked={shift.enabled}
                onChange={() => toggleShift(item.key)}
                className="w-5 h-5 accent-black"
              />
            </div>

            {/* 🔥 INPUTS */}
            {shift.enabled && (
              <div className="mt-4 grid md:grid-cols-3 gap-4">

                {/* START */}
                <div>
                  <label className="text-xs">Start Time *</label>
                  <input
                    type="time"
                    value={shift.start}
                    onChange={(e) =>
                      updateShift(item.key, "start", e.target.value)
                    }
                    onBlur={() =>
                      setTouched({ ...touched, [`${item.key}-start`]: true })
                    }
                    className={`w-full p-2 mt-1 rounded-lg border bg-white outline-none
                    ${
                      touched[`${item.key}-start`] && !shift.start
                        ? "border-red-400"
                        : "border-gray-200 focus:border-black"
                    }`}
                  />
                </div>

                {/* END */}
                <div>
                  <label className="text-xs">End Time *</label>
                  <input
                    type="time"
                    value={shift.end}
                    onChange={(e) =>
                      updateShift(item.key, "end", e.target.value)
                    }
                    onBlur={() =>
                      setTouched({ ...touched, [`${item.key}-end`]: true })
                    }
                    className={`w-full p-2 mt-1 rounded-lg border bg-white outline-none
                    ${
                      touched[`${item.key}-end`] && !shift.end
                        ? "border-red-400"
                        : "border-gray-200 focus:border-black"
                    }`}
                  />
                </div>

                {/* PRICE */}
                <div>
                  <label className="text-xs">Price ₹ *</label>
                  <input
                    type="number"
                    value={shift.price}
                    onChange={(e) =>
                      updateShift(item.key, "price", e.target.value)
                    }
                    onBlur={() =>
                      setTouched({ ...touched, [`${item.key}-price`]: true })
                    }
                    placeholder="5000"
                    className={`w-full p-2 mt-1 rounded-lg border bg-white outline-none
                    ${
                      touched[`${item.key}-price`] &&
                      (!shift.price || shift.price <= 0)
                        ? "border-red-400"
                        : "border-gray-200 focus:border-black"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* 🔴 ERROR */}
            {shift.enabled && !valid && (
              <p className="text-xs text-red-500 mt-2">
                Fill all required fields correctly
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
