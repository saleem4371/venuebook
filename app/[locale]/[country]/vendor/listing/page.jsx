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
  TrendingUp, Star, Zap, MessageSquare,
  Calendar, Trees, Camera, Warehouse,
  Briefcase, Compass
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import { LoadParent, SaveParent } from "@/services/parent.service";

// ─── CATEGORY META ─────────────────────────────────────────────────────────────

const CAT_LABELS = {
  venues: "Venues",
  farmstays: "Farmstays",
  studios: "Studios",
  rentals: "Rentals",
  workspaces: "Workspaces",
  experiences: "Experiences",
};

const CAT_STYLES = {
  venues: { dot: "bg-[#a44bf3]", activeText: "text-[#a44bf3]", hex: "#a44bf3", hex2: "#499ce8" },
  farmstays: { dot: "bg-emerald-500", activeText: "text-emerald-300", hex: "#10b981", hex2: "#34d399" },
  studios: { dot: "bg-amber-500", activeText: "text-amber-300", hex: "#f59e0b", hex2: "#fbbf24" },
  rentals: { dot: "bg-blue-500", activeText: "text-blue-300", hex: "#3b82f6", hex2: "#60a5fa" },
  workspaces: { dot: "bg-cyan-500", activeText: "text-cyan-300", hex: "#06b6d4", hex2: "#67e8f9" },
  experiences: { dot: "bg-pink-500", activeText: "text-pink-300", hex: "#ec4899", hex2: "#f472b6" },
};

const CAT_ICONS = {
  venues: Building2, farmstays: Trees, studios: Camera,
  rentals: Warehouse, workspaces: Briefcase, experiences: Compass,
};

// Maps a stat's saved `label` back to a renderable icon component — stats
// are plain JSON on the wire (no Icon reference survives serialization),
// so we re-attach one by label whenever we parse a row.
const ICON_BY_STAT_LABEL = { Reviews: MessageSquare, Ratings: Star, Clients: Users, Hosted: Calendar };
const ICONBG_BY_STAT_LABEL = { Reviews: "bg-blue-500/15", Ratings: "bg-yellow-500/15", Clients: "bg-emerald-500/15", Hosted: "bg-[#a44bf3]/15" };
const ICONCOLOR_BY_STAT_LABEL = { Reviews: "text-blue-400", Ratings: "text-yellow-400", Clients: "text-emerald-400", Hosted: "text-[#a44bf3]" };

// ─── MOCK DATA (view-only sections not yet backed by real endpoints) ──────────

const AGGREGATED_AMENITIES = {
  venues: {
    Facilities: ["Parking", "Swimming Pool", "Garden", "Lawn", "Indoor Hall", "Rooftop", "Outdoor Terrace"],
    "Catering & Food": ["In-house Catering", "Bar & Beverages", "Veg Menu", "Non-veg Menu", "Custom Menu"],
    Services: ["Event Coordinator", "Decoration", "Photography", "Videography", "DJ", "Live Music", "Security", "Valet Parking"],
    Technology: ["High-speed WiFi", "AV Equipment", "Projector", "Sound System", "LED Screen"],
    Accessibility: ["Wheelchair Access", "Elevator", "Accessible Restrooms"],
  },
  farmstays: {
    Facilities: ["Parking", "Garden", "Lawn", "Outdoor Terrace"],
    "Catering & Food": ["In-house Catering", "Veg Menu", "Custom Menu", "Halal Options"],
    Services: ["Event Coordinator", "Photography"],
    Technology: ["High-speed WiFi"],
    Accessibility: ["Wheelchair Access"],
  },
  studios: {
    Facilities: ["Parking", "Rooftop", "Indoor Hall"],
    "Catering & Food": ["Outside Catering Allowed"],
    Services: ["Photography", "Videography"],
    Technology: ["High-speed WiFi", "AV Equipment", "LED Screen", "Sound System", "Lighting Rig", "Live Streaming"],
    Accessibility: ["Elevator"],
  },
};

const MOCK_LOCATIONS = {
  venues: [
    { name: "The Zenith of Coastal Elegance", address: "VVG5+976, Mallikatte, Mangaluru, KA 575002", active: true },
    { name: "The Azure Pavilion", address: "VVG5+976, Mallikatte, Mangaluru, KA 575002", active: true },
  ],
  farmstays: [
    { name: "Green Valley Organic Farmstay", address: "Coorg Hill Estates, Madikeri, KA 571201", active: true },
  ],
  studios: [
    { name: "Creative Loft Studio", address: "Indiranagar, Bangalore, KA 560038", active: true },
  ],
};

