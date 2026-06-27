"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar, MapPin, User, Mail, Phone, Clock, FileText,
  Download, Edit, ChevronRight, CheckCircle2, Circle, Plus,
  Bell, MoreHorizontal, Users, Package, CreditCard, ClipboardList,
  History, Copy, X, AlertCircle, ChevronDown, IndianRupee,
  MessageCircle, Send, RefreshCw, Receipt, CheckCheck,
  AlertTriangle, Lock, Unlock, Timer, Loader2, Sparkles,
  RotateCcw, Eye, Printer, ChevronUp, Minus, Info, Tag,
  ShoppingBag, Zap, Shield, Search, Trash2, ArrowRight,
  LayoutGrid, AlertOctagon
} from "lucide-react";

import { useRouter , useParams } from "next/navigation";

import { download_invoice, reservation_manage , add_payment} from "@/services/booking.service";
import { startConversation , conservation_messages, send_messages } from "@/services/chat.service";


/* ─── BOOKING CONSTANTS ─── */


const TABS = [
  { id: "overview", label: "Overview", icon: ClipboardList },
  { id: "event", label: "Event Details", icon: Calendar },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "addons", label: "Add-ons", icon: ShoppingBag },
  { id: "packages", label: "Packages", icon: Package },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "history", label: "History", icon: History },
];

const METHODS = ["Cash", "UPI", "Bank Transfer", "Credit Card", "Cheque", "Other"];

const buffetMenu = {
  "Main Course": ["Eggplant Parmesan", "Chicken Alfredo", "Ribeye Steak", "Grilled Salmon"],
  Salads: ["Caesar Salad", "Greek Salad"],
  Sides: ["Mashed Potatoes", "Roasted Asparagus", "Truffle Fries"],
  Desserts: ["Chocolate Mousse", "Cheesecake", "Brownie"],
  Beverages: ["Fresh Lime Soda", "Iced Tea", "Water"],
};

// FIX: all inputs are now coerced with Number(... || 0) so a missing/undefined
// field on `Booking` or `paidSoFar` can never poison the result into NaN.
function computeSplit(amount, paidSoFar, Booking) {
  const basePrice = Number(Booking?.basePrice || 0);
  const gst = Number(Booking?.gst || 0);
  const addonTotal = Number(Booking?.addonTotal || 0);
  const securityDeposit = Number(Booking?.securityDeposit || 0);

  const paidBase = Number(paidSoFar?.basePrice || 0);
  const paidAddon = Number(paidSoFar?.addon || 0);
  const paidSecurity = Number(paidSoFar?.security || 0);

  const remainBase = Math.max(0, basePrice + gst - paidBase);
  const remainAddon = Math.max(0, addonTotal - paidAddon);
  const remainSecurity = Math.max(0, securityDeposit - paidSecurity);

  let left = Number(amount || 0);
  const toBase = Math.min(left, remainBase); left -= toBase;
  const toAddon = Math.min(left, remainAddon); left -= toAddon;
  const toSecurity = Math.min(left, remainSecurity); left -= toSecurity;
  return { toBase, toAddon, toSecurity, excess: left };
}

/* ─── LOADING SKELETON ─── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-violet-100" />
          <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading booking details…</p>
      </div>
    </div>
  );
}

/* ─── ROOT ─── */
export default function BookingDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [reserve, setReserve] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  const [messages, setMessages] = useState([]);

  // FIX A: Booking is now initialized with safe numeric defaults instead of {}.
  // Before this fix, any read of Booking.basePrice / Booking.gst / etc. before
  // the summary effect ran would be `undefined`, and undefined + undefined = NaN.
  // This is what produced the "₹NaN" in the Add Payment modal on first render
  // (e.g. opening the modal quickly, or whenever `reserve.charges` is empty/missing).
  const [Booking, setBooking] = useState({
    basePrice: 0,
    addonTotal: 0,
    securityDeposit: 0,
    gst: 0,
  });

const customer = reserve?.parties?.find(p => p.party_type === "customer");
const venue = reserve?.venues?.[0]?.venue_name_snapshot;

const caterer = reserve?.parties?.find(p => p.party_type === "caterer");
const decorator = reserve?.parties?.find(p => p.party_type === "decorator");
const sound_system = reserve?.parties?.find(p => p.party_type === "sound_system");
const music_troupe = reserve?.parties?.find(p => p.party_type === "music_troupe");

  const baseamount = reserve?.charges?.find(p => p.charge_type === "base");




  const [receipts, setReceipts] = useState([]);

  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [showInvoiceConfirm, setShowInvoiceConfirm] = useState(false);
  const [refundDone, setRefundDone] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [addons, setAddons] = useState([]);
  const [topProgress, setTopProgress] = useState(0);

  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
  if (reserve?.charges) {
    setAddons(
      reserve.charges.filter(
        charge => charge.charge_type === "addon"
      )
    );
  }

  if (reserve?.payments) {
    setReceipts(reserve.payments);
  }



}, [reserve]);


//SUMMARY
useEffect(() => {
  if (!reserve) return;

  // 1. Addons
  const addonCharges = (reserve.charges || []).filter(
    charge => charge.charge_type === "addon"
  );

  setAddons(addonCharges);

  // 2. Payments
  setReceipts(reserve.payments || []);

  // 3. Charges summary
  // FIX B: the reducer now ACCUMULATES gst (acc.gst += amount) instead of
  // overwriting it to 0 on every "gst" charge row. The old `acc.gst = 0;`
  // line silently discarded any actual GST amount returned by the API,
  // which combined with Booking starting as {} is the second source of NaN/0.
  const summary = (reserve.charges || []).reduce(
    (acc, item) => {
      const amount = Number(item.total_price || 0);

      if (item.charge_type === "base") {
        acc.base += amount;
      } else if (item.charge_type === "addon") {
        acc.addon += amount;
      } else if (item.charge_type === "security_deposit") {
        acc.security += amount;
      } else if (item.charge_type === "gst") {
        acc.gst += amount;
      }

      return acc;
    },
    {
      base: 0,
      addon: 0,
      security: 0,
      gst: 0,
    }
  );

  // NOTE (point E): if your API never sends a separate "gst" charge_type
  // (i.e. GST is already folded into the "base" row's total_price), `summary.gst`
  // will correctly stay 0 here and basePrice already includes tax — that's fine,
  // just don't double-count it elsewhere. Confirm this against a real
  // `reserve.charges` payload; console.log it once if unsure (see note below).
  setBooking({
    basePrice: summary.base,
    addonTotal: summary.addon,
    securityDeposit: summary.security,
    gst: summary.gst,
  });

}, [reserve]);
//SUMMARY



  const [refundEnabled, setRefundEnabled] = useState(false);
  const [chatRefno, setChatRefno] = useState(0);

  const router = useRouter();
    const params   = useParams();
useEffect(() => {
  let interval;
  let progress = 0;

  const fetchData = async () => {
    try {
      // Start progress bar
      interval = setInterval(() => {
        progress += Math.random() * 15;

        if (progress >= 90) {
          progress = 90;
          clearInterval(interval);
        }

        setTopProgress(progress);
      }, 80);

      // API call
      const res = await reservation_manage(params.id);
      setReserve(res?.data || null);

      // Finish progress
      setTopProgress(100);

      setTimeout(() => {
        setTopProgress(0);
        setLoading(false);
      }, 400);

    } catch (err) {
      console.error(err);
      setReserve(null);
      setLoading(false);
      setTopProgress(0);
    } finally {
      if (interval) clearInterval(interval);
    }
  };

  fetchData();

  return () => {
    if (interval) clearInterval(interval);
  };
}, [params.id]);


 const addon_total = (addons || []).reduce((sum, item) => sum + Number(item?.total_price || 0),0)


// FIX: paidSoFar now also starts with safe defaults, mirroring Booking.
// (It was already recalculated on every `receipts` change below, but this
// guards the very first render before that effect has run.)
const [paidSoFar, setPaidSoFar] = useState({ basePrice: 0, addon: 0, security: 0 });

useEffect(() => {
  const basePaid = receipts
    .filter(p => p.payment_type === "base_amount")
    .reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);

  const addonPaid = receipts
    .filter(p => p.payment_type === "addon")
    .reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);

  const securityPaid = receipts
    .filter(p => p.payment_type === "security_deposit")
    .reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);

  const paid_slabs = {
    basePrice: basePaid,
    addon: addonPaid,
    security: securityPaid,
  };

  setPaidSoFar(paid_slabs);
}, [receipts]);



