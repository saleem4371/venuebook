"use client";

import { Plus, Package } from "lucide-react";
import PackageCard from "../ui/PackageCard";
import EmptyState from "../ui/EmptyState";

/**
 * PackagesTab — view, create, duplicate, and manage package presets.
 */
export default function PackagesTab({
  packages,
  totalItemCount,
  onCreatePackage,
  onEditPackage,
  onViewPackage,
  onTogglePublish,
  onDuplicate,
  t,
}) {
  const hasItems       = totalItemCount > 0;
  const publishedCount = packages.filter((p) => p.package_status === 1).length;

  return (
    <div>
      {/* Section header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("pkg.packages")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("pkg.packages_subtitle")}
          </p>
          {packages.length > 0 && (
            <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
                {publishedCount} published
              </span>
              {packages.length - publishedCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  {packages.length - publishedCount} draft
                </span>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onCreatePackage}
          disabled={!hasItems}
          title={!hasItems ? t("pkg.add_items_first") : undefined}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
        >
          <Plus size={13} />
          {t("pkg.create_package")}
        </button>
      </div>

      {packages.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t("pkg.no_packages")}
          description={!hasItems ? t("pkg.no_packages_no_items") : t("pkg.no_packages_desc")}
          action={hasItems ? { label: t("pkg.create_package"), icon: Plus, onClick: onCreatePackage } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onView={onViewPackage}
              onEdit={onEditPackage}
              onDuplicate={onDuplicate}
              onTogglePublish={onTogglePublish}
            />
          ))}
        </div>
      )}
    </div>
  );
}
