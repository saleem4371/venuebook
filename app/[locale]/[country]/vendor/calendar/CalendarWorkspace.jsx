"use client";
/**
 * CalendarWorkspace.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Routes to the correct view component based on activeView.
 * Applies AnimatePresence transitions between view switches.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useCalendar } from "./CalendarContext";
import MonthView    from "./views/MonthView";
import WeekView     from "./views/WeekView";
import DayView      from "./views/DayView";
import TimelineView from "./views/TimelineView";
import AgendaView   from "./views/AgendaView";

const VIEW_MAP = {
  month:    MonthView,
  week:     WeekView,
  day:      DayView,
  timeline: TimelineView,
  agenda:   AgendaView,
};

export default function CalendarWorkspace({ adapter }) {
  const { activeView } = useCalendar();
  const View = VIEW_MAP[activeView] ?? MonthView;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{    opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="h-full"
      >
        <View adapter={adapter} />
      </motion.div>
    </AnimatePresence>
  );
}
