"use client";

import { motion } from "framer-motion";

const categories = [
  { id:1, name: "Banquet", icon: "https://apitest.venuebook.in/assets/Category_icons/banquet-hall.png" },
  { id:2, name: "Conference", icon: "https://apitest.venuebook.in/assets/Category_icons/conference.png" },
  { id:3, name: "Resorts", icon: "https://apitest.venuebook.in/assets/Category_icons/resort.png" },
  { id:4, name: "Hotels", icon: "https://apitest.venuebook.in/assets/Category_icons/hotel.png" },
  { id:5, name: "Community", icon: "https://apitest.venuebook.in/assets/Category_icons/community.png" },
  { id:6, name: "Convention", icon: "https://apitest.venuebook.in/assets/Category_icons/convention.png" },
  { id:7, name: "Auditoriums", icon: "https://apitest.venuebook.in/assets/Category_icons/auditorium.png" },
  { id:8, name: "Outdoor", icon: "https://apitest.venuebook.in/assets/Category_icons/Outdoor.png" },
];

export default function CategoryBar({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="w-full bg-gray-100 border-b border-gray-200 mb-2">
      <div className="flex items-center gap-4 px-3 py-2 overflow-x-auto no-scrollbar">

        {categories.map((cat) => {
          const active = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() =>
                setSelectedCategory(active ? null : cat.id) // toggle
              }
              className={`flex flex-col items-center flex-shrink-0 w-[65px] cursor-pointer
                ${active ? "opacity-100" : "opacity-70"}
              `}
            >
              <motion.img
                src={cat.icon}
                alt={cat.name}
                className={`w-7 h-7 object-contain ${
                  active ? "scale-110" : ""
                }`}
                whileHover={{ scale: 1.1 }}
              />

              <span className="text-[11px] mt-1 text-center leading-tight">
                {cat.name}
              </span>

              {/* Active Indicator */}
              {active && (
                <div className="w-5 h-[2px] bg-purple-600 mt-1 rounded-full" />
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}