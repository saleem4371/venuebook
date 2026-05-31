"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ScrollableTabBar from "../components/ScrollableTabBar";
import {
  Users, Search, Filter, Grid3X3, List, MoreVertical,
  Mail, Phone, MapPin, Clock, Shield, Eye, EyeOff, ChevronDown,
  Edit2, Ban, Key, Activity, X, Check, AlertCircle, UserCheck,
  Building2, Star, Zap, Crown, Briefcase, BarChart2, ChevronRight,
  Send, Loader2, Copy, CheckCheck, RefreshCw, ArrowUpRight,
  UserPlus, Lock, Unlock, Globe, Calendar, Layers, Package,
  Settings, FileText, DollarSign, Users2, ShieldCheck, ToggleLeft,
  ToggleRight, ChevronUp, Hash, Wifi, WifiOff, Timer, Plus,
  ChevronLeft, Trash2, FlipHorizontal, AlertTriangle, Info,
  LogIn, Monitor, Smartphone, Tablet, CheckCircle2, XCircle,
  LayoutGrid, Sliders, Database,
} from "lucide-react";

/* ===============================================================
   CONSTANTS & MOCK DATA
=============================================================== */
const VENUES = [
  "The Grand Ballroom", "Sky Terrace", "Crystal Hall",
  "Garden Pavilion", "Lakeside Arena",
];

const MASKABLE_FIELDS = [
  { key: "customerName", label: "Customer Name",  icon: Users,      category: "contact" },
  { key: "phone",        label: "Phone Number",   icon: Phone,      category: "contact" },
  { key: "email",        label: "Email Address",  icon: Mail,       category: "contact" },
  { key: "address",      label: "Address",        icon: MapPin,     category: "contact" },
  { key: "pricing",      label: "Pricing",        icon: DollarSign, category: "financial" },
  { key: "revenue",      label: "Revenue",        icon: BarChart2,  category: "financial" },
  { key: "notes",        label: "Private Notes",  icon: FileText,   category: "content" },
];

const ROLES = [
  { id: "owner",      label: "Owner",      color: "amber",   icon: Crown,       level: 100, desc: "Full unrestricted access" },
  { id: "admin",      label: "Admin",      color: "purple",  icon: ShieldCheck, level: 90,  desc: "Manage team & all venues" },
  { id: "manager",    label: "Manager",    color: "blue",    icon: Briefcase,   level: 70,  desc: "Operational oversight" },
  { id: "operations", label: "Operations", color: "cyan",    icon: Zap,         level: 60,  desc: "Day-to-day operations" },
  { id: "sales",      label: "Sales",      color: "green",   icon: BarChart2,   level: 50,  desc: "Leads & bookings" },
  { id: "finance",    label: "Finance",    color: "emerald", icon: DollarSign,  level: 50,  desc: "Financial data & reports" },
  { id: "staff",      label: "Staff",      color: "gray",    icon: Users,       level: 30,  desc: "Basic venue tasks" },
  { id: "viewer",     label: "Viewer",     color: "slate",   icon: Eye,         level: 10,  desc: "Read-only access" },
];

const ROLE_COLOR_MAP = {
  amber:   { bg: "bg-amber-100 dark:bg-amber-900/30",     text: "text-amber-700 dark:text-amber-300",     dot: "bg-amber-500",   ring: "ring-amber-500/30"  },
  purple:  { bg: "bg-purple-100 dark:bg-purple-900/30",   text: "text-purple-700 dark:text-purple-300",   dot: "bg-purple-500",  ring: "ring-purple-500/30" },
  blue:    { bg: "bg-blue-100 dark:bg-blue-900/30",       text: "text-blue-700 dark:text-blue-300",       dot: "bg-blue-500",    ring: "ring-blue-500/30"   },
  cyan:    { bg: "bg-cyan-100 dark:bg-cyan-900/30",       text: "text-cyan-700 dark:text-cyan-300",       dot: "bg-cyan-500",    ring: "ring-cyan-500/30"   },
  green:   { bg: "bg-green-100 dark:bg-green-900/30",     text: "text-green-700 dark:text-green-300",     dot: "bg-green-500",   ring: "ring-green-500/30"  },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", ring: "ring-emerald-500/30"},
  gray:    { bg: "bg-gray-100 dark:bg-gray-800",          text: "text-gray-600 dark:text-gray-400",       dot: "bg-gray-400",    ring: "ring-gray-500/30"   },
  slate:   { bg: "bg-slate-100 dark:bg-slate-800",        text: "text-slate-600 dark:text-slate-400",     dot: "bg-slate-400",   ring: "ring-slate-500/30"  },
};

const MOCK_MEMBERS = [
  {
    id: "1", name: "Arjun Mehta", email: "arjun@venuebook.in", phone: "+91 98765 43210",
    role: "admin", status: "active", isOnline: true, masked: false,
    venues: ["The Grand Ballroom", "Sky Terrace", "Crystal Hall"],
    lastActive: "Just now", loginDevice: "MacBook Pro", loginLocation: "Mumbai, IN",
    joinedAt: "Jan 2024", loginAccess: true,
    maskedFields: [],
    recentActions: [
      { time: "Today 14:32", action: "Updated booking #B-2341", type: "edit" },
      { time: "Today 11:05", action: "Approved package deal",   type: "approve" },
      { time: "Yesterday",   action: "Exported customer report", type: "export" },
    ],
    loginHistory: [
      { device: "MacBook Pro", location: "Mumbai, IN", time: "Today 09:14", status: "success" },
      { device: "iPhone 15",   location: "Mumbai, IN", time: "Yesterday",   status: "success" },
    ],
    inviteStatus: "accepted",
  },
  {
    id: "2", name: "Priya Sharma", email: "priya@venuebook.in", phone: "+91 87654 32109",
    role: "manager", status: "active", isOnline: true, masked: false,
    venues: ["Crystal Hall", "Garden Pavilion"],
    lastActive: "5 min ago", loginDevice: "iPhone 15", loginLocation: "Delhi, IN",
    joinedAt: "Mar 2024", loginAccess: true,
    maskedFields: [],
    recentActions: [
      { time: "Today 10:20", action: "Created new listing",  type: "create" },
      { time: "Today 09:45", action: "Sent 3 proposals",     type: "create" },
    ],
    loginHistory: [
      { device: "iPhone 15",  location: "Delhi, IN", time: "Today 08:30",    status: "success" },
      { device: "Chrome",     location: "Delhi, IN", time: "2 days ago",     status: "success" },
    ],
    inviteStatus: "accepted",
  },
  {
    id: "3", name: "Rahul Kumar", email: "r***@gmail.com", phone: "+91 XXXXX 10987",
    role: "staff", status: "active", isOnline: false, masked: true,
    venues: ["Garden Pavilion"],
    lastActive: "2 hrs ago", loginDevice: "Android", loginLocation: "Bangalore, IN",
    joinedAt: "May 2024", loginAccess: true,
    maskedFields: ["email", "phone"],
    recentActions: [
      { time: "Today 12:00", action: "Checked in guest",       type: "edit" },
      { time: "Yesterday",   action: "Updated availability",   type: "edit" },
    ],
    loginHistory: [
      { device: "Android", location: "Bangalore, IN", time: "Today 12:00", status: "success" },
    ],
    inviteStatus: "accepted",
  },
  {
    id: "4", name: "Sneha Patel", email: "sneha@venuebook.in", phone: "+91 76543 21098",
    role: "finance", status: "active", isOnline: false, masked: false,
    venues: ["The Grand Ballroom", "Sky Terrace", "Crystal Hall", "Garden Pavilion"],
    lastActive: "Yesterday", loginDevice: "Windows PC", loginLocation: "Ahmedabad, IN",
    joinedAt: "Feb 2024", loginAccess: true,
    maskedFields: [],
    recentActions: [
      { time: "Yesterday", action: "Generated Q1 report",  type: "export" },
      { time: "Yesterday", action: "Processed 5 payments", type: "approve" },
    ],
    loginHistory: [
      { device: "Windows PC", location: "Ahmedabad, IN", time: "Yesterday", status: "success" },
    ],
    inviteStatus: "accepted",
  },
  {
    id: "5", name: "Vikram Singh", email: "vi***@mail.com", phone: "+91 XXXXX 09876",
    role: "operations", status: "suspended", isOnline: false, masked: true,
    venues: ["Lakeside Arena"],
    lastActive: "3 days ago", loginDevice: "iPad", loginLocation: "Jaipur, IN",
    joinedAt: "Jun 2024", loginAccess: false,
    maskedFields: ["email", "phone", "customerName"],
    recentActions: [
      { time: "3 days ago", action: "Updated venue capacity", type: "edit" },
    ],
    loginHistory: [
      { device: "iPad", location: "Jaipur, IN", time: "3 days ago", status: "success" },
      { device: "iPad", location: "Unknown",    time: "4 days ago", status: "failed" },
    ],
    inviteStatus: "accepted",
  },
  {
    id: "6", name: "Meera Nair", email: "meera@venuebook.in", phone: "+91 65432 10987",
    role: "sales", status: "pending", isOnline: false, masked: false,
    venues: [],
    lastActive: "Never", loginDevice: "—", loginLocation: "—",
    joinedAt: "Invited Jun 2024", loginAccess: false,
    maskedFields: [],
    recentActions: [],
    loginHistory: [],
    inviteStatus: "invited",
  },
  {
    id: "7", name: "Dev Anand", email: "dev@venuebook.in", phone: "+91 54321 09876",
    role: "viewer", status: "active", isOnline: false, masked: false,
    venues: ["Sky Terrace"],
    lastActive: "1 week ago", loginDevice: "Chrome Browser", loginLocation: "Chennai, IN",
    joinedAt: "Apr 2024", loginAccess: true,
    maskedFields: [],
    recentActions: [
      { time: "1 week ago", action: "Viewed reports", type: "view" },
    ],
    loginHistory: [
      { device: "Chrome", location: "Chennai, IN", time: "1 week ago", status: "success" },
    ],
    inviteStatus: "accepted",
  },
  {
    id: "8", name: "Aisha Khan", email: "aisha@mail.com", phone: "+91 45678 90123",
    role: "manager", status: "pending", isOnline: false, masked: false,
    venues: [],
    lastActive: "Never", loginDevice: "—", loginLocation: "—",
    joinedAt: "Invited May 2024", loginAccess: false,
    maskedFields: [],
    recentActions: [],
    loginHistory: [],
    inviteStatus: "expired",
  },
];

const ROLE_PRESETS = [
  { id: "super_admin", label: "Super Admin", base: "admin",      custom: true,  builtin: false, desc: "Full access including team management" },
  { id: "venue_admin", label: "Venue Admin", base: "manager",    custom: true,  builtin: false, desc: "Manage specific venues only" },
  { id: "ops",         label: "Operations", base: "operations",  custom: false, builtin: true,  desc: "Day-to-day operational access" },
  { id: "finance",     label: "Finance",    base: "finance",     custom: false, builtin: true,  desc: "Financial data & reports only" },
  { id: "sales",       label: "Sales",      base: "sales",       custom: false, builtin: true,  desc: "Leads, bookings & proposals" },
  { id: "staff",       label: "Staff",      base: "staff",       custom: false, builtin: true,  desc: "Basic operational tasks" },
  { id: "viewer",      label: "Viewer",     base: "viewer",      custom: false, builtin: true,  desc: "Read-only, no edits" },
];

