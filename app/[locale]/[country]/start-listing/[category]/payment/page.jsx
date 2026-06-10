"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ArrowLeft, CheckCircle2, Shield, Zap, X,
  MessageSquare, CalendarCheck, Lock,
  MapPin, Tag, ChevronRight, BadgeCheck, FileText,
} from "lucide-react";

import lightLogo from "@/assets/logo.svg";
import darkLogo  from "@/assets/logo.png";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

import { cashfree_subscription,cashfree_plans } from '@/services/payment.service'
import { last_parent_id } from "@/services/listing.service";

import { load } from "@cashfreepayments/cashfree-js";

// ─────────────────────────────────────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────────────────────────────────────

const CAT_KEY = {
  venue: "venues", farmstay: "farmstays", studio: "studios",
  rental: "rentals", workspace: "workspaces", experience: "experiences",
};

const CAT_META = {
  venue:      { label: "Venue",      emoji: "🏛️" },
  farmstay:   { label: "Farmstay",   emoji: "🌾" },
  studio:     { label: "Studio",     emoji: "📷" },
  rental:     { label: "Rental",     emoji: "🏠" },
  workspace:  { label: "Workspace",  emoji: "💻" },
  experience: { label: "Experience", emoji: "⭐" },
};

const BOOKING_MODES = [
  {
    key:   "enquiry",
    Icon:  MessageSquare,
    label: "Enquiry",
    fee:   "Free",
    desc:  "Collect leads, confirm manually",
    color: "#6366f1",
  },
  {
    key:   "reserve",
    Icon:  CalendarCheck,
    label: "Reserve",
    fee:   "4% fee",
    desc:  "Accept deposits to hold dates",
    color: "#0ea5e9",
  },
  {
    key:   "book",
    Icon:  Zap,
    label: "Instant Book",
    fee:   "3% fee",
    desc:  "Full payment, auto-confirmed",
    color: "#10b981",
  },
];

const PLANS = [
  {
    key:         "starter",
    name:        "Starter",
    price:       0,
    annualPrice: 0,
    fee:         "5%",
    listings:    "1 listing",
    highlight:   "Get started free",
    badge:       null,
  },
  {
    key:         "growth",
    name:        "Growth",
    price:       999,
    annualPrice: 799,
    fee:         "4%",
    listings:    "5 listings",
    highlight:   "Priority support",
    badge:       "Popular",
  },
  {
    key:         "premium",
    name:        "Premium",
    price:       2499,
    annualPrice: 1999,
    fee:         "3%",
    listings:    "Unlimited",
    highlight:   "Full analytics suite",
    badge:       null,
  },
];

const PAYMENT_METHODS = ["UPI", "Cards", "Net Banking", "Razorpay", "Stripe"];

// ─────────────────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentPage() {
  const params   = useParams();
  const router   = useRouter();
  const locale   = params?.locale   || "en";
  const country  = params?.country  || "in";
  const category = params?.category || "venue";

  const tintKey = CAT_KEY[category] || "venues";
  const tint    = CATEGORY_TINTS[tintKey] || CATEGORY_TINTS.venues;
  const catMeta = CAT_META[category] || CAT_META.venue;

  const [isDark,          setIsDark]         = useState(false);
  const [listingInfo,     setListingInfo]    = useState(null);
  const [selectedModes,   setSelectedModes]  = useState(new Set(["enquiry"]));
  const [selectedPlan,    setSelectedPlan]   = useState(null);
  const [billing,         setBilling]        = useState("1");
  const [coupon,          setCoupon]         = useState("");
  const [couponStatus,    setCouponStatus]   = useState(null);
  const [couponDiscount,  setCouponDiscount] = useState(0);
  const [agreed,          setAgreed]         = useState(false);
  const [activating,      setActivating]     = useState(false);
  const [showTermsModal,  setShowTermsModal] = useState(false);

  console.log(selectedModes)

 

  const [plans,  setPlans] = useState([]);
  const [parentId,  setParentId] = useState('');
