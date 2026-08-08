"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/PaxBookingView.jsx
 *
 * Rendered by ManageBookingView.jsx INSTEAD of the normal tabbed
 * Overview/Edit/Payment/Cancel UI whenever `booking.bookingStatus === "pax"`.
 *
 * A "pax" booking represents a multi-package group/catering enquiry still
 * being negotiated with the vendor (proposal → accept/reject/request
 * changes → contract → payment). It gets its own content here rather than
 * ManageBookingView's OverviewTab/EditTab/PaymentTab/CancelTab (those
 * assume a single confirmed line item, which doesn't exist yet mid
 * negotiation) — but it deliberately reuses that same file's shell: the
 * identical segmented tab bar (see TAB_KEYS below) and the identical Card/
 * DetailItem/PaymentRow primitives (copied here rather than imported, since
 * ManageBookingView.jsx doesn't export them — same self-contained approach
 * this file already took for its Modal), so a pax booking's Manage view
 * reads as the same product as every other booking's, not a bolted-on
 * design. Adapted from a reference Vue implementation
 * (CustomerBookingDetail.vue).
 *
 * SCOPE DECISIONS:
 *   - The reference page's backend (userService.get_leads_detail,
 *     backendService.acceptProposal/enquire_cancelBooking, a socket.io
 *     connection, and a direct Cashfree payment component) has no
 *     equivalent here yet — `services/booking.service.js` only exposes
 *     `leads_create` (creating a new lead), not fetching/mutating one by
 *     id. So the negotiation-specific fields (status, menu breakdown,
 *     per-person cost) come from local sample data merged on top of the
 *     REAL fields already on `booking` (name, guest count, amount) — same
 *     defensive fallback pattern the rest of ManageBookingView.jsx already
 *     uses for money fields that may not exist on every mock booking yet.
 *     Every status-changing action (accept/reject/request changes/cancel/
 *     pay) updates local state and shows a "preview only" toast instead of
 *     calling a real endpoint.
 *   - "Chat" is a CTA into the existing /messages route — no inline chat
 *     UI, no new endpoint.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Users,
  MapPin,
  MessageCircle,
  CheckCircle2,
  XCircle,
  MessageSquareText,
  FileSignature,
  CreditCard,
  AlertTriangle,
  X,
} from "lucide-react";

import { useToast } from "@/components/ToastProvider";
import { SecondaryButton, PrimaryButton } from "./ui";

// Exported so BookingsPanel.jsx can seed/read the same default and render
// the matching status badge in its own header row (see onBookingPatch below).
export const PAX_DEFAULT_STATUS = "Negotiating";

/* ── Negotiation fields the current API doesn't carry yet — merged with
   the real booking prop below so venue/guests/amount are always genuine
   while status/menu stay illustrative. ─────────────────────────────── */
const SAMPLE_NEGOTIATION = {
  status: PAX_DEFAULT_STATUS, // New | Review | Negotiating | pending_customer_approval | Sign_Contract | confirmed | confirmed_vendor | Rejected | Cancelled
  eventType: "Wedding Reception",
  menu: {
    type: "custom",
    groups: [
      { category: "Starters & Soups", items: ["Paneer Tikka", "Hara Bhara Kebab", "Tomato Soup"] },
      { category: "Main Course", items: ["Butter Chicken", "Veg Biryani", "Dal Makhani"] },
      { category: "Desserts", items: ["Gulab Jamun", "Kheer"] },
    ],
  },
  addonTotal: 0,
};

const PROGRESS_STEPS = [
  { status: "New", key: "submitted" },
  { status: "Review", key: "review" },
  { status: "Negotiating", key: "negotiating" },
  { status: "pending_customer_approval", key: "approval" },
  { status: "Sign_Contract", key: "contract" },
  { status: "confirmed", key: "confirmed" },
  { status: "confirmed_vendor", key: "payment" },
];

// Tone keys match ui.jsx's shared StatusBadge exactly (green/violet/amber/
// red/gray) so this negotiation-status pill renders pixel-identical to the
// outer bookingStatus badge ("Pax Enquiry"). Exported — BookingsPanel.jsx
// renders the actual badge (see onBookingPatch below), this view just picks
// the tone/label for it.
export const PAX_STATUS_TONE = {
  New: "violet",
  Review: "gray",
  Negotiating: "amber",
  pending_customer_approval: "violet",
  Sign_Contract: "violet",
  confirmed: "green",
  confirmed_vendor: "amber",
  Rejected: "red",
  Cancelled: "red",
};

