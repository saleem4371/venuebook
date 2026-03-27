"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhotoStep({ form, setForm }) {
  const [tab, setTab] = useState("thumbnail");
  const [preview, setPreview] = useState(null);
  const [newCategory, setNewCategory] = useState("");

  const categories = form.categories || [];

  // 🔥 TOTAL IMAGES
  const totalImages =
    (form.thumbnail ? 1 : 0) +
    (form.banner ? 1 : 0) +
    categories.reduce((acc, c) => acc + (c.images?.length || 0), 0);

  const isMinReached = totalImages >= 5;

  // 🔥 VALIDATION
  const isThumbnailValid = !!form.thumbnail;
  const isBannerValid = !!form.banner;

  const isCategoriesValid =
    categories.length === 0 ||
    categories.every((c) => (c.images || []).length > 0);

  const isAllValid =
    isThumbnailValid && isBannerValid && isMinReached;

  // 🔥 ADD CATEGORY
  const addCategory = () => {
    if (!newCategory.trim()) return;

    setForm({
      ...form,
      categories: [
        ...categories,
        {
          id: Date.now().toString(),
          name: newCategory,
          description: "",
          images: [],
        },
      ],
    });

    setNewCategory("");
  };

  // 🔥 STEP NAVIGATION
  const goNext = () => {
    if (tab === "thumbnail") setTab("banner");
    else if (tab === "banner") setTab("categories");
  };

  const goBack = () => {
    if (tab === "categories") setTab("banner");
    else if (tab === "banner") setTab("thumbnail");
  };

  return (
    <div className="md:flex gap-4">

      {/* 🔥 SIDEBAR (DESKTOP) */}
      <div className="hidden md:block w-64 bg-white/60 backdrop-blur rounded-2xl p-4 shadow-sm sticky top-6">

        <h2 className="font-semibold mb-4">Photo Setup</h2>

        {[
          { key: "thumbnail", label: "Thumbnail", valid: isThumbnailValid },
          { key: "banner", label: "Banner", valid: isBannerValid },
          { key: "categories", label: "Categories", valid: isCategoriesValid },
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer mb-2 transition
            ${
              tab === item.key
                ? "bg-black text-white"
                : "hover:bg-gray-100/60"
            }`}
          >
            <span>{item.label}</span>

            <span
              className={`text-xs px-2 py-1 rounded-full
              ${
                item.valid
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {item.valid ? "✓" : "!"}
            </span>
          </div>
        ))}

        {/* 🔥 PROGRESS */}
        <div className="mt-4 flex justify-between text-xs text-gray-500">
          <span>{totalImages}/5 images</span>
          <span
            className={`px-2 py-1 rounded-full
            ${
              isAllValid
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-500"
            }`}
          >
            {isAllValid ? "Complete" : "Incomplete"}
          </span>
        </div>

        {/* 🔥 PROGRESS BAR */}
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isAllValid ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              width: `${Math.min((totalImages / 5) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* 🔥 CONTENT */}
      <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 pb-24">

        {/* 🔥 MOBILE HEADER */}
        <div className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur px-4 py-3 rounded-b-2xl shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="capitalize font-medium">{tab}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs
              ${
                isAllValid
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {totalImages}/5
            </span>
          </div>

          <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
            <div
              className={`h-full ${
                isAllValid ? "bg-green-500" : "bg-red-500"
              }`}
              style={{
                width: `${Math.min((totalImages / 5) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* 🔥 MOBILE TABS */}
        <div className="flex md:hidden gap-2 overflow-x-auto">
          {["thumbnail", "banner", "categories"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs
              ${
                tab === t
                  ? "bg-black text-white"
                  : "bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 🔴 GLOBAL ERROR */}
        {!isMinReached && (
          <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
            Upload at least 5 images
          </div>
        )}

        {/* 🔥 THUMBNAIL / BANNER */}
        {(tab === "thumbnail" || tab === "banner") && (
          <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">

            <h2 className="mb-3 font-medium capitalize">
              {tab} Image *
            </h2>

            {!form[tab] ? (
              <label className="flex flex-col items-center justify-center bg-gray-50 p-8 rounded-2xl cursor-pointer">
                📸 Tap to upload {tab}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setForm({
                      ...form,
                      [tab]: { id: url, url },
                    });
                  }}
                />
              </label>
            ) : (
              <div className="relative w-full">
                <img
                  src={form[tab].url}
                  onClick={() => setPreview(form[tab].url)}
                  className="rounded-xl w-full"
                />

                <button
                  onClick={() =>
                    setForm({ ...form, [tab]: null })
                  }
                  className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* 🔥 CATEGORIES */}
        {tab === "categories" && (
          <div className="space-y-5">

            <div className="flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add category"
                className="flex-1 p-3 rounded-xl bg-gray-50"
              />
              <button
                onClick={addCategory}
                disabled={!newCategory.trim()}
                className={`px-4 rounded-xl text-white
                ${
                  newCategory.trim()
                    ? "bg-black"
                    : "bg-gray-300"
                }`}
              >
                Add
              </button>
            </div>

            {categories.map((cat) => (
              <div key={cat.id} className="bg-white/60 p-4 rounded-2xl">

                <div className="flex justify-between mb-2">
                  <input
                    value={cat.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categories: categories.map((c) =>
                          c.id === cat.id
                            ? { ...c, name: e.target.value }
                            : c
                        ),
                      })
                    }
                    className="font-medium bg-transparent outline-none"
                  />

                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        categories: categories.filter(
                          (c) => c.id !== cat.id
                        ),
                      })
                    }
                    className="text-red-500 text-xs"
                  >
                    Delete
                  </button>
                </div>

                {(!cat.images || cat.images.length === 0) && (
                  <p className="text-xs text-red-500">
                    Add at least one image
                  </p>
                )}

                <label className="block bg-gray-50 p-5 text-center rounded-xl cursor-pointer mt-2">
                  Upload Images
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setForm({
                        ...form,
                        categories: categories.map((c) =>
                          c.id === cat.id
                            ? {
                                ...c,
                                images: [
                                  ...(c.images || []),
                                  ...files.map((f) => ({
                                    id: URL.createObjectURL(f),
                                    url: URL.createObjectURL(f),
                                  })),
                                ],
                              }
                            : c
                        ),
                      });
                    }}
                  />
                </label>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  {(cat.images || []).map((img) => (
                    <div key={img.id} className="relative">
                      <img
                        src={img.url}
                        onClick={() => setPreview(img.url)}
                        className="rounded-lg h-20 w-full object-cover"
                      />
                      <button
                        className="absolute top-1 right-1 bg-black text-white text-xs px-1 rounded"
                        onClick={() =>
                          setForm({
                            ...form,
                            categories: categories.map((c) =>
                              c.id === cat.id
                                ? {
                                    ...c,
                                    images: c.images.filter(
                                      (i) => i.id !== img.id
                                    ),
                                  }
                                : c
                            ),
                          })
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🔥 PREVIEW */}
        <AnimatePresence>
          {preview && (
            <motion.div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={() => setPreview(null)}
            >
              <motion.img
                src={preview}
                className="max-h-[90%] rounded-xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🔥 MOBILE BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-3 flex gap-3">

        <button
          onClick={goBack}
          className="flex-1 py-3 rounded-xl bg-gray-100"
        >
          Back
        </button>

        <button
          onClick={goNext}
          disabled={!isAllValid}
          className={`flex-1 py-3 rounded-xl text-white
          ${
            isAllValid ? "bg-black" : "bg-gray-300"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
