"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  Radio,
  Clock,
  CalendarDays,
  AlertTriangle,
  Eye,
  MousePointerClick,
  Percent,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  MapPin,
  Calendar,
  Film,
  LayoutGrid,
  Check,
  X,
  Sparkles,
  Flame,
  Search,
  CheckCircle2,
  Star,
  Users,
  Building2,
  Play,
  Heart,
  Share2,
  Bookmark,
  Volume2,
  Video,
  Upload,
  Monitor,
  Smartphone,
  ArrowUpRight,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Filter,
} from "lucide-react";
import PageHeader from "../components/PageHeader";

const BRAND_GRADIENT = "linear-gradient(242deg,#a44bf3,#499ce8)";

const LOCATIONS = {
  India: {
    code: "in",
    states: {
      Karnataka: ["Bangalore Urban", "Mysore", "Mangalore", "Coorg"],
      Maharashtra: ["Mumbai City", "Pune", "Thane", "Nagpur"],
      "Delhi NCR": ["Central Delhi", "South Delhi", "Gurgaon", "Noida"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
      Goa: ["North Goa", "South Goa"],
    },
  },
  UAE: {
    code: "ae",
    states: {
      Dubai: ["Downtown Dubai", "Dubai Marina & JBR", "Business Bay", "Palm Jumeirah"],
      "Abu Dhabi": ["Corniche", "Yas Island", "Al Reem Island"],
      Sharjah: ["Al Majaz", "Al Qasba", "Al Taawun"],
    },
  },
};

const MOCK_PROPERTIES = [
  {
    id: "prop-1",
    name: "Swarnagiri Mantap",
    location: "Bangalore Urban, Karnataka",
    country: "India",
    state: "Karnataka",
    district: "Bangalore Urban",
    reelsCount: 3,
    reels: [
      {
        id: "reel-1-1",
        title: "Grand Wedding Entry & Mandap Walkthrough",
        duration: "0:45",
        views: "14.2K",
        likes: "1.8K",
        thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=75",
      },
      {
        id: "reel-1-2",
        title: "Evening Lighting & Royal Lawn Ambience",
        duration: "0:30",
        views: "8.6K",
        likes: "920",
        thumbnail: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=75",
      },
      {
        id: "reel-1-3",
        title: "Traditional Dining & Buffet Setup",
        duration: "0:50",
        views: "5.1K",
        likes: "640",
        thumbnail: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=75",
      },
    ],
  },
  {
    id: "prop-2",
    name: "Royal Banquet Hall",
    location: "South Delhi, Delhi NCR",
    country: "India",
    state: "Delhi NCR",
    district: "South Delhi",
    reelsCount: 2,
    reels: [
      {
        id: "reel-2-1",
        title: "Luxury Ballroom Drone Tour",
        duration: "0:35",
        views: "22.4K",
        likes: "3.1K",
        thumbnail: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=75",
      },
      {
        id: "reel-2-2",
        title: "Stage & Floral Backdrop Reveal",
        duration: "0:40",
        views: "11.7K",
        likes: "1.4K",
        thumbnail: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=75",
      },
    ],
  },
  {
    id: "prop-3",
    name: "Lakeview Holiday Resort",
    location: "Coorg, Karnataka",
    country: "India",
    state: "Karnataka",
    district: "Coorg",
    reelsCount: 2,
    reels: [
      {
        id: "reel-3-1",
        title: "Sunset Lakeside Lawn Reception",
        duration: "0:55",
        views: "18.9K",
        likes: "2.7K",
        thumbnail: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=75",
      },
      {
        id: "reel-3-2",
        title: "Private Villa Guest Experience",
        duration: "0:25",
        views: "9.3K",
        likes: "1.1K",
        thumbnail: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=75",
      },
    ],
  },
  {
    id: "prop-4",
    name: "Zenith Studio & Open Terrace",
    location: "Mumbai City, Maharashtra",
    country: "India",
    state: "Maharashtra",
    district: "Mumbai City",
    reelsCount: 0,
    reels: [],
  },
];

const MOCK_CARD_SLOTS = [
  {
    id: "slot-1",
    name: "Slot #1 — Prime Discovery Header",
    tag: "Top Placement",
    status: "available",
    availableCount: 2,
    basePrice: 300,
    nationalPrice: 500,
    description: "Highest conversion slot featured directly on top category search results.",
  },
  {
    id: "slot-2",
    name: "Slot #2 — Category Spotlight Rank",
    tag: "High Intent",
    status: "limited",
    availableCount: 1,
    basePrice: 300,
    nationalPrice: 500,
    description: "Featured within the top 3 cards for users filtering in this district.",
  },
  {
    id: "slot-3",
    name: "Slot #3 — Filter Search Boost",
    tag: "Sold Out",
    status: "sold_out",
    availableCount: 0,
    basePrice: 300,
    nationalPrice: 500,
    description: "Promoted card matching event capacity and budget filters.",
  },
  {
    id: "slot-4",
    name: "Slot #4 — Upcoming Weekend Surge",
    tag: "Opening Soon",
    status: "not_open",
    availableCount: 0,
    basePrice: 300,
    nationalPrice: 500,
    description: "Next month reservation window opening shortly.",
  },
];

const MOCK_REEL_SLOTS = [
  {
    id: "rslot-1",
    name: "Feed Reel Spotlight #1 (Top 3 Stories)",
    status: "available",
    availableCount: 2,
    pricePerDay: 500,
    description: "Appears within the top 3 items in the organizer mobile feed.",
  },
  {
    id: "rslot-2",
    name: "Explore Stream Placement #2",
    status: "limited",
    availableCount: 1,
    pricePerDay: 500,
    description: "Autoplays seamlessly across district exploration reels.",
  },
  {
    id: "rslot-3",
    name: "Weekend Special Reel Boost #3",
    status: "sold_out",
    availableCount: 0,
    pricePerDay: 500,
    description: "High-surge placement reserved for peak booking days.",
  },
  {
    id: "rslot-4",
    name: "Next-Month Advance Window #4",
    status: "not_open",
    availableCount: 0,
    pricePerDay: 500,
    description: "Future inventory opening soon.",
  },
];

const INITIAL_SOLO_BANNERS = [
  {
    id: "sb-1",
    venueName: "Swarnagiri Mantap",
    district: "Bangalore Urban",
    header: "Book Your Dream Royal Wedding",
    subheader: "Exclusive outdoor grand lawns with 1,500 guest capacity and luxury bridal suites.",
    ctaText: "Explore Venue",
    destination: "Parent Page",
    startDate: "Aug 15, 2026",
    endDate: "Sep 15, 2026",
    daysRemaining: 24,
    status: "Active",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "sb-2",
    venueName: "Royal Banquet Hall",
    district: "South Delhi",
    header: "Heritage Charm Meets Modern Luxury",
    subheader: "Sprawling crystal ballroom with premium live catering and valet parking.",
    ctaText: "Get Instant Quote",
    destination: "Individual Child Venue",
    startDate: "Sep 01, 2026",
    endDate: "Sep 20, 2026",
    daysRemaining: null,
    status: "Scheduled",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "sb-3",
    venueName: "Lakeview Holiday Resort",
    district: "Coorg",
    header: "Scenic Mountain & Lakeside Retreats",
    subheader: "Celebrate destination anniversaries, private weddings, and weekend family getaways.",
    ctaText: "Book Private Tour",
    destination: "Parent Page",
    startDate: "Sep 05, 2026",
    endDate: "Sep 25, 2026",
    daysRemaining: null,
    status: "Pending",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80",
  },
];

const INITIAL_ACTIVE_ADS = [
  {
    id: "ad-1",
    title: "The Grand Palace Ballroom",
    type: "Sponsored Card",
    location: "Downtown Dubai, UAE",
    status: "Active",
    startDate: "Aug 10, 2026",
    endDate: "Sep 10, 2026",
    daysRemaining: 19,
    impressions: "38,420",
    clicks: "1,520",
    ctr: "3.95%",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=70",
  },
  {
    id: "ad-2",
    title: "Emerald Palm Farmstay & Villa",
    type: "Sponsored Reel",
    location: "Al Barsha, UAE",
    status: "Active",
    startDate: "Aug 18, 2026",
    endDate: "Aug 26, 2026",
    daysRemaining: 4,
    impressions: "16,740",
    clicks: "782",
    ctr: "4.67%",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=70",
  },
  {
    id: "ad-3",
    title: "Royal Crystal Banquet Hall",
    type: "Solo Banner",
    location: "Marina Promenade, UAE",
    status: "Active",
    startDate: "Aug 01, 2026",
    endDate: "Aug 24, 2026",
    daysRemaining: 2,
    impressions: "54,190",
    clicks: "2,130",
    ctr: "3.93%",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=70",
  },
  {
    id: "ad-4",
    title: "Skyline Terrace & Open Lounge",
    type: "Sponsored Card",
    location: "Business Bay, UAE",
    status: "Active",
    startDate: "Aug 14, 2026",
    endDate: "Sep 14, 2026",
    daysRemaining: 23,
    impressions: "21,300",
    clicks: "890",
    ctr: "4.18%",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=70",
  },
];

const INITIAL_UPCOMING_ADS = [
  {
    id: "ad-up-1",
    title: "Sunset Dunes Luxury Oasis",
    type: "Solo Banner",
    location: "Al Qudra, UAE",
    status: "Scheduled",
    startDate: "Sep 01, 2026",
    endDate: "Sep 30, 2026",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=70",
  },
  {
    id: "ad-up-2",
    title: "The Glasshouse Garden Venue",
    type: "Sponsored Reel",
    location: "Jumeirah, UAE",
    status: "Pending",
    startDate: "Sep 05, 2026",
    endDate: "Sep 20, 2026",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=70",
  },
  {
    id: "ad-up-3",
    title: "Starlight Open Amphitheatre",
    type: "Sponsored Card",
    location: "Dubai Hills, UAE",
    status: "Scheduled",
    startDate: "Sep 10, 2026",
    endDate: "Oct 10, 2026",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=70",
  },
];

function StatCard({ label, value, sub, icon: Icon, color }) {
  const colorMap = {
    emerald: "from-emerald-500/10 to-teal-500/5 border-emerald-200/60 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400",
    amber: "from-amber-500/10 to-orange-500/5 border-amber-200/60 dark:border-amber-800/30 text-amber-600 dark:text-amber-400",
    blue: "from-blue-500/10 to-cyan-500/5 border-blue-200/60 dark:border-blue-800/30 text-blue-600 dark:text-blue-400",
    rose: "from-rose-500/10 to-pink-500/5 border-rose-200/60 dark:border-rose-800/30 text-rose-600 dark:text-rose-400",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorMap[color] || colorMap.emerald} border p-4 sm:p-5 transition-all hover:shadow-md hover:-translate-y-px bg-white dark:bg-gray-900/60`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 truncate">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 leading-tight tracking-tight truncate">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
              {sub}
            </p>
          )}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 dark:bg-white/10 shadow-sm">
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/40",
    Scheduled: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-800/40",
    Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800/40",
    Expired: "bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800/60 dark:text-gray-400 dark:ring-gray-700/50",
    Rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800/40",
  };

  const dots = {
    Active: "bg-emerald-500",
    Scheduled: "bg-sky-500",
    Pending: "bg-amber-500",
    Expired: "bg-gray-400",
    Rejected: "bg-rose-500",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.Active}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.Active}`} />
      {status}
    </span>
  );
}

