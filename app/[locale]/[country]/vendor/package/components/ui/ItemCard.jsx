"use client";

import { Pencil, Trash2 } from "lucide-react";
import FoodBadge from "./FoodBadge";
import PriceDisplay from "./PriceDisplay";

// Unsplash fallback — food category
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&auto=format&q=80";

/**
 * ItemCard — rich item card with hover overlay, image zoom, depth.
 */
export default function ItemCard({ item, pathUrl, onEdit, onDelete }) {
  const imageSrc = item.image ? `${pathUrl}/${item.image}` : FALLBACK_IMAGE;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/[0.07] dark:bg-[#0f172a]">
      {/* Image area */}
      <div className="relative h-36 overflow-hidden bg-slate-100 dark:bg-white/[0.03]">
        <img
          src={imageSrc}
          alt={item.item_name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
        />

        {/* Gradient overlay always present — darkens bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Action overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 backdrop-blur-[2px] transition-all duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label="Edit item"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-slate-700 shadow-lg transition hover:scale-105 hover:bg-white active:scale-95"
          >
            <Pencil size={14} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label="Delete item"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-rose-600 shadow-lg transition hover:scale-105 hover:bg-white active:scale-95"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Food badge */}
        <div className="absolute left-2.5 top-2.5">
          <FoodBadge type={item.food_pre} size="xs" />
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3 className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {item.item_name}
        </h3>
        <PriceDisplay
          amount={item.item_price}
          className="mt-1 block text-sm font-bold"
          style={{
            background: "linear-gradient(242deg,#a44bf3,#499ce8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        />
      </div>
    </div>
  );
}
