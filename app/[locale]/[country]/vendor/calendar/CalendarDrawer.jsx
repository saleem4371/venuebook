"use client";
/**
 * CalendarDrawer.jsx — Redesigned
 * ──────────────────────────────────────────────────────────────────────────
 * Right-side contextual booking details drawer.
 *
 * Simplified: removed heavy booking-timeline section.
 * Keeps: header (status + title + datetime + amount),
 *         customer, event details, notes, team, equipment, footer actions.
 */
import { motion } from "framer-motion";
import {
  X, User, Phone, Mail, Users, Clock,
  FileText, Tag, Pencil, CheckCircle, XCircle,
  Send, ChevronRight,
} from "lucide-react";
import { useCalendar, getStatusStyle } from "./CalendarContext";

/* ── Status → primary action map ── */
const STATUS_ACTIONS = {
  confirmed:  { label: "Cancel Booking",   icon: XCircle,     danger: true },
  tentative:  { label: "Confirm Now",       icon: CheckCircle, danger: false },
  occupied:   { label: "Check Out",         icon: CheckCircle, danger: false },
  checkin:    { label: "Mark Checked In",   icon: CheckCircle, danger: false },
  session:    { label: "Complete Session",  icon: CheckCircle, danger: false },
  booked:     { label: "Cancel",            icon: XCircle,     danger: true  },
  rented:     { label: "Mark Returned",     icon: CheckCircle, danger: false },
  pickup:     { label: "Mark Picked Up",    icon: CheckCircle, danger: false },
  default:    { label: "Update Status",     icon: Pencil,      danger: false },
};