function AdTypeBadge({ type }) {
  const styles = {
    "Sponsored Card": {
      cls: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-800/40",
      icon: LayoutGrid,
    },
    "Sponsored Reel": {
      cls: "bg-pink-50 text-pink-700 ring-1 ring-pink-200/80 dark:bg-pink-950/40 dark:text-pink-300 dark:ring-pink-800/40",
      icon: Film,
    },
    "Solo Banner": {
      cls: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-800/40",
      icon: Megaphone,
    },
  };

  const current = styles[type] || styles["Sponsored Card"];
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${current.cls}`}>
      <Icon size={12} strokeWidth={2} />
      {type}
    </span>
  );
}

function AdActionDropdown({ ad, onView, onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors focus:outline-none"
        aria-label="Actions menu"
      >
        <MoreVertical size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute end-0 mt-1 z-30 w-36 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl py-1.5 text-xs font-medium overflow-hidden"
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onView(ad);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
              <Eye size={13} />
              View
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit(ad);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
              <Edit2 size={13} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDuplicate(ad);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
              <Copy size={13} />
              Duplicate
            </button>
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete(ad);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActiveAdCard({ ad, onView, onEdit, onDuplicate, onDelete }) {
  const isExpiringSoon = ad.daysRemaining <= 7;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:border-gray-200 dark:hover:border-white/[0.12]">
      <div>
        <div className="relative h-44 sm:h-48 w-full rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
          <img
            src={ad.image}
            alt={ad.title || ad.venueName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          <div className="absolute top-3 start-3">
            <AdTypeBadge type={ad.type} />
          </div>

          <div className="absolute top-3 end-3">
            <StatusBadge status={ad.status} />
          </div>

          <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <Calendar size={12} className="text-gray-300" />
              <span>{ad.startDate} – {ad.endDate}</span>
            </div>

            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold shadow-sm ${
              isExpiringSoon
                ? "bg-rose-500/90 text-white animate-pulse"
                : "bg-black/60 backdrop-blur-md text-emerald-300"
            }`}>
              {isExpiringSoon && <Flame size={12} />}
              <span>{ad.daysRemaining} days left</span>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
              {ad.title || ad.venueName}
            </h3>
            <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              <MapPin size={12} className="shrink-0 text-gray-400" />
              {ad.location || ad.district}
            </p>
          </div>
          <AdActionDropdown
            ad={ad}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </div>
      </div>

      <div className="mt-2 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] p-2.5">
            <p className="flex items-center justify-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">
              <Eye size={12} />
              Views
            </p>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {ad.impressions || "38,420"}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] p-2.5">
            <p className="flex items-center justify-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">
              <MousePointerClick size={12} />
              Clicks
            </p>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {ad.clicks || "1,520"}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] p-2.5">
            <p className="flex items-center justify-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">
              <Percent size={12} />
              CTR
            </p>
            <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
              {ad.ctr || "3.95%"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UpcomingAdItem({ ad, onView, onEdit, onDuplicate, onDelete }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] hover:shadow-sm transition-all">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
          <img src={ad.image} alt={ad.title || ad.venueName} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
              {ad.title || ad.venueName}
            </h4>
            <AdTypeBadge type={ad.type} />
            <StatusBadge status={ad.status} />
          </div>
          <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate">
            <MapPin size={12} className="shrink-0 text-gray-400" />
            {ad.location || ad.district}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03] px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/[0.06]">
          <Calendar size={13} className="text-violet-500 shrink-0" />
          <span>{ad.startDate} – {ad.endDate}</span>
        </div>

        <AdActionDropdown
          ad={ad}
          onView={onView}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

function SponsoredCardLivePreview({ venueTitle, locationName, startingPrice }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#0f1117] border border-gray-200/80 dark:border-white/[0.08] shadow-lg transition-all">
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=75"
          alt="Venue preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

        <div className="absolute top-3 start-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-gray-950 shadow-md ring-1 ring-amber-300">
            <Sparkles size={12} className="text-gray-950 fill-gray-950" />
            SPONSORED
          </span>
        </div>

        <div className="absolute top-3 end-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            4.9 (128)
          </span>
        </div>

        <div className="absolute bottom-3 start-3 end-3 text-white">
          <p className="text-xs font-medium text-gray-200 flex items-center gap-1">
            <MapPin size={12} className="text-amber-300" />
            {locationName || "Bangalore Urban, Karnataka"}
          </p>
          <h4 className="text-base sm:text-lg font-bold text-white leading-tight truncate mt-0.5">
            {venueTitle || "The Royal Palace & Grand Lawns"}
          </h4>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Users size={13} className="text-violet-500" />
            Up to 850 Guests
          </span>
          <span className="flex items-center gap-1">
            <Building2 size={13} className="text-emerald-500" />
            Indoor + Lawn
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.06]">
          <div>
            <p className="text-[10px] uppercase font-semibold text-gray-400">Starting from</p>
            <p className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100">
              {startingPrice || "₹1,50,000"} <span className="text-xs font-normal text-gray-400">/ event</span>
            </p>
          </div>

          <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40">
            View Details
          </span>
        </div>
      </div>
    </div>
  );
}

