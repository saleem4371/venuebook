"use client";
/**
 * /vendor/calendar/page.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * VenueBook Adaptive Calendar — clean, hospitality-focused.
 * Reads activeCategory → picks adapter → renders CalendarShell.
 */
import { useMemo }           from "react";
import { motion }            from "framer-motion";
import { Plus }              from "lucide-react";
import { useVendorCategory } from "@/context/VendorCategoryContext";
import { CalendarProvider }  from "./CalendarContext";
import { getAdapter }        from "./calendarAdapters";
import CalendarShell         from "./CalendarShell";
import PageHeader            from "../components/PageHeader";

export default function CalendarPage() {
  const { activeCategory } = useVendorCategory();
  const adapter = useMemo(() => getAdapter(activeCategory), [activeCategory]);

  /* Timeline → month for the simplified view system */
  const defaultView = adapter.defaultView === "timeline" ? "month" : adapter.defaultView;

  const newBookingAction = (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                 text-white shadow-md"
      style={{
        background: adapter.gradient,
        boxShadow: `0 4px 14px rgba(${adapter.accentRgb},0.28)`,
      }}
    >
      <Plus size={15} />
      New Booking
    </motion.button>
  );

  return (
    <CalendarProvider adapterDefaultView={defaultView}>
      <PageHeader
        title="Calendar"
        subtitle={`${adapter.label} · Bookings & availability`}
        action={newBookingAction}
      />
      <CalendarShell adapter={adapter} />
    </CalendarProvider>
  );
}
