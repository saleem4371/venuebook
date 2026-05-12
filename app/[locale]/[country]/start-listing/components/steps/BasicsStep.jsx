"use client";

import { useState } from "react";
import { SUBCATEGORIES } from "./config/subcategoryConfig";

// ─── Shared input class helper ─────────────────────────────────────────────
const inputCls = (invalid) => [
  "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900",
  "text-gray-900 dark:text-white text-sm outline-none transition",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  invalid
    ? "border-red-400 ring-1 ring-red-400"
    : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
].join(" ");

// ─────────────────────────────────────────────────────────────────────────────
//  BasicsStep — title, about, subcategory
// ─────────────────────────────────────────────────────────────────────────────

export default function BasicsStep({ form, updateForm, attempted }) {
  const [touched, setTouched] = useState({});

  const touch    = (f) => setTouched((p) => ({ ...p, [f]: true }));
  const showErr  = (f) => touched[f] || !!attempted?.basics;

  const isTitleValid  = form.title?.trim().length > 3;
  const isDescValid   = form.description?.trim().length >= 10;
  const isSubcatValid = !!form.subcategory;
  const subcategories = SUBCATEGORIES[form.category] || [];

  return (
    <div className="space-y-8">

      {/* ── Property name ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Property name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title || ""}
          onChange={(e) => updateForm({ title: e.target.value })}
          onBlur={() => touch("title")}
          maxLength={60}
          placeholder="e.g. The Grand Oak Banquet Hall"
          className={inputCls(showErr("title") && !isTitleValid)}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-red-500">
            {showErr("title") && !isTitleValid ? "Minimum 4 characters required" : ""}
          </span>
          <span className="text-xs text-gray-400">{form.title?.length || 0}/60</span>
        </div>
      </div>

      {/* ── About / Description ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          About your property <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.description || ""}
          onChange={(e) => updateForm({ description: e.target.value })}
          onBlur={() => touch("description")}
          maxLength={500}
          rows={5}
          placeholder="Describe what makes your space special — ambiance, location, unique features…"
          className={[
            "w-full px-4 py-3 rounded-xl border",
            "bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm",
            "outline-none transition resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500",
            showErr("description") && !isDescValid
              ? "border-red-400 ring-1 ring-red-400"
              : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
          ].join(" ")}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-red-500">
            {showErr("description") && !isDescValid
              ? "Please describe your property (min 10 characters)"
              : ""}
          </span>
          <span className="text-xs text-gray-400">{form.description?.length || 0}/500</span>
        </div>
      </div>

      {/* ── Subcategory / Type ── */}
      {subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
            Property type <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Select the type that best describes your property
          </p>

          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => {
              const active = form.subcategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => { updateForm({ subcategory: sub }); touch("subcategory"); }}
                  className={[
                    "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                    active
                      ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:border-violet-400 dark:hover:border-violet-600 hover:text-violet-700 dark:hover:text-violet-300",
                  ].join(" ")}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {showErr("subcategory") && !isSubcatValid && (
            <p className="text-xs text-red-500 mt-2">Please select a property type</p>
          )}
        </div>
      )}

    </div>
  );
}
