"use client";

/* ══════════════════════════════════════════════════════════════════
   CREATE LEAD WORKSPACE  — Full-width CRM operational layout
   ──────────────────────────────────────────────────────────────
   Desktop  : 2-column layout — form (left) + sticky summary (right)
   Tablet   : 1-column, summary below form
   Mobile   : single column, fixed bottom CTA bar
══════════════════════════════════════════════════════════════════ */

import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  UserPlus,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Users,
  AlignLeft,
  X,
  AlertTriangle,
  Building2,
  Clock,
  Zap,
  CheckCircle2,
  Banknote,
  Tag,
  Save,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { MOCK, STATE_CFG } from "../_data";

import {
  load_shift_event,
  Load_all_venues,
  globalSetting,
  leads_create,
  all_reservations,
} from "@/services/booking.service";

/* ── Derived options ────────────────────────────────────────── */
const VENUE_OPTIONS = [...new Set(MOCK.map((i) => i.venue))].sort();
const EVENT_TYPES = [...new Set(MOCK.map((i) => i.eventType))].sort();

/* ── Priority config ─────────────────────────────────────────── */
const PRIORITY_CFG = {
  low: {
    dot: "bg-blue-400",
    active:
      "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/50 text-blue-700 dark:text-blue-300",
  },
  medium: {
    dot: "bg-amber-400",
    active:
      "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-300",
  },
  high: {
    dot: "bg-orange-500",
    active:
      "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700/50 text-orange-700 dark:text-orange-300",
  },
  urgent: {
    dot: "bg-rose-500",
    active:
      "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700/50 text-rose-700 dark:text-rose-300",
  },
};

/* ── Tags config ────────────────────────────────────────────── */
const TAGS_CFG = [
  {
    key: "vip",
    tKey: "tagVIP",
    active:
      "bg-violet-50 dark:bg-violet-950/30 border-violet-300 dark:border-violet-700/50 text-violet-700 dark:text-violet-300",
  },
  {
    key: "repeat",
    tKey: "tagRepeat",
    active:
      "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/50 text-blue-700 dark:text-blue-300",
  },
  {
    key: "urgent",
    tKey: "tagUrgent",
    active:
      "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700/50 text-rose-700 dark:text-rose-300",
  },
  {
    key: "premium",
    tKey: "tagPremium",
    active:
      "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-300",
  },
];

/* ── Default form state ─────────────────────────────────────── */
const EMPTY = {
  venue: "",
  eventDate: "",
  shift: "",
  name: "",
  phone: "",
  email: "",
  source: "",
  referredBy: "",
  guestCount: "",
  customerType: "new",
  budget: "",
  eventType: "",
  priority: "medium",
  address: "",
  notes: "",
  tags: [],
};

/* ── Shared input class ──────────────────────────────────────── */
const inputCls = [
  "w-full px-3.5 py-2.5 rounded-xl text-sm",
  "border border-gray-200 dark:border-white/[0.08]",
  "bg-white dark:bg-gray-900/60",
  "text-gray-900 dark:text-gray-100",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  "outline-none focus:border-violet-400 dark:focus:border-violet-500",
  "focus:ring-2 focus:ring-violet-500/20 transition-all",
].join(" ");

const labelCls =
  "block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5";

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

/* ── Section card wrapper ────────────────────────────────────── */
function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 sm:p-6">
      {title && (
        <div className="flex items-center gap-2 mb-5">
          {Icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40 shrink-0">
              <Icon
                size={13}
                className="text-violet-600 dark:text-violet-400"
                aria-hidden="true"
              />
            </span>
          )}
          <h3 className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Custom date input — no browser chrome ───────────────────── */
function DateInput({ value, onChange, label, required }) {
  const ref = useRef(null);
  const formatted = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ref.current?.showPicker?.()}
      onKeyDown={(e) => e.key === "Enter" && ref.current?.showPicker?.()}
      className={[
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all border select-none",
        value
          ? "border-violet-300 dark:border-violet-700/60 bg-violet-50/30 dark:bg-violet-950/20 ring-2 ring-violet-500/10"
          : "border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-white/[0.14]",
      ].join(" ")}
    >
      <Calendar
        size={14}
        className={`shrink-0 ${value ? "text-violet-500 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"}`}
        aria-hidden="true"
      />
      <span
        className={`text-sm flex-1 ${value ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-400 dark:text-gray-500"}`}
      >
        {formatted ?? label}
      </span>
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Clear"
        >
          <X size={13} />
        </button>
      )}
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="sr-only"
        aria-label={label}
      />
    </div>
  );
}

