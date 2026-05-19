"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, CalendarDays } from "lucide-react";

export default function RemindersVertical({ reminders }) {
  useEffect(() => {
    const audio = new Audio("/reminder-sound.mp3");
    const t = setInterval(() => {
      if (reminders.length > 0) audio.play().catch(() => {});
    }, 60000);
    return () => clearInterval(t);
  }, [reminders]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl  p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-50 dark:bg-purple-950/40 rounded-lg">
            <Bell size={15} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reminders</h2>
        </div>
        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
          {reminders.length} upcoming
        </span>
      </div>

      {reminders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-full">
            <CalendarDays size={28} className="text-gray-300 dark:text-gray-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No upcoming reminders</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Events will appear here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {reminders.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50/60 dark:hover:bg-purple-950/20 border border-transparent hover:border-purple-100 dark:hover:border-purple-900/50 transition-all duration-200 group"
            >
              <div className="shrink-0 mt-0.5 p-2 bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-900/50 rounded-lg shadow-sm group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors">
                <Bell size={13} className="text-purple-500 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug truncate">{r.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock size={11} className="text-gray-400 dark:text-gray-500 shrink-0" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.date} · {r.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
