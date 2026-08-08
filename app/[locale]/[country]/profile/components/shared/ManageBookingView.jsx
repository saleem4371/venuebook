"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/ManageBookingView.jsx
 *
 * The full "Manage Booking" experience behind a booking card's Manage
 * Button — adapted from a reference Vue implementation (manage_booking.vue)
 * into this app's own React/Tailwind component set, rendered as an in-place
 * view swap inside BookingsPanel.jsx's center column (see that file's
 * header comment) rather than a modal or a real Next.js route.
 *
 * One adaptive component for BOTH venues and farmstays — same pattern
 * InvoiceDocument.jsx already uses — branching on `isFarmstay`/
 * `isStayBased` for wording and which date fields show (a venue's single
 * event date + shift vs. a farmstay's check-in/check-out), not two
 * duplicated files.
 *
 * SCOPE DECISIONS (vs. the Vue reference):
 *   - The reference's booking_type 1/2 (a confirmed Booking vs. a payable
 *     "Reservation" hold that can "Convert to Booking") has no equivalent
 *     in this app's mock data yet, so every booking here is treated as a
 *     confirmed booking — no "Convert to Booking" button exists. Payment
 *     tab / remaining-balance / Pay Now only ever show when the booking's
 *     own `paymentStatus` is already "partial".
 *   - Money/history fields (`total_amount`, `amount`, `paymentHistory`,
 *     `daysLeft`) are read straight off the booking prop when present,
 *     falling back to `computeBookingTotals()` (the same figure the
 *     Invoice tab shows) so a booking that hasn't been given these fields
 *     yet still renders correctly.
 *   - Payment history, payment status, and booking status all live as a
 *     LOCAL `bookingState` mirror of the booking prop — "paying" or
 *     "cancelling" here updates this view (and, via `onBookingPatch`, the
 *     parent's header status badge) but doesn't mutate MOCK_BOOKINGS
 *     itself, consistent with the rest of this mock-data feature (no real
 *     backend endpoint exists for any of this yet — Invoice's PDF download
 *     is still the only real network call anywhere in Bookings).
 *   - No real payment gateway / cashfree / vendor chat endpoint — the "Pay
 *     Now" flow below is a fully mocked 3-step experience (choose amount →
 *     simulated gateway → success) with a short delay + toast, same
 *     honesty pattern PasswordCard.jsx already uses for its own
 *     "not connected yet" toast.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Users,
  MapPin,
  User as UserIcon,
  Mail,
  Phone,
  X,
  Clock,
  AlertCircle,
  AlertTriangle,
  FileText,
  Download,
  LifeBuoy,
  HelpCircle,
  Check,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { GhostButton, PrimaryButton, SecondaryButton, StatusBadge } from "./ui";
import { computeBookingTotals } from "../../data/bookingMath";
import { MOCK_CANCELLATION_TIERS, CATEGORY_COLORS } from "../../data/mockProfileData";
import dayjs from "dayjs";
import { PaxBookingView } from "./PaxBookingView";
import {
  createOrder,
  verifyPayment,
  onlinepayment,
  cancelBooking,
  // editBookingRequest,
} from "@/services/payment.service";

import Script from "next/script";

const STAY_BASED_CATEGORIES = new Set(["farmstays", "rentals"]);
const MIN_REASON_LENGTH = 100;

// Sequence of status lines shown while the mocked gateway "processes" —
// same 3-beat cadence real gateways use (connect → verify → confirm), each
// crossfaded in PaymentModal's gateway step.
const GATEWAY_STEPS = [
  "manageView.payment.gatewayConnecting",
  "manageView.payment.gatewayVerifying",
  "manageView.payment.gatewayProcessing",
];
const GATEWAY_STEP_DURATION_MS = 800;

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric" }).format(date);

export const formatLongDate = (date) => {
  return dayjs(date).format("DD MMMM YYYY");
};

const TAB_KEYS = ["overview", "edit", "payment", "cancel"];

