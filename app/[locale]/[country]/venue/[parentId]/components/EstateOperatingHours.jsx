"use client";

import { Clock } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CLOSES_SOON_WINDOW = 120; // minutes

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Live open/closed status for today, computed against the current time. */
function computeTodayStatus(today, nowMinutes) {
  if (!today?.open) return { label: "CLOSED", isOpen: false };

  const from = toMinutes(today.from);
  const to = toMinutes(today.to);

  if (nowMinutes < from) return { label: `OPENS AT ${formatTime(today.from)}`, isOpen: false };
  if (nowMinutes >= to) return { label: "CLOSED", isOpen: false };

  const minsLeft = to - nowMinutes;
  if (minsLeft <= CLOSES_SOON_WINDOW) {
    const hoursLeft = Math.max(1, Math.round(minsLeft / 60));
    return { label: `CLOSES IN ${hoursLeft} HOUR${hoursLeft !== 1 ? "S" : ""}`, isOpen: true };
  }
  return { label: "OPEN NOW", isOpen: true };
}

/**
 * Read-only — hours are set by the vendor from their own "Location &
 * Hours" panel (vendor/listing/parent_details). Shows a live status pill
 * (Open Now / Closes in N Hours / Opens At / Closed) next to the heading,
 * and highlights today's row green when currently open, red when not.
 */
export default function EstateOperatingHours({ estate }) {
  const hours = estate.operatingHours;
  if (!hours) return null;

  const now = new Date();
  const todayName = DAYS[(now.getDay() + 6) % 7]; // getDay(): 0=Sun -> shift so Mon=0
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const status = computeTodayStatus(hours[todayName], nowMinutes);

  const statusPillClasses = status.isOpen
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock size={18} className="text-gray-400 dark:text-gray-500" /> Operating Hours
        </h2>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wide shrink-0 ${statusPillClasses}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
          {status.label}
        </span>
      </div>

      <div className="max-w-md rounded-2xl border border-gray-100 dark:border-white/[0.08] divide-y divide-gray-100 dark:divide-white/[0.06] overflow-hidden">
        {DAYS.map((day) => {
          const h = hours[day];
          const isToday = day === todayName;
          const rowClasses = isToday
            ? status.isOpen
              ? "bg-emerald-50 dark:bg-emerald-950/20"
              : "bg-red-50 dark:bg-red-950/20"
            : "bg-white dark:bg-transparent";
          const textClasses = isToday
            ? status.isOpen
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-red-700 dark:text-red-300"
            : "text-gray-600 dark:text-gray-400";

          return (
            <div key={day} className={`flex items-center justify-between px-4 py-2.5 text-sm ${rowClasses}`}>
              <span className={`font-medium ${textClasses}`}>
                {day}
                {isToday && <span className="ml-2 text-[10px] font-bold uppercase tracking-wide">Today</span>}
              </span>
              {h?.open ? (
                <span className={`font-semibold ${isToday ? textClasses : "text-gray-800 dark:text-gray-200"}`}>
                  {formatTime(h.from)} – {formatTime(h.to)}
                </span>
              ) : (
                <span className={isToday ? textClasses : "text-gray-400 dark:text-gray-600"}>Closed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