useEffect(() => {
  const filtered = plans.filter(
    (p) => String(p.plan_title) === billing
  );

  if (filtered.length) {
    setSelectedPlan(filtered[0].id);
  }
}, [plans, billing]);
  // Dark mode sync
  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Read listing snapshot
  useEffect(() => {
    try {
      const raw = localStorage.getItem("vb_pending_" + category);
      if (raw) setListingInfo(JSON.parse(raw));
    } catch (_) {}

    load_plan()
  }, [category]);

const load_plan = async () => {
  try {
    const parents = await last_parent_id(category);

    const parentIdData = parents?.data;

    if (!parentIdData) return;

    setParentId(parentIdData);

    const plan = await cashfree_plans(parentIdData);

    setPlans(plan?.data || []);
  } catch (error) {
    console.error("Failed to load plans:", error);
  }
};

useEffect(() => {
  if (!parentId) return;

  const fetchPlans = async () => {
    const plan = await cashfree_plans(parentId);
    setPlans(plan.data);
  };

  fetchPlans();
}, [parentId]);

  // Pricing
 const visiblePlans = plans.filter(
  (p) => String(p.plan_title) === billing
);

const plan =
  visiblePlans.find((p) => p.id === selectedPlan) ||
  visiblePlans[0];

const basePrice = Number(
  plan?.offer_amount ||
  plan?.amount ||
  0
);
const subtotal = Math.max(0, basePrice );

const gst = Math.round(subtotal * 0.18);

const total = subtotal + gst;

