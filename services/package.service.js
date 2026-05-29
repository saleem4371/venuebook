/**
 * /services/package.service.js
 *
 * All API calls for the Package Management module.
 * Only used for Venues with PAX pricing model.
 *
 * Endpoints mirror the original Vue apiServer calls.
 */

import api from "@/lib/axios";

/* ─── Categories ──────────────────────────────────────────── */

/** Load all categories (menu + addons) and package listings. */
export async function loadPackageData() {
  const res = await api.get("/api/package/load", { params: { type: 10 } });
  return res.data; // { all_packages: [], addons: [], path_url: "" }
}

/** Save or update a category. */
export async function saveCategory({ id, name, types }) {
  const res = await api.post("/api/package/category/save", {
    Item_list: "",
    name,
    id,
    types,
  });
  return res.data;
}

/** Toggle category publish status. */
export async function toggleCategoryPublish({ id, status }) {
  const res = await api.post("/api/package/category/publish", { id, status });
  return res.data;
}

/* ─── Menu Items ──────────────────────────────────────────── */

/** Create or update a menu item. Sends multipart/form-data. */
export async function saveMenuItem(formData) {
  const res = await api.post("/api/package/item/save", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/** Delete a menu item by id. */
export async function deleteMenuItem({ id }) {
  const res = await api.post("/api/package/item/delete", { id });
  return res.data;
}

/** Bulk upload menu items via CSV/XLSX file. */
export async function bulkUploadItems(formData) {
  const res = await api.post("/api/package/item/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/** Bulk upload categories via CSV/XLSX file. */
export async function bulkUploadCategories(formData) {
  const res = await api.post("/api/package/category/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/* ─── Packages ────────────────────────────────────────────── */

/** Fetch all packages for the current listing. */
export async function loadPackageList() {
  const res = await api.get("/api/package/list");
  return res.data; // []
}

/** Create or update a package preset. */
export async function savePackage({
  id,
  package_name,
  selected_items,
  category_count,
  package_amount,
  package_type,
  package_food_type,
  package_publish,
}) {
  const res = await api.post("/api/package/save", {
    id,
    package_name,
    selected_items,
    category_count,
    package_amount,
    package_type,
    package_food_type,
    package_publish,
  });
  return res.data;
}

/** Toggle package publish status. */
export async function togglePackagePublish({ id, status }) {
  const res = await api.post("/api/package/publish", { id, status });
  return res.data;
}

/* ─── Template Downloads ──────────────────────────────────── */

export const ITEM_TEMPLATE_URL =
  `${process.env.NEXT_PUBLIC_API_URL}/Excel/item.csv`;

export const CATEGORY_TEMPLATE_URL =
  `${process.env.NEXT_PUBLIC_API_URL}/Excel/category.csv`;
