"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/ManageBookingView.jsx
 *
 * The full "Manage Booking" experience behind a booking card's Manage
 * button — adapted from a reference Vue implementation (manage_booking.vue)
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
 *     tab / remaining-balance / Make Payment only ever show when the
 *     booking's own `paymentStatus` is already "partial".
 *   - All money figures reuse `computeBookingTotals()` from
 *     data/bookingMath.js — the SAME "Total Amount Paid" figure the
 *     Invoice tab shows, not a second, disconnected number. A partial
 *     booking is modeled as a clean 50/50 advance/remaining split (mirrors
 *     the "Remaining Amount" field already added to InvoiceDocument's
 *     Payment Info group).
 *   - Payment history, payment status, and booking status all live as
 *     LOCAL component state seeded from the booking prop — "paying" or
 *     "cancelling" here updates this view (and, via `onBookingPatch`, the
 *     parent's header status badge) but doesn't mutate MOCK_BOOKINGS
 *     itself, consistent with the rest of this mock-data feature (no real
 *     backend endpoint exists for any of this yet — Invoice's PDF download
 *     is still the only real network call anywhere in Bookings).
 *   - No "Convert to Booking" / cashfree payment gateway / real vendor
 *     chat endpoint — "Pay"/"Send Message"/"Confirm Cancellation" are
 *     mocked with a short delay + toast, same honesty pattern
 *     PasswordCard.jsx already uses for its own "not connected yet" toast.
 */

import { useMemo, useState } from "react";
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
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { GhostButton, PrimaryButton, SecondaryButton, StatusBadge } from "./ui";
import { computeBookingTotals } from "../../data/bookingMath";
import { MOCK_CANCELLATION_TIERS, CATEGORY_COLORS } from "../../data/mockProfileData";

const STAY_BASED_CATEGORIES = new Set(["farmstays", "rentals"]);
const MIN_REASON_LENGTH = 100;

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric" }).format(date);
const formatLongDate = (date) =>
  new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "long", day: "numeric" }).format(date);

const TAB_KEYS = ["overview", "edit", "payment", "cancel"];

