"use client";

export default function EstateStats({ stats }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-3 sm:gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center justify-center text-center py-4 px-2 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07]"
        >
          <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tabular-nums">
            {s.isDecimal ? s.value.toFixed(1) : s.value.toLocaleString()}
            {s.suffix ?? ""}
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1 leading-tight">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