/* ── Compact info row ── */
function InfoRow({ icon: Icon, label, value, accentRgb }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2.5
                    border-b border-gray-50 dark:border-white/[0.04] last:border-0">
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
        style={{ background: `rgba(${accentRgb},0.10)` }}
      >
        <Icon size={11} style={{ color: `rgba(${accentRgb},1)` }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-0.5">
          {label}
        </p>
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function CalendarDrawer({ adapter }) {
  const { selectedBooking, closeDrawer } = useCalendar();
  const { gradient, accentRgb, accent, guestLabel = "Guests" } = adapter;

  if (!selectedBooking) return null;

  const booking   = selectedBooking;
  const style     = getStatusStyle(booking.status);
  const action    = STATUS_ACTIONS[booking.status] ?? STATUS_ACTIONS.default;
  const isMultiDay = !!booking.endDate;

  return (
    <div
      className="h-full flex flex-col rounded-2xl overflow-hidden
                 border border-gray-100 dark:border-white/[0.06]
                 bg-white dark:bg-[#0f172a] shadow-xl"
    >

      {/* ── Header ── */}
      <div
        className="shrink-0 px-4 pt-4 pb-3 relative"
        style={{ background: `linear-gradient(135deg, rgba(${accentRgb},0.07) 0%, transparent 80%)` }}
      >
        {/* Close */}
        <button
          onClick={closeDrawer}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center
                     bg-gray-100 dark:bg-white/[0.08]
                     hover:bg-gray-200 dark:hover:bg-white/[0.12]
                     text-gray-500 dark:text-gray-400 transition-colors"
        >
          <X size={13} />
        </button>

        {/* Status chip */}
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2.5"
          style={{ background: style.bg, color: style.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.border }} />
          {style.label}
        </span>

        {/* Title */}
        <h3 className="text-[15px] font-black text-gray-900 dark:text-white leading-snug pr-8">
          {booking.title}
        </h3>

        {/* Date / time subtitle */}
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
          {isMultiDay
            ? `${booking.date} → ${booking.endDate}${booking.nights ? ` · ${booking.nights} nights` : ""}`
            : booking.startTime
              ? `${booking.date} · ${booking.startTime} – ${booking.endTime}`
              : booking.date}
        </p>

        {/* Amount */}
        {booking.amount > 0 && (
          <div
            className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-bold"
            style={{
              background: gradient,
              boxShadow: `0 3px 12px rgba(${accentRgb},0.25)`,
            }}
          >
            ₹{booking.amount.toLocaleString("en-IN")}
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">

        {/* Customer */}
        {booking.customer && (
          <div className="pt-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Customer
            </p>
            <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03]
                            border border-gray-100 dark:border-white/[0.04] px-3">
              <InfoRow icon={User}  label="Name"  value={booking.customer.name}  accentRgb={accentRgb} />
              <InfoRow icon={Phone} label="Phone" value={booking.customer.phone} accentRgb={accentRgb} />
              <InfoRow icon={Mail}  label="Email" value={booking.customer.email} accentRgb={accentRgb} />
            </div>
          </div>
        )}

        {/* Event details */}
        {(booking.type || booking.guests > 0 || booking.startTime) && (
          <div className="pt-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Details
            </p>
            <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03]
                            border border-gray-100 dark:border-white/[0.04] px-3">
              {booking.type && (
                <InfoRow icon={Tag}   label="Type"     value={booking.type}          accentRgb={accentRgb} />
              )}
              {booking.guests > 0 && (
                <InfoRow icon={Users} label={guestLabel} value={`${booking.guests} people`} accentRgb={accentRgb} />
              )}
              {booking.startTime && (
                <InfoRow icon={Clock} label="Schedule" value={`${booking.startTime} – ${booking.endTime}`} accentRgb={accentRgb} />
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="pt-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Notes
            </p>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/[0.06]
                            border border-amber-100 dark:border-amber-500/[0.12]
                            p-3 flex items-start gap-2">
              <FileText size={12} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {booking.notes}
              </p>
            </div>
          </div>
        )}

        {/* Team */}
        {booking.team?.length > 0 && (
          <div className="pt-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Assigned Team
            </p>
            <div className="flex flex-wrap gap-1.5">
              {booking.team.map((member) => (
                <span
                  key={member}
                  className="inline-flex items-center gap-1.5 text-xs font-medium
                             px-2.5 py-1 rounded-lg
                             bg-gray-100 dark:bg-white/[0.06]
                             text-gray-700 dark:text-gray-300"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: accent }}
                  />
                  {member}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {booking.equipment?.length > 0 && (
          <div className="pt-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Equipment
            </p>
            <div className="space-y-1">
              {booking.equipment.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg
                             bg-gray-50 dark:bg-white/[0.03]
                             border border-gray-100 dark:border-white/[0.04]
                             text-gray-700 dark:text-gray-300"
                >
                  <ChevronRight size={10} className="text-gray-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer actions ── */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] space-y-2">

        {/* Primary action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                       text-sm font-bold transition-all duration-200
                       ${action.danger
                         ? "bg-red-50 dark:bg-red-500/[0.10] text-red-500 hover:bg-red-100 dark:hover:bg-red-500/[0.18]"
                         : "text-white shadow-md"
                       }`}
          style={action.danger ? {} : {
            background: gradient,
            boxShadow: `0 4px 14px rgba(${accentRgb},0.28)`,
          }}
        >
          <action.icon size={14} />
          {action.label}
        </motion.button>

        {/* Secondary */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl
                       text-xs font-semibold
                       text-gray-600 dark:text-gray-400
                       bg-gray-100 dark:bg-white/[0.06]
                       hover:bg-gray-200 dark:hover:bg-white/[0.10]
                       transition-colors duration-150"
          >
            <Pencil size={11} />
            Edit
          </button>
          <button
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl
                       text-xs font-semibold
                       text-gray-600 dark:text-gray-400
                       bg-gray-100 dark:bg-white/[0.06]
                       hover:bg-gray-200 dark:hover:bg-white/[0.10]
                       transition-colors duration-150"
          >
            <Send size={11} />
            Message
          </button>
        </div>
      </div>
    </div>
  );
}
