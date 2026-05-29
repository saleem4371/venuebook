"use client";

import { Plus, Upload, Shapes } from "lucide-react";
import CategoryCard from "../ui/CategoryCard";
import EmptyState from "../ui/EmptyState";

/**
 * CategoriesTab — manage menu categories.
 * Rich header with stats, spacious grid.
 */
export default function CategoriesTab({
  categories,
  onAddCategory,
  onEditCategory,
  onTogglePublish,
  onUpload,
  t,
}) {
  const publishedCount = categories.filter((c) => c.cat_publish === 1).length;

  return (
    <div>
      {/* Section header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("pkg.categories")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("pkg.categories_subtitle")}
          </p>
          {categories.length > 0 && (
            <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
                {publishedCount} published
              </span>
              {categories.length - publishedCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  {categories.length - publishedCount} draft
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow-md dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06]"
          >
            <Upload size={13} />
            {t("pkg.upload")}
          </button>
          <button
            type="button"
            onClick={() => onAddCategory(0)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 hover:shadow-lg active:scale-95"
            style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
          >
            <Plus size={13} />
            {t("pkg.add")}
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Shapes}
          title={t("pkg.no_categories")}
          description={t("pkg.no_categories_desc")}
          action={{ label: t("pkg.add_category"), icon: Plus, onClick: () => onAddCategory(0) }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={onEditCategory}
              onTogglePublish={onTogglePublish}
            />
          ))}
        </div>
      )}
    </div>
  );
}