function SponsoredReelLivePreview({ propertyName, reel, districtName }) {
  if (!reel) {
    return (
      <div className="h-[440px] rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08] flex flex-col items-center justify-center p-6 text-center text-gray-400 bg-gray-50/50 dark:bg-gray-900/30">
        <Film size={36} className="text-gray-300 dark:text-gray-700 mb-2" />
        <p className="text-xs font-semibold">Select a reel to view preview</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[280px] sm:max-w-[300px] rounded-[28px] overflow-hidden bg-black border-4 border-gray-900 dark:border-gray-800 shadow-2xl">
      <div className="relative h-[460px] w-full overflow-hidden">
        <img
          src={reel.thumbnail}
          alt={reel.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />

        <div className="absolute top-4 start-4 end-4 flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-pink-500 text-white shadow-lg shadow-pink-500/30">
            <Sparkles size={11} />
            SPONSORED REEL
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md">
            <Volume2 size={13} />
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-md ring-4 ring-white/20 shadow-xl">
            <Play size={24} className="fill-white ms-1" />
          </div>
        </div>

        <div className="absolute end-3 bottom-20 flex flex-col items-center gap-4 text-white z-10">
          <div className="flex flex-col items-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
              <Heart size={16} className="text-white" />
            </span>
            <span className="text-[10px] font-bold mt-1">{reel.likes}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
              <Share2 size={16} className="text-white" />
            </span>
            <span className="text-[10px] font-bold mt-1">Share</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
              <Bookmark size={16} className="text-white" />
            </span>
            <span className="text-[10px] font-bold mt-1">Save</span>
          </div>
        </div>

        <div className="absolute bottom-4 start-4 end-16 text-white z-10 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-pink-300 font-semibold">
            <MapPin size={12} />
            <span>{districtName || "Promoted Location"}</span>
          </div>
          <h4 className="text-sm font-bold leading-tight line-clamp-2">
            {reel.title}
          </h4>
          <p className="text-[11px] text-gray-300 font-medium truncate">
            {propertyName}
          </p>
        </div>
      </div>
    </div>
  );
}

function SoloBannerLivePreview({ mode, venueName, header, subheader, ctaText, ctaDestination, image }) {
  const isMobile = mode === "mobile";

  return (
    <div className="relative mx-auto w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200/80 dark:border-white/[0.08] transition-all bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900">
      <div className={`relative w-full overflow-hidden ${isMobile ? "max-w-[340px] mx-auto min-h-[360px] p-5 flex flex-col justify-between" : "min-h-[220px] sm:min-h-[260px] p-6 sm:p-8 flex flex-col justify-between"}`}>
        {image ? (
          <>
            <img
              src={image}
              alt="Solo banner backdrop"
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-900/30 to-gray-950" />
        )}

        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500 text-white shadow-md ring-1 ring-indigo-400/50">
            <Sparkles size={11} />
            SOLO BANNER • 100% EXCLUSIVE
          </span>

          <span className="text-[11px] font-semibold text-gray-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
            {ctaDestination}
          </span>
        </div>

        <div className={`relative z-10 my-4 space-y-2 ${isMobile ? "max-w-full" : "max-w-xl"}`}>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            {venueName || "Your Venue Name"}
          </p>
          <h3 className={`font-black text-white leading-tight tracking-tight ${isMobile ? "text-lg" : "text-xl sm:text-2xl lg:text-3xl"}`}>
            {header || "Headline Header Text (Up to 50 chars)"}
          </h3>
          <p className={`text-gray-300 leading-relaxed ${isMobile ? "text-xs line-clamp-3" : "text-xs sm:text-sm line-clamp-2"}`}>
            {subheader || "Detailed supporting value proposition and features of your property (Up to 100 chars)."}
          </p>
        </div>

        <div className="relative z-10 pt-2 flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {ctaText || "Explore Venue"}
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SponsoredCardsSection({ onBookingSuccess }) {
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState("Bangalore Urban");

  const [placementType, setPlacementType] = useState("standard");
  const [nationalDistricts, setNationalDistricts] = useState(["Bangalore Urban"]);

  const [selectedSlotId, setSelectedSlotId] = useState("slot-1");
  const [durationUnit, setDurationUnit] = useState("days");
  const [durationValue, setDurationValue] = useState(10);

  const availableStates = useMemo(() => {
    return Object.keys(LOCATIONS[selectedCountry]?.states || {});
  }, [selectedCountry]);

  const availableDistricts = useMemo(() => {
    return LOCATIONS[selectedCountry]?.states[selectedState] || [];
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    const defaultState = availableStates[0] || "";
    setSelectedState(defaultState);
  }, [availableStates]);

  useEffect(() => {
    const defaultDistrict = availableDistricts[0] || "";
    setSelectedDistrict(defaultDistrict);
    setNationalDistricts(defaultDistrict ? [defaultDistrict] : []);
  }, [availableDistricts]);

  const handleCountryChange = (c) => {
    setSelectedCountry(c);
  };

  const handleStateChange = (s) => {
    setSelectedState(s);
  };

  const handleDistrictChange = (d) => {
    setSelectedDistrict(d);
    if (!nationalDistricts.includes(d)) {
      setNationalDistricts([d]);
    }
  };

  const toggleNationalDistrict = (dist) => {
    if (nationalDistricts.includes(dist)) {
      if (nationalDistricts.length > 1) {
        setNationalDistricts((prev) => prev.filter((d) => d !== dist));
      }
    } else {
      if (nationalDistricts.length < 3) {
        setNationalDistricts((prev) => [...prev, dist]);
      }
    }
  };

  const selectedSlot = useMemo(() => {
    return MOCK_CARD_SLOTS.find((s) => s.id === selectedSlotId) || MOCK_CARD_SLOTS[0];
  }, [selectedSlotId]);

  const ratePerDay = placementType === "national" ? 500 : 300;
  const daysTotal = durationUnit === "months" ? durationValue * 30 : durationValue;
  const districtMultiplier = placementType === "national" ? nationalDistricts.length : 1;
  const estimatedTotal = ratePerDay * daysTotal * districtMultiplier;

  const handleBookSlot = () => {
    const bookingDetails = {
      title: "Sponsored Card Slot Selected",
      type: "Sponsored Card",
      placement: placementType === "national" ? "National Visibility" : "Standard Placement",
      districts: placementType === "national" ? nationalDistricts : [selectedDistrict],
      slotName: selectedSlot.name,
      durationText: `${durationValue} ${durationUnit === "months" ? (durationValue === 1 ? "Month (30 Days)" : "Months") : (durationValue === 1 ? "Day" : "Days")}`,
      totalText: `₹${estimatedTotal.toLocaleString("en-IN")}`,
    };
    onBookingSuccess(bookingDetails);
  };

  const renderSlotIndicator = (status, count) => {
    if (status === "available") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {count} Slots Available
        </span>
      );
    }
    if (status === "limited") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          1 Slot Left
        </span>
      );
    }
    if (status === "sold_out") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Sold Out
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800/60 dark:text-gray-400">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        Not Yet Open
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-transparent border border-violet-200/60 dark:border-violet-800/30 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-xs font-bold ring-1 ring-violet-200 dark:ring-violet-800">
            <Sparkles size={13} />
            PREMIUM PLACEMENT
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Sponsored Cards
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Promote your venue across top category searches, high-intent district filters, and organizer discovery feeds. Increase impressions by up to 5x with guaranteed priority placements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold text-xs">
                1
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Select Campaign Location
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                  {Object.keys(LOCATIONS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  State / Region
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Primary District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold text-xs">
                  2
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Placement Reach
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div
                onClick={() => setPlacementType("standard")}
                className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                  placementType === "standard"
                    ? "bg-violet-50/60 dark:bg-violet-950/30 border-violet-400 ring-2 ring-violet-400/30"
                    : "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Standard Placement
                  </span>
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                    ₹300 / day
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Targets 1 specific district: <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedDistrict}</span>. Ideal for localized venue discovery.
                </p>
              </div>

              <div
                onClick={() => setPlacementType("national")}
                className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                  placementType === "national"
                    ? "bg-violet-50/60 dark:bg-violet-950/30 border-violet-400 ring-2 ring-violet-400/30"
                    : "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      National Visibility
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Multi
                    </span>
                  </div>
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                    ₹500 / day
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Select up to 3 target districts across {selectedState} for maximum multi-hub exposure.
                </p>
              </div>
            </div>

            {placementType === "national" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-3 border-t border-gray-100 dark:border-white/[0.06] space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Select up to 3 Districts:
                  </span>
                  <span className="font-bold text-violet-600 dark:text-violet-400">
                    {nationalDistricts.length} / 3 selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableDistricts.map((dist) => {
                    const isSelected = nationalDistricts.includes(dist);
                    const isMaxReached = nationalDistricts.length >= 3 && !isSelected;

                    return (
                      <button
                        key={dist}
                        type="button"
                        disabled={isMaxReached}
                        onClick={() => toggleNationalDistrict(dist)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-violet-600 text-white shadow-sm"
                            : isMaxReached
                            ? "bg-gray-100 dark:bg-gray-800/40 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        {dist}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold text-xs">
                  3
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Select Available Slot
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                Location: {selectedDistrict}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {MOCK_CARD_SLOTS.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isSelectable = slot.status === "available" || slot.status === "limited";

                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      if (isSelectable) setSelectedSlotId(slot.id);
                    }}
                    className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      !isSelectable
                        ? "opacity-55 cursor-not-allowed bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
                        : isSelected
                        ? "cursor-pointer bg-violet-50/60 dark:bg-violet-950/30 border-violet-500 ring-2 ring-violet-500/20 shadow-sm"
                        : "cursor-pointer bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          {slot.name}
                        </span>
                        {renderSlotIndicator(slot.status, slot.availableCount)}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                        {slot.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-white/[0.06] text-xs">
                      <span className="font-bold text-violet-600 dark:text-violet-400">
                        ₹{placementType === "national" ? slot.nationalPrice : slot.basePrice} <span className="font-normal text-gray-400">/ day</span>
                      </span>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 font-bold text-violet-700 dark:text-violet-300">
                          <CheckCircle2 size={14} />
                          Selected
                        </span>
                      ) : isSelectable ? (
                        <span className="text-gray-400 group-hover:text-gray-600">
                          Select slot
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold text-xs">
                  4
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Campaign Duration
                </h3>
              </div>

              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setDurationUnit("days");
                    setDurationValue(10);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    durationUnit === "days"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDurationUnit("months");
                    setDurationValue(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    durationUnit === "months"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Months
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {(durationUnit === "days" ? [7, 10, 14, 21, 30] : [1, 2, 3, 6]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDurationValue(val)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      durationValue === val
                        ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                        : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/[0.06] hover:bg-gray-100"
                    }`}
                  >
                    {val} {durationUnit === "days" ? "Days" : val === 1 ? "Month" : "Months"}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                <span>Active window:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {daysTotal} total calendar days
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Live Sponsored Card Preview
              </h3>
              <span className="text-[11px] text-gray-400">
                Category Feed Card
              </span>
            </div>

            <SponsoredCardLivePreview
              venueTitle="The Grand Orchid Pavilion"
              locationName={`${selectedDistrict}, ${selectedState}`}
              startingPrice="₹1,85,000"
            />
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06]">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Price Summary
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                Sponsored Card
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Placement Type</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {placementType === "national" ? "National Visibility" : "Standard Placement"}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Target District(s)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 max-w-[200px] text-right truncate">
                  {placementType === "national" ? nationalDistricts.join(", ") : selectedDistrict}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Selected Slot</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                  {selectedSlot.name.split("—")[0]}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Duration</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {durationValue} {durationUnit} ({daysTotal} Days)
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Calculation</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  ₹{ratePerDay} × {daysTotal} days {districtMultiplier > 1 ? `× ${districtMultiplier} dist.` : ""}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    Estimated Total
                  </p>
                  <p className="text-[10px] text-gray-400">
                    All taxes & placement fees included
                  </p>
                </div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                  ₹{estimatedTotal.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBookSlot}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              style={{ background: BRAND_GRADIENT }}
            >
              <Sparkles size={16} />
              Book Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SponsoredReelsSection({ onBookingSuccess }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState("prop-1");
  const [selectedReelId, setSelectedReelId] = useState("reel-1-1");

  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState("Bangalore Urban");

  const [startDate, setStartDate] = useState("2026-08-25");
  const [endDate, setEndDate] = useState("2026-09-04");

  const [selectedSlotId, setSelectedSlotId] = useState("rslot-1");

  const selectedProperty = useMemo(() => {
    return MOCK_PROPERTIES.find((p) => p.id === selectedPropertyId) || MOCK_PROPERTIES[0];
  }, [selectedPropertyId]);

  const propertyReels = useMemo(() => {
    return selectedProperty?.reels || [];
  }, [selectedProperty]);

  const selectedReel = useMemo(() => {
    return propertyReels.find((r) => r.id === selectedReelId) || propertyReels[0] || null;
  }, [propertyReels, selectedReelId]);

  useEffect(() => {
    if (propertyReels.length > 0 && (!selectedReelId || !propertyReels.some((r) => r.id === selectedReelId))) {
      setSelectedReelId(propertyReels[0].id);
    }
  }, [propertyReels, selectedReelId]);

  const availableStates = useMemo(() => {
    return Object.keys(LOCATIONS[selectedCountry]?.states || {});
  }, [selectedCountry]);

  const availableDistricts = useMemo(() => {
    return LOCATIONS[selectedCountry]?.states[selectedState] || [];
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    const defaultState = availableStates[0] || "";
    setSelectedState(defaultState);
  }, [availableStates]);

  useEffect(() => {
    const defaultDistrict = availableDistricts[0] || "";
    setSelectedDistrict(defaultDistrict);
  }, [availableDistricts]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 10;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const campaignDays = calculateDays();
  const pricePerDay = 500;
  const estimatedTotal = campaignDays * pricePerDay;

  const selectedSlot = useMemo(() => {
    return MOCK_REEL_SLOTS.find((s) => s.id === selectedSlotId) || MOCK_REEL_SLOTS[0];
  }, [selectedSlotId]);

  const handleBookSlot = () => {
    const bookingDetails = {
      title: "Sponsored Reel Slot Selected",
      type: "Sponsored Reel",
      property: selectedProperty?.name,
      reelTitle: selectedReel?.title || "Custom Selected Reel",
      district: selectedDistrict,
      dates: `${startDate} to ${endDate} (${campaignDays} Days)`,
      slotName: selectedSlot.name,
      totalText: `₹${estimatedTotal.toLocaleString("en-IN")}`,
    };
    onBookingSuccess(bookingDetails);
  };

  const renderSlotIndicator = (status, count) => {
    if (status === "available") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {count} Slots Available
        </span>
      );
    }
    if (status === "limited") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          1 Slot Left
        </span>
      );
    }
    if (status === "sold_out") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Sold Out
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800/60 dark:text-gray-400">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        Not Yet Open
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-pink-600/10 via-rose-600/5 to-transparent border border-pink-200/60 dark:border-pink-800/30 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-xs font-bold ring-1 ring-pink-200 dark:ring-pink-800">
            <Film size={13} />
            IMMERSIVE VIDEO BOOST
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Sponsored Reels
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Spotlight your short-form video stories in the high-engagement mobile video feed. Capture modern wedding planners, couples, and event creators with immersive visual tours.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-bold text-xs">
                1
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Choose Property
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MOCK_PROPERTIES.map((prop) => {
                const isSelected = selectedPropertyId === prop.id;
                return (
                  <div
                    key={prop.id}
                    onClick={() => setSelectedPropertyId(prop.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all text-left ${
                      isSelected
                        ? "bg-pink-50/60 dark:bg-pink-950/30 border-pink-500 ring-2 ring-pink-500/20 shadow-sm"
                        : "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                        {prop.name}
                      </span>
                      {isSelected && <Check size={14} className="text-pink-600 dark:text-pink-400" />}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mb-2">
                      {prop.location}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      <Video size={10} />
                      {prop.reelsCount} {prop.reelsCount === 1 ? "Reel" : "Reels"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-bold text-xs">
                  2
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Select Reel from {selectedProperty?.name}
                </h3>
              </div>
              <span className="text-xs font-semibold text-pink-600 dark:text-pink-400">
                {propertyReels.length} available
              </span>
            </div>

            {propertyReels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {propertyReels.map((reel) => {
                  const isSelected = selectedReelId === reel.id;

                  return (
                    <div
                      key={reel.id}
                      onClick={() => setSelectedReelId(reel.id)}
                      className={`cursor-pointer group relative rounded-2xl overflow-hidden border transition-all ${
                        isSelected
                          ? "border-pink-500 ring-2 ring-pink-500/30 shadow-md scale-[1.02]"
                          : "border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                      }`}
                    >
                      <div className="relative h-36 w-full bg-gray-900 overflow-hidden">
                        <img
                          src={reel.thumbnail}
                          alt={reel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40" />

                        <div className="absolute top-2 start-2">
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">
                            {reel.duration}
                          </span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                            isSelected
                              ? "bg-pink-500 text-white"
                              : "bg-white/40 text-white backdrop-blur-md"
                          }`}>
                            <Play size={14} className="fill-current ms-0.5" />
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 end-2 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white shadow-md">
                            <Check size={12} />
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-white dark:bg-gray-900/90 space-y-1">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                          {reel.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>{reel.views} views</span>
                          <span>{reel.likes} likes</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08] text-xs text-gray-400 space-y-2">
                <Video size={28} className="mx-auto text-gray-300 dark:text-gray-600" />
                <p className="font-semibold text-gray-600 dark:text-gray-300">No uploaded reels found for this property.</p>
                <p>Upload a reel from your listing media tab to sponsor it here.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-bold text-xs">
                3
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Target Location
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                >
                  {Object.keys(LOCATIONS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  State / Region
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Target District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-bold text-xs">
                  4
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Select Reel Slot
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {MOCK_REEL_SLOTS.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isSelectable = slot.status === "available" || slot.status === "limited";

                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      if (isSelectable) setSelectedSlotId(slot.id);
                    }}
                    className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      !isSelectable
                        ? "opacity-55 cursor-not-allowed bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
                        : isSelected
                        ? "cursor-pointer bg-pink-50/60 dark:bg-pink-950/30 border-pink-500 ring-2 ring-pink-500/20 shadow-sm"
                        : "cursor-pointer bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          {slot.name}
                        </span>
                        {renderSlotIndicator(slot.status, slot.availableCount)}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                        {slot.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-white/[0.06] text-xs">
                      <span className="font-bold text-pink-600 dark:text-pink-400">
                        ₹{slot.pricePerDay} <span className="font-normal text-gray-400">/ day</span>
                      </span>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 font-bold text-pink-700 dark:text-pink-300">
                          <CheckCircle2 size={14} />
                          Selected
                        </span>
                      ) : isSelectable ? (
                        <span className="text-gray-400">Select</span>
                      ) : (
                        <span className="text-gray-400">Unavailable</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-bold text-xs">
                  5
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Campaign Duration
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300">
                {campaignDays} Total Days
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Live Sponsored Reel Preview
              </h3>
              <span className="text-[11px] text-gray-400">
                Mobile Story Card
              </span>
            </div>

            <SponsoredReelLivePreview
              propertyName={selectedProperty?.name}
              reel={selectedReel}
              districtName={selectedDistrict}
            />
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06]">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Booking Summary
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                Sponsored Reel
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Property</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                  {selectedProperty?.name}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Selected Reel</span>
                <span className="font-semibold text-pink-600 dark:text-pink-400 truncate max-w-[200px]">
                  {selectedReel?.title || "None selected"}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Target District</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedDistrict}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Campaign Window</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {startDate} to {endDate}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Rate Breakdown</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  ₹{pricePerDay} × {campaignDays} days
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    Estimated Total
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    Queued as Pending Approval
                  </p>
                </div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                  ₹{estimatedTotal.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!selectedReel}
              onClick={handleBookSlot}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                !selectedReel
                  ? "bg-gray-300 dark:bg-gray-800 cursor-not-allowed opacity-60"
                  : "shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 hover:-translate-y-0.5 active:translate-y-0"
              }`}
              style={{ background: selectedReel ? "linear-gradient(242deg,#ec4899,#8b5cf6)" : undefined }}
            >
              <Film size={16} />
              Book Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SoloBannersSection({ onBookingSuccess }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState("prop-1");

  const [header, setHeader] = useState("Book Your Dream Royal Wedding");
  const [subheader, setSubheader] = useState("Exclusive outdoor grand lawns with 1,500 guest capacity and luxury suites.");
  const [ctaText, setCtaText] = useState("Explore Venue");
  const [ctaDestination, setCtaDestination] = useState("Parent Page");

  const [bannerImage, setBannerImage] = useState("https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop&q=80");
  const [imageError, setImageError] = useState(null);

  const [previewMode, setPreviewMode] = useState("desktop");

  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState("Bangalore Urban");

  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-15");

  const [existingBanners, setExistingBanners] = useState(INITIAL_SOLO_BANNERS);

  const selectedProperty = useMemo(() => {
    return MOCK_PROPERTIES.find((p) => p.id === selectedPropertyId) || MOCK_PROPERTIES[0];
  }, [selectedPropertyId]);

  const availableStates = useMemo(() => {
    return Object.keys(LOCATIONS[selectedCountry]?.states || {});
  }, [selectedCountry]);

  const availableDistricts = useMemo(() => {
    return LOCATIONS[selectedCountry]?.states[selectedState] || [];
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    const defaultState = availableStates[0] || "";
    setSelectedState(defaultState);
  }, [availableStates]);

  useEffect(() => {
    const defaultDistrict = availableDistricts[0] || "";
    setSelectedDistrict(defaultDistrict);
  }, [availableDistricts]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 14;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const campaignDays = calculateDays();
  const pricePerDay = 750;
  const estimatedTotal = campaignDays * pricePerDay;

  const isDistrictOccupied = selectedDistrict === "Bangalore Urban";

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Unsupported format. Please upload JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("File size exceeds 5MB limit.");
      return;
    }

    setImageError(null);
    const url = URL.createObjectURL(file);
    setBannerImage(url);
  };

  const handleBookBanner = () => {
    const bookingDetails = {
      title: "Solo Banner submitted successfully",
      type: "Solo Banner",
      property: selectedProperty?.name,
      district: selectedDistrict,
      dates: `${startDate} to ${endDate} (${campaignDays} Days)`,
      totalText: `₹${estimatedTotal.toLocaleString("en-IN")}`,
    };
    onBookingSuccess(bookingDetails);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-transparent border border-indigo-200/60 dark:border-indigo-800/30 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold ring-1 ring-indigo-200 dark:ring-indigo-800">
            <Megaphone size={13} />
            100% EXCLUSIVE TAKEOVER
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Solo Banners
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Own the main billboard placement on district and category search results. High-impact full-width real estate delivering undivided customer focus.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                1
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Select Property
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MOCK_PROPERTIES.map((prop) => {
                const isSelected = selectedPropertyId === prop.id;
                return (
                  <div
                    key={prop.id}
                    onClick={() => setSelectedPropertyId(prop.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all text-left ${
                      isSelected
                        ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                        : "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                        {prop.name}
                      </span>
                      {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {prop.location}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                2
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Banner Copy & Call to Action
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Header Headline
                  </label>
                  <span className={`text-[11px] font-mono ${header.length > 50 ? "text-rose-500 font-bold" : "text-gray-400"}`}>
                    {header.length} / 50
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={50}
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="e.g. Book Your Dream Royal Wedding"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Sub-header Description
                  </label>
                  <span className={`text-[11px] font-mono ${subheader.length > 100 ? "text-rose-500 font-bold" : "text-gray-400"}`}>
                    {subheader.length} / 100
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={100}
                  value={subheader}
                  onChange={(e) => setSubheader(e.target.value)}
                  placeholder="e.g. Exclusive grand lawns with 1,500 capacity."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Explore Venue"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    CTA Click Destination
                  </label>
                  <select
                    value={ctaDestination}
                    onChange={(e) => setCtaDestination(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="Parent Page">Parent Page</option>
                    <option value="Individual Child Venue">Individual Child Venue</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  3
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Banner Image Backdrop
                </h3>
              </div>
              <span className="text-xs text-gray-400">JPG, PNG, WEBP (Max 5MB)</span>
            </div>

            <div className="space-y-3">
              <label className="border-2 border-dashed border-gray-200 dark:border-white/[0.10] hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-gray-50/50 dark:bg-gray-900/30">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFile}
                  className="hidden"
                />
                <Upload size={24} className="text-indigo-500 mb-2" />
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Click to upload billboard photo
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Recommended size: 1920 × 600 px
                </p>
              </label>

              {imageError && (
                <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                  <AlertTriangle size={13} />
                  {imageError}
                </p>
              )}

              {bannerImage && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-white/[0.06] text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={bannerImage} alt="Banner thumb" className="w-10 h-7 object-cover rounded-md" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Custom background attached</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerImage(null)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                4
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Target District & Schedule
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {Object.keys(LOCATIONS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {isDistrictOccupied && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <Info size={16} className="shrink-0 text-amber-600 mt-0.5" />
                <p>
                  <span className="font-bold">Notice:</span> A solo banner is currently live in <span className="font-semibold">{selectedDistrict}</span>. Your slot will be prioritized for the upcoming scheduled rotation window.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Live Billboard Preview
              </h3>

              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewMode === "desktop"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Monitor size={12} />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewMode === "mobile"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Smartphone size={12} />
                  Mobile
                </button>
              </div>
            </div>

            <SoloBannerLivePreview
              mode={previewMode}
              venueName={selectedProperty?.name}
              header={header}
              subheader={subheader}
              ctaText={ctaText}
              ctaDestination={ctaDestination}
              image={bannerImage}
            />
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06]">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Booking Summary
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Solo Banner
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Property</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                  {selectedProperty?.name}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Target District</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedDistrict}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>CTA Target</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {ctaDestination}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Schedule Window</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {startDate} to {endDate} ({campaignDays} Days)
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Rate Calculation</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  ₹{pricePerDay} × {campaignDays} days
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    Estimated Total
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    Queued as Pending Approval
                  </p>
                </div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                  ₹{estimatedTotal.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBookBanner}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <Megaphone size={16} />
              Book Banner
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Existing Solo Banners
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Track live and scheduled district takeover billboards.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {existingBanners.length} Campaigns
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {existingBanners.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-4 space-y-3 shadow-sm"
            >
              <div className="relative h-32 rounded-xl overflow-hidden bg-gray-900">
                <img src={b.image} alt={b.venueName} className="w-full h-full object-cover opacity-60" />
                <div className="absolute top-2.5 start-2.5">
                  <StatusBadge status={b.status} />
                </div>
                {b.daysRemaining && (
                  <div className="absolute bottom-2.5 start-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-emerald-300">
                    {b.daysRemaining} days remaining
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  {b.venueName}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {b.district} • {b.destination}
                </p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-1 line-clamp-1">
                  "{b.header}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.06] text-xs text-gray-400">
                <span>{b.startDate} – {b.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingCalendarSection({ onBookingSuccess }) {
  const [viewMode, setViewMode] = useState("month");
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8);

  const [selectedAdType, setSelectedAdType] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState("Bangalore Urban");

  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedSlotId, setSelectedSlotId] = useState("cslot-1");
  const [startDate, setStartDate] = useState("2026-09-15");
  const [endDate, setEndDate] = useState("2026-09-25");
  const [inspectingSlot, setInspectingSlot] = useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const availableStates = useMemo(() => {
    return Object.keys(LOCATIONS[selectedCountry]?.states || {});
  }, [selectedCountry]);

  const availableDistricts = useMemo(() => {
    return LOCATIONS[selectedCountry]?.states[selectedState] || [];
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    const defaultState = availableStates[0] || "";
    setSelectedState(defaultState);
  }, [availableStates]);

  useEffect(() => {
    const defaultDistrict = availableDistricts[0] || "";
    setSelectedDistrict(defaultDistrict);
  }, [availableDistricts]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayIndex = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  const mockCalendarSlots = useMemo(() => {
    return [
      {
        id: "cslot-1",
        name: "Prime Header Showcase #1",
        type: "Sponsored Card",
        price: 300,
        status: "available",
        availableCount: 2,
        capacity: "2 of 2 slots open",
        advertisers: "None (Open for booking)",
        category: "Wedding Lawns & Banquets",
        description: "Appears at the very top of category discovery cards in this district.",
      },
      {
        id: "cslot-2",
        name: "Search Spotlight Slot #2",
        type: "Sponsored Card",
        price: 300,
        status: "limited",
        availableCount: 1,
        capacity: "1 slot remaining",
        advertisers: "The Grand Orchid Pavilion",
        category: "Resorts & Villas",
        description: "Featured in the top 3 cards when users apply district filters.",
      },
      {
        id: "cslot-3",
        name: "Story Stream Reel #1",
        type: "Sponsored Reel",
        price: 500,
        status: "available",
        availableCount: 2,
        capacity: "2 of 2 slots open",
        advertisers: "None (Open for booking)",
        category: "Mobile Video Feed",
        description: "Appears prominently inside the full-screen mobile story stream.",
      },
      {
        id: "cslot-4",
        name: "Exclusive Billboard Takeover",
        type: "Solo Banner",
        price: 750,
        status: "sold_out",
        availableCount: 0,
        capacity: "0 slots open (Sold Out)",
        advertisers: "Emerald Palace Resort",
        category: "Full Width Billboard",
        description: "100% share of voice header banner across the district.",
      },
      {
        id: "cslot-5",
        name: "Weekend Special Reel Boost #2",
        type: "Sponsored Reel",
        price: 500,
        status: "not_open",
        availableCount: 0,
        capacity: "Window opens in 14 days",
        advertisers: "Upcoming reserve pool",
        category: "Mobile Video Feed",
        description: "High surge weekend video placement opening next rotation cycle.",
      },
    ];
  }, []);

  const filteredSlots = useMemo(() => {
    if (selectedAdType === "All") return mockCalendarSlots;
    return mockCalendarSlots.filter((s) => s.type === selectedAdType);
  }, [selectedAdType, mockCalendarSlots]);

  const selectedSlot = useMemo(() => {
    return filteredSlots.find((s) => s.id === selectedSlotId) || filteredSlots[0] || mockCalendarSlots[0];
  }, [filteredSlots, selectedSlotId, mockCalendarSlots]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 10;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const campaignDays = calculateDays();
  const pricePerDay = selectedSlot?.price || 300;
  const estimatedTotal = campaignDays * pricePerDay;

  const getDayAvailability = (day) => {
    if (day % 7 === 0) return { status: "sold_out", text: "Sold Out", color: "rose" };
    if (day % 5 === 0) return { status: "limited", text: "1 Slot Left", color: "amber" };
    if (day > 26) return { status: "not_open", text: "Not Open", color: "gray" };
    return { status: "available", text: "2 Slots Available", color: "emerald" };
  };

  const handleContinueBooking = () => {
    const bookingDetails = {
      title: "Calendar Slot Booked Successfully",
      type: selectedSlot?.type || "Sponsored Ad",
      slotName: selectedSlot?.name || "Prime Slot",
      district: selectedDistrict,
      dates: `${startDate} to ${endDate} (${campaignDays} Days)`,
      totalText: `₹${estimatedTotal.toLocaleString("en-IN")}`,
    };
    onBookingSuccess(bookingDetails);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600/10 via-purple-600/5 to-transparent border border-violet-200/60 dark:border-violet-800/30 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-xs font-bold ring-1 ring-violet-200 dark:ring-violet-800">
            <CalendarDays size={13} />
            VISUAL INVENTORY CALENDAR
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Ad Booking Calendar
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Select available advertising slots and schedule your campaign across high-intent dates.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 me-1">
              <Filter size={13} className="text-violet-500" />
              Ad Type:
            </span>
            {["All", "Sponsored Cards", "Sponsored Reels", "Solo Banners"].map((type) => {
              const standardType = type === "Sponsored Cards" ? "Sponsored Card" : type === "Sponsored Reels" ? "Sponsored Reel" : type === "Solo Banners" ? "Solo Banner" : "All";
              const isSelected = selectedAdType === standardType;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedAdType(standardType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-500/20"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none"
            >
              {Object.keys(LOCATIONS).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none"
            >
              {availableStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 font-medium">
            <span className="font-semibold text-gray-800 dark:text-gray-200 me-1">Slot Legend:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Green: 2 Slots Available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Amber: 1 Slot Left
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Red: Sold Out
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              Grey: Not Yet Open
            </span>
          </div>

          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "month"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Month View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("year")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "year"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Year View
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 font-semibold">
                  {selectedDistrict}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMonth(8);
                    setCurrentYear(2026);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {viewMode === "month" ? (
              <div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {daysOfWeek.map((d) => (
                    <div key={d} className="text-[11px] font-bold text-gray-400 py-1 uppercase tracking-wider">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-xl bg-gray-50/40 dark:bg-gray-900/20 border border-transparent" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNumber = i + 1;
                    const isSelected = selectedDate === dayNumber;
                    const availability = getDayAvailability(dayNumber);
                    const isSoldOut = availability.status === "sold_out";
                    const isNotOpen = availability.status === "not_open";

                    return (
                      <div
                        key={dayNumber}
                        onClick={() => {
                          if (!isSoldOut && !isNotOpen) {
                            setSelectedDate(dayNumber);
                            const formattedDay = dayNumber < 10 ? `0${dayNumber}` : dayNumber;
                            const formattedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : currentMonth + 1;
                            setStartDate(`${currentYear}-${formattedMonth}-${formattedDay}`);
                          }
                        }}
                        className={`group relative h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all ${
                          isSoldOut
                            ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40 cursor-not-allowed opacity-65"
                            : isNotOpen
                            ? "bg-gray-50/40 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-50"
                            : isSelected
                            ? "bg-violet-50 dark:bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/30 cursor-pointer shadow-sm"
                            : "bg-white dark:bg-gray-800/50 border-gray-100 dark:border-white/[0.06] hover:border-violet-300 dark:hover:border-violet-700 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${
                            isSelected ? "text-violet-600 dark:text-violet-400 font-extrabold" : "text-gray-800 dark:text-gray-200"
                          }`}>
                            {dayNumber}
                          </span>

                          <span className={`w-2 h-2 rounded-full ${
                            availability.color === "emerald"
                              ? "bg-emerald-500"
                              : availability.color === "amber"
                              ? "bg-amber-500"
                              : availability.color === "rose"
                              ? "bg-rose-500"
                              : "bg-gray-400"
                          }`} />
                        </div>

                        <div className="text-[10px] leading-tight">
                          <p className={`font-semibold truncate ${
                            availability.color === "emerald"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-amber-700 dark:text-amber-400"
                          }`}>
                            {availability.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {monthNames.map((m, idx) => {
                  const isCurrent = currentMonth === idx;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setCurrentMonth(idx);
                        setViewMode("month");
                      }}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? "bg-violet-50 dark:bg-violet-950/40 border-violet-500 text-violet-600 dark:text-violet-400 font-bold shadow-sm"
                          : "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      <p className="text-sm font-bold">{m}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Available slots open</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Available Slots for {monthNames[currentMonth]} {selectedDate}, {currentYear}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select a slot below to schedule your campaign duration.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                {filteredSlots.length} Slots Found
              </span>
            </div>

            <div className="space-y-3">
              {filteredSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isSelectable = slot.status === "available" || slot.status === "limited";

                return (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      !isSelectable
                        ? "bg-gray-50/60 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "bg-violet-50/70 dark:bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/20 shadow-sm"
                        : "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/[0.06] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {slot.name}
                          </h4>
                          <AdTypeBadge type={slot.type} />
                          {slot.status === "available" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              2 Slots Available
                            </span>
                          )}
                          {slot.status === "limited" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              1 Slot Left
                            </span>
                          )}
                          {slot.status === "sold_out" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Sold Out
                            </span>
                          )}
                          {slot.status === "not_open" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              Not Yet Open
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {slot.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                          ₹{slot.price} <span className="text-xs font-normal text-gray-400">/ day</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectingSlot(slot)}
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="View slot details"
                          >
                            <Info size={16} />
                          </button>

                          {isSelectable ? (
                            <button
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                isSelected
                                  ? "bg-violet-600 text-white shadow-sm shadow-violet-500/20"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select Slot"}
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06]">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Campaign Date Range
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                {campaignDays} Total Days
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06]">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Booking Summary
              </h3>
              <AdTypeBadge type={selectedSlot?.type || "Sponsored Card"} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Advertisement Type</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedSlot?.type}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Selected Slot</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                  {selectedSlot?.name}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Location Target</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedDistrict}, {selectedState}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Selected Date Window</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {startDate} to {endDate}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Duration</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {campaignDays} Calendar Days
                </span>
              </div>

              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Rate Calculation</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  ₹{pricePerDay} × {campaignDays} days
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    Estimated Total
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    Queued as Pending Approval
                  </p>
                </div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                  ₹{estimatedTotal.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinueBooking}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              style={{ background: BRAND_GRADIENT }}
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {inspectingSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0f1117] border border-gray-100 dark:border-white/[0.08] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AdTypeBadge type={inspectingSlot.type} />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    ₹{inspectingSlot.price}/day
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingSlot(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {inspectingSlot.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {inspectingSlot.description}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Target District:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedDistrict}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Available Capacity:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{inspectingSlot.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Active Advertisers:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{inspectingSlot.advertisers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Category Tag:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{inspectingSlot.category}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedSlotId(inspectingSlot.id);
                  setInspectingSlot(null);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors"
              >
                Select this Slot
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewModal({ ad, onClose }) {
  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f1117] border border-gray-100 dark:border-white/[0.08] shadow-2xl overflow-hidden"
      >
        <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
          <img src={ad.image} alt={ad.title || ad.venueName} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <AdTypeBadge type={ad.type || "Solo Banner"} />
            <StatusBadge status={ad.status} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {ad.title || ad.venueName}
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin size={13} />
              {ad.location || ad.district}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] p-3.5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{ad.startDate} – {ad.endDate}</span>
            </div>
            {ad.daysRemaining && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Days Remaining:</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">{ad.daysRemaining} days</span>
              </div>
            )}
          </div>

          {ad.impressions && (
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                <p className="text-[11px] text-gray-400">Impressions</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100">{ad.impressions}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                <p className="text-[11px] text-gray-400">Clicks</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100">{ad.clicks}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                <p className="text-[11px] text-gray-400">CTR</p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{ad.ctr}</p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DeleteModal({ ad, onClose, onConfirm }) {
  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0f1117] border border-gray-100 dark:border-white/[0.08] shadow-2xl p-6"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 mb-4">
          <Trash2 size={22} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          Delete Advertisement
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Are you sure you want to remove <span className="font-semibold text-gray-800 dark:text-gray-200">"{ad.title || ad.venueName}"</span>? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(ad.id)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function BookingConfirmationModal({ details, onClose }) {
  if (!details) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f1117] border border-gray-100 dark:border-white/[0.08] shadow-2xl p-6 sm:p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-4">
          <Clock size={32} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800 mb-2">
          <Clock size={12} />
          Pending Approval
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {details.title || "Slot Selected Successfully"}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Your campaign request has been queued in demonstration mode. Review the summary details below.
        </p>

        <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] p-4 text-left space-y-2.5 text-xs mb-6">
          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/[0.04]">
            <span className="text-gray-500 dark:text-gray-400">Advertisement Type:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{details.type}</span>
          </div>
          {details.property && (
            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/[0.04]">
              <span className="text-gray-500 dark:text-gray-400">Property:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{details.property}</span>
            </div>
          )}
          {details.slotName && (
            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/[0.04]">
              <span className="text-gray-500 dark:text-gray-400">Slot Name:</span>
              <span className="font-semibold text-violet-600 dark:text-violet-400 truncate max-w-[200px]">{details.slotName}</span>
            </div>
          )}
          {details.reelTitle && (
            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/[0.04]">
              <span className="text-gray-500 dark:text-gray-400">Selected Reel:</span>
              <span className="font-semibold text-pink-600 dark:text-pink-400 truncate max-w-[200px]">{details.reelTitle}</span>
            </div>
          )}
          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/[0.04]">
            <span className="text-gray-500 dark:text-gray-400">Target District(s):</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{details.districts ? details.districts.join(", ") : details.district}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/[0.04]">
            <span className="text-gray-500 dark:text-gray-400">Schedule:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{details.dates || details.durationText}</span>
          </div>
          <div className="flex justify-between py-1 pt-2 text-sm font-bold text-gray-900 dark:text-gray-100">
            <span>Estimated Total:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{details.totalText}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:shadow-lg hover:shadow-violet-500/30"
          style={{ background: BRAND_GRADIENT }}
        >
          Done
        </button>
      </motion.div>
    </div>
  );
}

export default function VendorAdsPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeAds, setActiveAds] = useState(INITIAL_ACTIVE_ADS);
  const [upcomingAds, setUpcomingAds] = useState(INITIAL_UPCOMING_ADS);
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingAd, setViewingAd] = useState(null);
  const [deletingAd, setDeletingAd] = useState(null);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDuplicate = (ad) => {
    const duplicated = {
      ...ad,
      id: `ad-${Date.now()}`,
      title: `${ad.title || ad.venueName} (Copy)`,
      status: "Scheduled",
      daysRemaining: null,
      impressions: "0",
      clicks: "0",
      ctr: "0.00%",
    };
    setUpcomingAds((prev) => [duplicated, ...prev]);
    showToast("Advertisement duplicated as scheduled draft");
  };

  const handleDelete = (adId) => {
    setActiveAds((prev) => prev.filter((a) => a.id !== adId));
    setUpcomingAds((prev) => prev.filter((a) => a.id !== adId));
    setDeletingAd(null);
    showToast("Advertisement removed");
  };

  const filteredActive = activeAds.filter((ad) => {
    const matchesFilter = filterType === "All" || ad.type === filterType;
    const matchesSearch =
      ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredUpcoming = upcomingAds.filter((ad) => {
    const matchesFilter = filterType === "All" || ad.type === filterType;
    const matchesSearch =
      ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalActive = activeAds.length;
  const totalPending = upcomingAds.filter((a) => a.status === "Pending").length;
  const totalScheduled = upcomingAds.filter((a) => a.status === "Scheduled").length;
  const totalExpiring = activeAds.filter((a) => a.daysRemaining <= 7).length;

  const filterOptions = ["All", "Sponsored Card", "Sponsored Reel", "Solo Banner"];

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 end-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.08] shadow-2xl text-xs font-semibold text-gray-800 dark:text-gray-100"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Check size={12} />
            </span>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        title="Advertisement Management"
        subtitle="Manage and track your promotional campaigns across VenueBook."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/${params?.locale || 'en'}/${params?.country || 'in'}/vendor/ads/create`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:shadow-violet-500/35 transition-all"
              style={{ background: BRAND_GRADIENT }}
            >
              <Plus size={15} />
              Create Advertisement
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("booking_calendar")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] shadow-sm hover:bg-gray-50"
            >
              <CalendarDays size={14} className="text-violet-500" />
              Calendar
            </button>
          </div>
        }
      />

      <div className="flex items-center border-b border-gray-200/80 dark:border-white/[0.08] gap-6 text-sm font-semibold overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === "dashboard"
              ? "text-violet-600 dark:text-violet-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <Radio size={16} />
            Dashboard & Active Campaigns
          </span>
          {activeTab === "dashboard" && (
            <motion.div
              layoutId="adsNavTabUnderline"
              className="absolute bottom-0 inset-x-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("booking_calendar")}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === "booking_calendar"
              ? "text-violet-600 dark:text-violet-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <CalendarDays size={16} className="text-violet-500" />
            Ad Booking Calendar
          </span>
          {activeTab === "booking_calendar" && (
            <motion.div
              layoutId="adsNavTabUnderline"
              className="absolute bottom-0 inset-x-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sponsored_cards")}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === "sponsored_cards"
              ? "text-violet-600 dark:text-violet-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            Sponsored Cards
          </span>
          {activeTab === "sponsored_cards" && (
            <motion.div
              layoutId="adsNavTabUnderline"
              className="absolute bottom-0 inset-x-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sponsored_reels")}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === "sponsored_reels"
              ? "text-pink-600 dark:text-pink-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <Film size={16} className="text-pink-500" />
            Sponsored Reels
          </span>
          {activeTab === "sponsored_reels" && (
            <motion.div
              layoutId="adsNavTabUnderline"
              className="absolute bottom-0 inset-x-0 h-0.5 bg-pink-600 dark:bg-pink-400 rounded-full"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("solo_banners")}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === "solo_banners"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <Megaphone size={16} className="text-indigo-500" />
            Solo Banners
          </span>
          {activeTab === "solo_banners" && (
            <motion.div
              layoutId="adsNavTabUnderline"
              className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
            />
          )}
        </button>
      </div>

      {activeTab === "dashboard" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Active Ads"
              value={totalActive}
              sub="Currently running"
              icon={Radio}
              color="emerald"
            />
            <StatCard
              label="Pending Approval"
              value={totalPending}
              sub="Awaiting review"
              icon={Clock}
              color="amber"
            />
            <StatCard
              label="Scheduled Ads"
              value={totalScheduled}
              sub="Ready to go live"
              icon={CalendarDays}
              color="blue"
            />
            <StatCard
              label="Expiring Soon"
              value={totalExpiring}
              sub="Within 7 days"
              icon={AlertTriangle}
              color="rose"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFilterType(opt)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    filterType === opt
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-500/20"
                      : "bg-white dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64 shrink-0">
              <Search size={14} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full ps-9 pe-4 py-2 text-xs rounded-xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-white/[0.06] text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 dark:focus:border-violet-700 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Active Advertisements
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Currently running campaigns delivering views and clicks across target categories.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                {filteredActive.length} active
              </span>
            </div>

            {filteredActive.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredActive.map((ad) => (
                  <ActiveAdCard
                    key={ad.id}
                    ad={ad}
                    onView={setViewingAd}
                    onEdit={(a) => showToast(`Edit mode for ${a.title || a.venueName}`)}
                    onDuplicate={handleDuplicate}
                    onDelete={setDeletingAd}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08] text-xs text-gray-400 dark:text-gray-500">
                No active advertisements match your filter.
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Upcoming Advertisements
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Approved and queued campaigns set to launch automatically on their start date.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {filteredUpcoming.length} queued
              </span>
            </div>

            {filteredUpcoming.length > 0 ? (
              <div className="space-y-3">
                {filteredUpcoming.map((ad) => (
                  <UpcomingAdItem
                    key={ad.id}
                    ad={ad}
                    onView={setViewingAd}
                    onEdit={(a) => showToast(`Edit mode for ${a.title || a.venueName}`)}
                    onDuplicate={handleDuplicate}
                    onDelete={setDeletingAd}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08] text-xs text-gray-400 dark:text-gray-500">
                No upcoming advertisements found.
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "booking_calendar" ? (
        <BookingCalendarSection
          onBookingSuccess={(details) => setBookingConfirmation(details)}
        />
      ) : activeTab === "sponsored_cards" ? (
        <SponsoredCardsSection
          onBookingSuccess={(details) => setBookingConfirmation(details)}
        />
      ) : activeTab === "sponsored_reels" ? (
        <SponsoredReelsSection
          onBookingSuccess={(details) => setBookingConfirmation(details)}
        />
      ) : (
        <SoloBannersSection
          onBookingSuccess={(details) => setBookingConfirmation(details)}
        />
      )}

      <AnimatePresence>
        {viewingAd && (
          <ViewModal ad={viewingAd} onClose={() => setViewingAd(null)} />
        )}
        {deletingAd && (
          <DeleteModal
            ad={deletingAd}
            onClose={() => setDeletingAd(null)}
            onConfirm={handleDelete}
          />
        )}
        {bookingConfirmation && (
          <BookingConfirmationModal
            details={bookingConfirmation}
            onClose={() => {
              setBookingConfirmation(null);
              showToast("Campaign submitted successfully (Demo Mode)");
              setActiveTab("dashboard");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
