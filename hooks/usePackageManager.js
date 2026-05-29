"use client";

/**
 * /hooks/usePackageManager.js
 *
 * Central state + data hook for the Package Management module.
 * Only consumed by Venues with PAX pricing model.
 *
 * ─────────────────────────────────────────────────────────────────
 * LOCALHOST-ONLY: All mutations operate on in-memory state seeded
 * from mockData.js. No real API calls are made.
 * Replace mock operations with PackageService.* calls for production.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  MOCK_CATEGORIES,
  MOCK_PACKAGES,
  MOCK_ADDONS,
  MOCK_PATH_URL,
  nextId,
} from "@/app/[locale]/[country]/vendor/package/data/mockData";

/* ─── Form defaults ──────────────────────────────────────────── */
const INITIAL_ITEM_FORM = { id: "", name: "", price: "", image: null, foodType: 0 };
const INITIAL_CAT_FORM  = { id: "", name: "", type: 0 };
const INITIAL_PKG_FORM  = { id: "", name: "", price: "", type: null, foodType: 0, publish: 1 };

/* ─── Deep-clone mock data so state mutations never touch the const ── */
function cloneMockCategories() {
  return MOCK_CATEGORIES.map((c) => ({
    ...c,
    count_number: 0,
    package_item: c.package_item.map((i) => ({ ...i, selected: false })),
  }));
}

function cloneMockPackages() {
  return MOCK_PACKAGES.map((p) => ({ ...p }));
}

/* ─── Simulated async delay (localhost feel) ─────────────────── */
function fakeDelay(ms = 600) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ═══════════════════════════════════════════════════════════════
   HOOK
