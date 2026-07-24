"use client";

import { LayoutGrid, Star, Users, Tag, Sparkles } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

const ICON_MAP = {
  Listings: LayoutGrid,
  "Avg Rating": Star,
  "Max Capacity": Users,
  "Starting Price": Tag,
};

function getStatIcon(label) {
  return ICON_MAP[label] ?? Sparkles;
}

export default function EstateStats({ stats, theme, parents }) {
  const { format } = useCurrency();

  const listings = parents?.listing ?? [];
  const rating = Number(parents?.result?.[0]?.rating ?? 0);

  // Total Listings
  const totalListings = listings.length;

  // Maximum Capacity
  const maxCapacity = listings.reduce((max, item) => {
    const capacity = Number(
      item.maxGuests ??
        item.max_capacity ??
        item.maxGuests ??
        item.guests ??
        0
    );

    return Math.max(max, capacity);
  }, 0);

  // Minimum Starting Price (ignore 0)
  const startingPrice = listings.reduce((min, item) => {
    const price = Number(
      item.minPrice ??
        item.price ??
        item.amount ??
        item.min_price ??
        0
    );

    if (price <= 0) return min;

    return min === 0 ? price : Math.min(min, price);
  }, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => {
        const Icon = getStatIcon(s.label);

        let value = s.value;
        let isCurrency = s.isCurrency;
        let isDecimal = s.isDecimal;

        switch (s.label) {
          case "Listings":
            value = totalListings;
            break;

          case "Avg Rating":
            value = rating;
            isDecimal = true;
            break;

          case "Max Capacity":
            value = maxCapacity;
            break;

          case "Starting Price":
            value = startingPrice;
            isCurrency = true;
            break;

          default:
            break;
        }

        return (
          <div
            key={s.label}
            className={`flex flex-col items-center justify-center text-center py-4 px-2 rounded-2xl border ${theme.border} ${theme.bg} bg-gradient-to-br from-white/60 via-transparent to-transparent dark:from-white/[0.04]`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={`${theme.text} shrink-0`} />

              <span className="text-lg font-bold">
                {isCurrency
                  ? format(value)
                  : isDecimal
                  ? Number(value).toFixed(1)
                  : Number(value).toLocaleString()}
                {s.suffix ?? ""}
              </span>
            </div>

            <span className="text-sm text-gray-600 dark:text-gray-300">
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}