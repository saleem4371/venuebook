"use client";

import { useState } from "react";

export default function LocationStep({ form, setForm }) {
  const [touched, setTouched] = useState({});

  // 🔥 VALUES
  const address = form.address || "";
  const city = form.city || "";
  const state = form.state || "";
  const pincode = form.pincode || "";
  const country = form.country || "";

  // 🔥 VALIDATION
  const isAddressValid = address.length > 5;
  const isCityValid = city.length > 2;
  const isStateValid = state.length > 2;
  const isPincodeValid = /^[0-9]{6}$/.test(pincode);
  const isCountryValid = country.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* 🔥 HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Location</h1>
        <p className="text-sm text-gray-500">
          Enter your venue address details
        </p>
      </div>

      {/* 🔥 ADDRESS */}
      <div>
        <label className="text-sm font-medium">
          Street address *
        </label>

        <input
          value={address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
          onBlur={() =>
            setTouched({ ...touched, address: true })
          }
          className={`w-full mt-2 p-3 rounded-xl border bg-white outline-none transition
          ${
            touched.address && !isAddressValid
              ? "border-red-400"
              : "border-gray-200 focus:border-black"
          }`}
          placeholder="Enter full address"
        />

        {touched.address && !isAddressValid && (
          <p className="text-xs text-red-500 mt-1">
            Enter a valid address
          </p>
        )}
      </div>

      {/* 🔥 GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* CITY */}
        <div>
          <label className="text-sm font-medium">City *</label>

          <input
            value={city}
            onChange={(e) =>
              setForm({ ...form, city: e.target.value })
            }
            onBlur={() =>
              setTouched({ ...touched, city: true })
            }
            className={`w-full mt-2 p-3 rounded-xl border bg-white outline-none
            ${
              touched.city && !isCityValid
                ? "border-red-400"
                : "border-gray-200 focus:border-black"
            }`}
          />

          {touched.city && !isCityValid && (
            <p className="text-xs text-red-500 mt-1">
              Enter valid city
            </p>
          )}
        </div>

        {/* STATE */}
        <div>
          <label className="text-sm font-medium">State *</label>

          <input
            value={state}
            onChange={(e) =>
              setForm({ ...form, state: e.target.value })
            }
            onBlur={() =>
              setTouched({ ...touched, state: true })
            }
            className={`w-full mt-2 p-3 rounded-xl border bg-white outline-none
            ${
              touched.state && !isStateValid
                ? "border-red-400"
                : "border-gray-200 focus:border-black"
            }`}
          />

          {touched.state && !isStateValid && (
            <p className="text-xs text-red-500 mt-1">
              Enter valid state
            </p>
          )}
        </div>

        {/* PINCODE */}
        <div>
          <label className="text-sm font-medium">
            PIN Code *
          </label>

          <input
            value={pincode}
            onChange={(e) =>
              setForm({
                ...form,
                pincode: e.target.value.replace(/\D/g, ""),
              })
            }
            onBlur={() =>
              setTouched({ ...touched, pincode: true })
            }
            maxLength={6}
            className={`w-full mt-2 p-3 rounded-xl border bg-white outline-none
            ${
              touched.pincode && !isPincodeValid
                ? "border-red-400"
                : "border-gray-200 focus:border-black"
            }`}
          />

          {touched.pincode && !isPincodeValid && (
            <p className="text-xs text-red-500 mt-1">
              Enter 6 digit PIN code
            </p>
          )}
        </div>

        {/* COUNTRY */}
        <div>
          <label className="text-sm font-medium">
            Country *
          </label>

          <select
            value={country}
            onChange={(e) =>
              setForm({ ...form, country: e.target.value })
            }
            onBlur={() =>
              setTouched({ ...touched, country: true })
            }
            className={`w-full mt-2 p-3 rounded-xl border bg-white outline-none
            ${
              touched.country && !isCountryValid
                ? "border-red-400"
                : "border-gray-200 focus:border-black"
            }`}
          >
            <option value="">Select country</option>
            <option value="India">India</option>
            <option value="UAE">UAE</option>
            <option value="USA">USA</option>
          </select>

          {touched.country && !isCountryValid && (
            <p className="text-xs text-red-500 mt-1">
              Select country
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
