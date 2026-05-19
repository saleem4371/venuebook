"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Eye, Save, ChevronRight,
  Building2, MapPin, Clock, Upload, Globe,
  Youtube, ImageIcon, Video, Film,
  Sparkles, AlertTriangle, Lock, RefreshCw,
  Users, CalendarDays, Trophy, Maximize2,
  Check, ExternalLink, PlayCircle,
  CheckCircle2, AlertCircle, Edit3, X,
  TrendingUp, Star, Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useVendorCategory } from "@/context/VendorCategoryContext";

// ─── CATEGORY META ─────────────────────────────────────────────────────────────

const CAT_LABELS = {
  venues:      "Venues",
  farmstays:   "Farmstays",
  studios:     "Studios",
  rentals:     "Rentals",
  workspaces:  "Workspaces",
  experiences: "Experiences",
};

// Tailwind classes per category — for tab chips & accents
const CAT_STYLES = {
  venues:      { dot: "bg-violet-500",  activeBg: "bg-violet-500/15 border-violet-500/40",  activeText: "text-violet-300",  ring: "ring-violet-500/30",  glow: "shadow-[0_0_20px_rgba(124,58,237,0.25)]",  hex: "#7c3aed" },
  farmstays:   { dot: "bg-emerald-500", activeBg: "bg-emerald-500/15 border-emerald-500/40", activeText: "text-emerald-300", ring: "ring-emerald-500/30", glow: "shadow-[0_0_20px_rgba(5,150,105,0.25)]",   hex: "#059669" },
  studios:     { dot: "bg-amber-500",   activeBg: "bg-amber-500/15 border-amber-500/40",    activeText: "text-amber-300",   ring: "ring-amber-500/30",   glow: "shadow-[0_0_20px_rgba(217,119,6,0.25)]",   hex: "#d97706" },
  rentals:     { dot: "bg-blue-500",    activeBg: "bg-blue-500/15 border-blue-500/40",      activeText: "text-blue-300",    ring: "ring-blue-500/30",    glow: "shadow-[0_0_20px_rgba(37,99,235,0.25)]",    hex: "#2563eb" },
  workspaces:  { dot: "bg-cyan-500",    activeBg: "bg-cyan-500/15 border-cyan-500/40",      activeText: "text-cyan-300",    ring: "ring-cyan-500/30",    glow: "shadow-[0_0_20px_rgba(8,145,178,0.25)]",    hex: "#0891b2" },
  experiences: { dot: "bg-rose-500",    activeBg: "bg-rose-500/15 border-rose-500/40",      activeText: "text-rose-300",    ring: "ring-rose-500/30",    glow: "shadow-[0_0_20px_rgba(219,39,119,0.25)]",   hex: "#db2777" },
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────

const AGGREGATED_AMENITIES = {
  venues: {
    Facilities:        ["Parking","Swimming Pool","Garden","Lawn","Indoor Hall","Rooftop","Outdoor Terrace"],
    "Catering & Food": ["In-house Catering","Bar & Beverages","Veg Menu","Non-veg Menu","Custom Menu"],
    Services:          ["Event Coordinator","Decoration","Photography","Videography","DJ","Live Music","Security","Valet Parking"],
    Technology:        ["High-speed WiFi","AV Equipment","Projector","Sound System","LED Screen"],
    Accessibility:     ["Wheelchair Access","Elevator","Accessible Restrooms"],
  },
  farmstays: {
    Facilities:        ["Parking","Garden","Lawn","Outdoor Terrace"],
    "Catering & Food": ["In-house Catering","Veg Menu","Custom Menu","Halal Options"],
    Services:          ["Event Coordinator","Photography"],
    Technology:        ["High-speed WiFi"],
    Accessibility:     ["Wheelchair Access"],
  },
  studios: {
    Facilities:        ["Parking","Rooftop","Indoor Hall"],
    "Catering & Food": ["Outside Catering Allowed"],
    Services:          ["Photography","Videography"],
    Technology:        ["High-speed WiFi","AV Equipment","LED Screen","Sound System","Lighting Rig","Live Streaming"],
    Accessibility:     ["Elevator"],
  },
};

const MOCK_LOCATIONS = {
  venues: [
    { name: "The Zenith of Coastal Elegance", address: "VVG5+976, Mallikatte, Mangaluru, KA 575002", active: true  },
    { name: "The Azure Pavilion",              address: "VVG5+976, Mallikatte, Mangaluru, KA 575002", active: true  },
    { name: "Heritage Manor Estate",           address: "Civil Lines, Jaipur, RJ 302006",             active: false },
  ],
  farmstays: [
    { name: "Green Valley Organic Farmstay",   address: "Coorg Hill Estates, Madikeri, KA 571201",   active: true  },
    { name: "Sunrise Mountain Farm",           address: "Nilgiri Hills, Ooty, TN 643001",            active: true  },
  ],
  studios: [
    { name: "Creative Loft Studio",            address: "Indiranagar, Bangalore, KA 560038",         active: true  },
  ],
};

const DEFAULT_STATS = {
  venues: [
    { label: "Years of Excellence", value: 12,   iconBg: "bg-violet-500/15",  iconColor: "text-violet-400",  Icon: Trophy       },
    { label: "Events Hosted",       value: 8400,  iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", Icon: CalendarDays },
    { label: "Happy Clients",       value: 6200,  iconBg: "bg-amber-500/15",   iconColor: "text-amber-400",   Icon: Users        },
    { label: "Venue Capacity",      value: 5000,  iconBg: "bg-blue-500/15",    iconColor: "text-blue-400",    Icon: Maximize2    },
  ],
  farmstays: [
    { label: "Years Running",       value: 8,     iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", Icon: Trophy       },
    { label: "Stays Hosted",        value: 1200,  iconBg: "bg-violet-500/15",  iconColor: "text-violet-400",  Icon: CalendarDays },
    { label: "Happy Guests",        value: 3400,  iconBg: "bg-amber-500/15",   iconColor: "text-amber-400",   Icon: Users        },
    { label: "Acres of Land",       value: 120,   iconBg: "bg-blue-500/15",    iconColor: "text-blue-400",    Icon: Maximize2    },
  ],
  studios: [
    { label: "Years Active",        value: 6,     iconBg: "bg-amber-500/15",   iconColor: "text-amber-400",   Icon: Trophy       },
    { label: "Projects Done",       value: 2800,  iconBg: "bg-violet-500/15",  iconColor: "text-violet-400",  Icon: CalendarDays },
    { label: "Happy Clients",       value: 1900,  iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", Icon: Users        },
    { label: "Studio Sqft",         value: 4500,  iconBg: "bg-blue-500/15",    iconColor: "text-blue-400",    Icon: Maximize2    },
  ],
};
const FALLBACK_STATS = DEFAULT_STATS.venues;

const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram",   hex: "#E1306C", placeholder: "instagram.com/yourbrand"  },
  { id: "facebook",  label: "Facebook",    hex: "#1877F2", placeholder: "facebook.com/yourbrand"   },
  { id: "youtube",   label: "YouTube",     hex: "#FF0000", placeholder: "youtube.com/@yourchannel" },
  { id: "twitter",   label: "X / Twitter", hex: "#0f172a", placeholder: "x.com/yourbrand"          },
  { id: "website",   label: "Website",     hex: "#6366f1", placeholder: "www.yourwebsite.com"      },
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DEFAULT_HOURS = DAYS.reduce((a, d) => ({ ...a, [d]: { open: true, from: "09:00", to: "22:00" } }), {});

// ─── REQUIRED FIELDS PER CATEGORY ─────────────────────────────────────────────
// Maps field-key → display label for completion tracking
const REQUIRED_FIELDS = [
  { key: "brandName",    label: "Brand Name",        shared: true  },
  { key: "bannerImage",  label: "Banner Image",       shared: false },
  { key: "bannerText",   label: "Banner Text",        shared: false },
  { key: "about",        label: "About Description",  shared: false },
  { key: "stats",        label: "Statistics",         shared: false },
  { key: "youtubeUrl",   label: "Video",              shared: true  },
  { key: "social",       label: "Social Links",       shared: true  },
];

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

function SectionCard({ children, className = "", glowColor = "" }) {
  return (
    <div className={
      "relative bg-[#0d111e]/80 dark:bg-[#0d111e]/80 " +
      "backdrop-blur-2xl " +
      "border border-white/[0.06] " +
      "rounded-3xl " +
      "shadow-[0_4px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] " +
      (glowColor ? glowColor + " " : "") +
      "p-7 md:p-8 " + className
    }>
      {/* subtle inner gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, iconBg, iconColor, title, subtitle, badge }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-7">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]`}>
          <Icon size={17} className={iconColor} />
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-white leading-tight">{title}</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {badge}
    </div>
  );
}

function InlineBadge({ icon: Icon, label, colorClass }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shrink-0 ${colorClass}`}>
      <Icon size={11} />
      <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{label}</span>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
      {children}
    </p>
  );
}

function GlassInput({ className = "", ...props }) {
  return (
    <input
      className={
        "w-full px-4 py-3 rounded-xl text-[14px] text-gray-100 " +
        "bg-white/[0.05] " +
        "border border-white/[0.08] " +
        "focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 " +
        "placeholder:text-gray-600 " +
        "transition-all duration-200 " + className
      }
      {...props}
    />
  );
}

function AnimatedCounter({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.max(1, Math.ceil(value / 80));
    const id = setInterval(() => {
      cur = Math.min(cur + step, value);
      setN(cur);
      if (cur >= value) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <>{n.toLocaleString()}</>;
}

function CompletionRing({ pct }) {
  const r = 22, circ = 2 * Math.PI * r;
  const color = pct === 100 ? "#10b981" : pct >= 60 ? "#818cf8" : "#f59e0b";
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90 absolute inset-0">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-black tabular-nums" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

// Editable stat card with inline value + label editing
function EditableStatCard({ stat, index, cat, onUpdate }) {
  const [editingValue, setEditingValue] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [tempValue, setTempValue] = useState(String(stat.value));
  const valueRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => { if (editingValue) valueRef.current?.focus(); }, [editingValue]);
  useEffect(() => { if (editingLabel) labelRef.current?.focus(); }, [editingLabel]);

  const commitValue = () => {
    const parsed = parseInt(tempValue.replace(/\D/g, ""), 10);
    if (!isNaN(parsed)) onUpdate(index, "value", parsed);
    setEditingValue(false);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group relative flex flex-col items-start p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.07] hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 cursor-default"
    >
      <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]`}>
        <stat.Icon size={16} className={stat.iconColor} />
      </div>

      {/* Value — click to edit */}
      <div className="flex items-end gap-1 mb-2 w-full">
        {editingValue ? (
          <input
            ref={valueRef}
            value={tempValue}
            onChange={e => setTempValue(e.target.value)}
            onBlur={commitValue}
            onKeyDown={e => { if (e.key === "Enter") commitValue(); if (e.key === "Escape") setEditingValue(false); }}
            className="text-[28px] font-bold text-white leading-none tabular-nums bg-transparent border-b border-indigo-400/60 outline-none w-full max-w-[100px]"
          />
        ) : (
          <button
            onClick={() => { setTempValue(String(stat.value)); setEditingValue(true); }}
            className="flex items-end gap-1 group/val"
            title="Click to edit value"
          >
            <span className="text-[28px] font-bold text-white leading-none tabular-nums group-hover/val:text-indigo-300 transition-colors">
              <AnimatedCounter value={stat.value} />
            </span>
            {stat.value >= 100 && (
              <span className="text-[13px] font-bold text-gray-600 mb-0.5">+</span>
            )}
            <Edit3 size={10} className="text-gray-600 group-hover/val:text-indigo-400 mb-1 ml-0.5 transition-colors" />
          </button>
        )}
      </div>

      {/* Label — click to edit */}
      {editingLabel ? (
        <input
          ref={labelRef}
          value={stat.label}
          onChange={e => onUpdate(index, "label", e.target.value)}
          onBlur={() => setEditingLabel(false)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditingLabel(false); }}
          className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-transparent border-b border-amber-400/50 outline-none w-full"
        />
      ) : (
        <button
          onClick={() => setEditingLabel(true)}
          className="flex items-center gap-1 group/lbl text-left"
          title="Click to edit label"
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover/lbl:text-gray-300 transition-colors">
            {stat.label}
          </span>
          <Edit3 size={9} className="text-gray-700 group-hover/lbl:text-amber-400 transition-colors shrink-0" />
        </button>
      )}
    </motion.div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ParentPageManagement() {
  const { vendorCategories } = useVendorCategory();
  const router = useRouter();

  // portal mount guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // global save state
  const [isDirty,   setIsDirty]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [showCompletionDetails, setShowCompletionDetails] = useState(false);
  const markDirty = useCallback(() => setIsDirty(true), []);

  // local category tab — independent of layout VendorCategoryContext
  const [activeCat, setActiveCat] = useState(() => vendorCategories[0] ?? "venues");

  // ── SHARED STATE ───────────────────────────────────────────────────────────
  const [shared, setShared] = useState({
    brandName:  "SYFTE Venues",
    tagline:    "Where every celebration finds its perfect stage.",
    social:     {},
    youtubeUrl: "",
    videoFile:  null,
    hours:      DEFAULT_HOURS,
  });

  const updShared = useCallback((key, val) => {
    setShared(p => ({ ...p, [key]: val }));
    markDirty();
  }, [markDirty]);

  // ── PER-CATEGORY STATE ─────────────────────────────────────────────────────
  const [catData, setCatData] = useState(() =>
    Object.fromEntries(vendorCategories.map(cat => [cat, {
      bannerType:  "image",
      bannerImage: null,
      bannerText:  "",
      about: cat === "venues"
        ? "We are a premium venue management group with over a decade of excellence in crafting world-class event experiences. From grand celebrations to intimate gatherings, every moment we curate is a masterpiece."
        : "",
      stats: (DEFAULT_STATS[cat] ?? FALLBACK_STATS).map(s => ({ ...s })),
    }]))
  );

  const updCat = useCallback((cat, key, val) => {
    setCatData(p => ({ ...p, [cat]: { ...p[cat], [key]: val } }));
    markDirty();
  }, [markDirty]);

  const updStat = useCallback((cat, i, key, val) => {
    setCatData(p => {
      const stats = [...(p[cat]?.stats ?? [])];
      stats[i] = { ...stats[i], [key]: val };
      return { ...p, [cat]: { ...p[cat], stats } };
    });
    markDirty();
  }, [markDirty]);

  // ── COMPLETION ─────────────────────────────────────────────────────────────
  const { missing, pct, allCatMissing } = useMemo(() => {
    const cd = catData[activeCat] ?? {};
    const miss = [];
    if (!shared.brandName?.trim())                                 miss.push("Brand Name");
    if (!cd.bannerImage)                                           miss.push("Banner Image");
    if (!cd.bannerText?.trim())                                    miss.push("Banner Text");
    if ((cd.about?.trim() ?? "").length < 30)                      miss.push("About Description");
    if (!cd.stats?.some(s => s.value > 0))                        miss.push("Statistics");
    if (!shared.youtubeUrl?.trim() && !shared.videoFile)          miss.push("Video");
    if (!Object.values(shared.social).some(v => v?.trim()))       miss.push("Social Links");

    // Completion across all categories
    const allMiss = {};
    vendorCategories.forEach(cat => {
      const d = catData[cat] ?? {};
      const m = [];
      if (!shared.brandName?.trim())                              m.push("Brand Name");
      if (!d.bannerImage)                                         m.push("Banner Image");
      if (!d.bannerText?.trim())                                  m.push("Banner Text");
      if ((d.about?.trim() ?? "").length < 30)                    m.push("About Description");
      if (!d.stats?.some(s => s.value > 0))                      m.push("Statistics");
      if (!shared.youtubeUrl?.trim() && !shared.videoFile)       m.push("Video");
      if (!Object.values(shared.social).some(v => v?.trim()))    m.push("Social Links");
      if (m.length) allMiss[cat] = m;
    });

    const total   = REQUIRED_FIELDS.length;
    const filled  = total - miss.length;
    return {
      missing:       miss,
      pct:           Math.round((filled / total) * 100),
      allCatMissing: allMiss,
    };
  }, [catData, activeCat, shared, vendorCategories]);

  // ── HANDLERS ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1100));
    setIsSaving(false);
    setIsDirty(false);
    toast.success("Brand page saved successfully");
  };
  const handleDiscard = () => { setIsDirty(false); toast("Changes discarded", { icon: "↩️" }); };
  const handleBack    = () => { if (isDirty) { setShowModal(true); return; } router.back(); };

  const toggleDay  = d => updShared("hours", { ...shared.hours, [d]: { ...shared.hours[d], open: !shared.hours[d].open } });
  const updateHour = (d, f, v) => updShared("hours", { ...shared.hours, [d]: { ...shared.hours[d], [f]: v } });

  const getEmbed = url => {
    try {
      const u   = new URL(url);
      const vid = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      if (vid && vid.length > 4) return `https://www.youtube.com/embed/${vid}`;
    } catch (_) {}
    return null;
  };

  // active-tab data shortcuts
  const acd        = catData[activeCat] ?? {};
  const embedUrl   = getEmbed(shared.youtubeUrl);
  const bannerSrc  = acd.bannerImage ? URL.createObjectURL(acd.bannerImage) : null;
  const activeAmen = AGGREGATED_AMENITIES[activeCat] ?? {};
  const activeLocs = MOCK_LOCATIONS[activeCat] ?? [];
  const catStyle   = CAT_STYLES[activeCat] ?? CAT_STYLES.venues;

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative pb-44 min-h-screen">
      <Toaster position="top-right" toastOptions={{ className: "text-sm font-medium" }} />

      {/* ── STICKY GLASS HEADER ─────────────────────────────────────────────── */}
      <div className="sticky top-[80px] md:top-[140px] z-20 mb-8">
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-[#0d111e]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_32px_rgba(0,0,0,0.60),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={handleBack} className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-white transition-colors shrink-0">
              <ArrowLeft size={15} /> Back
            </button>
            <div className="h-5 w-px bg-white/10 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-[16px] font-bold text-white leading-tight truncate">Parent Brand Page</h1>
              <p className="text-[11px] text-gray-500 mt-0.5 hidden sm:block">Manage your brand identity and public presence</p>
            </div>
            <AnimatePresence>
              {isDirty && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-bold text-amber-400 shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="hidden sm:flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-semibold text-gray-400 bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.10] transition-colors">
              <Eye size={13} /> Preview
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-[0_2px_14px_rgba(99,102,241,0.40)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.55)] active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? <div className="h-3.5 w-3.5 border border-white border-t-transparent rounded-full animate-spin" /> : <Save size={13} />}
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="space-y-6">

        {/* ═══ 1. GLOBAL COMPLETION STATUS CARD ══════════════════════════════ */}
        <motion.div
          animate={{
            borderColor: pct === 100 ? "rgba(16,185,129,0.30)" : pct >= 60 ? "rgba(99,102,241,0.30)" : "rgba(245,158,11,0.35)",
            boxShadow:   pct === 100
              ? "0 0 48px rgba(16,185,129,0.12), inset 0 1px 0 rgba(16,185,129,0.08)"
              : pct >= 60
                ? "0 0 48px rgba(99,102,241,0.10), inset 0 1px 0 rgba(99,102,241,0.06)"
                : "0 0 48px rgba(245,158,11,0.14), inset 0 1px 0 rgba(245,158,11,0.08)",
          }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border backdrop-blur-2xl overflow-hidden"
          style={{
            background: pct === 100
              ? "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04),rgba(13,17,30,0.92))"
              : pct >= 60
                ? "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(124,58,237,0.04),rgba(13,17,30,0.92))"
                : "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.04),rgba(13,17,30,0.92))",
          }}
        >
          <div className="p-6 md:p-7">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-5">
                <CompletionRing pct={pct} />
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    {pct === 100
                      ? <CheckCircle2 size={16} className="text-emerald-400" />
                      : <AlertTriangle size={16} className="text-amber-400" />
                    }
                    <span className="text-[17px] font-bold text-white">
                      {pct === 100 ? "Profile Complete" : "Profile Incomplete"}
                    </span>
                    {pct < 100 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-[9px] font-black tracking-wider uppercase text-white shadow-[0_0_10px_rgba(245,158,11,0.40)]">
                        Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-500">
                    {pct === 100
                      ? "Your brand page is fully set up and visible to guests."
                      : `${missing.length} field${missing.length !== 1 ? "s" : ""} missing — complete them to maximize visibility.`}
                  </p>
                </div>
              </div>
              {missing.length > 0 && (
                <button
                  onClick={() => setShowCompletionDetails(v => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/18 hover:border-amber-500/35 transition-all duration-200 shrink-0"
                >
                  View Details
                  <ChevronRight size={13} className={`transition-transform duration-300 ${showCompletionDetails ? "rotate-90" : ""}`} />
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: pct === 100 ? "#10b981" : pct >= 60 ? "linear-gradient(90deg,#6366f1,#8b5cf6)" : "linear-gradient(90deg,#f59e0b,#ef4444)",
                  boxShadow:  pct === 100 ? "0 0 12px #10b981" : pct >= 60 ? "0 0 12px #6366f1" : "0 0 12px #f59e0b",
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>

            {/* Missing fields expandable */}
            <AnimatePresence>
              {showCompletionDetails && missing.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 pt-5 border-t border-amber-500/10">
                    {/* Per-category breakdown */}
                    {vendorCategories.length > 1 && Object.keys(allCatMissing).length > 0 && (
                      <div className="space-y-4 mb-4">
                        {Object.entries(allCatMissing).map(([cat, fields]) => {
                          const cs = CAT_STYLES[cat] ?? CAT_STYLES.venues;
                          return (
                            <div key={cat}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${cs.dot}`} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  {CAT_LABELS[cat]} — {fields.length} missing
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {fields.map(f => (
                                  <span key={f} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/08 border border-amber-500/20 text-[11px] font-semibold text-amber-400">
                                    <AlertCircle size={9} />{f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Single category or fallback list */}
                    {(vendorCategories.length === 1) && (
                      <>
                        <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest mb-3">Missing Fields — {CAT_LABELS[activeCat]}</p>
                        <div className="flex flex-wrap gap-2">
                          {missing.map(f => (
                            <span key={f} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/08 border border-amber-500/20 text-[11px] font-semibold text-amber-400">
                              <AlertCircle size={9} />{f}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ═══ 2. CATEGORY TABS — shown only for multi-category vendors ═══════ */}
        {vendorCategories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {vendorCategories.map(cat => {
              const isActive = cat === activeCat;
              const cs = CAT_STYLES[cat] ?? CAT_STYLES.venues;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={
                    "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold shrink-0 border transition-all duration-300 " +
                    (isActive
                      ? `${cs.activeBg} ${cs.glow} text-white`
                      : "bg-white/[0.03] text-gray-500 border-white/[0.07] hover:border-white/[0.14] hover:text-gray-300 hover:bg-white/[0.05]")
                  }
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${cs.dot} ${isActive ? "shadow-[0_0_8px_currentColor]" : ""}`} />
                  <span className={isActive ? cs.activeText : ""}>
                    {CAT_LABELS[cat] ?? cat}
                  </span>
                  {/* missing indicator on tab */}
                  {allCatMissing[cat] && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-[9px] font-black text-white flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.50)]">
                      {allCatMissing[cat].length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ═══ 3. PER-CATEGORY SECTIONS ══════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >

            {/* ── CATEGORY SECTION LABEL ──────────────────────────────────── */}
            {vendorCategories.length > 1 && (
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${catStyle.dot} shadow-[0_0_10px_currentColor]`} />
                <span className={`text-[13px] font-bold uppercase tracking-widest ${catStyle.activeText}`}>
                  {CAT_LABELS[activeCat]} — Category Section
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
              </div>
            )}

            {/* ── HERO BANNER ──────────────────────────────────────────────── */}
            <SectionCard>
              <SectionHeader
                icon={ImageIcon}
                iconBg="bg-indigo-500/15"
                iconColor="text-indigo-400"
                title={`Hero Banner — ${CAT_LABELS[activeCat] ?? activeCat}`}
                subtitle="The cinematic first impression on your public brand page."
              />
              <div className="grid lg:grid-cols-2 gap-8 items-start">

                {/* LEFT — controls */}
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Brand Name</FieldLabel>
                    <GlassInput
                      value={shared.brandName}
                      onChange={e => updShared("brandName", e.target.value)}
                      placeholder="Your Brand Name"
                      className="text-[15px] font-semibold"
                    />
                  </div>
                  <div>
                    <FieldLabel>Tagline</FieldLabel>
                    <GlassInput
                      value={shared.tagline}
                      onChange={e => updShared("tagline", e.target.value)}
                      placeholder="A short, elegant tagline"
                    />
                  </div>
                  <div>
                    <FieldLabel>Banner Text</FieldLabel>
                    <GlassInput
                      value={acd.bannerText ?? ""}
                      onChange={e => updCat(activeCat, "bannerText", e.target.value)}
                      placeholder={`e.g. "Award-Winning ${CAT_LABELS[activeCat]} Since 2012"`}
                    />
                  </div>

                  {/* media toggle */}
                  <div>
                    <FieldLabel>Banner Media Type</FieldLabel>
                    <div className="flex p-1 rounded-xl bg-white/[0.05] border border-white/[0.07] w-fit gap-1">
                      {[{ id: "image", label: "Image", Icon: ImageIcon }, { id: "video", label: "Video", Icon: Video }].map(({ id, label, Icon }) => (
                        <button key={id}
                          onClick={() => updCat(activeCat, "bannerType", id)}
                          className={
                            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 " +
                            (acd.bannerType === id
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.20)]"
                              : "text-gray-500 hover:text-gray-300")
                          }
                        >
                          <Icon size={13} />{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* upload zone */}
                  <label className="flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer border-2 border-dashed border-white/[0.08] hover:border-indigo-500/40 bg-white/[0.02] hover:bg-indigo-500/[0.04] group transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                      <Upload size={17} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-300">
                        {acd.bannerImage ? acd.bannerImage.name : `Upload ${acd.bannerType === "image" ? "Image" : "Video"}`}
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {acd.bannerType === "image" ? "PNG, JPG, WebP — max 8 MB" : "MP4, MOV, WebM — max 50 MB"}
                      </p>
                    </div>
                    <input type="file" className="hidden"
                      accept={acd.bannerType === "image" ? "image/*" : "video/*"}
                      onChange={e => updCat(activeCat, "bannerImage", e.target.files[0])} />
                  </label>
                </div>

                {/* RIGHT — live preview */}
                <div
                  className="relative rounded-2xl overflow-hidden aspect-video flex flex-col justify-end"
                  style={{
                    background: `linear-gradient(135deg, ${catStyle.hex}55, #4c1d9540, #0d111e)`,
                  }}
                >
                  {bannerSrc && <img src={bannerSrc} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {acd.bannerText && (
                    <div className="absolute top-4 left-4 right-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white/80 uppercase tracking-widest border border-white/20 backdrop-blur-sm"
                        style={{ background: `${catStyle.hex}25` }}
                      >
                        {acd.bannerText}
                      </span>
                    </div>
                  )}
                  <div className="relative z-10 p-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: `${catStyle.hex}cc` }}>
                      {CAT_LABELS[activeCat] ?? activeCat}
                    </p>
                    <h3 className="text-[22px] font-bold text-white leading-tight drop-shadow">
                      {shared.brandName || "Your Brand"}
                    </h3>
                    <p className="text-[13px] text-white/60 mt-1.5 leading-relaxed line-clamp-2">{shared.tagline}</p>
                  </div>
                  {!bannerSrc && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Live Preview</span>
                  )}
                  {/* category accent glow at bottom */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ background: `linear-gradient(90deg, transparent, ${catStyle.hex}, transparent)`, opacity: 0.5 }}
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── ABOUT BRAND ──────────────────────────────────────────────── */}
            <SectionCard>
              <SectionHeader
                icon={Sparkles}
                iconBg="bg-amber-500/15"
                iconColor="text-amber-400"
                title={`About — ${CAT_LABELS[activeCat]}`}
                subtitle="Tell your story — displayed prominently on your public brand page."
              />
              <div className="space-y-3">
                <textarea
                  value={acd.about ?? ""}
                  onChange={e => updCat(activeCat, "about", e.target.value.slice(0, 600))}
                  rows={5}
                  placeholder={`Write your ${CAT_LABELS[activeCat]} story — what makes you special, your history, your values…`}
                  className="w-full px-5 py-4 rounded-2xl text-[14px] text-gray-300 leading-relaxed bg-white/[0.04] border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-amber-400/25 focus:border-amber-400/40 resize-none placeholder:text-gray-700 transition-all duration-200"
                />
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] text-gray-600">Be authentic — guests connect with real stories.</p>
                  <span className={
                    "text-[11px] font-mono font-bold tabular-nums " +
                    ((acd.about?.length ?? 0) > 540 ? "text-amber-400" : "text-gray-700")
                  }>
                    {acd.about?.length ?? 0} / 600
                  </span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-fit text-[12px] font-semibold text-amber-400 bg-amber-500/08 border border-amber-500/15 hover:bg-amber-500/15 hover:border-amber-500/30 transition-all duration-200">
                  <Sparkles size={13} /> Generate with AI
                </button>
              </div>
            </SectionCard>

            {/* ── STATISTICS — fully editable ──────────────────────────────── */}
            <SectionCard>
              <SectionHeader
                icon={TrendingUp}
                iconBg="bg-violet-500/15"
                iconColor="text-violet-400"
                title={`${CAT_LABELS[activeCat]} Statistics`}
                subtitle="Click any number or label to edit — these appear on your public brand page."
                badge={
                  <InlineBadge
                    icon={Edit3}
                    label="Editable"
                    colorClass="bg-violet-500/10 border-violet-500/25 text-violet-400"
                  />
                }
              />
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {(acd.stats ?? []).map((stat, i) => (
                  <EditableStatCard
                    key={i}
                    stat={stat}
                    index={i}
                    cat={activeCat}
                    onUpdate={(idx, key, val) => updStat(activeCat, idx, key, val)}
                  />
                ))}
              </div>
              <p className="mt-4 text-[11px] text-gray-700 flex items-center gap-1.5">
                <Edit3 size={10} />
                Click any number or label above to edit it inline.
              </p>
            </SectionCard>

            {/* ── AMENITIES — view-only, auto-synced ──────────────────────── */}
            <SectionCard>
              <SectionHeader
                icon={Building2}
                iconBg="bg-rose-500/15"
                iconColor="text-rose-400"
                title={`${CAT_LABELS[activeCat]} Amenities`}
                subtitle="Consolidated amenities from all your listings in this category."
                badge={
                  <InlineBadge
                    icon={RefreshCw}
                    label="Auto-synced from listings"
                    colorClass="bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                  />
                }
              />
              {/* Locked notice */}
              <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                <Lock size={11} className="text-emerald-500 shrink-0" />
                <p className="text-[11px] text-emerald-500/70 font-medium">
                  Amenities are managed from your individual listing editor. This view updates automatically.
                </p>
              </div>
              {Object.keys(activeAmen).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.07]">
                  <Building2 size={28} className="text-gray-700 mb-2" />
                  <p className="text-[12px] text-gray-600 font-medium">No amenities synced yet — add listings first</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(activeAmen).map(([group, items]) => (
                    <div key={group}>
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] mb-2.5">{group}</p>
                      <div className="flex flex-wrap gap-2">
                        {items.map(item => (
                          <span key={item}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-white/[0.04] text-gray-400 border border-white/[0.07]">
                            <Check size={10} className="text-emerald-500 shrink-0" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

          </motion.div>
        </AnimatePresence>

        {/* ═══ SHARED SECTIONS DIVIDER ════════════════════════════════════════ */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <Zap size={9} className="text-indigo-400" />
            Shared — All Categories
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* ═══ 4. LOCATION (locked) + HOURS (editable) ════════════════════════ */}
        <SectionCard>
          <SectionHeader
            icon={MapPin}
            iconBg="bg-emerald-500/15"
            iconColor="text-emerald-400"
            title="Location & Hours"
            subtitle={`${activeLocs.length} location${activeLocs.length !== 1 ? "s" : ""} across your ${CAT_LABELS[activeCat] ?? activeCat} listings.`}
            badge={
              <InlineBadge
                icon={Lock}
                label="Managed from listing details"
                colorClass="bg-blue-500/10 border-blue-500/25 text-blue-400"
              />
            }
          />

          {/* Locked notice */}
          <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-blue-500/[0.06] border border-blue-500/15">
            <Lock size={11} className="text-blue-400 shrink-0" />
            <p className="text-[11px] text-blue-400/70 font-medium">
              Location is set during the listing creation process. To change it, edit the specific listing.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">

            {/* LEFT — locked location display */}
            <div className="space-y-4">
              {/* map preview */}
              <div className="relative rounded-2xl overflow-hidden h-48 bg-gradient-to-br from-emerald-500/[0.06] to-teal-500/[0.06] border border-emerald-500/12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 opacity-35">
                  <MapPin size={36} className="text-emerald-500" />
                  <p className="text-[12px] font-bold text-emerald-400">Map Preview</p>
                  <p className="text-[10px] text-gray-600">Connect Google Maps API to enable</p>
                </div>
                {/* Decorative grid overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-[#0d111e]/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 border border-white/[0.07]">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse shadow-[0_0_6px_#10b981]" />
                    <p className="text-[11px] font-medium text-gray-400">
                      {activeLocs.length} active location{activeLocs.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
              {/* location list */}
              <div className="space-y-2">
                {activeLocs.length === 0 ? (
                  <div className="flex items-center justify-center h-20 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.07]">
                    <p className="text-[12px] text-gray-600 font-medium">No locations yet</p>
                  </div>
                ) : (
                  activeLocs.map((loc, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin size={13} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-200 leading-tight">{loc.name}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">{loc.address}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 shrink-0 mt-0.5`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${loc.active ? "bg-emerald-500 shadow-[0_0_6px_#10b981]" : "bg-gray-700"}`} />
                        <span className={`text-[10px] font-semibold ${loc.active ? "text-emerald-500" : "text-gray-600"}`}>
                          {loc.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT — editable business hours */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={13} className="text-gray-600" />
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Operating Hours</span>
              </div>
              <div className="space-y-2">
                {DAYS.map(day => {
                  const h = shared.hours[day];
                  const isWeekend = day === "Saturday" || day === "Sunday";
                  return (
                    <div key={day}
                      className={
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 " +
                        (h.open
                          ? "bg-white/[0.04] border-white/[0.08]"
                          : "bg-transparent border-white/[0.04]")
                      }
                    >
                      {/* toggle */}
                      <button
                        onClick={() => toggleDay(day)}
                        className={"relative rounded-full shrink-0 transition-colors duration-200 " + (h.open ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.40)]" : "bg-white/[0.10]")}
                        style={{ width: 30, height: 17 }}
                      >
                        <span
                          className="absolute top-[2px] left-[2px] rounded-full bg-white shadow-sm transition-transform duration-200"
                          style={{ width: 13, height: 13, transform: h.open ? "translateX(13px)" : "translateX(0)" }}
                        />
                      </button>
                      <span className={
                        "text-[12px] font-bold w-[48px] shrink-0 " +
                        (h.open
                          ? (isWeekend ? "text-indigo-400" : "text-gray-300")
                          : "text-gray-700")
                      }>
                        {day.slice(0, 3)}
                      </span>
                      {h.open ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <input type="time" value={h.from} onChange={e => updateHour(day, "from", e.target.value)}
                            className="flex-1 text-[12px] text-gray-400 bg-transparent border-none outline-none min-w-0 [color-scheme:dark]" />
                          <span className="text-[10px] text-gray-700">–</span>
                          <input type="time" value={h.to} onChange={e => updateHour(day, "to", e.target.value)}
                            className="flex-1 text-[12px] text-gray-400 bg-transparent border-none outline-none min-w-0 [color-scheme:dark]" />
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-700 font-medium">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ═══ 5. SOCIAL PRESENCE — shared ═════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader
            icon={Globe}
            iconBg="bg-blue-500/15"
            iconColor="text-blue-400"
            title="Social Presence"
            subtitle="Link your brand accounts — shown as verified badges on your page."
          />
          <div className="space-y-3">
            {SOCIAL_PLATFORMS.map(p => (
              <div key={p.id}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] focus-within:border-white/[0.14] focus-within:bg-white/[0.05] transition-all duration-200">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-[12px] font-black shadow-[0_2px_8px_rgba(0,0,0,0.30)]" style={{ background: p.hex }}>
                  {p.label[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">{p.label}</p>
                  <input type="url"
                    value={shared.social[p.id] ?? ""}
                    onChange={e => updShared("social", { ...shared.social, [p.id]: e.target.value })}
                    placeholder={p.placeholder}
                    className="w-full text-[13px] text-gray-300 bg-transparent border-none outline-none placeholder:text-gray-700" />
                </div>
                {shared.social[p.id] && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <Check size={10} className="text-emerald-400" />
                    </div>
                    <a href={shared.social[p.id]} target="_blank" rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-400 transition-colors">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ═══ 6. VIDEO SHOWCASE — shared ══════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader
            icon={Film}
            iconBg="bg-violet-500/15"
            iconColor="text-violet-400"
            title="Video Showcase"
            subtitle="Upload a brand reel or embed a YouTube video for your public page."
          />
          <div className="grid lg:grid-cols-2 gap-6">
            {/* upload */}
            <div>
              <FieldLabel>Upload Video</FieldLabel>
              <label className="group flex flex-col items-center justify-center h-52 rounded-2xl cursor-pointer border-2 border-dashed border-white/[0.07] hover:border-violet-500/40 bg-white/[0.02] hover:bg-violet-500/[0.04] transition-all duration-300">
                {shared.videoFile ? (
                  <div className="text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-3">
                      <Film size={22} className="text-violet-400" />
                    </div>
                    <p className="text-[13px] font-semibold text-gray-300 line-clamp-1">{shared.videoFile.name}</p>
                    <p className="text-[11px] text-gray-600 mt-1">{(shared.videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    <button onClick={e => { e.preventDefault(); updShared("videoFile", null); }}
                      className="mt-3 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors">Remove</button>
                  </div>
                ) : (
                  <div className="text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.05] group-hover:bg-violet-500/15 flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                      <Upload size={20} className="text-gray-600 group-hover:text-violet-400 transition-colors duration-300" />
                    </div>
                    <p className="text-[13px] font-semibold text-gray-500">Drop video or click to browse</p>
                    <p className="text-[11px] text-gray-700 mt-1">MP4, MOV, WebM · max 50 MB</p>
                  </div>
                )}
                <input type="file" accept="video/*" className="hidden" onChange={e => updShared("videoFile", e.target.files[0])} />
              </label>
            </div>
            {/* YouTube */}
            <div>
              <FieldLabel>YouTube / Embed</FieldLabel>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 bg-white/[0.04] border border-white/[0.07] focus-within:ring-2 focus-within:ring-red-400/25 focus-within:border-red-400/40 transition-all duration-200">
                <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.35)]">
                  <Youtube size={13} className="text-white" />
                </div>
                <input type="url" value={shared.youtubeUrl}
                  onChange={e => updShared("youtubeUrl", e.target.value)}
                  placeholder="Paste YouTube URL here…"
                  className="flex-1 text-[13px] text-gray-300 bg-transparent border-none outline-none placeholder:text-gray-700" />
              </div>
              {embedUrl ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden aspect-video border border-white/[0.06]">
                  <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="YouTube preview" />
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.07]">
                  <PlayCircle size={28} className="text-gray-700 mb-2" />
                  <p className="text-[11px] text-gray-700 font-medium">Video preview appears here</p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

      </div>{/* end content */}

      {/* ── FLOATING SAVE DOCK — fixed bottom center, globally above all ─────── */}
      {mounted && createPortal(
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] pointer-events-none"
            >
              <div className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0d111e]/95 backdrop-blur-2xl border border-white/[0.10] shadow-[0_8px_56px_rgba(0,0,0,0.70),0_0_0_1px_rgba(255,255,255,0.04)]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  <span className="text-[12px] font-semibold text-gray-500 hidden sm:block">Unsaved changes</span>
                </div>
                <div className="h-5 w-px bg-white/[0.08]" />
                <button onClick={handleDiscard}
                  className="h-9 px-4 rounded-xl text-[12px] font-semibold text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-all duration-200">
                  Discard
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-[0_2px_16px_rgba(99,102,241,0.50)] active:scale-95 transition-all duration-200 disabled:opacity-60">
                  {isSaving ? <div className="h-3.5 w-3.5 border border-white border-t-transparent rounded-full animate-spin" /> : <Save size={12} />}
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── PORTAL MODAL — fixed viewport center, never clips ─────────────────── */}
      {mounted && createPortal(
        <AnimatePresence>
          {showModal && (
            <>
              {/* backdrop */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/65 backdrop-blur-lg z-[9998]"
                onClick={() => setShowModal(false)}
              />
              {/* modal card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 28 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 28 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90vw] max-w-sm"
              >
                <div className="relative bg-[#0d111e] rounded-3xl p-8 border border-white/[0.10] shadow-[0_32px_96px_rgba(0,0,0,0.80),inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/[0.04] to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    {/* close */}
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>

                    <div className="w-12 h-12 rounded-2xl bg-amber-500/12 border border-amber-500/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                      <AlertTriangle size={22} className="text-amber-400" />
                    </div>
                    <h3 className="text-[18px] font-bold text-white mb-2">Unsaved Changes</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-7">
                      You have unsaved edits on your brand page. Leaving now will discard all changes made in this session.
                    </p>
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => setShowModal(false)}
                        className="w-full h-11 rounded-2xl text-[13px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-[0_2px_16px_rgba(99,102,241,0.40)] active:scale-[0.98] transition-all duration-200"
                      >
                        Continue Editing
                      </button>
                      <button
                        onClick={() => { setShowModal(false); router.back(); }}
                        className="w-full h-11 rounded-2xl text-[13px] font-semibold text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] transition-all duration-200"
                      >
                        Leave Without Saving
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
