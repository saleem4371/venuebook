"use client";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const ACCENT = {
  Revenue:          "#7c3aed",
  Users:            "#0ea5e9",
  Bookings:         "#10b981",
  Recognised:       "#f59e0b",
  Advance:          "#f43f5e",
  "Total Views":    "#6366f1",
  "Enquiry Clicks": "#14b8a6",
  "Venues Listed":  "#d946ef",
};
const DEF = "#6b7280";

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const max   = Math.max(...data);
  const min   = Math.min(...data);
  const range = max - min || 1;
  const W = 56, H = 22;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = data[data.length - 1];
  const ly   = H - ((last - min) / range) * (H - 4) - 2;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible flex-shrink-0">
      <polyline
        points={pts} fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        opacity="0.65"
      />
      <circle cx={W} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}

export default function Card({ title, value, trend, trendValue, sparkline }) {
  const primary = ACCENT[title] ?? DEF;

  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] p-3 sm:p-4 shadow-sm dark:shadow-black/20">
      {/* Top accent bar */}
      <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl" style={{ background: primary }} />

      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2 sm:mb-2.5">
        {title}
      </p>

      <div className="flex items-end justify-between gap-2">
        <p className="text-[18px] sm:text-[22px] font-black text-gray-900 dark:text-white tracking-tight leading-none min-w-0 truncate">
          {value}
        </p>
        {sparkline && <Sparkline data={sparkline} color={primary} />}
      </div>

      <div className="mt-2.5 h-[18px]">
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold ${
            trend === "up"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400"
          }`}>
            {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}
            <span className="text-gray-400 dark:text-gray-500 font-normal ml-0.5">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}