/* ── Priority selector ───────────────────────────────────────── */
function PrioritySelector({ value, onChange, t }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(PRIORITY_CFG).map(([key, cfg]) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
              isActive
                ? cfg.active
                : "bg-white dark:bg-gray-900/60 border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/[0.14]",
            ].join(" ")}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${isActive ? cfg.dot : "bg-gray-300 dark:bg-gray-600"}`}
            />
            {t(
              `addLeadModal.priority${key.charAt(0).toUpperCase() + key.slice(1)}`,
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Quick tags ──────────────────────────────────────────────── */
function TagsSelector({ value, onChange, t }) {
  const toggle = (key) =>
    onChange(
      value.includes(key) ? value.filter((k) => k !== key) : [...value, key],
    );

  return (
    <div className="flex flex-wrap gap-2">
      {TAGS_CFG.map(({ key, tKey, active }) => {
        const on = value.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
              on
                ? active
                : "bg-white dark:bg-gray-900/60 border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/[0.14]",
            ].join(" ")}
          >
            {on && (
              <CheckCircle2 size={11} className="shrink-0" aria-hidden="true" />
            )}
            {t(`addLeadModal.${tKey}`)}
          </button>
        );
      })}
    </div>
  );
}

/* ── Right summary panel ─────────────────────────────────────── */
function SummaryPanel({ venue, t, reserve }) {
  const venueBookings = useMemo(
    () => (venue ? reserve.filter((i) => i.venue === venue) : []),
    [venue],
  );

  const stats = useMemo(() => {
    if (!venueBookings.length) return null;
    const total = venueBookings.length;
    const revenue = venueBookings.reduce((s, i) => s + i.amountNum, 0);
    const avg = Math.round(revenue / total);
    const confirmed = venueBookings.filter(
      (i) => i.workflowState === "CONFIRMED",
    ).length;
    const avgStr =
      avg >= 100000
        ? `₹${(avg / 100000).toFixed(1)}L`
        : `₹${(avg / 1000).toFixed(0)}K`;
    return { total, confirmed, avgStr };
  }, [venueBookings]);

  const recent = useMemo(
    () => (venue ? venueBookings : reserve).slice(0, 4),
    [venue, venueBookings],
  );

  return (
    <div className="space-y-4">
      {/* ── Venue overview ──────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-violet-500 to-blue-500" />
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2
              size={13}
              className="text-violet-500 dark:text-violet-400 shrink-0"
            />
            <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-400">
              {t("addLeadModal.panelVenueTitle")}
            </p>
          </div>

          {venue ? (
            <>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-50 mb-3 truncate">
                {venue}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: t("addLeadModal.statBookings"),
                    value: stats?.total ?? 0,
                  },
                  {
                    label: t("addLeadModal.statConfirmed"),
                    value: stats?.confirmed ?? 0,
                  },
                  {
                    label: t("addLeadModal.statAvg"),
                    value: stats?.avgStr ?? "—",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-2.5 text-center"
                  >
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {value}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-2">
                <Building2 size={16} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t("addLeadModal.panelSelectVenue")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent bookings ──────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock
            size={12}
            className="text-gray-400 dark:text-gray-500 shrink-0"
          />
          <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-400">
            {t("addLeadModal.panelRecentTitle")}
          </p>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
          {recent.map((item) => {
            const cfg = STATE_CFG[item.workflowState] ?? STATE_CFG.NEW;
            const initials = item.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            return (
              <div key={item.id} className="flex items-center gap-2.5 py-2.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${item.avatarColor}`}
                >
                  {initials}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 truncate leading-snug">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-tight">
                    {item.eventDate} · {item.eventType}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.color}`}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick tips ───────────────────────────────────── */}
      <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <Zap
            size={12}
            className="text-violet-500 dark:text-violet-400 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 mb-1.5">
              {t("addLeadModal.panelTipsTitle")}
            </p>
            <ul className="space-y-1">
              {["panelTip1", "panelTip2", "panelTip3"].map((k) => (
                <li
                  key={k}
                  className="text-[11px] text-violet-600/80 dark:text-violet-400/80 flex items-start gap-1"
                >
                  <span className="mt-1 shrink-0">·</span>
                  <span>{t(`addLeadModal.${k}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN WORKSPACE
