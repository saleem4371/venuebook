"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  SkipForward,
  Check,
  Eye,
  Save,
  Tag,
  Users,
  Shield,
  Settings2,
  Globe,
  CreditCard,
  Clock,
  Calendar,
  Loader2,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import StepRenderer from "./steps/StepRenderer";
import { steps as ALL_STEPS, isStepCompleted } from "./steps/stepsConfig";
import { useVendorCategory } from "@/context/VendorCategoryContext";

import {
  getAmenties,
  getPropertyName,
  getEvents,
  } from "@/services/global.service";

import {
  ListingProperty,
  getGalleryCategory,
  saveListing,
  saveSetting,
  saveBasicStep,
  savePhotoStep,
  saveCapacityStep,
  saveAmenitiesStep,
  saveLocationStep,
  savePricingStep,
  saveTagsStep,
  saveAddonsStep,
  saveTermsStep,
  DeletePhotos,
  getAddon
} from "@/services/vendor.service";

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const DEFAULT_BRAND = "linear-gradient(242deg,#a44bf3,#499ce8)";

const CATEGORY_THEME = {
  venues: {
    accent: "#a44bf3",
    accent2: "#499ce8",
    ring: "rgba(164,75,243,",
    gradient: "linear-gradient(242deg,#a44bf3,#499ce8)",
  },
  farmstays: {
    accent: "#10b981",
    accent2: "#34d399",
    ring: "rgba(16,185,129,",
    gradient: "linear-gradient(242deg,#10b981,#34d399)",
  },
  studios: {
    accent: "#f97316",
    accent2: "#fb923c",
    ring: "rgba(249,115,22,",
    gradient: "linear-gradient(242deg,#f97316,#fb923c)",
  },
  workspaces: {
    accent: "#3b82f6",
    accent2: "#60a5fa",
    ring: "rgba(59,130,246,",
    gradient: "linear-gradient(242deg,#3b82f6,#60a5fa)",
  },
  rentals: {
    accent: "#f59e0b",
    accent2: "#fbbf24",
    ring: "rgba(245,158,11,",
    gradient: "linear-gradient(242deg,#f59e0b,#fbbf24)",
  },
  experiences: {
    accent: "#ec4899",
    accent2: "#f472b6",
    ring: "rgba(236,72,153,",
    gradient: "linear-gradient(242deg,#ec4899,#f472b6)",
  },
};

const CATEGORY_CONFIG = {
  venues: {
    label: "Venue",
    emoji: "🏛️",
    steps: [
      "photo",
      "basic",
      "capacity",
      "amenities",
      "location",
      "pricing",
      "tags",
      "addons",
      "terms",
    ],
    titles: {
      basic: "Basic Details",
      capacity: "Capacity & Seating",
      amenities: "Event Amenities",
      pricing: "Event Pricing",
      addons: "Vendor Add-ons",
    },
  },
  farmstays: {
    label: "Farmstay",
    emoji: "🌿",
    steps: ["photo", "basic", "capacity", "amenities", "location", "pricing", "tags", "terms"],
    titles: {
      basic: "Property Details",
      capacity: "Rooms & Capacity",
      amenities: "Outdoor Amenities",
      pricing: "Stay Pricing",
      tags: "Property Tags",
    },
  },
  studios: {
    label: "Studio",
    emoji: "🎬",
    steps: ["photo", "basic", "amenities", "location", "pricing", "tags", "addons", "terms"],
    titles: {
      basic: "Studio Details",
      amenities: "Equipment & Amenities",
      pricing: "Studio Pricing",
      addons: "Production Add-ons",
      tags: "Studio Tags",
    },
  },
  workspaces: {
    label: "Workspace",
    emoji: "💼",
    steps: ["photo", "basic", "capacity", "amenities", "location", "pricing", "terms"],
    titles: {
      basic: "Space Details",
      capacity: "Desks & Meeting Rooms",
      amenities: "Office Facilities",
      pricing: "Desk Pricing",
    },
  },
  rentals: {
    label: "Rental",
    emoji: "🏠",
    steps: ["photo", "capacity", "amenities", "location", "pricing", "tags", "terms"],
    titles: {
      basic: "Property Details",
      capacity: "Occupancy",
      amenities: "Property Amenities",
      pricing: "Rental Pricing",
    },
  },
  experiences: {
    label: "Experience",
    emoji: "✨",
    steps: ["photo", "basic", "capacity", "amenities", "location", "pricing", "addons", "terms"],
    titles: {
      basic: "Experience Details",
      capacity: "Group Size",
      amenities: "Activity Inclusions",
      pricing: "Experience Pricing",
      addons: "Add-on Experiences",
    },
  },
};

const SETTINGS_SECTIONS = [
  { key: "publication", label: "Publication", Icon: Globe },
  { key: "payment", label: "Payment", Icon: CreditCard },
  { key: "reserve", label: "Reserve", Icon: Calendar },
  { key: "pax", label: "Pax", Icon: Users },
  { key: "deposits", label: "Deposits", Icon: Shield },
  { key: "availability", label: "Availability", Icon: Clock },
  { key: "pricing", label: "Pricing", Icon: Tag },
];

