"use client";

/**
 * /app/[locale]/[country]/profile/pax-management/[id]/page.jsx
 *
 * Standalone "Manage Your Booking" detail page for a pax / group-catering
 * enquiry (the customer side of the negotiation lifecycle: submitted →
 * review → negotiating → customer approval → contract → confirmed →
 * payment). Adapted from a reference Vue implementation
 * (CustomerBookingDetail.vue) into this app's own React/Tailwind/next-intl
 * stack, reusing the same card/button primitives as the rest of /profile
 * (see ./shared/ui.jsx) so it reads as part of the same dashboard rather
 * than a bolt-on page.
 *
 * SCOPE DECISIONS:
 *   - The reference page's backend (userService.get_leads_detail,
 *     backendService.acceptProposal/enquire_cancelBooking, a socket.io
 *     connection, and a direct Cashfree payment component) has no
 *     equivalent here yet — `services/booking.service.js` only exposes
 *     `leads_create` (creating a new lead), not fetching/mutating one by
 *     id. So this page renders from local sample data and every
 *     status-changing action (accept/reject/request changes/cancel/pay)
 *     updates local state and shows a "preview only" toast instead of
 *     calling a real endpoint — same honesty pattern ManageBookingView.jsx
 *     already uses for its mocked payment flow. Swap `loadLead()` for a
 *     real API call once a get-lead-by-id endpoint exists.
 *   - Chat is a single CTA linking into the existing /messages route
 *     (same pattern PaxBookingView.jsx already uses) instead of embedding
 *     a second, parallel chat UI — this app already has one chat system
 *     (ConversationList/ChatThread) shared by customer and vendor.
 *   - BookingCard.jsx links its "Manage" button straight here for
 *     bookingStatus === "pax" (bypassing the generic Manage modal), passing
 *     venue/guests/amount/date as query params so the sample lead below
 *     reflects the booking that was actually clicked instead of always
 *     showing the same placeholder venue — a stand-in for a real
 *     get-lead-by-id fetch, not a permanent data-passing mechanism.
 */

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Building2,
  PartyPopper,
  CalendarDays,
  Users,
  MessageCircle,
  CheckCircle2,
  XCircle,
  MessageSquareText,
  FileSignature,
  CreditCard,
  AlertTriangle,
  X,
} from "lucide-react";

import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/components/ToastProvider";
import {
  SectionCard,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  SkeletonBlock,
} from "../../components/shared/ui";

/* ── Sample data — stands in until a get-lead-by-id endpoint exists ──── */
const SAMPLE_LEAD = {
  id: "ENQ-10482",
  status: "Negotiating", // New | Review | Negotiating | pending_customer_approval | Sign_Contract | confirmed | confirmed_vendor | Rejected | Cancelled
  venueName: "Grand Palace Banquet Hall",
  eventType: "Wedding Reception",
  eventDate: "2026-12-15",
  guestCount: 300,
  menu: {
    type: "custom",
    groups: [
      { category: "Starters & Soups", items: ["Paneer Tikka", "Hara Bhara Kebab", "Tomato Soup"] },
      { category: "Main Course", items: ["Butter Chicken", "Veg Biryani", "Dal Makhani"] },
      { category: "Desserts", items: ["Gulab Jamun", "Kheer"] },
    ],
  },
  perPersonCost: 730,
  totalEstimate: 219000,
  addonTotal: 15000,
  specialRequests: "",
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

const STATUS_TONE = {
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

const formatDate = (dateString) =>
  dateString
    ? new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "long", day: "numeric" }).format(
        new Date(dateString),
      )
    : "—";