══════════════════════════════════════════════════════════════ */
export default function CreateLeadWorkspace() {
  const t = useTranslations("vendor.reservations");

  const [form, setForm] = useState(EMPTY);
  const [duplicate, setDuplicate] = useState(null); // matched MOCK item
  const [panelOpen, setPanelOpen] = useState(false); // mobile summary toggle

  const [event, setEvent] = useState([]);
  const [venues, setVenues] = useState([]);

  const [reserve, setReserve] = useState([]);

  console.log("-----------------");
  console.log(reserve);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ── Duplicate detection ─────────────────────────────── */
  const checkDuplicate = (field, value) => {
    if (!value || value.replace(/\D/g, "").length < 7) {
      setDuplicate(null);
      return;
    }
    const found = reserve.find((i) =>
      field === "phone"
        ? i.phone.replace(/\D/g, "") === value.replace(/\D/g, "")
        : i.email.toLowerCase() === value.toLowerCase(),
    );
    setDuplicate(found ?? null);
  };

  /* ── Smart phone formatting ──────────────────────────── */
  const handlePhone = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    const formatted =
      digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
    set("phone", formatted);
  };

  /* ── Submit ──────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    await leads_create(form);

    console.log(form);
    toast.success(t("addLeadModal.success"));
    setForm(EMPTY);
    setDuplicate(null);
  };

  const handleDraft = () => {
    toast.success("Draft saved");
    // Draft logic placeholder
  };

  const handleReset = () => {
    setForm(EMPTY);
    setDuplicate(null);
  };

  const load = async () => {
    const resp = await load_shift_event();

    const events = resp?.data ?? 0;
    setEvent(events);

    const all_venues = await Load_all_venues();
    setVenues(all_venues.data);

    const resps = await all_reservations();

    const current_booking = Array.isArray(resps?.data)
      ? resps.data
      : Array.isArray(resps?.data?.data)
        ? resps.data.data
        : [];

    setReserve(current_booking);

    // const _settings = await globalSetting();
    // setSettings(_settings.data);
  };

  useEffect(() => {
    (async () => {
      await load();
      setPageLoading(false);
    })();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <form onSubmit={handleSubmit}>
        {/* ── Page header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 shadow-sm shadow-violet-500/30">
              <UserPlus size={17} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 leading-snug">
                {t("addLeadModal.title")}
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {t("addLeadModal.subtitle")}
              </p>
            </div>
          </div>

          {/* Source + Priority live badges */}
          <div className="flex items-center gap-2 sm:self-start">
            {form.priority && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${PRIORITY_CFG[form.priority]?.active}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${PRIORITY_CFG[form.priority]?.dot}`}
                />
                {t(
                  `addLeadModal.priority${form.priority.charAt(0).toUpperCase() + form.priority.slice(1)}`,
                )}
              </span>
            )}
            {form.source && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-gray-100 dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400">
                {form.source}
              </span>
            )}
          </div>
        </div>

        {/* ── Duplicate warning banner ─────────────────────── */}
        <AnimatePresence>
          {duplicate && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                <AlertTriangle
                  size={14}
                  className="text-amber-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-amber-700 dark:text-amber-300">
                    {t("addLeadModal.duplicateWarning")}
                  </p>
                  <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 truncate">
                    {duplicate.name} · {duplicate.phone} · {duplicate.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDuplicate(null)}
                  className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main 2-column layout ─────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-5 pb-24 lg:pb-0">
          {/* ════════════════════════════════════════════════
              LEFT: Form sections
          ════════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* ── Section 1: Event Details ─────────────── */}
            <SectionCard title={t("addLeadModal.sectionEvent")} icon={Calendar}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Venue */}
                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1">
                      <MapPin size={10} aria-hidden="true" />
                      {t("addLeadModal.venue")}
                    </span>
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => set("venue", e.target.value)}
                    required
                    className={inputCls}
                  >
                    <option value="">{t("addLeadModal.venue")}</option>
                    {venues.map((item) => (
                      <option
                        key={item.child_venue_id}
                        value={item.child_venue_id}
                      >
                        {item.child_venue_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Date */}
                <div>
                  <label className={labelCls}>
                    {t("addLeadModal.eventDate")}
                  </label>
                  <DateInput
                    value={form.eventDate}
                    onChange={(v) => set("eventDate", v)}
                    label={t("addLeadModal.eventDate")}
                    required
                  />
                </div>

                {/* Shift */}
                <div>
                  <label className={labelCls}>{t("addLeadModal.shift")}</label>
                  <select
                    value={form.shift}
                    onChange={(e) => set("shift", e.target.value)}
                    required
                    className={inputCls}
                  >
                    <option value="">{t("addLeadModal.shift")}</option>
                    <option value="Morning">
                      {t("addLeadModal.shiftMorning")}
                    </option>
                    <option value="Afternoon">
                      {t("addLeadModal.shiftAfternoon")}
                    </option>
                    <option value="Evening">
                      {t("addLeadModal.shiftEvening")}
                    </option>
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* ── Section 2: Contact Information ───────── */}
            <SectionCard title={t("addLeadModal.sectionContact")} icon={Users}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Name */}
                <div>
                  <label className={labelCls}>{t("addLeadModal.name")}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder={t("addLeadModal.name")}
                    required
                    className={inputCls}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1">
                      <Phone size={10} aria-hidden="true" />
                      {t("addLeadModal.phone")}
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handlePhone(e.target.value)}
                    onBlur={(e) => checkDuplicate("phone", e.target.value)}
                    placeholder="98765 43210"
                    className={inputCls}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1">
                      <Mail size={10} aria-hidden="true" />
                      {t("addLeadModal.email")}
                    </span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={(e) => checkDuplicate("email", e.target.value)}
                    placeholder={t("addLeadModal.email")}
                    className={inputCls}
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── Section 3: Lead Information ───────────── */}
            <SectionCard
              title={t("addLeadModal.sectionLeadInfo")}
              icon={TrendingUp}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Lead Source */}
                <div>
                  <label className={labelCls}>
                    {t("addLeadModal.leadSource")}
                  </label>
                  <select
                    value={form.source}
                    onChange={(e) => set("source", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">{t("addLeadModal.sourceAll")}</option>
                    {[
                      ["sourceWalkIn", "Walk-in"],
                      ["sourcePhone", "Phone Call"],
                      ["sourceWhatsApp", "WhatsApp"],
                      ["sourceInstagram", "Instagram"],
                      ["sourceFacebook", "Facebook"],
                      ["sourceGoogle", "Google"],
                      ["sourceEmail", "Email"],
                      ["sourceReferral", "Referral"],
                      ["sourceOther", "Other"],
                    ].map(([key, val]) => (
                      <option key={val} value={val}>
                        {t(`addLeadModal.${key}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Referred By */}
                <div>
                  <label className={labelCls}>
                    {t("addLeadModal.referredBy")}
                  </label>
                  <input
                    type="text"
                    value={form.referredBy}
                    onChange={(e) => set("referredBy", e.target.value)}
                    placeholder={t("addLeadModal.referredBy")}
                    className={inputCls}
                  />
                </div>

                {/* Guest Count */}
                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1">
                      <Users size={10} aria-hidden="true" />
                      {t("addLeadModal.guestCount")}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.guestCount}
                    onChange={(e) => set("guestCount", e.target.value)}
                    placeholder={t("addLeadModal.guestCountPlaceholder")}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Customer Type — inline row */}
              <div className="mt-4">
                <label className={labelCls}>
                  {t("addLeadModal.customerType")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "new", tKey: "customerNew" },
                    { key: "returning", tKey: "customerReturning" },
                    { key: "corporate", tKey: "customerCorporate" },
                  ].map(({ key, tKey }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set("customerType", key)}
                      className={[
                        "px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                        form.customerType === key
                          ? "bg-violet-50 dark:bg-violet-950/30 border-violet-300 dark:border-violet-700/50 text-violet-700 dark:text-violet-300"
                          : "bg-white dark:bg-gray-900/60 border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:border-gray-300",
                      ].join(" ")}
                    >
                      {t(`addLeadModal.${tKey}`)}
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* ── Section 4: Booking Details ────────────── */}
            <SectionCard
              title={t("addLeadModal.sectionBooking")}
              icon={Banknote}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {/* Budget */}
                <div>
                  <label className={labelCls}>{t("addLeadModal.budget")}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 dark:text-gray-500 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={form.budget}
                      onChange={(e) =>
                        set("budget", e.target.value.replace(/[^0-9,]/g, ""))
                      }
                      placeholder={t("addLeadModal.budgetPlaceholder")}
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <label className={labelCls}>
                    {t("addLeadModal.eventType")}
                  </label>
                  <select
                    value={form.eventType}
                    onChange={(e) => set("eventType", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">{t("addLeadModal.eventTypeAll")}</option>
                    {event.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.event_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority — compact in grid */}
                <div>
                  <label className={labelCls}>
                    {t("addLeadModal.priority")}
                  </label>
                  <PrioritySelector
                    value={form.priority}
                    onChange={(v) => set("priority", v)}
                    t={t}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={labelCls}>
                  <span className="flex items-center gap-1">
                    <Tag size={10} aria-hidden="true" />
                    {t("addLeadModal.tags")}
                  </span>
                </label>
                <TagsSelector
                  value={form.tags}
                  onChange={(v) => set("tags", v)}
                  t={t}
                />
              </div>
            </SectionCard>

            {/* ── Section 5: Address ────────────────────── */}
            <SectionCard title={t("addLeadModal.sectionAddress")} icon={MapPin}>
              <textarea
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder={t("addLeadModal.address")}
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </SectionCard>

            {/* ── Section 6: Notes ──────────────────────── */}
            <SectionCard
              title={t("addLeadModal.sectionNotes")}
              icon={AlignLeft}
            >
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder={t("addLeadModal.notesPlaceholder")}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </SectionCard>

            {/* ── Desktop action bar ────────────────────── */}
            <div className="hidden lg:flex items-center justify-between gap-3 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] rounded-2xl px-5 py-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                {t("addLeadModal.cancel")}
              </button>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDraft}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Save size={13} aria-hidden="true" />
                  {t("addLeadModal.saveDraft")}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                  }}
                >
                  <UserPlus size={13} aria-hidden="true" />
                  {t("addLeadModal.save")}
                </button>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              RIGHT: Summary panel
              Desktop → sticky sidebar
              Mobile  → collapsible card below form
          ════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0">
            {/* Mobile toggle header */}
            <button
              type="button"
              className="lg:hidden w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              onClick={() => setPanelOpen((v) => !v)}
            >
              <span className="flex items-center gap-2">
                <Building2
                  size={13}
                  className="text-violet-500 dark:text-violet-400"
                />
                {t("addLeadModal.panelVenueTitle")}
              </span>
              {panelOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Mobile: collapsible */}
            <AnimatePresence>
              {panelOpen && (
                <motion.div
                  className="lg:hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SummaryPanel venue={form.venue} t={t} reserve={reserve} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop: always visible + sticky */}
            <div className="hidden lg:block lg:sticky lg:top-[140px]">
              <SummaryPanel venue={form.venue} t={t} reserve={reserve} />
            </div>
          </div>
        </div>

        {/* ── Mobile sticky action bar ─────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-gray-200 dark:border-white/[0.08] px-4 py-3 flex gap-2.5">
          <button
            type="button"
            onClick={handleDraft}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <Save size={14} aria-hidden="true" />
            {t("addLeadModal.saveDraft")}
          </button>
          <button
            type="submit"
            className="flex-[2] flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}
          >
            <UserPlus size={14} aria-hidden="true" />
            {t("addLeadModal.save")}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
