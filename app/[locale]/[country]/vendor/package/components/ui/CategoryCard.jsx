"use client";

import { useTranslations } from "next-intl";

import { Pencil, Shapes } from "lucide-react";

/**
 * CategoryCard — polished category card with depth, hover glow, publish toggle.
 */
export default function CategoryCard({ category, onEdit, onTogglePublish }) {
  const t = useTranslations();
  const isPublished = Number(category.cat_publish) === 1;
  const itemCount = category?.package_item?.length ?? 0;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isPublished
          ? "border-slate-200/80 bg-white dark:border-white/[0.07] dark:bg-[#0f172a]"
          : "border-slate-200/50 bg-slate-50/80 opacity-55 dark:border-white/[0.03] dark:bg-[#0f172a]/60"
      }`}
    >
      {/* Published gradient top bar */}
      {isPublished && (
        <div
          className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg,#a44bf3,#499ce8)" }}
        />
      )}

      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(ellipse at top left, rgba(164,75,243,0.04) 0%, transparent 60%)" }}
      />

      <div className="relative p-5">
        {/* Icon + Edit button row */}
        <div className="mb-4 flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105"
            style={{ background: "linear-gradient(135deg,#a44bf3,#499ce8)" }}
          >
            <Shapes size={20} className="text-white" strokeWidth={1.8} />
          </div>

          <button
            type="button"
            onClick={() => onEdit?.(category)}
            aria-label="Edit category"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <Pencil size={13} strokeWidth={2} />
          </button>
        </div>

        {/* Name + item count */}
        <div className="mb-4 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-slate-800 dark:text-white">
            {category.item_category}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/[0.05]">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              isPublished ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isPublished ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]" : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
            {isPublished ? t("pkg.published") : t("pkg.draft")}
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={isPublished}
            onClick={() =>
  onTogglePublish?.(
    category.id,
    isPublished ? 0 : 1
  )
}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
              isPublished ? "bg-violet-500" : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isPublished ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
