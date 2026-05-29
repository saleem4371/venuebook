"use client";
/**
 * CalendarContext.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Global state engine for the VenueBook adaptive calendar system.
 * All views, toolbars, sidebar, and drawer share this context.
 */
import {
  createContext, useContext, useState, useCallback, useMemo, useEffect,
} from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter  from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const CalendarCtx = createContext(null);

export function CalendarProvider({ children, adapterDefaultView = "month" }) {
  const [currentDate, setCurrentDate]         = useState(dayjs());
  const [activeView, setActiveView]           = useState(adapterDefaultView);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drawerOpen, setDrawerOpen]           = useState(false);
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [filters, setFilters]                 = useState({ status: "all", resource: "all" });
  const [searchQuery, setSearchQuery]         = useState("");
  const [hoveredDate, setHoveredDate]         = useState(null);

  /* Keep view in sync when adapter changes (category switch) */
  useEffect(() => {
    setActiveView(adapterDefaultView);
  }, [adapterDefaultView]);

  const openBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedBooking(null), 350);
  }, []);

  const navigate = useCallback(
    (direction) => {
      setCurrentDate((prev) => {
        switch (activeView) {
          case "month":    return prev.add(direction, "month");
          case "week":     return prev.add(direction * 7, "day");
          case "day":      return prev.add(direction, "day");
          case "timeline": return prev.add(direction * 7, "day");
          case "agenda":   return prev.add(direction, "month");
          default:         return prev.add(direction, "month");
        }
      });
    },
    [activeView],
  );

  const goToToday = useCallback(() => setCurrentDate(dayjs()), []);

  /* ── Derived helpers ── */
  const weekStart = useMemo(
    () => currentDate.startOf("week"),
    [currentDate],
  );

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day")),
    [weekStart],
  );

  const monthDates = useMemo(() => {
    const start = currentDate.startOf("month");
    const end   = currentDate.endOf("month");
    const cells = [];
    // Leading empty cells
    for (let i = 0; i < start.day(); i++) cells.push(null);
    for (let d = start; d.isSameOrBefore(end, "day"); d = d.add(1, "day")) {
      cells.push(d);
    }
    return cells;
  }, [currentDate]);

  const rangeLabel = useMemo(() => {
    if (activeView === "month")  return currentDate.format("MMMM YYYY");
    if (activeView === "agenda") return `${currentDate.format("MMM YYYY")} – ${currentDate.add(1, "month").format("MMM YYYY")}`;
    if (activeView === "week" || activeView === "timeline") {
      const s = weekDates[0].format("D MMM");
      const e = weekDates[6].format("D MMM YYYY");
      return `${s} – ${e}`;
    }
    if (activeView === "day") return currentDate.format("dddd, D MMMM YYYY");
    return "";
  }, [activeView, currentDate, weekDates]);

  const value = useMemo(
    () => ({
      currentDate, setCurrentDate,
      activeView, setActiveView,
      selectedBooking,
      drawerOpen,
      sidebarOpen, setSidebarOpen,
      selectedListing, setSelectedListing,
      filters, setFilters,
      searchQuery, setSearchQuery,
      hoveredDate, setHoveredDate,
      openBooking, closeDrawer,
      navigate, goToToday,
      weekDates, monthDates, rangeLabel,
    }),
    [
      currentDate, activeView, selectedBooking, drawerOpen,
      sidebarOpen, selectedListing, filters, searchQuery, hoveredDate,
      openBooking, closeDrawer, navigate, goToToday,
      weekDates, monthDates, rangeLabel,
    ],
  );

  return <CalendarCtx.Provider value={value}>{children}</CalendarCtx.Provider>;
}

export function useCalendar() {
  const ctx = useContext(CalendarCtx);
  if (!ctx) throw new Error("useCalendar must be inside <CalendarProvider>");
  return ctx;
}

/* ── Shared utility: map a status string → color tokens ─────────────────── */
export function getStatusStyle(status) {
  const map = {
    confirmed:   { bg: "rgba(16,185,129,0.14)",  border: "#10b981", text: "#10b981",  label: "Confirmed"   },
    tentative:   { bg: "rgba(245,158,11,0.14)",  border: "#f59e0b", text: "#f59e0b",  label: "Tentative"   },
    setup:       { bg: "rgba(99,102,241,0.14)",  border: "#6366f1", text: "#6366f1",  label: "Setup"       },
    buffer:      { bg: "rgba(107,114,128,0.10)", border: "#6b7280", text: "#9ca3af",  label: "Buffer"      },
    cancelled:   { bg: "rgba(239,68,68,0.14)",   border: "#ef4444", text: "#ef4444",  label: "Cancelled"   },
    occupied:    { bg: "rgba(16,185,129,0.14)",  border: "#10b981", text: "#10b981",  label: "Occupied"    },
    checkin:     { bg: "rgba(59,130,246,0.14)",  border: "#3b82f6", text: "#3b82f6",  label: "Check-in"    },
    checkout:    { bg: "rgba(249,115,22,0.14)",  border: "#f97316", text: "#f97316",  label: "Check-out"   },
    cleaning:    { bg: "rgba(139,92,246,0.14)",  border: "#8b5cf6", text: "#8b5cf6",  label: "Cleaning"    },
    blocked:     { bg: "rgba(239,68,68,0.10)",   border: "#ef4444", text: "#ef4444",  label: "Blocked"     },
    session:     { bg: "rgba(245,158,11,0.14)",  border: "#f59e0b", text: "#f59e0b",  label: "Session"     },
    recording:   { bg: "rgba(239,68,68,0.14)",   border: "#ef4444", text: "#ef4444",  label: "Recording"   },
    recurring:   { bg: "rgba(139,92,246,0.14)",  border: "#8b5cf6", text: "#8b5cf6",  label: "Recurring"   },
    booked:      { bg: "rgba(59,130,246,0.14)",  border: "#3b82f6", text: "#3b82f6",  label: "Booked"      },
    meeting:     { bg: "rgba(99,102,241,0.14)",  border: "#6366f1", text: "#6366f1",  label: "Meeting"     },
    rented:      { bg: "rgba(236,72,153,0.14)",  border: "#ec4899", text: "#ec4899",  label: "Rented"      },
    pickup:      { bg: "rgba(59,130,246,0.14)",  border: "#3b82f6", text: "#3b82f6",  label: "Pickup"      },
    dropoff:     { bg: "rgba(245,158,11,0.14)",  border: "#f59e0b", text: "#f59e0b",  label: "Drop-off"    },
    maintenance: { bg: "rgba(239,68,68,0.10)",   border: "#ef4444", text: "#ef4444",  label: "Maintenance" },
    full:        { bg: "rgba(239,68,68,0.14)",   border: "#ef4444", text: "#ef4444",  label: "Full"        },
    few_left:    { bg: "rgba(245,158,11,0.14)",  border: "#f59e0b", text: "#f59e0b",  label: "Few Left"    },
  };
  return map[status] ?? { bg: "rgba(99,102,241,0.14)", border: "#6366f1", text: "#6366f1", label: status };
}
