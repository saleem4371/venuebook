"use client";

/* ══════════════════════════════════════════════════════════════════
   CREATE BOOKING WORKSPACE
   Full 5-section booking creation form + pricing summary sidebar.
   Refactored from bookings/new/page.jsx into an internal workspace.
   All sections, fields, and action buttons preserved.
══════════════════════════════════════════════════════════════════ */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  ChevronDown,
  CalendarCheck,
  Building2,
  Package,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  InvoiceNOAPI,
  getAvailableVenues,
  load_shift_event,
  Load_all_packages,
  loadAllAddons,
  globalSetting,
} from "@/services/booking.service";

/* ── Shared input style ────────────────────────────────────── */
const INPUT_CLS =
  "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "outline-none focus:border-violet-400 dark:focus:border-violet-500 " +
  "focus:ring-2 focus:ring-violet-500/20 transition";

/* ── Section wrapper ───────────────────────────────────────── */
function Section({ icon: Icon, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-5"
    >
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-violet-50 dark:bg-violet-950/40">
          <Icon size={15} className="text-violet-500" aria-hidden="true" />
        </div>
        <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

/* ── Summary row ───────────────────────────────────────────── */
function SummaryRow({ label, value, highlight = false }) {
  return (
    <div
      className={`flex justify-between text-sm ${highlight ? "font-bold text-violet-600 dark:text-violet-400" : "text-gray-600 dark:text-gray-400"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN WORKSPACE
══════════════════════════════════════════════════════════════ */
export default function CreateBookingWorkspace() {
  const [dateErrors, setDateErrors] = useState({});
  //const [shift,    setShift]    = useState("evening");
  const [selfBook, setSelfBook] = useState(false);

  const [booking, setBooking] = useState("");
  const [invoice, setInvoice] = useState("");

  const [selectionMode, setSelectionMode] = useState("single"); // single | multiple
  const [selectionType, setSelectionType] = useState("venue"); // single | multiple
  const [shift, setShift] = useState([]);
  const [eventDates, setEventDates] = useState([""]);
  const [eventType, setEventType] = useState("");
  const [selectedVenues, setSelectedVenues] = useState([]);

 

  const [eventDate, setEventDate] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [venues, setVenues] = useState([]);
  const [event, setEvent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [capacityError, setCapacityError] = useState("");

  const [guestCapacity, setGuestCapacity] = useState("");

  //Settings
  const [settings, setSettings] = useState({});

const [settingsMap, setSettingsMap] = useState({});

useEffect(() => {
  if (!settings?.length) return;

  const map = settings.reduce((acc, item) => {
    let value = item.setting_value;

    if (value === "1") value = true;
    else if (value === "0") value = false;
    else if (!isNaN(value) && value !== "") value = Number(value);

    acc[item.setting_key] = value;
    return acc;
  }, {});

  setSettingsMap(map);
}, [settings]);
  //Settings


  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalGuests: 0,
    subtotal: 0,
    totalAddonAmount: 0,
    totalAddonQty: 0,
    gst_amt: 0,
    grand_total: 0
  });


  
/* ══════════════════════════════════════════════════════════════
  PAX
══════════════════════════════════════════════════════════════ */

  const [paxRate, setPaxRate] = useState(0);
  const [packages, setPackage] = useState([]);

const [openModal, setOpenModal] = useState(false);
const [activePackage, setActivePackage] = useState(null);

// selected items per package
const [selectedItems, setSelectedItems] = useState({});
const [addons, setAddons] = useState([]);

const [selectedAddons, setSelectedAddons] = useState([]);
const [qtyselectedAddons, setQtySelectedAddons] = useState([]);

const [bookingType,setBookingType]=useState("book");


/* ══════════════════════════════════════════════════════════════
   PAX
══════════════════════════════════════════════════════════════ */


  // console.log(venues);
  const today = new Date().toISOString().split("T")[0];

  const orderDate = booking?.created_at
    ? new Date(booking.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const load = async () => {
    const res = await InvoiceNOAPI();
    

    const invoice_no = res?.data ?? 0;
    setInvoice(invoice_no);

    const resp = await load_shift_event();

    const events = resp?.data ?? 0;
    setEvent(events);

    const _packages = await Load_all_packages();
    setPackage(_packages.data);
    
    const _settings = await globalSetting();
    setSettings(_settings.data);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const fetchVenues = async () => {
      // Validation
      if (shift.length === 0) return;

      if (selectionMode === "single" && !eventDate) return;

      if (
        selectionMode === "multiple" &&
        (!dateRange.startDate || !dateRange.endDate)
      ) {
        return;
      }

      try {
        setLoading(true);

        const payload =
          selectionMode === "single"
            ? {
                selectionMode,
                startDate: eventDate,
                shifts: shift,
              }
            : {
                selectionMode,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                shifts: shift,
              };

        const res = await getAvailableVenues(payload);

        setVenues(res?.data || []);
      } catch (err) {
        console.error(err);
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [selectionMode, eventDate, dateRange.startDate, dateRange.endDate, shift]);

  const toggleVenue = async(venue) => {
       

    setSelectedVenues((prev) => {
      const exists = prev.some(
        (v) => v.child_venue_id === venue.child_venue_id,
      );

      // 🔘 SINGLE SELECT MODE
      if (selectionMode === "single") {
        // if already selected → deselect (optional behavior)
        if (exists) return [];

        // replace with only one item
        return [venue];
      }

      // ☑️ MULTIPLE SELECT MODE
      if (exists) {
        return prev.filter((v) => v.child_venue_id !== venue.child_venue_id);
      }

      return [...prev, venue];
    });
    //api call to backend 


    
  };

  //adon call

  useEffect(() => {
  const load = async () => {
    const addonIds = selectedVenues.map(
      (item) => item.child_venue_id
    );

    const addons = await loadAllAddons(addonIds);
    setAddons(addons.data)
  };

  load();
}, [selectedVenues]);

  //RESET
const resetSelection = () => {
    setShift([]);
    setEventDate("");
    setDateRange({ startDate: "", endDate: "" });
    setSelectedVenues([]);
    setVenues([]);
    setPaxRate(0); // 🔥 important
};

  useEffect(() => {
    resetSelection();
  }, [selectionMode]);

  //Settings
  //Settings 
// Parse child settings safely
const childSettings = (() => {
  if (Array.isArray(venues.child_setting)) {
    return venues.child_setting;
  }

  if (typeof venues.child_setting === "string") {
    try {
      return JSON.parse(venues.child_setting);
    } catch {
      return [];
    }
  }

  return [];
})();

// Convert array -> object
const venueSettings = childSettings.reduce((acc, item) => {
  acc[item.key] = item.value;
  return acc;
}, {});

console.log(venueSettings)

// Boolean helper
const isTrue = (value) =>
  value === true ||
  value === "true" ||
  value === 1 ||
  value === "1";

// Security
const securityEnabled = isTrue(venueSettings.security);

// Security Amount (only if security enabled)
const securityAmount = securityEnabled
  ? Number(venueSettings.secAmt || 0)
  : 0;

// Advance
const advanceEnabled = isTrue(venueSettings.advance);
const advancePercent = advanceEnabled
  ? Number(venueSettings.advance || 0)
  : 0;

// Other settings
const instantBooking = isTrue(venueSettings.instant);
const searchable = isTrue(venueSettings.search);
const schedule = venueSettings.schedule ?? "";
const minStay = venueSettings.minStay ?? "";
const notice = venueSettings.notice ?? "";
// const bookingType = venueSettings.type ?? "";
const bookingWindow = venueSettings.window ?? "";
const status = venueSettings.status ?? "";

 useEffect(() => {
  let baseAmount = 0;
  let venueGST = 0;
  let paxGST = 0;

  const totalGuests = selectedVenues.reduce(
    (acc, v) => acc + (Number(v.guest_rooms) || 0),
    0
  );

  const capacity = Number(guestCapacity) || 0;

  // =========================
  // VENUE MODE
  // =========================
  if (selectionType === "venue") {
    if (selectionMode === "single") {
      baseAmount = selectedVenues.reduce(
        (acc, v) => acc + (Number(v.per_day_price) || 0),
        0
      );
    } else {
      baseAmount = selectedVenues.reduce(
        (acc, v) => acc + (Number(v.total_price || v.per_day_price) || 0),
        0
      );
    }

    venueGST = (baseAmount * 18) / 100;
  }
  else
  {
    venueGST = 0;
  }

  // =========================
  // PAX MODE
  // =========================
  if (selectionType === "pax") {
    const pax = Number(paxRate) || 0;

    baseAmount = capacity * pax;

    paxGST = (baseAmount * 5) / 100;
  }

  // =========================
  // ADDONS
  // =========================
  const addonSummary = Object.values(selectedAddons).reduce(
    (acc, item) => {
      const qty = Number(item.qty || 0);

      const price = Number(
        item.addon?.amount ??
        item.addon?.price ??
        0
      );

      acc.totalQty += qty;
      acc.totalAmount += qty * price;

      return acc;
    },
    {
      totalQty: 0,
      totalAmount: 0,
    }
  );

  const totalAddonQty = addonSummary.totalQty;
  const totalAddonAmount = addonSummary.totalAmount;

  // Addon GST (18%)
  const addonGST = (totalAddonAmount * 18) / 100;

  // =========================
  // FINAL TOTALS
  // =========================

  const subtotal = baseAmount + totalAddonAmount;

  const gst_amt = venueGST + addonGST;

  const grand_total = subtotal + gst_amt;

  setSummary({
    // Amounts
    totalAmount: baseAmount,
    totalGuests,

    totalAddonQty,
    totalAddonAmount,

    subtotal,

    // GST Breakdown
    venueGST,
    paxGST,
    addonGST,
    gst_amt,

    grand_total,
    securityAmount,
  });

}, [
  selectedVenues,
  guestCapacity,
  selectionType,
  selectionMode,
  paxRate,
  selectedAddons,
  securityAmount,
]);


  const isInvalidCapacity =
  guestCapacity &&
  summary.totalGuests &&
  Number(guestCapacity) < summary.totalGuests;



const handleAddonToggle = (addon) => {
  setSelectedAddons((prev) => {
    const updated = { ...prev };

    if (updated[addon.id]) {
      delete updated[addon.id];
    } else {
      updated[addon.id] = {
        qty: 1,
        addon,
      };
    }

    return updated;
  });
};

const updateAddonQty = (addon, action) => {
  const stock = Number(addon.stock || addon.quantity || 0);

  setSelectedAddons((prev) => {
    const updated = { ...prev };

    const currentQty = updated[addon.id]?.qty || 0;

    if (action === "add") {
      if (currentQty >= stock) return prev;

      updated[addon.id] = {
        qty: currentQty + 1,
        addon,
      };
    }

    if (action === "remove") {
      if (currentQty <= 1) {
        delete updated[addon.id];
      } else {
        updated[addon.id] = {
          qty: currentQty - 1,
          addon,
        };
      }
    }

    return updated;
  });
};



  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-5"
    >
      {/* Workspace header */}
      <div className="pb-1 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          Create Booking
        </h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
          Fill event details, add service providers and confirm booking
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ── LEFT — Form sections ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* § 1 · EVENT DETAILS */}
          <Section icon={CalendarCheck} title="Event Details">
            {/* Order info strip */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl px-4 py-3 flex flex-wrap justify-between gap-2 text-sm font-medium">
              <span>📅 Order Date: {orderDate}</span>
              <span>Form ID: {invoice}</span>
              { settingsMap.multiVenue ==1 && (

             
              <span >
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMode((prev) => {
                      const next = prev === "single" ? "multiple" : "single";
                      return next;
                    });
                    setShift([]);
                    resetSelection();
                  }}
                  className={`inline-flex items-center justify-center gap-2
                      min-w-[100px] h-5 px-3
                      text-sm font-semibold text-white
                      transition-all duration-300
                      shadow-md hover:shadow-lg hover:scale-[1.02]
                      ${
                        selectionMode === "single"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                          : "bg-gradient-to-r from-emerald-500 to-green-600"
                      }`}
                >
                  {selectionMode === "single" ? (
                    <>
                      🔘 <span>Single Select</span>
                    </>
                  ) : (
                    <>
                      ☑️ <span>Multiple Select</span>
                    </>
                  )}
                </button>
              </span>
               )}
 { settingsMap.paxPricing ==1 && (
              <span>
                <button
                  type="button"
                 onClick={() => {
  setSelectionType((prev) => {
    const next = prev === "venue" ? "pax" : "venue";

    // reset when switching mode
    resetSelection();
    setShift([]);

    return next;
  });
}}
                  className={`inline-flex items-center justify-center gap-2
                      min-w-[100px] h-5 px-3
                      text-sm font-semibold text-white
                      transition-all duration-300
                      shadow-md hover:shadow-lg hover:scale-[1.02]
                      ${
                        selectionType === "venue"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                          : "bg-gradient-to-r from-emerald-500 to-green-600"
                      }`}
                >
                  {selectionType === "venue" ? (
                    <>
                      🔘 <span>venue</span>
                    </>
                  ) : (
                    <>
                      ☑️ <span>pax</span>
                    </>
                  )}
                </button>
              </span>
               )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Event Date */}
              {/* <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Event Date</label>
                <div className="flex items-center border borconst isInvalidCapacity =
  guestCapacity &&
  summary.totalGuests &&
  Number(guestCapacity) < summary.totalGuests;der-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 focus-within:border-violet-400 dark:focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition">
                  <Calendar size={15} className="text-gray-400 dark:text-gray-500 me-2 shrink-0" />
                  <input type="date" className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100" />
                </div>
              </div> */}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Event Date
                </label>

                {selectionMode === "single" ? (
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800">
                    <Calendar size={16} className="mr-2 text-gray-400" />

                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={eventDate}
                      onChange={(e) => {
                        setEventDate(e.target.value);
                        setSelectedVenues([]);
                      }}
                      className="w-full outline-none bg-transparent text-sm"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {/* From Date */}
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800">
                      <Calendar size={16} className="mr-2 text-gray-400" />

                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={dateRange.startDate}
                        onChange={(e) => {
                          const value = e.target.value;

                          setDateRange((prev) => ({
                            ...prev,
                            startDate: value,
                            endDate:
                              prev.endDate && prev.endDate < value
                                ? ""
                                : prev.endDate,
                          }));

                          setSelectedVenues([]);
                        }}
                        className="w-full outline-none bg-transparent text-sm"
                      />
                    </div>

                    {/* To Date */}
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800">
                      <Calendar size={16} className="mr-2 text-gray-400" />

                      <input
                        type="date"
                        min={
                          dateRange.startDate ||
                          new Date().toISOString().split("T")[0]
                        }
                        value={dateRange.endDate}
                        onChange={(e) => {
                          setDateRange((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }));

                          setSelectedVenues([]);
                        }}
                        disabled={!dateRange.startDate}
                        className="w-full outline-none bg-transparent text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Event Shift */}
              {/* <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Event Shift</label>
                <div className="flex gap-2">
                  {["morning", "afternoon", "evening","full day"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShift(s)}
                      className={`flex-1 py-2.5 rounded-xl text-sm capitalize font-medium transition-all ${
                        shift === s
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div> */}
              <div className="flex gap-2 flex-wrap">
                {["morning", "afternoon", "evening", "full day"].map((s) => {
                  const fullDaySelected = shift.includes("full day");
                  const otherSelected = shift.some((v) => v !== "full day");

                  const disabled =
                    s === "full day" ? otherSelected : fullDaySelected;

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (selectionMode === "single") {
                          // toggle OFF if same shift clicked again
                          if (shift[0] === s) {
                            setShift([]);
                            resetSelection();
                            return;
                          }

                          setShift([s]);
                          return;
                        }

                        // MULTIPLE mode
                        if (shift.includes(s)) {
                          setShift((prev) => prev.filter((v) => v !== s));
                          return;
                        }

                        setShift((prev) => [
                          ...prev.filter((v) => v !== "full day"),
                          s,
                        ]);
                      }}
                      className={`px-5 py-0.5 rounded-xl text-sm capitalize font-medium transition
          ${
            shift.includes(s)
              ? "bg-violet-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          }
          ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-200 dark:hover:bg-gray-700"}
        `}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {/* Event Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Event Type <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full appearance-none border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 pr-10 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition"
                  >
                    <option value="">Select Event Type</option>

                    {event.map((item) => (
                      <option key={item.id} value={item.event_name}>
                        {item.event_name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Guest Capacity */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Guest Capacity
                </label>
              <div
  className={`flex items-center border rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 transition
  ${
    capacityError
      ? "border-red-500 ring-2 ring-red-500/20"
      : "border-gray-200 dark:border-gray-700 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20"
  }`}
>
                  <Users size={15} className="text-gray-400 me-2 shrink-0" />
                 <input
  type="number"
  value={guestCapacity}
  onChange={(e) => {
    const value = e.target.value;
    const capacity = Number(value);

    setGuestCapacity(value);

    // 🔥 LIVE VALIDATION
    if (summary.totalGuests && capacity > summary.totalGuests) {
      setCapacityError(
        `Maximum required capacity is ${summary.totalGuests}`
      );
    } else {
      setCapacityError("");
    }
  }}
  placeholder="e.g. 200"
  className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100"
/>
{capacityError && (
  <p className="text-xs text-red-500 mt-1">
    {capacityError}
  </p>
)}
                </div>
              </div> 

             
            </div>

            {/* Child venues picker */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                  Available Venues
                </h3>

                <span className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 px-2 py-1 rounded-full">
                  {venues.length} Found
                </span>
              </div>

              {loading ? (
                <div className="text-center py-6 text-sm text-gray-500 animate-pulse">
                  Searching available venues...
                </div>
              ) : venues.length === 0 ? (
                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-8 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No venue available</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-4 gap-3">
                  {venues.map((venue) => {
                    // const isActive = selectedVenue.child_venue_id === venue.child_venue_id;

                    return (
                      <button
                        key={venue.child_venue_id}
                        type="button"
                        onClick={() => toggleVenue(venue)}
                        className={`w-full text-left p-4 rounded-xl border transition ${
                          selectedVenues.some(
                            (v) => v.child_venue_id === venue.child_venue_id,
                          )
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-violet-600" />
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {venue.child_venue_name}
                              </h4>

                              <p className="text-xs text-gray-500">
                                #{venue.guest_rooms}
                              </p>
                            </div>
                          </div>

                          {/* ✅ active indicator */}
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              selectedVenues.some(
                                (v) =>
                                  v.child_venue_id === venue.child_venue_id,
                              )
                                ? "bg-violet-500"
                                : "bg-green-500"
                            }`}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">
                              {venue.shift_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {venue.shift_timing}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-violet-600">
                              ₹{venue.per_day_price}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* {selectedVenue && (
        <div className="mt-5 p-4 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold text-dark">
            Selected: {selectedVenue.child_venue_name}
          </h3>
        </div>
      )} */}
            </div>
          </Section>

           {selectionType === "pax" && (
            <>
           <Section icon={Building2} title="PAX">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {packages.map((pack) => {
     // const selectedCount = selectedItems[pack.id]?.length || 0;

      const packageSelection = selectedItems[pack.id] || {};

// Total selected items
const selectedCount = Object.values(packageSelection).reduce(
  (total, items) => total + items.length,
  0
);

// Total allowed selections across all categories
const totalAllowed = (pack.categories || []).reduce(
  (total, cat) => total + Number(cat.count || 0),
  0
);

      return (
        <button
          key={pack.id}
          type="button"
          onClick={() => {
            setActivePackage(pack);
            setOpenModal(true);
          }}
          className={`text-left rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg ${
            selectedCount
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {pack.name}
            </h3>

            {selectedCount > 0 && (
              <span className="h-3 w-3 rounded-full bg-violet-500" />
            )}
          </div>

        
          <div className="mt-5 space-y-3">
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">Categories</span>
    <span className="font-semibold">
      {pack.categories?.length || 0}
    </span>
  </div>

  <div className="flex justify-between text-sm">
    <span className="text-gray-500">Can Select</span>
    <span className="font-semibold">
      {totalAllowed} Items
    </span>
  </div>

  <div className="flex justify-between text-sm">
    <span className="text-gray-500">Selected</span>

    <span
      className={`font-bold ${
        selectedCount === totalAllowed
          ? "text-green-600"
          : "text-orange-500"
      }`}
    >
      {selectedCount} / {totalAllowed}
    </span>
  </div>

  <div className="flex justify-between text-sm">
    <span className="text-gray-500">Price / Pax</span>
    <span className="font-bold text-violet-600">
      ₹{pack.price}
    </span>
  </div>
</div>

         <div className="mt-5">
  <div
    className={`w-full rounded-lg py-2 text-center text-sm font-medium ${
      selectedCount === totalAllowed && totalAllowed > 0
        ? "bg-green-600 text-white"
        : selectedCount > 0
        ? "bg-violet-600 text-white"
        : "bg-gray-100 dark:bg-gray-800"
    }`}
  >
    {selectedCount === totalAllowed && totalAllowed > 0
      ? "Completed"
      : selectedCount > 0
      ? "Edit Selection"
      : "Choose Items"}
  </div>
</div>
        </button>
      );
    })}
  </div>


</Section>



{openModal && activePackage && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-900 w-[900px] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">

      {/* Header */}
      <div className="border-b px-6 py-5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            {activePackage.name}
          </h2>

          <p className="text-sm text-gray-500">
            Select package items
          </p>
        </div>

        <button
          onClick={() => setOpenModal(false)}
          className="text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Categories */}
      <div className="p-6 space-y-8 max-h-[65vh] overflow-y-auto">

        {activePackage.categories.map((category) => {

          const selected =
            selectedItems[activePackage.id]?.[category.id] || [];

          return (
            <div
              key={category.id}
              className="border rounded-xl p-5"
            >

              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    {category.name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    Select {category.count}
                  </p>
                </div>

                <span className="text-sm font-semibold text-violet-600">
                  {selected.length}/{category.count}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-3">

                {category.items.map((item) => {

                  const checked = selected.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {

                        setSelectedItems((prev) => {

                          const packageData =
                            prev[activePackage.id] || {};

                          const current =
                            packageData[category.id] || [];

                          let updated = [];

                          if (current.includes(item.id)) {

                            updated = current.filter(
                              (id) => id !== item.id
                            );

                          } else {

                            if (
                              current.length >= category.count
                            ) {
                              return prev;
                            }

                            updated = [...current, item.id];
                          }

                          return {
                            ...prev,

                            [activePackage.id]: {
                              ...packageData,

                              [category.id]: updated,
                            },
                          };
                        });

                        setPaxRate(activePackage.price)

                      }}
                      className={`border rounded-xl p-3 text-left transition

                      ${
                        checked
                          ? "border-violet-500 bg-violet-50"
                          : "hover:border-violet-400"
                      }`}
                    >

                      <div className="flex justify-between">

                        <div>

                          <h4 className="font-semibold">
                            {item.name}
                          </h4>

                          <p className="text-xs text-gray-500">
                            ₹{item.price}
                          </p>

                        </div>

                        {checked && (
                          <span className="text-violet-600">
                            ✓
                          </span>
                        )}

                      </div>

                    </button>
                  );

                })}

              </div>

            </div>
          );

        })}

      </div>

      {/* Footer */}

      <div className="border-t px-6 py-4 flex justify-end gap-3">

        <button
          onClick={() => setOpenModal(false)}
          className="px-5 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={() => setOpenModal(false)}
          className="px-5 py-2 bg-violet-600 text-white rounded-lg"
        >
          Save Selection
        </button>

      </div>

    </div>
  </div>
)}
</>

)}



          {/* § 2 · SERVICE PROVIDER DETAILS */}
          <Section icon={Building2} title="Service Provider Details">
            <div className="grid md:grid-cols-2 gap-4">
              <input className={INPUT_CLS} placeholder="Name of the Caterer" />
              <input
                className={INPUT_CLS}
                placeholder="Name of the Decorator"
              />
              <input
                className={INPUT_CLS}
                placeholder="Name of Sound system person"
              />
              <input
                className={INPUT_CLS}
                placeholder="Name of Music/Dance troupe"
              />
            </div>
          </Section>

          {/* § 3 · ADD-ONS */}
         <Section icon={Package} title="Add-Ons">
  {addons.length === 0 ? (
    <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-10 text-center">
      <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
      <p className="text-sm text-gray-500">
        No add-ons available for the selected venue.
      </p>
    </div>
  ) : (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
    {addons.map((addon) => {
  const qty = selectedAddons[addon.id]?.qty || 0;
const stock = Number(addon.stock || addon.quantity || 0);
const isSelected = qty > 0;

  return (
    <div
      key={addon.id}
      className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg hover:border-violet-400 transition-all"
    >
      {/* Image */}
      <div className="h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
        {addon.image ? (
          <img
            src={addon.image}
            alt={addon.add_on_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
          {addon.add_on_name}
        </h3>

        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
          {addon.description || "No description available"}
        </p>

        {/* Price & Stock */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Price</p>

            <p className="text-lg font-bold text-violet-600">
              ₹{addon.amount ?? addon.price ?? 0}
            </p>

            {addon.type === "unit" && (
              <p className="text-xs text-gray-400 mt-1">
                Stock : {stock}
              </p>
            )}
          </div>

          {/* Normal Addon */}
          {addon.type !== "unit" && (
  <button
    type="button"
    onClick={() => handleAddonToggle(addon)}
    className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
      isSelected
        ? "bg-green-600 text-white"
        : "bg-violet-600 hover:bg-violet-700 text-white"
    }`}
  >
    {isSelected ? "Added ✓" : "Add"}
  </button>
)}
        </div>

        {/* Unit Quantity Selector */}
       {addon.type === "unit" && (
  <div className="space-y-3">

    <div className="flex justify-between text-xs">
      <span>Stock</span>
      <span>{stock}</span>
    </div>

    <div className="flex items-center justify-center rounded-xl border overflow-hidden">

      <button
        type="button"
        disabled={qty === 0}
        onClick={() => updateAddonQty(addon, "remove")}
        className="w-10 h-10 text-xl disabled:opacity-40"
      >
        −
      </button>

      <div className="w-14 text-center font-semibold border-x">
        {qty}
      </div>

      <button
        type="button"
        disabled={qty >= stock}
        onClick={() => updateAddonQty(addon, "add")}
        className="w-10 h-10 text-xl disabled:opacity-40"
      >
        +
      </button>

    </div>

    {qty >= stock && (
      <p className="text-xs text-red-500 text-center">
        Out of Stock
      </p>
    )}
  </div>
)}
      </div>
    </div>
  );
})}
    </div>
  )}
</Section>

<Section icon={CalendarCheck} title="Booking Type">
  <div className="grid grid-cols-2 gap-4">

    <button
      type="button"
      onClick={() => setBookingType("book")}
      className={`rounded-xl p-5 border transition ${
        bookingType === "book"
          ? "border-violet-600 bg-violet-50"
          : "border-gray-200"
      }`}
    >
      <h3 className="font-semibold">Confirm Booking</h3>
      <p className="text-sm text-gray-500 mt-1">
        Customer pays and booking is confirmed.
      </p>
    </button>

    <button
      type="button"
      onClick={() => setBookingType("reserve")}
      className={`rounded-xl p-5 border transition ${
        bookingType === "reserve"
          ? "border-amber-500 bg-amber-50"
          : "border-gray-200"
      }`}
    >
      <h3 className="font-semibold">Reserve</h3>
      <p className="text-sm text-gray-500 mt-1">
        Hold the venue temporarily until confirmation.
      </p>
    </button>

  </div>
</Section>

          {/* § 4 · SPECIAL REQUEST */}
          <Section icon={FileText} title="Special Request">
            <textarea
              rows={5}
              placeholder="Write any special requirements..."
              className={`${INPUT_CLS} resize-none`}
            />
          </Section>

          {/* § 5 · CUSTOMER DETAILS */}
          <Section icon={Users} title="Customer Details">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Are you booking for yourself?
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={selfBook}
                onClick={() => setSelfBook((v) => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${selfBook ? "bg-violet-600" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${selfBook ? "start-5" : "start-0.5"}`}
                />
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                className={INPUT_CLS}
                placeholder="Phone Number"
                type="tel"
              />
              <input className={INPUT_CLS} placeholder="Name" type="text" />
              <input className={INPUT_CLS} placeholder="Email" type="email" />
            </div>
          </Section>
        </div>

        {/* ── RIGHT — Pricing summary sidebar ──────────────── */}
        <div className="sticky top-[140px] h-fit">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 space-y-4"
          >
            <h2 className="font-bold text-gray-800 dark:text-gray-100">
              Summary
            </h2>

            <div className="space-y-2.5">
              <SummaryRow
                label="Base Price"
                value={`₹${summary.totalAmount}`}
              /> 
              {summary.totalAddonQty != 0 && (
  <SummaryRow
  label={`Add-ons (${summary.totalAddonQty})`}
  value={`₹${summary.totalAddonAmount}`}
/>
              )}
            
              <SummaryRow label="Subtotal"  value={`₹${summary.subtotal}`} />
            
<div className="border-t pt-2">
    <SummaryRow
    label="Total GST (18%)"
    value={`₹${summary.gst_amt}`}
    
  /> 
   {summary.paxGST != 0 && (
  <SummaryRow
    label="Total GST (5%)"
    value={`₹${summary.paxGST}`}
    
  />
   )}
</div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5">
                <SummaryRow label="Grand Total"  value={`₹${summary.grand_total}`} highlight />
              </div>
              <SummaryRow label="Security Deposit"value={`₹${summary.securityAmount}`} />
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => toast.success("Proceeding with booking…")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                Proceed
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toast("Opening quotation…")}
                  className="py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Quotation
                </button>
                <button
                  onClick={() => toast.success("Draft saved!")}
                  className="py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Save Draft
                </button>
              </div>

              <button
                onClick={() => toast.error("Booking closed")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 transition-colors text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