const PERMISSION_MODULES = [
  { key: "reservations", label: "Reservations", icon: FileText,   actions: ["view","create","edit","delete","approve","export"], group: "core" },
  { key: "calendar",     label: "Calendar",     icon: Calendar,   actions: ["view","create","edit","delete"],                   group: "core" },
  { key: "listings",     label: "Listings",     icon: Building2,  actions: ["view","create","edit","delete","publish"],         group: "core" },
  { key: "packages",     label: "Packages",     icon: Package,    actions: ["view","create","edit","delete","approve"],         group: "core" },
  { key: "customers",    label: "Customers",    icon: Users2,     actions: ["view","edit","export"],                            group: "core" },
  { key: "reports",      label: "Reports",      icon: BarChart2,  actions: ["view","export"],                                   group: "analytics" },
  { key: "finance",      label: "Finance",      icon: DollarSign, actions: ["view","create","edit","approve","export"],         group: "analytics" },
  { key: "addons",       label: "Addons",       icon: Layers,     actions: ["view","create","edit","delete"],                   group: "config" },
  { key: "settings",     label: "Settings",     icon: Settings,   actions: ["view","edit"],                                     group: "config" },
  { key: "teams",        label: "Teams",        icon: Users,      actions: ["view","create","edit","delete"],                   group: "config" },
];

const ACTION_LABELS = {
  view: "View", create: "Create", edit: "Edit",
  delete: "Delete", approve: "Approve", export: "Export", publish: "Publish",
};

const ROLE_DEFAULT_PERMISSIONS = {
  owner:      { "*": ["view","create","edit","delete","approve","export","publish"] },
  admin:      { "*": ["view","create","edit","delete","approve","export","publish"] },
  manager:    { "*": ["view","create","edit","approve"], finance: ["view"], settings: ["view"], teams: ["view"] },
  operations: { reservations: ["view","edit","approve"], calendar: ["view","create","edit"], listings: ["view"], customers: ["view"] },
  sales:      { reservations: ["view","create"], packages: ["view","create"], customers: ["view","edit"], calendar: ["view"] },
  finance:    { finance: ["view","create","edit","approve","export"], reports: ["view","export"], reservations: ["view"] },
  staff:      { calendar: ["view"], listings: ["view"], reservations: ["view","create"] },
  viewer:     { "*": ["view"] },
};

function buildDefaultPerms(roleId) {
  const rp = ROLE_DEFAULT_PERMISSIONS[roleId] || {};
  const perms = {};
  for (const mod of PERMISSION_MODULES) {
    if (rp["*"]) {
      perms[mod.key] = [...rp["*"]].filter(a => mod.actions.includes(a));
    } else {
      perms[mod.key] = [...(rp[mod.key] || [])];
    }
  }
  return perms;
}

/* ===============================================================
   HELPERS
=============================================================== */
const AVATAR_PALETTE = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
];
function avatarGrad(name) {
  if (!name) return AVATAR_PALETTE[0];
  return AVATAR_PALETTE[(name.charCodeAt(0) - 65 + 26) % AVATAR_PALETTE.length];
}
function initials(name) {
  if (!name) return "?";
  return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
function getRoleObj(id)    { return ROLES.find(r => r.id === id) || ROLES[ROLES.length - 1]; }
function getRoleColors(id) { return ROLE_COLOR_MAP[getRoleObj(id).color] || ROLE_COLOR_MAP.gray; }

/* ===============================================================
   ANIMATION VARIANTS
=============================================================== */
const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

const overlayBackdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const overlayPanel = {
  hidden:  { opacity: 0, scale: 0.97, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 340, damping: 30, mass: 0.8 } },
  exit:    { opacity: 0, scale: 0.97, y: 16, transition: { duration: 0.18 } },
};

const drawerSlide = {
  hidden:  { x: "100%", opacity: 0.8 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 32 } },
  exit:    { x: "100%", opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

const bottomSheet = {
  hidden:  { y: "100%" },
  visible: { y: 0, transition: { type: "spring", stiffness: 320, damping: 34 } },
  exit:    { y: "100%", transition: { duration: 0.22 } },
};

/* ===============================================================
   SHARED OVERLAY WRAPPER
=============================================================== */
function FullscreenOverlay({ children, onClose, wide = false }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <motion.div
        variants={overlayBackdrop}
        initial="hidden" animate="visible" exit="hidden"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      />
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-1.5 sm:p-6" style={{ zIndex: 100000 }}>
        <motion.div
          variants={overlayPanel}
          initial="hidden" animate="visible" exit="exit"
          className={`relative w-full bg-white dark:bg-[#0f1117] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/60 border border-gray-100/80 dark:border-white/[0.06] overflow-hidden flex flex-col h-[calc(100vh_-_12px)] sm:h-[calc(100vh_-_48px)] ${wide ? "max-w-6xl" : "max-w-4xl"}`}
        >
          {children}
        </motion.div>
      </div>
    </>,
    document.body
  );
}

/* ===============================================================
   DRAWER OVERLAY WRAPPER (side panel)
=============================================================== */
function DrawerOverlay({ children, onClose, width = "max-w-2xl" }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <motion.div
        variants={overlayBackdrop}
        initial="hidden" animate="visible" exit="hidden"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      />
      <motion.aside
        variants={drawerSlide}
        initial="hidden" animate="visible" exit="exit"
        className={`w-full ${width} bg-white dark:bg-[#0f1117] shadow-2xl shadow-black/60 border-l border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col`}
        style={{ position: "fixed", top: 0, bottom: 0, right: 0, zIndex: 100000 }}
      >
        {children}
      </motion.aside>
    </>,
    document.body
  );
}

/* ===============================================================
   CLICK OUTSIDE HOOK
=============================================================== */
function useClickOutside(ref, cb) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

/* ===============================================================
   STAT CARD
=============================================================== */
function StatCard({ label, value, icon: Icon, color, trend }) {
  const colors = {
    purple:  "from-violet-500/10 to-purple-500/5 border-violet-200/60 dark:border-violet-800/30 text-violet-600 dark:text-violet-400",
    blue:    "from-blue-500/10 to-cyan-500/5 border-blue-200/60 dark:border-blue-800/30 text-blue-600 dark:text-blue-400",
    green:   "from-emerald-500/10 to-teal-500/5 border-emerald-200/60 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400",
    amber:   "from-amber-500/10 to-orange-500/5 border-amber-200/60 dark:border-amber-800/30 text-amber-600 dark:text-amber-400",
    rose:    "from-rose-500/10 to-pink-500/5 border-rose-200/60 dark:border-rose-800/30 text-rose-600 dark:text-rose-400",
    slate:   "from-slate-500/10 to-gray-500/5 border-slate-200/60 dark:border-slate-800/30 text-slate-600 dark:text-slate-400",
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color] || colors.slate} border p-4 transition-all hover:shadow-md hover:-translate-y-px bg-white dark:bg-gray-900/60`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 truncate">{label}</p>
          <p className="font-bold text-gray-900 dark:text-gray-50 leading-tight truncate"
             style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.375rem)" }}>{value}</p>
          {trend && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{trend}</p>}
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-white/5">
          <Icon size={15} />
        </span>
      </div>
    </div>
  );
}

/* ===============================================================
   ROLE BADGE
=============================================================== */
function RoleBadge({ roleId, size = "sm" }) {
  const role   = getRoleObj(roleId);
  const colors = getRoleColors(roleId);
  const Icon   = role.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${colors.bg} ${colors.text} ${size === "xs" ? "text-[10px]" : "text-xs"}`}>
      <Icon size={size === "xs" ? 9 : 10} />
      {role.label}
    </span>
  );
}

