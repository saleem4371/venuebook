"use client";

/**
 * PackagePageShell
 * Immersive full-page Package Management experience.
 */

import { HelpCircle, FolderOpen, UtensilsCrossed, Package, Star, CheckCircle2 } from "lucide-react";
import ScrollableTabBar, { tabActiveCls, tabIconCls } from "../../components/ScrollableTabBar";
import { useTranslations } from "next-intl";
import { usePackageManager } from "@/hooks/usePackageManager";
import CategoriesTab   from "./tabs/CategoriesTab";
import MenuItemsTab    from "./tabs/MenuItemsTab";
import PackagesTab     from "./tabs/PackagesTab";
import AddonsTab       from "./tabs/AddonsTab";
import CategoryModal        from "./modals/CategoryModal";
import ItemModal            from "./modals/ItemModal";
import PackageBuilderDrawer from "./modals/PackageBuilderDrawer";
import ViewPackageModal     from "./modals/ViewPackageModal";
import DeleteConfirmModal   from "./modals/DeleteConfirmModal";
import UploadModal          from "./modals/UploadModal";
import HelpModal            from "./modals/HelpModal";
import Toast from "./ui/Toast";

const TABS = [
  { id: "categories", label: "pkg.categories", Icon: FolderOpen      },
  { id: "items",      label: "pkg.menu_items", Icon: UtensilsCrossed },
  { id: "packages",   label: "pkg.packages",   Icon: Package         },
  { id: "addons",     label: "pkg.addons",     Icon: Star            },
];

/* ── Stat Card — soft tinted surfaces matching Add-ons / Team ── */
const PKG_STAT_COLORS = {
  purple:  "from-violet-500/10 to-purple-500/5  border-violet-200/60  dark:border-violet-800/30  text-violet-600  dark:text-violet-400",
  blue:    "from-blue-500/10   to-cyan-500/5    border-blue-200/60    dark:border-blue-800/30    text-blue-600    dark:text-blue-400",
  emerald: "from-emerald-500/10 to-teal-500/5   border-emerald-200/60 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400",
  amber:   "from-amber-500/10  to-orange-500/5  border-amber-200/60   dark:border-amber-800/30   text-amber-600   dark:text-amber-400",
};

