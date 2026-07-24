"use client";

import * as Icons from "lucide-react";
import { CheckCircle2 } from "lucide-react";

const getIcon = (iconName) => {
  return Icons[iconName] || CheckCircle2;
};

export default function CategoryAmenities({ groups, theme, label, parents }) {

  const groupedAmenities = Object.values(
    (parents?.listing ?? []).flatMap(v => v.amenities ?? []).reduce((acc, category) => {
      if (!acc[category.categoryId]) {
        acc[category.categoryId] = {
          ...category,
          amenities: []
        };
      }

      category.amenities.forEach(item => {
        if (!acc[category.categoryId].amenities.some(a => a.id === item.id)) {
          acc[category.categoryId].amenities.push(item);
        }
      });

      return acc;
    }, {})
  );

  

  // groupedAmenities is already an array of category objects here —
  // no need for Object.entries/values again below.
  if (groupedAmenities.length === 0) return null;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Amenities &amp; Facilities</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 max-w-2xl">
          Shared across all {label.toLowerCase()} within this estate — individual properties may offer a few
          extras of their own, noted on their own listing page.
        </p>
      </div>

      <div className="space-y-8">
        {groupedAmenities.map((category) => (
          <div key={category.categoryId}>
            <div className="flex items-center gap-2 mb-3.5">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
              <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                {category.category}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {(category.amenities ?? []).map((item) => {
                const Icon = getIcon(item.name);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02] hover:border-gray-200 dark:hover:border-white/[0.12] transition-colors"
                  >
                    <div className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center ${theme.bg} ${theme.text}`}>
                      <Icon size={15} strokeWidth={1.75} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}