"use client";

import { useState } from "react";
import ImageSlider from "../listing/ImageSlider";

export default function PhotoTour() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sliderIndex, setSliderIndex] = useState(null);

  const data = {
    kitchen: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f",
      "https://images.unsplash.com/photo-1556911073-52527ac437f5",
    ],
    bedroom: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    ],
    bathroom: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a",
    ],
    exterior: [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
    ],
  };

  const categories = [
    { key: "kitchen", label: "Full kitchen", cover: data.kitchen[0] },
    { key: "bedroom", label: "Bedroom", cover: data.bedroom[0] },
    { key: "bathroom", label: "Bathroom", cover: data.bathroom[0] },
    { key: "exterior", label: "Exterior", cover: data.exterior[0] },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">

      {/* 🔹 HEADER (Sticky on mobile) */}
      <div className="sticky top-0 bg-white z-30 pb-3">
        <h1 className="text-lg sm:text-2xl font-semibold">
          Photo tour
        </h1>
      </div>

      {/* 🔹 CATEGORY SCROLL */}
      <div className="flex gap-3 overflow-x-auto py-3 no-scrollbar">
        {categories.map((cat) => (
          <div
            key={cat.key}
            onClick={() => {
              setSelectedCategory(cat.key);
              setSliderIndex(null);
            }}
            className={`min-w-[120px] cursor-pointer ${
              selectedCategory === cat.key ? "opacity-100" : "opacity-70"
            }`}
          >
            <img
              src={cat.cover}
              className="w-full h-20 sm:h-24 object-cover rounded-xl"
            />
            <p className="text-xs sm:text-sm mt-1">{cat.label}</p>
          </div>
        ))}
      </div>

      {/* 🔹 GRID */}
      {selectedCategory && (
        <div className="mt-4">
          <h2 className="text-base sm:text-xl font-semibold mb-3 capitalize">
            {selectedCategory}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
            {data[selectedCategory].map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setSliderIndex(i)}
                className="w-full h-40 sm:h-56 object-cover rounded-xl cursor-pointer active:scale-95 transition"
              />
            ))}
          </div>
        </div>
      )}

      {/* 🔹 FULLSCREEN SLIDER */}
      {sliderIndex !== null && (
        <ImageSlider
          images={data[selectedCategory]}
          index={sliderIndex}
          setIndex={setSliderIndex}
          onClose={() => setSliderIndex(null)}
        />
      )}
    </div>
  );
}
