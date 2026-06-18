"use client";

/**
 * PackagePageShell
 * Immersive full-page Package Management experience.
 */
import { useState, useEffect, useMemo, useRef } from "react";
import {
  HelpCircle,
  FolderOpen,
  UtensilsCrossed,
  Package,
  Star,
  CheckCircle2,
} from "lucide-react";
import ScrollableTabBar, {
  tabActiveCls,
  tabIconCls,
} from "../../components/ScrollableTabBar";
import { useTranslations } from "next-intl";
import { usePackageManager } from "@/hooks/usePackageManager";
import CategoriesTab from "./tabs/CategoriesTab";
import MenuItemsTab from "./tabs/MenuItemsTab";
import PackagesTab from "./tabs/PackagesTab";
import AddonsTab from "./tabs/AddonsTab";
import CategoryModal from "./modals/CategoryModal";
import ItemModal from "./modals/ItemModal";
import PackageBuilderDrawer from "./modals/PackageBuilderDrawer";
import ViewPackageModal from "./modals/ViewPackageModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import UploadModal from "./modals/UploadModal";
import HelpModal from "./modals/HelpModal";
import Toast from "./ui/Toast";

import {
  package_category,
  create_category,
  create_items,
  updateCategoryPublish,
} from "@/services/package.service";

const TABS = [
  { id: "categories", label: "pkg.categories", Icon: FolderOpen },
  { id: "items", label: "pkg.menu_items", Icon: UtensilsCrossed },
  { id: "packages", label: "pkg.packages", Icon: Package },
  { id: "addons", label: "pkg.addons", Icon: Star },
];

/* ── Stat Card — soft tinted surfaces matching Add-ons / Team ── */
const PKG_STAT_COLORS = {
  purple:
    "from-violet-500/10 to-purple-500/5  border-violet-200/60  dark:border-violet-800/30  text-violet-600  dark:text-violet-400",
  blue: "from-blue-500/10   to-cyan-500/5    border-blue-200/60    dark:border-blue-800/30    text-blue-600    dark:text-blue-400",
  emerald:
    "from-emerald-500/10 to-teal-500/5   border-emerald-200/60 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400",
  amber:
    "from-amber-500/10  to-orange-500/5  border-amber-200/60   dark:border-amber-800/30   text-amber-600   dark:text-amber-400",
};

