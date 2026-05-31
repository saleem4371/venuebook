"use client";

import { useState, useMemo } from "react";
import ScrollableTabBar from "../components/ScrollableTabBar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCheck, Settings, Filter, Search,
  BellOff, Calendar, CreditCard, Users, Shield,
  Megaphone, Activity, X, Check,
  AlertTriangle, TrendingUp, Zap, Package,
  UserPlus, LogIn, Edit3, Pause, RefreshCw,
  Clock, ArrowRight, Star, Building2, Cpu,
} from "lucide-react";

/* ════════════════════════════════════════
   MOCK DATA
   ════════════════════════════════════════ */

const NOTIFICATIONS = [
  {
    id: 1, type: "booking",
    title: "New booking confirmed",
    description: "Swarnagiri Mantap Indoors — ₹86,847 for 15 Apr 2026",
    time: "2 min ago", read: false, priority: "success",
    icon: "calendar", badge: "Booking",
  },
  {
    id: 2, type: "payment",
    title: "Payout released",
    description: "₹2,18,000 transferred to your ICICI account ending 4821",
    time: "45 min ago", read: false, priority: "success",
    icon: "rupee", badge: "Payment",
  },
  {
    id: 3, type: "security",
    title: "New login from unknown device",
    description: "Chrome on Windows · Bengaluru, Karnataka · 192.168.1.42",
    time: "1 hr ago", read: false, priority: "critical",
    icon: "shield", badge: "Security",
  },
  {
    id: 4, type: "booking",
    title: "Check-in reminder",
    description: "3 guests arriving at Nandi Hills Farmstay tomorrow at 2 PM",
    time: "3 hr ago", read: true, priority: "info",
    icon: "calendar", badge: "Booking",
  },
  {
    id: 5, type: "team",
    title: "Team member added",
    description: "Priya Sharma joined as Venue Manager for Swarnagiri Mantap",
    time: "5 hr ago", read: true, priority: "info",
    icon: "users", badge: "Team",
  },
  {
    id: 6, type: "payment",
    title: "Overdue payment alert",
    description: "BR #9446 — ₹33,747 overdue since 8 Apr 2026",
    time: "Yesterday", read: false, priority: "warning",
    icon: "rupee", badge: "Payment",
  },
  {
    id: 7, type: "booking",
    title: "Studio session booked",
    description: "Creator Arjun Mehta booked Studio B for 6 hrs — 20 Apr",
    time: "Yesterday", read: true, priority: "success",
    icon: "calendar", badge: "Booking",
  },
  {
    id: 8, type: "security",
    title: "2FA verification required",
    description: "Your account settings were changed. Verify it was you.",
    time: "2 days ago", read: true, priority: "critical",
    icon: "shield", badge: "Security",
  },
  {
    id: 9, type: "team",
    title: "Role permissions updated",
    description: "Admin Rohan changed billing access for 3 team members",
    time: "2 days ago", read: true, priority: "info",
    icon: "users", badge: "Team",
  },
  {
    id: 10, type: "payment",
    title: "Advance payment received",
    description: "BR #2338 — ₹1,35,930 advance received from Karthik S.",
    time: "3 days ago", read: true, priority: "success",
    icon: "rupee", badge: "Payment",
  },
  {
    id: 11, type: "booking",
    title: "Hot-desk reservation",
    description: "12 desks reserved by Infosys Ltd for week of 22 Apr",
    time: "3 days ago", read: true, priority: "info",
    icon: "calendar", badge: "Booking",
  },
  {
    id: 12, type: "booking",
    title: "Rental item overdue",
    description: "LED panel set — 2 days overdue · Contact Ananya P.",
    time: "4 days ago", read: true, priority: "warning",
    icon: "calendar", badge: "Booking",
  },
];

const ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "Introducing Smart Pricing Engine",
    description:
      "Our new AI-powered pricing tool helps you maximize revenue by suggesting dynamic rates based on local demand, competitor pricing, and seasonal trends. Available for all Venue hosts.",
    cta: "Explore Now",
    tag: "New Feature",
    accent: "from-violet-500 to-indigo-500",
    icon: Zap,
    date: "10 Apr 2026",
  },
  {
    id: "a2",
    title: "Scheduled Maintenance — 24 Apr 2026",
    description:
      "The platform will undergo maintenance on 24 Apr between 2 AM – 4 AM IST. Bookings and payments will be paused. No action required on your end.",
    cta: "See Schedule",
    tag: "Maintenance",
    accent: "from-amber-500 to-orange-500",
    icon: Cpu,
    date: "8 Apr 2026",
  },
  {
    id: "a3",
    title: "venuebook Mobile App — Beta Access",
    description:
      "Manage bookings, respond to enquiries, and track payouts directly from your phone. iOS and Android beta now open.",
    cta: "Join Beta",
    tag: "Product",
    accent: "from-emerald-500 to-teal-500",
    icon: Star,
    date: "2 Apr 2026",
  },
];

