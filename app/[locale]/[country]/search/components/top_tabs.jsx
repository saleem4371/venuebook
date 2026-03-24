"use client";

import { useState } from "react";

const tabs = [
  {
    id: "homes",
    label: "Homes",
    icon: "🏠",
    isNew: false,
  },
  {
    id: "experiences",
    label: "Experiences",
    icon: "🎈",
    isNew: true,
  },
  {
    id: "services",
    label: "Services",
    icon: "🛎",
    isNew: true,
  },
];

export default function TopCategoryTabs() {
  const [active, setActive] = useState("homes");

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="flex items-center justify-center gap-10 py-3 overflow-x-auto">

        {tabs.map((tab) => {
          const isActive = active === tab.id;

          return (
            <div
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="relative flex flex-col items-center cursor-pointer min-w-[80px]"
            >
              {/* ICON */}
              <div className="text-2xl">{tab.icon}</div>

              {/* LABEL */}
              <p
                className={`text-sm mt-1 ${
                  isActive
                    ? "font-semibold text-black"
                    : "text-gray-500"
                }`}
              >
                {tab.label}
              </p>

              {/* NEW BADGE */}
              {tab.isNew && (
                <span className="absolute -top-1 right-2 text-[10px] bg-gray-800 text-white px-1.5 py-[1px] rounded-full">
                  NEW
                </span>
              )}

              {/* ACTIVE UNDERLINE */}
              {isActive && (
                <div className="absolute -bottom-2 w-10 h-[2px] bg-black rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}