export function ManageBookingView({ booking: b, t, tCat, format, locale, country, onInvoice, onBack, onBookingPatch, allBookingData , editBookingRequest}) {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  console.log(b.bookingStatus ==='pax')

  const isStayBased = STAY_BASED_CATEGORIES.has(b.category);
  const isFarmstay = b.category === "farmstays";
  const categoryLabel = tCat(b.category.replace(/s$/, ""));
  // Same CATEGORY_COLORS map BookingCard.jsx already uses for its photo
  // badge — reused here (not a second palette) so this booking's accent
  // color matches what the customer already saw on its card. Falls back to
  // the venues color (violet, the app's existing default brand accent) for
  // any category not in the map.
  const categoryColor = CATEGORY_COLORS[b.category] || CATEGORY_COLORS.venues;

    // "pax" bookings are multi-package inquiries that haven't settled on a
 // single package yet, so they get their own page instead of the
  // Overview/Edit/Payment/Cancel tabs below.
  if (b.bookingStatus === "pax") {
    return (
      <PaxBookingView
        booking={b}
        t={t}
        format={format}
        locale={locale}
        country={country}
        categoryColor={categoryColor}
        onBack={onBack}
        onBookingPatch={onBookingPatch}
      />
    );
  }

  const eventDate = new Date(b.date);
  const invoiceDateObj = new Date(eventDate);
  invoiceDateObj.setDate(invoiceDateObj.getDate() - 5);
  const checkOutObj = new Date(eventDate);
  checkOutObj.setDate(checkOutObj.getDate() + (b.nights || 1));

  const totals = useMemo(() => computeBookingTotals(b), [b]);
  const { totalAmountPaid } = totals;

  const diffDays = Math.max(0, Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  // ── Single source of truth for money + status shown across all tabs ────
  // Reads real fields off the booking when present, otherwise derives the
  // same numbers the Invoice tab already computes, so this works whether
  // or not the mock booking object has been given these fields yet.
  const [bookingState, setBookingState] = useState(() => {
    const seedAmountPaid = b.paymentStatus === "partial" ? totalAmountPaid / 2 : totalAmountPaid;
    return {
      total_amount: b.total_amount ?? totalAmountPaid,
      amount: b.amount ?? seedAmountPaid,
      paymentStatus: b.paymentStatus,
      bookingStatus: b.bookingStatus,
      daysLeft: b.daysLeft ?? diffDays,
      paymentHistory:
        b.paymentHistory ??
        [
          {
            id: "seed-1",
            date: invoiceDateObj,
            paymentType: b.paymentStatus === "partial" ? t("manageView.payment.typeAdvance") : t("manageView.payment.typeBase"),
            amountPaid: seedAmountPaid,
            transactionId: `TXN${new Date(b.date).getTime().toString().slice(-8)}`,
          },
        ],
    };
  });

  const remainingBalance = Math.max(Math.round(bookingState.total_amount - bookingState.amount), 0);
  const isCancelled = bookingState.bookingStatus === "cancelled";

  // ── Edit Details tab ──────────────────────────────────────────────────
  const [editMessage, setEditMessage] = useState("");

  const [editLoading, setEditLoading] = useState(false);

const sendEditRequest = async () => {
  if (!editMessage.trim()) {
    toast.error("Please enter your request.");
    return;
  }

  try {
    setEditLoading(true);

   // console.log(b)

   const chat_id =  await editBookingRequest({
      booking_id: b.id,
      child_venue_id: b.childVenueId,
      message: editMessage,
      category: 'bookings',
      reference_type: 'booking',
      vendor_id: b.vendor_id,
    });

     router.push(
    `/${locale}/${country}/messages?conversation=${chat_id}`
  );


    //toast.success("Your edit request has been sent successfully.");

    setEditMessage("");
    //setShowEditModal(false); // if using a modal

    // Optional: refresh booking details
    // await getBookingDetails();

  } catch (error) {
    console.error(error);
    toast.error(
      error?.response?.data?.message ||
      "Failed to send edit request."
    );
  } finally {
    setEditLoading(false);
  }
};

  // ── Payment flow (Pay Now → choose amount → gateway → success) ─────────
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState("select"); // "select" | "gateway" | "success"
  const [selectedOption, setSelectedOption] = useState("100"); // "25" | "50" | "100" | "custom"
  const [customAmount, setCustomAmount] = useState("");
  const [gatewayStepIndex, setGatewayStepIndex] = useState(0);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [receipt, setReceipt] = useState(null); // viewing a past receipt from the history table

  const resolvedPaymentAmount =
    selectedOption === "custom"
      ? Number(customAmount) || 0
      : Math.round((remainingBalance * Number(selectedOption)) / 100);

  const paymentAmountError =
    !resolvedPaymentAmount || resolvedPaymentAmount <= 0
      ? t("manageView.payment.errorInvalid")
      : resolvedPaymentAmount > remainingBalance
        ? t("manageView.payment.errorExceeds", { amount: format(remainingBalance) })
        : "";
  const isPaymentAmountValid = resolvedPaymentAmount > 0 && resolvedPaymentAmount <= remainingBalance;

  function openPaymentModal() {
    setSelectedOption("100");
    setCustomAmount("");
    setPaymentStep("select");
    setShowPaymentModal(true);
  }
  function closePaymentModal() {
    setShowPaymentModal(false);
    // Let the exit animation finish before resetting the step, so the
    // modal doesn't visibly jump back to step 1 while it's fading out.
    setTimeout(() => setPaymentStep("select"), 250);
  }
 async function startGatewayPayment() {
  if (!isPaymentAmountValid) return;

  try {
    setGatewayStepIndex(0);
    setPaymentStep("gateway");

    // Create Razorpay Order
    const order = await createOrder({
      amount: resolvedPaymentAmount,
      booking_id: b.id,
    });

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded");
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,

      amount: order.amount,
      currency: order.currency,
      order_id: order.id,

      name: "venuebook.in",
      description: "Venue Booking",

      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },

      theme: {
        color: "#2563EB",
      },

      handler: async (response) => {
        try {
          // Verify Payment
          await verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            booking_id: b.id,
          });

          // Create booking
          const bookingPayload = {
            payment: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              payment_method: "Online",
              booking_id: b.id,
              paid_amount: resolvedPaymentAmount,
            },
          };

          const bookingResponse = await onlinepayment(bookingPayload);

          setSuccessReceipt({
            transactionId: response.razorpay_payment_id,
            amountPaid: resolvedPaymentAmount,
            booking: bookingResponse,
          });

          setPaymentStep("success");
        } catch (err) {
          console.error("Payment verification failed", err);
          setPaymentStep("select");
        }
      },

      modal: {
        ondismiss: () => {
          setPaymentStep("select");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (err) {
    console.error(err);
    setPaymentStep("select");
  }
}

  // Drives the mocked gateway's 3-beat status sequence, then "moves" the
  // payment into bookingState (our stand-in for a DB write) and advances
  // to the success step.
  useEffect(() => {
    if (paymentStep !== "gateway") return;
    const timers = GATEWAY_STEPS.slice(1).map((_, i) =>
      setTimeout(() => setGatewayStepIndex(i + 1), GATEWAY_STEP_DURATION_MS * (i + 1)),
    );
    const finalTimer = setTimeout(() => {
      const amount = resolvedPaymentAmount;
      const newAmountPaid = bookingState.amount + amount;
      const newStatus = newAmountPaid >= bookingState.total_amount ? "paid" : "partial";
      const record = {
        id: `pay-${Date.now()}`,
        date: new Date(),
        paymentType: t("manageView.payment.typeBalance"),
        amountPaid: amount,
        transactionId: `TXN${Date.now().toString().slice(-8)}`,
      };
      setBookingState((prev) => ({
        ...prev,
        amount: newAmountPaid,
        paymentStatus: newStatus,
        paymentHistory: [...prev.paymentHistory, record],
      }));
      onBookingPatch?.({ paymentStatus: newStatus });
      setSuccessReceipt(record);
      setPaymentStep("success");
      toast.success(t("manageView.payment.paySuccess"));
    }, GATEWAY_STEP_DURATION_MS * GATEWAY_STEPS.length);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finalTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStep]);

  function viewSuccessReceipt() {
    setReceipt(successReceipt);
    closePaymentModal();
  }

  // ── Cancellation tab ──────────────────────────────────────────────────
  const [reason, setReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const refundTier =
    MOCK_CANCELLATION_TIERS.find((tier) => diffDays >= tier.daysFrom) ||
    MOCK_CANCELLATION_TIERS[MOCK_CANCELLATION_TIERS.length - 1];
  const refundPercent = refundTier?.refundPercent ?? 0;
  const estimatedRefund = Math.round((bookingState.amount * refundPercent) / 100);
  const isReasonValid = reason.trim().length >= MIN_REASON_LENGTH;

  // function confirmCancel() {
  //   alert()
  //   setBookingState((prev) => ({ ...prev, bookingStatus: "cancelled" }));
  //   onBookingPatch?.({ bookingStatus: "cancelled" });
  //   setShowCancelModal(false);
  //    await cancelBooking({
  //     booking_id: b.bookingId,
  //     reason,
  //   });

  //   toast.success(t("manageView.cancel.confirmedToast", { amount: format(estimatedRefund) }));
  //   onBack?.();
  // }
  const confirmCancel = async () => {
  try {
    await cancelBooking({
      booking_id: b.id,
      refund: estimatedRefund,
      reason,
    });

    setBookingState((prev) => ({
      ...prev,
      bookingStatus: "cancelled",
    }));

    onBookingPatch?.({
      bookingStatus: "cancelled",
    });

    setShowCancelModal(false);

    toast.success(
      `Booking cancelled successfully. Refund: ${format(estimatedRefund)}`
    );

    onBack?.();
  } catch (error) {
    console.error(error);

    toast.error("Failed to cancel booking. Please try again.");
  }
};

const handleContinue = async () => {
  setStep("gateway");

  try {
    const order = await createPaymentOrder({
      booking_id: booking.id,
      amount: resolvedPaymentAmount,
    });

    await openRazorpay(order);
  } catch (e) {
    setStep("select");
  }
};

  return (
    <div className="space-y-4">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      {/* Tabs — sticky so the bar stays pinned at the top of the scrolling
          booking detail instead of scrolling out of view with the content.

          The scroll container this renders inside (BookingsPanel.jsx) has
          its own px-4 pt-3 padding sitting ABOVE this element in the DOM —
          sticky's `top` offset is measured from the scroll ancestor's
          padding edge, so that padding strip stayed permanently visible
          above a plainly-sticky bar, showing scrolled content bleeding
          through it. The outer wrapper cancels that padding (-mx-4 -mt-3)
          and reapplies the same px-4 pt-3 inside itself with an opaque
          bg-white/dark:bg-gray-900 backdrop (matching SectionCard's own
          panel background), so the wrapper — not just the pill — is what's
          actually stuck, fully covering that strip. pb-2 keeps the same
          breathing room before the tab content that space-y-4 previously
          gave it. PaxBookingView.jsx's tab bar mirrors this exactly. */}
      <div className="sticky top-0 z-10 -mx-4 -mt-3 px-4 pt-3 pb-2 bg-white dark:bg-gray-900">
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60">
          {TAB_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              style={activeTab === key ? { backgroundColor: categoryColor } : undefined}
              className={`flex-1 px-2 py-2 rounded-lg text-[11px] font-semibold transition-all duration-150 whitespace-nowrap ${
                activeTab === key
                  ? "text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-white/70 dark:hover:bg-gray-900/40"
              }`}
            >
              {t(`manageView.tabs.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          b={b}
          t={t}
          user={user}
          isStayBased={isStayBased}
          categoryLabel={categoryLabel}
          categoryColor={categoryColor}
          eventDate={eventDate}
          checkOutObj={checkOutObj}
          format={format}
          bookingState={bookingState}
          remainingBalance={remainingBalance}
        />
      )}

      {activeTab === "edit" && (
        <EditTab
          t={t}
          categoryColor={categoryColor}
          message={editMessage}
          onChange={setEditMessage}
          onSend={sendEditRequest}
        />
      )}

      {activeTab === "payment" && (
        <PaymentTab
          t={t}
          categoryColor={categoryColor}
          format={format}
          bookingState={bookingState}
          remainingBalance={remainingBalance}
          onPayNow={openPaymentModal}
          onViewReceipt={setReceipt}
        />
      )}

      {activeTab === "cancel" && (
        <CancelTab
          b={b}
          t={t}
          categoryColor={categoryColor}
          isFarmstay={isFarmstay}
          diffDays={diffDays}
          refundPercent={refundPercent}
          bookingPaidSum={bookingState.amount}
          estimatedRefund={estimatedRefund}
          format={format}
          reason={reason}
          onReasonChange={setReason}
          isReasonValid={isReasonValid}
          isCancelled={isCancelled}
          onCancelClick={() => setShowCancelModal(true)}
        />
      )}

      <Sidebar
        t={t}
        b={b}
        categoryColor={categoryColor}
        isFarmstay={isFarmstay}
        daysLeft={bookingState.daysLeft}
        locale={locale}
        country={country}
        onInvoice={onInvoice}
      />

      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal
            t={t}
            categoryColor={categoryColor}
            format={format}
            step={paymentStep}
            totalAmount={bookingState.total_amount}
            paidAmount={bookingState.amount}
            remainingBalance={remainingBalance}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            customAmount={customAmount}
            onCustomAmountChange={setCustomAmount}
            resolvedPaymentAmount={resolvedPaymentAmount}
            error={paymentAmountError}
            isValid={isPaymentAmountValid}
            gatewayStepIndex={gatewayStepIndex}
            successReceipt={successReceipt}
            onClose={closePaymentModal}
            onContinue={startGatewayPayment}
            onViewReceipt={viewSuccessReceipt}
            onDone={closePaymentModal}
            handleContinue={handleContinue}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelModal && (
          <CancelConfirmModal
            t={t}
            format={format}
            estimatedRefund={estimatedRefund}
            onClose={() => setShowCancelModal(false)}
            onConfirm={confirmCancel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receipt && (
          <ReceiptModal
            t={t}
            b={b}
            categoryColor={categoryColor}
            user={user}
            format={format}
            receipt={receipt}
            onClose={() => setReceipt(null)}
            onDownload={() => toast.info(t("manageView.receipt.downloadToast"))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Shared card/row primitives — local to this file, mirroring the
   rounded-2xl bordered card look InvoiceDocument.jsx/BookingDetailModal.jsx
   already use.
   ═══════════════════════════════════════════════════════════════════════ */
function Card({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
      <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
        {description && <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function DetailItem({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-[13px] text-gray-900 dark:text-gray-50 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function PaymentRow({ label, value, bold, highlight, accentColor = CATEGORY_COLORS.venues }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${highlight ? "p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40" : ""}`}
    >
      <span
        className={`text-[13px] ${bold ? "font-semibold text-gray-900 dark:text-gray-50" : "text-gray-500 dark:text-gray-400"}`}
      >
        {label}
      </span>
      <span
        style={highlight ? { color: accentColor } : undefined}
        className={`font-semibold ${highlight ? "text-[16px]" : "text-[13px] text-gray-900 dark:text-gray-50"}`}
      >
        {value}
      </span>
    </div>
  );
}

// Same `${color}1A`/hex+alpha-suffix tint pattern ui.jsx's StatCard already
// uses for its icon chip — reused here so a category's accent tone reads
// consistently whether it's a fixed brand color (StatCard) or this
// booking's own category color (PaymentBox).
function PaymentBox({ label, value, tone = "default", accentColor = CATEGORY_COLORS.venues }) {
  if (tone === "primary") {
    return (
      <div className="rounded-xl p-3.5" style={{ backgroundColor: `${accentColor}14` }}>
        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-[17px] font-bold mt-1" style={{ color: accentColor }}>
          {value}
        </p>
      </div>
    );
  }
  const bg = {
    default: "bg-gray-50 dark:bg-gray-800/40",
    success: "bg-green-50 dark:bg-green-900/20",
  }[tone];
  const valueColor = {
    default: "text-gray-900 dark:text-gray-50",
    success: "text-green-700 dark:text-green-300",
  }[tone];
  return (
    <div className={`rounded-xl p-3.5 ${bg}`}>
      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-[17px] font-bold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════════════════════ */
function OverviewTab({ b, t, user, isStayBased, categoryLabel, categoryColor, eventDate, checkOutObj, format, bookingState, remainingBalance }) {
  return (
    <div className="space-y-4">
      <Card title={t("manageView.overview.detailsTitle", { category: categoryLabel })}>
        <div className="rounded-xl overflow-hidden -mt-1">
          <img src={b.image} alt="" className="w-full h-40 sm:h-48 object-cover" />
        </div>
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">{b.propertyName}</h4>
          <span className="shrink-0 px-2.5 py-1 rounded-lg text-[10.5px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            {categoryLabel}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {isStayBased ? (
            <DetailItem
              Icon={CalendarDays}
              label={t("manageView.overview.checkInOut")}
              value={`${formatLongDate(eventDate)} → ${formatLongDate(checkOutObj)}`}
            />
          ) : (
            <DetailItem
              Icon={CalendarDays}
              label={t("manageView.overview.dateShift")}
              value={`${formatLongDate(eventDate)}${b.shiftLabel ? ` · ${b.shiftLabel}` : ""}`}
            />
          )}
          <DetailItem Icon={Users} label={t("manageView.overview.guests")} value={t("manageView.overview.guestsUnit", { count: b.guests })} />
          <DetailItem Icon={MapPin} label={t("manageView.overview.location")} value={b.address} />
        </div>
      </Card>

      <Card title={t("manageView.overview.contactTitle")}>
        <div className="flex items-center gap-3">
          <UserIcon size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
          <span className="text-[13px] text-gray-900 dark:text-gray-50">{user?.name || "—"}</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
          <span className="text-[13px] text-gray-900 dark:text-gray-50">{user?.email || "—"}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
          <span className="text-[13px] text-gray-900 dark:text-gray-50">{user?.phone || "—"}</span>
        </div>
      </Card>

      <Card title={t("manageView.overview.paymentStatusTitle")}>
        <PaymentRow label={t("manageView.overview.totalAmount")} value={format(bookingState.total_amount)} />
        <PaymentRow label={t("manageView.overview.amountPaid")} value={format(bookingState.amount)} />
        {bookingState.paymentStatus === "partial" && (
          <>
            <PaymentRow
              label={t("manageView.overview.remainingBalance")}
              value={format(remainingBalance)}
              bold
              highlight
              accentColor={categoryColor}
            />
            <div className="flex items-center justify-between pt-1 text-[12px] text-gray-500 dark:text-gray-400">
              <span>{t("manageView.overview.dueDate")}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(eventDate)}</span>
            </div>
          </>
        )}
      </Card>

      {b.specialRequest && (
        <Card title={t("manageView.overview.specialRequestsTitle")}>
          <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">{b.specialRequest}</p>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EDIT DETAILS TAB
   ═══════════════════════════════════════════════════════════════════════ */
function EditTab({ t, categoryColor, message, onChange, onSend }) {
  return (
    <Card title={t("manageView.edit.title")} description={t("manageView.edit.description")}>
      <div>
        <label className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400">{t("manageView.edit.label")}</label>
        <textarea
          value={message}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder={t("manageView.edit.placeholder")}
          className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-[13px] text-gray-900 dark:text-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        />
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 p-3">
        <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-amber-800 dark:text-amber-300">{t("manageView.edit.alert")}</p>
      </div>

      <div className="flex justify-end">
        <PrimaryButton
          onClick={onSend}
          disabled={!message || message.trim().length <= 5}
          style={{ backgroundColor: categoryColor }}
        >
          {t("manageView.edit.send")}
        </PrimaryButton>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAYMENT TAB — summary + a single "Pay Now" button. All the amount
   selection now happens inside PaymentModal's 3-step flow below.
   ═══════════════════════════════════════════════════════════════════════ */
function PaymentTab({ t, categoryColor, format, bookingState, remainingBalance, onPayNow, onViewReceipt }) {
  const history = bookingState.paymentHistory;
  return (
    <div className="space-y-4">
      <Card title={t("manageView.payment.summaryTitle")} description={t("manageView.payment.summaryDescription")}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <PaymentBox label={t("manageView.payment.totalAmount")} value={format(bookingState.total_amount)} />
          <PaymentBox label={t("manageView.payment.amountPaid")} value={format(bookingState.amount)} tone="success" />
          {remainingBalance > 0 && (
            <PaymentBox
              label={t("manageView.payment.remainingBalance")}
              value={format(remainingBalance)}
              tone="primary"
              accentColor={categoryColor}
            />
          )}
        </div>
        {remainingBalance > 0 && (
          <div className="flex justify-center">
  <motion.button
    type="button"
    onClick={onPayNow}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    style={{ backgroundColor: categoryColor }}
    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-xs font-semibold shadow-sm"
  >
    <CreditCard size={13} />
    Pay Now
  </motion.button>
</div>
        )}
      </Card>

      {history.length > 0 && (
        <Card title={t("manageView.payment.historyTitle")}>
          {/* Desktop table */}
          <div className="hidden sm:block rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="grid grid-cols-5 gap-2 px-3 py-2 text-[10.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
              <span>{t("manageView.payment.colDate")}</span>
              <span>{t("manageView.payment.colType")}</span>
              <span className="text-right">{t("manageView.payment.colAmount")}</span>
              <span className="text-center">{t("manageView.payment.colStatus")}</span>
              <span className="text-center">{t("manageView.payment.colReceipt")}</span>
            </div>
            {history.map((p) => (
              <div key={p.id} className="grid grid-cols-5 gap-2 px-3 py-2.5 text-[12.5px] items-center">
                <span className="text-gray-700 dark:text-gray-300">{formatDate(p.date)}</span>
                <span className="text-gray-700 dark:text-gray-300">{p.paymentType}</span>
                <span className="text-right font-semibold text-gray-900 dark:text-gray-50">{format(p.amountPaid)}</span>
                <span className="text-center">
                  <StatusBadge label={t("manageView.payment.paidBadge")} tone="green" />
                </span>
                <span className="text-center">
                  <button
                    type="button"
                    onClick={() => onViewReceipt(p)}
                    style={{ color: categoryColor }}
                    className="text-[11.5px] font-semibold hover:underline"
                  >
                    {t("manageView.payment.view")}
                  </button>
                </span>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2.5">
            {history.map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500 dark:text-gray-400">{formatDate(p.date)}</span>
                  <StatusBadge label={t("manageView.payment.paidBadge")} tone="green" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[12.5px] text-gray-700 dark:text-gray-300">{p.paymentType}</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-50">{format(p.amountPaid)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onViewReceipt(p)}
                  style={{ color: categoryColor }}
                  className="mt-2.5 w-full text-center py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-[12px] font-semibold"
                >
                  {t("manageView.payment.view")}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CANCELLATION TAB
   ═══════════════════════════════════════════════════════════════════════ */
function CancelTab({ t, categoryColor, isFarmstay, diffDays, refundPercent, bookingPaidSum, estimatedRefund, format, reason, onReasonChange, isReasonValid, isCancelled, onCancelClick }) {
  return (
    <Card title={t("manageView.cancel.title")} description={t("manageView.cancel.description")}>
      <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
        <Clock size={16} style={{ color: categoryColor }} className="shrink-0" />
        <div>
          <p className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-50">
            {isFarmstay ? t("manageView.cancel.timeUntilStay") : t("manageView.cancel.timeUntilEvent")}
          </p>
          <p className="text-[12px] text-gray-500 dark:text-gray-400">
            {t(diffDays === 1 ? "manageView.cancel.dayRemaining" : "manageView.cancel.daysRemaining", { count: diffDays })}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {t("manageView.cancel.refundScheduleTitle")}
        </p>
        {MOCK_CANCELLATION_TIERS.map((tier) => {
          const active = diffDays >= tier.daysFrom && diffDays <= tier.daysTo;
          return (
            <div
              key={tier.daysFrom}
              style={active ? { backgroundColor: `${categoryColor}14`, color: categoryColor } : undefined}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] ${
                active ? "font-semibold" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <span>
                {tier.daysTo === Infinity
                  ? t("manageView.cancel.tierRangeInfinity", { from: tier.daysFrom })
                  : t("manageView.cancel.tierRange", { from: tier.daysFrom, to: tier.daysTo })}
              </span>
              <span>{t("manageView.cancel.tierRefund", { percent: tier.refundPercent })}</span>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3.5 space-y-2">
        <p className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-50">{t("manageView.cancel.ifCancelNow")}</p>
        <PaymentRow label={t("manageView.cancel.amountPaid")} value={format(bookingPaidSum)} />
        <PaymentRow label={t("manageView.cancel.refundPercentage")} value={`${refundPercent}%`} />
        <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
          <PaymentRow
            label={t("manageView.cancel.estimatedRefund")}
            value={format(estimatedRefund)}
            bold
            highlight
            accentColor={categoryColor}
          />
        </div>
      </div>

      {!isCancelled && (
        <>
          <div>
            <label className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400">
              {t("manageView.cancel.reasonLabel")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={4}
              placeholder={t("manageView.cancel.reasonPlaceholder")}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-[13px] text-gray-900 dark:text-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <p className={`text-[11px] mt-1 ${isReasonValid ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
              {t("manageView.cancel.charCount", { count: reason.trim().length })}
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 p-3">
            <AlertTriangle size={15} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-red-800 dark:text-red-300">{t("manageView.cancel.warningTitle")}</p>
              <p className="text-[11.5px] text-red-700 dark:text-red-400 mt-0.5">{t("manageView.cancel.warningText")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancelClick}
            disabled={!isReasonValid}
            className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-colors"
          >
            {t("manageView.cancel.cancelButton")}
          </button>
        </>
      )}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SIDEBAR — Quick Actions / Countdown / Need Help
   ═══════════════════════════════════════════════════════════════════════ */
function Sidebar({ t, b, categoryColor, isFarmstay, daysLeft, locale, country, onInvoice }) {
  return (
    <div className="space-y-4">
      <Card title={t("manageView.sidebar.quickActionsTitle")}>
        {b.invoiceId && (
          <GhostButton onClick={onInvoice} className="w-full justify-start">
            <FileText size={14} />
            {t("manageView.sidebar.viewInvoice")}
          </GhostButton>
        )}
      </Card>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: `${categoryColor}0D`, borderColor: `${categoryColor}33` }}
      >
        <div className="px-4 py-3.5 border-b" style={{ borderColor: `${categoryColor}26` }}>
          <h3 className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50">
            {isFarmstay ? t("manageView.sidebar.countdownStayTitle") : t("manageView.sidebar.countdownTitle")}
          </h3>
        </div>
        <div className="p-4 text-center">
          <p className="text-[30px] font-bold leading-none" style={{ color: categoryColor }}>
            {daysLeft}
          </p>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1.5">
            {isFarmstay ? t("manageView.sidebar.daysUntilStay") : t("manageView.sidebar.daysUntilEvent")}
          </p>
        </div>
      </div>

      <Card title={t("manageView.sidebar.helpTitle")}>
        <GhostButton as={Link} href={`/${locale}/${country}/messages`} className="w-full justify-start">
          <LifeBuoy size={14} />
          {t("manageView.sidebar.contactSupport")}
        </GhostButton>
        <GhostButton className="w-full justify-start">
          <HelpCircle size={14} />
          {t("manageView.sidebar.viewFaq")}
        </GhostButton>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MODAL SHELL — shared overlay used by all modals below. `hideClose` hides
   the X button (used during the gateway step so a payment "in flight"
   can't be dismissed accidentally).
   ═══════════════════════════════════════════════════════════════════════ */
function Modal({ title, onClose, children, footer, wide, hideClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={hideClose ? undefined : onClose}
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full ${wide ? "sm:max-w-lg" : "sm:max-w-md"} bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Wraps each payment step's content so it slides/fades in as `step`
// changes — the transition AnimatePresence above keys off.
function StepPane({ stepKey, children }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   AMOUNT OPTION CARD — 25% / 50% / Full / Custom selector used in the
   payment modal's first step.
   ═══════════════════════════════════════════════════════════════════════ */
function AmountOptionCard({ label, sublabel, active, onClick, accentColor }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      style={active ? { borderColor: accentColor, backgroundColor: `${accentColor}12` } : undefined}
      className={`relative rounded-xl border-2 p-3 text-left transition-colors ${
        active
          ? ""
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      {active && (
        <motion.div
          layoutId="payment-option-indicator"
          transition={{ duration: 0.18 }}
          className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: accentColor }}
        >
          <Check size={10} className="text-white" strokeWidth={3} />
        </motion.div>
      )}
      <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-50">{label}</p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{sublabel}</p>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAYMENT MODAL — 3-step flow:
     1. select  — choose 25% / 50% / Full / Custom
     2. gateway — simulated payment gateway (connect → verify → confirm)
     3. success — animated confirmation + receipt / done
   ═══════════════════════════════════════════════════════════════════════ */
function PaymentModal({
  categoryColor,
  format,
  step,
  totalAmount,
  paidAmount,
  remainingBalance,
  selectedOption,
  onSelectOption,
  customAmount,
  onCustomAmountChange,
  resolvedPaymentAmount,
  error,
  isValid,
  gatewayStepIndex,
  successReceipt,
  onClose,
  onContinue,
  onViewReceipt,
  onDone,
}) {
  const titles = {
    select: "Payment",
    gateway: "Processing Payment",
    success: "Payment Successful",
  };

  const GATEWAY_STEPS = [
    "Connecting to payment gateway...",
    "Verifying payment...",
    "Processing transaction...",
    "Finalizing payment...",
  ];

  const footer =
    step === "select" ? (
      <>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>

        {/* <PrimaryButton
          onClick={onContinue}
          disabled={!isValid}
          style={{ backgroundColor: categoryColor }}
        >
          Continue to Pay {format(resolvedPaymentAmount || 0)}
        </PrimaryButton> */}
        <PrimaryButton
  onClick={async () => {
    try {
      await onContinue();
    } catch (err) {
      console.error(err);
    }
  }}
  disabled={!isValid}
  style={{ backgroundColor: categoryColor }}
>
  Continue to Pay {format(resolvedPaymentAmount || 0)}
</PrimaryButton>
      </>
    ) : step === "success" ? (
      <>
        <button
          onClick={onViewReceipt}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          View Receipt
        </button>

        <PrimaryButton
          onClick={onDone}
          style={{ backgroundColor: categoryColor }}
        >
          Done
        </PrimaryButton>
      </>
    ) : null;

  return (
    <Modal
      title={titles[step]}
      onClose={onClose}
      hideClose={step === "gateway"}
      footer={footer}
    >
      {step === "select" && (
        <StepPane stepKey="select">
          <PaymentRow label="Total Amount" value={format(totalAmount)} />

          <PaymentRow label="Paid Amount" value={format(paidAmount)} />

          <PaymentRow
            label="Remaining Balance"
            value={format(remainingBalance)}
            bold
            highlight
            accentColor={categoryColor}
          />

          <div>
            <label className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400">
              Select Payment Amount
            </label>

            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <AmountOptionCard
                label="25%"
                sublabel={format(Math.round(remainingBalance * 0.25))}
                active={selectedOption === "25"}
                onClick={() => onSelectOption("25")}
                accentColor={categoryColor}
              />

              <AmountOptionCard
                label="50%"
                sublabel={format(Math.round(remainingBalance * 0.5))}
                active={selectedOption === "50"}
                onClick={() => onSelectOption("50")}
                accentColor={categoryColor}
              />

              <AmountOptionCard
                label="Pay Full"
                sublabel={format(remainingBalance)}
                active={selectedOption === "100"}
                onClick={() => onSelectOption("100")}
                accentColor={categoryColor}
              />

              <AmountOptionCard
                label="Custom Amount"
                sublabel="Enter your own amount"
                active={selectedOption === "custom"}
                onClick={() => onSelectOption("custom")}
                accentColor={categoryColor}
              />
            </div>
          </div>

          <AnimatePresence initial={false}>
            {selectedOption === "custom" && (
              <motion.div
                key="custom-amount"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1.5 flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3">
                  <span className="text-[13px] text-gray-500 dark:text-gray-400 mr-1">
                    ₹
                  </span>

                  <input
                    type="number"
                    autoFocus
                    value={customAmount}
                    onChange={(e) => onCustomAmountChange(e.target.value)}
                    min={1}
                    max={remainingBalance}
                    placeholder={`Maximum ${format(remainingBalance)}`}
                    className="w-full py-2.5 bg-transparent text-[14px] font-semibold text-gray-900 dark:text-gray-50 focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">
                    {error}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
            <ShieldCheck size={14} className="shrink-0 mt-0.5" />

            <p className="text-[11px]">
              Your payment is secured and encrypted.
            </p>
          </div>
        </StepPane>
      )}

      {step === "gateway" && (
        <StepPane stepKey="gateway">
          <div className="flex flex-col items-center justify-center py-8 gap-5 text-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${categoryColor}14` }}
            >
              <CreditCard
                size={26}
                style={{ color: categoryColor }}
              />
            </motion.div>

            <div className="w-full max-w-[220px] h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: categoryColor }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2.4,
                  ease: "easeInOut",
                }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={gatewayStepIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-[12.5px] font-medium text-gray-600 dark:text-gray-300"
              >
                {GATEWAY_STEPS[gatewayStepIndex]}
              </motion.p>
            </AnimatePresence>

            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Please do not close this window while your payment is being
              processed.
            </p>
          </div>
        </StepPane>
      )}

      {step === "success" && (
        <StepPane stepKey="success">
          <div className="flex flex-col items-center justify-center py-3 gap-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-green-50 dark:bg-green-900/20"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M4 12.5L9.5 18L20 6"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15,
                    ease: "easeOut",
                  }}
                />
              </svg>
            </motion.div>

            <div>
              <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">
                Payment Successful
              </p>

              <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-1">
                Your payment of{" "}
                {format(successReceipt?.amountPaid || 0)} has been received
                successfully.
              </p>
            </div>

            <div className="w-full rounded-xl border border-gray-100 dark:border-gray-800 p-3.5 space-y-1.5 text-left">
              <PaymentRow
                label="Transaction ID"
                value={successReceipt?.transactionId}
              />

              <PaymentRow
                label="Paid Amount"
                value={format(successReceipt?.amountPaid || 0)}
                bold
                highlight
                accentColor={categoryColor}
              />
            </div>
          </div>
        </StepPane>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CANCEL CONFIRMATION MODAL
   ═══════════════════════════════════════════════════════════════════════ */
function CancelConfirmModal({ t, format, estimatedRefund, onClose, onConfirm }) {
  return (
    <Modal
      title={t("manageView.cancel.modalTitle")}
      onClose={onClose}
      footer={
        <>
          <SecondaryButton onClick={onClose}>{t("manageView.cancel.keep")}</SecondaryButton>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-semibold transition-all"
          >
            {t("manageView.cancel.confirm")}
          </button>
        </>
      }
    >
      <motion.div key="cancel-confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <p className="text-[13.5px] text-gray-700 dark:text-gray-300">{t("manageView.cancel.modalBody1")}</p>
        <p className="text-[13.5px] text-gray-700 dark:text-gray-300">
          {t("manageView.cancel.modalBody2", { amount: format(estimatedRefund) })}
        </p>
        <p className="text-[12px] font-semibold text-red-600 dark:text-red-400">{t("manageView.cancel.modalWarning")}</p>
      </motion.div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   RECEIPT MODAL
   ═══════════════════════════════════════════════════════════════════════ */
function ReceiptModal({ t, b, categoryColor, user, format, receipt, onClose, onDownload }) {
  return (
    <Modal
      title={t("manageView.receipt.title")}
      onClose={onClose}
      wide
      footer={
        <>
          <GhostButton onClick={onDownload}>
            <Download size={13} />
            {t("manageView.receipt.download")}
          </GhostButton>
          <PrimaryButton onClick={onClose}>{t("manageView.receipt.close")}</PrimaryButton>
        </>
      }
    >
      <motion.div key="receipt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge label={t("manageView.payment.paidBadge")} tone="green" />
        </div>

        <div className="space-y-2 rounded-xl border border-gray-100 dark:border-gray-800 p-3.5">
          <PaymentRow label={t("manageView.receipt.date")} value={formatDate(receipt.date)} />
          <PaymentRow label={t("manageView.receipt.type")} value={receipt.paymentType} />
          <PaymentRow label={t("manageView.receipt.bookingId")} value={b.bookingId} />
          <PaymentRow label={t("manageView.receipt.transactionId")} value={receipt.transactionId} />
        </div>

        <div className="rounded-xl p-3.5" style={{ backgroundColor: `${categoryColor}14` }}>
          <PaymentRow
            label={t("manageView.receipt.amountPaid")}
            value={format(receipt.amountPaid)}
            bold
            highlight
            accentColor={categoryColor}
          />
        </div>

        <div className="space-y-2">
          <p className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t("manageView.receipt.detailsTitle")}
          </p>
          <PaymentRow label={t("manageView.receipt.venue")} value={b.propertyName} />
          <PaymentRow label={t("manageView.receipt.date2")} value={formatLongDate(new Date(b.date))} />
          <PaymentRow label={t("manageView.receipt.customer")} value={user?.name || "—"} />
        </div>
      </motion.div>
    </Modal>
  );
}