const fmt = (n) =>
  n === 0 ? "₹0" : `₹${n.toLocaleString("en-IN")}`;

  const toggleMode = useCallback((key) => {
    setSelectedModes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === "VB2024" || code === "VBFREE") {
      setCouponDiscount(Math.round(basePrice * 0.1));
      setCouponStatus("ok");
    } else {
      setCouponDiscount(0);
      setCouponStatus("err");
    }
  };

  const handleActivate = async () => {
    if (!agreed || activating) return;
    setActivating(true);

   
payment_gateway(1)
   


  };
  const payment_gateway = async (selected) => {
  try {
   

    const payload = {
      selected:selected,
      selectedPlan:selectedPlan,
      agreed:agreed,
      selectedModes:Array.from(selectedModes),
      coupon:coupon,
      billing:billing,
      parent_venue_id:parentId,
      category:category,
    }
    
    const paymentGateway = await cashfree_subscription(payload);


    const cashfree = await load({
      mode: "sandbox",
    });

    const result = await cashfree.subscriptionsCheckout({
      subsSessionId: paymentGateway.data.subscription_session_id,
      redirectTarget: "_self",
    });

    if (result?.error) {
      console.error(result.error);
    }
  } catch (error) {
    console.error("Cashfree Error:", error);
  } finally {
    setActivating(false);
    
  }
};

  const handlePayLater = () => {
 if (!agreed || activating) return;
payment_gateway(0)
    // try { localStorage.removeItem("vb_pending_" + category); } catch (_) {}
    // router.push("/" + locale + "/" + country + "/vendor/dashboard");
  };

  const reviewUrl  = "/" + locale + "/" + country + "/start-listing/" + category + "/review";
  const openTerms  = () => setShowTermsModal(true);
  const closeTerms = () => setShowTermsModal(false);
  const acceptTerms = () => { setAgreed(true); setShowTermsModal(false); };

  const summaryProps = {
    plan, billing, basePrice, gst, subtotal, total, selectedModes,
    coupon, setCoupon, couponStatus, couponDiscount, applyCoupon,
    agreed, activating,
    onActivate:   handleActivate,
    onPayLater:   handlePayLater,
    onOpenTerms:  openTerms,
    tint, fmt,
  };

  return (
    <>
      <div className="min-h-screen bg-[#f7f7f9] dark:bg-gray-950">

        {/* ════════════════════════════════════════════════════════════
            HEADER — matches WizardShell header exactly
        ════════════════════════════════════════════════════════════ */}
        <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-950 border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="w-full px-5 sm:px-10 py-3.5 sm:py-4">
            <div className="flex items-center gap-3 sm:gap-6">

              <Link
                href={"/" + locale + "/" + country + "/home"}
                aria-label="VenueBook home"
                className="flex-shrink-0 transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-md"
              >
                <Image
                  src={isDark ? darkLogo : lightLogo}
                  alt="VenueBook"
                  height={32}
                  className="h-7 sm:h-8 w-auto object-contain min-w-[88px]"
                  priority
                />
              </Link>

              {/* Back to Review — sole instance, styled like Save & Exit */}
              <Link
                href={reviewUrl}
                aria-label="Back to review step"
                className={[
                  "ml-auto flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl",
                  "text-sm font-semibold border transition-all duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  "cursor-pointer text-gray-500 dark:text-gray-400",
                  "border-gray-200 dark:border-gray-700",
                  "hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 dark:hover:border-violet-700",
                  "hover:bg-violet-50 dark:hover:bg-violet-950/30",
                ].join(" ")}
              >
                <ArrowLeft size={15} strokeWidth={2} />
                <span className="hidden sm:inline">Back to Review</span>
                <span className="sm:hidden">Review</span>
              </Link>

            </div>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════════
            LISTING SUMMARY STRIP
        ════════════════════════════════════════════════════════════ */}
        <div
          className="border-b border-gray-100/70 dark:border-gray-800/50"
          style={{ background: "linear-gradient(to bottom, " + tint.bg + ", transparent)" }}
        >
          <div className="max-w-5xl mx-auto px-5 sm:px-10 py-5 sm:py-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4"
            >
              {/* Emoji thumbnail */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 select-none"
                style={{
                  background: "linear-gradient(135deg, " + tint.activeBg + ", " + tint.bg + ")",
                  border:     "1px solid " + tint.border,
                }}
              >
                {catMeta.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tint.hex }}>
                    {catMeta.label}
                  </span>
                  {listingInfo?.city && (
                    <>
                      <span className="text-gray-200 dark:text-gray-700 text-[10px]">·</span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                        <MapPin size={10} className="flex-shrink-0" />
                        {listingInfo.city}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white leading-snug truncate">
                  {listingInfo?.title || "Your Listing"}
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Your listing is ready to go live
                </p>
              </div>

              {/* Submitted badge + trust note */}
              <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/40">
                  <CheckCircle2 size={11} />
                  Submitted
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium text-end">
                  Secure onboarding · Instant activation
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            MAIN GRID
        ════════════════════════════════════════════════════════════ */}
        <main className="max-w-5xl mx-auto px-5 sm:px-10 pt-7 sm:pt-8 pb-36 lg:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 xl:gap-8 items-start">

            {/* ── LEFT ──────────────────────────────────────────── */}
            <div className="space-y-8 sm:space-y-9 min-w-0">

              {/* Booking mode */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mb-4">
                  <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">
                    How should guests reach you?
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Pick one or more — changeable anytime from your dashboard.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {BOOKING_MODES.map((mode) => {
                    const active = selectedModes.has(mode.key);
                    return (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => toggleMode(mode.key)}
                        className={[
                          "relative text-start p-3 sm:p-4 rounded-2xl border transition-all duration-200 min-w-0",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          active
                            ? "bg-white dark:bg-gray-900"
                            : "bg-white/70 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700",
                        ].join(" ")}
                        style={active ? {
                          borderColor: mode.color,
                          boxShadow:   "0 0 0 1px " + mode.color + "35, 0 4px 16px " + mode.color + "15",
                        } : {}}
                      >
                        {/* Checkmark */}
                        <span
                          className="absolute top-2.5 end-2.5 w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 flex-shrink-0"
                          style={active
                            ? { background: mode.color, borderColor: mode.color }
                            : { borderColor: "#d1d5db" }
                          }
                        >
                          {active && <Check size={7} strokeWidth={3.5} className="text-white" />}
                        </span>

                        {/* Icon */}
                        <span
                          className="inline-flex w-7 h-7 sm:w-8 sm:h-8 rounded-xl items-center justify-center mb-2.5 transition-colors duration-200"
                          style={{ background: active ? mode.color + "18" : "rgba(107,114,128,0.07)" }}
                        >
                          <mode.Icon size={14} style={{ color: active ? mode.color : "#9ca3af" }} />
                        </span>

                        <p className={[
                          "text-[12px] sm:text-[13px] font-semibold leading-tight truncate",
                          active ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400",
                        ].join(" ")}>
                          {mode.label}
                        </p>
                        <p
                          className="text-[10px] sm:text-[11px] font-semibold mt-0.5"
                          style={{ color: active ? mode.color : "#9ca3af" }}
                        >
                          {mode.fee}
                        </p>
                        <p className="hidden sm:block text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 leading-snug">
                          {mode.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </motion.section>

              {/* Plan selector */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">
                      Choose your plan
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Start free. Scale when you&apos;re ready.
                    </p>
                  </div>

                  {/* Billing toggle */}
                  <div className="flex items-center p-1 rounded-xl bg-gray-100/90 dark:bg-gray-800/90 flex-shrink-0 gap-0.5">
                    {[
                      { key: "1", label: "Monthly" },
                      { key: "2",  label: "Annual"  },
                    ].map((b) => (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => { setBilling(b.key); setCouponDiscount(0); setCouponStatus(null); }}
                        className={[
                          "flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-semibold transition-all",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          billing === b.key
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
                        ].join(" ")}
                      >
                        {b.label}
                        {b.key === "2" && (
                          <span className="text-[9px] font-extrabold text-emerald-500">−off(%)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {visiblePlans.map((p, i) => {
                   const price = Number(p.offer_amount || p.amount || 0);
                    const active = selectedPlan === p.id;
                    const saving = p.discount > 0
                      ? p.discount
                      : 0;

                    return (
                      <motion.button
                        key={p.id}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, delay: 0.18 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -2, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => setSelectedPlan(p.id)}
                        className={[
                          "relative text-start p-4 sm:p-5 rounded-2xl border transition-all duration-200",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          active
                            ? "bg-white dark:bg-gray-900"
                            : "bg-white/70 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700",
                        ].join(" ")}
                        style={active ? { borderColor: tint.activeBorder, boxShadow: tint.activeGlow } : {}}
                      >
                        {/* Selected indicator */}
                        <span
                          className="absolute top-4 end-4 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200"
                          style={active
                            ? { background: tint.hex, borderColor: tint.hex }
                            : { borderColor: "#d1d5db" }
                          }
                        >
                          {active && <Check size={8} strokeWidth={3.5} className="text-white" />}
                        </span>

                        {p.badge && (
                          <span
                            className="inline-block text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2.5 border"
                            style={{ background: tint.light, color: tint.hex, borderColor: tint.border }}
                          >
                            {p.badge}
                          </span>
                        )}

                        <p className={[
                          "text-[13px] font-bold mb-2.5",
                          active ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300",
                        ].join(" ")}>
                          {p.plan_name}
                        </p>

                        {/* Price */}
                        <div className="mb-4">
                          {price === 0 ? (
                            <span className="text-[26px] font-extrabold text-gray-900 dark:text-white leading-none">
                              Free
                            </span>
                          ) : (
                            <div className="flex items-baseline gap-0.5 leading-none">
                              <span className="text-[13px] font-semibold text-gray-400 dark:text-gray-500 mb-0.5">₹</span>
                              <span className="text-[26px] font-extrabold text-gray-900 dark:text-white">
                                {price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 ms-0.5">/mo</span>
                            </div>
                          )}
                          {billing === "2" && saving > 0 && (
                            <p className="text-[10px] text-emerald-500 font-bold mt-1">Save {saving}%</p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-800/70 pt-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">Platform fee</span>
                            <span
                              className="text-[11px] font-bold"
                              style={{ color: active ? tint.hex : "#6b7280" }}
                            >
                              {p.fee} GMV
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">Listings</span>
                            <span className={[
                              "text-[11px] font-semibold",
                              active ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400",
                            ].join(" ")}>
                              {p.listings}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 pt-0.5">
                            {p.highlight}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2.5 leading-relaxed">
                  Prices exclude 18% GST · Platform fees apply only when you earn · Marketplace TCS as per government mandates
                </p>
              </motion.section>

              {/* Payment methods */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 me-0.5">Pay via</span>
                  {PAYMENT_METHODS.map((m) => (
                    <span
                      key={m}
                      className="px-3 py-1.5 rounded-full text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <p className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                  <Lock size={10} className="flex-shrink-0" />
                  Payments secured by Razorpay · VenueBook never stores card details
                </p>
              </motion.section>

            </div>

            {/* ── RIGHT: sticky summary ──────────────────────────── */}
            <motion.aside
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block lg:sticky lg:top-[57px]"
            >
              <SummaryPanel {...summaryProps} />
            </motion.aside>

          </div>
        </main>

        {/* ════════════════════════════════════════════════════════════
            MOBILE STICKY BOTTOM BAR
        ════════════════════════════════════════════════════════════ */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40">
          <div className="absolute inset-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/70 dark:border-gray-800/60" />
          <div
            className="relative px-5 pt-3.5"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            {/* Mini summary */}
            <div className="flex items-center justify-between mb-3 gap-3">
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                  {plan?.plan_name} · {selectedModes.size} mode{selectedModes.size !== 1 ? "s" : ""}
                </p>
                <p className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight">
                  {total === 0 ? "Free" : fmt(total) + "/mo"}
                  {total > 0 && (
                    <span className="text-[11px] font-normal text-gray-400 dark:text-gray-500 ms-1.5">incl. GST</span>
                  )}
                </p>
              </div>

              {/* T&C compact — opens modal */}
              <button
                type="button"
                onClick={openTerms}
                className="flex items-center gap-2 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg"
              >
                <span
                  className={[
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    agreed
                      ? "bg-violet-600 border-violet-600"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
                  ].join(" ")}
                >
                  {agreed && <Check size={8} strokeWidth={3.5} className="text-white" />}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 select-none">
                  {agreed ? "Terms accepted" : "Accept terms"}
                </span>
              </button>
            </div>

            {/* CTAs */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handlePayLater}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-900/80 hover:border-gray-300 dark:hover:border-gray-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 active:scale-[0.97]"
              >
                Save for Later
              </button>
              <button
                type="button"
                disabled={!agreed || activating}
                onClick={handleActivate}
                className={[
                  "flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl",
                  "text-sm font-bold text-white transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  agreed && !activating
                    ? "hover:opacity-90 active:scale-[0.98] shadow-lg shadow-violet-200/50 dark:shadow-violet-950/50"
                    : "opacity-40 cursor-not-allowed",
                ].join(" ")}
                style={{ background: agreed && !activating ? "linear-gradient(242deg, #a44bf3, #499ce8)" : "#9ca3af" }}
              >
                {activating ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Activating…</>
                ) : (
                  <> Pay  <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════
          TERMS & CONDITIONS MODAL
      ════════════════════════════════════════════════════════════ */}
      <TermsModal
        open={showTermsModal}
        onClose={closeTerms}
        onAccept={acceptTerms}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Summary Panel (desktop right column)
// ─────────────────────────────────────────────────────────────────────────────

function SummaryPanel({
  plan, billing, basePrice, gst, subtotal, total,
  selectedModes, coupon, setCoupon, couponStatus, couponDiscount,
  applyCoupon, agreed, activating,
  onActivate, onPayLater, onOpenTerms, tint, fmt,
}) {
  return (
    <div className="space-y-3">

      {/* Summary card */}
      <div
        className="rounded-2xl border bg-white dark:bg-gray-900 overflow-hidden"
        style={{ borderColor: tint.border, boxShadow: tint.glow }}
      >
        {/* Accent top line */}
        <div
          className="h-0.5 w-full"
          style={{ background: "linear-gradient(90deg, " + tint.hex + "90, " + tint.hex + "25)" }}
        />

        <div className="px-5 py-5 space-y-4">

          {/* Plan row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-bold text-gray-900 dark:text-white">{plan?.plan_name} Plan</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {billing === "2" && basePrice > 0 ? "Billed annually" : "Billed monthly"}
              </p>
            </div>
            <span className="text-[15px] font-extrabold text-gray-900 dark:text-white flex-shrink-0 text-end">
              {basePrice === 0 ? "Free" : fmt(basePrice) + "/mo"}
            </span>
          </div>

          {/* Booking modes */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Booking Modes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {BOOKING_MODES.filter((m) => selectedModes.has(m.key)).map((m) => (
                <span
                  key={m.key}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                  style={{
                    color:       m.color,
                    borderColor: m.color + "35",
                    background:  m.color + "0e",
                  }}
                >
                  <m.Icon size={9} />
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-[12px]">
              <span className="text-gray-400 dark:text-gray-500">Subscription</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {basePrice === 0 ? "Free" : fmt(basePrice)}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="text-emerald-600 dark:text-emerald-400">Coupon (10%)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">−{fmt(couponDiscount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 text-[12px]">
              <span className="text-gray-400 dark:text-gray-500">GST (18%)</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">  {fmt(gst)}</span>
            </div>
          </div>

          {/* Coupon */}
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Tag size={12} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  dir="ltr"
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); setCouponStatus(null); }}
                  onKeyDown={(e) => e.key === "Enter" && coupon.trim() && applyCoupon()}
                  placeholder="Coupon code"
                  className={[
                    "w-full ps-8 pe-3 py-2.5 rounded-xl border text-[12px] outline-none transition",
                    "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white",
                    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                    couponStatus === "err"
                      ? "border-red-300 dark:border-red-700 ring-1 ring-red-300 dark:ring-red-700"
                      : couponStatus === "ok"
                        ? "border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-300 dark:ring-emerald-700"
                        : "border-gray-200 dark:border-gray-700 focus:border-violet-400 focus:ring-1 focus:ring-violet-400",
                  ].join(" ")}
                />
              </div>
              <button
                type="button"
                onClick={applyCoupon}
                disabled={!coupon.trim()}
                className={[
                  "flex-shrink-0 px-3.5 py-2.5 rounded-xl text-[12px] font-semibold border transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  coupon.trim()
                    ? "text-white border-transparent hover:opacity-90"
                    : "text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed",
                ].join(" ")}
                style={coupon.trim() ? { background: tint.hex } : {}}
              >
                Apply
              </button>
            </div>

            <AnimatePresence>
              {couponStatus === "ok" && (
                <motion.p
                  key="ok"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 overflow-hidden"
                >
                  <Check size={11} strokeWidth={2.5} /> 10% off applied!
                </motion.p>
              )}
              {couponStatus === "err" && (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[11px] text-red-500 overflow-hidden"
                >
                  Invalid code. Try <strong>VB2024</strong> or <strong>VBFREE</strong>.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Total */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: tint.activeBg, border: "1px solid " + tint.activeBorder }}
          >
            <span className="text-[13px] font-bold text-gray-900 dark:text-white">Total today</span>
            <span className="text-[18px] font-extrabold tracking-tight" style={{ color: tint.hex }}>
              {total === 0 ? "Free" : fmt(total) + "/mo"}
            </span>
          </div>

        </div>
      </div>

      {/* T&C — clicking opens modal */}
      <button
        type="button"
        onClick={onOpenTerms}
        className="flex items-start gap-2.5 w-full text-start group px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg"
      >
        <span
          className={[
            "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
            agreed
              ? "bg-violet-600 border-violet-600"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-violet-400",
          ].join(" ")}
        >
          {agreed && <Check size={8} strokeWidth={3.5} className="text-white" />}
        </span>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
          I accept the{" "}
          <span className="text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-700">
            terms &amp; conditions
          </span>{" "}
          and authorise VenueBook split-settlements.
        </p>
      </button>

      {/* Primary CTA */}
      <button
        type="button"
        disabled={!agreed || activating}
        onClick={onActivate}
        className={[
          "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl",
          "text-sm font-bold text-white transition-all duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
          agreed && !activating
            ? "hover:opacity-90 active:scale-[0.98] shadow-lg shadow-violet-200/60 dark:shadow-violet-950/50"
            : "opacity-40 cursor-not-allowed shadow-none",
        ].join(" ")}
        style={{ background: agreed && !activating ? "linear-gradient(242deg, #a44bf3, #499ce8)" : "#9ca3af" }}
      >
        {activating ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            processing…
          </>
        ) : (
          <><Zap size={15} className="flex-shrink-0" /> Pay</>
        )}
      </button>

      {/* Secondary CTA */}
      <button
        type="button"
        onClick={onPayLater}
        className="w-full py-2.5 text-[13px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl"
      >
         1 Month Free Activate
      </button>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-4 pt-0.5">
        {[
          { Icon: Shield,     text: "SSL secured"    },
          { Icon: Lock,       text: "No card stored" },
          { Icon: BadgeCheck, text: "Razorpay"       },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
            <Icon size={10} className="flex-shrink-0" />
            {text}
          </div>
        ))}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Terms & Conditions Modal
// ─────────────────────────────────────────────────────────────────────────────

function TermsModal({ open, onClose, onAccept }) {
  const scrollRef = useRef(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay — close without accepting */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 sm:inset-x-auto sm:w-full sm:max-w-lg sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 z-[61]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-modal-title"
          >
            <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-violet-600 dark:text-violet-400" />
                  </span>
                  <h2 id="terms-modal-title" className="text-[14px] font-bold text-gray-900 dark:text-white">
                    Terms &amp; Conditions
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Scrollable content */}
              <div
                ref={scrollRef}
                className="overflow-y-auto px-5 py-5 space-y-4 text-[12px] leading-relaxed text-gray-600 dark:text-gray-400"
                style={{ maxHeight: "min(55vh, 380px)" }}
              >
                <div className="space-y-3">
                  <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">1. Listing Agreement</h3>
                  <p>
                    By activating your listing on VenueBook, you agree to list your property or experience accurately and keep your availability, pricing, and details up to date. VenueBook reserves the right to remove listings that violate our community guidelines.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">2. Platform Fees & Payments</h3>
                  <p>
                    VenueBook charges a marketplace fee on each confirmed booking as per your selected plan. Fees are deducted from guest payments before disbursement to your registered bank account. GST and applicable taxes are charged separately in accordance with government mandates.
                  </p>
                  <p>
                    For Reserve and Instant Book modes, VenueBook acts as the payment intermediary via Razorpay. Split-settlements are processed automatically within 3–5 business days after the event date.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">3. Cancellations & Refunds</h3>
                  <p>
                    You are responsible for setting your own cancellation policy within your listing settings. VenueBook will honour your stated cancellation policy when processing refunds. Fraudulent or misleading listings may result in immediate suspension and reversal of all pending settlements.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">4. Split-Settlement Authorisation</h3>
                  <p>
                    By accepting these terms, you explicitly authorise VenueBook to perform automated split-settlements and tax deductions on your behalf as required under applicable laws, including TDS and TCS provisions under the Income Tax Act and GST rules.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">5. Data & Privacy</h3>
                  <p>
                    VenueBook collects and processes your personal and business data as described in our Privacy Policy. We do not sell your data to third parties. Payment details are processed exclusively through our PCI-DSS-compliant payment partner, Razorpay.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">6. Subscription Plans</h3>
                  <p>
                    Paid subscription plans renew automatically at the end of each billing period unless cancelled. You may cancel at any time from your vendor dashboard. No refunds are issued for partial billing periods. VenueBook reserves the right to modify plan pricing with 30 days advance notice.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">7. Governing Law</h3>
                  <p>
                    These terms are governed by the laws of India. Any disputes arising from this agreement shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <button
                  type="button"
                  onClick={onClose}
                  className={[
                    "px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150",
                    "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300",
                    "bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  ].join(" ")}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onAccept}
                  className={[
                    "px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150",
                    "hover:opacity-90 active:scale-[0.98] shadow-md shadow-violet-200/50 dark:shadow-violet-950/30",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                  ].join(" ")}
                  style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
                >
                  Accept &amp; Close
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