const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram", hex: "#E1306C", placeholder: "instagram.com/yourbrand" },
  { id: "facebook", label: "Facebook", hex: "#1877F2", placeholder: "facebook.com/yourbrand" },
  { id: "youtube", label: "YouTube", hex: "#FF0000", placeholder: "youtube.com/@yourchannel" },
  { id: "twitter", label: "X / Twitter", hex: "#0f172a", placeholder: "x.com/yourbrand" },
  { id: "website", label: "Website", hex: "#6366f1", placeholder: "www.yourwebsite.com" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEFAULT_HOURS = DAYS.reduce((a, d) => ({ ...a, [d]: { open: true, from: "09:00", to: "22:00" } }), {});

const REQUIRED_FIELDS = [
  "Brand Name", "Banner Image", "Banner Text", "About Description",
  "Statistics", "Video", "Social Links",
];

// ─── ROW PARSER ────────────────────────────────────────────────────────────────
//
// The backend (`getParent`) filters `venue_parent` by BOTH `created_by` AND
// `propety_category`, so every category is its OWN independent database row
// — its own parent_venue_id, its own contact info, its own everything. There
// is no "shared row that contains every category". Each tab is therefore
// loaded, edited, and saved completely independently of the others.
//
// `row.venue_settings.categories[]` (if present) can still carry a
// category-specific about/bannerText/stats override for this row — that's
// just extra structured content on top of this row's own columns.

function parseRow(cat, row) {
  if (!row) row = {};

  let settings = {};
  try {
    settings = typeof row.venue_settings === "string"
      ? JSON.parse(row.venue_settings || "{}")
      : (row.venue_settings || {});
  } catch (e) {
    console.error("Failed to parse venue_settings", e);
  }

  const catSettings = (settings.categories || []).find((c) => c?.name === cat) || {};

  const stats = Array.isArray(catSettings.stats) && catSettings.stats.length
    ? catSettings.stats.map((s) => ({
        label: s.label,
        value: Number(s.value) || 0,
        Icon: ICON_BY_STAT_LABEL[s.label] ?? MessageSquare,
        iconBg: s.iconBg || ICONBG_BY_STAT_LABEL[s.label] || "bg-blue-500/15",
        iconColor: s.iconColor || ICONCOLOR_BY_STAT_LABEL[s.label] || "text-blue-400",
      }))
    : [
        { label: "Reviews", value: Number(row.reviews) || 0, Icon: MessageSquare, iconBg: "bg-blue-500/15", iconColor: "text-blue-400" },
        { label: "Ratings", value: Number(row.rating) || 0, Icon: Star, iconBg: "bg-yellow-500/15", iconColor: "text-yellow-400" },
        { label: "Clients", value: Number(row.clients) || 0, Icon: Users, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400" },
        { label: "Hosted", value: Number(row.hosted) || 0, Icon: Calendar, iconBg: "bg-[#a44bf3]/15", iconColor: "text-[#a44bf3]" },
      ];

  return {
    // identity — critical: this is what makes Save target the RIGHT row
    parent_venue_id: row.parent_venue_id || "",
    parent_auto_no: row.parent_auto_no || "",
    propety_category: row.propety_category || "",

    // brand
    venue_company_name: row.venue_company_name || "",
    tagline: row.banner_content || "",

    // hero banner
    bannerType: catSettings.bannerType || row.displayMediaType || "image",
    bannerImage: row.banner_image || null,
    bannerText: catSettings.bannerText || "",
    about: catSettings.about || row.about_venues || "",
    stats,

    // social + hours — per-row, since each row is its own entity
    social: {
      facebook: row.facebook_url || "",
      instagram: row.instagram_url || "",
      twitter: row.twitter_url || "",
      website: row.website_url || "",
      youtube: row.new_youtube || "",
    },
    hours: settings.hours || DEFAULT_HOURS,

    // video
    youtubeUrl: row.youtube_url || "",
    video_url: row.video_url || "",
    videoFile: null,

    // read-only location/contact info (set during listing creation)
    venue_name: row.venue_name || "",
    venue_address: row.venue_address || "",
    venue_city: row.venue_city || "",
    venue_state: row.venue_state || "",
    venue_pincode: row.venue_pincode || "",
    lat: row.lat || "",
    lng: row.lng || "",
    contact_person: row.conatct_person || "",
    email: row.email || "",
    phone: row.phone || "",
  };
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

function SectionCard({ children, className = "" }) {
  return (
    <div className={
      "relative bg-white dark:bg-[#0b1120] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.07] " +
      "rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)] " +
      "p-7 md:p-8 transition-colors duration-200 " + className
    }>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent dark:from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
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
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">{title}</h2>
          <p className="text-[12px] text-slate-500 dark:text-slate-500 mt-0.5">{subtitle}</p>
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
  return <p className="text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1.5">{children}</p>;
}

function GlassInput({ className = "", ...props }) {
  return (
    <input
      className={
        "w-full px-4 py-3 rounded-xl text-[14px] text-slate-800 dark:text-gray-100 bg-slate-50 dark:bg-[#0f172a] " +
        "border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#a44bf3]/40 focus:border-[#a44bf3] " +
        "placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors duration-200 " + className
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
  const color = pct === 100 ? "#10b981" : "#a44bf3";
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90 absolute inset-0">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(164,75,243,0.15)" strokeWidth="4" />
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

function EditableStatCard({ stat, index, onUpdate }) {
  const [editingValue, setEditingValue] = useState(false);
  const [tempValue, setTempValue] = useState(String(stat.value));
  const valueRef = useRef(null);

  useEffect(() => { if (editingValue) valueRef.current?.focus(); }, [editingValue]);

  const commitValue = () => {
    const parsed = parseInt(tempValue.replace(/\D/g, ""), 10);
    if (!isNaN(parsed)) onUpdate(index, "value", parsed);
    setEditingValue(false);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group relative flex flex-col items-start p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.14] transition-colors duration-200"
    >
      <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]`}>
        <stat.Icon size={16} className={stat.iconColor} />
      </div>
      <div className="flex items-end gap-1 mb-2 w-full">
        {editingValue ? (
          <input
            ref={valueRef}
            value={tempValue}
            onChange={e => setTempValue(e.target.value)}
            onBlur={commitValue}
            onKeyDown={e => { if (e.key === "Enter") commitValue(); if (e.key === "Escape") setEditingValue(false); }}
            className="text-[28px] font-bold text-slate-900 dark:text-white leading-none tabular-nums bg-transparent border-b border-[#a44bf3]/60 outline-none w-full max-w-[100px]"
          />
        ) : (
          <button onClick={() => { setTempValue(String(stat.value)); setEditingValue(true); }} className="flex items-end gap-1 group/val" title="Click to edit value">
            <span className="text-[28px] font-bold text-slate-900 dark:text-white leading-none tabular-nums group-hover/val:text-[#a44bf3] transition-colors">
              <AnimatedCounter value={stat.value} />
            </span>
            <Edit3 size={10} className="text-slate-400 dark:text-slate-600 group-hover/val:text-[#a44bf3] mb-1 ml-0.5 transition-colors" />
          </button>
        )}
      </div>
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{stat.label}</span>
    </motion.div>
  );
}

function CategorySkeleton() {
  return (
    <SectionCard>
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-40 rounded-lg bg-slate-100 dark:bg-white/[0.05]" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-11 rounded-xl bg-slate-100 dark:bg-white/[0.05]" />
            <div className="h-11 rounded-xl bg-slate-100 dark:bg-white/[0.05]" />
            <div className="h-11 rounded-xl bg-slate-100 dark:bg-white/[0.05]" />
          </div>
          <div className="aspect-video rounded-3xl bg-slate-100 dark:bg-white/[0.05]" />
        </div>
      </div>
    </SectionCard>
  );
}

function CategoryErrorCard({ cat, onRetry }) {
  return (
    <SectionCard>
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertTriangle size={20} className="text-rose-400" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Couldn't load {CAT_LABELS[cat] ?? cat} data</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1">Check your connection and try again.</p>
        </div>
        <button onClick={onRetry} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white bg-[linear-gradient(242deg,#a44bf3,#499ce8)] hover:brightness-110 active:scale-95 transition-all duration-200">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    </SectionCard>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ParentPageManagement() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isDirty, setIsDirty] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompletionDetails, setShowCompletionDetails] = useState(false);
  const markDirty = useCallback(() => setIsDirty(true), []);

  // Full list of categories this vendor has (e.g. ["farmstays","venues"]).
  const [loadData, setLoadData] = useState([]);

  // Placeholder until the initial category-discovery call resolves with
  // the vendor's real first category.
  const [activeCat, setActiveCat] = useState("venues");

  // Per-category fetch status: 'loading' | 'loaded' | 'error'. Drives
  // skeletons/spinners and acts as a simple client-side cache so a tab
  // already opened once doesn't refetch on every click.
  const [catLoadState, setCatLoadState] = useState({});
  const catLoadStateRef = useRef({});
  useEffect(() => { catLoadStateRef.current = catLoadState; }, [catLoadState]);

  // Synchronous in-flight guard — prevents duplicate calls for the same
  // category fired within the same tick (state-based checks can't catch
  // that, since setState hasn't flushed yet).
  const catInFlightRef = useRef(new Set());

  // Stale-response guard — if the user flips tabs quickly, an older
  // request for a category can resolve after a newer one already started.
  // Each request gets an incrementing id; only the latest is applied.
  const catRequestIdRef = useRef({});

  // Categories the user has actually edited — Save only touches these,
  // since each is its OWN backend row with its own parent_venue_id.
  const [dirtyCats, setDirtyCats] = useState(() => new Set());

  // Per-category state. Each entry is a fully independent record — see
  // parseRow() for the shape.
  const [catData, setCatData] = useState({});

  const updCat = useCallback((cat, key, val) => {
    setCatData(p => ({ ...p, [cat]: { ...p[cat], [key]: val } }));
    setDirtyCats(p => (p.has(cat) ? p : new Set(p).add(cat)));
    markDirty();
  }, [markDirty]);

  const updCatNested = useCallback((cat, parentKey, childKey, val) => {
    setCatData(p => ({
      ...p,
      [cat]: { ...p[cat], [parentKey]: { ...(p[cat]?.[parentKey] || {}), [childKey]: val } },
    }));
    setDirtyCats(p => (p.has(cat) ? p : new Set(p).add(cat)));
    markDirty();
  }, [markDirty]);

  const updStat = useCallback((cat, i, key, val) => {
    setCatData(p => {
      const stats = [...(p[cat]?.stats ?? [])];
      stats[i] = { ...stats[i], [key]: val };
      return { ...p, [cat]: { ...p[cat], stats } };
    });
    setDirtyCats(p => (p.has(cat) ? p : new Set(p).add(cat)));
    markDirty();
  }, [markDirty]);

  // ── COMPLETION ─────────────────────────────────────────────────────────────
  const acd = catData[activeCat] || {};

  const { missing, pct, allCatMissing } = useMemo(() => {
    const computeMissing = (d) => {
      const m = [];
      if (!d.venue_company_name?.trim()) m.push("Brand Name");
      if (!d.bannerImage) m.push("Banner Image");
      if (!d.bannerText?.trim()) m.push("Banner Text");
      if ((d.about?.trim() ?? "").length < 30) m.push("About Description");
      if (!d.stats?.some(s => s.value > 0)) m.push("Statistics");
      if (!d.youtubeUrl?.trim() && !d.videoFile) m.push("Video");
      if (!Object.values(d.social || {}).some(v => v?.trim())) m.push("Social Links");
      return m;
    };

    const miss = computeMissing(catData[activeCat] || {});

    const allMiss = {};
    loadData.forEach(cat => {
      if (catLoadState[cat] !== "loaded") return; // unopened tab — nothing to judge yet
      const m = computeMissing(catData[cat] || {});
      if (m.length) allMiss[cat] = m;
    });

    const total = REQUIRED_FIELDS.length;
    return {
      missing: miss,
      pct: Math.round(((total - miss.length) / total) * 100),
      allCatMissing: allMiss,
    };
  }, [catData, activeCat, loadData, catLoadState]);

  // ── BRAND REEL (separate from the per-category showcase video) ─────────────
  const [reelFile, setReelFile] = useState(null);
  const [reelPreview, setReelPreview] = useState(null);
  const [videoError, setVideoError] = useState("");

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError("");

    if (!["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) {
      setVideoError("Only MP4, MOV and WebM videos are supported.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setVideoError("Maximum allowed file size is 3 MB.");
      e.target.value = "";
      return;
    }

    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.preload = "metadata";
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      if (video.duration > 60) {
        setVideoError("Maximum video duration is 60 seconds.");
        e.target.value = "";
        return;
      }
      if (reelPreview) URL.revokeObjectURL(reelPreview);
      setReelPreview(URL.createObjectURL(file));
      setReelFile(file);
      markDirty();
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setVideoError("Unable to read the selected video.");
      e.target.value = "";
    };
  };

  useEffect(() => () => { if (reelPreview) URL.revokeObjectURL(reelPreview); }, [reelPreview]);

  // ── TAB-WISE LOADER ─────────────────────────────────────────────────────────
  // Fetches ONE category's own row from the backend (`getParent` filters by
  // that category, so this is always a category-specific fetch — never a
  // shared blob). Cached via catLoadState; guarded against duplicate and
  // out-of-order requests.
  const loadCategory = useCallback(async (cat, { force = false } = {}) => {
    if (!cat) return;
    if (!force && catLoadStateRef.current[cat] === "loaded") return;
    if (!force && catInFlightRef.current.has(cat)) return;
    catInFlightRef.current.add(cat);

    const requestId = (catRequestIdRef.current[cat] || 0) + 1;
    catRequestIdRef.current[cat] = requestId;
    setCatLoadState(p => ({ ...p, [cat]: "loading" }));

    try {
      const res = await LoadParent(cat);
      if (catRequestIdRef.current[cat] !== requestId) return; // stale — a newer request already started

      const categories = res?.data?.category || [];
      if (categories.length) setLoadData(categories);

      const row = (res?.data?.result || [])[0] || null;
      setCatData(p => ({ ...p, [cat]: parseRow(cat, row) }));
      setCatLoadState(p => ({ ...p, [cat]: "loaded" }));
    } catch (err) {
      if (catRequestIdRef.current[cat] !== requestId) return;
      console.error(`Failed to load ${cat} data`, err);
      setCatLoadState(p => ({ ...p, [cat]: "error" }));
    } finally {
      catInFlightRef.current.delete(cat);
    }
  }, []);

  // Fetch a tab's data the moment the user switches to it. Waits for the
  // initial category-discovery call so it doesn't fire against the
  // placeholder activeCat before real categories are known.
  useEffect(() => {
    if (!loadData.length || !activeCat) return;
    loadCategory(activeCat);
  }, [activeCat, loadData.length, loadCategory]);

  // ── INITIAL LOAD ─────────────────────────────────────────────────────────────
  // Discovers which categories this vendor has. The backend's category list
  // comes back regardless of which single category we queried with, so this
  // call also happens to return real row data for `activeCat` itself if a
  // matching row exists — seed it directly to avoid a redundant refetch.
  useEffect(() => {
    (async () => {
      try {
        const res = await LoadParent(activeCat);
        const categories = res?.data?.category || [];
        setLoadData(categories);

        const row = (res?.data?.result || [])[0] || null;
        if (row) {
          setCatData(p => ({ ...p, [activeCat]: parseRow(activeCat, row) }));
          setCatLoadState(p => ({ ...p, [activeCat]: "loaded" }));
        }

        const firstCat = categories[0];
        if (firstCat && firstCat !== activeCat) setActiveCat(firstCat);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load brand page");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── SAVE ───────────────────────────────────────────────────────────────────
  // Each dirty category is its own backend row, so each gets its own
  // SaveParent call keyed by ITS OWN parent_venue_id.
  const handleSave = async () => {
    if (dirtyCats.size === 0) { setIsDirty(false); return; }
    try {
      setIsSaving(true);

      await Promise.all([...dirtyCats].map(async (cat) => {
        const data = catData[cat];
        if (!data?.parent_venue_id) {
          console.warn(`Skipping save for "${cat}" — no parent_venue_id loaded yet.`);
          return;
        }

        const formData = new FormData();
        formData.append("venue_company_name", data.venue_company_name || "");
        formData.append("tagline", data.tagline || "");
        formData.append("youtubeUrl", data.youtubeUrl || "");
        formData.append("social", JSON.stringify(data.social || {}));
        formData.append("hours", JSON.stringify(data.hours || {}));
        formData.append("bannerType", data.bannerType || "image");
        formData.append("bannerText", data.bannerText || "");
        formData.append("about", data.about || "");

        const cleanStats = (data.stats || []).map(({ Icon, ...rest }) => rest);
        formData.append("stats", JSON.stringify(cleanStats));
        cleanStats.forEach(item => formData.append(item.label.toLowerCase(), String(item.value || 0)));

        if (data.videoFile && typeof data.videoFile !== "string") {
          formData.append("video", data.videoFile);
        }
        if (data.bannerImage && typeof data.bannerImage !== "string") {
          formData.append("image", data.bannerImage);
        }
        if (cat === activeCat && reelFile) {
          formData.append("brand_reel", reelFile);
        }

        await SaveParent(data.parent_venue_id, formData);
      }));

      toast.success("Brand page saved successfully");
      setIsDirty(false);
      setDirtyCats(new Set());
    } catch (err) {
      console.error(err);
      toast.error("Failed to save parent page");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setIsDirty(false);
    setDirtyCats(new Set());
    toast("Changes discarded", { icon: "↩️" });
  };
  const handleBack = () => { if (isDirty) { setShowModal(true); return; } router.back(); };

  const toggleDay = (d) => updCatNested(activeCat, "hours", d, { ...acd.hours?.[d], open: !acd.hours?.[d]?.open });
  const updateHour = (d, f, v) => updCatNested(activeCat, "hours", d, { ...acd.hours?.[d], [f]: v });

  const getEmbed = (url) => {
    try {
      const u = new URL(url);
      const vid = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      if (vid && vid.length > 4) return `https://www.youtube.com/embed/${vid}`;
    } catch (_) {}
    return null;
  };

  const embedUrl = getEmbed(acd.youtubeUrl);
  const activeAmen = AGGREGATED_AMENITIES[activeCat] ?? {};
  const activeLocs = MOCK_LOCATIONS[activeCat] ?? [];
  const catStyle = CAT_STYLES[activeCat] ?? CAT_STYLES.venues;

  const bannerSrc = useMemo(() => {
    if (!acd?.bannerImage) return null;
    if (typeof acd.bannerImage === "string") {
      return acd.bannerImage.startsWith("http")
        ? acd.bannerImage
        : `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${acd.bannerImage}`;
    }
    return URL.createObjectURL(acd.bannerImage);
  }, [acd?.bannerImage]);

  useEffect(() => () => {
    if (bannerSrc && typeof acd?.bannerImage !== "string") URL.revokeObjectURL(bannerSrc);
  }, [bannerSrc, acd?.bannerImage]);

  const videoObjectUrl = useMemo(() => {
    if (acd.videoFile && typeof acd.videoFile !== "string") return URL.createObjectURL(acd.videoFile);
    return null;
  }, [acd.videoFile]);

  useEffect(() => () => { if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl); }, [videoObjectUrl]);

  if (!loadData.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-[#a44bf3] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-44 min-h-screen">
      <Toaster position="top-right" toastOptions={{ className: "text-sm font-medium" }} />

      {/* ── STICKY GLASS HEADER ─────────────────────────────────────────────── */}
      <div className="sticky top-[80px] md:top-[90px] z-20 mb-8">
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-[0_4px_32px_rgba(0,0,0,0.60)] transition-colors duration-200">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={handleBack} className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0">
              <ArrowLeft size={15} /> Back
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-white/10 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-[16px] font-bold text-slate-900 dark:text-white leading-tight truncate">Parent Brand Page</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5 hidden sm:block">Manage your brand identity and public presence</p>
            </div>
            <AnimatePresence>
              {isDirty && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#a44bf3]/10 border border-[#a44bf3]/25 text-[10px] font-bold text-[#a44bf3] shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a44bf3] animate-pulse" />
                  Unsaved
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="hidden sm:flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.10] transition-colors duration-200">
              <Eye size={13} /> Preview
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-[12px] font-semibold text-white bg-[linear-gradient(242deg,#a44bf3,#499ce8)] hover:brightness-110 shadow-[0_2px_14px_rgba(164,75,243,0.40)] hover:shadow-[0_4px_24px_rgba(164,75,243,0.55)] active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? <div className="h-3.5 w-3.5 border border-white border-t-transparent rounded-full animate-spin" /> : <Save size={13} />}
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* ═══ COMPLETION STATUS ══════════════════════════════════════════════ */}
        <motion.div
          animate={{
            borderColor: pct === 100 ? "rgba(16,185,129,0.30)" : "rgba(164,75,243,0.30)",
            boxShadow: pct === 100
              ? "0 0 48px rgba(16,185,129,0.12), inset 0 1px 0 rgba(16,185,129,0.08)"
              : "0 0 40px rgba(164,75,243,0.12), inset 0 1px 0 rgba(164,75,243,0.06)",
          }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border overflow-hidden"
        >
          <div className="p-6 md:p-7">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-5">
                <CompletionRing pct={pct} />
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    {pct === 100 ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-[#a44bf3]" />}
                    <span className="text-[17px] font-bold text-slate-900 dark:text-white">{pct === 100 ? "Profile Complete" : "Profile Incomplete"}</span>
                    {pct < 100 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase text-white shadow-[0_0_10px_rgba(164,75,243,0.40)]" style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}>
                        Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-slate-500">
                    {pct === 100 ? "Your brand page is fully set up and visible to guests." : `${missing.length} field${missing.length !== 1 ? "s" : ""} missing — complete them to maximize visibility.`}
                  </p>
                </div>
              </div>
              {missing.length > 0 && (
                <button onClick={() => setShowCompletionDetails(v => !v)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-[#a44bf3] bg-[#a44bf3]/10 border border-[#a44bf3]/20 hover:bg-[#a44bf3]/20 hover:border-[#a44bf3]/35 transition-all duration-200 shrink-0">
                  View Details
                  <ChevronRight size={13} className={`transition-transform duration-300 ${showCompletionDetails ? "rotate-90" : ""}`} />
                </button>
              )}
            </div>

            <div className="mt-5 h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.07] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: pct === 100 ? "#10b981" : "linear-gradient(242deg,#a44bf3,#499ce8)", boxShadow: pct === 100 ? "0 0 12px #10b981" : "0 0 12px #a44bf3" }}
                initial={{ width: "0%" }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>

            <AnimatePresence>
              {showCompletionDetails && missing.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-5 pt-5 border-t border-[#a44bf3]/15 dark:border-[#a44bf3]/10">
                    {loadData.length > 1 && Object.keys(allCatMissing).length > 0 && (
                      <div className="space-y-4 mb-4">
                        {Object.entries(allCatMissing).map(([cat, fields]) => {
                          const cs = CAT_STYLES[cat] ?? CAT_STYLES.venues;
                          return (
                            <div key={cat}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${cs.dot}`} />
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                                  {CAT_LABELS[cat]} — {fields.length} missing
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {fields.map(f => (
                                  <span key={f} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#a44bf3]/10 border border-[#a44bf3]/20 text-[11px] font-semibold text-[#a44bf3]">
                                    <AlertCircle size={9} />{f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {loadData.length === 1 && (
                      <>
                        <p className="text-[10px] font-bold text-[#a44bf3]/60 uppercase tracking-widest mb-3">Missing Fields — {CAT_LABELS[activeCat]}</p>
                        <div className="flex flex-wrap gap-2">
                          {missing.map(f => (
                            <span key={f} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#a44bf3]/10 border border-[#a44bf3]/20 text-[11px] font-semibold text-[#a44bf3]">
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

        {/* ═══ CATEGORY TABS ═══════════════════════════════════════════════════ */}
        {loadData.length > 1 && (
          <div className="relative">
            <div className="flex items-center gap-1 overflow-x-auto p-1.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.035] border border-slate-200 dark:border-white/[0.06] shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]" style={{ scrollbarWidth: "none" }}>
              {loadData.map(cat => {
                const isActive = cat === activeCat;
                const cs = CAT_STYLES[cat] ?? CAT_STYLES.venues;
                const CatIcon = CAT_ICONS[cat] ?? Building2;
                const missingCount = allCatMissing[cat]?.length ?? 0;
                const status = catLoadState[cat];

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={
                      "relative flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-[13px] font-semibold shrink-0 whitespace-nowrap transition-colors duration-200 " +
                      (isActive ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200")
                    }
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeCatPill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: `linear-gradient(242deg, ${cs.hex}, ${cs.hex2 ?? cs.hex})`, boxShadow: `0 4px 18px ${cs.hex}4d, inset 0 1px 0 rgba(255,255,255,0.18)` }}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <CatIcon size={14} className={isActive ? "text-white" : "text-slate-400 dark:text-slate-500"} />
                      {CAT_LABELS[cat] ?? cat}
                      {status === "loading" && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70 shrink-0" aria-label="Loading" />}
                      {status === "error" && <AlertCircle size={12} className={isActive ? "text-white/90" : "text-rose-400"} />}
                      {status !== "loading" && missingCount > 0 && (
                        <span className={"flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black leading-none " + (isActive ? "bg-white/25 text-white" : "text-white")} style={!isActive ? { background: cs.hex } : undefined}>
                          {missingCount}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ PER-CATEGORY SECTIONS ══════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div key={activeCat} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="space-y-6">

            {loadData.length > 1 && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${catStyle.hex}1a` }}>
                  {(() => { const CatIcon = CAT_ICONS[activeCat] ?? Building2; return <CatIcon size={13} style={{ color: catStyle.hex }} />; })()}
                </div>
                <span className={`text-[13px] font-bold uppercase tracking-widest ${catStyle.activeText}`}>{CAT_LABELS[activeCat]} — Category Section</span>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-white/[0.08] to-transparent" />
              </div>
            )}

            {(!activeCat || catLoadState[activeCat] === "loading") ? (
              <CategorySkeleton />
            ) : catLoadState[activeCat] === "error" ? (
              <CategoryErrorCard cat={activeCat} onRetry={() => loadCategory(activeCat, { force: true })} />
            ) : (
              <>
                {/* ── HERO BANNER ──────────────────────────────────────────── */}
                <SectionCard>
                  <SectionHeader icon={ImageIcon} iconBg="bg-indigo-500/15" iconColor="text-indigo-400"
                    title={`Hero Banner — ${CAT_LABELS[activeCat] ?? activeCat}`}
                    subtitle="The cinematic first impression on your public brand page." />
                  <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-5">
                      <div>
                        <FieldLabel>Brand Name</FieldLabel>
                        <GlassInput value={acd.venue_company_name || ""} onChange={e => updCat(activeCat, "venue_company_name", e.target.value)} placeholder="Your Brand Name" className="text-[15px] font-semibold" />
                      </div>
                      <div>
                        <FieldLabel>Tagline</FieldLabel>
                        <GlassInput value={acd.tagline || ""} onChange={e => updCat(activeCat, "tagline", e.target.value)} placeholder="A short, elegant tagline" />
                      </div>
                      <div>
                        <FieldLabel>Banner Text</FieldLabel>
                        <GlassInput value={acd.bannerText ?? ""} onChange={e => updCat(activeCat, "bannerText", e.target.value)} placeholder={`e.g. "Award-Winning ${CAT_LABELS[activeCat]} Since 2012"`} />
                      </div>

                      <div>
                        <FieldLabel>Banner Media Type</FieldLabel>
                        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.07] w-fit gap-1">
                          {[{ id: "image", label: "Image", Icon: ImageIcon }, { id: "video", label: "Video", Icon: Video }].map(({ id, label, Icon }) => (
                            <button key={id} onClick={() => updCat(activeCat, "bannerType", id)}
                              className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors duration-200 " +
                                (acd.bannerType === id
                                  ? "bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shadow-sm dark:shadow-[0_0_10px_rgba(99,102,241,0.20)]"
                                  : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}>
                              <Icon size={13} />{label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer border-2 border-dashed border-slate-200 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/40 bg-slate-50 dark:bg-white/[0.02] hover:bg-indigo-50 dark:hover:bg-indigo-500/[0.04] group transition-colors duration-200">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                          <Upload size={17} className="text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                            {acd.bannerImage ? (typeof acd.bannerImage === "string" ? "Uploaded Banner" : acd.bannerImage?.name) : `Upload ${acd.bannerType === "image" ? "Image" : "Video"}`}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">{acd.bannerType === "image" ? "PNG, JPG, WebP — max 8 MB" : "MP4, MOV, WebM — max 50 MB"}</p>
                        </div>
                        <input type="file" className="hidden" accept={acd.bannerType === "image" ? "image/*" : "video/*"}
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) updCat(activeCat, "bannerImage", file); }} />
                      </label>
                    </div>

                    <div className="relative rounded-3xl overflow-hidden aspect-video flex flex-col justify-end"
                      style={{ background: `linear-gradient(135deg, ${catStyle.hex}66, ${catStyle.hex2 ?? catStyle.hex}33, #0d111e)` }}>
                      {acd?.bannerImage ? (
                        acd.bannerType === "video" ? (
                          <video key={typeof acd.bannerImage === "string" ? acd.bannerImage : acd.bannerImage?.name} src={bannerSrc} autoPlay muted loop playsInline controls className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <img src={bannerSrc} alt="Banner preview" className="absolute inset-0 w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">No Preview</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {acd.bannerText && (
                        <div className="absolute top-4 left-4 right-4">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white/80 uppercase tracking-widest border border-white/20 backdrop-blur-sm" style={{ background: `${catStyle.hex}25` }}>
                            {acd.bannerText}
                          </span>
                        </div>
                      )}
                      <div className="relative z-10 p-6">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: `${catStyle.hex}cc` }}>{CAT_LABELS[activeCat] ?? activeCat}</p>
                        <h3 className="text-[22px] font-bold text-white leading-tight drop-shadow">{acd.venue_company_name || "Your Brand"}</h3>
                        <p className="text-[13px] text-white/60 mt-1.5 leading-relaxed line-clamp-2">{acd.tagline}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${catStyle.hex}, transparent)`, opacity: 0.5 }} />
                    </div>
                  </div>
                </SectionCard>

                {/* ── ABOUT BRAND ──────────────────────────────────────────── */}
                <SectionCard>
                  <SectionHeader icon={Sparkles} iconBg="bg-[#a44bf3]/10" iconColor="text-[#a44bf3]"
                    title={`About — ${CAT_LABELS[activeCat]}`} subtitle="Tell your story — displayed prominently on your public brand page." />
                  <div className="space-y-3">
                    <textarea value={acd.about ?? ""} onChange={e => updCat(activeCat, "about", e.target.value.slice(0, 600))} rows={5}
                      placeholder={`Write your ${CAT_LABELS[activeCat]} story — what makes you special, your history, your values…`}
                      className="w-full px-5 py-4 rounded-2xl text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#a44bf3]/40 focus:border-[#a44bf3] resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors duration-200" />
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[11px] text-slate-500 dark:text-slate-500">Be authentic — guests connect with real stories.</p>
                      <span className={"text-[11px] font-mono font-bold tabular-nums " + ((acd.about?.length ?? 0) > 540 ? "text-[#a44bf3]" : "text-slate-400 dark:text-slate-600")}>
                        {acd.about?.length ?? 0} / 600
                      </span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-fit text-[12px] font-semibold text-[#a44bf3] bg-[#a44bf3]/10 border border-[#a44bf3]/20 hover:bg-[#a44bf3]/15 hover:border-[#a44bf3]/30 transition-all duration-200">
                      <Sparkles size={13} /> Generate with AI
                    </button>
                  </div>
                </SectionCard>

                {/* ── STATISTICS ───────────────────────────────────────────── */}
                <SectionCard>
                  <SectionHeader icon={TrendingUp} iconBg="bg-[#a44bf3]/10" iconColor="text-[#a44bf3]"
                    title={`${CAT_LABELS[activeCat]} Statistics`} subtitle="Click any number to edit — these appear on your public brand page."
                    badge={<InlineBadge icon={Edit3} label="Editable" colorClass="bg-[#a44bf3]/10 border-[#a44bf3]/25 text-[#a44bf3]" />} />
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {(acd.stats ?? []).map((stat, i) => (
                      <EditableStatCard key={i} stat={stat} index={i} onUpdate={(idx, key, val) => updStat(activeCat, idx, key, val)} />
                    ))}
                  </div>
                </SectionCard>

                {/* ── AMENITIES ────────────────────────────────────────────── */}
                <SectionCard>
                  <SectionHeader icon={Building2} iconBg="bg-rose-500/15" iconColor="text-rose-400"
                    title={`${CAT_LABELS[activeCat]} Amenities`} subtitle="Consolidated amenities from all your listings in this category."
                    badge={<InlineBadge icon={RefreshCw} label="Auto-synced from listings" colorClass="bg-emerald-500/10 border-emerald-500/25 text-emerald-400" />} />
                  <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                    <Lock size={11} className="text-emerald-500 shrink-0" />
                    <p className="text-[11px] text-emerald-500/70 font-medium">Amenities are managed from your individual listing editor. This view updates automatically.</p>
                  </div>
                  {Object.keys(activeAmen).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.07]">
                      <Building2 size={28} className="text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="text-[12px] text-slate-500 dark:text-slate-500 font-medium">No amenities synced yet — add listings first</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {Object.entries(activeAmen).map(([group, items]) => (
                        <div key={group}>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.15em] mb-2.5">{group}</p>
                          <div className="flex flex-wrap gap-2">
                            {items.map(item => (
                              <span key={item} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.07]">
                                <Check size={10} className="text-emerald-500 shrink-0" />{item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/[0.08] to-transparent" />
          <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
            <Zap size={9} className="text-[#a44bf3]" /> {CAT_LABELS[activeCat]} — Location, Social & Video
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 dark:via-white/[0.08] to-transparent" />
        </div>

        {/* ═══ LOCATION (locked) + HOURS (editable) ════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={MapPin} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" title="Location & Hours"
            subtitle={`${activeLocs.length} location${activeLocs.length !== 1 ? "s" : ""} across your ${CAT_LABELS[activeCat] ?? activeCat} listings.`}
            badge={<InlineBadge icon={Lock} label="Managed from listing details" colorClass="bg-blue-500/10 border-blue-500/25 text-blue-400" />} />
          <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-blue-500/[0.06] border border-blue-500/15">
            <MapPin size={11} className="text-blue-500 shrink-0" />
            <p className="text-[11px] text-blue-400/70 font-medium">Location is set during the listing creation process. To change it, edit the specific listing.</p>
          </div>

          <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-4">
            <div className="space-y-4 xl:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={13} className="text-slate-500 dark:text-slate-500" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">Location</span>
              </div>
              <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
                <div className="relative rounded-2xl overflow-hidden h-[300px] bg-emerald-50 dark:bg-[#0f172a] border border-emerald-100 dark:border-white/[0.07] flex flex-col">
                  <div className="flex-1 relative">
                    {acd?.lat && acd?.lng ? (
                      <iframe className="w-full h-full" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${acd.lat},${acd.lng}&z=15&output=embed`} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2 opacity-40 dark:opacity-35">
                        <MapPin size={36} className="text-emerald-500" />
                        <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">Map Preview</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500">Location not available</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 border border-slate-200 dark:border-white/[0.07]">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        {acd.venue_address || `${activeLocs.length} active location${activeLocs.length !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {activeLocs.length === 0 ? (
                    <div className="flex items-center justify-center h-20 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.07]">
                      <p className="text-[12px] text-slate-500 dark:text-slate-500 font-medium">No locations yet</p>
                    </div>
                  ) : (
                    activeLocs.map((loc, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={13} className="text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{loc.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">{loc.address}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${loc.active ? "bg-emerald-500 shadow-[0_0_6px_#10b981]" : "bg-slate-300 dark:bg-slate-700"}`} />
                          <span className={`text-[10px] font-semibold ${loc.active ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400 dark:text-slate-500"}`}>{loc.active ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={13} className="text-slate-500 dark:text-slate-500" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">Operating Hours</span>
              </div>
              <div className="space-y-2">
                {DAYS.map(day => {
                  const h = acd.hours?.[day] || { open: false, from: "09:00", to: "22:00" };
                  const isWeekend = day === "Saturday" || day === "Sunday";
                  return (
                    <div key={day} className={"flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors duration-200 " + (h.open ? "bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08]" : "bg-transparent border-slate-100 dark:border-white/[0.04]")}>
                      <button onClick={() => toggleDay(day)} className={"relative rounded-full shrink-0 transition-colors duration-200 " + (h.open ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.35)]" : "bg-slate-200 dark:bg-white/[0.10]")} style={{ width: 30, height: 17 }}>
                        <span className="absolute top-[2px] left-[2px] rounded-full bg-white shadow-sm transition-transform duration-200" style={{ width: 13, height: 13, transform: h.open ? "translateX(13px)" : "translateX(0)" }} />
                      </button>
                      <span className={"text-[12px] font-bold w-[48px] shrink-0 " + (h.open ? (isWeekend ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300") : "text-slate-400 dark:text-slate-600")}>
                        {day.slice(0, 3)}
                      </span>
                      {h.open ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <input type="time" value={h.from} onChange={e => updateHour(day, "from", e.target.value)} className="flex-1 text-[12px] text-slate-600 dark:text-slate-400 bg-transparent border-none outline-none min-w-0 dark:[color-scheme:dark]" />
                          <span className="text-[10px] text-slate-400 dark:text-slate-600">–</span>
                          <input type="time" value={h.to} onChange={e => updateHour(day, "to", e.target.value)} className="flex-1 text-[12px] text-slate-600 dark:text-slate-400 bg-transparent border-none outline-none min-w-0 dark:[color-scheme:dark]" />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-600 font-medium">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ═══ SOCIAL PRESENCE ═════════════════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={Globe} iconBg="bg-blue-500/15" iconColor="text-blue-400" title="Social Presence"
            subtitle="Link your brand accounts for this category — shown as verified badges on your page." />
          <div className="space-y-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SOCIAL_PLATFORMS.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] focus-within:border-slate-300 dark:focus-within:border-white/[0.14] focus-within:bg-white dark:focus-within:bg-white/[0.05] transition-colors duration-200">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-[12px] font-black shadow-[0_2px_8px_rgba(0,0,0,0.20)]" style={{ background: p.hex }}>{p.label[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-0.5">{p.label}</p>
                  <input type="url" value={acd.social?.[p.id] ?? ""} onChange={e => updCatNested(activeCat, "social", p.id, e.target.value)} placeholder={p.placeholder}
                    className="w-full text-[13px] text-slate-700 dark:text-slate-300 bg-transparent border-none outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
                {acd.social?.[p.id] && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <Check size={10} className="text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <a href={acd.social[p.id]} target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ═══ VIDEO SHOWCASE ══════════════════════════════════════════════════ */}
        <SectionCard>
          <SectionHeader icon={Film} iconBg="bg-[#a44bf3]/10" iconColor="text-[#a44bf3]" title="Video Showcase"
            subtitle="Upload a brand reel or embed a YouTube video for this category's public page." />
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <FieldLabel>Upload Video</FieldLabel>
              <label className="group flex flex-col items-center justify-center overflow-hidden h-52 rounded-2xl cursor-pointer border-2 border-dashed border-slate-200 dark:border-white/[0.07] hover:border-[#a44bf3]/40 bg-slate-50 dark:bg-white/[0.02] hover:bg-[#a44bf3]/[0.04] dark:hover:bg-[#a44bf3]/[0.04] transition-colors duration-200 relative">
                {(acd.videoFile || acd.video_url) ? (
                  <div className="relative w-full h-full">
                    <video controls className="w-full h-full object-cover" src={videoObjectUrl ? videoObjectUrl : `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${acd.video_url}`} />
                    <button type="button" onClick={(e) => { e.preventDefault(); updCat(activeCat, "videoFile", null); updCat(activeCat, "video_url", ""); }} className="absolute top-3 right-3 z-10 px-3 py-1 rounded-lg bg-black/70 text-white text-xs hover:bg-black transition">Remove</button>
                    {acd.videoFile && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-3 py-2">
                        <p className="text-xs font-semibold line-clamp-1">{acd.videoFile.name}</p>
                        <p className="text-[10px] opacity-80">{(acd.videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.05] group-hover:bg-[#a44bf3]/10 flex items-center justify-center mx-auto mb-3 transition-colors duration-200">
                      <Upload size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-[#a44bf3] transition-colors duration-200" />
                    </div>
                    <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-500">Drop video or click to browse</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1">MP4, MOV, WebM · max 50 MB</p>
                  </div>
                )}
                <input type="file" accept="video/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) updCat(activeCat, "videoFile", file); }} />
              </label>
            </div>

            <div>
              <FieldLabel>YouTube / Embed</FieldLabel>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] focus-within:ring-2 focus-within:ring-red-400/30 focus-within:border-red-400 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.30)]"><Youtube size={13} className="text-white" /></div>
                <input type="url" value={acd.youtubeUrl || ""} onChange={e => updCat(activeCat, "youtubeUrl", e.target.value)} placeholder="Paste YouTube URL here…"
                  className="flex-1 text-[13px] text-slate-700 dark:text-slate-300 bg-transparent border-none outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600" />
              </div>
              {embedUrl ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden aspect-video border border-slate-200 dark:border-white/[0.06]">
                  <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="YouTube preview" />
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.07]">
                  <PlayCircle size={28} className="text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-[11px] text-slate-400 dark:text-slate-600 font-medium">Video preview appears here</p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ═══ BRAND REEL (not category-scoped — attaches to whichever category is saved) ═══ */}
        <SectionCard>
          <SectionHeader icon={Film} iconBg="bg-[#a44bf3]/10" iconColor="text-[#a44bf3]" title="Brand Reel" subtitle="Upload a short promotional reel to showcase your venue." />
          <div className="space-y-4">
            {videoError && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/20">
                <AlertCircle size={13} className="text-rose-500 shrink-0" />
                <p className="text-[11px] text-rose-500 font-medium">{videoError}</p>
              </div>
            )}
          <label className="group relative flex h-[220px] w-full max-w-[500px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 transition-all hover:border-[#a44bf3] hover:bg-[#faf7ff] dark:border-white/[0.10] dark:bg-white/[0.02] dark:hover:bg-[#a44bf3]/[0.04]">

  {(reelPreview || acd?.reel_video) ? (
    <div className="relative h-full w-full">

      <video
        controls
        className="h-full w-full rounded-xl object-cover"
        src={
          reelPreview
            ? reelPreview
            : `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${acd.reel_video}`
        }
      />

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();

          if (reelPreview) {
            URL.revokeObjectURL(reelPreview);
          }

          setReelPreview(null);
          setReelFile(null);
          setVideoError("");
        }}
        className="absolute right-3 top-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black"
      >
        Remove
      </button>

      <label className="absolute left-3 top-3 cursor-pointer rounded-lg bg-[#a44bf3] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#9136f0]">
        Change Video
        <input
          type="file"
          className="hidden"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleVideoUpload}
        />
      </label>

      {reelFile && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
          <p className="truncate text-sm font-semibold text-white">
            {reelFile.name}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] text-white">
              {(reelFile.size / 1024 / 1024).toFixed(2)} MB
            </span>

            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] text-white">
              {reelFile.type.replace("video/", "").toUpperCase()}
            </span>

            <span className="rounded-full bg-[#a44bf3] px-2.5 py-1 text-[11px] text-white">
              Brand Reel
            </span>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="px-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a44bf3]/10">
        <Upload className="h-6 w-6 text-[#a44bf3]" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
        Upload Brand Reel
      </h3>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Showcase your venue with a short promotional reel.
      </p>

      <div className="mt-5 inline-flex rounded-xl bg-[#a44bf3] px-5 py-2 text-sm font-semibold text-white hover:bg-[#9136f0]">
        Choose Video
      </div>

      <input
        type="file"
        className="hidden"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleVideoUpload}
      />
    </div>
  )}

</label>
            <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] p-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-4">
                <div className="flex items-center gap-2">🎥 <span>MP4 • MOV • WebM</span></div>
                <div className="flex items-center gap-2">📦 <span>Max 3 MB</span></div>
                <div className="flex items-center gap-2">⏱ <span>Max 60 sec</span></div>
                <div className="flex items-center gap-2">📱 <span>9:16 Portrait</span></div>
                <div className="flex items-center gap-2">🖥 <span>1080 × 1920</span></div>
                <div className="flex items-center gap-2">🚫 <span>No Watermarks</span></div>
                <div className="flex items-center gap-2">⚡ <span>Fast Loading</span></div>
                <div className="flex items-center gap-2">⭐ <span>15–30 sec Recommended</span></div>
              </div>
            </div>
          </div>
        </SectionCard>

      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isDirty && (
            <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 32 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-950/95 backdrop-blur-2xl border border-white/[0.10] shadow-[0_8px_56px_rgba(0,0,0,0.70)]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a44bf3] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a44bf3]" />
                  </span>
                  <span className="text-[12px] font-semibold text-slate-400 hidden sm:block">Unsaved changes</span>
                </div>
                <div className="h-5 w-px bg-white/[0.10]" />
                <button onClick={handleDiscard} className="h-9 px-4 rounded-xl text-[12px] font-semibold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors duration-200">Discard</button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-[12px] font-semibold text-white bg-[linear-gradient(242deg,#a44bf3,#499ce8)] hover:brightness-110 shadow-[0_2px_16px_rgba(164,75,243,0.50)] active:scale-95 transition-all duration-200 disabled:opacity-60">
                  {isSaving ? <div className="h-3.5 w-3.5 border border-white border-t-transparent rounded-full animate-spin" /> : <Save size={12} />}
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {mounted && createPortal(
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/65 backdrop-blur-lg z-[9998]" onClick={() => setShowModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.88, y: 28 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 28 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90vw] max-w-sm">
                <div className="relative bg-white dark:bg-[#0b1120] rounded-3xl p-8 border border-white/[0.10] shadow-[0_32px_96px_rgba(0,0,0,0.80),inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#a44bf3]/[0.04] to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <button onClick={() => setShowModal(false)} className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
                      <X size={14} className="text-gray-500" />
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-[#a44bf3]/10 border border-[#a44bf3]/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(164,75,243,0.15)]">
                      <AlertTriangle size={22} className="text-[#a44bf3]" />
                    </div>
                    <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-2">Unsaved Changes</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-7">You have unsaved edits on your brand page. Leaving now will discard all changes made in this session.</p>
                    <div className="flex flex-col gap-2.5">
                      <button onClick={() => setShowModal(false)} className="w-full h-11 rounded-2xl text-[13px] font-semibold text-white bg-[linear-gradient(242deg,#a44bf3,#499ce8)] hover:brightness-110 shadow-[0_2px_16px_rgba(164,75,243,0.40)] active:scale-[0.98] transition-all duration-200">Continue Editing</button>
                      <button onClick={() => { setShowModal(false); router.back(); }} className="w-full h-11 rounded-2xl text-[13px] font-semibold text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] transition-all duration-200">Leave Without Saving</button>
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