const ACTIVITY_LOG = [
  { id: "l1", action: "Venue listing updated", detail: "Swarnagiri Mantap — Photos & description edited", user: "You", time: "10 min ago", icon: Edit3 },
  { id: "l2", action: "Pricing changed", detail: "Hall A weekend rate: ₹45,000 → ₹52,000", user: "You", time: "2 hr ago", icon: TrendingUp },
  { id: "l3", action: "Calendar synced", detail: "Google Calendar connected for Studio B", user: "System", time: "5 hr ago", icon: RefreshCw },
  { id: "l4", action: "Listing paused", detail: "Farmstay Suite 3 paused for renovation", user: "Priya S.", time: "Yesterday", icon: Pause },
  { id: "l5", action: "Package edited", detail: "Deluxe hall package — catering addon updated", user: "You", time: "Yesterday", icon: Package },
  { id: "l6", action: "Login detected", detail: "New session from MacBook Pro · Bengaluru", user: "You", time: "2 days ago", icon: LogIn },
  { id: "l7", action: "Booking accepted", detail: "BR #6706 — Sylvester · Swarnagiri Mantap", user: "You", time: "2 days ago", icon: Check },
];

const TABS = ["All", "Notifications", "Announcements", "Activity", "Security", "Payments", "Team"];
const FILTERS = ["Unread", "Critical", "Booking", "Payout", "Today", "This Week"];

/* ════════════════════════════════════════
   UTILITY HELPERS
   ════════════════════════════════════════ */

const ICON_MAP = {
  calendar: Calendar, rupee: CreditCard, shield: Shield, users: Users,
};

