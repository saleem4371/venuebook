"use client";
/**
 * PLACEMENT: vendor/reports/revenue_report/page.jsx
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence }       from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Search,
  ChevronDown, ChevronUp,
} from "lucide-react";

import { useVendorCategory }              from "@/context/VendorCategoryContext";
import { getReportConfig, STATUS_CONFIG } from "../components/reportsConfig";

import { reports } from '@/services/report.service'

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

/* ─── Sparkline ───────────────────────────────────────────────────────────── */
function Sparkline({ data, color }) {
  const max   = Math.max(...data);
  const min   = Math.min(...data);
  const range = max - min || 1;
  const W = 64, H = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
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

/* ─── KPI card ────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, growth, up, sparkline, primary, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: index * 0.06, duration: 0.32 }}
      className="relative overflow-hidden rounded-xl
        bg-white dark:bg-[#0f172a]
        border border-gray-200/80 dark:border-white/[0.06]
        p-3 sm:p-4 shadow-sm dark:shadow-black/20"
    >
      {/* Category-colour top accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl"
        style={{ background: primary }} />

      <p className="text-[10.5px] font-semibold uppercase tracking-wide
        text-gray-400 dark:text-gray-500 mb-2 sm:mb-2.5">
        {label}
      </p>

      <div className="flex items-end justify-between gap-2">
        <p className="text-[18px] sm:text-[22px] font-black text-gray-900 dark:text-white
          tracking-tight leading-none min-w-0 truncate">
          {value}
        </p>
        <Sparkline data={sparkline} color={primary} />
      </div>

      <div className={`flex items-center gap-1 mt-2.5 text-[11px] font-semibold
        ${up
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-500   dark:text-red-400"}`}>
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(growth)}%
        <span className="text-gray-400 dark:text-gray-500 font-normal ml-0.5">
          vs last period
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Chart tooltip ───────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, primary }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#111827]
      border border-gray-200 dark:border-white/[0.10]
      rounded-xl px-3 py-2 shadow-2xl text-xs">
      <p className="text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="font-bold text-sm" style={{ color: primary }}>
        ₹{payload[0].value}L
      </p>
    </div>
  );
}

/* ─── Status pill ─────────────────────────────────────────────────────────── */
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold
      px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
}

/* ─── Table skeleton ──────────────────────────────────────────────────────── */
const DESK_COLS = "grid-cols-[88px_1fr_116px_116px_1fr_104px]";

