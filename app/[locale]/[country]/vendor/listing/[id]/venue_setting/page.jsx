"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Globe, Tag, DollarSign, Calendar,
  Clock, CreditCard, Users, Eye, CheckCircle2,
  AlertCircle, ChevronRight, Info, Lock, Zap,
  ToggleLeft, ToggleRight, Settings, Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────────────────────────────────────
   SETTINGS CONFIG — each section gets an icon, description, and rich form
───────────────────────────────────────────────────────────────────────────── */
const SETTINGS_SECTIONS = [
  {
    key: "publication",
    label: "Publication",
    icon: Globe,
    description: "Control listing visibility and publish status",
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    key: "tags",
    label: "Tags & SEO",
    icon: Tag,
    description: "Improve discoverability with tags and keywords",
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    key: "deposit",
    label: "Deposit",
    icon: DollarSign,
    description: "Configure booking deposit requirements",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    key: "reserve",
    label: "Reservation",
    icon: Calendar,
    description: "Set advance booking and hold policies",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    key: "pax",
    label: "Pax & Capacity",
    icon: Users,
    description: "Define guest counts and group restrictions",
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    key: "payment",
    label: "Payment",
    icon: CreditCard,
    description: "Configure accepted payment methods and payouts",
    color: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  {
    key: "availability",
    label: "Availability",
    icon: Clock,
    description: "Manage blackout dates and booking windows",
    color: "text-cyan-500 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
  },
];

const SECTION_KEYS = SETTINGS_SECTIONS.map((s) => s.key);

/* ─────────────────────────────────────────────────────────────────────────────
   PREMIUM SETTINGS PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function VenueSettings() {
  const router = useRouter();
  const [active, setActive] = useState("publication");
  const [saved, setSaved] = useState({});

  const [form, setForm] = useState({
    /* Publication */
    published: false,
    instantBook: false,
    featuredListing: false,

    /* Tags */
    tags: "",
    metaTitle: "",
    metaDesc: "",

    /* Deposit */
    depositEnabled: false,
    depositType: "percentage",
    depositValue: 20,

    /* Reservation */
    minAdvanceHours: 24,
    maxAdvanceDays: 180,
    holdMinutes: 30,
    autoConfirm: false,

    /* Pax */
    minGuests: 50,
    maxGuests: 500,
    allowOutsideRange: false,

    /* Payment */
    acceptOnline: true,
    acceptCash: false,
    acceptCheque: false,
    payoutBank: "",
    payoutUPI: "",

    /* Availability */
    blackoutEnabled: false,
    advanceWindowDays: 365,
    sameDayBooking: false,
  });

  const updateForm = useCallback((key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved((prev) => ({ ...prev, [active]: false }));
  }, [active]);

  const handleSave = () => {
    setSaved((prev) => ({ ...prev, [active]: true }));
    /* TODO: API persist */
  };

  const isSectionComplete = (key) => saved[key] === true;

  const completedCount = useMemo(
    () => SECTION_KEYS.filter((k) => isSectionComplete(k)).length,
    [saved]
  );

  const progress = Math.round((completedCount / SECTION_KEYS.length) * 100);
  const activeSection = SETTINGS_SECTIONS.find((s) => s.key === active);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="hidden md:flex w-[260px] xl:w-[280px] flex-col bg-white dark:bg-[#0d1117] border-r border-gray-100 dark:border-white/[0.06] flex-shrink-0">

        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer mb-4"
          >
            <ArrowLeft size={15} /> Back to Editor
          </button>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
              <Settings size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight">Venue Settings</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Configure your listing</p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">{completedCount} of {SECTION_KEYS.length} saved</span>
              <span className="text-[11px] font-bold text-violet-500 dark:text-violet-400">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 no-scrollbar">
          {SETTINGS_SECTIONS.map((section) => {
            const isActive = active === section.key;
            const isComplete = isSectionComplete(section.key);
            const Icon = section.icon;

            return (
              <button
                key={section.key}
                onClick={() => setActive(section.key)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5
                  text-left transition-all duration-150 cursor-pointer
                  ${isActive
                    ? "bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20"
                    : "border border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  }
                `}
              >
                <div className={`w-8 h-8 rounded-xl ${isActive ? section.bg : "bg-gray-50 dark:bg-white/[0.05]"} flex items-center justify-center shrink-0 transition-colors`}>
                  <Icon size={14} className={isActive ? section.color : "text-gray-400 dark:text-gray-500"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold leading-tight ${isActive ? "text-violet-700 dark:text-violet-300" : "text-gray-700 dark:text-gray-300"}`}>
                    {section.label}
                  </p>
                </div>
                {isComplete ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div className="md:hidden flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 px-4 py-3">
            <button onClick={() => router.back()} className="text-gray-500 dark:text-gray-400 cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <div className="flex gap-1.5 ml-2">
                {SETTINGS_SECTIONS.map((s) => {
                  const Icon = s.icon;
                  const isActive = active === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setActive(s.key)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition
                        ${isActive
                          ? "bg-violet-600 text-white shadow-[0_2px_8px_rgba(139,92,246,0.35)]"
                          : "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                        }
                      `}
                    >
                      <Icon size={11} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Mobile progress */}
          <div className="h-[2px] bg-gray-100 dark:bg-white/[0.04]">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500"
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Section content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-2xl mx-auto px-6 py-8"
            >
              {/* Section header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-start gap-4">
                  {activeSection && (
                    <div className={`w-12 h-12 rounded-2xl ${activeSection.bg} flex items-center justify-center shrink-0`}>
                      {(() => { const Icon = activeSection.icon; return <Icon size={22} className={activeSection.color} />; })()}
                    </div>
                  )}
                  <div>
                    <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">
                      {activeSection?.label}
                    </h1>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
                      {activeSection?.description}
                    </p>
                  </div>
                </div>
                {isSectionComplete(active) && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Saved</span>
                  </div>
                )}
              </div>

              {/* Section-specific form */}
              <div className="space-y-4">
                {active === "publication" && <PublicationSection form={form} update={updateForm} />}
                {active === "tags"        && <TagsSection        form={form} update={updateForm} />}
                {active === "deposit"     && <DepositSection     form={form} update={updateForm} />}
                {active === "reserve"     && <ReserveSection     form={form} update={updateForm} />}
                {active === "pax"         && <PaxSection         form={form} update={updateForm} />}
                {active === "payment"     && <PaymentSection     form={form} update={updateForm} />}
                {active === "availability"&& <AvailabilitySection form={form} update={updateForm} />}
              </div>

              {/* Save button */}
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={handleSave}
                  className="
                    flex items-center gap-2 px-8 py-3 rounded-xl
                    text-[14px] font-semibold text-white
                    bg-gradient-to-r from-violet-600 to-indigo-500
                    shadow-[0_2px_12px_rgba(139,92,246,0.35)]
                    hover:shadow-[0_4px_20px_rgba(139,92,246,0.50)]
                    hover:opacity-90 active:scale-[0.97]
                    transition-all cursor-pointer
                  "
                >
                  Save {activeSection?.label}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */

function SettingCard({ title, description, children, badge }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">{title}</h3>
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange, label, sublabel }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        {label && <p className="text-[13px] font-medium text-gray-800 dark:text-gray-200">{label}</p>}
        {sublabel && <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      <button
        onClick={onChange}
        className={`
          relative w-12 h-6 rounded-full border transition-all duration-250 shrink-0 cursor-pointer
          ${enabled
            ? "bg-violet-600 border-violet-600 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
            : "bg-gray-200 dark:bg-white/[0.08] border-gray-200 dark:border-white/[0.08]"
          }
        `}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm"
          style={{ left: enabled ? "calc(100% - 21px)" : "3px" }}
        />
      </button>
    </div>
  );
}

function NumberInput({ label, sublabel, value, onChange, min, max, suffix }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-[13px] font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {sublabel && <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="
            w-24 text-right px-3 py-2 rounded-xl text-[13px] font-semibold
            bg-gray-50 dark:bg-white/[0.05]
            border border-gray-200 dark:border-white/[0.08]
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-violet-500/40
            transition-all
          "
        />
        {suffix && <span className="text-[12px] text-gray-400 dark:text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-100 dark:border-white/[0.06] my-1" />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION FORMS
───────────────────────────────────────────────────────────────────────────── */

function PublicationSection({ form, update }) {
  return (
    <>
      <SettingCard title="Visibility" description="Control whether your listing appears in search results">
        <Toggle label="Published" sublabel="Listing is live and discoverable" enabled={form.published} onChange={() => update("published", !form.published)} />
        <Divider />
        <Toggle label="Instant Book" sublabel="Allow guests to book without manual approval" enabled={form.instantBook} onChange={() => update("instantBook", !form.instantBook)} />
        <Divider />
        <Toggle label="Featured Listing" sublabel="Boost visibility in search results (premium)" enabled={form.featuredListing} onChange={() => update("featuredListing", !form.featuredListing)} badge="Premium" />
      </SettingCard>

      {!form.published && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-amber-700 dark:text-amber-300 leading-relaxed">
            Your listing is currently hidden. Enable <strong>Published</strong> to make it visible to guests.
          </p>
        </div>
      )}
    </>
  );
}

function TagsSection({ form, update }) {
  return (
    <SettingCard title="Tags & SEO" description="Help guests find your listing with relevant keywords">
      <div className="space-y-4">
        <div>
          <label className="text-[12.5px] font-semibold text-gray-700 dark:text-gray-300 block mb-2">Tags</label>
          <input
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            placeholder="wedding, corporate, outdoor, luxury…"
            className="
              w-full px-4 py-3 rounded-xl text-[13px]
              bg-gray-50 dark:bg-white/[0.04]
              border border-gray-200 dark:border-white/[0.08]
              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
              focus:outline-none focus:ring-2 focus:ring-violet-500/40
              transition-all
            "
          />
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Comma-separated keywords</p>
        </div>
        <div>
          <label className="text-[12.5px] font-semibold text-gray-700 dark:text-gray-300 block mb-2">Meta Title</label>
          <input
            value={form.metaTitle}
            onChange={(e) => update("metaTitle", e.target.value)}
            placeholder="Premium Venue in Mangaluru — SYFTE"
            className="
              w-full px-4 py-3 rounded-xl text-[13px]
              bg-gray-50 dark:bg-white/[0.04]
              border border-gray-200 dark:border-white/[0.08]
              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
              focus:outline-none focus:ring-2 focus:ring-violet-500/40
              transition-all
            "
          />
        </div>
        <div>
          <label className="text-[12.5px] font-semibold text-gray-700 dark:text-gray-300 block mb-2">Meta Description</label>
          <textarea
            value={form.metaDesc}
            onChange={(e) => update("metaDesc", e.target.value)}
            rows={3}
            placeholder="Describe your venue for search engines…"
            className="
              w-full px-4 py-3 rounded-xl text-[13px] resize-none
              bg-gray-50 dark:bg-white/[0.04]
              border border-gray-200 dark:border-white/[0.08]
              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
              focus:outline-none focus:ring-2 focus:ring-violet-500/40
              transition-all
            "
          />
        </div>
      </div>
    </SettingCard>
  );
}

function DepositSection({ form, update }) {
  return (
    <SettingCard title="Booking Deposit" description="Require a deposit to secure bookings">
      <Toggle label="Require Deposit" sublabel="Collect a deposit at the time of booking" enabled={form.depositEnabled} onChange={() => update("depositEnabled", !form.depositEnabled)} />

      <AnimatePresence>
        {form.depositEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4 border-t border-gray-100 dark:border-white/[0.06] mt-3">
              <div>
                <label className="text-[12.5px] font-semibold text-gray-700 dark:text-gray-300 block mb-2">Deposit Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["percentage", "fixed"].map((type) => (
                    <button
                      key={type}
                      onClick={() => update("depositType", type)}
                      className={`
                        py-2.5 rounded-xl text-[13px] font-semibold capitalize border transition-all cursor-pointer
                        ${form.depositType === type
                          ? "bg-violet-600 border-violet-600 text-white shadow-[0_2px_8px_rgba(139,92,246,0.35)]"
                          : "bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:border-violet-300"
                        }
                      `}
                    >
                      {type === "percentage" ? "Percentage %" : "Fixed ₹"}
                    </button>
                  ))}
                </div>
              </div>
              <NumberInput
                label="Deposit Amount"
                sublabel={form.depositType === "percentage" ? "Percentage of total booking" : "Fixed amount in INR"}
                value={form.depositValue}
                onChange={(v) => update("depositValue", v)}
                min={0}
                max={form.depositType === "percentage" ? 100 : 999999}
                suffix={form.depositType === "percentage" ? "%" : "₹"}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SettingCard>
  );
}

function ReserveSection({ form, update }) {
  return (
    <SettingCard title="Reservation Policy" description="Control how far in advance guests can book">
      <div className="space-y-1">
        <NumberInput label="Minimum Advance Notice" sublabel="Minimum hours before event" value={form.minAdvanceHours} onChange={(v) => update("minAdvanceHours", v)} min={0} suffix="hrs" />
        <Divider />
        <NumberInput label="Maximum Advance Booking" sublabel="How far ahead guests can book" value={form.maxAdvanceDays} onChange={(v) => update("maxAdvanceDays", v)} min={1} suffix="days" />
        <Divider />
        <NumberInput label="Hold Duration" sublabel="Minutes to hold a booking attempt" value={form.holdMinutes} onChange={(v) => update("holdMinutes", v)} min={5} max={120} suffix="min" />
        <Divider />
        <Toggle label="Auto-Confirm Bookings" sublabel="Approve bookings automatically without manual review" enabled={form.autoConfirm} onChange={() => update("autoConfirm", !form.autoConfirm)} />
      </div>
    </SettingCard>
  );
}

function PaxSection({ form, update }) {
  return (
    <SettingCard title="Guest Capacity" description="Set the allowed guest count range for bookings">
      <div className="space-y-1">
        <NumberInput label="Minimum Guests" sublabel="Minimum number of guests per booking" value={form.minGuests} onChange={(v) => update("minGuests", v)} min={1} suffix="pax" />
        <Divider />
        <NumberInput label="Maximum Guests" sublabel="Maximum number of guests allowed" value={form.maxGuests} onChange={(v) => update("maxGuests", v)} min={1} suffix="pax" />
        <Divider />
        <Toggle label="Allow Outside Range" sublabel="Let guests enquire even if outside min/max" enabled={form.allowOutsideRange} onChange={() => update("allowOutsideRange", !form.allowOutsideRange)} />
      </div>
    </SettingCard>
  );
}

function PaymentSection({ form, update }) {
  return (
    <>
      <SettingCard title="Payment Methods" description="Choose which payment types to accept">
        <div className="space-y-1">
          <Toggle label="Online Payment" sublabel="Credit card, UPI, net banking" enabled={form.acceptOnline} onChange={() => update("acceptOnline", !form.acceptOnline)} />
          <Divider />
          <Toggle label="Cash Payment" sublabel="Accept cash at venue" enabled={form.acceptCash} onChange={() => update("acceptCash", !form.acceptCash)} />
          <Divider />
          <Toggle label="Cheque / Bank Transfer" sublabel="Accept offline transfers" enabled={form.acceptCheque} onChange={() => update("acceptCheque", !form.acceptCheque)} />
        </div>
      </SettingCard>

      <SettingCard title="Payout Details" description="Where should your earnings be sent?">
        <div className="space-y-4">
          <div>
            <label className="text-[12.5px] font-semibold text-gray-700 dark:text-gray-300 block mb-2">Bank Account Number</label>
            <input
              value={form.payoutBank}
              onChange={(e) => update("payoutBank", e.target.value)}
              placeholder="XXXX XXXX XXXX"
              className="
                w-full px-4 py-3 rounded-xl text-[13px] font-mono
                bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08]
                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all
              "
            />
          </div>
          <div>
            <label className="text-[12.5px] font-semibold text-gray-700 dark:text-gray-300 block mb-2">UPI ID</label>
            <input
              value={form.payoutUPI}
              onChange={(e) => update("payoutUPI", e.target.value)}
              placeholder="yourname@upi"
              className="
                w-full px-4 py-3 rounded-xl text-[13px]
                bg-gray-50 dark:bg-white/[0.04]
                border border-gray-200 dark:border-white/[0.08]
                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all
              "
            />
          </div>
        </div>
      </SettingCard>
    </>
  );
}

function AvailabilitySection({ form, update }) {
  return (
    <SettingCard title="Availability Controls" description="Fine-tune when your listing accepts bookings">
      <div className="space-y-1">
        <Toggle label="Blackout Dates" sublabel="Enable specific dates you're not available" enabled={form.blackoutEnabled} onChange={() => update("blackoutEnabled", !form.blackoutEnabled)} />
        <Divider />
        <NumberInput label="Advance Window" sublabel="How many days ahead guests can book" value={form.advanceWindowDays} onChange={(v) => update("advanceWindowDays", v)} min={30} max={730} suffix="days" />
        <Divider />
        <Toggle label="Same-Day Bookings" sublabel="Allow bookings made on the day of the event" enabled={form.sameDayBooking} onChange={() => update("sameDayBooking", !form.sameDayBooking)} />
      </div>
    </SettingCard>
  );
}