const PRIORITY_STYLES = {
  success: {
    border: "border-l-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    dot: "bg-emerald-400",
  },
  critical: {
    border: "border-l-red-400",
    badge: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    icon: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    dot: "bg-red-400",
  },
  warning: {
    border: "border-l-amber-400",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  info: {
    border: "border-l-blue-400",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    icon: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    dot: "bg-blue-400",
  },
};

/* ════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════ */

function NotificationCard({ notif, onMarkRead, onDismiss }) {
  const styles = PRIORITY_STYLES[notif.priority];
  const Icon = ICON_MAP[notif.icon] || Bell;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        group relative flex gap-3.5 px-4 py-3.5
        border-b border-gray-100 dark:border-white/[0.05]
        border-l-[3px] ${styles.border}
        ${!notif.read
          ? "bg-white dark:bg-white/[0.025]"
          : "bg-transparent"
        }
        hover:bg-gray-50/70 dark:hover:bg-white/[0.03]
        transition-colors duration-150 cursor-pointer
      `}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className={`absolute top-4 right-4 w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center ${styles.icon}`}>
        <Icon size={15} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${styles.badge}`}>
              {notif.badge}
            </span>
            <p className={`text-sm leading-snug text-gray-900 dark:text-white ${!notif.read ? "font-semibold" : "font-medium opacity-70 dark:opacity-60"}`}>
              {notif.title}
            </p>
          </div>
          <span className="flex-shrink-0 text-[11px] text-gray-400 dark:text-gray-500 tabular-nums mt-0.5">
            {notif.time}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed pr-6">
          {notif.description}
        </p>

        {/* Hover actions */}
        <div className="mt-1.5 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {!notif.read && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id); }}
              className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              <Check size={11} /> Mark read
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
            className="text-[11px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:underline flex items-center gap-1"
          >
            <X size={11} /> Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AnnouncementCard({ item }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border-b border-gray-100 dark:border-white/[0.05] px-4 py-4 hover:bg-gray-50/70 dark:hover:bg-white/[0.03] transition-colors"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${item.accent}`} />

      <div className="flex gap-3.5 pl-1">
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${item.accent} flex items-center justify-center mt-0.5`}>
          <Icon size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {item.tag}
              </span>
              <span className="text-gray-200 dark:text-gray-700">·</span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">{item.date}</span>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 mb-1">{item.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
          <button className={`mt-2 inline-flex items-center gap-1 text-xs font-medium bg-gradient-to-r ${item.accent} bg-clip-text text-transparent`}>
            {item.cta} <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityTimeline() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
      {ACTIVITY_LOG.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-3.5 px-4 py-3.5 hover:bg-gray-50/70 dark:hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mt-0.5">
              <Icon size={14} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-800 dark:text-white leading-snug">{item.action}</p>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0 tabular-nums">{item.time}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.detail}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">by {item.user}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function EmptyState({ tab }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-3">
        <BellOff size={22} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">All caught up</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
        No {tab.toLowerCase()} to show right now. Check back later.
      </p>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════ */

export default function NotificationsCenter() {
  const [activeTab, setActiveTab] = useState("All");
  const [activeFilters, setActiveFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const TAB_TYPE_MAP = {
    All: null,
    Notifications: ["booking"],
    Announcements: null,
    Activity: null,
    Security: ["security"],
    Payments: ["payment"],
    Team: ["team"],
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const toggleFilter = (f) => setActiveFilters((prev) =>
    prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
  );

  const filteredNotifications = useMemo(() => {
    let items = notifications;

    const types = TAB_TYPE_MAP[activeTab];
    if (types) items = items.filter((n) => types.includes(n.type));

    if (activeFilters.includes("Unread")) items = items.filter((n) => !n.read);
    if (activeFilters.includes("Critical")) items = items.filter((n) => n.priority === "critical");
    if (activeFilters.includes("Booking")) items = items.filter((n) => n.type === "booking");
    if (activeFilters.includes("Payout")) items = items.filter((n) => n.type === "payment");

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
      );
    }

    return items;
  }, [notifications, activeTab, activeFilters, search]);

  return (
    <div className="min-h-screen bg-transparent">

      {/* ── HEADER ── */}
      <div className="bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-sm border-b border-gray-100 dark:border-white/[0.06] sticky top-0 z-30">
        <div className="px-5 md:px-8 pt-4 pb-0 flex items-center justify-between gap-4">
          {/* Title + unread badge */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 px-3 py-1.5 rounded-lg border border-violet-200 dark:border-violet-800/60 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
            <button className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="px-5 md:px-8 mt-3">
          <ScrollableTabBar
            tabs={TABS.map(tab => ({ key: tab, label: tab }))}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="px-5 md:px-8 py-4">

        {/* Search + Filters */}
        {activeTab !== "Activity" && (
          <div className="mb-4 space-y-2.5">
            {/* Search bar */}
            <div className="flex items-center gap-2 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl px-3.5 py-2.5 focus-within:border-violet-300 dark:focus-within:border-violet-700 transition-colors">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 min-w-0"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter chips */}
            {activeTab !== "Announcements" && (
              <div className="flex gap-1.5 flex-wrap">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggleFilter(f)}
                    className={`
                      text-xs px-3 py-1 rounded-full font-medium border transition-colors
                      ${activeFilters.includes(f)
                        ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-transparent"
                        : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.07] text-gray-500 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400"
                      }
                    `}
                  >
                    {f}
                  </button>
                ))}
                {activeFilters.length > 0 && (
                  <button
                    onClick={() => setActiveFilters([])}
                    className="text-xs px-2.5 py-1 rounded-full font-medium text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <X size={10} /> Clear
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── FEED CONTAINER ── */}
        <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] rounded-xl overflow-hidden">

          <AnimatePresence mode="wait">
            {activeTab === "Announcements" ? (
              <motion.div key="ann" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {ANNOUNCEMENTS.map((a) => <AnnouncementCard key={a.id} item={a} />)}
              </motion.div>

            ) : activeTab === "Activity" ? (
              <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Activity search */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.05]">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2 focus-within:border-violet-300 dark:focus-within:border-violet-700 transition-colors">
                    <Search size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search activity..."
                      className="flex-1 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 min-w-0"
                    />
                  </div>
                </div>
                <ActivityTimeline />
              </motion.div>

            ) : (
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {filteredNotifications.length === 0 ? (
                  <EmptyState tab={activeTab} />
                ) : (
                  filteredNotifications.map((n) => (
                    <NotificationCard key={n.id} notif={n} onMarkRead={markRead} onDismiss={dismiss} />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Count footer */}
        {activeTab !== "Activity" && activeTab !== "Announcements" && filteredNotifications.length > 0 && (
          <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-600">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
            {activeFilters.length > 0 || search ? " matching filters" : ""}
          </p>
        )}
      </div>

      {/* ── MOBILE STICKY BAR ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0a0f1e]/90 backdrop-blur-xl border-t border-gray-100 dark:border-white/[0.06] px-4 py-2.5 flex items-center justify-between z-40">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500"
          >
            <CheckCheck size={12} /> Mark all read
          </button>
        )}
      </div>
    </div>
  );
}
