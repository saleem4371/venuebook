"use client";

/* ══════════════════════════════════════════════════════════════════
   RESERVATIONS — SHARED COMPONENT LIBRARY
   All reusable UI atoms used across workspace tabs.
   Import from here; do not duplicate in individual workspaces.
══════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Phone, MapPin, Eye, Edit, Trash2,
  Users, CheckCircle2, Bookmark, Save, FileText,
  History, MoreHorizontal, CalendarCheck,
  Inbox, Sparkles, Clock, XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { STATE_CFG } from "./_data";

/* ═══════════════════════════════════════════════════════════════
   CONTEXTUAL ACTIONS — per workflow state
═══════════════════════════════════════════════════════════════ */
export function getActions(state, tA) {
  switch (state) {
    case "NEW":
    case "IN_PROGRESS": return [
      { key: "convert",   label: tA("convert"),   icon: CalendarCheck, danger: false },
      { key: "quotation", label: tA("quotation"), icon: FileText,      danger: false },
      { key: "delete",    label: tA("delete"),    icon: Trash2,        danger: true  },
    ];
    case "PENDING": return [
      { key: "confirm",   label: tA("confirm"),   icon: CheckCircle2,  danger: false },
      { key: "reserve",   label: tA("reserve"),   icon: Bookmark,      danger: false },
      { key: "quotation", label: tA("quotation"), icon: FileText,      danger: false },
      { key: "saveDraft", label: tA("saveDraft"), icon: Save,          danger: false },
      { key: "delete",    label: tA("delete"),    icon: Trash2,        danger: true  },
    ];
    case "CONFIRMED": return [
      { key: "edit",     label: tA("edit"),     icon: Edit,      danger: false },
      { key: "reserve",  label: tA("reserve"),  icon: Bookmark,  danger: false },
      { key: "download", label: tA("download"), icon: FileText,  danger: false },
      { key: "delete",   label: tA("delete"),   icon: Trash2,    danger: true  },
    ];
    case "RESERVED": return [
      { key: "confirm",  label: tA("confirm"),  icon: CheckCircle2, danger: false },
      { key: "edit",     label: tA("edit"),     icon: Edit,         danger: false },
      { key: "download", label: tA("download"), icon: FileText,     danger: false },
      { key: "delete",   label: tA("delete"),   icon: Trash2,       danger: true  },
    ];
    case "QUOTATION": return [
      { key: "convert",  label: tA("convert"),  icon: CalendarCheck, danger: false },
      { key: "edit",     label: tA("edit"),     icon: Edit,          danger: false },
      { key: "download", label: tA("download"), icon: FileText,      danger: false },
      { key: "delete",   label: tA("delete"),   icon: Trash2,        danger: true  },
    ];
    case "DRAFT": return [
      { key: "convert",  label: tA("convert"),  icon: CalendarCheck, danger: false },
      { key: "edit",     label: tA("edit"),     icon: Edit,          danger: false },
      { key: "delete",   label: tA("delete"),   icon: Trash2,        danger: true  },
    ];
    case "HISTORICAL": return [
      { key: "rebook",   label: tA("rebook"),   icon: History,  danger: false },
      { key: "download", label: tA("download"), icon: FileText, danger: false },
      { key: "delete",   label: tA("delete"),   icon: Trash2,   danger: true  },
    ];
    case "CANCELLED": return [
      { key: "rebook", label: tA("rebook"), icon: History, danger: false },
      { key: "delete", label: tA("delete"), icon: Trash2,  danger: true  },
    ];
    default: return [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   DEFAULT ACTION HANDLER  (shared toast feedback)
═══════════════════════════════════════════════════════════════ */
export function defaultActionHandler(item, key) {
  const msg = {
    convert:   `Converting ${item.name} to Booking`,
    quotation: `Opening Quotation for ${item.name}`,
    reserve:   `Reserving ${item.name}`,
    saveDraft: `Draft saved for ${item.name}`,
    confirm:   `Confirmed ${item.name}`,
    edit:      `Editing ${item.name}`,
    download:  `Downloading PDF for ${item.name}`,
    rebook:    `Rebooking ${item.name}`,
    delete:    `Deleted ${item.name}`,
  };
  key === "delete" ? toast.error(msg[key] ?? key) : toast.success(msg[key] ?? key);
}

/* ═══════════════════════════════════════════════════════════════
   STATUS BADGE
═══════════════════════════════════════════════════════════════ */
export function StatusBadge({ workflowState }) {
  const cfg = STATE_CFG[workflowState] ?? STATE_CFG.NEW;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACTION DROPDOWN MENU
═══════════════════════════════════════════════════════════════ */
export function ActionMenu({ item, tA, onAction }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const actions = getActions(item.workflowState, tA);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={tA("more")}
      >
        <MoreHorizontal size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute end-0 z-30 mt-1.5 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden"
          >
            {actions.map(({ key, label, icon: Icon, danger }) => (
              <button
                key={key}
                onClick={() => { onAction(item, key); setOpen(false); }}
                className={[
                  "w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-start transition-colors",
                  danger
                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                <Icon size={13} className="shrink-0" aria-hidden="true" />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT CARD  — soft tinted surfaces (matches Team / Add-ons style)
═══════════════════════════════════════════════════════════════ */
const STAT_COLOR_MAP = {
  purple:  "from-violet-500/10 to-purple-500/5  border-violet-200/60  dark:border-violet-800/30  text-violet-600  dark:text-violet-400",
  blue:    "from-blue-500/10   to-cyan-500/5    border-blue-200/60    dark:border-blue-800/30    text-blue-600    dark:text-blue-400",
  amber:   "from-amber-500/10  to-orange-500/5  border-amber-200/60   dark:border-amber-800/30   text-amber-600   dark:text-amber-400",
  emerald: "from-emerald-500/10 to-teal-500/5   border-emerald-200/60 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400",
  rose:    "from-rose-500/10   to-pink-500/5    border-rose-200/60    dark:border-rose-800/30    text-rose-600    dark:text-rose-400",
  slate:   "from-slate-500/10  to-gray-500/5    border-slate-200/60   dark:border-slate-800/30   text-slate-600   dark:text-slate-400",
};

export function StatCard({ label, value, sub, icon: Icon, color = "purple" }) {
  const cls = STAT_COLOR_MAP[color] ?? STAT_COLOR_MAP.slate;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cls} border p-3.5 bg-white dark:bg-gray-900/60 transition-all hover:shadow-md hover:-translate-y-px`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 truncate">{label}</p>
          {/* Value: clamp font size so long strings like ₹1.69 Cr never overflow */}
          <p
            className="font-bold text-gray-900 dark:text-gray-50 leading-tight truncate"
            style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.375rem)" }}
          >
            {value}
          </p>
          {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate">{sub}</p>}
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-white/5">
          <Icon size={15} aria-hidden="true" />
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAYMENT STATUS BADGE
═══════════════════════════════════════════════════════════════ */
const PAY_COLOR = {
  Paid:     "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Partial:  "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Pending:  "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  Refunded: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

function PayBadge({ status }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${PAY_COLOR[status] ?? PAY_COLOR.Pending}`}>
      {status}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESERVATION CARD  (Grid view — premium, consistent height)
═══════════════════════════════════════════════════════════════ */
export function ReservationCard({ item, t, tA, onView, onAction }) {
  // const initials = item.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
const initials = (item.name ?? "")
  .split(" ")
  .filter(Boolean)
  .map((w) => w[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white dark:bg-gray-900/70 border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:border-gray-200/80 dark:hover:border-white/10 transition-all duration-200"
    >
      {/* Accent strip */}
      <div className={`h-0.5 w-full ${item.avatarColor}`} />
      {/* <div className={`h-0.5 w-full bg-violet-500`} /> */}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header: avatar + name + ref + actions */}
        <div className="flex items-start gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white select-none ${item.avatarColor}`}>
            {initials}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate leading-snug">{item.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">{item.refNo}</p>
          </div>
          <ActionMenu item={item} tA={tA} onAction={onAction} />
        </div>

        {/* Status + payment + type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge workflowState={item.workflowState} />
          {item.paymentStatus && <PayBadge status={item.paymentStatus} />}
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">{item.eventType}</span>
        </div>

        {/* Contact + venue */}
        <div className="space-y-1.5 text-[12px] text-gray-500 dark:text-gray-400">
          <p className="flex items-center gap-2 truncate">
            <Mail size={10} className="shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
            <span className="truncate">{item.email ?? "-"}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone size={10} className="shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
            <span>{item.phone ?? "-"}</span>
          </p>
          <p className="flex items-center gap-2 truncate">
            <MapPin size={10} className="shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
            <span className="truncate">{item.venue}</span>
          </p>
        </div>

        {/* Metadata grid — pinned to bottom */}
        <div className="mt-auto pt-3 border-t border-gray-50 dark:border-white/[0.04] grid grid-cols-2 gap-y-2 gap-x-3">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mb-0.5">Event Date</p>
            <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate">{item.eventDate}</p>
          </div>
          <div className="text-end">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mb-0.5">Amount</p>
            <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100">₹{item.amount ?? 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mb-0.5">Guests</p>
            <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1">
              <Users size={10} className="text-gray-400" aria-hidden="true" />
              {Number(item.guests ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="text-end">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mb-0.5">Shift</p>
            <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200">{item.shift}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onView(item)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          <Eye size={12} aria-hidden="true" />
          {t("view")}
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESERVATION ROW  (List view)
═══════════════════════════════════════════════════════════════ */
export function ReservationRow({ item, t, tA, onView, onAction }) {
  // const initials = item.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
const initials = (item.name ?? "")
  .split(" ")
  .filter(Boolean)
  .map((w) => w[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-gray-800/70 last:border-b-0 hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
    >
      <div className="flex items-center gap-3 sm:w-52 shrink-0 min-w-0">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${item.avatarColor}`}>{initials}</span>
        
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{item.refNo}</p>
        </div>
      </div>

      <p className="flex-1 text-[12px] text-gray-500 dark:text-gray-400 truncate hidden sm:block">{item.venue}</p>
      <p className="text-[12px] text-gray-500 dark:text-gray-400 shrink-0 hidden md:block">{item.eventDate}</p>
      <div className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400 shrink-0 hidden lg:flex">
        <Users size={11} aria-hidden="true" />{Number(item.guests ?? 0).toLocaleString()}
      </div>
      <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 shrink-0 hidden md:block">₹{item.amount ?? 0}</p>

      <div className="shrink-0"><StatusBadge workflowState={item.workflowState} /></div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onView(item)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
          aria-label={t("view")}
        >
          <Eye size={14} />
        </button>
        <ActionMenu item={item} tA={tA} onAction={onAction} />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPACT TABLE  — enterprise list / table view
   Columns: Guest · Venue · Date · Type · Guests · Amount · Status · Actions
═══════════════════════════════════════════════════════════════ */
export function CompactTable({ items, t, tA, onView, onAction }) {
  const COL_CLS = "px-4 py-3 text-start text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap";

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">

          {/* ── Header ─────────────────────────────────── */}
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/60 dark:bg-white/[0.02]">
              <th className={COL_CLS}>{t("tableCol.guest")}</th>
              <th className={COL_CLS}>{t("refNo")}</th>
              <th className={COL_CLS}>{t("tableCol.venue")}</th>
              <th className={COL_CLS}>{t("tableCol.date")}</th>
              <th className={COL_CLS}>{t("tableCol.type")}</th>
              <th className={`${COL_CLS} text-center`}>{t("tableCol.guests")}</th>
              <th className={COL_CLS}>{t("tableCol.amount")}</th>
              <th className={COL_CLS}>{t("tableCol.status")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>

          {/* ── Rows ───────────────────────────────────── */}
          <tbody>
            {items.map((item, idx) => {
              // const initials = item.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
              const initials = (item.name ?? "")
  .split(" ")
  .filter(Boolean)
  .map((w) => w[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);
              const isLast   = idx === items.length - 1;
              return (
                <tr
                  key={item.id}
                  className={[
                    "transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.025]",
                    !isLast ? "border-b border-gray-50 dark:border-white/[0.04]" : "",
                  ].join(" ")}
                >
                  {/* Guest */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {/* <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white bg-violet-500`}> */}
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${item.avatarColor}`}>
                        {initials}
                      </span>
                      <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{item.name}</p>
                    </div>
                  </td>

                  {/* Ref No */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500">{item.refNo}</p>
                  </td>

                  {/* Venue */}
                  <td className="px-4 py-3 max-w-[160px]">
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">{item.venue}</p>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">{item.eventDate}</p>
                  </td>

                  {/* Type + Shift */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <p className="text-[12px] text-gray-600 dark:text-gray-300 font-medium">{item.eventType}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-600 capitalize">{item.shift}</p>
                    </div>
                  </td>

                  {/* Guests */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                      <Users size={11} aria-hidden="true" />
                      {Number(item.guests ?? 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">₹{item.amount ?? 0}</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge workflowState={item.workflowState} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={() => onView(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                        aria-label={t("view")}
                      >
                        <Eye size={13} />
                      </button>
                      <ActionMenu item={item} tA={tA} onAction={onAction} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPACT LIST  — dense CRM operational view
   All 12 operational fields with responsive breakpoint hiding.
   Breakpoints: avatar+name+status always · contact sm+ · venue md+
                dates lg+ · pax lg+ · amount md+ · payment xl+
                staff xl+ · actions hover-fade
═══════════════════════════════════════════════════════════════ */
function CompactRow({ item, t, tA, onView, onAction }) {
  // const initials = item.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const initials = (item.name ?? "")
  .split(" ")
  .filter(Boolean)
  .map((w) => w[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/60 dark:hover:bg-white/[0.025] transition-colors min-w-0">

      {/* ① Avatar */}
      {/* <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white bg-violet-500`}> */}
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${item.avatarColor}`}>
        {initials}
      </span>

      {/* ② Guest — name + ref */}
      <div className="flex-[1.3] min-w-0">
        <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate leading-snug">{item.name}</p>
        <p className="text-[10px] font-mono text-gray-400 dark:text-gray-600 leading-tight">{item.refNo}</p>
      </div>

      {/* ③ Contact — email + phone (hidden below sm) */}
      <div className="hidden sm:flex flex-[1.1] min-w-0 flex-col gap-0.5">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate leading-snug flex items-center gap-1">
          <Mail size={9} className="shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
          <span className="truncate">{item.email ?? "-"}</span>
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight flex items-center gap-1">
          <Phone size={9} className="shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
          {item.phone ?? "-"}
        </p>
      </div>

      {/* ④ Venue + event type (hidden below md) */}
      <div className="hidden md:flex flex-[1.2] min-w-0 flex-col gap-0.5">
        <p className="text-[12px] text-gray-600 dark:text-gray-300 font-medium truncate leading-snug">{item.venue}</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{item.eventType} · {item.shift}</p>
      </div>

      {/* ⑤ Dates — reservation + event (hidden below lg) */}
      <div className="hidden lg:flex flex-col shrink-0 w-[96px] gap-0.5">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-snug">Bkd {item.orderDate}</p>
        <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 leading-tight">{item.eventDate}</p>
      </div>

      {/* ⑥ Pax (hidden below lg) */}
      <div className="hidden lg:flex items-center gap-1 shrink-0 w-[46px]">
        <Users size={10} className="text-gray-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
        <span className="text-[12px] font-semibold text-gray-600 dark:text-gray-300">{Number(item.guests ?? 0).toLocaleString()}</span>
      </div>

      {/* ⑦ Amount (hidden below md) */}
      <p className="hidden md:block text-[13px] font-semibold text-gray-700 dark:text-gray-200 shrink-0 w-[80px] text-end tabular-nums">
        ₹{item.amount ?? 0}
      </p>

      {/* ⑧ Payment status (hidden below xl) */}
      {item.paymentStatus && (
        <span className={`hidden xl:inline-flex shrink-0 items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${PAY_COLOR[item.paymentStatus] ?? PAY_COLOR.Pending}`}>
          {item.paymentStatus}
        </span>
      )}

      {/* ⑨ Reservation status — always visible */}
      <div className="shrink-0">
        <StatusBadge workflowState={item.workflowState} />
      </div>

      {/* ⑩ Assigned staff (hidden below xl) */}
      {item.assignedStaff ? (
        <p className="hidden xl:block text-[11px] text-gray-400 dark:text-gray-500 shrink-0 w-[68px] truncate">{item.assignedStaff}</p>
      ) : (
        <span className="hidden xl:block shrink-0 w-[68px]" />
      )}

      {/* ⑪ Quick actions — fade in on hover */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onView(item)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
          aria-label={t("view")}
        >
          <Eye size={13} />
        </button>
        <ActionMenu item={item} tA={tA} onAction={onAction} />
      </div>
    </div>
  );
}

export function CompactList({ items, t, tA, onView, onAction }) {
  return (
    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-white/[0.04]">
      {items.map((item) => (
        <CompactRow
          key={item.id}
          item={item}
          t={t}
          tA={tA}
          onView={onView}
          onAction={onAction}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EMPTY_ICONS = {
  all: Inbox, leads: Sparkles, pending: Clock,
  confirmed: CheckCircle2, reserved: Bookmark,
  quotation: FileText, draft: Save,
  historical: History, cancelled: XCircle,
};

export function EmptyState({ t, tabKey }) {
  const Icon = EMPTY_ICONS[tabKey] ?? Inbox;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-950/40 dark:to-blue-950/40 flex items-center justify-center mb-4">
        <Icon size={28} className="text-violet-500 dark:text-violet-400" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{t(`empty.${tabKey}.title`)}</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 max-w-xs">{t(`empty.${tabKey}.sub`)}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGINATION
═══════════════════════════════════════════════════════════════ */
export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPage(i + 1)}
          className={[
            "h-8 min-w-[32px] px-2.5 rounded-lg text-[13px] font-medium transition-all",
            page === i + 1
              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm"
              : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600",
          ].join(" ")}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DETAIL MODAL CONTENT
═══════════════════════════════════════════════════════════════ */
export function DetailModal({ item, t, onClose }) {
  if (!item) return null;
  
  //const initials = item.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
const initials = (item.name ?? "")
  .split(" ")
  .filter(Boolean)
  .map((w) => w[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);

  const fields = [
    { label: t("detail.ref"),       value: item.refNo },
    { label: t("detail.orderDate"), value: item.orderDate },
    { label: t("detail.date"),      value: item.eventDate },
    { label: t("detail.eventType"), value: item.eventType },
    { label: t("detail.shift"),     value: item.shift },
    { label: t("detail.venue"),     value: item.venue },
    { label: t("detail.guests"),    value: item.guests.toLocaleString() },
    { label: t("detail.amount"),    value: `₹${item.amount}` },
    { label: t("detail.source"),    value: item.source },
    { label: t("detail.caterer"),   value: item.caterer },
    { label: t("detail.decorator"), value: item.decorator },
  ];

  return (
    <>
      <div className="flex items-center gap-4 mb-5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${item.avatarColor}`}>{initials}</span>
        {/* <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white bg-violet-500`}>{initials}</span> */}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{item.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge workflowState={item.workflowState} />
            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{item.refNo}</span>
          </div>
        </div>
      </div>

      <div className="space-y-0 mb-4">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-800/80 last:border-b-0">
            <span className="text-[12px] font-medium text-gray-400 dark:text-gray-500">{label}</span>
            <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 text-end max-w-[55%] truncate">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
        <a href={`mailto:${item.email ?? "-"}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[12px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors truncate">
          <Mail size={12} aria-hidden="true" /><span className="truncate">{item.email ?? "-"}</span>
        </a>
        <a href={`tel:${item.phone ?? "-"}`} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[12px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shrink-0">
          <Phone size={12} aria-hidden="true" />{item.phone ?? "-"}
        </a>
      </div>

      <button
        onClick={onClose}
        className="mt-3 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        {t("close")}
      </button>
    </>
  );
}