// Same 3 tabs' worth of content ManageBookingView's own
// Overview/Edit/Payment/Cancel bar shows, scoped to what a pre-confirmation
// negotiation actually has: overview (status + event details), the
// menu/pricing breakdown, and cancellation.
const TAB_KEYS = ["overview", "menu", "cancel"];

const formatDate = (dateString) =>
  dateString
    ? new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "long", day: "numeric" }).format(
        new Date(dateString),
      )
    : "—";

export function paxStatusKey(status) {
  const MAP = {
    New: "new",
    Review: "underReview",
    Negotiating: "negotiating",
    pending_customer_approval: "actionRequired",
    Sign_Contract: "actionRequired",
    confirmed: "confirmed",
    confirmed_vendor: "actionRequired",
    Rejected: "rejected",
    Cancelled: "cancelled",
  };
  return MAP[status] || "new";
}

/* ── Card/DetailItem/PaymentRow — copied to match ManageBookingView.jsx's
   own (unexported) primitives of the same name exactly, so a pax booking's
   cards look identical to every other booking's Overview/Payment tabs. ── */
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
        <p className="text-[13px] text-gray-900 dark:text-gray-50 mt-0.5 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

function PaymentRow({ label, value, bold, highlight, accentColor }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${highlight ? "p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40" : ""}`}>
      <span className={`text-[13px] ${bold ? "font-semibold text-gray-900 dark:text-gray-50" : "text-gray-500 dark:text-gray-400"}`}>
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

function Modal({ open, onClose, title, tone = "violet", children, footer }) {
  const TONE_HEADER = { violet: "text-violet-600", danger: "text-red-600", warning: "text-amber-600" };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className={`text-[14.5px] font-semibold ${TONE_HEADER[tone]}`}>{title}</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={15} />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
              {footer}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Main view ────────────────────────────────────────────────────────── */
export function PaxBookingView({ booking: b, t, format, locale, country, categoryColor, onBack, onBookingPatch }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  console.log(b.paxPackages[0])

  const lead = useMemo(() => {
    const totalEstimate = b.total_amount ?? b.amount ?? 0;
    const guestCount = b.guests ?? 0;
    return {
      ...SAMPLE_NEGOTIATION,
      id: b.bookingId,
      venueName: b.propertyName,
      eventDate: b.date,
      guestCount,
      totalEstimate,
      perPersonCost: guestCount ? totalEstimate / guestCount : 0,
    };
  }, [b]);

  const [status, setStatus] = useState(lead.status);

  // Bubble the granular negotiation status up to BookingsPanel.jsx so it can
  // render the matching badge in its own header row, on the same line as
  // the outer "Pax Enquiry" badge, instead of duplicating a second header
  // inside this view.
  useEffect(() => {
    onBookingPatch?.({ paxStatus: status });
  }, [status, onBookingPatch]);

  const [changeRequest, setChangeRequest] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  const [showRequestChanges, setShowRequestChanges] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentStepIdx = useMemo(() => PROGRESS_STEPS.findIndex((s) => s.status === status), [status]);

  const totalAmount = Math.round((lead.totalEstimate || 0) + (lead.addonTotal || 0));
  const securityDeposit = 5000;
  const serviceCharges = 99;
  const taxesAndFees = Math.round((lead.totalEstimate || 0) * 0.05 + (lead.addonTotal || 0) * 0.18);
  const payTotal = totalAmount + securityDeposit + serviceCharges + taxesAndFees;

  const canCancel = !["confirmed", "Cancelled"].includes(status);
  const hasPendingProposal = ["Negotiating", "pending_customer_approval"].includes(status);
  // Same inline-reason-then-confirm-modal flow as ManageBookingView's own
  // CancelTab (MIN_REASON_LENGTH there is 100 for a confirmed stay; a still-
  // negotiating enquiry warrants a lighter bar, not a from-scratch pattern).
  const MIN_REASON_LENGTH = 20;
  const isReasonValid = cancellationReason.trim().length >= MIN_REASON_LENGTH;

  function previewToast() {
    toast.info(t("paxManagement.previewNotice"));
  }

  function handleAccept() {
    setStatus("pending_customer_approval");
    toast.success(t("paxManagement.proposal.accept"));
    previewToast();
  }
  function handleRequestChanges() {
    if (!changeRequest.trim()) return;
    setShowRequestChanges(false);
    setChangeRequest("");
    setStatus("Review");
    previewToast();
  }
  function handleReject() {
    if (!rejectionReason.trim()) return;
    setShowReject(false);
    setRejectionReason("");
    setStatus("Rejected");
    previewToast();
  }
  function handleCancel() {
    if (cancellationReason.trim().length < MIN_REASON_LENGTH) return;
    setSubmitting(true);
    setTimeout(() => {
      setShowCancel(false);
      setCancellationReason("");
      setStatus("Cancelled");
      setSubmitting(false);
      previewToast();
    }, 400);
  }
  function handleSignContract() {
    setStatus("confirmed_vendor");
    previewToast();
  }
  function handlePay() {
    setSubmitting(true);
    setTimeout(() => {
      setShowPayment(false);
      setSubmitting(false);
      previewToast();
    }, 500);
  }

  return (
    <div className="space-y-4">
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
              {t(`paxManagement.tabs.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="hidden md:flex items-start overflow-x-auto no-scrollbar">
            {PROGRESS_STEPS.map((step, idx) => {
              const completed = idx < currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none min-w-[52px]">
                  <div className="flex flex-col items-center gap-1.5 w-13 sm:w-16">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors ${
                        completed
                          ? "bg-emerald-600 text-white"
                          : active
                            ? "text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                      }`}
                      style={active ? { backgroundColor: categoryColor } : undefined}
                    >
                      {completed ? <CheckCircle2 size={12} /> : idx + 1}
                    </div>
                    <span
                      style={active ? { color: categoryColor } : undefined}
                      className={`text-[9px] text-center font-medium leading-tight ${active ? "" : "text-gray-400 dark:text-gray-500"}`}
                    >
                      {t(`paxManagement.steps.${step.key}`)}
                    </span>
                  </div>
                  {idx < PROGRESS_STEPS.length - 1 && (
                    <div className="flex-1 h-[2px] mb-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${idx < currentStepIdx ? "bg-emerald-600 w-full" : "w-0"}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pending proposal alert — soft tint (categoryColor at ~8%
              opacity), same idiom ManageBookingView's CancelTab already
              uses for its active refund-tier row, instead of a solid fill.
              Matches the rest of the app's banners (see e.g. manage_reserve's
              amber-50/emerald-50 payment banners) rather than standing out
              as its own, more saturated design language. */}
          {hasPendingProposal && (
            <div
              className="rounded-2xl border p-4"
              style={{ backgroundColor: `${categoryColor}0D`, borderColor: `${categoryColor}33` }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <AlertTriangle size={17} style={{ color: categoryColor }} />
                <h3 className="text-[14px] font-bold" style={{ color: categoryColor }}>
                  {t("paxManagement.proposal.title")}
                </h3>
              </div>
              <p className="text-[12px] text-gray-600 dark:text-gray-400 mb-3.5">{t("paxManagement.proposal.text")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={handleAccept}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold transition-colors"
                >
                  <CheckCircle2 size={14} /> {t("paxManagement.proposal.accept")}
                </button>
                <button
                  onClick={() => setShowRequestChanges(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800 text-[12px] font-semibold transition-colors"
                  style={{ color: categoryColor, borderColor: `${categoryColor}40` }}
                >
                  <MessageSquareText size={14} /> {t("paxManagement.proposal.requestChanges")}
                </button>
                <button
                  onClick={() => setShowReject(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-800/60 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-[12px] font-semibold transition-colors"
                >
                  <XCircle size={14} /> {t("paxManagement.proposal.reject")}
                </button>
              </div>
            </div>
          )}

          {/* Sign contract alert — same soft-tint idiom as above */}
          {status === "Sign_Contract" && (
            <div
              className="rounded-2xl border p-4"
              style={{ backgroundColor: `${categoryColor}0D`, borderColor: `${categoryColor}33` }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <FileSignature size={17} style={{ color: categoryColor }} />
                <h3 className="text-[14px] font-bold" style={{ color: categoryColor }}>
                  {t("paxManagement.contractAlert.title")}
                </h3>
              </div>
              <button
                onClick={handleSignContract}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-white text-[12px] font-semibold transition-colors"
                style={{ backgroundColor: categoryColor }}
              >
                <FileSignature size={14} /> {t("paxManagement.contractAlert.action")}
              </button>
            </div>
          )}

          {/* Waiting for payment alert — same amber-50/amber-200 idiom the
              rest of the app already uses for pending-payment banners. */}
          {status === "confirmed_vendor" && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20 p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <CreditCard size={17} className="text-amber-600 dark:text-amber-400" />
                <h3 className="text-[14px] font-bold text-amber-700 dark:text-amber-400">{t("paxManagement.paymentAlert.title")}</h3>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold transition-colors"
              >
                <CreditCard size={14} /> {t("paxManagement.paymentAlert.payNow")}
              </button>
            </div>
          )}

          <Card title={t("paxManagement.eventDetails.title")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <DetailItem Icon={MapPin} label={t("paxManagement.eventDetails.venue")} value={lead.venueName} />
              <DetailItem Icon={Users} label={t("paxManagement.eventDetails.eventType")} value={lead.eventType} />
              <DetailItem Icon={CalendarDays} label={t("paxManagement.eventDetails.eventDate")} value={formatDate(lead.eventDate)} />
              <DetailItem
                Icon={Users}
                label={t("paxManagement.eventDetails.guestCount")}
                value={t("paxManagement.eventDetails.guestsUnit", { count: lead.guestCount })}
              />

               <DetailItem Icon={CalendarDays} label='Package Name' value={b.paxPackages[0].packageName} />
               <DetailItem Icon={CalendarDays} label='Pax per Price' value={b.paxPackages[0].pricePerPax} />

              
            </div>
          </Card>
        </div>
      )}

      {activeTab === "menu" && (
        <Card
          title={t("paxManagement.menu.title")}
          description={lead.menu.type === "preset" ? t("paxManagement.menu.presetPackage") : t("paxManagement.menu.customMenu")}
        >
          <div className="space-y-3">
            {lead.menu.groups.map((group) => (
              <div key={group.category}>
                <h4 className="text-[11.5px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{group.category}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/60 text-[11px] text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <PaymentRow label={t("paxManagement.menu.perPersonCost")} value={format(Math.round(b.paxPackages[0].pricePerPax))} />
          <PaymentRow label={t("paxManagement.menu.guestCount")} value={t("paxManagement.eventDetails.guestsUnit", { count:b.paxPackages[0].paxCount })} />
          <PaymentRow label={t("paxManagement.menu.total")} value={format(Math.round(b.paxPackages[0].total))} />
          <PaymentRow label={t("paxManagement.menu.addonTotal")} value={format(Math.round(lead.addonTotal))} />
          <PaymentRow
            label={t("paxManagement.menu.totalAmount")}
            value={format(totalAmount)}
            bold
            highlight
            accentColor={categoryColor}
          />
        </Card>
      )}

      {/* Cancellation — same inline shape as ManageBookingView's CancelTab
          (info row → policy note → reason textarea + char count → warning
          box → full-width button that opens a confirm modal) instead of a
          bare description + pill that jumped straight to a modal. */}
      {activeTab === "cancel" && (
        <Card title={t("paxManagement.cancelSection.title")} description={t("paxManagement.cancelSection.description")}>
          {canCancel ? (
            <>
              <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                <CalendarDays size={16} style={{ color: categoryColor }} className="shrink-0" />
                <div>
                  <p className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-50">
                    {t("paxManagement.eventDetails.eventDate")}
                  </p>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400">{formatDate(lead.eventDate)}</p>
                </div>
              </div>

              <div
                className="rounded-xl border p-3 text-[12px] leading-relaxed"
                style={{ backgroundColor: `${categoryColor}0D`, borderColor: `${categoryColor}33`, color: categoryColor }}
              >
                {t("paxManagement.cancelSection.policyNote")}
              </div>

              <div>
                <label className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400">
                  {t("paxManagement.cancelSection.reasonLabel")}
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={4}
                  placeholder={t("paxManagement.cancelSection.reasonPlaceholder")}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-[13px] text-gray-900 dark:text-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
                <p className={`text-[11px] mt-1 ${isReasonValid ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                  {t("paxManagement.cancelSection.charCount", { count: cancellationReason.trim().length })}
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 p-3">
                <AlertTriangle size={15} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-semibold text-red-800 dark:text-red-300">{t("paxManagement.cancelSection.warningTitle")}</p>
                  <p className="text-[11.5px] text-red-700 dark:text-red-400 mt-0.5">{t("paxManagement.cancelSection.warningText")}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCancel(true)}
                disabled={!isReasonValid}
                className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-colors"
              >
                {t("paxManagement.cancelSection.button")}
              </button>
            </>
          ) : (
            <p className="text-[13px] text-gray-500 dark:text-gray-400">{t(`paxManagement.statusLabel.${paxStatusKey(status)}`)}</p>
          )}
        </Card>
      )}

      {/* Chat */}
      <Link
        href={`/${locale}/${country}/messages${b.conversationId ? `?conversation=${b.conversationId}` : ""}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-white text-[13px] font-semibold shadow-sm transition-transform active:scale-[0.98]"
        style={{ backgroundColor: categoryColor }}
      >
        <MessageCircle size={15} />
        {t("paxManagement.chatCta")}
      </Link>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <Modal
        open={showRequestChanges}
        onClose={() => setShowRequestChanges(false)}
        title={t("paxManagement.modals.requestChanges.title")}
        footer={
          <>
            <SecondaryButton onClick={() => setShowRequestChanges(false)}>
              {t("paxManagement.modals.requestChanges.cancel")}
            </SecondaryButton>
            <PrimaryButton onClick={handleRequestChanges} disabled={!changeRequest.trim()}>
              {t("paxManagement.modals.requestChanges.send")}
            </PrimaryButton>
          </>
        }
      >
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-3">
          {t("paxManagement.modals.requestChanges.description")}
        </p>
        <textarea
          rows={4}
          value={changeRequest}
          onChange={(e) => setChangeRequest(e.target.value)}
          placeholder={t("paxManagement.modals.requestChanges.placeholder")}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </Modal>

      <Modal
        open={showReject}
        onClose={() => setShowReject(false)}
        title={t("paxManagement.modals.reject.title")}
        tone="danger"
        footer={
          <>
            <SecondaryButton onClick={() => setShowReject(false)}>{t("paxManagement.modals.reject.cancel")}</SecondaryButton>
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[12.5px] font-semibold transition-colors"
            >
              {t("paxManagement.modals.reject.confirm")}
            </button>
          </>
        }
      >
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-3">{t("paxManagement.modals.reject.description")}</p>
        <textarea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder={t("paxManagement.modals.reject.placeholder")}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </Modal>

      {/* Confirm step only — the reason itself is now captured inline in the
          Cancellation tab (see isReasonValid), same as ManageBookingView's
          CancelTab confirm modal not re-asking for anything already given. */}
      <Modal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        title={t("paxManagement.modals.cancelBooking.title")}
        tone="warning"
        footer={
          <>
            <SecondaryButton onClick={() => setShowCancel(false)}>{t("paxManagement.modals.cancelBooking.keep")}</SecondaryButton>
            <button
              onClick={handleCancel}
              disabled={!isReasonValid || submitting}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[12.5px] font-semibold transition-colors"
            >
              {t("paxManagement.modals.cancelBooking.confirm")}
            </button>
          </>
        }
      >
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400">{t("paxManagement.modals.cancelBooking.description")}</p>
      </Modal>

      <Modal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        title={t("paxManagement.modals.payment.title")}
        footer={
          <>
            <SecondaryButton onClick={() => setShowPayment(false)}>{t("paxManagement.modals.payment.close")}</SecondaryButton>
            <PrimaryButton onClick={handlePay} disabled={submitting}>
              {t("paxManagement.modals.payment.pay")}
            </PrimaryButton>
          </>
        }
      >
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-3">{t("paxManagement.modals.payment.confirmText")}</p>
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 p-3.5 space-y-2">
          <PaymentRow label={t("paxManagement.modals.payment.venueRental")} value={format(Math.round(lead.totalEstimate))} />
          <PaymentRow label={t("paxManagement.modals.payment.addonTotal")} value={format(Math.round(lead.addonTotal))} />
          <PaymentRow label={t("paxManagement.modals.payment.serviceCharges")} value={format(serviceCharges)} />
          <PaymentRow label={t("paxManagement.modals.payment.taxes")} value={format(taxesAndFees)} />
          <PaymentRow label={t("paxManagement.modals.payment.securityDeposit")} value={format(securityDeposit)} />
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
          <PaymentRow
            label={t("paxManagement.modals.payment.totalAmount")}
            value={format(payTotal)}
            bold
            highlight
            accentColor={categoryColor}
          />
        </div>
      </Modal>
    </div>
  );
}

export default PaxBookingView;
