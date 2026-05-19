"use client";

import { motion } from "framer-motion";
import Card from "../components/Card";
import ResponsiveSummaryCards from "../components/ResponsiveSummaryCards";
import RemindersScroll from "../components/RemindersScroll";
import DashboardCards from "../components/DashboardCards";
import {
  DollarSign, Users, CalendarCheck,
  TrendingUp, Eye, MousePointerClick, Building2, Activity, ChevronRight,
} from "lucide-react";

const STAT_CARDS = [
  { title: "Revenue",        value: "₹1,20,000", icon: DollarSign,        trend: "up",   trendValue: "+12%" },
  { title: "Users",          value: "1,240",      icon: Users,             trend: "up",   trendValue: "+8%"  },
  { title: "Bookings",       value: "320",        icon: CalendarCheck,     trend: "up",   trendValue: "+5%"  },
  { title: "Recognised",     value: "320",        icon: TrendingUp,        trend: "down", trendValue: "-2%"  },
  { title: "Advance",        value: "320",        icon: DollarSign,        trend: "up",   trendValue: "+3%"  },
  { title: "Total Views",    value: "320",        icon: Eye,               trend: "up",   trendValue: "+18%" },
  { title: "Enquiry Clicks", value: "320",        icon: MousePointerClick, trend: "up",   trendValue: "+10%" },
  { title: "Venues Listed",  value: "320",        icon: Building2,         trend: null,   trendValue: null   },
];

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
      <div className="px-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Welcome back — here&apos;s your venue performance overview.
        </p>
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card title={card.title} value={card.value} icon={card.icon} trend={card.trend} trendValue={card.trendValue} />
          </motion.div>
        ))}
      </section>

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
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
              <Activity size={15} className="text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
          </div>
          <button className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline cursor-pointer">
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
