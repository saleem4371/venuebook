"use client";

/* ══════════════════════════════════════════════════════════════════
   CREATE BOOKING WORKSPACE
   Full 5-section booking creation form + pricing summary sidebar.
   Refactored from bookings/new/page.jsx into an internal workspace.
   All sections, fields, and action buttons preserved.
══════════════════════════════════════════════════════════════════ */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  ChevronDown,
  CalendarCheck,
  Building2,
  Package,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Receipt,
  Sparkles,
  Tag,
  Layers,
  ListChecks,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import { usePathname, useRouter, useParams } from "next/navigation";

import {
  InvoiceNOAPI,
  getAvailableVenues,
  load_shift_event,
  Load_all_packages,
  loadAllAddons,
  globalSetting,
  booking_create,
} from "@/services/booking.service";


import { useVendorCategory }    from "@/context/VendorCategoryContext";

/* ── Shared input style ────────────────────────────────────── */
const INPUT_CLS =
  "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "outline-none focus:border-violet-400 dark:focus:border-violet-500 " +
  "focus:ring-2 focus:ring-violet-500/20 transition";

const INPUT_ERROR_CLS =
  "w-full border border-red-400 dark:border-red-500 rounded-xl px-3 py-2.5 text-sm " +
  "bg-red-50/40 dark:bg-red-950/20 text-gray-900 dark:text-gray-100 " +
  "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition";

/* ── Section wrapper ───────────────────────────────────────── */
function Section({ icon: Icon, title, children, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-violet-50 dark:bg-violet-950/40">
            <Icon size={15} className="text-violet-500" aria-hidden="true" />
          </div>
          <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
            {title}
          </h2>
        </div>
        {badge}
      </div>
      {children}
    </motion.div>
  );
}

/* ── Field error message ──────────────────────────────────── */
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle size={12} className="shrink-0" />
      {message}
    </p>
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