/* ── Collapsible card (matches PaxBookingView / manage_reserve chevron pattern) ── */
function CollapsibleCard({ title, icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <SectionCard padded={false} className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5"
      >
        <h3 className="flex items-center gap-2 text-[13.5px] font-semibold text-gray-900 dark:text-gray-50">
          {icon}
          {title}
        </h3>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

/* ── Small modal shell shared by the four dialogs below ──────────────── */
function Modal({ open, onClose, title, tone = "violet", children, footer }) {
  const TONE_HEADER = {
    violet: "text-violet-600 dark:text-violet-400",
    danger: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
  };
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

export default function PaxManagementCustomerPage() {
  // useSearchParams requires a Suspense boundary at the page level.
  return (
    <Suspense fallback={null}>
      <PaxManagementCustomerPageInner />
    </Suspense>
  );
}

function PaxManagementCustomerPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale || "en";
  const country = params?.country || "in";
  const id = params?.id;

  const t = useTranslations("profile.bookings.paxManagement");
  const { format } = useCurrency();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);

  const [changeRequest, setChangeRequest] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  const [showRequestChanges, setShowRequestChanges] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // TODO: replace with a real fetch once a get-lead-by-id endpoint exists.
  // Until then, fields carried in the URL (see BookingCard.jsx) override the
  // sample data so this page reflects the booking that was actually clicked.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      if (!cancelled) {
        const venue = searchParams.get("venue");
        const guests = searchParams.get("guests");
        const amount = searchParams.get("amount");
        const date = searchParams.get("date");

        const overrides = {};
        if (venue) overrides.venueName = venue;
        if (date) overrides.eventDate = date;
        if (guests) overrides.guestCount = Number(guests);
        if (amount) {
          overrides.totalEstimate = Number(amount);
          overrides.addonTotal = 0;
          overrides.perPersonCost = guests
            ? Math.round(Number(amount) / Number(guests))
            : SAMPLE_LEAD.perPersonCost;
        }

        setLead({ ...SAMPLE_LEAD, id: id || SAMPLE_LEAD.id, ...overrides });
        setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, searchParams]);

  const currentStepIdx = useMemo(
    () => PROGRESS_STEPS.findIndex((s) => s.status === lead?.status),
    [lead?.status],
  );

  const totalAmount = lead ? Math.round((lead.totalEstimate || 0) + (lead.addonTotal || 0)) : 0;
  const securityDeposit = 5000;
  const serviceCharges = 99;
  const taxesAndFees = lead ? Math.round(((lead.totalEstimate || 0) * 0.05) + ((lead.addonTotal || 0) * 0.18)) : 0;
  const payTotal = totalAmount + securityDeposit + serviceCharges + taxesAndFees;

  const canCancel = lead && !["confirmed", "Cancelled"].includes(lead.status);
  const hasPendingProposal = lead && ["Negotiating", "pending_customer_approval"].includes(lead.status);

  function previewToast() {
    toast.info(t("previewNotice"));
  }

  function handleAccept() {
    setLead((prev) => ({ ...prev, status: "pending_customer_approval" }));
    toast.success(t("proposal.accept"));
    previewToast();
  }

  function handleRequestChanges() {
    if (!changeRequest.trim()) return;
    setShowRequestChanges(false);
    setChangeRequest("");
    setLead((prev) => ({ ...prev, status: "Review" }));
    previewToast();
  }

  function handleReject() {
    if (!rejectionReason.trim()) return;
    setShowReject(false);
    setRejectionReason("");
    setLead((prev) => ({ ...prev, status: "Rejected" }));
    previewToast();
  }

  function handleCancel() {
    if (!cancellationReason.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setShowCancel(false);
      setCancellationReason("");
      setLead((prev) => ({ ...prev, status: "Cancelled" }));
      setSubmitting(false);
      previewToast();
    }, 400);
  }

  function handleSignContract() {
    setLead((prev) => ({ ...prev, status: "confirmed_vendor" }));
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

  if (loading || !lead) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-0 py-6 space-y-4">
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonBlock className="h-24 w-full" />
        <SkeletonBlock className="h-40 w-full" />
        <SkeletonBlock className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0 py-5 space-y-4">
      {/* Back */}
      <Link
        href={`/${locale}/${country}/profile`}
        className="inline-flex items-center gap-2 text-[12.5px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft size={14} />
        {t("backButton")}
      </Link>

      {/* Header + progress */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              {t("title")}
            </h1>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
              {t("refNo")}: <span className="font-semibold text-gray-800 dark:text-gray-200">{lead.id}</span>
            </p>
          </div>
          <span
            className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold ${
              {
                violet: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
                gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
                amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                green: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                red: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
              }[STATUS_TONE[lead.status] || "gray"]
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {t(`statusLabel.${statusKey(lead.status)}`)}
          </span>
        </div>

        {/* Progress steps */}
        <div className="flex items-start">
          {PROGRESS_STEPS.map((step, idx) => {
            const completed = idx < currentStepIdx;
            const active = idx === currentStepIdx;
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5 w-14 sm:w-20">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                      completed
                        ? "bg-emerald-600 text-white"
                        : active
                          ? "bg-violet-600 text-white shadow-[0_0_0_4px_rgba(124,58,237,0.15)]"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {completed ? <CheckCircle2 size={13} /> : idx + 1}
                  </div>
                  <span
                    className={`text-[9.5px] sm:text-[10.5px] text-center font-medium leading-tight ${
                      active ? "text-violet-600 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {t(`steps.${step.key}`)}
                  </span>
                </div>
                {idx < PROGRESS_STEPS.length - 1 && (
                  <div className="flex-1 h-[2px] mb-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx < currentStepIdx ? "bg-emerald-600 w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Pending proposal alert */}
      {hasPendingProposal && (
        <div className="rounded-2xl bg-violet-600 text-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <AlertTriangle size={18} />
            <h3 className="text-[14.5px] font-bold">{t("proposal.title")}</h3>
          </div>
          <p className="text-[12.5px] text-violet-50 mb-4">{t("proposal.text")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={handleAccept}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[12.5px] font-semibold transition-colors"
            >
              <CheckCircle2 size={14} /> {t("proposal.accept")}
            </button>
            <button
              onClick={() => setShowRequestChanges(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-violet-700 text-[12.5px] font-semibold transition-colors"
            >
              <MessageSquareText size={14} /> {t("proposal.requestChanges")}
            </button>
            <button
              onClick={() => setShowReject(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-white/70 hover:bg-white/10 text-white text-[12.5px] font-semibold transition-colors"
            >
              <XCircle size={14} /> {t("proposal.reject")}
            </button>
          </div>
        </div>
      )}

      {/* Sign contract alert */}
      {lead.status === "Sign_Contract" && (
        <div className="rounded-2xl bg-violet-600 text-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <FileSignature size={18} />
            <h3 className="text-[14.5px] font-bold">{t("contractAlert.title")}</h3>
          </div>
          <button
            onClick={handleSignContract}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-violet-700 text-[12.5px] font-semibold transition-colors"
          >
            <FileSignature size={14} /> {t("contractAlert.action")}
          </button>
        </div>
      )}

      {/* Waiting for payment alert */}
      {lead.status === "confirmed_vendor" && (
        <div className="rounded-2xl bg-amber-500 text-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <CreditCard size={18} />
            <h3 className="text-[14.5px] font-bold">{t("paymentAlert.title")}</h3>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-amber-700 text-[12.5px] font-semibold transition-colors"
          >
            <CreditCard size={14} /> {t("paymentAlert.payNow")}
          </button>
        </div>
      )}

      {/* Event details */}
      <CollapsibleCard title={t("eventDetails.title")} icon={<Building2 size={15} className="text-violet-600" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailItem icon={<Building2 size={14} />} label={t("eventDetails.venue")} value={lead.venueName} />
          <DetailItem icon={<PartyPopper size={14} />} label={t("eventDetails.eventType")} value={lead.eventType} />
          <DetailItem icon={<CalendarDays size={14} />} label={t("eventDetails.eventDate")} value={formatDate(lead.eventDate)} />
          <DetailItem
            icon={<Users size={14} />}
            label={t("eventDetails.guestCount")}
            value={t("eventDetails.guestsUnit", { count: lead.guestCount })}
          />
        </div>
      </CollapsibleCard>

      {/* Menu & pricing */}
      <CollapsibleCard title={t("menu.title")} icon={<Users size={15} className="text-violet-600" />}>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
          {lead.menu.type === "preset" ? t("menu.presetPackage") : t("menu.customMenu")}
        </p>
        <div className="space-y-3 mb-4">
          {lead.menu.groups.map((group) => (
            <div key={group.category}>
              <h4 className="text-[11.5px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {group.category}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/60 text-[11px] text-gray-700 dark:text-gray-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 p-3.5 space-y-2">
          <PriceRow label={t("menu.perPersonCost")} value={format(Math.round(lead.perPersonCost))} />
          <PriceRow label={t("menu.guestCount")} value={t("eventDetails.guestsUnit", { count: lead.guestCount })} />
          <PriceRow label={t("menu.total")} value={format(Math.round(lead.totalEstimate))} />
          <PriceRow label={t("menu.addonTotal")} value={format(Math.round(lead.addonTotal))} />
          <PriceRow label={t("menu.totalAmount")} value={format(totalAmount)} bold accent />
        </div>
      </CollapsibleCard>

      {/* Cancel section */}
      {canCancel && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-4">
          <p className="text-[12px] text-red-600 dark:text-red-400 mb-2.5">{t("cancelSection.text")}</p>
          <button
            onClick={() => setShowCancel(true)}
            className="text-[12px] font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-full px-3.5 py-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            {t("cancelSection.button")}
          </button>
        </div>
      )}

      {/* Chat CTA */}
      <Link
        href={`/${locale}/${country}/messages`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-white text-[13px] font-semibold shadow-sm bg-violet-600 hover:bg-violet-700 transition-colors active:scale-[0.98]"
      >
        <MessageCircle size={15} />
        {t("chatCta")}
      </Link>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <Modal
        open={showRequestChanges}
        onClose={() => setShowRequestChanges(false)}
        title={t("modals.requestChanges.title")}
        footer={
          <>
            <SecondaryButton onClick={() => setShowRequestChanges(false)}>
              {t("modals.requestChanges.cancel")}
            </SecondaryButton>
            <PrimaryButton onClick={handleRequestChanges} disabled={!changeRequest.trim()}>
              {t("modals.requestChanges.send")}
            </PrimaryButton>
          </>
        }
      >
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-3">
          {t("modals.requestChanges.description")}
        </p>
        <textarea
          rows={4}
          value={changeRequest}
          onChange={(e) => setChangeRequest(e.target.value)}
          placeholder={t("modals.requestChanges.placeholder")}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </Modal>

      <Modal
        open={showReject}
        onClose={() => setShowReject(false)}
        title={t("modals.reject.title")}
        tone="danger"
        footer={
          <>
            <SecondaryButton onClick={() => setShowReject(false)}>{t("modals.reject.cancel")}</SecondaryButton>
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[12.5px] font-semibold transition-colors"
            >
              {t("modals.reject.confirm")}
            </button>
          </>
        }
      >
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-3">{t("modals.reject.description")}</p>
        <textarea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder={t("modals.reject.placeholder")}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </Modal>

      <Modal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        title={t("modals.cancelBooking.title")}
        tone="warning"
        footer={
          <>
            <SecondaryButton onClick={() => setShowCancel(false)}>{t("modals.cancelBooking.keep")}</SecondaryButton>
            <button
              onClick={handleCancel}
              disabled={!cancellationReason.trim() || submitting}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-[12.5px] font-semibold transition-colors"
            >
              {t("modals.cancelBooking.confirm")}
            </button>
          </>
        }
      >
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-3">
          {t("modals.cancelBooking.description")}
        </p>
        <textarea
          rows={4}
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder={t("modals.cancelBooking.placeholder")}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent p-3 text-[13px] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </Modal>

      <Modal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        title={t("modals.payment.title")}
        footer={
          <>
            <SecondaryButton onClick={() => setShowPayment(false)}>{t("modals.payment.close")}</SecondaryButton>
            <PrimaryButton onClick={handlePay} disabled={submitting}>
              {t("modals.payment.pay")}
            </PrimaryButton>
          </>
        }
      >
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mb-3">{t("modals.payment.confirmText")}</p>
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 p-3.5 space-y-2">
          <PriceRow label={t("modals.payment.venueRental")} value={format(Math.round(lead.totalEstimate))} />
          <PriceRow label={t("modals.payment.addonTotal")} value={format(Math.round(lead.addonTotal))} />
          <PriceRow label={t("modals.payment.serviceCharges")} value={format(serviceCharges)} />
          <PriceRow label={t("modals.payment.taxes")} value={format(taxesAndFees)} />
          <PriceRow label={t("modals.payment.securityDeposit")} value={format(securityDeposit)} />
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
          <PriceRow label={t("modals.payment.totalAmount")} value={format(payTotal)} bold accent />
        </div>
      </Modal>
    </div>
  );
}

/* ── Small presentational helpers ─────────────────────────────────────── */
function statusKey(status) {
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

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-50 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function PriceRow({ label, value, bold, accent }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-[12px] ${bold ? "font-semibold text-gray-900 dark:text-gray-50" : "text-gray-500 dark:text-gray-400"}`}>
        {label}
      </span>
      <span
        className={`text-[12.5px] ${
          accent
            ? "font-bold text-violet-600 dark:text-violet-400 text-[14px]"
            : bold
              ? "font-semibold text-gray-900 dark:text-gray-50"
              : "text-gray-800 dark:text-gray-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
