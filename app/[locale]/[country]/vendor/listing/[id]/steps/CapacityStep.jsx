"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function CapacityStep({ form, setForm }) {
  const [touched, setTouched] = useState({});

  const min = form.minCapacity || "";
  const max = form.maxCapacity || "";

  // 🔥 VALIDATION
  const isMinValid = min > 0;
  const isMaxValid = max > 0;
  const isRangeValid = Number(max) >= Number(min);

  const isValid = isMinValid && isMaxValid && isRangeValid;

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* 🔥 HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Guest capacity</h1>
        <p className="text-sm text-gray-500">
          Define minimum and maximum number of guests
        </p>
      </div>

      {/* 🔥 INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* MIN */}
        <div>
          <label className="text-sm font-medium">
            Minimum guests *
          </label>

          <input
            type="number"
            value={min}
            onChange={(e) =>
              setForm({
                ...form,
                minCapacity: e.target.value,
              })
            }
            onBlur={() =>
              setTouched({ ...touched, min: true })
            }
            placeholder="e.g. 50"
            className={`border border-gray-200 w-full mt-2 p-4 rounded-2xl bg-gray-50 outline-none
            ${
              touched.min && !isMinValid
                ? "ring-1 ring-red-400"
                : "focus:ring-1 focus:ring-black"
            }`}
          />

          {touched.min && !isMinValid && (
            <p className="text-xs text-red-500 mt-1">
              Enter valid minimum
            </p>
          )}
        </div>

        {/* MAX */}
        <div>
          <label className="text-sm font-medium">
            Maximum guests *
          </label>

          <input
            type="number"
            value={max}
            onChange={(e) =>
              setForm({
                ...form,
                maxCapacity: e.target.value,
              })
            }
            onBlur={() =>
              setTouched({ ...touched, max: true })
            }
            placeholder="e.g. 500"
            className={`border border-gray-200 w-full mt-2 p-4 rounded-2xl bg-gray-50 outline-none
            ${
              touched.max && (!isMaxValid || !isRangeValid)
                ? "ring-1 ring-red-400"
                : "focus:ring-1 focus:ring-black"
            }`}
          />

          {touched.max && !isMaxValid && (
            <p className="text-xs text-red-500 mt-1">
              Enter valid maximum
            </p>
          )}

          {touched.max && isMaxValid && !isRangeValid && (
            <p className="text-xs text-red-500 mt-1">
              Max must be greater than Min
            </p>
          )}
        </div>
      </div>

      {/* 🔥 QUICK SELECT (PREMIUM UX) */}
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Quick select
        </p>

        <div className="flex gap-2 flex-wrap">
          {[50, 100, 200, 500, 1000].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                setForm({
                  ...form,
                  minCapacity: Math.floor(num / 2),
                  maxCapacity: num,
                })
              }
              className="px-4 py-2 rounded-full bg-gray-100 text-sm hover:bg-gray-200"
            >
              Up to {num}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 🔥 SUMMARY */}
      {isValid && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm">
          Your venue can host <b>{min}</b> to <b>{max}</b> guests
        </div>
      )}
    </div>
  );
}