function TableSkeleton() {
  return Array.from({ length: 4 }).map((_, i) => (
    <div key={i}
      className={`grid ${DESK_COLS} px-5 py-4
        border-b border-gray-100 dark:border-white/[0.04]
        gap-4 animate-pulse`}>
      {[30, 55, 38, 38, 52, 28].map((w, j) => (
        <div key={j}
          className="h-3 rounded-full bg-gray-200 dark:bg-gray-800/80"
          style={{ width: `${w}%` }} />
      ))}
    </div>
  ));
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function RevenueReport() {
  const { activeCategory } = useVendorCategory();

  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);
  const [sortBy,   setSortBy]   = useState(null);
  const [sortDir,  setSortDir]  = useState("desc");

    const [areport,  setaReport]  = useState([]);
  
   
  
   const load = async () => {
    try {
      setLoading(true);
  
      const res = await reports();
  
      setaReport(res.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, [activeCategory]);

  const cat = getReportConfig(activeCategory);

const kpiDefs = cat.kpiDefs;

const data = areport?.venues ?? cat.data;

  const chartData = data.chart.map((v, i) => ({
    month: MONTHS[i], value: v,
  }));

  const filtered = useMemo(() => {
    let rows = data.bookings.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toString().includes(search)
    );
    if (sortBy) {
      rows = [...rows].sort((a, b) =>
        sortDir === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
      );
    }
    return rows;
  }, [data, search, sortBy, sortDir]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }) => sortBy === col
    ? (sortDir === "asc"
        ? <ChevronUp   size={10} />
        : <ChevronDown size={10} />)
    : <ChevronDown size={10} className="opacity-20" />;

  return (
    <div>
      <div className="w-full pb-6 space-y-4">

        {/* ── KPI cards ─────────────────────────────────────────────────── */}
        {/*
          2 cols on xs/sm, 4 on md+.
          No more silent gap at tablet — fills cleanly at all widths.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {kpiDefs.map((kpi, i) => (
            <KpiCard
              key={kpi.key}
              label={kpi.label}
              value={data.kpis[i]?.value ?? "—"}
              growth={data.kpis[i]?.growth ?? 0}
              up={data.kpis[i]?.up ?? true}
              sparkline={data.kpis[i]?.sparkline ?? []}
              primary={cat.primary}
              index={i}
            />
          ))}
        </div>

        {/* ── Chart + Breakdown ─────────────────────────────────────────── */}
        {/*
          1 col on xs, 3 cols (2+1) on md+.
          Tablet now shows the chart & breakdown side-by-side.
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Area chart — 2/3 width on md+ */}
          <div className="md:col-span-2 rounded-xl
            bg-white dark:bg-[#0f172a]
            border border-gray-200/80 dark:border-white/[0.06]
            p-4 sm:p-5 shadow-sm dark:shadow-black/20">

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">
                  Revenue trend
                </h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  Monthly in ₹L · 2026
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span className="w-5 h-[2px] rounded-full inline-block"
                  style={{ background: cat.primary }} />
                Revenue
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <AreaChart
                data={chartData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient
                    id={`ag-${activeCategory}`}
                    x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={cat.primary} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={cat.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(128,128,128,0.07)"
                  vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "rgba(128,128,128,0.55)" }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "rgba(128,128,128,0.55)" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}L`} />
                <Tooltip
                  content={<ChartTooltip primary={cat.primary} />}
                  cursor={{
                    stroke: cat.primary,
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }} />
                <Area
                  type="monotone" dataKey="value"
                  stroke={cat.primary} strokeWidth={2.5}
                  fill={`url(#ag-${activeCategory})`}
                  dot={false}
                  activeDot={{ r: 5, fill: cat.primary, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown — 1/3 width on md+ */}
          <div className="rounded-xl
            bg-white dark:bg-[#0f172a]
            border border-gray-200/80 dark:border-white/[0.06]
            p-4 sm:p-5 shadow-sm dark:shadow-black/20 space-y-4">
            <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">
              Breakdown
            </h3>
            {data.breakdown.map(({ label, value, pct }) => (
              <div key={label}>
                <div className="flex justify-between items-baseline text-[11.5px] mb-1.5">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-bold text-gray-800 dark:text-white">{value}</span>
                </div>
                <div className="h-1.5 rounded-full
                  bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                  <motion.div
                    key={`${activeCategory}-${label}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: cat.primary }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bookings table ────────────────────────────────────────────── */}
        <div className="rounded-xl
          bg-white dark:bg-[#0f172a]
          border border-gray-200/80 dark:border-white/[0.06]
          shadow-sm dark:shadow-black/20 overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between
            gap-3 px-4 sm:px-5 py-3.5
            border-b border-gray-100 dark:border-white/[0.05]">
            <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">
              Recent bookings
            </h3>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg
              bg-gray-50 dark:bg-white/[0.04]
              border border-gray-200 dark:border-white/[0.06]
              w-full sm:w-auto">
              <Search size={13} className="text-gray-400 flex-shrink-0" />
              <input
                placeholder="Search name or ID…"
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
              <span>Ref</span>
              <span>Name</span>
              <button onClick={() => handleSort("amount")}
                className="flex items-center gap-1 text-left
                  hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                Amount <SortIcon col="amount" />
              </button>
              <span>Date</span>
              <span>Venue / Item</span>
              <span>Status</span>
            </div>

            {loading
              ? <TableSkeleton />
              : filtered.map((row, i) => (
                  <div key={row.id}>
                    {/* ── Main row ── */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                      className={`grid ${DESK_COLS} px-5 py-3.5 gap-4
                        border-b border-gray-100 dark:border-white/[0.04]
                        items-center cursor-pointer select-none
                        hover:bg-gray-50/60 dark:hover:bg-white/[0.02]
                        transition-colors`}
                    >
                      <span className="text-[13px] font-black"
                        style={{ color: cat.primary }}>
                        #{row.id}
                      </span>
                      <span className="text-[13px] font-medium
                        text-gray-800 dark:text-gray-100 truncate">
                        {row.name}
                      </span>
                      <span className="text-[13px] font-bold
                        text-gray-800 dark:text-white">
                        ₹{row.amount.toLocaleString()}
                      </span>
                      <span className="text-[12px] text-gray-400 dark:text-gray-500">
                        {row.date}
                      </span>
                      <span className="text-[13px] text-gray-600 dark:text-gray-300 truncate">
                        {row.detail}
                      </span>
                      {/* Status + expand chevron */}
                      <div className="flex items-center justify-between gap-1.5">
                        <StatusPill status={row.status} />
                        <ChevronDown
                          size={11}
                          className={`flex-shrink-0 text-gray-300 dark:text-gray-600
                            transition-transform duration-200
                            ${expanded === row.id ? "rotate-180" : ""}`}
                        />
                      </div>
                    </motion.div>

                    {/* ── Expanded breakdown panel ── */}
                    <AnimatePresence>
                      {expanded === row.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="relative px-5 py-4
                            bg-slate-50/70 dark:bg-white/[0.015]
                            border-b border-gray-100 dark:border-white/[0.04]">

                            {/* Left gradient accent bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm"
                              style={{ background: cat.gradient }} />

                            <div className="flex items-start justify-between gap-6 pl-3 flex-wrap">

                              {/* Breakdown line items */}
                              <div className="flex items-start gap-6 flex-wrap">
                                {(row.breakdown ?? []).map(item => (
                                  <div key={item.label}>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest
                                      text-gray-400 dark:text-gray-500 mb-1">
                                      {item.label}
                                    </p>
                                    <p className={`text-[13px] font-bold ${
                                      item.negative && item.value > 0
                                        ? "text-red-500 dark:text-red-400"
                                        : item.negative
                                          ? "text-gray-300 dark:text-gray-700"
                                          : "text-gray-800 dark:text-white"
                                    }`}>
                                      {item.negative
                                        ? (item.value > 0
                                            ? `−₹${item.value.toLocaleString()}`
                                            : "—")
                                        : `₹${item.value.toLocaleString()}`}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* Payment meta — right aligned */}
                              {row.paidOn && (
                                <div className="text-right shrink-0 ml-auto">
                                  <p className="text-[10px] font-semibold uppercase tracking-widest
                                    text-gray-400 dark:text-gray-500 mb-1">
                                    Paid on
                                  </p>
                                  <p className="text-[12px] font-semibold
                                    text-gray-700 dark:text-gray-300">
                                    {row.paidOn}
                                  </p>
                                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                    {row.paymentMode}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
          </div>

          {/* ── Mobile cards (< md) ── */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 space-y-2.5 animate-pulse">
                    <div className="h-3 w-1/3 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3 w-1/2 rounded-full bg-gray-100 dark:bg-gray-800/60" />
                    <div className="h-3 w-2/3 rounded-full bg-gray-100 dark:bg-gray-800/40" />
                  </div>
                ))
              : filtered.map((row) => (
                  <div key={row.id} className="px-4 py-3.5">
                    <button
                      className="w-full flex items-start justify-between gap-3 text-left"
                      onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-black mb-0.5"
                          style={{ color: cat.primary }}>
                          #{row.id}
                        </p>
                        <p className="text-[13px] font-semibold
                          text-gray-800 dark:text-white truncate">
                          {row.name}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500
                          mt-0.5 truncate">
                          {row.date} · {row.detail}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <StatusPill status={row.status} />
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold
                            text-gray-800 dark:text-white">
                            ₹{row.amount.toLocaleString()}
                          </span>
                          <ChevronDown
                            size={10}
                            className={`text-gray-400 dark:text-gray-500
                              transition-transform duration-200
                              ${expanded === row.id ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                    </button>

                    {/* ── Mobile breakdown expand ── */}
                    <AnimatePresence>
                      {expanded === row.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3
                            border-t border-gray-100 dark:border-white/[0.06]">
                            <div className="grid grid-cols-2 gap-2">
                              {(row.breakdown ?? []).map(item => (
                                <div key={item.label}
                                  className="bg-gray-50 dark:bg-white/[0.04]
                                    rounded-lg p-2.5">
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                                    {item.label}
                                  </p>
                                  <p className={`text-[13px] font-black ${
                                    item.negative && item.value > 0
                                      ? "text-red-500 dark:text-red-400"
                                      : item.negative
                                        ? "text-gray-300 dark:text-gray-700"
                                        : "text-gray-800 dark:text-white"
                                  }`}>
                                    {item.negative
                                      ? (item.value > 0
                                          ? `−₹${item.value.toLocaleString()}`
                                          : "—")
                                      : `₹${item.value.toLocaleString()}`}
                                  </p>
                                </div>
                              ))}
                            </div>
                            {row.paidOn && (
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2.5">
                                Paid {row.paidOn} · {row.paymentMode}
                              </p>
                            )}
                          </div>
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
