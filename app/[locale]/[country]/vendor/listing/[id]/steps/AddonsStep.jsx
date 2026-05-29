"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Plus, Trash2,
  Utensils, Music, Camera, Flower2, Car, Cake, ShieldCheck, ClipboardList,
  Flame, Bike, Compass, Leaf, ChefHat, Heart, Video,
  Lightbulb, Sparkles, Shirt, Package, Film,
  Lock, Printer, Mail, Monitor, Coffee, Calendar,
  Croissant, Plane, Home, BedDouble, RefreshCw, Zap,
  Waves, Dumbbell, Sun, Trees,
  Mountain, Cookie, Droplets, Image,
} from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY-AWARE ADDON PRESETS
   icon: lucide-react component reference
───────────────────────────────────────────────────────────────────────────── */
const ADDON_CONFIG = {
  venues: {
    heading:  "Add-ons & Services",
    subtitle: "Offer optional services that guests can add to their booking.",
    currency: "₹",
    presets: [
      { id: "catering",    icon: Utensils,      label: "Catering Service",      placeholder: "Per head price"    },
      { id: "dj",          icon: Music,         label: "DJ & Sound System",     placeholder: "Per event price"   },
      { id: "photography", icon: Camera,        label: "Event Photography",     placeholder: "Per hour price"    },
      { id: "decor",       icon: Flower2,       label: "Floral Decoration",     placeholder: "Package price"     },
      { id: "valet",       icon: Car,           label: "Valet Parking",         placeholder: "Per vehicle price" },
      { id: "cake",        icon: Cake,          label: "Custom Cake",           placeholder: "Per cake price"    },
      { id: "bouncer",     icon: ShieldCheck,   label: "Security Personnel",    placeholder: "Per person/event"  },
      { id: "coordinator", icon: ClipboardList, label: "Event Coordinator",     placeholder: "Per event price"   },
    ],
  },

  farmstays: {
    heading:  "Add-ons & Activities",
    subtitle: "Offer optional experiences and services guests can add on.",
    currency: "₹",
    presets: [
      { id: "bonfire",     icon: Flame,    label: "Bonfire Night",              placeholder: "Per group price"   },
      { id: "bbq",         icon: Utensils, label: "BBQ Package",                placeholder: "Per person price"  },
      { id: "trek_guide",  icon: Compass,  label: "Trekking with Guide",        placeholder: "Per person price"  },
      { id: "cycle_rent",  icon: Bike,     label: "Cycle Rental",               placeholder: "Per hour price"    },
      { id: "farm_tour",   icon: Leaf,     label: "Guided Farm Tour",           placeholder: "Per person price"  },
      { id: "yoga",        icon: Heart,    label: "Yoga Session",               placeholder: "Per session price" },
      { id: "photography", icon: Camera,   label: "Photography Session",        placeholder: "Per session price" },
      { id: "transfers",   icon: Car,      label: "Airport / Station Transfer", placeholder: "Per trip price"    },
    ],
  },

  studios: {
    heading:  "Add-ons & Equipment",
    subtitle: "Offer optional equipment hire or services to clients.",
    currency: "₹",
    presets: [
      { id: "lighting_asst", icon: Lightbulb, label: "Lighting Assistant",     placeholder: "Per hour price"    },
      { id: "makeup_artist", icon: Sparkles,  label: "Makeup Artist",          placeholder: "Per session price" },
      { id: "stylist",       icon: Shirt,     label: "Wardrobe Stylist",       placeholder: "Per session price" },
      { id: "props_hire",    icon: Package,   label: "Props / Furniture Hire", placeholder: "Per day price"     },
      { id: "camera_hire",   icon: Camera,    label: "Camera Hire",            placeholder: "Per day price"     },
      { id: "editor",        icon: Film,      label: "Post-Production Editor", placeholder: "Per hour price"    },
      { id: "catering",      icon: Coffee,    label: "On-Set Catering",        placeholder: "Per head price"    },
    ],
  },

  workspaces: {
    heading:  "Add-ons & Services",
    subtitle: "Offer optional perks and services members can opt into.",
    currency: "₹",
    presets: [
      { id: "locker",      icon: Lock,         label: "Dedicated Locker",           placeholder: "Per month price" },
      { id: "printing",    icon: Printer,      label: "Printing Credits",           placeholder: "Per 100 pages"   },
      { id: "mail_handle", icon: Mail,         label: "Mail Handling",              placeholder: "Per month price" },
      { id: "it_support",  icon: Monitor,      label: "IT Support",                 placeholder: "Per hour price"  },
      { id: "coffee",      icon: Coffee,       label: "Unlimited Coffee / Tea",     placeholder: "Per month price" },
      { id: "parking",     icon: Car,          label: "Reserved Parking Slot",      placeholder: "Per month price" },
      { id: "event_space", icon: Calendar,     label: "Event Space Priority",       placeholder: "Per booking"     },
    ],
  },

  rentals: {
    heading:  "Add-ons & Services",
    subtitle: "Offer optional services that make guests' stay more comfortable.",
    currency: "₹",
    presets: [
      { id: "breakfast",    icon: Croissant,  label: "Daily Breakfast",     placeholder: "Per person price" },
      { id: "airport",      icon: Plane,      label: "Airport Transfer",    placeholder: "Per trip price"   },
      { id: "housekeeping", icon: Home,       label: "Daily Housekeeping",  placeholder: "Per day price"    },
      { id: "chef",         icon: ChefHat,    label: "Private Chef",        placeholder: "Per meal price"   },
      { id: "baby_cot",     icon: BedDouble,  label: "Baby Cot / Crib",    placeholder: "Per night price"  },
      { id: "laundry",      icon: RefreshCw,  label: "Laundry Service",    placeholder: "Per load price"   },
      { id: "ev_charge",    icon: Zap,        label: "EV Charging",         placeholder: "Per session price"},
    ],
  },

  experiences: {
    heading:  "Add-ons & Upgrades",
    subtitle: "Let guests upgrade their experience with optional extras.",
    currency: "₹",
    presets: [
      { id: "photography", icon: Camera,   label: "Professional Photography", placeholder: "Per session price" },
      { id: "video",       icon: Video,    label: "Video Documentation",      placeholder: "Per session price" },
      { id: "private",     icon: Lock,     label: "Private Group Booking",    placeholder: "Additional price"  },
      { id: "lunch",       icon: Utensils, label: "Gourmet Lunch Pack",       placeholder: "Per person price"  },
      { id: "souvenir",    icon: Package,  label: "Souvenir / Gift Pack",     placeholder: "Per pack price"    },
      { id: "extra_time",  icon: Plus,     label: "Extra 1 Hour",             placeholder: "Per hour price"    },
      { id: "insurance",   icon: ShieldCheck, label: "Travel Insurance",      placeholder: "Per person price"  },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    card:    isDark ? "#111827"                 : "#ffffff",
    cardAlt: isDark ? "#0d1526"                : "#f8fafc",
    border:  isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)",
    text:    isDark ? "#ffffff"                : "#0f172a",
    muted:   isDark ? "#94a3b8"                : "#64748b",
    dimmed:  isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    inputBg: isDark ? "#0d1526"                : "#ffffff",
    inputBd: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPER — parse addons from form
   form.addons = [{ id, label, price, custom? }]
───────────────────────────────────────────────────────────────────────────── */
function useAddons(form, setForm) {
  const addons = form.addons || [];
  const isEnabled = (id)    => addons.some((a) => a.id === id);
  const getPrice  = (id)    => addons.find((a) => a.id === id)?.price || "";

  const toggle = (preset) => {
    const idx = addons.findIndex((a) => a.id === preset.id);
    if (idx >= 0) {
      setForm({ ...form, addons: addons.filter((a) => a.id !== preset.id) });
    } else {
      setForm({ ...form, addons: [...addons, { id: preset.id, label: preset.label, price: "" }] });
    }
  };

  const setPrice = (id, price) => {
    setForm({ ...form, addons: addons.map((a) => a.id === id ? { ...a, price } : a) });
  };

  const addCustom = (label, price) => {
    const id = `custom_${Date.now()}`;
    setForm({ ...form, addons: [...addons, { id, label, price, custom: true }] });
  };

  const removeCustom = (id) => {
    setForm({ ...form, addons: addons.filter((a) => a.id !== id) });
  };

  return { addons, isEnabled, getPrice, toggle, setPrice, addCustom, removeCustom };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function AddonsStep({ form, setForm, category = "venues" }) {
  const [isDark, setIsDark] = useState(true);
  const [customLabel, setCustomLabel] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const tk     = tokens(isDark);
  const theme = getCategoryTheme(category);
  const config = ADDON_CONFIG[category] ?? ADDON_CONFIG.venues;
  const { addons, isEnabled, getPrice, toggle, setPrice, addCustom, removeCustom } = useAddons(form, setForm);

  /* Build a lookup: preset id → icon component, for displaying stored addons */
  const presetIconMap = Object.fromEntries(config.presets.map((p) => [p.id, p.icon]));

  const INPUT_CLS = "w-full px-3 py-2 rounded-lg text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-violet-500/20";
  const inputStyle = () => ({ background: tk.inputBg, border: `1px solid ${tk.inputBd}`, color: tk.text });

  const submitCustom = () => {
    if (!customLabel.trim()) return;
    addCustom(customLabel.trim(), customPrice);
    setCustomLabel("");
    setCustomPrice("");
    setShowCustomForm(false);
  };

  const customAddons = addons.filter((a) => a.custom);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-[22px] font-bold leading-tight" style={{ color: tk.text }}>
          {config.heading}
        </h2>
        <p className="text-[13px] mt-1" style={{ color: tk.muted }}>
          {config.subtitle}
        </p>
      </div>

      {/* Preset addons */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: tk.dimmed }}>
          Popular add-ons
        </p>

        {config.presets.map((preset) => {
          const on      = isEnabled(preset.id);
          const price   = getPrice(preset.id);
          const PresetIcon = preset.icon;

          return (
            <motion.div
              key={preset.id}
              layout
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: on ? `${theme.ring}0.06)` : tk.cardAlt,
                border:     `1px solid ${on ? `${theme.ring}0.35)` : tk.border}`,
              }}
            >
              {/* Row */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                {/* Icon pill */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: on ? `${theme.ring}0.15)` : tk.trackBg }}
                >
                  <PresetIcon size={15} strokeWidth={1.75} style={{ color: on ? theme.accent : tk.muted }} />
                </div>

                <span className="flex-1 text-[13px] font-semibold" style={{ color: on ? theme.accent : tk.text }}>
                  {preset.label}
                </span>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => toggle(preset)}
                  style={{ background: on ? theme.accent : tk.border, width: "40px", height: "22px", borderRadius: "11px", position: "relative", flexShrink: 0 }}
                >
                  <motion.div
                    animate={{ x: on ? 18 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ position: "absolute", top: "3px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff" }}
                  />
                </button>
              </div>

              {/* Price input */}
              <AnimatePresence>
                {on && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 flex items-center gap-2">
                      <span className="text-[13px] font-semibold shrink-0" style={{ color: tk.muted }}>
                        {config.currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(preset.id, e.target.value)}
                        placeholder={preset.placeholder}
                        className={INPUT_CLS}
                        style={inputStyle()}
                      />
                      {price && Number(price) > 0 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check size={14} strokeWidth={3} style={{ color: "#34d399" }} />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Custom addons list */}
      <AnimatePresence>
        {customAddons.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: tk.dimmed }}>
              Custom add-ons
            </p>
            {customAddons.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                style={{ background: `${theme.ring}0.06)`, border: `1px solid ${theme.ring}0.30)` }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${theme.ring}0.15)` }}>
                  <Sparkles size={14} strokeWidth={1.75} style={{ color: theme.accent }} />
                </div>
                <span className="flex-1 text-[13px] font-semibold" style={{ color: theme.accent }}>{a.label}</span>
                {a.price && (
                  <span className="text-[12px] font-medium" style={{ color: tk.muted }}>
                    {config.currency}{a.price}
                  </span>
                )}
                <button type="button" onClick={() => removeCustom(a.id)} className="p-1.5 rounded-lg" style={{ color: "#f87171" }}>
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add custom addon form */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {!showCustomForm ? (
            <motion.button
              key="btn"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCustomForm(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold w-full"
              style={{ background: tk.cardAlt, border: `1px dashed ${tk.border}`, color: tk.muted }}
            >
              <Plus size={14} />
              Add custom add-on
            </motion.button>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3 p-4 rounded-2xl"
              style={{ background: tk.cardAlt, border: `1px solid ${tk.border}` }}
            >
              <p className="text-[12px] font-bold" style={{ color: tk.text }}>Custom Add-on</p>
              <input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Add-on name (e.g. Haldi Ceremony Setup)"
                className={INPUT_CLS}
                style={inputStyle()}
              />
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold shrink-0" style={{ color: tk.muted }}>{config.currency}</span>
                <input
                  type="number"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Price (optional)"
                  className={INPUT_CLS}
                  style={inputStyle()}
                />
              </div>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={submitCustom}
                  disabled={!customLabel.trim()}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                  style={{ background: theme.gradient, opacity: !customLabel.trim() ? 0.5 : 1, cursor: !customLabel.trim() ? "not-allowed" : "pointer" }}
                >
                  Add
                </motion.button>
                <button
                  type="button"
                  onClick={() => { setShowCustomForm(false); setCustomLabel(""); setCustomPrice(""); }}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-semibold"
                  style={{ background: tk.cardAlt, border: `1px solid ${tk.border}`, color: tk.muted }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enabled count */}
      {addons.length > 0 && (
        <div className="flex items-center gap-2 text-[12px]" style={{ color: tk.muted }}>
          <Check size={12} strokeWidth={3} style={{ color: "#34d399" }} />
          {addons.length} add-on{addons.length > 1 ? "s" : ""} enabled for this listing
        </div>
      )}

      {/* Hint */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: tk.dimmed }}>
        <Lightbulb size={11} style={{ color: theme.accent }} />
        Add-ons increase your average booking value. Guests love being able to customise their experience.
      </div>
    </div>
  );
}