// FIX: defensive Number(... || 0) so a transient undefined in paidSoFar
// (e.g. before the effect above first runs) can't turn totalPaid into NaN
// and cascade into `remaining` below.
const totalPaid =
  Number(paidSoFar.basePrice || 0) +
  Number(paidSoFar.addon || 0) +
  Number(paidSoFar.security || 0);

  const grandTotal = reserve?.balance_amount;


  const remaining = Math.max(
  0,
  Number(grandTotal || 0) +
    Number(Booking.securityDeposit || 0) -
    Number(totalPaid || 0)
);

  //Booking Summary Date

  const eventDate = reserve?.event_dates?.[0]?.event_date;
  const bookingDate = reserve?.created_at;
  const remainderdate = '2026-06-23T08:22:26.000Z';

  //booking timer

  const booking_type = reserve?.booking_type; //type = booked | reserve | quotation
  const reserveEndDate = '2026-06-23T08:22:26.000Z';
  const quotationExpireDate = '2026-06-25T08:22:26.000Z';

  // Temporary diagnostic logs (point in the report). Safe to remove once the
  // API shape for `charges` is confirmed in production — left in as comments
  // so you can re-enable instantly if ₹NaN resurfaces somewhere else.
  // console.log("Booking", Booking);
  // console.log("paidSoFar", paidSoFar);
  // console.log("charges", reserve?.charges);


  const isEventPast = eventDate ? new Date(eventDate) < new Date() : false;
  const isFullyPaid = remaining === 0;
  const canRefund = isEventPast && isFullyPaid && !invoiceGenerated;
  const canInvoice = isEventPast && isFullyPaid && refundDone;
  const canGenerateInvoice = canInvoice || (isEventPast && isFullyPaid && !refundDone && refundDone === false);

  // function handlePaymentSave(payment, split) {
  //   const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  //   const newReceipts = [];
  //   if (split.toBase > 0) newReceipts.push({ date: today, type: "Base Price", amount: split.toBase, method: payment.method, status: "Paid" });
  //   if (split.toAddon > 0) newReceipts.push({ date: today, type: "Add-on", amount: split.toAddon, method: payment.method, status: "Paid" });
  //   if (split.toSecurity > 0) newReceipts.push({ date: today, type: "Security Deposit", amount: split.toSecurity, method: payment.method, status: "Paid" });
  //   setReceipts(prev => [...prev, ...newReceipts]);
  //   setPaidSoFar(prev => ({
  //     basePrice: Number(prev.basePrice || 0) + Number(split.toBase || 0),
  //     addon: Number(prev.addon || 0) + Number(split.toAddon || 0),
  //     security: Number(prev.security || 0) + Number(split.toSecurity || 0),
  //   }));
  //   setShowModal(false);

  //   await add_payment()
  // }

  

async function handlePaymentSave(payment, split) {
  try {
    setSavingPayment(true);

    const payload = [];

    if (split.toBase > 0) {
      payload.push({
        payment_type: "base_amount",
        payment_method: payment.method,
        amount_paid: split.toBase,
        payment_date: payment.date,
        notes: payment.note,
      });
    }

    if (split.toAddon > 0) {
      payload.push({
        payment_type: "addon",
        payment_method: payment.method,
        amount_paid: split.toAddon,
        payment_date: payment.date,
        notes: payment.note,
      });
    }

    if (split.toSecurity > 0) {
      payload.push({
        payment_type: "security_deposit",
        payment_method: payment.method,
        amount_paid: split.toSecurity,
        payment_date: payment.date,
        notes: payment.note,
      });
    }

    // Save payment in DB
    await add_payment({
      booking_id: reserve.id,
      payments: payload,
    });

    // Update UI only after success
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newReceipts = [];

    if (split.toBase > 0) {
      newReceipts.push({
        date: today,
        type: "Base Price",
        amount: split.toBase,
        method: payment.method,
        status: "Paid",
      });
    }

    if (split.toAddon > 0) {
      newReceipts.push({
        date: today,
        type: "Add-on",
        amount: split.toAddon,
        method: payment.method,
        status: "Paid",
      });
    }

    if (split.toSecurity > 0) {
      newReceipts.push({
        date: today,
        type: "Security Deposit",
        amount: split.toSecurity,
        method: payment.method,
        status: "Paid",
      });
    }

    setReceipts(prev => [...prev, ...newReceipts]);

    setPaidSoFar(prev => ({
      basePrice: Number(prev.basePrice || 0) + Number(split.toBase || 0),
      addon: Number(prev.addon || 0) + Number(split.toAddon || 0),
      security: Number(prev.security || 0) + Number(split.toSecurity || 0),
    }));

    setShowModal(false);

  } catch (error) {
    console.error("Payment save failed:", error);

    alert(
      error?.response?.data?.message ||
      "Failed to save payment"
    );
  } finally {
    setSavingPayment(false);
  }
}

  if (loading) return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-violet-100 overflow-hidden">
        <div className="h-full bg-violet-600 transition-all duration-200 ease-out rounded-full"
          style={{ width: `${topProgress}%`, opacity: topProgress > 0 && topProgress < 100 ? 1 : 0 }} />
      </div>
      <LoadingSkeleton />
    </>
  );

            const downloadPdf = async () => {

 // window.open(`http://localhost:3000/invoice/download/${reserve.id}`, "_blank");
               window.open(
  `${process.env.NEXT_PUBLIC_API_URL}/invoice/download/${params.id}`,
  "_blank"
);
};


const openChat = async () => {
  const res = await startConversation({
    booking_id: reserve.id,
    customer_id: customer.id,
  });

   const resp = await conservation_messages(res.data.conversation_id);
  setMessages(resp.data)
  // setConversationId(res.conversation_id);
  setChatRefno(res.data.conversation_id)
  setShowChat(true);
};

  return (
    <div className="min-h-screen font-sans text-md">
      {/* TOP PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
        <div className="h-full bg-violet-600 transition-all duration-300 ease-out"
          style={{ width: `${topProgress}%`, opacity: topProgress > 0 && topProgress < 100 ? 1 : 0 }} />
      </div>

      {/* MODALS */}
      {showModal && <AddPaymentModal Booking={Booking} paidSoFar={paidSoFar} onClose={() => setShowModal(false)} onSave={handlePaymentSave} />}
      {showInvoiceConfirm && (
        <ConfirmModal
          title="Generate Final Invoice"
          message="This will lock the booking and generate a final invoice. All edit options will be disabled. Continue?"
          confirmLabel="Generate Invoice"
          confirmColor="violet"
          onConfirm={() => { setInvoiceGenerated(true); setShowInvoiceConfirm(false); }}
          onClose={() => setShowInvoiceConfirm(false)}
        />
      )}
      {showRefundModal && (
        <RefundModal
          securityDeposit={Number(Booking.securityDeposit || 0)}
          onClose={() => setShowRefundModal(false)}
          onConfirm={() => { setRefundDone(true); setShowRefundModal(false); }}
        />
      )}
      {editSection && <EditModal section={editSection} reserve={reserve} setReserve={setReserve} onClose={() => setEditSection(null)} />}
      {showChat && <ChatPanel chatRefno = {  chatRefno } messages = {  messages } onClose={() => setShowChat(false)} customerName={customer?.name} />}

      {/* HEADER */}
      <header className=" border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
          
          </div>
          <div className="flex items-center gap-2">
            {!invoiceGenerated && (
              <>
              {/* setShowChat(true) */}
                <button onClick={() => openChat()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-all">
                  <MessageCircle size={13} /> Chat
                </button>
                <button onClick={() => downloadPdf()}
                   className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-all">
                  <Download size={13} /> PDF
                </button>
                <button onClick={() => setEditSection("booking")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-all">
                  <Edit size={13} /> Edit Booking
                </button>

      
              </>
            )}
            {invoiceGenerated && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-all">
                <Eye size={13} /> View Invoice
              </button>
            )}
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
              <MoreHorizontal size={14} className="text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      <div className=" py-5 space-y-4">

        {/* INVOICE LOCKED BANNER */}
        {invoiceGenerated && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCheck size={16} className="text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-700 font-medium">Invoice has been generated. This booking is now locked and read-only.</p>
            <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all">
              <Printer size={12} /> Print Invoice
            </button>
          </div>
        )}

        {/* PENDING PAYMENT BANNER */}
        {!invoiceGenerated && !isFullyPaid && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertTriangle size={15} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              Balance of <strong>₹{remaining.toLocaleString("en-IN")}</strong> is pending. Please collect payment before generating invoice.
            </p>
            <button onClick={() => setShowModal(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-all">
              <Plus size={12} /> Pay Now
            </button>
          </div>
        )}

        {/* SUMMARY BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <SummaryItem icon={Calendar} iconBg="bg-violet-100" iconColor="text-violet-600"
              label="Booking ID" value={`#${reserve.refNo}`} sub={<Copy size={11} className="text-slate-400 cursor-pointer hover:text-slate-600 inline ml-1" />} />
            <HDivider />
            <SummaryItem icon={User} label="Customer" value={customer?.name} sub={customer?.phone} />
            <HDivider />
            <SummaryItem icon={MapPin} label="Venue" value={venue?.split(",")[0]} sub={venue?.split(",")[1]?.trim()} />
            <HDivider />
           {/* <SummaryItem icon={Calendar} label="Event Date"
              value={eventDate ? new Date(eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              sub={`${reserve.shifts[0].shift_name} · 12:00 PM – 6:00 PM`} />*/}
            <HDivider />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {reserve.status}
              </span>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total Amount</p>
              <p className="text-xl font-black text-violet-600">₹{Number(grandTotal || 0).toLocaleString("en-IN")}</p>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                <span className="text-xs text-emerald-600 font-medium">Paid ₹{totalPaid.toLocaleString("en-IN")}</span>
                {remaining > 0 && <span className="text-xs text-amber-600 font-medium">Due ₹{remaining.toLocaleString("en-IN")}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS TIMELINE */}
        <BookingTimeline eventDate={eventDate} bookingDate={bookingDate} 
        remainderdate={remainderdate} isFullyPaid={isFullyPaid} 
        refundDone={refundDone} invoiceGenerated={invoiceGenerated} />

        {/* ACTION BUTTONS ROW */} 
       {!invoiceGenerated && (
          <ActionBar
            isEventPast={isEventPast}
            isFullyPaid={isFullyPaid}
            refundDone={refundDone}
            invoiceGenerated={invoiceGenerated}
            refundEnabled={refundEnabled}
            onAddPayment={() => setShowModal(true)}
            onRefund={() => setShowRefundModal(true)}
            onGenerateInvoice={() => setShowInvoiceConfirm(true)}
            remaining={remaining}
          />
        )}

        {/* RESERVATION TIMER */}
        <ReservationTimer bookingDate={bookingDate} eventDate={eventDate} shift="Evening"  type={booking_type}
        reserveEndDate= {reserveEndDate } quotationExpireDate={quotationExpireDate}
        />

        {/* TABS */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 px-5 overflow-x-auto">
            <div className="flex gap-0.5 min-w-max">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && 
          <OverviewTab 
          customer={customer} 
          caterer={caterer} 
          decorator={decorator} 
          sound_system={sound_system} 
          music_troupe={music_troupe} 
          addon_total={addon_total} 
          Booking={Booking} pax_packages = { reserve.pax_packages } pax_categories = { reserve.pax_categories } pax_item_snapshot = {reserve.pax_item_snapshot}
          paidSoFar={paidSoFar} receipts={receipts} totalPaid={totalPaid} remaining={remaining} grandTotal={grandTotal} reserve={reserve} addons={addons} onAddPayment={() => setShowModal(true)} onEdit={setEditSection} invoiceGenerated={invoiceGenerated} />}
          {activeTab === "event" && <EventDetailsTab reserve={reserve} onEdit={setEditSection} invoiceGenerated={invoiceGenerated} />}
          {activeTab === "payments" && <PaymentsTab Booking={Booking} receipts={receipts} totalPaid={totalPaid} 
          remaining={remaining} paidSoFar={paidSoFar} onAddPayment={() => setShowModal(true)} invoiceGenerated={invoiceGenerated} />}
          {activeTab === "addons" && <AddonsTab addons={addons} setAddons={setAddons} availableAddons={reserve?.available_addons} invoiceGenerated={invoiceGenerated} />}
          {activeTab === "packages" && <PackagesTab pax_packages={reserve.pax_packages} pax_categories={reserve.pax_categories} pax_item_snapshot={reserve.pax_item_snapshot} setReserve={setReserve} invoiceGenerated={invoiceGenerated} />}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "history" && <HistoryTab receipts={receipts} reserve={reserve} />}
        </div>
      </div>
    </div>
  );
}

