"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ScrollableTabBar from "../components/ScrollableTabBar";
import {
  Plus, LayoutGrid, List, Search, X, Pencil, Trash2,
  Copy, Package, SlidersHorizontal, ChevronDown,
  Palette, Music, Camera, Utensils, Zap, Car,
  Dumbbell, Sofa, Activity, Check, AlertTriangle,
  IndianRupee, Users, Layers, Upload, CheckCircle2,
  Star, Flame, Sparkles, Gift, Heart, Shield,
  Leaf, Gem, Mic, Rocket, Crown, Tag, ImageIcon,
} from "lucide-react";


import {
  SaveCategory,
  LoadaddonCategory,
  SaveAddon,
  Loadaddon,
  ToggleAddon,
  DeleteAddon
} from "@/services/vendor.service";
/* ══════════════════════════════════════════════════════════
   BRAND
══════════════════════════════════════════════════════════ */
const BRAND = "linear-gradient(242deg,#a44bf3,#499ce8)";

/* ══════════════════════════════════════════════════════════
   BUILT-IN CATEGORY THEMES
══════════════════════════════════════════════════════════ */
const CATEGORY_THEMES = {
  Decor:          { gradient: "linear-gradient(242deg,#a44bf3,#499ce8)", strip: "from-violet-500 to-indigo-500",   Icon: Palette  },
  // Catering:       { gradient: "linear-gradient(242deg,#22c55e,#14b8a6)", strip: "from-emerald-500 to-teal-500",    Icon: Utensils },
  // Entertainment:  { gradient: "linear-gradient(242deg,#f59e0b,#ef4444)", strip: "from-amber-500 to-red-500",       Icon: Music    },
  // Photography:    { gradient: "linear-gradient(242deg,#3b82f6,#06b6d4)", strip: "from-blue-500 to-cyan-500",       Icon: Camera   },
  // Lighting:       { gradient: "linear-gradient(242deg,#ec4899,#8b5cf6)", strip: "from-pink-500 to-violet-500",     Icon: Zap      },
  // Transportation: { gradient: "linear-gradient(242deg,#f97316,#eab308)", strip: "from-orange-500 to-yellow-500",   Icon: Car      },
  // Fitness:        { gradient: "linear-gradient(242deg,#10b981,#3b82f6)", strip: "from-emerald-500 to-blue-500",    Icon: Dumbbell },
  // Furniture:      { gradient: "linear-gradient(242deg,#6366f1,#a855f7)", strip: "from-indigo-500 to-purple-500",   Icon: Sofa     },
  // Activities:     { gradient: "linear-gradient(242deg,#14b8a6,#22c55e)", strip: "from-teal-500 to-emerald-500",    Icon: Activity },
};

/* ══════════════════════════════════════════════════════════
   CUSTOM CATEGORY PRESETS
══════════════════════════════════════════════════════════ */
const GRADIENT_PRESETS = [
  { label: "Violet",  gradient: "linear-gradient(242deg,#a44bf3,#499ce8)", strip: "from-violet-500 to-indigo-500"  },
  { label: "Rose",    gradient: "linear-gradient(242deg,#f43f5e,#fb923c)", strip: "from-rose-500 to-orange-400"    },
  { label: "Fuchsia", gradient: "linear-gradient(242deg,#d946ef,#8b5cf6)", strip: "from-fuchsia-500 to-violet-500" },
  { label: "Sky",     gradient: "linear-gradient(242deg,#0ea5e9,#06b6d4)", strip: "from-sky-500 to-cyan-500"       },
  { label: "Lime",    gradient: "linear-gradient(242deg,#84cc16,#22c55e)", strip: "from-lime-500 to-green-500"     },
  { label: "Amber",   gradient: "linear-gradient(242deg,#f59e0b,#ef4444)", strip: "from-amber-500 to-red-500"      },
  { label: "Indigo",  gradient: "linear-gradient(242deg,#6366f1,#3b82f6)", strip: "from-indigo-500 to-blue-500"   },
  { label: "Teal",    gradient: "linear-gradient(242deg,#14b8a6,#0ea5e9)", strip: "from-teal-500 to-sky-500"      },
];

const ICON_PRESETS = [
  { key: "Star",     Icon: Star     }, { key: "Flame",    Icon: Flame    },
  { key: "Sparkles", Icon: Sparkles }, { key: "Gift",     Icon: Gift     },
  { key: "Heart",    Icon: Heart    }, { key: "Shield",   Icon: Shield   },
  { key: "Leaf",     Icon: Leaf     }, { key: "Gem",      Icon: Gem      },
  { key: "Mic",      Icon: Mic      }, { key: "Rocket",   Icon: Rocket   },
  { key: "Crown",    Icon: Crown    }, { key: "Tag",      Icon: Tag      },
  { key: "Music",    Icon: Music    }, { key: "Camera",   Icon: Camera   },
  { key: "Zap",      Icon: Zap      }, { key: "Package",  Icon: Package  },
];

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const TAG_STYLES = {
  Popular:    "bg-sky-50    text-sky-700    ring-1 ring-sky-100    dark:bg-sky-900/30    dark:text-sky-300    dark:ring-sky-800/40",
  Premium:    "bg-violet-50 text-violet-700 ring-1 ring-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-800/40",
  Bestseller: "bg-amber-50  text-amber-700  ring-1 ring-amber-100  dark:bg-amber-900/30  dark:text-amber-300  dark:ring-amber-800/40",
  New:        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800/40",
};

const TAG_OPTIONS        = ["Popular", "Premium", "Bestseller", "New"];
const TOTAL_UNIT_OPTIONS = ["per event", "per booking", "per day", "per night", "per hour", "per trip", "per person"];
const SORT_OPTIONS       = ["Newest", "Price ↑", "Price ↓", "Most Booked", "Name A–Z"];



/* ══════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════ */
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const EMPTY_FORM = {
  name: "", category: "", description: "", image: '', tags: [], status: "active",
  pricingType:  "total",
  price:        "",
  unit:         "per event",
  pricePerUnit: "",
  totalStock:   "",
  damagedUnits: "",
  unitLabel:    "",
  id:    "",
};

const EMPTY_CAT = {
  name: "",
  gradient: GRADIENT_PRESETS[0].gradient,
  strip:    GRADIENT_PRESETS[0].strip,
  iconKey:  "Star",
};

/* ══════════════════════════════════════════════════════════
   ANIMATION VARIANTS
══════════════════════════════════════════════════════════ */
const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};
const overlayBackdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};
const overlayPanel = {
  hidden:  { opacity: 0, scale: 0.97, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 340, damping: 30, mass: 0.8 } },
  exit:    { opacity: 0, scale: 0.97, y: 20, transition: { duration: 0.18 } },
};

/* ══════════════════════════════════════════════════════════
   FULL-SCREEN OVERLAY WRAPPER
══════════════════════════════════════════════════════════ */
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
        variants={overlayBackdrop} initial="hidden" animate="visible" exit="hidden"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      />
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-1.5 sm:p-6" style={{ zIndex: 100000 }}>
        <motion.div
          variants={overlayPanel} initial="hidden" animate="visible" exit="exit"
          className={`relative w-full bg-white dark:bg-[#0f1117] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/60 border border-gray-100/80 dark:border-white/[0.05] overflow-hidden flex flex-col h-[calc(100vh_-_12px)] sm:h-[calc(100vh_-_48px)] ${wide ? "max-w-5xl" : "max-w-2xl"}`}
        >
          {children}
        </motion.div>
      </div>
    </>,
    document.body
  );
}

