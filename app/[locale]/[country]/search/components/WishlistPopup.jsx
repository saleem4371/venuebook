"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistPopup({ venue, open, onClose }) {

  const [categories, setCategories] = useState([
    { name: "Beach Venues", image: venue?.images?.[0] },
    { name: "Wedding Halls", image: venue?.images?.[0] },
    { name: "Party Resorts", image: venue?.images?.[0] },
    { name: "My Favorites", image: venue?.images?.[0] },
    { name: "Luxury Venues", image: venue?.images?.[0] },
    { name: "Outdoor Events", image: venue?.images?.[0] },
  ]);

  const [newCategory, setNewCategory] = useState("");
  const [creating, setCreating] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (!open) return null;

  const visible = showAll ? categories : categories.slice(0, 4);
  const remaining = categories.length - 4;

  const createCategory = () => {
    if (!newCategory.trim()) return;

    const newCat = {
      name: newCategory,
      image: venue?.images?.[0] || venue?.image,
    };

    setCategories([newCat, ...categories]);
    setNewCategory("");
    setCreating(false);
  };

  return (

    <AnimatePresence>

      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-[420px] rounded-2xl p-5 shadow-xl"
        >

          <h2 className="font-semibold text-lg mb-4">
            Save to Wishlist
          </h2>

          {/* CATEGORY GRID */}

          <div className="grid grid-cols-2 gap-3">

            {visible.map((cat, i) => (

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                key={i}
                className="relative rounded-xl overflow-hidden cursor-pointer shadow-sm"
                onClick={() => {

                  if (!showAll && i === 3 && remaining > 0) {
                    setShowAll(true);
                  } else {
                    onClose();
                  }

                }}
              >

                <img
                  src={cat.image}
                  className="w-full h-24 object-cover"
                />

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <span className="absolute bottom-2 left-3 text-white text-sm font-medium">
                  {cat.name}
                </span>

                {/* +more overlay */}

                {!showAll && i === 3 && remaining > 0 && (

                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-semibold">

                    +{remaining}

                  </div>

                )}

              </motion.div>

            ))}

            {/* CREATE CATEGORY CARD */}

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCreating(true)}
              className="border-2 border-dashed rounded-xl flex items-center justify-center h-24 cursor-pointer hover:bg-gray-50"
            >

              <span className="text-sm font-medium">
                + Create
              </span>

            </motion.div>

          </div>

          {/* CREATE INPUT */}

          <AnimatePresence>

            {creating && (

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 space-y-2"
              >

                <input
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="border w-full px-3 py-2 rounded-lg"
                />

                <button
                  onClick={createCategory}
                  className="bg-black text-white w-full py-2 rounded-lg"
                >
                  Create Category
                </button>

              </motion.div>

            )}

          </AnimatePresence>

          {/* CANCEL */}

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