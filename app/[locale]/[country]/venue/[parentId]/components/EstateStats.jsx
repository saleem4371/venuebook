"use client";

import { LayoutGrid, Star, Users, Tag, Sparkles } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

const ICON_MAP = {
  "Listings": LayoutGrid,
  "Avg Rating": Star,
  "Max Capacity": Users,
  "Starting Price": Tag,
};

function getStatIcon(label) {
  return ICON_MAP[label] ?? Sparkles;
}

/**
 * Same 2-row layout as before (icon+number, then label) so card height
 * is unchanged — the icon sits inline beside the number instead of
 * stacked above it. `theme` (the active category's palette) tints the
 * icon, border, and a soft gradient sheen so the strip feels tied to
 * whichever category is selected rather than generically gray.
 */
export default function EstateStats({ stats, theme }) {
  const { format } = useCurrency();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => {
        const Icon = getStatIcon(s.label);
        return (
          <div
            key={s.label}
            className={`flex flex-col items-center justify-center text-center py-4 px-2 rounded-2xl border ${theme.border} ${theme.bg} bg-gradient-to-br from-white/60 via-transparent to-transparent dark:from-white/[0.04]`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Icon size={14} className={`${theme.text} shrink-0`} />
              <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tabular-nums tracking-tight">
                {s.isCurrency
                  ? format(s.value)
                  : `${s.isDecimal ? s.value.toFixed(1) : s.value.toLocaleString()}${s.suffix ?? ""}`}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-1 leading-tight uppercase tracking-wide">
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
