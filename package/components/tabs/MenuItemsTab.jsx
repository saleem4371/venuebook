"use client";

import { Plus, Upload, Search, Utensils, X } from "lucide-react";
import ItemCard from "../ui/ItemCard";
import EmptyState from "../ui/EmptyState";

/**
 * MenuItemsTab — browse and manage individual menu items.
 * Category filter chips + search bar + polished items grid.
 */
export default function MenuItemsTab({
  categories,
  selectedCatId,
  selectedCatName,
  filteredItems,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onUpload,
  pathUrl,
  t,
}) {
  const hasCategories = categories.length > 0;
  const totalInCat    = categories.find((c) => c.id === selectedCatId)?.package_item?.length ?? 0;

  return (
    <div>
      {/* Section header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("pkg.menu_items")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("pkg.menu_items_subtitle")}
          </p>
        </div>
        {hasCategories && (
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
              onClick={onAddItem}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 hover:shadow-lg active:scale-95"
              style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
            >
              <Plus size={13} />
              {t("pkg.add")}
            </button>
          </div>
        )}
      </div>

      {!hasCategories ? (
        <EmptyState
          icon={Utensils}
          title={t("pkg.no_items_no_cat")}
          description={t("pkg.no_items_no_cat_desc")}
        />
      ) : (
        <>
          {/* Category filter chips — horizontal scroll on mobile */}
          <div className="-mx-1 mb-5 flex overflow-x-auto px-1 pb-1 gap-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id, cat.package_item, cat.item_category)}
                  className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "border-transparent text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06]"
                  }`}
                  style={isActive ? { background: "linear-gradient(242deg,#a44bf3,#499ce8)" } : {}}
                >
                  {cat.item_category}
                  <span
                    className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                    }`}
                  >
                    {cat.package_item?.length ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          {selectedCatId && (
            <div className="mb-6 relative max-w-sm">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t("pkg.search_items")}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 dark:border-white/[0.07] dark:bg-[#0f172a] dark:text-white dark:placeholder-slate-500 dark:focus:border-violet-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Grid or empty */}
          {!selectedCatId || filteredItems.length === 0 ? (
            <EmptyState
              icon={Utensils}
              title={!selectedCatId ? t("pkg.select_category") : t("pkg.no_items_in_cat", { category: selectedCatName })}
              description={!selectedCatId ? t("pkg.select_category_desc") : t("pkg.add_first_item")}
              action={selectedCatId ? { label: t("pkg.add_item"), icon: Plus, onClick: onAddItem } : undefined}
            />
          ) : (
            <>
              {/* Result count */}
              <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
                {filteredItems.length} of {totalInCat} items
                {searchQuery && ` · "${searchQuery}"`}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    pathUrl={pathUrl}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
