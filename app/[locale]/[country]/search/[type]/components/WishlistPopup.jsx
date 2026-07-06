"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus } from "lucide-react";

import { save_wishlist_category } from "@/services/venues.service";
import { useUI } from "@/context/UIContext";

/* ---------------- API ---------------- */
const saveToWishlistAPI = async (payload) => {
  return await save_wishlist_category(payload);
};

export default function WishlistPopup({
  wishvenue = [],
  venue,
  open,
  user,
  onClose,
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  const { setLoginOpen } = useUI();

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [creating, setCreating] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  /* ---------------- LOGIN CHECK ---------------- */
 useEffect(() => {
  if (open && !user) {
    setLoginOpen(true);
    onClose?.();
  }
}, [open, user]);


  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (wishvenue?.length) {
      setCategories(wishvenue);
    }
  }, [wishvenue]);

  /* ---------------- RESET ON OPEN ---------------- */
  useEffect(() => {
    if (open && user) {
      setError("");
      setNewCategory("");
      setCreating(false);
    }
  }, [open , user]);

  /* ---------------- VALIDATION ---------------- */
  const validate = (name) => {
    if (!name?.trim()) {
      setError("Category name cannot be empty");
      return false;
    }

    if (name.trim().length < 3) {
      setError("Minimum 3 characters required");
      return false;
    }

    setError("");
    return true;
  };

  /* ---------------- CREATE CATEGORY ---------------- */
  const createCategory = async () => {
    if (!validate(newCategory)) return;

    try {
      setLoadingId("create");

      const payload = {
        name: newCategory.trim(),
        venue_id: venue?.childVenueId,
      };

      const res = await saveToWishlistAPI(payload);

      const created = res?.data || res;

      setCategories((prev) => [created, ...prev]);

      setNewCategory("");
      setCreating(false);
      setLoadingId(null);
    } catch (err) {
      console.error(err);
      setLoadingId(null);
    }
  };

  /* ---------------- SAVE VENUE ---------------- */
  const handleSave = async (cat) => {
    try {
      setLoadingId(cat.id);

      await saveToWishlistAPI({
        venue_id: venue?.childVenueId,
        category_id: cat.id,
      });

      setLoadingId(null);
      onClose?.();
    } catch (err) {
      console.error(err);
      setLoadingId(null);
    }
  };

  /* ---------------- CLOSE ---------------- */
  if (!open || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="w-full max-w-[450px] rounded-3xl bg-white p-5 shadow-2xl"
        >
          {/* HEADER */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Save to Collection</h2>
            <p className="text-sm text-gray-500">
              Choose a category to save this venue
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* CATEGORY GRID */}
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSave(cat)}
                className="relative h-28 overflow-hidden rounded-2xl text-left shadow-md"
              >
                <img
                  src={
                    cat.category_image
                      ? `${BASE_URL}/${cat.category_image}`
                      : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                  }
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                <div className="absolute bottom-2 left-3 text-white">
                  <p className="text-sm font-semibold">{cat.name}</p>
                </div>

                <div className="absolute top-2 right-2">
                  {loadingId === cat.id ? (
                    <div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Check size={14} className="text-white" />
                  )}
                </div>
              </motion.button>
            ))}

            {/* CREATE */}
            <motion.button
              onClick={() => setCreating(true)}
              className="flex h-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed"
            >
              <Plus />
              Create
            </motion.button>
          </div>

          {/* CREATE FORM */}
          <AnimatePresence>
            {creating && (
              <motion.div className="mt-4 space-y-2">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border p-3 rounded-xl"
                  placeholder="Category name"
                />

                <button
                  onClick={createCategory}
                  className="w-full bg-black text-white py-3 rounded-xl"
                >
                  {loadingId === "create" ? "Creating..." : "Create"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="mt-4 text-sm text-gray-500"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}