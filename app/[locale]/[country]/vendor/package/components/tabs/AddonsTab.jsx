"use client";

import { Plus, Coffee } from "lucide-react";
import ItemCard from "../ui/ItemCard";
import EmptyState from "../ui/EmptyState";

/**
 * AddonsTab — manage optional add-on items for venues.
 * Shares the same ItemCard as the Menu Items tab.
 */
export default function AddonsTab({
  addons,
  selectedCatId,
  selectedCatName,
  selectedMenu,
  onAddCategory,
  onAddItem,
  onSelectCategory,
  onEditItem,
  onDeleteItem,
  pathUrl,
  t,
}) {
  const hasAddons = addons.length > 0;

  return (
    <div>
      {/* Section header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">
            {t("pkg.addons")}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t("pkg.addons_subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAddCategory(1)}
          className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
        >
          <Plus size={13} />
          {t("pkg.add_category")}
        </button>
      </div>

      {/* No add-on categories */}
      {!hasAddons ? (
        <EmptyState
          icon={Coffee}
          title={t("pkg.no_addons")}
          description={t("pkg.no_addons_desc")}
          action={{
            label: t("pkg.add_category"),
            icon: Plus,
            onClick: () => onAddCategory(1),
          }}
        />
      ) : (
        <>
          {/* Add-on category filter chips */}
          <div className="mb-4 flex flex-wrap gap-2">
            {addons.map((cat) => {
              const isActive = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    onSelectCategory(cat.id, cat.package_item, cat.item_category)
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "border-transparent text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/5 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                  style={
                    isActive
                      ? { background: "linear-gradient(242deg,#a44bf3,#499ce8)" }
                      : {}
                  }
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

          {/* Add item to selected add-on category */}
          {selectedCatId && (
            <button
              type="button"
              onClick={onAddItem}
              className="mb-5 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-violet-300 bg-violet-50/60 px-3.5 py-2 text-xs font-medium text-violet-700 transition hover:bg-violet-100/60 dark:border-violet-500/30 dark:bg-violet-500/5 dark:text-violet-400 dark:hover:bg-violet-500/10"
            >
              <Plus size={13} />
              {t("pkg.add_item_to", { category: selectedCatName })}
            </button>
          )}

          {/* Items grid */}
          {selectedMenu.length === 0 ? (
            <EmptyState
              icon={Coffee}
              title={
                !selectedCatId
                  ? t("pkg.select_category")
                  : t("pkg.no_items_in_cat", { category: selectedCatName })
              }
              description={
                !selectedCatId
                  ? t("pkg.select_category_desc")
                  : t("pkg.add_first_item")
              }
              action={
                selectedCatId
                  ? { label: t("pkg.add_item"), icon: Plus, onClick: onAddItem }
                  : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {selectedMenu.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  pathUrl={pathUrl}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