function StatCard({ label, value, icon: Icon, color = "purple" }) {
  const cls = PKG_STAT_COLORS[color] ?? PKG_STAT_COLORS.purple;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cls} border p-4 bg-white dark:bg-gray-900/60 transition-all hover:shadow-md hover:-translate-y-px`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 leading-none">
            {value}
          </p>
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
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 w-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="border-b border-slate-200 px-4 sm:px-6 lg:px-10 py-3 dark:border-white/5">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-28 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.04]"
            />
          ))}
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PackagePageShell() {
  const t = useTranslations();
  const pkg = usePackageManager();

  const [packCategory, setPackCategory] = useState([]);
  const [addons, setAddons] = useState([]);
  const [pathUrl, setPathUrl] = useState("");
  const [loading, setLoading] = useState(true);

  /* ── Forms ──────────────────────────────────────────────── */
  const [catForm, setCatForm] = useState({
    id: null,
    name: "",
    type: 0,
  });

  const [itemForm, setItemForm] = useState({
    id: null,
    name: "",
    price: "",
    image: null,
    foodType: 0,
  });

  const [pkgForm, setPkgForm] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [viewPackageData, setViewPackageData] = useState(null);

  const [activeTab, setActiveTab] = useState("categories");
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [selectedCatName, setSelectedCatName] = useState("");
  const [selectedMenu, setSelectedMenu] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

    const [packages,   setPackages]   = useState([]);


    const [uploadItemOpen,  setUploadItemOpen]  = useState(false);

  const submitCategory = async () => {
    await create_category(catForm);

    pkg.setCatModalOpen(false);
    await loadPackage();
  };
const loadPackage = async () => {
  try {
    setLoading(true);

    const PackageCategory = await package_category();

    const items = PackageCategory?.data?.items || [];
    const addons = PackageCategory?.data?.addon_category || [];
    const packages = PackageCategory?.data?.package || [];

    setPackCategory(items);
    setAddons(addons);
    setPackages(packages);

    // Auto select first category
    if (items.length > 0) {
      setSelectedCatId(items[0].id);
      setSelectedCatName(items[0].item_category);
      setSelectedMenu(items[0].package_item || []);
    } else {
      setSelectedCatId(null);
      setSelectedCatName("");
      setSelectedMenu([]);
    }
  } catch (err) {
    console.error("Package load error:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadPackage();
    setPathUrl(process.env.NEXT_PUBLIC_AWS_BUCKET_URL || "");
  }, []);

  

  const tFn = (key, params) => {
    try {
      return t(key, params);
    } catch {
      return key.split(".").pop().replace(/_/g, " ");
    }
  };

  const onEditCategory = (cat) => {
    setCatForm({
      id: cat.id,
      name: cat.item_category,
      type: cat.type ?? 0,
    });

    pkg.setCatModalOpen(true);
  };

  const toggleCategoryPublish = async (id, status) => {
    try {
      await updateCategoryPublish({
        id,
        status,
      });

      setPackCategory((prev) =>
        prev.map((c) => (c.id === id ? { ...c, cat_publish: status } : c)),
      );
    } catch (err) {
      console.error(err);
    }
  };

const filteredItems = useMemo(() => {
  if (!searchQuery.trim()) return selectedMenu;

  const q = searchQuery.toLowerCase();

  return selectedMenu.filter((item) =>
    item.item_name?.toLowerCase().includes(q)
  );
}, [selectedMenu, searchQuery]);
 

  /* ════════════════════════════════════════════════════════
       INITIAL LOAD — seeded from mock data
    ════════════════════════════════════════════════════════ */
  // useEffect(() => {
  //   let cancelled = false;
  //   async function bootstrap() {
  //     await fakeDelay(800); // realistic loading feel
  //     if (cancelled) return;

  //     const cats = cloneMockCategories();
  //     const pkgs = cloneMockPackages();

  //     setCategories(cats);
  //     setAddons(MOCK_ADDONS);
  //     setPackages(pkgs);
  //     setPathUrl(MOCK_PATH_URL);

  //     if (cats.length > 0) {
  //       setSelectedCatId(cats[0].id);
  //       setSelectedCatName(cats[0].item_category);
  //       setSelectedMenu(cats[0].package_item);
  //     }

  //     setLoading(false);
  //   }
  //   bootstrap();
  //   return () => { cancelled = true; };
  // }, []);

  /* ════════════════════════════════════════════════════════
         CATEGORY SELECTOR
      ════════════════════════════════════════════════════════ */
  const selectCategory = (id, items, name) => {
    setSelectedCatId(id);
    setSelectedCatName(name);
    setSelectedMenu(items || []);
  };
  const submitItem = async () => {
    const catId = selectedCatId;

    const formData = new FormData();

    formData.append("id", itemForm.id);
    formData.append("cat_id", catId);
    formData.append("name", itemForm.name);
    formData.append("price", itemForm.price);
    formData.append("foodType", itemForm.foodType);

    if (itemForm.image instanceof File) {
      formData.append("image", itemForm.image);
    }

    await create_items(formData);

    pkg.setItemModalOpen(false);
      loadPackage();
  };
  const selectedCatIdRef = useRef(selectedCatId);
  useEffect(() => {
    selectedCatIdRef.current = selectedCatId;
  }, [selectedCatId]);


  function fakeDelay(ms = 600) {
    return new Promise((r) => setTimeout(r, ms));
  }

const openEditItem = (item) => {
  setItemForm({
    id: item.id,
    name: item.item_name,
    price: item.item_price,
    image: item.image,
    foodType: item.food_pre ?? 0,
  });

  setImagePreview(item.image || null);
  pkg.setItemModalOpen(true);
};

  const handleImageChange = (file) => {
    if (!file) {
      setImagePreview(null);
      return;
    }

    setItemForm((prev) => ({
      ...prev,
      image: file,
    }));

    const reader = new FileReader();

    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };

    reader.readAsDataURL(file);
  };

const removeImage = () => {
  setItemForm((f) => ({
    ...f,
    image: null,
  }));

  setImagePreview(null);
};

 const totalItemCount = useMemo(
  () =>
    packCategory.reduce(
      (s, c) => s + (c.package_item?.length || 0),
      0
    ),
  [packCategory]
);

//   if (!selectedCatId) return;

//   const cat = packCategory.find(c => c.id === selectedCatId);

//   if (cat) {
//     setSelectedMenu(cat.package_item || []);
//     setSelectedCatName(cat.item_category);
//   }
// }, [packCategory, selectedCatId]);


  const tabBadges = useMemo(
    () => ({
      categories: packCategory.length || null,
      items:      totalItemCount    || null,
      packages:   packages.length   || null,
      addons:     addons.length     || null,
    }),
    [packCategory.length, totalItemCount, packages.length, addons.length]
  );




  if (loading) return <LoadingSkeleton />;

  const publishedPkgCount = pkg.packages.filter(
    (p) => Number(p.package_status) === 1,
  ).length;



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
          <StatCard
            label={tFn("pkg.categories")}
            value={tabBadges.categories}
            icon={FolderOpen}
            color="purple"
          />
          <StatCard
            label={tFn("pkg.menu_items")}
            value={tabBadges.items}
            icon={UtensilsCrossed}
            color="blue"
          />
          <StatCard
            label={tFn("pkg.packages")}
            value={packages.length}
            icon={Package}
            color="amber"
          />
          <StatCard
            label={tFn("pkg.published")}
            value={publishedPkgCount}
            icon={CheckCircle2}
            color="emerald"
          />
        </div>
      </div>

      {/* ── Sticky Tab Bar ───────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-10">
        <ScrollableTabBar
          tabs={TABS.map((tab) => ({
            key: tab.id,
            label: tFn(tab.label),
            icon: tab.Icon,
            count: tabBadges[tab.id] ?? null,
          }))}
          active={pkg.activeTab}
          onChange={pkg.setActiveTab}
        />
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6">
        {pkg.activeTab === "categories" && (
          <CategoriesTab
            // categories={pkg.categories}
            categories={packCategory}
            onAddCategory={() => {
              setCatForm({
                id: null,
                name: "",
                type: 0,
              });
              pkg.setCatModalOpen(true);
            }}
            onEditCategory={onEditCategory}
            onTogglePublish={toggleCategoryPublish}
            onUpload={() => pkg.setUploadCatOpen(true)}
            t={tFn}
          />
        )}
        {pkg.activeTab === "items" && (
          <MenuItemsTab
            categories={packCategory}
            selectedCatId={selectedCatId}
            selectedCatName={selectedCatName}
            filteredItems={filteredItems}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectCategory={selectCategory}
            onAddItem={pkg.openAddItem}
            onEditItem={openEditItem}
            onDeleteItem={pkg.requestDeleteItem}
            onUpload={() => setUploadItemOpen(true)}
            pathUrl={pathUrl}
            t={tFn}
          />
        )}
        {pkg.activeTab === "packages" && (
          <PackagesTab
            packages={pkg.packages}
            totalItemCount={pkg.totalItemCount}
            onCreatePackage={pkg.openCreatePackage} //packCategory
            onEditPackage={pkg.openEditPackage}
            onViewPackage={pkg.openViewPackage}
            onTogglePublish={pkg.togglePackagePublish}
            onDuplicate={pkg.duplicatePackage}
            t={tFn}
          />
        )}
        {pkg.activeTab === "addons" && (
          <AddonsTab
            addons={addons}
            selectedCatId={selectedCatId}
            selectedCatName={selectedCatName}
            selectedMenu={selectedMenu}
            onAddCategory={() => {
              setCatForm({
                id: null,
                name: "",
                type: 1,
              });
              pkg.setCatModalOpen(true);
            }}
            onAddItem={pkg.openAddItem}
            onSelectCategory={selectCategory}
            onEditItem={openEditItem}
            onDeleteItem={pkg.requestDeleteItem}
            pathUrl={pathUrl}
            t={tFn}
          />
        )}
      </div>

      {/* ── Modals & Drawers ─────────────────────────────────── */}
      <CategoryModal
        open={pkg.catModalOpen}
        onClose={() => pkg.setCatModalOpen(false)}
        form={catForm}
        onChange={setCatForm}
        onSubmit={submitCategory}
        saving={pkg.saving}
        t={tFn}
        onEditCategory={onEditCategory}
      />
      <ItemModal
        open={pkg.itemModalOpen}
        onClose={() => pkg.setItemModalOpen(false)}
        form={itemForm}
        onChange={setItemForm}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        onRemoveImage={removeImage}
        onSubmit={submitItem}
        saving={pkg.saving}
        t={tFn}
          pathUrl={pathUrl}
      />
      <PackageBuilderDrawer
        open={pkg.pkgDrawerOpen}
        onClose={pkg.closePackageBuilder}
        form={pkg.pkgForm}
        onChange={pkg.setPkgForm}
        publishedCategories={pkg.publishedCategories}
        onItemToggle={pkg.toggleItemInPackage}
        onCountChange={pkg.changeCategoryCount}
        onSubmit={pkg.submitPackage}
        saving={pkg.saving}
        t={tFn}
      />
      <ViewPackageModal
        open={pkg.viewPkgOpen}
        onClose={() => pkg.setViewPkgOpen(false)}
        packageData={pkg.viewPackageData}
        t={tFn}
      />
      <DeleteConfirmModal
        open={pkg.deleteCfmOpen}
        onClose={() => pkg.setDeleteCfmOpen(false)}
        onConfirm={pkg.confirmDeleteItem}
        deleting={pkg.deleting}
        t={tFn}
      />
      <UploadModal
        open={pkg.uploadItemOpen}
        onClose={() => pkg.setUploadItemOpen(false)}
        mode="items"
        onUpload={pkg.submitUploadItems}
        uploading={pkg.uploading}
        t={tFn}
      />
      <UploadModal
        open={pkg.uploadCatOpen}
        onClose={() => pkg.setUploadCatOpen(false)}
        mode="categories"
        onUpload={pkg.submitUploadCategories}
        uploading={pkg.uploading}
        t={tFn}
      />
      <HelpModal
        open={pkg.helpOpen}
        onClose={() => pkg.setHelpOpen(false)}
        onUploadItems={() => pkg.setUploadItemOpen(true)}
        onUploadCategories={() => pkg.setUploadCatOpen(true)}
        t={tFn}
      />
      <Toast toast={pkg.toast} onClose={() => {}} />
    </div>
  );
}