/* ===============================================================
   STATUS BADGE
=============================================================== */
function StatusBadge({ status }) {
  const map = {
    active:    { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500", label: "Active"    },
    suspended: { cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",           dot: "bg-rose-500",    label: "Suspended" },
    pending:   { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",       dot: "bg-amber-500",   label: "Pending"   },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ===============================================================
   PERMISSION TOGGLE (reusable)
=============================================================== */
function PermToggle({ checked, onChange, size = "md" }) {
  const sz = size === "sm" ? "h-4 w-7" : "h-5 w-9";
  const knob = size === "sm" ? "h-3 w-3 top-0.5" : "h-4 w-4 top-0.5";
  const on   = size === "sm" ? "translate-x-3" : "translate-x-4";
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative ${sz} rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${checked ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-700"}`}
    >
      <motion.div
        animate={{ x: checked ? (size === "sm" ? 12 : 16) : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute left-0 ${knob} rounded-full bg-white shadow-sm`}
      />
    </button>
  );
}


/* ===============================================================
   SHARED PERMISSION MODULE CARD
   Used by PermissionsOverlay AND RolePresetOverlay so both render
   identical accordion permission cards.
=============================================================== */
function PermissionModuleCard({ mod, perms, onToggleAction, onToggleAll, expanded, onToggleExpand }) {
  const Icon     = mod.icon;
  const modPerms = perms[mod.key] || [];
  const allCk    = mod.actions.every(a => modPerms.includes(a));
  const someCk   = mod.actions.some(a => modPerms.includes(a)) && !allCk;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
      <button
        onClick={() => onToggleExpand(mod.key)}
        className="flex w-full items-center justify-between px-5 py-4 bg-gray-50/60 dark:bg-white/[0.025] hover:bg-gray-100/60 dark:hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${modPerms.length > 0 ? "bg-violet-100 dark:bg-violet-900/40" : "bg-gray-100 dark:bg-white/[0.04]"}`}>
            <Icon size={14} className={modPerms.length > 0 ? "text-violet-600 dark:text-violet-400" : "text-gray-400"} />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{mod.label}</span>
            <span className="ml-2 text-[10px] text-gray-400">{modPerms.length}/{mod.actions.length} actions</span>
          </div>
          {someCk && <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
          {allCk  && <CheckCircle2 size={13} className="text-emerald-500" />}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" onClick={e => { e.stopPropagation(); onToggleAll(mod.key, mod.actions); }}>
            <PermToggle checked={allCk} onChange={() => onToggleAll(mod.key, mod.actions)} size="sm" />
            <span className="text-[10px] text-gray-400">All</span>
          </div>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }} className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 py-3 sm:py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {mod.actions.map(action => {
                const checked = modPerms.includes(action);
                return (
                  <button
                    key={action}
                    onClick={() => onToggleAction(mod.key, action)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${checked ? "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300" : "bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/[0.05] text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-white/10"}`}
                  >
                    <div className={`h-4 w-4 rounded flex items-center justify-center border shrink-0 ${checked ? "bg-violet-600 border-violet-600" : "border-gray-200 dark:border-white/20"}`}>
                      {checked && <Check size={9} className="text-white" strokeWidth={3} />}
                    </div>
                    {ACTION_LABELS[action]}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===============================================================
   MEMBER CARD (grid view)
=============================================================== */
function MemberCard({ member, index, onClick, onSuspend }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={() => onClick(member)}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-gray-900/70 border border-gray-100 dark:border-white/[0.06] shadow-sm hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/40 hover:border-gray-200/80 dark:hover:border-white/10 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* gradient strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${avatarGrad(member.name)}`} />

      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${avatarGrad(member.name)} flex items-center justify-center shadow-md`}>
                <span className="text-sm font-bold text-white select-none">{initials(member.name)}</span>
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-900 ${member.isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{member.name}</p>
              <div className="mt-1"><RoleBadge roleId={member.role} /></div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={member.status} />
            {member.masked && (
              <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-[9px] font-semibold">
                <EyeOff size={8} /> Masked
              </span>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Mail size={11} className="shrink-0 text-gray-400" />
            <span className="truncate font-mono text-[11px]">{member.email || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Phone size={11} className="shrink-0 text-gray-400" />
            <span className="font-mono text-[11px]">{member.phone || "—"}</span>
          </div>
        </div>

        {/* Venues */}
        {member.venues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {member.venues.slice(0, 2).map(v => (
              <span key={v} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">
                <Building2 size={9} />
                {v.length > 14 ? v.slice(0, 14) + "…" : v}
              </span>
            ))}
            {member.venues.length > 2 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800/80 text-gray-400">
                +{member.venues.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Clock size={10} />
            <span>{member.lastActive}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            {member.isOnline
              ? <Wifi size={10} className="text-emerald-500" />
              : <WifiOff size={10} className="text-gray-300 dark:text-gray-600" />
            }
            <span className="truncate max-w-[80px]">{member.loginLocation}</span>
          </div>
        </div>
      </div>

      {/* Hover CTA */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-violet-400/30 dark:border-violet-500/20" />
      <div className="border-t border-gray-50 dark:border-white/[0.04] px-5 py-2.5 flex items-center justify-between">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">Click to manage</span>
        <ChevronRight size={12} className="text-gray-300 dark:text-gray-600 group-hover:text-violet-500 transition-colors" />
      </div>
    </motion.div>
  );
}

/* ===============================================================
   MEMBER ROW (table view)
=============================================================== */
function MemberRow({ member, index, onClick, onSuspend }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useClickOutside(menuRef, closeMenu);

  return (
    <motion.tr
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="group border-b border-gray-50 dark:border-white/[0.04] hover:bg-violet-50/30 dark:hover:bg-violet-950/10 transition-colors cursor-pointer"
      onClick={() => onClick(member)}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarGrad(member.name)} flex items-center justify-center`}>
              <span className="text-xs font-bold text-white select-none">{initials(member.name)}</span>
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-950 ${member.isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
            <p className="text-[11px] text-gray-400 font-mono">{member.email || "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5"><RoleBadge roleId={member.role} /></td>
      <td className="px-4 py-3.5"><StatusBadge status={member.status} /></td>
      <td className="px-4 py-3.5">
        {member.venues.length === 0
          ? <span className="text-[11px] text-gray-400">Not assigned</span>
          : <span className="text-[11px] text-gray-600 dark:text-gray-400">{member.venues[0]}{member.venues.length > 1 ? ` +${member.venues.length - 1}` : ""}</span>
        }
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          {member.isOnline
            ? <Wifi size={10} className="text-emerald-500" />
            : <WifiOff size={10} className="text-gray-300 dark:text-gray-600" />
          }
          {member.lastActive}
        </div>
      </td>
      <td className="px-4 py-3.5">
        {member.masked
          ? <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"><EyeOff size={9} />On</span>
          : <span className="text-[11px] text-gray-300 dark:text-gray-600">—</span>
        }
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button onClick={() => onClick(member)} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"><Edit2 size={13} /></button>
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(p => !p)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <MoreVertical size={13} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute end-0 mt-1 z-20 w-40 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl py-1.5"
                >
                  <button onClick={() => { onSuspend(member); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                    <Ban size={12} />{member.status === "suspended" ? "Reactivate" : "Suspend"}
                  </button>
                  <button onClick={() => setMenuOpen(false)} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                    <Key size={12} />Reset password
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

/* ===============================================================
   MEMBER DRAWER — full side panel on member click
=============================================================== */
const DRAWER_TABS = [
  { id: "overview",    label: "Overview",     icon: Users      },
  { id: "permissions", label: "Permissions",  icon: Shield     },
  { id: "activity",    label: "Activity",     icon: Activity   },
  { id: "venues",      label: "Venues",       icon: Building2  },
  { id: "masked",      label: "Masked",       icon: EyeOff     },
];

const ACT_DOT = { edit:"bg-blue-500", approve:"bg-emerald-500", login:"bg-violet-500", export:"bg-amber-500", create:"bg-teal-500", view:"bg-gray-400" };

function MemberDrawer({ member: initialMember, members, onClose, onOpenEdit, onOpenPermissions, onSuspend }) {
  const [tab,    setTab]    = useState("overview");
  const [member, setMember] = useState(initialMember);

  // sync if parent updates
  useEffect(() => { setMember(initialMember); }, [initialMember]);

  const perms    = useMemo(() => buildDefaultPerms(member.role), [member.role]);
  const role     = getRoleObj(member.role);
  const colors   = getRoleColors(member.role);

  const deviceIcon = (d) => {
    if (!d || d === "—") return Monitor;
    const dl = d.toLowerCase();
    if (dl.includes("iphone") || dl.includes("android") || dl.includes("mobile")) return Smartphone;
    if (dl.includes("ipad") || dl.includes("tablet")) return Tablet;
    return Monitor;
  };

  return (
    <DrawerOverlay onClose={onClose} width="max-w-[640px]">
      {/* ── Header ── */}
      <div className="shrink-0 px-4 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-start gap-4">
          {/* avatar */}
          <div className="relative shrink-0">
            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${avatarGrad(member.name)} flex items-center justify-center shadow-lg`}>
              <span className="text-xl font-bold text-white">{initials(member.name)}</span>
            </div>
            <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#0f1117] ${member.isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
          </div>
          {/* info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">{member.name}</h2>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <RoleBadge roleId={member.role} />
                  <StatusBadge status={member.status} />
                  {member.masked && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-[10px] font-semibold">
                      <EyeOff size={9} /> Masked
                    </span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shrink-0 mt-0.5">
                <X size={17} />
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5"><Mail size={11} />{member.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={11} />{member.phone}</span>
              <span className="flex items-center gap-1.5"><Clock size={11} />Joined {member.joinedAt}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 sm:mt-5 flex-wrap">
          <button onClick={() => onOpenEdit(member)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
            <Edit2 size={13} /> Edit Member
          </button>
          <button onClick={() => onOpenPermissions(member)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-colors">
            <Shield size={13} /> Permissions
          </button>
          <button onClick={() => { onSuspend(member); onClose(); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              member.status === "suspended"
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
            }`}>
            {member.status === "suspended" ? <Unlock size={13} /> : <Ban size={13} />}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {DRAWER_TABS.map(t => {
            const Ic = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${active ? "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}>
                <Ic size={11} />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-7 py-4 sm:py-5">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Last Active",    value: member.lastActive,    icon: Clock   },
                    { label: "Location",       value: member.loginLocation, icon: MapPin  },
                    { label: "Device",         value: member.loginDevice,   icon: Monitor },
                    { label: "Access Level",   value: `${role.level}% — ${role.desc}`, icon: Shield },
                    { label: "Login Access",   value: member.loginAccess ? "Enabled" : "Disabled", icon: LogIn },
                    { label: "Venues Assigned", value: member.venues.length === 0 ? "None" : `${member.venues.length} venue(s)`, icon: Building2 },
                  ].map(({ label, value, icon: Ic }) => (
                    <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] p-3.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Ic size={11} className="text-gray-400" />
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Recent actions */}
                {member.recentActions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Recent Actions</p>
                    <div className="space-y-2">
                      {member.recentActions.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${ACT_DOT[a.type] || "bg-gray-400"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{a.action}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PERMISSIONS TAB */}
            {tab === "permissions" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inherited from <RoleBadge roleId={member.role} size="xs" /></p>
                  <button onClick={() => onOpenPermissions(member)} className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline flex items-center gap-1">
                    <Edit2 size={10} /> Customize
                  </button>
                </div>
                {Object.entries(
                  PERMISSION_MODULES.reduce((acc, m) => {
                    if (!acc[m.group]) acc[m.group] = [];
                    acc[m.group].push(m);
                    return acc;
                  }, {})
                ).map(([group, mods]) => (
                  <div key={group}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500 mb-2">{group}</p>
                    <div className="space-y-1.5">
                      {mods.map(mod => {
                        const Icon     = mod.icon;
                        const modPerms = perms[mod.key] || [];
                        const hasPerms = modPerms.length > 0;
                        return (
                          <div key={mod.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
                            <Icon size={13} className={hasPerms ? "text-violet-500 dark:text-violet-400" : "text-gray-300 dark:text-gray-600"} />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1">{mod.label}</span>
                            {hasPerms
                              ? <div className="flex flex-wrap gap-1">{modPerms.map(a => <span key={a} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium">{ACTION_LABELS[a]}</span>)}</div>
                              : <span className="text-[10px] text-gray-300 dark:text-gray-600">No access</span>
                            }
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ACTIVITY TAB */}
            {tab === "activity" && (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[{ label: "Last device", value: member.loginDevice, icon: Monitor }, { label: "Last location", value: member.loginLocation, icon: MapPin }].map(({ label, value, icon: Ic }) => (
                    <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] px-3.5 py-3">
                      <div className="flex items-center gap-1.5 mb-1"><Ic size={11} className="text-gray-400" /><p className="text-[10px] text-gray-400 font-medium">{label}</p></div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Login history */}
                {member.loginHistory.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Login History</p>
                    <div className="space-y-2">
                      {member.loginHistory.map((log, i) => {
                        const DevIc = deviceIcon(log.device);
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/40 dark:bg-white/[0.02]">
                            <div className={`p-1.5 rounded-lg ${log.status === "success" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-rose-100 dark:bg-rose-900/30"}`}>
                              <DevIc size={12} className={log.status === "success" ? "text-emerald-600" : "text-rose-600"} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{log.device}</p>
                              <p className="text-[10px] text-gray-400">{log.location}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] text-gray-400">{log.time}</p>
                              {log.status === "failed" && <span className="text-[9px] text-rose-500 font-semibold">Failed</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {member.recentActions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Action Timeline</p>
                    <div className="relative pl-5">
                      <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gray-100 dark:bg-white/[0.06]" />
                      <div className="space-y-4">
                        {member.recentActions.map((log, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="flex gap-3 relative">
                            <div className={`absolute -left-5 top-1 h-3 w-3 rounded-full border-2 border-white dark:border-[#0f1117] ${ACT_DOT[log.type] || "bg-gray-400"}`} />
                            <div>
                              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{log.action}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{log.time}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VENUES TAB */}
            {tab === "venues" && (
              <div>
                {member.venues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <Building2 size={28} className="text-gray-200 dark:text-gray-700 mb-3" />
                    <p className="text-sm font-medium text-gray-500">No venues assigned</p>
                    <p className="text-xs text-gray-400 mt-1">Edit this member to assign venues</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {VENUES.map(v => {
                      const assigned = member.venues.includes(v);
                      return (
                        <div key={v} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${assigned ? "border-violet-200 dark:border-violet-800/40 bg-violet-50/50 dark:bg-violet-950/20" : "border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-white/[0.01] opacity-40"}`}>
                          <div className={`p-2 rounded-lg ${assigned ? "bg-violet-100 dark:bg-violet-900/40" : "bg-gray-100 dark:bg-gray-800"}`}>
                            <Building2 size={14} className={assigned ? "text-violet-600 dark:text-violet-400" : "text-gray-400"} />
                          </div>
                          <span className={`text-sm font-medium flex-1 ${assigned ? "text-gray-800 dark:text-gray-200" : "text-gray-400"}`}>{v}</span>
                          {assigned && <CheckCircle2 size={15} className="text-violet-500 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MASKED TAB */}
            {tab === "masked" && (
              <div>
                <div className="flex items-center gap-2 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 mb-4">
                  <EyeOff size={14} className="text-orange-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">Data Masking — {member.name}</p>
                    <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-0.5">Fields masked from this user's view</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {MASKABLE_FIELDS.map(f => {
                    const Ic      = f.icon;
                    const masked  = member.maskedFields.includes(f.key);
                    return (
                      <div key={f.key} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${masked ? "border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/20" : "border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-white/[0.01]"}`}>
                        <Ic size={14} className={masked ? "text-orange-600 dark:text-orange-400" : "text-gray-400"} />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{f.label}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{f.category}</p>
                        </div>
                        {masked
                          ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-semibold">Masked</span>
                          : <span className="text-[10px] text-gray-400">Visible</span>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </DrawerOverlay>
  );
}


/* ===============================================================
   PERMISSIONS OVERLAY — full-screen immersive
=============================================================== */
function PermissionsOverlay({ member, onClose }) {
  const [perms,    setPerms]    = useState(() => buildDefaultPerms(member?.role));
  const [search,   setSearch]   = useState("");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [selGroup, setSelGroup] = useState("all");
  const [expanded, setExpanded] = useState({});

  const groups = ["all", "core", "analytics", "config"];

  const filteredMods = PERMISSION_MODULES.filter(m => {
    const matchSearch = m.label.toLowerCase().includes(search.toLowerCase());
    const matchGroup  = selGroup === "all" || m.group === selGroup;
    return matchSearch && matchGroup;
  });

  const toggleAction = (modKey, action) => {
    setPerms(prev => {
      const cur = prev[modKey] || [];
      return { ...prev, [modKey]: cur.includes(action) ? cur.filter(a => a !== action) : [...cur, action] };
    });
  };

  const toggleAllMod = (modKey, actions) => {
    const cur = perms[modKey] || [];
    const all = actions.every(a => cur.includes(a));
    setPerms(prev => ({ ...prev, [modKey]: all ? [] : [...actions] }));
  };

  const toggleExpand = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => { setSaved(false); onClose(); }, 1200); }, 900);
  };

  // Permission summary
  const grantedCount = Object.values(perms).reduce((s, a) => s + a.length, 0);
  const totalActions = PERMISSION_MODULES.reduce((s, m) => s + m.actions.length, 0);

  return (
    <FullscreenOverlay onClose={onClose} wide>
      {/* ── Header ── */}
      <div className="shrink-0 px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1117]">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br ${avatarGrad(member?.name)} flex items-center justify-center shadow-md shrink-0`}>
              <span className="text-sm font-bold text-white">{initials(member?.name)}</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-50 truncate">Permissions — {member?.name}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <RoleBadge roleId={member?.role} size="xs" />
                <span className="text-[11px] text-gray-400">{grantedCount}/{totalActions} granted</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Presets + search row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex gap-1.5 flex-wrap overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <span className="text-xs text-gray-400 font-medium self-center mr-1 shrink-0">Preset:</span>
            {ROLES.filter(r => r.id !== "owner").map(r => {
              const c = getRoleColors(r.id);
              return (
                <button key={r.id} onClick={() => setPerms(buildDefaultPerms(r.id))}
                  className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold border border-transparent transition-all hover:border-current ${c.bg} ${c.text}`}>
                  {r.label}
                </button>
              );
            })}
          </div>
          <div className="relative sm:ml-auto">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search modules…"
              className="w-full sm:w-44 pl-8 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
          </div>
        </div>
      </div>

      {/* ── Split layout: group filter | modules ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left — group nav (hidden on mobile) */}
        <div className="hidden sm:flex sm:flex-col w-44 shrink-0 border-r border-gray-100 dark:border-white/[0.06] py-5 px-3 space-y-1 bg-gray-50/50 dark:bg-white/[0.015]">
          {groups.map(g => (
            <button key={g} onClick={() => setSelGroup(g)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${selGroup === g ? "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300" : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5"}`}>
              {g}
              <span className="ml-1.5 text-[9px] font-normal opacity-60">
                ({g === "all" ? PERMISSION_MODULES.length : PERMISSION_MODULES.filter(m => m.group === g).length})
              </span>
            </button>
          ))}

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 px-2 mb-2">Summary</p>
            <div className="px-2 space-y-1.5">
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Granted</span><span className="font-semibold text-violet-600">{grantedCount}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/5">
                  <div className="h-1.5 rounded-full bg-violet-500 transition-all" style={{ width: `${Math.round(grantedCount / totalActions * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — modules */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col min-h-0">
          {/* Mobile group filter */}
          <div className="sm:hidden flex gap-1.5 overflow-x-auto px-4 pt-3 pb-2 shrink-0" style={{ scrollbarWidth: "none" }}>
            {groups.map(g => (
              <button key={g} onClick={() => setSelGroup(g)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${selGroup === g ? "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300" : "bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400"}`}>
                {g}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4 sm:py-5 space-y-3">
          {filteredMods.map(mod => (
            <PermissionModuleCard
              key={mod.key}
              mod={mod}
              perms={perms}
              onToggleAction={toggleAction}
              onToggleAll={toggleAllMod}
              expanded={expanded[mod.key] !== false}
              onToggleExpand={toggleExpand}
            />
          ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 px-4 sm:px-8 py-4 sm:py-5 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1117] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p className="text-xs text-gray-400 hidden sm:block">Changes apply immediately after saving.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || saved}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-violet-500/20 disabled:opacity-70 flex items-center gap-2 transition-all hover:shadow-lg"
            style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Shield size={14} />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Permissions"}
          </button>
        </div>
      </div>
    </FullscreenOverlay>
  );
}

/* ===============================================================
   MASKED DATA OVERLAY — full-screen control panel
=============================================================== */
function MaskedDataOverlay({ members, onClose }) {
  const [roleRules, setRoleRules] = useState(() =>
    Object.fromEntries(ROLES.map(r => [r.id, { enabled: r.id !== "admin" && r.id !== "owner", fields: [] }]))
  );
  const [userRules, setUserRules] = useState(() =>
    Object.fromEntries(members.map(m => [m.id, { enabled: m.masked, fields: m.maskedFields || [] }]))
  );
  const [activeView, setActiveView] = useState("roles"); // "roles" | "users" | "preview"
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const toggleRoleEnabled = (roleId) => {
    setRoleRules(p => ({ ...p, [roleId]: { ...p[roleId], enabled: !p[roleId].enabled } }));
  };
  const toggleRoleField = (roleId, fieldKey) => {
    setRoleRules(p => {
      const cur = p[roleId].fields;
      return { ...p, [roleId]: { ...p[roleId], fields: cur.includes(fieldKey) ? cur.filter(f => f !== fieldKey) : [...cur, fieldKey] } };
    });
  };
  const toggleUserEnabled = (userId) => {
    setUserRules(p => ({ ...p, [userId]: { ...p[userId], enabled: !p[userId].enabled } }));
  };
  const toggleUserField = (userId, fieldKey) => {
    setUserRules(p => {
      const cur = p[userId].fields;
      return { ...p, [userId]: { ...p[userId], fields: cur.includes(fieldKey) ? cur.filter(f => f !== fieldKey) : [...cur, fieldKey] } };
    });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => { setSaved(false); onClose(); }, 1200); }, 900);
  };

  const VIEWS = [
    { id: "roles",   label: "By Role",   icon: Shield    },
    { id: "users",   label: "By User",   icon: Users     },
    { id: "preview", label: "Preview",   icon: Eye       },
  ];

  return (
    <FullscreenOverlay onClose={onClose} wide>
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
              <EyeOff size={18} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Data Masking Control</h2>
              <p className="text-xs text-gray-400 mt-0.5">Control which fields are hidden from each role or user</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 mt-4 sm:mt-5 bg-gray-100 dark:bg-white/[0.04] rounded-xl p-1 w-full sm:w-fit">
          {VIEWS.map(v => {
            const Ic = v.icon;
            return (
              <button key={v.id} onClick={() => setActiveView(v.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeView === v.id ? "bg-white dark:bg-white/10 text-gray-900 dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>
                <Ic size={12} />{v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-5 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

            {/* BY ROLE */}
            {activeView === "roles" && (
              <div className="space-y-4">
                {ROLES.map(role => {
                  const rule   = roleRules[role.id] || { enabled: false, fields: [] };
                  const colors = getRoleColors(role.id);
                  const Icon   = role.icon;
                  return (
                    <div key={role.id} className={`rounded-2xl border transition-all ${rule.enabled ? "border-orange-200 dark:border-orange-800/40 bg-orange-50/40 dark:bg-orange-950/10" : "border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-white/[0.01]"}`}>
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className={`p-2 rounded-xl ${colors.bg}`}>
                          <Icon size={14} className={colors.text} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{role.label}</p>
                          <p className="text-[11px] text-gray-400">{role.desc}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {rule.enabled && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold">{rule.fields.length === 0 ? "All fields" : `${rule.fields.length} field(s)`}</span>}
                          <PermToggle checked={rule.enabled} onChange={() => toggleRoleEnabled(role.id)} />
                        </div>
                      </div>
                      <AnimatePresence>
                        {rule.enabled && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                            <div className="border-t border-orange-100 dark:border-orange-900/20 px-5 py-4">
                              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-semibold">Select fields to mask</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {MASKABLE_FIELDS.map(f => {
                                  const Ic      = f.icon;
                                  const checked = rule.fields.length === 0 || rule.fields.includes(f.key);
                                  return (
                                    <button key={f.key} onClick={() => toggleRoleField(role.id, f.key)}
                                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${checked ? "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/30 text-orange-700 dark:text-orange-300" : "bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/[0.05] text-gray-500"}`}>
                                      <Ic size={11} />{f.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* BY USER */}
            {activeView === "users" && (
              <div className="space-y-3">
                {members.map(member => {
                  const rule = userRules[member.id] || { enabled: false, fields: [] };
                  return (
                    <div key={member.id} className={`rounded-2xl border transition-all ${rule.enabled ? "border-orange-200 dark:border-orange-800/40 bg-orange-50/40 dark:bg-orange-950/10" : "border-gray-100 dark:border-white/[0.05]"}`}>
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarGrad(member.name)} flex items-center justify-center shrink-0`}>
                          <span className="text-xs font-bold text-white">{initials(member.name)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{member.name}</p>
                          <div className="flex items-center gap-2 mt-0.5"><RoleBadge roleId={member.role} size="xs" /></div>
                        </div>
                        <PermToggle checked={rule.enabled} onChange={() => toggleUserEnabled(member.id)} />
                      </div>
                      <AnimatePresence>
                        {rule.enabled && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                            <div className="border-t border-orange-100 dark:border-orange-900/20 px-5 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {MASKABLE_FIELDS.map(f => {
                                  const Ic = f.icon;
                                  const checked = rule.fields.includes(f.key);
                                  return (
                                    <button key={f.key} onClick={() => toggleUserField(member.id, f.key)}
                                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${checked ? "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/30 text-orange-700 dark:text-orange-300" : "bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/[0.05] text-gray-500"}`}>
                                      <Ic size={11} />{f.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PREVIEW */}
            {activeView === "preview" && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                  <p className="text-xs text-gray-500 mb-1">Masked output example:</p>
                  <div className="space-y-2 mt-3">
                    {[
                      { label: "Customer Name", masked: "R*** K***",         original: "Rahul Kumar"       },
                      { label: "Phone",         masked: "+91 XXXXX 10987",   original: "+91 98765 10987"  },
                      { label: "Email",         masked: "r***@gmail.com",    original: "rahul@gmail.com"  },
                      { label: "Revenue",       masked: "₹X,XX,XXX",        original: "₹4,50,000"        },
                      { label: "Address",       masked: "*****, Mumbai",     original: "42 Carter Rd, Mumbai" },
                    ].map(({ label, masked, original }) => (
                      <div key={label} className="flex items-center gap-4 text-xs">
                        <span className="w-16 sm:w-28 text-gray-400 shrink-0 text-[10px] sm:text-xs">{label}</span>
                        <span className="font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded">{masked}</span>
                        <span className="text-gray-300 dark:text-gray-600">→ was: {original}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 sm:px-8 py-4 sm:py-5 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1117] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <p className="text-xs text-gray-400 hidden sm:block">Masking applies to all data views for the selected roles/users.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || saved}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-orange-500/20 disabled:opacity-70 flex items-center gap-2 transition-all"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <EyeOff size={14} />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Masking Rules"}
          </button>
        </div>
      </div>
    </FullscreenOverlay>
  );
}

/* ===============================================================
   ROLE PRESET OVERLAY — manage role presets
=============================================================== */
function RolePresetOverlay({ onClose, defaultCreating = false }) {
  const [presets,         setPresets]         = useState(ROLE_PRESETS);
  const [selected,        setSelected]        = useState(null);       // id — permissions view
  const [editingInfo,     setEditingInfo]     = useState(null);       // { id, label, desc } — name/desc edit
  const [creating,        setCreating]        = useState(defaultCreating);
  const [newPreset,       setNewPreset]       = useState({ label: "", base: "staff", desc: "" });
  const [deleteConfirm,   setDeleteConfirm]   = useState(null);       // id pending deletion
  const [perms,           setPerms]           = useState({});
  const [saved,           setSaved]           = useState(false);
  // Premium permissions panel state (mirrors PermissionsOverlay)
  const [presetExpanded,    setPresetExpanded]    = useState({});
  const [presetPermSearch,  setPresetPermSearch]  = useState("");
  const [presetPermGroup,   setPresetPermGroup]   = useState("all");

  /* ── helpers ── */
  const openPermissions = (preset) => {
    setSelected(preset.id);
    setEditingInfo(null);
    setCreating(false);
    setPerms(buildDefaultPerms(preset.base));
  };

  const openEditInfo = (e, preset) => {
    e.stopPropagation();
    setEditingInfo({ id: preset.id, label: preset.label, desc: preset.desc || "" });
    setSelected(preset.id);
    setCreating(false);
    setPerms(buildDefaultPerms(preset.base));
  };

  const startCreate = () => {
    setCreating(true);
    setSelected(null);
    setEditingInfo(null);
    setNewPreset({ label: "", base: "staff", desc: "" });
  };

  const handleDuplicate = (preset) => {
    const dup = { ...preset, id: `custom_${Date.now()}`, label: `${preset.label} (Copy)`, builtin: false, custom: true };
    setPresets(p => [...p, dup]);
  };

  const confirmDelete = (e, id) => {
    e.stopPropagation();
    setDeleteConfirm(id);
  };

  const handleDelete = (id) => {
    setPresets(p => p.filter(x => x.id !== id));
    if (selected === id)      setSelected(null);
    if (editingInfo?.id === id) setEditingInfo(null);
    setDeleteConfirm(null);
  };

  const handleSaveInfo = () => {
    if (!editingInfo || !editingInfo.label.trim()) return;
    setPresets(p => p.map(x => x.id === editingInfo.id ? { ...x, label: editingInfo.label, desc: editingInfo.desc } : x));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    setEditingInfo(null);
  };

  const handleSavePerms = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleCreate = () => {
    if (!newPreset.label.trim()) return;
    const id = `custom_${Date.now()}`;
    setPresets(p => [...p, { id, label: newPreset.label, base: newPreset.base, desc: newPreset.desc, custom: true, builtin: false }]);
    setCreating(false);
    setSelected(id);
    setPerms(buildDefaultPerms(newPreset.base));
  };

  const activeId = editingInfo?.id ?? selected;

  return (
    <FullscreenOverlay onClose={onClose} wide>
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ShieldCheck size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Role Presets</h2>
              <p className="text-xs text-gray-400">{presets.length} presets · {presets.filter(p => p.custom).length} custom</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={startCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md"
              style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
              <Plus size={14} /> New Preset
            </button>
            <button onClick={onClose} className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Split: presets list | right panel */}
      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">

        {/* ── LEFT: preset list ── */}
        <div className="w-full sm:w-64 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-white/[0.06] overflow-y-auto py-3 sm:py-4 px-3 max-h-44 sm:max-h-none">
          {presets.map(preset => {
            const isActive  = activeId === preset.id;
            const isDeleting = deleteConfirm === preset.id;
            const colors    = getRoleColors(preset.base);
            return (
              <div key={preset.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-0.5 ${isActive ? "bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40" : "hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent"}`}
                onClick={() => !isDeleting && openPermissions(preset)}>
                <div className={`p-1.5 rounded-lg ${colors.bg} shrink-0`}>
                  <Shield size={12} className={colors.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{preset.label}</p>
                    {preset.custom && <span className="text-[8px] px-1 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 font-bold shrink-0">Custom</span>}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{preset.desc}</p>
                </div>

                {/* Delete confirmation inline */}
                {isDeleting ? (
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <span className="text-[9px] text-rose-500 font-semibold">Delete?</span>
                    <button onClick={() => handleDelete(preset.id)}
                      className="p-1 rounded text-[9px] font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors">Yes</button>
                    <button onClick={e => { e.stopPropagation(); setDeleteConfirm(null); }}
                      className="p-1 rounded text-[9px] font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors">No</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => openEditInfo(e, preset)}
                      title="Edit name & description"
                      className="p-1 rounded-md text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                      <Edit2 size={11} />
                    </button>
                    <button onClick={(e) => confirmDelete(e, preset.id)}
                      className="p-1 rounded-md text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── RIGHT: content + fixed footer ── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* ── Empty state ── */}
          {!creating && !editingInfo && !selected && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShieldCheck size={32} className="text-gray-200 dark:text-gray-700 mb-4" />
              <p className="text-sm font-medium text-gray-500">Select a preset to view permissions</p>
              <p className="text-xs text-gray-400 mt-1">or create a new custom preset</p>
            </div>
          )}

          {/* ── CREATE mode ── */}
          {creating && (
            <>
              <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-5 sm:py-6 space-y-8">

                {/* Section: Preset Details */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20"
                      style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
                      <FileText size={14} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Preset Details</h3>
                      <p className="text-[11px] text-gray-400">Name and describe this role preset</p>
                    </div>
                  </div>
                  <div className="max-w-lg space-y-4">
                    {[
                      { label: "Preset Name *", key: "label", placeholder: "e.g. Senior Manager" },
                      { label: "Description",   key: "desc",  placeholder: "Brief description of this role" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                        <input type="text" value={newPreset[key]}
                          onChange={e => setNewPreset(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-600 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Base Role */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                      <Shield size={14} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Base Role</h3>
                      <p className="text-[11px] text-gray-400">Permissions auto-loaded from this role — customize after creating</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                    {ROLES.filter(r => r.id !== "owner").map(r => {
                      const Ic  = r.icon;
                      const c   = getRoleColors(r.id);
                      const sel = newPreset.base === r.id;
                      return (
                        <button key={r.id} onClick={() => setNewPreset(p => ({ ...p, base: r.id }))}
                          className={`flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all ${sel ? "border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 dark:border-violet-700" : "border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/10 bg-gray-50/30 dark:bg-white/[0.02]"}`}>
                          <span className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
                            <Ic size={16} className={c.text} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${sel ? "text-violet-700 dark:text-violet-300" : "text-gray-800 dark:text-gray-200"}`}>{r.label}</p>
                            <p className="text-[11px] text-gray-400">{r.desc}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-white/[0.06] max-w-[80px]">
                                <div className={`h-1 rounded-full ${c.dot}`} style={{ width: `${r.level}%` }} />
                              </div>
                              <span className="text-[10px] text-gray-400">{r.level}%</span>
                            </div>
                          </div>
                          {sel && <CheckCircle2 size={16} className="text-violet-600 dark:text-violet-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Permission Preview */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                      <Lock size={14} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Permission Preview</h3>
                      <p className="text-[11px] text-gray-400">
                        Inherited from <strong className="text-gray-600 dark:text-gray-300">{getRoleObj(newPreset.base).label}</strong> — fully editable after creating
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 max-w-2xl">
                    {PERMISSION_MODULES.map(mod => {
                      const Icon     = mod.icon;
                      const modPerms = buildDefaultPerms(newPreset.base)[mod.key] || [];
                      return (
                        <div key={mod.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/40 dark:bg-white/[0.02]">
                          <Icon size={13} className={modPerms.length > 0 ? "text-violet-500 dark:text-violet-400" : "text-gray-300 dark:text-gray-600"} />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1">{mod.label}</span>
                          {modPerms.length > 0
                            ? <div className="flex flex-wrap gap-1">{modPerms.map(a => <span key={a} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium">{ACTION_LABELS[a]}</span>)}</div>
                            : <span className="text-[10px] text-gray-300 dark:text-gray-600">No access</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
              {/* Fixed footer */}
              <div className="shrink-0 px-4 sm:px-8 py-4 sm:py-5 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1117] flex gap-3">
                <button onClick={() => setCreating(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={!newPreset.label.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-violet-500/20"
                  style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
                  <Plus size={14} /> Create Preset
                </button>
              </div>
            </>
          )}

          {/* ── EDIT INFO mode (name + description only) ── */}
          {editingInfo && !creating && (
            <>
              <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-5 sm:py-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Edit2 size={14} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Edit Role Info</h3>
                    <p className="text-[11px] text-gray-400">Update the name and description for this preset</p>
                  </div>
                </div>
                <div className="max-w-lg space-y-4">
                  {[
                    { label: "Role Name *", key: "label", placeholder: "e.g. Senior Manager" },
                    { label: "Description", key: "desc",  placeholder: "Brief description of this role" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                      <input type="text" value={editingInfo[key]}
                        onChange={e => setEditingInfo(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-600 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Fixed footer */}
              <div className="shrink-0 px-4 sm:px-8 py-4 sm:py-5 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1117] flex gap-3">
                <button onClick={() => setEditingInfo(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveInfo} disabled={!editingInfo.label.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-violet-500/20"
                  style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
                  {saved ? <><Check size={14} /> Saved!</> : <><Check size={14} /> Save Changes</>}
                </button>
              </div>
            </>
          )}

          {/* ── PERMISSIONS view (click row in list) — premium accordion matching PermissionsOverlay ── */}
          {selected && !editingInfo && !creating && (() => {
            const preset = presets.find(p => p.id === selected);
            if (!preset) return null;

            const grantedCount = Object.values(perms).reduce((s, a) => s + a.length, 0);
            const totalActions = PERMISSION_MODULES.reduce((s, m) => s + m.actions.length, 0);
            const groups       = ["all", "core", "analytics", "config"];

            const filteredPresetMods = PERMISSION_MODULES.filter(m => {
              const matchSearch = m.label.toLowerCase().includes(presetPermSearch.toLowerCase());
              const matchGroup  = presetPermGroup === "all" || m.group === presetPermGroup;
              return matchSearch && matchGroup;
            });

            const togglePresetAction = (modKey, action) => {
              setPerms(prev => {
                const cur = prev[modKey] || [];
                return { ...prev, [modKey]: cur.includes(action) ? cur.filter(a => a !== action) : [...cur, action] };
              });
            };

            const togglePresetAllMod = (modKey, actions) => {
              const cur = perms[modKey] || [];
              const all = actions.every(a => cur.includes(a));
              setPerms(prev => ({ ...prev, [modKey]: all ? [] : [...actions] }));
            };

            return (
              <>
                {/* Sub-header: preset name + duplicate + preset-load + search */}
                <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.015] space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{preset.label}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{preset.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400 hidden sm:inline">{grantedCount}/{totalActions} granted</span>
                      <button onClick={() => handleDuplicate(preset)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 transition-colors">
                        <FlipHorizontal size={12} /> Duplicate
                      </button>
                    </div>
                  </div>
                  {/* Preset quick-load + search */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex gap-1.5 flex-wrap overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                      <span className="text-xs text-gray-400 font-medium self-center mr-1 shrink-0">Load:</span>
                      {ROLES.filter(r => r.id !== "owner").map(r => {
                        const c = getRoleColors(r.id);
                        return (
                          <button key={r.id} onClick={() => setPerms(buildDefaultPerms(r.id))}
                            className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold border border-transparent transition-all hover:border-current ${c.bg} ${c.text}`}>
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="relative sm:ml-auto">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={presetPermSearch} onChange={e => setPresetPermSearch(e.target.value)} placeholder="Search modules…"
                        className="w-full sm:w-44 pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                    </div>
                  </div>
                </div>

                {/* Split: group nav | module cards */}
                <div className="flex flex-1 overflow-hidden min-h-0">
                  {/* Left — group nav (desktop only) */}
                  <div className="hidden sm:flex sm:flex-col w-44 shrink-0 border-r border-gray-100 dark:border-white/[0.06] py-5 px-3 space-y-1 bg-gray-50/50 dark:bg-white/[0.015]">
                    {groups.map(g => (
                      <button key={g} onClick={() => setPresetPermGroup(g)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${presetPermGroup === g ? "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300" : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5"}`}>
                        {g}
                        <span className="ml-1.5 text-[9px] font-normal opacity-60">
                          ({g === "all" ? PERMISSION_MODULES.length : PERMISSION_MODULES.filter(m => m.group === g).length})
                        </span>
                      </button>
                    ))}
                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 px-2 mb-2">Summary</p>
                      <div className="px-2">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>Granted</span><span className="font-semibold text-violet-600 dark:text-violet-400">{grantedCount}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/5">
                          <div className="h-1.5 rounded-full bg-violet-500 transition-all" style={{ width: `${Math.round(grantedCount / totalActions * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right — accordion cards */}
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {/* Mobile group filter */}
                    <div className="sm:hidden flex gap-1.5 overflow-x-auto px-4 pt-3 pb-2 shrink-0" style={{ scrollbarWidth: "none" }}>
                      {groups.map(g => (
                        <button key={g} onClick={() => setPresetPermGroup(g)}
                          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${presetPermGroup === g ? "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300" : "bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400"}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4 sm:py-5 space-y-3">
                      {filteredPresetMods.map(mod => (
                        <PermissionModuleCard
                          key={mod.key}
                          mod={mod}
                          perms={perms}
                          onToggleAction={togglePresetAction}
                          onToggleAll={togglePresetAllMod}
                          expanded={presetExpanded[mod.key] !== false}
                          onToggleExpand={(key) => setPresetExpanded(p => ({ ...p, [key]: !p[key] }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fixed footer */}
                <div className="shrink-0 px-4 sm:px-8 py-4 sm:py-5 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1117] flex gap-3">
                  <button onClick={() => { setSelected(null); setPerms({}); setPresetPermSearch(""); setPresetPermGroup("all"); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    Discard
                  </button>
                  <button onClick={handleSavePerms}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-violet-500/20"
                    style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
                    {saved ? <><Check size={14} /> Saved!</> : <><Shield size={14} /> Save Changes</>}
                  </button>
                </div>
              </>
            );
          })()}

        </div>{/* end right panel */}
      </div>
    </FullscreenOverlay>
  );
}


/* ===============================================================
   ADD MEMBER OVERLAY — full-screen immersive (renamed from Invite)
=============================================================== */
const ADD_STEPS = [
  { id: 1, label: "Basic Info",   icon: Users     },
  { id: 2, label: "Role",         icon: Shield    },
  { id: 3, label: "Venue Access", icon: Building2 },
  { id: 4, label: "Permissions",  icon: Lock      },
  { id: 5, label: "Review",       icon: CheckCheck},
];

function AddMemberOverlay({ onClose }) {
  const [step,    setStep]    = useState(1);
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", contactMethod: "email",
    role: "staff", venues: [], venueAccess: "selected",
    permissions: buildDefaultPerms("staff"),
    loginAccess: true,
  });
  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const canNext = useMemo(() => {
    if (step === 1) return form.name.trim() && (form.email.trim() || form.phone.trim());
    if (step === 2) return !!form.role;
    if (step === 3) return form.venueAccess === "all" || form.venues.length > 0;
    return true;
  }, [step, form]);

  const handleAdd = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setDone(true); setTimeout(onClose, 2000); }, 1400);
  };

  return (
    <FullscreenOverlay onClose={onClose} wide>
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-8 pt-5 sm:pt-7 pb-0 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0" style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
              <UserPlus size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Add Team Member</h2>
              <p className="text-xs text-gray-400">Step {step} of {ADD_STEPS.length} — {ADD_STEPS[step - 1].label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-4 sm:mb-6">
          {ADD_STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center" style={{ flex: i < ADD_STEPS.length - 1 ? "1" : "none" }}>
              <div className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold shrink-0 transition-all ${step > s.id ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30" : step === s.id ? "text-white shadow-md" : "bg-gray-100 dark:bg-white/[0.06] text-gray-400"}`}
                style={step === s.id ? { background: "linear-gradient(242deg, #a44bf3, #499ce8)" } : {}}>
                {step > s.id ? <Check size={10} strokeWidth={3} /> : s.id}
              </div>
              {i < ADD_STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-1.5 sm:mx-3 transition-all duration-500 ${step > s.id ? "bg-emerald-400 dark:bg-emerald-600" : "bg-gray-100 dark:bg-white/[0.06]"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-5 sm:py-7">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>

              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="max-w-lg space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Member Details</h3>
                    <p className="text-sm text-gray-400">Enter the member's contact information.</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Full Name *",    key: "name",  type: "text",  placeholder: "e.g. Priya Sharma"  },
                      { label: "Email Address",  key: "email", type: "email", placeholder: "priya@company.com"  },
                      { label: "Phone Number",   key: "phone", type: "tel",   placeholder: "+91 98765 43210"    },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                        <input type={type} value={form[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder}
                          className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-600 transition-all" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Contact method</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ id: "email", label: "Email", icon: Mail }, { id: "whatsapp", label: "WhatsApp", icon: Send }, { id: "phone", label: "SMS", icon: Phone }].map(({ id, label, icon: Ic }) => (
                        <button key={id} onClick={() => update("contactMethod", id)}
                          className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-sm font-medium transition-all ${form.contactMethod === id ? "border-violet-400 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300" : "border-gray-100 dark:border-white/[0.06] text-gray-500 hover:border-gray-200 bg-gray-50/40 dark:bg-white/[0.02]"}`}>
                          <Ic size={17} />{label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/40 dark:bg-white/[0.02]">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Login Access</p>
                      <p className="text-xs text-gray-400 mt-0.5">Allow this member to log in to the platform</p>
                    </div>
                    <PermToggle checked={form.loginAccess} onChange={() => update("loginAccess", !form.loginAccess)} />
                  </div>
                </div>
              )}

              {/* STEP 2: Role */}
              {step === 2 && (
                <div className="max-w-2xl">
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Assign Role</h3>
                    <p className="text-sm text-gray-400">Choose a role that matches this member's responsibilities.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ROLES.filter(r => r.id !== "owner").map(role => {
                      const Ic       = role.icon;
                      const colors   = getRoleColors(role.id);
                      const selected = form.role === role.id;
                      return (
                        <button key={role.id} onClick={() => { update("role", role.id); update("permissions", buildDefaultPerms(role.id)); }}
                          className={`flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all ${selected ? "border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 dark:border-violet-700" : "border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/10 bg-gray-50/30 dark:bg-white/[0.02]"}`}>
                          <span className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                            <Ic size={16} className={colors.text} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-sm font-bold ${selected ? "text-violet-700 dark:text-violet-300" : "text-gray-800 dark:text-gray-200"}`}>{role.label}</span>
                            </div>
                            <p className="text-[11px] text-gray-400">{role.desc}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-white/[0.06] max-w-[100px]">
                                <div className={`h-1 rounded-full ${colors.dot} transition-all`} style={{ width: `${role.level}%` }} />
                              </div>
                              <span className="text-[10px] text-gray-400">{role.level}%</span>
                            </div>
                          </div>
                          {selected && <CheckCircle2 size={16} className="text-violet-600 dark:text-violet-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Venue Access */}
              {step === 3 && (
                <div className="max-w-xl space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Venue Access</h3>
                    <p className="text-sm text-gray-400">Choose which venues this member can access.</p>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                    {[
                      { id: "all",      label: "All Venues",  icon: Globe,     desc: "Unrestricted" },
                      { id: "selected", label: "Select",      icon: Building2, desc: "Specific venues" },
                      { id: "category", label: "By Category", icon: Layers,    desc: "Category-based" },
                    ].map(({ id, label, icon: Ic, desc }) => (
                      <button key={id} onClick={() => update("venueAccess", id)}
                        className={`flex flex-col items-center gap-2 py-5 px-3 rounded-2xl border text-center transition-all ${form.venueAccess === id ? "border-violet-400 bg-violet-50 dark:bg-violet-950/20 dark:border-violet-700" : "border-gray-100 dark:border-white/[0.06] hover:border-gray-200 bg-gray-50/30 dark:bg-white/[0.02]"}`}>
                        <Ic size={18} className={form.venueAccess === id ? "text-violet-600 dark:text-violet-400" : "text-gray-400"} />
                        <span className={`text-sm font-bold ${form.venueAccess === id ? "text-violet-700 dark:text-violet-300" : "text-gray-700 dark:text-gray-300"}`}>{label}</span>
                        <span className="text-[11px] text-gray-400">{desc}</span>
                      </button>
                    ))}
                  </div>
                  {form.venueAccess === "selected" && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Select venues</p>
                      {VENUES.map(v => (
                        <label key={v} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/10 cursor-pointer transition-all bg-gray-50/30 dark:bg-white/[0.01]">
                          <div onClick={() => update("venues", form.venues.includes(v) ? form.venues.filter(x => x !== v) : [...form.venues, v])}
                            className={`flex-shrink-0 h-5 w-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${form.venues.includes(v) ? "bg-violet-600 border-violet-600" : "border-gray-200 dark:border-white/20"}`}>
                            {form.venues.includes(v) && <Check size={11} className="text-white" strokeWidth={3} />}
                          </div>
                          <Building2 size={14} className="text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{v}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Permissions */}
              {step === 4 && (
                <div className="max-w-2xl">
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Permission Overrides</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Info size={12} className="text-violet-500 shrink-0" />
                      <p className="text-xs text-violet-700 dark:text-violet-300">
                        Pre-filled from <strong>{getRoleObj(form.role).label}</strong> defaults. Customize below.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {PERMISSION_MODULES.map(mod => {
                      const Icon     = mod.icon;
                      const modPerms = form.permissions[mod.key] || [];
                      return (
                        <div key={mod.key} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] overflow-hidden">
                          <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50/60 dark:bg-white/[0.025]">
                            <Icon size={13} className={modPerms.length > 0 ? "text-violet-500" : "text-gray-400"} />
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1">{mod.label}</span>
                            <span className="text-[10px] text-gray-400">{modPerms.length}/{mod.actions.length}</span>
                          </div>
                          <div className="px-5 py-3 flex flex-wrap gap-2">
                            {mod.actions.map(action => {
                              const checked = modPerms.includes(action);
                              return (
                                <button key={action} onClick={() => {
                                  const cur = form.permissions[mod.key] || [];
                                  update("permissions", { ...form.permissions, [mod.key]: checked ? cur.filter(a => a !== action) : [...cur, action] });
                                }}
                                  className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${checked ? "bg-violet-600 text-white border-violet-600 shadow-sm" : "bg-white dark:bg-white/[0.02] text-gray-400 border-gray-100 dark:border-white/[0.06] hover:border-gray-300"}`}>
                                  {ACTION_LABELS[action]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: Review */}
              {step === 5 && (
                <div className="max-w-xl">
                  {done ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-16">
                      <div className="h-20 w-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={36} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Member Added!</p>
                      <p className="text-sm text-gray-500 text-center">
                        <strong>{form.name}</strong> has been added to your team and notified via {form.contactMethod}.
                      </p>
                    </motion.div>
                  ) : (
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5">Review & Confirm</h3>
                      <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
                        <div className={`h-1 bg-gradient-to-r ${avatarGrad(form.name)}`} />
                        <div className="p-5 flex items-center gap-4 border-b border-gray-50 dark:border-white/[0.04]">
                          <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${avatarGrad(form.name)} flex items-center justify-center shadow-md shrink-0`}>
                            <span className="text-base font-bold text-white">{initials(form.name || "?")}</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-base">{form.name || "—"}</p>
                            <p className="text-sm text-gray-400">{form.email || form.phone || "—"}</p>
                            <div className="mt-1.5 flex gap-2"><RoleBadge roleId={form.role} size="xs" /></div>
                          </div>
                        </div>
                        <div className="px-5 py-4 grid grid-cols-2 gap-4 text-sm">
                          {[
                            { label: "Contact method", value: form.contactMethod.charAt(0).toUpperCase() + form.contactMethod.slice(1) },
                            { label: "Venue access",   value: form.venueAccess === "all" ? "All venues" : `${form.venues.length} venue(s)` },
                            { label: "Modules",        value: `${Object.values(form.permissions).filter(a => a.length > 0).length}/${PERMISSION_MODULES.length} with access` },
                            { label: "Login access",   value: form.loginAccess ? "Enabled" : "Disabled" },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                              <p className="font-semibold text-gray-700 dark:text-gray-300">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right sidebar — step info */}
        {step <= 4 && (
          <div className="hidden lg:flex w-64 shrink-0 border-l border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.015] flex-col py-7 px-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-4">Steps</p>
            {ADD_STEPS.map(s => {
              const Ic = s.icon;
              const done2 = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl mb-1 transition-all ${active ? "bg-violet-50 dark:bg-violet-950/30" : ""}`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${done2 ? "bg-emerald-500 text-white" : active ? "text-white" : "bg-gray-100 dark:bg-white/[0.05] text-gray-400"}`}
                    style={active ? { background: "linear-gradient(242deg, #a44bf3, #499ce8)" } : {}}>
                    {done2 ? <Check size={11} strokeWidth={3} /> : <Ic size={12} />}
                  </div>
                  <span className={`text-xs font-semibold ${active ? "text-violet-700 dark:text-violet-300" : done2 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!done && (
        <div className="shrink-0 px-4 sm:px-8 py-4 sm:py-5 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1117] flex items-center justify-between gap-3 sm:gap-4">
          <button onClick={step > 1 ? () => setStep(p => p - 1) : onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <ChevronLeft size={14} />
            {step > 1 ? "Back" : "Cancel"}
          </button>
          {step < ADD_STEPS.length ? (
            <button onClick={() => setStep(p => p + 1)} disabled={!canNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-violet-500/20 disabled:opacity-40 transition-all hover:shadow-lg"
              style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={handleAdd} disabled={sending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-violet-500/20 disabled:opacity-70 transition-all hover:shadow-lg"
              style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
              {sending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {sending ? "Adding…" : "Add Member"}
            </button>
          )}
        </div>
      )}
    </FullscreenOverlay>
  );
}

/* ===============================================================
   EDIT MEMBER OVERLAY — full-screen edit workflow
=============================================================== */
function EditMemberOverlay({ member: initialMember, onClose, onSave }) {
  const [form, setForm] = useState({
    name:         initialMember.name,
    email:        initialMember.email,
    phone:        initialMember.phone,
    role:         initialMember.role,
    status:       initialMember.status,
    venues:       [...initialMember.venues],
    venueAccess:  initialMember.venues.length === VENUES.length ? "all" : "selected",
    loginAccess:  initialMember.loginAccess,
    masked:       initialMember.masked,
    maskedFields: [...(initialMember.maskedFields || [])],
  });
  const update  = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [activeSection, setActiveSection] = useState("details");

  const SECTIONS = [
    { id: "details",     label: "Details",      icon: Users    },
    { id: "role",        label: "Role",         icon: Shield   },
    { id: "venues",      label: "Venues",       icon: Building2 },
    { id: "access",      label: "Access",       icon: Lock     },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false); setSaved(true);
      onSave({ ...initialMember, ...form });
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    }, 900);
  };

  return (
    <FullscreenOverlay onClose={onClose}>
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-8 pt-5 sm:pt-7 pb-0 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-br ${avatarGrad(initialMember.name)} flex items-center justify-center shrink-0 shadow-md`}>
              <span className="text-sm font-bold text-white">{initials(initialMember.name)}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Edit Member — {initialMember.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <RoleBadge roleId={initialMember.role} size="xs" />
                <StatusBadge status={initialMember.status} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {SECTIONS.map(s => {
            const Ic = s.icon;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${activeSection === s.id ? "text-violet-700 dark:text-violet-300 border-violet-500" : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700"}`}>
                <Ic size={13} />{s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-5 sm:py-7">
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

            {/* DETAILS */}
            {activeSection === "details" && (
              <div className="max-w-lg space-y-5">
                {[
                  { label: "Full Name",     key: "name",  type: "text"  },
                  { label: "Email Address", key: "email", type: "email" },
                  { label: "Phone Number",  key: "phone", type: "tel"   },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                    <input type={type} value={form[key]} onChange={e => update(key, e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Status</label>
                  <div className="flex gap-2">
                    {["active","suspended","pending"].map(s => (
                      <button key={s} onClick={() => update("status", s)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${form.status === s ? "border-violet-400 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300" : "border-gray-100 dark:border-white/[0.06] text-gray-500 hover:border-gray-200"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ROLE */}
            {activeSection === "role" && (
              <div className="max-w-2xl">
                <p className="text-sm text-gray-400 mb-5">Change the member's system role. Permissions will update accordingly.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ROLES.filter(r => r.id !== "owner").map(role => {
                    const Ic = role.icon; const c = getRoleColors(role.id); const sel = form.role === role.id;
                    return (
                      <button key={role.id} onClick={() => update("role", role.id)}
                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all ${sel ? "border-violet-400 bg-violet-50 dark:bg-violet-950/20 dark:border-violet-700" : "border-gray-100 dark:border-white/[0.06] hover:border-gray-200 bg-gray-50/30 dark:bg-white/[0.02]"}`}>
                        <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}><Ic size={15} className={c.text} /></span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${sel ? "text-violet-700 dark:text-violet-300" : "text-gray-800 dark:text-gray-200"}`}>{role.label}</p>
                          <p className="text-[11px] text-gray-400">{role.desc}</p>
                        </div>
                        {sel && <CheckCircle2 size={15} className="text-violet-600 dark:text-violet-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VENUES */}
            {activeSection === "venues" && (
              <div className="max-w-xl space-y-4">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[{ id: "all", label: "All Venues", icon: Globe }, { id: "selected", label: "Selected", icon: Building2 }].map(({ id, label, icon: Ic }) => (
                    <button key={id} onClick={() => update("venueAccess", id)}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${form.venueAccess === id ? "border-violet-400 bg-violet-50 dark:bg-violet-950/20" : "border-gray-100 dark:border-white/[0.06] bg-gray-50/30"}`}>
                      <Ic size={16} className={form.venueAccess === id ? "text-violet-600" : "text-gray-400"} />
                      <span className={`text-sm font-semibold ${form.venueAccess === id ? "text-violet-700 dark:text-violet-300" : "text-gray-700 dark:text-gray-300"}`}>{label}</span>
                    </button>
                  ))}
                </div>
                {form.venueAccess === "selected" && VENUES.map(v => (
                  <label key={v} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100 dark:border-white/[0.06] hover:border-gray-200 cursor-pointer transition-all">
                    <div onClick={() => update("venues", form.venues.includes(v) ? form.venues.filter(x => x !== v) : [...form.venues, v])}
                      className={`flex-shrink-0 h-5 w-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${form.venues.includes(v) ? "bg-violet-600 border-violet-600" : "border-gray-200 dark:border-white/20"}`}>
                      {form.venues.includes(v) && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                    <Building2 size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{v}</span>
                  </label>
                ))}
              </div>
            )}

            {/* ACCESS */}
            {activeSection === "access" && (
              <div className="max-w-lg space-y-4">
                {[
                  { key: "loginAccess", label: "Login Access", desc: "Allow this member to log in to the dashboard" },
                  { key: "masked",      label: "Data Masking",  desc: "Mask sensitive fields from this member's view" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/40 dark:bg-white/[0.02]">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <PermToggle checked={!!form[key]} onChange={() => update(key, !form[key])} />
                  </div>
                ))}

                <div className="p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-950/10 space-y-3">
                  <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">Danger Zone</p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-colors">
                      <Key size={12} /> Reset Password
                    </button>
                    <button onClick={() => { update("status", "suspended"); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-colors">
                      <Ban size={12} /> Suspend Access
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 sm:px-8 py-4 sm:py-5 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1117] flex items-center justify-between gap-3 sm:gap-4">
        <button onClick={onClose} className="px-4 sm:px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving || saved}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-violet-500/20 disabled:opacity-70 flex items-center gap-2 transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Check size={14} />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </FullscreenOverlay>
  );
}

/* ===============================================================
   TABS CONFIG
=============================================================== */
const TABS_CONFIG = [
  { id: "all",       label: "All",             filter: () => true },
  { id: "admins",    label: "Admins",          filter: m => ["owner","admin"].includes(m.role) },
  { id: "managers",  label: "Managers",        filter: m => ["manager","operations","sales","finance"].includes(m.role) },
  { id: "staff",     label: "Staff",           filter: m => m.role === "staff" || m.role === "viewer" },
  { id: "suspended", label: "Suspended",       filter: m => m.status === "suspended" },
  { id: "pending",   label: "Pending",         filter: m => m.status === "pending" },
];

/* ===============================================================
   MAIN PAGE
=============================================================== */
export default function TeamManagementPage() {
  const [members,       setMembers]       = useState(MOCK_MEMBERS);
  const [activeTab,     setActiveTab]     = useState("all");
  const [viewMode,      setViewMode]      = useState("grid");
  const [search,        setSearch]        = useState("");
  const [roleFilter,    setRoleFilter]    = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [maskedFilter,  setMaskedFilter]  = useState(false);
  const [showFilters,   setShowFilters]   = useState(false);

  // overlays
  const [memberDrawer,   setMemberDrawer]   = useState(null);
  const [permOverlay,    setPermOverlay]    = useState(null);
  const [maskedOverlay,  setMaskedOverlay]  = useState(false);
  const [presetOverlay,       setPresetOverlay]       = useState(false);
  const [addOverlay,          setAddOverlay]          = useState(false);
  const [editOverlay,    setEditOverlay]    = useState(null);

  const filtered = useMemo(() => {
    const tabFilter = TABS_CONFIG.find(t => t.id === activeTab)?.filter || (() => true);
    return members.filter(m => {
      if (!tabFilter(m)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q) && !m.phone.includes(q)) return false;
      }
      if (roleFilter   && m.role   !== roleFilter)   return false;
      if (statusFilter && m.status !== statusFilter) return false;
      if (maskedFilter && !m.masked) return false;
      return true;
    });
  }, [members, activeTab, search, roleFilter, statusFilter, maskedFilter]);

  const stats = useMemo(() => ({
    total:       members.length,
    admins:      members.filter(m => ["owner","admin"].includes(m.role)).length,
    managers:    members.filter(m => ["manager","operations","sales","finance"].includes(m.role)).length,
    staff:       members.filter(m => m.role === "staff" || m.role === "viewer").length,
    activeToday: members.filter(m => m.isOnline || m.lastActive === "Just now" || m.lastActive.includes("min")).length,
    restricted:  members.filter(m => m.masked).length,
  }), [members]);

  const pendingCount = members.filter(m => m.status === "pending").length;

  const handleSuspend = useCallback((m) => {
    setMembers(prev => prev.map(x =>
      x.id === m.id ? { ...x, status: x.status === "suspended" ? "active" : "suspended" } : x
    ));
  }, []);

  const handleSaveMember = useCallback((updated) => {
    setMembers(prev => prev.map(x => x.id === updated.id ? updated : x));
  }, []);

  const openMemberDrawer = useCallback((m) => {
    setPermOverlay(null); setEditOverlay(null);
    setMemberDrawer(m);
  }, []);

  const openEdit = useCallback((m) => {
    setMemberDrawer(null);
    setEditOverlay(m);
  }, []);

  const openPermissions = useCallback((m) => {
    setMemberDrawer(null);
    setPermOverlay(m);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] mt-[-56px] md:mt-[-20px]">

      {/* ── OVERLAYS ── */}
      <AnimatePresence>
        {memberDrawer && (
          <MemberDrawer
            member={memberDrawer}
            members={members}
            onClose={() => setMemberDrawer(null)}
            onOpenEdit={openEdit}
            onOpenPermissions={openPermissions}
            onSuspend={handleSuspend}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {permOverlay && <PermissionsOverlay member={permOverlay} onClose={() => setPermOverlay(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {maskedOverlay && <MaskedDataOverlay members={members} onClose={() => setMaskedOverlay(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {presetOverlay && <RolePresetOverlay onClose={() => setPresetOverlay(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {addOverlay && <AddMemberOverlay onClose={() => setAddOverlay(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editOverlay && (
          <EditMemberOverlay
            member={editOverlay}
            onClose={() => setEditOverlay(null)}
            onSave={handleSaveMember}
          />
        )}
      </AnimatePresence>

      {/* ━━━━━━━━━━━━━━━━ PAGE BODY ━━━━━━━━━━━━━━━━ */}
      <div className="">

        {/* HEADER */}
        <div className="px-5 sm:px-6 lg:px-8 pt-8 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Team Management</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                <span className="font-semibold text-gray-600 dark:text-gray-300">{stats.total} members</span>
                {" · "}
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.activeToday} online</span>
                {pendingCount > 0 && <> · <span className="text-amber-600 dark:text-amber-400 font-semibold">{pendingCount} pending</span></>}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setMaskedOverlay(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                <EyeOff size={12} /> Masking
              </button>
              <button onClick={() => setPresetOverlay(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                <ShieldCheck size={12} /> Roles
              </button>
              <button onClick={() => setAddOverlay(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-px active:translate-y-0"
                style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}>
                <UserPlus size={14} /> Add Member
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="px-5 sm:px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total Members" value={stats.total}       icon={Users}       color="purple" trend="Workspace size" />
            <StatCard label="Admins"        value={stats.admins}      icon={ShieldCheck} color="amber"  trend="Full access"   />
            <StatCard label="Managers"      value={stats.managers}    icon={Briefcase}   color="blue"   trend="Ops & Sales"   />
            <StatCard label="Staff"         value={stats.staff}       icon={Users2}      color="green"  trend="Frontline"     />
            <StatCard label="Online Now"    value={stats.activeToday} icon={Zap}         color="green"  trend="Active users"  />
            <StatCard label="Restricted"    value={stats.restricted}  icon={EyeOff}      color="rose"   trend="Masked data"   />
          </div>
        </div>

        {/* TABS */}
        <div className="px-5 sm:px-6 lg:px-8 pt-5">
          <ScrollableTabBar
            tabs={TABS_CONFIG.map(tab => ({
              key:   tab.id,
              label: tab.label,
              count: members.filter(tab.filter).length,
            }))}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* SEARCH + CONTROLS */}
        <div className="px-5 sm:px-6 lg:px-8 pt-3 pb-5">
          {/* Mobile: [Search + Filter + Toggle] / sm+: [Search──────][Filter][Toggle] */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center flex-1 gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, or phone…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-white/[0.06] text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 dark:focus:border-violet-700 transition-all" />
              </div>
              {/* Mobile: Filter + Toggle inline with search */}
              <div className="flex items-center gap-2 shrink-0 sm:hidden">
                <button onClick={() => setShowFilters(p => !p)}
                  aria-label="Filters"
                  className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${showFilters ? "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300" : "bg-white dark:bg-gray-900/80 border-gray-100 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 shadow-sm hover:border-gray-200"}`}>
                  <Filter size={14} />
                  {(roleFilter || statusFilter || maskedFilter) && <span className="h-2 w-2 rounded-full bg-violet-500" />}
                </button>
                <div className="inline-flex items-center rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900/80 shadow-sm p-1 gap-0.5">
                  {[{ mode: "grid", icon: LayoutGrid }, { mode: "table", icon: List }].map(({ mode, icon: Ic }) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      className={`p-2 rounded-lg transition-colors ${viewMode === mode ? "bg-gray-100 dark:bg-white/[0.08] text-gray-800 dark:text-gray-200" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
                      <Ic size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* sm+: Filter + Toggle after search */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button onClick={() => setShowFilters(p => !p)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${showFilters ? "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300" : "bg-white dark:bg-gray-900/80 border-gray-100 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 shadow-sm hover:border-gray-200"}`}>
                <Filter size={14} />Filters
                {(roleFilter || statusFilter || maskedFilter) && <span className="h-2 w-2 rounded-full bg-violet-500" />}
              </button>
              <div className="inline-flex items-center rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900/80 shadow-sm p-1 gap-0.5">
                {[{ mode: "grid", icon: LayoutGrid }, { mode: "table", icon: List }].map(({ mode, icon: Ic }) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-lg transition-colors ${viewMode === mode ? "bg-gray-100 dark:bg-white/[0.08] text-gray-800 dark:text-gray-200" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
                    <Ic size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden mt-3">
                <div className="flex flex-wrap gap-2 pt-1">
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-white/[0.06] text-gray-700 dark:text-gray-300 focus:outline-none shadow-sm">
                    <option value="">All roles</option>
                    {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-white/[0.06] text-gray-700 dark:text-gray-300 focus:outline-none shadow-sm">
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                  <button onClick={() => setMaskedFilter(p => !p)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${maskedFilter ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300" : "bg-white dark:bg-gray-900/80 border-gray-100 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 shadow-sm"}`}>
                    <EyeOff size={11} /> Masked only
                  </button>
                  {(roleFilter || statusFilter || maskedFilter) && (
                    <button onClick={() => { setRoleFilter(""); setStatusFilter(""); setMaskedFilter(false); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                      <X size={10} /> Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MEMBERS LIST */}
        <div className="px-5 sm:px-6 lg:px-8 pb-28">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
                <Users size={22} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No members found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((m, i) => (
                <MemberCard key={m.id} member={m} index={i} onClick={openMemberDrawer} onSuspend={handleSuspend} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((m, i) => (
                <MemberRow key={m.id} member={m} index={i} onClick={openMemberDrawer} onSuspend={handleSuspend} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
