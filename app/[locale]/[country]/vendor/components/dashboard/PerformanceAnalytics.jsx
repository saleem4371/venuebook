"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/* ─── Mock data ────────────────────────────────────────────────────────────── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const BOOKINGS_DATA = MONTHS.map((m, i) => ({
  month: m,
  "2026": [21,28,35,30,42,38,50,45,55,60,58,70][i],
  "2025": [15,20,28,25,35,30,42,38,45,50,48,60][i],
}));

const REVENUE_DATA = MONTHS.map((m, i) => ({
  month: m,
  "This Year": [80,95,110,95,120,115,135,125,145,155,150,170][i],
  "Last Year": [60,75,85, 80,100, 95,115,105,125,135,128,150][i],
}));

const ENQUIRY_DATA = MONTHS.map((m, i) => ({
  month: m,
  Enquiries: [45,52,60,48,65,58,72,65,78,82,76,90][i],
  Converted: [21,28,35,30,42,38,50,45,55,60,58,70][i],
}));

const TABS = ["Bookings", "Revenue", "Enquiries"];

/* ─── Tooltip ──────────────────────────────────────────────────────────────── */
function ChartTip({ active, payload, label, isRevenue }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/[0.10] rounded-xl px-3 py-2 shadow-2xl text-xs">
      <p className="text-gray-400 dark:text-gray-500 mb-1 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="font-bold text-[13px]" style={{ color: p.color ?? p.fill }}>
          {isRevenue ? `₹${p.value}L` : p.value}
          <span className="text-[10px] font-normal text-gray-400 ml-1.5">{p.name}</span>
        </p>
      ))}
    </div>
  );
}

/* ─── Legend pill ──────────────────────────────────────────────────────────── */
function LegendPill({ color, label, dashed }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-block h-[2.5px] w-5 rounded-full ${dashed ? "opacity-50" : ""}`}
        style={{ background: color, borderBottom: dashed ? "2px dashed" : "none" }}
      />
      <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function PerformanceAnalytics() {
  const [tab, setTab] = useState("Bookings");

  const tickStyle = { fontSize: 10, fill: "rgba(128,128,128,0.55)" };
  const grid      = <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.07)" vertical={false} />;
  const xAxis     = <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />;
  const yAxis     = (fmt) => <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />;

  return (
    <div className="rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-black/20 p-4 sm:p-5 h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">Performance Analytics</h3>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Year-on-year · 2025 vs 2026</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-white/[0.04] rounded-lg p-1 border border-gray-200/80 dark:border-white/[0.06]">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "text-[11.5px] font-semibold px-3 py-1.5 rounded-md transition-all duration-200",
                tab === t
                  ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm border border-gray-200/80 dark:border-white/[0.08]"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <ResponsiveContainer width="100%" height={200}>
            {tab === "Revenue" ? (
              <LineChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                {grid}{xAxis}{yAxis(v => `${v}L`)}
                <Tooltip content={<ChartTip isRevenue />} cursor={{ stroke: "#7c3aed", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Line type="monotone" dataKey="This Year" stroke="#7c3aed" strokeWidth={2.5} dot={false}
                  activeDot={{ r: 4, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="Last Year" stroke="#cbd5e1" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            ) : tab === "Enquiries" ? (
              <BarChart data={ENQUIRY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={12} barCategoryGap="30%">
                {grid}{xAxis}{yAxis(v => v)}
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="Enquiries" fill="#0ea5e9" radius={[4,4,0,0]} />
                <Bar dataKey="Converted" fill="#a44bf3" radius={[4,4,0,0]} />
              </BarChart>
            ) : (
              <BarChart data={BOOKINGS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={12} barCategoryGap="30%">
                {grid}{xAxis}{yAxis(v => v)}
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="2026" fill="#7c3aed" radius={[4,4,0,0]} />
                <Bar dataKey="2025" fill="#e2e8f0" radius={[4,4,0,0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {tab === "Bookings"   && <><LegendPill color="#7c3aed" label="2026" /><LegendPill color="#e2e8f0" label="2025" /></>}
        {tab === "Revenue"    && <><LegendPill color="#7c3aed" label="This Year" /><LegendPill color="#94a3b8" label="Last Year" dashed /></>}
        {tab === "Enquiries"  && <><LegendPill color="#0ea5e9" label="Enquiries" /><LegendPill color="#a44bf3" label="Converted" /></>}
      </div>
    </div>
  );
}
