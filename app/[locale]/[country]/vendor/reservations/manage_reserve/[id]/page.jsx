"use client";

import { useState, useEffect } from "react";
import {
  Calendar, MapPin, User, Mail, Phone, Clock, FileText,
  Download, Edit, ChevronRight, CheckCircle2, Circle, Plus,
  Bell, MoreHorizontal, Users, Package, CreditCard, ClipboardList,
  History, Copy, X, AlertCircle, ChevronDown, IndianRupee,
} from "lucide-react";
import { useRouter , useParams } from "next/navigation";

import { reservation_manage } from "@/services/booking.service";

/* ─── BOOKING CONSTANTS ─── */
const BOOKING = {
  basePrice: 34999,
  gst: 6300,
  addonTotal: 0,
  securityDeposit: 10000,
  get total() { return this.basePrice + this.gst + this.addonTotal; },
};

// What's already paid per bucket
const INITIAL_PAID = {
  basePrice: 5550,
  addon: 0,
  security: 15000,
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "event", label: "Event Details" },
  { id: "payments", label: "Payments" },
  { id: "packages", label: "Packages" },
  { id: "documents", label: "Documents" },
  { id: "history", label: "History" },
];

const timeline = [
  { label: "Booked", date: "22 April 2026", done: true },
  { label: "Reminder Sent", date: "14 September 2026", done: true },
  { label: "Event Date", date: "19 September 2026", done: true },
  { label: "Closed", date: "Pending", done: false },
];

const buffetMenu = {
  "Main Course": ["Eggplant Parmesan", "Chicken Alfredo", "Ribeye Steak", "Grilled Salmon"],
  Salads: ["Caesar Salad", "Greek Salad"],
  Sides: ["Mashed Potatoes", "Roasted Asparagus", "Truffle Fries"],
  Desserts: ["Chocolate Mousse", "Cheesecake", "Brownie"],
  Beverages: ["Fresh Lime Soda", "Iced Tea", "Water"],
};

const METHODS = ["Cash", "UPI", "Bank Transfer", "Credit Card", "Cheque", "Other"];

/* ─── SMART SPLIT LOGIC ─────────────────────────────────────────────────────
   Priority: Base Price → Addon → Security Deposit
   If entered amount > remaining base price, overflow goes to addon,
   then to security deposit.
──────────────────────────────────────────────────────────────────────────── */
function computeSplit(amount, paidSoFar) {
  const remainBase = Math.max(0, BOOKING.basePrice + BOOKING.gst - paidSoFar.basePrice);
  const remainAddon = Math.max(0, BOOKING.addonTotal - paidSoFar.addon);
  const remainSecurity = Math.max(0, BOOKING.securityDeposit - paidSoFar.security);

  let left = amount;
  const toBase = Math.min(left, remainBase);
  left -= toBase;
  const toAddon = Math.min(left, remainAddon);
  left -= toAddon;
  const toSecurity = Math.min(left, remainSecurity);
  left -= toSecurity;
  const excess = left; // overpaid beyond all buckets

  return { toBase, toAddon, toSecurity, excess };
}

/* ─── ROOT ─── */
export default function BookingDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showModal, setShowModal] = useState(false);

   const router = useRouter();
    const params   = useParams();

