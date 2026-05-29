"use client";
/**
 * CalendarShell.jsx — Simplified layout
 * ──────────────────────────────────────────────────────────────────────────
 *   Toolbar (compact, single row)
 *   ┌─────────────────────────────────┬────────────────────┐
 *   │  Calendar workspace (full width) │  Right drawer      │
 *   │  Month / Week / Day             │  (slides in on     │
 *   │                                 │   booking click)   │
 *   └─────────────────────────────────┴────────────────────┘
 *
 * No left sidebar. No metrics bar. Clean, spacious, mobile-first.
 * On mobile: drawer becomes a bottom sheet.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useCalendar }  from "./CalendarContext";
import CalendarToolbar  from "./CalendarToolbar";
import CalendarWorkspace from "./CalendarWorkspace";
import CalendarDrawer   from "./CalendarDrawer";

export default function CalendarShell({ adapter }) {
  const { drawerOpen, closeDrawer } = useCalendar();

  return (
    <div className="flex flex-col gap-4 pb-10">

      {/* ── Compact toolbar ── */}
      <CalendarToolbar adapter={adapter} />

      {/* ── Workspace + optional right drawer ── */}
      <div className="flex gap-4 items-start">

        {/* Main calendar — always full width, shrinks when drawer opens */}
        <motion.div
          layout
          className="flex-1 min-w-0"
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
        >
          <CalendarWorkspace adapter={adapter} />
        </motion.div>

        {/* Desktop right drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              key="right-drawer"
              initial={{ width: 0, opacity: 0, x: 16 }}
              animate={{ width: 340, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="shrink-0 overflow-hidden hidden md:block"
            >
              <div className="w-[340px]">
                <CalendarDrawer adapter={adapter} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile bottom sheet ── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="mobile-sheet"
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeDrawer}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 34 }}
              className="absolute bottom-0 left-0 right-0 max-h-[88vh]
                         rounded-t-3xl overflow-hidden
                         bg-white dark:bg-[#0f172a]"
            >
              {/* Pull handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/10" />
              </div>
              <CalendarDrawer adapter={adapter} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