═══════════════════════════════════════════════════════════════ */
export function usePackageManager() {
  /* ── Data ───────────────────────────────────────────────── */
  const [categories, setCategories] = useState([]);
  const [addons,     setAddons]     = useState([]);
  const [packages,   setPackages]   = useState([]);
  const [pathUrl,    setPathUrl]    = useState("");
  const [loading,    setLoading]    = useState(true);

  /* ── Mutations ──────────────────────────────────────────── */
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ── Toast ──────────────────────────────────────────────── */
  const [toast, setToast] = useState(null);

  /* ── Tab & filter ───────────────────────────────────────── */
  const [activeTab,        setActiveTab]        = useState("categories");
  const [selectedCatId,    setSelectedCatId]    = useState(null);
  const [selectedCatName,  setSelectedCatName]  = useState("");
  const [selectedMenu,     setSelectedMenu]     = useState([]);
  const [searchQuery,      setSearchQuery]      = useState("");

  /* ── Modals ─────────────────────────────────────────────── */
  const [catModalOpen,    setCatModalOpen]    = useState(false);
  const [itemModalOpen,   setItemModalOpen]   = useState(false);
  const [pkgDrawerOpen,   setPkgDrawerOpen]   = useState(false);
  const [viewPkgOpen,     setViewPkgOpen]     = useState(false);
  const [deleteCfmOpen,   setDeleteCfmOpen]   = useState(false);
  const [uploadItemOpen,  setUploadItemOpen]  = useState(false);
  const [uploadCatOpen,   setUploadCatOpen]   = useState(false);
  const [helpOpen,        setHelpOpen]        = useState(false);

  /* ── Forms ──────────────────────────────────────────────── */
  const [catForm,          setCatForm]          = useState(INITIAL_CAT_FORM);
  const [itemForm,         setItemForm]         = useState(INITIAL_ITEM_FORM);
  const [pkgForm,          setPkgForm]          = useState(INITIAL_PKG_FORM);
  const [imagePreview,     setImagePreview]     = useState(null);
  const [deleteTargetId,   setDeleteTargetId]   = useState(null);
  const [viewPackageData,  setViewPackageData]  = useState(null);

  /* ────────────────────────────────────────────────────────────
     Keep selectedMenu in sync when categories state changes
     (e.g. after adding an item, the filter chip view updates)
  ──────────────────────────────────────────────────────────── */
  const selectedCatIdRef = useRef(selectedCatId);
  useEffect(() => { selectedCatIdRef.current = selectedCatId; }, [selectedCatId]);

  const syncSelectedMenu = useCallback((cats, catId) => {
    const id = catId ?? selectedCatIdRef.current;
    const cat = cats.find((c) => c.id === id);
    if (cat) setSelectedMenu(cat.package_item);
  }, []);

  /* ════════════════════════════════════════════════════════
     INITIAL LOAD — seeded from mock data
  ════════════════════════════════════════════════════════ */
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      await fakeDelay(800); // realistic loading feel
      if (cancelled) return;

      const cats = cloneMockCategories();
      const pkgs = cloneMockPackages();

      setCategories(cats);
      setAddons(MOCK_ADDONS);
      setPackages(pkgs);
      setPathUrl(MOCK_PATH_URL);

      if (cats.length > 0) {
        setSelectedCatId(cats[0].id);
        setSelectedCatName(cats[0].item_category);
        setSelectedMenu(cats[0].package_item);
      }

      setLoading(false);
    }
    bootstrap();
    return () => { cancelled = true; };
  }, []);

  /* ════════════════════════════════════════════════════════
     COMPUTED
  ════════════════════════════════════════════════════════ */
  const totalItemCount = useMemo(
    () => categories.reduce((s, c) => s + c.package_item.length, 0),
    [categories]
  );

  const publishedCategories = useMemo(
    () => categories.filter((c) => c.cat_publish === 1),
    [categories]
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return selectedMenu;
    const q = searchQuery.toLowerCase();
    return selectedMenu.filter((i) => i.item_name.toLowerCase().includes(q));
  }, [selectedMenu, searchQuery]);

  const tabBadges = useMemo(
    () => ({
      categories: categories.length || null,
      items:      totalItemCount    || null,
      packages:   packages.length   || null,
      addons:     addons.length     || null,
    }),
    [categories.length, totalItemCount, packages.length, addons.length]
  );

  /* ════════════════════════════════════════════════════════
     TOAST
  ════════════════════════════════════════════════════════ */
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* ════════════════════════════════════════════════════════
     CATEGORY ACTIONS (localhost — in-memory)
  ════════════════════════════════════════════════════════ */
  const openAddCategory = useCallback((type = 0) => {
    setCatForm({ ...INITIAL_CAT_FORM, type });
    setCatModalOpen(true);
  }, []);

  const openEditCategory = useCallback((cat) => {
    setCatForm({ id: cat.id, name: cat.item_category, type: cat.type ?? 0 });
    setCatModalOpen(true);
  }, []);

  const submitCategory = useCallback(async () => {
    if (!catForm.name.trim()) return;
    setSaving(true);
    await fakeDelay(500);

    setCategories((prev) => {
      if (catForm.id) {
        // Edit
        return prev.map((c) =>
          c.id === catForm.id ? { ...c, item_category: catForm.name } : c
        );
      } else {
        // Add
        const newCat = {
          id: nextId(),
          item_category: catForm.name,
          cat_publish: 1,
          cat_icon: null,
          count_number: 0,
          package_item: [],
          type: catForm.type,
        };
        return [...prev, newCat];
      }
    });

    showToast(catForm.id ? "Category updated" : "Category added");
    setCatModalOpen(false);
    setSaving(false);
  }, [catForm, showToast]);

  const toggleCategoryPublish = useCallback((id, status) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, cat_publish: status } : c))
    );
    showToast(status === 1 ? "Category published" : "Category unpublished");
  }, [showToast]);

  /* ════════════════════════════════════════════════════════
     ITEM ACTIONS (localhost — in-memory)
  ════════════════════════════════════════════════════════ */
  const openAddItem = useCallback(() => {
    if (!selectedCatIdRef.current) {
      showToast("Select a category first", "warning");
      return;
    }
    setItemForm(INITIAL_ITEM_FORM);
    setImagePreview(null);
    setItemModalOpen(true);
  }, [showToast]);

  const openEditItem = useCallback((item) => {
    setItemForm({
      id:       item.id,
      name:     item.item_name,
      price:    item.item_price,
      image:    item.image,
      foodType: item.food_pre ?? 0,
    });
    setImagePreview(item.image || null);
    setItemModalOpen(true);
  }, []);

  const handleImageChange = useCallback((file) => {
    if (!file) { setImagePreview(null); return; }
    setItemForm((f) => ({ ...f, image: file }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback(() => {
    setItemForm((f) => ({ ...f, image: null }));
    setImagePreview(null);
  }, []);

  const submitItem = useCallback(async () => {
    if (!itemForm.name.trim() || !itemForm.price) return;
    setSaving(true);
    await fakeDelay(500);

    const catId = selectedCatIdRef.current;

    setCategories((prev) => {
      const updated = prev.map((cat) => {
        if (cat.id !== catId) return cat;
        if (itemForm.id) {
          // Edit existing
          return {
            ...cat,
            package_item: cat.package_item.map((i) =>
              i.id === itemForm.id
                ? {
                    ...i,
                    item_name:  itemForm.name,
                    item_price: Number(itemForm.price),
                    food_pre:   itemForm.foodType,
                    image:      itemForm.image instanceof File ? null : itemForm.image,
                  }
                : i
            ),
          };
        } else {
          // Add new
          const newItem = {
            id:         nextId(),
            item_name:  itemForm.name,
            item_price: Number(itemForm.price),
            food_pre:   itemForm.foodType,
            image:      null,
            selected:   false,
          };
          return { ...cat, package_item: [...cat.package_item, newItem] };
        }
      });

      // Keep selected menu in sync
      syncSelectedMenu(updated, catId);
      return updated;
    });

    showToast(itemForm.id ? "Item updated" : "Item added");
    setItemModalOpen(false);
    setSaving(false);
  }, [itemForm, showToast, syncSelectedMenu]);

  const requestDeleteItem = useCallback((id) => {
    setDeleteTargetId(id);
    setDeleteCfmOpen(true);
  }, []);

  const confirmDeleteItem = useCallback(async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    await fakeDelay(400);

    const catId = selectedCatIdRef.current;
    setCategories((prev) => {
      const updated = prev.map((cat) => ({
        ...cat,
        package_item: cat.package_item.filter((i) => i.id !== deleteTargetId),
      }));
      syncSelectedMenu(updated, catId);
      return updated;
    });

    showToast("Item deleted");
    setDeleteCfmOpen(false);
    setDeleting(false);
    setDeleteTargetId(null);
  }, [deleteTargetId, showToast, syncSelectedMenu]);

  /* ════════════════════════════════════════════════════════
     CATEGORY SELECTOR
  ════════════════════════════════════════════════════════ */
  const selectCategory = useCallback((catId, items, name) => {
    setSelectedCatId(catId);
    setSelectedCatName(name);
    setSelectedMenu(items);
    setSearchQuery("");
  }, []);

  /* ════════════════════════════════════════════════════════
     PACKAGE BUILDER ACTIONS (localhost — in-memory)
  ════════════════════════════════════════════════════════ */
  const resetBuilderSelections = useCallback(() => {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        count_number: 0,
        package_item: c.package_item.map((i) => ({ ...i, selected: false })),
      }))
    );
  }, []);

  const openCreatePackage = useCallback(() => {
    setPkgForm(INITIAL_PKG_FORM);
    resetBuilderSelections();
    setPkgDrawerOpen(true);
  }, [resetBuilderSelections]);

  const openEditPackage = useCallback((pkg) => {
    setPkgForm({
      id:       pkg.id,
      name:     pkg.name,
      price:    pkg.price,
      type:     pkg.package_type,
      foodType: pkg.package_food_type ?? 0,
      publish:  pkg.package_status ?? 1,
    });

    let parsedItems  = [];
    let parsedCounts = [];
    try { parsedItems  = JSON.parse(pkg.package_items  || "[]"); } catch { /* */ }
    try { parsedCounts = JSON.parse(pkg.category_items || "[]"); } catch { /* */ }

    setCategories((prev) =>
      prev.map((cat, idx) => ({
        ...cat,
        count_number: parsedCounts[idx] ?? 0,
        package_item: cat.package_item.map((item) => ({
          ...item,
          selected: parsedItems.includes(item.id),
        })),
      }))
    );

    setPkgDrawerOpen(true);
  }, []);

  const closePackageBuilder = useCallback(() => {
    setPkgDrawerOpen(false);
    resetBuilderSelections();
    setPkgForm(INITIAL_PKG_FORM);
  }, [resetBuilderSelections]);

  const toggleItemInPackage = useCallback((itemId, catId) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          package_item: c.package_item.map((i) =>
            i.id === itemId ? { ...i, selected: !i.selected } : i
          ),
        };
      })
    );
  }, []);

  const changeCategoryCount = useCallback((catId, val) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        const newCount      = Math.max(0, Number(val));
        const selectedCount = c.package_item.filter((i) => i.selected).length;
        const needsDeselect = newCount < selectedCount;
        return {
          ...c,
          count_number: newCount,
          package_item: needsDeselect
            ? c.package_item.map((i) => ({ ...i, selected: false }))
            : c.package_item,
        };
      })
    );
  }, []);

  const submitPackage = useCallback(async () => {
    if (!pkgForm.name.trim() || !pkgForm.price || pkgForm.type === null) {
      showToast("Please fill all required fields", "error");
      return false;
    }

    const publishedCats  = categories.filter((c) => c.cat_publish === 1);
    const selectedItems  = publishedCats.flatMap((c) => c.package_item).filter((i) => i.selected).map((i) => i.id);
    const categoryCounts = publishedCats.map((c) => c.count_number);

    const incomplete = publishedCats.filter(
      (c) => c.count_number > 0 && c.package_item.filter((i) => i.selected).length === 0
    );
    if (incomplete.length > 0) {
      showToast("Select items for categories with quantity set", "error");
      return false;
    }

    setSaving(true);
    await fakeDelay(600);

    setPackages((prev) => {
      const payload = {
        id:               pkgForm.id || nextId(),
        name:             pkgForm.name,
        price:            Number(pkgForm.price),
        package_type:     pkgForm.type,
        package_food_type: pkgForm.foodType,
        package_status:   pkgForm.publish,
        package_items:    JSON.stringify(selectedItems),
        category_items:   JSON.stringify(categoryCounts),
      };

      if (pkgForm.id) {
        return prev.map((p) => (p.id === pkgForm.id ? payload : p));
      } else {
        return [...prev, payload];
      }
    });

    showToast(pkgForm.id ? "Package updated" : "Package created");
    closePackageBuilder();
    setSaving(false);
    return true;
  }, [pkgForm, categories, closePackageBuilder, showToast]);

  const togglePackagePublish = useCallback((id, status) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, package_status: status } : p))
    );
    showToast(status === 1 ? "Package published" : "Package unpublished");
  }, [showToast]);

  /* ── DUPLICATE PACKAGE (localhost-only) ─────────────────── */
  const duplicatePackage = useCallback(async (pkg) => {
    setSaving(true);
    await fakeDelay(400);
    const copy = {
      ...pkg,
      id:   nextId(),
      name: `Copy of ${pkg.name}`,
      package_status: 0, // start as draft
    };
    setPackages((prev) => [...prev, copy]);
    showToast(`"${pkg.name}" duplicated as draft`);
    setSaving(false);
  }, [showToast]);

  /* ── VIEW PACKAGE ───────────────────────────────────────── */
  const openViewPackage = useCallback((pkg) => {
    let parsedItems = [];
    try { parsedItems = JSON.parse(pkg.package_items || "[]"); } catch { /* */ }

    const grouped = {};
    categories.forEach((cat) => {
      const selected = cat.package_item.filter((i) => parsedItems.includes(i.id));
      if (selected.length > 0) {
        grouped[cat.item_category] = selected.map((i) => ({
          id:    i.id,
          name:  i.item_name,
          price: i.item_price,
        }));
      }
    });

    setViewPackageData({ name: pkg.name, price: pkg.price, details: grouped });
    setViewPkgOpen(true);
  }, [categories]);

  /* ════════════════════════════════════════════════════════
     BULK UPLOAD (localhost — simulated)
  ════════════════════════════════════════════════════════ */
  const submitUploadItems = useCallback(async (file) => {
    if (!file) return;
    setUploading(true);
    await fakeDelay(1200);
    showToast("Items uploaded successfully (demo)");
    setUploadItemOpen(false);
    setUploading(false);
  }, [showToast]);

  const submitUploadCategories = useCallback(async (file) => {
    if (!file) return;
    setUploading(true);
    await fakeDelay(1200);
    showToast("Categories uploaded successfully (demo)");
    setUploadCatOpen(false);
    setUploading(false);
  }, [showToast]);

  /* ════════════════════════════════════════════════════════
     RETURN
  ════════════════════════════════════════════════════════ */
  return {
    // Data
    categories, addons, packages, pathUrl,
    loading, saving, deleting, uploading,

    // Computed
    totalItemCount, publishedCategories, filteredItems, tabBadges,

    // Toast
    toast,

    // Tab & filter
    activeTab, setActiveTab,
    selectedCatId, selectedCatName, selectedMenu,
    searchQuery, setSearchQuery,
    selectCategory,

    // Modals
    catModalOpen,   setCatModalOpen,
    itemModalOpen,  setItemModalOpen,
    pkgDrawerOpen,  setPkgDrawerOpen,
    viewPkgOpen,    setViewPkgOpen,
    deleteCfmOpen,  setDeleteCfmOpen,
    uploadItemOpen, setUploadItemOpen,
    uploadCatOpen,  setUploadCatOpen,
    helpOpen,       setHelpOpen,

    // Forms
    catForm,  setCatForm,
    itemForm, setItemForm,
    pkgForm,  setPkgForm,
    imagePreview,

    // View package data
    viewPackageData,

    // Category actions
    openAddCategory, openEditCategory, submitCategory, toggleCategoryPublish,

    // Item actions
    openAddItem, openEditItem, handleImageChange, removeImage,
    submitItem, requestDeleteItem, confirmDeleteItem,

    // Package builder
    openCreatePackage, openEditPackage, closePackageBuilder,
    toggleItemInPackage, changeCategoryCount, submitPackage,
    togglePackagePublish, openViewPackage, duplicatePackage,

    // Upload
    submitUploadItems, submitUploadCategories,
  };
}
