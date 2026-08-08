"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange, PackageSearch, ArrowLeft } from "lucide-react";

import { useCurrency } from "@/hooks/useCurrency";
import { SectionCard, SectionHeading, EmptyState, StatusBadge } from "../shared/ui";
import { BookingDetailModal, STATUS_TONE } from "../shared/BookingDetailModal";
import { BookingCard } from "../shared/BookingCard";
import { ManageBookingView } from "../shared/ManageBookingView";
import { PAX_DEFAULT_STATUS, PAX_STATUS_TONE, paxStatusKey } from "../shared/PaxBookingView";
import BookingTabs, { filterBookingsByTab } from "../shared/BookingTabs";
import { CATEGORY_COLORS } from "../../data/mockProfileData";
import { useToast } from "@/components/ToastProvider";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

import {
  editBookingRequest,
} from "@/services/payment.service";

// Urgency tiers for the "days to go" badge. Anything today/tomorrow is
// treated as urgent (blinking), this week is a soft pulse, and everything
// beyond that is a calm, static badge — the animation is a signal, not
// decoration, so it only fires when it means something.
function getUrgency(daysLeft) {
  if (daysLeft <= 1) return "urgent";
  if (daysLeft <= 7) return "soon";
  return "standard";
}

const URGENCY_STYLES = {
  urgent: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  soon: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  standard: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
};

