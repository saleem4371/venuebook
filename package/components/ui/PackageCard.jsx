"use client";
import { useTranslations } from "next-intl";

import { Eye, Pencil, Copy, Users, Baby, UserRound, Sparkles } from "lucide-react";
import FoodBadge from "./FoodBadge";
import PriceDisplay from "./PriceDisplay";

const PACKAGE_TYPE_CONFIG = {
  1: { tkey: "pkg.adult",    Icon: UserRound, color: "text-violet-500 dark:text-violet-400" },
  2: { tkey: "pkg.child",    Icon: Baby,      color: "text-sky-500 dark:text-sky-400"       },
  0: { tkey: "pkg.all_ages", Icon: Users,     color: "text-slate-500 dark:text-slate-400"   },
};

/**
 * PackageCard — premium package card with gradient top, depth, + duplicate action.
 */
export default function PackageCard({ pkg, onView, onEdit, onDuplicate, onTogglePublish }) {
  const t = useTranslations();
  const isPublished = pkg.package_status === 1;

  let itemCount = 0;
  try { itemCount = JSON.parse(pkg.package_items || "[]").length; } catch { /* */ }

  const typeInfo = PACKAGE_TYPE_CONFIG[pkg.package_type] ?? PACKAGE_TYPE_CONFIG[0];
  const TypeIcon = typeInfo.Icon;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isPublished
          ? "border-slate-200/80 bg-white dark:border-white/[0.07] dark:bg-[#0f172a]"
          : "border-slate-200/50 bg-slate-50/80 opacity-60 dark:border-white/[0.03] dark:bg-[#0f172a]/60"
      }`}
    >
      {/* Gradient top bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl transition-opacity duration-200 ${isPublished ? "opacity-100" : "opacity-30"}`}
        style={{ background: "linear-gradient(90deg,#a44bf3,#499ce8)" }}
      />

      {/* Published status glow */}
      {isPublished && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(ellipse at top, rgba(164,75,243,0.05) 0%, transparent 60%)" }}
        />
      )}

      <div className="relative flex flex-1 flex-col p-5 pt-6">
        {/* Header: name + price */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-sm font-semibold leading-snug text-slate-800 dark:text-white">
                {pkg.name}
              </h3>
              <FoodBadge type={pkg.package_food_type} size="xs" />
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <TypeIcon size={11} className={`shrink-0 ${typeInfo.color}`} />
              <span>{t(typeInfo.tkey)}</span>
              <span className="text-slate-300 dark:text-white/20">·</span>
              <span>{itemCount} items</span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <PriceDisplay
              amount={pkg.price}
              className="block text-lg font-bold leading-none"
              style={{
                background: "linear-gradient(242deg,#a44bf3,#499ce8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            />
            <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">per pax + GST</p>
          </div>
        </div>

        <div className="my-3 h-px bg-slate-100 dark:bg-white/[0.05]" />

        {/* Action row */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onView(pkg)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:shadow-sm dark:border-white/[0.07] dark:text-slate-300 dark:hover:bg-white/[0.05]"
          >
            <Eye size={12} strokeWidth={2} />
            View
          </button>
          <button
            type="button"
            onClick={() => onEdit(pkg)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:shadow-sm dark:border-white/[0.07] dark:text-slate-400 dark:hover:bg-white/[0.05]"
            aria-label="Edit package"
          >
            <Pencil size={12} strokeWidth={2} />
          </button>
          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(pkg)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 hover:shadow-sm dark:border-white/[0.07] dark:text-slate-400 dark:hover:bg-violet-500/10 dark:hover:border-violet-500/30 dark:hover:text-violet-400"
              aria-label="Duplicate package"
              title="Duplicate"
            >
              <Copy size={12} strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="my-3 h-px bg-slate-100 dark:bg-white/[0.05]" />

        {/* Publish toggle row */}
        <div className="flex items-center justify-between">
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
            onClick={() => onTogglePublish(pkg.id, isPublished ? 0 : 1)}
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