function StatCard({ label, value, icon: Icon, color = "purple" }) {
  const cls = PKG_STAT_COLORS[color] ?? PKG_STAT_COLORS.purple;
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cls} border p-4 bg-white dark:bg-gray-900/60 transition-all hover:shadow-md hover:-translate-y-px`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 leading-none">{value}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-white/5">
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full">
      <div className="relative overflow-hidden border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-10 py-8 dark:border-white/5 dark:bg-[#070b14]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-sky-500/5" />
        <div className="relative space-y-4">
          <div className="h-7 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-white/[0.07]" />
          <div className="h-4 w-72 animate-pulse rounded-lg bg-slate-100 dark:bg-white/[0.04]" />
          <div className="flex gap-3 pt-2">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-14 w-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]" />
            ))}
          </div>
        </div>
      </div>
      <div className="border-b border-slate-200 px-4 sm:px-6 lg:px-10 py-3 dark:border-white/5">
        <div className="flex gap-1">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
          ))}
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PackagePageShell() {
  const t   = useTranslations();
  const pkg = usePackageManager();

  const tFn = (key, params) => {
    try { return t(key, params); }
    catch { return key.split(".").pop().replace(/_/g, " "); }
  };

  if (pkg.loading) return <LoadingSkeleton />;

  const publishedPkgCount = pkg.packages.filter((p) => p.package_status === 1).length;

  return (
    <div className="flex w-full flex-col pb-24 lg:pb-8">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-10 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              {tFn("pkg.title")}
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {tFn("pkg.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => pkg.setHelpOpen(true)}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/5 px-3.5 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-white/10 self-start"
          >
            <HelpCircle size={13} />
            {tFn("pkg.help")}
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label={tFn("pkg.categories")} value={pkg.categories.length} icon={FolderOpen}      color="purple"  />
          <StatCard label={tFn("pkg.menu_items")}  value={pkg.totalItemCount}    icon={UtensilsCrossed} color="blue"    />
          <StatCard label={tFn("pkg.packages")}    value={pkg.packages.length}   icon={Package}         color="amber"   />
          <StatCard label={tFn("pkg.published")}   value={publishedPkgCount}     icon={CheckCircle2}    color="emerald" />
        </div>
      </div>

      {/* ── Sticky Tab Bar ───────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-10">
        <ScrollableTabBar
          tabs={TABS.map(tab => ({
            key:   tab.id,
            label: tFn(tab.label),
            icon:  tab.Icon,
            count: pkg.tabBadges[tab.id] ?? null,
          }))}
          active={pkg.activeTab}
          onChange={pkg.setActiveTab}
        />
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6">
        {pkg.activeTab === "categories" && (
          <CategoriesTab
            categories={pkg.categories}
            onAddCategory={pkg.openAddCategory}
            onEditCategory={pkg.openEditCategory}
            onTogglePublish={pkg.toggleCategoryPublish}
            onUpload={() => pkg.setUploadCatOpen(true)}
            t={tFn}
          />
        )}
        {pkg.activeTab === "items" && (
          <MenuItemsTab
            categories={pkg.categories}
            selectedCatId={pkg.selectedCatId}
            selectedCatName={pkg.selectedCatName}
            filteredItems={pkg.filteredItems}
            searchQuery={pkg.searchQuery}
            onSearchChange={pkg.setSearchQuery}
            onSelectCategory={pkg.selectCategory}
            onAddItem={pkg.openAddItem}
            onEditItem={pkg.openEditItem}
            onDeleteItem={pkg.requestDeleteItem}
            onUpload={() => pkg.setUploadItemOpen(true)}
            pathUrl={pkg.pathUrl}
            t={tFn}
          />
        )}
        {pkg.activeTab === "packages" && (
          <PackagesTab
            packages={pkg.packages}
            totalItemCount={pkg.totalItemCount}
            onCreatePackage={pkg.openCreatePackage}
            onEditPackage={pkg.openEditPackage}
            onViewPackage={pkg.openViewPackage}
            onTogglePublish={pkg.togglePackagePublish}
            onDuplicate={pkg.duplicatePackage}
            t={tFn}
          />
        )}
        {pkg.activeTab === "addons" && (
          <AddonsTab
            addons={pkg.addons}
            selectedCatId={pkg.selectedCatId}
            selectedCatName={pkg.selectedCatName}
            selectedMenu={pkg.selectedMenu}
            onAddCategory={pkg.openAddCategory}
            onAddItem={pkg.openAddItem}
            onSelectCategory={pkg.selectCategory}
            onEditItem={pkg.openEditItem}
            onDeleteItem={pkg.requestDeleteItem}
            pathUrl={pkg.pathUrl}
            t={tFn}
          />
        )}
      </div>

      {/* ── Modals & Drawers ─────────────────────────────────── */}
      <CategoryModal open={pkg.catModalOpen} onClose={() => pkg.setCatModalOpen(false)} form={pkg.catForm} onChange={pkg.setCatForm} onSubmit={pkg.submitCategory} saving={pkg.saving} t={tFn} />
      <ItemModal open={pkg.itemModalOpen} onClose={() => pkg.setItemModalOpen(false)} form={pkg.itemForm} onChange={pkg.setItemForm} imagePreview={pkg.imagePreview} onImageChange={pkg.handleImageChange} onRemoveImage={pkg.removeImage} onSubmit={pkg.submitItem} saving={pkg.saving} t={tFn} />
      <PackageBuilderDrawer open={pkg.pkgDrawerOpen} onClose={pkg.closePackageBuilder} form={pkg.pkgForm} onChange={pkg.setPkgForm} publishedCategories={pkg.publishedCategories} onItemToggle={pkg.toggleItemInPackage} onCountChange={pkg.changeCategoryCount} onSubmit={pkg.submitPackage} saving={pkg.saving} t={tFn} />
      <ViewPackageModal open={pkg.viewPkgOpen} onClose={() => pkg.setViewPkgOpen(false)} packageData={pkg.viewPackageData} t={tFn} />
      <DeleteConfirmModal open={pkg.deleteCfmOpen} onClose={() => pkg.setDeleteCfmOpen(false)} onConfirm={pkg.confirmDeleteItem} deleting={pkg.deleting} t={tFn} />
      <UploadModal open={pkg.uploadItemOpen} onClose={() => pkg.setUploadItemOpen(false)} mode="items" onUpload={pkg.submitUploadItems} uploading={pkg.uploading} t={tFn} />
      <UploadModal open={pkg.uploadCatOpen} onClose={() => pkg.setUploadCatOpen(false)} mode="categories" onUpload={pkg.submitUploadCategories} uploading={pkg.uploading} t={tFn} />
      <HelpModal open={pkg.helpOpen} onClose={() => pkg.setHelpOpen(false)} onUploadItems={() => pkg.setUploadItemOpen(true)} onUploadCategories={() => pkg.setUploadCatOpen(true)} t={tFn} />
      <Toast toast={pkg.toast} onClose={() => {}} />
    </div>
  );
}
