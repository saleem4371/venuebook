"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const categories = [
  { id: "banquet", name: "Banquet Hall", icon: "🏛️" },
  { id: "conference", name: "Conference Center", icon: "🏢" },
  { id: "resort", name: "Resorts", icon: "🏝️" },
  { id: "hotel", name: "Hotels", icon: "🏨" },
  { id: "villa", name: "Villas", icon: "🏡" },
  { id: "farm", name: "Farmhouse", icon: "🌿" },
];

export default function BasicDetailsStep({ form, setForm }) {
  const [touched, setTouched] = useState({});

  // 🔥 VALIDATION
  const isTitleValid = form.title?.length > 3;
  const isDescValid = form.description?.length > 10;
  const isCategoryValid = !!form.category;

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* 🔥 HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Basic details</h1>
        <p className="text-sm text-gray-500">
          Tell users about your venue
        </p>
      </div>

      {/* 🔥 TITLE */}
      <div>
        <label className="text-sm font-medium">
          Property title *
        </label>

        <input
          value={form.title || ""}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          onBlur={() =>
            setTouched({ ...touched, title: true })
          }
          maxLength={50}
          className={`border border-gray-200 w-full mt-2 p-3 rounded-xl bg-gray-50 outline-none transition
          ${
            touched.title && !isTitleValid
              ? "ring-1 ring-red-400"
              : "focus:ring-1 focus:ring-black"
          }`}
          placeholder="Enter property name"
        />

        <div className="flex justify-between text-xs mt-1">
          <span className="text-red-500">
            {touched.title && !isTitleValid && "Minimum 4 characters"}
          </span>
          <span className="text-gray-400">
            {form.title?.length || 0}/50
          </span>
        </div>
      </div>

      {/* 🔥 DESCRIPTION */}
      <div>
        <label className="text-sm font-medium">
          About the venue *
        </label>

        <textarea
          value={form.description || ""}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          onBlur={() =>
            setTouched({ ...touched, description: true })
          }
          maxLength={500}
          rows={5}
          className={`border border-gray-200 w-full mt-2 p-3 rounded-xl bg-gray-50 outline-none transition
          ${
            touched.description && !isDescValid
              ? "ring-1 ring-red-400"
              : "focus:ring-1 focus:ring-black"
          }`}
          placeholder="Describe your venue..."
        />

        <div className="flex justify-between text-xs mt-1">
          <span className="text-red-500">
            {touched.description &&
              !isDescValid &&
              "Minimum 10 characters"}
          </span>
          <span className="text-gray-400">
            {form.description?.length || 0}/500
          </span>
        </div>
      </div>

      {/* 🔥 CATEGORY */}
      <div>
        <label className="text-sm font-medium">
          Venue Category *
        </label>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {categories.map((cat) => {
            const active = form.category === cat.id;

            return (
              <motion.div
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setForm({ ...form, category: cat.id })
                }
                className={`p-4 rounded-2xl cursor-pointer transition text-center
                ${
                  active
                    ? "bg-purple-300 text-white"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="text-2xl mb-2">
                  {cat.icon}
                </div>
                <div className="text-sm">{cat.name}</div>
              </motion.div>
            );
          })}
        </div>

        {!isCategoryValid && touched.category && (
          <p className="text-xs text-red-500 mt-2">
            Please select a category
          </p>
        )}
      </div>
    </div>
  );
}
