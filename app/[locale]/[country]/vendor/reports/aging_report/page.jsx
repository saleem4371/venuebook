"use client";
/**
 * PLACEMENT: vendor/reports/aging_report/page.jsx
 *
 * All data (bucket values + invoice rows) comes from cat.data.aging,
 * so switching category changes every number, label, and row — not just accent color.
 *
 * No hero banner.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence }       from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  AlertCircle, AlertTriangle, Clock,
  Search, ChevronDown, ChevronUp,
} from "lucide-react";

import { useVendorCategory } from "@/context/VendorCategoryContext";
import { getReportConfig }   from "../components/reportsConfig";

/* ─── Static styling config for the four aging buckets ───────────────────────
   Values (bucketValues[i]) come from the per-category config.
   Only the visual chrome lives here.                                         */
const BUCKET_META = [
  {
    key: "overdue", label: "Overdue",    sub: "Past due date",
    icon: AlertCircle,
    color: "#1D9E75",
    bg:     "bg-emerald-50 dark:bg-emerald-950/30",
    text:   "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/50",
  },
  {
    key: "d11_20", label: "11–20 Days", sub: "Early overdue",
    icon: Clock,
    color: "#378ADD",
    bg:     "bg-blue-50 dark:bg-blue-950/30",
    text:   "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800/50",
  },
  {
    key: "d21_30", label: "21–30 Days", sub: "Approaching critical",
    icon: AlertTriangle,
    color: "#BA7517",
    bg:     "bg-amber-50 dark:bg-amber-950/30",
    text:   "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  {
    key: "d30plus", label: "30+ Days",  sub: "Critical — action needed",
    icon: AlertCircle,
    color: "#D85A30",
    bg:     "bg-red-50 dark:bg-red-950/30",
    text:   "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800/50",
  },
];

const fmt = n => "₹" + Math.round(n).toLocaleString("en-IN");

/* ─── Primitives ──────────────────────────────────────────────────────────── */
function RiskBadge({ overdue, d30 }) {
  if (d30 > 0)
    return (
      <span className="text-[10px] font-black px-2 py-1 rounded-full
        bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
        30+ Days
      </span>
    );
  if (overdue > 0)
    return (
      <span className="text-[10px] font-black px-2 py-1 rounded-full
        bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
        Overdue
      </span>
    );
  return (
    <span className="text-[10px] font-black px-2 py-1 rounded-full
      bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
      Current
    </span>
  );
}

function ChartTooltip({ active, payload, label, primary }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#111827]
      border border-gray-200 dark:border-white/[0.10]
      rounded-xl px-3 py-2 shadow-2xl text-xs">
      <p className="text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="font-bold" style={{ color: primary }}>
        {fmt(payload[0].value)}
      </p>
    </div>
  );
}