/* ── Preview row (for modal) ──────────────────────────────── */
function PreviewItem({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
        {label}
      </span>
      <span
        className={`text-sm text-right text-gray-800 dark:text-gray-200 ${mono ? "font-mono" : "font-medium"}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN WORKSPACE
══════════════════════════════════════════════════════════════ */
export default function CreateBookingWorkspace() {

  const { activeCategory } = useVendorCategory();

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

  const [showPreview, setShowPreview] = useState(false);

  /* ── NEW: form fields + validation + loading states ─────── */
  const [providers, setProviders] = useState({
    caterer: "",
    decorator: "",
    sound: "",
    music: "",
  });
  const [specialRequest, setSpecialRequest] = useState("");
  const [customer, setCustomer] = useState({
    phone: "",
    name: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState(""); // validating | processing | done
  const [pageLoading, setPageLoading] = useState(true);

  const pathname = usePathname();
  const router   = useRouter();
  const params   = useParams();

  const locale  = params?.locale  || "en";
  const country = params?.country || "in";


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
    grand_total: 0,
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

  const [bookingType, setBookingType] = useState("book");
  const [reserveType, setReserveType] = useState(1);

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
    (async () => {
      await load();
      setPageLoading(false);
    })();
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

  const toggleVenue = async (venue) => {
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
      const addonIds = selectedVenues.map((item) => item.child_venue_id);

      const addons = await loadAllAddons(addonIds);
      setAddons(addons.data);
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

  useEffect(() => {
    // =========================
    // FORMAT VENUE SETTINGS
    // =========================
    const formattedVenues = selectedVenues.map((venue) => {
      const settings = (venue.child_setting || []).reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      return {
        ...venue,
        settings,

        securityEnabled: settings.security === "true",

        securityAmount:
          settings.security === "true" ? Number(settings.secAmt || 0) : 0,
      };
    });

    // =========================
    // TOTAL GUESTS
    // =========================
    const totalGuests = formattedVenues.reduce(
      (sum, venue) => sum + Number(venue.guest_rooms || 0),
      0,
    );

    const capacity = Number(guestCapacity) || 0;

    let baseAmount = 0;
    let venueGST = 0;
    let paxGST = 0;

    // =========================
    // VENUE PRICE
    // =========================
    if (selectionType === "venue") {
      baseAmount = formattedVenues.reduce((sum, venue) => {
        return (
          sum +
          Number(
            selectionMode === "single"
              ? venue.per_day_price
              : venue.total_price || venue.per_day_price,
          )
        );
      }, 0);

      venueGST = baseAmount * 0.18;
    }

    // =========================
    // PAX PRICE
    // =========================
    if (selectionType === "pax") {
      baseAmount = capacity * (Number(paxRate) || 0);

      paxGST = baseAmount * 0.05;
    }

    // =========================
    // SECURITY DEPOSIT
    // =========================
    const securityDeposit = formattedVenues.reduce(
      (sum, venue) => sum + venue.securityAmount,
      0,
    );

    console.log(securityDeposit);

    // =========================
    // ADDONS
    // =========================
    const addonSummary = Object.values(selectedAddons).reduce(
      (acc, item) => {
        const qty = Number(item.qty || 0);

        const price = Number(item.addon?.amount ?? item.addon?.price ?? 0);

        acc.totalQty += qty;
        acc.totalAmount += qty * price;

        return acc;
      },
      {
        totalQty: 0,
        totalAmount: 0,
      },
    );

    const totalAddonQty = addonSummary.totalQty;
    const totalAddonAmount = addonSummary.totalAmount;

    const addonGST = totalAddonAmount * 0.18;

    // =========================
    // FINAL
    // =========================
    const subtotal = baseAmount + totalAddonAmount;

    const gst_amt = venueGST + paxGST + addonGST;

    const grand_total = subtotal + gst_amt;

    setSummary({
      // Main
      totalAmount: baseAmount,
      totalGuests,

      // Addons
      totalAddonQty,
      totalAddonAmount,

      // Security
      securityDeposit,

      // Totals
      subtotal,

      // GST
      venueGST,
      paxGST,
      addonGST,
      gst_amt,

      // Final
      grand_total,
    });
  }, [
    selectedVenues,
    guestCapacity,
    selectionType,
    selectionMode,
    paxRate,
    selectedAddons,
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


  const [isDirty, setIsDirty] = useState(false);

const updateField = (key, value) => {
  setBooking(prev => ({
    ...prev,
    [key]: value,
  }));

  setIsDirty(true);
};

  /* ══════════════════════════════════════════════════════════════
     VALIDATION
  ══════════════════════════════════════════════════════════════ */
  const validate = () => {
    const errs = {};

    if (!eventType) errs.eventType = "Please select an event type";

    if (shift.length === 0) errs.shift = "Please select at least one shift";

    if (selectionMode === "single" && !eventDate) {
      errs.eventDate = "Please choose an event date";
    }

    if (
      selectionMode === "multiple" &&
      (!dateRange.startDate || !dateRange.endDate)
    ) {
      errs.dateRange = "Please choose a start and end date";
    }

    if (selectedVenues.length === 0) {
      errs.venues = "Please select at least one venue";
    }

    if (selectionType === "pax" && !guestCapacity) {
      errs.guestCapacity = "Guest capacity is required for pax pricing";
    }

    if (selectionType === "pax") {
      const incompletePackages = packages.filter((pack) => {
        const packageSelection = selectedItems[pack.id] || {};
        const selectedCount = Object.values(packageSelection).reduce(
          (total, items) => total + items.length,
          0,
        );
        const totalAllowed = (pack.categories || []).reduce(
          (total, cat) => total + Number(cat.count || 0),
          0,
        );
        return selectedCount > 0 && selectedCount !== totalAllowed;
      });

      if (incompletePackages.length > 0) {
        errs.packages = `Please complete item selection for: ${incompletePackages.map((p) => p.name).join(", ")}`;
      }

      if (!paxRate) {
        errs.packages = "Please choose a package and select its items";
      }
    }

    if (isInvalidCapacity) {
      errs.guestCapacity = `Maximum required capacity is ${summary.totalGuests}`;
    }

    if (!customer.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(customer.phone.trim())) {
      errs.phone = "Enter a valid 10-digit phone number";
    }

    if (!customer.name.trim()) {
      errs.name = "Customer name is required";
    }

    if (customer.email.trim() && !/^\S+@\S+\.\S+$/.test(customer.email.trim())) {
      errs.email = "Enter a valid email address";
    }

    setErrors(errs);
    return errs;
  };

  const handlePreview = (id) => {

    setReserveType(id)
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the highlighted fields");

      // scroll to first error field if possible
      const firstKey = Object.keys(errs)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setSubmitStage("validating");

    await new Promise((r) => setTimeout(r, 600));
    setSubmitStage("processing");

  

    const payload = {
  invoice_no: invoice,
  booking_type: bookingType,
  event: {
    event_type: eventType,
    selection_mode: selectionMode,
    selection_type: selectionType,
    shift,
    ...(selectionMode === "single"
      ? { event_date: eventDate }
      : { date_range: { start_date: dateRange.startDate, end_date: dateRange.endDate } }),
    guest_capacity: Number(guestCapacity) || 0,
  },
  venues: selectedVenues.map((v) => ({
    child_venue_id: v.child_venue_id,
    child_venue_name: v.child_venue_name,
    shift_name: v.shift_name,
    shift_timing: v.shift_timing,
    price: selectionMode === "single" ? v.per_day_price : (v.total_price || v.per_day_price),
    security_amount: v.securityAmount || 0,
  })),
  pax_packages: packages
    .filter((p) => Object.values(selectedItems[p.id] || {}).some((a) => a.length > 0))
    .map((p) => ({
      package_id: p.id,
      package_name: p.name,
      price_per_pax: p.price,
      selections: (p.categories || [])
        .filter((c) => (selectedItems[p.id]?.[c.id] || []).length > 0)
        .map((c) => ({
          category_id: c.id,
          category_name: c.name,
          item_ids: selectedItems[p.id][c.id],
        })),
    })),
  addons: Object.values(selectedAddons).map((item) => ({
    addon_id: item.addon.id,
    name: item.addon.add_on_name,
    qty: item.qty,
    unit_price: Number(item.addon?.amount ?? item.addon?.price ?? 0),
    amount: item.qty * Number(item.addon?.amount ?? item.addon?.price ?? 0),
  })),
  service_providers: {
    caterer: providers.caterer,
    decorator: providers.decorator,
    sound_system: providers.sound,
    music_troupe: providers.music,
  },
  special_request: specialRequest,
  customer: {
    is_self: selfBook,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
  },
  pricing: {
    base_amount: summary.totalAmount,
    total_guests: summary.totalGuests,
    addon_amount: summary.totalAddonAmount,
    addon_qty: summary.totalAddonQty,
    subtotal: summary.subtotal,
    venue_gst: summary.venueGST,
    pax_gst: summary.paxGST,
    addon_gst: summary.addonGST,
    gst_total: summary.gst_amt,
    grand_total: summary.grand_total,
    security_deposit: summary.securityDeposit,
  },
  category:activeCategory,
  reserveType:reserveType,

};

const param  = JSON.stringify(payload);

await booking_create(payload)


  await new Promise((r) => setTimeout(r, 900));
    setSubmitStage("done");

    await new Promise((r) => setTimeout(r, 700));

    setSubmitting(false);
    setSubmitStage("");
    setShowPreview(false);
    const id =1234567890;

    router.push(`/${locale}/${country}/vendor/reservations/invoice/${id}`)

    toast.success(
      bookingType === "book"
        ? "Booking confirmed successfully!"
        : "Venue reserved successfully!",
    );
  };

 const saveDraft = async () => {
   setReserveType(0)
     const payload = {
  invoice_no: invoice,
  booking_type: bookingType,
  event: {
    event_type: eventType,
    selection_mode: selectionMode,
    selection_type: selectionType,
    shift,
    ...(selectionMode === "single"
      ? { event_date: eventDate }
      : { date_range: { start_date: dateRange.startDate, end_date: dateRange.endDate } }),
    guest_capacity: Number(guestCapacity) || 0,
  },
  venues: selectedVenues.map((v) => ({
    child_venue_id: v.child_venue_id,
    child_venue_name: v.child_venue_name,
    shift_name: v.shift_name,
    shift_timing: v.shift_timing,
    price: selectionMode === "single" ? v.per_day_price : (v.total_price || v.per_day_price),
    security_amount: v.securityAmount || 0,
  })),
  pax_packages: packages
    .filter((p) => Object.values(selectedItems[p.id] || {}).some((a) => a.length > 0))
    .map((p) => ({
      package_id: p.id,
      package_name: p.name,
      price_per_pax: p.price,
      selections: (p.categories || [])
        .filter((c) => (selectedItems[p.id]?.[c.id] || []).length > 0)
        .map((c) => ({
          category_id: c.id,
          category_name: c.name,
          item_ids: selectedItems[p.id][c.id],
        })),
    })),
  addons: Object.values(selectedAddons).map((item) => ({
    addon_id: item.addon.id,
    name: item.addon.add_on_name,
    qty: item.qty,
    unit_price: Number(item.addon?.amount ?? item.addon?.price ?? 0),
    amount: item.qty * Number(item.addon?.amount ?? item.addon?.price ?? 0),
  })),
  service_providers: {
    caterer: providers.caterer,
    decorator: providers.decorator,
    sound_system: providers.sound,
    music_troupe: providers.music,
  },
  special_request: specialRequest,
  customer: {
    is_self: selfBook,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
  },
  pricing: {
    base_amount: summary.totalAmount,
    total_guests: summary.totalGuests,
    addon_amount: summary.totalAddonAmount,
    addon_qty: summary.totalAddonQty,
    subtotal: summary.subtotal,
    venue_gst: summary.venueGST,
    pax_gst: summary.paxGST,
    addon_gst: summary.addonGST,
    gst_total: summary.gst_amt,
    grand_total: summary.grand_total,
    security_deposit: summary.securityDeposit,
  },
  category:activeCategory,
  reserveType:reserveType,

};

await booking_create(payload)
console.log(payload)
   const id = toast.loading("Saving draft...");
   await new Promise((r) => setTimeout(r, 800));
   toast.success("Draft saved", { id });
   setIsDirty(false);
 }



  /* ══════════════════════════════════════════════════════════════
     PAGE LOADING SKELETON
  ══════════════════════════════════════════════════════════════ */
  if (pageLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="pb-1 border-b border-gray-100 dark:border-gray-800">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded-md" />
          <div className="h-3.5 w-72 bg-gray-100 dark:bg-gray-800 rounded-md mt-2" />
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
                  <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded-md" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                  <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-3 h-fit">
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-md" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-3.5 w-full bg-gray-100 dark:bg-gray-800 rounded-md" />
            ))}
            <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
          </div>
        </div>
      </div>
    );
  }

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
          Create  {activeCategory} Booking
        </h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
          Fill event details, add service providers and confirm booking
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ── LEFT — Form sections ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* § 1 · EVENT DETAILS */}

           {/* § 1 · VENUES */}
           { activeCategory =='venues' &&(
             <Section icon={CalendarCheck} title="Event Details">
            {/* Order info strip */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm font-medium shadow-sm">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Order Date: {orderDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Receipt size={14} /> Form ID: {invoice}
              </span>
              <div className="flex items-center gap-2">
                {settingsMap.multiVenue == 1 && (
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
                    className={`inline-flex items-center justify-center gap-1.5
                      h-7 px-3 rounded-full
                      text-xs font-semibold text-white
                      transition-all duration-200
                      ring-1 ring-white/30
                      hover:ring-white/60 hover:bg-white/10
                      ${
                        selectionMode === "single"
                          ? "bg-white/10"
                          : "bg-white/20"
                      }`}
                  >
                    {selectionMode === "single" ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        Single Select
                      </>
                    ) : (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        Multiple Select
                      </>
                    )}
                  </button>
                )}
                {settingsMap.paxPricing == 1 && (
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
                    className={`inline-flex items-center justify-center gap-1.5
                      h-7 px-3 rounded-full
                      text-xs font-semibold text-white
                      transition-all duration-200
                      ring-1 ring-white/30
                      hover:ring-white/60 hover:bg-white/10
                      ${
                        selectionType === "venue"
                          ? "bg-white/10"
                          : "bg-white/20"
                      }`}
                  >
                    {selectionType === "venue" ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        Venue Pricing
                      </>
                    ) : (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        Pax Pricing
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5" data-field="eventDate">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Event Date <span className="text-red-500">*</span>
                </label>

                {selectionMode === "single" ? (
                  <div
                    className={`flex items-center border rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 transition ${
                      errors.eventDate
                        ? "border-red-400 dark:border-red-500"
                        : "border-gray-200 dark:border-gray-700 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20"
                    }`}
                  >
                    <Calendar size={16} className="mr-2 text-gray-400" />

                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={eventDate}
                      onChange={(e) => {
                        setEventDate(e.target.value);
                        setSelectedVenues([]);
                        setErrors((prev) => ({ ...prev, eventDate: undefined }));
                      }}
                      className="w-full outline-none bg-transparent text-sm"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3" data-field="dateRange">
                    {/* From Date */}
                    <div
                      className={`flex items-center border rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 transition ${
                        errors.dateRange
                          ? "border-red-400 dark:border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20"
                      }`}
                    >
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
                          setErrors((prev) => ({ ...prev, dateRange: undefined }));
                        }}
                        className="w-full outline-none bg-transparent text-sm"
                      />
                    </div>

                    {/* To Date */}
                    <div
                      className={`flex items-center border rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 transition ${
                        errors.dateRange
                          ? "border-red-400 dark:border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20"
                      }`}
                    >
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
                          setErrors((prev) => ({ ...prev, dateRange: undefined }));
                        }}
                        disabled={!dateRange.startDate}
                        className="w-full outline-none bg-transparent text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}
                <FieldError message={errors.eventDate || errors.dateRange} />
              </div>

              {/* Event Shift */}
             

             
              <div className="space-y-1.5" data-field="shift"  >
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Event Shift <span className="text-red-500">*</span>
                </label>
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
                          setErrors((prev) => ({ ...prev, shift: undefined }));

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
                        className={`px-4 py-2 rounded-xl text-sm capitalize font-medium transition-all
            ${
              shift.includes(s)
                ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
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
                <FieldError message={errors.shift} />
              </div>

              {/* Event Type */}
              <div className="space-y-1.5" data-field="eventType">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Event Type <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    value={eventType}
                    onChange={(e) => {
                      setEventType(e.target.value);
                      setErrors((prev) => ({ ...prev, eventType: undefined }));
                    }}
                    className={`w-full appearance-none border rounded-xl px-3 py-2.5 pr-10 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none transition ${
                      errors.eventType
                        ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 dark:border-gray-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                    }`}
                  >
                    <option value="">Select Event Type</option>

                    {event.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.event_name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                <FieldError message={errors.eventType} />
              </div>

              {/* Guest Capacity */}
              <div className="space-y-1.5" data-field="guestCapacity">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Guest Capacity
                  {selectionType === "pax" && <span className="text-red-500"> *</span>}
                </label>
                <div
                  className={`flex items-center border rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 transition
  ${
    capacityError || errors.guestCapacity
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
                      setErrors((prev) => ({ ...prev, guestCapacity: undefined }));

                      // 🔥 LIVE VALIDATION
                      if (
                        summary.totalGuests &&
                        capacity > summary.totalGuests
                      ) {
                        setCapacityError(
                          `Maximum required capacity is ${summary.totalGuests}`,
                        );
                      } else {
                        setCapacityError("");
                      }
                    }}
                    placeholder="e.g. 200"
                    className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100"
                  />
                </div>
                <FieldError message={capacityError || errors.guestCapacity} />
              </div>
            </div>

            {/* Child venues picker */}
            <div className="mt-4" data-field="venues">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                  Available Venues <span className="text-red-500">*</span>
                </h3>

                <span className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 px-2 py-1 rounded-full font-medium">
                  {venues.length} Found
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-gray-500">
                  <Loader2 size={20} className="animate-spin text-violet-500" />
                  Searching available venues...
                </div>
              ) : venues.length === 0 ? (
                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-8 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    {shift.length === 0
                      ? "Select a date and shift to see available venues"
                      : "No venue available"}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-4 gap-3">
                  {venues.map((venue) => {
                    const isActive = selectedVenues.some(
                      (v) => v.child_venue_id === venue.child_venue_id,
                    );

                    return (
                      <motion.button
                        key={venue.child_venue_id}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleVenue(venue)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          isActive
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm shadow-violet-500/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:shadow-sm"
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
                                {venue.guest_rooms} guests
                              </p>
                            </div>
                          </div>

                          {/* ✅ active indicator */}
                          {isActive && (
                            <CheckCircle2 className="h-5 w-5 text-violet-500" />
                          )}
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
                      </motion.button>
                    );
                  })}
                </div>
              )}
              <FieldError message={errors.venues} />
            </div>
             </Section>
           )}

            {/* § 1 · Farmstays */}
           { activeCategory =='farmstays' && (
             <Section icon={CalendarCheck} title="Event Details">
               <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5" data-field="eventDate">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3" data-field="dateRange">
                    {/* From Date */}
                    <div
                      className={`flex items-center border rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 transition ${
                        errors.dateRange
                          ? "border-red-400 dark:border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20"
                      }`}
                    >
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
                          setErrors((prev) => ({ ...prev, dateRange: undefined }));
                        }}
                        className="w-full outline-none bg-transparent text-sm"
                      />
                    </div>

                    {/* To Date */}
                    <div
                      className={`flex items-center border rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 transition ${
                        errors.dateRange
                          ? "border-red-400 dark:border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20"
                      }`}
                    >
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
                          setErrors((prev) => ({ ...prev, dateRange: undefined }));
                        }}
                        disabled={!dateRange.startDate}
                        className="w-full outline-none bg-transparent text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5" data-field="guestCapacity">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Guest Capacity
                  {selectionType === "pax" && <span className="text-red-500"> *</span>}
                </label>
                <div
                  className={`flex items-center border rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 transition
  ${
    capacityError || errors.guestCapacity
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
                      setErrors((prev) => ({ ...prev, guestCapacity: undefined }));

                      // 🔥 LIVE VALIDATION
                      if (
                        summary.totalGuests &&
                        capacity > summary.totalGuests
                      ) {
                        setCapacityError(
                          `Maximum required capacity is ${summary.totalGuests}`,
                        );
                      } else {
                        setCapacityError("");
                      }
                    }}
                    placeholder="e.g. 200"
                    className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100"
                  />
                </div>
                <FieldError message={capacityError || errors.guestCapacity} />
              </div>
              <div className="mt-4" data-field="Farmstays">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                  Available Farmstays <span className="text-red-500">*</span>
                </h3>

                <span className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 px-2 py-1 rounded-full font-medium">
                  0 Found
                </span>
              </div>
              </div>
                </div>
             </Section>
           )}

          {selectionType === "pax" && (
            <>
              <Section
                icon={Building2}
                title="PAX Packages"
                badge={
                  paxRate > 0 && (
                    <span className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 px-2 py-1 rounded-full font-medium">
                      ₹{paxRate} / pax selected
                    </span>
                  )
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" data-field="packages">
                  {packages.map((pack) => {
                    // const selectedCount = selectedItems[pack.id]?.length || 0;

                    const packageSelection = selectedItems[pack.id] || {};

                    // Total selected items
                    const selectedCount = Object.values(
                      packageSelection,
                    ).reduce((total, items) => total + items.length, 0);

                    // Total allowed selections across all categories
                    const totalAllowed = (pack.categories || []).reduce(
                      (total, cat) => total + Number(cat.count || 0),
                      0,
                    );

                    const progress =
                      totalAllowed > 0
                        ? Math.min(100, (selectedCount / totalAllowed) * 100)
                        : 0;

                    const isComplete =
                      selectedCount === totalAllowed && totalAllowed > 0;

                    const isActive = selectedCount > 0;

                    return (
                      <motion.button
                        key={pack.id}
                        type="button"
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActivePackage(pack);
                          setOpenModal(true);
                        }}
                        className={`relative text-left rounded-2xl border overflow-hidden transition-all duration-200 group ${
                          isActive
                            ? "border-violet-400 shadow-lg shadow-violet-500/15 ring-1 ring-violet-200 dark:ring-violet-800"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-violet-300 hover:shadow-md"
                        }`}
                      >
                        {/* Top gradient banner */}
                        <div
                          className={`h-14 w-full relative overflow-hidden ${
                            isComplete
                              ? "bg-gradient-to-r from-emerald-500 to-green-500"
                              : isActive
                                ? "bg-gradient-to-r from-violet-600 to-indigo-600"
                                : "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/60"
                          }`}
                        >
                          <div className="absolute inset-0 flex items-center justify-between px-4">
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wider ${
                                isActive ? "text-white/90" : "text-gray-400"
                              }`}
                            >
                              Package
                            </span>
                            {isComplete ? (
                              <CheckCircle2 size={18} className="text-white" />
                            ) : isActive ? (
                              <span className="text-[11px] font-semibold text-white/90">
                                {Math.round(progress)}%
                              </span>
                            ) : (
                              <Tag size={16} className="text-gray-300" />
                            )}
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="font-bold text-base text-gray-900 dark:text-white">
                            {pack.name}
                          </h3>

                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-violet-600">
                              ₹{pack.price}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              / pax
                            </span>
                          </div>

                          <div className="mt-4 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1.5 text-gray-500">
                                <Layers size={12} />
                                Categories
                              </span>
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {pack.categories?.length || 0}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1.5 text-gray-500">
                                <ListChecks size={12} />
                                Items Included
                              </span>
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {totalAllowed}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-gray-500">Selected</span>
                              <span
                                className={`font-bold ${
                                  isComplete
                                    ? "text-emerald-600"
                                    : isActive
                                      ? "text-violet-600"
                                      : "text-gray-400"
                                }`}
                              >
                                {selectedCount} / {totalAllowed}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  isComplete
                                    ? "bg-gradient-to-r from-emerald-500 to-green-500"
                                    : "bg-gradient-to-r from-violet-500 to-indigo-500"
                                }`}
                              />
                            </div>
                          </div>

                          <div
                            className={`mt-4 w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                              isComplete
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                                : isActive
                                  ? "bg-violet-600 text-white group-hover:bg-violet-700"
                                  : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 group-hover:bg-violet-50 group-hover:text-violet-600 dark:group-hover:bg-violet-900/20"
                            }`}
                          >
                            {isComplete
                              ? "Completed ✓"
                              : isActive
                                ? "Edit Selection"
                                : "Choose Items"}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                <FieldError message={errors.packages} />
              </Section>


              <AnimatePresence>
              {openModal && activePackage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="bg-white dark:bg-gray-900 w-[900px] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                  >
                    {/* Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white flex justify-between items-center">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/70 font-medium">
                          Package · ₹{activePackage.price} / pax
                        </p>
                        <h2 className="text-lg font-bold mt-0.5">
                          {activePackage.name}
                        </h2>
                      </div>

                      <button
                        onClick={() => setOpenModal(false)}
                        className="h-8 w-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Categories */}
                    <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                      {activePackage.categories.map((category) => {
                        const selected =
                          selectedItems[activePackage.id]?.[category.id] || [];

                        const catComplete = selected.length === category.count;

                        return (
                          <div
                            key={category.id}
                            className="border border-gray-100 dark:border-gray-800 rounded-xl p-5"
                          >
                            <div className="flex justify-between mb-4">
                              <div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                                  {category.name}
                                </h3>

                                <p className="text-xs text-gray-500 mt-0.5">
                                  Select {category.count} item{category.count > 1 ? "s" : ""}
                                </p>
                              </div>

                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full self-start ${
                                  catComplete
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                                }`}
                              >
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
                                            (id) => id !== item.id,
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

                                      setPaxRate(activePackage.price);
                                    }}
                                    className={`relative border rounded-xl p-3 text-left transition-all ${
                                      checked
                                        ? "border-violet-400 bg-violet-50 dark:bg-violet-900/20 shadow-sm shadow-violet-500/10"
                                        : "border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:shadow-sm"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start gap-2">
                                      <div>
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                          {item.name}
                                        </h4>

                                        <p className="text-xs text-gray-500 mt-0.5">
                                          ₹{item.price}
                                        </p>
                                      </div>

                                      {checked && (
                                        <CheckCircle2
                                          size={16}
                                          className="text-violet-600 shrink-0"
                                        />
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
                    <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center bg-gray-50/60 dark:bg-gray-950/40">
                      <p className="text-xs text-gray-500">
                        {(() => {
                          const sel = selectedItems[activePackage.id] || {};
                          const count = Object.values(sel).reduce(
                            (t, i) => t + i.length,
                            0,
                          );
                          const total = (activePackage.categories || []).reduce(
                            (t, c) => t + Number(c.count || 0),
                            0,
                          );
                          return `${count} of ${total} items selected`;
                        })()}
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setOpenModal(false)}
                          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={() => setOpenModal(false)}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:opacity-90 transition"
                        >
                          Save Selection
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              </AnimatePresence>
            </>
          )}

          {/* § 2 · SERVICE PROVIDER DETAILS */}

          { activeCategory =='venues' &&(
          <Section icon={Building2} title="Service Provider Details">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className={INPUT_CLS}
                placeholder="Name of the Caterer"
                value={providers.caterer}
                onChange={(e) => {
                  setProviders((p) => ({ ...p, caterer: e.target.value }));
                  setIsDirty(true);
                }}
              />
              <input
                className={INPUT_CLS}
                placeholder="Name of the Decorator"
                value={providers.decorator}
                onChange={(e) => {
                  setProviders((p) => ({ ...p, decorator: e.target.value }));
                  setIsDirty(true);
                }}
              />
              <input
                className={INPUT_CLS}
                placeholder="Name of Sound system person"
                value={providers.sound}
                onChange={(e) => {
                  setProviders((p) => ({ ...p, sound: e.target.value }));
                  setIsDirty(true);
                }}
              />
              <input
                className={INPUT_CLS}
                placeholder="Name of Music/Dance troupe"
                value={providers.music}
                onChange={(e) => {
                  setProviders((p) => ({ ...p, music: e.target.value }));
                  setIsDirty(true);
                }}
              />
            </div>
          </Section>
           )}

          {/* § 3 · ADD-ONS */}
          <Section
            icon={Package}
            title="Add-Ons"
            badge={
              summary.totalAddonQty > 0 && (
                <span className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 px-2 py-1 rounded-full font-medium">
                  {summary.totalAddonQty} selected
                </span>
              )
            }
          >
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
                      className={`group rounded-2xl border bg-white dark:bg-gray-900 overflow-hidden transition-all ${
                        isSelected
                          ? "border-violet-400 shadow-md shadow-violet-500/10"
                          : "border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-violet-400"
                      }`}
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
                className={`relative rounded-xl p-5 border-2 text-left transition-all ${
                  bookingType === "book"
                    ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20 shadow-sm shadow-violet-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-violet-200"
                }`}
              >
                {bookingType === "book" && (
                  <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-violet-600" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Confirm Booking
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Customer pays and booking is confirmed.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBookingType("reserve")}
                className={`relative rounded-xl p-5 border-2 text-left transition-all ${
                  bookingType === "reserve"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10 shadow-sm shadow-amber-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-amber-200"
                }`}
              >
                {bookingType === "reserve" && (
                  <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-amber-500" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Reserve
                </h3>
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
              value={specialRequest}
              onChange={(e) => {
                setSpecialRequest(e.target.value);
                setIsDirty(true);
              }}
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
              <div data-field="phone">
                <div
                  className={`flex items-center rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 border transition ${
                    errors.phone
                      ? "border-red-400 dark:border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20"
                  }`}
                >
                  <Phone size={15} className="text-gray-400 me-2 shrink-0" />
                  <input
                    className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    placeholder="Phone Number"
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => {
                      setCustomer((c) => ({ ...c, phone: e.target.value }));
                      setErrors((prev) => ({ ...prev, phone: undefined }));
                      setIsDirty(true);
                    }}
                  />
                </div>
                <FieldError message={errors.phone} />
              </div>

              <div data-field="name">
                <div
                  className={`flex items-center rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 border transition ${
                    errors.name
                      ? "border-red-400 dark:border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20"
                  }`}
                >
                  <User size={15} className="text-gray-400 me-2 shrink-0" />
                  <input
                    className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    placeholder="Name"
                    type="text"
                    value={customer.name}
                    onChange={(e) => {
                      setCustomer((c) => ({ ...c, name: e.target.value }));
                      setErrors((prev) => ({ ...prev, name: undefined }));
                      setIsDirty(true);
                    }}
                  />
                </div>
                <FieldError message={errors.name} />
              </div>

              <div data-field="email">
                <div
                  className={`flex items-center rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 border transition ${
                    errors.email
                      ? "border-red-400 dark:border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20"
                  }`}
                >
                  <Mail size={15} className="text-gray-400 me-2 shrink-0" />
                  <input
                    className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    placeholder="Email"
                    type="email"
                    value={customer.email}
                    onChange={(e) => {
                      setCustomer((c) => ({ ...c, email: e.target.value }));
                      setErrors((prev) => ({ ...prev, email: undefined }));
                      setIsDirty(true);
                    }}
                  />
                </div>
                <FieldError message={errors.email} />
              </div>
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

              <SummaryRow label="Subtotal" value={`₹${summary.subtotal}`} />

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
                <SummaryRow
                  label="Grand Total"
                  value={`₹${summary.grand_total}`}
                  highlight
                />
              </div>
              <SummaryRow
                label="Security Deposit"
                value={`₹${summary.securityDeposit}`}
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => handlePreview(1)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-600/20 hover:opacity-90 hover:shadow-md transition-all"
              >
                Preview Booking
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePreview(2)}
                  className="py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Quotation
                </button>
                <button
                  disabled={!isDirty}
                  onClick={saveDraft}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isDirty
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  }`}
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

      {/* ══════════════════════════════════════════════════════════
          PREVIEW BOOKING MODAL
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setShowPreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/70 font-medium">
                    Form ID #{invoice}
                  </p>
                  <h2 className="text-lg font-bold mt-0.5">Booking Preview</h2>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  disabled={submitting}
                  className="h-8 w-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 overflow-y-auto space-y-6">
                {/* Booking type pill */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                      bookingType === "book"
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}
                  >
                    {bookingType === "book" ? (
                      <>
                        <CheckCircle2 size={13} /> Confirm Booking
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={13} /> Reserve
                      </>
                    )}
                  </span>
                  <span className="text-xs text-gray-400">{orderDate}</span>
                </div>

                {/* Event Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <CalendarCheck size={14} className="text-violet-500" />
                    Event Details
                  </h3>
                  <div className="rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-1">
                    <PreviewItem label="Event Type" value={eventType} />
                    <PreviewItem
                      label="Date"
                      value={
                        selectionMode === "single"
                          ? eventDate
                          : `${dateRange.startDate} → ${dateRange.endDate}`
                      }
                    />
                    <PreviewItem
                      label="Shift"
                      value={shift.map((s) => s[0].toUpperCase() + s.slice(1)).join(", ")}
                    />
                    <PreviewItem
                      label="Guest Capacity"
                      value={guestCapacity ? `${guestCapacity} guests` : "—"}
                    />
                  </div>
                </div>

                {/* Venues */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Building2 size={14} className="text-violet-500" />
                    Selected Venue{selectedVenues.length > 1 ? "s" : ""}
                  </h3>
                  <div className="space-y-2">
                    {selectedVenues.map((v) => (
                      <div
                        key={v.child_venue_id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-2.5"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            {v.child_venue_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {v.shift_name} · {v.shift_timing}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-violet-600">
                          ₹
                          {selectionMode === "single"
                            ? v.per_day_price
                            : v.total_price || v.per_day_price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PAX Package Details */}
                {selectionType === "pax" && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <Layers size={14} className="text-violet-500" />
                      Package Details
                    </h3>
                    <div className="space-y-3">
                      {packages
                        .filter((pack) => {
                          const sel = selectedItems[pack.id] || {};
                          return Object.values(sel).some((arr) => arr.length > 0);
                        })
                        .map((pack) => {
                          const sel = selectedItems[pack.id] || {};
                          return (
                            <div
                              key={pack.id}
                              className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                            >
                              <div className="flex items-center justify-between px-4 py-2.5 bg-violet-50 dark:bg-violet-900/20">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                  {pack.name}
                                </p>
                                <p className="text-sm font-bold text-violet-600">
                                  ₹{pack.price} / pax
                                </p>
                              </div>
                              <div className="px-4 py-1">
                                {(pack.categories || []).map((cat) => {
                                  const ids = sel[cat.id] || [];
                                  if (ids.length === 0) return null;
                                  const names = (cat.items || [])
                                    .filter((it) => ids.includes(it.id))
                                    .map((it) => it.name)
                                    .join(", ");
                                  return (
                                    <PreviewItem
                                      key={cat.id}
                                      label={cat.name}
                                      value={names}
                                    />
                                  );
                                })}
                              </div>
                              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/40">
                                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <Wallet size={12} />
                                  Pax Cost ({guestCapacity || 0} × ₹{pack.price})
                                </span>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                  ₹{Number(guestCapacity || 0) * Number(pack.price || 0)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Add-ons */}
                {summary.totalAddonQty > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <Package size={14} className="text-violet-500" />
                      Add-Ons
                    </h3>
                    <div className="rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-1">
                      {Object.values(selectedAddons).map((item, idx) => (
                        <PreviewItem
                          key={idx}
                          label={`${item.addon?.add_on_name} × ${item.qty}`}
                          value={`₹${Number(item.addon?.amount ?? item.addon?.price ?? 0) * item.qty}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Providers */}
                {Object.values(providers).some((v) => v.trim()) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <Sparkles size={14} className="text-violet-500" />
                      Service Providers
                    </h3>
                    <div className="rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-1">
                      {providers.caterer && <PreviewItem label="Caterer" value={providers.caterer} />}
                      {providers.decorator && <PreviewItem label="Decorator" value={providers.decorator} />}
                      {providers.sound && <PreviewItem label="Sound System" value={providers.sound} />}
                      {providers.music && <PreviewItem label="Music / Dance Troupe" value={providers.music} />}
                    </div>
                  </div>
                )}

                {/* Special Request */}
                {specialRequest.trim() && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <FileText size={14} className="text-violet-500" />
                      Special Request
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3">
                      {specialRequest}
                    </p>
                  </div>
                )}

                {/* Customer Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Users size={14} className="text-violet-500" />
                    Customer Details
                  </h3>
                  <div className="rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-1">
                    <PreviewItem label="Name" value={customer.name} />
                    <PreviewItem label="Phone" value={customer.phone} mono />
                    <PreviewItem label="Email" value={customer.email} />
                    <PreviewItem
                      label="Booking For"
                      value={selfBook ? "Self" : "Someone else"}
                    />
                  </div>
                </div>

                {/* Pricing Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Receipt size={14} className="text-violet-500" />
                    Pricing Summary
                  </h3>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 px-4 py-3 space-y-2">
                    <SummaryRow label="Base Price" value={`₹${summary.totalAmount}`} />
                    {summary.totalAddonQty != 0 && (
                      <SummaryRow
                        label={`Add-ons (${summary.totalAddonQty})`}
                        value={`₹${summary.totalAddonAmount}`}
                      />
                    )}
                    <SummaryRow label="Subtotal" value={`₹${summary.subtotal}`} />
                    <SummaryRow label="GST" value={`₹${summary.gst_amt}`} />
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <SummaryRow
                        label="Grand Total"
                        value={`₹${summary.grand_total}`}
                        highlight
                      />
                    </div>
                    {summary.securityDeposit > 0 && (
                      <SummaryRow
                        label="Security Deposit"
                        value={`₹${summary.securityDeposit}`}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between gap-3 bg-gray-50/60 dark:bg-gray-950/40">
                <button
                  onClick={() => setShowPreview(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Edit Details
                </button>

                <button
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                  className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all min-w-[180px] flex items-center justify-center gap-2 ${
                    bookingType === "book"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600"
                      : "bg-gradient-to-r from-amber-500 to-orange-500"
                  } ${submitting ? "opacity-90 cursor-wait" : "hover:opacity-90 hover:shadow-md"}`}
                >
                  <AnimatePresence mode="wait">
                    {submitting ? (
                      <motion.span
                        key={submitStage}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2"
                      >
                        {submitStage === "done" ? (
                          <>
                            <CheckCircle2 size={16} />
                            Done!
                          </>
                        ) : (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            {submitStage === "validating"
                              ? "Validating..."
                              : "Processing..."}
                          </>
                        )}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                      >
                        {bookingType === "book" ? "Confirm & Book" : "Confirm Reserve"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}