function DaysLeftBadge({ daysLeft, label, className = "" }) {
  const urgency = getUrgency(daysLeft);

  return (
    <span
      className={`relative inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${URGENCY_STYLES[urgency]} ${className}`}
    >
      {urgency !== "standard" && (
        <motion.span
          className={`w-1.5 h-1.5 rounded-full ${urgency === "urgent" ? "bg-red-500" : "bg-amber-500"}`}
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{
            duration: urgency === "urgent" ? 0.9 : 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      {label}
    </span>
  );
}
function mapApiBookingToCard(b) {
  const totalAmount = Number(b.total_amount || 0);
  const totalPaid = Number(b.totalPaid || 0);

  return {
    id: b.id,
    bookingId: b.bookingId,
    eventDateId: b.eventDateId,
    childVenueId: b.childVenueId,
    bookingType: b.bookingType,
    estimated_total: b.estimated_total,
    paxPackages: b.paxPackages,

    propertyName: b.propertyName || b.venue_name_snapshot,

    image: b.image
      ? `${IMAGE_BASE_URL}/${b.image}`
      : "/images/placeholder.jpg",

    date: b.eventDate,
    event_date: b.eventDate,

    guests: Number(b.guests || 0),

    bookingStatus: b.bookingStatus || b.status || "confirmed",

    paymentStatus:
      (b.bookingStatus || b.status) === "cancelled"
        ? "-"
        : totalPaid >= totalAmount
        ? "paid"
        : "pending",

    category: b.name || "venues",

    amount: totalPaid,
    total_amount: b.total_amount,
    totalPaid,

    venueCity: b.venue_city,
    venueState: b.venue_state,

    shiftName: b.shift_name,
    startTime: b.start_time,
    endTime: b.end_time,

    daysLeft: b.daysLeft,

    coverImage: b.coverImage,

    child_venue_name: b.child_venue_name,
    venue_name_snapshot: b.venue_name_snapshot,

    address: b.address,
    vendor_id: b.vendor_id,

    paymentHistory:
      typeof b.paymentHistory === "string"
        ? JSON.parse(b.paymentHistory || "[]")
        : b.paymentHistory || [],

    _raw: b,
  };
}

// A single booking (bookingId) can legitimately have multiple rows if it
// spans multiple event dates — bookingId alone is NOT a unique key in
// that case, only bookingId+eventDateId is. This also collapses true
// accidental duplicates (e.g. a double-fetch) since those share both ids.
function uniqueKey(b) {
  return `${b.bookingId}-${b.eventDateId ?? b.date ?? b.event_date ?? ""}`;
}

function dedupeByKey(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const k = uniqueKey(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

// useSearchParams (used below to keep the Manage/Invoice view in the URL)
// requires a Suspense boundary at the point of use — wrapping it here means
// every existing caller of BookingsPanel gets that for free.
export default function BookingsPanel(props) {
  return (
    <Suspense fallback={null}>
      <BookingsPanelInner {...props} />
    </Suspense>
  );
}

function BookingsPanelInner({
  compact = false,
  flat = false,
  embedded = false,
  fullScreen = false,
  onBack,
  bookingUpcoming = [],
  allBookingData = [],

}) {
  const t = useTranslations("profile.bookings");
  const tCat = useTranslations("card.badge");
  const { locale, country } = useParams();
  const { format } = useCurrency();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

   const toast = useToast();

  const [modal, setModal] = useState(null);
  const [manageBooking, setManageBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Real bookings from the API, mapped onto BookingCard's expected shape,
  // deduped, newest first — replaces MOCK_BOOKINGS.
  const allBookings = useMemo(
    () =>
      dedupeByKey([...allBookingData].map(mapApiBookingToCard)).sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
    [allBookingData],
  );
  const bookings = useMemo(() => filterBookingsByTab(allBookings, activeTab), [allBookings, activeTab]);


  function openManage(b) {
    const params = new URLSearchParams(searchParams);
    params.set("view", "manage");
    params.set("booking", uniqueKey(b));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function openDetailModal(b, mode) {
    const params = new URLSearchParams(searchParams);
    params.set("view", mode);
    params.set("booking", uniqueKey(b));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function closeManage() {
    router.back();
  }

  const handleBookingPatch = useCallback((patch) => {
    setManageBooking((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  function closeDetailModal() {
    router.back();
  }

  useEffect(() => {
    const view = searchParams.get("view");
    const key = searchParams.get("booking");

    if (!view || !key) {
      setManageBooking(null);
      setModal(null);
      return;
    }

    if (allBookings.length === 0) return; // not loaded yet — effect reruns once it is

    const found = allBookings.find((b) => uniqueKey(b) === key);
    if (!found) return;

    if (view === "manage") {
      setManageBooking((prev) =>
        prev && uniqueKey(prev) === key
          ? prev
          : found.bookingStatus === "pax"
            ? { ...found, paxStatus: PAX_DEFAULT_STATUS }
            : found,
      );
      setModal(null);
    } else {
      setModal((prev) =>
        prev && prev.mode === view && uniqueKey(prev.booking) === key ? prev : { booking: found, mode: view },
      );
      setManageBooking(null);
    }
  }, [searchParams, allBookings]);

  // Real upcoming bookings from the API, deduped, closest first.
  const upcoming = useMemo(
    () =>
      dedupeByKey(bookingUpcoming).sort(
        (a, b) => new Date(a.event_date) - new Date(b.event_date),
      ),
    [bookingUpcoming],
  );

  const [editMessage, setEditMessage] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const onBookingRequest = async (playload) => {
    try {
      //setEditLoading(true);
  
  
      const res = await editBookingRequest(playload);
  
      toast.success("Your Message has been sent successfully.");


      return res.data.conversationId
  
      setEditMessage("");
     // setShowEditModal(false); // if using a modal
  
      // Optional: refresh booking details
      // await getBookingDetails();
  
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to send edit request."
      );
    } finally {
      //setEditLoading(false);
    }
  };

  if (compact) {
    const preview = upcoming.slice(0, 2);
    return (
      <SectionCard flat={flat}>
        <SectionHeading
          compact
          title={t("title")}
          icon={
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-900/30">
              <CalendarRange size={12} className="text-violet-600" />
            </span>
          }
        />
        {preview.length === 0 ? (
          <EmptyState
            icon={<PackageSearch size={18} className="text-violet-600" />}
            title={t("empty.byTab.all.title")}
            subtitle={t("empty.byTab.all.subtitle")}
            ctaLabel={t("empty.cta")}
            ctaHref={`/${locale}/${country}/search/venues`}
            compact
          />
        ) : (
          <div className="space-y-2">
            {preview.map((b) => {
              const venueName = b.child_venue_name || b.venue_name_snapshot;
              const imageUrl = b.coverImage
                ? `${IMAGE_BASE_URL}/${b.coverImage}`
                : "/images/placeholder.jpg";
              const dateLabel = b.event_date
                ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
                    new Date(b.event_date),
                  )
                : "";
              const daysToGoLabel =
                b.daysLeft <= 0 ? "Today" : b.daysLeft === 1 ? "Tomorrow" : `In ${b.daysLeft} days`;
              return (
                <div key={uniqueKey(b)} className="flex items-center gap-2.5">
                  <img src={imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-semibold text-gray-900 dark:text-gray-50 truncate">
                      {venueName}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{dateLabel}</p>
                  </div>
                  <DaysLeftBadge daysLeft={b.daysLeft} label={daysToGoLabel} />
                </div>
              );
            })}
            {upcoming.length > preview.length && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center pt-1">
                +{upcoming.length - preview.length} more
              </p>
            )}
          </div>
        )}
      </SectionCard>
    );
  }

  const content = (
    <>
      {manageBooking ? (
        <div className="p-4 pb-0 flex items-center gap-3">
          <button
            type="button"
            onClick={closeManage}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: CATEGORY_COLORS[manageBooking.category] || CATEGORY_COLORS.venues }}
            >
              {t("manage")}
            </p>
            <h3 className="text-[14.5px] font-semibold text-gray-900 dark:text-gray-50 truncate">
              {manageBooking.propertyName}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{manageBooking.bookingId}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <StatusBadge
              label={t(`status.${manageBooking.bookingStatus}`)}
              tone={STATUS_TONE[manageBooking.bookingStatus]}
            />
            {/* Finer-grained negotiation status for pax/group enquiries —
                bubbled up from PaxBookingView via onBookingPatch below so it
                sits on the same line as the outer status badge instead of
                floating inside that view's own content. */}
            {manageBooking.bookingStatus === "pax" && manageBooking.paxStatus && (
              <StatusBadge
                label={t(`paxManagement.statusLabel.${paxStatusKey(manageBooking.paxStatus)}`)}
                tone={PAX_STATUS_TONE[manageBooking.paxStatus]}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 pb-0">
          {fullScreen ? (
            <div className="flex items-center gap-2 mb-3.5">
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 -ml-1.5 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-[16px] font-semibold text-gray-900 dark:text-gray-50">{t("title")}</h2>
            </div>
          ) : (
            <SectionHeading
              title={t("title")}
              subtitle={t("subtitle")}
              icon={
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-900/30">
                  <CalendarRange size={14} className="text-violet-600" />
                </span>
              }
            />
          )}
          <BookingTabs active={activeTab} onChange={setActiveTab} t={t} compact />
        </div>
      )}

      {manageBooking ? (
        <div className={embedded ? "px-4 pb-4 pt-3" : "flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-3"}>
          <ManageBookingView
            booking={manageBooking}
            allBookingData={allBookingData}
            t={t}
            tCat={tCat}
            format={format}
            locale={locale}
            country={country}
            onInvoice={() => openDetailModal(manageBooking, "invoice")}
            onBack={closeManage}
            onBookingPatch={handleBookingPatch}
            editBookingRequest = {onBookingRequest}
          />
        </div>
      ) : bookings.length === 0 ? (
        <div className={embedded ? "px-4 pb-4 pt-3" : "flex-1 min-h-0 flex flex-col px-4 pb-4 pt-3"}>
          <EmptyState
            icon={<PackageSearch size={20} className="text-violet-600" />}
            title={t(`empty.byTab.${activeTab}.title`)}
            subtitle={t(`empty.byTab.${activeTab}.subtitle`)}
            ctaLabel={t("empty.cta")}
            ctaHref={`/${locale}/${country}/search/venues`}
            fill={!embedded}
          />
        </div>
      ) : (
        <div className={embedded ? "px-4 pb-4 pt-3 space-y-3" : "flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-3 space-y-3"}>
          {bookings.map((b) => (
            <BookingCard
              key={uniqueKey(b)}
              booking={b}
              t={t}
              tCat={tCat}
              format={format}
              locale={locale}
              country={country}
              onOpen={(mode) => (mode === "manage" ? openManage(b) : openDetailModal(b, mode))}
               editBookingRequest = {onBookingRequest}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <BookingDetailModal
            booking={modal.booking}
            mode={modal.mode}
            t={t}
            tCat={tCat}
            format={format}
            locale={locale}
            country={country}
            onClose={closeDetailModal}
          />
        )}
      </AnimatePresence>
    </>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[200] bg-white dark:bg-gray-950 flex flex-col">
        {content}
      </div>
    );
  }

  return (
    <SectionCard
      flat={flat}
      className={embedded ? "flex flex-col" : "flex flex-col min-h-0 flex-1"}
      padded={false}
    >
      {content}
    </SectionCard>
  );
}