/* ══════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════ */
function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    purple:  "from-violet-500/10 to-purple-500/5  border-violet-200/60  dark:border-violet-800/30  text-violet-600  dark:text-violet-400",
    blue:    "from-blue-500/10   to-cyan-500/5    border-blue-200/60    dark:border-blue-800/30    text-blue-600    dark:text-blue-400",
    emerald: "from-emerald-500/10 to-teal-500/5   border-emerald-200/60 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400",
    amber:   "from-amber-500/10  to-orange-500/5  border-amber-200/60   dark:border-amber-800/30   text-amber-600   dark:text-amber-400",
  };
  const cls = colors[color] || colors.purple;
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cls} border p-3.5 transition-all hover:shadow-md hover:-translate-y-px bg-white dark:bg-gray-900/60`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 truncate">{label}</p>
          <p className="font-bold text-gray-900 dark:text-gray-50 leading-tight truncate"
             style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.375rem)" }}>{value}</p>
          {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{sub}</p>}
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-white/5">
          <Icon size={15} />
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════════ */
/* ─── Stats skeleton ─────────────────────────────────────────────────── */
function StatsBarSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900/60 p-4 space-y-3">
          <div className="h-3 w-20 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
          <div className="h-7 w-14 rounded-lg bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
          <div className="h-2.5 w-24 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
        </div>
      ))}
    </div>
  );
}
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900/60 overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-3 w-3/4 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-1/2 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0f172a]/80 rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm overflow-hidden">
      <div className="h-10 bg-gray-50/60 dark:bg-white/[0.02] border-b border-gray-50 dark:border-white/[0.04] animate-pulse" />
      <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-48 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
              <div className="h-2.5 w-32 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
            </div>
            <div className="h-3 w-20 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse shrink-0" />
            <div className="h-3 w-16 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse shrink-0" />
            <div className="h-6 w-14 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AddonsPage() {
  const [addons,           setAddons]           = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [view,             setView]             = useState("grid");
  const [search,           setSearch]           = useState("");
  const [category,         setCategory]         = useState("All");
  const [sort,             setSort]             = useState("Newest");
  const [showFilters,      setShowFilters]       = useState(false);
  const [modal,            setModal]            = useState(null);
  const [activeAddon,      setActiveAddon]      = useState(null);
  const [editingCatName,   setEditingCatName]   = useState(null);
  const [form,             setForm]             = useState(EMPTY_FORM);
  const [catForm,          setCatForm]          = useState(EMPTY_CAT);
  const [toasts,           setToasts]           = useState([]);
  const [loading,          setLoading]          = useState(true);

 const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;
 
  //ctegory
  const [catErrors, setCatErrors] = useState({});
const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  /* Merged category themes */
  const allCategoryThemes = useMemo(() => ({
    // ...CATEGORY_THEMES,
    ...Object.fromEntries(
      customCategories.map(c => [c.name, {
        gradient: c.gradient, strip: c.strip,
        Icon: ICON_PRESETS.find(p => p.key === c.iconKey)?.Icon || Package,
      }])
    ),
  }), [customCategories]);

  const CATEGORY_LIST = useMemo(() => ["All", ...Object.keys(allCategoryThemes)], [allCategoryThemes]);
  const getTheme      = useCallback((cat) => allCategoryThemes[cat] || CATEGORY_THEMES.Decor, [allCategoryThemes]);

  /* Toast */
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  /* Filtered + sorted */
  const processed = useMemo(() => {
    let list = addons.filter(a => {
      const q = search.toLowerCase();
      return (a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)) &&
             (category === "All" || a.category === category);
    });
    switch (sort) {
      case "Price ↑":     return [...list].sort((a, b) => (a.pricingType === "unit" ? a.pricePerUnit : a.price) - (b.pricingType === "unit" ? b.pricePerUnit : b.price));
      case "Price ↓":     return [...list].sort((a, b) => (b.pricingType === "unit" ? b.pricePerUnit : b.price) - (a.pricingType === "unit" ? a.pricePerUnit : a.price));
      case "Most Booked": return [...list].sort((a, b) => b.bookings - a.bookings);
      case "Name A–Z":    return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:            return [...list].sort((a, b) => b.id - a.id);
    }
  }, [addons, search, category, sort]);

  /* Stats */
  const stats = useMemo(() => ({
    total:    addons.length,
    active:   addons.filter(a => a.status === "1").length,
    bookings: 0,//addons.reduce((s, a) => s + a.bookings, 0),
    revenue:  0,//addons.reduce((s, a) => s + (a.pricingType === "unit" ? a.pricePerUnit : a.price) * a.bookings, 0),
  }), [addons]);

  /* Modal helpers */
  const openCreate = ()  => { setForm(EMPTY_FORM); setActiveAddon(null); setModal("create"); };
  const openEdit   = (a) => { setForm({ ...a }); setActiveAddon(a); setModal("edit"); };
  const openDelete = (a) => { setActiveAddon(a); setModal("delete"); };
  const closeModal = ()  => { setModal(null); setActiveAddon(null); setEditingCatName(null); };

  /* Category helpers */
  const openCreateCategory = () => { setCatForm(EMPTY_CAT); setEditingCatName(null); setModal("category"); };
  const openEditCategory   = (name) => {
    const cat = customCategories.find(c => c.name === name);
    if (!cat) return;
    setCatForm({ name: cat.name, gradient: cat.gradient, strip: cat.strip, iconKey: cat.iconKey });
    setEditingCatName(name);
    setModal("category");
  };
  const addCustomCategory = useCallback((cat) => {
    setCustomCategories(prev => [...prev, cat]);
  }, []);

  const validateCategory = () => {
  const errors = {};

  errors.name = validateField(catForm.name, "Category Name");

  if (
    customCategories.some(
      c =>
        c.name.toLowerCase() === catForm.name.trim().toLowerCase() &&
        (!editMode || c.name !== catForm.originalName)
    )
  ) {
    errors.name = "Category already exists";
  }

  if (!catForm.iconKey)
    errors.iconKey = "Please select an icon";

  if (!catForm.gradient)
    errors.gradient = "Please select a color";

  Object.keys(errors).forEach(
    key => !errors[key] && delete errors[key]
  );

  setCatErrors(errors);

  return Object.keys(errors).length === 0;
};
const validateField = (value, name, min = 2) => {
  if (!value?.trim()) return `${name} is required`;
  if (value.trim().length < min)
    return `${name} must be at least ${min} characters`;
  return "";
};



  

const handleSaveCategory = async () => {
  if (saving) return;

  if (!validateCategory()) return;

  try {
    setSaving(true);

    const payload = {
      ...catForm,
      name: catForm.name.trim(),
    };

    const res = await SaveCategory(payload);

    toast.success(
      editMode
        ? "Category updated successfully"
        : "Category created successfully"
    );

    closeModal();
  } catch (err) {
    console.error(err);

    if (err?.response?.status === 409) {
      toast.error("Category already exists");
      return;
    }

    toast.error(
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  } finally {
    setSaving(false);
  }
};
  const handleDeleteCategory = (name) => {
    if (addons.some(a => a.category === name)) return toast(`Cannot delete — ${name} is in use`, "error");
    setCustomCategories(prev => prev.filter(c => c.name !== name));
    if (category === name) setCategory("All");
    toast("Category removed");
  };

  /* CRUD */
  // const handleSave = () => {


   
  //   console.log(form)

  //   if (!form.name.trim()) return toast("Name is required", "error");
  //   if (!form.category)    return toast("Select a category", "error");
  //   if (form.pricingType === "unit") {
  //     if (!String(form.pricePerUnit).trim()) return toast("Price per unit is required", "error");
  //     if (!form.unitLabel.trim())            return toast("Unit label is required", "error");
  //   } else {
  //     if (!String(form.price).trim()) return toast("Price is required", "error");
  //   }
  //   const saved = {
  //     ...form,
  //     price:        form.pricingType === "total" ? Number(form.price)        : 0,
  //     pricePerUnit: form.pricingType === "unit"  ? Number(form.pricePerUnit) : 0,
  //     totalStock:   Number(form.totalStock)   || 0,
  //     damagedUnits: Number(form.damagedUnits) || 0,
  //   };
  //   if (modal === "edit") {
  //     setAddons(prev => prev.map(a => a.id === activeAddon.id ? { ...a, ...saved } : a));
  //     toast("Add-on updated ✨");
  //   } else {
  //     setAddons(prev => [{ ...saved, id: Date.now(), bookings: 0 }, ...prev]);
  //     toast("Add-on created 🚀");
  //   }
  //   closeModal();
  // };
const handleSave = async () => {
  try {
    if (!validateAddon()) return;

    setSaving(true);

    const formData = new FormData();

    formData.append("name", form.name.trim());
    formData.append("category", form.category);
    formData.append("description", form.description || "");
    formData.append("pricingType", form.pricingType);
    formData.append("status", form.status);
    formData.append("id", form.id);

    formData.append("image", form.image);

    if (form.pricingType === "total") {
      formData.append("price", form.price);
      formData.append("unit", form.unit);
    } else {
      formData.append("pricePerUnit", form.pricePerUnit);
      formData.append("unitLabel", form.unitLabel);
      formData.append("totalStock", form.totalStock || 0);
      formData.append("damagedUnits", form.damagedUnits || 0);
    }
    
    console.log(catForm)
//  formData.append("showInlineCat", showInlineCat);
 formData.append("cname", catForm.name);
 formData.append("iconKey", catForm.iconKey);
 formData.append("strip", catForm.strip);
 formData.append("gradient", catForm.gradient);//gradient iconKey strip


    

    formData.append("tags", JSON.stringify(form.tags || []));

    await SaveAddon(formData);
await loadAddons();
    toast("Add-on saved successfully", "success");

    closeModal();
  } catch (err) {
    toast(
      err?.response?.data?.message ||
      "Failed to save add-on",
      "error"
    );
  } finally {
    setSaving(false);
  }
};
  const handleDelete    = async() => { 
    // setAddons(prev => prev.filter(a => a.id !== activeAddon.id)); toast("Deleted");
    await DeleteAddon(activeAddon.id);
     closeModal();
     await loadAddons();
  };
  const handleDuplicate = (a) => { setAddons(prev => [{ ...a, id: Date.now(), name: `${a.name} (Copy)`, bookings: 0 }, ...prev]); toast("Duplicated ✨"); };
const handleToggle = async (id) => {
  try {
    const addon = addons.find((a) => a.id === id);

    console.log(addon)

    if (!addon) return;

    const param = {
      id,
      status: Number(addon.status) === 1 ? "0" : "1",
    };

    await ToggleAddon(param);
    await loadAddons();
  } catch (err) {
    // toast.error("Failed to update status");
  }
};


   

  const activeFilters = sort !== "Newest";
  const inactiveCount = stats.total - stats.active;

  //loding //LoadaddonCategory

   
  
      const loadAddons = async () => {
        try {
          const addons = await LoadaddonCategory();
          setCustomCategories(addons?.data);

          const addon = await Loadaddon();
          setAddons(addon?.data);

        } catch (err) {
          console.error("Addons load error:", err);
        }
      };

  useEffect( () => {
      loadAddons();
    }, []);

    const validateAddon = () => {
  if (!form.name.trim()) {
    toast("Add-on name is required", "error");
    return false;
  }

  if (!form.category) {
    toast("Please select category", "error");
    return false;
  }

  if (!form.image) {
    toast("Please upload image", "error");
    return false;
  }

  if (form.pricingType === "total") {
    if (!form.price || Number(form.price) <= 0) {
      toast("Price is required", "error");
      return false;
    }
  }

  if (form.pricingType === "unit") {
    if (!form.unitLabel.trim()) {
      toast("Unit label is required", "error");
      return false;
    }

    if (!form.pricePerUnit || Number(form.pricePerUnit) <= 0) {
      toast("Price per unit is required", "error");
      return false;
    }
  }

  return true;
};



  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] mt-[-56px] md:mt-[-20px]">

      {/* Overlays */}
      <AnimatePresence>
        {(modal === "create" || modal === "edit") && (
          <AddOnModal
            key="addon-modal" mode={modal} form={form} setForm={setForm} setCatForm={setCatForm}
            onClose={closeModal} onSave={handleSave}
            getTheme={getTheme} allCategoryThemes={allCategoryThemes}
            onAddCategory={addCustomCategory}
            BASE_URL = {BASE_URL}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {modal === "delete" && (
          <DeleteModal key="delete-modal" addon={activeAddon} onClose={closeModal} onConfirm={handleDelete} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {modal === "category" && (
          <CategoryModal
            key="cat-modal"
            catForm={catForm} setCatForm={setCatForm}
            editMode={!!editingCatName}
            onClose={closeModal} onSave={handleSaveCategory}
            customCategories={customCategories}
            onEditCategory={openEditCategory}
            onDeleteCategory={handleDeleteCategory}
            catErrors={catErrors}
          />
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed top-4 end-4 z-[200] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium border ${
                t.type === "error"
                  ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/40"
                  : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-100 dark:border-white/[0.07]"
              }`}
            >
              {t.type === "error" ? <AlertTriangle size={14} className="text-red-500 shrink-0" /> : <Check size={14} className="text-emerald-500 shrink-0" />}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ══ HEADER ══ */}
      <div className="px-5 sm:px-6 lg:px-8 pt-8 pb-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Add-ons Management</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            <span className="font-semibold text-gray-600 dark:text-gray-300">{stats.total} add-ons</span>
            {" · "}
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.active} active</span>
            {inactiveCount > 0 && <> · <span className="text-amber-600 dark:text-amber-400 font-semibold">{inactiveCount} paused</span></>}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-px active:translate-y-0 self-start"
          style={{ background: BRAND }}
        >
          <Plus size={14} /> Add New
        </button>
      </div>

      {/* ══ STATS ══ */}
      <div className="px-5 sm:px-6 lg:px-8 pt-6">
        {loading ? <StatsBarSkeleton /> : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Add-ons"  value={stats.total}        icon={Layers}       color="purple"  sub="in catalog"               />
            <StatCard label="Active"         value={stats.active}       icon={CheckCircle2} color="emerald" sub={`${inactiveCount} paused`} />
            <StatCard label="All Bookings"   value={stats.bookings}     icon={Users}        color="blue"    sub="across add-ons"            />
            <StatCard label="Catalog Value"  value={fmt(stats.revenue)} icon={IndianRupee}  color="amber"   sub="potential revenue"         />
          </div>
        )}
      </div>

      {/* ══ TABS ══ */}
      <div className="px-5 sm:px-6 lg:px-8 pt-5">
        <ScrollableTabBar
          tabs={CATEGORY_LIST.map(cat => ({
            key:   cat,
            label: cat,
            icon:  cat !== "All" ? allCategoryThemes[cat]?.Icon : null,
            count: cat === "All" ? addons.length : addons.filter(a => a.category === cat).length,
          }))}
          active={category}
          onChange={setCategory}
          renderTab={(tab, isActive) => {
            const CatIcon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCategory(tab.key)}
                className={[
                  "relative flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium",
                  "whitespace-nowrap transition-colors shrink-0 border-b-2 -mb-px outline-none",
                  "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1",
                  isActive
                    ? "text-violet-700 dark:text-violet-300 border-violet-600 dark:border-violet-400"
                    : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-white/20",
                ].join(" ")}
              >
                {CatIcon && <CatIcon size={12} className={isActive ? "text-violet-600 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"} />}
                {tab.label}
                {tab.count != null && (
                  <span className={`text-[11px] font-bold tabular-nums ${isActive ? "text-violet-500 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"}`}>{tab.count}</span>
                )}
              </button>
            );
          }}
          trailingAction={
            <button
              onClick={openCreateCategory}
              className="flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 border-transparent -mb-px text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors ms-1"
            >
              <Plus size={12} /> Category
            </button>
          }
        />
      </div>

      {/* ══ TOOLBAR ══ */}
      <div className="px-5 sm:px-6 lg:px-8 pt-3 pb-5">
        {/* Mobile: [Search + Sort + Toggle] / sm+: one row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center flex-1 gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search add-ons…"
                className="w-full ps-9 pe-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-white/[0.06] text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 dark:focus:border-violet-700 transition-all"
              />
            </div>
            {/* Mobile: Sort + Toggle inline */}
            <div className="flex items-center gap-2 shrink-0 sm:hidden">
              <button onClick={() => setShowFilters(p => !p)} aria-label="Sort"
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  showFilters ? "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300"
                             : "bg-white dark:bg-gray-900/80 border-gray-100 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 shadow-sm hover:border-gray-200 dark:hover:border-white/10"
                }`}>
                <SlidersHorizontal size={14} />
                {activeFilters && <span className="h-2 w-2 rounded-full bg-violet-500" />}
              </button>
              <div className="inline-flex items-center rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900/80 shadow-sm p-1 gap-0.5">
                {[{ v: "grid", Icon: LayoutGrid }, { v: "list", Icon: List }].map(({ v, Icon }) => (
                  <button key={v} onClick={() => setView(v)}
                    className={`p-2 rounded-lg transition-colors ${view === v ? "bg-gray-100 dark:bg-white/[0.08] text-gray-800 dark:text-gray-200" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* sm+: Sort + Toggle */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button onClick={() => setShowFilters(p => !p)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                showFilters ? "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300"
                           : "bg-white dark:bg-gray-900/80 border-gray-100 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 shadow-sm hover:border-gray-200 dark:hover:border-white/10"
              }`}>
              <SlidersHorizontal size={14} /> Sort
              {activeFilters && <span className="h-2 w-2 rounded-full bg-violet-500" />}
            </button>
            <div className="inline-flex items-center rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900/80 shadow-sm p-1 gap-0.5">
              {[{ v: "grid", Icon: LayoutGrid }, { v: "list", Icon: List }].map(({ v, Icon }) => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-2 rounded-lg transition-colors ${view === v ? "bg-gray-100 dark:bg-white/[0.08] text-gray-800 dark:text-gray-200" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden mt-3">
              <div className="flex flex-wrap gap-2 pt-1">
                {SORT_OPTIONS.map(o => (
                  <button key={o} onClick={() => setSort(o)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      sort === o ? "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300"
                               : "bg-white dark:bg-gray-900/80 border-gray-100 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 shadow-sm hover:border-gray-200 dark:hover:border-white/10"
                    }`}
                  >
                    {sort === o && <Check size={10} />}{o}
                  </button>
                ))}
                {activeFilters && (
                  <button onClick={() => setSort("Newest")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <X size={10} /> Reset
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && (search || category !== "All") && (
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              <span className="font-semibold text-gray-600 dark:text-gray-300">{processed.length}</span> add-ons
              {category !== "All" && <> · <span className="font-semibold text-gray-600 dark:text-gray-300">{category}</span></>}
              {search && <> · matching <span className="font-semibold text-gray-600 dark:text-gray-300">"{search}"</span></>}
            </p>
            <button onClick={() => { setSearch(""); setCategory("All"); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <X size={10} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* ══ CONTENT ══ */}
      <div className="px-5 sm:px-6 lg:px-8 pb-28">
        {view === "grid" && (
          loading ? <GridSkeleton /> : processed.length === 0 ? <EmptyState onAdd={openCreate} /> : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {processed.map((addon, i) => (
                  <AddOnCard key={addon.id} addon={addon} index={i} onEdit={openEdit} onDelete={openDelete} onDuplicate={handleDuplicate} onToggle={handleToggle} getTheme={getTheme} />
                ))}
              </AnimatePresence>
            </motion.div>
          )
        )}
        {view === "list" && (
          loading ? <ListSkeleton /> : processed.length === 0 ? <EmptyState onAdd={openCreate} /> : (
            <div className="bg-white dark:bg-[#0f172a]/80 rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-[1fr_140px_110px_80px_100px_48px] items-center gap-4 px-5 py-3 border-b border-gray-50 dark:border-white/[0.04] bg-gray-50/60 dark:bg-white/[0.02]">
                {["Add-on", "Category", "Price", "Bookings", "Status", ""].map(h => (
                  <p key={h} className="text-left text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</p>
                ))}
              </div>
              <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                {processed.map((addon, i) => (
                  <AddOnRow key={addon.id} addon={addon} index={i} onEdit={openEdit} onDelete={openDelete} onDuplicate={handleDuplicate} onToggle={handleToggle} getTheme={getTheme} />
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* FAB */}
      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }} onClick={openCreate}
        className="sm:hidden fixed bottom-6 end-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white"
        style={{ background: BRAND, boxShadow: "0 8px 32px rgba(164,75,243,0.40)" }}
      >
        <Plus size={22} />
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ADD-ON CARD
══════════════════════════════════════════════════════════ */
function AddOnCard({ addon, index, onEdit, onDelete, onDuplicate, onToggle, getTheme }) {
  const theme = getTheme(addon.category);
  const Icon  = theme.Icon || Package;
  const [hovered, setHovered] = useState(false);
  const displayPrice = addon.pricingType === "unit" ? (addon.pricePerUnit || 0) : (addon.price || 0);
  const displayUnit  = addon.pricingType === "unit" ? `per ${addon.unitLabel || "unit"}` : (addon.unit || "per event");
  const available    = addon.pricingType === "unit" ? Math.max(0, (addon.totalStock || 0) - (addon.damagedUnits || 0)) : null;

  return (
    <motion.div layout custom={index} variants={cardVariants} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      className={`group relative flex flex-col bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/50 hover:border-gray-200/80 dark:hover:border-white/10 overflow-hidden transition-all duration-200 ${addon.status === "inactive" ? "opacity-60" : ""}`}
    >
      <div className={`h-0.5 w-full bg-gradient-to-r ${theme.strip} shrink-0`} />
      <div className="relative w-full aspect-video overflow-hidden shrink-0 bg-gray-100 dark:bg-white/[0.04]">
        {addon.image ? (
          <>
            <img src={`${ process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${addon.image}`} alt={addon.name} className={`w-full h-full object-cover object-center transition-transform duration-700 ${hovered ? "scale-110" : "scale-100"}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: theme.gradient }}>
            <Icon size={38} className="text-white/40" />
          </div>
        )}
        <span className={`absolute top-2.5 start-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${addon.publish_status === "1" ? "bg-black/20 text-white" : "bg-black/40 text-white/60"}`}>
          {addon.publish_status === "1" ? "● Live" : "○ Paused"}
        </span>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 backdrop-blur-[3px]"
            >
              <OverlayBtn icon={Pencil} onClick={() => onEdit(addon)}      title="Edit"      />
              {/* <OverlayBtn icon={Copy}   onClick={() => onDuplicate(addon)} title="Duplicate" /> */}
              <OverlayBtn icon={Trash2} onClick={() => onDelete(addon)}    title="Delete"    danger />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0" style={{ background: theme.gradient }}>
            <Icon size={9} />{addon.category}
          </span>
          {/* <div className="flex gap-1 flex-wrap justify-end">
            {addon.tags && addon.tags.slice(0, 2).map(t => (
              <span key={t} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TAG_STYLES[t] || "bg-gray-100 text-gray-600"}`}>{t}</span>
            ))}
          </div> */}
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 mb-1.5">{addon.name}</h3>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed mb-auto">{addon.description}</p>
        <div className="flex items-end justify-between pt-3 mt-3 border-t border-gray-100 dark:border-white/[0.06]">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">{displayUnit}</p>
            <p className="text-base font-black text-gray-900 dark:text-white leading-none">{fmt(displayPrice)}</p>
            {available !== null && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">{available} available</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-end">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">bookings</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{addon.bookings}</p>
            </div>
            <StatusToggle checked={addon.status === "1"} onChange={() => onToggle(addon.id)} />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-violet-400/20 dark:border-violet-500/15" />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   ADD-ON ROW
══════════════════════════════════════════════════════════ */
function AddOnRow({ addon, index, onEdit, onDelete, onDuplicate, onToggle, getTheme }) {
  const theme        = getTheme(addon.category);
  const Icon         = theme.Icon || Package;
  const displayPrice = addon.pricingType === "unit" ? (addon.pricePerUnit || 0) : (addon.price || 0);
  const displayUnit  = addon.pricingType === "unit" ? `per ${addon.unitLabel || "unit"}` : addon.unit;

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible"
      whileHover={{ backgroundColor: "rgba(139,92,246,0.025)" }}
      className={`group transition-colors ${addon.status === "inactive" ? "opacity-60" : ""}`}
    >
      <div className="hidden md:grid grid-cols-[1fr_140px_110px_80px_100px_48px] items-center gap-4 px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
            {addon.image ? <img src={`${ process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${addon.image}`} alt={addon.name} className="w-full h-full object-cover object-center" />
              : <div className="w-full h-full flex items-center justify-center" style={{ background: theme.gradient }}><Icon size={16} className="text-white/80" /></div>}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{addon.name}</h3>
              {/* {addon.tags && addon.tags.slice(0, 1).map(t => <span key={t} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${TAG_STYLES[t] || "bg-gray-100 text-gray-600"}`}>{t}</span>)} */}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{addon.description}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white w-fit" style={{ background: theme.gradient }}>
          <Icon size={10} />{addon.category}
        </span>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(displayPrice)}</p>
          <p className="text-[11px] text-gray-400">{displayUnit}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{addon.bookings}</p>
          <p className="text-[10px] text-gray-400">bookings</p>
        </div>
        <div className="flex justify-center">
          {/* <StatusToggle checked={addon.status === "active"} onChange={() => onToggle(addon.id)} /> */}
             <StatusToggle checked={addon.status === "1"} onChange={() => onToggle(addon.id)} />
          </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <RowBtn icon={Pencil} onClick={() => onEdit(addon)}      title="Edit"      />
          {/* <RowBtn icon={Copy}   onClick={() => onDuplicate(addon)} title="Duplicate" /> */}
          <RowBtn icon={Trash2} onClick={() => onDelete(addon)}    title="Delete"    danger />
        </div>
      </div>

      <div className="md:hidden p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0">
            {addon.image ? <img src={`${ process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${addon.image}`} alt={addon.name} className="w-full h-full object-cover object-center" />
              : <div className="w-full h-full flex items-center justify-center" style={{ background: theme.gradient }}><Icon size={16} className="text-white/80" /></div>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{addon.name}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{addon.category}</p>
          </div>
          <StatusToggle checked={addon.status === "1"} onChange={() => onToggle(addon.id)} />
        </div>
        {/* {addon.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {addon.tags.map(t => <span key={t} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_STYLES[t] || "bg-gray-100 text-gray-600"}`}>{t}</span>)}
          </div>
        )} */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.06]">
          <div>
            <p className="text-base font-black text-gray-900 dark:text-white">{fmt(displayPrice)}</p>
            <p className="text-[11px] text-gray-400">{displayUnit}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{addon.bookings} bookings</span>
            <div className="flex items-center gap-1">
              <RowBtn icon={Pencil} onClick={() => onEdit(addon)}   title="Edit"   />
              <RowBtn icon={Trash2} onClick={() => onDelete(addon)} title="Delete" danger />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   STATUS TOGGLE
══════════════════════════════════════════════════════════ */
function StatusToggle({ checked, onChange }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(); }}
      aria-label={checked ? "Disable" : "Enable"}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 shrink-0 ${!checked ? "bg-gray-200 dark:bg-white/[0.10]" : ""}`}
      style={checked ? { background: BRAND, boxShadow: "0 0 12px rgba(164,75,243,0.35)" } : {}}
    >
      <motion.span animate={{ x: checked ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute top-0.5 block w-5 h-5 bg-white rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.20)]" />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   MICRO BUTTONS
══════════════════════════════════════════════════════════ */
function OverlayBtn({ icon: Icon, onClick, title, danger }) {
  return (
    <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} title={title} onClick={e => { e.stopPropagation(); onClick(); }}
      className={`w-8 h-8 rounded-xl flex items-center justify-center text-white transition ${danger ? "bg-red-500/80 hover:bg-red-500" : "bg-white/20 hover:bg-white/35"}`}>
      <Icon size={14} />
    </motion.button>
  );
}
function RowBtn({ icon: Icon, onClick, title, danger }) {
  return (
    <button title={title} onClick={e => { e.stopPropagation(); onClick(); }}
      className={`p-1.5 rounded-lg transition ${danger ? "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.07]"}`}>
      <Icon size={13} />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════════ */
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "calc(100vh - 24rem)" }}>
      <motion.div initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} className="relative mb-6">
        <div className="absolute inset-0 rounded-3xl blur-2xl opacity-25" style={{ background: BRAND }} />
        <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg" style={{ background: BRAND }}>
          <Package size={32} className="text-white" />
        </div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-3 rounded-full border border-dashed border-violet-200 dark:border-violet-800/40" />
      </motion.div>
      <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="text-lg font-bold text-gray-900 dark:text-white mb-2">No add-ons yet</motion.h3>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="text-sm text-gray-400 dark:text-gray-500 mb-8 max-w-xs leading-relaxed">
        Nothing matches your current filters. Clear the search or create your first add-on.
      </motion.p>
      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
        whileHover={{ scale: 1.04, boxShadow: "0 10px 28px rgba(164,75,243,0.30)" }} whileTap={{ scale: 0.97 }}
        onClick={onAdd} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-semibold shadow-lg" style={{ background: BRAND }}>
        <Plus size={16} /> Create Add-on
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ADD / EDIT MODAL — v6
   ─────────────────────────────────────────────────────────
   Header  : icon + title + X close only (no top buttons)
   Left    : drag-drop upload + live card preview
   Right   : sectioned form (Details / Pricing / Tags / Visibility)
             ↳ Inline category creator (expand-in-place)
             ↳ Animated pricing type switch (Total ↔ Per Unit)
   Footer  : sticky glass — Cancel + Create/Save
══════════════════════════════════════════════════════════ */
function AddOnModal({ mode, form, setForm, onClose, onSave, getTheme,
   allCategoryThemes, onAddCategory , setCatForm , BASE_URL}) {
  const fileRef = useRef(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [showInlineCat, setShowInlineCat] = useState(false);
  const [inlineCat, setInlineCat]       = useState(EMPTY_CAT);

  /* Image handling */
  // const handleFile = (file) => {
  //   if (!file?.type.startsWith("image/")) return;
  //   if (form.image?.startsWith("blob:")) URL.revokeObjectURL(form.image);
  //   setUploading(true);
  //   setTimeout(() => { setForm(f => ({ ...f, image: URL.createObjectURL(file) })); setUploading(false); }, 600);
  // };
  console.log(form)
  const handleFile = (file) => {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast("Only image files allowed", "error");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast("Image size must be less than 5MB", "error");
    return;
  }

  setUploading(true);

  const previewUrl = URL.createObjectURL(file);

  setTimeout(() => {
    setForm((prev) => ({
      ...prev,
      image: file, // binary
      imagePreview: previewUrl, // preview
    }));

    setUploading(false);
  }, 500);
};
//  const removeImage  = () => { if (form.image?.startsWith("blob:")) URL.revokeObjectURL(form.image); setForm(f => ({ ...f, image: null })); };
  const handleDrop   = (e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); };

  /* Inline category */
  const InlineCatIcon = ICON_PRESETS.find(p => p.key === inlineCat.iconKey)?.Icon || Package;
  const createInlineCategory = () => {
    const name = inlineCat.name.trim();
    if (!name) return;
    onAddCategory({ ...inlineCat, name });
    setForm(f => ({ ...f, category: name }));
    setShowInlineCat(false);
    setInlineCat(EMPTY_CAT);
  };

  /* Tags */
  const toggleTag = (tag) => setForm(f => ({
    ...f, tags: f.tags?.includes(tag) ? f.tags.filter(t => t !== tag) : [...(f.tags || []), tag],
  }));

  /* Available units (computed) */
  const availableUnits = Math.max(0, (Number(form.totalStock) || 0) - (Number(form.damagedUnits) || 0));

  /* Preview theme */
  const previewTheme = form.category ? getTheme(form.category) : { gradient: BRAND, strip: "from-violet-500 to-indigo-500" };
  const PreviewIcon  = form.category ? (allCategoryThemes[form.category]?.Icon || Package) : Package;

  const [saving, setSaving] = useState(false);

  return (
    <FullscreenOverlay onClose={onClose} wide>
      {/* Brand strip */}
      <div className="h-0.5 shrink-0" style={{ background: BRAND }} />

      {/* ── Header: icon + title + X only ── */}
      <div className="shrink-0 px-5 sm:px-7 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between gap-4 bg-white dark:bg-[#0f1117]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: BRAND }}>
            {mode === "edit" ? <Pencil size={13} className="text-white" /> : <Plus size={13} className="text-white" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-50 leading-tight">
              {mode === "edit" ? "Edit Add-on" : "Create Add-on"}
            </h2>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:block mt-px">
              {mode === "edit" ? "Update the details below." : "Fill in the details to publish a new add-on."}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="shrink-0 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="flex flex-col lg:flex-row h-full">

          {/* LEFT: Image upload + live preview */}
          <div className="lg:w-[300px] xl:w-[340px] shrink-0 border-b lg:border-b-0 lg:border-e border-gray-100 dark:border-white/[0.05] overflow-y-auto">
            <div className="p-5 sm:p-6 flex flex-col gap-4">

              {/* Upload zone */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Cover Image</p>
               <input
  ref={fileRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  }}
/>
                <div
                  onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
                  className={`relative h-44 rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-200 ${
                    isDragging ? "border-violet-500 dark:border-violet-400 bg-violet-50/50 dark:bg-violet-950/20 scale-[1.01]"
                               : "border-gray-200 dark:border-white/[0.08] hover:border-violet-300 dark:hover:border-violet-700/50"
                  }`}
                >
                  {uploading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: previewTheme.gradient }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 rounded-full border-2 border-white/25 border-t-white" />
                      <p className="text-[11px] text-white/75 font-medium">Processing…</p>
                    </div>
                  ) : form.imagePreview ? (
                    <>
                      <img src={form.imagePreview} alt="Cover" className="w-full h-full object-cover object-center" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/45 transition-colors duration-200 group flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                            className="flex items-center gap-1.5 text-xs text-white font-semibold px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition">
                            <Upload size={12} /> Change
                          </button>
                          <button onClick={e => { e.stopPropagation(); removeImage(); }}
                            className="flex items-center gap-1.5 text-xs text-white font-semibold px-3 py-1.5 bg-red-500/70 hover:bg-red-500 rounded-xl transition">
                            <X size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <button onClick={() => fileRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center gap-2 transition-opacity hover:opacity-90"
                      style={{ background: form.category ? previewTheme.gradient : undefined }}>
                      {form.category ? (
                        <>
                          <PreviewIcon size={26} className="text-white/45" />
                          <span className="text-xs text-white/80 font-semibold flex items-center gap-1.5"><Upload size={11} /> Upload or drag</span>
                          <span className="text-[10px] text-white/45">PNG · JPG · WEBP · 5 MB</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-1">
                            <ImageIcon size={18} className="text-gray-300 dark:text-gray-600" />
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Upload or drag image</span>
                          <span className="text-[10px] text-gray-300 dark:text-gray-600">PNG · JPG · WEBP · 5 MB</span>
                        </>
                      )}
                      {isDragging && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-sm font-bold text-violet-600 dark:text-violet-300 bg-white/80 dark:bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-sm">Drop to upload</p>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Live preview card */}
              <AnimatePresence>
                {form.name && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden bg-white dark:bg-[#0f172a] shadow-sm">
                    <div className={`h-0.5 bg-gradient-to-r ${previewTheme.strip}`} />
                    <div className="aspect-video overflow-hidden flex items-center justify-center" style={{ background: form.image ? undefined : previewTheme.gradient }}>
                      {(form.image || form.imagePreview)
                        ? <img src={form.imagePreview ||`${BASE_URL}/${form.image}`} alt="preview" className="w-full h-full object-cover object-center" />
                        : <PreviewIcon size={20} className="text-white/45" />}
                    </div>
                    <div className="p-3 space-y-1.5">
                      {form.category && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: previewTheme.gradient }}>
                          <PreviewIcon size={7} />{form.category}
                        </span>
                      )}
                      <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{form.name}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-black text-gray-900 dark:text-white">
                          {form.pricingType === "unit"
                            ? (form.pricePerUnit ? `${fmt(form.pricePerUnit)} / ${form.unitLabel || "unit"}` : "₹— / unit")
                            : (form.price ? fmt(form.price) : "₹—")}
                        </p>
                        <span className={`text-[9px] font-bold ${form.status === "active" ? "text-emerald-500" : "text-gray-400"}`}>
                          {form.status === "active" ? "● Live" : "○ Paused"}
                        </span>
                      </div>
                      {form.pricingType === "unit" && form.totalStock && (
                        <p className="text-[9px] text-gray-400">{availableUnits} available</p>
                      )}
                      {/* {form.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {form.tags.slice(0, 3).map(t => (
                            <span key={t} className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${TAG_STYLES[t] || "bg-gray-100 text-gray-600"}`}>{t}</span>
                          ))}
                        </div>
                      )} */}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!form.name && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 italic leading-relaxed">
                  Fill in the name to see a live preview of the card.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Sectioned form */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">

              {/* ── Section: Details ── */}
              <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4">
                <FSectionLabel>Basic Details</FSectionLabel>

                <FormField label="Add-on Name" required>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Floral Decor" className="form-input" />
                </FormField>

                 <input type= "hidden" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} />

                {/* Category + inline creator */}
                <FormField label="Category" required>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setShowInlineCat(false); }}
                      className="form-input pe-8"
                    >
                      <option value="">Select a category…</option>
                      {Object.keys(allCategoryThemes).map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Toggle inline creator */}
                  <button
                    type="button"
                    onClick={() => setShowInlineCat(p => !p)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                  >
                    {showInlineCat ? <><X size={10} /> Cancel</> : <><Plus size={10} /> Create new category</>}
                  </button>

                  {/* Inline category creation panel */} 
                  <AnimatePresence>
                    {showInlineCat && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-4 rounded-2xl bg-gray-50/80 dark:bg-[#070b14]/60 border border-gray-100 dark:border-white/[0.06] space-y-3.5">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">New Category</p>

                          <input
                            value={inlineCat.name}
                         onChange={(e) => {
    setInlineCat((f) => ({ ...f, name: e.target.value }));
    setCatForm((f) => ({ ...f, name: e.target.value }));
  }}
                            placeholder="Category name…"
                            className="form-input"
                          />

                          {/* Color row */}
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">Color</p>
                            <div className="flex flex-wrap gap-1.5">
                              {GRADIENT_PRESETS.map(p => (
                                <button key={p.label} 
                                 onClick={(e) => {
    setInlineCat((f) => ({ ...f, gradient: p.gradient, strip: p.strip  }));
    setCatForm((f) => ({ ...f, gradient: p.gradient, strip: p.strip  }));
  }}
                                  title={p.label}
                                  className={`h-6 w-6 rounded-lg transition-all ${inlineCat.gradient === p.gradient ? "ring-2 ring-offset-2 ring-violet-500 scale-[1.15]" : "opacity-65 hover:opacity-100 hover:scale-105"}`}
                                  style={{ background: p.gradient }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Icon row */}
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">Icon</p>
                            <div className="flex flex-wrap gap-1.5">
                              {ICON_PRESETS.map(({ key, Icon: Ic }) => (
                                <button key={key} 
                                
                                onClick={() => {
  setInlineCat((f) => ({
    ...f,
    iconKey: key,
  }));

  setCatForm((f) => ({
    ...f,
    iconKey: key,
  }));
}}
                                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                                    inlineCat.iconKey === key
                                      ? "text-white scale-[1.1]"
                                      : "bg-white dark:bg-white/[0.05] border border-gray-100 dark:border-white/[0.06] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                                  }`}
                                  style={inlineCat.iconKey === key ? { background: inlineCat.gradient } : {}}
                                >
                                  <Ic size={12} />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Preview + Create */}
                          <div className="flex items-center justify-between pt-0.5">
                            <div>
                              {inlineCat.name ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: inlineCat.gradient }}>
                                  <InlineCatIcon size={10} />{inlineCat.name}
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">Enter a name to preview</span>
                              )}
                            </div>
                            <motion.button whileTap={{ scale: 0.96 }} onClick={createInlineCategory}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm" style={{ background: BRAND }}>
                              Create & Select
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormField>

                <FormField label="Description">
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description visible to customers during booking…"
                    rows={3}
                    className="form-input resize-none min-h-[88px]"
                  />
                </FormField>
              </div>

              {/* ── Section: Pricing ── */}
              <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4">
                <FSectionLabel>Pricing</FSectionLabel>

                {/* Pricing type segmented control */}
                <div className="flex p-0.5 gap-0.5 rounded-xl bg-gray-100/70 dark:bg-white/[0.04] border border-gray-200/50 dark:border-white/[0.06]">
                  {[
                    { v: "total", label: "Total Price",  sub: "Fixed per booking"   },
                    { v: "unit",  label: "Per Unit",     sub: "Track stock + pieces" },
                  ].map(({ v, label, sub }) => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, pricingType: v }))}
                      className={`flex-1 py-2 px-3 rounded-[10px] text-center transition-all duration-200 ${
                        form.pricingType === v
                          ? "bg-white dark:bg-white/[0.09] shadow-sm border border-gray-200/50 dark:border-white/[0.08]"
                          : "hover:bg-white/50 dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className={`block text-xs font-semibold leading-snug ${form.pricingType === v ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-500"}`}>{label}</span>
                      <span className={`block text-[9px] font-normal leading-tight mt-0.5 ${form.pricingType === v ? "text-gray-400 dark:text-gray-500" : "text-gray-400 dark:text-gray-600"}`}>{sub}</span>
                    </button>
                  ))}
                </div>

                {/* Conditional pricing fields */}
                <AnimatePresence mode="wait">
                  {form.pricingType === "unit" ? (
                    <motion.div key="unit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="space-y-3">
                      <FormField label="Unit Label" required>
                        <input value={form.unitLabel} onChange={e => setForm(f => ({ ...f, unitLabel: e.target.value }))} placeholder="e.g. chairs, tables, speakers, projectors…" className="form-input" />
                      </FormField>
                      <div className="grid grid-cols-3 gap-2.5">
                        <FormField label="Total Stock">
                          <input type="number" min="0" value={form.totalStock} onChange={e => setForm(f => ({ ...f, totalStock: e.target.value }))} placeholder="0" className="form-input text-center" />
                        </FormField>
                        <FormField label="Damaged">
                          <input type="number" min="0" value={form.damagedUnits} onChange={e => setForm(f => ({ ...f, damagedUnits: e.target.value }))} placeholder="0" className="form-input text-center" />
                        </FormField>
                        <FormField label="Available">
                          <div className="form-input-readonly text-center">{availableUnits}</div>
                        </FormField>
                      </div>
                      <FormField label="Price per Unit (₹)" required>
                        <input type="number" min="0" value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))} placeholder="0" className="form-input" />
                      </FormField>
                      {form.pricePerUnit && form.unitLabel && (
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <p className="text-xs text-emerald-700 dark:text-emerald-300">
                            <span className="font-bold">{fmt(form.pricePerUnit)}</span> per {form.unitLabel}
                            {form.totalStock ? <> · <span className="font-semibold">{availableUnits} available</span></> : ""}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="total" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Price (₹)" required>
                          <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" className="form-input" />
                        </FormField>
                        <FormField label="Billing Unit">
                          <div className="relative">
                            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="form-input pe-8">
                              {TOTAL_UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                            </select>
                            <ChevronDown size={13} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </FormField>
                      </div>
                      {form.price && form.unit && (
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Displayed as <span className="font-bold text-gray-800 dark:text-gray-200">{fmt(form.price)}</span> {form.unit}.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Section: Tags ── */}
              <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-3">
                <FSectionLabel>Tags</FSectionLabel>
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map(tag => {
                    const active = form.tags?.includes(tag);
                    return (
                      <motion.button key={tag} whileTap={{ scale: 0.94 }} onClick={() => toggleTag(tag)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                          active ? "border-transparent text-white shadow-sm" : "border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.03]"
                        }`}
                        style={active ? { background: BRAND } : {}}
                      >
                        {active && <Check size={10} />}{tag}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ── Section: Visibility ── */}
              <div className="px-5 sm:px-7 py-5 sm:py-6">
                <FSectionLabel>Visibility</FSectionLabel>
                <div className="mt-3 flex items-center justify-between p-4 bg-gray-50/60 dark:bg-[#070b14]/40 rounded-2xl border border-gray-100 dark:border-white/[0.05]">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {form.status === "active" ? "Published — visible to customers" : "Unpublished — hidden from booking"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {form.status === "active" ? "Customers can add this to their booking." : "Toggle on to make it available."}
                    </p>
                  </div>
                  <StatusToggle
                    checked={form.status === "active"}
                    onChange={() => setForm(f => ({ ...f, status: f.status === "active" ? "inactive" : "active" }))}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky glass footer — Cancel + Save only ── */}
      <div className="shrink-0 px-5 sm:px-7 py-3.5 border-t border-gray-100 dark:border-white/[0.05] bg-white/95 dark:bg-[#0c111d]/95 backdrop-blur-xl flex items-center gap-3 shadow-[0_-1px_0_0_rgba(0,0,0,0.03)] dark:shadow-[0_-1px_0_0_rgba(255,255,255,0.03)]">
        <p className="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:block me-auto leading-relaxed">
          {mode === "edit" ? "Changes will be applied immediately." : "Your add-on will go live right away."}
        </p>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] transition-colors">
            Cancel
          </button>
          <motion.button
  disabled={saving}
  onClick={onSave}
  whileTap={!saving ? { scale: 0.97 } : {}}
  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
  style={{ background: BRAND }}
>
  {saving ? (
    <span className="flex items-center gap-2">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
      />
      Saving...
    </span>
  ) : mode === "edit" ? (
    "Save Changes"
  ) : (
    "Create Add-on"
  )}
</motion.button>
        </div>
      </div>
    </FullscreenOverlay>
  );
}

/* ══════════════════════════════════════════════════════════
   CATEGORY MODAL — v6
   Compact, aligned grid layout for colors + icons.
   Existing categories listed with hover-reveal actions.
   Sticky glass footer matches AddOnModal.
══════════════════════════════════════════════════════════ */
function CategoryModal({ catForm, setCatForm, editMode, onClose, onSave, customCategories, onEditCategory, onDeleteCategory , catErrors }) {
  const SelectedIcon = ICON_PRESETS.find(p => p.key === catForm.iconKey)?.Icon || Package;

  return (
    <FullscreenOverlay onClose={onClose}>
      <div className="h-0.5 shrink-0" style={{ background: BRAND }} />

      {/* Header */}
      <div className="shrink-0 px-5 sm:px-7 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between gap-4 bg-white dark:bg-[#0f1117]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: BRAND }}>
            <Tag size={13} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-50">
              {editMode ? "Edit Category" : "Manage Categories"}
            </h2>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:block mt-px">
              {editMode ? "Update category details." : "Create and manage custom categories."}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">

          {/* Create / Edit form */}
          <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-5">
            <FSectionLabel>{editMode ? "Edit Category" : "New Category"}</FSectionLabel>

            <FormField label="Name">
              <input
                value={catForm.name}
                 className={`form-input ${
    catErrors.name ? "form-input-error" : ""
  }`}
                onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Fireworks, Drone Show, Celebrity Entry…"
              />
            </FormField>

            {/* Color swatches — 8-column compact grid */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Accent Color</p>
              <div className="grid grid-cols-8 gap-2">
                {GRADIENT_PRESETS.map(p => (
                  <button key={p.label} onClick={() => setCatForm(f => ({ ...f, gradient: p.gradient, strip: p.strip }))}
                    title={p.label}
                    className={`h-8 w-full rounded-xl transition-all duration-200 ${
                      catForm.gradient === p.gradient
                        ? "ring-2 ring-offset-2 ring-violet-500 dark:ring-offset-[#0f1117] scale-[1.08]"
                        : "opacity-65 hover:opacity-100 hover:scale-[1.04]"
                    }`}
                    style={{ background: p.gradient }}
                  />
                ))}
              </div>
            </div>

            {/* Icon picker — 8-column grid */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Icon</p>
              <div className="grid grid-cols-8 gap-1.5">
                {ICON_PRESETS.map(({ key, Icon: Ic }) => (
                  <button key={key} onClick={() => setCatForm(f => ({ ...f, iconKey: key }))}
                    title={key}
                    className={`h-9 w-full rounded-xl flex items-center justify-center transition-all duration-200 ${
                      catForm.iconKey === key
                        ? "text-white ring-2 ring-offset-1 ring-violet-500 dark:ring-offset-[#0f1117] scale-[1.08]"
                        : "bg-gray-100/80 dark:bg-white/[0.05] text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-white/[0.09] hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                    style={catForm.iconKey === key ? { background: catForm.gradient } : {}}
                  >
                    <Ic size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Live preview chip */}
            <AnimatePresence>
              {catForm.name && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/70 dark:bg-[#070b14]/50 border border-gray-100 dark:border-white/[0.05]">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full text-white shadow-sm" style={{ background: catForm.gradient }}>
                    <SelectedIcon size={12} />{catForm.name}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500">This is how it appears on cards and tabs.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Existing custom categories */}
          {customCategories.length > 0 && (
            <div className="px-5 sm:px-7 py-5 sm:py-6">
              <div className="flex items-center justify-between mb-4">
                <FSectionLabel>Your Categories</FSectionLabel>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">{customCategories.length}</span>
              </div>
              <div className="space-y-1.5">
                {customCategories.map(cat => {
                  const CatIcon = ICON_PRESETS.find(p => p.key === cat.iconKey)?.Icon || Package;
                  return (
                    <div key={cat.name} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: cat.gradient }}>
                        <CatIcon size={10} />{cat.name}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <RowBtn icon={Pencil} onClick={() => onEditCategory(cat.name)} title="Edit" />
                        <RowBtn icon={Trash2} onClick={() => onDeleteCategory(cat.name)} title="Delete" danger />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty custom categories hint */}
          {customCategories.length === 0 && !editMode && (
            <div className="px-5 sm:px-7 py-6 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                No custom categories yet. Fill in the form above and click Create.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky glass footer */}
      <div className="shrink-0 px-5 sm:px-7 py-3.5 border-t border-gray-100 dark:border-white/[0.05] bg-white/95 dark:bg-[#0c111d]/95 backdrop-blur-xl flex items-center justify-end gap-2.5 shadow-[0_-1px_0_0_rgba(0,0,0,0.03)] dark:shadow-[0_-1px_0_0_rgba(255,255,255,0.03)]">
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] transition-colors">
          Cancel
        </button>
        <motion.button whileTap={{ scale: 0.97 }} whileHover={{ boxShadow: "0 6px 24px rgba(164,75,243,0.28)" }} onClick={onSave}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-shadow"
          style={{ background: BRAND }}>
          {editMode ? "Save Changes" : "Create Category"}
        </motion.button>
      </div>
    </FullscreenOverlay>
  );
}

/* ══════════════════════════════════════════════════════════
   DELETE MODAL
══════════════════════════════════════════════════════════ */
function DeleteModal({ addon, onClose, onConfirm }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  if (!mounted) return null;

  return createPortal(
    <>
      <motion.div variants={overlayBackdrop} initial="hidden" animate="visible" exit="hidden" onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      />
      <div className="fixed inset-0 flex items-center justify-center p-6" style={{ zIndex: 100000 }}>
        <motion.div variants={overlayPanel} initial="hidden" animate="visible" exit="exit"
          className="bg-white dark:bg-[#0f1117] rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center border border-gray-100 dark:border-white/[0.06]"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-5">
            <Trash2 size={26} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Add-on?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-7 leading-relaxed">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{addon?.name}</span>{" "}will be permanently removed.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.10] text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition">
              Cancel
            </button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition shadow-lg shadow-red-500/20">
              Delete
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
}

/* ══════════════════════════════════════════════════════════
   SHARED HELPERS
══════════════════════════════════════════════════════════ */
function FSectionLabel({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{children}</p>;
}
function FormField({ label, children, required }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
        {label}{required && <span className="ms-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

