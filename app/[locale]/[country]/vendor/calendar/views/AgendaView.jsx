"use client";
/**
 * AgendaView.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Chronological list of upcoming bookings — the most detail-rich view.
 * Grouped by date, with rich booking cards.
 */
import { motion } from "framer-motion";
import { Clock, Users, MapPin, Tag, IndianRupee, Calendar } from "lucide-react";
import dayjs from "dayjs";
import { useCalendar, getStatusStyle } from "../CalendarContext";

function AgendaBookingCard({ booking, adapter, onClick }) {
  const style = getStatusStyle(booking.status);
  const { gradient, accentRgb, guestLabel = "Guests", bookingLabel = "Booking" } = adapter;

  const isMultiDay = !!booking.endDate;
  const duration = isMultiDay
    ? `${booking.nights ?? dayjs(booking.endDate).diff(dayjs(booking.date), "day")} nights`
    : booking.startTime
      ? `${booking.startTime} – ${booking.endTime}`
      : "All day";

  return (
    <motion.button
      whileHover={{
        y: -2,
        boxShadow: `0 8px 32px rgba(${accentRgb},0.16)`,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(booking)}
      className="w-full text-left rounded-2xl overflow-hidden
                 bg-white dark:bg-[#0f172a]
                 border border-gray-100 dark:border-white/[0.06]
                 shadow-sm transition-all duration-200 group"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: style.border }} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Left: status icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: style.bg }}
          >
            <span className="text-lg">
              {booking.type === "Wedding" ? "💍"
                : booking.type === "Corporate" ? "💼"
                : booking.type === "Birthday" ? "🎂"
                : booking.status === "cleaning" ? "🧹"
                : booking.status === "session" ? "🎬"
                : booking.status === "recording" ? "🎙️"
                : booking.status === "recurring" ? "🔄"
                : booking.status === "meeting" ? "🤝"
                : booking.status === "maintenance" ? "🔧"
                : "📅"}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {booking.title}
                </p>
                {booking.customer?.name && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {booking.customer.name}
                  </p>
                )}
              </div>

              {/* Status chip */}
              <span
                className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: style.bg, color: style.text }}
              >
                {style.label}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                <Clock size={11} />
                <span>{duration}</span>
              </div>
              {booking.guests > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <Users size={11} />
                  <span>{booking.guests} {guestLabel.toLowerCase()}</span>
                </div>
              )}
              {booking.type && (
                <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <Tag size={11} />
                  <span>{booking.type}</span>
                </div>
              )}
              {booking.amount > 0 && (
                <div
                  className="flex items-center gap-0.5 text-[11px] font-bold ml-auto"
                  style={{ color: style.text }}
                >
                  <IndianRupee size={10} />
                  <span>{booking.amount.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            {/* Notes preview */}
            {booking.notes && (
              <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1 italic">
                "{booking.notes}"
              </p>
            )}

            {/* Team */}
            {booking.team?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {booking.team.slice(0, 3).map((member) => (
                  <span
                    key={member}
                    className="text-[10px] px-2 py-0.5 rounded-full
                               bg-gray-100 dark:bg-white/[0.06]
                               text-gray-600 dark:text-gray-400"
                  >
                    {member}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default function AgendaView({ adapter }) {
  const { currentDate, openBooking, filters, searchQuery } = useCalendar();
  const { bookings = [], gradient, accent, accentRgb } = adapter;
  const today = dayjs();

  /* Build 60-day look-ahead */
  const lookahead = Array.from({ length: 60 }, (_, i) =>
    currentDate.startOf("month").add(i, "day"),
  );

  /* Filter */
  const filteredBookings = bookings.filter((b) => {
    if (filters.status !== "all" && b.status !== filters.status) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  /* Group by date */
  const groups = {};
  filteredBookings.forEach((b) => {
    const key = b.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });

  const sortedDates = Object.keys(groups).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center
                      rounded-2xl bg-white dark:bg-[#0f172a]
                      border border-gray-100 dark:border-white/[0.06]">
        <div className="text-5xl mb-4">📅</div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">No upcoming bookings</p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
          {filters.status !== "all" ? `No "${filters.status}" bookings found.` : "Create your first booking to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => {
        const date       = dayjs(dateKey);
        const isToday    = date.isSame(today, "day");
        const isTomorrow = date.isSame(today.add(1, "day"), "day");
        const isPast     = date.isBefore(today, "day");
        const dayBookings = groups[dateKey];

        const dateLabel = isToday
          ? "Today"
          : isTomorrow
            ? "Tomorrow"
            : date.format("dddd, D MMMM YYYY");

        return (
          <motion.div
            key={dateKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl shrink-0 shadow-sm
                  ${isPast ? "opacity-50" : ""}`}
                style={
                  isToday
                    ? { background: gradient, boxShadow: `0 4px 16px rgba(${accentRgb},0.30)` }
                    : { background: `rgba(${accentRgb},0.08)` }
                }
              >
                <span
                  className="text-[10px] font-bold uppercase"
                  style={{ color: isToday ? "rgba(255,255,255,0.75)" : accent }}
                >
                  {date.format("MMM")}
                </span>
                <span
                  className="text-xl font-black leading-none"
                  style={{ color: isToday ? "#fff" : accent }}
                >
                  {date.date()}
                </span>
              </div>

              <div>
                <p className={`text-sm font-bold
                  ${isToday ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}
                >
                  {dateLabel}
                </p>
                <p className="text-[11px] text-gray-400">
                  {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                  {dayBookings.reduce((s, b) => s + (b.guests || 0), 0) > 0
                    ? ` · ${dayBookings.reduce((s, b) => s + (b.guests || 0), 0)} total ${adapter.guestLabel?.toLowerCase() ?? "guests"}`
                    : ""}
                </p>
              </div>

              {/* Divider line */}
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
            </div>

            {/* Booking cards */}
            <div className="space-y-3 pl-[60px]">
              {dayBookings.map((booking) => (
                <AgendaBookingCard
                  key={booking.id}
                  booking={booking}
                  adapter={adapter}
                  onClick={openBooking}
                />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
