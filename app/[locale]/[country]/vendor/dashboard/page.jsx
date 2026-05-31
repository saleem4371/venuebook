"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Activity, ChevronRight, TrendingUp } from "lucide-react";

import Card from "../components/Card";
import ResponsiveSummaryCards from "../components/ResponsiveSummaryCards";
import RemindersScroll from "../components/RemindersScroll";
import DashboardCards from "../components/DashboardCards";
import PageHeader from "../components/PageHeader";



const STAT_CARDS = [
  { title: "Revenue",        value: "₹1,20,000", trend: "up",   trendValue: "+12%", sparkline: [40, 55, 48, 60, 72, 65, 80, 95, 88, 110, 102, 120] },
  { title: "Users",          value: "1,240",      trend: "up",   trendValue: "+8%",  sparkline: [900, 950, 980, 1020, 1050, 1100, 1130, 1160, 1180, 1200, 1220, 1240] },
  { title: "Bookings",       value: "320",        trend: "up",   trendValue: "+5%",  sparkline: [200, 215, 210, 230, 240, 250, 260, 270, 280, 295, 310, 320] },
  { title: "Recognised",     value: "320",        trend: "down", trendValue: "-2%",  sparkline: [340, 335, 330, 328, 325, 322, 320, 318, 316, 320, 322, 320] },
  { title: "Advance",        value: "320",        trend: "up",   trendValue: "+3%",  sparkline: [260, 270, 275, 280, 285, 290, 295, 300, 305, 310, 315, 320] },
  { title: "Total Views",    value: "320",        trend: "up",   trendValue: "+18%", sparkline: [120, 140, 150, 170, 190, 200, 220, 240, 260, 280, 300, 320] },
  { title: "Enquiry Clicks", value: "320",        trend: "up",   trendValue: "+10%", sparkline: [200, 210, 215, 225, 240, 250, 260, 270, 280, 290, 305, 320] },
  { title: "Venues Listed",  value: "320",        trend: null,   trendValue: null,   sparkline: [300, 305, 308, 310, 312, 314, 315, 316, 317, 318, 319, 320] },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CHART_DATA = [
  { month: "Jan", bookings: 21 },
  { month: "Feb", bookings: 28 },
  { month: "Mar", bookings: 35 },
  { month: "Apr", bookings: 30 },
  { month: "May", bookings: 42 },
  { month: "Jun", bookings: 38 },
  { month: "Jul", bookings: 50 },
  { month: "Aug", bookings: 45 },
  { month: "Sep", bookings: 55 },
  { month: "Oct", bookings: 60 },
  { month: "Nov", bookings: 58 },
  { month: "Dec", bookings: 70 },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/[0.10] rounded-xl px-3 py-2 shadow-2xl text-xs">
      <p className="text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="font-bold text-sm text-violet-600 dark:text-violet-400">{payload[0].value} bookings</p>
    </div>
  );
}

export default function Dashboard() {
  const data = [
    { category: "Bookings",            offline: 21, online: 19, total: 40 },
    { category: "Events",              offline: 40, online: 40, total: 80 },
    { category: "Security (Hold)",     offline: 7,  online: 10, total: 17 },
    { category: "Security (Refunded)", offline: 1,  online: 1,  total: 2  },
    { category: "Reserved",            offline: 0,  online: 0,  total: 0  },
    { category: "Leads",               offline: 80, online: 0,  total: 80 },
  ];

  const reminders = [
    { title: "Event at Swarnagiri Mantap Indoors -4050", date: "31-March-2026",  time: "6:00 PM"  },
    { title: "Event at Swarnagiri Mantap Indoor -2484",  date: "31-March-2026",  time: "12:00 PM" },
    { title: "Event at Swarnagiri Mantap Indoor -2082",  date: "01-April-2026",  time: "12:00 PM" },
  ];

  const agingData = [
    { label: "Over-Due", percentage: 80 },
    { label: "1–10",     percentage: 0  },
    { label: "11–20",    percentage: 8  },
    { label: "20+",      percentage: 12 },
  ];

  const bookings = [
    { name: "Sylvester",         id: 6706, date: "10 Apr 2026", amount: 39616 },
    { name: "Sylvester",         id: 2484, date: "31 Mar 2026", amount: 35517 },
    { name: "Sylvester",         id: 4050, date: "31 Mar 2026", amount: 39616 },
    { name: "Sylvester",         id: 3059, date: "20 Mar 2026", amount: 39616 },
    { name: "Sylvester Miranda", id: 4111, date: "15 Apr 2026", amount: 20478 },
  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back — here's your venue performance overview."
      />

      {/* Stat cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card
              title={card.title}
              value={card.value}
              trend={card.trend}
              trendValue={card.trendValue}
              sparkline={card.sparkline}
            />
          </motion.div>
        ))}
      </section>

      {/* Bookings trend chart + quick stats */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Area chart — 2/3 */}
        <div className="md:col-span-2 rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] p-4 sm:p-5 shadow-sm dark:shadow-black/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">Bookings trend</h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Monthly · 2026</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className="w-5 h-[2px] rounded-full inline-block bg-violet-500" />
              Bookings
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dash-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.07)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "rgba(128,128,128,0.55)" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "rgba(128,128,128,0.55)" }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#7c3aed", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area
                type="monotone" dataKey="bookings"
                stroke="#7c3aed" strokeWidth={2.5}
                fill="url(#dash-bg)"
                dot={false}
                activeDot={{ r: 5, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick breakdown — 1/3 */}
        <div className="rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] p-4 sm:p-5 shadow-sm dark:shadow-black/20 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-50 dark:bg-violet-950/40 rounded-lg">
              <TrendingUp size={14} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">This month</h3>
          </div>
          {[
            { label: "Online bookings",  value: "19", pct: 48 },
            { label: "Offline bookings", value: "21", pct: 52 },
            { label: "Events",           value: "80", pct: 100 },
            { label: "Leads",            value: "80", pct: 100 },
          ].map(({ label, value, pct }) => (
            <div key={label}>
              <div className="flex justify-between items-baseline text-[11.5px] mb-1.5">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-bold text-gray-800 dark:text-white">{value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="h-full rounded-full bg-violet-500"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Summary + Reminders */}
      <section className="grid md:grid-cols-2 grid-cols-1 gap-4">
        <ResponsiveSummaryCards data={data} />
        <RemindersScroll reminders={reminders} />
      </section>

      {/* Aging / Bookings / Reservations */}
      <section>
        <DashboardCards agingData={agingData} bookings={bookings} />
      </section>

      {/* Recent Activity */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] rounded-xl shadow-sm dark:shadow-black/20 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
              <Activity size={15} className="text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
          </div>
          <button className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline cursor-pointer">
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl">
            <Activity size={28} className="text-gray-300 dark:text-gray-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No recent activity</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Actions like bookings, leads, and payments will appear here.</p>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
