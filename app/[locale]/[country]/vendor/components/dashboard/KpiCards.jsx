"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Star } from "lucide-react";

/* ─── Sparkline ────────────────────────────────────────────────────────────── */
function Sparkline({ data, color }) {
  if (!data?.length || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const W = 56, H = 22;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = data[data.length - 1];
  const ly = H - ((last - min) / range) * (H - 4) - 2;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible flex-shrink-0">
      <polyline points={pts} fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <circle cx={W} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}

/* ─── Occupancy ring ───────────────────────────────────────────────────────── */
function Ring({ pct, size = 56, stroke = 5, color = "#a44bf3" }) {
  const r   = (size - stroke * 2) / 2;
  const cir = 2 * Math.PI * r;
  const dash = (pct / 100) * cir;
  return (
    <div className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="currentColor" strokeWidth={stroke}
          className="text-gray-100 dark:text-white/[0.06]" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash.toFixed(2)} ${cir.toFixed(2)}`}
          strokeLinecap="round" />
      </svg>
      <span className="text-[11px] font-black text-gray-900 dark:text-white z-10 relative">
        {pct}%
      </span>
    </div>
  );
}

/* ─── Health label ─────────────────────────────────────────────────────────── */
function healthLabel(score) {
  if (score >= 90) return { text: "Excellent",       cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" };
  if (score >= 70) return { text: "Good",            cls: "text-blue-500    dark:text-blue-400    bg-blue-50    dark:bg-blue-950/40"    };
  return            { text: "Needs Attention", cls: "text-amber-500   dark:text-amber-400   bg-amber-50   dark:bg-amber-950/40"   };
}

/* ─── Shared panel class ───────────────────────────────────────────────────── */
const PANEL = [
  "relative overflow-hidden rounded-xl",
  "bg-white dark:bg-[#0f172a]",
  "border border-gray-200/80 dark:border-white/[0.06]",
  "shadow-sm dark:shadow-black/20",
  "p-3.5 sm:p-4 flex flex-col",
].join(" ");

/* ─── Main component ───────────────────────────────────────────────────────── */
export default function KpiCards() {
  const healthScore = 92;
  const hl          = healthLabel(healthScore);
  const occupancy   = 78;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

      {/* 1 · Revenue */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className={PANEL}>
        <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl bg-violet-500" />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
          Revenue · This Month
        </p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-[18px] sm:text-[20px] font-black text-gray-900 dark:text-white tracking-tight leading-none min-w-0 truncate">
            ₹1,20,000
          </p>
          <Sparkline data={[40,55,48,72,65,80,95,88,110,102,120]} color="#7c3aed" />
        </div>
        <div className="mt-auto pt-2.5 h-[18px] flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight size={12} /> +12%
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-0.5">vs last month</span>
        </div>
      </motion.div>

      {/* 2 · Bookings */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={PANEL}>
        <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl bg-emerald-500" />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
          Bookings · Confirmed
        </p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-[18px] sm:text-[20px] font-black text-gray-900 dark:text-white tracking-tight leading-none">
            320
          </p>
          <Sparkline data={[200,215,230,240,255,265,275,285,295,308,320]} color="#10b981" />
        </div>
        <div className="mt-auto pt-2.5 h-[18px] flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight size={12} /> +5%
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-0.5">vs last month</span>
        </div>
      </motion.div>

      {/* 3 · Enquiries */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={PANEL}>
        <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl bg-sky-500" />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
          Enquiries · Active
        </p>
        <p className="text-[18px] sm:text-[20px] font-black text-gray-900 dark:text-white tracking-tight leading-none">
          48
        </p>
        <div className="mt-auto pt-2.5 h-[18px] flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full">
            +6 today
          </span>
        </div>
      </motion.div>

      {/* 4 · Venue Health */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={PANEL}>
        <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl bg-amber-400" />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
          Venue Health
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[20px] font-black text-gray-900 dark:text-white leading-none">
            {healthScore}
            <span className="text-[12px] text-gray-400 dark:text-gray-500 font-semibold">/100</span>
          </p>
          <Star size={18} className="text-amber-400 flex-shrink-0" fill="currentColor" />
        </div>
        <div className="mt-auto pt-2.5 h-[18px] flex items-center">
          <span className={`self-start text-[10.5px] font-bold px-2 py-0.5 rounded-full ${hl.cls}`}>
            {hl.text}
          </span>
        </div>
      </motion.div>

      {/* 5 · Occupancy */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className={`${PANEL} col-span-2 sm:col-span-1`}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl"
          style={{ background: "linear-gradient(90deg,#a44bf3,#499ce8)" }} />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
          Occupancy · This Month
        </p>
        <div className="flex items-center gap-3">
          <Ring pct={occupancy} color="#a44bf3" size={52} stroke={5} />
          <div>
            <p className="text-[13px] font-bold text-gray-800 dark:text-white">{occupancy}% filled</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Target: 85%</p>
          </div>
        </div>
        <div className="mt-auto pt-2.5 h-[18px]" />
      </motion.div>

    </div>
  );
}