const [reserve,     setReserve]     = useState('');
    const load = async () => {
  try {
    const res = await reservation_manage(params.id);

    console.log("API Response:", res);

    setReserve(res?.data);
  } catch (err) {
    console.error("Load reservations failed:", err);
    setReserve('');
  }
};
  
    useEffect(() => {
      (async () => {
        await load();
      })();
    }, []);


  const [paidSoFar, setPaidSoFar] = useState(INITIAL_PAID);
  const [receipts, setReceipts] = useState([
    { date: "20 Apr 2026", type: "Base Price", amount: 5550, method: "UPI", status: "Paid" },
    { date: "20 Apr 2026", type: "Security Deposit", amount: 15000, method: "Bank Transfer", status: "Paid" },
  ]);

  const totalPaid = paidSoFar.basePrice + paidSoFar.addon + paidSoFar.security;
  const grandTotal = BOOKING.total;
  const remaining = Math.max(0, grandTotal + BOOKING.securityDeposit - totalPaid);

  function handlePaymentSave(payment, split) {
    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const newReceipts = [];
    if (split.toBase > 0) newReceipts.push({ date: today, type: "Base Price", amount: split.toBase, method: payment.method, status: "Paid" });
    if (split.toAddon > 0) newReceipts.push({ date: today, type: "Add-on", amount: split.toAddon, method: payment.method, status: "Paid" });
    if (split.toSecurity > 0) newReceipts.push({ date: today, type: "Security Deposit", amount: split.toSecurity, method: payment.method, status: "Paid" });
    setReceipts((prev) => [...prev, ...newReceipts]);
    setPaidSoFar((prev) => ({
      basePrice: prev.basePrice + split.toBase,
      addon: prev.addon + split.toAddon,
      security: prev.security + split.toSecurity,
    }));
    setShowModal(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* MODAL */}
      {showModal && (
        <AddPaymentModal
          paidSoFar={paidSoFar}
          onClose={() => setShowModal(false)}
          onSave={handlePaymentSave}
        />
      )}

      {/* TOP NAV */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
           
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              <Download size={15} /> Download PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors">
              <Edit size={15} /> Edit Booking
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <MoreHorizontal size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">

        {/* SUMMARY BAR */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
                <Calendar size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Booking ID</p>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900 text-base">#{reserve.refNo}</span>
                  <Copy size={13} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </div>
            </div>
            <Divider />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                <User size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Customer</p>
                <p className="font-semibold text-gray-900">{reserve.name}</p>
                <p className="text-xs text-gray-400">{reserve.phone}</p>
              </div>
            </div>
            <Divider />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                <MapPin size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Venue</p>
                <p className="font-semibold text-gray-900">{reserve.venue}</p>
                <p className="text-xs text-gray-400">{reserve.venue}</p>
              </div>
            </div>
            <Divider />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                <Calendar size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Event Date</p>
                <p className="font-semibold text-gray-900">{reserve.eventDate}</p>
                <p className="text-xs text-gray-400">{reserve.shift} 12:00 PM – 6:00 PM</p>
              </div>
            </div>
            <Divider />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {reserve.workflowState}
              </span>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total Amount</p>
              <p className="text-2xl font-black text-violet-600">₹{reserve?.amount?.toLocaleString("en-IN")}</p>
              <p className="text-sm text-emerald-600 font-medium">Paid: ₹{totalPaid.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        {/* PROGRESS TIMELINE */}
        <div className="bg-white rounded-2xl border border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${step.done ? "bg-violet-600 border-violet-600" : "bg-white border-gray-300"}`}>
                    {step.done
                      ? <CheckCircle2 size={18} className="text-white" fill="white" />
                      : <Circle size={18} className="text-gray-300" />}
                  </div>
                  <p className={`text-sm font-semibold mt-2 ${step.done ? "text-gray-800" : "text-gray-400"}`}>{step.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>
                </div>
                {i < timeline.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-7 rounded-full ${step.done && timeline[i + 1].done ? "bg-violet-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 px-6">
            <div className="flex gap-1">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <OverviewTab
              paidSoFar={paidSoFar}
              receipts={receipts}
              totalPaid={totalPaid}
              remaining={remaining}
              grandTotal={grandTotal}
              reserve={reserve}
              onAddPayment={() => setShowModal(true)}
            />
          )}
          {activeTab === "event" && <EventDetailsTab  reserve ={reserve }/>}
          {activeTab === "payments" && <PaymentsTab reserve ={reserve } receipts={receipts} totalPaid={totalPaid} remaining={remaining} onAddPayment={() => setShowModal(true)} />}
          {activeTab === "packages" && <PackagesTab reserve ={reserve } />}
          {activeTab === "documents" && <DocumentsTab  reserve ={reserve } />}
          {activeTab === "history" && <HistoryTab receipts={receipts} reserve ={reserve } />}
        </div>
      </div>
    </div>
  );
}

/* ─── ADD PAYMENT MODAL ─── */
function AddPaymentModal({ paidSoFar, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const numAmount = parseFloat(amount) || 0;
  const split = computeSplit(numAmount, paidSoFar);

  const remainBase = Math.max(0, BOOKING.basePrice + BOOKING.gst - paidSoFar.basePrice);
  const remainAddon = Math.max(0, BOOKING.addonTotal - paidSoFar.addon);
  const remainSecurity = Math.max(0, BOOKING.securityDeposit - paidSoFar.security);
  const totalRemaining = remainBase + remainAddon + remainSecurity;

  function handleSubmit() {
    if (!numAmount || numAmount <= 0) { setError("Please enter a valid amount."); return; }
    if (split.excess > 0) { setError(`Amount exceeds total due by ₹${split.excess.toLocaleString("en-IN")}. Please enter ≤ ₹${totalRemaining.toLocaleString("en-IN")}.`); return; }
    onSave({ amount: numAmount, method, date, note }, split);
  }

  // Close on backdrop click
  function handleBackdrop(e) { if (e.target === e.currentTarget) onClose(); }

  // Quick fill buttons
  const quickFills = [
    { label: "Pay Base Remaining", value: remainBase },
    { label: "Pay Security", value: remainSecurity },
    { label: "Pay All Due", value: totalRemaining },
  ].filter((q) => q.value > 0);

  return (
    <div onClick={handleBackdrop}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Payment</h2>
            <p className="text-sm text-gray-400">#V000032-5732 · Kenneth</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Outstanding buckets */}
          <div className="grid grid-cols-3 gap-3">
            <BucketCard label="Base Price" total={BOOKING.basePrice + BOOKING.gst} paid={paidSoFar.basePrice} color="violet" />
            <BucketCard label="Add-on" total={BOOKING.addonTotal} paid={paidSoFar.addon} color="blue" />
            <BucketCard label="Security" total={BOOKING.securityDeposit} paid={paidSoFar.security} color="emerald" />
          </div>

          {/* Quick fills */}
          {quickFills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickFills.map((q) => (
                <button key={q.label} onClick={() => { setAmount(String(q.value)); setError(""); }}
                  className="px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors">
                  {q.label} — ₹{q.value.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          )}

          {/* Amount field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Amount <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
              <input
                type="number" min="0" value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                placeholder="0.00"
                className="w-full pl-7 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>

          {/* Smart Split Preview */}
          {numAmount > 0 && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Auto-split Preview</p>
              <SplitRow label="→ Base Price / GST" value={split.toBase} color="violet" remaining={remainBase} />
              <SplitRow label="→ Add-on Amount" value={split.toAddon} color="blue" remaining={remainAddon} />
              <SplitRow label="→ Security Deposit" value={split.toSecurity} color="emerald" remaining={remainSecurity} />
              {split.excess > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-red-600">
                  <AlertCircle size={13} />
                  <span className="text-xs font-semibold">Excess ₹{split.excess.toLocaleString("en-IN")} — exceeds total due</span>
                </div>
              )}
            </div>
          )}

          {/* Method + Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method</label>
              <div className="relative">
                <select value={method} onChange={(e) => setMethod(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                  {METHODS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Advance payment via NEFT"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            Total outstanding: <span className="font-bold text-gray-800">₹{totalRemaining.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit}
              disabled={!numAmount || numAmount <= 0 || split.excess > 0}
              className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              <Plus size={15} /> Record Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BucketCard({ label, total, paid, color }) {
  const remaining = Math.max(0, total - paid);
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 100;
  const colors = {
    violet: { bar: "bg-violet-500", text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
    blue: { bar: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    emerald: { bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  }[color];

  return (
    <div className={`rounded-xl border p-3 ${colors.bg} ${colors.border}`}>
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <p className={`text-base font-black ${colors.text}`}>₹{total.toLocaleString("en-IN")}</p>
      <div className="mt-2 h-1.5 rounded-full bg-white/60">
        <div className={`h-1.5 rounded-full ${colors.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-400">Paid ₹{paid.toLocaleString("en-IN")}</span>
        <span className={`text-xs font-semibold ${remaining > 0 ? colors.text : "text-gray-400"}`}>
          {remaining > 0 ? `₹${remaining.toLocaleString("en-IN")} due` : "✓ Done"}
        </span>
      </div>
    </div>
  );
}

function SplitRow({ label, value, color, remaining }) {
  if (remaining === 0 && value === 0) return (
    <div className="flex justify-between items-center text-xs text-gray-300">
      <span>{label}</span><span>Already fully paid</span>
    </div>
  );
  const textColor = { violet: "text-violet-600", blue: "text-blue-600", emerald: "text-emerald-600" }[color];
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-bold ${value > 0 ? textColor : "text-gray-300"}`}>
        {value > 0 ? `₹${value.toLocaleString("en-IN")}` : "₹0"}
      </span>
    </div>
  );
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ paidSoFar, receipts, totalPaid, remaining, grandTotal,reserve, onAddPayment }) {
  const activityTimeline = [
    { icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-50", title: "Payment Received", desc: "₹15,000 received for Security Deposit", date: "20 Apr 2026", time: "10:30 AM" },
    { icon: FileText, color: "text-blue-500", bg: "bg-blue-50", title: "Invoice Generated", desc: "Invoice #INV-2026-0012 generated", date: "20 Apr 2026", time: "10:25 AM" },
    { icon: Bell, color: "text-violet-500", bg: "bg-violet-50", title: "Reminder Sent", desc: "Reminder email sent to customer", date: "14 Sep 2026", time: "09:00 AM" },
  ];

  return (
    <div className="p-6 grid lg:grid-cols-3 gap-6">
      {/* LEFT */}
      <div className="lg:col-span-2 space-y-6">
        <Section title="Event Details" badge="Single">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              { label: "Event Name", value: reserve.eventType },
              { label: "Event Type", value: "Corporate" },
              { label: "Shift", value: reserve.shift  },
              { label: "Capacity", value: reserve.guests+ ' Guest'  },
              { label: "From Time", value: "12:00 PM" },
              { label: "To Time", value: "06:00 PM" },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <span className="text-sm text-gray-400 w-28 shrink-0">{row.label}</span>
                <span className="text-gray-200 mr-1">:</span>
                <span className="text-sm font-medium text-gray-800">{row.value}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Customer Details">
          <div className="flex gap-8">
            <div className="flex-1 grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: "Customer Name", value: reserve.name },
                { label: "Email", value: reserve.email, link: true },
                { label: "Phone", value: reserve.phone, link: true },
                { label: "Address", value: "Mangalore, Karnataka\nIndia – 575001" },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="text-sm text-gray-400 w-28 shrink-0">{row.label}</span>
                  <span className="text-gray-200 mr-1">:</span>
                  {row.link
                    ? <a href="#" className="text-sm font-medium text-violet-600 hover:underline">{row.value}</a>
                    : <span className="text-sm font-medium text-gray-800 whitespace-pre-line">{row.value}</span>}
                </div>
              ))}
            </div>
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <User size={28} className="text-gray-400" />
            </div>
          </div>
        </Section>

        <Section title="Package Details" badge="Silver Buffet · ₹696" badgeColor="green">
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(buffetMenu).map((cat) => (
              <button key={cat} className={`px-3 py-1 rounded-full text-xs font-semibold border ${cat === "Main Course" ? "bg-violet-100 text-violet-700 border-violet-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>{cat}</button>
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-sm text-gray-600">
            {Object.entries(buffetMenu).map(([cat, items]) => (
              <div key={cat}>{items.map((item) => <p key={item} className="py-0.5">{item}</p>)}</div>
            ))}
          </div>
        </Section>

        <Section title="Notes">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
            <p className="text-sm text-gray-700">Customer requested early setup.</p>
            <p className="text-sm text-gray-700">Projector and mic required.</p>
            <p className="text-xs text-gray-400 mt-3">Added by John Doe on 20 Apr 2026, 10:30 AM</p>
          </div>
        </Section>

        <Section title="Documents" action="View All">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Proforma Invoice", size: "PDF · 245 KB", color: "bg-red-100 text-red-500" },
              { name: "Contract", size: "PDF · 512 KB", color: "bg-green-100 text-green-600" },
              { name: "Quotation", size: "PDF · 210 KB", color: "bg-blue-100 text-blue-500" },
              { name: "Terms & Conditions", size: "PDF · 185 KB", color: "bg-violet-100 text-violet-500" },
            ].map((doc) => (
              <div key={doc.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${doc.color} flex items-center justify-center shrink-0`}>
                    <FileText size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 leading-tight">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.size}</p>
                  </div>
                </div>
                <Download size={13} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* RIGHT */}
      <div className="space-y-6">
        {/* Payment Summary */}
        <div className="border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: "Base Price", value: `₹${BOOKING.basePrice.toLocaleString("en-IN")}` },
              { label: "Add-on Total", value: `₹${BOOKING.addonTotal.toLocaleString("en-IN")}` },
              { label: "Subtotal", value: `₹${BOOKING.basePrice.toLocaleString("en-IN")}` },
              { label: "GST (18%)", value: `₹${BOOKING.gst.toLocaleString("en-IN")}` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-gray-500">{row.label}</span>
                <span className="text-gray-800 font-medium">{row.value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="font-black text-violet-600 text-lg">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Security Deposit</span>
            <span className="font-bold text-gray-900">₹{BOOKING.securityDeposit.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Receipt Information */}
        <div className="border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Receipt Information</h3>
            <button onClick={onAddPayment} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors">
              <Plus size={12} /> Add Payment
            </button>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-4 text-xs text-gray-400 font-medium pb-2 border-b border-gray-100">
              <span>Date</span><span>Type</span><span>Amount</span><span>Status</span>
            </div>
            {receipts.map((r, i) => (
              <div key={i} className="grid grid-cols-4 text-xs py-2 border-b border-gray-50">
                <span className="text-gray-500">{r.date}</span>
                <span className="text-gray-700">{r.type}</span>
                <span className="text-gray-700 font-medium">₹{r.amount.toLocaleString("en-IN")}</span>
                <span className="text-emerald-600 font-semibold">{r.status}</span>
              </div>
            ))}
            <div className="pt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Paid Total</span>
                <span className="text-emerald-600 font-bold">₹{totalPaid.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payable Amount</span>
                <span className="text-gray-900 font-bold">₹{remaining.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Activity Timeline</h3>
            <button className="text-xs text-violet-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {activityTimeline.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon size={14} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">{item.date}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PAYMENTS TAB ─── */
function PaymentsTab({ receipts, totalPaid, remaining, onAddPayment }) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">All Transactions</h3>
        <button onClick={onAddPayment} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors">
          <Plus size={12} /> Add Payment
        </button>
      </div>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Date", "Type", "Method", "Amount", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {receipts.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-500">{row.date}</td>
                <td className="px-5 py-3 text-gray-800 font-medium">{row.type}</td>
                <td className="px-5 py-3 text-gray-500">{row.method || "—"}</td>
                <td className="px-5 py-3 text-gray-800 font-semibold">₹{row.amount.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-8 text-sm pt-2">
        <span className="text-gray-500">Paid Total: <strong className="text-emerald-600">₹{totalPaid.toLocaleString("en-IN")}</strong></span>
        <span className="text-gray-500">Remaining: <strong className="text-gray-900">₹{remaining.toLocaleString("en-IN")}</strong></span>
      </div>
    </div>
  );
}

/* ─── OTHER TABS ─── */
function EventDetailsTab(reserve) {
  return (
    <div className="p-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: "Event Name", value: `${reserve.eventType}` , icon: ClipboardList },
          { label: "Event Type", value: "Corporate", icon: Users },
          { label: "Venue", value: reserve.venue, icon: MapPin },
          { label: "Guest Capacity", value: reserve.guests+" Guests", icon: Users },
          { label: "Start Time", value: "12:00 PM", icon: Clock },
          { label: "End Time", value: "06:00 PM", icon: Clock },
          { label: "Event Date", value: reserve.eventDate, icon: Calendar },
          { label: "Shift", value: reserve.shift, icon: Clock },
          { label: "Duration", value: "6 Hours", icon: Clock },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
              <item.icon size={16} className="text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{item.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackagesTab() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">Silver Buffet</span>
        <span className="text-gray-500 text-sm">₹696 per head · 100 guests</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(buffetMenu).map(([cat, items]) => (
          <div key={cat} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-3">{cat}</p>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsTab() {
  const docs = [
    { name: "Proforma Invoice", type: "PDF", size: "245 KB", color: "bg-red-100 text-red-500" },
    { name: "Contract", type: "PDF", size: "512 KB", color: "bg-green-100 text-green-600" },
    { name: "Quotation", type: "PDF", size: "210 KB", color: "bg-blue-100 text-blue-500" },
    { name: "Terms & Conditions", type: "PDF", size: "185 KB", color: "bg-violet-100 text-violet-500" },
    { name: "Event Brief", type: "PDF", size: "98 KB", color: "bg-amber-100 text-amber-500" },
    { name: "Vendor Agreement", type: "PDF", size: "340 KB", color: "bg-pink-100 text-pink-500" },
  ];
  return (
    <div className="p-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <div key={doc.name} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/30 transition-all group cursor-pointer">
            <div className={`w-10 h-10 rounded-xl ${doc.color} flex items-center justify-center shrink-0`}>
              <FileText size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{doc.name}</p>
              <p className="text-xs text-gray-400">{doc.type} · {doc.size}</p>
            </div>
            <Download size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({ receipts }) {
  const paymentEvents = receipts.map((r) => ({
    icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-50",
    title: "Payment Received",
    desc: `₹${r.amount.toLocaleString("en-IN")} received for ${r.type}`,
    date: r.date, time: "",
  }));
  const all = [
    ...paymentEvents,
    { icon: FileText, color: "text-blue-500", bg: "bg-blue-50", title: "Invoice Generated", desc: "Invoice #INV-2026-0012 generated", date: "20 Apr 2026", time: "10:25 AM" },
    { icon: Calendar, color: "text-gray-500", bg: "bg-gray-100", title: "Booking Created", desc: "Booking #V000032-5732 was created", date: "20 Apr 2026", time: "10:00 AM" },
  ];
  return (
    <div className="p-6">
      <div className="space-y-1">
        {all.map((item, i) => (
          <div key={i} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
            <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <item.icon size={15} className={item.color} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-gray-600">{item.date}</p>
              {item.time && <p className="text-xs text-gray-400">{item.time}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── HELPERS ─── */
function Section({ title, children, badge, badgeColor = "blue", action }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor === "green" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{badge}</span>
          )}
          {action && <button className="text-xs text-violet-600 font-semibold hover:underline">{action}</button>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="hidden md:block w-px h-10 bg-gray-200 self-center" />;
}