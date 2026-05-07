"use client";

import { useState } from "react";
import { CATEGORY_LABELS } from "../wizardConfig";

// ─── Category SVG icons (inline, no emoji dependency) ─────────────────────
function CategoryIcon({ category, size = 14 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": "true" };

  switch (category) {
    case "venue":
      return (
        <svg {...props}>
          <path d="M3 22V8l9-6 9 6v14" />
          <path d="M9 22V12h6v10" />
          <path d="M3 8h18" />
        </svg>
      );
    case "farmstay":
      return (
        <svg {...props}>
          <path d="M12 2a10 10 0 0 1 0 20" />
          <path d="M12 2a10 10 0 0 0 0 20" />
          <path d="M12 2v20" />
          <path d="M2 12h20" />
        </svg>
      );
    case "studio":
      return (
        <svg {...props}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case "workspace":
      return (
        <svg {...props}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      );
    case "rental":
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "experience":
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  BasicsStep — property name + description. Category is pre-selected and
//  shown as a read-only chip; no re-selection picker in this step.
// ─────────────────────────────────────────────────────────────────────────────

export default function BasicsStep({ form, updateForm, attempted }) {
  const [touched, setTouched] = useState({});

  const touch = (field) => setTouched((p) => ({ ...p, [field]: true }));
  const showErr = (field) => touched[field] || attempted?.basics;

  const isTitleValid = form.title?.trim().length > 3;

  const catLabel = CATEGORY_LABELS[form.category] || form.category || "—";

  return (
    <div className="space-y-8">

      {/* ── Selected category chip (read-only) ── */}
      <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1.5">
        <span className="text-violet-600 dark:text-violet-400 flex items-center">
          <CategoryIcon category={form.category} size={14} />
        </span>
        <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
          Listing: {catLabel}
        </span>
      </div>

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
          placeholder="e.g. Serene Garden Farmhouse"
          className={[
            "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
            "outline-none transition text-sm placeholder:text-gray-400",
            showErr("title") && !isTitleValid
              ? "border-red-400 ring-1 ring-red-400"
              : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
          ].join(" ")}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-red-500">
            {showErr("title") && !isTitleValid ? "Minimum 4 characters required" : ""}
          </span>
          <span className="text-xs text-gray-400">{form.title?.length || 0}/60</span>
        </div>
      </div>

      {/* ── Description ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Short description{" "}
          <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">(optional)</span>
        </label>
        <textarea
          value={form.description || ""}
          onChange={(e) => updateForm({ description: e.target.value })}
          maxLength={300}
          rows={4}
          placeholder="Briefly describe your property to attract guests…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition text-sm resize-none placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {form.description?.length || 0}/300
        </p>
      </div>

    </div>
  );
}