const DESK_COLS = "grid-cols-[88px_1fr_130px_130px_130px_100px]";

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function AgingReport() {
  const { activeCategory } = useVendorCategory();

  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);
  const [sortBy,   setSortBy]   = useState("total");
  const [sortDir,  setSortDir]  = useState("desc");

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, [activeCategory]);

  const cat = getReportConfig(activeCategory);

  /* Merge static bucket styling with per-category values */
  const BUCKETS = BUCKET_META.map((meta, i) => ({
    ...meta,
    value: cat.data.aging.bucketValues[i],
  }));

  /* Per-category invoice rows */
  const ROWS = cat.data.aging.rows;

  /* Summary totals — derived from the rows */
  const totalOut  = ROWS.reduce((a, r) => a + r.outstanding, 0);
  const totalOver = ROWS.reduce((a, r) => a + r.overdue, 0);
  const total30   = ROWS.reduce((a, r) => a + r.d30, 0);

  const chartData = BUCKETS.map(b => ({
    name: b.label, value: b.value, color: b.color,
  }));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...ROWS]
      .filter(r =>
        r.customer.toLowerCase().includes(q) ||
        r.id.toString().includes(q)
      )
      .sort((a, b) =>
        sortDir === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
      );
  }, [ROWS, search, sortBy, sortDir]);

  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }) => sortBy === col
    ? (sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />)
    : <ChevronDown size={10} className="opacity-20" />;

  return (
    <div>
      <div className="w-full pb-6 space-y-4">

        {/* ── Summary chips ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Total Outstanding", value: fmt(totalOut),  color: cat.primary },
            { label: "Overdue",           value: fmt(totalOver), color: "#BA7517"   },
            { label: "30+ Days Critical", value: fmt(total30),   color: "#D85A30"   },
          ].map((s, i) => (
            <motion.div
              key={`${activeCategory}-${s.label}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-xl
                bg-white dark:bg-[#0f172a]
                border border-gray-200/80 dark:border-white/[0.06]
                p-4 shadow-sm dark:shadow-black/20"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl"
                style={{ background: s.color }} />
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">
                {s.label}
              </p>
              <p className="text-xl sm:text-2xl font-black tracking-tight"
                style={{ color: s.color }}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Buckets + Distribution ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* Aging buckets list */}
          <div className="md:col-span-1 lg:col-span-2 rounded-xl
            bg-white dark:bg-[#0f172a]
            border border-gray-200/80 dark:border-white/[0.06]
            p-4 sm:p-5 shadow-sm dark:shadow-black/20">
            <h3 className="text-[13px] font-bold text-gray-800 dark:text-white mb-3">
              Aging buckets
            </h3>
            <div className="space-y-2">
              {BUCKETS.map((b, i) => {
                const Icon   = b.icon;
                const maxVal = Math.max(...BUCKETS.map(x => x.value));
                const pct    = Math.round((b.value / maxVal) * 100);
                return (
                  <motion.div
                    key={`${activeCategory}-${b.key}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x:  0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`rounded-xl border p-3 ${b.bg} ${b.border}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon size={13} className={b.text} />
                        <div>
                          <p className={`text-[12px] font-bold ${b.text}`}>{b.label}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            {b.sub}
                          </p>
                        </div>
                      </div>
                      <p className={`text-[13px] font-black ${b.text}`}>{fmt(b.value)}</p>
                    </div>
                    <div className="h-1 rounded-full
                      bg-black/[0.05] dark:bg-white/[0.06] overflow-hidden">
                      <motion.div
                        key={`${activeCategory}-bar-${b.key}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: b.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Distribution bar chart */}
          <div className="md:col-span-1 lg:col-span-3 rounded-xl
            bg-white dark:bg-[#0f172a]
            border border-gray-200/80 dark:border-white/[0.06]
            p-4 sm:p-5 shadow-sm dark:shadow-black/20">
            <h3 className="text-[13px] font-bold text-gray-800 dark:text-white mb-0.5">
              Distribution
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4">
              Outstanding by age bucket
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(128,128,128,0.07)"
                  vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "rgba(128,128,128,0.55)" }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "rgba(128,128,128,0.55)" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 1e5).toFixed(0)}L`} />
                <Tooltip
                  content={<ChartTooltip primary={cat.primary} />}
                  cursor={{ fill: "rgba(128,128,128,0.04)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={68}>
                  {chartData.map((e, i) => (
                    <Cell key={i} fill={e.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Invoice aging table ────────────────────────────────────────── */}
        <div className="rounded-xl
          bg-white dark:bg-[#0f172a]
          border border-gray-200/80 dark:border-white/[0.06]
          shadow-sm dark:shadow-black/20 overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between
            gap-3 px-4 sm:px-5 py-3.5
            border-b border-gray-100 dark:border-white/[0.05]">
            <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">
              Invoice aging detail
            </h3>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg
              bg-gray-50 dark:bg-white/[0.04]
              border border-gray-200 dark:border-white/[0.06]
              w-full sm:w-auto">
              <Search size={13} className="text-gray-400 flex-shrink-0" />
              <input
                placeholder="Search customer or ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-[13px] w-full sm:w-44
                  text-gray-800 dark:text-white
                  placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* ── Desktop table (md+) ── */}
          <div className="hidden md:block">
            <div className={`grid ${DESK_COLS} px-5 py-2.5 gap-4
              text-[10px] font-black tracking-[0.08em] uppercase
              text-gray-400 dark:text-gray-500
              bg-gray-50/80 dark:bg-white/[0.02]
              border-b border-gray-100 dark:border-white/[0.04]`}>
              <span>BR No</span>
              <span>Customer</span>
              {["total", "outstanding", "overdue"].map(col => (
                <button key={col}
                  onClick={() => handleSort(col)}
                  className="flex items-center gap-1 text-left capitalize
                    hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {col} <SortIcon col={col} />
                </button>
              ))}
              <span>Risk</span>
            </div>

            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}
                    className={`grid ${DESK_COLS} px-5 py-4
                      border-b border-gray-100 dark:border-white/[0.04]
                      gap-4 animate-pulse`}>
                    {[30, 52, 40, 40, 40, 28].map((w, j) => (
                      <div key={j}
                        className="h-3 rounded-full bg-gray-200 dark:bg-gray-800/80"
                        style={{ width: `${w}%` }} />
                    ))}
                  </div>
                ))
              : filtered.map((row, i) => (
                  <motion.div
                    key={`${activeCategory}-${row.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`grid ${DESK_COLS} px-5 py-3.5 gap-4
                      border-b border-gray-100 dark:border-white/[0.04] last:border-none
                      items-center
                      hover:bg-gray-50/60 dark:hover:bg-white/[0.02]
                      transition-colors`}
                  >
                    <span className="text-[13px] font-black"
                      style={{ color: cat.primary }}>
                      #{row.id}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium
                        text-gray-800 dark:text-gray-100">
                        {row.customer}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {row.age}
                      </p>
                    </div>
                    <span className="text-[13px] font-bold text-gray-800 dark:text-white">
                      {fmt(row.total)}
                    </span>
                    <span className="text-[13px] text-gray-600 dark:text-gray-300">
                      {fmt(row.outstanding)}
                    </span>
                    <span className={`text-[13px] font-semibold
                      ${row.overdue > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-gray-300 dark:text-gray-600"}`}>
                      {row.overdue > 0 ? fmt(row.overdue) : "—"}
                    </span>
                    <RiskBadge overdue={row.overdue} d30={row.d30} />
                  </motion.div>
                ))}
          </div>

          {/* ── Mobile cards (< md) ── */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
            {filtered.map(row => (
              <div key={`${activeCategory}-m-${row.id}`} className="px-4 py-3.5">
                <button
                  className="w-full flex items-start justify-between gap-3 text-left"
                  onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                >
                  <div>
                    <p className="text-[11px] font-black mb-0.5"
                      style={{ color: cat.primary }}>
                      #{row.id}
                    </p>
                    <p className="text-[13px] font-semibold
                      text-gray-800 dark:text-white">
                      {row.customer}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {row.age}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <RiskBadge overdue={row.overdue} d30={row.d30} />
                    <span className="text-[13px] font-black
                      text-gray-800 dark:text-white">
                      {fmt(row.total)}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {expanded === row.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{   opacity: 0, height: 0 }}
                      className="mt-3 pt-3
                        border-t border-gray-100 dark:border-white/[0.06]
                        grid grid-cols-3 gap-2"
                    >
                      {[
                        { label: "Outstanding", value: fmt(row.outstanding), color: "text-gray-800 dark:text-white" },
                        { label: "Overdue",     value: row.overdue > 0 ? fmt(row.overdue) : "—", color: "text-amber-600 dark:text-amber-400" },
                        { label: "30+ Days",    value: row.d30 > 0    ? fmt(row.d30)    : "—", color: "text-red-600 dark:text-red-400" },
                      ].map(({ label, value, color }) => (
                        <div key={label}
                          className="bg-gray-50 dark:bg-white/[0.04] rounded-lg p-2.5">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                            {label}
                          </p>
                          <p className={`text-[13px] font-black ${color}`}>{value}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