export function ManageBookingView({ booking: b, t, tCat, format, locale, country, onInvoice, onBack, onBookingPatch }) {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const isStayBased = STAY_BASED_CATEGORIES.has(b.category);
  const isFarmstay = b.category === "farmstays";
  const categoryLabel = tCat(b.category.replace(/s$/, ""));
  // Same CATEGORY_COLORS map BookingCard.jsx already uses for its photo
  // badge — reused here (not a second palette) so this booking's accent
  // color matches what the customer already saw on its card. Falls back to
  // the venues color (violet, the app's existing default brand accent) for
  // any category not in the map.
  const categoryColor = CATEGORY_COLORS[b.category] || CATEGORY_COLORS.venues;

  const eventDate = new Date(b.date);
  const invoiceDateObj = new Date(eventDate);
  invoiceDateObj.setDate(invoiceDateObj.getDate() - 5);
  const checkOutObj = new Date(eventDate);
  checkOutObj.setDate(checkOutObj.getDate() + (b.nights || 1));

  const totals = useMemo(() => computeBookingTotals(b), [b]);
  const { totalAmountPaid } = totals;

  const [paymentStatus, setPaymentStatus] = useState(b.paymentStatus);
  const [bookingStatus, setBookingStatus] = useState(b.bookingStatus);
  const [bookingPaidSum, setBookingPaidSum] = useState(() =>
    b.paymentStatus === "partial" ? totalAmountPaid / 2 : totalAmountPaid,
  );
  const [history, setHistory] = useState(() => [
    {
      id: "seed-1",
      date: invoiceDateObj,
      type: b.paymentStatus === "partial" ? t("manageView.payment.typeAdvance") : t("manageView.payment.typeBase"),
      amount: b.paymentStatus === "partial" ? totalAmountPaid / 2 : totalAmountPaid,
    },
  ]);

  const remainingBalance = Math.max(Math.round(totalAmountPaid - bookingPaidSum), 0);
  const isCancelled = bookingStatus === "cancelled";

  // ── Edit Details tab ──────────────────────────────────────────────────
  const [editMessage, setEditMessage] = useState("");

  function sendEditRequest() {
    toast.success(t("manageView.edit.sentToast"));
    setEditMessage("");
  }

  // ── Payment modal ─────────────────────────────────────────────────────
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const paymentAmountError = !paymentAmount || paymentAmount <= 0
    ? t("manageView.payment.errorInvalid")
    : paymentAmount > remainingBalance
      ? t("manageView.payment.errorExceeds", { amount: format(remainingBalance) })
      : "";
  const isPaymentAmountValid = paymentAmount > 0 && paymentAmount <= remainingBalance;

  function openPaymentModal() {
    setPaymentAmount(remainingBalance);
    setShowPaymentModal(true);
  }
  function setPaymentPercentage(pct) {
    setPaymentAmount(Math.round((remainingBalance * pct) / 100));
  }
  function processPayment() {
    if (!isPaymentAmountValid) return;
    setIsProcessing(true);
    setTimeout(() => {
      const newSum = bookingPaidSum + paymentAmount;
      setBookingPaidSum(newSum);
      setHistory((h) => [
        ...h,
        { id: `pay-${Date.now()}`, date: new Date(), type: t("manageView.payment.typeBalance"), amount: paymentAmount },
      ]);
      if (Math.round(totalAmountPaid - newSum) <= 0) {
        setPaymentStatus("paid");
        onBookingPatch?.({ paymentStatus: "paid" });
      }
      setIsProcessing(false);
      setShowPaymentModal(false);
      toast.success(t("manageView.payment.paySuccess"));
    }, 900);
  }

  // ── Cancellation tab ──────────────────────────────────────────────────
  const [reason, setReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const diffDays = Math.max(0, Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const refundTier =
    MOCK_CANCELLATION_TIERS.find((tier) => diffDays >= tier.daysFrom) ||
    MOCK_CANCELLATION_TIERS[MOCK_CANCELLATION_TIERS.length - 1];
  const refundPercent = refundTier?.refundPercent ?? 0;
  const estimatedRefund = Math.round((bookingPaidSum * refundPercent) / 100);
  const isReasonValid = reason.trim().length >= MIN_REASON_LENGTH;

  function confirmCancel() {
    setBookingStatus("cancelled");
    onBookingPatch?.({ bookingStatus: "cancelled" });
    setShowCancelModal(false);
    toast.success(t("manageView.cancel.confirmedToast", { amount: format(estimatedRefund) }));
    onBack?.();
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
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
          totals={totals}
          bookingPaidSum={bookingPaidSum}
          remainingBalance={remainingBalance}
          paymentStatus={paymentStatus}
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
          totals={totals}
          bookingPaidSum={bookingPaidSum}
          remainingBalance={remainingBalance}
          history={history}
          onMakePayment={openPaymentModal}
          onViewReceipt={setReceipt}
        />
      )}

      {activeTab === "cancel" && (
        <CancelTab
          t={t}
          categoryColor={categoryColor}
          isFarmstay={isFarmstay}
          diffDays={diffDays}
          refundPercent={refundPercent}
          bookingPaidSum={bookingPaidSum}
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
        diffDays={diffDays}
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
            totals={totals}
            bookingPaidSum={bookingPaidSum}
            remainingBalance={remainingBalance}
            paymentAmount={paymentAmount}
            onAmountChange={setPaymentAmount}
            onPercentage={setPaymentPercentage}
            error={paymentAmountError}
            isValid={isPaymentAmountValid}
            isProcessing={isProcessing}
            onClose={() => setShowPaymentModal(false)}
            onPay={processPayment}
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
function OverviewTab({ b, t, user, isStayBased, categoryLabel, categoryColor, eventDate, checkOutObj, format, totals, bookingPaidSum, remainingBalance, paymentStatus }) {
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
        <PaymentRow label={t("manageView.overview.totalAmount")} value={format(totals.totalAmountPaid)} />
        <PaymentRow label={t("manageView.overview.amountPaid")} value={format(bookingPaidSum)} />
        {paymentStatus === "partial" && (
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
   PAYMENT TAB
   ═══════════════════════════════════════════════════════════════════════ */
function PaymentTab({ t, categoryColor, format, totals, bookingPaidSum, remainingBalance, history, onMakePayment, onViewReceipt }) {
  return (
    <div className="space-y-4">
      <Card title={t("manageView.payment.summaryTitle")} description={t("manageView.payment.summaryDescription")}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <PaymentBox label={t("manageView.payment.totalAmount")} value={format(totals.totalAmountPaid)} />
          <PaymentBox label={t("manageView.payment.amountPaid")} value={format(bookingPaidSum)} tone="success" />
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
          <div className="flex justify-end pt-1">
            <PrimaryButton onClick={onMakePayment} style={{ backgroundColor: categoryColor }}>
              {t("manageView.payment.makePayment")}
            </PrimaryButton>
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
                <span className="text-gray-700 dark:text-gray-300">{p.type}</span>
                <span className="text-right font-semibold text-gray-900 dark:text-gray-50">{format(p.amount)}</span>
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
                  <span className="text-[12.5px] text-gray-700 dark:text-gray-300">{p.type}</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-50">{format(p.amount)}</span>
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
function Sidebar({ t, b, categoryColor, isFarmstay, diffDays, locale, country, onInvoice }) {
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
            {diffDays}
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
   MODAL SHELL — shared overlay used by all three modals below.
   ═══════════════════════════════════════════════════════════════════════ */
function Modal({ title, onClose, children, footer, wide }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
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
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAYMENT MODAL
   ═══════════════════════════════════════════════════════════════════════ */
function PaymentModal({ t, categoryColor, format, totals, bookingPaidSum, remainingBalance, paymentAmount, onAmountChange, onPercentage, error, isValid, isProcessing, onClose, onPay }) {
  return (
    <Modal
      title={t("manageView.payment.modalTitle")}
      onClose={onClose}
      footer={
        <>
          <SecondaryButton onClick={onClose}>{t("manageView.payment.cancel")}</SecondaryButton>
          <PrimaryButton onClick={onPay} disabled={isProcessing || !isValid} style={{ backgroundColor: categoryColor }}>
            {isProcessing ? t("manageView.payment.processing") : t("manageView.payment.pay", { amount: format(paymentAmount || 0) })}
          </PrimaryButton>
        </>
      }
    >
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 p-3.5 space-y-2">
        <PaymentRow label={t("manageView.payment.modalTotal")} value={format(totals.totalAmountPaid)} />
        <PaymentRow label={t("manageView.payment.modalPaid")} value={format(bookingPaidSum)} />
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
          <PaymentRow
            label={t("manageView.payment.modalRemaining")}
            value={format(remainingBalance)}
            bold
            highlight
            accentColor={categoryColor}
          />
        </div>
      </div>

      <div>
        <label className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400">
          {t("manageView.payment.enterAmount")}
        </label>
        <div className="mt-1.5 flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3">
          <span className="text-[13px] text-gray-500 dark:text-gray-400 mr-1">₹</span>
          <input
            type="number"
            value={paymentAmount || ""}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            min={1}
            max={remainingBalance}
            placeholder={t("manageView.payment.maxPlaceholder", { amount: format(remainingBalance) })}
            className="w-full py-2.5 bg-transparent text-[14px] font-semibold text-gray-900 dark:text-gray-50 focus:outline-none"
          />
        </div>
        {error && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => onPercentage(pct)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 py-2 text-center hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          >
            <span className="block text-[12px] font-semibold text-gray-900 dark:text-gray-50">{pct}%</span>
            <span className="block text-[9.5px] text-gray-400 dark:text-gray-500 mt-0.5">
              {format(Math.round((remainingBalance * pct) / 100))}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[11.5px] text-gray-500 dark:text-gray-400">{t("manageView.payment.note")}</p>
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
      <p className="text-[13.5px] text-gray-700 dark:text-gray-300">{t("manageView.cancel.modalBody1")}</p>
      <p className="text-[13.5px] text-gray-700 dark:text-gray-300">
        {t("manageView.cancel.modalBody2", { amount: format(estimatedRefund) })}
      </p>
      <p className="text-[12px] font-semibold text-red-600 dark:text-red-400">{t("manageView.cancel.modalWarning")}</p>
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
      <div className="flex items-center justify-between">
        <StatusBadge label={t("manageView.payment.paidBadge")} tone="green" />
      </div>

      <div className="space-y-2 rounded-xl border border-gray-100 dark:border-gray-800 p-3.5">
        <PaymentRow label={t("manageView.receipt.date")} value={formatDate(receipt.date)} />
        <PaymentRow label={t("manageView.receipt.type")} value={receipt.type} />
        <PaymentRow label={t("manageView.receipt.bookingId")} value={b.bookingId} />
      </div>

      <div className="rounded-xl p-3.5" style={{ backgroundColor: `${categoryColor}14` }}>
        <PaymentRow
          label={t("manageView.receipt.amountPaid")}
          value={format(receipt.amount)}
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
    </Modal>
  );
}