/* ─── SUMMARY ITEM ─── */
function SummaryItem({ icon: Icon, iconBg = "bg-slate-100", iconColor = "text-slate-500", label, value, sub }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={iconColor} />
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="font-semibold text-slate-800 text-xs leading-tight">
          {value}
          {typeof sub === "object" ? sub : null}
        </p>
        {typeof sub === "string" && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}
function HDivider() {
  return <div className="hidden md:block w-px h-10 bg-slate-200 self-center" />;
}

/* ─── BOOKING TIMELINE ─── */
function BookingTimeline({ eventDate, bookingDate,remainderdate, isFullyPaid, refundDone, invoiceGenerated }) {
  
 
  const steps = [
    { label: "Booked", date: bookingDate, done: bookingDate ? new Date(bookingDate) < new Date() : false },
    { label: "Reminder Sent", date: remainderdate, done: remainderdate ? new Date(remainderdate) < new Date() : false },
    { label: "Event Date", date: eventDate ? new Date(eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—", done: eventDate ? new Date(eventDate) < new Date() : false },
    { label: "Settled", date: isFullyPaid ? "Paid" : "Pending", done: isFullyPaid },
    { label: "Refund", date: refundDone ? "Processed" : "Pending", done: refundDone },
    { label: "Closed", date: invoiceGenerated ? "Done" : "Pending", done: invoiceGenerated },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step.done ? "bg-violet-600 border-violet-600 shadow-sm shadow-violet-200" : "bg-white border-slate-300"}`}>
                {step.done
                  ? <CheckCheck size={14} className="text-white" />
                  : <Circle size={14} className="text-slate-300" />}
              </div>
              <p className={`text-xs font-semibold mt-1.5 ${step.done ? "text-slate-700" : "text-slate-400"}`}>{step.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 text-center">{step.date}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-1.5 mb-8 rounded-full overflow-hidden bg-slate-200">
                <div className={`h-full rounded-full transition-all duration-700 ${step.done && steps[i + 1]?.done ? "bg-violet-600 w-full" : step.done ? "bg-violet-300 w-1/2" : "w-0"}`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ACTION BAR ─── */
function ActionBar({ isEventPast, isFullyPaid, refundDone, invoiceGenerated, onAddPayment, onRefund, onGenerateInvoice, remaining }) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
      <span className="text-xs text-slate-500 font-medium mr-1">Quick Actions:</span>

      {!isFullyPaid && (
        <ActionBtn icon={CreditCard} label="Record Payment" color="violet" onClick={onAddPayment} />
      )}

      <ActionBtn
        icon={RotateCcw}
        label="Process Refund"
        color="amber"
        onClick={onRefund}
        disabled={!isEventPast || !isFullyPaid || refundDone}
        tooltip={!isEventPast ? "Available after event" : !isFullyPaid ? "Settle payments first" : refundDone ? "Already processed" : ""}
      />

      <ActionBtn
        icon={Receipt}
        label="Generate Invoice"
        color="emerald"
        onClick={onGenerateInvoice}
        disabled={!isEventPast || !isFullyPaid || !refundDone}
        tooltip={!isEventPast ? "Available after event" : !isFullyPaid ? "Settle balance first" : !refundDone ? "Process refund first" : ""}
      />

      <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
        {!isEventPast && <span className="flex items-center gap-1"><Lock size={11} className="text-amber-400" /> Actions unlock after event</span>}
        {isEventPast && !isFullyPaid && <span className="flex items-center gap-1 text-amber-600"><AlertTriangle size={11} /> ₹{remaining.toLocaleString("en-IN")} pending</span>}
        {isEventPast && isFullyPaid && !refundDone && <span className="flex items-center gap-1 text-amber-600"><Info size={11} /> Process refund to unlock invoice</span>}
        {isEventPast && isFullyPaid && refundDone && <span className="flex items-center gap-1 text-emerald-600"><Unlock size={11} /> Ready to generate invoice</span>}
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, color, onClick, disabled, tooltip }) {
  const colors = {
    violet: "bg-violet-600 hover:bg-violet-700 text-white",
    amber: "bg-amber-500 hover:bg-amber-600 text-white",
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };
  return (
    <div className="relative group">
      <button onClick={onClick} disabled={disabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" : colors[color]}`}>
        <Icon size={12} /> {label}
        {disabled && <Lock size={10} className="opacity-60" />}
      </button>
      {disabled && tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

/* ─── RESERVATION TIMER ─── */
function ReservationTimer({ bookingDate, eventDate, shift, type, reserveEndDate, quotationExpireDate }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [phase, setPhase] = useState("upcoming"); 
  const [targetDate, setTargetDate] = useState(null);

  useEffect(() => {
    if (!eventDate) return;

    let start = null;
    let end = null;

    // 🎯 TYPE LOGIC
    if (type === "booked") {
      start = new Date(bookingDate);
      start.setHours(12, 0, 0);

      end = new Date(eventDate);
      end.setHours(18, 0, 0);
    }

    if (type === "reserve") {
      start = new Date(bookingDate);
      end = reserveEndDate ? new Date(reserveEndDate) : new Date(eventDate);
    }

    if (type === "quotation") {
      start =  new Date(bookingDate);
      end = quotationExpireDate ? new Date(quotationExpireDate) : new Date();
    }

    setTargetDate(end);

    const tick = () => {
      const now = new Date();

      if (now < start) {
        setPhase("upcoming");
        setTimeLeft(start - now);
      } else if (now >= start && now <= end) {
        setPhase("active");
        setTimeLeft(end - now);
      } else {
        setPhase("ended");
        setTimeLeft(0);
      }
    };

    tick();
    const iv = setInterval(tick, 1000);

    return () => clearInterval(iv);
  }, [eventDate, reserveEndDate, quotationExpireDate, type]);

  if (timeLeft === null) return null;

  const hours = Math.floor(timeLeft / 3600000);
  const mins = Math.floor((timeLeft % 3600000) / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  // 🎨 TYPE COLORS + LABELS
  const config = {
    booked: {
      label: "Booking ends in",
      color: "bg-violet-50 border-violet-200 text-violet-700",
      dot: "bg-violet-500"
    },
    reserve: {
      label: "Reserve expires in",
      color: "bg-amber-50 border-amber-200 text-amber-700",
      dot: "bg-amber-500 animate-pulse"
    },
    quotation: {
      label: "Quotation expires in",
      color: "bg-red-50 border-red-200 text-red-700",
      dot: "bg-red-500 animate-pulse"
    }
  };

  const ui = config[type] || config.booked;

  return (
    <div className={`border rounded-xl px-4 py-2.5 flex items-center gap-3 ${ui.color}`}>
      
      <div className={`w-2 h-2 rounded-full ${ui.dot}`} />

      <span className="text-xs font-semibold">
        {phase === "ended" ? "Expired" : ui.label}
      </span>

      {phase !== "ended" && (
        <div className="flex items-center gap-1 text-xs font-bold">
          <span>{String(hours).padStart(2, "0")}h</span>
          <span>:</span>
          <span>{String(mins).padStart(2, "0")}m</span>
          <span>:</span>
          <span>{String(secs).padStart(2, "0")}s</span>
        </div>
      )}
    </div>
  );
}
function TimeBlock({ v, label }) {
  return (
    <span className="tabular-nums">{v}<span className="text-xs font-normal opacity-60 ml-0.5">{label}</span></span>
  );
}

/* ─── CONFIRM MODAL ─── */
function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onClose }) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="p-6 space-y-4">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mx-auto">
          <Sparkles size={18} className="text-violet-600" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700">
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

/* ─── REFUND MODAL ─── */
function RefundModal({ securityDeposit, onClose, onConfirm }) {
  const safeDeposit = Number(securityDeposit || 0);
  const [refundAmt, setRefundAmt] = useState(safeDeposit);
  const [reason, setReason] = useState("Event completed successfully");
  const [method, setMethod] = useState("Bank Transfer");

  return (
    <ModalWrapper onClose={onClose}>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Process Security Refund</h2>
          <p className="text-xs text-slate-400">Security deposit refund to customer</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100"><X size={14} /></button>
      </div>
      <div className="p-6 space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
          <Shield size={16} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-700">Security Deposit Eligible</p>
            <p className="text-xs text-emerald-600">₹{safeDeposit.toLocaleString("en-IN")} collected on 20 Apr 2026</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Refund Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">₹</span>
            <input type="number" value={refundAmt} onChange={e => setRefundAmt(Number(e.target.value))}
              className="w-full pl-6 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          {refundAmt < safeDeposit && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><AlertTriangle size={11} /> Partial refund — ₹{(safeDeposit - refundAmt).toLocaleString("en-IN")} will be retained</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Refund Method</label>
          <div className="relative">
            <select value={method} onChange={e => setMethod(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
              {METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason</label>
          <input value={reason} onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center justify-center gap-1.5">
            <RotateCcw size={12} /> Confirm Refund
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

/* ─── EDIT MODAL ─── */
function EditModal({ section, reserve, setReserve, onClose }) {
  const [form, setForm] = useState({ ...reserve });
  const save = () => { setReserve(form); onClose(); };
  return (
    <ModalWrapper onClose={onClose}>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Edit Booking Details</h2>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100"><X size={14} /></button>
      </div>
      <div className="p-6 space-y-3">
        {[
          { label: "Customer Name", key: "name" },
          { label: "Email", key: "email" },
          { label: "Phone", key: "phone" },
          { label: "Event Type", key: "eventType" },
          { label: "Guests", key: "guests", type: "number" },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{f.label}</label>
            <input type={f.type || "text"} value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="flex-1 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700">Save Changes</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

/* ─── CHAT PANEL ─── */

function ChatPanel({ chatRefno, onClose, customerName, messages: initialMessages }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages || []);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;

    const newMsg = {
      conservation_id: chatRefno,
      from: "me",
      text: input.trim(),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    await send_messages(newMsg)
    // TODO: call API / socket here
  };

  return (
    <div
      className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
      style={{ height: 400 }}
    >
      {/* Header */}
      <div className="p-3 border-b flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold">{customerName}</p>
          <p className="text-xs text-slate-400">Customer</p>
        </div>
        <button onClick={onClose} className="text-xs text-red-500">
          Close
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {messages.map((m, i) => (
          <div key={i}>
            {m.from === "system" ? (
              <div className="text-center text-xs text-slate-400 my-2">
                {m.text}
              </div>
            ) : (
              <div
                className={`flex ${
                  m.from === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                    m.from === "me"
                      ? "bg-violet-600 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
                  }`}
                >
                  {m.text}

                  {m.time && (
                    <p
                      className={`text-[10px] mt-1 ${
                        m.from === "me"
                          ? "text-white/60"
                          : "text-slate-400"
                      }`}
                    >
                      {m.time}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        <button
          onClick={send}
          className="px-3 py-2 bg-violet-600 text-white text-xs rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}


/* ─── ADD PAYMENT MODAL ─── */
function AddPaymentModal({ paidSoFar, onClose, onSave ,Booking}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // FIX C: every value pulled from Booking / paidSoFar is coerced through
  // Number(... || 0) right here, so even if a parent re-render ever passes
  // an incomplete object, this component can't propagate NaN into the UI.
  const base = Number(Booking?.basePrice || 0);
  const gst = Number(Booking?.gst || 0);
  const addonTotal = Number(Booking?.addonTotal || 0);
  const securityDeposit = Number(Booking?.securityDeposit || 0);

  const paidBase = Number(paidSoFar?.basePrice || 0);
  const paidAddon = Number(paidSoFar?.addon || 0);
  const paidSecurity = Number(paidSoFar?.security || 0);

  const numAmount = parseFloat(amount) || 0;
  const split = computeSplit(numAmount, paidSoFar, Booking);

  const remainBase = Math.max(0, base + gst - paidBase);
  const remainAddon = Math.max(0, addonTotal - paidAddon);
  const remainSecurity = Math.max(0, securityDeposit - paidSecurity);

  const totalRemaining = remainBase + remainAddon + remainSecurity;

  const quickFills = [
    { label: "Pay Base Due", value: remainBase },
    { label: "Pay Add-on", value: remainAddon },
    { label: "Pay Security", value: remainSecurity },
    { label: "Pay All", value: totalRemaining },
  ].filter(q => q.value > 0);

  function handleSubmit() {
    if (!numAmount || numAmount <= 0) { setError("Enter a valid amount."); return; }
    if (split.excess > 0) { setError(`Exceeds due by ₹${split.excess.toLocaleString("en-IN")}. Max: ₹${totalRemaining.toLocaleString("en-IN")}`); return; }
    
    onSave({ amount: numAmount, method, date, note }, split);


  }

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Add Payment</h2>
          <p className="text-xs text-slate-400">Auto-splits across Base · Add-on · Security</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100"><X size={14} /></button>
      </div>
      <div className="p-5 space-y-4">
        {/* FIX D: BucketCard now receives already-safe `base + gst` etc, computed above */}
        <div className="grid grid-cols-3 gap-2">
          <BucketCard label="Base + GST" total={base + gst} paid={paidBase} color="violet" />
          <BucketCard label="Add-on" total={addonTotal} paid={paidAddon} color="blue" />
          <BucketCard label="Security" total={securityDeposit} paid={paidSecurity} color="emerald" />
        </div>
        {quickFills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {quickFills.map(q => (
              <button key={q.label} onClick={() => { setAmount(String(q.value)); setError(""); }}
                className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors">
                {q.label} ₹{q.value.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">₹</span>
            <input type="number" min="0" value={amount} onChange={e => { setAmount(e.target.value); setError(""); }}
              placeholder="0.00"
              className="w-full pl-6 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          {error && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} /> {error}</p>}
        </div>
        {numAmount > 0 && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Split Preview</p>
            <SplitRow label="Base + GST" value={split.toBase} color="violet" remaining={remainBase} />
            <SplitRow label="Add-on" value={split.toAddon} color="blue" remaining={remainAddon} />
            <SplitRow label="Security" value={split.toSecurity} color="emerald" remaining={remainSecurity} />
            {split.excess > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-red-500">
                <AlertCircle size={12} />
                <span className="text-xs font-semibold">Excess ₹{split.excess.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Method</label>
            <div className="relative">
              <select value={method} onChange={e => setMethod(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Note <span className="text-slate-400 font-normal">(optional)</span></label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. NEFT advance"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
      </div>
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">Outstanding: <strong className="text-slate-800">₹{totalRemaining.toLocaleString("en-IN")}</strong></span>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium hover:bg-slate-100">Cancel</button>
          <button onClick={handleSubmit} disabled={!numAmount || numAmount <= 0 || split.excess > 0}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
            <Plus size={12} /> Record
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function BucketCard({ label, total, paid, color }) {
  // FIX: coerce here too, so BucketCard is safe no matter which caller (modal
  // or PaymentsTab) invokes it.
  const safeTotal = Number(total || 0);
  const safePaid = Number(paid || 0);
  const remaining = Math.max(0, safeTotal - safePaid);
  const pct = safeTotal > 0 ? Math.min(100, (safePaid / safeTotal) * 100) : 100;
  const c = {
    violet: { bar: "bg-violet-500", text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
    blue: { bar: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    emerald: { bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  }[color];
  return (
    <div className={`rounded-xl border p-2.5 ${c.bg} ${c.border}`}>
      <p className="text-xs font-semibold text-slate-500 mb-0.5">{label}</p>
      <p className={`text-sm font-black ${c.text}`}>₹{safeTotal.toLocaleString("en-IN")}</p>
      <div className="mt-1.5 h-1 rounded-full bg-white/60">
        <div className={`h-1 rounded-full transition-all ${c.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-400">Paid ₹{safePaid.toLocaleString("en-IN")}</span>
        <span className={`text-xs font-semibold ${remaining > 0 ? c.text : "text-slate-400"}`}>
          {remaining > 0 ? `₹${remaining.toLocaleString("en-IN")} due` : "✓"}
        </span>
      </div>
    </div>
  );
}

function SplitRow({ label, value, color, remaining }) {
  const safeValue = Number(value || 0);
  const safeRemaining = Number(remaining || 0);
  if (safeRemaining === 0 && safeValue === 0) return (
    <div className="flex justify-between text-xs text-slate-300"><span>{label}</span><span>Done</span></div>
  );
  const tc = { violet: "text-violet-600", blue: "text-blue-600", emerald: "text-emerald-600" }[color];
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-600">{label}</span>
      <span className={`font-bold ${safeValue > 0 ? tc : "text-slate-300"}`}>{safeValue > 0 ? `₹${safeValue.toLocaleString("en-IN")}` : "₹0"}</span>
    </div>
  );
}

function ModalWrapper({ children, onClose }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {children}
      </div>
    </div>
  );
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ customer ,caterer, decorator, sound_system, music_troupe, 
  addon_total,Booking,paidSoFar, receipts, totalPaid, remaining, grandTotal, reserve, 
  addons, onAddPayment, onEdit, invoiceGenerated , pax_packages , pax_categories , pax_item_snapshot }) {
  return (
    <div className="p-5 grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <Section title="Event Details" onEdit={invoiceGenerated ? null : () => onEdit("event")}>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {[
              { label: "Event Name", value: reserve.eventType },
              { label: "Event Type", value: "Corporate" },
              // { label: "Shift", value: reserve.shifts[0].shift_name },
              { label: "Capacity", value: `${reserve?.total_pax} Guests` },
              { label: "From", value: "12:00 PM" },
              { label: "To", value: "06:00 PM" },
            ].map(r => (
              <InfoRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
        </Section>

        <Section title="Customer Details" onEdit={invoiceGenerated ? null : () => onEdit("customer")}>
          <div className="flex gap-6">
            <div className="flex-1 grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: "Name", value: customer?.name },
                { label: "Email", value: customer?.email },
                { label: "Phone", value: customer?.phone },
                { label: "Location", value: "Mangalore, Karnataka" },
              ].map(r => (
                <InfoRow key={r.label} label={r.label} value={r.value} />
              ))}
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <User size={22} className="text-slate-400" />
            </div>
          </div>
        </Section>

        <Section title="Service Provider Details" onEdit={invoiceGenerated ? null : () => onEdit("Service")}>
          <div className="flex gap-6">
            <div className="flex-1 grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: "Caterer Name", value: caterer?.name },////caterer decorator sound_system music_troupe
                { label: "Decorator Name", value: decorator?.name },
                { label: "Sound system Name", value: sound_system?.name },
                { label: "Music troupe Name", value: music_troupe?.name },
              ].map(r => (
                <InfoRow key={r.label} label={r.label} value={r.value} />
              ))}
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <User size={22} className="text-slate-400" />
            </div>
          </div>
        </Section>

    <Section
  title="Add-ons"
  badge={`₹${(addons || [])
    .reduce(
      (sum, item) => sum + Number(item?.total_price || 0),
      0
    )
    .toLocaleString("en-IN")}`}
  badgeColor="blue"
>
  <div className="space-y-2">
   {addons.map((a,index) => (
  <div
    key={a.id || index}
    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
  >
    <div className="flex items-center gap-2">
      <Tag size={12} className="text-slate-400" />
      <span className="text-xs font-medium text-slate-700">
        {a.title || a.name || "-"}
      </span>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400">
        Qty {a.quantity || 0}
      </span>

      <span className="text-xs font-bold text-slate-700">
        ₹{(Number(a.unit_price || 0) * Number(a.quantity || 0)).toLocaleString("en-IN")}
      </span>
    </div>
  </div>
))}
  </div>
</Section>

      <Section title="Packages" badge="Silver Buffet" badgeColor="green">

  {/* PACKAGE HEADER */}
  <div className="flex flex-wrap gap-1.5 mb-3">
    {(pax_categories || []).map((cat) => (
      <span
        key={cat.id}
        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200"
      >
        {cat.category_name}
      </span>
    ))}
  </div>

  {/* GRID */}
  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-xs text-slate-600">

    {(pax_categories || []).map((cat) => {
      const catItems = (pax_item_snapshot || []).filter(
        (i) =>
          String(i.category_id) === String(cat.category_id)
      );

      return (
        <div key={cat.id}>

          {/* CATEGORY TITLE (optional) */}
          <p className="font-bold text-violet-600 mb-1">
            {cat.category_name}
          </p>

          {/* ITEMS */}
          {catItems.map((item) => (
            <p key={item.id} className="py-0.5">
              {item.item_name}
            </p>
          ))}

        </div>
      );
    })}

  </div>

</Section>

        <Section title="Notes" onEdit={invoiceGenerated ? null : () => {}}>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 space-y-1.5">
            <p className="text-xs text-slate-700">{ reserve?.notes } </p>
            <p className="text-xs text-slate-400 mt-2">Added by John Doe · 20 Apr 2026, 10:30 AM</p>
          </div>
        </Section>
      </div>

      <div className="space-y-4">
        <div className="border border-slate-200 rounded-2xl p-4">
          <h3 className="font-semibold text-slate-800 text-xs mb-3">Payment Summary</h3>
          <div className="space-y-2 text-xs">
            {[
              { label: "Base Price", value: `₹${Number(reserve.base_amount || 0).toLocaleString("en-IN")}` },
              { label: "Add-on Total", value: `₹${addon_total.toLocaleString("en-IN")}` },
              // { label: "GST (18%)", value: `₹${Booking.gst.toLocaleString("en-IN") || 0}` },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-slate-500">{r.label}</span>
                <span className="text-slate-700 font-medium">{r.value}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-2 flex justify-between">
              <span className="font-semibold text-slate-700">Total</span>
              <span className="font-black text-violet-600">₹{Number(grandTotal || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center">
            <span className="text-xs text-slate-500">Security Deposit</span>
            <span className="font-bold text-slate-700 text-xs">₹{Number(Booking.securityDeposit || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-semibold text-slate-800 text-xs">Receipts</h3>

    {!invoiceGenerated && (
      <button
        onClick={onAddPayment}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"
      >
        <Plus size={11} /> Add
      </button>
    )}
  </div>

  {/* HEADER */}
  <div className="grid grid-cols-5 text-xs text-slate-400 font-medium pb-2 border-b border-slate-100">
    <span>Date</span>
    <span>Type</span>
    <span>Method</span>
    <span>Amount</span>
    <span>Status</span>
  </div>

  {/* ROWS */}
  <div className="space-y-1">
    {receipts.map((r, i) => (
      <div key={i} className="grid grid-cols-5 text-xs py-2 border-b border-slate-50">
        <span className="text-slate-500">
          {r.payment_date
            ? new Date(r.payment_date).toLocaleDateString("en-IN")
            : r.date || "—"}
        </span>

        <span className="text-slate-700">
          {r.payment_type || r.type || "—"}
        </span>

        <span className="text-slate-500">
          {r.payment_method || r.method || "—"}
        </span>

        <span className="text-slate-700 font-medium">
          ₹{Number(r.amount_paid || r.amount || 0).toLocaleString("en-IN")}
        </span>

        <span className="text-emerald-600 font-semibold">
          {r.payment_status || r.status || "Paid"}
        </span>
      </div>
    ))}
  </div>

  {/* SUMMARY */}
  <div className="pt-3 space-y-1 text-xs">
    <div className="flex justify-between">
      <span className="text-slate-500">Paid</span>
      <span className="text-emerald-600 font-bold">
        ₹{Number(totalPaid || 0).toLocaleString("en-IN")}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-slate-500">Balance</span>
      <span className={`font-bold ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>
        {remaining > 0
          ? `₹${Number(remaining).toLocaleString("en-IN")}`
          : "Fully Settled ✓"}
      </span>
    </div>
  </div>
</div>

<div className="border border-slate-200 rounded-2xl p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-semibold text-slate-800 text-xs">
      Activity
    </h3>

    <span className="text-xs text-slate-400">
      {reserve?.logs?.length || 0} records
    </span>
  </div>

  <div className="space-y-3">
    {(reserve?.logs || []).map((log, i) => {
      let Icon = ClipboardList;
      let iconColor = "text-slate-500";
      let iconBg = "bg-slate-100";

      const paymentType =
        log?.new_value?.payment_type;

      if (
        log.description?.toLowerCase().includes("payment")
      ) {
        Icon = CreditCard;
        iconColor = "text-emerald-500";
        iconBg = "bg-emerald-50";
      }

      if (
        log.description?.toLowerCase().includes("invoice")
      ) {
        Icon = FileText;
        iconColor = "text-blue-500";
        iconBg = "bg-blue-50";
      }

      if (
        log.description?.toLowerCase().includes("booking")
      ) {
        Icon = Calendar;
        iconColor = "text-violet-500";
        iconBg = "bg-violet-50";
      }

      return (
        <div
          key={i}
          className="flex gap-2.5"
        >
          <div
            className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
          >
            <Icon
              size={13}
              className={iconColor}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800">
              {log.description}
            </p>

            <p className="text-xs text-slate-400 truncate">
              {paymentType
                ? `${paymentType.replaceAll(
                    "_",
                    " "
                  )} • ${
                    log.new_value?.payment_method
                  } • ₹${Number(
                    log.new_value?.amount_paid || 0
                  ).toLocaleString("en-IN")}`
                : log.action}
            </p>
          </div>

          <span className="text-xs text-slate-400 shrink-0">
            {new Date(
              log.created_at
            ).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
      );
    })}
  </div>
</div>
      </div>
    </div>
  );
}

/* ─── EVENT DETAILS TAB ─── */
function EventDetailsTab({ reserve, onEdit, invoiceGenerated }) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 text-xs">Event Information</h3>
        {!invoiceGenerated && <button onClick={() => onEdit("event")} className="flex items-center gap-1 text-xs text-violet-600 font-semibold hover:underline"><Edit size={11} /> Edit</button>}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Event Name", value: reserve.eventType, icon: ClipboardList },
          { label: "Event Type", value: "Corporate", icon: Users },
          { label: "Venue", value: reserve.venues?.[0]?.venue_name_snapshot?.split(",")[0], icon: MapPin },
          { label: "Guests", value: `${reserve?.total_pax} Guests`, icon: Users },
          { label: "Start", value: "12:00 PM", icon: Clock },
          { label: "End", value: "06:00 PM", icon: Clock },
          { label: "Date", value: reserve.event_dates?.[0]?.event_date ? new Date(reserve.event_dates[0].event_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—", icon: Calendar },
          // { label: "Shift", value: reserve.shifts[0].shift_name, icon: Clock },
          { label: "Duration", value: "6 Hours", icon: Timer },
        ].map(item => (
          <div key={item.label} className="bg-slate-50 rounded-xl p-3 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <item.icon size={14} className="text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{item.label}</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PAYMENTS TAB ─── */
function PaymentsTab({ receipts, totalPaid, remaining, paidSoFar, onAddPayment, invoiceGenerated,Booking }) {
  // FIX: same Number-coercion pattern applied here, since this tab calls
  // BucketCard directly with `Booking.basePrice + Booking.gst` style sums.
  const base = Number(Booking?.basePrice || 0);
  const gst = Number(Booking?.gst || 0);
  const addonTotal = Number(Booking?.addonTotal || 0);
  const securityDeposit = Number(Booking?.securityDeposit || 0);
  const paidBase = Number(paidSoFar?.basePrice || 0);
  const paidAddon = Number(paidSoFar?.addon || 0);
  const paidSecurity = Number(paidSoFar?.security || 0);

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <BucketCard label="Base + GST" total={base + gst} paid={paidBase} color="violet" />
        <BucketCard label="Add-on" total={addonTotal} paid={paidAddon} color="blue" />
        <BucketCard label="Security" total={securityDeposit} paid={paidSecurity} color="emerald" />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-xs">Transactions</h3>
        {!invoiceGenerated && (
          <button onClick={onAddPayment} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700">
            <Plus size={11} /> Add Payment
          </button>
        )}
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Date", "Type", "Method", "Amount", "Status"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {receipts.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-slate-500">{row.date}</td>
                <td className="px-4 py-2.5 text-slate-700 font-medium">{row.type}</td>
                <td className="px-4 py-2.5 text-slate-500">{row.method || "—"}</td>
                <td className="px-4 py-2.5 text-slate-800 font-semibold">₹{Number(row.amount || 0).toLocaleString("en-IN")}</td>
                <td className="px-4 py-2.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-6 text-xs">
        <span className="text-slate-500">Paid: <strong className="text-emerald-600">₹{Number(totalPaid || 0).toLocaleString("en-IN")}</strong></span>
        <span className="text-slate-500">Balance: <strong className={remaining > 0 ? "text-amber-600" : "text-emerald-600"}>{remaining > 0 ? `₹${Number(remaining).toLocaleString("en-IN")}` : "Settled ✓"}</strong></span>
      </div>
    </div>
  );
}

/* ─── SHARED: TOAST ─── */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      <CheckCheck size={14} className="text-emerald-400" />
      {message}
    </div>
  );
}

/* ─── SHARED: QUANTITY STEPPER ─── */
function QtyStepper({ value, onChange, min = 0, max = 9999, disabled }) {
  const dec = () => onChange(Math.max(min, Number(value || 0) - 1));
  const inc = () => onChange(Math.min(max, Number(value || 0) + 1));
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
      <button type="button" disabled={disabled || value <= min} onClick={dec}
        className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <Minus size={11} />
      </button>
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={e => {
          const v = e.target.value === "" ? min : Math.max(min, Math.min(max, Number(e.target.value)));
          onChange(v);
        }}
        className="w-10 text-center text-xs font-bold text-slate-800 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" disabled={disabled || value >= max} onClick={inc}
        className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <Plus size={11} />
      </button>
    </div>
  );
}

/* ─── SHARED: CHANGES SUMMARY ─── */
// Generic diff panel: pass an array of { label, from, to, isCurrency } rows
// plus the net cost delta. Used by both the Add-ons manager and the Package
// editor right before a save is committed, so the person always sees the
// concrete effect of their edits on the booking total before confirming.
function ChangesSummary({ rows, deltaAmount, newTotal }) {
  const changed = rows.filter(r => String(r.from) !== String(r.to));
  if (changed.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
      <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
        <AlertOctagon size={12} /> Changes summary
      </p>
      <div className="space-y-1.5">
        {changed.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-amber-700">{r.label}</span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-900">
              <span className="text-amber-500 font-normal">{r.isCurrency ? `₹${Number(r.from || 0).toLocaleString("en-IN")}` : r.from}</span>
              <ArrowRight size={10} className="text-amber-400" />
              <span>{r.isCurrency ? `₹${Number(r.to || 0).toLocaleString("en-IN")}` : r.to}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-amber-200 pt-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-800">
          {deltaAmount >= 0 ? "Additional cost" : "Cost reduction"}
        </span>
        <span className={`text-sm font-black ${deltaAmount >= 0 ? "text-amber-900" : "text-emerald-700"}`}>
          {deltaAmount >= 0 ? "+" : ""}₹{Math.abs(deltaAmount).toLocaleString("en-IN")}
        </span>
      </div>
      {typeof newTotal === "number" && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-700">Updated booking total</span>
          <span className="font-bold text-violet-700">₹{newTotal.toLocaleString("en-IN")}</span>
        </div>
      )}
    </div>
  );
}

/* ─── ADDONS TAB ─── */
// Two-column reservation-style editor: a searchable catalog on the left
// (reserve.available_addons — items not yet on the booking, or items the
// person may want more of) and the booking's current add-ons on the right
// with inline quantity steppers, line totals, and a sticky save footer.
// `addons` / `setAddons` are lifted state from the parent (same as before)
// so the rest of the page (Overview tab, payment splits) stays in sync.
function AddonsTab({ addons, setAddons, availableAddons, invoiceGenerated }) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(() => addons.map(a => ({ ...a })));
  const [toast, setToast] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);

  // Keep the editable draft in sync if the committed addons change from
  // outside this tab (e.g. a payment was recorded that also touched addons).
  useEffect(() => {
    setDraft(addons.map(a => ({ ...a })));
  }, [addons]);

  const catalog = availableAddons || [];

  const filteredCatalog = catalog.filter(c =>
    (c.title || c.name || "").toLowerCase().includes(query.trim().toLowerCase())
  );

  const draftTotal = draft.reduce((s, a) => s + Number(a.unit_price || 0) * Number(a.quantity || 0), 0);
  const committedTotal = addons.reduce((s, a) => s + Number(a.unit_price || 0) * Number(a.quantity || 0), 0);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(addons);

  function addFromCatalog(item) {
    setDraft(prev => {
      const existing = prev.find(p => p.title === (item.title || item.name));
      if (existing) {
        return prev.map(p => p.title === existing.title ? { ...p, quantity: Number(p.quantity || 0) + 1 } : p);
      }
      return [...prev, {
        id: item.id || Date.now(),
        title: item.title || item.name,
        unit_price: Number(item.price || item.unit_price || 0),
        quantity: 1,
      }];
    });
  }

  function updateQty(id, qty) {
    setDraft(prev => prev.map(a => a.id === id ? { ...a, quantity: qty } : a));
  }

  function removeItem(id) {
    setDraft(prev => prev.filter(a => a.id !== id));
    setConfirmRemove(null);
  }

  function handleCancel() {
    setDraft(addons.map(a => ({ ...a })));
  }

  function handleSave() {
    setAddons(draft);
    setToast("Add-ons updated");
  }

  // Build diff rows for the changes summary: any item whose quantity changed,
  // plus items fully added or removed.
  const changeRows = (() => {
    const rows = [];
    const byTitleCommitted = Object.fromEntries(addons.map(a => [a.title, a]));
    const byTitleDraft = Object.fromEntries(draft.map(a => [a.title, a]));
    const titles = new Set([...Object.keys(byTitleCommitted), ...Object.keys(byTitleDraft)]);
    titles.forEach(title => {
      const from = byTitleCommitted[title]?.quantity ?? 0;
      const to = byTitleDraft[title]?.quantity ?? 0;
      if (from !== to) rows.push({ label: title, from, to });
    });
    return rows;
  })();

  return (
    <div className="p-5 space-y-4">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Add-ons</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manage what's included in this booking</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Add-ons total</p>
          <p className="text-lg font-black text-violet-600">₹{draftTotal.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* LEFT: CATALOG */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-xs font-semibold text-slate-700 mb-2">Available add-ons</p>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search add-ons…"
                disabled={invoiceGenerated}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-400 disabled:opacity-60"
              />
            </div>
          </div>
          <div className="flex-1 max-h-[420px] overflow-y-auto divide-y divide-slate-100">
            {catalog.length === 0 && (
              <div className="p-6 text-center">
                <Package size={22} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No catalog connected yet.</p>
                <p className="text-xs text-slate-300 mt-1">Wire up <code className="bg-slate-100 px-1 rounded">reserve.available_addons</code> to populate this list.</p>
              </div>
            )}
            {catalog.length > 0 && filteredCatalog.length === 0 && (
              <div className="p-6 text-center">
                <Search size={18} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No add-ons match "{query}"</p>
              </div>
            )}
            {filteredCatalog.map((item, i) => {
              const name = item.title || item.name;
              const alreadyAdded = draft.find(d => d.title === name);
              return (
                <div key={item.id || i} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{name}</p>
                    <p className="text-xs text-slate-400">₹{Number(item.price || item.unit_price || 0).toLocaleString("en-IN")}</p>
                  </div>
                  {!invoiceGenerated && (
                    alreadyAdded ? (
                      <span className="shrink-0 text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-lg">
                        Added · {alreadyAdded.quantity}
                      </span>
                    ) : (
                      <button onClick={() => addFromCatalog(item)}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-all">
                        <Plus size={11} /> Add
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: SELECTED / BOOKING ADD-ONS */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">Booking add-ons</p>
            <span className="text-xs text-slate-400">{draft.length} item{draft.length === 1 ? "" : "s"}</span>
          </div>

          <div className="flex-1 max-h-[420px] overflow-y-auto">
            {draft.length === 0 && (
              <div className="p-8 text-center">
                <ShoppingBag size={22} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No add-ons selected yet.</p>
                <p className="text-xs text-slate-300 mt-1">Add items from the catalog on the left.</p>
              </div>
            )}
            <div className="divide-y divide-slate-100">
              {draft.map(a => {
                const lineTotal = Number(a.unit_price || 0) * Number(a.quantity || 0);
                const pendingRemove = confirmRemove === a.id;
                return (
                  <div key={a.id} className="px-4 py-3 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{a.title}</p>
                        <p className="text-xs text-slate-400">₹{Number(a.unit_price || 0).toLocaleString("en-IN")} / item</p>
                      </div>
                      {!invoiceGenerated && (
                        <QtyStepper value={Number(a.quantity || 0)} onChange={v => updateQty(a.id, v)} min={1} />
                      )}
                      <div className="text-right w-20 shrink-0">
                        <p className="text-xs font-bold text-slate-800">₹{lineTotal.toLocaleString("en-IN")}</p>
                      </div>
                      {!invoiceGenerated && (
                        pendingRemove ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => removeItem(a.id)} className="text-xs font-semibold text-red-600 hover:underline px-1">Remove</button>
                            <button onClick={() => setConfirmRemove(null)} className="text-xs text-slate-400 hover:underline px-1">Keep</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmRemove(a.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                            <Trash2 size={14} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {draft.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Total add-ons</span>
              <span className="text-sm font-black text-violet-600">₹{draftTotal.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>
      </div>

      {isDirty && (
        <ChangesSummary
          rows={changeRows}
          deltaAmount={draftTotal - committedTotal}
          newTotal={null}
        />
      )}

      {/* STICKY SUMMARY / SAVE BAR */}
      {!invoiceGenerated && (
        <div className="sticky bottom-0 -mx-5 -mb-5 px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Add-ons total: <strong className="text-slate-800">₹{draftTotal.toLocaleString("en-IN")}</strong>
            {isDirty && <span className="text-amber-600 font-medium ml-2">· unsaved changes</span>}
          </span>
          <div className="flex gap-2">
            <button onClick={handleCancel} disabled={!isDirty}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!isDirty}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PACKAGES TAB ─── */
// Summary card (price/pax, guest count, category + item counts) that opens
// a large edit modal. Per your data shape, pax_categories / pax_item_snapshot
// don't currently carry min/max select limits or per-item prices — so this
// shows selection counts for awareness only and never blocks Save on them.
// If those fields get added later (min_select / max_select / item_price /
// is_selected), the category cards below already have the UI ready for them.
function PackagesTab({ pax_packages = [], pax_categories = [], pax_item_snapshot = [], setReserve, invoiceGenerated }) {
  const [showEdit, setShowEdit] = useState(false);
  const [toast, setToast] = useState(null);

  const pkg = pax_packages?.[0];
  const categories = pax_categories || [];
  const items = pax_item_snapshot || [];

  const totalSelected = items.filter(i => i.is_selected !== false).length;
  const packageTotal = Number(pkg?.price_per_pax || 0) * Number(pkg?.pax_count || 0);

  function handleSaved(updatedSnapshot) {
    if (setReserve) {
      setReserve(prev => ({ ...prev, pax_item_snapshot: updatedSnapshot }));
    }
    setShowEdit(false);
    setToast("Package selections updated");
  }

  return (
    <div className="p-5">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="border border-slate-200 rounded-2xl p-5 max-w-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full">
            {pkg?.package_name || "No package"}
          </span>
          {!invoiceGenerated && pkg && (
            <button onClick={() => setShowEdit(true)} className="flex items-center gap-1 text-xs text-violet-600 font-semibold hover:underline">
              <Edit size={11} /> Edit package
            </button>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 mt-2">{pkg?.package_name || "Standard Buffet Package"}</h3>
        <p className="text-xl font-black text-violet-600 mt-0.5">
          ₹{Number(pkg?.price_per_pax || 0).toLocaleString("en-IN")} <span className="text-xs font-medium text-slate-400">/ pax</span>
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 font-medium">Guests</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{pkg?.pax_count || 0}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 font-medium">Package total</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">₹{packageTotal.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <LayoutGrid size={12} className="text-slate-400" /> {categories.length} categories
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCheck size={12} className="text-slate-400" /> {totalSelected}/{items.length} items selected
          </div>
        </div>
      </div>

      {showEdit && (
        <EditPackageModal
          pkg={pkg}
          categories={categories}
          items={items}
          onClose={() => setShowEdit(false)}
          onSave={handleSaved}
        />
      )}
    </div>
  );
}

/* ─── EDIT PACKAGE MODAL ─── */
function EditPackageModal({ pkg, categories, items, onClose, onSave }) {
  const [draftItems, setDraftItems] = useState(() => items.map(i => ({ ...i, is_selected: i.is_selected !== false })));
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const isDirty = JSON.stringify(draftItems) !== JSON.stringify(items.map(i => ({ ...i, is_selected: i.is_selected !== false })));

  const totalSelected = draftItems.filter(i => i.is_selected).length;
  const packageTotal = Number(pkg?.price_per_pax || 0) * Number(pkg?.pax_count || 0);

  function toggleItem(id) {
    setDraftItems(prev => prev.map(i => i.id === id ? { ...i, is_selected: !i.is_selected } : i));
  }

  function requestClose() {
    if (isDirty) setShowCloseConfirm(true);
    else onClose();
  }

  function handleSave() {
    onSave(draftItems);
  }

  const changeRows = (() => {
    const rows = [];
    categories.forEach(cat => {
      const before = items.filter(i => String(i.category_id) === String(cat.category_id) && i.is_selected !== false).length;
      const after = draftItems.filter(i => String(i.category_id) === String(cat.category_id) && i.is_selected).length;
      if (before !== after) rows.push({ label: `${cat.category_name} items`, from: before, to: after });
    });
    return rows;
  })();

  return (
    <>
      <div onClick={e => e.target === e.currentTarget && requestClose()}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
          style={{ width: "90vw", maxWidth: "1400px", height: "90vh" }}>

          {/* HEADER */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{pkg?.package_name || "Standard Buffet Package"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {pkg?.pax_count || 0} guests · ₹{Number(pkg?.price_per_pax || 0).toLocaleString("en-IN")}/pax · Package value ₹{packageTotal.toLocaleString("en-IN")} · Selected {totalSelected}/{draftItems.length}
              </p>
            </div>
            <button onClick={requestClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
              <X size={16} />
            </button>
          </div>

          {/* BODY: CATEGORIES + SUMMARY SIDEBAR */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {categories.map(cat => {
                const catItems = draftItems.filter(i => String(i.category_id) === String(cat.category_id));
                const selectedCount = catItems.filter(i => i.is_selected).length;
                const hasMin = typeof cat.min_select === "number";
                const hasMax = typeof cat.max_select === "number";
                const pct = catItems.length > 0 ? Math.min(100, (selectedCount / catItems.length) * 100) : 0;
                const incomplete = hasMin && selectedCount < cat.min_select;

                return (
                  <div key={cat.id || cat.category_id} className="border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">{cat.category_name}</p>
                        {(hasMin || hasMax) && (
                          <span className="text-xs text-slate-400">
                            {hasMin && `Min: ${cat.min_select}`}{hasMin && hasMax && " · "}{hasMax && `Max: ${cat.max_select}`}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">Selected: {selectedCount}/{catItems.length}</span>
                    </div>

                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full transition-all duration-300 ${incomplete ? "bg-amber-400" : "bg-violet-500"}`} style={{ width: `${pct}%` }} />
                    </div>

                    {incomplete && (
                      <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-700 w-fit">
                        <AlertTriangle size={11} /> Select {cat.min_select - selectedCount} more item{cat.min_select - selectedCount === 1 ? "" : "s"}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {catItems.map(item => {
                        const selected = item.is_selected;
                        const disabledByMax = !selected && hasMax && selectedCount >= cat.max_select;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            disabled={disabledByMax}
                            onClick={() => toggleItem(item.id)}
                            className={[
                              "relative text-left px-3 py-2.5 rounded-xl border transition-all",
                              selected
                                ? "border-violet-500 bg-violet-50 shadow-sm"
                                : disabledByMax
                                  ? "border-slate-200 bg-white opacity-50 cursor-not-allowed"
                                  : "border-slate-200 bg-white hover:border-violet-300"
                            ].join(" ")}
                          >
                            {selected && (
                              <CheckCircle2 size={14} className="absolute top-2 right-2 text-violet-600" />
                            )}
                            <p className={`text-xs font-semibold pr-4 ${selected ? "text-violet-800" : "text-slate-700"}`}>{item.item_name}</p>
                            {typeof item.item_price === "number" && (
                              <p className={`text-xs mt-0.5 ${selected ? "text-violet-500" : "text-slate-400"}`}>₹{item.item_price.toLocaleString("en-IN")}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {categories.length === 0 && (
                <div className="p-10 text-center">
                  <Package size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No categories on this package yet.</p>
                </div>
              )}
            </div>

            {/* STICKY SUMMARY SIDEBAR */}
            <div className="w-72 shrink-0 border-l border-slate-100 bg-slate-50 p-5 overflow-y-auto">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Package summary</p>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Guests</span><span className="font-semibold text-slate-800">{pkg?.pax_count || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Price / pax</span><span className="font-semibold text-slate-800">₹{Number(pkg?.price_per_pax || 0).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-2.5"><span className="text-slate-500">Package total</span><span className="font-bold text-violet-600">₹{packageTotal.toLocaleString("en-IN")}</span></div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2.5">
                {categories.map(cat => {
                  const catItems = draftItems.filter(i => String(i.category_id) === String(cat.category_id));
                  const selectedCount = catItems.filter(i => i.is_selected).length;
                  const incomplete = typeof cat.min_select === "number" && selectedCount < cat.min_select;
                  return (
                    <div key={cat.id || cat.category_id} className="flex items-center justify-between text-xs">
                      <span className={incomplete ? "text-amber-600 font-medium" : "text-slate-500"}>{cat.category_name}</span>
                      <span className={`font-semibold ${incomplete ? "text-amber-700" : "text-slate-700"}`}>{selectedCount}/{catItems.length}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Categories complete</span>
                  <span className="font-semibold text-slate-700">
                    {categories.filter(cat => {
                      const catItems = draftItems.filter(i => String(i.category_id) === String(cat.category_id));
                      const selectedCount = catItems.filter(i => i.is_selected).length;
                      return typeof cat.min_select !== "number" || selectedCount >= cat.min_select;
                    }).length}/{categories.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Items selected</span>
                  <span className="font-semibold text-slate-700">{totalSelected}/{draftItems.length}</span>
                </div>
              </div>

              {isDirty && (
                <div className="mt-4">
                  <ChangesSummary rows={changeRows} deltaAmount={0} newTotal={null} />
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-500">
              {totalSelected}/{draftItems.length} items selected
              {isDirty && <span className="text-amber-600 font-medium ml-2">· unsaved changes</span>}
            </span>
            <div className="flex gap-2">
              <button onClick={requestClose} className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!isDirty}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                Save selection
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCloseConfirm && (
        <ConfirmModal
          title="Discard unsaved changes?"
          message="You have unsaved package selections. Closing now will discard them."
          confirmLabel="Discard changes"
          confirmColor="violet"
          onConfirm={onClose}
          onClose={() => setShowCloseConfirm(false)}
        />
      )}
    </>
  );
}


/* ─── DOCUMENTS TAB ─── */
function DocumentsTab() {
  const docs = [
    { name: "Proforma Invoice", type: "PDF", size: "245 KB", color: "bg-red-100 text-red-500" },
    { name: "Contract", type: "PDF", size: "512 KB", color: "bg-emerald-100 text-emerald-600" },
    { name: "Quotation", type: "PDF", size: "210 KB", color: "bg-blue-100 text-blue-500" },
    { name: "Terms & Conditions", type: "PDF", size: "185 KB", color: "bg-violet-100 text-violet-500" },
    { name: "Event Brief", type: "PDF", size: "98 KB", color: "bg-amber-100 text-amber-500" },
    { name: "Vendor Agreement", type: "PDF", size: "340 KB", color: "bg-pink-100 text-pink-500" },
  ];
  return (
    <div className="p-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {docs.map(doc => (
          <div key={doc.name} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/30 transition-all group cursor-pointer">
            <div className={`w-9 h-9 rounded-xl ${doc.color} flex items-center justify-center shrink-0`}>
              <FileText size={15} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-800">{doc.name}</p>
              <p className="text-xs text-slate-400">{doc.type} · {doc.size}</p>
            </div>
            <Download size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}


/* ─── HISTORY TAB ─── */
function HistoryTab({ receipts, reserve }) {
  const all = [
    ...receipts.map(r => ({
      icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-50",
      title: "Payment Received",
      desc: `₹${Number(r.amount || 0).toLocaleString("en-IN")} — ${r.type}`,
      date: r.date, time: "",
    })),
    { icon: FileText, color: "text-blue-500", bg: "bg-blue-50", title: "Invoice Generated", desc: "#INV-2026-0012", date: "20 Apr 2026", time: "10:25 AM" },
    { icon: Calendar, color: "text-slate-500", bg: "bg-slate-100", title: "Booking Created", desc: `#${reserve.refNo}`, date: "20 Apr 2026", time: "10:00 AM" },
  ];
  return (
    <div className="p-5">
      <div className="space-y-0">
        {all.map((item, i) => (
          <div key={i} className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
              <item.icon size={13} className={item.color} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-800">{item.title}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-600">{item.date}</p>
              {item.time && <p className="text-xs text-slate-400">{item.time}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── HELPERS ─── */
function Section({ title, children, badge, badgeColor = "blue", action, onEdit }) {
  return (
    <div className="border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 text-xs">{title}</h3>
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor === "green" ? "bg-emerald-100 text-emerald-700" : badgeColor === "blue" ? "bg-blue-100 text-blue-700" : "bg-blue-100 text-blue-700"}`}>{badge}</span>
          )}
          {onEdit && <button onClick={onEdit} className="flex items-center gap-1 text-xs text-violet-600 font-semibold hover:underline"><Edit size={11} /> Edit</button>}
          {action && <button className="text-xs text-violet-600 font-semibold hover:underline">{action}</button>}
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-slate-400 w-24 shrink-0">{label}</span>
      <span className="text-slate-300 mr-1 text-xs">:</span>
      <span className="text-xs font-medium text-slate-700">{value}</span>
    </div>
  );
}