/* ── Per-step validation rules ─────────────────────────────────────── */
const STEP_VALIDATORS = {
  photo: (form) => {
    if (!form.photos || form.photos.length === 0)
      return "Please upload at least one photo.";
    return null;
  },
  basic: (form) => {
    if (!form.title?.trim()) return "Title is required.";
    if (!form.description?.trim()) return "Description is required.";
    return null;
  },
  capacity: (form) => {
    if (!form.minCapacity && form.minCapacity !== 0)
      return "Minimum capacity is required.";
    if (!form.maxCapacity && form.maxCapacity !== 0)
      return "Maximum capacity is required.";
    if (Number(form.maxCapacity) < Number(form.minCapacity))
      return "Max capacity must be ≥ min capacity.";
    return null;
  },
  location: (form) => {
    if (!form.address?.trim()) return "Address is required.";
    if (!form.city?.trim()) return "City is required.";
    if (!form.state?.trim()) return "State is required.";
    if (!form.pincode?.trim()) return "Pincode is required.";
    return null;
  },
  pricing: (form) => {
    if (!form.pricing || Object.keys(form.pricing).length === 0)
      return "Please configure pricing.";
    return null;
  },
  terms: (form) => {
    if (!form.termsAccepted) return "You must accept the terms to continue.";
    return null;
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    page: isDark ? "#050816" : "#f8fafc",
    panel: isDark ? "#0b1120" : "#ffffff",
    card: isDark ? "#111827" : "#ffffff",
    border: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    text: isDark ? "#ffffff" : "#0f172a",
    muted: isDark ? "#94a3b8" : "#64748b",
    dimmed: isDark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    hoverBg: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
    inputBg: isDark ? "#0b1120" : "#ffffff",
    inputBd: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)",
    shadow: isDark
      ? "0 4px 24px rgba(0,0,0,0.35), 0 0 40px rgba(164,75,243,0.06)"
      : "0 2px 16px rgba(0,0,0,0.06)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   SETTINGS — PRIMITIVE WIDGETS
───────────────────────────────────────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
  brand = "linear-gradient(242deg,#a44bf3,#499ce8)",
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-6 rounded-full transition-all duration-200 cursor-pointer shrink-0 focus:outline-none"
      style={{ background: checked ? brand : "rgba(148,163,184,0.25)" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
        style={{
          left: checked ? "calc(100% - 22px)" : "2px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
        }}
      />
    </button>
  );
}

function Segmented({ options, value, onChange, tk, brand = DEFAULT_BRAND }) {
  return (
    <div
      className="flex rounded-xl p-1 gap-1 flex-wrap"
      style={{ background: tk.trackBg }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 min-w-[60px] px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap"
          style={
            value === opt.value
              ? { background: brand, color: "#fff" }
              : { color: tk.muted }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SettingCard({ title, description, children, tk }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: tk.card,
        border: `1px solid ${tk.border}`,
        boxShadow: tk.shadow,
      }}
    >
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h3 className="text-[15px] font-bold mb-1" style={{ color: tk.text }}>
              {title}
            </h3>
          )}
          {description && (
            <p className="text-[13px]" style={{ color: tk.muted }}>
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function SettingRow({ label, description, right, tk }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3.5 first:pt-0"
      style={{ borderTop: `1px solid ${tk.border}` }}
    >
      <div className="min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: tk.text }}>
          {label}
        </p>
        {description && (
          <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: tk.muted }}>
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SETTINGS CONTENT PANEL
───────────────────────────────────────────────────────────────────────────── */
function SettingsContent({ section, isDark, brand = DEFAULT_BRAND, form, setForm }) {
  const tk = tokens(isDark);

  const updateSettings = useCallback(
    (group, updater) => {
      setForm((prev) => {
        const currentGroup = prev?.settings?.[group] ?? {};
        const patch = typeof updater === "function" ? updater(currentGroup) : updater;
        return {
          ...prev,
          settings: { ...(prev.settings || {}), [group]: { ...currentGroup, ...patch } },
        };
      });
    },
    [setForm]
  );

  const settings = form?.settings || {};

  const pub = settings.publication ?? { status: "draft", visible: true, search: true, instant: false };
  const setPub = (u) => updateSettings("publication", u);

  const pay = settings.payment ?? { card: true, upi: true, bank: false, advance: "25" };
  const setPay = (u) => updateSettings("payment", u);

  const res = settings.reserve ?? { type: "instant", notice: "4hr", window: "1m" };
  const setRes = (u) => updateSettings("reserve", u);

  const pax = settings.pax ?? { min: "", max: "", children: true, pets: false, catering: true };
  const setPax = (u) => updateSettings("pax", u);

  const dep = settings.deposits ?? { security: false, secAmt: "", waiver: false, wavAmt: "" };
  const setDep = (u) => updateSettings("deposits", u);

  const avail = settings.availability ?? { schedule: "always", minStay: "1hr", buffer: "none" };
  const setAvail = (u) => updateSettings("availability", u);

  const price = settings.pricing ?? { model: "event", weekends: false, peak: false, cleaning: false };
  const setPrice = (u) => updateSettings("pricing", u);

  const INPUT_CLS =
    "w-full rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-violet-500/20";
  const inputStyle = { background: tk.inputBg, border: `1px solid ${tk.inputBd}`, color: tk.text };

  const panels = {
    publication: (
      <div className="space-y-4">
        <SettingCard title="Listing Status" description="Control whether this listing is visible to guests." tk={tk}>
          <Segmented
            options={[{ value: "draft", label: "Draft" }, { value: "live", label: "🟢 Live" }]}
            value={pub.status}
            onChange={(v) => setPub((p) => ({ ...p, status: v }))}
            tk={tk}
            brand={brand}
          />
          <SettingRow
            label="Show on public listing page"
            description="Guests can discover this listing on browse pages"
            right={<Toggle checked={pub.visible} onChange={(v) => setPub((p) => ({ ...p, visible: v }))} />}
            tk={tk}
          />
          <SettingRow
            label="Include in search results"
            description="This listing appears when guests filter by type or location"
            right={<Toggle checked={pub.search} onChange={(v) => setPub((p) => ({ ...p, search: v }))} />}
            tk={tk}
          />
        </SettingCard>
        <SettingCard title="Booking Control" tk={tk}>
          <SettingRow
            label="Instant booking"
            description="Guests can confirm without host approval"
            right={<Toggle checked={pub.instant} onChange={(v) => setPub((p) => ({ ...p, instant: v }))} />}
            tk={tk}
          />
        </SettingCard>
      </div>
    ),
    payment: (
      <div className="space-y-4">
        <SettingCard title="Accepted Payment Methods" tk={tk}>
          {[
            ["card", "Credit / Debit Card", "Visa, Mastercard, Amex, Rupay"],
            ["upi", "UPI", "Google Pay, PhonePe, Paytm, BHIM"],
            ["bank", "Bank Transfer", "NEFT / RTGS / IMPS"],
          ].map(([k, label, desc]) => (
            <SettingRow
              key={k}
              label={label}
              description={desc}
              right={<Toggle checked={pay[k]} onChange={(v) => setPay((p) => ({ ...p, [k]: v }))} />}
              tk={tk}
            />
          ))}
        </SettingCard>
        <SettingCard title="Advance Payment" description="Percentage of total collected at the time of booking." tk={tk}>
          <Segmented
            options={[
              { value: "0", label: "None" },
              { value: "25", label: "25%" },
              { value: "50", label: "50%" },
              { value: "100", label: "Full" },
            ]}
            value={pay.advance}
            onChange={(v) => setPay((p) => ({ ...p, advance: v }))}
            tk={tk}
            brand={brand}
          />
        </SettingCard>
      </div>
    ),
    reserve: (
      <div className="space-y-4">
        <SettingCard title="Booking Type" tk={tk}>
          <Segmented
            options={[
              { value: "instant", label: "⚡ Instant Book" },
              { value: "request", label: "📋 Request to Book" },
            ]}
            value={res.type}
            onChange={(v) => setRes((p) => ({ ...p, type: v }))}
            tk={tk}
            brand={brand}
          />
        </SettingCard>
        <SettingCard title="Booking Window" tk={tk}>
          <div className="space-y-4">
            <div>
              <p className="text-[12px] font-semibold mb-2" style={{ color: tk.muted }}>
                Minimum advance notice
              </p>
              <Segmented
                options={[
                  { value: "1hr", label: "1 hr" },
                  { value: "4hr", label: "4 hr" },
                  { value: "24hr", label: "24 hr" },
                  { value: "48hr", label: "48 hr" },
                ]}
                value={res.notice}
                onChange={(v) => setRes((p) => ({ ...p, notice: v }))}
                tk={tk}
                brand={brand}
              />
            </div>
            <div>
              <p className="text-[12px] font-semibold mb-2" style={{ color: tk.muted }}>
                Maximum advance booking
              </p>
              <Segmented
                options={[
                  { value: "1w", label: "1 wk" },
                  { value: "1m", label: "1 mo" },
                  { value: "3m", label: "3 mo" },
                  { value: "6m", label: "6 mo" },
                ]}
                value={res.window}
                onChange={(v) => setRes((p) => ({ ...p, window: v }))}
                tk={tk}
                brand={brand}
              />
            </div>
          </div>
        </SettingCard>
      </div>
    ),
    pax: (
      <div className="space-y-4">
        <SettingCard title="Guest Limits" description="Set the minimum and maximum guest count for bookings." tk={tk}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold mb-2" style={{ color: tk.muted }}>
                Min Guests
              </label>
              <input
                type="number"
                value={pax.min}
                onChange={(e) => setPax((p) => ({ ...p, min: e.target.value }))}
                placeholder="e.g. 10"
                className={INPUT_CLS}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-2" style={{ color: tk.muted }}>
                Max Guests
              </label>
              <input
                type="number"
                value={pax.max}
                onChange={(e) => setPax((p) => ({ ...p, max: e.target.value }))}
                placeholder="e.g. 500"
                className={INPUT_CLS}
                style={inputStyle}
              />
            </div>
          </div>
        </SettingCard>
        <SettingCard title="Guest Options" tk={tk}>
          {[
            ["children", "Children Allowed", "Accept bookings that include children"],
            ["pets", "Pets Allowed", "Guests may bring pets to the venue"],
            ["catering", "Outside Catering Allowed", "Guests may arrange their own caterer"],
          ].map(([k, label, desc]) => (
            <SettingRow
              key={k}
              label={label}
              description={desc}
              right={<Toggle checked={pax[k]} onChange={(v) => setPax((p) => ({ ...p, [k]: v }))} />}
              tk={tk}
            />
          ))}
        </SettingCard>
      </div>
    ),
    deposits: (
      <div className="space-y-4">
        <SettingCard title="Security Deposit" tk={tk}>
          <SettingRow
            label="Require security deposit"
            description="Collected before or at time of booking, refundable"
            right={<Toggle checked={dep.security} onChange={(v) => setDep((p) => ({ ...p, security: v }))} />}
            tk={tk}
          />
          {dep.security && (
            <div className="pt-4" style={{ borderTop: `1px solid ${tk.border}` }}>
              <label className="block text-[12px] font-semibold mb-2" style={{ color: tk.muted }}>
                Deposit Amount (₹)
              </label>
              <input
                type="number"
                value={dep.secAmt}
                onChange={(e) => setDep((p) => ({ ...p, secAmt: e.target.value }))}
                placeholder="e.g. 5000"
                className={INPUT_CLS}
                style={inputStyle}
              />
            </div>
          )}
        </SettingCard>
        <SettingCard title="Damage Waiver" tk={tk}>
          <SettingRow
            label="Include damage waiver fee"
            description="Non-refundable fee covering minor accidental damage"
            right={<Toggle checked={dep.waiver} onChange={(v) => setDep((p) => ({ ...p, waiver: v }))} />}
            tk={tk}
          />
          {dep.waiver && (
            <div className="pt-4" style={{ borderTop: `1px solid ${tk.border}` }}>
              <label className="block text-[12px] font-semibold mb-2" style={{ color: tk.muted }}>
                Waiver Amount (₹)
              </label>
              <input
                type="number"
                value={dep.wavAmt}
                onChange={(e) => setDep((p) => ({ ...p, wavAmt: e.target.value }))}
                placeholder="e.g. 2000"
                className={INPUT_CLS}
                style={inputStyle}
              />
            </div>
          )}
        </SettingCard>
      </div>
    ),
    availability: (
      <div className="space-y-4">
        <SettingCard title="Default Schedule" description="When is this listing open for bookings by default?" tk={tk}>
          <Segmented
            options={[
              { value: "always", label: "Always Available" },
              { value: "custom", label: "Custom Schedule" },
            ]}
            value={avail.schedule}
            onChange={(v) => setAvail((p) => ({ ...p, schedule: v }))}
            tk={tk}
            brand={brand}
          />
        </SettingCard>
        <SettingCard title="Booking Constraints" tk={tk}>
          <div className="space-y-5">
            <div>
              <p className="text-[12px] font-semibold mb-2" style={{ color: tk.muted }}>
                Minimum booking duration
              </p>
              <Segmented
                options={[
                  { value: "1hr", label: "1 hr" },
                  { value: "2hr", label: "2 hr" },
                  { value: "4hr", label: "4 hr" },
                  { value: "8hr", label: "8 hr" },
                ]}
                value={avail.minStay}
                onChange={(v) => setAvail((p) => ({ ...p, minStay: v }))}
                tk={tk}
                brand={brand}
              />
            </div>
            <div>
              <p className="text-[12px] font-semibold mb-2" style={{ color: tk.muted }}>
                Buffer between bookings
              </p>
              <Segmented
                options={[
                  { value: "none", label: "None" },
                  { value: "30m", label: "30 min" },
                  { value: "1hr", label: "1 hr" },
                  { value: "2hr", label: "2 hr" },
                ]}
                value={avail.buffer}
                onChange={(v) => setAvail((p) => ({ ...p, buffer: v }))}
                tk={tk}
                brand={brand}
              />
            </div>
          </div>
        </SettingCard>
      </div>
    ),
    pricing: (
      <div className="space-y-4">
        <SettingCard title="Pricing Model" description="How guests are charged for this listing." tk={tk}>
          <Segmented
            options={[
              { value: "hour", label: "Per Hour" },
              { value: "day", label: "Per Day" },
              { value: "event", label: "Per Event" },
            ]}
            value={price.model}
            onChange={(v) => setPrice((p) => ({ ...p, model: v }))}
            tk={tk}
            brand={brand}
          />
        </SettingCard>
        <SettingCard title="Price Adjustments" tk={tk}>
          {[
            ["weekends", "Weekend Pricing", "Higher rate for Friday, Saturday, Sunday bookings"],
            ["peak", "Peak Season Pricing", "Premium pricing during festive or high-demand periods"],
            ["cleaning", "Cleaning Fee", "One-time cleaning fee added to each booking"],
          ].map(([k, label, desc]) => (
            <SettingRow
              key={k}
              label={label}
              description={desc}
              right={<Toggle checked={price[k]} onChange={(v) => setPrice((p) => ({ ...p, [k]: v }))} />}
              tk={tk}
            />
          ))}
        </SettingCard>
      </div>
    ),
  };

  const secMeta = SETTINGS_SECTIONS.find((s) => s.key === section);
  const Icon = secMeta?.Icon ?? Settings2;

  return (
    <div className="px-6 md:px-8 py-7">
      <div className="flex items-center gap-3 mb-7">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(164,75,243,0.12)",
            border: "1px solid rgba(164,75,243,0.22)",
          }}
        >
          <Icon size={18} style={{ color: "#a44bf3" }} />
        </div>
        <div>
          <h2 className="text-[20px] font-bold leading-tight" style={{ color: "#ffffff" }}>
            {secMeta?.label ?? section}
          </h2>
          <p className="text-[12px] mt-0.5" style={{ color: "#94a3b8" }}>
            Configure {secMeta?.label?.toLowerCase() ?? section} settings for this listing
          </p>
        </div>
      </div>
      {panels[section] ?? (
        <div className="flex items-center justify-center h-40">
          <p className="text-[13px]" style={{ color: "#94a3b8" }}>
            Select a section to configure
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PREVIEW MODAL — FIX: was never rendered/wired up
───────────────────────────────────────────────────────────────────────────── */
function PreviewModal({ form, listingId, isDark, onClose, catCfg }) {
  const tk = tokens(isDark);

  /* Build a safe preview URL — adjust base path to your actual public listing route */
  const previewUrl = listingId
    ? `/listings/${listingId}?preview=1`
    : null;

  const coverPhoto = (() => {
    const p = form?.photos?.[0];
    if (!p) return null;
    if (typeof p === "string") return p;
    return p.src || p.url || p.path || null;
  })();

  return (
    /* Backdrop — full-screen faux viewport so it contributes layout height */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: tk.panel,
          border: `1px solid ${tk.border}`,
          borderRadius: "24px",
          boxShadow: tk.shadow,
          width: "min(560px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{
            background: tk.panel,
            borderBottom: `1px solid ${tk.border}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{catCfg?.emoji}</span>
            <p className="text-[15px] font-bold" style={{ color: tk.text }}>
              Listing Preview
            </p>
          </div>
          <div className="flex items-center gap-2">
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                style={{
                  background: "rgba(164,75,243,0.12)",
                  border: "1px solid rgba(164,75,243,0.22)",
                  color: "#a44bf3",
                }}
              >
                <ExternalLink size={12} />
                Open full page
              </a>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all"
              style={{ background: tk.trackBg, color: tk.muted }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Cover image */}
        <div
          className="w-full"
          style={{
            aspectRatio: "16/9",
            background: tk.trackBg,
            overflow: "hidden",
          }}
        >
          {coverPhoto ? (
            <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Eye size={28} style={{ color: tk.dimmed }} />
              <p className="text-[12px]" style={{ color: tk.dimmed }}>
                No cover photo yet
              </p>
            </div>
          )}
        </div>

        {/* Listing info */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <h2 className="text-[20px] font-bold" style={{ color: tk.text }}>
              {form?.title || (
                <span style={{ color: tk.dimmed }}>Untitled listing</span>
              )}
            </h2>
            {(form?.city || form?.state) && (
              <p className="text-[13px] mt-1" style={{ color: tk.muted }}>
                📍 {[form.city, form.state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {form?.description && (
            <p className="text-[13px] leading-relaxed" style={{ color: tk.muted }}>
              {form.description}
            </p>
          )}

          {/* Capacity */}
          {(form?.minCapacity || form?.maxCapacity) && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: tk.trackBg, border: `1px solid ${tk.border}` }}
            >
              <Users size={16} style={{ color: tk.muted }} />
              <div>
                <p className="text-[12px] font-semibold" style={{ color: tk.text }}>
                  Capacity
                </p>
                <p className="text-[11px]" style={{ color: tk.muted }}>
                  {form.minCapacity}–{form.maxCapacity} guests
                </p>
              </div>
            </div>
          )}

          {/* Photo count */}
          {form?.photos?.length > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="flex -space-x-2"
                style={{ direction: "ltr" }}
              >
                {form.photos.slice(0, 4).map((p, i) => {
                  const src =
                    typeof p === "string" ? p : p?.src || p?.url || p?.path || "";
                  return src ? (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover"
                      style={{
                        border: `2px solid ${tk.panel}`,
                        zIndex: 4 - i,
                      }}
                    />
                  ) : null;
                })}
              </div>
              <p className="text-[12px]" style={{ color: tk.muted }}>
                {form.photos.length} photo{form.photos.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* No data notice */}
          {!form?.title && !form?.description && !form?.photos?.length && (
            <div
              className="flex items-center gap-3 px-4 py-4 rounded-xl"
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.16)",
              }}
            >
              <AlertCircle size={16} style={{ color: "#f59e0b" }} />
              <p className="text-[12px]" style={{ color: "#fcd34d" }}>
                Complete some steps to see a fuller preview
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOADING SCREEN
───────────────────────────────────────────────────────────────────────────── */
function LoadingScreen({ isDark }) {
  const tk = tokens(isDark);
  return (
    <div className="flex items-center justify-center w-full h-full" style={{ background: tk.page }}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin" style={{ color: "#a44bf3" }} />
        <p className="text-[14px] font-medium" style={{ color: tk.muted }}>
          Loading listing data…
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   VALIDATION ERROR BANNER
───────────────────────────────────────────────────────────────────────────── */
function ValidationBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="mx-6 md:mx-8 mt-4 px-4 py-3 rounded-xl flex items-center gap-2.5 text-[12px] font-medium"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.22)",
        color: "#fca5a5",
      }}
    >
      <AlertCircle size={14} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 cursor-pointer ml-1"
        style={{ color: "#fca5a5" }}
      >
        ✕
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   buildFormData — module-level, stable reference
───────────────────────────────────────────────────────────────────────────── */
async function buildFormData(formData) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(formData)) {
    if (value === undefined || value === null) continue;

    if (key === "photos") {
      const existingPhotos = [];
      const newPhotos = [];
      for (const photo of value) {
        if (typeof photo === "string") {
          existingPhotos.push(photo);
        } else if (photo?.file instanceof File) {
          newPhotos.push(photo.file);
        } else if (photo?.path || photo?.url || photo?.images) {
          existingPhotos.push(photo.path || photo.url || photo.images);
        }
      }
      fd.append("existing_photos", JSON.stringify(existingPhotos));
      newPhotos.forEach((file) => fd.append("new_photos", file));
      continue;
    }

    if (key === "photoSections") {
      const updatedSections = [];
      value.forEach((section, sectionIndex) => {
        const images = [];
        section.images?.forEach((img) => {
          if (typeof img === "string") {
            images.push(img);
          } else if (img?.images && typeof img.images === "string") {
            images.push(img.images);
          } else if (img?.file instanceof File) {
            const fieldName = `section_${sectionIndex}_images`;
            fd.append(fieldName, img.file);
            images.push({ uploadField: fieldName });
          }
        });
        updatedSections.push({ ...section, images });
      });
      fd.append("photoSections", JSON.stringify(updatedSections));
      continue;
    }

    if (Array.isArray(value) || typeof value === "object") {
      fd.append(key, JSON.stringify(value));
      continue;
    }
    fd.append(key, String(value));
  }
  return fd;
}

/* ─────────────────────────────────────────────────────────────────────────────
   STEP SAVE HANDLERS
───────────────────────────────────────────────────────────────────────────── */
const STEP_SAVE_HANDLERS = {
  photo: savePhotoStep,
  basic: saveBasicStep,
  capacity: saveCapacityStep,
  amenities: saveAmenitiesStep,
  location: saveLocationStep,
  pricing: savePricingStep,
  tags: saveTagsStep,
  addons: saveAddonsStep,   /* FIX: was missing */
  terms: saveTermsStep,
};

const buildStepPayload = async (step, form) => {
  switch (step) {
 case "photo": {
  const fd = new FormData();

  const existingPhotos = [];
  const sectionsPayload = [];

  /*
  ---------------------------
  MAIN PHOTOS
  ---------------------------
  */

  for (const photo of form.photos || []) {
    if (typeof photo === "string") {
      existingPhotos.push(photo);
    }

    else if (photo?.path) {
      existingPhotos.push(photo.path);
    }

    else if (photo?.file instanceof File) {
      const id = crypto.randomUUID();

      existingPhotos.push({
        id,
        type: "new",
      });

      fd.append("files", photo.file, id);
    }
  }

  /*
  ---------------------------
  SECTIONS
  ---------------------------
  */

  (form.photoSections || []).forEach((section) => {
    const images = [];

    (section.images || []).forEach((img) => {
      if (typeof img === "string" || img?.path) {
        images.push({
          type: "existing",
          path: img?.path || img,
        });
      }

      else if (img?.file instanceof File) {
        const id = crypto.randomUUID();

        fd.append("files", img.file, id);

        images.push({
          type: "new",
          id,
        });
      }
    });

    sectionsPayload.push({
      id: section.id,
      name: section.name,
      description: section.description || "",
      images,
    });
  });

  fd.append("existingPhotos", JSON.stringify(existingPhotos));
  fd.append("photoSections", JSON.stringify(sectionsPayload));

  return fd;
}
    case "basic":
      return {
        title: form.title,
        description: form.description,
        category: form.category,
        propety_category: form.propety_category,
      };

    case "capacity":
      return {
        minCapacity: form.minCapacity,
        maxCapacity: form.maxCapacity,
        totalDesks: form.totalDesks,
        meetingRooms: form.meetingRooms,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        totalRooms: form.totalRooms,
        bedsPerRoom: form.bedsPerRoom,
      };
 ////totalDesks  meetingRooms bedrooms bathrooms totalRooms bedsPerRoom
    case "amenities":
      return { selected_amenities: form.amenities };

    case "location":
      return {
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
      };

    case "pricing":
      return { pricing: form.pricing , type : form.propety_category};

    case "tags":
      return {
        venue_tags: form.venue_tags,
        event_tags: form.event_tags,
      };

    /* FIX: addons was returning {} — now sends proper payload */
    case "addons":
      return { addons: form.addons || [] };

    case "terms":
      return {
        termsAccepted: form.termsAccepted,
        cancellationPolicy: form.cancellationPolicy,
        houseRules: form.houseRules,
      };

    default:
      return {};
  }
};

const SETTINGS_SECTION_MAP = {
  publication: 1,
  payment: 2,
  reserve: 3,
  pax: 4,
  deposits: 5,
  availability: 6,
  pricing: 7,
};

const buildSettingsPayload = (section, form) => {
  const settings = form?.settings || {};
  return {
    type: SETTINGS_SECTION_MAP[section],
    section,
    data: settings?.[section] || {},
  };
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function ListingEditor() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id ?? null;

  /* ── Theme ─────────────────────────────────────────────────────────────── */
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  /* ── Category ────────────────────────────────────────────────────────────── */
  const { activeCategory } = useVendorCategory();

  const categorySteps = useMemo(() => {
    const cfg = CATEGORY_CONFIG[activeCategory] ?? CATEGORY_CONFIG.venues;
    return cfg.steps
      .map((key) => {
        const base = ALL_STEPS.find((s) => s.key === key);
        if (!base) return null;
        return { ...base, title: cfg.titles[key] ?? base.title };
      })
      .filter(Boolean);
  }, [activeCategory]);

  /* ── Core state ──────────────────────────────────────────────────────────── */
  const [activeStep, setActiveStep] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("workspace");
  const [settingsSection, setSettingsSection] = useState("publication");
  const [mobileShowContent, setMobileShowContent] = useState(false);
  const [showPreview, setShowPreview] = useState(false);   /* FIX: preview state */
  const [categorys, setCategory] = useState([]);
  const [addons, setAddons] = useState([]);

  /* ── Loading / saving / error states ────────────────────────────────────── */
  const [isPageLoading, setIsPageLoading] = useState(!!listingId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [stepError, setStepError] = useState(null);

  const saveInFlight = useRef(false);

  /* ── Form ────────────────────────────────────────────────────────────────── */
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    minCapacity: 0,
    maxCapacity: 0,

    totalDesks: 0,
    meetingRooms: 0,
    bedrooms: 0,
    bathrooms: 0,
    totalRooms: 0,
    bedsPerRoom: 0,
   
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    propety_category: "",
    pricing: {},
    termsAccepted: false,
    cancellationPolicy: "",
    houseRules: "",
    photos: [],
    photoSections: [],
    amenities: [],
    venue_tags: [],
    event_tags: [],
    addons: [],          /* FIX: initialise addons */
    settings: {},
    publish_status: 0,
  });

  /* ── Auto-open first incomplete step ─────────────────────────────────────── */
  useEffect(() => {
    if (categorySteps.length === 0 || isPageLoading) return;
    const firstIncomplete = categorySteps.find((s) => !isStepCompleted(s.key, form));
    setActiveStep(firstIncomplete?.key || categorySteps[0]?.key || null);
  }, [categorySteps, isPageLoading]);

  const stepCompletionMap = useMemo(() => {
    const map = {};
    for (const step of categorySteps) {
      map[step.key] = isStepCompleted(step.key, form);
    }
    return map;
  }, [categorySteps, form]);


   const onDeleteImgeFile = async (image) => {
 
 await DeletePhotos(image);

  // api delete logic
};


  /* ── Progress ─────────────────────────────────────────────────────────────── */
  const progress = useMemo(() => {
    const requiredSteps = categorySteps.filter((s) => s.required);
    const completedRequired = requiredSteps.filter((s) => stepCompletionMap[s.key]).length;
    return requiredSteps.length
      ? Math.round((completedRequired / requiredSteps.length) * 100)
      : 0;
  }, [categorySteps, stepCompletionMap]);

  const requiredSteps = categorySteps.filter((s) => s.required);
  const completedRequired = requiredSteps.filter((s) => isStepCompleted(s.key, form)).length;
  const completedCount = categorySteps.filter((s) => isStepCompleted(s.key, form)).length;
  const allCompleted = completedRequired === requiredSteps.length;

  /* ── Active step derived ──────────────────────────────────────────────────── */
  const activeStepObj = categorySteps.find((s) => s.key === activeStep);
  const stepIndex = categorySteps.findIndex((s) => s.key === activeStep);
  const stepDone = activeStep ? isStepCompleted(activeStep, form) : false;
  const isOptional = activeStepObj?.required === false;

  /* ── Mobile step selector ─────────────────────────────────────────────────── */
  const selectStep = (key) => {
    setSidebarTab("workspace");
    setActiveStep(key);
    setMobileShowContent(true);
    setStepError(null);
  };

  /* ── Navigation ───────────────────────────────────────────────────────────── */
  const goSkip = () => {
    const ci = categorySteps.findIndex((s) => s.key === activeStep);
    const next = ci < categorySteps.length - 1 ? categorySteps[ci + 1].key : null;
    setActiveStep(next);
    setStepError(null);
    if (!next) setMobileShowContent(false);
  };

  /* ── Category display + theme ─────────────────────────────────────────────── */
  const catCfg = CATEGORY_CONFIG[activeCategory] ?? CATEGORY_CONFIG.venues;
  const catTheme = CATEGORY_THEME[activeCategory] ?? CATEGORY_THEME.venues;
  const BRAND = catTheme.gradient;
  const tk = tokens(isDark);

  /* ── Data fetching ────────────────────────────────────────────────────────── */
  const [amenities, setAmenities] = useState([]);
  const [property, setProperty] = useState([]);
  const [event, setEvent] = useState([]);

  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;

    const load = async () => {
      setIsPageLoading(true);
      try {
        const [res, resCt] = await Promise.all([
          ListingProperty(listingId),
          getGalleryCategory(listingId),
        ]);
        if (cancelled) return;
        if (res?.data) setForm((prev) => ({ ...prev, ...res.data }));
        if (resCt?.data) setCategory(resCt.data);
      } catch (err) {
        if (!cancelled) console.error("Listing load error:", err);
      } finally {
        if (!cancelled) setIsPageLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [listingId]);

  useEffect(() => {
    const cat = form?.propety_category;
    if (!cat) return;
    let cancelled = false;

    const loadAmenities = async () => {
      try {
        const [resEvent, resAmen, resProp,resAddon] = await Promise.all([
          getEvents(),
          getAmenties(cat),
          getPropertyName(cat),
          getAddon(cat),
        ]);
        if (cancelled) return;
        setEvent(resEvent?.data ?? []);
        setProperty(resProp?.data?.data ?? []);
        const mergedData = (resAmen?.data?.data ?? []).map((group) => ({
          ...group,
          children: (group.children ?? []).map((item) => ({
            ...item,
            icon: "Check",
            color: "",
          })),
        }));
        setAmenities(mergedData);
        setAddons(resAddon?.data ?? []);
      } catch (err) {
        if (!cancelled) console.error("Amenities load error:", err);
      }
    };

    loadAmenities();
    return () => { cancelled = true; };
  }, [form?.propety_category]);

  /* ── PRIMARY CTA HANDLER ──────────────────────────────────────────────────── */
  const handleCTA = useCallback(async () => {
    if (saveInFlight.current) return;
    setSaveError(null);
    setStepError(null);

    /* SETTINGS FLOW */
    if (sidebarTab === "settings") {
      saveInFlight.current = true;
      setIsSaving(true);
      try {
        const payload = buildSettingsPayload(settingsSection, form);
        await saveSetting(listingId, payload);
       

        const currentIndex = SETTINGS_SECTIONS.findIndex((s) => s.key === settingsSection);
        const nextSection = SETTINGS_SECTIONS[currentIndex + 1];
        if (nextSection) {
          setSettingsSection(nextSection.key);
          return;
        }
      } catch (err) {
        console.error(err);
        setSaveError("Failed to save settings.");
      } finally {
        setIsSaving(false);
        saveInFlight.current = false;
      }
      return;
    }

    /* WORKSPACE FLOW */
    if (activeStep) {
      const validator = STEP_VALIDATORS[activeStep];
      if (validator) {
        const err = validator(form);
        if (err) {
          setStepError(err);
          return;
        }
      }
      if (!stepDone && !isOptional) return;
    }

    const currentIndex = categorySteps.findIndex((s) => s.key === activeStep);
    const nextStep = categorySteps[currentIndex + 1];

    saveInFlight.current = true;
    setIsSaving(true);

    try {
      const saveHandler = STEP_SAVE_HANDLERS[activeStep];
      if (!saveHandler) throw new Error(`No save handler for step: ${activeStep}`);

      const payload = await buildStepPayload(activeStep, form);
      await saveHandler(listingId, payload);

      setStepError(null);

      if (nextStep) {
        setActiveStep(nextStep.key);
        return;
      }

      /* All steps done → go to settings */
      setSidebarTab("settings");
      setSettingsSection("publication");
      setMobileShowContent(true);
    } catch (err) {
      console.error(err);
      setSaveError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
      saveInFlight.current = false;
    }
  }, [
    sidebarTab,
    settingsSection,
    activeStep,
    stepDone,
    isOptional,
    categorySteps,
    form,
    listingId,
  ]);

  /* ── CTA disabled / label ─────────────────────────────────────────────────── */
  const ctaDisabled =
    isSaving ||
    (sidebarTab === "workspace" && activeStep && !stepDone && !isOptional);

  const ctaLabel = isSaving
    ? "Saving…"
    : sidebarTab === "settings"
    ? settingsSection === SETTINGS_SECTIONS[SETTINGS_SECTIONS.length - 1]?.key
      ? "Final Submit"
      : "Save & Next"
    : "Save & Continue";

 

  /* ──────────────────────────────────────────────────────────────────────────
     RENDER
  ─────────────────────────────────────────────────────────────────────────── */
  if (isPageLoading) {
    return (
      <div
        className="-mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10 -mb-24 h-[calc(100vh-64px)] md:h-[calc(100vh-72px)]"
        style={{ background: tk.page }}
      >
        <LoadingScreen isDark={isDark} />
      </div>
    );
  }

  return (
    <>
      {/* FIX: Preview modal rendered outside the editor layout */}
      <AnimatePresence>
        {showPreview && (
          <PreviewModal
            form={form}
            listingId={listingId}
            isDark={isDark}
            catCfg={catCfg}
            onClose={() => setShowPreview(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={[
          "-mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10 -mb-24",
          "h-[calc(100vh-64px)] md:h-[calc(100vh-72px)]",
          "flex flex-col overflow-hidden",
        ].join(" ")}
        style={{ background: tk.page }}
      >
        {/* ════════════════════════════════════════════════════
            GLOBAL HEADER
        ════════════════════════════════════════════════════ */}
        <header
          className="shrink-0 flex items-center justify-between gap-4 px-4 md:px-6"
          style={{
            background: tk.panel,
            borderBottom: `1px solid ${tk.border}`,
            minHeight: "70px",
          }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="hidden md:flex items-center gap-1.5 text-[13px] font-medium cursor-pointer transition-colors shrink-0"
              style={{ color: tk.muted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = tk.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = tk.muted)}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {!mobileShowContent && (
              <button
                onClick={() => router.back()}
                className="flex md:hidden items-center gap-1.5 text-[13px] font-medium cursor-pointer transition-colors shrink-0"
                style={{ color: tk.muted }}
                onMouseEnter={(e) => (e.currentTarget.style.color = tk.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = tk.muted)}
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            {mobileShowContent && (
              <button
                onClick={() => setMobileShowContent(false)}
                className="md:hidden flex items-center gap-1.5 text-[13px] font-medium cursor-pointer transition-colors shrink-0"
                style={{ color: tk.muted }}
              >
                <ArrowLeft size={14} /> Steps
              </button>
            )}

            <div className="w-px h-5 shrink-0" style={{ background: tk.border }} />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none shrink-0">{catCfg.emoji}</span>
                <h1 className="text-[18px] font-bold truncate" style={{ color: tk.text }}>
                  Listing Editor
                </h1>
                <span
                  className="hidden sm:inline-flex shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={
                    allCompleted
                      ? {
                          background: "rgba(16,185,129,0.12)",
                          border: "1px solid rgba(16,185,129,0.22)",
                          color: "#6ee7b7",
                        }
                      : {
                          background: `${catTheme.ring}0.10)`,
                          border: `1px solid ${catTheme.ring}0.20)`,
                          color: catTheme.accent,
                        }
                  }
                >
                  {allCompleted
                    ? form.publish_status === 1
                      ? "Published"
                      : "Ready to Publish"
                    : `${progress}%`}
                </span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: tk.dimmed }}>
                {completedCount} of {categorySteps.length} sections complete
              </p>
            </div>
          </div>

          {/* FIX: Preview button now opens the PreviewModal */}
          <button
            onClick={() => setShowPreview(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer shrink-0"
            style={{
              background: tk.trackBg,
              border: `1px solid ${tk.border}`,
              color: tk.muted,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = tk.text;
              e.currentTarget.style.borderColor = "rgba(164,75,243,0.38)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = tk.muted;
              e.currentTarget.style.borderColor = tk.border;
            }}
          >
            <Eye size={14} /> Preview
          </button>
        </header>

        {/* ════════════════════════════════════════════════════
            BODY
        ════════════════════════════════════════════════════ */}
        <div className="flex flex-1 overflow-hidden" style={{ background: tk.panel }}>
          {/* ── SIDEBAR ───────────────────────────────────────── */}
          <aside
            className={[
              "flex-col shrink-0 overflow-y-auto",
              mobileShowContent
                ? "hidden md:flex md:w-[380px]"
                : "flex w-full md:w-[380px]",
            ].join(" ")}
            style={{
              background: tk.panel,
              borderRight: `1px solid ${tk.border}`,
              scrollbarWidth: "none",
            }}
          >
            <div
              className="sticky top-0 z-20 pb-1"
              style={{
                background: tk.panel,
                boxShadow: isDark
                  ? "0 4px 12px rgba(0,0,0,0.25)"
                  : "0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              {/* Listing name card */}
              <div className="px-4 pt-4 pb-3">
                <div
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl"
                  style={{ background: tk.card, border: `1px solid ${tk.border}` }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                    style={{
                      background: `${catTheme.ring}0.12)`,
                      border: `1px solid ${catTheme.ring}0.22)`,
                    }}
                  >
                    {catCfg.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold truncate leading-tight" style={{ color: tk.text }}>
                      {form?.title || "Untitled Listing"}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: tk.muted }}>
                      {allCompleted ? "Ready to publish" : `${progress}% complete`}
                    </p>
                  </div>
                  <div className="relative w-10 h-10 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3.5" stroke={tk.trackBg} />
                      <circle
                        cx="20" cy="20" r="16" fill="none" strokeWidth="3.5"
                        stroke={allCompleted ? "#10b981" : catTheme.accent}
                        strokeDasharray={2 * Math.PI * 16}
                        strokeDashoffset={2 * Math.PI * 16 - (progress / 100) * 2 * Math.PI * 16}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <span
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-black tabular-nums"
                      style={{ color: allCompleted ? "#10b981" : catTheme.accent }}
                    >
                      {progress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Toggle */}
              <div className="px-4">
                <div className="flex rounded-xl p-1 gap-1" style={{ background: tk.trackBg }}>
                  {[
                    { key: "workspace", label: "Your Space" },
                    { key: "settings", label: "Settings" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setSidebarTab(tab.key);
                        if (tab.key === "settings") setMobileShowContent(true);
                      }}
                      className="flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer"
                      style={
                        sidebarTab === tab.key
                          ? { background: DEFAULT_BRAND, color: "#fff" }
                          : { color: tk.muted }
                      }
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {!allCompleted && (
                <div
                  className="mx-4 mt-3 mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-medium"
                  style={{
                    background: "rgba(245,158,11,0.07)",
                    border: "1px solid rgba(245,158,11,0.18)",
                    color: "#fcd34d",
                  }}
                >
                  <span className="shrink-0">⚠️</span>
                  Complete all steps below to publish
                </div>
              )}
            </div>

            {/* WORKSPACE tab */}
            {sidebarTab === "workspace" && (
              <>
                <div className="p-4 flex-1">
                  <div className="relative">
                    {categorySteps.map((step, idx) => {
                      const done = isStepCompleted(step.key, form);
                      const isAct = sidebarTab === "workspace" && activeStep === step.key;
                      const isLast = idx === categorySteps.length - 1;

                      return (
                        <div key={step.key} className="relative flex items-center gap-3 mb-1">
                          {!isLast && (
                            <div
                              className="absolute left-[15px] w-[2px]"
                              style={{
                                top: "calc(50% + 16px)",
                                height: "calc(100% - 28px)",
                                background: done ? "rgba(16,185,129,0.45)" : tk.border,
                              }}
                            />
                          )}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 relative transition-all duration-200"
                            style={{
                              background: done ? "#10b981" : isAct ? `${catTheme.ring}0.18)` : tk.card,
                              border: done
                                ? "2px solid #10b981"
                                : isAct
                                ? `2px solid ${catTheme.accent}`
                                : `2px solid ${tk.border}`,
                            }}
                          >
                            {done ? (
                              <Check size={13} strokeWidth={2.5} style={{ color: "#fff" }} />
                            ) : (
                              <span
                                className="text-[11px] font-bold tabular-nums"
                                style={{ color: isAct ? catTheme.accent : tk.muted }}
                              >
                                {idx + 1}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => selectStep(step.key)}
                            className="flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer min-w-0 mb-1"
                            style={{
                              background: isAct ? `${catTheme.ring}0.10)` : "transparent",
                              border: isAct ? `1px solid ${catTheme.ring}0.22)` : `1px solid ${tk.border}`,
                            }}
                            onMouseEnter={(e) => {
                              if (!isAct) e.currentTarget.style.background = tk.hoverBg;
                            }}
                            onMouseLeave={(e) => {
                              if (!isAct) e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <div className="min-w-0">
                              <p
                                className="text-[13px] font-semibold truncate leading-snug"
                                style={{
                                  color: isAct ? catTheme.accent : tk.text,
                                }}
                              >
                                {step.title}
                              </p>
                              <p
                                className="text-[11px] mt-0.5"
                                style={{
                                  color: tk.muted,
                                }}
                              >
                                {done ? "✓ Complete" : isAct ? "In progress" : "Pending"}
                              </p>
                            </div>
                            {!done && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                                style={
                                  step.required
                                    ? {
                                        background: "rgba(239,68,68,0.10)",
                                        color: "#fca5a5",
                                        border: "1px solid rgba(239,68,68,0.16)",
                                      }
                                    : {
                                        background: tk.trackBg,
                                        color: tk.muted,
                                        border: `1px solid ${tk.border}`,
                                      }
                                }
                              >
                                {step.required ? "Req" : "Opt"}
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="h-20 md:hidden shrink-0" />
              </>
            )}

            {/* SETTINGS tab */}
            {sidebarTab === "settings" && (
              <div className="px-3 pb-4 flex-1" style={{ paddingTop: "4px" }}>
                <p
                  className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: tk.dimmed }}
                >
                  Configuration
                </p>
                <div className="space-y-0.5">
                  {SETTINGS_SECTIONS.map(({ key, label, Icon }) => {
                    const isActive = settingsSection === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSettingsSection(key);
                          setSidebarTab("settings");
                          setMobileShowContent(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer"
                        style={{
                          background: isActive ? `${catTheme.ring}0.14)` : "transparent",
                          border: isActive
                            ? `1px solid ${catTheme.ring}0.28)`
                            : "1px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = tk.hoverBg;
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: isActive ? `${catTheme.ring}0.18)` : tk.trackBg }}
                        >
                          <Icon size={12} style={{ color: isActive ? catTheme.accent : tk.muted }} />
                        </div>
                        <span
                          className="flex-1 text-[12px] font-medium"
                          style={{ color: isActive ? catTheme.accent : tk.text }}
                        >
                          {label}
                        </span>
                        {isActive && (
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: catTheme.accent }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* ── MAIN CONTENT ─────────────────────────────────────── */}
          <main
            className={
              mobileShowContent
                ? "flex-1 overflow-hidden relative flex flex-col"
                : "hidden md:flex md:flex-1 md:overflow-hidden md:relative md:flex-col"
            }
            style={{ background: tk.panel }}
          >
            <AnimatePresence>
              {saveError && (
                <ValidationBanner message={saveError} onDismiss={() => setSaveError(null)} />
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="popLayout">
                {/* Settings panel */}
                {sidebarTab === "settings" ? (
                  <motion.div
                    key="settings-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="absolute inset-0 overflow-y-auto"
                    style={{ scrollbarWidth: "thin", scrollbarColor: `${tk.border} transparent` }}
                  >
                    <SettingsContent
                      section={settingsSection}
                      isDark={isDark}
                      brand={BRAND}
                      form={form}
                      setForm={setForm}
                    />
                  </motion.div>
                ) : activeStep ? (
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col overflow-hidden"
                  >
                    {/* Step sub-header */}
                    <div
                      className="px-6 md:px-8 pt-3 pb-3 shrink-0"
                      style={{ background: tk.panel, borderBottom: `1px solid ${tk.border}` }}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: tk.dimmed }}>
                        Step {stepIndex + 1} of {categorySteps.length}
                      </p>
                      <p className="text-[17px] font-bold" style={{ color: tk.text }}>
                        {activeStepObj?.title}
                      </p>
                    </div>

                    <AnimatePresence>
                      {stepError && (
                        <ValidationBanner
                          message={stepError}
                          onDismiss={() => setStepError(null)}
                        />
                      )}
                    </AnimatePresence>

                    {/* Step content */}
                    <div
                      className="flex-1 overflow-y-auto px-6 md:px-8 py-8"
                      style={{ scrollbarWidth: "thin", scrollbarColor: `${tk.border} transparent` }}
                    >
                      <StepRenderer
                        step={activeStep}
                        form={form}
                        setForm={setForm}
                        category={activeCategory}
                        amenities={amenities}
                        property={property}
                        event={event}
                        categorys={categorys}
                        addonList={addons}
                         onDeleteImgeFile={onDeleteImgeFile}
                      />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* ════════════════════════════════════════════════════
            MOBILE FIXED PREVIEW BUTTON
        ════════════════════════════════════════════════════ */}
        {!mobileShowContent && (
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3 z-50"
            style={{
              background: isDark ? "rgba(11,17,32,0.96)" : "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: `1px solid ${tk.border}`,
            }}
          >
            {/* FIX: mobile preview button also opens the modal */}
            <button
              onClick={() => setShowPreview(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
              style={{
                background: tk.trackBg,
                border: `1px solid ${tk.border}`,
                color: tk.muted,
              }}
            >
              <Eye size={14} /> Preview Listing
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            BOTTOM ACTION BAR
        ════════════════════════════════════════════════════ */}
        <footer
          className={[
            "shrink-0 flex items-center gap-3 px-4 md:px-6",
            !mobileShowContent ? "hidden md:flex" : "flex",
          ].join(" ")}
          style={{
            background: isDark ? "rgba(11,17,32,0.96)" : "rgba(255,255,255,0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: `1px solid ${tk.border}`,
            minHeight: "58px",
          }}
        >
          <div className="flex items-center gap-2 ml-auto">
            {/* Skip — optional steps only */}
            {sidebarTab === "workspace" && activeStep && isOptional && !stepDone && (
              <button
                onClick={goSkip}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer"
                style={{ color: tk.muted, opacity: isSaving ? 0.5 : 1 }}
                onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.color = tk.text; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = tk.muted; }}
              >
                Skip <SkipForward size={13} />
              </button>
            )}

            {/* Primary CTA */}
            <button
              onClick={handleCTA}
              disabled={ctaDisabled}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 active:scale-[0.98]"
              style={
                ctaDisabled
                  ? {
                      background: tk.trackBg,
                      color: tk.muted,
                      cursor: "not-allowed",
                      opacity: 0.6,
                    }
                  : {
                      background: DEFAULT_BRAND,
                      color: "#fff",
                      cursor: "pointer",
                    }
              }
              onMouseEnter={(e) => { if (!ctaDisabled) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {ctaLabel}
              {!isSaving &&
                sidebarTab !== "settings" &&
                (stepDone || isOptional || !activeStep) && (
                  <ChevronRight size={14} />
                )}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}